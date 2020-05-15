

/* editor/assets/assets-reimport.js */
editor.once('load', function () {
    'use strict';

    var index = 0;
    editor.method('assets:reimport', function (assetId, type, callback) {
        var data = {};

        // conversion pipeline specific parameters
        var settings = editor.call('settings:projectUser');
        if (type === 'texture' || type === 'textureatlas' || type === 'scene') {
            data.pow2 = settings.get('editor.pipeline.texturePot');
            data.searchRelatedAssets = settings.get('editor.pipeline.searchRelatedAssets');

            if (type === 'scene') {
                data.overwriteModel = settings.get('editor.pipeline.overwriteModel');
                data.overwriteAnimation = settings.get('editor.pipeline.overwriteAnimation');
                data.overwriteMaterial = settings.get('editor.pipeline.overwriteMaterial');
                data.overwriteTexture = settings.get('editor.pipeline.overwriteTexture');
                data.preserveMappping = settings.get('editor.pipeline.preserveMapping');
            }
        }

        var jobId = ++index;
        var jobName = 'asset-reimport:' + jobId;
        editor.call('status:job', jobName, 0);

        Ajax({
            url: '/api/assets/' + assetId + '/reimport?branchId=' + config.self.branch.id,
            method: 'POST',
            auth: true,
            data: data
        })
        .on('load', function (status, res) {
            editor.call('status:job', jobName);
            if (callback) {
                callback(null, res);
            }
        })
        .on('progress', function (progress) {
            editor.call('status:job', jobName, progress);
        })
        .on('error', function (status, res) {
            editor.call('status:error', res);
            editor.call('status:job', jobName);
            if (callback) {
                callback(res);
            }
        });
    });
});


/* editor/assets/assets-drop.js */
editor.once('load', function() {
    'use strict';

    var assetsPanel = editor.call('layout.assets');

    var dropRef = editor.call('drop:target', {
        ref: assetsPanel,
        type: 'files',
        drop: function (type, data) {
            
            if (type !== 'files')
                return;

            editor.call('assets:upload:files', data);
        }
    });

    dropRef.class.add('assets-drop-area');
});


/* editor/assets/assets-messenger.js */
editor.once('load', function () {
    'use strict';

    var create = function (data) {

        var uniqueId = data.asset.id;

        if (data.asset.source === false && data.asset.status && data.asset.status !== 'complete') {
            return;
        }

        // todo: data.asset.source_asset_id

        // todo: possibly convert this to a new event `assets:update`
        var asset = editor.call('assets:getUnique', uniqueId);
        if (asset) {
            return;
        }

        editor.call('loadAsset', uniqueId);
    };

    // create new asset
    editor.on('messenger:asset.new', create);

    // remove
    editor.on('messenger:asset.delete', function(data) {
        var asset = editor.call('assets:getUnique', data.asset.id);
        if (! asset) return;
        editor.call('assets:remove', asset);
    });

    // remove multiple
    editor.on('messenger:assets.delete', function(data) {
        for (var i = 0; i < data.assets.length; i++) {
            var asset = editor.call('assets:getUnique', data.assets[i]);
            if (! asset) continue;
            editor.call('assets:remove', asset);
        }
    });
});


/* editor/assets/assets-delete.js */
editor.once('load', function() {
    'use strict';

    editor.method('assets:delete:picker', function(items) {
        if (! editor.call('permissions:write'))
            return;

        var msg = 'Delete Asset?';

        if (items.length === 1 && items[0].get('type') === 'folder')
            msg = 'Delete Folder?';

        if (items.length > 1)
            msg = 'Delete ' + items.length + ' Assets?';

        editor.call('picker:confirm', msg, function() {
            if (! editor.call('permissions:write'))
                return;

            editor.call('assets:delete', items);
        }, {
            yesText: 'Delete',
            noText: 'Cancel'
        });
    });

    var deleteCallback = function() {
        if (! editor.call('permissions:write'))
            return;

        var type = editor.call('selector:type');
        if (type !== 'asset')
            return;

        editor.call('assets:delete:picker', editor.call('selector:items'));
    };
    // delete
    editor.call('hotkey:register', 'asset:delete', {
        key: 'delete',
        callback: deleteCallback
    });
    // ctrl + backspace
    editor.call('hotkey:register', 'asset:delete', {
        ctrl: true,
        key: 'backspace',
        callback: deleteCallback
    });
});


/* editor/assets/assets-duplicate.js */
editor.once('load', function() {
    'use strict';

    editor.method('assets:duplicate', function(asset) {
        if (asset.get('type') !== 'material' && asset.get('type') !== 'sprite') return;

        var path = asset.get('path');
        var parent = path.length ? path[path.length - 1] : null;

        var raw = {
            // only materials can be duplicated at the moment
            type: asset.get('type'),
            name: asset.get('name') + ' Copy',
            tags: asset.get('tags'),
            source: false,
            data: asset.get('data'),
            preload: asset.get('preload'),
            parent: parent ? editor.call('assets:get', parent) : null,
            scope: {
                type: 'project',
                id: config.project.id
            }
        };

        editor.call('assets:create', raw);
    });
});


/* editor/assets/assets-edit.js */
editor.once('load', function() {
    'use strict';

    var types = {
        'css': 1,
        'html': 1,
        'json': 1,
        'script': 1,
        'shader': 1,
        'text': 1
    };

    editor.method('assets:edit', function (asset) {
        editor.call('picker:codeeditor', asset);
    });

    var dblClick = function(key, asset) {
        var gridItem = editor.call('assets:panel:get', asset.get(key));
        if (! gridItem)
            return;

        gridItem.element.addEventListener('dblclick', function(evt) {
            editor.call('assets:edit', asset);
        }, false);
    };

    editor.on('assets:add', function(asset) {
        if (! types[asset.get('type')])
            return;

        dblClick('id', asset);
    });

    editor.on('sourcefiles:add', function(file) {
        dblClick('filename', file);
    });
});


