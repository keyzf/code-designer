


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