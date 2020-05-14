





























/* editor/viewport/viewport-drop-model.js */
editor.once('load', function() {
    'use strict';

    var canvas = editor.call('viewport:canvas');
    if (! canvas) return;

    var app = editor.call('viewport:app');
    if (! app) return; // webgl not available

    var aabb = new pc.BoundingBox();
    var vecA = new pc.Vec3();
    var vecB = new pc.Vec3();
    var vecC = new pc.Vec3();


    editor.call('drop:target', {
        ref: canvas,
        filter: function(type, data) {
            if (type === 'asset.model') {
                var asset = app.assets.get(data.id);
                if (asset) app.assets.load(asset);

                return true;
            }

            if (type === 'assets') {
                for(var i = 0; i < data.ids.length; i++) {
                    var asset = editor.call('assets:get', data.ids[i]);
                    if (! asset)
                        return false;

                    if (asset.get('type') !== 'model')
                        return false;
                }

                for(var i = 0; i < data.ids.length; i++) {
                    var asset = app.assets.get(data.ids[i]);
                    if (asset) app.assets.load(asset);
                }

                return true;
            }
        },
        drop: function(type, data) {
            if (! config.scene.id)
                return;

            var assets = [ ];

            if (type === 'asset.model') {
                var asset = editor.call('assets:get', data.id);
                if (asset) assets.push(asset);
            } else if (type === 'assets') {
                for(var i = 0; i < data.ids.length; i++) {
                    var asset = editor.call('assets:get', data.ids[i]);
                    if (asset && asset.get('type') === 'model')
                        assets.push(asset);
                }
            }

            if (! assets.length)
                return;

            // parent
            var parent = null;
            if (editor.call('selector:type') === 'entity')
                parent = editor.call('selector:items')[0];

            if (! parent)
                parent = editor.call('entities:root');

            var entities = [ ];
            var data = [ ];

            // calculate aabb
            var first = true;
            for(var i = 0; i < assets.length; i++) {
                var assetEngine = app.assets.get(assets[i].get('id'));
                if (! assetEngine) continue;

                if (assetEngine.resource) {
                    var meshes = assetEngine.resource.meshInstances;
                    for(var m = 0; m < meshes.length; m++) {
                        if (first) {
                            first = false;
                            aabb.copy(meshes[m].aabb);
                        } else {
                            aabb.add(meshes[m].aabb);
                        }
                    }
                }
            }

            if (first) {
                aabb.center.set(0, 0, 0);
                aabb.halfExtents.set(1, 1, 1);
            }

            // calculate point
            var camera = editor.call('camera:current');
            var distance = 0;

            if (ui.Tree._ctrl && ui.Tree._ctrl()) {
                vecA.copy(camera.forward).scale(aabb.halfExtents.length() * 2.2);
                vecB.copy(camera.getPosition()).add(vecA);
                vecC.copy(vecB).sub(aabb.center);

                var tmp = new pc.Entity();
                parent.entity.addChild(tmp);
                tmp.setPosition(vecC);
                vecC.copy(tmp.getLocalPosition());
                tmp.destroy();

                // focus distance
                distance = vecA.copy(camera.getPosition()).sub(vecB).length();
            } else {
                vecC.set(0, 0, 0);
                vecB.copy(parent.entity.getPosition()).add(aabb.center);
                distance = aabb.halfExtents.length() * 2.2;
            }

            for(var i = 0; i < assets.length; i++) {
                var component = editor.call('components:getDefault', 'model');
                component.type = 'asset';
                component.asset = assets[i].get('id');

                var name = assets[i].get('name');
                if (/\.json$/i.test(name))
                    name = name.slice(0, -5) || 'Untitled';

                // new entity
                var entity = editor.call('entities:new', {
                    parent: parent,
                    name: name,
                    position: [ vecC.x, vecC.y, vecC.z ],
                    components: {
                        model: component
                    },
                    noSelect: true,
                    noHistory: true
                });

                entities.push(entity);
                data.push(entity.json());
            }

            editor.call('selector:history', false);
            editor.call('selector:set', 'entity', entities);
            editor.once('selector:change', function() {
                editor.call('selector:history', true);
            });

            var selectorType = editor.call('selector:type');
            var selectorItems = editor.call('selector:items');
            if (selectorType === 'entity') {
                for(var i = 0; i < selectorItems.length; i++)
                    selectorItems[i] = selectorItems[i].get('resource_id');
            }

            var parentId = parent.get('resource_id');
            var resourceIds = [ ];
            for(var i = 0; i < entities.length; i++)
                resourceIds.push(entities[i].get('resource_id'));

            editor.call('history:add', {
                name: 'new model entities ' + entities.length,
                undo: function() {
                    for(var i = 0; i < resourceIds.length; i++) {
                        var entity = editor.call('entities:get', resourceIds[i]);
                        if (! entity)
                            continue;

                        editor.call('entities:removeEntity', entity);
                    }

                    if (selectorType === 'entity' && selectorItems.length) {
                        var items = [ ];
                        for(var i = 0; i < selectorItems.length; i++) {
                            var item = editor.call('entities:get', selectorItems[i]);
                            if (item)
                                items.push(item);
                        }

                        if (items.length) {
                            editor.call('selector:history', false);
                            editor.call('selector:set', selectorType, items);
                            editor.once('selector:change', function() {
                                editor.call('selector:history', true);
                            });
                        }
                    }
                },
                redo: function() {
                    var parent = editor.call('entities:get', parentId);
                    if (! parent)
                        return;

                    var entities = [ ];

                    for(var i = 0; i < data.length; i++) {
                        var entity = new Observer(data[i]);
                        entities.push(entity);
                        editor.call('entities:addEntity', entity, parent, false);
                    }

                    editor.call('selector:history', false);
                    editor.call('selector:set', 'entity', entities);
                    editor.once('selector:change', function() {
                        editor.call('selector:history', true);
                    });

                    editor.call('viewport:render');
                    editor.call('camera:focus', vecB, distance);
                }
            });

            editor.call('viewport:render');
            editor.call('camera:focus', vecB, distance);
        }
    });
});


