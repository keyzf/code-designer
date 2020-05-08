/* editor/attributes/attributes-panel.js */
editor.once('load', function() {
    'use strict';

    // var legacyScripts = editor.call('settings:project').get('useLegacyScripts');
    var title = 'INSPECTOR';
    var root = editor.call('layout.attributes');
    root.headerText = title;

    var clearPanel = function() {
        editor.emit('attributes:beforeClear');
        root.clear();
        editor.emit('attributes:clear');
    };

    // var overridesSidebar = editor.call('layout.overridesSidebar');

    // editor.method('attributes:registerOverridePath', (path, field) => {
    //     if (!overridesSidebar) return;
    //     overridesSidebar.registerElementForPath(path, field, root.innerElement);
    // });

    // clearing
    editor.method('attributes:clear', clearPanel);

    // set header
    editor.method('attributes:header', function(text) {
        root.headerText = text;
    });

    // return root panel
    editor.method('attributes.rootPanel', function() {
        return root;
    });

    // add panel
    editor.method('attributes:addPanel', function(args) {
        args = args || { };

        // panel
        var panel = new ui.Panel(args.name || '');
        // parent
        (args.parent || root).append(panel);

        // folding
        panel.foldable = args.foldable || args.folded;
        panel.folded = args.folded;

        return panel;
    });

    var historyState = function(item, state) {
        if (item.history !== undefined) {
            if (typeof(item.history) === 'boolean') {
                item.history = state;
            } else {
                item.history.enabled = state;
            }
        } else {
            if (item._parent && item._parent.history !== undefined) {
                item._parent.history.enabled = state;
            }
        }
    };

    // get the right path from args
    var pathAt = function (args, index) {
        return args.paths ? args.paths[index] : args.path;
    };

    editor.method('attributes:linkField', function(args) {
        var update, changeField, changeFieldQueue;
        args.field._changing = false;
        var events = [ ];

        if (! (args.link instanceof Array))
            args.link = [ args.link ];

        update = function() {
            var different = false;
            var path = pathAt(args, 0);
            var value = args.link[0].has(path) ? args.link[0].get(path) : undefined;
            if (args.type === 'rgb') {
                if (value) {
                    for(var i = 1; i < args.link.length; i++) {
                        path = pathAt(args, i);
                        if (! value.equals(args.link[i].get(path))) {
                            value = null;
                            different = true;
                            break;
                        }
                    }
                }
                if (value) {
                    value = value.map(function(v) {
                        return Math.floor(v * 255);
                    });
                }
            } else if (args.type === 'asset') {
                var countUndefined = value === undefined ? 1 : 0;
                for(var i = 1; i < args.link.length; i++) {
                    path = pathAt(args, i);
                    if (!args.link[i].has(path)) {
                        countUndefined++;
                        continue;
                    }

                    var val = args.link[i].get(path);

                    if ((value || 0) !== (args.link[i].get(path) || 0)) {
                        if (value !== undefined) {
                            value = args.enum ? '' : null;
                            different = true;
                            break;
                        }
                    }

                    value = val;
                }

                if (countUndefined && countUndefined != args.link.length) {
                    args.field.class.add('star');
                    if (! /^\* /.test(args.field._title.text))
                        args.field._title.text = '* ' + args.field._title.text;
                } else {
                    args.field.class.remove('star');
                    if (/^\* /.test(args.field._title.text))
                        args.field._title.text = args.field._title.text.substring(2);
                }

                if (different) {
                    args.field.class.add('null');
                    args.field._title.text = 'various';
                } else {
                    args.field.class.remove('null');
                }
            } else if (args.type === 'entity' || ! args.type) {
                for(var i = 1; i < args.link.length; i++) {
                    path = pathAt(args, i);
                    if (value !== args.link[i].get(path)) {
                        value = 'various';
                        different = true;
                        break;
                    }
                }
                if (different) {
                    args.field.class.add('null');
                    args.field.text = 'various';
                } else {
                    args.field.class.remove('null');
                }
            } else {
                var valueFound = false;
                for(var i = 0; i < args.link.length; i++) {
                    path = pathAt(args, i);
                    if (! args.link[i].has(path))
                        continue;

                    if (! valueFound) {
                        valueFound = true;
                        value = args.link[i].get(path);
                    } else {
                        var v = args.link[i].get(path);
                        if ((value || 0) !== (v || 0)) {
                            value = args.enum ? '' : null;
                            different = true;
                            break;
                        }
                    }
                }
            }

            args.field._changing = true;
            args.field.value = value;

            if (args.type === 'checkbox')
                args.field._onLinkChange(value);

            args.field._changing = false;

            if (args.enum) {
                var opt = args.field.optionElements[''];
                if (opt) opt.style.display = value !== '' ? 'none' : '';
            } else {
                args.field.proxy = value == null ? '...' : null;
            }
        };

        changeField = function(value) {
            if (args.field._changing)
                return;

            if (args.enum) {
                var opt = this.optionElements[''];
                if (opt) opt.style.display = value !== '' ? 'none' : '';
            } else {
                this.proxy = value === null ? '...' : null;
            }

            if (args.trim)
                value = value.trim();

            if (args.type === 'rgb') {
                value = value.map(function(v) {
                    return v / 255;
                });
            } else if (args.type === 'asset') {
                args.field.class.remove('null');
            }

            var items = [ ];

            // set link value
            args.field._changing = true;
            if (args.type === "string" && args.trim)
                args.field.value = value;

            for(var i = 0; i < args.link.length; i++) {
                var path = pathAt(args, i);
                if (! args.link[i].has(path)) continue;

                items.push({
                    item: args.link[i],
                    value: args.link[i].has(path) ? args.link[i].get(path) : undefined
                });

                historyState(args.link[i], false);
                args.link[i].set(path, value);
                historyState(args.link[i], true);
            }
            args.field._changing = false;

            // history
            if (args.type !== 'rgb' && ! args.slider && ! args.stopHistory) {
                editor.call('history:add', {
                    name: pathAt(args, 0),
                    undo: function() {
                        var different = false;
                        for(var i = 0; i < items.length; i++) {
                            var path = pathAt(args, i);
                            var item = items[i].item.latest();
                            if (! item)
                                continue;

                            if (! different && items[0].value !== items[i].value)
                                different = true;

                            historyState(item, false);
                            if (items[i].value === undefined)
                                item.unset(path);
                            else
                                item.set(path, items[i].value);
                            historyState(item, true);
                        }

                        if (different) {
                            args.field.class.add('null');
                        } else {
                            args.field.class.remove('null');
                        }
                    },
                    redo: function() {
                        for(var i = 0; i < items.length; i++) {
                            var path = pathAt(args, i);
                            var item = items[i].item.latest();
                            if (! item)
                                continue;

                            historyState(item, false);
                            if (value === undefined)
                                item.unset(path);
                            else
                                item.set(path, value);
                            item.set(path, value);
                            historyState(item, true);
                        }

                        args.field.class.remove('null');
                    }
                });
            }
        };

        changeFieldQueue = function() {
            if (args.field._changing)
                return;

            args.field._changing = true;
            setTimeout(function() {
                args.field._changing = false;
                update();
            }, 0);
        };

        var historyStart, historyEnd;

        if (args.type === 'rgb' || args.slider) {
            historyStart = function() {
                var items = [ ];

                for(var i = 0; i < args.link.length; i++) {
                    var v = args.link[i].get(pathAt(args, i));
                    if (v instanceof Array)
                        v = v.slice(0);

                    items.push({
                        item: args.link[i],
                        value: v
                    });
                }

                return items;
            };

            historyEnd = function(items, value) {
                // history
                editor.call('history:add', {
                    name: pathAt(args, 0),
                    undo: function() {
                        for(var i = 0; i < items.length; i++) {
                            var item = items[i].item.latest();
                            if (! item)
                                continue;

                            historyState(item, false);
                            item.set(pathAt(args, i), items[i].value);
                            historyState(item, true);
                        }
                    },
                    redo: function() {
                        for(var i = 0; i < items.length; i++) {
                            var item = items[i].item.latest();
                            if (! item)
                                continue;

                            historyState(item, false);
                            item.set(pathAt(args, i), value);
                            historyState(item, true);
                        }
                    }
                });
            };
        }

        if (args.type === 'rgb') {
            var colorPickerOn = false;
            events.push(args.field.on('click', function() {
                colorPickerOn = true;

                // set picker color
                editor.call('picker:color', args.field.value);

                var items = [ ];

                // picking starts
                var evtColorPickStart = editor.on('picker:color:start', function() {
                    items = historyStart();
                });

                // picked color
                var evtColorPick = editor.on('picker:color', function(color) {
                    args.field.value = color;
                });

                var evtColorPickEnd = editor.on('picker:color:end', function() {
                    historyEnd(items.slice(0), args.field.value.map(function(v) {
                        return v / 255;
                    }));
                });

                // position picker
                var rectPicker = editor.call('picker:color:rect');
                var rectField = args.field.element.getBoundingClientRect();
                editor.call('picker:color:position', rectField.left - rectPicker.width, rectField.top);

                // color changed, update picker
                var evtColorToPicker = args.field.on('change', function() {
                    editor.call('picker:color:set', this.value);
                });

                // picker closed
                editor.once('picker:color:close', function() {
                    evtColorPick.unbind();
                    evtColorPickStart.unbind();
                    evtColorPickEnd.unbind();
                    evtColorToPicker.unbind();
                    colorPickerOn = false;
                    args.field.element.focus();
                });
            }));

            // close picker if field destroyed
            args.field.once('destroy', function() {
                if (colorPickerOn)
                    editor.call('picker:color:close');
            });
        } else if (args.slider) {
            var sliderRecords;

            events.push(args.field.on('start', function() {
                sliderRecords = historyStart();
            }));

            events.push(args.field.on('end', function() {
                historyEnd(sliderRecords.slice(0), args.field.value);
            }));
        }

        update();
        events.push(args.field.on('change', changeField));

        for(var i = 0; i < args.link.length; i++) {
            events.push(args.link[i].on(pathAt(args, i) + ':set', changeFieldQueue));
            events.push(args.link[i].on(pathAt(args, i) + ':unset', changeFieldQueue));
        }

        events.push(args.field.once('destroy', function() {
            for(var i = 0; i < events.length; i++)
                events[i].unbind();
        }));

        return events;
    });

    // add field
    editor.method('attributes:addField', function(args) {
        var panel = args.panel;

        if (! panel) {
            panel = new ui.Panel();
            panel.flexWrap = 'nowrap';
            panel.WebkitFlexWrap = 'nowrap';
            panel.style.display = '';

            if (args.type) {
                panel.class.add('field-' + args.type);
            } else {
                panel.class.add('field');
            }

            (args.parent || root).append(panel);
        }

        if (args.name) {
            var label = new ui.Label({
                text: args.name
            });
            label.class.add('label-field');
            panel._label = label;
            panel.append(label);

            if (args.reference) {
                var tooltip = label._tooltip = editor.call('attributes:reference', {
                    element: label.element,
                    title: args.reference.title,
                    subTitle: args.reference.subTitle,
                    description: args.reference.description
                });

                tooltip.attach({
                    target: label,
                    element: label.element
                });
            }
        }

        if (args.canOverrideTemplate && args.path) {
            editor.call('attributes:registerOverridePath', args.path, panel.element);
        }

        var field;

        args.linkEvents = [ ];

        // if we provide multiple paths for a single Observer then turn args.link into an array
        if (args.paths && args.paths instanceof Array && args.link && ! (args.link instanceof Array)) {
            var link = args.link;
            args.link = [];
            for (var i = 0; i < args.paths.length; i++) {
                args.link.push(link);
            }
        }

        var linkField = args.linkField = function() {
            if (args.link) {
                var link = function(field, path) {
                    var data = {
                        field: field,
                        type: args.type,
                        slider: args.slider,
                        enum: args.enum,
                        link: args.link,
                        trim: args.trim,
                        name: args.name,
                        stopHistory: args.stopHistory
                    };

                    if (! path) {
                        path = args.paths || args.path;
                    }

                    if (path instanceof Array) {
                        data.paths = path;
                    } else {
                        data.path = path;
                    }

                    args.linkEvents = args.linkEvents.concat(editor.call('attributes:linkField', data));

                    // Give the field a uniquely addressable css class that we can target from Selenium
                    if (field.element && typeof path === 'string') {
                        field.element.classList.add('field-path-' + path.replace(/\./g, '-'));
                    }
                };

                if (field instanceof Array) {
                    for(var i = 0; i < field.length; i++) {
                        var paths = args.paths;

                        if (paths) {
                            paths = paths.map(function (p) {
                                return p + '.' + i;
                            });
                        }

                        link(field[i], paths || (args.path + '.' + i));
                    }
                } else {
                    link(field);
                }
            }
        };

        var unlinkField = args.unlinkField = function() {
            for(var i = 0; i < args.linkEvents.length; i++)
                args.linkEvents[i].unbind();

            args.linkEvents = [ ];
        };


        switch(args.type) {
            case 'string':
                if (args.enum) {
                    field = new ui.SelectField({
                        options: args.enum
                    });
                } else {
                    field = new ui.TextField();
                }

                field.value = args.value || '';
                field.flexGrow = 1;

                if (args.placeholder)
                    field.placeholder = args.placeholder;

                linkField();

                panel.append(field);
                break;

            case 'tags':
                // TODO: why isn't this in a seperate class/file???


                var innerPanel = new ui.Panel();
                var tagType = args.tagType || 'string';

                if (args.enum) {
                    field = new ui.SelectField({
                        options: args.enum,
                        type: tagType
                    });
                    field.renderChanges = false;
                    field.on('change', function (value) {
                        if (tagType === 'string') {
                            if (! value) return;

                            value = value.trim();
                        }

                        addTag(value);
                        field.value = '';
                    });

                    innerPanel.append(field);

                } else {
                    field = new ui.TextField();
                    field.blurOnEnter = false;
                    field.renderChanges = false;

                    field.element.addEventListener('keydown', function(evt) {
                        if (evt.keyCode !== 13 || ! field.value)
                            return;

                        addTag(field.value.trim());
                        field.value = '';
                    });

                    innerPanel.append(field);

                    var btnAdd = new ui.Button({
                        text: '&#57632'
                    });
                    btnAdd.flexGrow = 0;
                    btnAdd.on('click', function() {
                        if (! field.value)
                            return;

                        addTag(field.value.trim());
                        field.value = '';
                    });
                    innerPanel.append(btnAdd);
                }


                var tagsPanel = new ui.Panel();
                tagsPanel.class.add('tags');
                tagsPanel.flex = true;
                innerPanel.append(tagsPanel);

                var tagItems = { };
                var tagIndex = { };
                var tagList = [ ];

                var onRemoveClick = function() {
                    if (innerPanel.disabled)
                        return;

                    removeTag(this.tag);
                };

                var removeTag = function(tag) {
                    if (tagType === 'string' && ! tag) {
                        return;
                    } else if (tag === null || tag === undefined) {
                        return;
                    }

                    if (! tagIndex.hasOwnProperty(tag))
                        return;

                    var records = [ ];

                    for(var i = 0; i < args.link.length; i++) {
                        var path = pathAt(args, i);
                        if (args.link[i].get(path).indexOf(tag) === -1)
                            continue;

                        records.push({
                            item: args.link[i],
                            path: path,
                            value: tag
                        });

                        historyState(args.link[i], false);
                        args.link[i].removeValue(path, tag);
                        historyState(args.link[i], true);
                    }

                    if (!args.stopHistory) {
                        editor.call('history:add', {
                            name: pathAt(args, 0),
                            undo: function() {
                                for(var i = 0; i < records.length; i++) {
                                    var item = records[i].item.latest();
                                    if (! item)
                                        continue;

                                    historyState(item, false);
                                    item.insert(records[i].path, records[i].value);
                                    historyState(item, true);
                                }
                            },
                            redo: function() {
                                for(var i = 0; i < records.length; i++) {
                                    var item = records[i].item.latest();
                                    if (! item)
                                        continue;

                                    historyState(item, false);
                                    item.removeValue(records[i].path, records[i].value);
                                    historyState(item, true);
                                }
                            }
                        });
                    }
                };

                var addTag = function(tag) {
                    var records = [ ];

                    // convert to number if needed
                    if (args.tagType === 'number') {
                        tag = parseInt(tag, 10);
                        if (isNaN(tag))
                            return;
                    }

                    for(var i = 0; i < args.link.length; i++) {
                        var path = pathAt(args, i);
                        if (args.link[i].get(path).indexOf(tag) !== -1)
                            continue;

                        records.push({
                            item: args.link[i],
                            path: path,
                            value: tag
                        });

                        historyState(args.link[i], false);
                        args.link[i].insert(path, tag);
                        historyState(args.link[i], true);
                    }

                    if (!args.stopHistory) {
                        editor.call('history:add', {
                            name: pathAt(args, 0),
                            undo: function() {
                                for(var i = 0; i < records.length; i++) {
                                    var item = records[i].item.latest();
                                    if (! item)
                                        continue;

                                    historyState(item, false);
                                    item.removeValue(records[i].path, records[i].value);
                                    historyState(item, true);
                                }
                            },
                            redo: function() {
                                for(var i = 0; i < records.length; i++) {
                                    var item = records[i].item.latest();
                                    if (! item)
                                        continue;

                                    historyState(item, false);
                                    item.insert(records[i].path, records[i].value);
                                    historyState(item, true);
                                }
                            }
                        });
                    }
                };

                var onInsert = function(tag) {
                    if (! tagIndex.hasOwnProperty(tag)) {
                        tagIndex[tag] = 0;
                        tagList.push(tag);
                    }

                    tagIndex[tag]++;
                    insertElement(tag);
                };

                var onRemove = function(tag) {
                    if (! tagIndex[tag])
                        return;

                    tagIndex[tag]--;

                    if (! tagIndex[tag]) {
                        tagsPanel.innerElement.removeChild(tagItems[tag]);
                        var ind = tagList.indexOf(tag);
                        if (ind !== -1)
                            tagList.splice(ind, 1);

                        delete tagItems[tag];
                        delete tagIndex[tag];
                    } else {
                        if (tagIndex[tag] === args.link.length) {
                            tagItems[tag].classList.remove('partial');
                        } else {
                            tagItems[tag].classList.add('partial');
                        }
                    }
                };

                // when tag field is initialized
                var onSet = function (values, oldValues) {
                    if (oldValues) {
                        for (let i = 0; i < oldValues.length; i++) {
                            onRemove(oldValues[i]);
                        }
                    }

                    for (var i = 0; i < values.length; i++) {
                        var value = values[i];
                        onInsert(value);
                    }
                };

                var insertElement = function(tag) {
                    if (! tagItems[tag]) {
                        sortTags();

                        var item = document.createElement('div');
                        tagItems[tag] = item;
                        item.classList.add('tag');
                        var itemText = document.createElement('span');
                        itemText.textContent = args.tagToString ? args.tagToString(tag) : tag;
                        item.appendChild(itemText);

                        // the original tag value before tagToString is called. Useful
                        // if the tag value is an id for example
                        item.originalValue = tag;

                        // attach click handler on text part of the tag - bind the listener
                        // to the tag item so that `this` refers to that tag in the listener
                        if (args.onClickTag) {
                            itemText.addEventListener('click', args.onClickTag.bind(item));
                        }

                        var icon = document.createElement('span');
                        icon.innerHTML = '&#57650;';
                        icon.classList.add('icon');
                        icon.tag = tag;
                        icon.addEventListener('click', onRemoveClick, false);
                        item.appendChild(icon);

                        var ind = tagList.indexOf(tag);
                        if (tagItems[tagList[ind + 1]]) {
                            tagsPanel.appendBefore(item, tagItems[tagList[ind + 1]]);
                        } else {
                            tagsPanel.append(item);
                        }
                    }

                    if (tagIndex[tag] === args.link.length) {
                        tagItems[tag].classList.remove('partial');
                    } else {
                        tagItems[tag].classList.add('partial');
                    }
                };

                var sortTags = function() {
                    tagList.sort(function(a, b) {
                        if (args.tagToString) {
                            a = args.tagToString(a);
                            b = args.tagToString(b);
                        }

                        if (a > b) {
                            return 1;
                        } else if (a < b) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });
                };

                if (args.placeholder)
                    field.placeholder = args.placeholder;

                // list
                args.linkEvents = [ ];

                args.linkField = function() {
                    if (args.link) {
                        if (! (args.link instanceof Array))
                            args.link = [ args.link ];

                        for(var i = 0; i < args.link.length; i++) {
                            var path = pathAt(args, i);
                            var tags = args.link[i].get(path);

                            args.linkEvents.push(args.link[i].on(path + ':set', onSet));
                            args.linkEvents.push(args.link[i].on(path + ':insert', onInsert));
                            args.linkEvents.push(args.link[i].on(path + ':remove', onRemove));

                            if (! tags)
                                continue;

                            for(var t = 0; t < tags.length; t++) {
                                if (tagType === 'string' && ! tags[t]) {
                                    continue;
                                } else if (tags[t] === null || tags[t] === undefined) {
                                    continue;
                                }

                                if (! tagIndex.hasOwnProperty(tags[t])) {
                                    tagIndex[tags[t]] = 0;
                                    tagList.push(tags[t]);
                                }

                                tagIndex[tags[t]]++;
                            }
                        }
                    }

                    sortTags();

                    for(var i = 0; i < tagList.length; i++)
                        insertElement(tagList[i]);
                };

                args.unlinkField = function() {
                    for(var i = 0; i < args.linkEvents.length; i++)
                        args.linkEvents[i].unbind();

                    args.linkEvents = [ ];

                    for(var key in tagItems)
                        tagsPanel.innerElement.removeChild(tagItems[key]);

                    tagList = [ ];
                    tagIndex = { };
                    tagItems = { };
                };

                args.linkField();

                panel.once('destroy', args.unlinkField);

                panel.append(innerPanel);
                break;

            case 'text':
                field = new ui.TextAreaField();

                field.value = args.value || '';
                field.flexGrow = 1;

                if (args.placeholder)
                    field.placeholder = args.placeholder;

                linkField();

                panel.append(field);
                break;

            case 'number':
                if (args.enum) {
                    field = new ui.SelectField({
                        options: args.enum,
                        type: 'number'
                    });
                } else if (args.slider) {
                    field = new ui.Slider();
                } else {
                    field = new ui.NumberField();
                }

                field.value = args.value || 0;
                field.flexGrow = 1;

                if (args.allowNull) {
                    field.allowNull = true;
                }

                if (args.placeholder)
                    field.placeholder = args.placeholder;

                if (args.precision != null)
                    field.precision = args.precision;

                if (args.step != null)
                    field.step = args.step;

                if (args.min != null)
                    field.min = args.min;

                if (args.max != null)
                    field.max = args.max;

                linkField();

                panel.append(field);
                break;

            case 'checkbox':
                if (args.enum) {
                    field = new ui.SelectField({
                        options: args.enum,
                        type: 'boolean'
                    });
                    field.flexGrow = 1;
                } else {
                    field = new ui.Checkbox();
                }

                field.value = args.value || 0;
                field.class.add('tick');

                linkField();

                panel.append(field);
                break;

            case 'vec2':
            case 'vec3':
            case 'vec4':
                var channels = parseInt(args.type[3], 10);
                field = [ ];

                for(var i = 0; i < channels; i++) {
                    field[i] = new ui.NumberField();
                    field[i].flexGrow = 1;
                    field[i].style.width = '24px';
                    field[i].value = (args.value && args.value[i]) || 0;
                    panel.append(field[i]);

                    if (args.placeholder)
                        field[i].placeholder = args.placeholder[i];

                    if (args.precision != null)
                        field[i].precision = args.precision;

                    if (args.step != null)
                        field[i].step = args.step;

                    if (args.min != null)
                        field[i].min = args.min;

                    if (args.max != null)
                        field[i].max = args.max;

                    // if (args.link)
                    //     field[i].link(args.link, args.path + '.' + i);
                }

                linkField();
                break;

            case 'rgb':
                field = new ui.ColorField();

                if (args.channels != null)
                    field.channels = args.channels;

                linkField();

                var colorPickerOn = false;
                field.on('click', function() {
                    colorPickerOn = true;
                    var first = true;

                    // set picker color
                    editor.call('picker:color', field.value);

                    // picking starts
                    var evtColorPickStart = editor.on('picker:color:start', function() {
                        first = true;
                    });

                    // picked color
                    var evtColorPick = editor.on('picker:color', function(color) {
                        first = false;
                        field.value = color;
                    });

                    // position picker
                    var rectPicker = editor.call('picker:color:rect');
                    var rectField = field.element.getBoundingClientRect();
                    editor.call('picker:color:position', rectField.left - rectPicker.width, rectField.top);

                    // color changed, update picker
                    var evtColorToPicker = field.on('change', function() {
                        editor.call('picker:color:set', this.value);
                    });

                    // picker closed
                    editor.once('picker:color:close', function() {
                        evtColorPick.unbind();
                        evtColorPickStart.unbind();
                        evtColorToPicker.unbind();
                        colorPickerOn = false;
                        field.element.focus();
                    });
                });

                // close picker if field destroyed
                field.on('destroy', function() {
                    if (colorPickerOn)
                        editor.call('picker:color:close');
                });

                panel.append(field);
                break;

            case 'asset':
                field = new ui.ImageField({
                    canvas: args.kind === 'material' || args.kind === 'model' || args.kind === 'cubemap' || args.kind === 'font' || args.kind === 'sprite'
                });
                var evtPick;

                if (label) {
                    label.renderChanges = false;
                    field._label = label;

                    label.style.width = '32px';
                    label.flexGrow = 1;
                }


                var panelFields = document.createElement('div');
                panelFields.classList.add('top');

                var panelControls = document.createElement('div');
                panelControls.classList.add('controls');

                var fieldTitle = field._title = new ui.Label();
                fieldTitle.text = 'Empty';
                fieldTitle.parent = panel;
                fieldTitle.flexGrow = 1;
                fieldTitle.placeholder = '...';

                var btnEdit = new ui.Button({
                    text: '&#57648;'
                });
                btnEdit.disabled = true;
                btnEdit.parent = panel;
                btnEdit.flexGrow = 0;

                var btnRemove = new ui.Button({
                    text: '&#57650;'
                });
                btnRemove.disabled = true;
                btnRemove.parent = panel;
                btnRemove.flexGrow = 0;

                fieldTitle.on('click', function() {
                    var asset = editor.call('assets:get', field.value);
                    editor.call('picker:asset', {
                        type: args.kind,
                        currentAsset: asset
                    });

                    evtPick = editor.once('picker:asset', function(asset) {
                        var oldValues = { };
                        if (args.onSet && args.link && args.link instanceof Array) {
                            for(var i = 0; i < args.link.length; i++) {
                                var id = 0;
                                if (args.link[i]._type === 'asset') {
                                    id = args.link[i].get('id');
                                } else if (args.link[i]._type === 'entity') {
                                    id = args.link[i].get('resource_id');
                                } else {
                                    continue;
                                }

                                oldValues[id] = args.link[i].get(pathAt(args, i));
                            }
                        }

                        field.emit('beforechange', asset.get('id'));
                        field.value = asset.get('id');
                        evtPick = null;
                        if (args.onSet) args.onSet(asset, oldValues);
                    });

                    editor.once('picker:asset:close', function() {
                        if (evtPick) {
                            evtPick.unbind();
                            evtPick = null;
                        }
                        field.element.focus();
                    });
                });

                field.on('click', function() {
                    if (! this.value)
                        return;

                    var asset = editor.call('assets:get', this.value);
                    if (! asset) return;
                    editor.call('selector:set', 'asset', [ asset ]);

                    var path = asset.get('path');
                    if (path.length) {
                        editor.call('assets:panel:currentFolder', editor.call('assets:get', path[path.length - 1]));
                    } else {
                        editor.call('assets:panel:currentFolder', null);
                    }
                });
                btnEdit.on('click', function() {
                    field.emit('click');
                });

                btnRemove.on('click', function() {
                    field.emit('beforechange', null);
                    field.value = null;
                });

                var previewRenderer;
                var renderQueued;
                var queueRender;

                var evtThumbnailChange;
                var updateThumbnail = function(empty) {
                    var asset = editor.call('assets:get', field.value);

                    if (previewRenderer) {
                        previewRenderer.destroy();
                        previewRenderer = null;
                    }

                    if (empty) {
                        field.image = '';
                    } else if (! asset) {
                        field.image = config.url.home + '/editor/scene/img/asset-placeholder-texture.png';
                    } else {
                        if (asset.has('thumbnails.m')) {
                            var src = asset.get('thumbnails.m');
                            if (src.startsWith('data:image/png;base64')) {
                                field.image = asset.get('thumbnails.m');
                            } else {
                                field.image = config.url.home + asset.get('thumbnails.m').appendQuery('t=' + asset.get('file.hash'));
                            }
                        } else {
                            field.image = '/editor/scene/img/asset-placeholder-' + asset.get('type') + '.png';
                        }

                        if (args.kind === 'material') {
                            previewRenderer = new pcui.MaterialThumbnailRenderer(asset, field.elementImage);
                        } else if (args.kind === 'model') {
                            previewRenderer = new pcui.ModelThumbnailRenderer(asset, field.elementImage);
                        } else if (args.kind === 'cubemap') {
                            previewRenderer = new pcui.CubemapThumbnailRenderer(asset, field.elementImage, editor.call('assets:raw'));
                        } else if (args.kind === 'font') {
                            previewRenderer = new pcui.FontThumbnailRenderer(asset, field.elementImage);
                        } else if (args.kind === 'sprite') {
                            previewRenderer = new pcui.SpriteThumbnailRenderer(asset, field.elementImage, editor.call('assets:raw'));
                        }
                    }

                    if (queueRender)
                        queueRender();
                };

                if (args.kind === 'material' || args.kind === 'model' || args.kind === 'font' || args.kind === 'sprite' || args.kind === 'cubemap') {
                    if (args.kind !== 'sprite' && args.kind !== 'cubemap') {
                        field.elementImage.classList.add('flipY');
                    }

                    var renderPreview = function() {
                        renderQueued = false;

                        if (previewRenderer) {
                            // render
                            previewRenderer.render();
                        } else {
                            var ctx = field.elementImage.ctx;
                            if (! ctx)
                                ctx = field.elementImage.ctx = field.elementImage.getContext('2d');

                            ctx.clearRect(0, 0, field.elementImage.width, field.elementImage.height);
                        }
                    };

                    renderPreview();

                    queueRender = function() {
                        if (renderQueued) return;
                        renderQueued = true;
                        requestAnimationFrame(renderPreview);
                    };

                    field.once('destroy', function() {
                        if (previewRenderer) {
                            previewRenderer.destroy();
                            previewRenderer = null;
                        }
                    });
                }

                linkField();

                var updateField = function() {
                    var value = field.value;

                    fieldTitle.text = field.class.contains('null') ? 'various' : 'Empty';

                    btnEdit.disabled = ! value;
                    btnRemove.disabled = ! value && ! field.class.contains('null');

                    if (evtThumbnailChange) {
                        evtThumbnailChange.unbind();
                        evtThumbnailChange = null;
                    }

                    if (! value) {
                        if (field.class.contains('star'))
                            fieldTitle.text = '* ' + fieldTitle.text;

                        field.empty = true;
                        updateThumbnail(true);

                        return;
                    }

                    field.empty = false;

                    var asset = editor.call('assets:get', value);

                    if (! asset)
                        return updateThumbnail();

                    evtThumbnailChange = asset.on('file.hash.m:set', updateThumbnail);
                    updateThumbnail();

                    fieldTitle.text = asset.get('name');

                    if (field.class.contains('star'))
                        fieldTitle.text = '* ' + fieldTitle.text;
                };
                field.on('change', updateField);

                if (args.value)
                    field.value = args.value;

                updateField();

                var dropRef = editor.call('drop:target', {
                    ref: panel,
                    filter: function(type, data) {
                        var rectA = root.innerElement.getBoundingClientRect();
                        var rectB = panel.element.getBoundingClientRect();
                        return data.id && (args.kind === '*' || type === 'asset.' + args.kind) && data.id !== field.value && ! editor.call('assets:get', data.id).get('source') && rectB.top > rectA.top && rectB.bottom < rectA.bottom;
                    },
                    drop: function(type, data) {
                        if ((args.kind !== '*' && type !== 'asset.' + args.kind) || editor.call('assets:get', data.id).get('source'))
                            return;

                        var oldValues = { };
                        if (args.onSet && args.link && args.link instanceof Array) {
                            for(var i = 0; i < args.link.length; i++) {
                                var id = 0;
                                if (args.link[i]._type === 'asset') {
                                    id = args.link[i].get('id');
                                } else if (args.link[i]._type === 'entity') {
                                    id = args.link[i].get('resource_id');
                                } else {
                                    continue;
                                }

                                oldValues[id] = args.link[i].get(pathAt(args, i));
                            }
                        }

                        field.emit('beforechange', data.id);
                        field.value = data.id;

                        if (args.onSet) {
                            var asset = editor.call('assets:get', data.id);
                            if (asset) args.onSet(asset, oldValues);
                        }
                    },
                    over: function(type, data) {
                        if (args.over)
                            args.over(type, data);
                    },
                    leave: function() {
                        if (args.leave)
                            args.leave();
                    }
                });
                field.on('destroy', function() {
                    dropRef.destroy();
                    if (evtThumbnailChange) {
                        evtThumbnailChange.unbind();
                        evtThumbnailChange = null;
                    }
                });

                // thumbnail
                panel.append(field);
                // right side
                panel.append(panelFields);
                // controls
                panelFields.appendChild(panelControls);
                // label
                if (label) {
                    panel.innerElement.removeChild(label.element);
                    panelControls.appendChild(label.element);
                }
                panelControls.classList.remove('label-field');
                // edit
                panelControls.appendChild(btnEdit.element);
                // remove
                panelControls.appendChild(btnRemove.element);

                // title
                panelFields.appendChild(fieldTitle.element);
                break;

            // entity picker
            case 'entity':
                field = new ui.Label();
                field.class.add('add-entity');
                field.flexGrow = 1;
                field.class.add('null');

                field.text = 'Select Entity';
                field.placeholder = '...';

                panel.append(field);

                var icon = document.createElement('span');
                icon.classList.add('icon');

                icon.addEventListener('click', function (e) {
                    e.stopPropagation();

                    if (editor.call('permissions:write'))
                        field.text = '';
                });

                field.on('change', function (value) {
                    if (value) {
                        var entity = editor.call('entities:get', value);
                        if (!entity) {
                            field.text = null;
                            return;
                        }

                        field.element.innerHTML = entity.get('name');
                        field.element.appendChild(icon);
                        field.placeholder = '';

                        if (value !== 'various')
                            field.class.remove('null');
                    } else {
                        field.element.innerHTML = 'Select Entity';
                        field.placeholder = '...';
                        field.class.add('null');
                    }
                });

                linkField();

                var getCurrentEntity = function () {
                    var entity = null;
                    if (args.link) {
                        if (! (args.link instanceof Array)) {
                            args.link = [args.link];
                        }

                        // get initial value only if it's the same for all
                        // links otherwise set it to null
                        for (var i = 0, len = args.link.length; i < len; i++) {
                            var val = args.link[i].get(pathAt(args, i));
                            if (entity !== val) {
                                if (entity) {
                                    entity = null;
                                    break;
                                } else {
                                    entity = val;
                                }
                            }
                        }
                    }

                    return entity;
                };

                field.on('click', function () {
                    var evtEntityPick = editor.once('picker:entity', function (entity) {
                        field.text = entity ? entity.get('resource_id') : null;
                        evtEntityPick = null;
                    });

                    var initialValue = getCurrentEntity();

                    editor.call('picker:entity', initialValue, args.filter || null);

                    editor.once('picker:entity:close', function () {
                        if (evtEntityPick) {
                            evtEntityPick.unbind();
                            evtEntityPick = null;
                        }
                    });
                });

                // highlight on hover
                field.on('hover', function () {
                    var entity = getCurrentEntity();
                    if (! entity) return;

                    editor.call('entities:panel:highlight', entity, true);

                    field.once('blur', function () {
                        editor.call('entities:panel:highlight', entity, false);
                    });

                    field.once('click', function () {
                        editor.call('entities:panel:highlight', entity, false);
                    });
                });

                var dropRef = editor.call('drop:target', {
                    ref: field,
                    filter: function(type, data) {
                        var rectA = root.innerElement.getBoundingClientRect();
                        var rectB = field.element.getBoundingClientRect();
                        return type === 'entity' && data.resource_id !== field.value && rectB.top > rectA.top && rectB.bottom < rectA.bottom;
                    },
                    drop: function(type, data) {
                        if (type !== 'entity')
                            return;

                        field.value = data.resource_id;
                    },
                    over: function(type, data) {
                        if (args.over)
                            args.over(type, data);
                    },
                    leave: function() {
                        if (args.leave)
                            args.leave();
                    }
                });


                break;
            case 'image':
                panel.flex = false;

                field = new Image();
                field.style.maxWidth = '100%';
                field.style.display = 'block';
                field.src = args.src;

                panel.append(field);
                break;

            case 'progress':
                field = new ui.Progress();
                field.flexGrow = 1;

                panel.append(field);
                break;

            case 'code':
                field = new ui.Code();
                field.flexGrow = 1;

                if (args.value)
                    field.text = args.value;

                panel.append(field);
                break;

            case 'button':
                field = new ui.Button();
                field.flexGrow = 1;
                field.text = args.text || 'Button';
                panel.append(field);
                break;

            case 'element':
                field = args.element;
                panel.append(field);
                break;

            case 'curveset':
                field = new ui.CurveField(args);
                field.flexGrow = 1;
                field.text = args.text || '';

                // Warning: Curve fields do not currently support multiselect
                if (args.link) {
                    var link = args.link;
                    if (args.link instanceof Array)
                        link = args.link[0];

                    var path = pathAt(args, 0);

                    field.link(link, args.canRandomize ? [path, path + '2'] : [path]);
                }

                var curvePickerOn = false;

                var toggleCurvePicker = function () {
                    if (!field.class.contains('disabled') && !curvePickerOn) {
                        editor.call('picker:curve', field.value, args);

                        curvePickerOn = true;

                        // position picker
                        var rectPicker = editor.call('picker:curve:rect');
                        var rectField = field.element.getBoundingClientRect();
                        editor.call('picker:curve:position', rectField.right - rectPicker.width, rectField.bottom);

                        args.keepZoom = false;

                        var combine = false;

                        var evtChangeStart = editor.on('picker:curve:change:start', function () {
                            combine = true;
                        });

                        var evtChangeEnd = editor.on('picker:curve:change:end', function () {
                            combine = false;
                        });

                        var evtPickerChanged = editor.on('picker:curve:change', function (paths, values) {
                            if (! field._link) return;

                            var link = field._link;

                            var previous = {
                                paths: [],
                                values: []
                            };

                            var path;
                            for (var i = 0, len = paths.length; i < len; i++) {
                                path = pathAt(args, 0); // always use 0 because we do not support multiselect
                                // use the second curve path if needed
                                if (args.canRandomize && paths[i][0] !== '0') {
                                    path += '2';
                                }

                                path += paths[i].substring(1);

                                previous.paths.push(path);
                                previous.values.push(field._link.get(path));
                            }


                            var undo = function () {
                                var item = link.latest();

                                if (! item) return;

                                args.keepZoom = true;

                                var history = false;
                                if (item.history) {
                                    history = item.history.enabled;
                                    item.history.enabled = false;
                                }

                                for (var i = 0, len = previous.paths.length; i < len; i++) {
                                    item.set(previous.paths[i], previous.values[i]);
                                }

                                if (item.history)
                                    item.history.enabled = history;

                                args.keepZoom = false;
                            };

                            var redo = function () {
                                var item = link.latest();

                                if (! item) return;

                                args.keepZoom = true;

                                var history = false;
                                if (item.history) {
                                    history = item.history.enabled;
                                    item.history.enabled = false;
                                }

                                for (var i = 0, len = paths.length; i < len; i++) {
                                    path = pathAt(args, 0); // always use 0 because we do not support multiselect
                                    // use the second curve path if needed
                                    if (args.canRandomize && paths[i][0] !== '0') {
                                        path += '2';
                                    }

                                    path += paths[i].substring(1);

                                    item.set(path, values[i]);
                                }

                                if (item.history)
                                    item.history.enabled = history;

                                args.keepZoom = false;
                            };

                            redo();

                            // add custom history event
                            editor.call('history:add', {
                                name: path + '.curves',
                                combine: combine,
                                undo: undo,
                                redo: redo
                            });

                        });

                        var evtRefreshPicker = field.on('change', function (value) {
                            editor.call('picker:curve:set', value, args);
                        });

                        editor.once('picker:curve:close', function () {
                            evtRefreshPicker.unbind();
                            evtPickerChanged.unbind();
                            evtChangeStart.unbind();
                            evtChangeEnd.unbind();
                            curvePickerOn = false;
                        });
                    }
                };

                // open curve editor on click
                field.on('click', toggleCurvePicker);

                // close picker if field destroyed
                field.on('destroy', function() {
                    if (curvePickerOn) {
                        editor.call('picker:curve:close');
                    }
                });

                panel.append(field);
                break;

            case 'gradient':
                field = new ui.CurveField(args);
                field.flexGrow = 1;
                field.text = args.text || '';

                if (args.link) {
                    var link = args.link;
                    if (args.link instanceof Array)
                        link = args.link[0];
                    var path = pathAt(args, 0);
                    field.link(link, [path]);
                }

                var gradientPickerVisible = false;

                var toggleGradientPicker = function () {
                    if (!field.class.contains('disabled') && !gradientPickerVisible) {
                        editor.call('picker:gradient', field.value, args);

                        gradientPickerVisible = true;

                        // position picker
                        var rectPicker = editor.call('picker:gradient:rect');
                        var rectField = field.element.getBoundingClientRect();
                        editor.call('picker:gradient:position', rectField.right - rectPicker.width, rectField.bottom);

                        var evtPickerChanged = editor.on('picker:curve:change', function (paths, values) {
                            if (!field._link) return;

                            var link = field._link;

                            var previous = {
                                paths: [],
                                values: []
                            };

                            var path;
                            for (var i=0; i<paths.length; i++) {
                                // always use 0 because we do not support multiselect
                                path = pathAt(args, 0) + paths[i].substring(1);
                                previous.paths.push(path);
                                previous.values.push(field._link.get(path));
                            }

                            var undo = function() {
                                var item = link.latest();

                                if (!item) return;

                                var history = false;
                                if (item.history) {
                                    history = item.history.enabled;
                                    item.history.enabled = false;
                                }

                                for (var i=0; i<previous.paths.length; i++) {
                                    item.set(previous.paths[i], previous.values[i]);
                                }

                                if (item.history)
                                    item.history.enabled = history;
                            };

                            var redo = function() {
                                var item = link.latest();

                                if (!item) return;

                                var history = false;
                                if (item.history) {
                                    history = item.history.enabled;
                                    item.history.enabled = false;
                                }

                                for (var i=0; i<paths.length; i++) {
                                    // always use 0 because we do not support multiselect
                                    path = pathAt(args, 0) + paths[i].substring(1);
                                    item.set(path, values[i]);
                                }

                                if (item.history)
                                    item.history.enabled = history;
                            };

                            redo();

                            editor.call('history:add', {
                                name: path + '.curves',
                                undo: undo,
                                redo: redo
                            });
                        });

                        var evtRefreshPicker = field.on('change', function (value) {
                            editor.call('picker:gradient:set', value, args);
                        });

                        editor.once('picker:gradient:close', function () {
                            evtRefreshPicker.unbind();
                            evtPickerChanged.unbind();
                            gradientPickerVisible = false;
                        });
                    }
                };

                // open curve editor on click
                field.on('click', toggleGradientPicker);

                panel.append(field);
                break;

            case 'array':
                field = editor.call('attributes:addArray', args);
                panel.append(field);

                break;

            default:
                field = new ui.Label();
                field.flexGrow = 1;
                field.text = args.value || '';
                field.class.add('selectable');

                if (args.placeholder)
                    field.placeholder = args.placeholder;

                linkField();

                panel.append(field);
                break;
        }

        if (args.className && field instanceof ui.Element) {
            field.class.add(args.className);
        }

        return field;
    });

    var inspectedItems = [ ];

    editor.on('attributes:clear', function() {
        for(var i = 0; i < inspectedItems.length; i++) {
            inspectedItems[i].unbind();
        }
        inspectedItems = [ ];
    });

    editor.method('attributes:inspect', function(type, item) {
        
        clearPanel();

        // clear if destroyed
        inspectedItems.push(item.once('destroy', function() {
            editor.call('attributes:clear');
        }));

        root.headerText = type;
        
        editor.emit('attributes:inspect[' + type + ']', [ item ]);
        editor.emit('attributes:inspect[*]', type, [ item ]);
    });

    editor.on('selector:change', function(type, items) {
        clearPanel();

        // nothing selected
        if (items.length === 0) {
            var label = new ui.Label({ text: 'Select anything to Inspect' });
            label.style.display = 'block';
            label.style.textAlign = 'center';
            root.append(label);

            root.headerText = title;

            return;
        }

        // clear if destroyed
        for(var i = 0; i < items.length; i++) {
            inspectedItems.push(items[i].once('destroy', function() {
                editor.call('attributes:clear');
            }));
        }

        // if (overridesSidebar) {
        //     overridesSidebar.entity = null;
        //     overridesSidebar.hidden = true;
        // }

        
        root.headerText = type;
        editor.emit('attributes:inspect[' + type + ']', items);
        editor.emit('attributes:inspect[*]', type, items);
    });

    editor.emit('selector:change', null, [ ]);
});


