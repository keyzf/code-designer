/* editor/pickers/sprite-editor/sprite-editor-atlas-panel.js */
editor.once('load', function() {
    'use strict';

    editor.method('picker:sprites:attributes:atlas', function (atlasAsset) {
        var rootPanel = editor.call('picker:sprites:rightPanel');

        rootPanel.header = 'TEXTURE ATLAS';

        var panel = editor.call('attributes:addPanel', {
            parent: rootPanel
        });

        var events = [];

        // atlas id
        var fieldId = editor.call('attributes:addField', {
            parent: panel,
            name: 'ID',
            link: atlasAsset,
            path: 'id'
        });
        // reference
        editor.call('attributes:reference:attach', 'asset:id', fieldId.parent.innerElement.firstChild.ui, null, panel);

        // atlas width
        var fieldWidth = editor.call('attributes:addField', {
            parent: panel,
            name: 'Width',
            path: 'meta.width',
            link: atlasAsset
        });
        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:atlas:width', fieldWidth.parent.innerElement.firstChild.ui, null, panel);

        // atlas height
        var fieldHeight = editor.call('attributes:addField', {
            parent: panel,
            name: 'Height',
            path: 'meta.height',
            link: atlasAsset
        });
        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:atlas:height', fieldHeight.parent.innerElement.firstChild.ui, null, panel);

        // number of frames
        var fieldFrames = editor.call('attributes:addField', {
            parent: panel,
            name: 'Frames'
        });
        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:atlas:frames', fieldFrames.parent.innerElement.firstChild.ui, null, panel);

        var timeout;

        // Update number of frames field
        var updateFrameCount = function () {
            timeout = null;
            var frames = atlasAsset.getRaw('data.frames')._data;
            fieldFrames.value = Object.keys(frames).length;
        };

        updateFrameCount();

        // Update number of frames when data.frames changes or when a new frame is added
        atlasAsset.on('*:set', function (path, value) {
            if (! /^data\.frames(\.\d+)?$/.test(path)) return;

            // do this in a timeout to avoid updating
            // when we add a lot of frames at once
            if (! timeout)
                timeout = setTimeout(updateFrameCount) ;

        });

        // Update number of frames when a frame is deleted
        atlasAsset.on('*:unset', function (path) {
            if (! /^data\.frames\.\d+$/.test(path)) return;

            // do this in a timeout to avoid updating
            // when we add a lot of frames at once
            if (! timeout)
                timeout = setTimeout(updateFrameCount) ;
        });

        events.push(rootPanel.on('clear', function () {
            panel.destroy();
        }));

        panel.on('destroy', function () {
            for (var i = 0, len = events.length; i<len; i++) {
                events[i].unbind();
            }
            events.length = 0;
        });
    });
});


/* editor/pickers/sprite-editor/sprite-editor-frames-attributes-panel.js */
editor.once('load', function() {
    'use strict';

    editor.method('picker:sprites:attributes:frames', function (args) {
        var events = [];
        var suspendChanges = false;
        var atlasAsset = args.atlasAsset;
        var atlasImage = args.atlasImage;
        var frames = args.frames;
        var numFrames = frames.length;

        var rootPanel = editor.call('picker:sprites:rightPanel');
        if (numFrames > 1) {
            rootPanel.header = 'FRAME INSPECTOR - MULTIPLE FRAMES';
        } else {
            rootPanel.header = 'FRAME INSPECTOR - ' + atlasAsset.get('data.frames.' + frames[0] + '.name');
        }

        editor.call('picker:sprites:attributes:frames:preview', {
            atlasAsset: atlasAsset,
            atlasImage: atlasImage,
            frames: frames
        });

        var panel = editor.call('attributes:addPanel', {
            parent: rootPanel
        });
        panel.disabled = ! editor.call('permissions:write');
        events.push(editor.on('permissions:writeState', function (canWrite) {
            panel.disabled = ! canWrite;
        }));

        var fieldName = editor.call('attributes:addField', {
            parent: panel,
            name: 'Name',
            type: 'string',
            link: atlasAsset,
            paths: frames.map(function (f) {return 'data.frames.' + f + '.name';})
        });
        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:frame:name', fieldName.parent.innerElement.firstChild.ui, null, panel);

        fieldName.on('change', function (value) {
            if (numFrames === 1) {
                rootPanel.header = 'FRAME INSPECTOR - ' + value;
            }
        });

        // add field for frame rect but hide it and only use it for multi-editing
        // The user only will see position and size fields in pixels which is more helpful
        // but we'll use the internal rect fields to edit it
        var fieldRect = editor.call('attributes:addField', {
            parent: panel,
            type: 'vec4',
            link: atlasAsset,
            paths: frames.map(function (f) {return 'data.frames.' + f + '.rect';})
        });
        fieldRect[0].parent.hidden = true;

        fieldRect[0].on('change', function () {
            if (suspendChanges) return;

            suspendChanges = true;
            updatePositionX();
            updateSizeX();
            updateBorderMax();
            suspendChanges = false;
        });

        fieldRect[1].on('change', function () {
            if (suspendChanges) return;

            suspendChanges = true;
            updatePositionY();
            updateSizeY();
            updateBorderMax();
            suspendChanges = false;
        });

        fieldRect[2].on('change', function () {
            if (suspendChanges) return;

            suspendChanges = true;
            updateSizeX();
            updateBorderMax();
            suspendChanges = false;
        });

        fieldRect[3].on('change', function () {
            if (suspendChanges) return;

            suspendChanges = true;
            updatePositionY();
            updateSizeY();
            updateBorderMax();
            suspendChanges = false;
        });

        var updateMaxPosition = function (field) {
            var dimension = field === 0 ? atlasImage.width : atlasImage.height;
            var maxPos = dimension;

            var rectIndex = field === 0 ? 2 : 3;

            var frameData = atlasAsset.getRaw('data.frames')._data;

            for (var i = 0, len = frames.length; i<len; i++) {
                var f = frameData[frames[i]];
                if (! f) continue;
                var rect = f._data.rect;
                maxPos = Math.min(maxPos, dimension - rect[rectIndex]);
            }

            fieldPosition[field].max = maxPos;
        };

        var updateMaxSize = function (field) {
            var dimension = field === 0 ? atlasImage.width : atlasImage.height;
            var maxSize = dimension;

            var rectIndex = field === 0 ? 0 : 1;

            var frameData = atlasAsset.getRaw('data.frames')._data;

            for (var i = 0, len = frames.length; i<len; i++) {
                var f = frameData[frames[i]];
                if (! f) continue;
                var rect = f._data.rect;
                maxSize = Math.min(maxSize, dimension - rect[rectIndex]);
            }

            fieldSize[field].max = maxSize;
        };

        var updatePositionX = function () {
            if (fieldRect[0].proxy) {
                fieldPosition[0].value = null;
            } else {
                fieldPosition[0].value = fieldRect[0].value;
            }

            updateMaxPosition(0);

            // give time to rect proxy to update
            setTimeout(function () {
                fieldPosition[0].proxy = fieldRect[0].proxy;
            });
        };

        var updatePositionY = function () {
            if (fieldRect[1].proxy) {
                fieldPosition[1].value = null;
            } else {
                fieldPosition[1].value = fieldRect[1].value;
            }

            updateMaxPosition(1);

            // give time to rect proxy to update
            setTimeout(function () {
                fieldPosition[1].proxy = fieldRect[1].proxy;
            });
        };

        var updateSizeX = function () {
            if (fieldRect[2].proxy) {
                fieldSize[0].value = null;
            } else {
                fieldSize[0].value = fieldRect[2].value;
            }

            updateMaxSize(0);

            // give time to rect proxy to update
            setTimeout(function () {
                fieldSize[0].proxy = fieldRect[2].proxy;
            });
        };

        var updateSizeY = function () {
            if (fieldRect[3].proxy) {
                fieldSize[1].value = null;
            } else {
                fieldSize[1].value = fieldRect[3].value;
            }

            updateMaxSize(1);

            // give time to rect proxy to update
            setTimeout(function () {
                fieldSize[1].proxy = fieldRect[3].proxy;
            });
        };

        // position in pixels
        var fieldPosition = editor.call('attributes:addField', {
            parent: panel,
            name: 'Position',
            type: 'vec2',
            precision: 0,
            min: 0,
            placeholder: ['→', '↑']
        });
        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:frame:position', fieldPosition[0].parent.innerElement.firstChild.ui, null, panel);

        updatePositionX();
        updatePositionY();

        fieldPosition[0].on('change', function (value) {
            if (suspendChanges) return;
            suspendChanges = true;
            fieldRect[0].value = value;
            fieldPosition[0].proxy = fieldRect[0].proxy;
            updateMaxPosition(0);
            suspendChanges = false;
        });

        fieldPosition[1].on('change', function (value) {
            if (suspendChanges) return;
            suspendChanges = true;
            fieldRect[1].value = value;
            fieldPosition[1].proxy = fieldRect[1].proxy;
            updateMaxPosition(1);
            suspendChanges = false;
        });

        // size in pixels
        var fieldSize = editor.call('attributes:addField', {
            parent: panel,
            name: 'Size',
            type: 'vec2',
            precision: 0,
            min: 1,
            placeholder: ['→', '↑']
        });
        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:frame:size', fieldSize[0].parent.innerElement.firstChild.ui, null, panel);

        updateSizeX();
        updateSizeY();

        fieldSize[0].on('change', function (value) {
            if (suspendChanges) return;

            updateSizeAndAdjustBorder(value, false);
        });

        fieldSize[1].on('change', function (value) {
            if (suspendChanges) return;

            updateSizeAndAdjustBorder(value, true);
        });

        // Updates the rect of the selected frames adjusting
        // their borders if necessary.
        var updateSizeAndAdjustBorder = function (value, isHeight) {
            var prev = null;

            var rect = isHeight ? 3 : 2;
            var border = isHeight ? 1 : 0;

            var redo = function () {
                var asset = editor.call('assets:get', atlasAsset.get('id'));
                if (! asset) return;

                var history = asset.history.enabled;
                asset.history.enabled = false;

                var frameData = asset.getRaw('data.frames')._data;
                for (var i = 0, len = frames.length; i<len; i++) {
                    var frame = frameData[frames[i]];
                    if (! frame) continue;

                    if (frame._data.rect[rect] !== value) {
                        if (! prev) prev = {};

                        prev[frames[i]] = {
                            value: frame._data.rect[rect],
                            border: [frame._data.border[border], frame._data.border[border + 2]]
                        }

                        // set property
                        asset.set('data.frames.' + frames[i] + '.rect.' + rect, value);

                        // check if border needs to be adjusted
                        if (frame._data.border[border] > value - frame._data.border[border + 2]) {
                            asset.set('data.frames.' + frames[i] + '.border.' + border, Math.max(0, value - frame._data.border[border + 2]));
                        }

                        if (frame._data.border[border + 2] > value - frame._data.border[border]) {
                            asset.set('data.frames.' + frames[i] + '.border.' + (border + 2), Math.max(0, value - frame._data.border[border]));
                        }
                    }
                }

                asset.history.enabled = history;
            };

            var undo = function () {

                var asset = editor.call('assets:get', atlasAsset.get('id'));
                if (! asset) return;

                var history = asset.history.enabled;
                asset.history.enabled = false;

                var frameData = asset.getRaw('data.frames')._data;

                for (var key in prev) {
                    if (! frameData[key]) continue;

                    asset.set('data.frames.' + key + '.rect.' + rect, prev[key].value);
                    asset.set('data.frames.' + key + '.border.' + border, prev[key].border[0]);
                    asset.set('data.frames.' + key + '.border.' + (border + 2), prev[key].border[1]);
                }

                asset.history.enabled = history;

                prev = null;
            };

            editor.call('history:add', {
                name: 'change rect',
                undo: undo,
                redo: redo
            })

            redo();
        };

        // pivot presets
        var presetValues = [
            [0, 1],
            [0.5, 1],
            [1, 1],
            [0, 0.5],
            [0.5, 0.5],
            [1, 0.5],
            [0, 0],
            [0.5, 0],
            [1, 0]
        ];

        var fieldPivotPreset = editor.call('attributes:addField', {
            parent: panel,
            name: 'Pivot Preset',
            type: 'string',
            enum: [
                { v: 0, t: 'Top Left' },
                { v: 1, t: 'Top' },
                { v: 2, t: 'Top Right' },
                { v: 3, t: 'Left' },
                { v: 4, t: 'Center' },
                { v: 5, t: 'Right' },
                { v: 6, t: 'Bottom Left' },
                { v: 7, t: 'Bottom' },
                { v: 8, t: 'Bottom Right' }
            ]
        });
        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:frame:pivotPreset', fieldPivotPreset.parent.innerElement.firstChild.ui, null, panel);

        fieldPivotPreset.on('change', function (value) {
            if (suspendChanges) return;

            var newValue = presetValues[parseInt(value, 10)];
            if (! newValue) return;

            var prevValues = {};
            for (var i = 0; i < numFrames; i++) {
                prevValues[frames[i]] = atlasAsset.get('data.frames.' + frames[i] + '.pivot');
            }

            var redo = function () {
                var asset = editor.call('assets:get', atlasAsset.get('id'));
                if (! asset) return;

                var history = asset.history.enabled;
                asset.history.enabled = false;
                for (var i = 0; i < numFrames; i++) {
                    var key = 'data.frames.' + frames[i];
                    if (asset.has(key)) {
                        asset.set(key + '.pivot', newValue);
                    }
                }
                asset.history.enabled = history;
            };

            var undo = function () {
                var asset = editor.call('assets:get', atlasAsset.get('id'));
                if (! asset) return;

                var history = asset.history.enabled;
                asset.history.enabled = false;
                for (var i = 0; i < numFrames; i++) {
                    var key = 'data.frames.' + frames[i];
                    if (asset.has(key) && prevValues[frames[i]]) {
                        asset.set(key + '.pivot', prevValues[frames[i]]);
                    }

                }
                asset.history.enabled = history;
            };

            editor.call('history:add', {
                name: 'edit pivot',
                undo: undo,
                redo: redo
            });

            redo();
        });

        // pivot
        var fieldPivot = editor.call('attributes:addField', {
            parent: panel,
            name: 'Pivot',
            type: 'vec2',
            min: 0,
            max: 1,
            precision: 2,
            step: 0.1,
            placeholder: ['↔', '↕'],
            link: atlasAsset,
            paths: frames.map(function (f) {return 'data.frames.' + f + '.pivot';})
        });
        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:frame:pivot', fieldPivot[0].parent.innerElement.firstChild.ui, null, panel);

        fieldPivot[0].on('change', function (value) {
            if (suspendChanges) return;
            updatePivotPreset();
        });
        fieldPivot[1].on('change', function (value) {
            if (suspendChanges) return;
            updatePivotPreset();
        });

        var updatePivotPreset = function () {
            var suspend = suspendChanges;
            suspendChanges = true;
            for (var i = 0; i < presetValues.length; i++) {
                if (presetValues[i][0] === fieldPivot[0].value && presetValues[i][1] === fieldPivot[1].value) {
                    fieldPivotPreset.value = i;
                    break;
                }
            }
            suspendChanges = suspend;
        };

        updatePivotPreset();

        // border
        var fieldBorder = editor.call('attributes:addField', {
            parent: panel,
            placeholder: ['←', '↓', '→', '↑'],
            name: 'Border',
            type: 'vec4',
            link: atlasAsset,
            min: 0,
            paths: frames.map(function (f) {return 'data.frames.' + f + '.border';})
        });
        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:frame:border', fieldBorder[0].parent.innerElement.firstChild.ui, null, panel);

        var updateBorderMax = function () {
            // set left border max to not exceed the right border in any frame
            var maxLeft = atlasImage.width;
            var maxRight = atlasImage.width;
            var maxBottom = atlasImage.height;
            var maxTop = atlasImage.height;

            var frameData = atlasAsset.getRaw('data.frames')._data;

            for (var i = 0, len = frames.length; i<len; i++) {
                var f = frameData[frames[i]];
                if (! f) continue;
                var rect = f._data.rect;
                var border = f._data.border;
                maxLeft = Math.min(maxLeft, rect[2] - border[2]);
                maxRight = Math.min(maxRight, rect[2] - border[0]);
                maxBottom = Math.min(maxBottom, rect[3] - border[3]);
                maxTop = Math.min(maxTop, rect[3] - border[1]);
            }

            fieldBorder[0].max = maxLeft;
            fieldBorder[2].max = maxRight;
            fieldBorder[1].max = maxBottom;
            fieldBorder[3].max = maxTop;
        };

        for (var i = 0; i<4; i++) {
            fieldBorder[i].on('change', updateBorderMax);
        }

        var panelButtons = editor.call('attributes:addPanel', {
            parent: rootPanel,
            name: 'ACTIONS'
        });
        panelButtons.class.add('buttons');
        panelButtons.disabled = ! editor.call('permissions:write');
        events.push(editor.on('permissions:writeState', function (canWrite) {
            panelButtons.disabled = ! canWrite;
        }));

        // new sprite
        var btnCreateSprite = new ui.Button({
            text: 'New Sprite From Selection'
        });
        btnCreateSprite.class.add('icon', 'wide', 'create');
        panelButtons.append(btnCreateSprite);

        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:frame:newsprite', btnCreateSprite, null, panel);

        btnCreateSprite.on('click', function () {
            btnCreateSprite.disabled = true;
            editor.call('picker:sprites:spriteFromSelection', {
                callback: function () {
                    btnCreateSprite.disabled = false;
                }
            });
        });

        // new sliced sprite
        var btnCreateSlicedSprite = new ui.Button({
            text: 'New Sliced Sprite From Selection'
        });
        btnCreateSlicedSprite.class.add('icon', 'wide', 'create');
        panelButtons.append(btnCreateSlicedSprite);

        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:frame:newsprite', btnCreateSlicedSprite, null, panel);

        btnCreateSlicedSprite.on('click', function () {
            btnCreateSlicedSprite.disabled = true;
            editor.call('picker:sprites:spriteFromSelection', {
                sliced: true,
                callback: function () {
                    btnCreateSprite.disabled = false;
                }
            });
        });

        // focus frame
        var btnFocus = new ui.Button({
            text: 'Focus On Selection'
        });
        btnFocus.class.add('icon', 'wide', 'focus');
        panelButtons.append(btnFocus);
        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:frame:focus', btnFocus, null, panel);

        btnFocus.on('click', function () {
            editor.call('picker:sprites:focus');
        });

        // trim rect
        var btnTrim = new ui.Button({
            text: 'Trim Selected Frames'
        });
        btnTrim.class.add('icon', 'wide', 'trim');
        panelButtons.append(btnTrim);

        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:frame:trim', btnTrim, null, panel);

        // trim transparent pixels around frame
        btnTrim.on('click', function () {
            editor.call('picker:sprites:trimFrames', frames);
        });

        // delete frame
        var btnDelete = new ui.Button({
            text: 'Delete Selected Frames'
        });
        btnDelete.class.add('icon', 'wide', 'remove');
        panelButtons.append(btnDelete);

        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:frame:delete', btnDelete, null, panel);

        btnDelete.on('click', function () {
            editor.call('picker:sprites:deleteFrames', frames, {
                history: true
            });
        });

        // clean up
        events.push(rootPanel.on('clear', function () {
            panel.destroy();
            panelButtons.destroy();
        }));

        panel.on('destroy', function () {
            for (var i = 0, len = events.length; i<len; i++) {
                events[i].unbind();
            }
            events.length = 0;
        });
    });
});


