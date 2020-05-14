


/* editor/entities/entities-components-menu.js */
editor.once('load', function() {
    'use strict';

    var logos = editor.call('components:logos');

    editor.method('menu:entities:add-component', function () {
        // Create empty menu with sub-menus
        var items = {
            // 'audio-sub-menu': {
            //     title: 'Audio',
            //     icon: logos.sound,
            //     items: {}
            // },
            'ui-sub-menu': {
                title: 'User Interface',
                icon: logos.userinterface,
                items: {}
            }
        };

        // fill menu with available components
        var components = editor.call('components:schema');
        var list = editor.call('components:list');

        for (var i = 0; i < list.length; i++) {
            var key = list[i];
            var submenu = getSubMenu(key);
            if (submenu) {
                items[submenu].items[key] = makeAddComponentMenuItem(key, components, logos);
            } else {
                items[key] = makeAddComponentMenuItem(key, components, logos);
            }
        }

        // sort alphabetically and add to new object to be returned
        var orderedKeys = Object.keys(items).sort();
        var sorted = {};
        for (var i = 0; i < orderedKeys.length; i++) {
            sorted[orderedKeys[i]] = items[orderedKeys[i]];
        }

        return sorted;
    });

    var getSubMenu = function (key) {
        if (['audiolistener', 'sound'].indexOf(key) >= 0) return 'audio-sub-menu';
        if (['css'].indexOf(key) >= 0) return 'ui-sub-menu';

        return null;
    };

    // Get Entites on which to apply the result of the context menu
    // If the entity that is clicked on is part of a selection, then the entire
    // selection is returned.
    // Otherwise return just the entity that is clicked on.
    var getSelection = function() {
        var selection = editor.call('selector:items');
        var entity = editor.call('entities:contextmenu:entity');

        if (entity) {
            if (selection.indexOf(entity) !== -1) {
                return selection;
            } else {
                return [entity];
            }
        } else {
            return selection;
        }
    };

    var makeAddComponentMenuItem = function (key, components, logos) {
        var data = {
            title: components[key].$title,
            icon: logos[key],
            filter: function () {
                // if any entity in the selection does not have the component
                // then it should be available to add
                var selection = getSelection();
                var name = 'components.' + key;
                for (var i = 0, len = selection.length; i < len; i++) {
                    if (!selection[i].has(name)) {
                        return true;
                    }
                }

                // disable component in menu
                return false;
            },

            select: function () {
                var selection = getSelection();
                editor.call('entities:addComponent', selection, this._value)
            }
        };

        if (key === 'audiosource') {
            data.hide = function () {
                return !editor.call('settings:project').get('useLegacyAudio');
            };
        }

        return data;
    };
});


/* editor/entities/entities-template-menu.js */
editor.once('load', function () {
    'use strict';

    const templateItems = {};

    // Get Entites on which to apply the result of the context menu
    // If the entity that is clicked on is part of a selection, then the entire
    // selection is returned.
    // Otherwise return just the entity that is clicked on.
    function getSelection() {
        var selection = editor.call('selector:items');
        var entity = editor.call('entities:contextmenu:entity');

        if (entity) {
            if (selection.indexOf(entity) !== -1) {
                return selection;
            }

            return [entity];
        }

        return selection;
    }

    templateItems['new_template'] = {
        title: 'New Template',
        className: 'menu-item-template',
        icon: '&#57632;',
        filter: function () {
            const selection = getSelection();
            return selection.length === 1 && selection[0].get('parent');
        },
        select: function () {
            editor.call('assets:create:template', getSelection()[0]);
        }
    };

    templateItems['template_apply'] = {
        title: 'Apply to Template',
        className: 'menu-item-template-apply',
        icon: '&#57651;',
        filter: function () {
            const selection = getSelection();
            return selection.length === 1 && selection[0].get('template_id');
        },
        select: function () {
            editor.call('templates:apply', getSelection()[0]);
        }
    };

    templateItems['template_unlink'] = {
        title: 'Unlink From Template',
        className: 'menu-item-template-unlink',
        icon: '&#58200;',
        filter: function () {
            const selection = getSelection();
            return selection.length === 1 && selection[0].get('template_id');
        },
        select: function () {
            editor.call('templates:unlink', getSelection()[0]);
        }
    };

    templateItems['template_instance'] = {
        title: 'Add Instance',
        className: 'menu-item-template-instance',
        icon: '&#57632;',
        filter: function () {
            return getSelection().length === 1;
        },
        select: function () {
            if (! editor.call('permissions:write')) {
                return;
            }

            editor.call('picker:asset', {
                type: 'template'
            });

            var evtPick = editor.once('picker:asset', function (asset) {
                let newEntity;

                function undo() {
                    const entity = newEntity.latest();
                    if (entity) {
                        editor.call('entities:removeEntity', entity);
                    }
                }

                function redo() {
                    newEntity = editor.call('template:addInstance', asset, getSelection()[0]);

                    // select entity
                    setTimeout(() => {
                        editor.call('selector:history', false);
                        editor.call('selector:set', 'entity', [newEntity]);
                        editor.once('selector:change', () => {
                            editor.call('selector:history', true);
                        });
                    });
                }

                editor.call('history:add', {
                    name: 'add template instance',
                    undo: undo,
                    redo: redo
                });

                redo();
            });

            editor.once('picker:asset:close', function () {
                if (evtPick) {
                    evtPick.unbind();
                    evtPick = null;
                }
            });
        }
    };

    editor.method('menu:entities:template', function () {
        return templateItems;
    });
});


