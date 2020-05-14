/* editor/inspector/assets/asset-preview-base.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'pcui-asset-preview';
    const CLASS_CONTAINER = CLASS_ROOT + '-container';
    const CLASS_CONTAINER_LARGE = CLASS_CONTAINER + '-large';

    class AssetInspectorPreviewBase extends pcui.Container {
        constructor(args) {
            super(args);
            this.class.add(CLASS_CONTAINER);

            this._mouseDown = false;
            this._dragging = false;

            this._domEvtMouseDown = this._onMouseDown.bind(this);
            this._domEvtMouseMove = this._onMouseMove.bind(this);
            this._domEvtMouseUp = this._onMouseUp.bind(this);
        }

        _onMouseDown(evt) {
            if (evt.button !== 0) return;

            evt.preventDefault();
            evt.stopPropagation();

            this._mouseDown = true;
        }

        _onMouseMove(evt) {
            if (!this._mouseDown) return;

            this._dragging = true;
        }

        _onMouseUp(evt) {
            if (evt.button !== 0) return;

            if (this._mouseDown && !this._dragging && this.dom.contains(evt.target) && !(evt.target.ui instanceof pcui.Button)) {
                this._toggleSize();
            }

            this._mouseDown = false;
            this._dragging = false;
        }

        _toggleSize() {
            if (this.class.contains(CLASS_CONTAINER_LARGE)) {
                this.class.remove(CLASS_CONTAINER_LARGE);
            } else {
                this.class.add(CLASS_CONTAINER_LARGE);
            }
        }

        link() {
            this.unlink();

            this.dom.addEventListener('click', this._handleClick);

            this.dom.addEventListener('mousedown', this._domEvtMouseDown);
            window.addEventListener('mousemove', this._domEvtMouseMove);
            window.addEventListener('mouseup', this._domEvtMouseUp);
        }

        unlink() {
            super.unlink();

            this.dom.removeEventListener('click', this._handleClick);

            this.dom.removeEventListener('mousedown', this._domEvtMouseDown);
            window.removeEventListener('mousemove', this._domEvtMouseMove);
            window.removeEventListener('mouseup', this._domEvtMouseUp);
        }
    }

    return {
        AssetInspectorPreviewBase: AssetInspectorPreviewBase
    };
})());


/* editor/inspector/assets/animation.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [{
        label: 'Duration',
        path: 'meta.duration',
        type: 'label',
        args: {
            placeholder: 'Seconds'
        }
    },
    {
        label: 'Name',
        path: 'meta.name',
        type: 'label'
    }];

    ATTRIBUTES.forEach(attr => {
        const path = attr.alias || attr.path;
        if (!path) return;
        const parts = path.split('.');
        attr.reference = `asset:animation:${parts[parts.length - 1]}`;
    });

    class AnimationAssetInspector extends pcui.Panel {
        constructor(args) {
            args = Object.assign({}, args);
            args.headerText = 'ANIMATION';

            super(args);

            this._attributesInspector = new pcui.AttributesInspector({
                assets: args.assets,
                history: args.history,
                attributes: ATTRIBUTES,
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);
        }

        link(assets) {
            this.unlink();
            this._attributesInspector.link(assets);
        }

        unlink() {
            this._attributesInspector.unlink();
        }
    }

    return {
        AnimationAssetInspector: AnimationAssetInspector
    };
})());


/* editor/inspector/assets/audio.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'asset-audio-inspector';

    const ATTRIBUTES = [{
        label: 'Duration',
        alias: 'duration',
        type: 'label',
        args: {
            value: '...'
        }
    }];

    ATTRIBUTES.forEach(attr => {
        const path = attr.alias || attr.path;
        if (!path) return;
        const parts = path.split('.');
        attr.reference = `asset:audio:${parts[parts.length - 1]}`;
    });

    const DOM = (parent) => [
        {
            attributesInspector: new pcui.AttributesInspector({
                assets: parent.args.assets,
                history: parent.args.history,
                attributes: ATTRIBUTES
            })
        },
        {
            root: {
                audioContainer: new pcui.Container({
                    flex: true,
                    flexDirection: 'row',
                    alignItems: 'center'
                })
            },
            children: [
                {
                    audio: new Audio()
                },
                {
                    audioButton: new pcui.Button({
                        icon: 'E286'
                    })
                },
                {
                    audioTimeline: new pcui.Progress({
                        flexGrow: 1
                    })
                }
            ]
        }
    ];

    class AudioAssetInspector extends pcui.Panel {
        constructor(args) {
            args = Object.assign({}, args);
            args.headerText = 'AUDIO';

            super(args);
            this.args = args;

            this.class.add(CLASS_ROOT);

            this.buildDom(DOM(this));
            this._playing = null;
            this._assetEvents = {
                canplay: this._audioCanPlay.bind(this),
                play: this._audioPlayed.bind(this),
                pause: this._audioPaused.bind(this),
                durationchange: this._audioDurationChange.bind(this)
            };
        }

        _onClickAudioButton(evt) {
            if (this._audio.paused) {
                this._audio.play();
            } else {
                this._audio.pause();
                this._audio.currentTime = 0;
            }
        }

        _audioDurationChange(evt) {
            this._attributesInspector.getField('duration').value = this._audio.duration.toFixed(2) + 's';
        }

        _audioCanPlay(evt) {
            this._audioButton.disabled = false;
            this._audioTimeline.value = 0;
        }

        _audioPlayed(evt) {
            this._audioButton.class.add('active');
            if (this._playing) {
                return;
            }
            this._playing = setInterval(this._updateTimeline.bind(this), 1000 / 60);
        }

        _audioPaused(evt) {
            this._audioTimeline.value = 0;
            this._audioButton.class.remove('active');
            clearInterval(this._playing);
            this._playing = null;
        }

        _updateTimeline() {
            this._audioTimeline.value = this._audio.currentTime / this._audio.duration * 100;
        }

        link(assets) {
            this.unlink();
            if (assets.length > 1) {
                return;
            }

            this._audioButton.disabled = true;
            this._audioTimeline.value = 100;

            this._assetEvents.click = (this._audioButton.on('click', this._onClickAudioButton.bind(this)));

            this._attributesInspector.link(assets);
            this._audio = new Audio();
            this._audioContainer.prepend(this._audio);
            this._audio.src = config.url.home + assets[0].get('file.url');

            this._audio.addEventListener('canplay', this._assetEvents.canplay, false);
            this._audio.addEventListener('play', this._assetEvents.play, false);
            this._audio.addEventListener('pause', this._assetEvents.pause, false);
            this._audio.addEventListener('durationchange', this._assetEvents.durationchange, false);
        }

        unlink() {
            if (!this._audio)
                return;

            this._attributesInspector.unlink();
            this._audioPaused();

            Object.keys(this._assetEvents).forEach(event => {
                if (event === 'click')
                    this._assetEvents[event].unbind();
                else
                    this._audio.removeEventListener(event, this._assetEvents[event]);
            });

            this._audio = null;

            this._attributesInspector.getField('duration').value = '...';
        }
    }

    return {
        AudioAssetInspector: AudioAssetInspector
    };
})());


/* editor/inspector/assets/model.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'asset-model-inspector';
    const CLASS_AUTO_UNWRAP_PROGRESS = CLASS_ROOT + '-auto-unwrap-progress';
    const CLASS_AUTO_UNWRAP_PADDING = CLASS_ROOT + '-auto-unwrap-padding';

    const META_ATTRIBUTES = [
        {
            label: 'Vertices',
            alias: 'vertices',
            path: 'meta.vertices',
            type: 'label'
        },
        {
            label: 'Triangles',
            path: 'meta.triangles',
            type: 'label'
        },
        {
            label: 'Meshes',
            path: 'meta.meshes',
            type: 'label'
        },
        {
            label: 'Mesh Instances',
            path: 'meta.meshInstances',
            type: 'label'
        },
        {
            label: 'Nodes',
            path: 'meta.nodes',
            type: 'label'
        },
        {
            label: 'Skins',
            path: 'meta.skins',
            type: 'label'
        },
        {
            label: 'Attributes',
            path: 'meta.attributes',
            type: 'label'
        }
    ];

    const PIPELINE_ATTRIBUTES = [
        {
            label: 'UV1',
            path: 'meta.attributes.texCoord1',
            type: 'label'
        }
    ];

    const UNWRAP_ATTRIBUTES = [
        {
            label: 'Padding',
            alias: 'padding',
            type: 'number',
            args: {
                value: 2,
                precision: 2
            }
        },
        {
            label: 'Unwrapping',
            type: 'progress',
            alias: 'progress'
        }
    ];

    const DOM = (parent) => [
        {
            root: {
                metaPanel: new pcui.Panel({
                    headerText: 'META',
                    collapsible: true
                })
            },
            children: [
                {
                    metaAttributesInspector: new pcui.AttributesInspector({
                        assets: parent._args.assets,
                        history: parent._args.history,
                        attributes: META_ATTRIBUTES
                    })
                }
            ]
        },
        {
            root: {
                pipelinePanel: new pcui.Panel({
                    headerText: 'PIPELINE',
                    collapsible: true
                })
            },
            children: [
                {
                    pipelineAttributesInspector: new pcui.AttributesInspector({
                        assets: parent._args.assets,
                        history: parent._args.history,
                        attributes: PIPELINE_ATTRIBUTES
                    })
                },
                {
                    root: {
                        unwrapContainer: new pcui.Container({
                            flex: true,
                            flexDirection: 'row',
                            alignItems: 'center'
                        })
                    },
                    children: [
                        {
                            unwrapAttributesInspector: new pcui.AttributesInspector({
                                assets: parent._args.assets,
                                history: parent._args.history,
                                attributes: UNWRAP_ATTRIBUTES
                            })
                        },
                        {
                            btnAutoUnwrap: new pcui.Button({
                                text: 'AUTO-UNWRAP',
                                flexGrow: 1,
                                width: '133px'
                            })
                        },
                        {
                            btnCancelAutoUnwrap: new pcui.Button({
                                text: 'CANCEL',
                                flexGrow: 1
                            })
                        }
                    ]
                }
            ]
        },
        {
            root: {
                meshInstancesPanel: new pcui.Panel({
                    headerText: 'MESH INSTANCES',
                    collapsible: true
                })
            },
            children: [
                {
                    meshInstances: new pcui.ModelAssetInspectorMeshInstances({
                        assets: parent._args.assets,
                        history: parent._args.history
                    })
                }
            ]
        }
    ];

    class ModelAssetInspector extends pcui.Container {
        constructor(args) {
            args = Object.assign({}, args);

            super(args);

            this.class.add(CLASS_ROOT);

            this._args = args;
            this._assets = null;
            this._assetEvents = [];
            this._unwrapProgress = [];
            this._hasVisited = false;

            this.buildDom(DOM(this));

            this._unwrapAttributesInspector.getField('progress').parent.class.add(CLASS_AUTO_UNWRAP_PROGRESS);
            this._unwrapAttributesInspector.getField('padding').parent.class.add(CLASS_AUTO_UNWRAP_PADDING);
            this._btnCancelAutoUnwrap.hidden = true;
            this._btnAutoUnwrap.on('click', this._onAutoUnwrap.bind(this));
            this._btnCancelAutoUnwrap.on('click', this._onCancelAutoUnwrap.bind(this));
        }

        _onAutoUnwrap() {
            if (!editor.call('permissions:write'))
                return;

            const fieldPadding = this._unwrapAttributesInspector.getField('padding');

            this._assets.forEach(asset => {
                editor.call('assets:model:unwrap', asset, {
                    padding: fieldPadding.value
                });
            });
            this._btnAutoUnwrap.hidden = true;
            this._btnCancelAutoUnwrap.hidden = false;
            this._unwrapAttributesInspector.getField('progress').parent.hidden = false;
            this._unwrapAttributesInspector.getField('padding').parent.hidden = true;
        }

        _onCancelAutoUnwrap() {
            this._assets.forEach(asset => {
                editor.call('assets:model:unwrap:cancel', asset);
            });
            this._resetAutoUnwrap();
        }

        _resetAutoUnwrap() {
            this._unwrapProgress = [];


            this._btnAutoUnwrap.hidden = false;
            this._btnCancelAutoUnwrap.hidden = true;
            this._unwrapAttributesInspector.getField('progress').parent.hidden = true;
            this._unwrapAttributesInspector.getField('padding').parent.hidden = false;
            this._unwrapAttributesInspector.getField('progress').value = 0;
        }

        _formatMetaAttribute(attribute) {
            const total = this._assets.map(asset => asset.get(attribute)).reduce((a, b) => a + b, 0);
            const formattedTotal = total.toLocaleString();
            this._metaAttributesInspector.getField(attribute).values = this._assets.map(asset => {
                return formattedTotal;
            });
        }

        _formatMetaAttributesAttribute() {
            const metaAttributes = {};
            this._assets.forEach(asset => {
                const currMetaAttributes = asset.get('meta.attributes');
                if (currMetaAttributes) {
                    Object.assign(metaAttributes, currMetaAttributes);
                }
            });

            let metaAttributesString = Object.keys(metaAttributes).reduce((attributesString, currAttribute) => {
                return attributesString + ', ' + currAttribute;
            }, '');
            metaAttributesString = metaAttributesString.slice(2, -1);

            const metaAttributesField = this._metaAttributesInspector.getField('meta.attributes');
            metaAttributesField.parent.hidden = !metaAttributesString;
            metaAttributesField.style.whiteSpace = 'normal';
            metaAttributesField.values = this._assets.map(asset => {
                return metaAttributesString;
            });
        }

        _formatUV1Attribute() {
            const uv1Field = this._pipelineAttributesInspector.getField('meta.attributes.texCoord1');
            const assetsTexCoord1Values = this._assets.map(asset => {
                return asset.get('meta.attributes.texCoord1');
            });
            const uv1Options = ['unavailable', 'available', 'various'];
            const uv1FieldValue = assetsTexCoord1Values.reduce((prev, curr) => {
                if ((curr ? 1 : 0) === prev) {
                    return prev;
                }
                return 2;
            }, this._assets[0].get('meta.attributes.texCoord1') ? 1 : 0);
            uv1Field.values = this._assets.map(value => {
                return uv1Options[uv1FieldValue];
            });
        }

        link(assets) {
            this.unlink();
            this._assets = assets;
            this._metaAttributesInspector.link(assets);
            this._pipelineAttributesInspector.link(assets);
            this._meshInstances.link(assets);

            if (!this._hasVisited) {
                this._hasVisited = true;
                this._metaPanel.collapsed = true;
                this._pipelinePanel.collapsed = true;
            }

            META_ATTRIBUTES.forEach(attribute => {
                if (attribute.path !== 'meta.attributes') {
                    this._formatMetaAttribute(attribute.path);
                }
            });
            this._formatMetaAttributesAttribute();
            this._formatUV1Attribute();
            this._resetAutoUnwrap();

            this._assets.forEach((asset, index) => {
                this._unwrapProgress.push(0);
                this._assetEvents.push(editor.on('assets:model:unwrap:progress:' + asset.get('id'), (progress) => {
                    this._unwrapProgress[index] = progress;
                    const totalProgress = this._unwrapProgress.reduce((total, curr) => total + curr, 0) / this._assets.length;
                    this._unwrapAttributesInspector.getField('progress').value = totalProgress;
                }));
            });

            this._assetEvents.push(editor.on('assets:model:unwrap', (asset) => {
                const assetIndex = this._assets.indexOf(asset);
                if (assetIndex === -1) {
                    return;
                }
                META_ATTRIBUTES.forEach(attribute => {
                    if (attribute.path !== 'meta.attributes') {
                        this._formatMetaAttribute(attribute.path);
                    }
                });
                this._formatMetaAttributesAttribute();
                this._formatUV1Attribute();
                this._resetAutoUnwrap();
            }));

            this._meshInstancesPanel.hidden = assets.length > 1;
        }

        unlink() {
            if (this._assets === null) {
                return;
            }
            this._metaAttributesInspector.unlink();
            this._pipelineAttributesInspector.unlink();
            this._meshInstances.unlink();
            this._assets = [];
            this._assetEvents.forEach(evt => evt.unbind());
            this._assetEvents = [];
            this._unwrapProgress = [];
        }
    }

    return {
        ModelAssetInspector: ModelAssetInspector
    };
})());


/* editor/inspector/assets/model-mesh-instances.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'asset-model-inspector-mesh-instances';
    const CLASS_PICKER_MODE = CLASS_ROOT + '-picker-mode';
    const CLASS_PICKER_LABEL = CLASS_ROOT + '-picker-label';

    const DOM = (parent) => [
        {
            progress: new pcui.Progress({ width: '100%' })
        },
        {
            pickerLabel: new pcui.Label({
                text: '<h5>SELECT MESH INSTANCE</h5>Choose a mesh instance to customize the material for these Entities.',
                unsafe: true,
                class: CLASS_PICKER_LABEL
            })
        },
        {
            meshInstancesContainer: new pcui.Container()
        },
        {
            root: {
                errorLoadingDetailedDataContainer: new pcui.Container({
                    flex: true,
                    flexDirection: 'column',
                    alignItems: 'center'
                })
            },
            children: [
                {
                    errorLoadingDetailedDataLabel: new pcui.Label({
                        text: 'failed loading detailed data'
                    })
                }
            ]
        }
    ];

    class ModelAssetInspectorMeshInstances extends pcui.Container {
        constructor(args) {
            args = Object.assign({}, args);

            super(args);

            this.class.add(CLASS_ROOT);

            this._args = args;
            this._assets = [];
            this._assetElements = [];

            if (this._args.mode === 'picker') {
                this.class.add(CLASS_PICKER_MODE);
            }

            this.buildDom(DOM(this));

            // child element adjustments
            this._errorLoadingDetailedDataContainer.hidden = true;
            this._errorLoadingDetailedDataLabel.class.add(pcui.CLASS_ERROR);
        }

        _dragEnterFn(ind) {
            return (dropType, dropData) => {
                this._engineAsset = pc.app.assets.get(this._assets[0].get('id'));
                this._valueBefore = this._assets[0].get('data.mapping.' + ind + '.material') || null;
                if (this._engineAsset) {
                    this._engineAsset.data.mapping[ind].material = dropData.id;
                    this._engineAsset.fire('change', this._engineAsset, 'data', this._engineAsset.data, this._engineAsset.data);
                    editor.call('viewport:render');
                }
            };
        }

        _dragLeaveFn(ind) {
            return (dropType, dropData) => {
                this._engineAsset.data.mapping[ind].material = this._valueBefore;
                this._engineAsset.fire('change', this._engineAsset, 'data', this._engineAsset.data, this._engineAsset.data);
                editor.call('viewport:render');
            };
        }

        _loadData() {
            if (this._assets.length !== 1 || this._loading)
                return;

            this._hash = this._assets[0].get('file.hash');
            this._loading = 1;
            this._nodes = null;
            this._progress.hidden = false;

            this._request = Ajax
            .get('{{url.home}}' + this._assets[0].get('file.url'))
            .on('load', (status, data) => {
                this._loading = 0;

                this._nodes = [];
                for (var i = 0; i < data.model.meshInstances.length; i++)
                    this._nodes[i] = data.model.nodes[data.model.meshInstances[i].node].name;

                this._updateMeshInstances();
                this._progress.hidden = true;
                this._request = null;
            })
            .on('progress', (progress) => {
                this._progress.value = (0.1 + progress * 0.8) * 100;
            })
            .on('error', () => {
                this._progress.value = 1;
                this._progress.hidden = true;

                this._errorLoadingDetailedDataLabel.hidden = false;
            });
        }

        _updateMeshInstances() {
            if (this._nodes) {
                this.parent.headerText = `MESH INSTANCES [${this._nodes.length}]`;
                this._assetElements.forEach((assetElement, ind) => {
                    assetElement.text = `[0] ${this._nodes[ind]}`;
                });
            }
        }

        link(assets) {
            this.unlink();
            this._assets = assets;
            this._assets[0].get('data.mapping').forEach((_, ind) => {
                const assetElement = new pcui.AssetInput({
                    assetType: 'material',
                    assets: this._args.assets,
                    class: `node-${ind}`,
                    text: `[${ind}] node`,
                    flexGrow: 1,
                    binding: new pcui.BindingTwoWay({
                        history: this._args.history
                    }),
                    allowDragDrop: true,
                    // update viewport materials on drag enter
                    dragEnterFn: this._dragEnterFn(ind),
                    dragLeaveFn: this._dragLeaveFn(ind)
                });

                if (this._args.mode === 'picker') {
                    assetElement.readOnly = true;
                    if (this._args.isMeshInstanceDisabled && this._args.isMeshInstanceDisabled(ind)) {
                        assetElement.enabled = false;
                    }

                    assetElement.on('click', () => {
                        this.emit('select', ind);
                    });
                }

                assetElement.link(assets, `data.mapping.${ind}.material`);
                this._assetElements.push(assetElement);
                this._meshInstancesContainer.append(this._assetElements[ind]);
            });

            if (assets[0].has('file.url')) {
                if (! this._loading) {
                    this._loadData();
                } else {
                    this._updateMeshInstances();
                }
            }

            if (this._args.mode === 'picker') {
                this._progress.hidden = true;
                this._pickerLabel.hidden = false;
                this._pickerLabel.text = '<h5>SELECT MESH INSTANCE</h5>Choose a mesh instance to customize the material for ' + (this._args.entities.length > 1 ? 'these Entities.' : 'this Entity.');
            } else {
                this._pickerLabel.hidden = true;
            }
        }

        unlink() {
            this._assets = [];
            this._assetElements.forEach(assetElement => {
                assetElement.destroy();
            });
            this._assetElements = [];
            if (this._request) {
                this._request.owner.abort();
                this._request = null;
            }
        }
    }

    return {
        ModelAssetInspectorMeshInstances: ModelAssetInspectorMeshInstances
    };
})());


/* editor/inspector/assets/model-preview.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_CANVAS = 'pcui-asset-preview-canvas';
    const CLASS_CANVAS_FLIP = 'pcui-asset-preview-canvas-flip';

    class ModelAssetInspectorPreview extends pcui.AssetInspectorPreviewBase {
        constructor(args) {
            super(args);

            this._preview = new pcui.Canvas({ useDevicePixelRatio: true });
            this._preview.resize(320, 144);
            this._preview.class.add(CLASS_CANVAS, CLASS_CANVAS_FLIP);
            this.append(this._preview);

            this._renderFrame = null;
            this._previewRotation = [-15, 45];
            this._sx = 0;
            this._sy = 0;
            this._x = 0;
            this._y = 0;
            this._nx = 0;
            this._ny = 0;
        }

        // queue up the rendering to prevent too often renders
        _queueRender() {
            if (this._renderFrame) return;

            this._renderFrame = requestAnimationFrame(this._renderPreview.bind(this));
        }

        _renderPreview() {
            if (this._renderFrame) {
                cancelAnimationFrame(this._renderFrame);
                this._renderFrame = null;
            }

            if (this.dom.offsetWidth !== 0 && this.dom.offsetHeight !== 0) {
                this._preview.resize(this.dom.offsetWidth, this.dom.offsetHeight);
            }
            this._previewRenderer.render(
                Math.max(-90, Math.min(90, this._previewRotation[0] + (this._sy - this._y) * 0.3)),
                this._previewRotation[1] + (this._sx - this._x) * 0.3
            );
        }

        _onMouseDown(evt) {
            super._onMouseDown(evt);

            if (this._mouseDown) {
                this._sx = this._x = evt.clientX;
                this._sy = this._y = evt.clientY;
            }
        }

        _onMouseMove(evt) {
            super._onMouseMove(evt);

            if (this._dragging) {
                this._nx = this._x - evt.clientX;
                this._ny = this._y - evt.clientY;
                this._x = evt.clientX;
                this._y = evt.clientY;

                this._queueRender();
            }
        }

        _onMouseUp(evt) {
            if (this._dragging) {
                if ((Math.abs(this._sx - this._x) + Math.abs(this._sy - this._y)) < 8) {
                    this._preview.dom.height = this.height;
                }

                this._previewRotation[0] = Math.max(-90, Math.min(90, this._previewRotation[0] + ((this._sy - this._y) * 0.3)));
                this._previewRotation[1] += (this._sx - this._x) * 0.3;
                this._sx = this._sy = this._x = this._y = 0;

                this._queueRender();
            }

            super._onMouseUp(evt);
        }

        _toggleSize() {
            super._toggleSize();
            this._queueRender();
        }

        updatePreview() {
            this._queueRender();
        }

        link(assets) {
            this.unlink();
            super.link();

            this._previewRenderer = new pcui.ModelThumbnailRenderer(assets[0], this._preview.dom);
            this._queueRender();
        }

        unlink() {
            super.unlink();

            if (this._previewRenderer) {
                this._previewRenderer.destroy();
            }
            if (this._renderFrame) {
                cancelAnimationFrame(this._renderFrame);
                this._renderFrame = null;
            }
        }
    }

    return {
        ModelAssetInspectorPreview: ModelAssetInspectorPreview
    };
})());


/* editor/inspector/assets/material.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'asset-material-inspector';

    const DOM = (parent) => [{
        root: {
            materialPanel: new pcui.Panel({
                headerText: 'MATERIAL'
            })
        },
        children: [{
            materialInspector: new pcui.AttributesInspector({
                assets: parent._args.assets,
                history: parent._args.history,
                attributes: [{
                    label: 'Shading',
                    type: 'select',
                    path: 'data.shader',
                    args: {
                        type: 'string',
                        options: [{
                            v: 'phong', t: 'Phong'
                        }, {
                            v: 'blinn', t: 'Physical'
                        }]
                    },
                    reference: 'asset:material:shadingModel'
                }]
            })
        }]
    }, {
        root: {
            offsetTilingPanel: new pcui.Panel({
                headerText: 'OFFSET & TILING',
                collapsible: true,
                collapsed: true
            })
        },
        children: [{
            offsetTilingInspector: new pcui.AttributesInspector({
                assets: parent._args.assets,
                history: parent._args.history,
                attributes: [{
                    label: 'Apply To All Maps',
                    type: 'boolean',
                    alias: 'applyToAllMaps'
                }, {
                    label: 'Offset',
                    type: 'vec2',
                    alias: 'offset',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:offset'
                }, {
                    label: 'Tiling',
                    type: 'vec2',
                    alias: 'tiling',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:tiling'
                }]
            })
        }]
    }, {
        root: {
            ambientPanel: new pcui.Panel({
                headerText: 'AMBIENT',
                collapsible: true,
                collapsed: true
            })
        },
        children: [{
            ambientInspector: new pcui.AttributesInspector({
                assets: parent._args.assets,
                history: parent._args.history,
                attributes: [{
                    label: 'Ambient Occlusion',
                    type: 'asset',
                    path: 'data.aoMap',
                    args: {
                        assetType: 'texture'
                    },
                    reference: 'asset:material:aoMap'
                }, {
                    label: 'UV Channel',
                    type: 'select',
                    path: 'data.aoMapUv',
                    args: {
                        type: 'number',
                        options: [{
                            v: 0, t: 'UV0'
                        }, {
                            v: 1, t: 'UV1'
                        }]
                    },
                    reference: 'asset:material:aoMapUv'
                }, {
                    label: 'Color Channel',
                    type: 'select',
                    path: 'data.aoMapChannel',
                    args: {
                        type: 'string',
                        options: [{
                            v: 'r', t: 'R'
                        }, {
                            v: 'g', t: 'G'
                        }, {
                            v: 'b', t: 'B'
                        }, {
                            v: 'a', t: 'A'
                        }]
                    },
                    reference: 'asset:material:aoMapChannel'
                }, {
                    label: 'Offset',
                    type: 'vec2',
                    path: 'data.aoMapOffset',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:aoMapOffset'
                }, {
                    label: 'Tiling',
                    type: 'vec2',
                    path: 'data.aoMapTiling',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:aoMapTiling'
                }, {
                    label: 'Occlude Specular',
                    type: 'select',
                    path: 'data.occludeSpecular',
                    args: {
                        type: 'number',
                        options: [{
                            v: 0, t: 'Off'
                        }, {
                            v: 1, t: 'Multiply'
                        }, {
                            v: 2, t: 'Gloss Based'
                        }]
                    },
                    reference: 'asset:material:occludeSpecular'
                }, {
                    label: 'Vertex Color',
                    type: 'boolean',
                    path: 'data.aoMapVertexColor',
                    reference: 'asset:material:aoMapVertexColor'
                }, {
                    label: 'Tint',
                    type: 'boolean',
                    path: 'data.ambientTint',
                    reference: 'asset:material:ambientTint'
                }, {
                    label: 'Color',
                    type: 'rgb',
                    path: 'data.ambient',
                    reference: 'asset:material:ambient'
                }]
            })
        }]
    }, {
        root: {
            diffusePanel: new pcui.Panel({
                headerText: 'DIFFUSE',
                collapsible: true,
                collapsed: true
            })
        },
        children: [{
            diffuseInspector: new pcui.AttributesInspector({
                assets: parent._args.assets,
                history: parent._args.history,
                attributes: [{
                    label: 'Diffuse',
                    type: 'asset',
                    path: 'data.diffuseMap',
                    args: {
                        assetType: 'texture'
                    },
                    reference: 'asset:material:diffuseMap'
                }, {
                    label: 'UV Channel',
                    path: 'data.diffuseMapUv',
                    type: 'select',
                    args: {
                        type: 'number',
                        options: [{
                            v: 0, t: 'UV0'
                        }, {
                            v: 1, t: 'UV1'
                        }]
                    },
                    reference: 'asset:material:diffuseMapUv'
                }, {
                    label: 'Color Channel',
                    path: 'data.diffuseMapChannel',
                    type: 'select',
                    args: {
                        type: 'string',
                        options: [{
                            v: 'r', t: 'R'
                        }, {
                            v: 'g', t: 'G'
                        }, {
                            v: 'b', t: 'B'
                        }, {
                            v: 'a', t: 'A'
                        }, {
                            v: 'rgb', t: 'RGB'
                        }]
                    },
                    reference: 'asset:material:diffuseMapChannel'
                }, {
                    label: 'Offset',
                    path: 'data.diffuseMapOffset',
                    type: 'vec2',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:diffuseMapOffset'
                }, {
                    label: 'Tiling',
                    path: 'data.diffuseMapTiling',
                    type: 'vec2',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:diffuseMapTiling'
                }, {
                    label: 'Vertex Color',
                    path: 'data.diffuseMapVertexColor',
                    type: 'boolean',
                    reference: 'asset:material:diffuseMapVertexColor'
                }, {
                    label: 'Tint',
                    path: 'data.diffuseMapTint',
                    type: 'boolean',
                    reference: 'asset:material:diffuseMapTint'
                }, {
                    label: 'Color',
                    path: 'data.diffuse',
                    type: 'rgb',
                    reference: 'asset:material:diffuse'
                }]
            })
        }]
    }, {
        root: {
            specularPanel: new pcui.Panel({
                headerText: 'SPECULAR',
                collapsible: true,
                collapsed: true
            })
        },
        children: [{
            specularInspector: new pcui.AttributesInspector({
                assets: parent._args.assets,
                history: parent._args.history,
                attributes: [{
                    label: 'Use Metalness',
                    path: 'data.useMetalness',
                    type: 'boolean',
                    reference: 'asset:material:useMetalness'
                }]
            })
        }, {
            metalnessWorkflowInspector: new pcui.AttributesInspector({
                assets: parent._args.assets,
                history: parent._args.history,
                attributes: [{
                    label: 'Metalness',
                    type: 'asset',
                    path: 'data.metalnessMap',
                    args: {
                        assetType: 'texture'
                    },
                    reference: 'asset:material:metalnessMap'
                }, {
                    label: 'UV Channel',
                    path: 'data.metalnessMapUv',
                    type: 'select',
                    args: {
                        type: 'number',
                        options: [{
                            v: 0, t: 'UV0'
                        }, {
                            v: 1, t: 'UV1'
                        }]
                    },
                    reference: 'asset:material:metalnessMapUv'
                }, {
                    label: 'Color Channel',
                    path: 'data.metalnessMapChannel',
                    type: 'select',
                    args: {
                        type: 'string',
                        options: [{
                            v: 'r', t: 'R'
                        }, {
                            v: 'g', t: 'G'
                        }, {
                            v: 'b', t: 'B'
                        }, {
                            v: 'a', t: 'A'
                        }]
                    },
                    reference: 'asset:material:metalnessMapChannel'
                }, {
                    label: 'Offset',
                    path: 'data.metalnessMapOffset',
                    type: 'vec2',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:metalnessMapOffset'
                }, {
                    label: 'Tiling',
                    path: 'data.metalnessMapTiling',
                    type: 'vec2',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:metalnessMapTiling'
                }, {
                    label: 'Vertex Color',
                    path: 'data.metalnessMapVertexColor',
                    type: 'boolean',
                    reference: 'asset:material:metalnessMapVertexColor'
                }, {
                    label: 'Metalness',
                    path: 'data.metalness',
                    type: 'slider',
                    args: {
                        precision: 3,
                        step: 0.05,
                        min: 0,
                        max: 1
                    },
                    reference: 'asset:material:metalness'
                }]
            }),
        }, {
            specularWorkflowInspector: new pcui.AttributesInspector({
                assets: parent._args.assets,
                history: parent._args.history,
                attributes: [{
                    label: 'Specular',
                    path: 'data.specularMap',
                    type: 'asset',
                    args: {
                        assetType: 'texture'
                    },
                    reference: 'asset:material:specularMap'
                }, {
                    label: 'UV Channel',
                    path: 'data.specularMapUv',
                    type: 'select',
                    args: {
                        type: 'number',
                        options: [{
                            v: 0, t: 'UV0'
                        }, {
                            v: 1, t: 'UV1'
                        }]
                    },
                    reference: 'asset:material:specularMapUv'
                }, {
                    label: 'Color Channel',
                    path: 'data.specularMapChannel',
                    type: 'select',
                    args: {
                        type: 'string',
                        options: [{
                            v: 'r', t: 'R'
                        }, {
                            v: 'g', t: 'G'
                        }, {
                            v: 'b', t: 'B'
                        }, {
                            v: 'a', t: 'A'
                        }, {
                            v: 'rgb', t: 'RGB'
                        }]
                    },
                    reference: 'asset:material:specularMapChannel'
                }, {
                    label: 'Offset',
                    path: 'data.specularMapOffset',
                    type: 'vec2',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:specularMapOffset'
                }, {
                    label: 'Tiling',
                    path: 'data.specularMapTiling',
                    type: 'vec2',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:specularMapTiling'
                }, {
                    label: 'Vertex Color',
                    path: 'data.specularMapVertexColor',
                    type: 'boolean',
                    reference: 'asset:material:specularMapVertexColor'
                }, {
                    label: 'Tint',
                    path: 'data.specularMapTint',
                    type: 'boolean',
                    reference: 'asset:material:specularMapTint'
                }, {
                    label: 'Color',
                    path: 'data.specular',
                    type: 'rgb',
                    reference: 'asset:material:specular'
                }]
            })
        }, {
            glossInspector: new pcui.AttributesInspector({
                assets: parent._args.assets,
                history: parent._args.history,
                attributes: [{
                    type: 'divider'
                }, {
                    label: 'Glossiness',
                    path: 'data.glossMap',
                    type: 'asset',
                    args: {
                        assetType: 'texture'
                    },
                    reference: 'asset:material:glossMap'
                }, {
                    label: 'UV Channel',
                    path: 'data.glossMapUv',
                    type: 'select',
                    args: {
                        type: 'number',
                        options: [{
                            v: 0, t: 'UV0'
                        }, {
                            v: 1, t: 'UV1'
                        }]
                    },
                    reference: 'asset:material:glossMapUv'
                }, {
                    label: 'Color Channel',
                    path: 'data.glossMapChannel',
                    type: 'select',
                    args: {
                        type: 'string',
                        options: [{
                            v: 'r', t: 'R'
                        }, {
                            v: 'g', t: 'G'
                        }, {
                            v: 'b', t: 'B'
                        }, {
                            v: 'a', t: 'A'
                        }]
                    },
                    reference: 'asset:material:glossMapChannel'
                }, {
                    label: 'Offset',
                    path: 'data.glossMapOffset',
                    type: 'vec2',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:glossMapOffset'
                }, {
                    label: 'Tiling',
                    path: 'data.glossMapTiling',
                    type: 'vec2',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:glossMapTiling'
                }, {
                    label: 'Vertex Color',
                    path: 'data.glossMapVertexColor',
                    type: 'boolean',
                    reference: 'asset:material:glossMapVertexColor'
                }, {
                    label: 'Glossiness',
                    path: 'data.shininess',
                    type: 'slider',
                    args: {
                        precision: 2,
                        step: 0.5,
                        min: 0,
                        max: 100
                    },
                    reference: 'asset:material:shininess'
                }]
            })
        }]
    }, {
        root: {
            emissivePanel: new pcui.Panel({
                headerText: 'EMISSIVE',
                collapsible: true,
                collapsed: true
            })
        },
        children: [{
            emissiveInspector: new pcui.AttributesInspector({
                assets: parent._args.assets,
                history: parent._args.history,
                attributes: [{
                    label: 'Emissive',
                    path: 'data.emissiveMap',
                    type: 'asset',
                    args: {
                        assetType: 'texture',
                    },
                    reference: 'asset:material:emissiveMap'
                }, {
                    label: 'UV Channel',
                    path: 'data.emissiveMapUv',
                    type: 'select',
                    args: {
                        type: 'number',
                        options: [{
                            v: 0, t: 'UV0'
                        }, {
                            v: 1, t: 'UV1'
                        }]
                    },
                    reference: 'asset:material:emissiveMapUv'
                }, {
                    label: 'Color Channel',
                    path: 'data.emissiveMapChannel',
                    type: 'select',
                    args: {
                        type: 'string',
                        options: [{
                            v: 'r', t: 'R'
                        }, {
                            v: 'g', t: 'G'
                        }, {
                            v: 'b', t: 'B'
                        }, {
                            v: 'a', t: 'A'
                        }, {
                            v: 'rgb', t: 'RGB'
                        }]
                    },
                    reference: 'asset:material:emissiveMapChannel'
                }, {
                    label: 'Offset',
                    path: 'data.emissiveMapOffset',
                    type: 'vec2',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:emissiveMapOffset'
                }, {
                    label: 'Tiling',
                    path: 'data.emissiveMapTiling',
                    type: 'vec2',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:emissiveMapTiling'
                }, {
                    label: 'Vertex Color',
                    path: 'data.emissiveMapVertexColor',
                    type: 'boolean',
                    reference: 'asset:material:emissiveMapVertexColor'
                }, {
                    label: 'Tint',
                    path: 'data.emissiveMapTint',
                    type: 'boolean',
                    reference: 'asset:material:emissiveMapTint'
                }, {
                    label: 'Color',
                    path: 'data.emissive',
                    type: 'rgb',
                    reference: 'asset:material:emissive'
                }, {
                    label: 'Intensity',
                    type: 'slider',
                    path: 'data.emissiveIntensity',
                    args: {
                        precision: 2,
                        step: 0.1,
                        min: 0,
                        max: 10
                    },
                    reference: 'asset:material:emissiveIntensity'
                }]
            })
        }]
    }, {
        root: {
            opacityPanel: new pcui.Panel({
                headerText: 'OPACITY',
                collapsible: true,
                collapsed: true
            })
        },
        children: [{
            opacityInspector: new pcui.AttributesInspector({
                assets: parent._args.assets,
                history: parent._args.history,
                attributes: [{
                    label: 'Blend Type',
                    path: 'data.blendType',
                    type: 'select',
                    args: {
                        type: 'number',
                        options: [{
                            v: 3, t: 'None'
                        }, {
                            v: 2, t: 'Alpha'
                        }, {
                            v: 1, t: 'Additive'
                        }, {
                            v: 6, t: 'Additive Alpha'
                        }, {
                            v: 8, t: 'Screen'
                        }, {
                            v: 4, t: 'Premultiplied Alpha'
                        }, {
                            v: 5, t: 'Multiply'
                        }, {
                            v: 7, t: 'Modulate 2x'
                        }, {
                            v: 9, t: 'Min (Partial Support)'
                        }, {
                            v: 10, t: 'Max (Partial Support)'
                        }]
                    },
                    reference: 'asset:material:blendType'
                }, {
                    label: 'Opacity',
                    path: 'data.opacityMap',
                    type: 'asset',
                    args: {
                        assetType: 'texture'
                    },
                    reference: 'asset:material:opacityMap'
                }, {
                    label: 'UV Channel',
                    path: 'data.opacityMapUv',
                    type: 'select',
                    args: {
                        type: 'number',
                        options: [{
                            v: 0, t: 'UV0'
                        }, {
                            v: 1, t: 'UV1'
                        }]
                    },
                    reference: 'asset:material:opacityMapUv'
                }, {
                    label: 'Color Channel',
                    path: 'data.opacityMapChannel',
                    type: 'select',
                    args: {
                        type: 'string',
                        options: [{
                            v: 'r', t: 'R'
                        }, {
                            v: 'g', t: 'G'
                        }, {
                            v: 'b', t: 'B'
                        }, {
                            v: 'a', t: 'A'
                        }]
                    },
                    reference: 'asset:material:opacityMapChannel'
                }, {
                    label: 'Offset',
                    path: 'data.opacityMapOffset',
                    type: 'vec2',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:opacityMapOffset'
                }, {
                    label: 'Tiling',
                    path: 'data.opacityMapTiling',
                    type: 'vec2',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:opacityMapTiling'
                }, {
                    label: 'Vertex Color',
                    path: 'data.opacityMapVertexColor',
                    type: 'boolean',
                    reference: 'asset:material:opacityMapVertexColor'
                }, {
                    label: 'Intensity',
                    path: 'data.opacity',
                    type: 'slider',
                    args: {
                        precision: 3,
                        step: 0.05,
                        min: 0,
                        max: 1
                    },
                    reference: 'asset:material:opacity'
                }, {
                    label: 'Alpha Test',
                    path: 'data.alphaTest',
                    type: 'slider',
                    args: {
                        precision: 3,
                        step: 0.05,
                        min: 0,
                        max: 1
                    },
                    reference: 'asset:material:alphaTest'
                }, {
                    label: 'Alpha To Coverage',
                    path: 'data.alphaToCoverage',
                    type: 'boolean',
                    reference: 'asset:material:alphaToCoverage'
                }]
            })
        }]
    }, {
        root: {
            normalsPanel: new pcui.Panel({
                headerText: 'NORMALS',
                collapsible: true,
                collapsed: true
            })
        },
        children: [{
            normalsInspector: new pcui.AttributesInspector({
                assets: parent._args.assets,
                history: parent._args.history,
                attributes: [{
                    label: 'Normals',
                    path: 'data.normalMap',
                    type: 'asset',
                    args: {
                        assetType: 'texture'
                    },
                    reference: 'asset:material:normalMap'
                }, {
                    label: 'UV Channel',
                    path: 'data.normalMapUv',
                    type: 'select',
                    args: {
                        type: 'number',
                        options: [{
                            v: 0, t: 'UV0'
                        }, {
                            v: 1, t: 'UV1'
                        }]
                    },
                    reference: 'asset:material:normalMapUv'
                }, {
                    label: 'Offset',
                    path: 'data.normalMapOffset',
                    type: 'vec2',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:normalMapOffset'
                }, {
                    label: 'Tiling',
                    path: 'data.normalMapTiling',
                    type: 'vec2',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:normalMapTiling'
                }, {
                    label: 'Bumpiness',
                    path: 'data.bumpMapFactor',
                    type: 'slider',
                    args: {
                        precision: 3,
                        step: 0.05,
                        min: 0,
                        max: 2
                    },
                    reference: 'asset:material:bumpiness'
                }]
            })
        }]
    }, {
        root: {
            parallaxPanel: new pcui.Panel({
                headerText: 'PARALLAX',
                collapsible: true,
                collapsed: true
            })
        },
        children: [{
            parallaxInspector: new pcui.AttributesInspector({
                assets: parent._args.assets,
                history: parent._args.history,
                attributes: [{
                    label: 'Heightmap',
                    path: 'data.heightMap',
                    type: 'asset',
                    args: {
                        assetType: 'texture'
                    },
                    reference: 'asset:material:heightMap'
                }, {
                    label: 'UV Channel',
                    path: 'data.heightMapUv',
                    type: 'select',
                    args: {
                        type: 'number',
                        options: [{
                            v: 0, t: 'UV0'
                        }, {
                            v: 1, t: 'UV1'
                        }]
                    },
                    reference: 'asset:material:heightMapUv'
                }, {
                    label: 'Color Channel',
                    path: 'data.heightMapChannel',
                    type: 'select',
                    args: {
                        type: 'string',
                        options: [{
                            v: 'r', t: 'R'
                        }, {
                            v: 'g', t: 'G'
                        }, {
                            v: 'b', t: 'B'
                        }, {
                            v: 'a', t: 'A'
                        }]
                    },
                    reference: 'asset:material:heightMapChannel'
                }, {
                    label: 'Offset',
                    path: 'data.heightMapOffset',
                    type: 'vec2',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:heightMapOffset'
                }, {
                    label: 'Tiling',
                    path: 'data.heightMapTiling',
                    type: 'vec2',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:heightMapTiling'
                }, {
                    label: 'Strength',
                    path: 'data.heightMapFactor',
                    type: 'slider',
                    args: {
                        precision: 3,
                        step: 0.05,
                        min: 0,
                        max: 2
                    },
                    reference: 'asset:material:heightMapFactor'
                }]
            })
        }]
    }, {
        root: {
            envPanel: new pcui.Panel({
                headerText: 'ENVIRONMENT',
                collapsible: true,
                collapsed: true
            })
        },
        children: [{
            envInspector: new pcui.AttributesInspector({
                assets: parent._args.assets,
                history: parent._args.history,
                attributes: [{
                    label: 'Sphere Map',
                    path: 'data.sphereMap',
                    type: 'asset',
                    args: {
                        assetType: 'texture'
                    },
                    reference: 'asset:material:sphereMap'
                }, {
                    label: 'Cube Map',
                    path: 'data.cubeMap',
                    type: 'asset',
                    args: {
                        assetType: 'cubemap'
                    },
                    reference: 'asset:material:cubeMap'
                }, {
                    label: 'Reflectivity',
                    path: 'data.reflectivity',
                    type: 'slider',
                    args: {
                        precision: 3,
                        step: 0.01,
                        min: 0,
                        sliderMax: 8
                    },
                    reference: 'asset:material:reflectivity'
                }, {
                    label: 'Refraction',
                    path: 'data.refraction',
                    type: 'slider',
                    args: {
                        precision: 3,
                        step: 0.01,
                        min: 0,
                        max: 1
                    },
                    reference: 'asset:material:refraction'
                }, {
                    label: 'Index Of Refraction',
                    path: 'data.refractionIndex',
                    type: 'slider',
                    args: {
                        precision: 3,
                        step: 0.01,
                        min: 0,
                        max: 1
                    },
                    reference: 'asset:material:refractionIndex'
                }, {
                    type: 'divider'
                }, {
                    label: 'Projection',
                    path: 'data.cubeMapProjection',
                    type: 'select',
                    args: {
                        type: 'number',
                        options: [{
                            v: 0, t: 'Normal'
                        }, {
                            v: 1, t: 'Box'
                        }]
                    },
                    reference: 'asset:material:cubeMapProjection'
                }, {
                    label: 'Center',
                    path: 'data.cubeMapProjectionBox.center',
                    type: 'vec3',
                    args: {
                        placeholder: ['x', 'y', 'z']
                    },
                    reference: 'asset:material:cubeMapProjectionBoxCenter'
                }, {
                    label: 'Half Extents',
                    path: 'data.cubeMapProjectionBox.halfExtents',
                    type: 'vec3',
                    args: {
                        placeholder: ['w', 'h', 'd']
                    },
                    reference: 'asset:material:cubeMapProjectionBoxHalfExtents'
                }]
            })
        }]
    }, {
        root: {
            lightmapPanel: new pcui.Panel({
                headerText: 'LIGHTMAP',
                collapsible: true,
                collapsed: true
            })
        },
        children: [{
            lightmapInspector: new pcui.AttributesInspector({
                assets: parent._args.assets,
                history: parent._args.history,
                attributes: [{
                    label: 'Lightmap',
                    path: 'data.lightMap',
                    type: 'asset',
                    args: {
                        assetType: 'texture'
                    },
                    reference: 'asset:material:lightMap'
                }, {
                    label: 'UV Channel',
                    path: 'data.lightMapUv',
                    type: 'select',
                    args: {
                        type: 'number',
                        options: [{
                            v: 0, t: 'UV0'
                        }, {
                            v: 1, t: 'UV1'
                        }]
                    },
                    reference: 'asset:material:lightMapUv'
                }, {
                    label: 'Color Channel',
                    path: 'data.lightMapChannel',
                    type: 'select',
                    args: {
                        type: 'string',
                        options: [{
                            v: 'r', t: 'R'
                        }, {
                            v: 'g', t: 'G'
                        }, {
                            v: 'b', t: 'B'
                        }, {
                            v: 'a', t: 'A'
                        }, {
                            v: 'rgb', t: 'RGB'
                        }]
                    },
                    reference: 'asset:material:lightMapChannel'
                }, {
                    label: 'Offset',
                    path: 'data.lightMapOffset',
                    type: 'vec2',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:lightMapOffset'
                }, {
                    label: 'Tiling',
                    path: 'data.lightMapTiling',
                    type: 'vec2',
                    args: {
                        placeholder: ['U', 'V']
                    },
                    reference: 'asset:material:lightMapTiling'
                }, {
                    label: 'Vertex Color',
                    path: 'data.lightMapVertexColor',
                    type: 'boolean',
                    reference: 'asset:material:lightMapVertexColor'
                }]
            })
        }]
    }, {
        root: {
            otherPanel: new pcui.Panel({
                headerText: 'OTHER',
                collapsible: true,
                collapsed: true
            })
        },
        children: [{
            otherInspector: new pcui.AttributesInspector({
                assets: parent._args.assets,
                history: parent._args.history,
                attributes: [{
                    label: 'Depth Test',
                    path: 'data.depthTest',
                    type: 'boolean',
                    reference: 'asset:material:depthTest'
                }, {
                    label: 'Depth Write',
                    path: 'data.depthWrite',
                    type: 'boolean',
                    reference: 'asset:material:depthWrite'
                }, {
                    label: 'Cull Mode',
                    path: 'data.cull',
                    type: 'select',
                    args: {
                        type: 'number',
                        options: [{
                            v: 0, t: 'None'
                        }, {
                            v: 1, t: 'Back Faces'
                        }, {
                            v: 2, t: 'Front Faces'
                        }]
                    },
                    reference: 'asset:material:cull'
                }, {
                    label: 'Use Fog',
                    path: 'data.useFog',
                    type: 'boolean',
                    reference: 'asset:material:useFog'
                }, {
                    label: 'Use Lighting',
                    path: 'data.useLighting',
                    type: 'boolean',
                    reference: 'asset:material:useLighting'
                }, {
                    label: 'Use Skybox',
                    path: 'data.useSkybox',
                    type: 'boolean',
                    reference: 'asset:material:useSkybox'
                }, {
                    label: 'Use Gamma & Tonemap',
                    path: 'data.useGammaTonemap',
                    type: 'boolean',
                    reference: 'asset:material:useGammaTonemap'
                }]
            })
        }]
    }];

    const MAPS = {
        'ao': 'ambientInspector',
        'diffuse': 'diffuseInspector',
        'specular': 'specularWorkflowInspector',
        'emissive': 'emissiveInspector',
        'normal': 'normalsInspector',
        'opacity': 'opacityInspector',
        'height': 'parallaxInspector',
        'light': 'lightmapInspector',
        'metalness': 'metalnessWorkflowInspector',
        'gloss': 'glossInspector'
    };

    const COLLAPSED_PANEL_DEPENDENCIES = {
        '_offsetTilingPanel': ['diffuseMapOffset', 'diffuseMapTiling'],
        '_ambientPanel': ['aoMap'],
        '_diffusePanel': ['diffuseMap'],
        '_specularPanel': ['specularMap', 'metalnessMap', 'glossMap'],
        '_emissivePanel': ['emissiveMap'],
        '_opacityPanel': ['opacityMap'],
        '_normalsPanel': ['normalMap'],
        '_parallaxPanel': ['heightMap'],
        '_envPanel': ['sphereMap', 'cubeMap'],
        '_lightmapPanel': ['lightMap']
    };

    const BULK_SLOTS = {
        'ao': ['a', 'ao', 'ambient', 'ambientocclusion', 'gma', 'gmat', 'gmao', 'gmaa', 'rma', 'rmat', 'rmao', 'rmaa'],
        'diffuse': ['d', 'diff', 'diffuse', 'albedo', 'color', 'rgb', 'rgba'],
        'specular': ['s', 'spec', 'specular'],
        'metalness': ['m', 'met', 'metal', 'metalness', 'gma', 'gmat', 'gmao', 'gmaa', 'rma', 'rmat', 'rmao', 'rmaa'],
        'gloss': ['g', 'gloss', 'glossiness', 'gma', 'gmat', 'gmao', 'gmaa', 'rma', 'rmat', 'rmao', 'rmaa'],
        'emissive': ['e', 'emissive'],
        'opacity': ['o', 't', 'opacity', 'alpha', 'transparency', 'gmat', 'gmao', 'gmaa', 'rgba', 'rmat', 'rmao', 'rmaa'],
        'normal': ['n', 'norm', 'normal', 'normals'],
        'height': ['p', 'h', 'height', 'parallax', 'bump'],
        'light': ['l', 'lm', 'light', 'lightmap']
    };

    const POSTFIX_TO_BULK_SLOT = {};
    for (const key in BULK_SLOTS) {
        for (let i = 0; i < BULK_SLOTS[key].length; i++) {
            POSTFIX_TO_BULK_SLOT[BULK_SLOTS[key][i]] = POSTFIX_TO_BULK_SLOT[BULK_SLOTS[key][i]] || [];
            POSTFIX_TO_BULK_SLOT[BULK_SLOTS[key][i]].push(key);
        }
    }

    const REGEX_EXT = /\.[a-z]+$/;

    class MaterialAssetInspector extends pcui.Container {
        constructor(args) {
            args = Object.assign({}, args);

            super(args);

            this._args = args;

            this.class.add(CLASS_ROOT);

            this.buildDom(DOM(this));

            this._assets = null;
            this._suppressToggleFields = false;
            this._suppressOffsetAndTilingFields = false;
            this._suppressTimeout = null;

            this._collapsedStates = {};
            this._collapseEvents = [];

            this._texturesBeforeHover = {};
            this._hoverEvents = [];

            this._assetEvents = [];

            const toggleFields = this._toggleFields.bind(this);

            this._offsetTilingInspector.getField('applyToAllMaps').on('change', this._onChangeApplyToAll.bind(this));
            this._offsetTilingInspector.getField('offset').on('change', this._onChangeOffset.bind(this));
            this._offsetTilingInspector.getField('tiling').on('change', this._onChangeTiling.bind(this));

            this._opacityInspector.getField('data.blendType').on('change', toggleFields);
            this._opacityInspector.getField('data.opacityMapVertexColor').on('change', toggleFields);

            this._specularInspector.getField('data.useMetalness').on('change', toggleFields);

            for (const map in MAPS) {
                const inspector = this[`_${MAPS[map]}`];
                const field = inspector.getField(`data.${map}Map`);
                field.on('change', value => this._onTextureChange(map, value));
                field.dragEnterFn = (type, data) => this._onTextureDragEnter(`${map}Map`, type, data);
                field.dragLeaveFn = () => this._onTextureDragLeave(`${map}Map`);
            }

            this._envInspector.getField('data.cubeMap').on('change', toggleFields);
            this._envInspector.getField('data.sphereMap').on('change', toggleFields);
            this._envInspector.getField('data.cubeMapProjection').on('change', toggleFields);
        }

        _toggleFields() {
            if (this._suppressToggleFields) return;

            const applyToAllMaps = this._offsetTilingInspector.getField('applyToAllMaps').value;

            this._offsetTilingInspector.getField('offset').parent.hidden = !applyToAllMaps;
            this._offsetTilingInspector.getField('tiling').parent.hidden = !applyToAllMaps;

            for (const map in MAPS) {
                const inspector = this[`_${MAPS[map]}`];
                const mapValue = inspector.getField(`data.${map}Map`).value;
                inspector.getField(`data.${map}MapOffset`).parent.hidden = !mapValue || applyToAllMaps;
                inspector.getField(`data.${map}MapTiling`).parent.hidden = !mapValue || applyToAllMaps;
            }

            this._ambientInspector.getField('data.occludeSpecular').parent.hidden = !this._ambientInspector.getField('data.aoMap').value;

            const useMetalness = this._specularInspector.getField('data.useMetalness').value;
            this._metalnessWorkflowInspector.hidden = !useMetalness;
            this._specularWorkflowInspector.hidden = useMetalness;

            const blendType = this._opacityInspector.getField('data.blendType').value;
            this._opacityInspector.getField('data.opacity').parent.hidden = ([2, 4, 6].indexOf(blendType) === -1);

            const opacityMap = this._opacityInspector.getField('data.opacityMap').value;
            const opacityVertexColor = this._opacityInspector.getField('data.opacityMapVertexColor').value;
            this._opacityInspector.getField('data.alphaTest').parent.hidden = !opacityMap || opacityVertexColor;

            const normalMap = this._normalsInspector.getField('data.normalMap').value;
            this._normalsInspector.getField('data.bumpMapFactor').parent.hidden = !normalMap;

            const heightMap = this._parallaxInspector.getField('data.heightMap').value;
            this._parallaxInspector.getField('data.heightMapFactor').parent.hidden = !heightMap;

            const cubeMapField = this._envInspector.getField('data.cubeMap');
            const sphereMapField = this._envInspector.getField('data.sphereMap');
            cubeMapField.hidden = !cubeMapField.value && sphereMapField.value;
            sphereMapField.hidden = !sphereMapField.value && cubeMapField.value;

            const cubeMapProjectField = this._envInspector.getField('data.cubeMapProjection');
            cubeMapProjectField.parent.hidden = !cubeMapField.value;
            const cubeMapCenterField = this._envInspector.getField('data.cubeMapProjectionBox.center');
            cubeMapCenterField.parent.hidden = cubeMapProjectField.parent.hidden || cubeMapProjectField.value === 0;
            this._envInspector.getField('data.cubeMapProjectionBox.halfExtents').parent.hidden = cubeMapCenterField.parent.hidden;
        }

        _getApplyToAllValue() {
            if (!this._assets) return null;

            let offset = null;
            let tiling = null;

            for (let i = 0; i < this._assets.length; i++) {
                for (const map in MAPS) {
                    const currentOffset = this._assets[i].get(`data.${map}MapOffset`);
                    if (offset === null) {
                        offset = currentOffset;
                    }  else if (!offset.equals(currentOffset)) {
                        return false;
                    }

                    const currentTiling = this._assets[i].get(`data.${map}MapTiling`);
                    if (tiling === null) {
                        tiling = currentTiling;
                    }  else if (!tiling.equals(currentTiling)) {
                        return false;
                    }
                }
            }

            return true;
        }

        _onChangeApplyToAll(value) {
            if (!this._assets) return;

            const suppressToggleFields = this._suppressToggleFields;
            if (suppressToggleFields) return;

            this._suppressToggleFields = true;

            if (value) {
                this._suppressOffsetAndTilingFields = true;
                // initialize global offset and tiling to the first asset's diffuse offset and tiling
                const offsetField = this._offsetTilingInspector.getField('offset');
                const tilingField = this._offsetTilingInspector.getField('tiling');

                offsetField.value = this._assets[0].get('data.diffuseMapOffset');
                tilingField.value = this._assets[0].get('data.diffuseMapTiling');

                this._suppressOffsetAndTilingFields = false;

                const offset = offsetField.value;
                const tiling = tilingField.value;

                const assets = this._assets.slice();
                let prev = null;

                const redo = () => {
                    prev = [];
                    assets.forEach(asset => {
                        for (const map in MAPS) {
                            const offsetPath = `data.${map}MapOffset`;
                            const tilingPath = `data.${map}MapTiling`;
                            prev.push({
                                asset: asset,
                                map: map,
                                offset: asset.get(offsetPath),
                                tiling: asset.get(tilingPath)
                            });

                            const history = asset.history.enabled;
                            asset.history.enabled = false;
                            asset.set(offsetPath, offset);
                            asset.set(tilingPath, tiling);
                            asset.history.enabled = history;
                        }
                    });
                };

                const undo = () => {
                    prev.forEach(entry => {
                        const asset = entry.asset.latest();
                        if (!asset) return;

                        const history = asset.history.enabled;
                        asset.history.enabled = false;
                        asset.set(`data.${entry.map}MapOffset`, entry.offset);
                        asset.set(`data.${entry.map}MapTiling`, entry.tiling);
                        asset.history.enabled = history;
                    });

                    prev = null;
                };

                redo();

                if (this._args.history) {
                    this._args.history.add({
                        name: 'assets.materials.tiling-offset',
                        undo: undo,
                        redo: redo
                    });
                }
            }

            this._suppressToggleFields = suppressToggleFields;

            this._toggleFields();
        }

        _updateAllOffsetsOrTilings(value, isOffset) {
            if (!value || !this._assets) return;

            const assets = this._assets.slice();

            let prev = null;

            const postfix = isOffset ? 'MapOffset' : 'MapTiling';

            const redo = () => {
                prev = [];

                assets.forEach(asset => {
                    asset = asset.latest();
                    if (!asset) return;

                    const entry = {
                        asset: asset,
                        values: []
                    };

                    for (const map in MAPS) {
                        const path = `data.${map}${postfix}`;
                        entry.values.push({
                            path: path,
                            value: asset.get(path)
                        });
                    }

                    prev.push(entry);

                    const history = asset.history.enabled;
                    asset.history.enabled = false;

                    for (const map in MAPS) {
                        asset.set(`data.${map}${postfix}`, value);
                    }

                    asset.history.enabled = history;
                });
            };

            const undo = () => {
                prev.forEach(entry => {
                    const asset = entry.asset.latest();
                    if (!asset) return;

                    const history = asset.history.enabled;
                    asset.history.enabled = false;

                    entry.values.forEach(item => {
                        asset.set(item.path, item.value);
                    });

                    asset.history.enabled = history;
                });

                prev = null;
            };

            redo();

            if (this._args.history) {
                this._args.history.add({
                    name: `assets.materials.${postfix}`,
                    undo: undo,
                    redo: redo
                });
            }

        }

        _onChangeOffset(value) {
            if (this._suppressOffsetAndTilingFields) return;
            if (this._offsetTilingInspector.getField('applyToAllMaps').value) {
                this._updateAllOffsetsOrTilings(value, true);
            }
        }

        _onChangeTiling(value) {
            if (this._suppressOffsetAndTilingFields) return;
            if (this._offsetTilingInspector.getField('applyToAllMaps').value) {
                this._updateAllOffsetsOrTilings(value, false);
            }
        }

        _onTextureChange(name, value) {
            if (this._suppressToggleFields) return;

            this._suppressToggleFields = true;

            let prev = [];

            try {
                // depending on the filename of the texture being
                // set, see if we can set more properties as well
                const asset = value ? this._args.assets.get(value) : null;
                if (!asset) return;
                const tokens = this._tokenizeFilename(asset.get('name'));
                if (!tokens) return;

                if (BULK_SLOTS[name].indexOf(tokens[1]) === -1) return;

                const path = asset.get('path');

                const texturesInSamePath = this._args.assets.find(asset => {
                    return asset.get('type') === 'texture' &&
                            !asset.get('source') &&
                            path.equals(asset.get('path'))
                });

                const candidates = {};
                let hasCandidates = false;
                texturesInSamePath.forEach(entry => {
                    const t = this._tokenizeFilename(entry[1].get('name'));

                    if (!t || t[0] !== tokens[0] || !POSTFIX_TO_BULK_SLOT[t[1]]) return;

                    for (let i = 0; i < POSTFIX_TO_BULK_SLOT[t[1]].length; i++) {
                        if (POSTFIX_TO_BULK_SLOT[t[1]][i] === name) continue;

                        candidates[POSTFIX_TO_BULK_SLOT[t[1]][i]] = {
                            texture: entry[1],
                            postfix: t[1]
                        };

                        hasCandidates = true;
                    }
                });

                if (hasCandidates) {
                    const assets = this._assets.slice();

                    assets.forEach(asset => {
                        if (asset.get(`data.${name}Map`)) return;

                        const history = asset.history.enabled;
                        asset.history.enabled = false;

                        for (const slot in candidates) {
                            const key = `data.${slot}Map`;
                            if (asset.get(key)) continue;

                            prev.push({
                                asset: asset,
                                key: key,
                                value: candidates[slot].texture.get('id'),
                                old: null
                            });

                            // expand texture panel
                            const inspector = this[`_${MAPS[slot]}`];
                            if (inspector && inspector.parent && inspector.parent.collapsed) {
                                inspector.parent.collapsed = false;
                            }

                            if (slot === 'ao') {
                                // ao can be in third color channel
                                if (/^(g|r)ma/.test(candidates[slot].postfix)) {
                                    const channel = asset.get('data.aoMapChannel');
                                    if (channel !== 'b') {
                                        prev.push({
                                            asset: asset,
                                            key: 'data.aoMapChannel',
                                            value: 'b',
                                            old: channel
                                        });
                                    }
                                }
                            } else if (slot === 'metalness') {
                                // use metalness
                                if (!asset.get('data.useMetalness')) {
                                    prev.push({
                                        asset: asset,
                                        key: 'data.useMetalness',
                                        value: true,
                                        old: false
                                    });
                                }

                                // metalness to maximum
                                const metalness = asset.get('data.metalness');
                                if (metalness !== 1) {
                                    prev.push({
                                        asset: asset,
                                        key: 'data.metalness',
                                        value: 1.0,
                                        old: metalness
                                    });
                                }

                                // metalness can be in second color channel
                                if (/^(g|r)ma/.test(candidates[slot].postfix)) {
                                    const channel = asset.get('data.metalnessMapChannel');
                                    if (channel !== 'g') {
                                        prev.push({
                                            asset: asset,
                                            key: 'data.metalnessMapChannel',
                                            value: 'g',
                                            old: channel
                                        });
                                    }
                                }
                            } else if (slot === 'gloss') {
                                // gloss to maximum
                                const shininess = asset.get('data.shininess');
                                if (shininess !== 100) {
                                    prev.push({
                                        asset: asset,
                                        key: 'data.shininess',
                                        value: 100.0,
                                        old: shininess
                                    });
                                }

                                // gloss shall be in first color channel
                                const channel = asset.get('data.glossMapChannel');
                                if (channel !== 'r') {
                                    prev.push({
                                        asset: asset,
                                        key: 'data.glossMapChannel',
                                        value: 'r',
                                        old: channel
                                    });
                                }
                            } else if (slot === 'opacity') {
                                // opacity can be in fourth color channel
                                if (/^(gma|rma|rgb)(t|o|a)$/.test(candidates[slot].postfix)) {
                                    const channel = asset.get('data.opacityMapChannel');
                                    if (channel !== 'a') {
                                        prev.push({
                                            asset: asset,
                                            key: 'data.opacityMapChannel',
                                            value: 'a',
                                            old: channel
                                        });
                                    }
                                }
                            }
                        }

                        asset.history.enabled = history;
                    });

                    const redo = () => {
                        let dirty = false;
                        prev.forEach(record => {
                            const asset = record.asset.latest();
                            if (!asset) return;

                            const history = asset.history.enabled;
                            asset.history.enabled = false;
                            asset.set(record.key, record.value);
                            asset.history.enabled = history;

                            dirty = true;
                        });

                        return dirty;
                    };

                    const undo = () => {
                        prev.forEach(record => {
                            const asset = record.asset.latest();
                            if (!asset) return;

                            const history = asset.history.enabled;
                            asset.history.enabled = false;
                            asset.set(record.key, record.old);
                            asset.history.enabled = history;

                        });
                    };

                    if (redo() && this._args.history) {
                        this._args.history.add({
                            name: 'material textures auto-bind',
                            undo: undo,
                            redo: redo
                        });
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (prev.length) {
                    // if we have set other textures
                    // then we need to wait for their input fields to fire the
                    // change event before we can reset the suppressToggleFields flag.
                    // This is because the observer->element binding updates the element
                    // in a timeout.
                    if (!this._suppressTimeout) {
                        this._suppressTimeout = setTimeout(() => {
                            this._suppressTimeout = null;
                            this._suppressToggleFields = false;
                            this._toggleFields();
                        });
                    }
                } else {
                    this._suppressToggleFields = false;
                    this._toggleFields();
                }
            }
        }

        _tokenizeFilename(filename) {
            filename = filename.trim().toLowerCase();

            if (!filename)
                return;

            // drop extension
            const ext = filename.match(REGEX_EXT);
            if (ext) filename = filename.slice(0, -ext[0].length);

            if (!filename)
                return;

            const parts = filename.split(/(\-|_|\.)/g);
            const tokens = [];

            for (let i = 0; i < parts.length; i++) {
                if (parts[i] === '-' || parts[i] === '_' || parts[i] === '.')
                    continue;

                tokens.push(parts[i]);
            }

            if (!tokens.length)
                return;

            if (tokens.length === 1)
                return ['', tokens[0]];

            const left = tokens.slice(0, -1).join('');
            const right = tokens[tokens.length - 1];

            return [left, right];
        }

        _onTextureDragEnter(path, type, dropData) {
            const app = editor.call('viewport:app');
            if (!app) return;

            if (!this._assets) return;

            const textureAsset = app.assets.get(dropData.id);
            if (!textureAsset) return;

            app.assets.load(textureAsset);

            const previewTexture = (engineAsset) => {
                if (!this._texturesBeforeHover[engineAsset.id]) {
                    this._texturesBeforeHover[engineAsset.id] = {};
                }

                this._texturesBeforeHover[engineAsset.id][path] = engineAsset.resource[path];

                engineAsset.resource[path] = textureAsset.resource;
                engineAsset.resource.update();
            }

            this._assets.forEach(asset => {
                const engineAsset = app.assets.get(asset.get('id'));
                if (!engineAsset) return;

                app.assets.load(engineAsset);

                if (!engineAsset.resource) return;

                if (textureAsset.resource) {
                    previewTexture(engineAsset);
                } else {
                    const evt = {
                        asset: textureAsset,
                        fn: () => {
                            previewTexture(engineAsset);
                            editor.call('viewport:render');
                        }
                    };
                    textureAsset.once('load', evt.fn);
                    this._hoverEvents.push(evt);
                }
            });


            editor.call('viewport:render');
        }

        _onTextureDragLeave(path) {
            const app = editor.call('viewport:app');
            if (!app) return;

            if (!this._assets) return;

            this._assets.forEach(asset => {
                const engineAsset = app.assets.get(asset.get('id'));
                if (!engineAsset) return;

                app.assets.load(engineAsset);

                if (!engineAsset.resource || !this._texturesBeforeHover[asset.get('id')]) return;

                engineAsset.resource[path] = this._texturesBeforeHover[asset.get('id')][path];
                engineAsset.resource.update();
            });

            this._texturesBeforeHover = {};
            this._hoverEvents.forEach(evt => { evt.asset.off('load', evt.fn); });
            this._hoverEvents.length = 0;

            editor.call('viewport:render');
        }

        link(assets) {
            this.unlink();

            this._assets = assets;
            if (!this._assets) return;

            this._suppressToggleFields = true;

            this._materialInspector.link(assets);
            this._ambientInspector.link(assets);
            this._diffuseInspector.link(assets);
            this._specularInspector.link(assets);
            this._metalnessWorkflowInspector.link(assets);
            this._specularWorkflowInspector.link(assets);
            this._glossInspector.link(assets);
            this._emissiveInspector.link(assets);
            this._opacityInspector.link(assets);
            this._normalsInspector.link(assets);
            this._parallaxInspector.link(assets);
            this._envInspector.link(assets);
            this._lightmapInspector.link(assets);
            this._otherInspector.link(assets);

            const applyToAllMaps = this._offsetTilingInspector.getField('applyToAllMaps');
            applyToAllMaps.renderChanges = false;
            applyToAllMaps.value = this._getApplyToAllValue();
            applyToAllMaps.renderChanges = true;

            this._suppressOffsetAndTilingFields = true;

            const offset = this._offsetTilingInspector.getField('offset');
            offset.renderChanges = false;
            offset.value = this._assets[0].get('data.diffuseMapOffset');
            offset.renderChanges = true;

            const tiling = this._offsetTilingInspector.getField('tiling');
            tiling.renderChanges = false;
            tiling.value = this._assets[0].get('data.diffuseMapTiling');
            tiling.renderChanges = true;

            this._suppressOffsetAndTilingFields = false;

            this._suppressToggleFields = false;

            this._toggleFields();

            if (this._suppressTimeout) {
                clearTimeout(this._suppressTimeout);
                this._suppressTimeout = null;
            }

            // set collapsed states for panels
            const collapsedStatesId = this._assets.map(asset => asset.get('id')).sort((a, b) => a - b).join(',');
            let previousState = this._collapsedStates[collapsedStatesId];
            if (!previousState) {
                previousState = {};
                this._collapsedStates[collapsedStatesId] = previousState;

                for (const panelName in COLLAPSED_PANEL_DEPENDENCIES) {
                    let collapsed = true;

                    for (let i = 0; i < COLLAPSED_PANEL_DEPENDENCIES[panelName].length; i++) {
                        const field = COLLAPSED_PANEL_DEPENDENCIES[panelName][i];
                        for (let j = 0; j < this._assets.length; j++) {
                            const type = editor.call('schema:material:getType', field);
                            if (type === 'asset') {
                                if (this._assets[j].get('data.' + field)) {
                                    collapsed = false;
                                    break;
                                }
                            } else if (type === 'vec2') {
                                const value = this._assets[j].get('data.'+ field);
                                const defaultValue = editor.call('schema:material:getDefaultValueForField', field);
                                if (value && value[0] !== defaultValue[0] || value && value[1] !== defaultValue[1]) {
                                    collapsed = false;
                                    break;
                                }
                            }
                        }

                        if (!collapsed) {
                            break;
                        }
                    }

                    previousState[panelName] = collapsed;
                }
            }

            for (const panelName in COLLAPSED_PANEL_DEPENDENCIES) {
                this[panelName].collapsed = previousState[panelName];

                // listen to collapse / expand events and update stored state
                this._collapseEvents.push(this[panelName].on('collapse', () => {
                    previousState[panelName] = true;
                }));

                this._collapseEvents.push(this[panelName].on('expand', () => {
                    previousState[panelName] = false;
                }));
            }

            // update fresnel model when shader changes
            this._assets.forEach(asset => {
                this._assetEvents.push(asset.on('data.shader:set', value => {
                    const history = asset.history.enabled;
                    asset.history.enabled = false;
                    asset.set('data.fresnelModel', value === 'blinn' ? 2 : 0);
                    asset.history.enabled = history;
                }));
            });

        }

        unlink() {
            if (!this._assets) return;

            this._assets = null;

            this._assetEvents.forEach(e => e.unbind());
            this._assetEvents.length = 0;

            this._collapseEvents.forEach(e => e.unbind());
            this._collapseEvents.length = 0;

            this._hoverEvents.forEach(evt => evt.asset.off('load', evt.fn));
            this._hoverEvents.length = 0;
            this._texturesBeforeHover = {};

            this._materialInspector.unlink();
            this._ambientInspector.unlink();
            this._diffuseInspector.unlink();
            this._specularInspector.unlink();
            this._metalnessWorkflowInspector.unlink();
            this._specularWorkflowInspector.unlink();
            this._glossInspector.unlink();
            this._emissiveInspector.unlink();
            this._opacityInspector.unlink();
            this._normalsInspector.unlink();
            this._parallaxInspector.unlink();
            this._envInspector.unlink();
            this._lightmapInspector.unlink();
            this._otherInspector.unlink();
        }

        destroy() {
            if (this._destroyed) return;

            this._collapsedStates = {};

            super.destroy();
        }
    }

    return {
        MaterialAssetInspector: MaterialAssetInspector
    };
})());


/* editor/inspector/assets/material-preview.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_CANVAS = 'pcui-asset-preview-canvas';
    const CLASS_CANVAS_FLIP = 'pcui-asset-preview-canvas-flip';

    class MaterialAssetInspectorPreview extends pcui.AssetInspectorPreviewBase {
        constructor(args) {
            super(args);

            this._preview = new pcui.Canvas();
            this._preview.dom.width = 320;
            this._preview.dom.height = 144;
            this._preview.class.add(CLASS_CANVAS, CLASS_CANVAS_FLIP);
            this.append(this._preview);

            this._previewModel = 'sphere';
            this._previewRenderer = null;

            this._renderFrame = null;
            this._previewRotation = [-15, 45];
            this._sx = 0;
            this._sy = 0;
            this._x = 0;
            this._y = 0;
            this._nx = 0;
            this._ny = 0;
        }

        // queue up the rendering to prevent too often renders
        _queueRender() {
            if (this._renderFrame) return;
            this._renderFrame = requestAnimationFrame(this._renderPreview.bind(this));
        }

        _renderPreview() {
            if (this._renderFrame) {
                cancelAnimationFrame(this._renderFrame);
                this._renderFrame = null;
            }

            if (this.dom.offsetWidth !== 0 && this.dom.offsetHeight !== 0) {
                this._preview.dom.width = this.dom.offsetWidth;
                this._preview.dom.height = this.dom.offsetHeight;
            }

            this._previewRenderer.render(
                Math.max(-90, Math.min(90, this._previewRotation[0] + (this._sy - this._y) * 0.3)),
                this._previewRotation[1] + (this._sx - this._x) * 0.3,
                this._previewModel
            );
        }

        _onMouseDown(evt) {
            super._onMouseDown(evt);

            if (this._mouseDown) {
                this._sx = this._x = evt.clientX;
                this._sy = this._y = evt.clientY;
            }
        }

        _onMouseMove(evt) {
            super._onMouseMove(evt);

            if (this._dragging) {
                this._nx = this._x - evt.clientX;
                this._ny = this._y - evt.clientY;
                this._x = evt.clientX;
                this._y = evt.clientY;

                this._queueRender();
            }
        }

        _onMouseUp(evt) {
            if (this._dragging) {
                if ((Math.abs(this._sx - this._x) + Math.abs(this._sy - this._y)) < 8) {
                    this._preview.dom.height = this.height;
                }

                this._previewRotation[0] = Math.max(-90, Math.min(90, this._previewRotation[0] + ((this._sy - this._y) * 0.3)));
                this._previewRotation[1] += (this._sx - this._x) * 0.3;
                this._sx = this._sy = this._x = this._y = 0;

                this._queueRender();
            }

            super._onMouseUp(evt);
        }

        _toggleSize() {
            super._toggleSize();
            this._queueRender();
        }

        updatePreview() {
            this._queueRender();
        }

        link(assets) {
            this.unlink();
            super.link();

            this._previewRenderer = new pcui.MaterialThumbnailRenderer(assets[0], this._preview.dom);
            this._queueRender();
        }

        unlink() {
            super.unlink();

            if (this._previewRenderer) {
                this._previewRenderer.destroy();
                this._previewRenderer = null;
            }
            if (this._renderFrame) {
                cancelAnimationFrame(this._renderFrame);
                this._renderFrame = null;
            }
        }
    }

    return {
        MaterialAssetInspectorPreview: MaterialAssetInspectorPreview
    };
})());


/* editor/inspector/assets/texture.js */
Object.assign(pcui, (function () {
    'use strict';

    // util
    const makeRefAssigner = (prefix = '') => attr => {
        if (attr.hasOwnProperty('reference')) return;

        const path = attr.alias || attr.path;
        if (!path) return;

        const parts = path.split('.');
        attr.reference = `${prefix}${parts[parts.length - 1]}`;
    };

    const CLASS_ROOT = 'asset-texture-inspector';
    const CLASS_COMPRESS_BUTTON = CLASS_ROOT + '-compress-button';

    const TEXTURE_ATTRIBUTES = [
        {
            label: "Width",
            path: "meta.width",
            type: "label",
            args: {
                placeholder: "pixels"
            }
        },
        {
            label: "Height",
            path: "meta.height",
            type: "label",
            args: {
                placeholder: "pixels"
            }
        },
        {
            label: "Depth",
            path: "meta.depth",
            type: "label",
            args: {
                placeholder: "bit"
            }
        },
        {
            label: "Alpha",
            path: "meta.alpha",
            type: "label"
        },
        {
            label: "Interlaced",
            path: "meta.interlaced",
            type: "label"
        },
        {
            label: "Rgbm",
            path: "data.rgbm",
            type: "boolean"
        },
        {
            label: "Mipmaps",
            path: "data.mipmaps",
            type: "boolean",
            reference: null
        },
        {
            label: "Filtering",
            alias: "filtering",
            paths: ["data.minfilter", "data.magfilter"],
            type: "select",
            args: {
                type: "string",
                options: [
                    { v: "nearest", t: "Point" },
                    { v: "linear", t: "Linear" }
                ]
            }
        },
        {
            label: "Anistropy",
            path: "data.anisotropy",
            type: "number"
        },
        {
            label: "Address U",
            path: "data.addressu",
            type: "select",
            reference: "asset:texture:addressU",
            args: {
                type: "string",
                options: [
                    { v: "repeat", t: "Repeat" },
                    { v: "clamp", t: "Clamp" },
                    { v: "mirror", t: "Mirror Repeat" }
                ]
            }
        },
        {
            label: "Address V",
            path: "data.addressv",
            type: "select",
            reference: "asset:texture:addressV",
            args: {
                type: "string",
                options: [
                    { v: "repeat", t: "Repeat" },
                    { v: "clamp", t: "Clamp" },
                    { v: "mirror", t: "Mirror Repeat" }
                ]
            }
        }
    ];
    TEXTURE_ATTRIBUTES.forEach(makeRefAssigner('asset:texture:'));

    const COMPRESSION_BASIS_ATTRIBUTES = [
        {
            label: "Basis",
            path: "meta.compress.basis",
            type: "boolean"
        },
        {
            label: "Normals",
            path: "meta.compress.normals",
            type: "boolean"
        },
        {
            label: "Quality",
            path: "meta.compress.quality",
            type: "select",
            args: {
                type: "number",
                options: [
                    { v: 0, t: "Lowest" },
                    { v: 64, t: "Low" },
                    { v: 128, t: "Default" },
                    { v: 192, t: "High" },
                    { v: 255, t: "Highest" }
                ]
            }
        }
    ];
    COMPRESSION_BASIS_ATTRIBUTES.forEach(makeRefAssigner('asset:texture:compress:'));

    const LEGACY_COMPRESSION_PARAMS = ['dxt', 'pvr', 'etc1', 'etc2'];
    const COMPRESSION_LEGACY_ATTRIBUTES = [
        {
            label: "Legacy",
            type: 'boolean',
            alias: 'compress.legacy'
        },
        {
            label: "Alpha",
            path: "meta.compress.alpha",
            type: "boolean"
        },
        {
            label: "Original",
            type: 'label',
            alias: 'compress.original'
        },
        {
            label: "DXT",
            path: "meta.compress.dxt",
            type: "boolean"
        },
        {
            label: "PVR",
            path: "meta.compress.pvr",
            type: "boolean"
        },
        {
            label: "\xa0",
            path: "meta.compress.pvrBpp",
            type: "select",
            args: {
                type: "number",
                options: [
                    { v: 2, t: '2 BPP' },
                    { v: 4, t: '4 BPP' }
                ]
            }
        },
        {
            label: "ETC1",
            path: "meta.compress.etc1",
            type: "boolean",
            reference: null
        },
        {
            label: "ETC2",
            path: "meta.compress.etc2",
            type: "boolean",
            reference: null
        }
    ];
    COMPRESSION_LEGACY_ATTRIBUTES.forEach(makeRefAssigner('asset:texture:compress:'));

    const DOM = (parent, hasBasis) => [
        {
            root: {
                texturePanel: new pcui.Panel({
                    headerText: 'TEXTURE',
                    collapsible: true,
                })
            },
            children: [
                {
                    root: {
                        btnContainerGetMeta: new pcui.Container({
                            flex: true,
                            flexDirection: 'row',
                            alignItems: 'center'
                        })
                    },
                    children: [
                        {
                            btnGetMeta: new pcui.Button({
                                text: 'CALCULATE META',
                                icon: 'E131',
                                flexGrow: 1,
                            })
                        }
                    ]
                },
                {
                    textureAttributesInspector: new pcui.AttributesInspector({
                        assets: parent._args.assets,
                        history: parent._args.history,
                        attributes: TEXTURE_ATTRIBUTES
                    })
                }
            ]
        },
        {
            root: {
                compressionPanel: new pcui.Panel({
                    headerText: 'COMPRESSION',
                    collapsible: true,
                })
            },
            children: (hasBasis ? [
                {
                    root: {
                        compressionBasisContainer: new pcui.Container()
                    },
                    children: [
                        {
                            compressionBasisAttributesInspector: new pcui.AttributesInspector({
                                assets: parent._args.assets,
                                history: parent._args.history,
                                attributes: COMPRESSION_BASIS_ATTRIBUTES
                            })
                        },
                        {
                            compressionBasisPvrWarning: new pcui.InfoBox({
                                icon: 'E218',
                                title: 'Texture is not square',
                                text: 'This texture does not support PVR compression.'
                            })
                        },
                        {
                            root: {
                                compressBasisBtnContainer: new pcui.Container({
                                    flex: true,
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                })
                            },
                            children: [
                                {
                                    btnCompressBasis: new pcui.Button({
                                        text: 'COMPRESS BASIS',
                                        flexGrow: 1,
                                        class: CLASS_COMPRESS_BUTTON
                                    })
                                }
                            ]
                        },
                        {
                            basisDivider: new pcui.Divider()
                        }
                    ]
                }
            ] : []).concat([
                {
                    root: {
                        compressionLegacyContainer: new pcui.Container()
                    },
                    children: [
                        {
                            compressionLegacyAttributesInspector: new pcui.AttributesInspector({
                                assets: parent._args.assets,
                                history: parent._args.history,
                                attributes: COMPRESSION_LEGACY_ATTRIBUTES
                            })
                        },
                        {
                            root: {
                                compressLegacyBtnContainer: new pcui.Container({
                                    flex: true,
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                })
                            },
                            children: [
                                {
                                    btnCompressLegacy: new pcui.Button({
                                        text: `COMPRESS${hasBasis ? ' LEGACY' : ''}`,
                                        flexGrow: 1,
                                        class: CLASS_COMPRESS_BUTTON
                                    })
                                }
                            ]
                        }
                    ]
                }
            ])
        }
    ];

    const checkCompressRequired = (asset, format) => {
        if (! asset.get('file'))
            return false;

        const data = asset.get('file.variants.' + format);
        const rgbm = asset.get('data.rgbm');
        const alpha = asset.get('meta.compress.alpha') && (asset.get('meta.alpha') || ((asset.get('meta.type') || '').toLowerCase() === 'truecoloralpha')) || rgbm;
        const normals = !!asset.get('meta.compress.normals');
        const compress = asset.get('meta.compress.' + format);
        const mipmaps = asset.get('data.mipmaps');
        const quality = asset.get('meta.compress.quality');

        if (!! data !== compress) {
            if (format === 'etc1' && alpha)
                return false;

            if (rgbm && ! data)
                return false;

            return true;
        } else if (format !== 'basis' && data && ((((data.opt & 1) !== 0) != alpha))) {
            return true;
        }

        if (data && format === 'pvr') {
            const bpp = asset.get('meta.compress.pvrBpp');
            if (data && ((data.opt & 128) !== 0 ? 4 : 2) !== bpp)
                return true;
        } else if (format === 'etc1') {
            if (data && alpha)
                return true;

            if (! data && alpha)
                return false;
        }

        if (data && ((data.opt & 4) !== 0) !== ! mipmaps)
            return true;

        if (format === 'basis' && data) {
            if ((!!(data.opt & 8) !== normals) || (data.quality === undefined) || (data.quality !== quality)) {
                return true;
            }
        }

        return false;
    }

    // custom binding to change multiple paths per observer
    // this has been kept as agnostic as possible to hopefully
    // maybe work back into pcui.BindingElementToObservers
    class MultiPathBindingElementToObservers extends pcui.BindingElementToObservers {
        constructor({ formatters, ...args }) {
            super(args);
            this._valueFormatters = formatters;
        }

        clone() {
            return new MultiPathBindingElementToObservers({
                formatters: this._valueFormatters,
                history: this._history,
                historyPrefix: this._historyPrefix,
                historyPostfix: this._historyPostfix,
                historyName: this._historyName,
                historyCombine: this._historyCombine
            });
        }

        _formatValue(value, path) {
            if (typeof this._valueFormatters[path] === 'function') {
                return this._valueFormatters[path](value);
            }

            return value;
        }

        _latestHasPaths(latest, paths) {
            if (!latest) {
                return false;
            }

            for (let i = 0; i < paths.length; i++) {
                if (!latest.has(paths[i])) {
                    return false;
                }
            }

            return true;
        }

        // Override setValue to set additional fields
        setValue(value) {
            if (this.applyingChange) return;
            if (!this._observers) return;

            this.applyingChange = true;

            // make copy of observers if we are using history
            // so that we can undo on the same observers in the future
            const observers = this._observers.slice();
            const paths = this._paths.slice();

            let previous = new WeakMap();

            const undo = () => {
                for (let i = 0; i < observers.length; i++) {
                    const latest = observers[i].latest();
                    if (!this._latestHasPaths(latest, paths)) continue;

                    let history = false;
                    if (latest.history) {
                        history = latest.history.enabled;
                        latest.history.enabled = false;
                    }
                    const prev = previous.get(observers[i]);
                    paths.forEach(path => {
                        latest.set(path, prev[path]);
                    });

                    if (history) {
                        latest.history.enabled = true;
                    }
                }
            };

            const redo = () => {
                previous = new WeakMap();

                for (let i = 0; i < observers.length; i++) {
                    const latest = observers[i].latest();
                    if (!this._latestHasPaths(latest, paths)) continue;

                    let history = false;
                    if (latest.history) {
                        history = latest.history.enabled;
                        latest.history.enabled = false;
                    }

                    const prev = {};
                    paths.forEach(path => {
                        prev[path] = latest.get(path);
                        latest.set(path, this._formatValue(value, path));
                    });
                    previous.set(observers[i], prev);

                    if (history) {
                        latest.history.enabled = true;
                    }
                }
            };

            if (this._history) {
                this._history.add({
                    name: this._getHistoryActionName(paths),
                    redo: redo,
                    undo: undo
                });
            }

            redo();

            this.applyingChange = false;
        }
    }

    class SizeLabel extends Label {
        constructor({ format, ...args }) {
            super(args);
            this._format = format;
            this.class.add('pcui-size-label');

            // trying to set using super(args) gets overwritten
            // so we manually set renderChanges to false
            this.renderChanges = false;
            this.updateSize();
        }

        updateSize() {
            const format = this._format;
            this.text = (! format.size && ! format.vram)
                ? '-'
                : `${bytesToHuman(format.size)} [VRAM ${bytesToHuman(format.vram)}]`;
        }
    }

    class TextureAssetInspector extends pcui.Container {
        constructor(args) {
            super(args);

            this.class.add(CLASS_ROOT);

            this._args = args;
            this._assets = null;
            this._assetEvents = [];
            this._compressionChangeTicking = false;
            this._compressionChangeTimeout = null;
            this._hasBasis = editor.call('users:hasFlag', 'hasBasisTextures');
            this._hasLegacy = false;

            this._compressionFormats = {
                original: { size: 0, vram: 0 },
                dxt: { size: 0, vram: 0, timeout: false },
                pvr: { size: 0, vram: 0, timeout: false },
                etc1: { size: 0, vram: 0, timeout: false },
                etc2: { size: 0, vram: 0, timeout: false },
                basis: { size: 0, vram: 0, timeout: false }
            };

            // bind methods to context
            this._btnGetMetaVisibility = this._btnGetMetaVisibility.bind(this);
            this._handleAssetChangeCompression = this._handleAssetChangeCompression.bind(this);
            this._handleBtnCompressBasisClick = this._handleBtnCompressBasisClick.bind(this);
            this._handleBtnCompressLegacyClick = this._handleBtnCompressLegacyClick.bind(this);
            this._handleBtnGetMetaClick = this._handleBtnGetMetaClick.bind(this);
            this._showHideLegacyUi = this._showHideLegacyUi.bind(this);
            this._updatePvrWarning = this._updatePvrWarning.bind(this);

            this.buildDom(DOM(this, this._hasBasis));
            this._setupCompressionSubheads();
            this._setupFilteringTwoWayBinding();
            this._setupPanelReferences();
            this._setupSizeLabels();
            this._setupPvrWarning();
            this._btnGetMeta.on('click', this._handleBtnGetMetaClick);

            if (this._btnCompressBasis) {
                this._btnCompressBasis.on('click', this._handleBtnCompressBasisClick);
                this._btnCompressBasis.disabled = true;
            }
            this._btnCompressLegacy.on('click', this._handleBtnCompressLegacyClick);
            this._btnCompressLegacy.disabled = true;
        }

        _btnGetMetaVisibility() {
            const assets = this._assets;

            let visible = false;
            for(let i = 0; i < assets.length; i++) {
                if (! visible && ! assets[i].get('meta')) {
                    visible = true;
                    break;
                }
            }
            this._btnGetMeta.hidden = ! visible;
        }

        _calculateSize(format) {
            const assets = this._assets;
            const formats = this._compressionFormats;

            formats[format].size = 0;
            formats[format].vram = 0;
            for(let i = 0; i < assets.length; i++) {
                if (! assets[i].get('file') || ! assets[i].get('meta'))
                    continue;

                // slighly different handling for original size
                if (format === 'original') {
                    const pixels = (assets[i].get('meta.width') || 0) * (assets[i].get('meta.height') || 0);
                    formats.original.size += (assets[i].get('file.size') || 0);
                    formats.original.vram += pixels * 4;
                    continue;
                }

                const size = assets[i].get('file.variants.' + format + '.size') || 0;
                const sizeGzip = assets[i].get('file.variants.' + format + '.sizeGzip') || 0;

                if (size) {
                    let vram;
                    if (format === 'basis') {
                        const width = assets[i].get('meta.width');
                        const height = assets[i].get('meta.height');
                        const depth = 1;
                        const pixelFormat = pc.PIXELFORMAT_DXT1;
                        const mipmaps = assets[i].get('data.mipmaps');
                        const cubemap = false;
                        vram = pc.Texture.calcGpuSize(width, height, depth, pixelFormat, mipmaps, cubemap);
                    } else {
                        vram = size - 128;
                    }

                    formats[format].vram += vram;
                }

                if (sizeGzip || size) {
                    formats[format].size += (sizeGzip || size) - 128;
                }
            }

            // if there is a size label, trigger a ui update
            if (formats[format].label) {
                formats[format].label.updateSize();
            }
        }

        _queueSizeCalculate(format) {
            const formats = this._compressionFormats;
            if (formats[format].timeout)
                return;

            formats[format].timeout = true;

            setTimeout(() => {
                formats[format].timeout = false;
                this._calculateSize(format);
            }, 0);
        }

        // enable/disable alpha compression field
        _checkCompressAlpha() {
            if (!this._compressionLegacyAttributesInspector) return;

            const compressAlphaField = this._compressionLegacyAttributesInspector.getField('meta.compress.alpha');
            if (!compressAlphaField) return;

            const assets = this._assets;
            if (!Array.isArray(assets) || !assets.length) {
                compressAlphaField.disabled = true;
                return;
            };

            let state = false;
            let different = false;
            for(let i = 0; i < assets.length; i++) {
                const alpha = assets[i].get('meta.alpha') || false;
                const trueColorAlpha = (assets[i].get('meta.type') || '').toLowerCase() === 'truecoloralpha';
                const rgbm = assets[i].get('data.rgbm');

                if (i === 0) {
                    state = (alpha || trueColorAlpha) && ! rgbm;
                } else if (state !== ((alpha || trueColorAlpha) && ! rgbm)) {
                    different = true;
                    break;
                }
            }

            compressAlphaField.disabled = ! different && ! state;
        };

        _checkCompression() {
            const assets = this._assets;
            if (!editor.call('permissions:write') || !Array.isArray(assets) || !assets.length) {
                if (this._btnCompressBasis) {
                    this._btnCompressBasis.disabled = true;
                }
                this._btnCompressLegacy.disabled = true;
                return;
            };

            let differentBasis = false;
            let differentLegacy = false;
            for(let i = 0; i < assets.length; i++) {
                if (! assets[i].get('file') || !! assets[i].get('task'))
                    continue;

                for(let key in this._compressionFormats) {
                    if (key === 'original')
                        continue;

                    if (checkCompressRequired(assets[i], key)) {
                        if (key === 'basis') {
                            differentBasis = true;
                        } else {
                            differentLegacy = true;
                        }

                        if (differentBasis && differentLegacy)
                            break;
                    }
                }
            }

            if (this._btnCompressBasis) {
                this._btnCompressBasis.disabled = !differentBasis;
            }
            this._btnCompressLegacy.disabled = !differentLegacy;
        }

        _checkFormats() {
            const assets = this._assets;
            const writeAccess = editor.call('permissions:write');
            const fieldDxt = this._compressionLegacyAttributesInspector.getField(`meta.compress.dxt`);
            const fieldEtc1 = this._compressionLegacyAttributesInspector.getField(`meta.compress.etc1`);
            const fieldOriginal = this._compressionLegacyAttributesInspector.getField(`compress.original`);
            const fieldPvr = this._compressionLegacyAttributesInspector.getField(`meta.compress.pvr`);
            const fieldPvrBpp = this._compressionLegacyAttributesInspector.getField(`meta.compress.pvrBpp`);

            let width = -1;
            let height = -1;
            let rgbm = -1;
            let alpha = -1;
            let alphaValid = -1;
            let displayExt = '';
            let showBasisPvrWarning = false;
            let basisSelected = false;
            let hasLegacy = false;

            for(let i = 0; i < assets.length; i++) {
                if (assets[i].has('meta.width')) {
                    if (width === -1) {
                        width = assets[i].get('meta.width');
                        height = assets[i].get('meta.height');
                    } else if (width !== assets[i].get('meta.width') || height !== assets[i].get('meta.height')) {
                        width = -2;
                        height = -2;
                    }
                }

                if (! assets[i].get('file'))
                    continue;

                if (rgbm === -1) {
                    rgbm = assets[i].get('data.rgbm') ? 1 : 0;
                } else if (rgbm !== -2) {
                    if (rgbm !== (assets[i].get('data.rgbm') ? 1 : 0))
                        rgbm = -2;
                }

                if (alpha === -1) {
                    alpha = assets[i].get('meta.compress.alpha') ? 1 : 0;
                } else if (alpha !== -2) {
                    if (alpha !== (assets[i].get('meta.compress.alpha') ? 1 : 0))
                        alpha = -2;
                }

                const alphaValidTmp = (assets[i].get('meta.alpha') || (assets[i].get('meta.type') || '').toLowerCase() === 'truecoloralpha') ? 1 : 0;
                if (alphaValid === -1) {
                    alphaValid = alphaValidTmp;
                } else if (alphaValid !== -2) {
                    if (alphaValid !== alphaValidTmp)
                        alphaValid = -2;
                }

                let ext = assets[i].get('file.url');
                ext = ext.slice(ext.lastIndexOf('.') + 1).toUpperCase();
                ext = ext.split('?')[0];

                if (displayExt !== 'various') {
                    displayExt = displayExt && displayExt !== ext ? 'various' : ext;
                }

                if (!hasLegacy) {
                    for (let j = 0; j < LEGACY_COMPRESSION_PARAMS.length; j++) {
                        hasLegacy = assets[i].get(`meta.compress.${LEGACY_COMPRESSION_PARAMS[j]}`);
                        if (hasLegacy) break;
                    }
                }

                const thisBasis = assets[i].get('meta.compress.basis');
                basisSelected = basisSelected || thisBasis;

                // PVR format only supports square power-of-two textures. If basis is selected then
                // we display a warning
                // NOTE: ideally the basis transcoder would optionally resize the compressed image to
                // be square POT, but this isn't currently possible.
                const thisWidth = assets[i].get('meta.width');
                const thisHeight = assets[i].get('meta.height');
                const thisPOT = ((thisWidth & (thisWidth - 1)) === 0) && ((thisHeight & (thisHeight - 1)) === 0);
                if (!showBasisPvrWarning) {
                    showBasisPvrWarning = thisBasis && (!thisPOT || thisWidth !== thisHeight);
                }
            }

            this._hasLegacy = hasLegacy;

            // enable/disable basis controls based on whether basis is enabled
            const basisUiDisabled = !writeAccess || !basisSelected;
            if (this._compressionBasisAttributesInspector) {
                this._compressionBasisAttributesInspector.getField('meta.compress.quality').disabled = basisUiDisabled;
                this._compressionBasisAttributesInspector.getField('meta.compress.normals').disabled = basisUiDisabled;
            }

            if (this._containerImportBasis) {
                this._containerImportBasis.disabled = basisUiDisabled;
            }

            if (this._compressionBasisPvrWarning) {
                this._compressionBasisPvrWarning.hidden = !showBasisPvrWarning;
            }

            fieldOriginal.value = displayExt;

            if (rgbm !== 1) {
                if (width > 0 && height > 0) {
                    // size available
                    if ((width & (width - 1)) === 0 && (height & (height - 1)) === 0) {
                        // pot
                        fieldDxt.disabled = false;
                    } else {
                        // non pot
                        fieldDxt.disabled = true;
                    }
                } else if (width === -1) {
                    // no size available
                    fieldDxt.disabled = true;
                } else if (width === -2) {
                    // various sizes
                    fieldDxt.disabled = false;
                }
            } else {
                fieldDxt.disabled = true;
            }

            fieldPvr.disabled = fieldPvrBpp.disabled = rgbm !== -2 && (fieldDxt.disabled || rgbm === 1);
            fieldEtc1.disabled = fieldPvr.disabled || (alpha === 1 && alphaValid !== 0);

            this._updatePvrWarning();
        }

        _handleAssetChangeCompression(path) {
            if (this._compressionChangeTicking ||
                (path !== 'task' &&
                ! path.startsWith('meta') &&
                ! path.startsWith('file') &&
                ! path.startsWith('data.rgbm') &&
                ! path.startsWith('data.mipmaps')))
                return;

            this._compressionChangeTicking = true;
            this._compressionChangeTimeout = setTimeout(() => {
                this._compressionChangeTicking = false;
                this._checkFormats();
                this._checkCompression();
                this._checkCompressAlpha();
                this._updateLegacy();
            }, 0);
        };

        _handleBtnCompressBasisClick() {
            this._handleCompress(['basis']);
            this._btnCompressBasis.disabled = true;
        }

        _handleBtnCompressLegacyClick() {
            const { basis, ...rest } = this._compressionFormats;
            this._handleCompress(Object.keys(rest));
            this._btnCompressLegacy.disabled = true;
        }

        _handleBtnGetMetaClick() {
            const assets = this._assets;

            if (! editor.call('permissions:write'))
                return;

            for(let i = 0; i < assets.length; i++) {
                if (assets[i].get('meta'))
                    continue;

                editor.call('realtime:send', 'pipeline', {
                    name: 'meta',
                    id: assets[i].get('uniqueId')
                });
            }
            this._btnGetMeta.enabled = false;
        }

        _handleCompress(formats) {
            const assets = this._assets;
            if (!Array.isArray(assets) || !assets.length) {
                return;
            };

            for(let i = 0; i < assets.length; i++) {
                if (! assets[i].get('file'))
                    continue;

                const variants = [ ];
                const toDelete = [ ];

                for(let format of formats) {
                    if (format === 'original')
                        continue;

                    if (checkCompressRequired(assets[i], format)) {
                        const width = assets[i].get('meta.width');
                        const height = assets[i].get('meta.height');

                        // no width/height
                        if (! width || ! height)
                            continue;

                        // non pot
                        if ((width & (width - 1)) !== 0 || (height & (height - 1)) !== 0)
                            continue;

                        let compress = assets[i].get('meta.compress.' + format);

                        if (assets[i].get('data.rgbm'))
                            compress = false;

                        if (compress && format === 'etc1') {
                            if (assets[i].get('meta.compress.alpha') && (assets[i].get('meta.alpha') || (assets[i].get('meta.type') || '').toLowerCase() === 'truecoloralpha'))
                                compress = false;
                        }

                        if (compress) {
                            variants.push(format);
                        } else {
                            toDelete.push(format);
                        }
                    }
                }

                if (toDelete.length) {
                    editor.call('realtime:send', 'pipeline', {
                        name: 'delete-variant',
                        data: {
                            asset: assets[i].get('uniqueId'),
                            options: {
                                formats: toDelete
                            }
                        }
                    });
                }

                if (variants.length) {
                    const task = {
                        asset: assets[i].get('uniqueId'),
                        options: {
                            formats: variants,
                            alpha: assets[i].get('meta.compress.alpha') && (assets[i].get('meta.alpha') || assets[i].get('meta.type').toLowerCase() === 'truecoloralpha'),
                            mipmaps: assets[i].get('data.mipmaps'),
                            normals: !!assets[i].get('meta.compress.normals')
                        }
                    };

                    if (variants.indexOf('pvr') !== -1)
                        task.options.pvrBpp = assets[i].get('meta.compress.pvrBpp');

                    if (variants.indexOf('basis') !== -1)
                        task.options.quality = assets[i].get('meta.compress.quality');

                    const sourceId = assets[i].get('source_asset_id');
                    if (sourceId) {
                        const sourceAsset = editor.call('assets:get', sourceId);
                        if (sourceAsset)
                            task.source = sourceAsset.get('uniqueId');
                    }

                    editor.call('realtime:send', 'pipeline', {
                        name: 'compress',
                        data: task
                    });
                }
            }
        }

        _setupBasis() {
            if (!this._hasBasis) return;

            const BASIS_STORE_NAME = 'basis.js';
            const BASIS_WASM_FILENAME = 'basis';

            this._compressionLegacyAttributesInspector.getField('compress.legacy').parent.hidden = false;
            if (!editor.call('project:module:hasModule', BASIS_WASM_FILENAME)) {
                this._setupImportButton(this._compressionBasisContainer, BASIS_STORE_NAME, BASIS_WASM_FILENAME);
            }
        }

        _setupCompressionSubheads() {
            const legacy = this._compressionLegacyAttributesInspector.getField('compress.legacy').parent;
            legacy.class.add('pcui-inspector-subhead');
            legacy.hidden = true;
            if (this._compressionBasisAttributesInspector) {
                this._compressionBasisAttributesInspector.getField('meta.compress.basis').parent.class.add('pcui-inspector-subhead');
            }

        }

        _setupImportButton(panel, moduleStoreName, wasmFilename) {
            if (!this._containerImportBasis) {
                this._containerImportBasis = new pcui.Container({
                   flex: true,
                   flexDirection: 'row',
                   alignItems: 'center'
               });
               this._containerImportBasis.class.add('pcui-subpanel');

               this._labelImportBasis = new pcui.Label({
                   text: 'Basis Not Found'
               });
               this._containerImportBasis.append(this._labelImportBasis);

                this._btnImportBasis = new pcui.Button({
                    text: 'IMPORT BASIS',
                    icon: 'E228',
                    flexGrow: 1
                });
                this._btnImportBasis.on('click', () => {
                    editor.call('project:module:addModule', moduleStoreName, wasmFilename);
                });
                this._containerImportBasis.append(this._btnImportBasis);

                panel.appendAfter(this._containerImportBasis, this._compressionBasisAttributesInspector);
                this._containerImportBasis.disabled = true;

                const events = [];
                const handleModuleImported = name => {
                    if (name === moduleStoreName) {
                        this._containerImportBasis.hidden = true;
                    }
                }
                events.push(editor.on('onModuleImported', handleModuleImported));

                this._containerImportBasis.once('destroy', () => {
                    events.forEach(evt => evt.unbind());
                    events.length = 0;
                });
            } else {
                this._containerImportBasis.hidden = false;
            }
        }

        _setupFilteringTwoWayBinding() {
            const args = this._args;

            this._textureAttributesInspector.getField('filtering').binding = new pcui.BindingTwoWay({
                history: args.history,
                bindingElementToObservers: new MultiPathBindingElementToObservers({
                    formatters: {
                        'data.minfilter': v => `${v}_mip_${v}`
                    },
                    history: args.history,
                    historyName: 'assets.filtering',
                }),
                bindingObserversToElement: new pcui.BindingObserversToElement({
                    customUpdate: (element, observers, paths) => {
                        const getMergedValue = observer =>
                            paths.reduce((acc, path) => acc + observer.get(path), '');

                        let value = '';
                        let valueDifferent = false;
                        const firstMergedValue = getMergedValue(observers[0]);
                        for(let i = 1; i < observers.length; i++) {
                            if (firstMergedValue !== getMergedValue(observers[i])) {
                                valueDifferent = true;
                                break;
                            }
                        }

                        if (! valueDifferent) {
                            if (observers[0].get('data.minfilter') === 'linear_mip_linear' && observers[0].get('data.magfilter') === 'linear') {
                                value = 'linear';
                            } else if (observers[0].get('data.minfilter') === 'nearest_mip_nearest' && observers[0].get('data.magfilter') === 'nearest') {
                                value = 'nearest';
                            }
                        }

                        element.value = value;
                    },
                    history: args.history
                })
            })
        }

        _setupLegacy() {
            if (!this._hasBasis) return;
            const fieldLegacy = this._compressionLegacyAttributesInspector.getField('compress.legacy');
            var dirty = !this._btnCompressLegacy.disabled;
            this._showHideLegacyUi(this._hasLegacy || dirty);
            fieldLegacy.value = this._hasLegacy || dirty;
            fieldLegacy.disabled = this._hasLegacy || dirty;
            this._assetEvents.push(fieldLegacy.on('change', this._showHideLegacyUi));
        }

        _updateLegacy() {
            if (!this._hasBasis) return;
            const fieldLegacy = this._compressionLegacyAttributesInspector.getField('compress.legacy');
            var dirty = !this._btnCompressLegacy.disabled;
            fieldLegacy.disabled = this._hasLegacy || dirty;
        }

        _setupPanelReferences() {
            editor.call('attributes:reference:attach', 'asset:texture:asset', this._texturePanel._containerHeader);
            editor.call('attributes:reference:attach', 'asset:texture:compression', this._compressionPanel._containerHeader);
        }

        _setupPvrWarning() {
            const fieldPvr = this._compressionLegacyAttributesInspector.getField(`meta.compress.pvr`);
            const fieldPvrBpp = this._compressionLegacyAttributesInspector.getField(`meta.compress.pvrBpp`);

            this._pvrWarningLabel = new pcui.Label({
                text: 'Compressed texture will be resized square'
            });
            this._pvrWarningLabel.class.add('pcui-pvr-warning');
            this._pvrWarningLabel.hidden = true;

            fieldPvr.parent.parent.appendAfter(this._pvrWarningLabel, fieldPvrBpp.parent);
            this._assetEvents.push(fieldPvr.on('change', this._updatePvrWarning));
        }

        _setupSizeLabels() {
            const getCompressionField = format => {
                if (format === 'original')
                    return this._compressionLegacyAttributesInspector.getField('compress.original');


                if (this._hasBasis && format === 'basis')
                    return this._compressionBasisAttributesInspector.getField(`meta.compress.${format}`);

                return this._compressionLegacyAttributesInspector.getField(`meta.compress.${format}`);
            }

            for(let key in this._compressionFormats) {
                const field = getCompressionField(key)

                if (field) {
                    const sizeLabel = new SizeLabel({
                        format: this._compressionFormats[key]
                    });

                    this._compressionFormats[key].label = sizeLabel;

                    field.parent.append(sizeLabel);
                }
            }
        }

        _showHideLegacyUi(show) {
            this._compressionLegacyAttributesInspector.getField(`meta.compress.alpha`).parent.hidden = !show;
            this._compressionLegacyAttributesInspector.getField(`meta.compress.dxt`).parent.hidden = !show;
            this._compressionLegacyAttributesInspector.getField(`meta.compress.etc1`).parent.hidden = !show;
            this._compressionLegacyAttributesInspector.getField(`meta.compress.etc2`).parent.hidden = !show;
            this._compressionLegacyAttributesInspector.getField(`compress.original`).parent.hidden = !show;
            this._compressionLegacyAttributesInspector.getField(`meta.compress.pvr`).parent.hidden = !show;
            this._compressionLegacyAttributesInspector.getField(`meta.compress.pvrBpp`).parent.hidden = !show;
            this._btnCompressLegacy.hidden = !show;
        }

        _updatePvrWarning() {
            const assets = this._assets;
            const fieldPvr = this._compressionLegacyAttributesInspector.getField(`meta.compress.pvr`);

            // only show pvr warning if any selected texture is non-square and pvr is ticked
            let hidden = true;
            if (fieldPvr.value && !fieldPvr.disabled) {
                for (let i = 0; i < assets.length; i++) {
                    if (assets[i].get('meta.width') !== assets[i].get('meta.height')) {
                        hidden = false;
                        break;
                    }
                }
            }

            this._pvrWarningLabel.hidden = hidden;
        }

        link(assets) {
            this.unlink();
            this._assets = assets;

            this._textureAttributesInspector.link(assets);
            this._compressionLegacyAttributesInspector.link(assets);
            if (this._compressionBasisAttributesInspector) {
                this._compressionBasisAttributesInspector.link(assets);
            }

            this._setupBasis();

            // initial checks
            this._btnGetMetaVisibility();
            for(let key in this._compressionFormats) {
                if (key === 'basis' && !this._hasBasis)
                    continue;
                this._calculateSize(key);
            }
            this._checkFormats();
            this._checkCompression();
            this._checkCompressAlpha();

            // needs to be called after this._checkFormats to determine this._hasLegacy
            this._setupLegacy();

            // setup additional listeners
            this._assetEvents.push(editor.on('permissions:writeState', () => this._handleAssetChangeCompression('meta')));
            assets.forEach(asset => {
                // retriggers checkCompressAlpha, checkFormats, checkCompression
                this._assetEvents.push(asset.on('*:set', this._handleAssetChangeCompression));
                this._assetEvents.push(asset.on('*:unset', this._handleAssetChangeCompression));

                // show/hide Get Meta Button
                this._assetEvents.push(asset.on('meta:set', () => {
                    this._btnGetMetaVisibility();
                    // asset meta migration...
                    // this should probably eventually be moved to the pipline job
                    if (asset.get('meta') && ! asset.has('meta.compress')) {
                        setTimeout(() => {
                            const alpha = asset.get('meta.alpha') || (asset.get('meta.type').toLowerCase() || '') === 'truecoloralpha' || false;
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
                        })
                    }
                }));
                this._assetEvents.push(asset.on('meta:unset', () => this._btnGetMeta.hidden = false ));

                // recalculate size
                for(let key in this._compressionFormats) {
                    if (key === 'basis' && !this._hasBasis)
                        continue;
                    this._assetEvents.push(asset.on(`file.variants.${key}.size:set`, () => this._queueSizeCalculate(key)));
                    this._assetEvents.push(asset.on(`file.variants.${key}.size:unset`, () => this._queueSizeCalculate(key)));
                    this._assetEvents.push(asset.on(`file.variants.${key}.sizeGzip:set`, () => this._queueSizeCalculate(key)));
                    this._assetEvents.push(asset.on(`file.variants.${key}.sizeGzip:unset`, () => this._queueSizeCalculate(key)));
                }
            });
        }

        unlink() {
            if (this._assets === null)
                return;

            this._textureAttributesInspector.unlink();
            this._compressionLegacyAttributesInspector.unlink();
            if (this._compressionBasisAttributesInspector) {
                this._compressionBasisAttributesInspector.unlink();
            }

            if (this._compressionChangeTimeout) {
                clearTimeout(this._compressionChangeTimeout);
            }
            this._compressionChangeTicking = false;

            this._assetEvents.forEach(e => e.unbind());
            this._assetEvents.length = 0;
            this._assets = null;
        }
    }

    return {
        TextureAssetInspector: TextureAssetInspector
    };
})());