/* editor/assets/assets-replace.js */
editor.once('load', function () {
    'use strict';

    var slots = ['aoMap', 'diffuseMap', 'emissiveMap', 'glossMap', 'lightMap', 'metalnessMap', 'opacityMap', 'specularMap', 'normalMap', 'sphereMap'];

    /**
     * Replaces the specified asset with the replacement asset everywhere
     * @param {Observer} asset The original asset
     * @param {Observer} replacement The replacement asset
     */
    var AssetReplace = function (asset, replacement) {
        this.asset = asset;
        this.replacement = replacement;

        this.oldId = asset.get('id');
        this.newId = replacement.get('id');

        this.entities = editor.call('entities:list');
        this.assets = editor.call('assets:list');

        this.records = [];
    };

    /**
     * Set the replacement asset for the specified object at the specified path
     * @param {Observer} obj The object
     * @param {String} path The path that we are replacing
     */
    AssetReplace.prototype.set = function (obj, path) {
        var history = obj.history.enabled;
        obj.history.enabled = false;
        obj.set(path, this.newId);
        obj.history.enabled = history;

        if (history) {
            this.records.push({
                get: obj.history._getItemFn,
                path: path
            });
        }
    };

    AssetReplace.prototype.handleAnimation = function () {
        // entity
        for (var i = 0; i < this.entities.length; i++) {
            var obj = this.entities[i];

            // animation
            var animation = obj.get('components.animation');
            if (animation && animation.assets) {
                for (var ind = 0; ind < animation.assets.length; ind++) {
                    if (animation.assets[ind] !== this.oldId)
                        continue;

                    // components.animation.assets.?
                    this.set(obj, 'components.animation.assets.' + ind);
                }
            }
        }
    };

    AssetReplace.prototype.handleAudio = function () {
        // entity
        for (var i = 0; i < this.entities.length; i++) {
            var obj = this.entities[i];

            // sound
            var sound = obj.get('components.sound');
            if (sound) {
                for (var ind in sound.slots) {
                    if (!sound.slots[ind] || sound.slots[ind].asset !== this.oldId)
                        continue;

                    // components.sound.slots.?.asset
                    this.set(obj, 'components.sound.slots.' + ind + '.asset');
                }
            }

            // audiosource
            var audiosource = obj.get('components.audiosource');
            if (audiosource && audiosource.assets) {
                for (var a = 0; a < audiosource.assets.length; a++) {
                    if (audiosource.assets[a] !== this.oldId)
                        continue;

                    // components.audiosource.assets.?
                    this.set(obj, 'components.audiosource.assets.' + a);
                }
            }
        }
    };

    AssetReplace.prototype.handleCubemap = function () {
        var i;
        var obj;

        // entity
        for (i = 0; i < this.entities.length; i++) {
            obj = this.entities[i];

            // light
            var light = obj.get('components.light');
            if (light && light.cookieAsset === this.oldId) {
                // components.light.cookieAsset
                this.set(obj, 'components.light.cookieAsset');
            }
        }

        // asset
        for (i = 0; i < this.assets.length; i++) {
            obj = this.assets[i];

            if (obj.get('type') === 'material' && obj.get('data.cubeMap') === this.oldId) {
                // data.cubeMap
                this.set(obj, 'data.cubeMap');
            }
        }

        // sceneSettings
        obj = editor.call('sceneSettings');
        if (obj.get('render.skybox') === this.oldId) {
            // render.skybox
            this.set(obj, 'render.skybox');
        }
    };

    AssetReplace.prototype.handleMaterial = function () {
        var obj;
        var i;
        var ind;

        // entity
        for (i = 0; i < this.entities.length; i++) {
            obj = this.entities[i];

            // model
            var model = obj.get('components.model');
            if (model) {
                if (model.materialAsset === this.oldId) {
                    // components.model.materialAsset
                    this.set(obj, 'components.model.materialAsset');
                }
                if (model.mapping) {
                    for (ind in model.mapping) {
                        if (model.mapping[ind] === this.oldId) {
                            // components.model.mapping.?
                            this.set(obj, 'components.model.mapping.' + ind);
                        }
                    }
                }
            }

            // element
            var element = obj.get('components.element');
            if (element && element.materialAsset === this.oldId) {
                // components.element.materialAsset
                this.set(obj, 'components.element.materialAsset');
            }
        }

        // asset
        for (i = 0; i < this.assets.length; i++) {
            obj = this.assets[i];

            if (obj.get('type') === 'model') {
                var mapping = obj.get('data.mapping');
                if (mapping) {
                    for (ind = 0; ind < mapping.length; ind++) {
                        if (mapping[ind].material !== this.oldId)
                            continue;

                        // data.mapping.?.material
                        this.set(obj, 'data.mapping.' + ind + '.material');

                        // change meta.userMapping as well
                        var history = obj.history.enabled;
                        obj.history.enabled = false;
                        if (!obj.get('meta')) {
                            obj.set('meta', {
                                userMapping: {}
                            });
                        } else {
                            if (!obj.has('meta.userMapping'))
                                obj.set('meta.userMapping', {});
                        }

                        obj.set('meta.userMapping.' + ind, true);

                        obj.history.enabled = history;
                    }
                }
            }
        }
    };

    AssetReplace.prototype.handleModel = function () {
        var obj;
        var i;

        // entity
        for (i = 0; i < this.entities.length; i++) {
            obj = this.entities[i];

            // model
            var model = obj.get('components.model');
            if (model && model.asset === this.oldId) {
                // components.model.asset
                this.set(obj, 'components.model.asset');
            }

            // collision
            var collision = obj.get('components.collision');
            if (collision && collision.asset === this.oldId) {
                // components.collision.asset
                this.set(obj, 'components.collision.asset');
            }

            // particlesystem
            var particlesystem = obj.get('components.particlesystem');
            if (particlesystem && particlesystem.mesh === this.oldId) {
                // components.particlesystem.mesh
                this.set(obj, 'components.particlesystem.mesh');
            }
        }
    };

    AssetReplace.prototype.handleSprite = function () {
        var obj;
        var i;

        // entity
        for (i = 0; i < this.entities.length; i++) {
            obj = this.entities[i];

            // sprite component
            var sprite = obj.get('components.sprite');
            if (sprite) {
                if (sprite.spriteAsset && sprite.spriteAsset === this.oldId) {
                    this.set(obj, 'components.sprite.spriteAsset');
                }

                if (sprite.clips) {
                    for (var key in sprite.clips) {
                        if (sprite.clips[key].spriteAsset && sprite.clips[key].spriteAsset === this.oldId) {
                            this.set(obj, 'components.sprite.clips.' + key + '.spriteAsset');
                        }
                    }
                }
            }

            // button component
            var button = obj.get('components.button');
            if (button) {
                if (button.hoverSpriteAsset && button.hoverSpriteAsset === this.oldId) {
                    this.set(obj, 'components.button.hoverSpriteAsset');
                }

                if (button.pressedSpriteAsset && button.pressedSpriteAsset === this.oldId) {
                    this.set(obj, 'components.button.pressedSpriteAsset');
                }

                if (button.inactiveSpriteAsset && button.inactiveSpriteAsset === this.oldId) {
                    this.set(obj, 'components.button.inactiveSpriteAsset');
                }
            }

            // element component
            var element = obj.get('components.element');
            if (element) {
                if (element.spriteAsset && element.spriteAsset === this.oldId) {
                    this.set(obj, 'components.element.spriteAsset');
                }
            }
        }
    };

    AssetReplace.prototype.handleTexture = function () {
        var i;
        var obj;

        // entity
        for (i = 0; i < this.entities.length; i++) {
            obj = this.entities[i];

            // light
            var light = obj.get('components.light');
            if (light && light.cookieAsset === this.oldId) {
                // components.light.cookieAsset
                this.set(obj, 'components.light.cookieAsset');
            }

            // particlesystem
            var particlesystem = obj.get('components.particlesystem');
            if (particlesystem) {
                if (particlesystem.colorMapAsset === this.oldId) {
                    // components.particlesystem.colorMapAsset
                    this.set(obj, 'components.particlesystem.colorMapAsset');
                }
                if (particlesystem.normalMapAsset === this.oldId) {
                    // components.particlesystem.normalMapAsset
                    this.set(obj, 'components.particlesystem.normalMapAsset');
                }
            }

            // element
            var element = obj.get('components.element');
            if (element && element.textureAsset === this.oldId) {
                // components.element.textureAsset
                this.set(obj, 'components.element.textureAsset');
            }

            // button component
            var button = obj.get('components.button');
            if (button) {
                if (button.hoverTextureAsset && button.hoverTextureAsset === this.oldId) {
                    this.set(obj, 'components.button.hoverTextureAsset');
                }

                if (button.pressedTextureAsset && button.pressedTextureAsset === this.oldId) {
                    this.set(obj, 'components.button.pressedTextureAsset');
                }

                if (button.inactiveTextureAsset && button.inactiveTextureAsset === this.oldId) {
                    this.set(obj, 'components.button.inactiveTextureAsset');
                }
            }

        }

        // asset
        for (i = 0; i < this.assets.length; i++) {
            obj = this.assets[i];

            if (obj.get('type') === 'cubemap') {
                var textures = obj.get('data.textures');
                if (textures && textures instanceof Array) {
                    for (var ind = 0; ind < textures.length; ind++) {
                        if (textures[ind] !== this.oldId)
                            continue;

                        // data.mapping.?.material
                        this.set(obj, 'data.textures.' + ind);
                    }
                }
            } else if (obj.get('type') === 'material') {
                var data = obj.get('data');
                if (data) {
                    for (var s = 0; s < slots.length; s++) {
                        if (data[slots[s]] !== this.oldId)
                            continue;

                        this.set(obj, 'data.' + slots[s]);
                    }
                }
            }
        }
    };

    AssetReplace.prototype.handleTextureAtlas = function () {
        var obj;
        var i;

        // asset
        for (i = 0; i < this.assets.length; i++) {
            obj = this.assets[i];

            if (obj.get('type') === 'sprite') {
                var atlas = obj.get('data.textureAtlasAsset');
                if (atlas !== this.oldId) {
                    continue;
                }

                this.set(obj, 'data.textureAtlasAsset');
            }
        }
    };

    AssetReplace.prototype.handleTextureToSprite = function () {
        var obj;
        var i;

        var oldId = this.oldId;
        var newId = this.newId;
        var changed = [];

        for (i = 0; i < this.entities.length; i++) {
            obj = this.entities[i];

            var element = obj.get('components.element');
            if (element && element.textureAsset === oldId) {
                changed.push(obj);
                var history = obj.history.enabled;
                obj.history.enabled = false;
                obj.set('components.element.textureAsset', null);
                obj.set('components.element.spriteAsset', newId);
                obj.history.enabled = history;

                if (history) {
                    // set up undo
                    editor.call('history:add', {
                        name: 'asset texture to sprite',
                        undo: function () {
                            for (var i = 0; i < changed.length; i++) {
                                var obj = changed[i];
                                var history = obj.history.enabled;
                                obj.history.enabled = false;
                                obj.set('components.element.textureAsset', oldId);
                                obj.set('components.element.spriteAsset', null);
                                obj.history.enabled = history;
                            }
                        },

                        redo: function () {
                            for (var i = 0; i < changed.length; i++) {
                                var obj = changed[i];
                                var history = obj.history.enabled;
                                obj.history.enabled = false;
                                obj.set('components.element.textureAsset', null);
                                obj.set('components.element.spriteAsset', newId);
                                obj.history.enabled = history;
                            }
                        }
                    });
                }
            }
        }

    };

    AssetReplace.prototype.replaceScriptAttributes = function () {
        // entity.components.script
        for (var i = 0; i < this.entities.length; i++) {
            var obj = this.entities[i];

            // script
            var scripts = obj.get('components.script.scripts');
            if (scripts) {
                for (var script in scripts) {
                    var assetScript = editor.call('assets:scripts:assetByScript', script);
                    if (!assetScript)
                        continue;

                    var assetScripts = assetScript.get('data.scripts');
                    if (!assetScripts || !assetScripts[script] || !assetScripts[script].attributes)
                        continue;

                    var attributes = assetScripts[script].attributes;

                    for (var attrName in scripts[script].attributes) {
                        if (!attributes[attrName] || attributes[attrName].type !== 'asset')
                            continue;

                        if (attributes[attrName].array) {
                            var attrArray = scripts[script].attributes[attrName];
                            for (var j = 0; j < attrArray.length; j++) {
                                if (attrArray[j] !== this.oldId) continue;
                                this.set(obj, 'components.script.scripts.' + script + '.attributes.' + attrName + '.' + j);
                            }
                        } else {
                            if (scripts[script].attributes[attrName] !== this.oldId)
                                continue;

                            this.set(obj, 'components.script.scripts.' + script + '.attributes.' + attrName);
                        }
                    }
                }
            }
        }
    };

    AssetReplace.prototype.saveChanges = function () {
        var records = this.records;
        if (! records.length) return;

        var asset = this.asset;
        var oldId = this.oldId;
        var newId = this.newId;

        editor.call('history:add', {
            name: 'asset replace',
            undo: function () {
                for (var i = 0; i < records.length; i++) {
                    var obj = records[i].get();
                    if (!obj || !obj.has(records[i].path))
                        continue;

                    var history = asset.history.enabled;
                    obj.history.enabled = false;

                    obj.set(records[i].path, oldId);

                    // if we changed data.mapping also change meta.userMapping
                    if (/^data.mapping/.test(records[i].path)) {
                        if (obj.has('meta.userMapping')) {
                            var parts = records[i].path.split('.');
                            obj.unset('meta.userMapping.' + parts[2], true);
                            if (Object.keys(obj.get('meta.userMapping')).length === 0)
                                obj.unset('meta.userMapping');
                        }
                    }

                    obj.history.enabled = history;
                }
            },
            redo: function () {
                for (var i = 0; i < records.length; i++) {
                    var obj = records[i].get();
                    if (!obj || !obj.has(records[i].path))
                        continue;

                    var history = asset.history.enabled;
                    obj.history.enabled = false;
                    obj.set(records[i].path, newId);

                    // if we changed data.mapping also change meta.userMapping
                    if (/^data.mapping/.test(records[i].path)) {
                        if (!obj.get('meta')) {
                            obj.set('meta', {
                                userMapping: {}
                            });
                        } else {
                            if (!obj.has('meta.userMapping'))
                                obj.set('meta.userMapping', {});
                        }


                        var parts = records[i].path.split('.');
                        obj.set('meta.userMapping.' + parts[2], true);
                    }

                    obj.history.enabled = history;
                }
            }
        });
    };

    /**
     * Replaces the asset in all assets and components that it's referenced
     */
    AssetReplace.prototype.replace = function () {
        switch (this.asset.get('type')) {
            case 'animation':
                this.handleAnimation();
                break;
            case 'audio':
                this.handleAudio();
                break;
            case 'cubemap':
                this.handleCubemap();
                break;
            case 'material':
                this.handleMaterial();
                break;
            case 'model':
                this.handleModel();
                break;
            case 'sprite':
                this.handleSprite();
                break;
            case 'texture':
                this.handleTexture();
                break;
            case 'textureatlas':
                this.handleTextureAtlas();
                break;
        }

        this.replaceScriptAttributes();
        this.saveChanges();
    };

    // Special-case where we want to replace textures with sprites
    // This will only work on Element components and will replace a texture asset with sprite asset
    // It is not available generally only behind a user flag
    AssetReplace.prototype.replaceTextureToSprite = function () {
        var srcType = this.asset.get('type');
        var dstType = this.replacement.get('type');

        if (srcType !== 'texture' || dstType !== 'sprite') {
            console.error('replaceTextureToSprite must take texture and replace with sprite');
        }

        this.handleTextureToSprite();
        this.saveChanges();
    };

    editor.method('assets:replace', function (asset, replacement) {
        new AssetReplace(asset, replacement).replace();
    });

    editor.method('assets:replaceTextureToSprite', function (asset, replacement) {
        new AssetReplace(asset, replacement).replaceTextureToSprite();
    });

});


/* editor/assets/assets-rename.js */
editor.once('load', function() {
    'use strict';

    var changeName = function (assetId, assetName) {
        // var form = new FormData();
        // form.append('name', assetName);
        // form.append('branchId', config.self.branch.id);
        // Ajax({
        //     url: '{{url.api}}/assets/' + assetId,
        //     auth: true,
        //     data: form,
        //     method: 'PUT',
        //     ignoreContentType: true,
        //     notJson: true
        // }).on('error', function (err, data) {
        //     console.error(err + data);
        //     editor.call('status:error', 'Couldn\'t update the name: ' + data);
        // });

        var FS = editor.call("FS:offline-system");
        FS.rename(config.project.id,assetId,assetName).then(_ => {
            var ops = {od:null,oi:assetName,p: ["name"]};
            editor.emit('realtime:op:assets',ops , assetId);
        });

    }

    editor.method('assets:rename', function (asset, newName) {
        var oldName = asset.get('name');
        var id = asset.get('id');
        editor.call('history:add', {
            name: 'asset rename',
            undo: function() {
                if(editor.call('assets:get', id)) {
                    changeName(id, oldName);
                }
            },
            redo: function() {
                if(editor.call('assets:get', id)) {
                    changeName(id, newName);
                }
            }
        });

        changeName(id, newName);
    });
});


/* editor/assets/assets-rename-select.js */
editor.once('load', function() {
    'use strict';

    var onRename = function() {
        if (! editor.call('permissions:write'))
            return;

        var type = editor.call('selector:type');
        if (type !== 'asset')
            return;

        var items = editor.call('selector:items');
        if (items.length !== 1)
            return;

        var root = editor.call('attributes.rootPanel');
        if (! root)
            return;

        var input = root.dom.querySelector('.ui-text-field.asset-name');

        if (! input || ! input.ui)
            return;

        input.ui.flash();
        input.ui.elementInput.select();
    };

    editor.method('assets:rename-select', onRename);

    editor.call('hotkey:register', 'assets:rename-select', {
        key: 'n',
        callback: onRename
    });

    editor.call('hotkey:register', 'assets:rename-select:f2', {
        key: 'f2',
        callback: onRename
    });
});