/* editor/entities/entities-pick.js */
editor.once('load', function() {
    'use strict';

    editor.on('viewport:pick:clear', function() {
        if (! editor.call('hotkey:ctrl'))
            editor.call('selector:clear');
    });

    editor.on('viewport:pick:node', function(node, picked) {
        // icon
        if (node._icon || (node.__editor && node._getEntity)) {
            node = node._getEntity();
            if (! node) return;
        }

        // get entity
        var entity = editor.call('entities:get', node.getGuid());
        if (! entity) return;

        // get selector data
        var type = editor.call('selector:type');
        var items = editor.call('selector:items');

        if (type === 'entity' && items.length === 1 && items.indexOf(entity) !== -1 && ! editor.call('hotkey:ctrl')) {
            // if entity already selected
            // try selecting model asset
            // with highlighting mesh instance
            if (node.model && node.model.type === 'asset' && node.model.model) {
                var meshInstances = node.model.model.meshInstances;

                for(var i = 0; i < meshInstances.length; i++) {
                    var instance = meshInstances[i];

                    if (instance !== picked && instance !== picked._staticSource)
                        continue;

                    var index = i;

                    // if the model component has a material mapping then
                    // open the model component otherwise go to the model asset
                    if (node.model.mapping && node.model.mapping[i] !== undefined) {
                        editor.call('selector:set', 'entity', [entity]);
                    } else {
                        // get model asset
                        var asset = editor.call('assets:get', node.model.asset);
                        if (! asset) break;

                        // select model asset
                        editor.call('selector:set', 'asset', [ asset ]);
                    }

                    // highlight selected node
                    setTimeout(function() {
                        var node = editor.call('attributes.rootPanel').dom.querySelector('.pcui-asset-input.node-' + index);
                        if (node) {
                            node.classList.add('active');
                        }
                    }, 200);

                    break;
                }
            }
        } else {
            // select entity
            if (type === 'entity' && editor.call('hotkey:ctrl')) {
                // with ctrl
                if (items.indexOf(entity) !== -1) {
                    // deselect
                    editor.call('selector:remove', entity);
                } else {
                    // add to selection
                    editor.call('selector:add', 'entity', entity);
                }
            } else {
                // set selection
                editor.call('selector:set', 'entity', [ entity ]);
            }
        }
    })
});


/* editor/entities/entities-icons.js */


