Object.assign(pc2d, function () {

    // auto incrementing number for asset ids
    var assetIdCounter = -1;

    var ABSOLUTE_URL = new RegExp(
        '^' + // beginning of the url
        '\\s*' +  // ignore leading spaces (some browsers trim the url automatically, but we can't assume that)
        '(?:' +  // beginning of a non-captured regex group
            // `{protocol}://`
            '(?:' +  // beginning of protocol scheme (non-captured regex group)
                '[a-z]+[a-z0-9\\-\\+\\.]*' + // protocol scheme must (RFC 3986) consist of "a letter and followed by any combination of letters, digits, plus ("+"), period ("."), or hyphen ("-")."
                ':' + // protocol scheme must end with colon character
            ')?' + // end of optional scheme group, the group is optional since the string may be a protocol-relative absolute URL
            '//' + // an absolute url must always begin with two forward slash characters (ignoring any leading spaces and protocol scheme)

            '|' + // or another option(s):

            // Data URL (RFC 2397), simplified
            'data:' +
        ')',
        'i' // non case-sensitive flag
    );

    var VARIANT_SUPPORT = {
        pvr: 'extCompressedTexturePVRTC',
        dxt: 'extCompressedTextureS3TC',
        etc2: 'extCompressedTextureETC',
        etc1: 'extCompressedTextureETC1',
        basis: 'canvas' // dummy, basis is always supported
    };

    var VARIANT_DEFAULT_PRIORITY = ['pvr', 'dxt', 'etc2', 'etc1', 'basis'];

    var Asset = function (name, type, file, data) {
        pc2d.EventHandler.call(this);

        this._id = assetIdCounter--;

        this.name = name || '';
        this.type = type;
        this.tags = new pc2d.Tags(this);
        this._preload = false;

        this.variants = new pc2d.AssetVariants(this);

        this._file = null;
        this._data = data || { };

        // This is where the loaded resource(s) will be
        this._resources = [];

        // a string-assetId dictionary that maps
        // locale to asset id
        this._i18n = {};

        // Is resource loaded
        this.loaded = false;
        this.loading = false;

        this.registry = null;

        if (file) this.file = file;
    };
    Asset.prototype = Object.create(pc2d.EventHandler.prototype);
    Asset.prototype.constructor = Asset;

    Object.assign(Asset.prototype, {
        /**
         * @name pc2d.Asset#getFileUrl
         * @function
         * @description Return the URL required to fetch the file for this asset.
         * @returns {string} The URL.
         * @example
         * var assets = app.assets.find("My Image", "texture");
         * var img = "&lt;img src='" + assets[0].getFileUrl() + "'&gt;";
         */
        getFileUrl: function () {
            var file = this.getPreferredFile();

            if (!file || !file.url)
                return null;

            var url = file.url;

            if (this.registry && this.registry.prefix && !ABSOLUTE_URL.test(url))
                url = this.registry.prefix + url;

            // add file hash to avoid hard-caching problems
            if (this.type !== 'script' && file.hash) {
                var separator = url.indexOf('?') !== -1 ? '&' : '?';
                url += separator + 't=' + file.hash;
            }

            return url;
        },

        getPreferredFile: function () {
            if (!this.file)
                return null;

            if (this.type === 'texture' || this.type === 'textureatlas' || this.type === 'bundle') {
                var app = this.registry._loader._app;
                var device = app.graphicsDevice;

                for (var i = 0, len = VARIANT_DEFAULT_PRIORITY.length; i < len; i++) {
                    var variant = VARIANT_DEFAULT_PRIORITY[i];
                    // if the device supports the variant
                    if (! device[VARIANT_SUPPORT[variant]]) continue;

                    // if the variant exists in the asset then just return it
                    if (this.file.variants[variant]) {
                        return this.file.variants[variant];
                    }

                    // if the variant does not exist but the asset is in a bundle
                    // and the bundle contain assets with this variant then return the default
                    // file for the asset
                    if (app.enableBundles) {
                        var bundles = app.bundles.listBundlesForAsset(this);
                        if (! bundles) continue;

                        for (var j = 0, len2 = bundles.length; j < len2; j++) {
                            if (bundles[j].file && bundles[j].file.variants && bundles[j].file.variants[variant]) {
                                return this.file;
                            }
                        }
                    }
                }
            }

            return this.file;
        },

        getLocalizedAssetId: function (locale) {
            // tries to find either the desired locale or a fallback locale
            locale = pc2d.I18n.findAvailableLocale(locale, this._i18n);
            return this._i18n[locale] || null;
        },
        addLocalizedAssetId: function (locale, assetId) {
            this._i18n[locale] = assetId;
            this.fire('add:localized', locale, assetId);
        },

    
        removeLocalizedAssetId: function (locale) {
            var assetId = this._i18n[locale];
            if (assetId) {
                delete this._i18n[locale];
                this.fire('remove:localized', locale, assetId);
            }
        },

        ready: function (callback, scope) {
            scope = scope || this;

            if (this.resource) {
                callback.call(scope, this);
            } else {
                this.once("load", function (asset) {
                    callback.call(scope, asset);
                });
            }
        },

        reload: function () {
            // no need to be reloaded
            if (!this.loaded)
                return;

            if (this.type === 'cubemap') {
                this.registry._loader.patch(this, this.registry);
            } else {
                this.loaded = false;
                this.registry.load(this);
            }
        },

        unload: function () {
            if (!this.loaded && !this.resource)
                return;

            this.fire('unload', this);
            this.registry.fire('unload:' + this.id, this);

            if (this.resource && this.resource.destroy)
                this.resource.destroy();

            this.resource = null;
            this.loaded = false;

            if (this.file) {
                // remove resource from loader cache
                this.registry._loader.clearCache(this.getFileUrl(), this.type);
            }
        }
    });

    Object.defineProperty(Asset.prototype, 'id', {
        get: function () {
            return this._id;
        },

        set: function (value) {
            this._id = value;
        }
    });

    Object.defineProperty(Asset.prototype, 'file', {
        get: function () {
            return this._file;
        },

        set: function (value) {
            // fire change event when the file changes
            // so that we reload it if necessary
            // set/unset file property of file hash been changed
            var key;
            var valueAsBool = !!value;
            var fileAsBool = !!this._file;
            if (valueAsBool !== fileAsBool || (value && this._file && value.hash !== this._file)) {
                if (value) {
                    if (!this._file)
                        this._file = { };

                    this._file.url = value.url;
                    this._file.filename = value.filename;
                    this._file.hash = value.hash;
                    this._file.size = value.size;
                    this._file.variants = this.variants;

                    if (value.hasOwnProperty('variants')) {
                        this.variants.clear();

                        if (value.variants) {
                            for (key in value.variants) {
                                if (!value.variants[key])
                                    continue;

                                this.variants[key] = value.variants[key];
                            }
                        }
                    }

                    this.fire('change', this, 'file', this._file, this._file);
                    this.reload();
                } else {
                    this._file = null;
                    this.variants.clear();
                }
            } else if (value && this._file && value.hasOwnProperty('variants')) {
                this.variants.clear();

                if (value.variants) {
                    for (key in value.variants) {
                        if (!value.variants[key])
                            continue;

                        this.variants[key] = value.variants[key];
                    }
                }
            }
        }
    });

    Object.defineProperty(Asset.prototype, 'data', {
        get: function () {
            return this._data;
        },

        set: function (value) {
            // fire change event when data changes
            // because the asset might need reloading if that happens
            var old = this._data;
            this._data = value;
            if (value !== old) {
                this.fire('change', this, 'data', value, old);

                if (this.loaded)
                    this.registry._loader.patch(this, this.registry);
            }
        }
    });

    Object.defineProperty(Asset.prototype, 'resource', {
        get: function () {
            return this._resources[0];
        },

        set: function (value) {
            var _old = this._resources[0];
            this._resources[0] = value;
            this.fire('change', this, 'resource', value, _old);
        }
    });

    Object.defineProperty(Asset.prototype, 'resources', {
        get: function () {
            return this._resources;
        },

        set: function (value) {
            var _old = this._resources;
            this._resources = value;
            this.fire('change', this, 'resources', value, _old);
        }
    });

    Object.defineProperty(Asset.prototype, 'preload', {
        get: function () {
            return this._preload;
        },
        set: function (value) {
            value = !!value;
            if (this._preload === value)
                return;

            this._preload = value;
            if (this._preload && !this.loaded && !this.loading && this.registry)
                this.registry.load(this);
        }
    });

    return {
        Asset: Asset,
        ASSET_ANIMATION: 'animation',
        ASSET_AUDIO: 'audio',
        ASSET_IMAGE: 'image',
        ASSET_JSON: 'json',
        ASSET_TEXT: 'text',
        ASSET_TEXTURE: 'texture',
        ASSET_SHADER: 'shader',
        ASSET_CSS: 'css',
        ASSET_HTML: 'html',
        ASSET_SCRIPT: 'script',
        ABSOLUTE_URL: ABSOLUTE_URL
    };
}());