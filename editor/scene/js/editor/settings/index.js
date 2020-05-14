/* editor/settings/settings.js */
editor.once('load', function () {
    'use strict';

    editor.method('settings:create', function (args) {

        
        // settings observer
        var settings = new Observer(args.data);
        settings.id = args.id;

        // Get settings
        editor.method('settings:' + args.name, function () {
            return settings;
        });


        settings.reload = function () {
           
            //load from disk
            var data = {};

                // remove unnecessary fields
                delete data._id;
                delete data.name;
                delete data.user;
                delete data.project;
                delete data.item_id;
                delete data.branch_id;
                delete data.checkpoint_id;

                if (! settings.sync) {
                    settings.sync = new ObserverSync({
                        item: settings,
                        paths: Object.keys(settings._data)
                    });

                    // local -> server
                    settings.sync.on('op', function (op) {
                        /**TODO */
                        var FS =  editor.call("FS:offline-system");

                        FS.saveSettings(config.project.id,settings.json());

                        console.log()
                       
                    });
                }

                var history = settings.history.enabled;
                if (history) {
                    settings.history.enabled = false;
                }

                settings.sync._enabled = false;
                for (var key in data) {
                    if (data[key] instanceof Array) {
                        settings.set(key, data[key].slice(0));
                    } else {
                        settings.set(key, data[key]);
                    }
                }
                settings.sync._enabled = true;
                if (history)
                    settings.history.enabled = true;

                // server -> local
                // doc.on('op', function (ops, local) {
                //     if (local) return;

                //     var history = settings.history.enabled;
                //     if (history)
                //         settings.history.enabled = false;
                //     for (var i = 0; i < ops.length; i++) {
                //         settings.sync.write(ops[i]);
                //     }
                //     if (history)
                //         settings.history.enabled = true;
                // });

                if(args.name === "project"){
                    editor.on('assets:scripts:add', _onScriptAdd);

                    editor.on('assets:scripts:remove', _onScriptRemove);
    
                    function _onScriptRemove(asset){
                        var history = settings.history.enabled;
                        if (history)
                            settings.history.enabled = false;
                            var scripts = settings.get("scripts") || [];
                            var idx,_scripts = scripts;
                            idx = _scripts.indexOf(asset.get("id"));
    
                            if(idx >= 0){
                                settings.remove("scripts" ,idx);                               
                            }
    
                        if (history)
                            settings.history.enabled = true;
                    }
    
                    /**脚本更新 */
                    function _onScriptAdd(asset){
    
                        var history = settings.history.enabled;
                        if (history)
                            settings.history.enabled = false;
                        var scripts = settings.get("scripts") || [];
    
                         var idx,_scripts = scripts;
                        for(var i = 0;i < _scripts.length;i++){
                            if(scripts[_scripts[i]] == asset.get("id")){
                                idx = i;
                                break;
                            }
                        }
                        /**todo */
    
                        if(!idx){
                            settings.insert("scripts" ,asset.get("id"),_scripts.length);                            
                        }
    
                        if (history)
                            settings.history.enabled = true;
    
                    }

                }




                editor.emit('settings:' + args.name + ':load');



        };

        if (! args.deferLoad) {
            editor.once('app:authenticated',function(){
                settings.reload();
            });
        }


        return settings;
    });
});


/* editor/settings/user-settings.js */
editor.once('load', function () {
    'use strict';
    var settings = editor.call('settings:create', {
        name: 'user',
        id: 'user_' + config.self.id,
        data: {
            editor: {
                howdoi: true,
                iconSize: 0.2,
                showSkeleton: true,
            }
        }
    });

    // add history
    settings.history = new ObserverHistory({
        item: settings,
        history: editor.call('editor:history')
    });


    // migrations
    editor.on('settings:user:load', function () {
        setTimeout(function () {
            var history = settings.history.enabled;
            settings.history.enabled = false;

            if (! settings.has('editor.showSkeleton'))
                settings.set('editor.showSkeleton', true);

            settings.history.enabled = history;
        });
    });
});