/* editor/entities/entities-gizmo-translate.js */
editor.once('load', function() {
    'use strict';

    var events = [ ];
    var items = [ ];
    var quat = new pc2d.Quat();
    var vecA = new pc2d.Vec3();
    var vecB = new pc2d.Vec3();
    var vecC = new pc2d.Vec3();
    var startPosition = new pc2d.Vec3();
    var timeoutUpdatePosition, timeoutUpdateRotation;
    var coordSystem = 'world';
    var app;
    var gizmoMoving = false;
    var gizmoAxis, gizmoPlane;
    var movingStart = new pc2d.Vec3();
    var linesColorActive = new pc2d.Color(1, 1, 1, 1);
    var linesColor = new pc2d.Color(1, 1, 1, .2);
    var linesColorBehind = new pc2d.Color(1, 1, 1, .05);
    var immediateRenderOptions;
    var brightImmediateRenderOptions;

    editor.on('gizmo:coordSystem', function(system) {
        if (coordSystem === system)
            return;

        coordSystem = system;

        var pos = getGizmoPosition();
        if (pos)
            editor.call('gizmo:translate:position', pos.x, pos.y, pos.z);

        var rot = getGizmoRotation();
        if (rot)
            editor.call('gizmo:translate:rotation', rot[0], rot[1], rot[2]);

        editor.call('viewport:render');
    });

    // get position of gizmo based on selected entities
    var getGizmoPosition = function() {
        if (! items.length)
            return;

        if (items.length === 1) {
            if (items[0].obj.entity) {
                vecA.copy(items[0].obj.entity.getPosition());
            } else {
                return null;
            }
        } else if (coordSystem === 'local') {
            var reference = items[items.length - 1];
            var parent = reference.parent;
            while(parent) {
                reference = parent;
                parent = parent.parent;
            }
            vecA.copy(reference.obj.entity.getPosition());
        } else {
            var selection = editor.call('selection:aabb');
            if (! selection) return;
            vecA.copy(selection.center);
        }

        return vecA;
    };

    var getGizmoRotation = function() {
        if (! items.length)
            return;

        if (coordSystem === 'local') {
            var reference = items[items.length - 1];
            var parent = reference.parent;
            while(parent) {
                reference = parent;
                parent = parent.parent;
            }
            var rot = reference.obj.entity.getEulerAngles()
            return [ rot.x, rot.y, rot.z ];
        } else {
            return [ 0, 0, 0 ];
        }
    };

    // update gizmo position
    var updateGizmoPosition = function() {
        if (! items.length || timeoutUpdatePosition || gizmoMoving)
            return;

        timeoutUpdatePosition = true;

        setTimeout(function() {
            timeoutUpdatePosition = false;

            var vec = getGizmoPosition();
            if (vec)
                editor.call('gizmo:translate:position', vec.x, vec.y, vec.z);
        });
    };

    // update gizmo position
    var updateGizmoRotation = function() {
        if (! items.length || timeoutUpdateRotation)
            return;

        timeoutUpdateRotation = true;

        setTimeout(function() {
            timeoutUpdateRotation = false;

            var vec = getGizmoRotation();
            if (vec)
                editor.call('gizmo:translate:rotation', vec[0], vec[1], vec[2]);
        });
    };

    // start translating
    var onGizmoStart = function(axis, plane) {
        gizmoAxis = axis;
        gizmoPlane = plane;
        gizmoMoving = true;

        movingStart.copy(getGizmoPosition());

        for(var i = 0; i < items.length; i++) {
            var pos = items[i].obj.entity.getPosition();
            items[i].start[0] = pos.x;
            items[i].start[1] = pos.y;
            items[i].start[2] = pos.z;
            items[i].pos = items[i].start.slice(0);

            pos = items[i].obj.get('position');
            items[i].startLocal[0] = pos[0];
            items[i].startLocal[1] = pos[1];
            items[i].startLocal[2] = pos[2];

            items[i].obj.history.enabled = false;
        }
    };

    // end translating
    var onGizmoEnd = function() {
        gizmoMoving = false;
        var records = [ ];

        for(var i = 0; i < items.length; i++) {
            items[i].obj.history.enabled = true;

            var data = {
                item: items[i].obj,
                valueOld: items[i].startLocal.slice(0),
                value: items[i].obj.get('position')
            };

            records.push(data);
        }

        editor.call('history:add', {
            name: 'entities.translate',
            undo: function() {
                for(var i = 0; i < records.length; i++) {
                    var item = records[i].item.latest();
                    if (! item) continue;

                    item.history.enabled = false;
                    item.set('position', records[i].valueOld);
                    item.history.enabled = true;
                }
            },
            redo: function() {
                for(var i = 0; i < records.length; i++) {
                    var item = records[i].item.latest();
                    if (! item) continue;

                    item.history.enabled = false;
                    item.set('position', records[i].value);
                    item.history.enabled = true;
                }
            }
        });
    };

    // translated
    var onGizmoOffset = function(x, y, z) {
        timeoutUpdateRotation = true;

        for(var i = 0; i < items.length; i++) {
            if (items[i].child)
                continue;

            var entity = items[i].obj.entity;

            if (coordSystem === 'local') {
                vecA.set(x, y, z);

                // scale by inverse world scale to ensure correct movement
                entity.parent.getWorldTransform().getScale(vecB);
                vecB.x = 1 / vecB.x;
                vecB.y = 1 / vecB.y;
                vecB.z = 1 / vecB.z;

                quat.copy(entity.getLocalRotation()).transformVector(vecA, vecA);
                vecA.mul(vecB);
                entity.setLocalPosition(items[i].startLocal[0] + vecA.x, items[i].startLocal[1] + vecA.y, items[i].startLocal[2] + vecA.z);
            } else {
                entity.setPosition(items[i].start[0] + x, items[i].start[1] + y, items[i].start[2] + z);
            }

            // if (entity.collision) {
            //     app.systems.collision.onTransformChanged(entity.collision, entity.getPosition(), entity.getRotation(), entity.getLocalScale());
            // }

            var pos = entity.getLocalPosition();
            items[i].obj.set('position', [ pos.x, pos.y, pos.z ]);
        }

        timeoutUpdateRotation = false;

        var pos = getGizmoPosition();
        editor.call('gizmo:translate:position', pos.x, pos.y, pos.z);
    };

    var onRender = function() {
        if (! app) return; // webgl not available

        if (! gizmoMoving && items.length) {
            var dirty = false;
            for(var i = 0; i < items.length; i++) {
                if (! items[i].obj.entity)
                    continue;

                var pos = items[i].obj.entity.getPosition();
                if (pos.x !== items[i].pos[0] || pos.y !== items[i].pos[1] || pos.z !== items[i].pos[2]) {
                    dirty = true;
                    items[i].pos[0] = pos.x;
                    items[i].pos[1] = pos.y;
                    items[i].pos[2] = pos.z;
                }
            }

            if (dirty) {
                var pos = getGizmoPosition();
                editor.call('gizmo:translate:position', pos.x, pos.y, pos.z);
            }
        }

        if (gizmoMoving && items.length) {
            var camera = editor.call('camera:current');
            var pos;

            var len = coordSystem === 'local' ? items.length : 1;
            for(var i = 0; i < len; i++) {
                if (items[i].child)
                    continue;

                if (coordSystem === 'local') {
                    pos = items[i].obj.entity.getPosition();
                    quat.copy(items[i].obj.entity.getRotation());
                } else {
                    pos = editor.call('gizmo:translate:position');
                    quat.setFromEulerAngles(0, 0, 0);
                }

                // x
                vecB.set(camera.camera.farClip * 2, 0, 0);
                quat.transformVector(vecB, vecB).add(pos);
                vecC.set(camera.camera.farClip * -2, 0, 0);
                quat.transformVector(vecC, vecC).add(pos);
                app.renderLine(vecB, vecC, linesColorBehind, immediateRenderOptions);
                if ((gizmoAxis === 'x' && ! gizmoPlane) || (gizmoPlane && (gizmoAxis === 'y' || gizmoAxis === 'z'))) {
                    app.renderLine(vecB, vecC, linesColorActive, brightImmediateRenderOptions);
                } else {
                    app.renderLine(vecB, vecC, linesColor, brightImmediateRenderOptions);
                }

                // y
                vecB.set(0, camera.camera.farClip * 2, 0);
                quat.transformVector(vecB, vecB).add(pos);
                vecC.set(0, camera.camera.farClip * -2, 0);
                quat.transformVector(vecC, vecC).add(pos);
                app.renderLine(vecB, vecC, linesColorBehind, immediateRenderOptions);
                if ((gizmoAxis === 'y' && ! gizmoPlane) || (gizmoPlane && (gizmoAxis === 'x' || gizmoAxis === 'z'))) {
                    app.renderLine(vecB, vecC, linesColorActive, brightImmediateRenderOptions);
                } else {
                    app.renderLine(vecB, vecC, linesColor, brightImmediateRenderOptions);
                }

                // z
                vecB.set(0, 0, camera.camera.farClip * 2);
                quat.transformVector(vecB, vecB).add(pos);
                vecC.set(0, 0, camera.camera.farClip * -2);
                quat.transformVector(vecC, vecC).add(pos);
                app.renderLine(vecB, vecC, linesColorBehind, immediateRenderOptions);
                if ((gizmoAxis === 'z' && ! gizmoPlane) || (gizmoPlane && (gizmoAxis === 'x' || gizmoAxis === 'y'))) {
                    app.renderLine(vecB, vecC, linesColorActive, brightImmediateRenderOptions);
                } else {
                    app.renderLine(vecB, vecC, linesColor, brightImmediateRenderOptions);
                }
            }
        }
    };

    editor.once('viewport:load', function() {
        app = editor.call('viewport:app');

        immediateRenderOptions = {
            layer: editor.call("gizmo:layers", 'Axis Gizmo Immediate')
        };

        brightImmediateRenderOptions = {
            layer: editor.call("gizmo:layers", 'Bright Gizmo')
        }
    });

    var updateChildRelation = function() {
        var itemIds = { };
        for(var i = 0; i < items.length; i++) {
            itemIds[items[i].obj.get('resource_id')] = items[i];
        }

        for(var i = 0; i < items.length; i++) {
            var child = false;
            var parent = items[i].obj.entity._parent;
            var id = '';
            while(! child && parent) {
                id = parent.getGuid();
                if (itemIds[id]) {
                    parent = itemIds[id];
                    child = true;
                    break;
                }
                parent = parent._parent;
            }
            items[i].child = child;
            items[i].parent = child ? parent : null;
        }
    };

    var updateGizmo = function() {
        if (! editor.call('permissions:write'))
            return;

        var objects = editor.call('selector:items');

        for(var i = 0; i < events.length; i++)
            events[i].unbind();
        events = [ ];
        items = [ ];

        if (editor.call('selector:type') === 'entity' && editor.call('gizmo:type') === 'translate') {
            for(var i = 0; i < objects.length; i++) {
                if (! objects[i].entity)
                    continue;

                var pos = objects[i].entity.getPosition();

                items.push({
                    obj: objects[i],
                    pos: [ pos.x, pos.y, pos.z ],
                    start: [ 0, 0, 0 ],
                    startLocal: [ 0, 0, 0 ]
                });

                // position
                events.push(objects[i].on('position:set', updateGizmoPosition));
                // position.*
                for(var n = 0; n < 3; n++)
                    events.push(objects[i].on('position.' + n + ':set', updateGizmoPosition));

                // rotation
                events.push(objects[i].on('rotation:set', updateGizmoRotation));
                // rotation.*
                for(var n = 0; n < 3; n++)
                    events.push(objects[i].on('rotation.' + n + ':set', updateGizmoRotation));

                events.push(objects[i].on('parent:set', updateChildRelation));
            }

            if (! items.length)
                return;

            updateChildRelation();

            var rot = getGizmoRotation();
            editor.call('gizmo:translate:rotation', rot[0], rot[1], rot[2]);

            // gizmo start
            events.push(editor.on('gizmo:translate:start', onGizmoStart));
            // gizmo end
            events.push(editor.on('gizmo:translate:end', onGizmoEnd));
            // gizmo offset
            events.push(editor.on('gizmo:translate:offset', onGizmoOffset));

            // position gizmo
            var pos = getGizmoPosition();
            editor.call('gizmo:translate:position', pos.x, pos.y, pos.z);
            // show gizmo
            editor.call('gizmo:translate:toggle', true);
            // on render
            events.push(editor.on('gizmo:translate:render', onRender));
            // render
            editor.call('viewport:render');
        } else {
            // hide gizmo
            editor.call('gizmo:translate:toggle', false);
            // render
            editor.call('viewport:render');
        }
    };

    editor.on('gizmo:type', updateGizmo);
    editor.on('selector:change', updateGizmo);
    editor.on('gizmo:translate:sync', updateGizmo);
});