/* editor/pickers/sprite-editor/sprite-editor-frames-related-sprites-panel.js */
editor.once('load', function() {
    'use strict';

    editor.method('picker:sprites:attributes:frames:relatedSprites', function (args) {
        var events = [];

        var atlasAsset = args.atlasAsset;
        var frames = args.frames;
        var numFrames = frames.length;

        var rootPanel = editor.call('picker:sprites:rightPanel');

        var panel = editor.call('attributes:addPanel', {
            parent: rootPanel,
            name: 'RELATED SPRITE ASSETS'
        });

        panel.class.add('component');

        var labelNoAssets = new ui.Label({
            text: 'None'
        });
        panel.append(labelNoAssets);

        var list = new ui.List();
        list.class.add('related-assets');
        panel.append(list);

        var assets = editor.call('assets:find', function (asset) {
            if (asset.get('type') !== 'sprite' || asset.get('data.textureAtlasAsset') !== atlasAsset.get('id')) {
                return false;
            }

            var keys = asset.getRaw('data.frameKeys');
            for (var i = 0; i < numFrames; i++) {
                if (keys.indexOf(frames[i]) !== -1) {
                    return true;
                }
            }

            return false;
        });

        labelNoAssets.hidden = assets.length > 0;
        list.hidden = assets.length === 0;

        var createAssetPanel = function (asset) {
            var assetEvents = [];

            var item = new ui.ListItem({
                text: asset.get('name')
            });
            item.class.add('type-sprite');
            list.append(item);
            item.on('click', function () {
                editor.call('picker:sprites:selectSprite', asset);
            });

            assetEvents.push(asset.on('name:set', function (value) {
                item.text = value;
            }));

            assetEvents.push(asset.once('destroy', function () {
                item.destroy();
            }));

            item.on('destroy', function () {
                for (var i = 0; i < assetEvents.length; i++) {
                    assetEvents[i].unbind();
                }
                assetEvents.length = 0;
            });
        };

        for (var i = 0; i < assets.length; i++) {
            createAssetPanel(assets[i][1]);
        }

        // clean up
        events.push(rootPanel.on('clear', function () {
            panel.destroy();
        }));

        panel.on('destroy', function () {
            for (var i = 0, len = events.length; i<len; i++) {
                events[i].unbind();
            }
            events.length = 0;
        });
    });
});


/* editor/pickers/sprite-editor/sprite-editor-preview-panel.js */
editor.once('load', function () {
    'use strict';

    editor.method('picker:sprites:attributes:frames:preview', function (args) {
        var parent = editor.call('picker:sprites:rightPanel');

        var atlasAsset = args.atlasAsset;
        var atlasImage = args.atlasImage;
        var frames = args.frames;
        var frameObservers = frames.map(function (f) {return atlasAsset.getRaw('data.frames.' + f);});

        var events = [];

        var previewContainer = document.createElement('div');
        previewContainer.classList.add('asset-preview-container');

        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 256;
        canvas.classList.add('asset-preview');
        previewContainer.append(canvas);

        canvas.addEventListener('click', function() {
            if (parent.class.contains('large')) {
                parent.class.remove('large');
            } else {
                parent.class.add('large');
            }
            queueRender();
        }, false);

        parent.class.add('asset-preview');
        parent.element.insertBefore(previewContainer, parent.innerElement);

        var panelControls = new ui.Panel();
        panelControls.class.add('preview-controls');
        previewContainer.appendChild(panelControls.element);

        var time = 0;
        var playing = true;
        var fps = 10;
        var frame = 0;
        var lastTime = Date.now();

        // var btnPlay = new ui.Button({
        //     text: '&#57649;'
        // });
        // panelControls.append(btnPlay);

        // btnPlay.on('click', function() {
        //     playing = !playing;

        //     if (playing) {
        //         lastTime = Date.now();
        //         btnPlay.class.add('active', 'pinned');
        //     } else {
        //         btnPlay.class.remove('active', 'pinned');
        //     }

        //     queueRender();
        // });

        var renderQueued;

        // queue up the rendering to prevent too oftern renders
        var queueRender = function() {
            if (renderQueued) return;
            renderQueued = true;
            requestAnimationFrame(renderPreview);
        };

        var renderPreview = function () {
            if (! previewContainer) return;

            if (renderQueued)
                renderQueued = false;

            if (playing) {
                var now = Date.now();
                time += (now - lastTime) / 1000;

                frame = Math.floor(time * fps);
                var numFrames = frames.length;
                if (frame >= numFrames) {
                    frame = 0;
                    time -= numFrames / fps;
                }

                lastTime = now;
            }

            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;

            // render
            var frameData = frameObservers[frame] && frameObservers[frame]._data;
            editor.call('picker:sprites:renderFramePreview', frameData, canvas, frameObservers, true);

            if (playing) {
                queueRender();
            }
        };
        renderPreview();


        // render on resize
        events.push(parent.on('resize', queueRender));

        events.push(parent.on('clear', function () {
            parent.class.remove('asset-preview', 'animate');

            previewContainer.parentElement.removeChild(previewContainer);
            previewContainer = null;

            playing = false;

            panelControls.destroy();

            for (var i = 0, len = events.length; i<len; i++) {
                events[i].unbind();
            }
            events.length = 0;
        }));

        return {
            setFrames: function (newFrames) {
                frames = newFrames;
                frameObservers = frames.map(function (f) {return atlasAsset.getRaw('data.frames.' + f);});
            }
        };
    });
});


/* editor/pickers/sprite-editor/sprite-editor-generate-frames-panel.js */
editor.once('load', function () {
    'use strict';

    editor.method('picker:sprites:attributes:slice', function (args) {
        var events = [];

        var atlasAsset = args.atlasAsset;
        var atlasImage = args.atlasImage;
        var imageData = args.atlasImageData;

        var rootPanel = editor.call('picker:sprites:rightPanel');

        var panel = editor.call('attributes:addPanel', {
            parent: rootPanel,
            name: 'GENERATE FRAMES'
        });

        panel.disabled = ! editor.call('permissions:write');

        events.push(editor.on('permissions:writeState', function (canWrite) {
            panel.disabled = ! canWrite;
        }));

        var METHOD_DELETE_EXISTING = 1;
        var METHOD_ONLY_APPEND = 2;

        var TYPE_GRID_BY_FRAME_COUNT  = 1;
        var TYPE_GRID_BY_FRAME_SIZE  = 2;
        var TYPE_GRID_AUTO = 3; // not implemented

        var PIVOT_TOP_LEFT  = 0;
        var PIVOT_TOP       = 1;
        var PIVOT_TOP_RIGHT = 2;
        var PIVOT_LEFT      = 3;
        var PIVOT_CENTER    = 4;
        var PIVOT_RIGHT     = 5;
        var PIVOT_BOTTOM_LEFT   = 6;
        var PIVOT_BOTTOM        = 7;
        var PIVOT_BOTTOM_RIGHT  = 8;


        var fieldMethod = editor.call('attributes:addField', {
            parent: panel,
            name: 'Method',
            type: 'number',
            value: METHOD_DELETE_EXISTING,
            enum: [
                { v: METHOD_DELETE_EXISTING, t: 'Delete Existing' },
                { v: METHOD_ONLY_APPEND, t: 'Only Append' },
            ],
        });
        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:generate:method', fieldMethod.parent.innerElement.firstChild.ui, null, panel);

        var fieldType = editor.call('attributes:addField', {
            parent: panel,
            name: 'Type',
            type: 'number',
            value: TYPE_GRID_BY_FRAME_COUNT,
            enum: [
                {v: TYPE_GRID_BY_FRAME_COUNT, t: 'Grid By Frame Count'},
                {v: TYPE_GRID_BY_FRAME_SIZE, t: 'Grid By Frame Size'}
                // {v: 3, t: 'Auto'}
            ]
        });
        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:generate:type', fieldType.parent.innerElement.firstChild.ui, null, panel);

        var fieldColsRows = editor.call('attributes:addField', {
            parent: panel,
            name: 'Frame Count',
            type: 'vec2',
            value: [1, 1],
            precision: 0,
            min: 1,
            placeholder: ['Cols', 'Rows']
        });
        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:generate:count', fieldColsRows[0].parent.innerElement.firstChild.ui, null, panel);

        var fieldPixels = editor.call('attributes:addField', {
            parent: panel,
            name: 'Frame Size',
            type: 'vec2',
            value: [atlasImage.width, atlasImage.height],
            precision: 0,
            min: 1,
            placeholder: ['X', 'Y']
        });
        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:generate:size', fieldPixels[0].parent.innerElement.firstChild.ui, null, panel);

        var fieldOffset = editor.call('attributes:addField', {
            parent: panel,
            name: 'Offset',
            type: 'vec2',
            value: [0, 0],
            precision: 0,
            min: 0,
            placeholder: ['X', 'Y']
        });
        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:generate:offset', fieldOffset[0].parent.innerElement.firstChild.ui, null, panel);

        var fieldSpacing = editor.call('attributes:addField', {
            parent: panel,
            name: 'Spacing',
            type: 'vec2',
            value: [0, 0],
            precision: 0,
            min: 0,
            placeholder: ['X', 'Y']
        });
        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:generate:spacing', fieldSpacing[0].parent.innerElement.firstChild.ui, null, panel);

        // pivot presets
        var presetValues = [
            [0, 1],
            [0.5, 1],
            [1, 1],
            [0, 0.5],
            [0.5, 0.5],
            [1, 0.5],
            [0, 0],
            [0.5, 0],
            [1, 0]
        ];

        var fieldPivot = editor.call('attributes:addField', {
            parent: panel,
            name: 'Pivot',
            type: 'number',
            enum: [
                { v: PIVOT_TOP_LEFT, t: 'Top Left' },
                { v: PIVOT_TOP, t: 'Top' },
                { v: PIVOT_TOP_RIGHT, t: 'Top Right' },
                { v: PIVOT_LEFT, t: 'Left' },
                { v: PIVOT_CENTER, t: 'Center' },
                { v: PIVOT_RIGHT, t: 'Right' },
                { v: PIVOT_BOTTOM_LEFT, t: 'Bottom Left' },
                { v: PIVOT_BOTTOM, t: 'Bottom' },
                { v: PIVOT_BOTTOM_RIGHT, t: 'Bottom Right' }
            ],
            value: PIVOT_CENTER
        });
        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:generate:pivot', fieldPivot.parent.innerElement.firstChild.ui, null, panel);

        var toggleFields = function () {
            fieldColsRows[0].parent.hidden = fieldType.value !== TYPE_GRID_BY_FRAME_COUNT;
            fieldPixels[0].parent.hidden = fieldType.value !== TYPE_GRID_BY_FRAME_SIZE;
            fieldOffset[0].parent.hidden = fieldType.value !== TYPE_GRID_BY_FRAME_COUNT && fieldType.value !== TYPE_GRID_BY_FRAME_SIZE;
            fieldSpacing[0].parent.hidden = fieldType.value !== TYPE_GRID_BY_FRAME_COUNT && fieldType.value !== TYPE_GRID_BY_FRAME_SIZE;
        };

        toggleFields();

        fieldType.on('change', toggleFields);

        var btnGenerate = editor.call('attributes:addField', {
            parent: panel,
            text: 'GENERATE FRAMES',
            type: 'button',
            name: ' '
        });

        btnGenerate.class.add('icon', 'generate');

        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:generate:generate', btnGenerate, null, panel);

        btnGenerate.on('click', function () {
            btnGenerate.disabled = true;
            var type = fieldType.value;
            var method = fieldMethod.value;

            var oldFrames = atlasAsset.get('data.frames');
            var newFrames = method === METHOD_DELETE_EXISTING ? {} : atlasAsset.get('data.frames');

            var redo = function () {
                var asset = editor.call('assets:get', atlasAsset.get('id'));
                if (! asset) return;
                var history = asset.history.enabled;
                asset.history.enabled = false;

                if (type === TYPE_GRID_BY_FRAME_COUNT) {
                    sliceGridByCount(fieldColsRows[0].value, fieldColsRows[1].value, newFrames);

                    // set frames and manually emit 'set' event
                    // to avoid huge performance hit if there's a lot of frames
                    setFrames(asset, newFrames);
                } else if (type === TYPE_GRID_BY_FRAME_SIZE) {
                    var width = atlasImage.width;
                    var height = atlasImage.height;
                    sliceGridBySize(fieldPixels[0].value, fieldPixels[1].value, newFrames);
                    setFrames(asset, newFrames);
                } else if (type === TYPE_GRID_AUTO) {
                    // TODO
                }

                asset.history.enabled = history;
            };

            var undo = function () {
                var asset = editor.call('assets:get', atlasAsset.get('id'));
                if (! asset) return;
                var history = asset.history.enabled;
                asset.history.enabled = false;
                setFrames(asset, oldFrames);
                asset.history.enabled = history;
            };

            editor.call('history:add', {
                name: 'slice',
                redo: redo,
                undo: undo
            });

            // do this in a timeout to give a chance to the button to
            // appear disabled
            setTimeout(function () {
                redo();
                btnGenerate.disabled = false;
            }, 50);
        });

        var btnClear = editor.call('attributes:addField', {
            parent: panel,
            text: 'Delete All Frames',
            type: 'button',
            name: ' '
        });

        btnClear.class.add('icon', 'remove');

        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:generate:clear', btnClear, null, panel);

        btnClear.on('click', function () {
            editor.call('picker:confirm', 'Are you sure you want to delete all the frames?', function () {
                var frames = atlasAsset.get('data.frames');

                btnClear.disabled = true;

                var redo = function () {
                    var asset = editor.call('assets:get', atlasAsset.get('id'));
                    if (! asset) return;
                    var history = asset.history.enabled;
                    asset.history.enabled = false;
                    setFrames(asset, {});
                    asset.history.enabled = history;
                };

                var undo = function () {
                    var asset = editor.call('assets:get', atlasAsset.get('id'));
                    if (! asset) return;
                    var history = asset.history.enabled;
                    asset.history.enabled = false;
                    setFrames(asset, frames);
                    asset.history.enabled = history;
                };

                editor.call('history:add', {
                    name: 'delete all frames',
                    undo: undo,
                    redo: redo
                });

                // do this in a timeout so that the button can appear disabled
                setTimeout(function () {
                    redo();
                    btnClear.disabled = false;
                });
            });
        });

        // Set frames without firing events for each individual json field
        var setFrames = function (asset, frames) {
            var suspend = asset.suspendEvents;
            asset.suspendEvents = true;
            asset.set('data.frames', frames);
            asset.suspendEvents = suspend;
            asset.emit('data.frames:set', frames, null, false);
            asset.emit('*:set', 'data.frames', frames, null, false);
        };

        // Slice atlas in frames using a grid
        var sliceGridByCount = function (cols, rows, frames) {
            var pivot = presetValues[fieldPivot.value];

            var maxKey = 1;
            for (var key in frames) {
                maxKey = Math.max(maxKey, parseInt(key, 10) + 1);
            }

            var offsetX = fieldOffset[0].value;
            var offsetY = fieldOffset[1].value;

            var spacingX = fieldSpacing[0].value;
            var spacingY = fieldSpacing[1].value;

            var imgWidth = atlasImage.width - offsetX;
            var imgHeight = atlasImage.height - offsetY;

            var totalSpacingX = spacingX * (cols - 1);
            var totalSpacingY = spacingY * (rows - 1);

            var frameWidth = Math.floor((imgWidth - totalSpacingX) / cols);
            var frameHeight = Math.floor((imgHeight - totalSpacingY) / rows);

            var spacedWidth = frameWidth + spacingX;
            var spacedHeight = frameHeight + spacingY;

            for (var r = 0; r < rows; r++) {
                for (var c = 0; c < cols; c++) {
                    var left = offsetX + c * (frameWidth + spacingX);
                    var top = offsetY + r * (frameHeight + spacingY) - offsetY - spacingY;

                    if (! isRegionEmpty(left, top+spacingY, frameWidth, frameHeight)) {
                        frames[maxKey] = {
                            name: 'Frame ' + maxKey,
                            rect: [left, Math.floor(imgHeight - (top + spacedHeight)), frameWidth, frameHeight],
                            pivot: pivot,
                            border: [0,0,0,0]
                        };
                        maxKey++;
                    }
                }
            }
        };

        var sliceGridBySize = function (frameWidth, frameHeight, frames) {
            var pivot = presetValues[fieldPivot.value];

            var maxKey = 1;
            for (var key in frames) {
                maxKey = Math.max(maxKey, parseInt(key, 10) + 1);
            }

            var offsetX = fieldOffset[0].value;
            var offsetY = fieldOffset[1].value;

            var spacingX = fieldSpacing[0].value;
            var spacingY = fieldSpacing[1].value;

            var imgWidth = atlasImage.width - offsetX;
            var imgHeight = atlasImage.height - offsetY;

            var cols = Math.floor((imgWidth + spacingX) / (frameWidth + spacingX));
            var rows = Math.floor((imgHeight + spacingY) / (frameHeight + spacingY));

            var totalSpacingX = spacingX * (cols - 1);
            var totalSpacingY = spacingY * (rows - 1);

            var spacedWidth = frameWidth + spacingX;
            var spacedHeight = frameHeight + spacingY;

            for (var r = 0; r < rows; r++) {
                for (var c = 0; c < cols; c++) {
                    var left = offsetX + c * (frameWidth + spacingX);
                    var top = offsetY + r * (frameHeight + spacingY) - offsetY - spacingY;

                    if (! isRegionEmpty(left, top+spacingY, frameWidth, frameHeight)) {
                        frames[maxKey] = {
                            name: 'Frame ' + maxKey,
                            rect: [left, Math.floor(imgHeight - (top + spacedHeight)), frameWidth, frameHeight],
                            pivot: pivot,
                            border: [0,0,0,0]
                        };
                        maxKey++;
                    }
                }
            }
        };

        // Checks if an image region has alpha
        var isRegionEmpty = function (left, top, width, height) {
            var right = left + width;
            var bottom = top + height;

            for (var x = left; x < right; x++) {
                for (var y = top; y < bottom; y++) {
                    if (! isPixelEmpty(x, y)) {
                        return false;
                    }
                }
            }

            return true;
        };

        var isPixelEmpty = function (x, y) {
            var alpha = y * (atlasImage.width * 4) + x * 4 + 3;
            return imageData.data[alpha] === 0;
        };

        events.push(rootPanel.on('clear', function () {
            panel.destroy();
        }));

        panel.on('destroy', function () {
            for (var i = 0, len = events.length; i<len; i++) {
                events[i].unbind();
            }
            events.length = 0;
        });
    });
});


/* editor/pickers/sprite-editor/sprite-editor-import-frames-panel.js */
editor.once('load', function () {
    'use strict';

    editor.method('picker:sprites:attributes:importFrames', function (args) {
        var events = [];
        var atlasAsset = args.atlasAsset;

        var rootPanel = editor.call('picker:sprites:rightPanel');

        var panel = editor.call('attributes:addPanel', {
            parent: rootPanel,
            name: 'IMPORT FRAME DATA'
        });
        panel.class.add('component');

        panel.disabled = ! editor.call('permissions:write');

        events.push(editor.on('permissions:writeState', function (canWrite) {
            panel.disabled = ! canWrite;
        }));

        var panelError = new ui.Panel('Invalid JSON file');
        panelError.class.add('import-error');
        panel.append(panelError);
        panelError.flex = true;
        panelError.hidden = true;

        var labelError = new ui.Label({
            text: 'Please upload a valid JSON file that has been created with the Texture Packer application.'
        });
        labelError.flexGrow = 1;
        labelError.renderChanges = false;
        panelError.append(labelError);

        var btnCloseError = new ui.Button({
            text: '&#57650;'
        });
        btnCloseError.class.add('close');
        panelError.headerElement.appendChild(btnCloseError.element);

        btnCloseError.on('click', function () {
            panelError.hidden = true;
        });

        var panelButtons = new ui.Panel();
        panelButtons.flex = true;
        panel.append(panelButtons);

        var hiddenInput = document.createElement('input');
        hiddenInput.type = 'file';
        hiddenInput.accept = '.json';
        hiddenInput.style.display = 'none';
        panel.innerElement.appendChild(hiddenInput);

        var btnImport = new ui.Button({
            text: 'UPLOAD TEXTURE PACKER JSON'
        });
        btnImport.flexGrow = 1;
        btnImport.class.add('icon', 'upload');
        panelButtons.append(btnImport);

        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:import:texturepacker', btnImport, null, panel);

        btnImport.on('click', function () {
            panelError.hidden = true;

            var hasFrames = false;
            var currentFrames = atlasAsset.getRaw('data.frames')._data;
            for (var key in currentFrames) {
                hasFrames = true;
                break;
            }

            if (hasFrames) {
                editor.call('picker:confirm', 'Uploading frame data will replace all current frames - Are you sure you want to upload?', function () {
                    hiddenInput.click();
                });
            } else {
                hiddenInput.click();
            }
        });

        hiddenInput.addEventListener('change', function () {
            if (! hiddenInput.files[0]) return;

            btnImport.disabled = true;
            btnImport.text = 'PROCESSING...';

            var reader = new FileReader();
            reader.onload = function (e) {
                hiddenInput.value = null;
                var text = reader.result;
                var data = null;
                try {
                    data = JSON.parse(text);
                    importFramesFromTexturePacker(data);
                } catch (err) {
                    console.error(err);
                    panelError.hidden = false;
                    return;
                } finally {
                    btnImport.text = 'UPLOAD TEXTURE PACKER JSON';
                    btnImport.disabled = false;
                }
            };
            reader.readAsText(hiddenInput.files[0]);
        });

        var importFramesFromTexturePacker = function (data) {
            var width = data.meta.size.w;
            var height = data.meta.size.h;
            var actualWidth = atlasAsset.get('meta.width');
            var actualHeight = atlasAsset.get('meta.height');

            var scaleWidth = actualWidth / width;
            var scaleHeight = actualHeight / height;

            var newFrames = {};
            var counter = 0;

            for (var key in data.frames) {
                var frameData = data.frames[key];

                // the free version of texturepacker doesn't include the pivot data, so provide defaults if necessary
                if (!frameData.pivot) {
                    frameData.pivot = {
                        x: 0.5,
                        y: 0.5
                    };
                }
                newFrames[counter++] = {
                    name: frameData.filename || key,
                    border: frameData.borders ? [
                        Math.max(0, frameData.borders.x),
                        Math.max(0, frameData.frame.h - frameData.borders.y - frameData.borders.h),
                        Math.max(0, frameData.frame.w - frameData.borders.x - frameData.borders.w),
                        Math.max(0, frameData.borders.y)
                    ] :
                    [0, 0, 0, 0],
                    rect: [
                        frameData.frame.x * scaleWidth,
                        (height - frameData.frame.y - frameData.frame.h) * scaleHeight,
                        frameData.frame.w * scaleWidth,
                        frameData.frame.h * scaleHeight
                    ],
                    pivot: [
                        frameData.pivot.x,
                        frameData.pivot.y
                    ]
                };
            }

            atlasAsset.set('data.frames', newFrames);
        };

        events.push(rootPanel.on('clear', function () {
            panel.destroy();
        }));

        panel.on('destroy', function () {
            for (var i = 0, len = events.length; i<len; i++) {
                events[i].unbind();
            }
            events.length = 0;
        });
    });
});