/* editor/viewport/viewport-drop-material.js */
editor.once('load', function() {
    'use strict';

    var app = editor.call('viewport:app');
    if (! app) return; // webgl not available

    var canvas = editor.call('viewport:canvas');
    var active = false;
    var hoverMaterial = null;
    var hoverAsset = null;
    var hoverEntity = null;
    var hoverNode = null;
    var hoverPicked = null;
    var hoverMeshInstance = null;


    editor.on('viewport:pick:hover', function(node, picked) {
        hoverNode = node;
        hoverPicked = picked;

        if (active)
            onPick(node, picked);
    });


    var onPick = function(node, picked) {
        var meshInstance = null;

        if (node && node._icon)
            node = node._getEntity();

        if (! node || ! editor.call('entities:get', node.getGuid())) {
            onHover(null);
            return;
        }

        if (picked instanceof pc.MeshInstance)
            meshInstance = picked;

        if (node.model && meshInstance && (! meshInstance.node._parent || ! meshInstance.node._parent._icon)) {
            onHover(node, meshInstance);
        } else {
            onHover(null);
        }
    };


    var onLeave = function() {
        if (! hoverEntity)
            return;

        if (hoverEntity.model.type === 'asset' && hoverEntity.model.model) {

            if (hoverAsset) {
                hoverAsset.data.mapping[hoverAsset._materialIndHover].material = hoverAsset._materialBeforeHover;
                hoverAsset.fire('change', hoverAsset, 'data', hoverAsset.data, hoverAsset.data);
                delete hoverAsset._materialBeforeHover;
            } else {
                var mapping = hoverEntity.model.mapping;
                if (hoverEntity._materialBeforeHover === undefined)
                    delete mapping[hoverEntity._materialIndHover];
                else
                    mapping[hoverEntity._materialIndHover] = hoverEntity._materialBeforeHover;
                hoverEntity.model.mapping = mapping;
            }
        } else if (hoverEntity._materialBeforeHover && hoverEntity.model.model) {
            hoverEntity.model.material = hoverEntity._materialBeforeHover;
        }

        delete hoverEntity._materialBeforeHover;
        delete hoverEntity._materialIndHover;

        editor.call('viewport:render');
    };

    var onHover = function(entity, meshInstance) {
        if (entity === hoverEntity && meshInstance === hoverMeshInstance)
            return;

        onLeave();

        hoverAsset = null;
        hoverEntity = entity;
        hoverMeshInstance = meshInstance;

        if (hoverEntity) {
            if (hoverEntity.model.type === 'asset' && hoverEntity.model.model) {
                var ind = hoverEntity.model.model.meshInstances.indexOf(hoverMeshInstance);
                if (ind !== -1) {
                    var mapping = hoverEntity.model.mapping;
                    if (!mapping || !mapping.hasOwnProperty(ind)) {

                        hoverAsset = app.assets.get(hoverEntity.model.asset);
                        hoverAsset._materialBeforeHover = hoverAsset.data.mapping[ind].material;
                        hoverAsset._materialIndHover = ind;

                        hoverAsset.data.mapping[ind].material = hoverMaterial.id;
                        hoverAsset.fire('change', hoverAsset, 'data', hoverAsset.data, hoverAsset.data);
                    } else {
                        hoverEntity._materialBeforeHover = mapping[ind];
                        hoverEntity._materialIndHover = ind;

                        mapping[ind] = hoverMaterial.id;
                        hoverEntity.model.mapping = mapping;
                    }

                    editor.call('viewport:render');
                }
            } else {
                hoverEntity._materialBeforeHover = hoverEntity.model.material;
                hoverEntity.model.material = hoverMaterial.resource;
                editor.call('viewport:render');
            }
        }
    };

    editor.call('drop:target', {
        ref: canvas,
        type: 'asset.material',
        hole: true,
        drop: function(type, data) {
            if (! config.scene.id)
                return;

            active = false;

            if (! hoverEntity || ! hoverEntity.model)
                return;

            var entity = editor.call('entities:get', hoverEntity.getGuid());
            if (! entity)
                return;

            if (entity.get('components.model.type') === 'asset') {
                var ind = hoverEntity.model.model.meshInstances.indexOf(hoverMeshInstance);
                if (ind === -1)
                    return;

                // if we are setting the model asset mapping then set it and return
                if (hoverAsset) {
                    var asset = editor.call('assets:get', hoverAsset.id);
                    if (asset.has('data.mapping.' + ind + '.material')) {
                        var history = asset.history.enabled;
                        asset.history.enabled = false;

                        var prevMapping = asset.get('data.mapping.' + ind + '.material');
                        var prevUserMapping = asset.get('meta.userMapping.' + ind);
                        var newMapping = hoverMaterial.id;

                        // set mapping and also userMapping
                        asset.set('data.mapping.' + ind + '.material', newMapping);
                        if (! asset.get('meta')) {
                            asset.set('meta', {
                                userMapping: {}
                            });
                        } else {
                            if (! asset.has('meta.userMapping')) {
                                asset.set('meta.userMapping', {});
                            }
                        }

                        asset.set('meta.userMapping.' + ind, true);

                        asset.history.enabled = history;

                        editor.call('history:add', {
                            name: 'assets.' + asset.get('id') + '.data.mapping.' + ind + '.material',
                            undo: function() {
                                var item = editor.call('assets:get', asset.get('id'));
                                if (! item) return;

                                var history = item.history.enabled;
                                item.history.enabled = false;
                                item.set('data.mapping.' + ind + '.material', prevMapping);

                                if (! prevUserMapping) {
                                    item.unset('meta.userMapping.' + ind);

                                    if (! Object.keys(item.get('meta.userMapping')).length) {
                                        item.unset('meta.userMapping');
                                    }
                                }

                                item.history.enabled = history;
                            },
                            redo: function() {
                                var item = editor.call('assets:get', asset.get('id'));
                                if (! item) return;

                                var history = item.history.enabled;
                                item.history.enabled = false;
                                item.set('data.mapping.' + ind + '.material', newMapping);
                                if (! item.get('meta')) {
                                    item.set('meta', {
                                        userMapping: {}
                                    });
                                } else {
                                    if (! item.has('meta.userMapping')) {
                                        item.set('meta.userMapping', {});
                                    }
                                }

                                item.set('meta.userMapping.' + ind, true);
                                item.history.enabled = history;
                            }
                        });
                    }
                } else {
                    // set mapping with custom history action
                    // to prevent bug where undoing will set the mapping to
                    // null instead of unsetting it
                    var history = entity.history.enabled;
                    entity.history.enabled = false;
                    var resourceId = entity.get('resource_id');

                    var undo = {};
                    var redo = {};

                    if (!entity.get('components.model.mapping')) {
                        var mapping = {};
                        mapping[ind] = hoverMaterial.id;
                        entity.set('components.model.mapping', mapping);
                        undo.path = 'components.model.mapping';
                        undo.value = undefined;
                        redo.path = undo.path;
                        redo.value = mapping;
                    } else {
                        undo.path = 'components.model.mapping.' + ind;
                        undo.value = entity.has('components.model.mapping.' + ind) ?
                                     entity.get('components.model.mapping.' + ind) :
                                     undefined;
                        redo.path = undo.path;
                        redo.value = hoverMaterial.id;

                        entity.set('components.model.mapping.' + ind, hoverMaterial.id);

                    }
                    entity.history.enabled = history;

                    editor.call('history:add', {
                        name: 'entities.' + resourceId + '.components.model.mapping',
                        undo: function() {
                            var item = editor.call('entities:get', resourceId);
                            if (! item) return;

                            var history = item.history.enabled;
                            item.history.enabled = false;

                            if (undo.value === undefined)
                                item.unset(undo.path);
                            else
                                item.set(undo.path, undo.value);

                            item.history.enabled = history;
                        },
                        redo: function() {
                            var item = editor.call('entities:get', resourceId);
                            if (! item) return;

                            var history = item.history.enabled;
                            item.history.enabled = false;
                            if (redo.value === undefined)
                                item.unset(redo.path);
                            else
                                item.set(redo.path, redo.value);
                            item.history.enabled = history;
                        }
                    });
                }
            } else {
                // primitive model
                entity.set('components.model.materialAsset', hoverMaterial.id);
            }
        },
        over: function(type, data) {
            if (! config.scene.id)
                return;

            hoverMaterial = app.assets.get(data.id);
            if (! hoverMaterial)
                return;

            app.assets.load(hoverMaterial);

            hoverEntity = null;
            hoverMeshInstance = null;

            active = true;

            onPick(hoverNode, hoverPicked);
        },
        leave: function() {
            if (!config.scene.id)
                return;

            active = false;

            onLeave();
        }
    });
});


/* editor/viewport/viewport-drop-cubemap.js */
editor.once('load', function() {
    'use strict';

    var app = editor.call('viewport:app');
    if (! app) return; // webgl not available

    var canvas = editor.call('viewport:canvas');
    var evtPickHover = null;
    var evtViewportHover = null;
    var evtOnLoad = null;
    var hoverSkybox = null;
    var hoverMaterial = null;
    var hoverCubemap = null;
    var hoverEntity = undefined;
    var hoverMeshInstance = null;
    var hoverSkyboxFields = [ 'cubeMap', 'prefilteredCubeMap128', 'prefilteredCubeMap64', 'prefilteredCubeMap32', 'prefilteredCubeMap16', 'prefilteredCubeMap8', 'prefilteredCubeMap4' ]

    var onPickHover = function(node, picked) {
        var meshInstance = null;

        if (node && node._icon)
            node = node._getEntity();

        if (! node) {
            onHover(null);
            return;
        }

        if (picked instanceof pc.MeshInstance)
            meshInstance = picked;

        if (node.model && meshInstance && (! meshInstance.node._parent || ! meshInstance.node._parent._icon)) {
            onHover(node, meshInstance);
        } else {
            onHover(null);
        }
    };

    var onLeave = function() {
        if (hoverSkybox) {
            app.scene.setSkybox(hoverSkybox);
            hoverSkybox = null;
            editor.call('viewport:render');
        }

        if (hoverMaterial) {
            for(var i = 0; i < hoverSkyboxFields.length; i++)
                hoverMaterial[hoverSkyboxFields[i]] = hoverMaterial._hoverCubeMap[hoverSkyboxFields[i]];
            hoverMaterial.update();
            delete hoverMaterial._hoverCubeMap;
            hoverMaterial = null;

            editor.call('viewport:render');
        }
    };

    var onCubemapLoad = function() {
        setCubemap();
    };

    var setCubemap = function() {
        if (hoverEntity) {
            hoverMaterial = hoverMeshInstance.material;

            if (hoverMaterial) {
                if (! hoverMaterial._hoverCubeMap) {
                    hoverMaterial._hoverCubeMap = { };
                    for(var i = 0; i < hoverSkyboxFields.length; i++)
                        hoverMaterial._hoverCubeMap[hoverSkyboxFields[i]] = hoverMaterial[hoverSkyboxFields[i]];
                }

                for(var i = 0; i < hoverSkyboxFields.length; i++)
                    hoverMaterial[hoverSkyboxFields[i]] = hoverCubemap.resources[i];

                hoverMaterial.update();

                editor.call('viewport:render');
            }
        } else {
            if (! hoverSkybox) {
                hoverSkybox = [ null, null, null, null, null, null ];
                var id = editor.call('sceneSettings').get('render.skybox');
                if (id) {
                    var engineCubemap = app.assets.get(id);
                    if (engineCubemap)
                        hoverSkybox = engineCubemap.resources;
                }
            }

            if (hoverCubemap)
                app.scene.setSkybox(hoverCubemap.resources);

            editor.call('viewport:render');
        }
    };

    var onHover = function(entity, meshInstance) {
        if (entity === hoverEntity && meshInstance === hoverMeshInstance)
            return;

        onLeave();

        hoverEntity = entity;
        hoverMeshInstance = meshInstance;

        setCubemap();
    };

    editor.call('drop:target', {
        ref: canvas,
        type: 'asset.cubemap',
        hole: true,
        drop: function(type, data) {
            if (!config.scene.id)
                return;

            if (evtPickHover) {
                evtPickHover.unbind();
                evtPickHover = null;
            }

            hoverCubemap.off('load', onCubemapLoad);

            onLeave();

            if (hoverEntity) {
                var materialId;
                if (hoverEntity.model.type === 'asset') {
                    var ind = hoverEntity.model.model.meshInstances.indexOf(hoverMeshInstance);

                    if (hoverEntity.model.mapping && hoverEntity.model.mapping[ind]) {
                        materialId = hoverEntity.model.mapping[ind];
                    } else if (hoverEntity.model.asset) {
                        var modelAsset = editor.call('assets:get', hoverEntity.model.asset);

                        if (modelAsset && ind !== -1)
                            materialId = modelAsset.get('data.mapping.' + ind + '.material');
                    }
                } else if (hoverEntity.model.materialAsset) {
                    materialId = hoverEntity.model.materialAsset.id;
                }

                if (materialId) {
                    var materialAsset = editor.call('assets:get', materialId);
                    if (materialAsset)
                        materialAsset.set('data.cubeMap', hoverCubemap.id);
                }
                editor.call('viewport:render');
            } else {
                editor.call('sceneSettings').set('render.skybox', hoverCubemap.id);
                app.scene.setSkybox(hoverCubemap.resources);
                editor.call('viewport:render');
            }
        },
        over: function(type, data) {
            if (!config.scene.id)
                return;

            hoverCubemap = app.assets.get(data.id);
            if (! hoverCubemap)
                return;

            hoverCubemap.loadFaces = true;
            app.assets.load(hoverCubemap);
            hoverCubemap.on('load', onCubemapLoad);

            hoverEntity = undefined;
            hoverMeshInstance = null;

            evtPickHover = editor.on('viewport:pick:hover', onPickHover);
            onHover(null, null);
        },
        leave: function() {
            if (!config.scene.id)
                return;

            if (evtPickHover) {
                evtPickHover.unbind();
                evtPickHover = null;
            }

            hoverCubemap.off('load', onCubemapLoad);

            onLeave();
        }
    });
});


