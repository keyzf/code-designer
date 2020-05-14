/* editor/toolbar/toolbar-logo.js */
editor.once('load', function() {
    'use strict';

    var root = editor.call('layout.root');
    var toolbar = editor.call('layout.toolbar');

    var history = editor.call('editor:history');


    var logo = new ui.Button();
    logo.class.add('logo');
    logo.on('click', function() {
        menu.open = true;
    });
    toolbar.append(logo);

    var componentsLogos = {
        'animation': '&#57875;',
        'audiolistener': '&#57750;',
        'audiosource': '&#57751;',
        'camera': '&#57874;',
        'collision': '&#57735;',
        'light': '&#57748;',
        'model': '&#57736;',
        'particlesystem': '&#57753;',
        'rigidbody': '&#57737;',
        'script': '&#57910;'
    };

    var setField = function(items, field, value) {
        var records = [ ];

        for(var i = 0; i < items.length; i++) {
            records.push({
                item: items[i],
                value: value,
                valueOld: items[i].get(field)
            });

            items[i].history.enabled = false;
            items[i].set(field, value);
            items[i].history.enabled = true;
        }

        history.add({
            name: 'entities.set[' + field + ']',
            undo: function () {
                for (var i = 0; i < records.length; i++) {
                    var item = records[i].item.latest();
                    if (! item)
                        continue;

                    item.history.enabled = false;
                    item.set(field, records[i].valueOld);
                    item.history.enabled = true;
                }
            },
            redo: function () {
                for (var i = 0; i < records.length; i++) {
                    var item = records[i].item.latest();
                    if (! item)
                        continue;

                    item.history.enabled = false;
                    item.set(field, records[i].value);
                    item.history.enabled = true;
                }
            }
        });
    };


    var menuData = {
        'entity': {
            title: 'Entity',
            filter: function() {
                return editor.call('selector:type') === 'entity' && editor.call('permissions:write');
            },
            items: {
                'new-entity': {
                    title: 'New Entity',
                    filter: function () {
                        return editor.call('selector:items').length === 1;
                    },
                    select: function () {
                        editor.call('entities:new', {parent: editor.call('entities:selectedFirst')});
                    },
                    items: editor.call('menu:entities:new')
                },
                'add-component': {
                    title: 'Add Component',
                    filter: function() {
                        return editor.call('selector:type') === 'entity';
                    },
                    items: editor.call('menu:entities:add-component')
                }
            }
        },
        'edit': {
            title: 'Edit',
            filter: function() {
                return editor.call('permissions:write');
            },
            items: {
                'undo': {
                    title: 'Undo',
                    icon: '&#57620;',
                    filter: function() {
                        return history.canUndo;
                    },
                    select: function() {
                        return history.undo();
                    }
                },
                'redo': {
                    title: 'Redo',
                    icon: '&#57621;',
                    filter: function() {
                        return history.canRedo;
                    },
                    select: function() {
                        history.redo();
                    }
                },
                'enable': {
                    title: 'Enable',
                    icon: '&#57651;',
                    filter: function() {
                        if (! editor.call('permissions:write'))
                            return false;

                        return editor.call('selector:type') === 'entity';
                    },
                    hide: function () {
                        var type = editor.call('selector:type');
                        if (type !== 'entity')
                            return true;

                        var items = editor.call('selector:items');

                        if (items.length === 1) {
                            return items[0].get('enabled');
                        } else {
                            var enabled = items[0].get('enabled');
                            for(var i = 1; i < items.length; i++) {
                                if (enabled !== items[i].get('enabled'))
                                    return false;
                            }
                            return enabled;
                        }
                    },
                    select: function() {
                        setField(editor.call('selector:items'), 'enabled', true);
                    }
                },
                'disable': {
                    title: 'Disable',
                    icon: '&#57650;',
                    filter: function() {
                        if (! editor.call('permissions:write'))
                            return false;

                        return editor.call('selector:type') === 'entity';
                    },
                    hide: function () {
                        var type = editor.call('selector:type');
                        if (type !== 'entity')
                            return true;

                        var items = editor.call('selector:items');

                        if (items.length === 1) {
                            return ! items[0].get('enabled');
                        } else {
                            var disabled = items[0].get('enabled');
                            for(var i = 1; i < items.length; i++) {
                                if (disabled !== items[i].get('enabled'))
                                    return false;
                            }
                            return ! disabled;
                        }
                    },
                    select: function() {
                        setField(editor.call('selector:items'), 'enabled', false);
                    }
                },
                'copy': {
                    title: 'Copy',
                    icon: '&#58193;',
                    filter: function () {
                        if (! editor.call('permissions:write'))
                            return false;

                        return editor.call('selector:type') === 'entity' && editor.call('selector:items').length;
                    },
                    select: function () {
                        var items = editor.call('selector:items');
                        editor.call('entities:copy', items);
                    }
                },
                'paste': {
                    title: 'Paste',
                    icon: '&#58184;',
                    filter: function () {
                        if (! editor.call('permissions:write'))
                            return false;

                        if (! editor.call('entities:clipboard:empty')) {
                            var items = editor.call('selector:items');
                            if (items.length === 0 || items.length === 1 && editor.call('selector:type') === 'entity') {
                                return true;
                            }
                        }

                        return false;
                    },
                    select: function () {
                        var items = editor.call('selector:items');
                        editor.call('entities:paste', items[0]);
                    }
                },
                'edit': {
                    title: 'Edit',
                    icon: '&#57648;',
                    filter: function() {
                        var type = editor.call('selector:type');
                        if (! type || type !== 'asset')
                            return false;

                        var items = editor.call('selector:items');
                        return items.length === 1 && ['html', 'css', 'json', 'text', 'script', 'shader'].indexOf(items[0].get('type')) !== -1;
                    },
                    select: function() {
                        var type = editor.call('selector:type');
                        if (! type || type !== 'asset') return;
                        var items = editor.call('selector:items');

                        editor.call('assets:edit', items[0]);
                    }
                },
                'duplicate': {
                    title: 'Duplicate',
                    icon: '&#57638;',
                    filter: function() {
                        if (! editor.call('permissions:write'))
                            return false;

                        var type = editor.call('selector:type');
                        if (! type)
                            return false;

                        var items = editor.call('selector:items');

                        if (type === 'entity') {
                            if (items.indexOf(editor.call('entities:root')) !== -1)
                                return false;

                            return items.length > 0;
                        } else if (type === 'asset') {
                            return items.length === 1 && items[0].get('type') === 'material';
                        } else {
                            return false;
                        }
                    },
                    select: function() {
                        var type = editor.call('selector:type');
                        if (! type) return;
                        var items = editor.call('selector:items');

                        if (type === 'entity') {
                            editor.call('entities:duplicate', items);
                        } else if (type === 'asset') {
                            editor.call('assets:duplicate', items[0]);
                        }
                    }
                },
                'delete': {
                    title: 'Delete',
                    icon: '&#57636;',
                    filter: function() {
                        if (! editor.call('permissions:write'))
                            return false;

                        var type = editor.call('selector:type');
                        if (!type) return false;

                        if (type === 'entity') {
                            var root = editor.call('entities:root');
                            var items = editor.call('selector:items');
                            for (var i = 0; i < items.length; i++) {
                                if (items[i] === root) {
                                    return false;
                                }
                            }
                        }

                        return true;
                    },
                    select: function() {
                        var type = editor.call('selector:type');
                        if (! type) return;
                        var items = editor.call('selector:items');

                        if (type === 'entity') {
                            var root = editor.call('entities:root');
                            if (items.indexOf(root) !== -1)
                                return;
                            editor.call('entities:delete', items);
                        } else if (type === 'asset') {
                            editor.call('assets:delete:picker', items);
                        }
                    }
                }
            }
        },
        'launch': {
            title: 'Launch',
            select: function() {
                editor.call('launch');
            },
            items: {
                'launch-remote': {
                    title: 'Launch',
                    icon: '&#57649;',
                    select: function() {
                        editor.call('launch', 'default');
                    }
                }
            }
        },

        'projects': {
            title: 'Project',
            icon: '&#57671;',
            select: function() {
                editor.call('picker:project');
            }
        },
        'publishing': {
            title: 'Publishing',
            icon: '&#57911;',
            select: function() {
                editor.call('picker:publish');
            }
        },
        'code-editor': {
            title: 'Code Editor',
            icon: '&#57648;',
            hide: function () {
                return false;
            },
            select: function () {
                editor.call('picker:codeeditor');
            }
        },
        'settings': {
            title: 'Settings',
            icon: '&#57652;',
            filter: function() {
                return editor.call('selector:type') !== 'editorSettings' && ! editor.call('viewport:expand:state');
            },
            select: function() {
                editor.call('selector:set', 'editorSettings', [ editor.call('settings:projectUser') ]);
            }
        },
        'priorityScripts': null,
        'feedback': {
            title: 'Feedback',
            icon: '&#57625;',
            select: function() {
                window.open('');
            }
        }
    };

    /**hasTemplates 预制板 */
    if (editor.call('users:hasFlag', 'hasTemplates') ) {
        menuData.entity.items.template = {
            title: 'Template',
            filter: () => {
                return editor.call('selector:type') === 'entity' &&
                       editor.call('selector:items').length === 1;
            },
            items: editor.call('menu:entities:template')
        };
    }

    // TODO scripts2
    // add built-in-scripts for new system

    menuData['priorityScripts'] = {
        title: 'Scripts Loading Order',
        icon: '&#57652;',
        filter: function() {
            return editor.call('permissions:write');
        },
        select: function() {
            editor.call('selector:set', 'editorSettings', [ editor.call('settings:projectUser') ]);
            setTimeout(function() {
                editor.call('editorSettings:panel:unfold', 'scripts-order');
            }, 0);
        }
    };
    var root = editor.call('layout.root');

    var menu = ui.Menu.fromData(menuData);
    menu.position(45, 0);
    root.append(menu);

    var tooltip = Tooltip.attach({
        target: logo.element,
        text: 'Menu',
        align: 'left',
        root: root
    });
    menu.on('open', function(state) {
        tooltip.disabled = state;
    });

    // get part of menu data
    editor.method('menu:get', function (name) {
        return menuData[name];
    });
});