/* editor/attributes/attributes-assets-list.js */
editor.once('load', function () {
    'use strict';

    // var legacyScripts = editor.call('settings:project').get('useLegacyScripts');
    var root = editor.call('layout.attributes');

    // get the right path from args
    var pathAt = function (args, index) {
        return args.paths ? args.paths[index] : args.path;
    };

    var historyState = function (item, state) {
        if (item.history !== undefined) {
            if (typeof(item.history) === 'boolean') {
                item.history = state;
            } else {
                item.history.enabled = state;
            }
        } else {
            if (item._parent && item._parent.history !== undefined) {
                item._parent.history.enabled = state;
            }
        }
    };

    /**
     * Creates an Asset List widget
     * @param {Object} args Widget arguments
     * @param {Observer[]} args.link The observers we are editing
     * @param {String} [args.type] The asset type that is selectible from the asset list
     * @param {Function} [args.filterFn] A custom function that filters assets that can be dragged on the list. The function
     * takes the asset as its only argument.
     */
    editor.method('attributes:addAssetsList', function (args) {
        var link = args.link;
        var assetType = args.type;
        var assetFilterFn = args.filterFn;
        var panel = args.panel;
        var events = [];
        // index list items by asset id
        var assetIndex = {};

        var panelWidget = new ui.Panel();
        panelWidget.flex = true;
        panelWidget.class.add('asset-list');

        var isSelectingAssets = false;
        var currentSelection = null;

        // button that enables selection mode
        var btnSelectionMode = new ui.Button({
            text: 'Add Assets'
        });
        btnSelectionMode.class.add('selection-mode');
        panelWidget.append(btnSelectionMode);

        // panel for buttons
        var panelButtons = new ui.Panel();
        panelButtons.class.add('buttons');
        panelButtons.flex = true;
        panelButtons.hidden = true;

        // label
        var labelAdd = new ui.Label({
            text: 'Add Assets'
        });
        panelButtons.append(labelAdd);

        // add button
        var btnAdd = new ui.Button({
            text: 'ADD SELECTION'
        });
        btnAdd.disabled = true;
        btnAdd.class.add('add-assets');

        panelButtons.append(btnAdd);

        // done button
        var btnDone = new ui.Button({
            text: 'DONE'
        });
        btnDone.flexGrow = 1;
        btnDone.class.add('done');
        panelButtons.append(btnDone);

        panelWidget.append(panelButtons);

        btnSelectionMode.on('click', function () {
            
            isSelectingAssets = true;
            panelButtons.hidden = false;
            btnSelectionMode.hidden = true;

            fieldAssets.parent.style.zIndex = 102;
            dropRef.disabled = true;
            
            // asset picker
            editor.call('picker:asset', {
                type: assetType,
                multi: true
            });
            
            // on pick
            var evtPick = editor.on('picker:assets', function (assets) {
                
                currentSelection = assets.filter(function (asset) {
                    if (assetFilterFn) {
                        return assetFilterFn(asset);
                    }
                    return true;
                }).map(function (asset) {
                    return asset.get('id');
                });

                btnAdd.disabled = !currentSelection.length;
            });
            
            editor.once('picker:asset:close', function () {
                currentSelection = null;
                isSelectingAssets = false;
                panelButtons.hidden = true;
                btnSelectionMode.hidden = false;
                btnAdd.disabled = true;
                fieldAssets.parent.style.zIndex = '';
                dropRef.disabled = !panel.enabled;

                if (evtPick) {
                    evtPick.unbind();
                    evtPick = null;
                }
            });
        });

        btnDone.on('click', function () {
            editor.call('picker:asset:close');
        });

        // search field
        var fieldFilter = new ui.TextField();
        fieldFilter.hidden = true;
        fieldFilter.elementInput.setAttribute('placeholder', 'Type to filter');
        fieldFilter.keyChange = true;
        fieldFilter.renderChanges = false;
        panelWidget.append(fieldFilter);

        // assets
        var fieldAssets;
        var fieldAssetsList = new ui.List();
        fieldAssetsList.class.add('empty');
        fieldAssetsList.flexGrow = 1;

        fieldAssetsList.on('select', function (item) {
            if (!item.asset) return;
            editor.call('selector:set', 'asset', [item.asset]);
        });

        // Adds asset ids to the list
        var addAssets = function (assetIds) {
            var records = [];

            for (var i = 0; i < link.length; i++) {
                var path = pathAt(args, i);

                for (var j = 0; j < assetIds.length; j++) {
                    var assetId = assetIds[j];

                    // check if already in list
                    if (link[i].get(path).indexOf(assetId) !== -1)
                        continue;

                    records.push({
                        item: link[i],
                        path: path,
                        value: assetId
                    });

                    historyState(link[i], false);
                    link[i].insert(path, assetId);
                    historyState(link[i], true);
                }
            }

            editor.call('history:add', {
                name: pathAt(args, 0),
                undo: function () {
                    for (var i = 0; i < records.length; i++) {
                        var item = records[i].item.latest();
                        if (!item) continue;

                        historyState(item, false);
                        item.removeValue(records[i].path, records[i].value);
                        historyState(item, true);
                    }
                },
                redo: function () {
                    for (var i = 0; i < records.length; i++) {
                        var item = records[i].item.latest();
                        if (!item) continue;

                        historyState(item, false);
                        item.insert(records[i].path, records[i].value);
                        historyState(item, true);
                    }
                }
            });
        };

        // Removes asset id from the list
        var removeAsset = function (assetId) {
            var records = [];

            for (var i = 0; i < link.length; i++) {
                var path = pathAt(args, i);
                var ind = link[i].get(path).indexOf(assetId);
                if (ind === -1)
                    continue;

                records.push({
                    item: link[i],
                    path: path,
                    value: assetId,
                    ind: ind
                });

                historyState(link[i], false);
                link[i].removeValue(path, assetId);
                historyState(link[i], true);
            }

            editor.call('history:add', {
                name: pathAt(args, 0),
                undo: function () {
                    for (var i = 0; i < records.length; i++) {
                        var item = records[i].item.latest();
                        if (!item) continue;

                        historyState(item, false);
                        item.insert(records[i].path, records[i].value, records[i].ind);
                        historyState(item, true);
                    }
                },
                redo: function () {
                    for (var i = 0; i < records.length; i++) {
                        var item = records[i].item.latest();
                        if (!item) continue;

                        historyState(item, false);
                        item.removeValue(records[i].path, records[i].value);
                        historyState(item, true);
                    }
                }
            });
        };

        // add asset list item to the list
        var addAssetListItem = function (assetId, after) {
            assetId = assetId;

            var item = assetIndex[assetId];
            if (item) {
                item.count++;
                item.text = (item.count === link.length ? '' : '* ') + item._assetText;
                return;
            }

            var asset = editor.call('assets:get', assetId);
            var text = assetId;
            if (asset && asset.get('name')) {
                text = asset.get('name');
            } else if (!asset) {
                text += ' (Missing)';
            }

            item = new ui.ListItem({
                text: (link.length === 1) ? text : '* ' + text
            });
            if (asset) {
                item.class.add('type-' + asset.get('type'));
            }
            item.count = 1;
            item.asset = asset;
            item._assetText = text;

            if (after) {
                fieldAssetsList.appendAfter(item, after);
            } else {
                fieldAssetsList.append(item);
            }

            fieldAssetsList.class.remove('empty');
            fieldFilter.hidden = false;

            assetIndex[assetId] = item;

            // remove button
            var btnRemove = new ui.Button();
            btnRemove.class.add('remove');
            btnRemove.on('click', function () {
                removeAsset(assetId);

            });
            btnRemove.parent = item;
            item.element.appendChild(btnRemove.element);

            item.once('destroy', function () {
                delete assetIndex[assetId];
            });
        };

        // Removes list item for the specified asset id
        var removeAssetListItem = function (assetId) {
            var item = assetIndex[assetId];

            if (!item)
                return;

            item.count--;

            if (item.count === 0) {
                item.destroy();
                fieldAssets.emit('remove', item);

                if (!fieldAssetsList.element.children.length) {
                    fieldAssetsList.class.add('empty');
                    fieldFilter.hidden = true;
                }

            } else {
                item.text = (item.count === link.length ? '' : '* ') + item._assetText;
            }
        };

        // drop
        var dropRef = editor.call('drop:target', {
            ref: panelWidget,
            type: 'asset.' + assetType,
            filter: function (type, data) {
                // type
                if ((assetType && assetType !== '*' && type !== 'asset.' + assetType) || !type.startsWith('asset') || editor.call('assets:get', data.id).get('source'))
                    return false;

                // if a custom filter function has
                // been provided then use it now
                if (assetFilterFn) {
                    if (!assetFilterFn(editor.call('assets:get', data.id))) {
                        return false;
                    }
                }

                // overflowed
                var rectA = root.innerElement.getBoundingClientRect();
                var rectB = panelWidget.element.getBoundingClientRect();
                if (rectB.top <= rectA.top || rectB.bottom >= rectA.bottom)
                    return false;

                // already added
                var id = data.id;
                for (var i = 0; i < link.length; i++) {
                    if (link[i].get(pathAt(args, i)).indexOf(id) === -1)
                        return true;
                }

                return false;
            },
            drop: function (type, data) {
                if ((assetType && assetType !== '*' && type !== 'asset.' + assetType) || !type.startsWith('asset') || editor.call('assets:get', data.id).get('source'))
                    return;

                var assetId = data.id;
                addAssets([assetId]);
            }
        });
        dropRef.disabled = panel.disabled;
        panel.on('enable', function () {
            if (!isSelectingAssets)
                dropRef.disabled = false;
        });
        panel.on('disable', function () {
            dropRef.disabled = true;

            // clear list item
            var items = fieldAssetsList.element.children;
            var i = items.length;
            while (i--) {
                if (!items[i].ui || !(items[i].ui instanceof ui.ListItem))
                    continue;

                items[i].ui.destroy();
            }

            fieldAssetsList.class.add('empty');
            fieldFilter.hidden = true;

            assetIndex = {};
        });
        fieldAssetsList.on('destroy', function () {
            dropRef.destroy();
        });

        panelWidget.append(fieldAssetsList);

        fieldAssets = editor.call('attributes:addField', {
            parent: panel,
            name: args.name || '',
            type: 'element',
            element: panelWidget,
            reference: args.reference
        });
        fieldAssets.class.add('assets');

        // reference assets
        if (args.reference) {
            editor.call('attributes:reference:attach', args.reference, fieldAssets.parent.innerElement.firstChild.ui);
        }

        // on adding new asset
        btnAdd.on('click', function () {
            
            if (isSelectingAssets) {
                if (currentSelection) {
                    addAssets(currentSelection);
                    currentSelection = null;
                    editor.call('picker:asset:deselect');
                }
            }
        });

        var createInsertHandler = function (index) {
            var path = pathAt(args, index);
            return link[index].on(path + ':insert', function (assetId, ind) {
                var before;
                if (ind === 0) {
                    before = null;
                } else {
                    before = assetIndex[this.get(path + '.' + ind)];
                }
                addAssetListItem(assetId, before);
            });
        };

        // list
        for (var i = 0; i < link.length; i++) {
            var assets = link[i].get(pathAt(args, i));
            if (assets) {
                for (var a = 0; a < assets.length; a++)
                    addAssetListItem(assets[a]);
            }

            // eslint-disable-next-line no-loop-func
            events.push(link[i].on(pathAt(args, i) + ':set', function (assets, assetsOld) {
                if (!(assets instanceof Array))
                    return;

                if (!(assetsOld instanceof Array))
                    assetsOld = [];

                for (let a = 0; a < assetsOld.length; a++) {
                    removeAssetListItem(assetsOld[a]);
                }

                for (let a = 0; a < assets.length; a++) {
                    addAssetListItem(assets[a]);
                }
            }));

            events.push(createInsertHandler(i));

            events.push(link[i].on(pathAt(args, i) + ':remove', removeAssetListItem));
        }

        var filterAssets = function (filter) {
            var id;

            if (! filter) {
                for (id in assetIndex) {
                    assetIndex[id].hidden = false;
                }
                return;
            }

            var items = [];
            for (id in assetIndex) {
                items.push([assetIndex[id].text, id]);
            }
            var results = editor.call('search:items', items, filter);
            for (id in assetIndex) {
                if (results.indexOf(id) === -1) {
                    assetIndex[id].hidden = true;
                } else {
                    assetIndex[id].hidden = false;
                }
            }
        };

        fieldFilter.on('change', filterAssets);

        fieldAssetsList.once('destroy', function () {
            for (var i = 0; i < events.length; i++) {
                events[i].unbind();
            }

            events.length = 0;
        });

        if (args.canOverrideTemplate && (args.path || args.paths)) {
            editor.call('attributes:registerOverridePath', pathAt(args, 0), fieldAssets.parent.element);
        }

        return fieldAssetsList;
    });
});


