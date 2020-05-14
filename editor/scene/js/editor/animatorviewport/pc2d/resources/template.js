Object.assign(pc, function () {
    'use strict';

    var TemplateHandler = function (app) {
        this._app = app;
    };

    Object.assign(TemplateHandler.prototype, {
        load: function (url, callback) {
            if (typeof url === 'string') {
                url = {
                    load: url,
                    original: url
                };
            }

            var assets = this._app.assets;

            pc2d.http.get(url.load, function (err, response) {
                if (err) {
                    callback("Error requesting template: " + url.original);
                } else {
                    pc2d.TemplateUtils.waitForTemplateAssets(
                        response.entities,
                        assets,
                        callback,
                        response);
                }
            });
        },

        open: function (url, data) {
            return new pc2d.Template(this._app, data);
        }
    });

    return {
        TemplateHandler: TemplateHandler
    };
}());