/* editor/pickers/sprite-editor/sprite-editor-sprite-panel.js */
editor.once('load', function() {
    'use strict';

    editor.method('picker:sprites:attributes:sprite', function (args) {
        var atlasAsset = args.atlasAsset;
        var atlasImage = args.atlasImage;
        var spriteAsset = args.spriteAsset;

        var frameKeys = spriteAsset.get('data.frameKeys');

        var spriteEditMode = false;
        var selectedFrames = null;

        var events = [];

        var rootPanel = editor.call('picker:sprites:rightPanel');
        rootPanel.header = 'SPRITE ASSET - ' + spriteAsset.get('name');

        var fieldPreview = editor.call('picker:sprites:attributes:frames:preview', {
            atlasAsset: atlasAsset,
            atlasImage: atlasImage,
            frames: frameKeys
        });

        var panel = editor.call('attributes:addPanel', {
            parent: rootPanel
        });
        panel.disabled = ! editor.call('permissions:write');
        events.push(editor.on('permissions:writeState', function (canWrite) {
            panel.disabled = ! canWrite;
        }));

        var fieldId = editor.call('attributes:addField', {
            parent: panel,
            name: 'ID',
            link: spriteAsset,
            path: 'id'
        });
        // reference
        editor.call('attributes:reference:attach', 'asset:id', fieldId.parent.innerElement.firstChild.ui, null, panel);

        var suspendRenameEvt = false;

        var fieldName = editor.call('attributes:addField', {
            parent: panel,
            name: 'Name',
            type: 'string',
            value: spriteAsset.get('name')
        });
        // reference
        editor.call('attributes:reference:attach', 'asset:name', fieldName.parent.innerElement.firstChild.ui, null, panel);

        events.push(fieldName.on('change', function (value) {
            rootPanel.header = 'SPRITE ASSET - ' + value;
            if (value !== spriteAsset.get('name') && ! suspendRenameEvt) {
                suspendRenameEvt = true;
                editor.call('assets:rename', spriteAsset, value);
                suspendRenameEvt = false;
            }
        }));

        events.push(spriteAsset.on('name:set', function (value) {
            suspendRenameEvt = true;
            fieldName.value = value;
            suspendRenameEvt = false;
        }));

        var fieldPpu = editor.call('attributes:addField', {
            parent: panel,
            name: 'Pixels Per Unit',
            type: 'number',
            link: spriteAsset,
            min: 0,
            path: 'data.pixelsPerUnit'
        });
        // reference
        editor.call('attributes:reference:attach', 'asset:sprite:pixelsPerUnit', fieldPpu.parent.innerElement.firstChild.ui, null, panel);

        var fieldRenderMode = editor.call('attributes:addField', {
            parent: panel,
            name: 'Render Mode',
            type: 'number',
            enum: [
                {v: 0, t: 'Simple'},
                {v: 1, t: 'Sliced'},
                {v: 2, t: 'Tiled'}
            ],
            link: spriteAsset,
            path: 'data.renderMode'
        });
        // reference
        editor.call('attributes:reference:attach', 'asset:sprite:renderMode', fieldRenderMode.parent.innerElement.firstChild.ui, null, panel);

        var panelEdit = editor.call('attributes:addPanel', {
            parent: rootPanel,
            name: 'FRAMES IN SPRITE ASSET'
        });
        panelEdit.flex = true;
        panelEdit.class.add('buttons');

        panelEdit.disabled = ! editor.call('permissions:write');
        events.push(editor.on('permissions:writeState', function (canWrite) {
            panelEdit.disabled = ! canWrite;
        }));

        // add frames tooltip
        var panelAddFramesInfo = new ui.Panel('Adding more frames to a sprite');
        panelAddFramesInfo.class.add('add-frames-info');
        panelAddFramesInfo.hidden = true;
        panelEdit.append(panelAddFramesInfo);

        var labelInfo = new ui.Label({
            text: 'To add more frames to a sprite asset, select the frames you wish to add either on the texture atlas viewport or from the panel on the left, then click ADD SELECTED FRAMES.'
        });
        panelAddFramesInfo.append(labelInfo);

        var btnAddFrames = new ui.Button({
            text: 'ADD FRAMES TO SPRITE ASSET'
        });
        btnAddFrames.flexGrow = 1;
        btnAddFrames.class.add('icon', 'wide', 'create');
        panelEdit.append(btnAddFrames);


        // reference
        editor.call('attributes:reference:attach', 'spriteeditor:sprites:addFrames', btnAddFrames, null, panel);

        btnAddFrames.on('click', function () {
            editor.call('picker:sprites:pickFrames');
        });

        var btnAddSelected = new ui.Button({
            text: 'ADD SELECTED FRAMES'
        });
        btnAddSelected.class.add('icon', 'create');
        btnAddSelected.flexGrow = 3;
        btnAddSelected.hidden = true;
        panelEdit.append(btnAddSelected);

        // add selected frames to sprite asset
        btnAddSelected.on('click', function () {
            editor.call('picker:sprites:pickFrames:add');
        });

        var btnCancel = new ui.Button({
            text: 'DONE'
        });
        btnCancel.class.add('icon', 'done');
        btnCancel.flexGrow = 1;
        btnCancel.hidden = true;
        panelEdit.append(btnCancel);

        btnCancel.on('click', function () {
            editor.call('picker:sprites:pickFrames:cancel');
        });

        var panelFrames = editor.call('attributes:addPanel', {
            parent: panelEdit,
        });
        panelFrames.class.add('frames');

        var draggedPanel = null;
        var draggedIndex = null;

        var panels = [];

        var addFramePanel = function (key, index) {
            var frameEvents = [];

            var panel = new ui.Panel();
            panel.class.add('frame');
            panel._frameKey = key;
            if (index !== undefined) {
                panels.splice(index, 0, panel);
            } else {
                panels.push(panel);
            }

            // drag handle
            var handle = document.createElement('div');
            handle.classList.add('handle');
            panel.append(handle);


            var onDragStart = function (evt) {
                if (! editor.call('permissions:write')) return;

                draggedPanel = panel;
                draggedIndex = panels.indexOf(panel);

                panel.class.add('dragged');

                window.addEventListener('mouseup', onDragEnd);
                panelFrames.innerElement.addEventListener('mousemove', onDragMove);
            };

            handle.addEventListener('mousedown', onDragStart);

            // preview
            var canvas = new ui.Canvas();
            var previewWidth = 26;
            var previewHeight = 26;
            canvas.class.add('preview');
            canvas.resize(previewWidth, previewHeight);

            panel.append(canvas);

            var ctx = canvas.element.getContext('2d');

            var renderQueued = false;

            panel.queueRender = function () {
                if (renderQueued) return;
                renderQueued = true;
                requestAnimationFrame(renderPreview);
            };

            var renderPreview = function () {
                renderQueued = false;

                ctx.clearRect(0, 0, previewWidth, previewHeight);

                if (! atlasImage) return;

                var frame = atlasAsset.getRaw('data.frames.' + key);
                if (! frame) return;
                frame = frame._data;

                var x = frame.rect[0];
                // convert bottom left WebGL coord to top left pixel coord
                var y = atlasImage.height - frame.rect[1] - frame.rect[3];
                var w = frame.rect[2];
                var h = frame.rect[3];

                // choose targetWidth and targetHeight keeping the aspect ratio
                var aspectRatio = w / h;
                var targetWidth = previewWidth;
                var targetHeight = previewHeight;

                if (w >= h) {
                    targetHeight = previewWidth / aspectRatio;
                } else {
                    targetWidth = targetHeight * aspectRatio;
                }

                var offsetX = (previewWidth - targetWidth) / 2;
                var offsetY = (previewHeight - targetHeight) / 2;

                ctx.drawImage(atlasImage, x, y, w, h, offsetX, offsetY, targetWidth, targetHeight);
            };

            renderPreview();

            // sprite name
            var fieldName = new ui.Label();
            fieldName.class.add('name');
            fieldName.value = atlasAsset.get('data.frames.' + key + '.name') || 'Missing';
            panel.append(fieldName);

            frameEvents.push(atlasAsset.on('data.frames.' + key + '.name:set', function (value) {
                fieldName.value = value;
            }));

            frameEvents.push(atlasAsset.on('data.frames.' + key + ':unset', function () {
                fieldName.value = 'Missing';
                panel.queueRender();
            }));

            // remove frame
            var btnRemove = new ui.Button();
            btnRemove.class.add('remove');
            panel.append(btnRemove);

            btnRemove.on('click', function (e) {
                e.stopPropagation();

                var idx = panels.indexOf(panel);
                if (idx !== -1) {
                    spriteAsset.remove('data.frameKeys', idx);
                }
            });

            panel.on('click', function () {
                // do not select missing frames
                if (! atlasAsset.has('data.frames.' + key)) return;

                // select frame
                editor.call('picker:sprites:selectFrames', key, {
                    history: true,
                    clearSprite: true
                });
            });

            // clean up events
            panel.on('destroy', function () {
                for (var i = 0, len = frameEvents.length; i<len; i++) {
                    frameEvents[i].unbind();
                }
                frameEvents.length = 0;

                handle.removeEventListener('mousedown', onDragStart);
                if (draggedPanel === panel) {
                    draggedPanel = null;
                    draggedIndex = null;
                    panelFrames.innerElement.removeEventListener('mousemove', onDragMove);
                    window.removeEventListener('mouseup', onDragEnd);
                }
            });

            var before = null;
            if (typeof(index) === 'number')
                before = panelFrames.innerElement.childNodes[index];

            if (before) {
                panelFrames.appendBefore(panel, before);
            } else {
                panelFrames.append(panel);
            }
        };

        var onDragMove = function (evt) {
            var rect = panelFrames.innerElement.getBoundingClientRect();
            var height = draggedPanel.element.offsetHeight;
            var top = evt.clientY - rect.top - 6;
            var overPanelIndex = Math.floor(top / height);
            var overPanel = panels[overPanelIndex];//panelFrames.innerElement.childNodes[overPanelIndex];

            if (overPanel && overPanel !== draggedPanel) {
                panelFrames.remove(draggedPanel);
                panelFrames.appendBefore(draggedPanel, panelFrames.innerElement.childNodes[overPanelIndex]);

                var idx = panels.splice(panels.indexOf(draggedPanel), 1);
                panels.splice(overPanelIndex, 0, draggedPanel);
            }
        };

        var onDragEnd = function () {
            if (! draggedPanel) return;

            var oldIndex = draggedIndex;
            var newIndex = Array.prototype.indexOf.call(panelFrames.innerElement.childNodes, draggedPanel.element);

            // change order in sprite asset
            if (oldIndex !== newIndex) {
                spriteAsset.move('data.frameKeys', oldIndex, newIndex);
            }

            draggedPanel.class.remove('dragged');
            draggedPanel = null;
            draggedIndex = null;

            panelFrames.innerElement.removeEventListener('mousemove', onDragMove);
            window.removeEventListener('mouseup', onDragEnd);
        };

        for (var i = 0, len = frameKeys.length; i<len; i++) {
            addFramePanel(frameKeys[i]);
        }

        events.push(spriteAsset.on('data.frameKeys:remove', function (value, index) {
            if (! panels[index]) return;

            panels[index].destroy();
            panels.splice(index, 1);

            frameKeys = spriteAsset.get('data.frameKeys');

            fieldPreview.setFrames(frameKeys);
        }));

        events.push(spriteAsset.on('data.frameKeys:insert', function (value, index) {
            frameKeys = spriteAsset.get('data.frameKeys');
            addFramePanel(frameKeys[index], index);
            fieldPreview.setFrames(frameKeys);
        }));

        events.push(spriteAsset.on('data.frameKeys:move', function (value, indNew, indOld) {
            // update the draggedIndex if another user dragged the same frame we're dragging
            if (indOld === draggedIndex) {
                draggedIndex = indNew;
            }

            if (draggedIndex === indNew) return;

            var movedPanel = panels[indOld];
            if (movedPanel && movedPanel._frameKey === value) {
                panelFrames.remove(movedPanel);
                panelFrames.appendBefore(movedPanel, panelFrames.innerElement.childNodes[indNew]);

                panels.splice(indOld, 1);
                panels.splice(indNew, 0, movedPanel);
            }

            frameKeys = spriteAsset.get('data.frameKeys');
            fieldPreview.setFrames(frameKeys);
        }));

        events.push(spriteAsset.on('data.frameKeys:set', function (value) {
            var i, len;

            for (i = 0, len = panels.length; i<len; i++) {
                panels[i].destroy();
            }
            panels.length = 0;

            frameKeys = spriteAsset.get('data.frameKeys');
            for (i = 0, len = frameKeys.length; i<len; i++) {
                addFramePanel(frameKeys[i]);
            }

            fieldPreview.setFrames(frameKeys);
        }));

        events.push(atlasAsset.on('*:set', function (path) {
            if (! path.startsWith('data.frames')) {
                return;
            }

            var parts = path.split('.');
            var partsLen = parts.length;
            if (partsLen >= 3) {
                // re-render frame preview
                for (var i = 0, len = panels.length; i<len; i++) {
                    if (panels[i]._frameKey === parts[2]) {
                        panels[i].queueRender();

                        // if this frame was added back to the atlas
                        // then re-render preview
                        if (partsLen === 3) {
                            fieldPreview.setFrames(frameKeys);
                        }

                        break;
                    }
                }
            }
        }));

        events.push(editor.on('picker:sprites:pickFrames:start', function () {
            spriteEditMode = true;
            btnAddFrames.hidden = true;
            btnAddSelected.disabled = true;
            btnAddSelected.hidden = false;
            btnCancel.hidden = false;
            panelAddFramesInfo.hidden = false;
        }));

        events.push(editor.on('picker:sprites:pickFrames:end', function () {
            spriteEditMode = false;
            btnAddFrames.hidden = false;
            btnAddSelected.hidden = true;
            btnCancel.hidden = true;
            panelAddFramesInfo.hidden = true;

            // restore preview to the actual frames that the sprite currently has
            fieldPreview.setFrames(frameKeys);
        }));

        events.push(editor.on('picker:sprites:framesSelected', function (keys) {
            if (! spriteEditMode) return;

            selectedFrames = keys;

            var len = keys ? keys.length : 0;
            btnAddSelected.disabled = !len;

            // update preview to show what sprite would look like after
            // the selected keys were added
            if (len) {
                fieldPreview.setFrames(frameKeys.slice().concat(keys));
            }
        }));

        events.push(rootPanel.on('clear', function () {
            panel.destroy();
            panelEdit.destroy();
        }));

        panel.on('destroy', function () {
            for (var i = 0; i < events.length; i++) {
                events[i].unbind();
            }

            events.length = 0;
            panels.length = 0;
            spriteEditMode = false;
        });

    });
});


/* editor/pickers/sprite-editor/sprite-editor-sprite-assets-panel.js */
editor.once('load', function() {
    'use strict';

    editor.method('picker:sprites:spriteassets', function(args) {
        var events = [];

        var atlasAsset = args.atlasAsset;

        // context menu
        var menu = new ui.Menu();
        editor.call('layout.root').append(menu);
        var contextMenuAsset = null;

        // context menu options

        // duplicate
        var menuDuplicate = new ui.MenuItem({
            text: 'Duplicate',
            icon: '&#57638;',
            value: 'duplicate'
        });
        menuDuplicate.on('select', function () {
            if (! contextMenuAsset) return;
            editor.call('assets:duplicate', contextMenuAsset);
        })
        menu.append(menuDuplicate);

        // delete
        var menuDelete = new ui.MenuItem({
            text: 'Delete',
            icon: '&#57636;',
            value: 'delete'
        });
        menuDelete.on('select', function () {
            if (! contextMenuAsset) return;
            editor.call('assets:delete:picker', [ contextMenuAsset ]);
        });
        menu.append(menuDelete);

        var rootPanel = editor.call('picker:sprites:bottomPanel');

        // grid
        var grid = new ui.Grid({
            multiSelect: false
        });
        grid.class.add('sprites');
        rootPanel.append(grid);

        // holds all sprite items indexed by asset id
        var spriteItems = {};
        // holds the key of the first frame for each sprite asset - used for rendering preview
        var firstFramePerSprite = {};

        var createSpriteItem = function (asset) {
            var spriteEvents = [];

            // sprite item
            var spriteItem = new ui.GridItem({
                toggleSelectOnClick: false
            });

            // sprite preview
            var canvas = new ui.Canvas();
            canvas.class.add('thumbnail');
            canvas.resize(64, 64);
            spriteItem.element.appendChild(canvas.element);

            spriteItems[asset.get('id')] = spriteItem;

            spriteItem.updateFirstFrame = function () {
                var frameKeys = asset.getRaw('data.frameKeys');
                firstFramePerSprite[asset.get('id')] = frameKeys[0];
            };

            spriteItem.updateFirstFrame();

            var renderQueued = false;

            spriteItem.queueRender = function () {
                if (renderQueued) return;
                renderQueued = true;
                requestAnimationFrame(renderPreview);
            };

            var renderPreview = function () {
                renderQueued = false;

                var frameKeys = asset.getRaw('data.frameKeys');
                var frames = frameKeys.map(function (f) {
                    if (f) {
                        var frame = atlasAsset.getRaw('data.frames.' + f);
                        return frame && frame._data;
                    } else {
                        return null;
                    }
                });

                editor.call('picker:sprites:renderFramePreview', frames[0], canvas.element, frames);
            };

            renderPreview();

            // sprite name
            var fieldName = new ui.Label();
            fieldName.class.add('label');
            fieldName.value = asset.get('name');
            spriteItem.element.appendChild(fieldName.element);

            spriteEvents.push(asset.on('name:set', function (value) {
                fieldName.value = value;
            }));

            spriteEvents.push(asset.on('data.frameKeys:insert', function (value, index) {
                if (index === 0) {
                    spriteItem.updateFirstFrame();
                    spriteItem.queueRender();
                }
            }));

            spriteEvents.push(asset.on('data.frameKeys:remove', function (value, index) {
                if (index === 0) {
                    spriteItem.updateFirstFrame();
                    spriteItem.queueRender();
                }
            }));

            spriteEvents.push(asset.on('data.frameKeys:move', function (value, indNew, indOld) {
                if (indNew === 0 || indOld === 0) {
                    spriteItem.updateFirstFrame();
                    spriteItem.queueRender();
                }
            }));

            spriteEvents.push(asset.on('data.frameKeys:set', function (value) {
                spriteItem.updateFirstFrame();
                spriteItem.queueRender();
            }));

            // link to sprite asset
            spriteItem.on('click', function () {
                editor.call('picker:sprites:selectSprite', asset, {
                    history: true
                });
            });

            spriteEvents.push(editor.on('assets:remove[' + asset.get('id') + ']', function () {
                spriteItem.destroy();
                delete spriteItems[asset.get('id')];
                if (contextMenuAsset && contextMenuAsset.get('id') === asset.get('id')) {
                    contextMenuAsset = null;
                    if (menu.open) {
                        menu.open = false;
                    }
                }
            }));

            // context menu
            var contextMenu = function (e) {
                if (! editor.call('permissions:write')) return;

                contextMenuAsset = asset;
                menu.open = true;
                menu.position(e.clientX + 1, e.clientY);
            };

            spriteItem.element.addEventListener('contextmenu', contextMenu);

            // clean up events
            spriteItem.on('destroy', function () {
                for (var i = 0, len = spriteEvents.length; i<len; i++) {
                    spriteEvents[i].unbind();
                }
                spriteEvents.length = 0;

                spriteItem.element.removeEventListener('contextmenu', contextMenu);
            });

            grid.append(spriteItem);

            return spriteItem;
        };

        // find all sprite assets associated with this atlas
        var spriteAssets = editor.call('assets:find', function (asset) {
            var atlasId = atlasAsset.get('id');
            return asset.get('type') === 'sprite' && asset.get('data.textureAtlasAsset') === atlasId;
        });

        for (var i = 0; i<spriteAssets.length; i++) {
            createSpriteItem(spriteAssets[i][1]);
        }

        // Add / modify frame event
        events.push(atlasAsset.on('*:set', function (path) {
            if (! path.startsWith('data.frames')) {
                return;
            }

            var parts = path.split('.');
            if (parts.length >= 3) {
                var key = parts[2];
                for (var assetId in firstFramePerSprite) {
                    if (firstFramePerSprite[assetId] === key) {
                        var p = spriteItems[assetId];
                        if (p) {
                            p.queueRender();
                        }
                    }
                }
            }
        }));

        // Delete frame event
        events.push(atlasAsset.on('*:unset', function (path) {
            if (! path.startsWith('data.frames')) {
                return;
            }

            var parts = path.split('.');
            if (parts.length >= 3) {
                var key = parts[2];
                for (var assetId in firstFramePerSprite) {
                    if (firstFramePerSprite[assetId] === key) {
                        var p = spriteItems[assetId];
                        if (p) {
                            p.queueRender();
                        }
                    }
                }
            }
        }));

        // Sprite selection event
        events.push(editor.on('picker:sprites:spriteSelected', function (sprite) {
            if (! sprite) {
                grid.selected = [];
            } else {
                var item = spriteItems[sprite.get('id')];
                if (item) {
                    grid.selected = [item];
                } else {
                    grid.selected = [];
                }
            }
        }));

        // Asset create event
        events.push(editor.on('assets:add', function (asset) {
            if (asset.get('type') !== 'sprite') return;

            var id = asset.get('data.textureAtlasAsset');
            if (id !== atlasAsset.get('id')) return;

            spriteAssets.push(asset);
            var item = createSpriteItem(asset);
            if (item) {
                item.flash();
            }
        }));

        // Sprite edit mode
        events.push(editor.on('picker:sprites:pickFrames:start', function () {
            rootPanel.disabled = true;
        }));

        events.push(editor.on('picker:sprites:pickFrames:end', function () {
            rootPanel.disabled = false;
        }));

        events.push(rootPanel.on('clear', function () {
            grid.destroy();
        }));

        grid.on('destroy', function () {
            menu.destroy();
            contextMenuAsset = null;

            for (var i = 0, len = events.length; i<len; i++) {
                events[i].unbind();
            }
            events.length = 0;
        });
    });
});