/* editor/attributes/attributes-array.js */
editor.once('load', function () {
    'use strict';

    var defaults = {
        checkbox: false,
        number: 0,
        string: '',
        json: '{ }',
        asset: null,
        entity: null,
        rgb: [ 1, 1, 1 ],
        vec2: [ 0, 0 ],
        vec3: [ 0, 0, 0 ],
        vec4: [ 0, 0, 0, 0 ],
        curveset: { keys: [ 0, 0 ], type: 2 }
    };

    // Creates an array widget
    editor.method('attributes:addArrayField', function (args) {
        var events = [];

        var suspendSizeEvents = false;

        var arrayElements = [];
        var timeoutRefreshElements = null;

        var panel = new ui.Panel();
        panel.class.add('attributes-array');
        panel.flex = true;
        panel.flexGrow = 1;

        editor.call('attributes:addField', {
            panel: args.panel,
            name: args.name,
            type: 'element',
            element: panel
        });

        if (args.canOverrideTemplate && (args.path || args.paths)) {
            editor.call('attributes:registerOverridePath', pathAt(args, 0), args.panel ? args.panel.element : panel.element);
        }

        panel.parent.flex = true;

        // create array length observer for each link
        // in order to hook it up with the size field
        var sizeObservers = [];
        args.link.forEach(function (link, i) {
            var path = pathAt(args, i);
            var arr = link.get(path);
            var len = arr ? arr.length : 0;

            var observer = new Observer({
                size: len
            });

            sizeObservers.push(observer);
        });

        // The number of elements in the array
        var fieldSize = editor.call('attributes:addField', {
            parent: panel,
            type: 'number',
            placeholder: 'Array Size',
            link: sizeObservers,
            path: 'size',
            stopHistory: true // do not use default number field history
        });

        fieldSize.parent.flexGrow = 1;

        fieldSize.on('change', function (value) {
            // check fieldSize._changing otherwise this will
            // cause changeArraySize to be called twice - once in
            // this function and once in the link event handlers
            if (suspendSizeEvents || fieldSize._changing) return;
            changeArraySize(value);
        });

        // container for array elements
        var panelElements = new ui.Panel();
        panelElements.class.add('attributes-array-elements');
        panelElements.flex = true;
        panelElements.flexGrow = 1;
        panel.append(panelElements);

        var refreshArrayElements = function () {
            timeoutRefreshElements = null;

            // currently curves do not support multiselect
            if (args.type === 'curveset' && args.link.length > 1) {
                return;
            }

            // destroy existing elements
            arrayElements.forEach(function (field) {
                // field might be an array like for vectors
                if (field instanceof Array) {
                    // check if parent exists because might
                    // have already been destroyed when parsing script attributes for example
                    if (field[0].parent) {
                        field[0].parent.destroy();
                    }
                } else {
                    if (field.parent) {
                        field.parent.destroy();
                    }
                }
            });
            arrayElements.length = 0;

            var allArrays = args.link.map(function (link, i) {
                return link.get(pathAt(args, i));
            });

            var row = -1;
            var rowExistsEverywhere = true;

            var createRow = function (row) {
                var paths = args.link.map(function (link, i) {return pathAt(args, i) + '.' + row;});

                var fieldArgs = {
                    parent: panelElements,
                    type: args.type,
                    link: args.link,
                    placeholder: args.placeholder,
                    reference: args.reference,
                    kind: args.kind,
                    enum: args.enum,
                    curves: args.curves,
                    gradient: args.gradient,
                    min: args.min,
                    max: args.max,
                    hideRandomize: args.hideRandomize,
                    paths: paths
                };

                var field = editor.call('attributes:addField', fieldArgs);
                arrayElements.push(field);

                // button to remove array element
                var btnRemove = new ui.Button({
                    text: '&#57636;',
                    unsafe: true
                });
                btnRemove.class.add('delete');

                var fieldParent = Array.isArray(field) ? field[0].parent : field.parent;
                fieldParent.append(btnRemove);

                btnRemove.on('click', function () {
                    var prev;

                    var redo = function () {
                        prev = new Array(args.link.length);

                        // store previous array
                        args.link.forEach(function (link, i) {
                            // get link again in case it changed
                            link = link.latest();

                            if (! link) return;

                            // store previous array
                            var path = pathAt(args, i);
                            var arr = link.get(path);
                            prev[i] = arr && arr.slice();
                        });

                        args.link.forEach(function (link, i) {
                            if (! prev[i]) return;

                            // get link again in case it changed
                            link = link.latest();

                            if (! link) return;

                            // copy array and remove
                            // the element at the relevant row
                            var arr = prev[i].slice();
                            arr.splice(row, 1);

                            // set new value
                            var history = link.history.enabled;
                            link.history.enabled = false;

                            if (arr[0] !== null && typeof(arr[0]) === 'object') {
                                link.set(pathAt(args, i), []);
                                arr.forEach(function (element) {
                                    link.insert(pathAt(args, i), element);
                                });
                            } else {
                                link.set(pathAt(args, i), arr);
                            }

                            link.history.enabled = history;
                        });
                    };

                    var undo = function () {
                        args.link.forEach(function (link, i) {
                            if (! prev[i]) return;

                            // get link again in case it changed
                            link = link.latest();

                            if (! link) return;

                            var path = pathAt(args, i);

                            // set previous value
                            var history = link.history.enabled;
                            link.history.enabled = false;

                            var arr = prev[i];
                            if (arr[0] !== null && typeof(arr[0]) === 'object') {
                                link.set(pathAt(args, i), []);
                                arr.forEach(function (element) {
                                    link.insert(pathAt(args, i), element);
                                });
                            } else {
                                link.set(pathAt(args, i), arr);
                            }

                            link.history.enabled = history;
                        });

                        // clean up
                        prev.length = 0;
                    };

                    redo();

                    editor.call('history:add', {
                        name: 'delete array element',
                        undo: undo,
                        redo: redo
                    });
                });
            };

            while (rowExistsEverywhere) {
                row++;

                for (var i = 0; i < allArrays.length; i++) {
                    if (! allArrays[i] || (! (allArrays[i] instanceof Array)) || allArrays[i].length <= row) {
                        rowExistsEverywhere = false;
                        break;
                    }
                }

                if (rowExistsEverywhere) {
                    createRow(row);
                }
            }
        };

        var refreshArrayElementsDeferred = function () {
            if (timeoutRefreshElements) {
                clearTimeout(timeoutRefreshElements);
            }

            timeoutRefreshElements = setTimeout(refreshArrayElements);
        };

        refreshArrayElements();

        // register event listeners for array
        args.link.forEach(function (link, i) {
            var path = pathAt(args, i);

            var updateSize = function () {
                var value = link.get(path);
                var suspend = suspendSizeEvents;
                suspendSizeEvents = true;
                sizeObservers[i].set('size', value ? value.length : 0);
                suspendSizeEvents = suspend;

                refreshArrayElementsDeferred();
            };

            events.push(link.on(path + ':set', updateSize));
            events.push(link.on(path + ':insert', updateSize));
            events.push(link.on(path + ':remove', updateSize));
        });

        // Clean up
        panel.on('destroy', function () {
            events.forEach(function (evt) {
                evt.unbind();
            });

            events.length = 0;
        });

        // Undoable action - change the size of the array of each link
        var changeArraySize = function (size) {
            var prev;

            var redo = function () {
                var suspend = suspendSizeEvents;
                suspendSizeEvents = true;

                prev = new Array(args.link.length);

                // store previous array
                // do this first so that prev has valid
                // values for all entries in case we need to
                // undo a half-completed redo
                args.link.forEach(function (link, i) {
                    // get link again in case it changed
                    link = link.latest();

                    if (! link) return;

                    // store previous array
                    var path = pathAt(args, i);
                    var arr = link.get(path);
                    prev[i] = arr && arr.slice();
                });

                args.link.forEach(function (link, i) {
                    if (! prev[i]) return;

                    // get link again in case it changed
                    link = link.latest();

                    if (! link) return;

                    // resize array
                    var arr = prev[i].slice();
                    while (arr.length < size) {
                        arr.push(getDefaultValue(args));
                    }
                    arr.length = size;

                    // set new value
                    var history = link.history.enabled;
                    link.history.enabled = false;

                    if (arr[0] !== null && typeof(arr[0]) === 'object') {
                        link.set(pathAt(args, i), []);
                        arr.forEach(function (element) {
                            link.insert(pathAt(args, i), element);
                        });
                    } else {
                        link.set(pathAt(args, i), arr);
                    }

                    link.history.enabled = history;
                });

                suspendSizeEvents = suspend;
            };

            var undo = function () {
                var suspend = suspendSizeEvents;
                suspendSizeEvents = true;

                args.link.forEach(function (link, i) {
                    if (! prev[i]) return;

                    // get link again in case it changed
                    link = link.latest();

                    if (! link) return;

                    var path = pathAt(args, i);

                    // set previous value
                    var history = link.history.enabled;
                    link.history.enabled = false;

                    var arr = prev[i];
                    if (arr[0] !== null && typeof(arr[0]) === 'object') {
                        link.set(pathAt(args, i), []);
                        arr.forEach(function (element) {
                            link.insert(pathAt(args, i), element);
                        });
                    } else {
                        link.set(pathAt(args, i), arr);
                    }

                    link.history.enabled = history;
                });

                // clean up
                prev.length = 0;

                suspendSizeEvents = suspend;
            };

            editor.call('history:add', {
                name: 'edit array size',
                redo: redo,
                undo: undo
            });

            redo();
        };

        return panel;
    });

    // Returns path at index of args.paths if that field exists otherwise
    // returns args.path
    var pathAt = function (args, index) {
        return args.paths ? args.paths[index] : args.path;
    };

    // Returns the default value for a new array element
    // based on the args provided
    var getDefaultValue = function (args) {
        var result = null;

        if (defaults[args.type] !== undefined) {
            result = defaults[args.type];

            if (args.type === 'curveset') {
                result = utils.deepCopy(result);
                if (args.color || args.curves) {
                    var len = args.color ? args.color.length : args.curves.length;
                    if (len > 1) {
                        result.keys = [ ];
                        for(var c = 0; c < len; c++) {
                            result.keys.push([ 0, 0 ]);
                        }

                    }
                }
            }
        }

        return result;
    };

});