/* editor/assets/assets-history.js */
editor.once('load', function() {
    'use strict';

    editor.on('assets:add', function(asset) {
        if (asset.history)
            return;

        var id = asset.get('id');

        asset.history = new ObserverHistory({
            item: asset,
            prefix: 'asset.' + id + '.',
            history: editor.call('editor:history')
        });
    });
});


/* editor/assets/assets-migrate.js */
editor.once('load', function() {
    'use strict';

    var migrateAsset = function(asset) {
        asset.history.enabled = false;

        if (asset.get('type') === 'material' && asset.get('data')) {
            if (! asset.has('data.useFog'))
                asset.set('data.useFog', true);

            if (! asset.has('data.useLighting'))
                asset.set('data.useLighting', true);

            if (! asset.has('data.useSkybox'))
                asset.set('data.useSkybox', true);

            if (! asset.has('data.useGammaTonemap'))
                asset.set('data.useGammaTonemap', true);

            if (! asset.get('data.cubeMapProjectionBox'))
                asset.set('data.cubeMapProjectionBox', { center: [ 0, 0, 0 ], halfExtents: [ 0.5, 0.5, 0.5 ] });

            if (! asset.has('data.alphaToCoverage'))
                asset.set('data.alphaToCoverage', false);
        }

        if ((asset.get('type') === 'texture' || asset.get('type') === 'textureatlas') && ! asset.get('source')) {
            if (asset.get('meta')) {
                if (! asset.has('meta.compress')) {
                    var alpha = asset.get('meta.alpha') || (asset.get('meta.type').toLowerCase() || '') === 'truecoloralpha' || false;

                    asset.set('meta.compress', {
                        alpha: alpha,
                        normals: false,
                        dxt: false,
                        pvr: false,
                        pvrBpp: 4,
                        etc1: false,
                        etc2: false,
                        basis: false,
                        quality: 128
                    });
                } else {
                    if (! asset.has('meta.compress.normals'))
                        asset.set('meta.compress.normals', false);

                    if (! asset.has('meta.compress.pvr'))
                        asset.set('meta.compress.pvr', false);

                    if (! asset.has('meta.compress.pvrBpp'))
                        asset.set('meta.compress.pvrBpp', 4);

                    if (! asset.has('meta.compress.etc1'))
                        asset.set('meta.compress.etc1', false);

                    if (! asset.has('meta.compress.etc2'))
                        asset.set('meta.compress.etc2', false);

                    if (! asset.has('meta.compress.basis'))
                        asset.set('meta.compress.basis', false);

                    if (! asset.has('meta.compress.quality'))
                        asset.set('meta.compress.quality', 128);
                }
            }
            if (asset.get('data')) {
                if (! asset.has('data.mipmaps'))
                    asset.set('data.mipmaps', true);
            }
        }

        if (asset.get('type') === 'font' && !asset.get('source')) {
            if (asset.get('data') && !asset.has('data.intensity')) {
                asset.set('data.intensity', 0.0);
            }
        }

        if (!asset.has('i18n')) {
            asset.set('i18n', {});
        }

        if (asset.get('type') === 'script') {

            if (asset.get('data') && !asset.has('data.loadingType')) {
                asset.set('data.loadingType', LOAD_SCRIPT_AS_ASSET);
            }
        }

        asset.history.enabled = true;
    };

    editor.on('assets:add', migrateAsset);
    editor.call('assets:list').forEach(migrateAsset);
});


/* editor/assets/assets-create-folder.js */
editor.once('load', function() {
    'use strict';

    editor.method('assets:create:folder', function (args) {
        
        if (! editor.call('permissions:write'))
            return;

        args = args || { };

        var asset = {
            name: 'New Folder',
            type: 'folder',
            source: true,
            preload: false,
            data: null,
            parent: (args.parent !== undefined) ? args.parent : editor.call('assets:panel:currentFolder'),
            scope: {
                type: 'project',
                id: config.project.id
            }
        };

        editor.call('assets:create', asset);
    });
});


/* editor/assets/assets-cubemap-prefiltering.js */
editor.once('load', function () {

    var app = null;

    editor.once('viewport:load', function() {
        app = editor.call('viewport:app');
    });

    // var device = editor.call('preview:device');
    // var assets = editor.call('preview:assetRegistry');

    var getTextureAssets = function (assetCubeMap) {
        var result = [];
        var textures = assetCubeMap.get('data.textures');
        for (var i = 0; i < textures.length; i++) {
            var id = textures[i];
            if (id) {
                var texture = editor.call('assets:get', id);
                if (!texture) {
                    return null;
                }

                result.push(texture);
            } else {
                return null;
            }
        }

        return result;
    };

    var prefilterHdrCubemap = function (assetCubeMap, cubemap, callback) {
        if (! app) {
            // webgl not available
            callback(new Error('webgl not available'));
            return;
        }

        try {
            var textureAssets = getTextureAssets(assetCubeMap);
            if (textureAssets) {
                var l = textureAssets.length;
                var count = l;
                var textures = [];

                var onLoad = function () {
                    editor.call('status:job', 'prefilter');

                    cubemap = new pc.Texture(app.graphicsDevice, {
                        cubemap: true,
                        rgbm: false,
                        fixCubemapSeams: true,
                        format: textures[0].format,
                        width: textures[0].width,
                        height: textures[0].height
                    });

                    cubemap.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
                    cubemap.addressV = pc.ADDRESS_CLAMP_TO_EDGE;

                    cubemap._levels[0] = [ textures[0]._levels[0],
                                           textures[1]._levels[0],
                                           textures[2]._levels[0],
                                           textures[3]._levels[0],
                                           textures[4]._levels[0],
                                           textures[5]._levels[0] ];

                    // prefilter cubemap
                    var options = {
                        device: app.graphicsDevice,
                        sourceCubemap: cubemap,
                        method: 1,
                        samples: 4096,
                        cpuSync: true,
                        filteredFixed: [],
                        filteredFixedRgbm: [],
                        singleFilteredFixedRgbm: true
                    };

                    pc.prefilterCubemap(options);

                    // get dds and create blob
                    var dds = options.singleFilteredFixedRgbm.getDds();
                    var blob = new Blob([dds], {type: 'image/dds'});

                    // upload blob as dds
                    editor.call('assets:uploadFile', {
                        file: blob,
                        name: assetCubeMap.get('name') + '.dds',
                        asset: assetCubeMap,
                        type: 'cubemap'
                    }, function (err, data) {
                        if (!err) {
                            callback();
                        } else {
                            editor.call('status:job', 'prefilter');
                            callback(err);
                        }
                    });
                };

                textureAssets.forEach(function (asset, index) {
                    editor.call('status:job', 'prefilter', index);

                    // when prefiltering we load a dds file that the pipeline put next to the png as well as the dds file
                    // as far as I know, this isn't referenced anywhere else and is only used here to generate the cubemap
                    // but honestly, who knows it could be used elsewhere too.
                    var url = swapExtension(asset.get('file.url'), '.png', '.dds');

                    app.assets._loader.load(url, "texture", function (err, resource) {
                        if (!err) {
                            textures[index] = resource;
                        } else {
                            console.warn(err);
                        }

                        count--;
                        if (count === 0) {
                            onLoad();
                        }
                    });
                });
            }
        } catch (ex) {
            callback(ex);
        }
    };

    var prefilterCubemap = function (assetCubeMap, cubemap, callback) {
        if (! app) {
            // webgl not available
            callback(new Error('webgl not available'));
            return;
        }

        try {
            var count = 0;
            var textures = [ ];
            var texturesAssets = [ ];
            var textureIds = assetCubeMap.get('data.textures');

            for(var i = 0; i < 6; i++) {
                // missing texture
                if (! textureIds[i])
                    return;

                texturesAssets[i] = editor.call('assets:get', textureIds[i]);

                // texture is not in registry
                if (! texturesAssets[i])
                    return;
            }

            var texturesReady = function() {
                editor.call('status:job', 'prefilter');

                var options = {
                    device: app.graphicsDevice,
                    sourceCubemap: cubemap,
                    method: 1,
                    samples: 4096,
                    cpuSync: true,
                    filteredFixed: [ ],
                    singleFilteredFixed: true
                };

                pc.prefilterCubemap(options);

                var dds = options.singleFilteredFixed.getDds();
                var blob = new Blob([ dds ], { type: 'image/dds' });

                // upload blob as dds
                editor.call('assets:uploadFile', {
                    file: blob,
                    name: assetCubeMap.get('name') + '.dds',
                    asset: assetCubeMap,
                    type: 'cubemap'
                }, function (err, data) {
                    if (callback)
                        callback(null);
                });
            };

            var textureLoad = function(ind, url) {
                editor.call('status:job', 'prefilter', ind);

                app.assets._loader.load(url, 'texture', function (err, resource) {
                    if (err)
                        console.warn(err);

                    textures[ind] = resource;

                    count++;
                    if (count === 6)
                        texturesReady();
                });
            };

            for(var i = 0; i < 6; i++)
                textureLoad(i, texturesAssets[i].get('file.url'))
        } catch (ex) {
            if (callback)
                callback(ex);
        }
    };

    editor.method('assets:cubemaps:prefilter', function (assetCubeMap, callback) {
        if (! app) {
            // webgl not available
            callback(new Error('webgl not available'));
            return;
        }

        var asset = app.assets.get(assetCubeMap.get('id'));
        if (! asset)
            return;

        var cubemap;
        var onLoad = function() {
            if (app.graphicsDevice.textureFloatRenderable && cubemap.rgbm) {
                prefilterHdrCubemap(assetCubeMap, cubemap, callback);
            } else {
                prefilterCubemap(assetCubeMap, cubemap, callback);
            }
        };

        if (asset.resource) {
            cubemap = asset.resource;
            onLoad();
        } else {
            asset.once('load', function(asset) {
                cubemap = asset.resource;
                onLoad();
            });
            app.assets.load(asset);
        }
    });

    // invalidate prefiltering data on cubemaps
    // when one of face textures file is changed
    editor.on('assets:add', function(asset) {
        if (asset.get('type') !== 'cubemap')
            return;

        asset._textures = [ ];

        var invalidate = function() {
            if (! asset.get('file'))
                return;

            // TODO: do not set the file here but use the asset server
            asset.set('file', null);
        };

        var watchTexture = function(ind, id) {
            if (asset._textures[ind])
                asset._textures[ind].unbind();

            asset._textures[ind] = null;

            if (! id)
                return;

            var texture = editor.call('assets:get', id);
            if (texture)
                asset._textures[ind] = texture.on('file.hash:set', invalidate);
        };

        var watchFace = function(ind) {
            // update watching on face change
            asset.on('data.textures.' + ind + ':set', function(id) {
                watchTexture(ind, id);
            });
            // start watching
            watchTexture(ind, asset.get('data.textures.' + ind));
        };

        for(var i = 0; i < 6; i++)
            watchFace(i);
    });
});


/* editor/assets/assets-create-bundle.js */
editor.once('load', function() {
    'use strict';

    editor.method('assets:create:bundle', function (args) {
        if (! editor.call('permissions:write'))
            return;

        args = args || { };

        var asset = {
            name: 'New Bundle',
            type: 'bundle',
            source: false,
            preload: true,
            data: {
                assets: []
            },
            parent: (args.parent !== undefined) ? args.parent : editor.call('assets:panel:currentFolder'),
            scope: {
                type: 'project',
                id: config.project.id
            }
        };

        editor.call('assets:create', asset);
    });
});