/* editor/inspector/assets/texture-preview.js */
Object.assign(pcui, (function () {
    'use strict';

    const getPreviewUrl = asset => {
        const url = asset.get('file.url');
        const hash = asset.get('file.hash');
        
        if(!asset.get('file.url').startsWith("http")){
            return asset.get('file.url');
        }

        return config.url.home + asset.get('file.url').appendQuery('t=' + asset.get('file.hash'));
    }

    class TextureAssetInspectorPreview extends pcui.AssetInspectorPreviewBase {
        constructor(args) {
            super(args);
            this._assets = null;
            this._assetEvents = [];

            this._preview = document.createElement('div');
            this._preview.classList.add('pcui-texture-asset-preview');
            this.append(this._preview);

            this._updatePreview = this._updatePreview.bind(this);
        }

        _updatePreview() {
            const assets = this._assets;
            if (!assets || !Array.isArray(assets) || !assets.length)
                return;

            const previewUrl = getPreviewUrl(assets[0]);
            if (!previewUrl)
                return;

            this._preview.style.backgroundImage = `url("${previewUrl}")`
        }

        link(assets) {
            this.unlink();
            super.link();
            this._assets = assets;

            if (assets && Array.isArray(assets) && assets.length) {
                this._assetEvents.push(assets[0].on('file.hash:set', this._updatePreview));
                this._assetEvents.push(assets[0].on('file.url:set', this._updatePreview));
            }

            this._updatePreview();
        }

        unlink() {
            super.unlink();

            this._assetEvents.forEach(e => e.unbind());
            this._assetEvents.length = 0;
            this._assets = null;
        }
    }

    return {
        TextureAssetInspectorPreview: TextureAssetInspectorPreview
    };
})());