/* editor/settings/project-user-settings.js */
editor.once('load', function () {
    'use strict';


    editor.on("offline:loadedproject",function(){
        
        
    });
    var settings = editor.call('settings:create', {
        name: 'projectUser',
        id: 'project_' + config.project.id + '_' + config.self.id,
        deferLoad: true,
        data: {
            editor: {
            },
            favoriteBranches: null
        },
        userId: config.self.id
    });

    // add history
    settings.history = new ObserverHistory({
        item: settings,
        history: editor.call('editor:history')
    });
   
    // migrations
    editor.on('settings:projectUser:load', function () {
        setTimeout(function () {
            var history = settings.history.enabled;
            settings.history.enabled = false;

            var sync = settings.sync.enabled;
            settings.sync.enabled = editor.call('permissions:read'); // read permissions enough for project user settings

            if (! settings.has('editor.pipeline'))
                settings.set('editor.pipeline', {});

            if (! settings.has('editor.pipeline.texturePot'))
                settings.set('editor.pipeline.texturePot', true);

            if (! settings.has('editor.pipeline.searchRelatedAssets'))
                settings.set('editor.pipeline.searchRelatedAssets', true);

            if (! settings.has('editor.pipeline.preserveMapping'))
                settings.set('editor.pipeline.preserveMapping', false);

            if (! settings.has('editor.pipeline.textureDefaultToAtlas'))
                settings.set('editor.pipeline.textureDefaultToAtlas', false);

            if (! settings.has('editor.pipeline.overwriteModel'))
                settings.set('editor.pipeline.overwriteModel', true);

            if (! settings.has('editor.pipeline.overwriteAnimation'))
                settings.set('editor.pipeline.overwriteAnimation', true);

            if (! settings.has('editor.pipeline.overwriteMaterial'))
                settings.set('editor.pipeline.overwriteMaterial', false);

            if (! settings.has('editor.pipeline.overwriteTexture'))
                settings.set('editor.pipeline.overwriteTexture', true);

            if (! settings.has('editor.locale')) {
                settings.set('editor.locale', 'en-US');
            }

            if (!settings.get('favoriteBranches')) {
                if (config.project.masterBranch) {
                    settings.set('favoriteBranches', [config.project.masterBranch]);
                } else {
                    settings.set('favoriteBranches', []);
                }
            }

            settings.history.enabled = history;
            settings.sync.enabled = sync;
        });
    });

    var reload = function () {
        settings.reload(settings.scopeId);
    };

    // handle permission changes
    editor.on('permissions:set:' + config.self.id, function (accesslevel) {
        if (editor.call('permissions:read')) {
            // reload settings
            if (! settings.sync) {
                settings.history.enabled = true;
                reload();
            }
        } else {
            // unset private settings
            if (settings.sync) {
                settings.disconnect();
                settings.history.enabled = false;
            }
        }
    });
   
});



/* editor/settings/project-private-settings.js */
editor.once('load', function () {
    'use strict';



    editor.on("offline:loadedproject",function(){

        


    });

    var defaultData = {
    };

    var isConnected = false;


    var settings = editor.call('settings:create', {
        name: 'projectPrivate',
        id: 'project-private_' + config.project.id,
        deferLoad: true,
        data: defaultData
    });


    // add history
    settings.history = new ObserverHistory({
        item: settings,
        history: editor.call('editor:history')
    });
   
    var reload = function () {
        if (! isConnected) return;

        if (config.project.hasPrivateSettings && editor.call('permissions:write')) {
            settings.reload(settings.scopeId);
        }

        if (! config.project.hasPrivateSettings) {
            var pendingChanges = {};

            var evtOnSet = settings.on('*:set', function (path, value, valueOld) {
                // store pending changes until we load document from C3 in order to send
                // them to the server
                if (! settings.sync) {
                    pendingChanges[path] = value;
                }

                if (! config.project.hasPrivateSettings) {
                    config.project.hasPrivateSettings = true;
                    settings.reload(settings.scopeId);
                }
            });

            // when settings are created and loaded from the server sync any pending changes
            editor.once('settings:projectPrivate:load', function () {
                evtOnSet.unbind();

                var history = settings.history.enabled;
                settings.history.enabled = false;
                for (var key in pendingChanges) {
                    settings.set(key, pendingChanges[key]);
                }
                settings.history.enabled = history;

                pendingChanges = null;
            });
        }
    };

    // handle permission changes
    editor.on('permissions:set:' + config.self.id, function (accesslevel) {
        if (accesslevel !== 'admin' && accesslevel !== 'write') {
            // unset private settings
            settings.disconnect();
            settings.history.enabled = false;
            for (var key in defaultData) {
                settings.unset(key);
            }
        } else {
            // reload settings
            settings.history.enabled = true;
            reload();
        }
    });

    editor.on('messenger:settings.create', function (msg) {
        if (config.project.hasPrivateSettings) return; // skip if we've already created the settings locally

        if (msg.settings.name === 'project-private') {
            config.project.hasPrivateSettings = true;
            reload();
        }
    });


});