/* editor/pickers/sprite-editor/sprite-editor.js */
editor.once('load', function () {
    'use strict';

    var handleWidth = 10;
    var pivotWidth = 7;

    var COLOR_GRAY = '#B1B8BA';
    var COLOR_DARKEST = '#20292b';
    var COLOR_DARK = '#1B282B';
    var COLOR_GREEN = '#0f0';
    var COLOR_ORANGE = '#f60';
    var COLOR_TRANSPARENT_ORANGE = '#ff660099';
    var COLOR_BLUE = '#00f';

    var atlasAsset = null;
    var atlasImage = new Image();
    var atlasImageLoaded = false;
    var atlasImageDataCanvas = document.createElement('canvas');
    var atlasImageData = null;

    var shiftDown = false;
    var ctrlDown = false;
    var leftButtonDown = false;
    var rightButtonDown = false;

    var panning = false;
    var spriteEditMode = false;

    var newFrame = null;
    var hoveredFrame = null;
    var oldFrame = null;

    var selectedHandle = null;
    var hoveringHandle = null;
    var startingHandleFrame = null;
    var startingHandleCoords = { x: 0, y: 0 };

    var resizeInterval = null;
    var pivotX = 0;
    var pivotY = 0;
    var pivotOffsetX = 0;
    var pivotOffsetY = 0;
    var zoomOffsetX = 0;
    var zoomOffsetY = 0;
    var prevMouseX = 0;
    var prevMouseY = 0;
    var mouseX = 0;
    var mouseY = 0;
    var aspectRatio = 1;
    var canvasRatio = 1;

    var queuedRender = false;

    var suspendCloseUndo = false;

    var HANDLE = {
        TOP_LEFT: 1,
        TOP_RIGHT: 2,
        BOTTOM_LEFT: 3,
        BOTTOM_RIGHT: 4,
        BORDER_TOP_LEFT: 5,
        BORDER_TOP: 6,
        BORDER_TOP_RIGHT: 7,
        BORDER_LEFT: 8,
        BORDER_RIGHT: 9,
        BORDER_BOTTOM_LEFT: 10,
        BORDER_BOTTOM: 11,
        BORDER_BOTTOM_RIGHT: 12,
        PIVOT: 13,
        FRAME: 14,
        TOP: 15,
        RIGHT: 16,
        BOTTOM: 17,
        LEFT: 18
    };

    var events = [];

    // create UI
    var root = editor.call('layout.root');

    // overlay
    var overlay = new ui.Overlay();
    overlay.class.add('sprites-editor');
    overlay.hidden = true;
    root.append(overlay);


    var panel = new ui.Panel();
    panel.class.add('root-panel');
    panel.flex = true;
    panel.flexDirection = 'row';
    panel.header = 'SPRITE EDITOR';
    overlay.append(panel);
    // close button
    var btnClose = new ui.Button({
        text: '&#57650;'
    });
    btnClose.class.add('close');
    btnClose.on('click', function () {
        editor.call('picker:sprites:close');
    });
    panel.headerElement.appendChild(btnClose.element);

    var leftColumns = new ui.Panel();
    leftColumns.class.add('left-columns');
    leftColumns.flex = true;
    leftColumns.flexGrow = true;
    leftColumns.flexDirection = 'column';
    panel.append(leftColumns);

    var leftRows = new ui.Panel();
    leftRows.class.add('left-rows');
    leftRows.flex = true;
    leftRows.flexDirection = 'row';
    leftColumns.append(leftRows);

    var leftPanel = new ui.Panel();
    leftPanel.class.add('left-panel');
    // leftPanel.class.add('attributes');
    leftPanel.flexShrink = false;
    leftPanel.style.width = '320px';
    leftPanel.innerElement.style.width = '320px';
    leftPanel.horizontal = true;
    leftPanel.foldable = true;
    // leftPanel.scroll = true;
    leftPanel.resizable = 'right';
    leftPanel.resizeMin = 256;
    leftPanel.resizeMax = 512;
    leftRows.append(leftPanel);

    // middle panel
    var middlePanel = new ui.Panel();
    middlePanel.class.add('middle-panel');
    middlePanel.flex = true;
    middlePanel.flexGrow = true;
    middlePanel.flexDirection = 'column';
    leftRows.append(middlePanel);

    // canvas
    var canvasPanel = new ui.Panel();
    canvasPanel.class.add('canvas-panel');
    canvasPanel.flexible = true;
    canvasPanel.flexGrow = true;
    middlePanel.append(canvasPanel);

    var canvas = new ui.Canvas();
    canvas.class.add('canvas');
    canvasPanel.append(canvas);

    // Canvas Context
    var ctx = canvas.element.getContext("2d");

    // bottom panel
    var bottomPanel = new ui.Panel('SPRITE ASSETS');
    bottomPanel.class.add('bottom-panel');
    bottomPanel.innerElement.style.height = '219px';
    bottomPanel.foldable = true;
    bottomPanel.flexShrink = false;
    bottomPanel.scroll = true;
    bottomPanel.resizable = 'top';
    bottomPanel.resizeMin = 106;
    bottomPanel.resizeMax = 106 * 3;
    bottomPanel.headerSize = -1;
    middlePanel.append(bottomPanel);

    // // Canvas control
    var canvasControl = new ui.Panel();
    canvasControl.flex = true;
    canvasControl.flexDirection = 'row';
    canvasControl.class.add('canvas-control');
    leftColumns.append(canvasControl);

    // var alphaControl = new ui.Panel();
    // alphaControl.class.add('alpha-control');
    // alphaControl.flex = true;
    // alphaControl.flexDirection = 'row';
    // alphaControl.append(new ui.Label({
    //     text: 'Alpha'
    // }));
    // canvasControl.append(alphaControl);

    // var zoomControl = new ui.Panel();
    // zoomControl.class.add('slider-control');
    // zoomControl.flex = true;
    // zoomControl.flexDirection = 'row';
    // zoomControl.append(new ui.Label({
    //     text: 'Zoom'
    // }));

    // var zoomField = new ui.NumberField({
    //     min: 1,
    //     precision: 2,
    //     placeholder: 'X',
    // });
    // zoomField.link(controls, 'zoom');
    // zoomControl.append(zoomField);
    // var zoomSlider = new ui.Slider({
    //     min: 1,
    //     max: 100,
    //     precision: 2,
    // });
    // zoomSlider.link(controls, 'zoom');
    // zoomControl.append(zoomSlider);
    // canvasControl.append(zoomControl);

    // var brightnessControl = new ui.Panel();
    // brightnessControl.class.add('slider-control');
    // brightnessControl.flex = true;
    // brightnessControl.flexDirection = 'row';
    // brightnessControl.append(new ui.Label({
    //     text: 'Brightness'
    // }));

    // var brightnessField = new ui.NumberField({
    //     min: 0,
    //     max: 100,
    //     precision: 1,
    //     placeholder: '%',
    // });
    // brightnessField.link(controls, 'brightness');
    // brightnessControl.append(brightnessField);
    // var brightnessSlider = new ui.Slider({
    //     min: 0,
    //     max: 100,
    //     precision: 1,
    // });
    // brightnessSlider.link(controls, 'brightness');
    // brightnessControl.append(brightnessSlider);
    // canvasControl.append(brightnessControl);

    // Right panel
    var rightPanel = null;

    // controls observer (for zoom/brightness).
    var controls = new Observer({
        zoom: 1,
        brightness: 100
    });


    var imageWidth = function () {
        return controls.get('zoom') * (canvasRatio > aspectRatio ? canvas.height * aspectRatio : canvas.width);
    };

    var imageHeight = function (zoom) {
        return controls.get('zoom') * (canvasRatio <= aspectRatio ? canvas.width / aspectRatio : canvas.height);
    };

    var imageLeft = function () {
        return (pivotX + pivotOffsetX + zoomOffsetX) * canvas.width;
    };

    var imageTop = function () {
        return (pivotY + pivotOffsetY + zoomOffsetY) * canvas.height;
    };

    var frameLeft = function (frame, leftOffset, scaledWidth) {
        return leftOffset + frame.rect[0] * scaledWidth / atlasImage.width;
    };

    var frameTop = function (frame, topOffset, scaledHeight) {
        var inverted = 1 - (frame.rect[1] + frame.rect[3]) / atlasImage.height;
        return topOffset + inverted * scaledHeight;
    };

    var frameWidth = function (frame, scaledWidth) {
        return frame.rect[2] * scaledWidth / atlasImage.width;
    };

    var frameHeight = function (frame, scaledHeight) {
        return frame.rect[3] * scaledHeight / atlasImage.height;
    };

    var windowToCanvas = function (windowX, windowY) {
        var rect = canvas.element.getBoundingClientRect();
        return {
            x: Math.round(windowX - rect.left),
            y: Math.round(windowY - rect.top),
        };
    };

    var resizeCanvas = function () {
        var result = false;

        var width = canvasPanel.element.clientWidth;
        var height = canvasPanel.element.clientHeight;

        // If it's resolution does not match change it
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            result = true;
        }

        canvasRatio = canvas.width / canvas.height;

        return result;
    };

    var resetControls = function () {
        controls.set('zoom', 1);
        pivotX = 0;
        pivotY = 0;
        pivotOffsetX = 0;
        pivotOffsetY = 0;
        zoomOffsetX = 0;
        zoomOffsetY = 0;
    };

    var registerInputListeners = function () {
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mousemove', onMouseMove);
        canvas.element.addEventListener('mousedown', onMouseDown);
        canvas.element.addEventListener('wheel', onWheel);

        // 'F' hotkey to focus canvas
        editor.call('hotkey:register', 'sprite-editor-focus', {
            key: 'f',
            callback: function () {
                editor.call('picker:sprites:focus');
            }
        });

        // Esc to deselect and if no selection close the window
        editor.call('hotkey:register', 'sprite-editor-esc', {
            key: 'esc',
            callback: function () {
                if (editor.call('picker:isOpen', 'confirm')) {
                    return;
                }

                var spriteAsset = editor.call('picker:sprites:selectedSprite');
                if (spriteAsset) {
                    if (spriteEditMode) {
                        editor.call('picker:sprites:pickFrames:cancel');
                    } else {
                        editor.call('picker:sprites:selectSprite', null, {
                            history: true
                        });
                    }
                } else {
                    var selected = editor.call('picker:sprites:selectedFrame');
                    if (selected) {
                        selected = editor.call('picker:sprites:selectFrames', null, {
                            history: true
                        });
                    } else {
                        overlay.hidden = true;
                    }
                }
            }
        });
    };

    var unregisterInputListeners = function () {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('mousemove', onMouseMove);
        canvas.element.removeEventListener('mousedown', onMouseDown);
        canvas.element.removeEventListener("wheel", onWheel);

        editor.call('hotkey:unregister', 'sprite-editor-focus');
        editor.call('hotkey:unregister', 'sprite-editor-esc');
    };

    var onKeyDown = function (e) {
        if (e.shiftKey) {
            shiftDown = true;
            updateCursor();
        }

        ctrlDown = e.ctrlKey || e.metaKey;
    };

    var onKeyUp = function (e) {
        if (!e.shiftKey) {
            shiftDown = false;
            if (panning) {
                stopPanning();
            }

            updateCursor();
        }

        ctrlDown = e.ctrlKey || e.metaKey;
    };

    var onMouseDown = function (e) {
        if (e.button === 0) {
            leftButtonDown = true;
        } else if (e.button === 2) {
            rightButtonDown = true;
        }

        ctrlDown = e.ctrlKey || e.metaKey;

        if (e.button !== 0) return;

        // start panning with left button and shift
        if (!panning && leftButtonDown && shiftDown) {
            startPanning(e.clientX, e.clientY);
            return;
        }

        var p = windowToCanvas(e.clientX, e.clientY);

        var selected = editor.call('picker:sprites:selectedFrame');

        // if a frame is already selected try to select one of its handles
        if (selected && !ctrlDown) {
            oldFrame = atlasAsset.get('data.frames.' + selected);
            if (oldFrame) {
                setHandle(handlesHitTest(p, oldFrame), oldFrame, p);

                if (selectedHandle) {
                    updateCursor();
                    queueRender();
                }

            }
        }

        // if no handle selected try to select the frame under the cursor
        if (!selected || !selectedHandle) {
            var frameUnderCursor = framesHitTest(p);
            if (!frameUnderCursor) {
                // clear selection unless Ctrl is down
                if (!ctrlDown) {
                    selected = editor.call('picker:sprites:selectFrames', null, {
                        history: true,
                        clearSprite: !spriteEditMode
                    });
                }
            } else {
                var keys = spriteEditMode ? editor.call('picker:sprites:newSpriteFrames') : editor.call('picker:sprites:highlightedFrames');
                var idx = keys.indexOf(frameUnderCursor);
                // deselect already highlighted frame if ctrl is pressed
                if (idx !== -1 && ctrlDown) {
                    keys = keys.slice();
                    keys.splice(idx, 1);
                    selected = editor.call('picker:sprites:selectFrames', keys, {
                        history: true,
                        clearSprite: !spriteEditMode
                    });
                } else {
                    // select new frame
                    selected = editor.call('picker:sprites:selectFrames', frameUnderCursor, {
                        history: true,
                        clearSprite: !spriteEditMode,
                        add: ctrlDown
                    });
                }
            }
        }

        // if no frame selected then start a new frame
        if (!selected && !spriteEditMode && editor.call('permissions:write')) {
            var diffX = clamp((p.x - imageLeft()) / imageWidth(), 0, 1);
            var diffY = clamp((1 - (p.y - imageTop()) / imageHeight()), 0, 1);

            var x = Math.floor(atlasImage.width * diffX);
            var y = Math.floor(atlasImage.height * diffY);
            newFrame = {
                rect: [x, y, 0, 0],
                pivot: [0.5, 0.5],
                border: [0, 0, 0, 0]
            };
            setHandle(HANDLE.BOTTOM_RIGHT, newFrame, p);

            updateCursor();
        }
    };

    var onMouseMove = function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // keep panning
        if (panning) {
            pivotOffsetX = (mouseX - prevMouseX) / canvas.width;
            pivotOffsetY = (mouseY - prevMouseY) / canvas.height;
            queueRender();
            return;
        }

        var p = windowToCanvas(mouseX, mouseY);

        var selected = editor.call('picker:sprites:selectedFrame');

        var previousHoveringHandle = hoveringHandle;
        hoveringHandle = null;

        // if a handle is selected then modify the selected frame
        if (newFrame) {
            modifyFrame(selectedHandle, newFrame, p);
            queueRender();
        } else if (selected && selectedHandle) {
            var frame = atlasAsset.get('data.frames.' + selected);
            modifyFrame(selectedHandle, frame, p);

            // set asset so that other users can see changes too
            var history = atlasAsset.history.enabled;
            atlasAsset.history.enabled = false;
            if (selectedHandle === HANDLE.PIVOT) {
                atlasAsset.set('data.frames.' + selected + '.pivot', frame.pivot);
            } else {
                atlasAsset.set('data.frames.' + selected + '.rect', frame.rect);
                atlasAsset.set('data.frames.' + selected + '.border', frame.border);
            }
            atlasAsset.history.enabled = history;

            queueRender();
        }
        // if no handle is selected then change cursor if the user hovers over a handle
        else if (selected) {
            var selectedFrame = atlasAsset.getRaw('data.frames.' + selected);
            if (selectedFrame) {
                selectedFrame = selectedFrame._data;
                hoveringHandle = handlesHitTest(p, selectedFrame);
            }
        }

        if (hoveringHandle !== previousHoveringHandle) {
            updateCursor();
        }

    };

    var onMouseUp = function (e) {
        if (e.button === 0) {
            leftButtonDown = false;
        } else if (e.button === 1) {
            rightButtonDown = false;
        }

        if (e.button !== 0) return;

        // stop panning
        if (panning && !leftButtonDown) {
            stopPanning();
        }

        var selected = editor.call('picker:sprites:selectedFrame');

        // if we've been editing a new frame then create it
        if (newFrame) {

            // don't generate it if it's too small
            if (newFrame.rect[2] !== 0 && newFrame.rect[3] !== 0) {
                // generate key name for new frame
                var key = 1;
                for (var existingKey in atlasAsset.getRaw('data.frames')._data) {
                    key = Math.max(parseInt(existingKey, 10) + 1, key);
                }

                newFrame.name = 'Frame ' + key;

                editor.call('picker:sprites:commitFrameChanges', key.toString(), newFrame);
                selected = editor.call('picker:sprites:selectFrames', key.toString(), {
                    clearSprite: true
                });
            }

            newFrame = null;
            hoveringHandle = null;
            setHandle(null);
            queueRender();
        }
        // if we have edited the selected frame then commit the changes
        else if (selected) {
            // clear selected handle
            if (selectedHandle) {
                setHandle(null);
                queueRender();
            }

            if (oldFrame) {
                var frame = atlasAsset.getRaw('data.frames.' + selected)._data;
                var dirty = false;
                for (var i = 0; i < 4; i++) {
                    if (oldFrame.rect[i] !== frame.rect[i]) {
                        dirty = true;
                        break;
                    }


                    if (oldFrame.border[i] !== frame.border[i]) {
                        dirty = true;
                        break;
                    }
                }

                if (!dirty) {
                    for (var i = 0; i < 2; i++) {
                        if (oldFrame.pivot[i] !== frame.pivot[i]) {
                            dirty = true;
                            break;
                        }
                    }
                }

                if (dirty) {
                    editor.call('picker:sprites:commitFrameChanges', selected, frame, oldFrame);
                    oldFrame = null;
                }
            }
        }
    };

    var onWheel = function (e) {
        e.preventDefault();

        var wheel = e.deltaY > 0 ? -0.1 : (e.deltaY < 0 ? 0.1 : 0);
        if (wheel !== 0) {
            var newZoom = Math.max(0.7, controls.get('zoom') + wheel);
            controls.set('zoom', newZoom);
        }
    };

    var clamp = function (value, minValue, maxValue) {
        return Math.min(Math.max(value, minValue), maxValue);
    };

    // Modify a frame using the specified handle
    var modifyFrame = function (handle, frame, mousePoint) {
        var imgWidth = imageWidth();
        var imgHeight = imageHeight();
        var imgLeft = imageLeft();
        var imgTop = imageTop();

        var realWidth = atlasImage.width;
        var realHeight = atlasImage.height;

        var p = mousePoint;

        var currentX = realWidth * (p.x - imgLeft) / imgWidth;
        if (currentX < 0 && startingHandleCoords.x <= 0) return;
        var currentY = realHeight * (p.y - imgTop) / imgHeight;
        if (currentY < 0 && startingHandleCoords.y <= 0) return;

        var dx = Math.floor(currentX - startingHandleCoords.x);
        var dy = Math.floor(currentY - startingHandleCoords.y);

        switch (handle) {
            case HANDLE.TOP_LEFT: {
                // limit x coord between image edges
                var x = clamp(startingHandleFrame.rect[0] + dx, 0, realWidth);
                dx = x - startingHandleFrame.rect[0];
                frame.rect[0] = startingHandleFrame.rect[0] + dx;
                // adjust width
                frame.rect[2] = startingHandleFrame.rect[2] - dx;
                // adjust height and limit between image edges
                frame.rect[3] = startingHandleFrame.rect[3] - dy;
                if (frame.rect[1] + frame.rect[3] > realHeight) {
                    frame.rect[3] = realHeight - frame.rect[1];
                }

                // if width became negative then make it positive and
                // adjust x coord, then switch handle to top right
                if (frame.rect[2] < 0) {
                    frame.rect[2] *= -1;
                    frame.rect[0] -= frame.rect[2];
                    setHandle(HANDLE.TOP_RIGHT, frame, p);
                }
                if (frame.rect[3] < 0) {
                    frame.rect[3] *= -1;
                    frame.rect[1] -= frame.rect[3];
                    setHandle(selectedHandle === HANDLE.TOP_RIGHT ? HANDLE.BOTTOM_RIGHT : HANDLE.BOTTOM_LEFT, frame, p);
                }

                // push right border if necessary
                if (frame.border[2] > frame.rect[2] - frame.border[0]) {
                    frame.border[2] = Math.max(frame.rect[2] - frame.border[0], 0);
                }

                // then push left border if necessary
                if (frame.border[0] > frame.rect[2] - frame.border[2]) {
                    frame.border[0] = Math.max(frame.rect[2] - frame.border[2], 0);
                }

                // push bottom border if necessary
                if (frame.border[1] > frame.rect[3] - frame.border[3]) {
                    frame.border[1] = Math.max(frame.rect[3] - frame.border[3], 0);
                }

                // then push top border if necessary
                if (frame.border[3] > frame.rect[3] - frame.border[1]) {
                    frame.border[3] = Math.max(frame.rect[3] - frame.border[1], 0);
                }

                break;
            }
            case HANDLE.TOP_RIGHT: {
                frame.rect[2] = startingHandleFrame.rect[2] + dx;
                frame.rect[3] = startingHandleFrame.rect[3] - dy;

                if (frame.rect[0] + frame.rect[2] > realWidth) {
                    frame.rect[2] = realWidth - frame.rect[0];
                }
                if (frame.rect[1] + frame.rect[3] > realHeight) {
                    frame.rect[3] = realHeight - frame.rect[1];
                }

                if (frame.rect[2] < 0) {
                    frame.rect[2] *= -1;
                    frame.rect[0] -= frame.rect[2];
                    setHandle(HANDLE.TOP_LEFT, frame, p);
                }
                if (frame.rect[3] < 0) {
                    frame.rect[3] *= -1;
                    frame.rect[1] -= frame.rect[3];
                    setHandle(selectedHandle === HANDLE.TOP_LEFT ? HANDLE.BOTTOM_LEFT : HANDLE.BOTTOM_RIGHT, frame, p);
                }

                if (frame.border[0] > frame.rect[2] - frame.border[2]) {
                    frame.border[0] = Math.max(frame.rect[2] - frame.border[2], 0);
                }

                if (frame.border[2] > frame.rect[2] - frame.border[0]) {
                    frame.border[2] = Math.max(frame.rect[2] - frame.border[0], 0);
                }

                if (frame.border[1] > frame.rect[3] - frame.border[3]) {
                    frame.border[1] = Math.max(frame.rect[3] - frame.border[3], 0);
                }

                if (frame.border[3] > frame.rect[3] - frame.border[1]) {
                    frame.border[3] = Math.max(frame.rect[3] - frame.border[1], 0);
                }

                break;
            }
            case HANDLE.BOTTOM_LEFT: {
                var x = clamp(startingHandleFrame.rect[0] + dx, 0, realWidth);
                dx = x - startingHandleFrame.rect[0];
                frame.rect[0] = startingHandleFrame.rect[0] + dx;
                frame.rect[2] = startingHandleFrame.rect[2] - dx;

                var y = clamp(startingHandleFrame.rect[1] - dy, 0, realHeight);
                dy = y - startingHandleFrame.rect[1];
                frame.rect[1] = startingHandleFrame.rect[1] + dy;
                frame.rect[3] = startingHandleFrame.rect[3] - dy;

                if (frame.rect[2] < 0) {
                    frame.rect[2] *= -1;
                    frame.rect[0] -= frame.rect[2];
                    setHandle(HANDLE.BOTTOM_RIGHT, frame, p);
                }
                if (frame.rect[3] < 0) {
                    frame.rect[3] *= -1;
                    frame.rect[1] -= frame.rect[3];
                    setHandle(selectedHandle === HANDLE.BOTTOM_RIGHT ? HANDLE.TOP_RIGHT : HANDLE.TOP_LEFT, frame, p);
                }

                if (frame.border[2] > frame.rect[2] - frame.border[0]) {
                    frame.border[2] = Math.max(frame.rect[2] - frame.border[0], 0);
                }

                if (frame.border[0] > frame.rect[2] - frame.border[2]) {
                    frame.border[0] = Math.max(frame.rect[2] - frame.border[2], 0);
                }

                if (frame.border[3] > frame.rect[3] - frame.border[1]) {
                    frame.border[3] = Math.max(frame.rect[3] - frame.border[1], 0);
                }

                if (frame.border[1] > frame.rect[3] - frame.border[3]) {
                    frame.border[1] = Math.max(frame.rect[3] - frame.border[3], 0);
                }

                break;
            }
            case HANDLE.BOTTOM_RIGHT: {
                frame.rect[2] = startingHandleFrame.rect[2] + dx;

                var y = clamp(startingHandleFrame.rect[1] - dy, 0, realHeight);
                dy = y - startingHandleFrame.rect[1];
                frame.rect[1] = startingHandleFrame.rect[1] + dy;
                frame.rect[3] = startingHandleFrame.rect[3] - dy;

                if (frame.rect[0] + frame.rect[2] > realWidth) {
                    frame.rect[2] = realWidth - frame.rect[0];
                }
                if (frame.rect[1] + frame.rect[3] > realHeight) {
                    frame.rect[3] = realHeight - frame.rect[1];
                }

                if (frame.rect[2] < 0) {
                    frame.rect[2] *= -1;
                    frame.rect[0] -= frame.rect[2];
                    setHandle(HANDLE.BOTTOM_LEFT, frame, p);
                }
                if (frame.rect[3] < 0) {
                    frame.rect[3] *= -1;
                    frame.rect[1] -= frame.rect[3];
                    setHandle(selectedHandle === HANDLE.BOTTOM_LEFT ? HANDLE.TOP_LEFT : HANDLE.TOP_RIGHT, frame, p);
                }

                if (frame.border[0] > frame.rect[2] - frame.border[2]) {
                    frame.border[0] = Math.max(frame.rect[2] - frame.border[2], 0);
                }

                if (frame.border[2] > frame.rect[2] - frame.border[0]) {
                    frame.border[2] = Math.max(frame.rect[2] - frame.border[0], 0);
                }

                if (frame.border[3] > frame.rect[3] - frame.border[1]) {
                    frame.border[3] = Math.max(frame.rect[3] - frame.border[1], 0);
                }

                if (frame.border[1] > frame.rect[3] - frame.border[3]) {
                    frame.border[1] = Math.max(frame.rect[3] - frame.border[3], 0);
                }

                break;
            }
            case HANDLE.RIGHT: {
                frame.rect[2] = startingHandleFrame.rect[2] + dx;

                if (frame.rect[0] + frame.rect[2] > realWidth) {
                    frame.rect[2] = realWidth - frame.rect[0];
                }

                if (frame.rect[2] < 0) {
                    frame.rect[2] *= -1;
                    frame.rect[0] -= frame.rect[2];
                    setHandle(HANDLE.LEFT, frame, p);
                }

                if (frame.border[0] > frame.rect[2] - frame.border[2]) {
                    frame.border[0] = Math.max(frame.rect[2] - frame.border[2], 0);
                }

                if (frame.border[2] > frame.rect[2] - frame.border[0]) {
                    frame.border[2] = Math.max(frame.rect[2] - frame.border[0], 0);
                }


                break;
            }
            case HANDLE.LEFT: {
                // limit x coord between image edges
                var x = clamp(startingHandleFrame.rect[0] + dx, 0, realWidth);
                dx = x - startingHandleFrame.rect[0];
                frame.rect[0] = startingHandleFrame.rect[0] + dx;
                // adjust width
                frame.rect[2] = startingHandleFrame.rect[2] - dx;

                // if width became negative then make it positive and
                // adjust x coord, then switch handle to top right
                if (frame.rect[2] < 0) {
                    frame.rect[2] *= -1;
                    frame.rect[0] -= frame.rect[2];
                    setHandle(HANDLE.RIGHT, frame, p);
                }

                // push right border if necessary
                if (frame.border[2] > frame.rect[2] - frame.border[0]) {
                    frame.border[2] = Math.max(frame.rect[2] - frame.border[0], 0);
                }

                // then push left border if necessary
                if (frame.border[0] > frame.rect[2] - frame.border[2]) {
                    frame.border[0] = Math.max(frame.rect[2] - frame.border[2], 0);
                }

                break;
            }
            case HANDLE.TOP: {
                // adjust height and limit between image edges
                frame.rect[3] = startingHandleFrame.rect[3] - dy;
                if (frame.rect[1] + frame.rect[3] > realHeight) {
                    frame.rect[3] = realHeight - frame.rect[1];
                }

                if (frame.rect[3] < 0) {
                    frame.rect[3] *= -1;
                    frame.rect[1] -= frame.rect[3];
                    setHandle(HANDLE.BOTTOM, frame, p);
                }

                // push bottom border if necessary
                if (frame.border[1] > frame.rect[3] - frame.border[3]) {
                    frame.border[1] = Math.max(frame.rect[3] - frame.border[3], 0);
                }

                // then push top border if necessary
                if (frame.border[3] > frame.rect[3] - frame.border[1]) {
                    frame.border[3] = Math.max(frame.rect[3] - frame.border[1], 0);
                }

                break;
            }
            case HANDLE.BOTTOM: {
                var y = clamp(startingHandleFrame.rect[1] - dy, 0, realHeight);
                dy = y - startingHandleFrame.rect[1];
                frame.rect[1] = startingHandleFrame.rect[1] + dy;
                frame.rect[3] = startingHandleFrame.rect[3] - dy;


                if (frame.rect[1] + frame.rect[3] > realHeight) {
                    frame.rect[3] = realHeight - frame.rect[1];
                }

                if (frame.rect[3] < 0) {
                    frame.rect[3] *= -1;
                    frame.rect[1] -= frame.rect[3];
                    setHandle(HANDLE.TOP, frame, p);
                }

                if (frame.border[3] > frame.rect[3] - frame.border[1]) {
                    frame.border[3] = Math.max(frame.rect[3] - frame.border[1], 0);
                }

                if (frame.border[1] > frame.rect[3] - frame.border[3]) {
                    frame.border[1] = Math.max(frame.rect[3] - frame.border[3], 0);
                }

                break;
            }
            case HANDLE.BORDER_TOP_LEFT: {
                frame.border[3] = Math.min(Math.max(startingHandleFrame.border[3] + dy, 0), frame.rect[3] - frame.border[1]);
                frame.border[0] = Math.min(Math.max(startingHandleFrame.border[0] + dx, 0), frame.rect[2] - frame.border[2]);
                break;
            }
            case HANDLE.BORDER_TOP: {
                frame.border[3] = Math.min(Math.max(startingHandleFrame.border[3] + dy, 0), frame.rect[3] - frame.border[1]);
                break;
            }
            case HANDLE.BORDER_TOP_RIGHT: {
                frame.border[2] = Math.min(Math.max(startingHandleFrame.border[2] - dx, 0), frame.rect[2] - frame.border[0]);
                frame.border[3] = Math.min(Math.max(startingHandleFrame.border[3] + dy, 0), frame.rect[3] - frame.border[1]);
                break;
            }
            case HANDLE.BORDER_LEFT: {
                frame.border[0] = Math.min(Math.max(startingHandleFrame.border[0] + dx, 0), frame.rect[2] - frame.border[2]);
                break;
            }
            case HANDLE.BORDER_RIGHT: {
                frame.border[2] = Math.min(Math.max(startingHandleFrame.border[2] - dx, 0), frame.rect[2] - frame.border[0]);
                break;
            }
            case HANDLE.BORDER_BOTTOM_LEFT: {
                frame.border[0] = Math.min(Math.max(startingHandleFrame.border[0] + dx, 0), frame.rect[2] - frame.border[2]);
                frame.border[1] = Math.min(Math.max(startingHandleFrame.border[1] - dy, 0), frame.rect[3] - frame.border[3]);
                break;
            }
            case HANDLE.BORDER_BOTTOM: {
                frame.border[1] = Math.min(Math.max(startingHandleFrame.border[1] - dy, 0), frame.rect[3] - frame.border[3]);
                break;
            }
            case HANDLE.BORDER_BOTTOM_RIGHT: {
                frame.border[2] = Math.min(Math.max(startingHandleFrame.border[2] - dx, 0), frame.rect[2] - frame.border[0]);
                frame.border[1] = Math.min(Math.max(startingHandleFrame.border[1] - dy, 0), frame.rect[3] - frame.border[3]);
                break;
            }
            case HANDLE.PIVOT: {
                var left = frameLeft(frame, imgLeft, imgWidth);
                var top = frameTop(frame, imgTop, imgHeight);
                var width = frameWidth(frame, imgWidth);
                var height = frameHeight(frame, imgHeight);
                frame.pivot[0] = clamp((p.x - left) / width, 0, 1);
                frame.pivot[1] = clamp(1 - (p.y - top) / height, 0, 1);
                break;
            }
            case HANDLE.FRAME: {
                frame.rect[0] = clamp(startingHandleFrame.rect[0] + (dx), 0, realWidth - frame.rect[2]);
                frame.rect[1] = clamp(startingHandleFrame.rect[1] - (dy), 0, realHeight - frame.rect[3]);
                break;
            }


        }
    };

    var setHandle = function (handle, frame, mousePoint) {
        selectedHandle = handle;
        if (handle) {
            // this frame will be used as the source frame
            // when calculating offsets in modifyFrame
            startingHandleFrame = utils.deepCopy(frame);

            // Store the real image coords of the mouse point
            // All offsets in modifyFrame will be calculated based on these coords
            if (mousePoint) {
                startingHandleCoords.x = clamp((mousePoint.x - imageLeft()) * atlasImage.width / imageWidth(), 0, atlasImage.width);
                startingHandleCoords.y = clamp((mousePoint.y - imageTop()) * atlasImage.height / imageHeight(), 0, atlasImage.height);
            }
        }

        updateCursor();
    }


    var startPanning = function (x, y) {
        panning = true;
        mouseX = x;
        mouseY = y;
        prevMouseX = x;
        prevMouseY = y;
        updateCursor();
    };

    var stopPanning = function () {
        panning = false;
        pivotX += pivotOffsetX;
        pivotY += pivotOffsetY;
        pivotOffsetX = 0;
        pivotOffsetY = 0;
        updateCursor();
    };

    controls.on('zoom:set', function (value, oldValue) {
        if (overlay.hidden) return;

        // store current zoom offset
        pivotX += zoomOffsetX;
        pivotY += zoomOffsetY;
        // reset current zoom offset
        zoomOffsetX = 0;
        zoomOffsetY = 0;

        var x = 0;
        var y = 0;

        // if the mouse cursor is not on the canvas
        // then use canvas center point as zoom pivot
        var canvasRect = canvas.element.getBoundingClientRect();
        if (mouseX < canvasRect.left || mouseX > canvasRect.right ||
            mouseY < canvasRect.top || mouseY > canvasRect.bottom) {
            x = canvas.width / 2;
            y = canvas.height / 2;
        } else {
            x = mouseX - canvasRect.left;
            y = mouseY - canvasRect.top;
        }

        // calculate zoom difference percentage
        var zoomDiff = (value - oldValue);
        var z = zoomDiff / oldValue;

        // calculate zoom offset based on the current zoom pivot
        zoomOffsetX = -z * (x - imageLeft()) / canvas.width;
        zoomOffsetY = -z * (y - imageTop()) / canvas.height;

        // re-render
        queueRender();
    });

    var queueRender = function () {
        if (queuedRender || overlay.hidden) return;
        queuedRender = true;
        requestAnimationFrame(renderCanvas);
    };

    var renderCanvas = function () {
        queuedRender = false;

        if (overlay.hidden) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!atlasImageLoaded) return;

        var selected = editor.call('picker:sprites:selectedFrame');

        // clear selection if no longer exists
        if (selected && !atlasAsset.has('data.frames.' + selected)) {
            selected = editor.call('picker:sprites:selectFrames', null);
        }

        var left = imageLeft();
        var top = imageTop();
        var width = imageWidth();
        var height = imageHeight();

        var highlightedFrames = editor.call('picker:sprites:highlightedFrames');
        var newSpriteFrames = editor.call('picker:sprites:newSpriteFrames');
        var spriteAsset = editor.call('picker:sprites:selectedSprite');

        // disable smoothing
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;

        // draw background outside image
        ctx.fillStyle = COLOR_DARKEST;
        // left
        ctx.fillRect(0, 0, left, canvas.height);
        // top
        ctx.fillRect(0, 0, canvas.width, top);
        // right
        ctx.fillRect(left + width, 0, canvas.width - left - width, canvas.height);
        // bottom
        ctx.fillRect(0, top + height, canvas.width, canvas.height - top - height);

        // draw image
        ctx.drawImage(
            atlasImage,
            0, 0,
            atlasImage.width, atlasImage.height,
            left, top, width, height
        );

        // scroll checkerboard pattern
        var checkLeft = left;
        var checkTop = top;
        canvas.style.backgroundPosition = checkLeft + 'px ' + checkTop + 'px, ' + (checkLeft + 12) + 'px ' + (checkTop + 12) + 'px';

        // draw frames
        var frames = atlasAsset.getRaw('data.frames')._data;
        ctx.beginPath();
        ctx.strokeStyle = COLOR_GRAY;
        ctx.lineWidth = 1;
        for (var key in frames) {
            if (highlightedFrames.indexOf(key) !== -1 || newSpriteFrames.indexOf(key) !== -1) continue;

            renderFrame(frames[key]._data, left, top, width, height);
        }
        ctx.stroke();

        // draw highlighted frames
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = spriteAsset ? COLOR_ORANGE : COLOR_DARK;
        for (var i = 0, len = highlightedFrames.length; i < len; i++) {
            var key = highlightedFrames[i];
            if (selected && selected === key) continue;

            // check if frame no longer exists
            if (!frames[key]) {
                highlightedFrames.splice(i, 1);
                len--;
                i--;
            } else {
                if (newSpriteFrames.indexOf(key) === -1) {
                    renderFrame(frames[key]._data, left, top, width, height, 0, !spriteEditMode);
                }
            }
        }
        ctx.stroke();

        // draw sprite edit mode frames
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = COLOR_DARK;
        for (var i = 0, len = newSpriteFrames.length; i < len; i++) {
            var key = newSpriteFrames[i];

            // check if frame no longer exists
            if (!frames[key]) {
                newSpriteFrames.splice(i, 1);
                len--;
                i--;
            } else {
                renderFrame(frames[key]._data, left, top, width, height, 0, !spriteEditMode);
            }
        }
        ctx.stroke();

        // render border lines
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.setLineDash([4]);
        if (!spriteEditMode) {
            for (var i = 0, len = highlightedFrames.length; i < len; i++) {
                var key = highlightedFrames[i];
                if (selected && selected === key) continue;
                renderBorderLines(frames[key]._data, left, top, width, height);
            }
        }
        ctx.stroke();
        ctx.setLineDash([]);

        var frame;

        // render hovered frame
        if (hoveredFrame) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.fillStyle = COLOR_TRANSPARENT_ORANGE;
            frame = atlasAsset.getRaw('data.frames.' + hoveredFrame);
            if (frame) {
                frame = frame._data;
                renderFrame(frame, left, top, width, height, 1);
            }
            ctx.fill();
        }

        frame = newFrame || (selected ? atlasAsset.getRaw('data.frames.' + selected) : null);
        if (frame && frame._data)
            frame = frame._data;

        if (frame) {
            ctx.beginPath();
            ctx.strokeStyle = COLOR_DARK;

            // draw newFrame or selected frame
            if (frame !== newFrame || newFrame.rect[2] !== 0 && newFrame.rect[3] !== 0) {
                renderFrame(frame, left, top, width, height);
            }

            ctx.stroke();

            // draw handles
            if (frame !== newFrame)
                renderHandles(frame, left, top, width, height);
        }
    };

    var renderFrame = function (frame, left, top, width, height, offset, renderPivot) {
        var x = frameLeft(frame, left, width);
        var y = frameTop(frame, top, height);
        var w = frameWidth(frame, width);
        var h = frameHeight(frame, height);

        offset = offset || 0;

        // render rect
        ctx.moveTo(x - offset, y - offset);
        ctx.lineTo(x - offset, y + offset + h);
        ctx.lineTo(x + offset + w, y + offset + h);
        ctx.lineTo(x + offset + w, y - offset);
        ctx.lineTo(x - offset, y - offset);

        if (renderPivot) {
            // render pivot
            var px = x + frame.pivot[0] * w;
            var py = y + (1 - frame.pivot[1]) * h;
            ctx.moveTo(px, py);
            ctx.arc(px, py, pivotWidth, 0, 2 * Math.PI);
        }
    };

    var renderBorderLines = function (frame, left, top, width, height) {
        var x = frameLeft(frame, left, width);
        var y = frameTop(frame, top, height);
        var w = frameWidth(frame, width);
        var h = frameHeight(frame, height);

        var borderWidthModifier = width / atlasImage.width;
        var borderHeightModifier = height / atlasImage.height;
        var lb = x + frame.border[0] * borderWidthModifier;
        var bb = y + h - frame.border[1] * borderHeightModifier;
        var rb = x + w - frame.border[2] * borderWidthModifier;
        var tb = y + frame.border[3] * borderHeightModifier;

        // left line
        if (frame.border[0]) {
            ctx.moveTo(lb, y);
            ctx.lineTo(lb, y + h);
        }

        // right line
        if (frame.border[2]) {
            ctx.moveTo(rb, y);
            ctx.lineTo(rb, y + h);
        }

        // bottom line
        if (frame.border[1]) {
            ctx.moveTo(x, bb);
            ctx.lineTo(x + w, bb);
        }

        // top line
        if (frame.border[3]) {
            ctx.moveTo(x, tb);
            ctx.lineTo(x + w, tb);
        }
    };

    var renderHandles = function (frame, left, top, width, height) {
        var x = frameLeft(frame, left, width);
        var y = frameTop(frame, top, height);
        var w = frameWidth(frame, width);
        var h = frameHeight(frame, height);
        var px = x + frame.pivot[0] * w;
        var py = y + (1 - frame.pivot[1]) * h;
        var i;

        ctx.fillStyle = COLOR_BLUE;
        ctx.strokeStyle = COLOR_BLUE;
        ctx.lineWidth = 1;

        var borderWidthModifier = width / atlasImage.width;
        var borderHeightModifier = height / atlasImage.height;
        var lb = x + frame.border[0] * borderWidthModifier;
        var bb = y + h - frame.border[1] * borderHeightModifier;
        var rb = x + w - frame.border[2] * borderWidthModifier;
        var tb = y + frame.border[3] * borderHeightModifier;

        // border lines
        ctx.beginPath();
        ctx.setLineDash([4]);

        // left line
        if (frame.border[0]) {
            ctx.moveTo(lb, y);
            ctx.lineTo(lb, y + h);
        }

        // right line
        if (frame.border[2]) {
            ctx.moveTo(rb, y);
            ctx.lineTo(rb, y + h);
        }

        // bottom line
        if (frame.border[1]) {
            ctx.moveTo(x, bb);
            ctx.lineTo(x + w, bb);
        }

        // top line
        if (frame.border[3]) {
            ctx.moveTo(x, tb);
            ctx.lineTo(x + w, tb);
        }

        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = COLOR_DARK;
        ctx.fillStyle = COLOR_GREEN;
        ctx.lineWidth = 1;

        // top left corner
        ctx.fillRect(
            x - handleWidth / 2,
            y - handleWidth / 2,
            handleWidth,
            handleWidth
        );

        ctx.strokeRect(
            x - handleWidth / 2,
            y - handleWidth / 2,
            handleWidth,
            handleWidth
        );
        // top right corner
        ctx.fillRect(
            x + w - handleWidth / 2,
            y - handleWidth / 2,
            handleWidth,
            handleWidth
        );

        ctx.strokeRect(
            x + w - handleWidth / 2,
            y - handleWidth / 2,
            handleWidth,
            handleWidth
        );

        // bottom left corner
        ctx.fillRect(
            x - handleWidth / 2,
            y + h - handleWidth / 2,
            handleWidth,
            handleWidth
        );

        ctx.strokeRect(
            x - handleWidth / 2,
            y + h - handleWidth / 2,
            handleWidth,
            handleWidth
        );
        // bottom right corner
        ctx.fillRect(
            x + w - handleWidth / 2,
            y + h - handleWidth / 2,
            handleWidth,
            handleWidth
        );

        ctx.strokeRect(
            x + w - handleWidth / 2,
            y + h - handleWidth / 2,
            handleWidth,
            handleWidth
        );


        ctx.fillStyle = COLOR_BLUE;
        ctx.strokeStyle = COLOR_DARK;

        // left border
        ctx.fillRect(
            lb - handleWidth / 2,
            (bb + tb) / 2 - handleWidth / 2,
            handleWidth,
            handleWidth
        );
        ctx.strokeRect(
            lb - handleWidth / 2,
            (bb + tb) / 2 - handleWidth / 2,
            handleWidth,
            handleWidth
        );


        // bottom border
        ctx.fillRect(
            (lb + rb) / 2 - handleWidth / 2,
            bb - handleWidth / 2,
            handleWidth,
            handleWidth
        );
        ctx.strokeRect(
            (lb + rb) / 2 - handleWidth / 2,
            bb - handleWidth / 2,
            handleWidth,
            handleWidth
        );

        // right border
        ctx.fillRect(
            rb - handleWidth / 2,
            (bb + tb) / 2 - handleWidth / 2,
            handleWidth,
            handleWidth
        );
        ctx.strokeRect(
            rb - handleWidth / 2,
            (bb + tb) / 2 - handleWidth / 2,
            handleWidth,
            handleWidth
        );

        // top border
        ctx.fillRect(
            (lb + rb) / 2 - handleWidth / 2,
            tb - handleWidth / 2,
            handleWidth,
            handleWidth
        );
        ctx.strokeRect(
            (lb + rb) / 2 - handleWidth / 2,
            tb - handleWidth / 2,
            handleWidth,
            handleWidth
        );

        // bottom left border
        if (frame.border[0] || frame.border[1]) {
            ctx.fillRect(
                lb - handleWidth / 2,
                bb - handleWidth / 2,
                handleWidth,
                handleWidth
            );
            ctx.strokeRect(
                lb - handleWidth / 2,
                bb - handleWidth / 2,
                handleWidth,
                handleWidth
            );
        }

        // bottom right border
        if (frame.border[1] || frame.border[2]) {
            ctx.fillRect(
                rb - handleWidth / 2,
                bb - handleWidth / 2,
                handleWidth,
                handleWidth
            );
            ctx.strokeRect(
                rb - handleWidth / 2,
                bb - handleWidth / 2,
                handleWidth,
                handleWidth
            );
        }


        // top right border
        if (frame.border[2] || frame.border[3]) {
            ctx.fillRect(
                rb - handleWidth / 2,
                tb - handleWidth / 2,
                handleWidth,
                handleWidth
            );
            ctx.strokeRect(
                rb - handleWidth / 2,
                tb - handleWidth / 2,
                handleWidth,
                handleWidth
            );
        }

        // top left border
        if (frame.border[3] || frame.border[0]) {
            ctx.fillRect(
                lb - handleWidth / 2,
                tb - handleWidth / 2,
                handleWidth,
                handleWidth
            );
            ctx.strokeRect(
                lb - handleWidth / 2,
                tb - handleWidth / 2,
                handleWidth,
                handleWidth
            );
        }

        // pivot
        ctx.beginPath();

        // border
        ctx.lineWidth = 5;
        ctx.strokeStyle = COLOR_DARK;
        ctx.moveTo(px + pivotWidth, py);
        ctx.arc(px, py, pivotWidth, 0, 2 * Math.PI);
        ctx.stroke();

        // inside border
        ctx.lineWidth = 3;
        ctx.strokeStyle = COLOR_GREEN;
        ctx.stroke();
    };

    var updateRightPanel = function () {
        if (!rightPanel) {
            rightPanel = new ui.Panel();
            rightPanel.class.add('right-panel');
            rightPanel.class.add('attributes');
            rightPanel.flexShrink = false;
            rightPanel.style.width = '320px';
            rightPanel.innerElement.style.width = '320px';
            rightPanel.horizontal = true;
            rightPanel.foldable = true;
            rightPanel.scroll = true;
            rightPanel.resizable = 'left';
            rightPanel.resizeMin = 256;
            rightPanel.resizeMax = 512;
            panel.append(rightPanel);
        } else {
            // emit 'clear' event to clear existing children of right panel
            rightPanel.emit('clear');
        }

        if (!atlasImageLoaded) return;

        var spriteAsset = editor.call('picker:sprites:selectedSprite');

        if (spriteAsset) {
            editor.call('picker:sprites:attributes:sprite', { atlasAsset: atlasAsset, atlasImage: atlasImage, spriteAsset: spriteAsset });
        } else {
            var highlightedFrames = editor.call('picker:sprites:highlightedFrames');
            if (highlightedFrames.length) {
                editor.call('picker:sprites:attributes:frames', { atlasAsset: atlasAsset, atlasImage: atlasImage, frames: highlightedFrames });
                editor.call('picker:sprites:attributes:frames:relatedSprites', { atlasAsset: atlasAsset, frames: highlightedFrames });
            } else {
                editor.call('picker:sprites:attributes:atlas', atlasAsset);
                editor.call('picker:sprites:attributes:slice', { atlasAsset: atlasAsset, atlasImage: atlasImage, atlasImageData: atlasImageData });
                editor.call('picker:sprites:attributes:importFrames', { atlasAsset: atlasAsset });
            }
        }
    };

    var rectContainsPoint = function (p, left, top, width, height) {
        return left <= p.x && left + width >= p.x && top <= p.y && top + height >= p.y;
    };

    var framesHitTest = function (p) {
        var imgWidth = imageWidth();
        var imgHeight = imageHeight();
        var imgLeft = imageLeft();
        var imgTop = imageTop();

        var frames = atlasAsset.getRaw('data.frames')._data;
        for (var key in frames) {
            var frame = frames[key]._data;
            var left = frameLeft(frame, imgLeft, imgWidth);
            var top = frameTop(frame, imgTop, imgHeight);
            var width = frameWidth(frame, imgWidth);
            var height = frameHeight(frame, imgHeight);

            if (rectContainsPoint(p, left, top, width, height)) {
                return key;
            }
        }

        return null;
    };

    var handlesHitTest = function (p, frame) {
        if (! editor.call('permissions:write')) return false;

        var imgWidth = imageWidth();
        var imgHeight = imageHeight();
        var imgLeft = imageLeft();
        var imgTop = imageTop();

        var left = frameLeft(frame, imgLeft, imgWidth);
        var top = frameTop(frame, imgTop, imgHeight);
        var width = frameWidth(frame, imgWidth);
        var height = frameHeight(frame, imgHeight);

        var borderWidthModifier = imgWidth / atlasImage.width;
        var borderHeightModifier = imgHeight / atlasImage.height;
        var lb = left + frame.border[0] * borderWidthModifier;
        var bb = top + height - frame.border[1] * borderHeightModifier;
        var rb = left + width - frame.border[2] * borderWidthModifier;
        var tb = top + frame.border[3] * borderHeightModifier;

        // pivot
        var pivotX = left + frame.pivot[0] * width;
        var pivotY = top + (1 - frame.pivot[1]) * height;
        var distFromCenter = Math.sqrt((p.x - pivotX) * (p.x - pivotX) + (p.y - pivotY) * (p.y - pivotY));
        if (distFromCenter < pivotWidth + 1 && distFromCenter > pivotWidth - 3) {
            return HANDLE.PIVOT;
        }

        // top left border
        if (frame.border[0] || frame.border[3]) {
            if (rectContainsPoint(p, lb - handleWidth / 2, tb - handleWidth / 2, handleWidth, handleWidth)) {
                return HANDLE.BORDER_TOP_LEFT;
            }
        }

        // top border
        if (rectContainsPoint(p, (lb + rb) / 2 - handleWidth / 2, tb - handleWidth / 2, handleWidth, handleWidth)) {
            return HANDLE.BORDER_TOP;
        }

        // top right border
        if (frame.border[2] || frame.border[3]) {
            if (rectContainsPoint(p, rb - handleWidth / 2, tb - handleWidth / 2, handleWidth, handleWidth)) {
                return HANDLE.BORDER_TOP_RIGHT;
            }
        }

        // left border
        if (rectContainsPoint(p, lb - handleWidth / 2, (bb + tb) / 2 - handleWidth / 2, handleWidth, handleWidth)) {
            return HANDLE.BORDER_LEFT;
        }

        // right border
        if (rectContainsPoint(p, rb - handleWidth / 2, (bb + tb) / 2 - handleWidth / 2, handleWidth, handleWidth)) {
            return HANDLE.BORDER_RIGHT;
        }

        // bottom left border
        if (frame.border[0] || frame.border[1]) {
            if (rectContainsPoint(p, lb - handleWidth / 2, bb - handleWidth / 2, handleWidth, handleWidth)) {
                return HANDLE.BORDER_BOTTOM_LEFT;
            }
        }

        // bottom border
        if (rectContainsPoint(p, (lb + rb) / 2 - handleWidth / 2, bb - handleWidth / 2, handleWidth, handleWidth)) {
            return HANDLE.BORDER_BOTTOM;
        }

        // bottom right border
        if (frame.border[1] || frame.border[2]) {
            if (rectContainsPoint(p, rb - handleWidth / 2, bb - handleWidth / 2, handleWidth, handleWidth)) {
                return HANDLE.BORDER_BOTTOM_RIGHT;
            }
        }

        // top left corner
        if (rectContainsPoint(p, left - handleWidth / 2, top - handleWidth / 2, handleWidth, handleWidth)) {
            return HANDLE.TOP_LEFT;
        }
        // top right corner
        if (rectContainsPoint(p, left + width - handleWidth / 2, top - handleWidth / 2, handleWidth, handleWidth)) {
            return HANDLE.TOP_RIGHT;
        }
        // bottom left corner
        if (rectContainsPoint(p, left - handleWidth / 2, top + height - handleWidth / 2, handleWidth, handleWidth)) {
            return HANDLE.BOTTOM_LEFT;
        }
        // bottom right corner
        if (rectContainsPoint(p, left + width - handleWidth / 2, top + height - handleWidth / 2, handleWidth, handleWidth)) {
            return HANDLE.BOTTOM_RIGHT;
        }

        // left border edge
        if (frame.border[0]) {
            if (rectContainsPoint(p, lb - handleWidth / 2, top + handleWidth / 2, handleWidth, height - handleWidth)) {
                return HANDLE.BORDER_LEFT;
            }
        }
        // right border edge
        if (frame.border[2]) {
            if (rectContainsPoint(p, rb - handleWidth / 2, top + handleWidth / 2, handleWidth, height - handleWidth)) {
                return HANDLE.BORDER_RIGHT;
            }
        }
        // bottom border edge
        if (frame.border[1]) {
            if (rectContainsPoint(p, left + handleWidth / 2, bb - handleWidth / 2, width - handleWidth, handleWidth)) {
                return HANDLE.BORDER_BOTTOM;
            }
        }
        // top border edge
        if (frame.border[3]) {
            if (rectContainsPoint(p, left + handleWidth / 2, tb - handleWidth / 2, width - handleWidth, handleWidth)) {
                return HANDLE.BORDER_TOP;
            }
        }

        // left edge
        if (rectContainsPoint(p, left - handleWidth / 2, top + handleWidth / 2, handleWidth, height - handleWidth)) {
            return HANDLE.LEFT;
        }
        // right edge
        if (rectContainsPoint(p, left + width - handleWidth / 2, top + handleWidth / 2, handleWidth, height - handleWidth)) {
            return HANDLE.RIGHT;
        }
        // top edge
        if (rectContainsPoint(p, left + handleWidth / 2, top - handleWidth / 2, width - handleWidth, handleWidth)) {
            return HANDLE.TOP;
        }
        // bottom edge
        if (rectContainsPoint(p, left + handleWidth / 2, top + height - handleWidth / 2, width - handleWidth, handleWidth)) {
            return HANDLE.BOTTOM;
        }

        // frame
        if (rectContainsPoint(p, left, top, width, height)) {
            return HANDLE.FRAME;
        }

        return null;
    };


    var showEditor = function (asset) {
        var _spriteAsset = null;
        if (asset.get('type') === 'textureatlas') {
            atlasAsset = asset;
        } else if (asset.get('type') === 'sprite') {
            atlasAsset = editor.call('assets:get', asset.get('data.textureAtlasAsset'));
            _spriteAsset = asset;
        } else {
            atlasAsset = null;
        }

        if (!atlasAsset)
            return;

        panel.header = 'SPRITE EDITOR - ' + atlasAsset.get('name').toUpperCase();

        // show overlay
        overlay.hidden = false;

        atlasImageLoaded = false;
        atlasImage.onload = function () {
            atlasImageLoaded = true;

            // get image data
            atlasImageDataCanvas.width = atlasImage.width;
            atlasImageDataCanvas.height = atlasImage.height;
            atlasImageDataCanvas.getContext('2d').drawImage(atlasImage, 0, 0, atlasImage.width, atlasImage.height);
            atlasImageData = atlasImageDataCanvas.getContext('2d').getImageData(0, 0, atlasImage.width, atlasImage.height);

            aspectRatio = atlasImage.width / atlasImage.height;

            editor.call('picker:sprites:frames', { atlasAsset: atlasAsset });
            editor.call('picker:sprites:spriteassets', { atlasAsset: atlasAsset });
            editor.emit('picker:sprites:open');

            if (_spriteAsset) {
                editor.call('picker:sprites:selectSprite', _spriteAsset);
            } else {
                updateRightPanel();
                renderCanvas();
            }

        };
        atlasImage.src = atlasAsset.get('file.url').appendQuery('t=' + atlasAsset.get('file.hash'));

        // listen to atlas changes and render
        events.push(atlasAsset.on('*:set', queueRender));
        events.push(atlasAsset.on('*:unset', queueRender));
        events.push(atlasAsset.on('name:set', function (value) {
            panel.header = 'SPRITE EDITOR - ' + value.toUpperCase();
        }));

        // resize 20 times a second - if size is the same nothing will happen
        if (resizeInterval) {
            clearInterval(resizeInterval);
        }
        resizeInterval = setInterval(function () {
            if (resizeCanvas()) {
                queueRender();
            }
        }, 1000 / 60);

        resizeCanvas();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        updateRightPanel();

        registerInputListeners();

        // clear current selection so that we don't
        // accidentally delete any selected assets when pressing delete
        editor.call('selector:history', false);
        editor.call('selector:clear');
        // restore selector history in a timeout
        // because selector:clear emits a history
        // event also in a timeout... annoying
        setTimeout(function () {
            editor.call('selector:history', true);
        });
    };

    var updateCursor = function () {
        var cls = middlePanel.class;

        cls.remove('ew-resize');
        cls.remove('ns-resize');
        cls.remove('nwse-resize');
        cls.remove('nesw-resize');
        cls.remove('move');
        cls.remove('grab');
        cls.remove('grabbing');


        if ((panning || shiftDown) && !selectedHandle) {
            if (panning) {
                cls.add('grabbing');
            } else if (shiftDown) {
                cls.add('grab');
            }
        } else {
            var handle = selectedHandle !== null ? selectedHandle : hoveringHandle;
            if (handle !== null) {
                switch (handle) {
                    case HANDLE.LEFT:
                    case HANDLE.RIGHT:
                    case HANDLE.BORDER_LEFT:
                    case HANDLE.BORDER_RIGHT:
                        cls.add('ew-resize');
                        break;

                    case HANDLE.TOP:
                    case HANDLE.BOTTOM:
                    case HANDLE.BORDER_TOP:
                    case HANDLE.BORDER_BOTTOM:
                        cls.add('ns-resize');
                        break;

                    case HANDLE.TOP_LEFT:
                    case HANDLE.BOTTOM_RIGHT:
                    case HANDLE.BORDER_TOP_LEFT:
                    case HANDLE.BORDER_BOTTOM_RIGHT:
                        cls.add('nwse-resize');
                        break;

                    case HANDLE.TOP_RIGHT:
                    case HANDLE.BOTTOM_LEFT:
                    case HANDLE.BORDER_TOP_RIGHT:
                    case HANDLE.BORDER_BOTTOM_LEFT:
                        cls.add('nesw-resize');
                        break;

                    case HANDLE.PIVOT:
                        if (handle === selectedHandle) {
                            cls.add('grabbing');
                        } else {
                            cls.add('grab');
                        }
                        break;

                    case HANDLE.FRAME:
                        cls.add('move');
                        break;
                }
            }
        }
    };

    var cleanUp = function () {
        // reset controls
        controls.set('zoom', 1);
        controls.set('brightness', 100);

        resetControls();

        if (resizeInterval) {
            clearInterval(resizeInterval);
            resizeInterval = null;
        }

        // destroy right panel
        if (rightPanel) {
            rightPanel.emit('clear');
            rightPanel.destroy();
            rightPanel = null;
        }

        leftPanel.emit('clear');
        bottomPanel.emit('clear');

        newFrame = null;
        hoveredFrame = null;
        startingHandleFrame = null;
        hoveringHandle = null;
        selectedHandle = null;
        atlasImageData = null;
        atlasImageDataCanvas.getContext('2d').clearRect(0, 0, atlasImageDataCanvas.width, atlasImageDataCanvas.height);

        if (atlasImage) {
            atlasImage.onload = null;
        }

        atlasImage = new Image();

        leftButtonDown = false;
        rightButtonDown = false;
        shiftDown = false;

        if (spriteEditMode) {
            editor.call('picker:sprites:pickFrames:cancel');
        }

        atlasAsset = null;

        middlePanel.class.remove('grab');
        middlePanel.class.remove('grabbing');

        for (var i = 0; i < events.length; i++) {
            events[i].unbind();
        }
        events.length = 0;

        unregisterInputListeners();

        editor.emit('picker:sprites:close');
    };

    // Return canvas
    editor.method('picker:sprites:canvas', function () {
        return canvas.element;
    });

    // Return left panel
    editor.method('picker:sprites:leftPanel', function () {
        return leftPanel;
    });

    // Return right panel
    editor.method('picker:sprites:rightPanel', function () {
        return rightPanel;
    });

    // Return main panel
    editor.method('picker:sprites:mainPanel', function () {
        return panel;
    });

    // Return bottom panel
    editor.method('picker:sprites:bottomPanel', function () {
        return bottomPanel;
    });

    // Return atlas asset
    editor.method('picker:sprites:atlasAsset', function () {
        return atlasAsset;
    });

    // Return atlas image
    editor.method('picker:sprites:atlasImage', function () {
        return atlasImage;
    });

    // Return atlas image data
    editor.method('picker:sprites:atlasImageData', function () {
        return atlasImageData;
    });

    // Return sprite editor controls
    editor.method('picker:sprites:controls', function () {
        return controls;
    });

    editor.method('picker:sprites:hoverFrame', function (frameKey) {
        hoveredFrame = frameKey;
        queueRender();
    });

    // Queue re-render
    editor.method('picker:sprites:queueRender', queueRender);

    // Focus the selected frame if one exists otherwise resets view
    editor.method('picker:sprites:focus', function () {
        var selected = editor.call('picker:sprites:selectedFrame');
        // if we have a selected frame then focus on that
        // otherwise completely reset view
        if (selected) {
            var frame = atlasAsset.getRaw('data.frames.' + selected)._data;

            // these are derived by solving the equations so that frameLeft + frameWidth / 2 === canvas.width / 2
            // and frameTop + frameHeight / 2 === canvas.height / 2
            var frameWidthPercentage = (frame.rect[0] + frame.rect[2] / 2) / atlasImage.width;
            var imageWidthPercentage = imageWidth() / canvas.width;

            var frameHeightPercentage = (atlasImage.height - frame.rect[1] - frame.rect[3] * 0.5) / atlasImage.height;
            var imageHeightPercentage = imageHeight() / canvas.height;

            // set pivotX and pivotY and zero out the other offsets
            pivotX = 0.5 - frameWidthPercentage * imageWidthPercentage;
            pivotY = 0.5 - frameHeightPercentage * imageHeightPercentage;
            zoomOffsetX = 0;
            pivotOffsetX = 0;
            zoomOffsetY = 0;
            pivotOffsetY = 0;

        } else {
            resetControls();
        }
        queueRender();
    });

    // Update inspector when selection changes
    editor.on('picker:sprites:framesSelected', function () {
        hoveringHandle = null;
        setHandle(null);
        updateCursor();

        if (!spriteEditMode) {
            updateRightPanel();
        }

        queueRender();
    });

    // Track sprite edit mode
    editor.on('picker:sprites:pickFrames:start', function () {
        spriteEditMode = true;
        queueRender();
    });

    editor.on('picker:sprites:pickFrames:end', function () {
        spriteEditMode = false;
        queueRender();
    });

    // open Sprite Editor (undoable)
    editor.method('picker:sprites', function (asset) {
        editor.call('history:add', {
            name: 'open sprite editor',
            undo: function () {
                overlay.hidden = true;
            },
            redo: function () {
                var currentAsset = editor.call('assets:get', asset.get('id'));
                if (!currentAsset) return;

                showEditor(currentAsset);
            }
        });

        showEditor(asset);
    });

    // Close Sprite Editor (undoable)
    editor.method('picker:sprites:close', function () {
        overlay.hidden = true;
    });

    overlay.on('show', function () {
        // editor-blocking picker opened
        editor.emit('picker:open', 'sprite-editor');
    })

    // Clean up
    overlay.on('hide', function () {
        if (!suspendCloseUndo) {
            var currentAsset = atlasAsset;

            editor.call('history:add', {
                name: 'close sprite editor',
                undo: function () {
                    var asset = editor.call('assets:get', currentAsset.get('id'));
                    if (!asset) return;

                    showEditor(asset);
                },
                redo: function () {
                    suspendCloseUndo = true;
                    overlay.hidden = true;
                    suspendCloseUndo = false;
                }
            });
        }

        cleanUp();

        // editor-blocking picker closed
        editor.emit('picker:close', 'sprite-editor');
    });
});