/* editor/entities/entities-gizmo-scale.js */
editor.once('load', function() {
    'use strict';

    var events = [ ];
    var items = [ ];
    var quat = new pc2d.Quat();
    var vecA = new pc2d.Vec3();
    var vecB = new pc2d.Vec3();
    var vecC = new pc2d.Vec3();
    var startPosition = new pc2d.Vec3();
    var timeoutUpdatePosition, timeoutUpdateRotation;
    var app;
    var gizmoMoving = false;
    var gizmoAxis, gizmoMiddle;
    var linesColorActive = new pc2d.Color(1, 1, 1, 1);
    var linesColor = new pc2d.Color(1, 1, 1, .2);
    var linesColorBehind = new pc2d.Color(1, 1, 1, .05);
    var immediateRenderOptions;
    var brightRenderOptions;

    // get position of gizmo based on selected entities
    var getGizmoPosition = function() {
        if (! items.length)
            return;

        var reference = items[items.length - 1];
        var parent = reference.parent;
        while(parent) {
            reference = parent;
            parent = parent.parent;
        }
        vecA.copy(reference.obj.entity.getPosition());

        return vecA;
    };

    var getGizmoRotation = function() {
        if (! items.length)
            return;

        var reference = items[items.length - 1];
        var parent = reference.parent;
        while(parent) {
            reference = parent;
            parent = parent.parent;
        }
        var rot = reference.obj.entity.getEulerAngles();

        return [ rot.x, rot.y, rot.z ];
    };

    // update gizmo position
    var updateGizmoPosition = function() {
        if (! items.length || timeoutUpdatePosition)
            return;

        timeoutUpdatePosition = true;

        setTimeout(function() {
            timeoutUpdatePosition = false;

            var vec = getGizmoPosition();
            if (vec)
                editor.call('gizmo:scale:position', vec.x, vec.y, vec.z);
        });
    };

    // update gizmo position
    var updateGizmoRotation = function() {
        if (! items.length || timeoutUpdateRotation)
            return;

        timeoutUpdateRotation = true;

        setTimeout(function() {
            timeoutUpdateRotation = false;

            var vec = getGizmoRotation();
            if (vec)
                editor.call('gizmo:scale:rotation', vec[0], vec[1], vec[2]);
        });
    };

    // start translating
    var onGizmoStart = function(axis, middle) {
        gizmoAxis = axis;
        gizmoMiddle = middle;
        gizmoMoving = true;

        for(var i = 0; i < items.length; i++) {
            var scale = items[i].obj.get('scale');
            items[i].start[0] = scale[0];
            items[i].start[1] = scale[1];
            items[i].start[2] = scale[2];
            items[i].pos = items[i].start.slice(0);
            items[i].obj.history.enabled = false;
        }
    };

    // end translating
    var onGizmoEnd = function() {
        gizmoMoving = false;
        var records = [ ];

        for(var i = 0; i < items.length; i++) {
            items[i].obj.history.enabled = true;

            records.push({
                item: items[i].obj,
                valueOld: items[i].start.slice(0),
                value: items[i].obj.get('scale')
            });
        }

        editor.call('history:add', {
            name: 'entities.scale',
            undo: function() {
                for(var i = 0; i < records.length; i++) {
                    var item = records[i].item.latest();
                    if (! item)
                        continue;

                    item.history.enabled = false;
                    item.set('scale', records[i].valueOld);
                    item.history.enabled = true;
                }
            },
            redo: function() {
                for(var i = 0; i < records.length; i++) {
                    var item = records[i].item.latest();
                    if (! item)
                        continue;

                    item.history.enabled = false;
                    item.set('scale', records[i].value);
                    item.history.enabled = true;
                }
            }
        });
    };

    // scaled
    var onGizmoOffset = function(x, y, z) {
        for(var i = 0; i < items.length; i++) {
            if (items[i].child)
                continue;

            // skip 2D screens
            if (items[i].obj.get('components.screen.screenSpace'))
                continue;

            items[i].obj.set('scale', [ items[i].start[0] * x, items[i].start[1] * y, items[i].start[2] * z ]);
        }
    };

    var onRender = function() {
        if (! app) return; // webgl not available

        if (gizmoMoving) {
            var camera = editor.call('camera:current');

            for(var i = 0; i < items.length; i++) {
                if (items[i].child)
                    continue;

                vecA.copy(items[i].obj.entity.getPosition());
                quat.copy(items[i].obj.entity.getRotation());

                if (gizmoAxis === 'x' || gizmoMiddle) {
                    vecB.set(camera.camera.farClip * 2, 0, 0);
                    quat.transformVector(vecB, vecB).add(vecA);
                    vecC.set(camera.camera.farClip * -2, 0, 0);
                    quat.transformVector(vecC, vecC).add(vecA);
                    app.renderLine(vecB, vecC, linesColorBehind, immediateRenderOptions);
                    app.renderLine(vecB, vecC, linesColorActive, brightRenderOptions);
                }
                if (gizmoAxis === 'y' || gizmoMiddle) {
                    vecB.set(0, camera.camera.farClip * 2, 0);
                    quat.transformVector(vecB, vecB).add(vecA);
                    vecC.set(0, camera.camera.farClip * -2, 0);
                    quat.transformVector(vecC, vecC).add(vecA);
                    app.renderLine(vecB, vecC, linesColorBehind, immediateRenderOptions);
                    app.renderLine(vecB, vecC, linesColorActive, brightRenderOptions);
                }
                if (gizmoAxis === 'z' || gizmoMiddle) {
                    vecB.set(0, 0, camera.camera.farClip * 2);
                    quat.transformVector(vecB, vecB).add(vecA);
                    vecC.set(0, 0, camera.camera.farClip * -2);
                    quat.transformVector(vecC, vecC).add(vecA);
                    app.renderLine(vecB, vecC, linesColorBehind, immediateRenderOptions);
                    app.renderLine(vecB, vecC, linesColorActive, brightRenderOptions);
                }
            }
        } else {
            var dirty = false;
            for(var i = 0; i < items.length; i++) {
                if (! items[i].obj.entity)
                    continue;

                var pos = items[i].obj.entity.getPosition();
                if (pos.x !== items[i].pos[0] || pos.y !== items[i].pos[1] || pos.z !== items[i].pos[2]) {
                    dirty = true;
                    items[i].pos[0] = pos.x;
                    items[i].pos[1] = pos.y;
                    items[i].pos[2] = pos.z;
                }
            }

            if (dirty) {
                var pos = getGizmoPosition();
                editor.call('gizmo:scale:position', pos.x, pos.y, pos.z);
            }
        }
    };

    editor.once('viewport:load', function() {
        app = editor.call('viewport:app');

        immediateRenderOptions = {
            layer: editor.call('gizmo:layers', 'Axis Gizmo Immediate')
        };

        brightRenderOptions = {
            layer: editor.call('gizmo:layers', 'Bright Gizmo')
        };
    });

    var updateChildRelation = function() {
        var itemIds = { };
        for(var i = 0; i < items.length; i++) {
            itemIds[items[i].obj.get('resource_id')] = items[i];
        }

        for(var i = 0; i < items.length; i++) {
            var child = false;
            var parent = items[i].obj.entity._parent;
            var id = '';
            while(! child && parent) {
                id = parent.getGuid();
                if (itemIds[id]) {
                    parent = itemIds[id];
                    child = true;
                    break;
                }
                parent = parent._parent;
            }
            items[i].child = child;
            items[i].parent = child ? parent : null;
        }
    };

    var updateGizmo = function() {
        if (! editor.call('permissions:write'))
            return;

        var objects = editor.call('selector:items');

        for(var i = 0; i < events.length; i++)
            events[i].unbind();
        events = [ ];
        items = [ ];

        if (editor.call('selector:type') === 'entity' && editor.call('gizmo:type') === 'scale') {
            for(var i = 0; i < objects.length; i++) {
                if (! objects[i].entity)
                    continue;

                var pos = objects[i].entity.getPosition();

                items.push({
                    obj: objects[i],
                    pos: [ pos.x, pos.y, pos.z ],
                    start: [ 1, 1, 1 ]
                });

                // position
                events.push(objects[i].on('position:set', updateGizmoPosition));
                // position.*
                for(var n = 0; n < 3; n++)
                    events.push(objects[i].on('position.' + n + ':set', updateGizmoPosition));

                // rotation
                events.push(objects[i].on('rotation:set', updateGizmoRotation));
                // rotation.*
                for(var n = 0; n < 3; n++)
                    events.push(objects[i].on('rotation.' + n + ':set', updateGizmoRotation));

                events.push(objects[i].on('parent:set', updateChildRelation));
            }

            if (! items.length)
                return;

            updateChildRelation();

            var rot = getGizmoRotation();
            editor.call('gizmo:scale:rotation', rot[0], rot[1], rot[2]);

            // gizmo start
            events.push(editor.on('gizmo:scale:start', onGizmoStart));
            // gizmo end
            events.push(editor.on('gizmo:scale:end', onGizmoEnd));
            // gizmo offset
            events.push(editor.on('gizmo:scale:offset', onGizmoOffset));

            // position gizmo
            var pos = getGizmoPosition();
            editor.call('gizmo:scale:position', pos.x, pos.y, pos.z);
            // show gizmo
            editor.call('gizmo:scale:toggle', true);
            // on render
            events.push(editor.on('gizmo:scale:render', onRender));
            // render
            editor.call('viewport:render');
        } else {
            // hide gizmo
            editor.call('gizmo:scale:toggle', false);
            // render
            editor.call('viewport:render');
        }
    };

    editor.on('gizmo:type', updateGizmo);
    editor.on('selector:change', updateGizmo);
});