/* editor/settings/scene-settings.js */
editor.once('load', function() {
    'use strict';

    var sceneSettings = new Observer();

    // get scene settings
    editor.method('sceneSettings', function() {
        return sceneSettings;
    });


    // loaded scene
    editor.on('scene:raw', function(data) {
        var sync = sceneSettings.sync ? sceneSettings.sync.enabled : false;
        if (sync)
            sceneSettings.sync.enabled = false;

        var history = sceneSettings.history ? sceneSettings.history.enabled : false;
        if (history)
            sceneSettings.history.enabled = false;

        sceneSettings.patch(data.settings);

        if (data.settings.priority_scripts === undefined && sceneSettings.has('priority_scripts'))
            sceneSettings.unset('priority_scripts');

        if (sync)
            sceneSettings.sync.enabled = sync;

        if (history)
            sceneSettings.history.enabled = true;

        editor.emit('sceneSettings:load', sceneSettings);
    });

    // migrations
    editor.on('sceneSettings:ready', function() {
        // lightmapSizeMultiplier
        if (! sceneSettings.has('render.lightmapSizeMultiplier'))
            sceneSettings.set('render.lightmapSizeMultiplier', 16);

        // lightmapMaxResolution
        if (! sceneSettings.has('render.lightmapMaxResolution'))
            sceneSettings.set('render.lightmapMaxResolution', 2048);

        // lightmapMode
        if (! sceneSettings.has('render.lightmapMode'))
            sceneSettings.set('render.lightmapMode', 0);

        // skyboxIntensity
        if (! sceneSettings.has('render.skyboxIntensity'))
            sceneSettings.set('render.skyboxIntensity', 1);

        // skyboxMip
        if (! sceneSettings.has('render.skyboxMip'))
            sceneSettings.set('render.skyboxMip', 0);
    });

    var onUnload = function() {
        if (sceneSettings.history)
            sceneSettings.history.enabled = false;
        if (sceneSettings.sync)
            sceneSettings.sync.enabled = false;

        sceneSettings.set('render.skybox', null);

        if (sceneSettings.history)
            sceneSettings.history.enabled = true;
        if (sceneSettings.sync)
            sceneSettings.sync.enabled = true;
    };

    editor.on('realtime:disconnected', onUnload);
    editor.on('scene:unload', onUnload);
});


/* editor/settings/scene-settings-history.js */
editor.once('load', function() {
    'use strict';

    editor.on('sceneSettings:load', function(settings) {
        if (settings.history)
            settings.history.destroy();

        settings.history = new ObserverHistory({
            item: settings,
            prefix: 'settings.',
            history: editor.call('editor:history')
        });
    });
});