/* editor/viewport/viewport-drop-sprite.js */
editor.once('load', function() {
    'use strict';

    var canvas = editor.call('viewport:canvas');
    if (! canvas) return;

    var app = editor.call('viewport:app');
    if (! app) return; // webgl not available

    var aabb = new pc.BoundingBox();
    var vecA = new pc.Vec3();
    var vecB = new pc.Vec3();
    var vecC = new pc.Vec3();


    editor.call('drop:target', {
        ref: canvas,
        filter: function(type, data) {
            if (type === 'asset.sprite') {
                var asset = app.assets.get(data.id);
                if (asset) app.assets.load(asset);

                return true;
            }

            if (type === 'assets') {
                for(var i = 0; i < data.ids.length; i++) {
                    var asset = editor.call('assets:get', data.ids[i]);
                    if (! asset)
                        return false;

                    if (asset.get('type') !== 'sprite')
                        return false;
                }

                for(var i = 0; i < data.ids.length; i++) {
                    var asset = app.assets.get(data.ids[i]);
                    if (asset) app.assets.load(asset);
                }

                return true;
            }
        },
        drop: function(type, data) {
            if (! config.scene.id)
                return;

            var assets = [ ];

            if (type === 'asset.sprite') {
                var asset = editor.call('assets:get', data.id);
                if (asset) assets.push(asset);
            } else if (type === 'assets') {
                for(var i = 0; i < data.ids.length; i++) {
                    var asset = editor.call('assets:get', data.ids[i]);
                    if (asset && asset.get('type') === 'sprite')
                        assets.push(asset);
                }
            }

            if (! assets.length)
                return;

            // parent
            var parent = null;
            if (editor.call('selector:type') === 'entity')
                parent = editor.call('selector:items')[0];

            if (! parent)
                parent = editor.call('entities:root');

            var entities = [ ];
            var data = [ ];

            // calculate aabb
            var first = true;
            for(var i = 0; i < assets.length; i++) {
                var assetEngine = app.assets.get(assets[i].get('id'));
                if (! assetEngine) continue;

                if (assetEngine.resource) {
                    var mi = assetEngine.resource._meshInstance;
                    if (! mi) continue;

                    if (first) {
                        first = false;
                        aabb.copy(mi.aabb);
                    } else {
                        aabb.add(mi.aabb);
                    }
                }
            }

            if (first) {
                aabb.center.set(0, 0, 0);
                aabb.halfExtents.set(1, 1, 1);
            }

            // calculate point
            var camera = editor.call('camera:current');
            var distance = 0;

            if (ui.Tree._ctrl && ui.Tree._ctrl()) {
                vecA.copy(camera.forward).scale(aabb.halfExtents.length() * 2.2);
                vecB.copy(camera.getPosition()).add(vecA);
                vecC.copy(vecB).sub(aabb.center);

                var tmp = new pc.Entity();
                parent.entity.addChild(tmp);
                tmp.setPosition(vecC);
                vecC.copy(tmp.getLocalPosition());
                tmp.destroy();

                // focus distance
                distance = vecA.copy(camera.getPosition()).sub(vecB).length();
            } else {
                vecC.set(0, 0, 0);
                vecB.copy(parent.entity.getPosition()).add(aabb.center);
                distance = aabb.halfExtents.length() * 2.2;
            }

            for(var i = 0; i < assets.length; i++) {
                var component = editor.call('components:getDefault', 'sprite');

                var name = assets[i].get('name') || 'Untitled';

                if (assets[i].get('data.frameKeys').length > 1) {
                    component.type = 'animated';
                    component.clips = {
                        '0': {
                            name: name,
                            fps: 10,
                            loop: true,
                            autoPlay: true,
                            spriteAsset: assets[i].get('id')
                        }
                    };
                    component.autoPlayClip = name;
                } else {
                    component.spriteAsset = assets[i].get('id');
                }

                // new entity
                var entity = editor.call('entities:new', {
                    parent: parent,
                    name: name,
                    position: [ vecC.x, vecC.y, vecC.z ],
                    components: {
                        sprite: component
                    },
                    noSelect: true,
                    noHistory: true
                });

                entities.push(entity);
                data.push(entity.json());
            }

            editor.call('selector:history', false);
            editor.call('selector:set', 'entity', entities);
            editor.once('selector:change', function() {
                editor.call('selector:history', true);
            });

            var selectorType = editor.call('selector:type');
            var selectorItems = editor.call('selector:items');
            if (selectorType === 'entity') {
                for(var i = 0; i < selectorItems.length; i++)
                    selectorItems[i] = selectorItems[i].get('resource_id');
            }

            var parentId = parent.get('resource_id');
            var resourceIds = [ ];
            for(var i = 0; i < entities.length; i++)
                resourceIds.push(entities[i].get('resource_id'));

            editor.call('history:add', {
                name: 'new sprite entities ' + entities.length,
                undo: function() {
                    for(var i = 0; i < resourceIds.length; i++) {
                        var entity = editor.call('entities:get', resourceIds[i]);
                        if (! entity)
                            continue;

                        editor.call('entities:removeEntity', entity);
                    }

                    if (selectorType === 'entity' && selectorItems.length) {
                        var items = [ ];
                        for(var i = 0; i < selectorItems.length; i++) {
                            var item = editor.call('entities:get', selectorItems[i]);
                            if (item)
                                items.push(item);
                        }

                        if (items.length) {
                            editor.call('selector:history', false);
                            editor.call('selector:set', selectorType, items);
                            editor.once('selector:change', function() {
                                editor.call('selector:history', true);
                            });
                        }
                    }
                },
                redo: function() {
                    var parent = editor.call('entities:get', parentId);
                    if (! parent)
                        return;

                    var entities = [ ];

                    for(var i = 0; i < data.length; i++) {
                        var entity = new Observer(data[i]);
                        entities.push(entity);
                        editor.call('entities:addEntity', entity, parent, false);
                    }

                    editor.call('selector:history', false);
                    editor.call('selector:set', 'entity', entities);
                    editor.once('selector:change', function() {
                        editor.call('selector:history', true);
                    });

                    editor.call('viewport:render');
                    editor.call('camera:focus', vecB, distance);
                }
            });

            editor.call('viewport:render');
            editor.call('camera:focus', vecB, distance);
        }
    });
});