/* editor/entities/entities-gizmo-rotate.js */
editor.once('load', function() {
    'use strict';

    var events = [ ];
    var items = [ ];
    var quat = new pc2d.Quat();
    var quatB = new pc2d.Quat();
    var vecA = new pc2d.Vec3();
    var vecB = new pc2d.Vec3();
    var vecC = new pc2d.Vec3();
    var startPosition = new pc2d.Vec3();
    var timeoutUpdatePosition, timeoutUpdateRotation;
    var coordSystem = 'world';
    var gizmoPos = new pc2d.Vec3();
    var gizmoMoving = false;
    var gizmoAxis;

    editor.on('gizmo:coordSystem', function(system) {
        if (coordSystem === system)
            return;

        coordSystem = system;

        var rot = getGizmoRotation();
        if (rot)
            editor.call('gizmo:rotate:rotation', rot[0], rot[1], rot[2]);

        var vec = getGizmoPosition();
        if (vec)
            editor.call('gizmo:rotate:position', vec.x, vec.y, vec.z);

        editor.call('viewport:render');
    });

    // get position of gizmo based on selected entities
    var getGizmoPosition = function() {
        if (! items.length)
            return;

        if (items.length === 1) {
            vecA.copy(items[0].obj.entity.getPosition());
        } else if (coordSystem === 'local') {
            var reference = items[items.length - 1];
            var parent = reference.parent;
            while(parent) {
                reference = parent;
                parent = parent.parent;
            }
            vecA.copy(reference.obj.entity.getPosition());
        } else {
            var selection = editor.call('selection:aabb');
            if (! selection) return;
            vecA.copy(selection.center);
        }

        return vecA;
    };

    var getGizmoRotation = function() {
        if (! items.length)
            return;

        if (coordSystem === 'local') {
            var reference = items[items.length - 1];
            var parent = reference.parent;
            while(parent) {
                reference = parent;
                parent = parent.parent;
            }
            var rot = reference.obj.entity.getEulerAngles();

            return [ rot.x, rot.y, rot.z ];
        } else {
            return [ 0, 0, 0 ];
        }
    };

    // update gizmo position
    var updateGizmoPosition = function() {
        if (! items.length || timeoutUpdatePosition || gizmoMoving)
            return;

        timeoutUpdatePosition = true;

        setTimeout(function() {
            timeoutUpdatePosition = false;

            var vec = getGizmoPosition();
            if (vec)
                editor.call('gizmo:rotate:position', vec.x, vec.y, vec.z);
        });
    };

    // update gizmo position
    var updateGizmoRotation = function() {
        if (! gizmoMoving)
            updateGizmoPosition();

        if (! items.length || timeoutUpdateRotation)
            return;

        timeoutUpdateRotation = true;

        setTimeout(function() {
            timeoutUpdateRotation = false;

            var vec = getGizmoRotation();
            if (vec)
                editor.call('gizmo:rotate:rotation', vec[0], vec[1], vec[2]);
        });
    };

    // start translating
    var onGizmoStart = function(axis) {
        gizmoAxis = axis;
        gizmoMoving = true;

        gizmoPos.copy(editor.call('gizmo:rotate:position'));

        for(var i = 0; i < items.length; i++) {
            var rot = items[i].obj.entity.getEulerAngles();
            items[i].start[0] = rot.x;
            items[i].start[1] = rot.y;
            items[i].start[2] = rot.z;
            items[i].pos = items[i].start.slice(0);

            var posLocal = items[i].obj.entity.getLocalPosition();

            items[i].startPosLocal[0] = posLocal.x;
            items[i].startPosLocal[1] = posLocal.y;
            items[i].startPosLocal[2] = posLocal.z;

            var pos = items[i].obj.entity.getPosition();

            items[i].offset[0] = pos.x - gizmoPos.x;
            items[i].offset[1] = pos.y - gizmoPos.y;
            items[i].offset[2] = pos.z - gizmoPos.z;

            rot = items[i].obj.get('rotation');
            items[i].startLocal[0] = rot[0];
            items[i].startLocal[1] = rot[1];
            items[i].startLocal[2] = rot[2];

            items[i].startLocalQuat.copy(items[i].obj.entity.getLocalRotation());
            items[i].startQuat.copy(items[i].obj.entity.getRotation());

            items[i].obj.history.enabled = false;
        }
    };

    // end translating
    var onGizmoEnd = function() {
        gizmoMoving = false;
        var records = [ ];

        for(var i = 0; i < items.length; i++) {
            items[i].obj.history.enabled = true;

            records.push({
                item: items[i].obj,
                valueRotOld: items[i].startLocal.slice(0),
                valueRot: items[i].obj.get('rotation'),
                valuePosOld: items[i].startPosLocal.slice(0),
                valuePos: items[i].obj.get('position')
            });
        }

        editor.call('history:add', {
            name: 'entities.rotate',
            undo: function() {
                for(var i = 0; i < records.length; i++) {
                    var item = records[i].item.latest();
                    if (! item)
                        continue;

                    item.history.enabled = false;
                    item.set('position', records[i].valuePosOld);
                    item.set('rotation', records[i].valueRotOld);
                    item.history.enabled = true;
                }
            },
            redo: function() {
                for(var i = 0; i < records.length; i++) {
                    var item = records[i].item.latest();
                    if (! item)
                        continue;

                    item.history.enabled = false;
                    item.set('position', records[i].valuePos);
                    item.set('rotation', records[i].valueRot);
                    item.history.enabled = true;
                }
            }
        });

        var pos = getGizmoPosition();
        editor.call('gizmo:rotate:position', pos.x, pos.y, pos.z);
    };

    // translated
    var onGizmoOffset = function(angle, point) {
        timeoutUpdateRotation = true;

        for(var i = 0; i < items.length; i++) {
            if (items[i].child)
                continue;

            // skip 2D screens
            if (items[i].obj.get('components.screen.screenSpace'))
                continue;

            vecA.set(0, 0, 0);
            vecA[gizmoAxis] = 1;

            quat.setFromAxisAngle(vecA, angle);

            if (coordSystem === 'local') {
                quatB.copy(items[i].startLocalQuat).mul(quat);
                items[i].obj.entity.setLocalRotation(quatB);
            } else if (items.length === 1) {
                quatB.copy(quat).mul(items[i].startQuat);
                items[i].obj.entity.setRotation(quatB);
            } else {
                vecA.set(items[i].offset[0], items[i].offset[1], items[i].offset[2]);
                quat.transformVector(vecA, vecA);
                quatB.copy(quat).mul(items[i].startQuat);
                items[i].obj.entity.setRotation(quatB);
                items[i].obj.entity.setPosition(vecA.add(gizmoPos));

                var pos = items[i].obj.entity.getLocalPosition();
                items[i].obj.set('position', [ pos.x, pos.y, pos.z ]);
            }

            var angles = items[i].obj.entity.getLocalEulerAngles();
            items[i].obj.set('rotation', [ angles.x, angles.y, angles.z ]);
        }

        timeoutUpdateRotation = false;

        if (items.length > 1 || coordSystem === 'local') {
            var rot = getGizmoRotation();
            editor.call('gizmo:rotate:rotation', rot[0], rot[1], rot[2]);
        }
    };

    var onRender = function() {
        if (! gizmoMoving && items.length) {
            var dirty = false;
            for(var i = 0; i < items.length; i++) {
                if (! items[i].obj.entity)
                    continue;

                var pos = items[i].obj.entity.getPosition();
                if (pos.x !== items[i].pos[0] || pos.y !== items[i].pos[1] || pos.z !== items[i].pos[2]) {
                    dirty = true;
                    items[i].pos[0] = pos.x;
                    items[i].pos[1] = pos.y;
                    items[i].pos[2] = pos.z;
                }
            }

            if (dirty) {
                var pos = getGizmoPosition();
                editor.call('gizmo:translate:position', pos.x, pos.y, pos.z);
            }
        }

        if (items.length > 1 && ! coordSystem === 'world') {
            var rot = getGizmoRotation();
            editor.call('gizmo:rotate:rotation', rot[0], rot[1], rot[2]);
        }
    };

    var updateChildRelation = function() {
        var itemIds = { };
        for(var i = 0; i < items.length; i++) {
            itemIds[items[i].obj.get('resource_id')] = items[i];
        }

        for(var i = 0; i < items.length; i++) {
            var child = false;
            var parent = items[i].obj.entity._parent;
            var id = '';
            while(! child && parent) {
                id = parent.getGuid();
                if (itemIds[id]) {
                    parent = itemIds[id];
                    child = true;
                    break;
                }
                parent = parent._parent;
            }
            items[i].child = child;
            items[i].parent = child ? parent : null;
        }

        updateGizmoPosition();
    };

    var updateGizmo = function() {
        if (! editor.call('permissions:write'))
            return;

        var objects = editor.call('selector:items');

        for(var i = 0; i < events.length; i++)
            events[i].unbind();
        events = [ ];
        items = [ ];

        if (editor.call('selector:type') === 'entity' && editor.call('gizmo:type') === 'rotate') {
            for(var i = 0; i < objects.length; i++) {
                if (! objects[i].entity)
                    continue;

                var pos = objects[i].entity.getPosition();

                items.push({
                    obj: objects[i],
                    startLocalQuat: objects[i].entity.getLocalRotation().clone(),
                    startQuat: objects[i].entity.getRotation().clone(),
                    pos: [ pos.x, pos.y, pos.z ],
                    offset: [ 0, 0, 0 ],
                    start: [ 0, 0, 0 ],
                    startLocal: [ 0, 0, 0 ],
                    startPosLocal: [ 0, 0, 0 ]
                });

                // position
                events.push(objects[i].on('position:set', updateGizmoPosition));
                // position.*
                for(var n = 0; n < 3; n++)
                    events.push(objects[i].on('position.' + n + ':set', updateGizmoPosition));

                // rotation
                events.push(objects[i].on('rotation:set', updateGizmoRotation));
                // rotation.*
                for(var n = 0; n < 3; n++)
                    events.push(objects[i].on('rotation.' + n + ':set', updateGizmoRotation));

                events.push(objects[i].on('parent:set', updateChildRelation));
            }

            if (! items.length)
                return;

            updateChildRelation();

            // gizmo start
            events.push(editor.on('gizmo:rotate:start', onGizmoStart));
            // gizmo end
            events.push(editor.on('gizmo:rotate:end', onGizmoEnd));
            // gizmo offset
            events.push(editor.on('gizmo:rotate:offset', onGizmoOffset));

            // rotation gizmo
            var rot = getGizmoRotation();
            editor.call('gizmo:rotate:rotation', rot[0], rot[1], rot[2]);
            // position gizmo
            var pos = getGizmoPosition();
            editor.call('gizmo:rotate:position', pos.x, pos.y, pos.z);
            // show gizmo
            editor.call('gizmo:rotate:toggle', true);
            // on render
            events.push(editor.on('gizmo:rotate:render', onRender));
            // render
            editor.call('viewport:render');
        } else {
            // hide gizmo
            editor.call('gizmo:rotate:toggle', false);
            // render
            editor.call('viewport:render');
        }
    };

    editor.on('gizmo:type', updateGizmo);
    editor.on('selector:change', updateGizmo);
});


/* editor/entities/entities-clipboard.js */
editor.once('load', function () {
    var CLIPBOARD_NAME = 'playcanvas_editor_clipboard';
    var CLIPBOARD_META = CLIPBOARD_NAME + '_meta';

    // get current clipboard value
    editor.method('entities:clipboard:get', function () {
        return editor.call('localStorage:get', CLIPBOARD_NAME);
    });

    // set current clipboard value
    editor.method('entities:clipboard:set', function (data) {
        editor.call('localStorage:set', CLIPBOARD_META, {project: config.project.id});
        editor.call('localStorage:set', CLIPBOARD_NAME, data);
    });

    // return true if there is no data in the clipboard
    editor.method('entities:clipboard:empty', function () {
        return !editor.call('localStorage:get', CLIPBOARD_META);
    });
});