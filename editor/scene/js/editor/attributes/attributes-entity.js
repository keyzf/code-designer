/* editor/attributes/attributes-entity.js */
editor.once('load', function() {
    'use strict';

    var useLegacyComponentInspectors = false;

    var panelComponents;
    
    var projectSettings = editor.call('settings:project');


    // add component menu
    if (useLegacyComponentInspectors) {
        var menuAddComponent = new ui.Menu();
        var components = editor.call('components:schema');
        var list = editor.call('components:list');
        for(var i = 0; i < list.length; i++) {
            menuAddComponent.append(new ui.MenuItem({
                text: components[list[i]].$title,
                value: list[i]
            }));
        }
        menuAddComponent.on('open', function() {
            var items = editor.call('selector:items');

            var legacyAudio = editor.call('settings:project').get('useLegacyAudio');
            for(var i = 0; i < list.length; i++) {
                var different = false;
                var disabled = items[0].has('components.' + list[i]);

                for(var n = 1; n < items.length; n++) {
                    if (disabled !== items[n].has('components.' + list[i])) {
                        var different = true;
                        break;
                    }
                }
                this.findByPath([ list[i] ]).disabled = different ? false : disabled;

                if (list[i] === 'audiosource')
                    this.findByPath([list[i]]).hidden = ! legacyAudio;
            }
        });
        menuAddComponent.on('select', function(path) {
            var items = editor.call('selector:items');
            var component = path[0];
            editor.call('entities:addComponent', items, component);
        });
        editor.call('layout.root').append(menuAddComponent);

    }

    // legacy
    editor.method('attributes:entity.panelComponents', function() {
        if (useLegacyComponentInspectors) return panelComponents;

        return entityInspector;
    });

    // legacy
    editor.method('attributes:entity:addComponentPanel', function(args) {
        var title = args.title;
        var name = args.name;
        var entities = args.entities;
        var events = [ ];

        // panel
        var panel = editor.call('attributes:addPanel', {
            parent: useLegacyComponentInspectors ? panelComponents : entityInspector,
            name: title
        });
        panel.class.add('component', 'entity', name);
        // reference
        editor.call('attributes:reference:attach', name + ':component', panel, panel.headerElementTitle);

        // override for new component
        editor.call('attributes:registerOverridePath', 'components.' + name, panel.element);

        // show/hide panel
        var checkingPanel;
        var checkPanel = function() {
            checkingPanel = false;

            var show = entities[0].has('components.' + name);
            for(var i = 1; i < entities.length; i++) {
                if (show !== entities[i].has('components.' + name)) {
                    show = false;
                    break;
                }
            }

            panel.disabled = ! show;
            panel.hidden = ! show;
        };
        var queueCheckPanel = function() {
            if (checkingPanel)
                return;

            checkingPanel = true;
            setTimeout(checkPanel);
        }
        checkPanel();
        for(var i = 0; i < entities.length; i++) {
            events.push(entities[i].on('components.' + name + ':set', queueCheckPanel));
            events.push(entities[i].on('components.' + name + ':unset', queueCheckPanel));
        }
        panel.once('destroy', function() {
            for(var i = 0; i < entities.length; i++)
                events[i].unbind();
        });

        // remove
        var fieldRemove = new ui.Button();

        fieldRemove.hidden = ! editor.call('permissions:write');
        events.push(editor.on('permissions:writeState', function(state) {
            fieldRemove.hidden = ! state;
        }));

        fieldRemove.class.add('component-remove');
        fieldRemove.on('click', function() {
            var records = [ ];

            for(var i = 0; i < entities.length; i++) {
                records.push({
                    item: entities[i],
                    value: entities[i].get('components.' + name)
                });

                entities[i].history.enabled = false;
                entities[i].unset('components.' + name);
                entities[i].history.enabled = true;
            }

            editor.call('history:add', {
                name: 'entities.set[components.' + name + ']',
                undo: function() {
                    for(var i = 0; i < records.length; i++) {
                        var item = records[i].item.latest();
                        if (! item)
                            continue;

                        item.history.enabled = false;
                        item.set('components.' + name, records[i].value);
                        item.history.enabled = true;
                    }
                },
                redo: function() {
                    for(var i = 0; i < records.length; i++) {
                        var item = records[i].item.latest();
                        if (! item)
                            continue;

                        item.history.enabled = false;
                        item.unset('components.' + name);
                        item.history.enabled = true;
                    }
                }
            });
        });
        panel.headerAppend(fieldRemove);

        // enable/disable
        var fieldEnabled = editor.call('attributes:addField', {
            panel: panel,
            type: 'checkbox',
            link: entities,
            path: 'components.' + name + '.enabled'
        });
        editor.call('attributes:registerOverridePath', `components.${name}.enabled`, fieldEnabled.element);
        fieldEnabled.class.remove('tick');
        fieldEnabled.class.add('component-toggle');
        fieldEnabled.element.parentNode.removeChild(fieldEnabled.element);
        panel.headerAppend(fieldEnabled);

        // toggle-label
        var labelEnabled = new ui.Label();
        labelEnabled.renderChanges = false;
        labelEnabled.class.add('component-toggle-label');
        panel.headerAppend(labelEnabled);
        labelEnabled.text = fieldEnabled.value ? 'On' : 'Off';
        fieldEnabled.on('change', function(value) {
            labelEnabled.text = value ? 'On' : 'Off';
        });

        return panel;
    });

    var items = null;
    var argsList = [ ];
    var argsFieldsChanges = [ ];
    var inspectEvents = [];


    var options = {
        flex: true,
        assets: editor.call('assets:raw'),
        entities: editor.call('entities:raw'),
        projectSettings: {},
        hidden: true
    };

    Object.defineProperty(options,"projectSettings",{
        get:function(){
            return editor.call('settings:project');
        }
    });


    var templateOverrides = new pcui.TemplateOverridesView(options);
    editor.call('layout.root').append(templateOverrides);

    // disable attributes panel when overrides diff is open
    templateOverrides.on('show', () => {
        editor.call('layout.attributes').enabled = false;
    });

    templateOverrides.on('hide', () => {
        editor.call('layout.attributes').enabled = editor.call('permissions:write');
    });


    if (!useLegacyComponentInspectors) {
        var entityInspector = new pcui.EntityInspector({
            assets: editor.call('assets:raw'),
            entities: editor.call('entities:raw'),
            projectSettings: editor.call('settings:project'),
            history: editor.call('editor:history'),
            templateOverridesDiffView: templateOverrides
        });
    }


    // before clearing inspector, preserve elements
    editor.on('attributes:beforeClear', function() {
        if (!useLegacyComponentInspectors) {
            entityInspector.unlink();
            if (entityInspector.parent) {
                entityInspector.parent.remove(entityInspector);
            }
            return;
        }

        if (! items || ! items.panel.parent)
            return;

        if (items.panelTemplate) {
            items.panelTemplate.parent.remove(items.panelTemplate);
        }

        // remove panel from inspector
        items.panel.parent.remove(items.panel);

        // clear components
        items.panelComponents.parent.remove(items.panelComponents);
        items.panelComponents.clear();

        // unlink fields
        for(var i = 0; i < argsList.length; i++) {
            argsList[i].link = null;
            argsList[i].unlinkField();
        }

    });


    // link data to fields when inspecting
    editor.on('attributes:inspect[entity]', function(entities) {
        
        if (entities.length > 1) {
            editor.call('attributes:header', entities.length + ' Entities');
        } else {
            editor.call('attributes:header', 'Entity');
        }

        var root = editor.call('attributes.rootPanel');

        if (!useLegacyComponentInspectors) {
            if (!entityInspector.parent)
                root.append(entityInspector);

            entityInspector.link(entities);

            return;
        }


    });

    editor.on('attributes:clear', function () {
        if (!useLegacyComponentInspectors) {
            entityInspector.unlink();
            return;
        }

        onUninspect();
    });

    var onUninspect = function () {
        for (var i = 0; i < inspectEvents.length; i++) {
            inspectEvents[i].unbind();
        }

        inspectEvents.length = 0;

        if (items && items.panelTemplate) {
            templateOverrides.hidden = true;
            items.panelTemplate.hidden = true;
            items.panelTemplate.unlink();
        }
    };
});