/* editor/viewport/viewport-drop-template.js */
editor.once('load', function () {
    'use strict';

    const canvas = editor.call('viewport:canvas');
    if (! canvas) return;

    var app = editor.call('viewport:app');
    if (! app) return; // webgl not available

    editor.call('drop:target', {
        ref: canvas,
        filter: (type, data) => {
            if (type === 'asset.template') {
                const asset = app.assets.get(data.id);
                if (asset) app.assets.load(asset);

                return true;
            }

            if (type === 'assets') {
                for (let i = 0; i < data.ids.length; i++) {
                    const asset = app.assets.get(data.ids[i]);
                    if (!asset || asset.type !== 'template' ) return false;
                }

                for (let i = 0; i < data.ids.length; i++) {
                    const asset = app.assets.get(data.ids[i]);
                    app.assets.load(asset);
                }

                return true;
            }
        },
        drop: function (type, data) {
            if (! config.scene.id)
                return;

            const assets = [];

            if (type === 'asset.template') {
                const asset = editor.call('assets:get', data.id);
                if (asset) assets.push(asset);
            } else if (type === 'assets') {
                for (let i = 0; i < data.ids.length; i++) {
                    var asset = editor.call('assets:get', data.ids[i]);
                    if (asset && asset.get('type') === 'template')
                        assets.push(asset);
                }
            }

            if (! assets.length)
                return;

            // parent
            var parent = null;
            if (editor.call('selector:type') === 'entity') {
                parent = editor.call('selector:items')[0];
            }

            if (! parent) {
                parent = editor.call('entities:root');
            }

            let newEntities = [];

            function undo() {
                newEntities.forEach(e => {
                    e = e.latest();
                    if (e) {
                        editor.call('entities:removeEntity', e);
                    }
                });
                editor.call('viewport:render');
            }

            function redo() {
                // add instances
                newEntities = assets.map(asset => editor.call('template:addInstance', asset, parent));

                // select them
                editor.call('selector:history', false);
                editor.call('selector:set', 'entity', newEntities);
                editor.once('selector:change', () => {
                    editor.call('selector:history', true);
                });

                const vec = new pc.Vec3();

                if (ui.Tree._ctrl && ui.Tree._ctrl()) {
                    // position entities in front of camera based on aabb
                    const camera = editor.call('camera:current');
                    const aabb = editor.call('entities:aabb', newEntities);
                    vec.copy(camera.forward).scale(aabb.halfExtents.length() * 2.2);
                    vec.add(camera.getPosition());

                    var tmp = new pc.Entity();
                    parent.entity.addChild(tmp);
                    tmp.setPosition(vec);
                    vec.copy(tmp.getLocalPosition());
                    tmp.destroy();
                } else {
                    vec.set(0, 0, 0);
                }

                newEntities.forEach(e => {
                    e.history.enabled = false;
                    e.set('position', [vec.x, vec.y, vec.z]);
                    e.history.enabled = true;
                });

                editor.call('viewport:render');
                editor.call('viewport:focus');
            }

            editor.call('history:add', {
                name: 'add template instance',
                undo: undo,
                redo: redo
            });

            redo();
        }
    });
});


/* editor/viewport/viewport-userdata.js */
editor.once('load', function() {
    'use strict';

    editor.on('userdata:load', function (userdata) {
        if (! editor.call('permissions:read'))
            return;

        var cameras = userdata.get('cameras');

        if (cameras) {
            for(var name in cameras) {
                if (! cameras.hasOwnProperty(name))
                    continue;

                var camera = editor.call('camera:get', name);
                if (! camera)
                    continue;

                var data = cameras[name];

                if (data.position)
                    camera.setPosition(data.position[0], data.position[1], data.position[2]);

                if (data.rotation)
                    camera.setEulerAngles(data.rotation[0], data.rotation[1], data.rotation[2]);

                if (data.orthoHeight && camera.camera.projection === pc.PROJECTION_ORTHOGRAPHIC)
                    camera.camera.orthoHeight = parseInt(data.orthoHeight, 10);

                if (data.focus)
                    camera.focus.set(data.focus[0], data.focus[1], data.focus[2]);
            }
        }

        editor.call('viewport:render');
    });
});


