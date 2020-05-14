Object.assign(pc2d, function () {
   
    var AssetRegistry = function (loader) {
        pc2d.EventHandler.call(this);

        this._loader = loader;

        this._assets = []; // list of all assets
        this._cache = {}; // index for looking up assets by id
        this._names = {}; // index for looking up assets by name
        this._tags = new pc2d.TagsCache('_id'); // index for looking up by tags
        this._urls = {}; // index for looking up assets by url

        this.prefix = null;
    };
    AssetRegistry.prototype = Object.create(pc2d.EventHandler.prototype);
    AssetRegistry.prototype.constructor = AssetRegistry;

    Object.assign(AssetRegistry.prototype, {
      
        list: function (filters) {
            filters = filters || {};
            return this._assets.filter(function (asset) {
                var include = true;
                if (filters.preload !== undefined) {
                    include = (asset.preload === filters.preload);
                }
                return include;
            });
        },

        add: function (asset) {
            var index = this._assets.push(asset) - 1;
            var url;

            // id cache
            this._cache[asset.id] = index;
            if (!this._names[asset.name])
                this._names[asset.name] = [];

            // name cache
            this._names[asset.name].push(index);
            if (asset.file) {
                url = asset.file.url;
                this._urls[url] = index;
            }
            asset.registry = this;

            // tags cache
            this._tags.addItem(asset);
            asset.tags.on('add', this._onTagAdd, this);
            asset.tags.on('remove', this._onTagRemove, this);

            this.fire("add", asset);
            this.fire("add:" + asset.id, asset);
            if (url)
                this.fire("add:url:" + url, asset);

            if (asset.preload)
                this.load(asset);
        },

        remove: function (asset) {
            var idx = this._cache[asset.id];
            var url = asset.file ? asset.file.url : null;

            if (idx !== undefined) {
                // remove from list
                this._assets.splice(idx, 1);

                // remove id -> index cache
                delete this._cache[asset.id];

                // name cache needs to be completely rebuilt
                this._names = {};

                // urls cache needs to be completely rebuilt
                this._urls = [];

                // update id cache and rebuild name cache
                for (var i = 0, l = this._assets.length; i < l; i++) {
                    var a = this._assets[i];

                    this._cache[a.id] = i;
                    if (!this._names[a.name]) {
                        this._names[a.name] = [];
                    }
                    this._names[a.name].push(i);

                    if (a.file) {
                        this._urls[a.file.url] = i;
                    }
                }

                // tags cache
                this._tags.removeItem(asset);
                asset.tags.off('add', this._onTagAdd, this);
                asset.tags.off('remove', this._onTagRemove, this);

                asset.fire("remove", asset);
                this.fire("remove", asset);
                this.fire("remove:" + asset.id, asset);
                if (url)
                    this.fire("remove:url:" + url, asset);

                return true;
            }

            // asset not in registry
            return false;
        },

        get: function (id) {
            var idx = this._cache[id];
            return this._assets[idx];
        },

        getByUrl: function (url) {
            var idx = this._urls[url];
            return this._assets[idx];
        },

        load: function (asset) {
            if (asset.loading)
                return;

            var self = this;

            if (asset.loaded) {
                return;
            }

            var load = !!asset.file;

            var file = asset.getPreferredFile();

            var _load = function () {
                var url = asset.getFileUrl();

                asset.loading = true;

                self._loader.load(url, asset.type, function (err, resource, extra) {
                    asset.loaded = true;
                    asset.loading = false;

                    if (err) {
                        self.fire("error", err, asset);
                        self.fire("error:" + asset.id, err, asset);
                        asset.fire("error", err, asset);
                        return;
                    }
                    if (resource instanceof Array) {
                        asset.resources = resource;
                    } else {
                        asset.resource = resource;
                    }

                    if (asset.type === 'script') {
                        var loader = self._loader.getHandler('script');

                        if (loader._cache[asset.id] && loader._cache[asset.id].parentNode === document.head) {
                            // remove old element
                            document.head.removeChild(loader._cache[asset.id]);
                        }

                        loader._cache[asset.id] = extra;
                    }

                    self._loader.patch(asset, self);

                    self.fire("load", asset);
                    self.fire("load:" + asset.id, asset);
                    if (file && file.url)
                        self.fire("load:url:" + file.url, asset);
                    asset.fire("load", asset);
                }, asset);
            };

            var _open = function () {
                var resource = self._loader.open(asset.type, asset.data);
                if (resource instanceof Array) {
                    asset.resources = resource;
                } else {
                    asset.resource = resource;
                }
                asset.loaded = true;

                self._loader.patch(asset, self);

                self.fire("load", asset);
                self.fire("load:" + asset.id, asset);
                if (file && file.url)
                    self.fire("load:url:" + file.url, asset);
                asset.fire("load", asset);
            };

            if (!file) {
                _open();
            } else if (load) {
                this.fire("load:start", asset);
                this.fire("load:" + asset.id + ":start", asset);

                _load();
            }
        },

        loadFromUrl: function (url, type, callback) {
            this.loadFromUrlAndFilename(url, null, type, callback);
        },

        loadFromUrlAndFilename: function (url, filename, type, callback) {
            var self = this;

            var name = pc2d.path.getBasename(filename || url);

            var file = {
                filename: filename || name,
                url: url
            };
            var data = {};

            var asset = self.getByUrl(url);
            if (!asset) {
                asset = new pc2d.Asset(name, type, file, data);
                self.add(asset);
            }

            var onLoadAsset = function (loadedAsset) {
                if (type === 'material') {
                    self._loadTextures([loadedAsset], function (err, textures) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, loadedAsset);
                        }
                    });
                } else {
                    callback(null, loadedAsset);
                }
            };

            if (asset.resource) {
                onLoadAsset(asset);
                return;
            }

            if (type === 'model') {
                self._loadModel(asset, callback);
                return;
            }

            asset.once("load", onLoadAsset);
            asset.once("error", function (err) {
                callback(err);
            });
            self.load(asset);
        },

        // private method used for engine-only loading of model data
        _loadModel: function (asset, callback) {
            var self = this;

            var url = asset.getFileUrl();
            var dir = pc2d.path.getDirectory(url);
            var basename = pc2d.path.getBasename(url);
            var ext = pc2d.path.getExtension(url);

            var _loadAsset = function (assetToLoad) {
                asset.once("load", function (loadedAsset) {
                    callback(null, loadedAsset);
                });
                asset.once("error", function (err) {
                    callback(err);
                });
                self.load(assetToLoad);
            };

            if (ext === '.json' || ext === '.glb') {
                // playcanvas model format supports material mapping file
                var mappingUrl = pc2d.path.join(dir, basename.replace(ext, ".mapping.json"));
                this._loader.load(mappingUrl, 'json', function (err, data) {
                    if (err) {
                        asset.data = { mapping: [] };
                        _loadAsset(asset);
                        return;
                    }

                    self._loadMaterials(dir, data, function (e, materials) {
                        asset.data = data;
                        _loadAsset(asset);
                    });
                });
            } else {
                // other model format (e.g. obj)
                _loadAsset(asset);
            }
        },

        // private method used for engine-only loading of model data
        _loadMaterials: function (dir, mapping, callback) {
            if (dir) {
                // dir is generated from a call to pc2d.path.getDirectory which never returns
                // a path ending in a forward slash so add one here
                dir += '/';
                if (this.prefix && dir.startsWith(this.prefix)) {
                    dir = dir.slice(this.prefix.length);
                }
            }

            var self = this;
            var i;
            var count = mapping.mapping.length;
            var materials = [];

            if (count === 0) {
                callback(null, materials);
            }

            var onLoadAsset = function (err, asset) {
                materials.push(asset);
                count--;
                if (count === 0)
                    callback(null, materials);
            };

            for (i = 0; i < mapping.mapping.length; i++) {
                var path = mapping.mapping[i].path;
                if (path) {
                    path = pc2d.path.join(dir, path);
                    self.loadFromUrl(path, "material", onLoadAsset);
                } else {
                    count--;
                }
            }
        },

        // private method used for engine-only loading of model data
        _loadTextures: function (materialAssets, callback) {
            var self = this;
            var i;
            var used = {}; // prevent duplicate urls
            var urls = [];
            var textures = [];
            var count = 0;
            for (i = 0; i < materialAssets.length; i++) {
                var materialData = materialAssets[i].data;

                if (materialData.mappingFormat !== 'path') {
                    console.warn('Skipping: ' + materialAssets[i].name + ', material files must be mappingFormat: "path" to be loaded from URL');
                    continue;
                }

                var url = materialAssets[i].getFileUrl();
                var dir = pc2d.path.getDirectory(url);
                if (dir) {
                    // pc2d.path.getDirectory never returns a path ending in a forward slash so add one
                    dir += '/';

                    if (this.prefix && dir.startsWith(this.prefix)) {
                        dir = dir.slice(this.prefix.length);
                    }
                }

                var textureUrl;

                for (var pi = 0; pi < pc2d.StandardMaterial.TEXTURE_PARAMETERS.length; pi++) {
                    var paramName = pc2d.StandardMaterial.TEXTURE_PARAMETERS[pi];

                    if (materialData[paramName] && typeof(materialData[paramName]) === 'string') {
                        var texturePath = materialData[paramName];
                        textureUrl = pc2d.path.join(dir, texturePath);
                        if (!used[textureUrl]) {
                            used[textureUrl] = true;
                            urls.push(textureUrl);
                            count++;
                        }
                    }
                }
            }

            if (!count) {
                callback(null, textures);
                return;
            }

            var onLoadAsset = function (err, texture) {
                textures.push(texture);
                count--;

                if (err) console.error(err);

                if (count === 0)
                    callback(null, textures);
            };

            for (i = 0; i < urls.length; i++)
                self.loadFromUrl(urls[i], "texture", onLoadAsset);
        },

        findAll: function (name, type) {
            var self = this;
            var idxs = this._names[name];
            if (idxs) {
                var assets = idxs.map(function (idx) {
                    return self._assets[idx];
                });

                if (type) {
                    return assets.filter(function (asset) {
                        return (asset.type === type);
                    });
                }

                return assets;
            }

            return [];
        },

        _onTagAdd: function (tag, asset) {
            this._tags.add(tag, asset);
        },

        _onTagRemove: function (tag, asset) {
            this._tags.remove(tag, asset);
        },

        findByTag: function () {
            return this._tags.find(arguments);
        },

        filter: function (callback) {
            var items = [];
            for (var i = 0, len = this._assets.length; i < len; i++) {
                if (callback(this._assets[i]))
                    items.push(this._assets[i]);
            }
            return items;
        },

        find: function (name, type) {
            var asset = this.findAll(name, type);
            return asset ? asset[0] : null;
        }
    });

    return {
        AssetRegistry: AssetRegistry
    };
}());