Object.assign(pc2d, function () {
    'use strict';

    var CssHandler = function () {
        this.retryRequests = false;
    };

    Object.assign(CssHandler.prototype, {
        load: function (url, callback) {
            if (typeof url === 'string') {
                url = {
                    load: url,
                    original: url
                };
            }

            if(url.load.startsWith("data:text/css;")){
                var link = document.createElement('link');
                link.rel="stylesheet";
                link.href = url.load;
                document.head.appendChild(link);
                callback(null, "");
            }else{

                var link = document.createElement('link');
                link.rel="stylesheet";
                link.href = url.load;
                document.head.appendChild(link);
                callback(null, "");

                // pc2d.http.get(url.load, {
                //     retry: this.retryRequests
                // }, function (err, response) {
                //     if (!err) {
                //         callback(null, response);
                //     } else {
                //         callback(pc.string.format("Error loading css resource: {0} [{1}]", url.original, err));
                //     }
                // });
            }

           
        },

        open: function (url, data) {
            return data;
        },

        patch: function (asset, assets) {
        }
    });
    var createStyle = function (cssString) {
        var result = document.createElement('style');
        result.type = 'text/css';
        if (result.styleSheet) {
            result.styleSheet.cssText = cssString;
        } else {
            result.appendChild(document.createTextNode(cssString));
        }

        return result;
    };

    return {
        CssHandler: CssHandler,
        createStyle: createStyle
    };
}());