/* editor/viewport/viewport-user-cameras.js */
editor.once('load', function() {
    'use strict';

    var app = editor.call('viewport:app');
    if (! app) return; // webgl not available

    var container = new pc.Entity(app);
    app.root.addChild(container);

    var cameraModel = null;
    var cameras = { };
    var userdata = { };


    // material default
    var materialDefault = new pc.BasicMaterial();
    materialDefault.color = new pc.Color(1, 1, 1, 1);
    materialDefault.update();
    // material quad
    var materialQuad = new pc.BasicMaterial();
    materialQuad.color = new pc.Color(1, 1, 1, .25);
    materialQuad.cull = pc.CULLFACE_NONE;
    materialQuad.blend = true;
    materialQuad.blendSrc = pc.BLENDMODE_SRC_ALPHA;
    materialQuad.blendDst = pc.BLENDMODE_ONE_MINUS_SRC_ALPHA;
    materialQuad.update();
    // material behind
    var materialBehind = new pc.BasicMaterial();
    materialBehind.color = new pc.Color(1, 1, 1, .15);
    materialBehind.blend = true;
    materialBehind.blendSrc = pc.BLENDMODE_SRC_ALPHA;
    materialBehind.blendDst = pc.BLENDMODE_ONE_MINUS_SRC_ALPHA;
    materialBehind.depthTest = false;
    materialBehind.update();


    // Subscribes to user data of specified user
    var addUser = function (userId) {
        editor.once('userdata:' + userId + ':raw', function (data) {
            loadUserData(userId, data);
        });

        userdata[userId] = editor.call('realtime:subscribe:userdata', config.scene.uniqueId, userId);
    };

    // Removes user camera and unsubscribes from userdata
    var removeUser = function (userId) {
        if (userId === config.self.id) return;

        // unsubscribe from realtime userdata
        if (userdata[userId]) {
            userdata[userId].destroy();
            delete userdata[userId];
            editor.unbind('realtime:userdata:' + userId + ':op:cameras');
        }

        // remove user camera
        if (cameras[userId]) {
            cameras[userId].destroy();
            delete cameras[userId];
            editor.call('viewport:render');
        }
    };

    var close = .25;
    var far = .5;
    var horiz = .5;
    var vert = .375;

    var createCameraModel = function() {
        var vertexFormat = new pc.VertexFormat(app.graphicsDevice, [
            { semantic: pc.SEMANTIC_POSITION, components: 3, type: pc.TYPE_FLOAT32 }
        ]);
        // box
        var buffer = new pc.VertexBuffer(app.graphicsDevice, vertexFormat, 12 * 2);
        var iterator = new pc.VertexIterator(buffer);

        // top
        iterator.element[pc.SEMANTIC_POSITION].set(close * horiz, close * vert, 0);
        iterator.next();
        iterator.element[pc.SEMANTIC_POSITION].set(horiz, vert, -far);
        iterator.next();
        iterator.element[pc.SEMANTIC_POSITION].set(horiz, vert, -far);
        iterator.next();
        iterator.element[pc.SEMANTIC_POSITION].set(-horiz, vert, -far);
        iterator.next();
        iterator.element[pc.SEMANTIC_POSITION].set(-horiz, vert, -far);
        iterator.next();
        iterator.element[pc.SEMANTIC_POSITION].set(-close * horiz, close * vert, 0);
        iterator.next();
        iterator.element[pc.SEMANTIC_POSITION].set(-close * horiz, close * vert, 0);
        iterator.next();
        iterator.element[pc.SEMANTIC_POSITION].set(close * horiz, close * vert, 0);
        iterator.next();
        // bottom
        iterator.element[pc.SEMANTIC_POSITION].set(close * horiz, -close * vert, 0);
        iterator.next();
        iterator.element[pc.SEMANTIC_POSITION].set(horiz, -vert, -far);
        iterator.next();
        iterator.element[pc.SEMANTIC_POSITION].set(horiz, -vert, -far);
        iterator.next();
        iterator.element[pc.SEMANTIC_POSITION].set(-horiz, -vert, -far);
        iterator.next();
        iterator.element[pc.SEMANTIC_POSITION].set(-horiz, -vert, -far);
        iterator.next();
        iterator.element[pc.SEMANTIC_POSITION].set(-close * horiz, -close * vert, 0);
        iterator.next();
        iterator.element[pc.SEMANTIC_POSITION].set(-close * horiz, -close * vert, 0);
        iterator.next();
        iterator.element[pc.SEMANTIC_POSITION].set(close * horiz, -close * vert, 0);
        iterator.next();
        // sides
        iterator.element[pc.SEMANTIC_POSITION].set(close * horiz, -close * vert, 0);
        iterator.next();
        iterator.element[pc.SEMANTIC_POSITION].set(close * horiz, close * vert, 0);
        iterator.next();
        iterator.element[pc.SEMANTIC_POSITION].set(horiz, -vert, -far);
        iterator.next();
        iterator.element[pc.SEMANTIC_POSITION].set(horiz, vert, -far);
        iterator.next();
        iterator.element[pc.SEMANTIC_POSITION].set(-horiz, -vert, -far);
        iterator.next();
        iterator.element[pc.SEMANTIC_POSITION].set(-horiz, vert, -far);
        iterator.next();
        iterator.element[pc.SEMANTIC_POSITION].set(-close * horiz, -close * vert, 0);
        iterator.next();
        iterator.element[pc.SEMANTIC_POSITION].set(-close * horiz, close * vert, 0);
        iterator.next();
        iterator.end();
        // node
        var node = new pc.GraphNode();
        // mesh
        var mesh = new pc.Mesh();
        mesh.vertexBuffer = buffer;
        mesh.indexBuffer[0] = null;
        mesh.primitive[0].type = pc.PRIMITIVE_LINES;
        mesh.primitive[0].base = 0;
        mesh.primitive[0].count = buffer.getNumVertices();
        mesh.primitive[0].indexed = false;
        // meshInstance
        var meshInstance = new pc.MeshInstance(node, mesh, materialDefault);
        meshInstance.updateKey();
        // model
        cameraModel = new pc.Model();
        cameraModel.graph = node;
        cameraModel.meshInstances = [ meshInstance ];
    };

    // Creates user camera and binds to real time events
    var loadUserData = function (userId, data) {
        if (! cameraModel)
            createCameraModel();

        // add user camera
        var camera = cameras[userId] = new pc.Entity(app);
        camera.addComponent('model', {
            castShadows: false,
            receiveShadows: false,
            castShadowsLightmap: false
        });
        camera.model.model = cameraModel.clone();
        container.addChild(camera);

        var cameraInner = new pc.Entity(app);
        cameraInner.addComponent('model', {
            castShadows: false,
            receiveShadows: false,
            castShadowsLightmap: false
        });
        cameraInner.model.model = cameraModel.clone();
        cameraInner.model.model.meshInstances[0].material = materialBehind;
        camera.addChild(cameraInner);

        var cameraQuad = new pc.Entity(app);
        cameraQuad._userCamera = userId;
        cameraQuad.addComponent('model', {
            type: 'plane',
            castShadows: false,
            receiveShadows: false,
            castShadowsLightmap: false
        });
        cameraQuad.model.material = materialQuad;
        cameraQuad.rotate(90, 0, 0);
        cameraQuad.setLocalScale(close * horiz * 2, 1, close * vert * 2);
        camera.addChild(cameraQuad);

        var pos = data.cameras.perspective.position || [ 0, 0, 0 ];
        camera.setPosition(pos[0], pos[1], pos[2]);

        var rot = data.cameras.perspective.rotation || [ 0, 0, 0 ];
        camera.setEulerAngles(rot[0], rot[1], rot[2]);

        camera.pos = camera.getPosition().clone();
        camera.rot = camera.getRotation().clone();

        editor.call('viewport:render');

        // server > client
        var evt = editor.on('realtime:userdata:' + userId + ':op:cameras', function(op) {
            if (op.p.length !== 3 || ! op.oi || op.p[1] !== 'perspective')
                return;

            if (op.p[2] === 'position') {
                camera.pos.set(op.oi[0], op.oi[1], op.oi[2]);
                editor.call('viewport:render');
            } else if (op.p[2] === 'rotation') {
                camera.rot.setFromEulerAngles(op.oi[0], op.oi[1], op.oi[2]);
                editor.call('viewport:render');
            }
        });

        var unload = function () {
            if (evt) {
                evt.unbind();
                evt = null;
            }

            removeUser(userId);
        };

        editor.once('scene:unload', unload);
        editor.once('realtime:disconnected', unload);

        editor.call('users:loadOne', userId, function(user) {
            var dataNormal = editor.call('whoisonline:color', user.id, 'data');
            var colorNormal = new Float32Array([ dataNormal[0], dataNormal[1], dataNormal[2], 1 ]);
            camera.model.meshInstances[0].setParameter('uColor', colorNormal);
            camera.model.meshInstances[0].mask = GIZMO_MASK;

            var colorBehind = new Float32Array([ dataNormal[0], dataNormal[1], dataNormal[2], 0.15 ]);
            cameraInner.model.meshInstances[0].setParameter('uColor', colorBehind);
            cameraInner.model.meshInstances[0].mask = GIZMO_MASK;

            var dataLight = editor.call('whoisonline:color', user.id, 'data');
            var colorLight = new Float32Array([ dataLight[0], dataLight[1], dataLight[2], 0.25 ]);
            cameraQuad.model.meshInstances[0].setParameter('uColor', colorLight);
            cameraQuad.model.meshInstances[0].mask = GIZMO_MASK;
        });
    };

    // Add user who comes online
    editor.on('whoisonline:add', function (userId) {
        // ignore the logged in user
        if (userId === config.self.id) return;

        var add = function () {
            // do not add users without read access
            if (editor.call('permissions:read', userId))
                addUser(userId);

            // subscribe to project permission changes
            editor.on('permissions:set:' + userId, function () {
                if (editor.call('permissions:read', userId)) {
                    if (! userdata[userId]) {
                        // WORKAROUND
                        // wait a bit before adding, for userdata to be created at sharedb
                        setTimeout(function () {
                            addUser(userId);
                        }, 500);
                    }
                } else {
                    removeUser(userId);
                }
            });
        };

        if (!config.scene.id) {
            editor.once('scene:raw', add);
        } else {
            add();
        }

    });

    // Remove user who goes offline
    editor.on('whoisonline:remove', function (userId) {
        if (userId === config.self.id) return;

        removeUser(userId);
        editor.unbind('permissions:set:' + userId);
    });

    var vecA = new pc.Vec3();
    var vecB = new pc.Vec3();
    var quat = new pc.Quat();

    editor.on('viewport:update', function(dt) {
        var render = false;

        for(var id in cameras) {
            var camera = cameras[id];

            if (vecA.copy(camera.getPosition()).sub(camera.pos).length() > 0.01) {
                vecA.lerp(camera.getPosition(), camera.pos, 4 * dt);
                camera.setPosition(vecA);
                render = true;
            } else {
                camera.setPosition(camera.pos);
            }

            vecA.set(0, 0, -1);
            vecB.set(0, 0, -1);
            camera.getRotation().transformVector(vecA, vecA);
            camera.rot.transformVector(vecB, vecB);

            if (vecA.dot(vecB) < 0.999) {
                quat = camera.getRotation().slerp(camera.getRotation(), camera.rot, 8 * dt);
                camera.setRotation(quat);
                render = true;
            } else {
                camera.setRotation(camera.rot);
            }
        }

        if (render)
            editor.call('viewport:render');
    });
});


/* editor/viewport/viewport-context-menu.js */
editor.once('load', function() {
    'use strict';

    var currentEntity = null;
    var root = editor.call('layout.root');

    // create data for entity menu
    var menu;

    // wait until all entities are loaded
    // before creating the menu to make sure
    // that the menu data for entities have been created
    editor.once('entities:load', function () {
        
        var menuData = { };
        var entityMenuData = editor.call('menu:get', 'entity');
        if (entityMenuData) {
            for (var key in entityMenuData.items) {
                menuData[key] = entityMenuData.items[key];
            }
        }

        // TODO
        // menuData['enable'] = {
        //     title: 'Enable',
        //     icon: '&#58421;',
        //     hide: function () {
        //         return currentEntity.get('enabled');
        //     },
        //     select: function() {
        //         currentEntity.set('enabled', true);
        //     }
        // };

        // menuData['disable'] = {
        //     title: 'Disable',
        //     icon: '&#58422;',
        //     hide: function () {
        //         return !currentEntity.get('enabled');
        //     },
        //     select: function() {
        //         currentEntity.set('enabled', false);
        //     }
        // };

        // menuData['copy'] = {
        //     title: 'Copy',
        //     icon: '&#57891;',
        //     select: function() {
        //         editor.call('entities:copy', currentEntity);
        //     }
        // };

        // menuData['paste'] = {
        //     title: 'Paste',
        //     icon: '&#57892;',
        //     filter: function () {
        //         return !editor.call('entities:clipboard:empty');
        //     },
        //     select: function() {
        //         editor.call('entities:paste', currentEntity);
        //     }
        // };

        // menuData['duplicate'] = {
        //     title: 'Duplicate',
        //     icon: '&#57908;',
        //     filter: function () {
        //         return currentEntity !== editor.call('entities:root');
        //     },
        //     select: function() {
        //         editor.call('entities:duplicate', currentEntity);
        //     }
        // };

        // menuData['delete'] = {
        //     title: 'Delete',
        //     icon: '&#58657;',
        //     filter: function () {
        //         return currentEntity !== editor.call('entities:root');
        //     },
        //     select: function() {
        //         editor.call('entities:delete', currentEntity);
        //     }
        // };


        // menu
        menu = ui.Menu.fromData(menuData);
        root.append(menu);
    });

    editor.method('viewport:contextmenu', function (x, y, entity) {
        if (! editor.call('permissions:write'))
            return;

        currentEntity = entity;
        menu.open = true;
        menu.position(x + 1, y);
    });
});


