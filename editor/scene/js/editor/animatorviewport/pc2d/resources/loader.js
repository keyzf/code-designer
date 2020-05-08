Object.assign(pc2d, function () {
    'use strict';

    var ResourceLoader = function (app) {
        this._handlers = {};
        this._requests = {};
        this._cache = {};
        this._app = app;
    };

    Object.assign(ResourceLoader.prototype, {
        addHandler: function (type, handler) {
            this._handlers[type] = handler;
            handler._loader = this;
        },

        removeHandler: function (type) {
            delete this._handlers[type];
        },

        getHandler: function (type) {
            return this._handlers[type];
        },

        load: function (url, type, callback, asset) {
            var handler = this._handlers[type];
            if (!handler) {
                var err = "No handler for asset type: " + type;
                callback(err);
                return;
            }

            var key = url + type;

            if (this._cache[key] !== undefined) {
                // in cache
                callback(null, this._cache[key]);
            } else if (this._requests[key]) {
                // existing request
                this._requests[key].push(callback);
            } else {
                // new request
                this._requests[key] = [callback];

                var self = this;

                var handleLoad = function (err, urlObj) {
                    if (err) {
                        self._onFailure(key, err);
                        return;
                    }

                    handler.load(urlObj, function (err, data, extra) {
                        // make sure key exists because loader
                        // might have been destroyed by now
                        if (!self._requests[key]) {
                            return;
                        }

                        if (err) {
                            self._onFailure(key, err);
                            return;
                        }

                        try {
                            self._onSuccess(key, handler.open(urlObj.original, data, asset), extra);
                        } catch (e) {
                            self._onFailure(key, e);
                        }
                    }, asset);
                };

                var normalizedUrl = url.split('?')[0];
                if (this._app.enableBundles && this._app.bundles.hasUrl(normalizedUrl)) {
                    if (!this._app.bundles.canLoadUrl(normalizedUrl)) {
                        handleLoad('Bundle for ' + url + ' not loaded yet');
                        return;
                    }

                    this._app.bundles.loadUrl(normalizedUrl, function (err, fileUrlFromBundle) {
                        handleLoad(err, { load: fileUrlFromBundle, original: url });
                    });
                } else {
                    handleLoad(null, { load: url, original: url });
                }
            }
        },

        _onSuccess: function (key, result, extra) {
            this._cache[key] = result;
            for (var i = 0; i < this._requests[key].length; i++) {
                this._requests[key][i](null, result, extra);
            }
            delete this._requests[key];
        },

        _onFailure: function (key, err) {
            console.error(err);
            if (this._requests[key]) {
                for (var i = 0; i < this._requests[key].length; i++) {
                    this._requests[key][i](err);
                }
                delete this._requests[key];
            }
        },

        open: function (type, data) {
            var handler = this._handlers[type];
            if (!handler) {
                console.warn("No resource handler found for: " + type);
                return data;
            }

            return handler.open(null, data);

        },

        patch: function (asset, assets) {
            var handler = this._handlers[asset.type];
            if (!handler)  {
                console.warn("No resource handler found for: " + asset.type);
                return;
            }

            if (handler.patch) {
                handler.patch(asset, assets);
            }
        },

        clearCache: function (url, type) {
            delete this._cache[url + type];
        },

        getFromCache: function (url, type) {
            if (this._cache[url + type]) {
                return this._cache[url + type];
            }
        },

        enableRetry: function () {
            for (var key in this._handlers) {
                this._handlers[key].retryRequests = true;
            }
        },

        disableRetry: function () {
            for (var key in this._handlers) {
                this._handlers[key].retryRequests = false;
            }
        },

        destroy: function () {
            this._handlers = {};
            this._requests = {};
            this._cache = {};
        }
    });

    return {
        ResourceLoader: ResourceLoader
    };
}());