/* editor/pickers/sprite-editor/sprite-editor-frames-panel.js */
editor.once('load', function() {
    'use strict';

    editor.method('picker:sprites:frames', function(args) {
        var events = [];

        var atlasAsset = args.atlasAsset;

        var panels = {};
        var selectedKeys = [];
        var spriteEditModeKeys = [];
        var spriteEditMode = false;
        var selectedSprite = null;

        var shiftDown = false;
        var ctrlDown = false;

        var scrollSelectionIntoView = true;

        var leftPanel = editor.call('picker:sprites:leftPanel');
        leftPanel.header = 'FRAMES IN TEXTURE ATLAS';

        var panelFrames = editor.call('attributes:addPanel', {
            parent: leftPanel
        });

        // var panelFrames = new ui.Panel();
        panelFrames.scroll = true;
        panelFrames.class.add('frames');
        // panel.append(panelFrames);

        var addFramePanel = function (key, frame, afterPanel, beforePanel) {
            var frameEvents = [];

            var panel = new ui.Panel();
            panel.class.add('frame');
            panel.frameKey = key;

            panels[key] = panel;

            // preview
            var canvas = new ui.Canvas();
            var previewWidth = 26;
            var previewHeight = 26;
            canvas.class.add('preview');
            canvas.resize(previewWidth, previewHeight);

            panel.append(canvas);

            var renderQueued = false;

            panel.queueRender = function () {
                if (renderQueued) return;
                renderQueued = true;
                requestAnimationFrame(renderPreview);
            };

            var renderPreview = function () {
                editor.call('picker:sprites:renderFramePreview', frame, canvas.element);
                renderQueued = false;
            };

            renderPreview();

            // sprite name
            var fieldName = new ui.Label();
            fieldName.class.add('name');
            fieldName.value = frame.name;
            panel.append(fieldName);

            frameEvents.push(atlasAsset.on('data.frames.' + key + '.name:set', function (value) {
                fieldName.value = value;
            }));

            // remove frame
            var btnRemove = new ui.Button();
            btnRemove.class.add('remove');
            panel.append(btnRemove);

            btnRemove.disabled = ! editor.call('permissions:write');

            frameEvents.push(editor.on('permissions:writeState', function (canWrite) {
                btnRemove.disabled = ! canWrite;
            }));

            btnRemove.on('click', function (e) {
                e.stopPropagation();
                editor.call('picker:sprites:deleteFrames', [key], {
                    history: true
                });
            });

            panel.on('click', function () {
                scrollSelectionIntoView = false;

                if (shiftDown) {
                    // if another frame was selected then add range to selection
                    var keys = spriteEditMode ? spriteEditModeKeys : selectedKeys;
                    var len = keys.length;
                    if (len) {
                        var diff = parseInt(key, 10) - parseInt(keys[len-1], 10);
                        var dir = diff < 0 ? -1 : 1;
                        var p = panels[keys[len-1]];
                        var range = [];
                        while (diff !== 0) {
                            p = dir > 0 ? p.element.nextSibling : p.element.previousSibling;
                            if (! p) break;
                            p = p.ui;

                            range.push(p.frameKey);

                            if (p.frameKey === key)
                                break;

                            diff -= dir;
                        }

                        if (range.length) {
                            editor.call('picker:sprites:selectFrames', range, {
                                add: true,
                                history: true,
                                clearSprite: !spriteEditMode
                            });
                        }
                    } else {
                        // otherwise just select single frame
                        editor.call('picker:sprites:selectFrames', key, {
                            history: true,
                            clearSprite: !spriteEditMode
                        });
                    }
                } else if (ctrlDown) {
                    // if not selected add frame to selection
                    var keys = spriteEditMode ? spriteEditModeKeys : selectedKeys;
                    var idx = keys.indexOf(key);
                    if (idx === -1) {
                        editor.call('picker:sprites:selectFrames', key, {
                            add: true,
                            history: true,
                            clearSprite: !spriteEditMode
                        });
                    } else {
                        // if selected remove from selection
                        keys.splice(idx, 1);
                        editor.call('picker:sprites:selectFrames', keys, {
                            history: true,
                            clearSprite: !spriteEditMode
                        });
                    }

                } else {
                    // select single frame
                    editor.call('picker:sprites:selectFrames', key, {
                        history: true,
                        clearSprite: !spriteEditMode
                    });
                }

                scrollSelectionIntoView = true;

            });

            var onMouseEnter = function () {
                editor.call('picker:sprites:hoverFrame', key);
            };

            var onMouseLeave = function () {
                editor.call('picker:sprites:hoverFrame', null);
            };

            panel.element.addEventListener('mouseenter', onMouseEnter);
            panel.element.addEventListener('mouseleave', onMouseLeave);

            // clean up events
            panel.on('destroy', function () {
                for (var i = 0, len = frameEvents.length; i<len; i++) {
                    frameEvents[i].unbind();
                }
                frameEvents.length = 0;


                panel.element.removeEventListener('mouseenter', onMouseEnter);
                panel.element.removeEventListener('mouseleave', onMouseLeave);
            });

            if (afterPanel) {
                panelFrames.appendAfter(panel, afterPanel);
            } else if (beforePanel) {
                panelFrames.appendBefore(panel, beforePanel);
            } else {
                panelFrames.append(panel);
            }
        };

        // create frames
        var frames = atlasAsset.getRaw('data.frames')._data;
        for (var key in frames) {
            addFramePanel(key, frames[key]._data);
        }

        // keydown
        var onKeyDown = function (e) {
            ctrlDown = e.ctrlKey || e.metaKey;
            shiftDown = e.shiftKey;
        };
        window.addEventListener('keydown', onKeyDown);

        // keyup
        var onKeyUp = function (e) {
            ctrlDown = e.ctrlKey || e.metaKey;
            shiftDown = e.shiftKey;
        };
        window.addEventListener('keyup', onKeyUp);

        // listen to atlas set event
        var checkPath = /^data\.frames(.(\d+))?$/;
        events.push(atlasAsset.on('*:set', function (path, value) {
            if (! path.startsWith('data.frames')) return;

            var parts = path.split('.');
            if (parts.length === 2) {
                // if all frames are set then re-create all frame panels
                for (key in panels) {
                    panels[key].destroy();
                    delete panels[key];
                }

                panels = {};

                var raw = atlasAsset.getRaw('data.frames')._data;

                for (key in value) {
                    addFramePanel(key, raw[key]._data);
                }
            } else if (parts.length === 3) {
                // if a frame was set and it doesn't exist create it
                var key = parts[2];
                if (key) {
                    if (! panels[key]) {
                        var panelBefore = null;
                        var panelAfter = null;

                        var search = parseInt(key, 10);
                        for (var k in panels) {
                            if (search < parseInt(k, 10)) {
                                panelBefore = panels[k];
                                break;
                            } else {
                                panelAfter = panels[k];
                            }
                        }


                        var raw = atlasAsset.getRaw('data.frames')._data;
                        addFramePanel(key, raw[key]._data, panelAfter, panelBefore);
                    }
                }
            } else {
                // if a field changed then re-render the preview for that frame
                var key = parts[2];
                if (panels[key]) {
                    panels[key].queueRender();
                }
            }
        }));

        // listen to atlas unset event
        var checkUnsetPath = /^data\.frames\.(\d+)$/;
        events.push(atlasAsset.on('*:unset', function (path) {
            var match = path.match(checkUnsetPath);
            if (! match) return;

            var key = match[1];
            if (panels[key]) {
                panels[key].destroy();
                delete panels[key];
            }
        }));

        // Listen to framesSelected event to highlight panels
        events.push(editor.on('picker:sprites:framesSelected', function (keys) {
            var index = {};
            var key;

            if (spriteEditMode) {
                // unhighlight old keys
                var highlighted = panelFrames.innerElement.querySelectorAll('.frame.highlighted');
                for (var i = 0, len = highlighted.length; i<len; i++) {
                    if (! keys || keys.indexOf(highlighted[i].ui.frameKey) === -1) {
                        highlighted[i].ui.class.remove('highlighted');
                    }
                }

                if (keys) {
                    spriteEditModeKeys = keys.slice();
                } else {
                    spriteEditModeKeys.length = 0;
                }

            } else {
                var selected = panelFrames.innerElement.querySelectorAll('.frame.selected');
                for (var i = 0, len = selected.length; i<len; i++) {
                    if (! keys || keys.indexOf(selected[i].ui.frameKey) === -1) {
                        selected[i].ui.class.remove('selected');
                        selected[i].ui.class.remove('sprite-frame');
                    }
                }

                if (keys) {
                    selectedKeys = keys.slice();
                } else {
                    selectedKeys.length = 0;
                }
            }

            // select new keys
            if (keys && keys.length) {
                for (var i = 0, len = keys.length; i < len; i++) {
                    key = keys[i];
                    index[key] = true;

                    if (! panels[key]) continue;

                    if (scrollSelectionIntoView) {
                        var scroll = false;
                        if (i === 0) {
                            scroll = spriteEditMode ? ! panels[key].class.contains('highlighted') : ! panels[key].class.contains('selected');
                            if (scroll) {
                                panelFrames.innerElement.scrollTop = panels[key].element.offsetTop;
                            }
                        }
                    }

                    panels[key].class.add(spriteEditMode ? 'highlighted' : 'selected');
                    if (selectedSprite && (keys === selectedKeys || selectedKeys.indexOf(key) !== -1)) {
                        panels[key].class.add('sprite-frame');
                    }
                }
            }
        }));

        events.push(editor.on('picker:sprites:pickFrames:start', function () {
            spriteEditMode = true;
        }));

        events.push(editor.on('picker:sprites:pickFrames:end', function () {
            spriteEditMode = false;

            for (var i = 0, len = spriteEditModeKeys.length; i<len; i++) {
                if (panels[spriteEditModeKeys[i]]) {
                    panels[spriteEditModeKeys[i]].class.remove('highlighted');
                }
            }

            spriteEditModeKeys.length = 0;
        }));

        events.push(editor.on('picker:sprites:spriteSelected', function (spriteAsset) {
            selectedSprite = spriteAsset;
            var keys = spriteEditMode ? spriteEditModeKeys : selectedKeys;
            for (var i = 0, len = keys.length; i<len; i++) {
                var panel = panels[keys[i]];
                if (! panel) continue;

                if (selectedSprite) {
                    panel.class.add('sprite-frame');
                } else {
                    panel.class.remove('sprite-frame');
                }
            }
        }));

        // clean up
        events.push(leftPanel.on('clear', function () {
            panelFrames.destroy();
        }));

        panelFrames.on('destroy', function () {
            for (var i = 0; i < events.length; i++) {
                events[i].unbind();
            }

            events.length = 0;

            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);

            panels = {};
            selectedKeys.length = 0;
            spriteEditModeKeys.length = 0;
        });
    });
});