/* editor/viewport/viewport-tap.js */
editor.once('load', function() {
    'use strict';

    var canvas = editor.call('viewport:canvas');
    if (! canvas) return;

    function Tap(evt, rect, mouse) {
        this.x = this.lx = this.sx = evt.clientX - rect.left;
        this.y = this.ly = this.sy = evt.clientY - rect.top;
        this.nx = 0;
        this.ny = 0;
        this.move = false;
        this.down = true;
        this.button = evt.button;
        this.mouse = !! mouse;
    };
    Tap.prototype.update = function(evt, rect) {
        var x = evt.clientX - rect.left;
        var y = evt.clientY - rect.top;

        // if it's moved
        if (this.down && ! this.move && (Math.abs(this.sx - x) + Math.abs(this.sy - y)) > 8)
            this.move = true;

        // moving
        if (this.move) {
            this.nx = x - this.lx;
            this.ny = y - this.ly;
            this.lx = this.x;
            this.ly = this.y;
        }

        // coords
        this.x = x;
        this.y = y;
    };

    var taps = [ ];
    // var tapMouse = new Tap({ clientX: 0, clientY: 0 }, { left: 0, top: 0 });
    var inViewport = false;

    editor.method('viewport:inViewport', function() {
        return inViewport;
    });

    var evtMouseMove = function(evt) {
        var rect = canvas.element.getBoundingClientRect();
        for(var i = 0; i < taps.length; i++) {
            if (! taps[i].mouse)
                continue;

            taps[i].update(evt, rect);
            editor.emit('viewport:tap:move', taps[i], evt);
        }

        editor.emit('viewport:mouse:move', {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top,
            down: taps.length !== 0
        });

        // render if mouse moved within viewport
        if (evt.clientX >= rect.left && evt.clientX <= rect.right && evt.clientY >= rect.top && evt.clientY <= rect.bottom) {
            if (! inViewport) {
                inViewport = true;
                editor.emit('viewport:hover', true);
            }
            editor.call('viewport:render');
        } else if (inViewport) {
            inViewport = false;
            editor.emit('viewport:hover', false);
            editor.call('viewport:render');
        }
    };

    var evtMouseUp = function(evt) {
        var items = taps.slice(0);

        for(var i = 0; i < items.length; i++) {
        // if (tapMouse.down) {
            if (! items[i].mouse || ! items[i].down || items[i].button !== evt.button)
                continue;

            items[i].down = false;
            items[i].update(evt, canvas.element.getBoundingClientRect());
            editor.emit('viewport:tap:end', items[i], evt);

            if (! items[i].move)
                editor.emit('viewport:tap:click', items[i], evt);

            var ind = taps.indexOf(items[i]);
            if (ind !== -1)
                taps.splice(ind, 1);
        }

        var rect = canvas.element.getBoundingClientRect();

        editor.emit('viewport:mouse:move', {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top,
            down: taps.length !== 0
        });
    };

    canvas.element.addEventListener('mousedown', function(evt) {
        var rect = canvas.element.getBoundingClientRect();

        editor.emit('viewport:mouse:move', {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top,
            down: true
        });

        var tap = new Tap(evt, rect, true)
        taps.push(tap);

        editor.emit('viewport:tap:start', tap, evt);

        if (document.activeElement && document.activeElement.tagName.toLowerCase() === 'input')
            document.activeElement.blur();

        evt.preventDefault();
    }, false);

    canvas.element.addEventListener('mouseover', function() {
        editor.emit('viewport:hover', true);
        editor.call('viewport:render');
    }, false);

    canvas.element.addEventListener('mouseleave', function(evt) {
        // ignore tooltip
        var target = evt.toElement || evt.relatedTarget;
        if (target && target.classList.contains('cursor-tooltip'))
            return;

        editor.emit('viewport:hover', false);
        editor.call('viewport:render');
    }, false);

    window.addEventListener('mousemove', evtMouseMove, false);
    window.addEventListener('dragover', evtMouseMove, false);
    window.addEventListener('mouseup', evtMouseUp, false);
});


/* editor/viewport/viewport-pick.js */
editor.once('load', function() {
    'use strict';

    var app = editor.call('viewport:app');
    if (! app) return; // webgl not available

    var picker = new pc.Picker(app.graphicsDevice, 1, 1);
    var pickedData = {
        node: null,
        picked: null
    };
    var mouseCoords = new pc.Vec2();
    var mouseTap = false;
    var inViewport = false;
    var picking = true;
    var filter = null;
    var mouseDown = false;

    editor.method('viewport:pick:filter', function(fn) {
        if (filter === fn)
            return;

        filter = fn;
    });

    editor.method('viewport:pick:state', function(state) {
        picking = state;
    });

    editor.on('viewport:update', function() {
        if (! mouseDown && ! inViewport && pickedData.node) {
            pickedData.node = null;
            pickedData.picked = null;
            editor.emit('viewport:pick:hover', null, null);
        }

        if (! inViewport || ! picking)
            return;

        // pick
        editor.call('viewport:pick', mouseCoords.x, mouseCoords.y, function(node, picked) {
            if (pickedData.node !== node || pickedData.picked !== picked) {
                pickedData.node = node;
                pickedData.picked = picked;

                editor.emit('viewport:pick:hover', pickedData.node, pickedData.picked);
            }
        });
    });

    editor.on('viewport:hover', function(hover) {
        inViewport = hover;
    });

    editor.on('viewport:resize', function(width, height) {
        picker.resize(width, height);
    });

    editor.method('viewport:pick', function(x, y, fn) {
        var scene = app.scene;

        // if (filter) {
        //     scene = {
        //         drawCalls: app.scene.drawCalls.filter(filter)
        //     };
        // }

        // prepare picker
        picker.prepare(editor.call('camera:current').camera, scene);

        // pick node
        var picked = picker.getSelection(x, y);

        if (! picked.length || ! picked[0]) {
           fn(null, null);
        } else {
            var node = picked[0].node;

            // traverse to pc.Entity
            while (! (node instanceof pc.Entity) && node && node.parent) {
                node = node.parent;
            }
            if (! node || !(node instanceof pc.Entity)) return;

            fn(node, picked[0]);
        }
    });

    editor.on('viewport:tap:start', function(tap) {
        if (! tap.mouse) return;

        mouseDown = true;
    });

    editor.on('viewport:tap:end', function(tap) {
        if (! tap.mouse) return;

        mouseDown = false;

        if (! inViewport && pickedData.node) {
            pickedData.node = null;
            pickedData.picked = null;
            editor.emit('viewport:pick:hover', null, null);
        }
    });

    editor.on('viewport:mouse:move', function(tap) {
        mouseCoords.x = tap.x;
        mouseCoords.y = tap.y;
    });

    editor.on('viewport:tap:click', function(tap) {
        if (! inViewport || (tap.mouse && tap.button !== 0))
            return;

        if (pickedData.node) {
            editor.emit('viewport:pick:node', pickedData.node, pickedData.picked);
        } else {
            editor.call('viewport:pick', tap.x, tap.y, function(node, picked) {
                if (pickedData.node !== node || pickedData.picked !== picked) {
                    pickedData.node = node;
                    pickedData.picked = picked;
                }

                if (pickedData.node) {
                    editor.emit('viewport:pick:node', pickedData.node, pickedData.picked);
                } else {
                    editor.emit('viewport:pick:clear');
                }
            });
        }
    });

    editor.on('scene:unload', function () {
        // this is needed to clear the picker layer composition
        // from any mesh instances that are no longer there...
        if (picker) {
            picker.layer._dirty = true;
        }
    });
});


/* editor/viewport/viewport-cursor.js */
editor.once('load', function() {
    'use strict';

    var state = false;
    var inViewport = false;

    // mouse hovering state on viewport
    editor.on('viewport:hover', function(hover) {
        if (inViewport === hover)
            return;

        inViewport = hover;

        if (! inViewport) {
            state = false;

            if (! editor.call('drop:active'))
                editor.call('cursor:set', '');
        }
    });

    var checkPicked = function(node, picked) {
        var hover = false;

        // if mouse in viewport && entity model has an asset
        // then set cursor to 'crosshair' to indicate
        // that next click will select node in model asset
        if (inViewport && node && node.model && node.model.asset && node.model.model) {
            if (editor.call('selector:type') === 'entity' &&
                editor.call('selector:count') === 1 &&
                editor.call('selector:items')[0].entity === node) {

                hover = true;
            }
        }

        // change cursor if needed
        if (state !== hover) {
            state = hover;
            editor.call('cursor:set', state ? 'crosshair' : '');
        }
    }

    editor.on('viewport:pick:node', checkPicked)
    editor.on('viewport:pick:hover', checkPicked);
});