/* editor/assets/assets-create-material.js */
editor.once('load', function() {
    'use strict';

    editor.method('assets:create:material', function (args) {
        if (! editor.call('permissions:write'))
            return;

        args = args || { };

        var data = editor.call('schema:material:getDefaultData');

        var asset = {
            name: 'New Material',
            type: 'material',
            source: false,
            preload: true,
            data: data,
            parent: (args.parent !== undefined) ? args.parent : editor.call('assets:panel:currentFolder'),
            scope: {
                type: 'project',
                id: config.project.id
            }
        };

        editor.call('assets:create', asset);
    });
});


/* editor/assets/assets-create-cubemap.js */
editor.once('load', function() {
    'use strict';

    editor.method('assets:create:cubemap', function (args) {
        if (! editor.call('permissions:write'))
            return;

        args = args || { };

        var asset = {
            name: 'New Cubemap',
            type: 'cubemap',
            source: false,
            preload: true,
            parent: (args.parent !== undefined) ? args.parent : editor.call('assets:panel:currentFolder'),
            data: {
                name: 'New Cubemap',
                textures: [ null, null, null, null, null, null ],
                minFilter: 5, // linear mipmap linear
                magFilter: 1, // linear
                anisotropy: 1
            },
            scope: {
                type: 'project',
                id: config.project.id
            }
        };

        editor.call('assets:create', asset);
    });
});


/* editor/assets/assets-create-html.js */
editor.once('load', function() {
    'use strict';

    editor.method('assets:create:html', function (args) {
        if (! editor.call('permissions:write'))
            return;

        args = args || { };

        var asset = {
            name: 'New Html',
            type: 'html',
            source: false,
            preload: true,
            parent: (args.parent !== undefined) ? args.parent : editor.call('assets:panel:currentFolder'),
            filename: 'asset.html',
            file: new Blob([ '\n' ], { type: 'text/html' }),
            scope: {
                type: 'project',
                id: config.project.id
            }
        };

        editor.call('assets:create', asset);
    });
});


/* editor/assets/assets-create-css.js */
editor.once('load', function() {
    'use strict';

    editor.method('assets:create:css', function (args) {

        if (! editor.call('permissions:write'))
            return;

        args = args || { };

        var asset = {
            name: 'New Css',
            type: 'css',
            source: false,
            preload: true,
            parent: (args.parent !== undefined) ? args.parent : editor.call('assets:panel:currentFolder'),
            filename: 'asset.css',
            file: new Blob([ '\n' ], { type: 'text/css' }),
            scope: {
                type: 'project',
                id: config.project.id
            }
        };

        editor.call('assets:create', asset);
    });
});


/* editor/assets/assets-create-json.js */
editor.once('load', function() {
    'use strict';

    editor.method('assets:create:json', function (args) {
        if (! editor.call('permissions:write'))
            return;

        args = args || { };

        var asset = {
            name: 'New Json',
            type: 'json',
            source: false,
            preload: true,
            parent: (args.parent !== undefined) ? args.parent : editor.call('assets:panel:currentFolder'),
            filename: 'asset.json',
            file: new Blob([ '{ }' ], { type: 'application/json' }),
            scope: {
                type: 'project',
                id: config.project.id
            }
        };

        editor.call('assets:create', asset);
    });
});



        /* editor/assets/assets-create-animation.js */



/* editor/assets/assets-create-text.js */
editor.once('load', function() {
    'use strict';

    editor.method('assets:create:text', function (args) {
        if (! editor.call('permissions:write'))
            return;

        args = args || { };

        var asset = {
            name: 'New Text',
            type: 'text',
            source: false,
            preload: true,
            parent: (args.parent !== undefined) ? args.parent : editor.call('assets:panel:currentFolder'),
            filename: 'asset.txt',
            file: new Blob([ '\n' ], { type: 'text/plain' }),
            scope: {
                type: 'project',
                id: config.project.id
            }
        };

        editor.call('assets:create', asset);
    });
});