/* editor/inspector/assets/code-block.js */
Object.assign(pcui, (function () {
    'use strict';

    const DOM = (parent) => [
        {
            root: {
                panel: new pcui.Panel({
                    headerText: parent._assetType.toUpperCase()
                })
            },
            children: [
                {
                    code: new pcui.Code()
                },
                {
                    root: {
                        errorLoadingDataContainer: new pcui.Container({
                            flex: true,
                            flexDirection: 'column',
                            alignItems: 'center'
                        })
                    },
                    children: [
                        {
                            errorLoadingDataLabel: new pcui.Label({
                                text: 'failed loading data'
                            })
                        }
                    ]
                },
                {
                    progress: new pcui.Progress({ width: '100%' })
                }
            ]
        }
    ];


    function dataURLtoBlob(dataurl,callback) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        var blob = new Blob([u8arr], { type: mime });
        blobToDataURL(blob,callback);
    }
    
    
    function blobToDataURL(blob, callback) {
        let a = new FileReader();
        a.onload = function (e) { callback(e.target.result); }
        a.readAsText(blob);
    }


    class CodeBlockAssetInspector extends pcui.Container {
        constructor(args) {
            args = Object.assign({}, args);

            super(args);

            this._assetType = args.assetType;
            this._dataFormatter = args.dataFormatter;
            this._assets = null;
            this._loading = false;

            this.buildDom(DOM(this));

            // child element adjustments
            this._errorLoadingDataContainer.hidden = true;
            this._errorLoadingDataLabel.class.add(pcui.CLASS_ERROR);
            editor.call('attributes:reference:attach', `asset:${this._assetType}:asset`, this._panel, this._panel.header.dom);
            this._progress.value = 100;
        }

        _loadData() {
            if (this._assets.length !== 1 || this._loading)
                return;
            if (this._assets[0].get('file.size') > 128 * 1024) {
                return;
            }

            this._progress.hidden = false;
            this._progress.value = 100;
            this._loading = true;

            const fileUrl = this._assets[0].get('file.url');
            const fileHash = this._assets[0].get('file.hash');
            
            var _self = this;

            dataURLtoBlob(fileUrl,function(data){
                _self._loading = false;
                if (_self._dataFormatter) {
                    _self._code.text = _self._dataFormatter(data);
                } else {
                    _self._code.text = data;
                }
                _self._progress.hidden = true;
            })

           
        }

        link(assets) {
            this.unlink();
            this._assets = assets;
            if (assets[0].has('file.url')) {
                if (! this._loading) {
                    this._loadData();
                }
            }
            this._panel.hidden = assets.length > 1;
        }

        unlink() {
            if (!this._assets) return;
            this._assets = null;
            if (this._request) {
                this._request.owner.abort();
                this._request = null;
            }
            this._code.text = '';
        }
    }

    return {
        CodeBlockAssetInspector: CodeBlockAssetInspector
    };
})());