/* editor/viewport/viewport-tooltips.js */
editor.once('load', function() {
    'use strict';

    var inViewport = false;
    var nameLast = '';
    var timeout = null;
    var pickedLast = null;
    var nodeLast = null;
    var delay = 500;

    editor.on('viewport:hover', function(state) {
        inViewport = state;

        if (! inViewport) {
            nameLast = '';
            pickedLast = null;
            nodeLast = null;
            editor.call('cursor:text', '');
            clearTimeout(timeout);
        }
    });

    var showTooltip = function() {
        editor.call('cursor:text', nameLast);
    };

    var checkPicked = function(node, picked) {
        var name = '';

        if (inViewport && node) {
            if (node._icon) {
                // icon
                var entity = node._getEntity && node._getEntity();
                if (entity)
                    name = entity.name;
            } else if (node._userCamera) {
                name = '@';
                editor.call('users:loadOne', node._userCamera, function(data) {
                    name = '@' + (data && data.username || 'anonymous');
                });
            } else if (node.model && node.model.asset && node.model.model && picked && picked.node) {
                // entity model meshInstance
                name = node.name + ' &#8594; ' + picked.node.name;
            } else {
                // normal entity
                if (editor.call('entities:get', node.getGuid()))
                    name = node.name;
            }
        }

        if (nodeLast !== node || pickedLast !== picked || nameLast !== name) {
            editor.call('cursor:text', '');
            clearTimeout(timeout);
            if (nameLast || name)
                timeout = setTimeout(showTooltip, delay);
        }

        if (nameLast !== name)
            nameLast = name;

        if (pickedLast !== picked)
            pickedLast = picked;

        if (nodeLast !== node)
            nodeLast = node;
    };

    editor.on('viewport:pick:node', checkPicked)
    editor.on('viewport:pick:hover', checkPicked);
});


/* editor/viewport/viewport-focus.js */
editor.once('load', function() {
    'use strict';

    var app = editor.call('viewport:app');
    if (! app) return; // webgl not available

    var defaultSize = new pc.Vec3(1, 1, 1);
    var defaultSizeSmall = new pc.Vec3(.2, .2, .2);
    var aabb = new pc.BoundingBox();
    var aabbA = new pc.BoundingBox();

    var calculateChildAABB = function(entity) {
        aabbA.add(editor.call('entities:getBoundingBoxForEntity', entity));

        var children = entity.children;
        for(var i = 0; i < children.length; i++) {
            if (! (children[i] instanceof pc.Entity) || children[i].__editor)
                continue;

            calculateChildAABB(children[i]);
        }
    };

    editor.method('selection:aabb', function() {
        if (editor.call('selector:type') !== 'entity')
            return null;

        return editor.call('entities:aabb', editor.call('selector:items'));
    });

    editor.method('entities:aabb', function(items) {
        if (! items)
            return null;

        if (! (items instanceof Array))
            items = [ items ];

        aabb.center.set(0, 0, 0);
        aabb.halfExtents.copy(defaultSizeSmall);

        // calculate aabb for selected entities
        for(var i = 0; i < items.length; i++) {
            var entity = items[i].entity;

            if (! entity)
                continue;

            aabbA.center.copy(entity.getPosition());
            aabbA.halfExtents.copy(defaultSizeSmall);
            calculateChildAABB(entity);

            if (i === 0) {
                aabb.copy(aabbA);
            } else {
                aabb.add(aabbA);
            }
        }

        return aabb;
    });

    editor.method('viewport:focus', function() {
        var selection = editor.call('selection:aabb');
        if (! selection) return;

        var camera = editor.call('camera:current');

        // aabb
        var distance = Math.max(aabb.halfExtents.x, Math.max(aabb.halfExtents.y, aabb.halfExtents.z));
        // fov
        distance = (distance / Math.tan(0.5 * camera.camera.fov * Math.PI / 180.0));
        // extra space
        distance = distance * 1.1 + 1;

        editor.call('camera:focus', aabb.center, distance);
    });
});


