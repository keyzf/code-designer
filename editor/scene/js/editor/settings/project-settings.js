
/* editor/settings/project-settings.js */
editor.once('load', function () {
    'use strict';

    var settings;
    config.project.settings = config.project.settings || {};

    editor.on("offline:loadedproject",function(){
   
    });

    var syncPaths = [
        'fillMode',
        'resolutionMode',
        'responsive',
        'height',
        'width',
        'scripts',
        'useDevicePixelRatio',
        'useKeyboard',
        'useMouse',
        'useGamepads',
        'useTouch',
        'loadingScreenScript',
        'externalScripts',
        'plugins'
    ];

    /**FS */
    var data = {};
   
    for (var i = 0; i < syncPaths.length; i++)
        data[syncPaths[i]] = config.project.settings.hasOwnProperty(syncPaths[i]) ? config.project.settings[syncPaths[i]] : null;

    settings = editor.call('settings:create', {
        name: 'project',
        id: config.project.settings.id,
        data: data
    });


    // add history
    settings.history = new ObserverHistory({
        item: settings,
        history: editor.call('editor:history')
    });

    settings.on('*:set', function (path, value) {
        var parts = path.split('.');
        var obj = config.project.settings;
        for (var i = 0; i < parts.length - 1; i++) {
            if (! obj.hasOwnProperty(parts[i]))
                obj[parts[i]] = {};

            obj = obj[parts[i]];
        }

        // this is limited to simple structures for now
        // so take care
        if (value instanceof Object) {
            var path = parts[parts.length-1];
            obj[path] = {};
            for (var key in value) {
                obj[path][key] = value[key];
            }
        } else {
            obj[parts[parts.length-1]] = value;
        }
    });

    settings.on('*:unset', function (path) {
        var parts = path.split('.');
        var obj = config.project.settings;
        for (var i = 0; i < parts.length - 1; i++) {
            obj = obj[parts[i]];
        }

        delete obj[parts[parts.length-1]];
    });

    settings.on('*:insert', function (path, value, index) {
        var parts = path.split('.');
        var obj = config.project.settings;
        for (var i = 0; i < parts.length - 1; i++) {
            obj = obj[parts[i]];
        }

        var arr = obj[parts[parts.length - 1]];
        if (Array.isArray(arr)) {
            arr.splice(index, 0, value);
        }
    });

    settings.on('*:remove', function (path, value, index) {
        var parts = path.split('.');
        var obj = config.project.settings;
        for (var i = 0; i < parts.length - 1; i++) {
            obj = obj[parts[i]];
        }

        var arr = obj[parts[parts.length - 1]];
        if (Array.isArray(arr)) {
            arr.splice(index, 1);
        }
    });
  

    // migrations
    editor.on('settings:project:load', function () {
        
        var history = settings.history.enabled;
        var sync = settings.sync.enabled;

        settings.history.enabled = false;
        settings.sync.enabled = editor.call('permissions:write');

        if (settings.get('useKeyboard') === null) {
            settings.set('useKeyboard', true);
        }
        if (settings.get('useMouse') === null) {
            settings.set('useMouse', true);
        }
        if (settings.get('useTouch') === null) {
            settings.set('useTouch', true);
        }
        if (settings.get('useGamepads') === null) {
            settings.set('useGamepads', !!settings.get('vr'));
        }

        if (!settings.get('i18nAssets')) {
            settings.set('i18nAssets', []);
        }

        if (!settings.get('externalScripts')) {
            settings.set('externalScripts', []);
        }

        if (!settings.get('scripts')) {
            settings.set('scripts', []);
        }

        settings.history.enabled = history;
        settings.sync.enabled = sync;
    });

});