/* editor/pickers/sprite-editor/sprite-editor-selection.js */
editor.once('load', function () {
    'use strict';

    var selected = null;
    var highlightedFrames = [];
    var newSpriteFrames = [];

    var atlasAsset = null;
    var spriteAsset = null;

    var spriteEditMode = false;

    var events = [];

    // Select frames by keys
    // options.history: Whether to add this action to the history
    // options.add: Whether to add the frames to the existing selection
    // options.clearSprite: Clear sprite selection if true
    var selectFrames = function (keys, options) {
        if (keys && ! (keys instanceof Array))
            keys = [keys];

        // check if new selection differs from old
        var dirty = false;
        if (! keys && selected || ! keys && options && options.clearSprite && spriteAsset) {
            dirty = true;
        } else if (keys && ! selected) {
            dirty = true;
        } else if (selected && spriteAsset && (! options || ! options.clearSprite)) {
            dirty = true;
        } else {
            var klen = keys ? keys.length : 0;
            var hlen = highlightedFrames.length;
            if (klen !== hlen) {
                dirty = true;
            } else {
                for (var i = 0; i < klen; i++) {
                    if (keys[i] !== highlightedFrames[i]) {
                        dirty = true;
                        break;
                    }
                }
            }
        }

        if (! dirty)
            return;

        var prevSelection = selected;
        var prevHighlighted = spriteEditMode ? newSpriteFrames.slice() : highlightedFrames.slice();
        var prevSprite = spriteAsset;

        // add to selection if necessary
        if (keys && options && options.add) {
            var temp = prevHighlighted.slice();
            for (var i = 0, len = keys.length; i<len; i++) {
                if (temp.indexOf(keys[i]) === -1) {
                    temp.push(keys[i]);
                }
            }
            keys = temp;
        }

        var select = function (newKeys, newSelection, oldKeys) {
            selected = null;

            if (oldKeys) {
                if (spriteEditMode) {
                    newSpriteFrames.length = 0;
                } else {
                    highlightedFrames.length = 0;
                }
            }

            var asset = editor.call('assets:get', atlasAsset.get('id'));
            if (asset) {
                var len = newKeys && newKeys.length;
                if (len) {
                    if (spriteEditMode) {
                        newSpriteFrames = newKeys.slice();
                    } else {
                        highlightedFrames = newKeys.slice();
                    }

                    if (! spriteAsset) {
                        selected = newSelection || newKeys[len-1];

                    }
                }
            }

            editor.emit('picker:sprites:framesSelected', newKeys);
        };

        var redo = function () {
            if (options && options.clearSprite) {
                setSprite(null);
            }

            select(keys, null, prevHighlighted);
        };

        var undo = function () {
            if (options && options.clearSprite && prevSprite) {
                selectSprite(prevSprite);
            } else {
                select(prevHighlighted, prevSelection, keys);
            }
        };

        if (options && options.history) {
            editor.call('history:add', {
                name: 'select frame',
                undo: undo,
                redo: redo
            });

        }

        redo();

        return selected;
    };

    // Sets the selected sprite and hooks event listeners
    var setSprite = function (asset) {
        if (spriteAsset) {
            spriteAsset.unbind('data.frameKeys:remove', selectSpriteFrames);
            spriteAsset.unbind('data.frameKeys:insert', selectSpriteFrames);
            spriteAsset.unbind('data.frameKeys:set', selectSpriteFrames);
        }

        spriteAsset = asset;
        editor.emit('picker:sprites:spriteSelected', asset);

        if (! spriteAsset) return;

        spriteAsset.on('data.frameKeys:remove', selectSpriteFrames);
        spriteAsset.on('data.frameKeys:insert', selectSpriteFrames);
        spriteAsset.on('data.frameKeys:set', selectSpriteFrames);
    };

    var selectSpriteFrames = function () {
        if (spriteAsset) {
            selectFrames(spriteAsset.getRaw('data.frameKeys'));
        }
    };

    // Select specified sprite asset
    // Options are:
    // - history: If true make action undoable
    var selectSprite = function (asset, options) {
        if (options && options.history) {
            var prevSprite = spriteAsset;
            var newSprite = asset;
            var selectedFrames = selected && ! prevSprite ? highlightedFrames : null;

            var redo = function () {
                setSprite(asset);
                if (spriteAsset) {
                    selectFrames(spriteAsset.getRaw('data.frameKeys'));
                } else {
                    selectFrames(null);
                }
            };

            var undo = function () {
                setSprite(prevSprite);
                if (spriteAsset) {
                    selectFrames(spriteAsset.getRaw('data.frameKeys'));
                } else {
                    selectFrames(selectedFrames);
                }
            };

            editor.call('history:add', {
                name: 'select sprite',
                undo: undo,
                redo: redo
            });

            redo();
        } else {
            setSprite(asset);
            if (spriteAsset) {
                selectFrames(spriteAsset.getRaw('data.frameKeys'));
            } else {
                selectFrames(null);
            }
        }
    };

    // Methods

    editor.method('picker:sprites:selectSprite', selectSprite);

    editor.method('picker:sprites:selectFrames', selectFrames);

    // Create sprite asset from selected frames
    editor.method('picker:sprites:spriteFromSelection', function (args) {
        if (! highlightedFrames.length )
            return;

        // rendermode: 1 - sliced, 0 - simple
        var renderMode = args && args.sliced ? 1 : 0;
        // default ppu to 1 if we're using sliced mode and we have just one frame
        // as that's likely going to be used for Image Elements otherwise default to 100
        // which is better for world-space sprites
        var ppu = args && args.sliced && highlightedFrames.length === 1 ? 1 : 100;

        // get the atlas name without the extension
        var atlasNameWithoutExt = atlasAsset.get('name');
        var lastDot = atlasNameWithoutExt.lastIndexOf('.');
        if (lastDot > 0) {
            atlasNameWithoutExt = atlasNameWithoutExt.substring(0, lastDot);
        }

        var name;

        // if we just have one frame in the atlas use the atlas name for the sprite name
        // without the extension, otherwise if it's only 1 frame selected use the frame name,
        // otherwise use a generic name
        if (highlightedFrames.length === 1) {
            if (Object.keys(atlasAsset.get('data.frames')).length === 1) {
                name = atlasNameWithoutExt;
            } else {
                name = atlasAsset.get('data.frames.' + highlightedFrames[0] + '.name');
            }
        }

        if (! name) {
            name = 'New Sprite';
        }

        editor.call('assets:create:sprite', {
            name: name,
            pixelsPerUnit: ppu,
            renderMode: renderMode,
            frameKeys: highlightedFrames,
            textureAtlasAsset: atlasAsset.get('id'),
            noSelect: true,
            fn: function (err, id) {
                var asset = editor.call('assets:get', id);
                if (asset) {
                    selectSprite(asset);
                    if (args && args.callback) {
                        args.callback(asset);
                    }
                } else {
                    editor.once('assets:add[' + id + ']', function (asset) {
                        // do this in a timeout in order to wait for
                        // assets:add to be raised first
                        requestAnimationFrame(function () {
                            selectSprite(asset);
                            if (args && args.callback) {
                                args.callback(asset);
                            }
                        });
                    });
                }
            }
        });
    });

    var startSpriteEditMode = function () {
        spriteEditMode = true;
        editor.emit('picker:sprites:pickFrames:start');

        // Enter key to add frames and end sprite edit mode
        editor.call('hotkey:register', 'sprite-editor-add-frames', {
            key: 'enter',
            callback: function () {
                // do this in a timeout because this will terminate sprite edit mode
                // which will unregister the hotkey which will cause an error because
                // we are still in the hotkey execution loop
                setTimeout(function () {
                    editor.call('picker:sprites:pickFrames:add');
                });
            }
        })


    };

    var endSpriteEditMode = function () {
        spriteEditMode = false;
        newSpriteFrames.length = 0;

        editor.call('hotkey:unregister', 'sprite-editor-add-frames');
        editor.emit('picker:sprites:pickFrames:end');

        selectSpriteFrames();
    };

    // Start sprite edit mode
    editor.method('picker:sprites:pickFrames', function () {
        if (spriteEditMode) return;

        editor.call('history:add', {
            name: 'add frames',
            undo: endSpriteEditMode,
            redo: startSpriteEditMode
        });

        startSpriteEditMode();
    });

    // Adds picked frames to sprite asset and exits sprite edit mode
    editor.method('picker:sprites:pickFrames:add', function () {
        if (! spriteAsset) return;

        var length = newSpriteFrames.length;
        if (length) {
            var keys = spriteAsset.get('data.frameKeys');
            keys = keys.concat(newSpriteFrames);
            spriteAsset.set('data.frameKeys', keys);
        }

        endSpriteEditMode();
    });

    // Exits sprite edit mode
    editor.method('picker:sprites:pickFrames:cancel', function () {
        endSpriteEditMode();
    });

    // Return selected frame
    editor.method('picker:sprites:selectedFrame', function () {
        return selected;
    });

    // Return highlighted frames
    editor.method('picker:sprites:highlightedFrames', function () {
        return highlightedFrames;
    });

    // Return sprite edit mode picked frames
    editor.method('picker:sprites:newSpriteFrames', function () {
        return newSpriteFrames;
    });

    // Return selected sprite
    editor.method('picker:sprites:selectedSprite', function () {
        return spriteAsset;
    });

    // if the selected sprite is deleted then deselect it
    events.push(editor.on('assets:remove', function (asset) {
        if (spriteAsset && spriteAsset.get('id') === asset.get('id')) {
            selectSprite(null);
        }
    }));

    editor.on('picker:sprites:open', function () {
        atlasAsset = editor.call('picker:sprites:atlasAsset');

        // Delete hotkey to delete selected frames
        editor.call('hotkey:register', 'sprite-editor-delete', {
            key: 'delete',
            callback: function () {
                if (! spriteAsset && highlightedFrames.length) {
                    editor.call('picker:sprites:deleteFrames', highlightedFrames, {
                        history: true
                    });
                }
            }
        });
    });

    editor.on('picker:sprites:close', function () {
        atlasAsset = null;
        selected = null;
        highlightedFrames.length = 0;
        newSpriteFrames.length = 0;
        setSprite(null);

        for (var i = 0; i < events.length; i++) {
            events[i].unbind();
        }
        events.length = 0;

        editor.call('hotkey:unregister', 'sprite-editor-delete');
    });


});