/* editor/viewport/viewport-outline.js */
editor.once('load', function() {
    'use strict';

    var app = editor.call('viewport:app');
    if (! app) return; // webgl not available

    var renderer = app.renderer;
    var device = renderer.device;
    var scene = app.scene;

    var users = [ ];
    var selection = { };
    var colors = { };
    var colorUniform = new Float32Array(3);
    var render = 0;
    var cleared = false;
    var visible = true;
    var viewportLayer = null

    var targets = [ ];
    var textures = [ ];

    var createSolidTex = function (name, r, g, b, a) {
        var result = new pc.Texture(app.graphicsDevice, { width: 1, height: 1, format: pc.PIXELFORMAT_R8_G8_B8_A8 });
        result.name = name;
        var pixels = result.lock();
        pixels.set(new Uint8Array([r, g, b, a]));
        result.unlock();
        return result;
    };

    var whiteTex = createSolidTex('outline-tex', 255, 255, 255, 255);

    var SHADER_OUTLINE = 24;

    editor.on('selector:change', function(type, items) {
        if (selection[config.self.id])
            render -= selection[config.self.id].length;

        if (! selection[config.self.id])
            users.unshift(config.self.id);

        selection[config.self.id] = [ ];

        if (type === 'entity') {
            for(var i = 0; i < items.length; i++) {
                var modelType = items[i].get('components.model.type');
                if (items[i].entity && (modelType === 'asset' && items[i].get('components.model.asset')) || modelType !== 'asset') {
                    selection[config.self.id].push(items[i].entity);
                    render++;
                    if (!viewportLayer.enabled) {
                        viewportLayer.enabled = true;
                    }
                }
            }
        }

        if (render)
            editor.call('viewport:render');
    });

    editor.on('selector:sync', function(user, data) {
        if (selection[user])
            render -= selection[user].length;

        if (! selection[user])
            users.push(user);

        selection[user] = [ ];

        if (data.type === 'entity') {
            for(var i = 0; i < data.ids.length; i++) {
                var entity = editor.call('entities:get', data.ids[i]);
                if (! entity) continue;

                var modelType = entity.get('components.model.type');
                if (entity.entity && (modelType === 'asset' && entity.get('components.model.asset')) || modelType !== 'asset') {
                    selection[user].push(entity.entity);
                    render++;
                    if (!viewportLayer.enabled) {
                        viewportLayer.enabled = true;
                    }
                }
            }
        }

        if (render)
            editor.call('viewport:render');
    });

    editor.on('whoisonline:remove', function(id) {
        if (! selection[id])
            return;

        render -= selection[id].length;

        delete selection[id];
        delete colors[id];
        var ind = users.indexOf(id);
        users.splice(ind, 1);
    });

    editor.method('viewport:outline:visible', function(state) {
        if (state !== visible) {
            visible = state;
            render++;
            editor.call('viewport:render');
        }
    });

    // ### OVERLAY QUAD MATERIAL ###
    var chunks = pc.shaderChunks;
    var shaderFinal = chunks.createShaderFromCode(device, chunks.fullscreenQuadVS, chunks.outputTex2DPS, "outputTex2D");

    // ### OUTLINE EXTEND SHADER H ###
    var shaderBlurHPS = ' \
        precision ' + device.precision + ' float;\n \
        varying vec2 vUv0;\n \
        uniform float uOffset;\n \
        uniform sampler2D source;\n \
        void main(void)\n \
        {\n \
            float diff = 0.0;\n \
            vec4 pixel;\n \
            vec4 texel = texture2D(source, vUv0);\n \
            vec4 firstTexel = texel;\n \
            \n \
            pixel = texture2D(source, vUv0 + vec2(uOffset * -2.0, 0.0));\n \
            texel = max(texel, pixel);\n \
            diff = max(diff, length(firstTexel.rgb - pixel.rgb));\n \
            \n \
            pixel = texture2D(source, vUv0 + vec2(uOffset * -1.0, 0.0));\n \
            texel = max(texel, pixel);\n \
            diff = max(diff, length(firstTexel.rgb - pixel.rgb));\n \
            \n \
            pixel = texture2D(source, vUv0 + vec2(uOffset * +1.0, 0.0));\n \
            texel = max(texel, pixel);\n \
            diff = max(diff, length(firstTexel.rgb - pixel.rgb));\n \
            \n \
            pixel = texture2D(source, vUv0 + vec2(uOffset * +2.0, 0.0));\n \
            texel = max(texel, pixel);\n \
            diff = max(diff, length(firstTexel.rgb - pixel.rgb));\n \
            \n \
            gl_FragColor = vec4(texel.rgb, min(diff, 1.0));\n \
        }\n';
    var shaderBlurH = chunks.createShaderFromCode(device, chunks.fullscreenQuadVS, shaderBlurHPS, "editorOutlineH");

    // ### OUTLINE EXTEND SHADER V ###
    var shaderBlurVPS = ' \
        precision ' + device.precision + ' float;\n \
        varying vec2 vUv0;\n \
        uniform float uOffset;\n \
        uniform sampler2D source;\n \
        void main(void)\n \
        {\n \
            vec4 pixel;\n \
            vec4 texel = texture2D(source, vUv0);\n \
            vec4 firstTexel = texel;\n \
            float diff = texel.a;\n \
            \n \
            pixel = texture2D(source, vUv0 + vec2(0.0, uOffset * -2.0));\n \
            texel = max(texel, pixel);\n \
            diff = max(diff, length(firstTexel.rgb - pixel.rgb));\n \
            \n \
            pixel = texture2D(source, vUv0 + vec2(0.0, uOffset * -1.0));\n \
            texel = max(texel, pixel);\n \
            diff = max(diff, length(firstTexel.rgb - pixel.rgb));\n \
            \n \
            pixel = texture2D(source, vUv0 + vec2(0.0, uOffset * +1.0));\n \
            texel = max(texel, pixel);\n \
            diff = max(diff, length(firstTexel.rgb - pixel.rgb));\n \
            \n \
            pixel = texture2D(source, vUv0 + vec2(0.0, uOffset * +2.0));\n \
            texel = max(texel, pixel);\n \
            diff = max(diff, length(firstTexel.rgb - pixel.rgb));\n \
            \n \
            gl_FragColor = vec4(texel.rgb, min(diff, 1.0));\n \
        }\n';
    var shaderBlurV = chunks.createShaderFromCode(device, chunks.fullscreenQuadVS, shaderBlurVPS, "editorOutlineV");


    // ### SETUP THE LAYER ###
    viewportLayer = editor.call('gizmo:layers', 'Viewport Outline');
    viewportLayer.onPostRender = function () {
        var uColorBuffer = device.scope.resolve('source');
        uColorBuffer.setValue(textures[0]);
        device.setBlending(true);
        device.setBlendFunction(pc.BLENDMODE_SRC_ALPHA, pc.BLENDMODE_ONE_MINUS_SRC_ALPHA);
        pc.drawQuadWithShader(device, null, shaderFinal, null, null, true);
    };

    var outlineLayer = new pc.Layer({
        name: "Outline",
        opaqueSortMode: pc.SORTMODE_NONE,
        passThrough: true,
        overrideClear: true,
        clearColorBuffer: true,
        clearDepthBuffer: true,
        clearColor: new pc.Color(0,0,0,0),
        shaderPass: SHADER_OUTLINE,

        onPostRender: function() {
            // extend pass X
            var uOffset = device.scope.resolve('uOffset');
            var uColorBuffer = device.scope.resolve('source');
            uOffset.setValue(1.0 / device.width / 2.0);
            uColorBuffer.setValue(textures[0]);
            pc.drawQuadWithShader(device, targets[1], shaderBlurH);

            // extend pass Y
            uOffset.setValue(1.0 / device.height / 2.0);
            uColorBuffer.setValue(textures[1]);
            pc.drawQuadWithShader(device, targets[0], shaderBlurV);
        }
    });
    var outlineComp = new pc.LayerComposition();
    outlineComp.pushOpaque(outlineLayer);

    var onUpdateShaderOutline = function(options) {
        if (options.pass !== SHADER_OUTLINE) return options;
        var outlineOptions = {
            opacityMap:                 options.opacityMap,
            opacityMapUv:               options.opacityMapUv,
            opacityMapChannel:          options.opacityMapChannel,
            opacityMapTransform:        options.opacityMapTransform,
            opacityVertexColor:         options.opacityVertexColor,
            opacityVertexColorChannel:  options.opacityVertexColorChannel,
            vertexColors:               options.vertexColors,
            alphaTest:                  options.alphaTest,
            skin:                       options.skin
        }
        return outlineOptions;
    };

    // ### RENDER EVENT ###
    editor.on('viewport:postUpdate', function() {
        if (! render && cleared) return;

        if (!render && !cleared) {
            viewportLayer.enabled = false;
        }

        // ### INIT/RESIZE RENDERTARGETS ###
        if (targets[0] && (targets[0].width !== device.width || targets[1].height !== device.height)) {
            for(var i = 0; i < 2; i++) {
                targets[i].destroy();
                textures[i].destroy();
            }
            targets = [ ];
            textures = [ ];
        }
        if (! targets[0]) {
            for(var i = 0; i < 2; i++) {
                textures[i] = new pc.Texture(device, {
                    format: pc.PIXELFORMAT_R8_G8_B8_A8,
                    width: device.width,
                    height: device.height
                });
                textures[i].minFilter = pc.FILTER_NEAREST;
                textures[i].magFilter = pc.FILTER_NEAREST;
                textures[i].addressU = pc.ADDRESS_CLAMP_TO_EDGE;
                textures[i].addressV = pc.ADDRESS_CLAMP_TO_EDGE;

                targets[i] = new pc.RenderTarget(device, textures[i]);
            }
        }


        var camera = editor.call('camera:current').camera;


        if (render) {
            // ### RENDER COLORED MESHINSTANCES TO RT0 ###

            outlineLayer.renderTarget = targets[0];
            outlineLayer.clearMeshInstances();
            if (outlineLayer.cameras[0] !== camera) {
                outlineLayer.clearCameras();
                outlineLayer.addCamera(camera);
            }
            var meshInstances = outlineLayer.opaqueMeshInstances;

            if (visible) {
                for(var u = 0; u < users.length; u++) {
                    var id = parseInt(users[u], 10);

                    if (! selection.hasOwnProperty(id) || ! selection[id].length)
                        continue;

                    var color = colors[id];
                    if (!color) {
                        var data = editor.call('whoisonline:color', id, 'data');

                        if (config.self.id === id)
                            data = [ 1, 1, 1 ];

                        colors[id] = new pc.Color(data[0], data[1], data[2]);
                        color = colors[id];
                    }

                    for(var i = 0; i < selection[id].length; i++) {
                        if (! selection[id][i])
                            continue;

                        var model = selection[id][i].model;
                        if (! model || ! model.model)
                            continue;

                        var meshes = model.meshInstances;
                        for(var m = 0; m < meshes.length; m++) {
                            //var opChan = 'r';
                            var instance = meshes[m];

                            //if (! instance.command && instance.drawToDepth && instance.material && instance.layer === pc.LAYER_WORLD) {
                            if (!instance.command && instance.material) {

                                instance.onUpdateShader = onUpdateShaderOutline;
                                colorUniform[0] = color.r;
                                colorUniform[1] = color.g;
                                colorUniform[2] = color.b;
                                instance.setParameter("material_emissive", colorUniform, 1<<SHADER_OUTLINE);
                                instance.setParameter("texture_emissiveMap", whiteTex, 1 << SHADER_OUTLINE);
                                meshInstances.push(instance);
                            }
                        }
                    }
                }
            }

            app.renderer.renderComposition(outlineComp);

            cleared = false;
        } else {
            cleared = true;
        }
    });
});


/* editor/viewport/viewport-i18n.js */
editor.once('load', function () {
    'use strict';

    var projectSettings = editor.call('settings:project');
    var projectUserSettings = editor.call('settings:projectUser');

    var app = editor.call('viewport:app');

    var assetIndex = {};

    var refreshI18nAssets = function () {
        assetIndex = {};
        var assets = projectSettings.get('i18nAssets') || [];
        assets.forEach(function (id) {
            assetIndex[id] = true;

            var engineAsset = app.assets.get(id);
            if (engineAsset && !engineAsset.resource) {
                app.assets.load(engineAsset);
            }
        });
        app.i18n.assets = assets;
        editor.call('viewport:render');
    };

    projectSettings.on('i18nAssets:set', refreshI18nAssets);
    projectSettings.on('i18nAssets:insert', refreshI18nAssets);
    projectSettings.on('i18nAssets:remove', refreshI18nAssets);

    projectUserSettings.on('editor.locale:set', function (value) {
        if (value) {
            app.i18n.locale = value;
            editor.call('viewport:render');
        }
    });

    // initialize localization
    var renderFrame = false;
    if (config.project.settings.i18nAssets) {
        refreshI18nAssets();
        renderFrame = true;
    }
    if (config.self.locale) {
        app.i18n.locale = config.self.locale;
        renderFrame = true;
    }

    if (renderFrame) {
        editor.call('viewport:render');
    }

    // make sure all localization assets are loaded
    // regardless of their preload flag
    editor.on('assets:add', function (asset) {
        var id = asset.get('id');
        if (assetIndex[id]) {
            var engineAsset = app.assets.get(id);
            if (engineAsset) {
                app.assets.load(engineAsset);
            }
        }
    });

});