/* editor/inspector/assets/css.js */
Object.assign(pcui, (function () {
    'use strict';

    class CssAssetInspector extends pcui.CodeBlockAssetInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.assetType = 'css';

            super(args);
        }
    }

    return {
        CssAssetInspector: CssAssetInspector
    };
})());


/* editor/inspector/assets/html.js */
Object.assign(pcui, (function () {
    'use strict';

    class HtmlAssetInspector extends pcui.CodeBlockAssetInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.assetType = 'html';

            super(args);
        }
    }

    return {
        HtmlAssetInspector: HtmlAssetInspector
    };
})());


/* editor/inspector/assets/json.js */
Object.assign(pcui, (function () {
    'use strict';

    class JsonAssetInspector extends pcui.CodeBlockAssetInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.assetType = 'json';
            args.dataFormatter = data => JSON.stringify(data, null, 4);

            super(args);
        }
    }

    return {
        JsonAssetInspector: JsonAssetInspector
    };
})());


/* editor/inspector/assets/shader.js */
Object.assign(pcui, (function () {
    'use strict';

    class ShaderAssetInspector extends pcui.CodeBlockAssetInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.assetType = 'shader';

            super(args);
        }
    }

    return {
        ShaderAssetInspector: ShaderAssetInspector
    };
})());


