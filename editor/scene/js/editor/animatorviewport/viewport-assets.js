/* editor/viewport/viewport-assets.js */
editor.once('load', function() {
    'use strict';

    var app = editor.call('viewport:app');
    if (! app) return;

    var assets = app.assets;

    editor.call('assets:registry:bind', assets);

    var regexFrameUpdate = /^data\.frames\.(\d+)/;
    var regexFrameRemove = /^data\.frames\.(\d+)$/;
    var regexI18n = /^i18n\.[^\.]+?$/;

    // add assets to asset registry
    editor.on('assets:add', function (asset) {
        // do only for target assets
        if (asset.get('source'))
            return;

        var assetEngine = assets.get(asset.get('id'));
        // render on asset load
        assetEngine.on('load', function() {
            editor.call('viewport:render');
        });
        // render on asset data change
        assetEngine.on('change', function() {
            editor.call('viewport:render');
        });

        // when data is changed
        asset.on('*:set', function (path, value) {
            editor.call('viewport:render');
        });

        asset.on('*:unset', function (path) {

        });


        // render
        editor.call('viewport:render');
    });

    editor.on('assets:remove', function (asset) {
        editor.call('viewport:render');
    });

});