/* editor/settings/scene-settings-sync.js */
editor.once('load', function() {
    'use strict';

    editor.on('sceneSettings:load', function(settings) {
        if (! settings.sync) {
            settings.sync = new ObserverSync({
                item: settings,
                prefix: [ 'settings' ]
            });

            // client > server
            settings.sync.on('op', function(op) {
                editor.call('realtime:scene:op', op);
            });

            // server > client
            editor.on('realtime:scene:op:settings', function(op) {
                settings.sync.write(op);
            });
        }

        editor.emit('sceneSettings:ready');
    });
});



/* editor/settings/settings-attributes-scene.js */
editor.once('load', function() {
    'use strict';

    editor.method('editorSettings:panel:unfold', function(panel) {
        var element = editor.call('layout.attributes').dom.querySelector('.ui-panel.component.foldable.' + panel);
        if (element && element.ui) {
            element.ui.folded = false;
        }
    });

    editor.on('attributes:inspect[editorSettings]', function() {
        editor.call('attributes:header', 'Settings');
    });
});


/* editor/settings/settings-attributes-physics.js */
editor.once('load', function() {
    'use strict';

    var sceneSettings = editor.call('sceneSettings');
    var projectSettings = editor.call('settings:project');

    // check legacy physics include flag
    editor.method('project:settings:hasLegacyPhysics', function() {
        return projectSettings.get('useLegacyAmmoPhysics') &&
               projectSettings.get('use3dPhysics');
    });

    // method for checking whether the current project has physics (either legacy or module)
    editor.method('project:settings:hasPhysics', function() {
        return editor.call('project:settings:hasLegacyPhysics') ||
                editor.call('project:module:hasModule', 'ammo');
    });

    // append the physics module controls to the provided panel
    editor.method('attributes:appendImportAmmo', function(panel) {
        // button
        var button = new pcui.Button({
            text: 'IMPORT AMMO',
            icon: 'E228'
        });
        button.on('click', function() {
            // ensure legacy physics is disabled
            projectSettings.set('use3dPhysics', false);
            // add the module
            editor.call('project:module:addModule', 'ammo.js', 'ammo');
        });

        // group
        var group = new pcui.LabelGroup({
            field: button,
            text: 'Physics Library'
        });
        group.style.margin = '3px';
        group.label.style.width = '27%';
        group.label.style.fontSize = '12px';
        panel.append(group);

        // reference
        editor.call('attributes:reference:attach', 'settings:ammo', group.label);

        // enable state is based on write permissions and state of legacy physics
        function updateEnableState() {
            group.enabled = !editor.call('project:settings:hasLegacyPhysics') &&
                             editor.call('permissions:write');
        }

        const events = [];

        events.push(editor.on('permissions:writeState', function (write) {
            updateEnableState();
        }));
        events.push(editor.on('onUse3dPhysicsChanged', function() {
            updateEnableState();
        }));
        events.push(editor.on('onModuleImported', function(name) {
            if (name === 'ammo.js') {
                group.enabled = false;
            }
        }));

        updateEnableState();

        group.on('destroy', () => {
            events.forEach(evt => evt.unbind());
            events.length = 0;
        });

        return group;
    });

});




/* editor/settings/settings-attributes-audio.js */
editor.once('load', function() {
    'use strict';

    var projectSettings = editor.call('settings:project');

    var folded = true;

    editor.on('attributes:inspect[editorSettings]', function() {
        if (projectSettings.has('useLegacyAudio')) {

            var panelAudio = editor.call('attributes:addPanel', {
                name: 'Audio'
            });
            panelAudio.foldable = true;
            panelAudio.folded = folded;
            panelAudio.on('fold', function() { folded = true; });
            panelAudio.on('unfold', function() { folded = false; });
            panelAudio.class.add('component', 'audio');

            var fieldLegacyAudio = editor.call('attributes:addField', {
                parent: panelAudio,
                name: 'Use Legacy Audio',
                type: 'checkbox',
                link: projectSettings,
                path: 'useLegacyAudio'
            });
            fieldLegacyAudio.parent.innerElement.firstChild.style.width = 'auto';
            editor.call('attributes:reference:attach', 'settings:project:useLegacyAudio', fieldLegacyAudio.parent.innerElement.firstChild.ui);
        }
    });
});