/* editor/pickers/sprite-editor/sprite-editor-render-preview.js */
editor.once('load', function () {
    'use strict';

    var centerPivot = [0.5, 0.5];

    // Renders a frame to the canvas taking into account the size of all the specified frames
    // to determine aspect ratio.
    // - frame: The frame index to render
    // - canvas: The canvas where the preview will be rendered
    // - allFrames: All the frames relevant to this render
    // - animating: If true then the frames pivot will be used otherwise everything will be rendered as if centered
    editor.method('picker:sprites:renderFramePreview', function (frame, canvas, allFrames, animating) {
        var ctx = canvas.getContext('2d');
        var width = canvas.width;
        var height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        if (! frame || ! frame.pivot || ! frame.rect) {
            return;
        }

        var atlasImage = editor.call('picker:sprites:atlasImage');
        if (! atlasImage) return;

        var x = frame.rect[0];
        // convert bottom left WebGL coord to top left pixel coord
        var y = atlasImage.height - frame.rect[1] - frame.rect[3];
        var w = frame.rect[2];
        var h = frame.rect[3];

        // choose targetWidth and targetHeight keeping the aspect ratio
        var targetWidth = width;
        var targetHeight = height;
        var offsetX = 0;
        var offsetY = 0;

        if (allFrames) {
            var maxHeight = 0;
            var maxWidth = 0;
            var leftBound = Number.POSITIVE_INFINITY;
            var rightBound = Number.NEGATIVE_INFINITY;
            var bottomBound = Number.POSITIVE_INFINITY;
            var topBound = Number.NEGATIVE_INFINITY;
            for (var i = 0, len = allFrames.length; i<len; i++) {
                var f = allFrames[i];
                if (! f) continue;

                if (f._data)
                    f = f._data;

                var pivot = animating ? f.pivot : centerPivot;

                var left = -f.rect[2] * pivot[0];
                var right = (1-pivot[0]) * f.rect[2];
                var bottom = -f.rect[3] * pivot[1];
                var top = (1 - pivot[1]) * f.rect[3];

                leftBound = Math.min(leftBound, left);
                rightBound = Math.max(rightBound, right);
                bottomBound = Math.min(bottomBound, bottom);
                topBound = Math.max(topBound, top);
            }

            maxWidth = rightBound - leftBound;
            maxHeight = topBound - bottomBound;

            var widthFactor = width;
            var heightFactor = height;

            var canvasRatio = width / height;
            var aspectRatio = maxWidth / maxHeight;

            // resize all frames based on aspect ratio of all frames
            // together
            if (canvasRatio > aspectRatio) {
                widthFactor = height * aspectRatio;
            } else {
                heightFactor = width / aspectRatio;
            }

            // calculate x and width
            var pivot = animating ? frame.pivot : centerPivot;
            var left = -frame.rect[2] * pivot[0];
            offsetX = widthFactor * (left - leftBound) / maxWidth;
            targetWidth = widthFactor * frame.rect[2] / maxWidth;

            // calculate y and height
            var top = (1 - pivot[1]) * frame.rect[3];
            offsetY = heightFactor * (1 - (top - bottomBound) / maxHeight);
            targetHeight = heightFactor * frame.rect[3] / maxHeight;

            // center it
            offsetX += (width - widthFactor) / 2;
            offsetY += (height - heightFactor) / 2;
        } else {
            var aspectRatio = w / h;

            if (aspectRatio >= 1) {
                targetHeight = width / aspectRatio;
            } else {
                targetWidth = height * aspectRatio;
            }

            offsetX = (width - targetWidth) / 2;
            offsetY = (height - targetHeight) / 2;
        }


        // disable smoothing
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;

        ctx.drawImage(atlasImage, x, y, w, h, offsetX, offsetY, targetWidth, targetHeight);
    });

});