/* editor/assets/assets-create-script.js */
editor.once('load', function() {
    'use strict';

    var scriptBoilerplate = "var {className} = pc2d.createScript('{scriptName}');\n\n// initialize code called once per entity\n{className}.prototype.initialize = function() {\n    \n};\n\n// update code called every frame\n{className}.prototype.update = function(dt) {\n    \n};\n\n// swap method called for script hot-reloading\n// inherit your script state here\n// {className}.prototype.swap = function(old) { };\n\n";
    var filenameValid = /^([^0-9.#<>$+%!`&='{}@\\/:*?"<>|\n])([^#<>$+%!`&='{}@\\/:*?"<>|\n])*$/i;



    var CubeBoilerplate = `export default {
        data : {
        },
        sayHi(){
          console.log('Hello developer!')
        },
        onLoad(){
          /*cube 被加载之后 */
        },
        onShow(){
          /*cube 展示之后，会被多次调用 */
        },
        onReady(){
          /*cube 被添加到页面之后 */
          this.request({
            api:'time',
            success : data => {
              this.setData({time : new Date(data).toTimeString()});
            },
            fail(){
              console.log('失败')
            }
          })
        },
        onHide(){
          /*cube 被隐藏，会被多次调用 */
        },
        onCollapse(){
          /*cube 被收起，会被多次调用 */
        },
        onExpand(){
          /*cube 被展开，会被多次调用 */
        },
        onUnload(){
          /*cube 被删除 */
        },
        onError(){
          /*cube 无法进入ready状态 */
        }
      }`

    editor.method('assets:create:script', function (args) {

        if (! editor.call('permissions:write'))
            return;

        args = args || { };

        var filename = args.filename || 'script.js';

        if (args.boilerplate) {
            var name = filename.slice(0, -3);
            var className = args.className || '';
            var scriptName = args.scriptName || '';

            if (! className || ! scriptName) {
                // tokenize filename
                var tokens = [ ];
                var string = name.replace(/([^A-Z])([A-Z][^A-Z])/g, '$1 $2').replace(/([A-Z0-9]{2,})/g, ' $1');
                var parts = string.split(/(\s|\-|_|\.)/g);

                // filter valid tokens
                for(var i = 0; i < parts.length; i++) {
                    parts[i] = parts[i].toLowerCase().trim();
                    if (parts[i] && parts[i] !== '-' && parts[i] !== '_' && parts[i] !== '.')
                        tokens.push(parts[i]);
                }

                if (tokens.length) {
                    if (! scriptName) {
                        scriptName = tokens[0];

                        for(var i = 1; i < tokens.length; i++) {
                            scriptName += tokens[i].charAt(0).toUpperCase() + tokens[i].slice(1);
                        }
                    }

                    if (! className) {
                        for(var i = 0; i < tokens.length; i++) {
                            className += tokens[i].charAt(0).toUpperCase() + tokens[i].slice(1);
                        }
                    }
                } else {
                    if (! className)
                        className = 'Script';

                    if (! scriptName)
                        scriptName = 'script';
                }
            }

            if (! filenameValid.test(className))
                className = 'Script';


                
            if(config.project.type === "cube" && scriptName === "cube"){
                args.content =  CubeBoilerplate.replace(/\{className\}/g, className).replace(/\{scriptName\}/g, scriptName);
            }else{
                args.content =  scriptBoilerplate.replace(/\{className\}/g, className).replace(/\{scriptName\}/g, scriptName);
            }
             

            
        }

        var asset = {
            name: filename,
            type: 'script',
            source: false,
            preload: true,
            parent: (args.parent !== undefined) ? args.parent : editor.call('assets:panel:currentFolder'),
            filename: filename,
            file: new Blob([ args.content || '' ], { type: 'text/javascript' }),
            data: {
                scripts: { },
                loading: false,
                loadingType: LOAD_SCRIPT_AS_ASSET
            },
            scope: {
                type: 'project',
                id: config.project.id
            }
        };

        editor.call('assets:create', asset, function(err, assetId) {
            if (err) return;

            var onceAssetLoad = function(asset) {
                var url = asset.get('file.url');
                if (url) {
                    onParse(asset);
                } else {
                    asset.once('file.url:set', function() {
                        onParse(asset)
                    });
                }
            };

            var onParse = function(asset) {
                editor.call('scripts:parse', asset, function(err, result) {
                    if (args.callback)
                        args.callback(err, asset, result);
                });
            };

            var asset = editor.call('assets:get', assetId);
            if (asset) {
                onceAssetLoad(asset);
            } else {
                editor.once('assets:add[' + assetId + ']', onceAssetLoad);
            }
        }, args.noSelect);
    });
});


/* editor/assets/assets-create-shader.js */
editor.once('load', function() {
    'use strict';

    editor.method('assets:create:shader', function (args) {
        if (! editor.call('permissions:write'))
            return;

        args = args || { };

        var asset = {
            name: 'New Shader',
            type: 'shader',
            source: false,
            preload: true,
            parent: (args.parent !== undefined) ? args.parent : editor.call('assets:panel:currentFolder'),
            filename: 'asset.glsl',
            file: new Blob([ '\n' ], { type: 'text/x-glsl' }),
            scope: {
                type: 'project',
                id: config.project.id
            }
        };

        editor.call('assets:create', asset);
    });
});


/* editor/assets/assets-create-sprite.js */
editor.once('load', function() {
    'use strict';

    editor.method('assets:create:sprite', function (args) {
        if (! editor.call('permissions:write'))
            return;

        args = args || { };

        var data = {
            pixelsPerUnit: args.pixelsPerUnit !== undefined ? args.pixelsPerUnit : 100,
            frameKeys: args.frameKeys !== undefined ? args.frameKeys.map(val => val.toString()) : [],
            textureAtlasAsset: args.textureAtlasAsset !== undefined ? args.textureAtlasAsset : null,
            renderMode: args.renderMode !== undefined ? args.renderMode : 0
        };

        var asset = {
            name: args.name !== undefined ? args.name : 'New Sprite',
            type: 'sprite',
            source: false,
            preload: true,
            data: data,
            parent: (args.parent !== undefined) ? args.parent : editor.call('assets:panel:currentFolder'),
            scope: {
                type: 'project',
                id: config.project.id
            }
        };

        editor.call('assets:create', asset, args.fn, args.noSelect);
    });
});


/* editor/assets/assets-create-i18n.js */
editor.once('load', function () {
    'use strict';

    var content = JSON.stringify({
        "header": {
            "version": 1
        },
        "data": [{
            "info": {
                "locale": "en-US"
            },
            "messages": {
                "key": "Single key translation",
                "key plural": ["One key translation", "Translation for {number} keys"]
            }
        }]
    }, null, 4);

    editor.method('assets:create:i18n', function (args) {
        if (! editor.call('permissions:write'))
            return;

        args = args || { };

        var filename = 'Localization.json';

        var asset = {
            name: filename,
            type: 'json',
            source: false,
            preload: true,
            parent: editor.call('assets:panel:currentFolder'),
            filename: filename,
            file: new Blob([content], { type: 'application/json' }),
            scope: {
                type: 'project',
                id: config.project.id
            }
        };

        editor.call('assets:create', asset);
    });
});


/* editor/assets/assets-create-template.js */
editor.once('load', function () {
    'use strict';

    editor.method('assets:create:template', function (root) {
        if (! editor.call('permissions:write')) {
            return;
        }

        const parent = editor.call('assets:panel:currentFolder');

        const sceneEnts = editor.call('template:utils', 'getAllEntitiesInSubtree', root, []);

        const data = editor.call('template:newTemplateData', root, sceneEnts);

        const asset = {
            name: root.get('name') + ".template",
            type: 'template',
            source: false,
            preload: true,
            parent: parent,
            data:  data.assetData,
            scope: {
                type: 'project',
                id: config.project.id
            }
        };

        editor.call('assets:create', asset, function (err, assetId) {
            if (err) {
                return editor.call('status:error', err);
            }

            const onAssetCreated = () => {
                const history = root.history.enabled;
                root.history.enabled = false;
                root.set('template_id', assetId);
                root.set('template_ent_ids', data.srcToDst);
                root.history.enabled = history;
            }

            // check if asset exists first because of initial race condition
            // if it doesn't exist wait for it before setting template_id because
            // that will propagate other events which will fail if the asset is not there yet
            if (!editor.call('assets:get', assetId)) {
                editor.once(`assets:add[${assetId}]`, onAssetCreated);
            } else {
                onAssetCreated();
            }
        });
    });
});


/* editor/assets/assets-unwrap.js */
editor.once('load', function() {
    'use strict';

    var unwrapping = { };

    editor.method('assets:model:unwrap', function(asset, args, fn) {
        if (asset.get('type') !== 'model' || ! asset.has('file.filename') || unwrapping[asset.get('id')])
            return;

        if (typeof(args) === 'function')
            fn = args;

        if (typeof(args) !== 'object')
            args = { };

        args = args || { };

        var filename = asset.get('file.filename');
        var worker = new Worker('/editor/scene/js/editor/assets/assets-unwrap-worker.js');
        worker.asset = asset;
        worker.progress = 0;

        unwrapping[asset.get('id')] = worker;

        worker.onmessage = function(evt) {
            if (! evt.data.name)
                return;

            switch(evt.data.name) {
                case 'finish':
                    var data = evt.data.data;

                    // save area
                    asset.set('data.area', evt.data.area);

                    var blob = new Blob([
                        JSON.stringify(data)
                    ], {
                        type: 'application/json'
                    });

                    // upload blob as dds
                    editor.call('assets:uploadFile', {
                        file: blob,
                        name: filename,
                        asset: asset,
                        type: 'model'
                    }, function (err, data) {
                        // remove from unwrapping list
                        delete unwrapping[asset.get('id')];
                        // render
                        editor.call('viewport:render');
                        // callback
                        if (fn) fn(err, asset);
                        // emit global event
                        editor.emit('assets:model:unwrap', asset);
                    });
                    break;

                case 'progress':
                    worker.progress = evt.data.progress;
                    editor.emit('assets:model:unwrap:progress:' + asset.get('id'), evt.data.progress);
                    editor.emit('assets:model:unwrap:progress', asset, evt.data.progress);
                    break;
            }
        };

        worker.onerror = function(err) {
            if (fn) fn(err);
            // remove from unwrapping list
            delete unwrapping[asset.get('id')];
        };

        worker.postMessage({
            name: 'start',
            id: asset.get('id'),
            filename: filename,
            padding: args.padding || 2.0
        });
    });


    editor.method('assets:model:unwrap:cancel', function(asset) {
        var worker = unwrapping[asset.get('id')];
        if (! worker)
            return;

        worker.terminate();
        delete unwrapping[asset.get('id')];
    });


    editor.method('assets:model:unwrapping', function(asset) {
        if (asset) {
            return unwrapping[asset.get('id')] || null;
        } else {
            var list = [ ];
            for(var key in unwrapping) {
                if (! unwrapping.hasOwnProperty(key))
                    continue;

                list.push(unwrapping[key]);
            }
            return list.length ? list : null;
        }
    });


    editor.method('assets:model:area', function(asset, fn) {
        if (asset.get('type') !== 'model' || ! asset.has('file.filename'))
            return;

        var filename = asset.get('file.filename');
        var worker = new Worker('/editor/scene/js/editor/assets/assets-unwrap-worker.js');

        worker.onmessage = function(evt) {
            if (evt.data.name && evt.data.name === 'finish') {
                // save area
                asset.set('data.area', evt.data.area || null);
                // callback
                if (fn) fn(null, asset, evt.data.area || null);
            }
        };

        worker.onerror = function(err) {
            if (fn) fn(err);
        };

        worker.postMessage({
            name: 'area',
            id: asset.get('id'),
            filename: filename
        });
    });
});


/* editor/assets/assets-used.js */
editor.once('load', function () {
    'use strict';

    var legacyScripts = editor.call('settings:project').get('useLegacyScripts');
    var index = {};
    var keys = {
        'cubemap': {
            'data.textures.0': true,
            'data.textures.1': true,
            'data.textures.2': true,
            'data.textures.3': true,
            'data.textures.4': true,
            'data.textures.5': true
        },
        'material': {
            'data.aoMap': true,
            'data.diffuseMap': true,
            'data.specularMap': true,
            'data.metalnessMap': true,
            'data.glossMap': true,
            'data.emissiveMap': true,
            'data.opacityMap': true,
            'data.normalMap': true,
            'data.heightMap': true,
            'data.sphereMap': true,
            'data.cubeMap': true,
            'data.lightMap': true
        },
        'sprite': {
            'data.textureAtlasAsset': true
        },
        'model': {},
        'entity': {
            'components.model.materialAsset': true,
            'components.model.asset': true,
            'components.collision.asset': true,
            'components.particlesystem.colorMapAsset': true,
            'components.particlesystem.normalMapAsset': true,
            'components.particlesystem.mesh': true,
            'components.element.textureAsset': true,
            'components.element.spriteAsset': true,
            'components.element.materialAsset': true,
            'components.element.fontAsset': true,
            'components.light.cookieAsset': true,
            'components.sprite.spriteAsset': true
        },
        'entity-lists': {
            'components.animation.assets': true,
            'components.audiosource.assets': true,
            // 'components.script.scripts': true
        }
    };
    var updateAsset = function (referer, type, oldId, newId) {
        if (oldId && index[oldId] !== undefined) {
            index[oldId].count--;

            if (index[oldId].ref[referer]) {
                if (editor.call('assets:used:get', referer)) {
                    index[oldId].parent--;
                    if (index[oldId].count !== 0 && index[oldId].parent === 0)
                        editor.emit('assets:used:' + oldId, false);
                }

                index[oldId].ref[referer][0].unbind();
                if (index[oldId].ref[referer][1])
                    index[oldId].ref[referer][1].unbind();

                delete index[oldId].ref[referer];
            }

            if (index[oldId].count === 0)
                editor.emit('assets:used:' + oldId, false);
        }

        if (newId) {
            if (index[newId] === undefined) {
                index[newId] = {
                    count: 0,
                    parent: 0,
                    ref: {}
                };
            }

            index[newId].count++;

            if (!index[newId].ref[referer]) {
                index[newId].ref[referer] = [];
                index[newId].ref[referer].type = type;

                index[newId].ref[referer][0] = editor.on('assets:used:' + referer, function (state) {
                    if (!index[newId])
                        return;

                    index[newId].parent += state * 2 - 1;

                    if (index[newId].parent === 0) {
                        // now not used
                        editor.emit('assets:used:' + newId, false);
                    } else if (index[newId].parent === 1) {
                        // now used
                        editor.emit('assets:used:' + newId, true);
                    }
                });

                // referer can be destroyed
                var itemType = 'asset';
                var item = editor.call('assets:get', referer);
                if (!item) {
                    item = editor.call('entities:get', referer);
                    itemType = 'entity';
                }

                if (item) {
                    index[newId].ref[referer][1] = item.once('destroy', function () {
                        updateAsset(referer, itemType, newId);
                    });
                }

                if (editor.call('assets:used:get', referer)) {
                    index[newId].parent++;

                    if (index[newId].count !== 1 && index[newId].parent === 1)
                        editor.emit('assets:used:' + newId, true);
                }
            }

            if (index[newId].count === 1 && index[newId].parent)
                editor.emit('assets:used:' + newId, true);
        }
    };
    var onSetMethods = {
        'cubemap': function (path, value, valueOld) {
            if (!keys['cubemap'][path])
                return;

            updateAsset(this.get('id'), 'asset', valueOld, value);
        },
        'material': function (path, value, valueOld) {
            if (!keys['material'][path])
                return;

            updateAsset(this.get('id'), 'asset', valueOld, value);
        },
        'model': function (path, value, valueOld) {
            if (path.startsWith('data.mapping.') && path.slice(-8) === 'material')
                updateAsset(this.get('id'), 'asset', valueOld, value);

            if (!keys['model'][path])
                return;

            updateAsset(this.get('id'), 'asset', valueOld, value);
        },
        'model-insert': function (path, value) {
            if (!path.startsWith('data.mapping.'))
                return;

            updateAsset(this.get('id'), 'asset', null, value);
        },
        'model-remove': function (path, value) {
            if (!path.startsWith('data.mapping.'))
                return;

            updateAsset(this.get('id'), 'asset', value);
        },
        'sprite': function (path, value, valueOld) {
            if (!keys['sprite'][path])
                return;

            updateAsset(this.get('id'), 'asset', valueOld, value);
        },
        'entity': function (path, value, valueOld) {
            if (path.startsWith('components.animation.assets.')) {
                var parts = path.split('.');
                if (parts.length !== 4)
                    return;
            } else if (path.startsWith('components.model.mapping.')) {
                var parts = path.split('.');
                if (parts.length !== 4)
                    return;
            } else if (path.startsWith('components.sound.slots')) {
                var parts = path.split('.');
                if (parts.length !== 5 || parts[4] !== 'asset')
                    return;
            } else if (path.startsWith('components.sprite.clips')) {
                var parts = path.split('.');
                if (parts.length !== 5 || parts[4] !== 'spriteAsset')
                    return;
            } else if (!legacyScripts && path.startsWith('components.script.scripts')) {
                var parts = path.split('.');
                if (parts.length === 6 && parts[4] === 'attributes') {
                    var primaryScript = editor.call('assets:scripts:assetByScript', parts[3]);
                    if (primaryScript) {
                        var type = primaryScript.get('data.scripts.' + parts[3] + '.attributes.' + parts[5] + '.type');
                        if (type !== 'asset')
                            return;
                    } else {
                        return;
                    }
                } else if (parts.length === 4) {
                    var primaryScript = editor.call('assets:scripts:assetByScript', parts[3]);
                    if (primaryScript) {
                        updateAsset(this.get('resource_id'), 'entity', null, primaryScript.get('id'));
                        return;
                    } else {
                        return;
                    }
                } else {
                    return;
                }
            } else if (!keys['entity'][path]) {
                return;
            }

            if (value instanceof Array) {
                for (var i = 0; i < value.length; i++) {
                    updateAsset(this.get('resource_id'), 'entity', valueOld && valueOld[i] || null, value[i]);
                }
            } else {
                updateAsset(this.get('resource_id'), 'entity', valueOld, value);
            }
        },
        'entity-unset': function (path, value) {
            if (path.startsWith('components.model.mapping.')) {
                var parts = path.split('.');
                if (parts.length !== 4)
                    return;
            } else if (path.startsWith('components.sound.slots')) {
                var parts = path.split('.');
                if (parts.length !== 5 || parts[4] !== 'asset')
                    return;
            } else if (path.startsWith('components.sprite.clips')) {
                var parts = path.split('.');
                if (parts.length !== 5 || parts[4] !== 'spriteAsset')
                    return;
            } else if (!legacyScripts && path.startsWith('components.script.scripts')) {
                var parts = path.split('.');
                if (parts.length === 6 && parts[4] === 'attributes') {
                    var primaryScript = editor.call('assets:scripts:assetByScript', parts[3]);
                    if (primaryScript) {
                        var type = primaryScript.get('data.scripts.' + parts[3] + '.attributes.' + parts[5] + '.type');
                        if (type !== 'asset')
                            return;
                    } else {
                        return;
                    }
                } else if (parts.length === 5) {
                    var primaryScript = editor.call('assets:scripts:assetByScript', parts[3]);
                    if (primaryScript) {
                        var type = primaryScript.get('data.scripts.' + parts[3] + '.attributes.' + parts[5] + '.type');
                        if (type === 'asset') {
                            if (value.attributes[parts[5]] instanceof Array) {
                                for (var i = 0; i < value.attributes[parts[5]].length; i++) {
                                    updateAsset(this.get('resource_id'), 'entity', value.attributes[parts[5]][i], null);
                                }
                            } else {
                                updateAsset(this.get('resource_id'), 'entity', value.attributes[parts[5]], null);
                            }
                        }
                    } else {
                        return;
                    }
                } else if (parts.length === 4) {
                    var primaryScript = editor.call('assets:scripts:assetByScript', parts[3]);
                    if (primaryScript) {
                        updateAsset(this.get('resource_id'), 'entity', primaryScript.get('id'), null);

                        for (var attrName in value.attributes) {
                            var type = primaryScript.get('data.scripts.' + parts[3] + '.attributes.' + attrName + '.type');
                            if (type === 'asset') {
                                if (value.attributes[attrName] instanceof Array) {
                                    for (var i = 0; i < value.attributes[attrName].length; i++) {
                                        updateAsset(this.get('resource_id'), 'entity', value.attributes[attrName][i], null);
                                    }
                                } else {
                                    updateAsset(this.get('resource_id'), 'entity', value.attributes[attrName], null);
                                }
                            }
                        }
                    }
                    return;
                } else {
                    return;
                }
            } else if (!keys['entity'][path]) {
                return;
            }

            if (value instanceof Array) {
                for (var i = 0; i < value.length; i++) {
                    updateAsset(this.get('resource_id'), 'entity', value[i], null);
                }
            } else {
                updateAsset(this.get('resource_id'), 'entity', value, null);
            }
        },
        'entity-insert': function (path, value) {
            if (legacyScripts && path.startsWith('components.script.scripts.')) {
                var parts = path.split('.');
                if (parts.length !== 7 || parts[4] !== 'attributes' || parts[6] !== 'value' || this.get(parts.slice(0, 6).join('.') + '.type') !== 'asset')
                    return;
            } else if (!legacyScripts && path.startsWith('components.script.scripts')) {
                var parts = path.split('.');
                if (parts.length === 6 && parts[4] === 'attributes') {
                    var primaryScript = editor.call('assets:scripts:assetByScript', parts[3]);
                    if (primaryScript) {
                        var type = primaryScript.get('data.scripts.' + parts[3] + '.attributes.' + parts[5] + '.type');
                        if (type !== 'asset')
                            return;
                    } else {
                        return;
                    }
                } else {
                    return;
                }
            } else if (!keys['entity-lists'][path]) {
                return;
            }

            if (value instanceof Array) {
                for (var i = 0; i < value.length; i++) {
                    updateAsset(this.get('resource_id'), 'entity', null, value[i]);
                }
            } else {
                updateAsset(this.get('resource_id'), 'entity', null, value);
            }
        },
        'entity-remove': function (path, value) {
            if (legacyScripts && path.startsWith('components.script.scripts.')) {
                var parts = path.split('.');
                if (parts.length !== 7 || parts[4] !== 'attributes' || parts[6] !== 'value' || this.get(parts.slice(0, 6).join('.') + '.type') !== 'asset')
                    return;
            } else if (!legacyScripts && path.startsWith('components.script.scripts')) {
                var parts = path.split('.');
                if (parts.length === 6 && parts[4] === 'attributes') {
                    var primaryScript = editor.call('assets:scripts:assetByScript', parts[3]);
                    if (primaryScript) {
                        var type = primaryScript.get('data.scripts.' + parts[3] + '.attributes.' + parts[5] + '.type');
                        if (type !== 'asset')
                            return;
                    } else {
                        return;
                    }
                } else {
                    return;
                }
            } else if (!keys['entity-lists'][path]) {
                return;
            }

            updateAsset(this.get('resource_id'), 'entity', value, null);
        }
    };

    editor.on('assets:scripts:primary:set', function (asset, script) {
        var entities = editor.call('entities:list:byScript', script);
        var len = entities.length;
        if (!len) {
            return;
        }

        var i;
        var itemsOrder = asset.get('data.scripts.' + script + '.attributesOrder');
        var items = asset.get('data.scripts.' + script + '.attributes');
        var attributes = [];
        for (i = 0; i < itemsOrder.length; i++) {
            if (items[itemsOrder[i]].type === 'asset')
                attributes.push(itemsOrder[i]);
        }

        for (i = 0; i < len; i++) {
            var entity = entities[i];

            updateAsset(entity.get('resource_id'), 'entity', null, asset.get('id'));

            for (var a = 0; a < attributes.length; a++) {
                var value = entity.get('components.script.scripts.' + script + '.attributes.' + attributes[a]);
                if (!value)
                    continue;

                if (value instanceof Array) {
                    for (var v = 0; v < value.length; v++) {
                        if (typeof (value[v]) === 'number') {
                            updateAsset(entity.get('resource_id'), 'entity', null, value[v]);
                        }
                    }
                } else if (typeof (value) === 'number') {
                    updateAsset(entity.get('resource_id'), 'entity', null, value);
                }
            }
        }
    });

    editor.on('assets:scripts:primary:unset', function (asset, script) {
        var entities = editor.call('entities:list:byScript', script);
        var len = entities.length;
        if (!len) {
            return;
        }

        var data = asset.get('data.scripts.' + script);
        var attributes = [];
        var i;

        if (data) {
            var itemsOrder = data.attributesOrder;
            var items = data.attributes;

            for (i = 0; i < itemsOrder.length; i++) {
                if (items[itemsOrder[i]].type === 'asset')
                    attributes.push(itemsOrder[i]);
            }
        }

        for (i = 0; i < len; i++) {
            var entity = entities[i];

            updateAsset(entity.get('resource_id'), 'entity', asset.get('id'), null);

            for (var a = 0; a < attributes.length; a++) {
                var value = entity.get('components.script.scripts.' + script + '.attributes.' + attributes[a]);
                if (!value)
                    continue;

                if (value instanceof Array) {
                    for (var v = 0; v < value.length; v++) {
                        if (typeof (value[v]) === 'number') {
                            updateAsset(entity.get('resource_id'), 'entity', value[v], null);
                        }
                    }
                } else if (typeof (value) === 'number') {
                    updateAsset(entity.get('resource_id'), 'entity', value, null);
                }
            }
        }
    });

    // assets
    editor.on('assets:add', function (asset) {
        if (asset.get('source'))
            return;

        var type = asset.get('type');

        if (type === 'folder')
            return;

        if (onSetMethods[type]) {
            asset.on('*:set', onSetMethods[type]);

            if (onSetMethods[type + '-insert'])
                asset.on('*:insert', onSetMethods[type + '-insert']);

            if (onSetMethods[type + '-remove'])
                asset.on('*:remove', onSetMethods[type + '-remove']);

            for (var key in keys[type])
                updateAsset(asset.get('id'), 'asset', null, asset.get(key));

            if (type === 'model') {
                var mapping = asset.get('data.mapping');
                if (mapping) {
                    for (var i = 0; i < mapping.length; i++)
                        updateAsset(asset.get('id'), 'asset', null, mapping[i].material);
                }
            }
        }
    });

    // entities
    editor.on('entities:add', function (entity) {
        entity.on('*:set', onSetMethods['entity']);
        entity.on('*:unset', onSetMethods['entity-unset']);
        entity.on('*:insert', onSetMethods['entity-insert']);
        entity.on('*:remove', onSetMethods['entity-remove']);

        for (var key in keys['entity'])
            updateAsset(entity.get('resource_id'), 'entity', null, entity.get(key));

        var mappings = entity.get('components.model.mapping');
        if (mappings) {
            for (var ind in mappings) {
                if (!mappings.hasOwnProperty(ind) || !mappings[ind])
                    continue;

                updateAsset(entity.get('resource_id'), 'entity', null, mappings[ind]);
            }
        }

        for (var key in keys['entity-lists']) {
            var items = entity.get(key);
            if (!items || !items.length)
                continue;

            for (var i = 0; i < items.length; i++)
                updateAsset(entity.get('resource_id'), 'entity', null, items[i]);
        }

        var slots = entity.get('components.sound.slots');
        if (slots) {
            for (var i in slots) {
                if (!slots.hasOwnProperty(i) || !slots[i].asset)
                    continue;

                updateAsset(entity.get('resource_id'), 'entity', null, slots[i].asset);
            }
        }

        var clips = entity.get('components.sprite.clips');
        if (clips) {
            for (var key in clips) {
                if (!clips.hasOwnProperty(key) || !clips[key].spriteAsset) {
                    continue;
                }

                updateAsset(entity.get('resource_id'), 'entity', null, clips[key].spriteAsset);
            }
        }

        var scripts = entity.get('components.script.scripts');

        if (scripts) {
            for (var script in scripts) {
                if (!scripts.hasOwnProperty(script))
                    continue;

                var primaryScript = editor.call('assets:scripts:assetByScript', script);
                if (primaryScript) {
                    updateAsset(entity.get('resource_id'), 'entity', null, primaryScript.get('id'));

                    var attributes = scripts[script].attributes;
                    for (var attr in attributes) {
                        if (!attributes.hasOwnProperty(attr))
                            continue;

                        var type = primaryScript.get('data.scripts.' + script + '.attributes.' + attr + '.type');
                        if (type === 'asset') {
                            var value = attributes[attr];

                            if (value instanceof Array) {
                                for (var v = 0; v < value.length; v++) {
                                    updateAsset(entity.get('resource_id'), 'entity', null, value[v]);
                                }
                            } else if (value) {
                                updateAsset(entity.get('resource_id'), 'entity', null, value);
                            }
                        }
                    }
                }
            }
        }
    });

    // scene settings
    var sceneSettings = editor.call('sceneSettings');
    sceneSettings.on('render.skybox:set', function (value, valueOld) {
        updateAsset('sceneSettings', 'editorSettings', valueOld, value);
    });

    editor.method('assets:used:index', function () {
        return index;
    });
    editor.method('assets:used:get', function (id) {
        if (isNaN(id))
            return true;

        if (!index[id])
            return false;

        return !!(index[id].count && index[id].parent);
    });
});


/* editor/assets/assets-user-color.js */
editor.once('load', function() {
    'use strict';

    var colors = { };
    var items = { };
    var pool = { };

    editor.on('selector:sync', function(user, data) {
        // deselect
        if (items[user] && items[user].length) {
            for(var i = 0; i < items[user].length; i++) {
                var element = items[user][i];
                element.parentNode.removeChild(element);
                pool[user].push(element);
            }

            items[user] = [ ];
        }

        if (data.type === 'asset') {
            // select
            if (! items[user]) {
                items[user] = [ ];
                pool[user] = [ ];
            }

            if (! colors[user])
                colors[user] = editor.call('whoisonline:color', user, 'hex');

            for(var i = 0; i < data.ids.length; i++) {
                var element = editor.call('assets:panel:get', data.ids[i]);
                if (! element)
                    continue;

                var point;

                if (pool[user].length) {
                    point = pool[user].pop();
                } else {
                    point = document.createElement('span');
                    point.style.backgroundColor = colors[user];
                }

                element.users.appendChild(point);
                items[user].push(point);
            }
        }
    });

    editor.on('whoisonline:remove', function(id) {
        if (! items[id])
            return;

        for(var i = 0; i < items[id].length; i++)
            items[id][i].parentNode.removeChild(items[id][i]);

        delete items[id];
        delete pool[id];
        delete colors[id];
    });
});


/* editor/assets/assets-script-parse.js */
editor.once('load', function() {
    'use strict';

    // parse script file and its attributes
    // update attributes accordingly


    editor.method('scripts:parse', function(asset, fn) {

        var worker = new Worker('./editor/scene/js/editor/assets/assets-script-parse-worker.js');
        worker.asset = asset;
        worker.progress = 0;

        worker.onmessage = function(evt) {

            if (! evt.data.name)
                return;

            switch(evt.data.name) {
                case 'results':
                    worker.terminate();
                    var result = evt.data.data;

                    var scripts = asset.get('data.scripts');

                    asset.history.enabled = false;

                    // loading screen?
                    if (result.loading !== asset.get('data.loading'))
                        asset.set('data.loading', result.loading);

                    // remove scripts
                    for(var key in scripts) {
                        if (! scripts.hasOwnProperty(key) || result.scripts.hasOwnProperty(key))
                            continue;

                        asset.unset('data.scripts.' + key);
                    }

                    // add scripts
                    for(var key in result.scripts) {
                        if (! result.scripts.hasOwnProperty(key))
                            continue;

                        var attributes = { };

                        // TODO scripts2
                        // attributes validation

                        for(var attr in result.scripts[key].attributes) {
                            if (! result.scripts[key].attributes.hasOwnProperty(attr))
                                continue;

                            attributes[attr] = result.scripts[key].attributes[attr];
                        }

                        var script = asset.get('data.scripts.' + key);
                        var attributesOrder = result.scripts[key].attributesOrder;

                        if (! script) {
                            // new script
                            asset.set('data.scripts.' + key, {
                                'attributesOrder': attributesOrder || [ ],
                                'attributes': attributes
                            });
                        } else {
                            // change attributes
                            for(var attr in attributes) {
                                if (! attributes.hasOwnProperty(attr) || ! script.attributes.hasOwnProperty(attr))
                                    continue;

                                asset.set('data.scripts.' + key + '.attributes.' + attr, attributes[attr]);
                            }

                            // remove attributes
                            for(var attr in script.attributes) {
                                if (! script.attributes.hasOwnProperty(attr) || attributes.hasOwnProperty(attr))
                                    continue;

                                asset.unset('data.scripts.' + key + '.attributes.' + attr);
                                asset.removeValue('data.scripts.' + key + '.attributesOrder', attr);
                            }

                            // add attributes
                            for(var attr in attributes) {
                                if (! attributes.hasOwnProperty(attr) || script.attributes.hasOwnProperty(attr))
                                    continue;

                                var ind = attributesOrder.indexOf(attr);
                                asset.set('data.scripts.' + key + '.attributes.' + attr, attributes[attr]);
                                asset.insert('data.scripts.' + key + '.attributesOrder', attr, ind);
                            }

                            // TODO scritps2
                            // move attribute
                            var attrIndex = { };
                            for(var i = 0; i < attributesOrder.length; i++)
                                attrIndex[attributesOrder[i]] = i;

                            var scriptAttributeOrder = asset.get('data.scripts.' + key + '.attributesOrder');
                            var i = scriptAttributeOrder.length;
                            while(i--) {
                                var attr = scriptAttributeOrder[i];
                                var indOld = asset.get('data.scripts.' + key + '.attributesOrder').indexOf(attr);
                                var indNew = attrIndex[attr];
                                if (indOld !== indNew)
                                    asset.move('data.scripts.' + key + '.attributesOrder', indOld, indNew);
                            }
                        }
                    }

                    asset.history.enabled = true;

                    if (fn) fn(null, result);
                    break;
            }
        };

        worker.onerror = function(err) {
            console.log('worker onerror', err);
            if (fn) fn(err);
        };

        
        worker.postMessage({
            name: 'parse',
            asset: asset.get('id'),
            url: asset.get('file.url'),
            engine: config.url.engine
        });
    });
});


/* editor/assets/assets-script-registry.js */
editor.once('load', function () {
    'use strict';


    // track all script assets
    // detect any collisions of script object within assets
    // notify about primary script asset
    // provide api to access assets by scripts and list available script objects

    var collisionScripts = {};
    var collisionStates = {};

    var assetToScripts = {};
    var scriptsList = [];
    var scripts = {};
    var scriptsPrimary = {};


    var addScript = function (asset, script) {
        var assetId = asset.get('id');

        if (!assetToScripts[assetId])
            assetToScripts[assetId] = {};

        if (assetToScripts[assetId][script]) {
            // 1. check if already indexed, then update
            editor.emit('assets:scripts:change', asset, script);
            editor.emit('assets:scripts[' + script + ']:change', asset);
            // console.log('assets:scripts:change', asset.json(), script);
        } else {
            // 2. if not indexed, then add
            assetToScripts[assetId][script] = true;
            if (!scripts[script]) scripts[script] = {};
            scripts[script][assetId] = asset;

            editor.emit('assets:scripts:add', asset, script);
            editor.emit('assets[' + asset.get('id') + ']:scripts:add', script);
            // console.log('assets:scripts:add', asset.json(), script);
        }

        // 3. check for collisions
        if (scriptsList.indexOf(script) === -1) {
            scriptsList.push(script);

            primaryScriptSet(asset, script);
        } else {
            if (!collisionScripts[script])
                collisionScripts[script] = {};

            if (!collisionScripts[script][assetId]) {
                for (var key in scripts[script]) {
                    if (!scripts[script].hasOwnProperty(key) || collisionScripts[script][key])
                        continue;

                    collisionScripts[script][key] = scripts[script][key];
                }

                checkCollisions(asset, script);
            }
        }
    };

    var removeScript = function (asset, script) {
        var assetId = asset.get('id');

        if (!assetToScripts[assetId] || !assetToScripts[assetId][script] || !scripts[script])
            return;

        delete assetToScripts[assetId][script];
        if (Object.keys(assetToScripts[assetId]).length === 0)
            delete assetToScripts[assetId];

        checkCollisions(null, script);

        delete scripts[script][assetId];
        var scriptAssets = Object.keys(scripts[script]).length;
        if (scriptAssets === 0) {
            delete scripts[script];
            var ind = scriptsList.indexOf(script);
            scriptsList.splice(ind, 1);
        } else if (collisionScripts[script] && collisionScripts[script][assetId]) {
            delete collisionScripts[script][assetId];
            var collisions = collisionScripts[script];
            if (Object.keys(collisionScripts[script]).length === 1)
                delete collisionScripts[script];

            for (var key in collisions)
                checkCollisions(collisions[key], script);
        }

        editor.emit('assets:scripts:remove', asset, script);
        editor.emit('assets[' + assetId + ']:scripts:remove', script);
        editor.emit('assets:scripts[' + script + ']:remove', asset);
        editor.emit('assets[' + assetId + ']:scripts[' + script + ']:remove');
        // console.log('assets:scripts:remove', asset.json(), script);
    };

    var checkCollisions = function (asset, script) {
        var collides = [];

        if (collisionScripts[script]) {
            for (var key in collisionScripts[script]) {
                if (!collisionScripts[script].hasOwnProperty(key))
                    continue;

                if (collisionScripts[script][key].get('preload'))
                    collides.push(collisionScripts[script][key]);
            }
        }

        if (collides.length > 1) {
            // collision occurs
            if (!collisionStates[script])
                collisionStates[script] = {};

            for (var i = 0; i < collides.length; i++) {
                var key = collides[i].get('id');
                if (collisionStates[script][key])
                    continue;

                collisionStates[script][key] = collides[i];
                editor.emit('assets:scripts:collide', collides[i], script);
                editor.emit('assets[' + key + ']:scripts:collide', script);
                editor.emit('assets:scripts[' + script + ']:collide', collides[i]);
                editor.emit('assets[' + key + ']:scripts[' + script + ']:collide');
            }

            primaryScriptSet(null, script);
        } else {
            // no collision
            if (collisionStates[script]) {
                for (var key in collisionStates[script]) {
                    if (!collisionStates[script].hasOwnProperty(key))
                        continue;

                    editor.emit('assets:scripts:resolve', collisionStates[script][key], script);
                    editor.emit('assets[' + key + ']:scripts:resolve', script);
                    editor.emit('assets:scripts[' + script + ']:resolve', collisionStates[script][key]);
                    editor.emit('assets[' + key + ']:scripts[' + script + ']:resolve');
                }

                delete collisionStates[script];
            }

            if (collides.length === 1) {
                primaryScriptSet(collides[0], script);
            } else if (asset && asset.get('preload')) {
                primaryScriptSet(asset, script);
            } else {
                primaryScriptSet(null, script);
            }
        }
    };

    var primaryScriptSet = function (asset, script) {
        if (asset === null && scriptsPrimary[script]) {
            // unset
            asset = scriptsPrimary[script];
            delete scriptsPrimary[script];
            editor.emit('assets:scripts:primary:unset', asset, script);
            editor.emit('assets[' + asset.get('id') + ']:scripts:primary:unset', script);
            editor.emit('assets:scripts[' + script + ']:primary:unset', asset);
            editor.emit('assets[' + asset.get('id') + ']:scripts[' + script + ']:primary:unset');
        } else if (asset && asset.get('preload') && (!scriptsPrimary[script] || scriptsPrimary[script] !== asset)) {
            // set
            scriptsPrimary[script] = asset;
            editor.emit('assets:scripts:primary:set', asset, script);
            editor.emit('assets[' + asset.get('id') + ']:scripts:primary:set', script);
            editor.emit('assets:scripts[' + script + ']:primary:set', asset);
            editor.emit('assets[' + asset.get('id') + ']:scripts[' + script + ']:primary:set');
        }
    };

    editor.on('assets:add', function (asset) {
        if (asset.get('type') !== 'script')
            return;

        var assetId = asset.get('id');



        // index scripts
        var scripts = asset.get('data.scripts');
        for (var key in scripts) {
            if (!scripts.hasOwnProperty(key))
                continue;

            addScript(asset, key);
        }

        // subscribe to changes
        asset.on('*:set', function (path, value, old) {
            if (path === 'preload') {
                var scripts = Object.keys(this.get('data.scripts'));
                for (var i = 0; i < scripts.length; i++)
                    checkCollisions(this, scripts[i]);

                return;
            }

            if (!path.startsWith('data.scripts.'))
                return;

            var parts = path.split('.');
            if (parts.length < 3) return;

            var script = parts[2];

            if (parts.length === 3) {
                // data.scripts.*
                addScript(asset, script);
            } else if (parts.length === 5 && parts[3] === 'attributes') {
                // data.scripts.*.attributes.*
                var attr = parts[4];
                editor.emit('assets:scripts:attribute:change', asset, script, attr, value, old);
                editor.emit('assets:scripts[' + script + ']:attribute:change', asset, attr, value, old);
            }
        });

        asset.on('*:unset', function (path, value) {
            if (!path.startsWith('data.scripts.'))
                return;

            var parts = path.split('.');
            if (parts.length < 3) return;

            var script = parts[2];

            if (parts.length === 3) // data.scripts.*
                removeScript(asset, script);
        });

        // add attribute
        asset.on('*:insert', function (path, value, ind) {
            if (!path.startsWith('data.scripts.'))
                return;

            var parts = path.split('.');
            if (parts.length !== 4 || parts[3] !== 'attributesOrder') return;

            var script = parts[2];
            editor.emit('assets:scripts:attribute:set', asset, script, value, ind);
            editor.emit('assets[' + asset.get('id') + ']:scripts:attribute:set', script, value, ind);
            editor.emit('assets:scripts[' + script + ']:attribute:set', asset, value, ind);
            editor.emit('assets[' + asset.get('id') + ']:scripts[' + script + ']:attribute:set', value, ind);
        });

        // remove attribute
        asset.on('*:remove', function (path, value) {
            if (!path.startsWith('data.scripts.'))
                return;

            var parts = path.split('.');
            if (parts.length !== 4 || parts[3] !== 'attributesOrder') return;

            var script = parts[2];
            editor.emit('assets:scripts:attribute:unset', asset, script, value);
            editor.emit('assets[' + asset.get('id') + ']:scripts:attribute:unset', script, value);
            editor.emit('assets:scripts[' + script + ']:attribute:unset', asset, value);
            editor.emit('assets[' + asset.get('id') + ']:scripts[' + script + ']:attribute:unset', value);
        });

        asset.on('*:move', function (path, value, ind, indOld) {
            if (!path.startsWith('data.scripts.'))
                return;

            var parts = path.split('.');

            if (parts.length === 4 && parts[3] === 'attributesOrder') {
                var script = parts[2];

                editor.emit('assets:scripts:attribute:move', asset, script, value, ind, indOld);
                editor.emit('assets[' + asset.get('id') + ']:scripts:attribute:move', script, value, ind, indOld);
                editor.emit('assets:scripts[' + script + ']:attribute:move', asset, value, ind, indOld);
                editor.emit('assets[' + asset.get('id') + ']:scripts[' + script + ']:attribute:move', value, ind, indOld);
            }
        });

        asset.once('destroy', function () {
            var scripts = asset.get('data.scripts');
            for (var key in scripts) {
                if (!scripts.hasOwnProperty(key))
                    continue;

                removeScript(asset, key);
            }
        });
    });

    editor.method('assets:scripts:list', function () {
        return scriptsList.slice(0);
    });

    editor.method('assets:scripts:assetByScript', function (script) {
        return scriptsPrimary[script] || null;
    });

    editor.method('assets:scripts:collide', function (script) {
        return collisionStates[script];
    });

    editor.method('assets:scripts:collideList', function () {
        return Object.keys(collisionStates);
    });
});


/* editor/assets/assets-sprite-utils.js */
editor.once('load', function() {
    'use strict';

    // Creates new texture atlas asset from texture asset
    editor.method('assets:textureToAtlas', function (asset, callback) {
        if (asset.get('type') !== 'texture' || asset.get('source')) return;


    });

    // Creates new Sprite Asset from Texture Atlas Asset
    editor.method('assets:atlasToSprite', function (args) {
        var asset = args && args.asset;
        if (! asset || asset.get('type') !== 'textureatlas' || asset.get('source')) return;

        var sliced = args && args.sliced;

        // create a frame that covers the full atlas unless such a frame already exists
        var frames = asset.getRaw('data.frames')._data;
        var count = Object.keys(frames).length;
        var frame = null;

        var width = asset.get('meta.width') || 1;
        var height = asset.get('meta.height') || 1;

        if (count) {
            for (var key in frames) {
                // search for existing frame that covers the entire atlas
                if (frames[key]._data.rect[0] <= 0 &&
                    frames[key]._data.rect[1] <= 0 &&
                    frames[key]._data.rect[2] >= width &&
                    frames[key]._data.rect[3] >= height) {

                    frame = key;
                    break;
                }
            }
        }

        if (frame === null) {
            var maxKey = 1;
            for (var key in frames) {
                maxKey = Math.max(maxKey, parseInt(key, 10) + 1);
            }

            frame = maxKey;

            // default border to 10% of dimensions if sliced otherwise set to 0
            var horBorder = sliced ? Math.floor(0.1 * Math.max(width, height)) || 0 : 0;
            var verBorder = sliced ? Math.floor(0.1 * Math.max(width, height)) || 0 : 0;

            var history = asset.history.enabled;
            asset.history.enabled = false;
            asset.set('data.frames.' + maxKey, {
                name: 'Frame ' + maxKey,
                rect: [0, 0, width, height],
                pivot: [0.5, 0.5],
                border: [horBorder,verBorder,horBorder,verBorder]
            });
            asset.history.enabled = history;
        }

        // rendermode: 1 - sliced, 0 - simple
        var renderMode = sliced ? 1 : 0;
        // default ppu to 1 if we're using sliced mode otherwise default to
        // 100 which is better for world-space sprites
        var ppu = sliced ? 1 : 100;

        // get atlas asset name without extension
        var name = asset.get('name');
        var lastDot = name.lastIndexOf('.');
        if (lastDot > 0) {
            name = name.substring(0, lastDot);
        }

        editor.call('assets:create:sprite', {
            name: name,
            pixelsPerUnit: ppu,
            renderMode: renderMode,
            frameKeys: [frame],
            textureAtlasAsset: asset.get('id'),
            fn: args && args.callback
        });
    });

});


/* editor/assets/assets-bundles.js */
editor.once('load', function () {
    'use strict';

    var INVALID_TYPES = ['script', 'folder', 'bundle'];

    // stores <asset id, [bundle assets]> index for mapping
    // any asset it to the bundles that it's referenced from
    var bundlesIndex = {};

    // stores all bundle assets
    var bundleAssets = [];

    var addToIndex = function (assetIds, bundleAsset) {
        if (! assetIds) return;

        for (var i = 0; i < assetIds.length; i++) {
            if (! bundlesIndex[assetIds[i]]) {
                bundlesIndex[assetIds[i]] = [bundleAsset];
                editor.emit('assets:bundles:insert', bundleAsset, assetIds[i]);
            } else {
                if (bundlesIndex[assetIds[i]].indexOf(bundleAsset) === -1) {
                    bundlesIndex[assetIds[i]].push(bundleAsset);
                    editor.emit('assets:bundles:insert', bundleAsset, assetIds[i]);
                }
            }
        }
    };

    // fill bundlexIndex when a new bundle asset is added
    editor.on('assets:add', function (asset) {
        if (asset.get('type') !== 'bundle') return;

        bundleAssets.push(asset);
        addToIndex(asset.get('data.assets'), asset);

        asset.on('data.assets:set', function (assetIds) {
            addToIndex(assetIds, asset);
        });

        asset.on('data.assets:insert', function (assetId) {
            addToIndex([assetId], asset);
        });

        asset.on('data.assets:remove', function (assetId) {
            if (! bundlesIndex[assetId]) return;
            var idx = bundlesIndex[assetId].indexOf(asset);
            if (idx !== -1) {
                bundlesIndex[assetId].splice(idx, 1);
                editor.emit('assets:bundles:remove', asset, assetId);
                if (! bundlesIndex[assetId].length) {
                    delete bundlesIndex[assetId];
                }
            }
        });
    });

    // remove bundle asset from bundlesIndex when a bundle asset is
    // removed
    editor.on('assets:remove', function (asset) {
        if (asset.get('type') !== 'bundle') return;

        var idx = bundleAssets.indexOf(asset);
        if (idx !== -1) {
            bundleAssets.splice(idx, 1);
        }

        for (var id in bundlesIndex) {
            idx = bundlesIndex[id].indexOf(asset);
            if (idx !== -1) {
                bundlesIndex[id].splice(idx, 1);
                editor.emit('assets:bundles:remove', asset, id);

                if (! bundlesIndex[id].length) {
                    delete bundlesIndex[id];
                }
            }
        }
    });

    /**
     * Returns all of the bundle assets for the specified asset
     * @param {Observer} asset The asset
     * @returns {Observer[]} The bundles for the asset or an empty array.
     */
    editor.method('assets:bundles:listForAsset', function (asset) {
        return bundlesIndex[asset.get('id')] || [];
    });

    /**
     * Returns a list of all the bundle assets
     * @returns {Observer[]} The bundle assets
     */
    editor.method('assets:bundles:list', function () {
        return bundleAssets.slice();
    });

    /**
     * Returns true if the specified asset id is in a bundle
     * @returns {Boolean} True of false
     */
    editor.method('assets:bundles:containAsset', function (assetId) {
        return !!bundlesIndex[assetId];
    });

    var isAssetValid = function (asset, bundleAsset) {
        var id = asset.get('id');
        if (asset.get('source')) return false;
        if (INVALID_TYPES.indexOf(asset.get('type')) !== -1) return false;

        if (bundleAsset) {
            var existingAssetIds = bundleAsset.getRaw('data.assets');
            if (existingAssetIds.indexOf(id) !== -1) return false;
        }

        return true;
    };

    /**
     * Checks if the specified asset is valid to be added to a bundle
     * with the specified existing asset ids
     */
    editor.method('assets:bundles:canAssetBeAddedToBundle', isAssetValid);

    /**
     * Adds assets to the bundle asset. Does not add already existing
     * assets or assets with invalid types.
     * @param {Observer[]} assets The assets to add to the bundle
     * @param {Observer} bundleAsset The bundle asset
     */
    editor.method('assets:bundles:addAssets', function (assets, bundleAsset) {
        var validAssets = assets.filter(function (asset) {
            return isAssetValid(asset, bundleAsset);
        });

        var len = validAssets.length;
        if (!len) return;

        var undo = function () {
            var asset = editor.call('assets:get', bundleAsset.get('id'));
            if (! asset) return;

            var history = asset.history.enabled;
            asset.history.enabled = false;
            for (var i = 0; i < len; i++) {
                asset.removeValue('data.assets', validAssets[i].get('id'));
            }
            asset.history.enabled = history;
        };

        var redo = function () {
            var asset = editor.call('assets:get', bundleAsset.get('id'));
            if (! asset) return;

            var history = asset.history.enabled;
            asset.history.enabled = false;
            for (var i = 0; i < len; i++) {
                if (isAssetValid(validAssets[i], asset)) {
                    asset.insert('data.assets', validAssets[i].get('id'));
                }
            }
            asset.history.enabled = history;
        };

        redo();

        editor.call('history:add', {
            name: 'asset.' + bundleAsset.get('id') + '.data.assets',
            undo: undo,
            redo: redo
        });

        return len;
    });

    /**
     * Removes the specified assets from the specified bundle asset
     * @param {Observer[]} assets The assets to remove
     * @param {Observer} bundleAsset The bundle asset
     */
    editor.method('assets:bundles:removeAssets', function (assets, bundleAsset) {
        var redo = function () {
            var asset = editor.call('assets:get', bundleAsset.get('id'));
            if (! asset) return;

            var history = asset.history.enabled;
            asset.history.enabled = false;
            for (var i = 0; i < assets.length; i++) {
                asset.removeValue('data.assets', assets[i].get('id'));
            }
            asset.history.enabled = history;
        };

        var undo = function () {
            var asset = editor.call('assets:get', bundleAsset.get('id'));
            if (! asset) return;

            var history = asset.history.enabled;
            asset.history.enabled = false;
            for (var i = 0; i < assets.length; i++) {
                if (isAssetValid(assets[i], asset)) {
                    asset.insert('data.assets', assets[i].get('id'));
                }
            }
            asset.history.enabled = history;
        };

        redo();

        editor.call('history:add', {
            name: 'asset.' + bundleAsset.get('id') + '.data.assets',
            undo: undo,
            redo: redo
        });
    });

    /**
     * Calculates the file size of a bundle Asset by adding up the file
     * sizes of all the assets it references.
     * @param {Observer} The bundle asset
     * @returns {Number} The file size
     */
    editor.method('assets:bundles:calculateSize', function (bundleAsset) {
        var size = 0;
        var assets = bundleAsset.get('data.assets');
        for (var i = 0; i < assets.length; i++) {
            var asset = editor.call('assets:get', assets[i]);
            if (! asset || !asset.has('file.size')) continue;

            size += asset.get('file.size');
        }
        return size;
    });
});


/* editor/assets/assets-store.js */
editor.once('load', function () {
    'use strict';

    var assetsPanel = editor.call('layout.assets');

    var btnStore = new ui.Button({
        text: "Library"
    });
    btnStore.class.add('store');
    assetsPanel.header.append(btnStore);

    btnStore.on('click', function () {
        window.open('', '_blank');
    });
});


/* editor/assets/assets-move-to-store.js */
editor.once('load', function() {
    'use strict';

    editor.method('assets:move-to-store', function(asset) {
        if (!asset) {
            return;
        }

        var selectorType = editor.call('selector:type');
        var selectedItems = editor.call('selector:items');

        // if the asset that was right-clicked is in the selection
        // then include all the other selected items in the delete
        // otherwise only delete the right-clicked item
        var items = (selectorType == 'asset' && selectedItems.find(e => e.get('id') === asset.get('id'))) ? selectedItems : [asset];
        var assetIds = items.map(e => e.get('id'));

        editor.call('picker:text-input', function(text) {
            if (text.length === 0) {
                return false;
            }
            /**todo */
           
            return true;
        },
        {
            headerText: 'Moving ' + assetIds.length + ' asset' + (assetIds.length === 1 ? '' : 's') + ' to store',
            labelText: 'StoreItem ID:'
        });
    });
});