/* editor/inspector/assets/text.js */
Object.assign(pcui, (function () {
    'use strict';

    class TextAssetInspector extends pcui.CodeBlockAssetInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.assetType = 'text';

            super(args);
        }
    }

    return {
        TextAssetInspector: TextAssetInspector
    };
})());


/* editor/inspector/assets/cubemap.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'pcui-cubemap-asset-inspector';
    const CLASS_FACES_CONTAINER = CLASS_ROOT + '-faces-container';

    const ATTRIBUTES = [{
        label: 'Filtering',
        alias: 'filtering',
        type: 'select',
        reference: 'asset:texture:filtering',
        args: {
            type: 'string',
            options: [{
                v: 'nearest', t: 'Point'
            }, {
                v: 'linear', t: 'Linear'
            }]
        }
    },
    {
        label: 'Anisotropy',
        path: 'data.anisotropy',
        type: 'number',
        reference: 'asset:cubemap:anisotropy'
    }];

    const FACES = {
        0: 'Right',
        1: 'Left',
        2: 'Top',
        3: 'Bottom',
        4: 'Front',
        5: 'Back'
    };

    const FILTERS = {
        'nearest': {
            minFilter: 2,
            magFilter: 0
        },
        'linear': {
            minFilter: 5,
            magFilter: 1
        }
    };

    const DOM = (parent, args) => [
        {
            root: {
                cubemapPanel: new pcui.Panel({
                    headerText: 'CUBEMAP'
                })
            },
            children: [{
                cubemapAttributesInspector: new pcui.AttributesInspector({
                    assets: args.assets,
                    history: args.history,
                    attributes: ATTRIBUTES
                })
            }]
        },
        {
            facesPanel: new pcui.Panel({
                headerText: 'FACES'
            })
        },
        {
            root: {
                prefilteringContainer: new pcui.Container()
            },
            children: [{
                root: {
                    prefilteringPanel: new pcui.Panel({ headerText: 'PREFILTERING', flex: true })
                },
                children: [{
                    prefilterButton: new pcui.Button({ text: 'PREFILTER CUBEMAP'})
                }, {
                    deletePrefilterButton: new pcui.Button({ text: 'DELETE PREFILTERED DATA' })
                }]
            },
            {
                root: {
                    errorContainer: new pcui.Container({
                        flex: true,
                        alignItems: 'center'
                    })
                },
                children: [{
                    errorLabel: new pcui.Label({
                        class: pcui.CLASS_ERROR
                    })
                }]
            }]
        }
    ];

    class CubemapAssetInspector extends pcui.Container {
        constructor(args) {
            args = Object.assign({}, args);

            super(args);
            this._args = args;
            this._assets = null;
            this._assetEvents = [];
            this._faces = [];

            this.buildDom(DOM(this, args));

            Object.keys(FACES).forEach(face => {
                const cubemapFace = new pcui.CubemapFace(Object.assign(args, { label: FACES[face], face }));
                this._faces.push(cubemapFace);
                this._facesPanel.append(cubemapFace);
            });

            this._facesPanel.content.class.add(CLASS_FACES_CONTAINER);

            editor.call('attributes:reference:attach', 'asset:cubemap:asset', this._cubemapPanel, this._cubemapPanel.header.dom);
        }

        _updateFilteringSelect() {
            this._cubemapAttributesInspector.getField('filtering').values = this._assets.map(asset => {
                if (asset.get('data.minFilter') === 2 && asset.get('data.magFilter') === 0) {
                    return 'nearest';
                } else if (asset.get('data.minFilter') === 5 && asset.get('data.magFilter') === 1) {
                    return 'linear';
                }
                return '';
            });
        }

        _checkFacesValid() {
            const faces = this._assets[0].get('data.textures');

            if (!(faces instanceof Array))
                return 'missing faces information';

            for (let i = 0; i < 6; i++) {
                if (!faces[i])
                    return 'set face textures';
            }

            let width = 0;
            let height = 0;

            for (let i = 0; i < 6; i++) {
                const asset = editor.call('assets:get', faces[i]);
                if (!asset)
                    return 'missing face asset';

                if (!asset.has('meta.width') || ! asset.has('meta.height'))
                    return 'no texture resolution data available';

                const w = asset.get('meta.width');
                const h = asset.get('meta.height');

                if ((w & (w - 1)) !== 0 || (h & (h - 1)) !== 0)
                    return 'face textures should have power of two resolution';

                if (w !== h)
                    return 'face textures should have square resolution';

                if (i === 0) {
                    width = w;
                    height = h;
                } else {
                    if (width !== w || height !== h)
                        return 'face textures should have same resolution';
                }
            }

            return false;
        }

        _updateFilteringForAssets(filterValue) {
            const currFilterValues = this._assets.map(asset => {
                return {
                    minFilter: asset.get('data.minFilter'),
                    magFilter: asset.get('data.magFilter')
                };
            });
            const assets = this._assets.map(asset => {
                asset.history.enabled = false;
                asset.set('data.minFilter', FILTERS[filterValue].minFilter);
                asset.set('data.magFilter', FILTERS[filterValue].magFilter);
                asset.history.enabled = true;
                return asset;
            });
            this._args.history.add({
                name: 'assets.filtering',
                undo: () => {
                    assets.forEach((asset, i) => {
                        asset.latest();
                        if (!asset)
                            return;
                        asset.history.enabled = false;
                        asset.set('data.minFilter', currFilterValues[i].minFilter);
                        asset.set('data.magFilter', currFilterValues[i].magFilter);
                        asset.history.enabled = true;
                    });
                },
                redo: () => {
                    assets.forEach((asset) => {
                        asset.latest();
                        if (!asset)
                            return;
                        asset.history.enabled = false;
                        asset.set('data.minFilter', FILTERS[filterValue].minFilter);
                        asset.set('data.magFilter', FILTERS[filterValue].magFilter);
                        asset.history.enabled = true;
                    });
                }
            });
        }

        _onFilteringSelectChange(filterValue) {
            if (['nearest', 'linear'].includes(filterValue)) {
                let hasDiveredFromAssets = false;
                this._assets.forEach(asset => {
                    if (asset.get('data.minFilter') !== FILTERS[filterValue].minFilter) {
                        hasDiveredFromAssets = true;
                    }
                });
                if (hasDiveredFromAssets) {
                    if (filterValue === 'nearest') {
                        this._updateFilteringForAssets(filterValue);
                    } else if (filterValue === 'linear') {
                        this._updateFilteringForAssets(filterValue);
                    }
                }
            }
        }

        _isPrefiltered() {
            return !!this._assets[0].get('file');
        }

        _onClickPrefilterButton() {
            this._prefilterButton.enabled = false;
            editor.call('assets:cubemaps:prefilter', this._assets[0], (err) => {
                this._prefilterButton.enabled = true;
                if (err)
                    return editor.call('status:error', err);
            });
        }

        _onClickDeletePrefilterButton() {
            editor.call('realtime:send', 'cubemap:clear:',this._assets[0].get('uniqueId'));
        }

        _updateLayout() {
            this._updateFilteringSelect();
            const validationError = this._checkFacesValid();
            this._errorLabel.text = validationError;
            this._errorLabel.hidden = !validationError;
            this._prefilteringPanel.hidden = !!validationError;
            this._prefilterButton.hidden = this._isPrefiltered();
            this._deletePrefilterButton.hidden = !this._isPrefiltered();
            this._facesPanel.hidden = this._assets.length > 1;
            this._prefilteringContainer.hidden = this._assets.length > 1;
        }

        link(assets) {
            this.unlink();
            this._assets = assets;
            this._cubemapAttributesInspector.link(assets);
            this._faces.forEach((face, ind) => {
                face.link(assets[0], `data.textures.${ind}`);
            });

            // Events
            this._assetEvents.push(this._cubemapAttributesInspector.getField('filtering').on('change', this._onFilteringSelectChange.bind(this)));
            assets.forEach(asset => {
                this._assetEvents.push(asset.on('*:set', () => {
                    this._updateLayout();
                }));
            });
            this._assetEvents.push(this._prefilterButton.on('click', this._onClickPrefilterButton.bind(this)));
            this._assetEvents.push(this._deletePrefilterButton.on('click', this._onClickDeletePrefilterButton.bind(this)));

            // Layout
            this._updateLayout();
        }

        unlink() {
            if (this._assets === null) return;
            this._cubemapAttributesInspector.unlink();
            this._faces.forEach((face) => {
                face.unlink();
            });
            this._assetEvents.forEach(evt => evt.unbind());
            this._assetEvents = [];
        }
    }

    return {
        CubemapAssetInspector: CubemapAssetInspector
    };
})());


/* editor/inspector/assets/cubemap-face.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'pcui-cubemap-asset-inspector';
    const CLASS_FACE = CLASS_ROOT + '-face';
    const CLASS_FACE_LABEL = CLASS_FACE + '-label';
    const CLASS_FACE_BUTTON = CLASS_FACE + '-button';

    const DOM_CUBEMAP_FACE = (args) => [
        {
            thumbnail: new pcui.AssetThumbnail({
                assets: args.assets,
                width: '100%',
                binding: new pcui.BindingTwoWay({
                    history: args.history
                })
            })
        }, {
            deleteButton: new pcui.Button({ icon: 'E124', class: CLASS_FACE_BUTTON })
        }, {
            faceLabel: new pcui.Label({ text: args.label, class: CLASS_FACE_LABEL })
        }
    ];

    const FACE_SORT = {
        '0': 0,
        'posx': 0,
        'right': 0,

        '1': 1,
        'negx': 1,
        'left': 1,

        '2': 2,
        'posy': 2,
        'top': 2,
        'up': 2,

        '3': 3,
        'negy': 3,
        'bottom': 3,
        'down': 3,

        '4': 4,
        'posz': 4,
        'front': 4,
        'forward': 4,

        '5': 5,
        'negz': 5,
        'back': 5,
        'backward': 5,

        '6': 6
    };

    class CubemapFace extends pcui.Container {
        constructor(args) {
            args = Object.assign({}, args);

            super(args);
            this._args = args;
            this._asset = null;
            this._assetEvents = [];
            this._dropTarget = null;

            this.buildDom(DOM_CUBEMAP_FACE(args));
            this.class.add(CLASS_FACE);
            this.class.add(args.label);
        }

        _setRgbmIfNeeded() {
            let allHdr = true;
            const textures = this._asset.get('data.textures');
            for (let i = 0; i < textures.length; i++) {
                if (textures[i] >= 0) {
                    const texture = editor.call('assets:get', textures[i]);
                    if (texture && !texture.get('data.rgbm')) {
                        allHdr = false;
                        break;
                    }
                }
            }
            if (allHdr)  {
                this._asset.set('data.rgbm', true);
            } else {
                this._asset.unset('data.rgbm');
            }
        }

        _onClickFace() {
            if (! editor.call('permissions:write'))
                return;

            const texture = editor.call('assets:get', this._asset.get(`data.textures.${this._args.face}`));
            editor.call('picker:asset', {
                type: 'texture',
                currentAsset: texture
            });

            let evtPick = editor.once('picker:asset', (texture) => {
                this._asset.set(`data.textures.${this._args.face}`, texture.get('id'));
                this._setRgbmIfNeeded();
                evtPick = null;
            });

            editor.once('picker:asset:close', () => {
                if (evtPick) {
                    evtPick.unbind();
                    evtPick = null;
                }
            });
        }

        _onClickDeleteFace(evt) {
            if (!editor.call('permissions:write'))
                return;
            evt.stopPropagation();
            this._asset.set(`data.textures.${this._args.face}`, null);
            this._setRgbmIfNeeded();
        }

        _initializeDropTarget() {
            this._dropTarget = editor.call('drop:target', {
                ref: this._thumbnail,
                filter: (type, dropData) => {
                    if (dropData.id && type.startsWith('asset') &&
                        (type === 'asset.texture') &&
                        dropData.id !== this._asset.get(`data.textures.${this._args.face}`)) {
                        const asset = this._args.assets.get(dropData.id);
                        return !!asset && !asset.get('source');
                    }
                },
                drop: (type, dropData) => {
                    var asset = editor.call('assets:get', dropData.id);

                    // try matching patterns of texture names
                    // to autoset  all 6 faces for empty cubemaps
                    try {
                        var empty = true;
                        var faces = this._asset.get('data.textures');
                        for (let i = 0; i < faces.length; i++) {
                            if (faces[i]) {
                                empty = false;
                                break;
                            }
                        }

                        if (empty) {
                            var name = asset.get('name');
                            var check = /((neg|pos)(x|y|z)|(right|left|top|up|bottom|down|front|forward|back|backward)|[0-6])(\.|$)/i;
                            var match = name.match(check);

                            if (match != null) {
                                match = match.index;

                                let part = '';
                                if (match) part = name.slice(0, match).toLowerCase();
                                const i = name.indexOf('.', match);
                                if (i > 0) part += name.slice(i);

                                const faceAssets = editor.call('assets:find', (a) => {
                                    if (a.get('source') || a.get('type') !== 'texture')
                                        return;

                                    if (! a.get('path').equals(asset.get('path')))
                                        return;

                                    if (a.get('meta.width') !== asset.get('meta.width') || a.get('meta.height') !== asset.get('meta.height'))
                                        return;

                                    const name = a.get('name').toLowerCase();
                                    let m = name.match(check);

                                    if (m === null)
                                        return;

                                    m = m.index;

                                    let p = '';
                                    if (m) p = name.slice(0, m).toLowerCase();
                                    const i = name.indexOf('.', m);
                                    if (i > 0) p += name.slice(i);

                                    return p === part;
                                });

                                if (faceAssets.length === 6) {

                                    for (let i = 0; i < faceAssets.length; i++) {
                                        let p = faceAssets[i][1].get('name').toLowerCase();
                                        if (match) p = p.slice(match);
                                        const m = p.indexOf('.');
                                        if (m > 0) p = p.slice(0, m);

                                        faceAssets[i] = {
                                            asset: faceAssets[i][1],
                                            face: FACE_SORT[p]
                                        };
                                    }

                                    faceAssets.sort((a, b) => {
                                        return a.face - b.face;
                                    });

                                    const currentAsset = this._asset;
                                    const faceAssetIds = faceAssets.map(faceAsset => faceAsset.asset.get('id'));

                                    const undo = () => {
                                        currentAsset.latest();
                                        if (!currentAsset) return;
                                        currentAsset.history.enabled = false;
                                        for (let i = 0; i < faceAssets.length; i++)
                                            currentAsset.set(`data.textures.${i}`, null);
                                        this._setRgbmIfNeeded();
                                        currentAsset.history.enabled = true;
                                    };
                                    const redo = () => {
                                        currentAsset.latest();
                                        if (!currentAsset) return;
                                        currentAsset.history.enabled = false;
                                        for (let i = 0; i < faceAssets.length; i++)
                                            currentAsset.set(`data.textures.${i}`, faceAssetIds[i]);
                                        this._setRgbmIfNeeded();
                                        currentAsset.history.enabled = true;
                                    };

                                    if (this._args.history) {
                                        this._args.history.add({
                                            name: 'cubemap.autofill',
                                            undo,
                                            redo
                                        });
                                    }

                                    redo();

                                    return;
                                }
                            }
                        }
                    } catch (ex) {
                        console.error(ex.message);
                        console.error(ex.stack);
                    }
                    this._asset.set(`data.textures.${this._args.face}`, dropData.id);
                    this._setRgbmIfNeeded();
                }
            });
        }

        link(asset, path) {
            this._asset = asset;
            this.unlink();
            this._thumbnail.link(asset, path);
            this._initializeDropTarget();
            this._assetEvents.push(this._deleteButton.on('click', this._onClickDeleteFace.bind(this)));
            this._assetEvents.push(this.on('click', this._onClickFace.bind(this)));
            this._assetEvents.push(this._asset.on('*:set', () => {
                this._deleteButton.hidden = !this._asset.get(`data.textures.${this._args.face}`);
            }));
            this._assetEvents.push(this._asset.on('*:unset', () => {
                this._deleteButton.hidden = !this._asset.get(`data.textures.${this._args.face}`);
            }));
            this.hidden = false;
            this._deleteButton.hidden = !this._asset.get(`data.textures.${this._args.face}`);
        }

        unlink() {
            if (!this._asset) return;
            this._thumbnail.unlink();
            this._assetEvents.forEach(evt => evt.unbind());
            this._assetEvents = [];
            if (this._dropTarget) {
                this._dropTarget.destroy();
                this._dropTarget = null;
            }
        }
    }

    return {
        CubemapFace: CubemapFace
    };
})());


/* editor/inspector/assets/cubemap-preview.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_CANVAS = 'pcui-asset-preview-canvas';
    const CLASS_CANVAS_FLIP = 'pcui-asset-preview-canvas-flip';

    class CubemapAssetInspectorPreview extends pcui.AssetInspectorPreviewBase {
        constructor(args) {
            super(args);

            this._preview = new pcui.Canvas({
                canvasWidth: 320,
                canvasHeight: 144,
                class: [CLASS_CANVAS, CLASS_CANVAS_FLIP]
            });

            this.append(this._preview);

            this._renderFrame = null;
            this._previewRenderer = null;
            this._previewRotation = [0, 0];
            this._sx = 0;
            this._sy = 0;
            this._x = 0;
            this._y = 0;
            this._nx = 0;
            this._ny = 0;
        }

        // queue up the rendering to prevent too often renders
        _queueRender() {
            if (this._renderFrame) return;
            this._renderFrame = requestAnimationFrame(this._renderPreview.bind(this));
        }


        _renderPreview() {
            if (this._renderFrame) {
                cancelAnimationFrame(this._renderFrame);
                this._renderFrame = null;
            }

            if (this.dom.offsetWidth !== 0 && this.dom.offsetHeight !== 0) {
                this._preview.dom.width = this.dom.offsetWidth;
                this._preview.dom.height = this.dom.offsetHeight;
            }
            this._previewRenderer.render(
                Math.max(-90, Math.min(90, this._previewRotation[0] + (this._sy - this._y) * 0.3)),
                this._previewRotation[1] + (this._sx - this._x) * 0.3
            );
        }

        _onMouseDown(evt) {
            super._onMouseDown(evt);

            if (this._mouseDown) {
                this._sx = this._x = evt.clientX;
                this._sy = this._y = evt.clientY;
            }
        }

        _onMouseMove(evt) {
            super._onMouseMove(evt);

            if (this._dragging) {
                this._nx = this._x - evt.clientX;
                this._ny = this._y - evt.clientY;
                this._x = evt.clientX;
                this._y = evt.clientY;

                this._queueRender();
            }
        }

        _onMouseUp(evt) {
            if (this._dragging) {
                if ((Math.abs(this._sx - this._x) + Math.abs(this._sy - this._y)) < 8) {
                    this._preview.dom.height = this.height;
                }

                this._previewRotation[0] = Math.max(-90, Math.min(90, this._previewRotation[0] + ((this._sy - this._y) * 0.3)));
                this._previewRotation[1] += (this._sx - this._x) * 0.3;
                this._sx = this._sy = this._x = this._y = 0;

                this._queueRender();
            }

            super._onMouseUp(evt);
        }

        _toggleSize() {
            super._toggleSize();
            this._queueRender();
        }

        updatePreview() {
            this._queueRender();
        }

        link(assets) {
            super.link(assets);
            this._previewRenderer = new pcui.Cubemap3dThumbnailRenderer(assets[0], this._preview.dom);
            this._queueRender();
        }

        unlink() {
            super.unlink();

            if (this._previewRenderer) {
                this._previewRenderer.destroy();
                this._previewRenderer = null;
            }

            if (this._renderFrame) {
                cancelAnimationFrame(this._renderFrame);
                this._renderFrame = null;
            }
        }
    }

    return {
        CubemapAssetInspectorPreview: CubemapAssetInspectorPreview
    };
})());


/* editor/inspector/assets/bundle.js */
Object.assign(pcui, (function () {
    'use strict';

    const DOM = parent => [
        {
            assetList: new pcui.AssetList({
                assets: parent._args.assets,
                binding: new pcui.BindingTwoWay({
                    history: parent._args.history
                })
            })
        }
    ];

    class BundleAssetInspector extends pcui.Panel {
        constructor(args) {
            args = Object.assign({}, args);
            args.headerText = 'ASSETS';

            super(args);
            this._args = args;

            this.buildDom(DOM(this));
        }

        link(assets) {
            this.unlink();
            this._assetList.link(assets, 'data.assets');
        }

        unlink() {
            this._assetList.unlink();
        }
    }

    return {
        BundleAssetInspector: BundleAssetInspector
    };
})());