/* editor/pickers/sprite-editor/sprite-editor-trim.js */
editor.once('load', function () {
    'use strict';

    editor.on('picker:sprites:open', function () {
        // Trim selected frames
        editor.call('hotkey:register', 'sprite-editor-trim', {
            key: 't',
            callback: function () {
                var spriteAsset = editor.call('picker:sprites:selectedSprite');
                if (spriteAsset) return;

                var highlightedFrames = editor.call('picker:sprites:highlightedFrames');
                if (highlightedFrames.length) {
                    editor.call('picker:sprites:trimFrames', highlightedFrames);
                }
            }
        });

    });

    editor.on('picker:sprites:close', function () {
        editor.call('hotkey:unregister', 'sprite-editor-trim');
    });

    // Trim transparent pixels from specified frames
    editor.method('picker:sprites:trimFrames', function (frames) {
        if (! editor.call('permissions:write')) return;

        var prev = {};

        var frames = frames.slice();
        var atlasAsset = editor.call('picker:sprites:atlasAsset');
        if (! atlasAsset) return;
        var imageData = editor.call('picker:sprites:atlasImageData');
        if (! imageData) return;

        var redo = function () {
            var asset = editor.call('assets:get', atlasAsset.get('id'));
            if (! asset) return;

            var history = asset.history.enabled;
            asset.history.enabled = false;

            var dirty = false;

            var width = atlasAsset.get('meta.width');
            var height = atlasAsset.get('meta.height');

            var frameData = atlasAsset.getRaw('data.frames')._data;
            for (var i = 0, len = frames.length; i<len; i++) {
                var frame = frameData[frames[i]];
                if (! frame) continue;
                frame = frame._data;

                var left = Math.max(0, frame.rect[0]);
                var right = Math.min(frame.rect[0] + frame.rect[2] - 1, width - 1);
                var top = Math.max(0, height - frame.rect[1] - frame.rect[3]);
                var bottom = Math.min(height - frame.rect[1] - 1, height - 1);

                // trim vertically from left to right
                for (var x = left; x<=right; x++) {
                    var foundPixel = false;
                    for (var y = top; y<=bottom; y++) {
                        left = x;
                        if (! isPixelEmpty(x, y, width, imageData)) {
                            foundPixel = true;
                            break;
                        }
                    }

                    if (foundPixel) {
                        break;
                    }
                }

                // trim vertically from right to left
                for (var x = right; x>=left; x--) {
                    var foundPixel = false;
                    for (var y = top; y<=bottom; y++) {
                        right = x;
                        if (! isPixelEmpty(x, y, width, imageData)) {
                            foundPixel = true;
                            break;
                        }
                    }

                    if (foundPixel) {
                        break;
                    }
                }

                // trim horizontally from top to bottom
                for (var y = top; y<=bottom; y++) {
                    var foundPixel = false;
                    for (var x = left; x<=right; x++) {
                        top = y;
                        if (! isPixelEmpty(x, y, width, imageData)) {
                            foundPixel = true;
                            break;
                        }
                    }

                    if (foundPixel) {
                        break;
                    }
                }

                // trim horizontally from bottom to top
                for (var y = bottom; y>=top; y--) {
                    var foundPixel = false;
                    for (var x = left; x<=right; x++) {
                        bottom = y;
                        if (! isPixelEmpty(x, y, width, imageData)) {
                            foundPixel = true;
                            break;
                        }
                    }

                    if (foundPixel) {
                        break;
                    }
                }

                // set new rect
                var l = left;
                var b = height - bottom - 1;
                var w = Math.max(1, right - left + 1); // don't make 0 width/height rects
                var h = Math.max(1, bottom - top + 1);

                if (l !== frame.rect[0] || b !== frame.rect[1] || w !== frame.rect[2] || h !== frame.rect[3]) {
                    dirty = true;
                    prev[frames[i]] = frame.rect.slice();
                    atlasAsset.set('data.frames.' + frames[i] + '.rect', [l,b,w,h]);
                }
            }

            asset.history.enabled = history;

            return dirty;
        };

        var undo = function () {
            var asset = editor.call('assets:get', atlasAsset.get('id'));
            if (! asset) return;

            var history = asset.history.enabled;
            asset.history.enabled = false;
            for (var key in prev) {
                atlasAsset.set('data.frames.' + key + '.rect', prev[key]);
            }
            asset.history.enabled = history;

            prev = {};
        };

        if (redo()) {
            editor.call('history:add', {
                name: 'trim frames',
                undo: undo,
                redo: redo
            });
        }
    });

    var isPixelEmpty = function (x, y, width, imageData) {
        var alpha = y * (width * 4) + x * 4 + 3;
        return imageData.data[alpha] === 0;
    };
});


/* editor/pickers/sprite-editor/sprite-editor-edit-frame.js */
editor.once('load', function () {
    'use strict';

    // Modify frame and make the action undoable
    editor.method('picker:sprites:commitFrameChanges', function (key, frame, oldFrame) {
        if (! editor.call('permissions:write')) return;

        var atlasAsset = editor.call('picker:sprites:atlasAsset');
        if (! atlasAsset) return;

        var newValue = {
            name: frame.name,
            rect: frame.rect.slice(),
            pivot: frame.pivot.slice(),
            border: frame.border.slice()
        };

        // make sure width / height are positive
        if (newValue.rect[2] < 0) {
            newValue.rect[2] = Math.max(1, -newValue.rect[2]);
            newValue.rect[0] -= newValue.rect[2];
        }

        if (newValue.rect[3] < 0) {
            newValue.rect[3] = Math.max(1, -newValue.rect[3]);
            newValue.rect[1] -= newValue.rect[3];
        }

        var redo = function () {
            var asset = editor.call('assets:get', atlasAsset.get('id'));
            if (! asset) return;
            var history = asset.history.enabled;
            asset.history.enabled = false;
            asset.set('data.frames.' + key, newValue);
            asset.history.enabled = history;
        };

        var undo = function () {
            var asset = editor.call('assets:get', atlasAsset.get('id'));
            if (! asset) return;
            var history = asset.history.enabled;
            asset.history.enabled = false;
            if (oldFrame) {
                asset.set('data.frames.' + key, oldFrame);
            } else {
                editor.call('picker:sprites:deleteFrames', [key]);
            }
            asset.history.enabled = history;
        };

        editor.call('history:add', {
            name: 'data.frames.' + key,
            undo: undo,
            redo: redo
        });

        redo();
    });
});


/* editor/pickers/sprite-editor/sprite-editor-delete.js */
editor.once('load', function () {
    'use strict';

    // Delete frames with specified keys from atlas and also
    // remove these frames from any sprite assets that are referencing them
    // Options can be:
    // - history: if true then make this undoable
    editor.method('picker:sprites:deleteFrames', function (keys, options) {
        if (! editor.call('permissions:write')) return;

        var atlasAsset = editor.call('picker:sprites:atlasAsset');
        if (! atlasAsset)
            return;

        var history = options && options.history;
        if (history) {
            // make copy of array to make sure undo / redo works
            keys = keys.slice();
        }

        var numKeys = keys.length;

        if (history) {
            var oldFrames = {};
            for (var i = 0; i < numKeys; i++) {
                oldFrames[keys[i]] = atlasAsset.get('data.frames.' + keys[i]);
            }
        }

        var redo = function () {
            var asset = editor.call('assets:get', atlasAsset.get('id'));
            if (! asset) return;
            var history = asset.history.enabled;
            asset.history.enabled = false;

            for (var i = 0; i < numKeys; i++) {
                asset.unset('data.frames.' + keys[i]);
            }

            editor.call('picker:sprites:selectFrames', null, {
                clearSprite: true
            })

            asset.history.enabled = history;
        };

        if (history) {
            var undo = function () {
                var asset = editor.call('assets:get', atlasAsset.get('id'));
                if (! asset) return;
                var history = asset.history.enabled;
                asset.history.enabled = false;

                for (var i = 0; i < numKeys; i++) {
                    asset.set('data.frames.' + keys[i], oldFrames[keys[i]]);
                }

                editor.call('picker:sprites:selectFrames', keys, {
                    clearSprite: true
                })

                asset.history.enabled = history;

            };

            editor.call('history:add', {
                name: 'delete frames',
                undo: undo,
                redo: redo
            });
        }

        redo();
    });
});