/* editor/attributes/attributes-history.js */
editor.once('load', function() {
    'use strict';

    var list = [ ];
    var selecting = false;


    var root = editor.call('layout.root');
    var panel = editor.call('layout.attributes');


    var controls = new ui.Panel();
    controls.class.add('inspector-controls');
    controls.parent = panel;
    panel.header.append(controls);


    var selectorReturn = function() {
        var item = getLast();
        if (! item)
            return;

        // remove last one
        list = list.slice(0, list.length - 1);

        selecting = true;
        editor.call('selector:set', item.type, item.items);
        editor.once('selector:change', function() {
            selecting = false;

            updateTooltipContent();
        });
    };
    editor.method('selector:return', selectorReturn);


    var btnBack = new ui.Button({
        text: '&#57649;'
    });
    btnBack.disabledClick = true;
    btnBack.hidden = true;
    btnBack.class.add('back');
    btnBack.on('click', selectorReturn);
    controls.append(btnBack);


    editor.on('selector:change', function(type, items) {
        if (selecting)
            return;

        updateTooltipContent();

        if (! type || ! items)
            return;

        var last = getLast();

        if (last && last.items.length === 1 && items.length === 1 && last.items[0] === items[0])
            return;

        list.push({
            type: type,
            items: items
        });
    });

    var getLast = function() {
        if (! list.length)
            return;

        var ignoreType = editor.call('selector:type');
        var ignore = editor.call('selector:items');

        var i = list.length - 1;
        var candidate = list[i];

        while(candidate && ignoreType && ignoreType === candidate.type && candidate.items.equals(ignore))
            candidate = list[--i];

        return candidate || null;
    };

    var updateTooltipContent = function() {
        var item = getLast();

        if (! item && ! btnBack.hidden) {
            btnBack.hidden = true;
        } else if (item && btnBack.hidden) {
            btnBack.hidden = false;
        }

        if (item && ! tooltip.hidden) {
            if (item.type === 'entity') {
                if (item.items.length === 1) {
                    setTooltipText(item.items[0].get('name') + ' [entity]');
                } else {
                    setTooltipText('[' + item.items.length + ' entities]');
                }
            } else if (item.type === 'asset') {
                if (item.items.length === 1) {
                    setTooltipText(item.items[0].get('name') + ' [' + item.items[0].get('type') + ']');
                } else {
                    setTooltipText('[' + item.items.length + ' assets]');
                }
            } else if (item.type === 'editorSettings') {
                setTooltipText('Settings');
            }
        }
    };


    var tooltip = Tooltip.attach({
        target: btnBack.element,
        text: '-',
        align: 'top',
        root: root
    });
    tooltip.on('show', updateTooltipContent);
    tooltip.class.add('previous-selection');

    btnBack.on('hide', function() {
        tooltip.hidden = true;
    });

    var setTooltipText = function(str) {
        tooltip.html = '<span>Previous Selection</span><br />' + str;
    };


    editor.call('hotkey:register', 'selector:return', {
        key: 'z',
        shift: true,
        callback: function () {
            if (editor.call('picker:isOpen:otherThan', 'curve')) return;
            selectorReturn();
        }
    });
});


