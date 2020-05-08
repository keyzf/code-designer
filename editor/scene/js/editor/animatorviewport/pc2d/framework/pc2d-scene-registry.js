Object.assign(pc2d, function () {

    var SceneRegistryItem = function (name, url) {
        this.name = name;
        this.url = url;
    };

    var SceneRegistry = function (app) {
        this._app = app;
        this._list = [];
        this._index = {};
        this._urlIndex = {};
    };

    SceneRegistry.prototype.destroy = function () {
        this._app = null;
    };

    SceneRegistry.prototype.list = function () {
        return this._list;
    };

    SceneRegistry.prototype.add = function (name, url) {
        if (this._index.hasOwnProperty(name)) {
            // #ifdef DEBUG
            console.warn('pc2d.SceneRegistry: trying to add more than one scene called: ' + name);
            // #endif
            return false;
        }

        var item = new pc2d.SceneRegistryItem(name, url);

        var i = this._list.push(item);
        this._index[item.name] = i - 1;
        this._urlIndex[item.url] = i - 1;

        return true;
    };

    SceneRegistry.prototype.find = function (name) {
        if (this._index.hasOwnProperty(name)) {
            return this._list[this._index[name]];
        }
        return null;

    };

    SceneRegistry.prototype.findByUrl = function (url) {
        if (this._urlIndex.hasOwnProperty(url)) {
            return this._list[this._urlIndex[url]];
        }
        return null;
    };

    SceneRegistry.prototype.remove = function (name) {
        if (this._index.hasOwnProperty(name)) {
            var i = this._index[name];
            var item = this._list[i];

            delete this._urlIndex[item.url];
            // remove from index
            delete this._index[name];

            // remove from list
            this._list.splice(i, 1);

            // refresh index
            for (i = 0; i < this._list.length; i++) {
                item = this._list[i];
                this._index[item.name] = i;
                this._urlIndex[item.url] = i;
            }
        }
    };

    SceneRegistry.prototype.loadSceneHierarchy = function (url, callback) {
        var self = this;

        // Because we need to load scripts before we instance the hierarchy (i.e. before we create script components)
        // Split loading into load and open
        var handler = this._app.loader.getHandler("hierarchy");

        // include asset prefix if present
        if (this._app.assets && this._app.assets.prefix && !pc2d.ABSOLUTE_URL.test(url)) {
            url = pc2d.path.join(this._app.assets.prefix, url);
        }

        handler.load(url, function (err, data) {
            if (err) {
                if (callback) callback(err);
                return;
            }

            // called after scripts are preloaded
            var _loaded = function () {
                self._app.systems.script.preloading = true;
                var entity = handler.open(url, data);
                self._app.systems.script.preloading = false;

                // clear from cache because this data is modified by entity operations (e.g. destroy)
                self._app.loader.clearCache(url, "hierarchy");

                // add to hierarchy
                self._app.root.addChild(entity);

                // initialize components
                pc2d.ComponentSystem.initialize(entity);
                pc2d.ComponentSystem.postInitialize(entity);

                if (callback) callback(err, entity);
            };

            // load priority and referenced scripts before opening scene
            self._app._preloadScripts(data, _loaded);
        });
    };

    SceneRegistry.prototype.loadSceneSettings = function (url, callback) {
        var self = this;

        // include asset prefix if present
        if (this._app.assets && this._app.assets.prefix && !pc2d.ABSOLUTE_URL.test(url)) {
            url = pc2d.path.join(this._app.assets.prefix, url);
        }

        this._app.loader.load(url, "scenesettings", function (err, settings) {
            if (!err) {
                self._app.applySceneSettings(settings);
                if (callback) {
                    callback(null);
                }

            } else {
                if (callback) {
                    callback(err);
                }
            }
        });
    };

    SceneRegistry.prototype.loadScene =  function (url, callback) {
        var self = this;

        var handler = this._app.loader.getHandler("scene");

        // include asset prefix if present
        if (this._app.assets && this._app.assets.prefix && !pc2d.ABSOLUTE_URL.test(url)) {
            url = pc2d.path.join(this._app.assets.prefix, url);
        }

        handler.load(url, function (err, data) {
            if (!err) {
                var _loaded = function () {
                    // parse and create scene
                    self._app.systems.script.preloading = true;
                    var scene = handler.open(url, data);
                    self._app.systems.script.preloading = false;

                    // clear scene from cache because we'll destroy it when we load another one
                    // so data will be invalid
                    self._app.loader.clearCache(url, "scene");

                    self._app.loader.patch({
                        resource: scene,
                        type: "scene"
                    }, self._app.assets);

                    self._app.root.addChild(scene.root);

                    // Initialise pack settings
                

                    if (callback) {
                        callback(null, scene);
                    }
                };

                // preload scripts before opening scene
                self._app._preloadScripts(data, _loaded);
            } else {
                if (callback) {
                    callback(err);
                }
            }
        });
    };

    return {
        SceneRegistry: SceneRegistry,
        SceneRegistryItem: SceneRegistryItem
    };

}());