/* editor/inspector/assets/sprite.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [{
        label: 'Pixels Per Unit',
        path: 'data.pixelsPerUnit',
        type: 'number'
    },
    {
        label: 'Render Mode',
        path: 'data.renderMode',
        type: 'select',
        args: {
            type: 'number',
            options: [{
                v: 0, t: 'Simple'
            }, {
                v: 1, t: 'Sliced'
            }, {
                v: 2, t: 'Tiled'
            }]
        }
    }];

    ATTRIBUTES.forEach(attr => {
        const path = attr.alias || attr.path;
        if (!path) return;
        const parts = path.split('.');
        attr.reference = `asset:sprite:${parts[parts.length - 1]}`;
    });

    const DOM = parent => [
        {
            attributesInspector: new pcui.AttributesInspector({
                assets: parent._args.assets,
                history: parent._args.history,
                attributes: ATTRIBUTES
            })
        }, {
            assetInput: new pcui.AssetInput({
                assetType: 'textureatlas',
                assets: parent._args.assets,
                text: 'Texture Atlas',
                flexGrow: 1,
                binding: new pcui.BindingTwoWay({
                    history: parent._args.history
                }),
                allowDragDrop: true
            })
        }
    ];

    class SpriteAssetInspector extends pcui.Panel {
        constructor(args) {
            args = Object.assign({}, args);
            args.headerText = 'SPRITE';

            super(args);
            this._args = args;
            this.buildDom(DOM(this));
        }

        link(assets) {
            this.unlink();
            this._attributesInspector.link(assets);
            this._assetInput.link(assets, 'data.textureAtlasAsset');
        }

        unlink() {
            this._attributesInspector.unlink();
            this._assetInput.unlink();
        }
    }

    return {
        SpriteAssetInspector: SpriteAssetInspector
    };
})());


/* editor/inspector/assets/sprite-preview.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'asset-sprite-preview';
    const CLASS_BUTTON = CLASS_ROOT + '-button';
    const CLASS_BUTTON_PLAYING = CLASS_ROOT + '-button-playing';
    const CLASS_CANVAS = 'pcui-asset-preview-canvas';

    class SpriteAssetInspectorPreview extends pcui.AssetInspectorPreviewBase {
        constructor(args) {
            super(args);

            this.class.add(CLASS_ROOT);

            this._preview = new pcui.Canvas({
                class: CLASS_CANVAS,
                useDevicePixelRatio: true
            });
            this.append(this._preview);

            this._playButton = new pcui.Button({ icon: 'E286', class: CLASS_BUTTON });
            this.append(this._playButton);

            this._renderFrame = false;
            this._fps = 10;
            this._playStartTime = null;
            this._spriteFrames = null;

            this._playButton.on('click', this._onClickPlay.bind(this));
        }

        // queue up the rendering to prevent too often renders
        _queueRender() {
            if (this._renderFrame) return;
            this._renderFrame = requestAnimationFrame(this._renderPreview.bind(this));
        }


        _renderPreview() {
            if (this._renderFrame) {
                cancelAnimationFrame(this._renderFrame);
                this._renderFrame = null;
            }

            if (this.dom.offsetWidth !== 0 && this.dom.offsetHeight !== 0) {
                this._preview.dom.width = this.dom.offsetWidth;
                this._preview.dom.height = this.dom.offsetHeight;
            } else {
                this._preview.dom.width = 320;
                this._preview.dom.height = 144;
            }
            if (this._playStartTime !== null) {
                const lapsedTime = Date.now() - this._playStartTime;
                const frameTimeMs = 1000 / this._fps;
                const currentFrame = Math.floor((lapsedTime / frameTimeMs) % this._spriteFrames);
                this._previewRenderer.render(currentFrame, true);
                this._queueRender();
            } else {
                this._previewRenderer.render();
            }
        }

        _toggleSize() {
            super._toggleSize();
            this._queueRender();
        }

        updatePreview() {
            this._queueRender();
        }

        _onClickPlay() {
            if (this._playStartTime === null) {
                this._playStartTime = Date.now();
                this._queueRender();
                this._playButton.class.add(CLASS_BUTTON_PLAYING);
            } else {
                this._playStartTime = null;
                this._playButton.class.remove(CLASS_BUTTON_PLAYING);
            }
        }

        link(assets) {
            super.link(assets);
            this._previewRenderer = new pcui.SpriteThumbnailRenderer(assets[0], this._preview.dom, editor.call('assets:raw'));
            this._spriteFrames = assets[0].get('data.frameKeys').length;
            this._queueRender();
        }

        unlink() {
            super.unlink();

            if (this._previewRenderer) {
                this._previewRenderer.destroy();
                this._previewRenderer = null;
            }

            if (this._renderFrame) {
                cancelAnimationFrame(this._renderFrame);
                this._renderFrame = null;
            }

            this._playStartTime = null;
            this._playButton.class.remove(CLASS_BUTTON_PLAYING);
        }
    }

    return {
        SpriteAssetInspectorPreview: SpriteAssetInspectorPreview
    };
})());


/* editor/inspector/assets/script.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'script-asset-inspector';
    const CLASS_ERROR_CONTAINER = CLASS_ROOT + '-error-container';
    const CLASS_CONTAINER = CLASS_ROOT + '-container';
    const CLASS_SCRIPT = CLASS_ROOT + '-script';
    const CLASS_ATTRIBUTE = CLASS_ROOT + '-attribute';

    const DOM = parent => [
        {
            errorContainer: new pcui.Container({
                class: CLASS_ERROR_CONTAINER
            })
        },
        {
            root: {
                noScriptsMessageContainer: new pcui.Container({ flex: true, alignItems: 'center' })
            },
            children: [{
                noScriptsMessageLabel: new pcui.Label({ text: 'No Script Objects found' })
            }]
        }
    ];

    class ScriptAssetInspector extends pcui.Panel {
        constructor(args) {
            args = Object.assign({}, args);
            args.headerText = 'SCRIPTS';

            super(args);
            this._asset = null;
            this._assetEvents = [];
            this._tooltips = [];

            this.buildDom(DOM(this));

            this._parseButton = new pcui.Button({ icon: 'E128', text: 'PARSE' });
            this._parseButton.on('click', this._onClickParse.bind(this));
            this.header.append(this._parseButton);
        }

        _displayScriptAttributes() {
            this._scriptAttributeContainer = new pcui.Container({ class: CLASS_CONTAINER });
            const scripts = this._asset.get('data.scripts');
            let hasScripts = false;
            Object.keys(scripts).forEach(scriptName => {
                hasScripts = true;
                this._scriptAttributeContainer[`_${scriptName}Container`] = new pcui.Container({ flex: true });
                this._scriptAttributeContainer[`_${scriptName}Container`]._scriptLabel = new pcui.Label({ text: scriptName, class: CLASS_SCRIPT });
                this._scriptAttributeContainer[`_${scriptName}Container`].append(this._scriptAttributeContainer[`_${scriptName}Container`]._scriptLabel);
                const hasCollision = editor.call('assets:scripts:collide', scriptName);
                if (hasCollision)
                    this._scriptAttributeContainer[`_${scriptName}Container`].append(new pcui.Label({ text: `script ${scriptName} is already defined in other asset`, class: [CLASS_SCRIPT, pcui.CLASS_ERROR] }));
                const attributes = this._asset.get('data.scripts')[scriptName];
                attributes.attributesOrder.forEach(attributeName => {
                    const attributeLabel = new pcui.Label({ text: attributeName, class: CLASS_ATTRIBUTE });
                    const attributeData = attributes.attributes[attributeName];
                    var tooltip = editor.call('attributes:reference', {
                        title: attributeName,
                        subTitle: editor.call('assets:scripts:typeToSubTitle', attributeData),
                        description: (attributeData.description || attributeData.title || ''),
                        code: JSON.stringify(attributeData, null, 4)
                    });
                    tooltip.attach({
                        target: attributeLabel,
                        element: attributeLabel.dom
                    });
                    this._tooltips.push(tooltip);
                    this._scriptAttributeContainer[`_${scriptName}Container`].append(attributeLabel);
                });
                this._scriptAttributeContainer.append(this._scriptAttributeContainer[`_${scriptName}Container`]);
            });
            this.append(this._scriptAttributeContainer);
            this._noScriptsMessageContainer.hidden = hasScripts;
            this._scriptAttributeContainer.hidden = !hasScripts;
        }

        _onClickParse() {
            this._parseButton.disabled = true;
            this._errorContainer.hidden = true;
            this._errorContainer.clear();
            editor.call('scripts:parse', this._asset, (error, result) => {
                this.remove(this._scriptAttributeContainer);
                this._displayScriptAttributes();
                this._parseButton.disabled = false;
                if (error) {
                    this._errorContainer.hidden = false;
                    this._errorContainer.append(new pcui.Label({ text: error.message, class: [CLASS_SCRIPT, pcui.CLASS_ERROR] }));
                    return;
                }
                if (result.scriptsInvalid.length > 0) {
                    this._errorContainer.append(new pcui.Label({ text: 'Validation Errors: ', class: [CLASS_SCRIPT, pcui.CLASS_ERROR] }));
                    result.scriptsInvalid.forEach(invalidScript => {
                        this._errorContainer.append(new pcui.Label({ text: invalidScript, class: [CLASS_SCRIPT, pcui.CLASS_ERROR] }));
                    });
                    this._errorContainer.hidden = false;
                    return;
                }
                for (const scriptName in result.scripts) {
                    var attrInvalid = result.scripts[scriptName].attributesInvalid;
                    if (attrInvalid.length > 0) {
                        const label = new pcui.Label({ text: attrInvalid, class: [pcui.CLASS_ERROR, CLASS_SCRIPT] });
                        this._scriptAttributeContainer[`_${scriptName}Container`].appendAfter(label, this._scriptAttributeContainer[`_${scriptName}Container`]._scriptLabel);
                    }
                }
            });
        }

        link(assets) {
            this.unlink();
            this._asset = assets[0];
            this._displayScriptAttributes();
            this._errorContainer.hidden = true;
        }

        unlink() {
            if (!this._asset)
                return;
            this._assetEvents.forEach(evt => evt.unbind());
            this._assetEvents = [];
            this._tooltips.forEach(tooltip => tooltip.destroy());
            this._tooltips = [];
            if (this._scriptAttributeContainer)
                this.remove(this._scriptAttributeContainer);
        }

        destroy() {
            super.destroy();
            this.unlink();
        }
    }

    return {
        ScriptAssetInspector: ScriptAssetInspector
    };
})());


/* editor/inspector/assets/related-assets.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'pcui-related-assets';
    const CLASS_RELATED_ASSET = CLASS_ROOT + '-related-asset';

    const DOM = () => [
        {
            relatedAssetsPanel: new pcui.Panel({ flex: true, headerText: 'RELATED ASSETS' })
        }
    ];

    class RelatedAssetsInspector extends pcui.Container {
        constructor(args) {
            args = Object.assign({}, args);

            super(args);

            this._args = args;
            this._relatedAssets = null;
            this._assetEvents = [];

            this.buildDom(DOM());
        }

        _loadRelatedAssets(sourceAsset) {
            const relatedAssets = this._args.assets.data.filter(
                asset => asset.get('source_asset_id') == sourceAsset.get('id')
            );
            this._relatedAssets = [];
            relatedAssets.forEach(asset => {
                const relatedAssetLabel = new pcui.Label({
                    text: asset.get('name'),
                    class: [CLASS_RELATED_ASSET, `asset-type-${asset.get('type')}`]
                });
                this._assetEvents.push(relatedAssetLabel.on('click', () => this._onClickRelatedAsset(asset.get('id'))));
                this._relatedAssetsPanel.append(relatedAssetLabel);
                this._relatedAssets.push(relatedAssetLabel);
            });
        }

        _removeRelatedAssets() {
            this._relatedAssets.forEach(assetLabel => {
                this._relatedAssetsPanel.remove(assetLabel);
            });
        }

        _onClickRelatedAsset(assetId) {
            const asset = editor.call('assets:get', assetId);
            if (! asset)
                return;
            editor.call('selector:set', 'asset', [asset]);
        }

        link(assets) {
            this.unlink();
            this._loadRelatedAssets(assets[0]);
        }

        unlink() {
            if (!this._relatedAssets) return;
            this._removeRelatedAssets();
            this._assetEvents.forEach(evt => evt.unbind());
            this._assetEvents = [];
        }
    }

    return {
        RelatedAssetsInspector: RelatedAssetsInspector
    };
})());


/* editor/inspector/assets/scene-source.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'scene-asset-inspector';
    const CLASS_ASSET = CLASS_ROOT + '-asset';
    const CLASS_NO_ASSET = CLASS_ROOT + '-no-asset';
    const CLASS_ASSET_CONTAINER = CLASS_ROOT + '-asset-container';

    const ATTRIBUTES = [{
        label: 'Animation',
        alias: 'animation',
        type: 'label'
    },
    {
        label: 'Textures',
        alias: 'textures',
        type: 'label'
    },
    {
        label: 'Materials',
        alias: 'materials',
        type: 'label'
    }];

    const DOM = args => [
        {
            root: {
                contentPanel: new pcui.Panel({ headerText: 'CONTENTS' })
            },
            children: [
                {
                    contentAttributes: new pcui.AttributesInspector({
                        assets: args.assets,
                        history: args.history,
                        attributes: ATTRIBUTES
                    })
                }
            ]
        },
        {
            relatedAssetsInspector: new pcui.RelatedAssetsInspector({
                assets: args.assets
            })
        }
    ];

    class SceneSourceAssetInspector extends pcui.Container {
        constructor(args) {
            args = Object.assign({}, args);

            super(args);
            this._assetEvents = [];
            this._textures = [];
            this._materials = [];

            this.buildDom(DOM(args));

            this._contentAttributes.getField('textures').parent.class.add(CLASS_ASSET_CONTAINER);
            this._contentAttributes.getField('textures').class.add(CLASS_NO_ASSET);
            this._contentAttributes.getField('materials').parent.class.add(CLASS_ASSET_CONTAINER);
            this._contentAttributes.getField('materials').class.add(CLASS_NO_ASSET);
        }


        _animationCheck(available) {
            this._contentAttributes.getField('animation').value = available ? 'yes' : 'no';
        }

        _addTextures(textures) {
            if (textures && textures.length > 0) {
                textures.forEach(texture => {
                    const textureLabel = new pcui.Label({ text: texture.name, class: CLASS_ASSET });
                    this._contentAttributes.getField('textures').parent.append(textureLabel);
                    this._textures.push(textureLabel);
                    this._contentAttributes.getField('textures').hidden = true;
                });
            } else {
                this._contentAttributes.getField('textures').value = 'no';
                this._contentAttributes.getField('textures').hidden = false;
            }
        }

        _removeTextures() {
            this._textures.forEach(texture => {
                this._contentAttributes.getField('textures').parent.remove(texture);
            });
        }

        _addMaterials(materials) {
            if (materials && materials.length > 0) {
                materials.forEach(material => {
                    const materialLabel = new pcui.Label({ text: material.name, class: CLASS_ASSET });
                    this._contentAttributes.getField('materials').parent.append(materialLabel);
                    this._materials.push(materialLabel);
                    this._contentAttributes.getField('materials').hidden = true;
                });
            } else {
                this._contentAttributes.getField('materials').value = 'no';
                this._contentAttributes.getField('materials').hidden = false;
            }
        }

        _removeMaterials() {
            this._materials.forEach(material => {
                this._contentAttributes.getField('materials').parent.remove(material);
            });
        }

        link(assets) {
            this.unlink();
            this._contentAttributes.link(assets);
            this._relatedAssetsInspector.link(assets);
            this._animationCheck(assets[0].get('meta.animation.available'));
            this._assetEvents.push(assets[0].on('meta.animation.available:set', this._animationCheck.bind(this)));
            this._addTextures(assets[0].get('meta.textures'));
            this._assetEvents.push(assets[0].on('meta.textures:set', () => {
                this._removeTextures();
                this.addTextures(assets[0].get('meta.textures'));
            }));
            this._assetEvents.push(assets[0].on('meta.textures:unset', () => {
                this._removeTextures();
                this._addTextures(assets[0].get('meta.textures'));
            }));
            this._addMaterials(assets[0].get('meta.materials'));
            this._assetEvents.push(assets[0].on('meta.materials:set', () => {
                this._removeMaterials();
                this._addMaterials(assets[0].get('meta.materials'));
            }));
            this._assetEvents.push(assets[0].on('meta.materials:unset', () => {
                this._removeMaterials();
                this._addMaterials(assets[0].get('meta.materials'));
            }));
        }

        unlink() {
            this._contentAttributes.unlink();
            this._relatedAssetsInspector.unlink();
            this._assetEvents.forEach(evt => evt.unbind());
            this._assetEvents = [];
            this._removeTextures();
            this._removeMaterials();
        }
    }

    return {
        SceneSourceAssetInspector: SceneSourceAssetInspector
    };
})());


/* editor/inspector/assets/texture-source.js */
Object.assign(pcui, (function () {
    'use strict';

    class TextureSourceAssetInspector extends pcui.RelatedAssetsInspector {
        constructor(args) {
            args = Object.assign({}, args);

            super(args);
        }
    }

    return {
        TextureSourceAssetInspector: TextureSourceAssetInspector
    };
})());