/* editor/attributes/attributes-reference.js */
editor.once('load', function() {
    'use strict';

    var root = editor.call('layout.root');
    var panel = editor.call('layout.attributes');
    var index = { };
    var missing = { };


    var sanitize = function(str) {
        return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };


    editor.method('attributes:reference:add', function(args) {
        index[args.name] = editor.call('attributes:reference', args);
    });

    editor.method('attributes:reference:attach', function(name, target, element, panel) {
        var tooltip = index[name];

        if (! tooltip) {
            if (! missing[name]) {
                missing[name] = true;
                console.log('reference', name, 'is not defined');
            }
            return;
        }

        tooltip.attach({
            target: target,
            panel: panel,
            element: element || target.element
        });

        return tooltip;
    });


    editor.method('attributes:reference:template', function(args) {
        var html = '';

        if (args.title)
            html += '<h1>' + sanitize(args.title) + '</h1>';
        if (args.subTitle)
            html += '<h2>' + sanitize(args.subTitle) + '</h2>';
        if (args.webgl2)
            html += '<div class="tag">WebGL 2.0 Only</div>';
        if (args.description) {
            var description = sanitize(args.description);
            description = description.replace(/\n/g, '<br />'); // new lines
            description = description.replace(/&lt;b&gt;/g, '<b>').replace(/&lt;\/b&gt;/g, '</b>'); // bold
            html += '<p>' + description + '</p>';
        }
        if (args.code)
            html += '<pre class="ui-code">' + sanitize(args.code) + '</pre>';
        if (args.url)
            html += '<a class="reference" href="' + sanitize(args.url) + '" target="_blank">API Reference</a>';

        return html;
    });


    editor.method('attributes:reference', function(args) {
        var tooltip = new ui.Tooltip({
            align: 'right'
        });
        tooltip.hoverable = true;
        tooltip.class.add('reference');

        tooltip.html = editor.call('attributes:reference:template', args);

        var links = { };
        var timerHover = null;
        var timerBlur = null;

        tooltip.attach = function(args) {
            var target = args.target;
            var element = args.element;
            var targetPanel = args.panel || panel;
            targetPanel = targetPanel.dom || targetPanel.element;

            var show = function() {
                if (! target || target.hidden) return;
                // fix top offset for new framework
                const topOffset = (element.ui instanceof pcui.Element ? 6 : 16);
                tooltip.position(targetPanel.getBoundingClientRect().left, element.getBoundingClientRect().top + topOffset);
                tooltip.hidden = false;
            };

            var evtHide = function() {
                clearTimeout(timerHover);
                clearTimeout(timerBlur);
                tooltip.hidden = true;
            };

            var evtHover = function() {
                clearTimeout(timerBlur);
                timerHover = setTimeout(show, 500);
            };

            var evtBlur = function() {
                clearTimeout(timerHover);
                timerBlur = setTimeout(hide, 200);
            };

            var evtClick = function() {
                clearTimeout(timerBlur);
                clearTimeout(timerHover);
                show();
            };

            target.on('hide', evtHide);

            target.once('destroy', function() {
                element.removeEventListener('mouseover', evtHover);
                element.removeEventListener('mouseout', evtBlur);
                element.removeEventListener('click', evtClick);
                target.unbind('hide', evtHide);
                target = null;
                element = null;
                clearTimeout(timerHover);
                clearTimeout(timerBlur);
                tooltip.hidden = true;
            });

            element.addEventListener('mouseover', evtHover, false);
            element.addEventListener('mouseout', evtBlur, false);
            element.addEventListener('click', evtClick, false);
        };

        var hide = function() {
            tooltip.hidden = true;
        };

        tooltip.on('hover', function() {
            clearTimeout(timerBlur);
        });

        root.append(tooltip);

        return tooltip;
    });
});