/* editor/inspector/assets/font-source.js */
Object.assign(pcui, (function () {
    'use strict';

    class FontSourceAssetInspector extends pcui.RelatedAssetsInspector {
        constructor(args) {
            args = Object.assign({}, args);

            super(args);
        }
    }

    return {
        FontSourceAssetInspector: FontSourceAssetInspector
    };
})());


/* editor/inspector/assets/font.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'asset-font-inspector';
    const CLASS_LOCALE_PANEL = CLASS_ROOT + '-locale-panel';
    const CLASS_LOCALE_REMOVE_BUTTON = CLASS_ROOT + '-locale-remove-button';
    const CLASS_CHARACTER_RANGE = CLASS_ROOT + '-character-range';
    const CLASS_CHARACTER_RANGE_LABEL = CLASS_CHARACTER_RANGE + '-label';
    const CLASS_CHARACTER_RANGE_BUTTON = CLASS_CHARACTER_RANGE + '-button';

    const PROPERTIES_ATTRIBUTES = [{
        label: 'Intensity',
        path: 'data.intensity',
        type: 'slider'
    }];

    const FONT_ATTRIBUTES = [{
        label: 'Characters',
        alias: 'characters',
        type: 'string'
    }, {
        label: 'Invert',
        path: 'meta.invert',
        type: 'boolean'
    }];

    const LOCALIZATION_ATTRIBUTES = [{
        label: 'Add Locale',
        alias: 'localization',
        type: 'string',
        args: {
            placeholder: 'Type to add (e.g. en-US)'
        }
    }];

    const addReferences = (attributes) => {
        attributes.forEach(attr => {
            const path = attr.alias || attr.path;
            if (!path) return;
            const parts = path.split('.');
            attr.reference = `asset:font:${parts[parts.length - 1]}`;
        });
    };
    addReferences(PROPERTIES_ATTRIBUTES);
    addReferences(FONT_ATTRIBUTES);

    const DOM = (parent) => [
        {
            root: {
                propertiesPanel: new pcui.Panel({
                    headerText: 'PROPERTIES'
                })
            },
            children: [{
                propertiesAttributes: new pcui.AttributesInspector({
                    assets: parent._args.assets,
                    history: parent._args.history,
                    attributes: PROPERTIES_ATTRIBUTES
                })
            }]
        },
        {
            root: {
                characterPresetsPanel: new pcui.Panel({
                    headerText: 'CHARACTER PRESETS'
                })
            },
            children: [{
                latinButton: new pcui.Button({ text: 'Latin' })
            },
            {
                latinSupplementButton: new pcui.Button({ text: 'Latin Supplement' })
            },
            {
                cyrillicButton: new pcui.Button({ text: 'Cyrillic' })
            },
            {
                greekButton: new pcui.Button({ text: 'Greek' })
            }]
        },
        {
            root: {
                characterRangePanel: new pcui.Panel({
                    headerText: 'CUSTOM CHARACTER RANGE'
                })
            },
            children: [{
                root: {
                    characterRangeContainer: new pcui.Container({
                        flex: true,
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                        class: CLASS_CHARACTER_RANGE
                    })
                },
                children: [{
                    characterRangeLabel: new pcui.Label({
                        text: 'Range (hex)',
                        class: CLASS_CHARACTER_RANGE_LABEL
                    })
                }, {
                    characterRangeStart: new pcui.TextInput({
                        placeholder: 'From',
                        value: '0x20'
                    })
                }, {
                    characterRangeEnd: new pcui.TextInput({
                        placeholder: 'To',
                        value: '0x7E'
                    })
                }, {
                    characterRangeButton: new pcui.Button({
                        icon: 'E287',
                        class: CLASS_CHARACTER_RANGE_BUTTON
                    })
                }]
            }]
        },
        {
            root: {
                fontPanel: new pcui.Panel({
                    headerText: 'FONT',
                    flex: true
                })
            },
            children: [{
                fontAttributes: new pcui.AttributesInspector({
                    assets: parent._args.assets,
                    history: parent._args.history,
                    attributes: FONT_ATTRIBUTES
                })
            }, {
                processFontButton: new pcui.Button({
                    text: 'PROCESS FONT',
                    flexGrow: 1
                })
            }]
        },
        {
            root: {
                localizationPanel: new pcui.Panel({
                    headerText: 'LOCALIZATION'
                })
            },
            children: [{
                localizationAttributes: new pcui.AttributesInspector({
                    assets: parent._args.assets,
                    history: parent._args.history,
                    attributes: LOCALIZATION_ATTRIBUTES
                })
            }]
        }
    ];

    // character presets
    const CHARACTER_PRESETS = {
        LATIN: { from: 0x20, to: 0x7e },
        LATIN_SUPPLEMENT: { from: 0xA0, to: 0xFF },
        CYRILLIC: { from: 0x400, to: 0x4ff },
        GREEK: { from: 0x370, to: 0x3FF }
    };

    class FontAssetInspector extends pcui.Container {
        constructor(args) {
            args = Object.assign({}, args);

            super(args);
            this._args = args;
            this._assets = null;
            this._assetEvents = [];
            this._localizations = {};

            this.buildDom(DOM(this));

            editor.call('attributes:reference:attach', `asset:font:presets`, this._characterPresetsPanel, this._characterPresetsPanel.header.dom);
            editor.call('attributes:reference:attach', `asset:font:customRange`, this._characterRangePanel, this._characterRangePanel.header.dom);
            editor.call('attributes:reference:attach', `asset:font:asset`, this._fontPanel, this._fontPanel.header.dom);
            editor.call('attributes:reference:attach', `asset:localization`, this._localizationPanel, this._localizationPanel.header.dom);
        }

        _getCharacterRange(range) {
            const chars = [];
            for (let i = range.from; i <= range.to; i++) {
                chars.push(String.fromCharCode(i));
            }
            return chars.join('');
        }

        _onClickPresetButton(charRange) {
            this._characterRangeStart.value = `0x${charRange.from.toString(16)}`;
            this._characterRangeEnd.value = `0x${charRange.to.toString(16)}`;
            this._fontAttributes.getField('characters').values = this._assets.map(() => {
                return this._fontAttributes.getField('characters').value + this._getCharacterRange(charRange);
            });
        }

        _onClickCharacterRangeButton() {
            const from = this._characterRangeStart.value;
            const to = this._characterRangeEnd.value;
            this._fontAttributes.getField('meta.chars').values = this._assets.map(() => {
                return this._fontAttributes.getField('characters').value + this._getCharacterRange({ from, to });
            });
        }

        _onClickProcessFontButton() {
            const characterValues = this._fontAttributes.getField('characters').value;
            this._assets.forEach(asset => {
                const sourceId = asset.get('source_asset_id');
                if (!sourceId) return;

                const source = editor.call('assets:get', sourceId);
                if (!source) return;

                // remove duplicate chars
                // remove duplicate chars but keep same order
                let unique = '';
                const chars = {};

                for (let i = 0, len = characterValues.length; i < len; i++) {
                    if (chars[characterValues[i]]) continue;
                    chars[characterValues[i]] = true;
                    unique += characterValues[i];
                }

                const task = {
                    source:source.get('uniqueId'),
                    target: asset.get('uniqueId'),
                    chars: unique,
                    invert: this._fontAttributes.getField('meta.invert').value
                };

                editor.call('realtime:send', 'pipeline', {
                    name: 'convert',
                    data: task
                });
            });
        }

        _toggleProcessFontButton(asset) {
            this._processFontButton.disabled = asset.get('task') === 'running';
        }

        _refreshLocalizationsForAsset() {
            Object.keys(this._localizations).forEach(locale => {
                this._removeLocalization(locale);

            });
            Object.keys(this._assets[0].get('i18n'))
            .sort((a, b) => {
                if (a > b)
                    return 1;
                else if (b > a)
                    return -1;
                return 0;
            })
            .forEach(locale => {
                const localizationAssetPanel = new pcui.Panel({
                    headerText: locale,
                    removable: true
                });
                localizationAssetPanel.class.add(CLASS_LOCALE_PANEL);
                this._assetEvents.push(localizationAssetPanel.on('click:remove', () => {
                    this._assets[0].unset(`i18n.${locale}`);
                }));
                localizationAssetPanel._localizationAsset = new pcui.AssetInput({
                    assetType: 'font',
                    assets: this._args.assets,
                    flexGrow: 1,
                    text: 'Asset',
                    binding: new pcui.BindingTwoWay({
                        history: this._args.history
                    }),
                    allowDragDrop: true
                });
                localizationAssetPanel._localizationAsset.link(this._assets, `i18n.${locale}`);
                localizationAssetPanel.append(localizationAssetPanel._localizationAsset);
                this._localizationPanel.append(localizationAssetPanel);
                this._localizations[locale] = localizationAssetPanel;
            });
        }

        _addLocalization(locale) {
            if (locale === '') {
                this._localizationAttributes.getField('localization').class.remove(pcui.CLASS_ERROR);
                return;
            }
            if (!Object.keys(this._assets[0].get(`i18n`)).includes(locale)) {
                this._assets[0].set('i18n.' + locale, null);
                this._localizationAttributes.getField('localization').value = '';
                this._localizationAttributes.getField('localization').class.remove(pcui.CLASS_ERROR);
            } else {
                this._localizationAttributes.getField('localization').class.add(pcui.CLASS_ERROR);
            }
        }

        _removeLocalization(locale) {
            const localizationAssetPanel = this._localizations[locale];
            localizationAssetPanel._localizationAsset.unlink();
            this._localizationPanel.remove(localizationAssetPanel);
            delete this._localizations[locale];
        }

        link(assets) {
            this.unlink();
            this._assets = assets;

            // Linking
            this._propertiesAttributes.link(assets);
            this._fontAttributes.link(assets);
            this._localizationAttributes.link(assets);
            this._refreshLocalizationsForAsset();

            // Events
            this._assetEvents.push(this._latinButton.on('click', () => this._onClickPresetButton(CHARACTER_PRESETS.LATIN)));
            this._assetEvents.push(this._latinSupplementButton.on('click', () => this._onClickPresetButton(CHARACTER_PRESETS.LATIN_SUPPLEMENT)));
            this._assetEvents.push(this._cyrillicButton.on('click', () => this._onClickPresetButton(CHARACTER_PRESETS.CYRILLIC)));
            this._assetEvents.push(this._greekButton.on('click', () => this._onClickPresetButton(CHARACTER_PRESETS.GREEK)));
            this._assetEvents.push(this._characterRangeButton.on('click', this._onClickCharacterRangeButton.bind(this)));
            this._assetEvents.push(this._processFontButton.on('click', this._onClickProcessFontButton.bind(this)));
            this._assetEvents.push(this._localizationAttributes.getField('localization').on('change', this._addLocalization.bind(this)));
            assets.forEach((asset) => {
                this._assetEvents.push(asset.on('task:set', () => this._toggleProcessFontButton(asset)));
                this._assetEvents.push(asset.on('*:set', this._refreshLocalizationsForAsset.bind(this)));
                this._assetEvents.push(asset.on('*:unset', this._refreshLocalizationsForAsset.bind(this)));
            });

            // View adjustments
            this._characterRangePanel.hidden = assets.length > 1;
            this._characterPresetsPanel.hidden = assets.length > 1;
            this._fontPanel.hidden = assets.length > 1;
            this._localizationPanel.hidden = assets.length > 1;

            const charactersField = this._fontAttributes.getField('characters');
            charactersField.renderChanges = false;
            charactersField.values = assets.map(asset => {
                return asset.get('meta.chars');
            });
            charactersField.renderChanges = true;
        }

        unlink() {
            if (!this._assets) return;
            this._propertiesAttributes.unlink();
            this._fontAttributes.unlink();
            this._localizationAttributes.unlink();
            Object.keys(this._localizations).forEach(localization => {
                this._removeLocalization(localization);
            });
            this._assetEvents.forEach(evt => evt.unbind());
            this._localizationAttributes.getField('localization').value = '';
            this._localizationAttributes.getField('localization').class.remove(pcui.CLASS_ERROR);
        }
    }

    return {
        FontAssetInspector: FontAssetInspector
    };
})());


/* editor/inspector/assets/font-preview.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_CANVAS = 'pcui-asset-preview-canvas';
    const CLASS_CANVAS_FLIP = 'pcui-asset-preview-canvas-flip';

    class FontAssetInspectorPreview extends pcui.AssetInspectorPreviewBase {
        constructor(args) {
            super(args);

            this._preview = new pcui.Canvas({
                canvasWidth: 320,
                canvasHeight: 144,
                class: [CLASS_CANVAS, CLASS_CANVAS_FLIP],
                useDevicePixelRatio: true
            });

            this.append(this._preview);

            this._renderFrame = null;
        }

        // queue up the rendering to prevent too often renders
        _queueRender() {
            if (this._renderFrame) return;
            this._renderFrame = requestAnimationFrame(this._renderPreview.bind(this));
        }

        _renderPreview() {
            if (this._renderFrame) {
                cancelAnimationFrame(this._renderFrame);
                this._renderFrame = null;
            }

            if (this.dom.offsetWidth !== 0 && this.dom.offsetHeight !== 0) {
                this._preview.dom.width = this.dom.offsetWidth;
                this._preview.dom.height = this.dom.offsetHeight;
            }
            this._previewRenderer.render();
        }

        _toggleSize() {
            super._toggleSize();
            this._queueRender();
        }

        updatePreview() {
            this._queueRender();
        }

        link(assets) {
            super.link(assets);
            this._previewRenderer = new pcui.FontThumbnailRenderer(assets[0], this._preview.dom);
            this._queueRender();
        }

        unlink() {
            super.unlink();
            if (this._previewRenderer) {
                this._previewRenderer.destroy();
            }
            if (this._renderFrame) {
                cancelAnimationFrame(this._renderFrame);
                this._renderFrame = null;
            }
        }
    }

    return {
        FontAssetInspectorPreview: FontAssetInspectorPreview
    };
})());


/* editor/inspector/assets/textureatlas.js */
Object.assign(pcui, (function () {
    'use strict';

    return {
        TextureAtlasAssetInspector: pcui.TextureAssetInspector
    };
})());


/* editor/inspector/assets/textureatlas-preview.js */
Object.assign(pcui, (function () {
    'use strict';

    return {
        TextureAtlasAssetInspectorPreview: pcui.TextureAssetInspectorPreview
    };
})());


/* editor/inspector/assets/wasm.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [{
        label: 'Name',
        path: 'data.moduleName',
        type: 'string'
    }, {
        label: 'Glue script',
        path: 'data.glueScriptId',
        type: 'asset'
    }, {
        label: 'Fallback script',
        path: 'data.fallbackScriptId',
        type: 'asset'
    }];

    const DOM = parent => [
        {
            attributesInspector: new pcui.AttributesInspector({
                assets: parent._args.assets,
                history: parent._args.history,
                attributes: ATTRIBUTES
            })
        }
    ];

    class WasmAssetInspector extends pcui.Panel {
        constructor(args) {
            args = Object.assign({}, args);
            args.headerText = 'WASM MODULE';

            super(args);
            this._args = args;
            this.buildDom(DOM(this));
        }

        link(assets) {
            this.unlink();
            this._attributesInspector.link(assets);
        }

        unlink() {
            this._attributesInspector.unlink();
        }
    }

    return {
        WasmAssetInspector: WasmAssetInspector
    };
})());
