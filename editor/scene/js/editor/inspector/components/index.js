

/* editor/inspector/components/animation.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [{
        label: 'Assets',
        path: 'components.animation.assets',
        type: 'assets',
        args: {
            assetType: 'animation'
        }
    }, {
        label: 'Speed',
        path: 'components.animation.speed',
        type: 'slider',
        args: {
            precision: 3,
            step: 0.1,
            sliderMin: -2,
            sliderMax: 2
        }
    }, {
        label: 'Activate',
        path: 'components.animation.activate',
        type: 'boolean'
    }, {
        label: 'Loop',
        path: 'components.animation.loop',
        type: 'boolean'
    }];

    ATTRIBUTES.forEach(attr => {
        const parts = attr.path.split('.');
        attr.reference = `animation:${parts[parts.length - 1]}`;
    });

    const CLASS_BUTTON_PLAY = 'animation-component-inspector-play';

    class AnimationComponentInspector extends pcui.ComponentInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.component = 'animation';

            super(args);

            this._assets = args.assets;

            this._attributesInspector = new pcui.AttributesInspector({
                assets: args.assets,
                history: args.history,
                attributes: ATTRIBUTES,
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);
        }

        _refreshPlayButtons(entities, assetList) {
            
            const listItems = assetList.listItems;
            listItems.forEach(item => {
                this._addPlayButtonForAnimation(entities, item.assetId, item.element);
            });
        }

        _addPlayButtonForAnimation(entities, assetId, listItem) {
            // destroy existing button
            const existing = listItem.dom.querySelector('.' + CLASS_BUTTON_PLAY);
            if (existing) {
                existing.ui.destroy();
            }

            const label = listItem.dom.querySelector('.pcui-label');
            if (!label) return;

            if (!this._assets.get(assetId)) return;

            const btn = new pcui.Button({
                size: 'small',
                icon: 'E131',
                class: CLASS_BUTTON_PLAY
            });

            // play animation on click
            btn.on('click', (evt) => {
                evt.stopPropagation();
                this._playAnimation(entities, assetId);
            });

            listItem.appendAfter(btn, label);
        }

        _playAnimation(entities, assetId) {
            assetId = assetId;

            for (let i = 0; i < entities.length; i++) {
                if (! entities[i].entity || ! entities[i].entity.animation)
                    continue;

                if (entities[i].entity.animation.assets.indexOf(assetId) === -1) {
                    entities[i].entity.animation._stopCurrentAnimation();
                    continue;
                }

                const name = entities[i].entity.animation.animationsIndex[assetId];
                if (! name) continue;

                entities[i].entity.animation.play(name);
            }
        }

        _stopAnimation(entities) {
            for (let i = 0; i < entities.length; i++) {
                if (! entities[i].entity || ! entities[i].entity.animation)
                    continue;

                entities[i].entity.animation._stopCurrentAnimation();
            }
        }

        link(entities) {
            super.link(entities);

            this._attributesInspector.link(entities);

            const assetList = this._attributesInspector.getField('components.animation.assets');
            this._refreshPlayButtons(entities, assetList);

            // refresh play buttons when animations are added
            assetList.on('change', () => {
                this._refreshPlayButtons(entities, assetList);
            });

            this._stopAnimation(entities);
        }

        unlink() {
            if (this._entities) {
                this._stopAnimation(this._entities);
            }

            super.unlink();
            this._attributesInspector.unlink();
        }
    }

    return {
        AnimationComponentInspector: AnimationComponentInspector
    };
})());


/* editor/inspector/components/audiolistener.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [];

    class AudiolistenerComponentInspector extends pcui.ComponentInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.component = 'audiolistener';

            super(args);

            this._attributesInspector = new pcui.AttributesInspector({
                assets: args.assets,
                history: args.history,
                attributes: ATTRIBUTES,
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);
        }

        link(entities) {
            super.link(entities);
            this._attributesInspector.link(entities);
        }

        unlink() {
            super.unlink();
            this._attributesInspector.unlink();
        }
    }

    return {
        AudiolistenerComponentInspector: AudiolistenerComponentInspector
    };
})());


/* editor/inspector/components/audiosource.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [{
        label: 'Assets',
        path: 'components.audiosource.assets',
        type: 'assets',
        args: {
            assetType: 'audio'
        }
    }, {
        label: 'Activate',
        path: 'components.audiosource.activate',
        type: 'boolean'
    }, {
        label: 'Loop',
        path: 'components.audiosource.loop',
        type: 'boolean'
    }, {
        label: '3D',
        path: 'components.audiosource.3d',
        type: 'boolean'
    }, {
        label: 'Volume',
        path: 'components.audiosource.volume',
        type: 'slider',
        args: {
            precision: 2,
            min: 0,
            max: 1,
            step: 0.01
        }
    }, {
        label: 'Pitch',
        path: 'components.audiosource.pitch',
        type: 'slider',
        args: {
            precision: 2,
            min: 0,
            step: 0.1
        }
    }, {
        label: 'Min Distance',
        path: 'components.audiosource.minDistance',
        type: 'number',
        args: {
            precision: 2,
            min: 0,
            step: 1
        }
    }, {
        label: 'Max Distance',
        path: 'components.audiosource.maxDistance',
        type: 'number',
        args: {
            precision: 2,
            min: 0,
            step: 1
        }
    }, {
        label: 'Roll-off Factor',
        path: 'components.audiosource.rollOffFactor',
        type: 'number',
        args: {
            precision: 2,
            step: 0.1,
            min: 0
        }
    }];

    ATTRIBUTES.forEach(attr => {
        if (!attr.path) return;
        const parts = attr.path.split('.');
        attr.reference = `audiosource:${parts[parts.length - 1]}`;
    });

    class AudiosourceComponentInspector extends pcui.ComponentInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.component = 'audiosource';

            super(args);

            this._attributesInspector = new pcui.AttributesInspector({
                assets: args.assets,
                history: args.history,
                attributes: ATTRIBUTES,
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);

            this._field('3d').on('change', this._toggleFields.bind(this));

            this._skipToggleFields = false;
        }

        _field(name) {
            return this._attributesInspector.getField(`components.audiosource.${name}`);
        }

        _toggleFields() {
            if (this._skipToggleFields) return;

            const is3d = this._field('3d').value === true;

            this._field('minDistance').parent.hidden = !is3d;
            this._field('maxDistance').parent.hidden = !is3d;
            this._field('rollOffFactor').parent.hidden = !is3d;
        }

        link(entities) {
            super.link(entities);

            this._skipToggleFields = true;
            this._attributesInspector.link(entities);
            this._skipToggleFields = false;
            this._toggleFields();
        }

        unlink() {
            super.unlink();
            this._attributesInspector.unlink();
        }
    }

    return {
        AudiosourceComponentInspector: AudiosourceComponentInspector
    };
})());


/* editor/inspector/components/button.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [{
        label: 'Active',
        path: 'components.button.active',
        type: 'boolean'
    }, {
        label: 'Image',
        path: 'components.button.imageEntity',
        type: 'entity'
    }, {
        label: 'Hit Padding',
        path: 'components.button.hitPadding',
        type: 'vec4',
        args: {
            placeholder: ['←', '↓', '→', '↑']
        }
    }, {
        label: 'Transition Mode',
        path: 'components.button.transitionMode',
        type: 'select',
        args: {
            type: 'number',
            options: [{
                v: BUTTON_TRANSITION_MODE_TINT, t: 'Tint'
            }, {
                v: BUTTON_TRANSITION_MODE_SPRITE_CHANGE, t: 'Sprite Change'
            }]
        }
    }, {
        label: 'Hover Tint',
        path: 'components.button.hoverTint',
        type: 'rgba'
    }, {
        label: 'Pressed Tint',
        path: 'components.button.pressedTint',
        type: 'rgba'
    }, {
        label: 'Inactive Tint',
        path: 'components.button.inactiveTint',
        type: 'rgba'
    }, {
        label: 'Fade Duration',
        path: 'components.button.fadeDuration',
        type: 'number'
    }, {
        label: 'Hover Sprite',
        path: 'components.button.hoverSpriteAsset',
        type: 'asset',
        args: {
            assetType: 'sprite'
        }
    }, {
        label: 'Hover Frame',
        path: 'components.button.hoverSpriteFrame',
        type: 'number',
        args: {
            min: 0,
            precision: 0,
            step: 1
        }
    }, {
        label: 'Pressed Sprite',
        path: 'components.button.pressedSpriteAsset',
        type: 'asset',
        args: {
            assetType: 'sprite'
        }
    }, {
        label: 'Pressed Frame',
        path: 'components.button.pressedSpriteFrame',
        type: 'number',
        args: {
            min: 0,
            precision: 0,
            step: 1
        }
    }, {
        label: 'Inactive Sprite',
        path: 'components.button.inactiveSpriteAsset',
        type: 'asset',
        args: {
            assetType: 'sprite'
        }
    }, {
        label: 'Inactive Frame',
        path: 'components.button.inactiveSpriteFrame',
        type: 'number',
        args: {
            min: 0,
            precision: 0,
            step: 1
        }
    }];

    ATTRIBUTES.forEach(attr => {
        const parts = attr.path.split('.');
        attr.reference = `button:${parts[parts.length - 1]}`;
    });

    class ButtonComponentInspector extends pcui.ComponentInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.component = 'button';

            super(args);

            this._attributesInspector = new pcui.AttributesInspector({
                assets: args.assets,
                entities: args.entities,
                history: args.history,
                attributes: ATTRIBUTES,
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);

            this._field('transitionMode').on('change', this._toggleFields.bind(this));

            this._suppressToggleFields = false;
        }

        _field(name) {
            return this._attributesInspector.getField(`components.button.${name}`);
        }

        _toggleFields() {
            if (this._suppressToggleFields) return;

            const fieldTransitionMode = this._field('transitionMode');
            const isTintMode = (fieldTransitionMode.value === BUTTON_TRANSITION_MODE_TINT);
            const isSpriteChangeMode = (fieldTransitionMode.value === BUTTON_TRANSITION_MODE_SPRITE_CHANGE);

            [
                'hoverTint',
                'pressedTint',
                'inactiveTint',
                'fadeDuration'
            ].forEach(name => {
                this._field(name).parent.hidden = !isTintMode;
            });

            [
                'hoverSpriteAsset',
                'pressedSpriteAsset',
                'inactiveSpriteAsset'
            ].forEach(name => {
                this._field(name).hidden = !isSpriteChangeMode;
            });

            [
                'hoverSpriteFrame',
                'pressedSpriteFrame',
                'inactiveSpriteFrame'
            ].forEach(name => {
                this._field(name).parent.hidden = !isSpriteChangeMode;
            });
        }

        link(entities) {
            super.link(entities);
            this._suppressToggleFields = true;
            this._attributesInspector.link(entities);
            this._suppressToggleFields = false;

            this._toggleFields();
        }

        unlink() {
            super.unlink();
            this._attributesInspector.unlink();
        }
    }

    return {
        ButtonComponentInspector: ButtonComponentInspector
    };
})());


/* editor/inspector/components/camera.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [{
        label: 'Clear Color Buffer',
        path: 'components.camera.clearColorBuffer',
        type: 'boolean'
    }, {
        label: 'Clear Depth Buffer',
        path: 'components.camera.clearDepthBuffer',
        type: 'boolean'
    }, {
        label: 'Clear Color',
        path: 'components.camera.clearColor',
        type: 'rgba'
    }, {
        label: 'Projection',
        path: 'components.camera.projection',
        type: 'select',
        args: {
            type: 'number',
            options: [{
                v: 0, t: 'Perspective'
            }, {
                v: 1, t: 'Orthographic'
            }]
        }
    }, {
        label: 'Frustum Culling',
        path: 'components.camera.frustumCulling',
        type: 'boolean'
    }, {
        label: 'Field Of View',
        path: 'components.camera.fov',
        type: 'slider',
        args: {
            min: 0,
            sliderMax: 90,
            precision: 2,
            step: 1,
            placeholder: '\u00B0'
        }
    }, {
        label: 'Ortho Height',
        path: 'components.camera.orthoHeight',
        type: 'number'
    }, {
        label: 'Near Clip',
        path: 'components.camera.nearClip',
        type: 'number',
        args: {
            precision: 4,
            step: 0.1,
            min: 0
        }
    }, {
        label: 'Far Clip',
        path: 'components.camera.farClip',
        type: 'number',
        args: {
            precision: 4,
            step: 0.1,
            min: 0
        }
    }, {
        label: 'Priority',
        path: 'components.camera.priority',
        type: 'number',
        args: {
            min: 0,
            precision: 1,
            step: 1
        }
    }, {
        label: 'Viewport',
        path: 'components.camera.rect',
        type: 'vec4',
        args: {
            precision: 3,
            step: 0.01,
            min: 0,
            max: 1,
            placeholder: ['X', 'Y', 'W', 'H']
        }
    }, {
        label: 'Layers',
        path: 'components.camera.layers',
        type: 'layers'
    }];

    ATTRIBUTES.forEach(attr => {
        const parts = attr.path.split('.');
        attr.reference = `camera:${parts[parts.length - 1]}`;
    });

    class CameraComponentInspector extends pcui.ComponentInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.component = 'camera';

            super(args);

            this._attributesInspector = new pcui.AttributesInspector({
                assets: args.assets,
                projectSettings: args.projectSettings,
                history: args.history,
                attributes: ATTRIBUTES,
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);

            ['clearColorBuffer', 'projection'].forEach(field => {
                this._field(field).on('change', this._toggleFields.bind(this));
            });

            this._suppressToggleFields = false;
        }

        _field(name) {
            return this._attributesInspector.getField(`components.camera.${name}`);
        }

        _toggleFields() {
            if (this._suppressToggleFields) return;

            const fieldColorBuffer = this._field('clearColorBuffer');
            const fieldProjection = this._field('projection');
            this._field('clearColor').parent.hidden = !fieldColorBuffer.value;
            this._field('fov').parent.hidden = fieldProjection.value !== 0;
            this._field('orthoHeight').parent.hidden = fieldProjection.value !== 1;
        }

        link(entities) {
            super.link(entities);
            this._suppressToggleFields = true;
            this._attributesInspector.link(entities);
            this._suppressToggleFields = false;
            this._toggleFields();
        }

        unlink() {
            super.unlink();
            this._attributesInspector.unlink();
        }
    }

    return {
        CameraComponentInspector: CameraComponentInspector
    };
})());


/* editor/inspector/components/collision.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [{
        label: 'Type',
        path: 'components.collision.type',
        type: 'select',
        args: {
            type: 'string',
            options: [{
                v: 'box', t: 'Box'
            }, {
                v: 'sphere', t: 'Sphere'
            }, {
                v: 'capsule', t: 'Capsule'
            }, {
                v: 'cylinder', t: 'Cylinder'
            }, {
                v: 'mesh', t: 'Mesh'
            }, {
                v: 'compound', t: 'Compound'
            }]
        }
    }, {
        label: 'Half Extents',
        path: 'components.collision.halfExtents',
        type: 'vec3',
        args: {
            placeholder: ['X', 'Y', 'Z'],
            precision: 3,
            step: 0.1,
            min: 0
        }
    }, {
        label: 'Radius',
        path: 'components.collision.radius',
        type: 'number',
        args: {
            precision: 2,
            step: 0.1,
            min: 0
        }
    }, {
        label: 'Height',
        path: 'components.collision.height',
        type: 'number',
        args: {
            precision: 2,
            step: 0.1,
            min: 0
        }
    }, {
        label: 'Axis',
        path: 'components.collision.axis',
        type: 'select',
        args: {
            type: 'number',
            options: [{
                v: 0, t: 'X'
            }, {
                v: 1, t: 'Y'
            }, {
                v: 2, t: 'Z'
            }]
        }
    }, {
        label: 'Asset',
        path: 'components.collision.asset',
        type: 'asset',
        args: {
            assetType: 'model'
        }
    }];

    ATTRIBUTES.forEach(attr => {
        const parts = attr.path.split('.');
        attr.reference = `collision:${parts[parts.length - 1]}`;
    });

    class CollisionComponentInspector extends pcui.ComponentInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.component = 'collision';

            super(args);

            this._attributesInspector = new pcui.AttributesInspector({
                assets: args.assets,
                history: args.history,
                attributes: ATTRIBUTES,
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);

            this._field('type').on('change', this._toggleFields.bind(this));

            this._suppressToggleFields = false;

            this._importAmmoPanel = editor.call('attributes:appendImportAmmo', this);
            this._importAmmoPanel.hidden = true;
            this._importAmmoPanel.label.text = 'Ammo module not found';
            this._importAmmoPanel.class.add('library-warning');
            this._importAmmoPanel.label.class.add('library-warning-text');
            this._importAmmoPanel.style.margin = '6px';

            this.on('show', () => {
                this._importAmmoPanel.hidden = editor.call('project:settings:hasPhysics');
            });
        }

        _field(name) {
            return this._attributesInspector.getField(`components.collision.${name}`);
        }

        _toggleFields() {
            if (this._suppressToggleFields) return;

            const fieldType = this._field('type');
            this._field('halfExtents').parent.hidden = fieldType.value !== 'box';
            this._field('radius').parent.hidden = ['sphere', 'capsule', 'cylinder'].indexOf(fieldType.value) === -1;
            this._field('height').parent.hidden = ['capsule', 'cylinder'].indexOf(fieldType.value) === -1;
            this._field('axis').parent.hidden = ['capsule', 'cylinder'].indexOf(fieldType.value) === -1;
            this._field('asset').hidden = fieldType.value !== 'mesh';
        }

        link(entities) {
            super.link(entities);
            this._suppressToggleFields = true;
            this._attributesInspector.link(entities);
            this._suppressToggleFields = false;
            this._toggleFields();
        }

        unlink() {
            super.unlink();
            this._attributesInspector.unlink();
        }
    }

    return {
        CollisionComponentInspector: CollisionComponentInspector
    };
})());


/* editor/inspector/components/element.js */
Object.assign(pcui, (function () {
    'use strict';

    const PRESETS = {
        '0,1,0,1/0,1': 'Top Left',
        '0.5,1,0.5,1/0.5,1': 'Top',
        '1,1,1,1/1,1': 'Top Right',
        '0,0.5,0,0.5/0,0.5': 'Left',
        '0.5,0.5,0.5,0.5/0.5,0.5': 'Center',
        '1,0.5,1,0.5/1,0.5': 'Right',
        '0,0,0,0/0,0': 'Bottom Left',
        '0.5,0,0.5,0/0.5,0': 'Bottom',
        '1,0,1,0/1,0': 'Bottom Right',
        'custom': 'Custom'
    };

    const ATTRIBUTES = [{
        label: 'Type',
        path: 'components.element.type',
        type: 'select',
        args: {
            type: 'string',
            options: [{
                v: 'group', t: 'Group'
            },{
                v: 'image', t: 'Image'
            },{
                v: 'text', t: 'Text'
            }]
        }
    }, {
        label: 'Preset',
        type: 'select',
        alias: 'components.element.preset',
        args: {
            type: 'string',
            options: Object.keys(PRESETS).map(key => {
                return { v: key, t: PRESETS[key] };
            })
        }
    }, {
        label: 'Anchor',
        path: 'components.element.anchor',
        type: 'vec4',
        args: {
            precision: 2,
            step: 0.1,
            min: 0,
            max: 1,
            placeholder: ['←', '↓', '→', '↑']
        }
    }, {
        label: 'Pivot',
        path: 'components.element.pivot',
        type: 'vec2',
        args: {
            precision: 2,
            step: 0.1,
            min: 0,
            max: 1,
            placeholder: ['↔', '↕']
        }
    }, {
        label: 'Auto Width',
        path: 'components.element.autoWidth',
        type: 'boolean'
    }, {
        label: 'Auto Fit Width',
        path: 'components.element.autoFitWidth',
        type: 'boolean'
    }, {
        label: 'Width',
        path: 'components.element.width',
        type: 'number',
        args: {
            precision: 2,
            step: 1
        }
    }, {
        label: 'Auto Height',
        path: 'components.element.autoHeight',
        type: 'boolean'
    }, {
        label: 'Auto Fit Height',
        path: 'components.element.autoFitHeight',
        type: 'boolean'
    }, {
        label: 'Height',
        path: 'components.element.height',
        type: 'number',
        args: {
            precision: 2,
            step: 1
        }
    }, {
        label: 'Margin',
        path: 'components.element.margin',
        type: 'vec4',
        args: {
            placeholder: ['←', '↓', '→', '↑'],
            precision: 2,
            step: 1
        }
    }, {
        label: 'Alignment',
        path: 'components.element.alignment',
        type: 'vec2',
        args: {
            precision: 2,
            step: 0.1,
            min: 0,
            max: 1,
            placeholder: ['↔', '↕']
        }
    }, {
        label: 'Font',
        path: 'components.element.fontAsset',
        type: 'asset',
        args: {
            assetType: 'font'
        }
    }, {
        label: 'Localized',
        type: 'boolean',
        alias: 'components.element.localized'
    }, {
        label: 'Text',
        path: 'components.element.text',
        type: 'text'
    }, {
        label: 'Key',
        path: 'components.element.key',
        type: 'text'
    }, {
        label: 'Enable Markup',
        path: 'components.element.enableMarkup',
        type: 'boolean'
    }, {
        label: 'Font Size',
        path: 'components.element.fontSize',
        type: 'number'
    }, {
        label: 'Min Font Size',
        path: 'components.element.minFontSize',
        type: 'number',
        args: {
            min: 0
        }
    }, {
        label: 'Max Font Size',
        path: 'components.element.maxFontSize',
        type: 'number',
        args: {
            min: 0
        }
    }, {
        label: 'Line Height',
        path: 'components.element.lineHeight',
        type: 'number'
    }, {
        label: 'Wrap Lines',
        path: 'components.element.wrapLines',
        type: 'boolean'
    }, {
        label: 'Max Lines',
        path: 'components.element.maxLines',
        type: 'number',
        args: {
            min: 1,
            allowNull: true
        }
    }, {
        label: 'Spacing',
        path: 'components.element.spacing',
        type: 'number'
    }, {
        label: 'Color',
        path: 'components.element.color',
        type: 'rgb'
    }, {
        label: 'Opacity',
        path: 'components.element.opacity',
        type: 'slider',
        args: {
            min: 0,
            max: 1,
            precision: 3,
            step: 0.01
        }
    }, {
        label: 'Outline Color',
        path: 'components.element.outlineColor',
        type: 'rgba'
    }, {
        label: 'Outline Thickness',
        path: 'components.element.outlineThickness',
        type: 'slider',
        args: {
            precision: 2,
            step: 0.1,
            min: 0,
            max: 1
        }
    }, {
        label: 'Shadow Color',
        path: 'components.element.shadowColor',
        type: 'rgba'
    }, {
        label: 'Shadow Offset',
        path: 'components.element.shadowOffset',
        type: 'vec2',
        args: {
            precision: 2,
            step: 0.1,
            min: -1,
            max: 1,
            placeholder: ['↔', '↕']
        }
    }, {
        label: 'Rect',
        path: 'components.element.rect',
        type: 'vec4',
        args: {
            placeholder: ['U', 'V', 'W', 'H']
        }
    }, {
        label: 'Mask',
        path: 'components.element.mask',
        type: 'boolean'
    }, {
        label: 'Texture',
        path: 'components.element.textureAsset',
        type: 'asset',
        args: {
            assetType: 'texture'
        }
    }, {
        label: 'Sprite',
        path: 'components.element.spriteAsset',
        type: 'asset',
        args: {
            assetType: 'sprite'
        }
    }, {
        label: 'Frame',
        path: 'components.element.spriteFrame',
        type: 'number',
        args: {
            min: 0,
            precision: 0,
            step: 1
        }
    }, {
        label: 'Pixels Per Unit',
        path: 'components.element.pixelsPerUnit',
        type: 'number',
        args: {
            min: 0,
            allowNull: true
        }
    }, {
        label: 'Material',
        path: 'components.element.materialAsset',
        type: 'asset',
        args: {
            assetType: 'material'
        }
    }, {
        label: 'Use Input',
        path: 'components.element.useInput',
        type: 'boolean'
    }, {
        type: 'divider'
    }, {
        label: 'Batch Group',
        path: 'components.element.batchGroupId',
        type: 'batchgroup'
    }, {
        label: 'Layers',
        path: 'components.element.layers',
        type: 'layers',
        args: {
            excludeLayers: [
                LAYERID_DEPTH,
                LAYERID_SKYBOX,
                LAYERID_IMMEDIATE
            ]
        }
    }];

    ATTRIBUTES.forEach(attr => {
        const field = attr.path || attr.alias;
        if (!field) return;
        const parts = field.split('.');
        attr.reference = `element:${parts[parts.length - 1]}`;
    });


    // Custom binding from element -> observers for texture asset which
    // resizes an Image Element when a texture asset is first assigned
    class TextureAssetElementToObserversBinding extends pcui.BindingElementToObservers {
        constructor(assets, args) {
            super(args);
            this._assets = assets;
        }

        clone() {
            return new TextureAssetElementToObserversBinding(this._assets, {
                history: this._history,
                historyPrefix: this._historyPrefix,
                historyPostfix: this._historyPostfix,
                historyName: this._historyName,
                historyCombine: this._historyCombine
            });
        }

        _hasSplitAnchor(entity) {
            const anchor = entity.get('components.element.anchor');
            return !anchor ||
                   Math.abs(anchor[0] - anchor[2]) > 0.01 ||
                   Math.abs(anchor[1] - anchor[3]) > 0.01;
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

            let previous = {};

            const undo = () => {
                for (let i = 0; i < observers.length; i++) {
                    const latest = observers[i].latest();
                    if (!latest || !latest.has('components.element')) continue;

                    let history = false;
                    if (latest.history) {
                        history = latest.history.enabled;
                        latest.history.enabled = false;
                    }

                    const path = this._pathAt(paths, i);

                    const prevEntry = previous[latest.get('resource_id')];

                    latest.set(path, prevEntry.value);

                    if (prevEntry.hasOwnProperty('width')) {
                        latest.set('components.element.width', prevEntry.width);
                        latest.set('components.element.height', prevEntry.height);
                        latest.set('components.element.margin', prevEntry.margin);
                    }

                    if (history) {
                        latest.history.enabled = true;
                    }
                }
            };

            const redo = () => {
                previous = {};

                const asset = this._assets.get(value);
                const width = asset && asset.get('meta.width') || 0;
                const height = asset && asset.get('meta.height') || 0;

                for (let i = 0; i < observers.length; i++) {
                    const latest = observers[i].latest();
                    if (!latest || !latest.has('components.element')) continue;

                    let history = false;
                    if (latest.history) {
                        history = latest.history.enabled;
                        latest.history.enabled = false;
                    }

                    const path = this._pathAt(paths, i);

                    const prevEntry = {
                        value: latest.get(path)
                    };

                    latest.set(path, value);

                    if (!prevEntry.value && width && height && !this._hasSplitAnchor(latest)) {
                        prevEntry.width = latest.get('components.element.width');
                        prevEntry.height = latest.get('components.element.height');
                        prevEntry.margin = latest.get('components.element.margin');

                        latest.set('components.element.width', width);
                        latest.set('components.element.height', height);

                        if (latest.entity) {
                            const margin = latest.entity.element.margin;
                            latest.set('components.element.margin', [margin.x, margin.y, margin.z, margin.w]);
                        }
                    }

                    previous[latest.get('resource_id')] = prevEntry;

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

    class ElementComponentInspector extends pcui.ComponentInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.component = 'element';

            super(args);

            this._attributesInspector = new pcui.AttributesInspector({
                assets: args.assets,
                projectSettings: args.projectSettings,
                history: args.history,
                attributes: ATTRIBUTES,
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);

            // in order to display RTL text correctly in the editor
            // see https://www.w3.org/International/articles/inline-bidi-markup/
            this._field('text').input.setAttribute('dir', 'auto');

            [
                'type',
                'localized',
                'key',
                'autoWidth',
                'autoHeight',
                'autoFitWidth',
                'autoFitHeight',
                'wrapLines',
                'materialAsset',
                'spriteAsset',
                'textureAsset',
                'fontAsset'
            ].forEach(name => {
                this._field(name).on('change', this._toggleFields.bind(this));
            });

            this._field('key').on('change', this._onFieldKeyChange.bind(this));
            this._field('localized').on('change', this._onFieldLocalizedChange.bind(this));
            this._field('anchor').on('change', this._onFieldAnchorChange.bind(this));
            this._field('pivot').on('change', this._onFieldPivotChange.bind(this));
            this._field('preset').on('change', this._onFieldPresetChange.bind(this));
            this._field('fontAsset').on('change', this._onFieldFontAssetChange.bind(this));

            // update binding of textureAsset field
            this._field('textureAsset').binding = new pcui.BindingTwoWay({
                history: args.history,
                bindingElementToObservers: new TextureAssetElementToObserversBinding(args.assets, {
                    history: args.history
                })
            });

            this._suppressLocalizedEvents = false;
            this._suppressPresetEvents = false;
            this._suppressToggleFields = false;
        }

        _field(name) {
            return this._attributesInspector.getField(`components.element.${name}`);
        }

        _toggleFields() {
            if (this._suppressToggleFields) return;

            const type = this._field('type').value;
            const isText = type === 'text';
            const isImage = type === 'image';

            const texture = this._field('textureAsset').value;
            const sprite = this._field('spriteAsset').value;
            const material = this._field('materialAsset').value;

            const anchor = this._field('anchor').value;
            const horizontalSplit = Math.abs(anchor[0] - anchor[2]) > 0.001;
            const verticalSplit = Math.abs(anchor[1] - anchor[3]) > 0.001;

            [
                'autoWidth',
                'autoHeight',
                'alignment',
                'enableMarkup',
                'autoFitWidth',
                'autoFitHeight',
                'lineHeight',
                'wrapLines',
                'spacing',
                'outlineColor',
                'outlineThickness',
                'shadowColor',
                'shadowOffset'
            ].forEach(field => {
                this._field(field).parent.hidden = !isText;
            });

            this._field('fontAsset').hidden = !isText;
            this._field('maxLines').parent.hidden = !isText || !this._field('wrapLines').value;
            this._field('localized').parent.hidden = !isText;
            this._field('text').parent.hidden = !isText || this._field('localized').value || this._field('localized').class.contains(pcui.CLASS_MULTIPLE_VALUES);
            this._field('key').parent.hidden = !isText || !this._field('localized').value || this._field('localized').class.contains(pcui.CLASS_MULTIPLE_VALUES);
            this._field('spriteAsset').hidden = !isImage || texture || material;
            this._field('spriteFrame').parent.hidden = this._field('spriteAsset').hidden || !sprite;
            this._field('pixelsPerUnit').parent.hidden = this._field('spriteFrame').parent.hidden;
            this._field('textureAsset').hidden = !isImage || sprite || material;
            this._field('materialAsset').hidden = !isImage || texture || sprite;
            this._field('color').parent.hidden = !isImage && !isText || material;
            this._field('opacity').parent.hidden = this._field('color').parent.hidden;
            this._field('rect').parent.hidden = !isImage || sprite;
            this._field('mask').parent.hidden = !isImage;

            this._field('width').disabled = horizontalSplit || (this._field('autoWidth').value && isText);
            this._field('height').disabled = verticalSplit || (this._field('autoHeight').value && isText);
            this._field('autoWidth').disabled = horizontalSplit;
            this._field('autoHeight').disabled = verticalSplit;
            this._field('autoFitWidth').disabled = this._field('autoWidth').value;
            this._field('autoFitHeight').disabled = this._field('autoHeight').value;
            this._field('maxFontSize').parent.hidden = !isText || ((this._field('autoFitWidth').disabled || !this._field('autoFitWidth').value) && (this._field('autoFitHeight').disabled || !this._field('autoFitHeight').value));
            this._field('minFontSize').parent.hidden = this._field('maxFontSize').parent.hidden;
            this._field('fontSize').parent.hidden = !isText || !this._field('maxFontSize').parent.hidden;

            const margins = this._field('margin').inputs;
            margins[0].disabled = !horizontalSplit;
            margins[2].disabled = margins[0].disabled;

            margins[1].disabled = !verticalSplit;
            margins[3].disabled = margins[1].disabled;
        }

        _onFieldPresetChange(value) {
            if (!value || value === 'custom' || this._suppressPresetEvents) return;

            if (!this._entities) return;

            // copy current entities for undo / redo
            const entities = this._entities.slice();

            this._suppressPresetEvents = true;

            const fields = value.split('/');
            const anchor = fields[0].split(',').map(v => parseFloat(v));
            const pivot = fields[1].split(',').map(v => parseFloat(v));

            const prev = {};

            for (let i = 0; i < entities.length; i++) {
                prev[entities[i].get('resource_id')] = {
                    anchor: entities[i].get('components.element.anchor'),
                    pivot: entities[i].get('components.element.pivot'),
                    width: entities[i].get('components.element.width'),
                    height: entities[i].get('components.element.height')
                };
            }

            function undo() {
                for (let i = 0; i < entities.length; i++) {
                    const entity = entities[i].latest();
                    if (!entity || !entity.has('components.element')) continue;

                    const history = entity.history.enabled;
                    entity.history.enabled = false;
                    const prevRecord = prev[entity.get('resource_id')];
                    entity.set('components.element.anchor', prevRecord.anchor);
                    entity.set('components.element.pivot', prevRecord.pivot);
                    if (entity.entity && entity.entity.element) {
                        entity.entity.element.width = prevRecord.width;
                        entity.entity.element.height = prevRecord.height;
                    }
                    entity.history.enabled = history;
                }
            }

            function redo() {
                for (var i = 0; i < entities.length; i++) {
                    const entity = entities[i].latest();
                    if (!entity || !entity.has('components.element')) continue;

                    const history = entity.history.enabled;
                    entity.history.enabled = false;
                    entity.set('components.element.anchor', anchor);
                    entity.set('components.element.pivot', pivot);

                    const prevRecord = prev[entity.get('resource_id')];

                    if (entity.entity && entity.entity.element) {
                        entity.entity.element.width = prevRecord.width;
                        entity.entity.element.height = prevRecord.height;
                    }

                    entity.history.enabled = history;
                }
            }

            redo();

            if (this._history) {
                this._history.add({
                    name: 'entities.components.element.preset',
                    undo: undo,
                    redo: redo
                });
            }

            this._suppressPresetEvents = false;
        }

        _onFieldKeyChange(value) {
            this._suppressLocalizedEvents = true;
            if (this._field('key').class.contains(pcui.CLASS_MULTIPLE_VALUES)) {
                // set multiple values state
                this._field('localized').values = [true, false];
            } else if (value) {
                this._field('localized').value = true;
            } else {
                this._field('localized').value = false;
            }

            this._suppressLocalizedEvents = false;
        }

        _onFieldLocalizedChange(value) {
            if (this._suppressLocalizedEvents) return;

            // if value is not boolean then ignore as it might mean
            // it's just showing multiple different values
            if (value !== true && value !== false) return;

            if (!this._entities) return;

            // copy current entities for undo / redo functions
            const entities = this._entities.slice();

            let prev;
            const path = value ? 'components.element.key' : 'components.element.text';
            const otherPath = value ? 'components.element.text' : 'components.element.key';

            function undo() {
                for (let i = 0; i < prev.length; i += 2) {
                    const e = prev[i].latest();
                    if (!e || !e.has('components.element')) continue;

                    const history = e.history.enabled;
                    e.history.enabled = false;
                    e.set(path, null);
                    e.set(otherPath, prev[i + 1]);
                    e.history.enabled = history;
                }
            }

            function redo() {
                prev = [];
                for (let i = 0, len = entities.length; i < len; i++) {
                    const e = entities[i].latest();
                    if (!e || !e.has('components.element')) continue;

                    // we need to switch between the 'key'
                    // and 'text' fields depending on whether we picked
                    // for this element to be localized or not.
                    // But don't do anything if this element is already localized
                    // (or not depending on which we picked).
                    const val = e.get(otherPath);
                    if (val === null) continue;

                    prev.push(e);
                    prev.push(val);

                    var history = e.history.enabled;
                    e.history.enabled = false;
                    e.set(otherPath, null);
                    e.set(path, val);
                    e.history.enabled = history;
                }
            }

            redo();

            if (this._history) {
                this._history.add({
                    name: 'entities.components.element.localized',
                    undo: undo,
                    redo: redo
                });
            }
        }

        _onFieldAnchorChange(value) {
            if (!this._suppressPresetEvents) {
                this._suppressPresetEvents = true;
                this._updatePreset();
                this._suppressPresetEvents = false;
            }
            this._toggleFields();
        }

        _onFieldPivotChange(value) {
            if (!this._suppressPresetEvents) {
                this._suppressPresetEvents = true;
                this._updatePreset();
                this._suppressPresetEvents = false;
            }
            this._toggleFields();
        }

        _onFieldFontAssetChange(value) {
            if (value) {
                editor.call('settings:projectUser').set('editor.lastSelectedFontId', value);
            }
        }

        _updatePreset() {
            const anchor = this._field('anchor').value;
            if (!anchor) {
                this._field('preset').value = 'custom';
            } else {
                const pivot = this._field('pivot').value || [];
                const preset = `${anchor.join(',')}/${pivot.join(',')}`;
                this._field('preset').value = (PRESETS[preset] ? preset : 'custom');
            }
        }

        link(entities) {
            super.link(entities);

            this._suppressToggleFields = true;
            this._attributesInspector.link(entities);
            this._suppressToggleFields = false;

            this._toggleFields();
        }

        unlink() {
            super.unlink();
            this._attributesInspector.unlink();
        }
    }

    return {
        ElementComponentInspector: ElementComponentInspector
    };
})());


/* editor/inspector/components/model.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [{
        label: 'Type',
        path: 'components.model.type',
        type: 'select',
        args: {
            type: 'string',
            options: [{
                v: 'asset', t: 'Asset'
            }, {
                v: 'box', t: 'Box'
            }, {
                v: 'capsule', t: 'Capsule'
            }, {
                v: 'sphere', t: 'Sphere'
            }, {
                v: 'cylinder', t: 'Cylinder'
            }, {
                v: 'cone', t: 'Cone'
            }, {
                v: 'plane', t: 'Plane'
            }]
        }
    }, {
        label: 'Model',
        path: 'components.model.asset',
        type: 'asset',
        args: {
            assetType: 'model'
        }
    }, {
        label: 'Material',
        path: 'components.model.materialAsset',
        type: 'asset',
        args: {
            assetType: 'material'
        }
    }, {
        label: 'Cast Shadows',
        path: 'components.model.castShadows',
        type: 'boolean'
    }, {
        label: 'Cast Lightmap Shadows',
        path: 'components.model.castShadowsLightmap',
        type: 'boolean'
    }, {
        label: 'Receive Shadows',
        path: 'components.model.receiveShadows',
        type: 'boolean'
    }, {
        label: 'Static',
        path: 'components.model.isStatic',
        type: 'boolean'
    }, {
        label: 'Lightmapped',
        path: 'components.model.lightmapped',
        type: 'boolean'
    }, {
        label: 'Lightmap Size',
        type: 'label',
        alias: 'components.model.lightmapSize'
    }, {
        label: 'Lightmap Size Multiplier',
        path: 'components.model.lightmapSizeMultiplier',
        type: 'number',
        args: {
            min: 0
        }
    }, {
        label: 'Batch Group',
        path: 'components.model.batchGroupId',
        type: 'batchgroup'
    }, {
        label: 'Layers',
        path: 'components.model.layers',
        type: 'layers',
        args: {
            excludeLayers: [
                LAYERID_DEPTH,
                LAYERID_SKYBOX,
                LAYERID_IMMEDIATE
            ]
        }
    }];

    ATTRIBUTES.forEach(attr => {
        if (!attr.path) return;
        const parts = attr.path.split('.');
        attr.reference = `model:${parts[parts.length - 1]}`;
    });

    const CLASS_NOT_EVERYWHERE = 'model-component-inspector-mapping-not-everywhere';

    const REGEX_MAPPING = /^components.model.mapping.(\d+)$/;

    class ModelComponentInspector extends pcui.ComponentInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.component = 'model';

            super(args);

            this._assets = args.assets;

            this._attributesInspector = new pcui.AttributesInspector({
                assets: args.assets,
                projectSettings: args.projectSettings,
                history: args.history,
                attributes: ATTRIBUTES,
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);

            this._labelUv1Missing = new pcui.Label({
                text: 'UV1 is missing',
                class: pcui.CLASS_ERROR
            });
            this._labelUv1Missing.style.marginLeft = 'auto';
            this._field('lightmapped').parent.append(this._labelUv1Missing);

            this._containerButtons = new pcui.Container({
                flex: true,
                flexDirection: 'row'
            });

            const btnAssetMaterials = new pcui.Button({
                text: 'ASSET MATERIALS',
                icon: 'E184',
                flexGrow: 1
            });

            btnAssetMaterials.on('click', this._onClickAssetMaterials.bind(this));

            this._containerButtons.append(btnAssetMaterials);

            const btnEntityMaterials = new pcui.Button({
                text: 'ENTITY MATERIALS',
                icon: 'E184',
                flexGrow: 1
            });

            btnEntityMaterials.on('click', this._onClickEntityMaterials.bind(this));

            this._containerButtons.append(btnEntityMaterials);

            this.append(this._containerButtons);

            this._containerMappings = new pcui.Container({
                flex: true
            });
            this.append(this._containerMappings);

            this._mappingInspectors = {};

            this._suppressToggleFields = false;

            this._suppressAssetChange = false;

            ['type', 'asset', 'lightmapped', 'lightmapSizeMultiplier'].forEach(field => {
                this._field(field).on('change', this._toggleFields.bind(this));
            });

            this._field('asset').on('change', this._onAssetChange.bind(this));

            this._field('asset').binding = new pcui.BindingTwoWay({
                history: this._history,
                bindingElementToObservers: new AssetElementToObserversBinding(this._assets, {
                    history: this._history
                })
            });
        }

        _field(name) {
            return this._attributesInspector.getField(`components.model.${name}`);
        }

        _onClickAssetMaterials() {
            if (!this._entities) return;

            // select model asset
            const modelAsset = this._assets.get(this._entities[0].get('components.model.asset'));
            if (modelAsset) {
                editor.call('selector:set', 'asset', [modelAsset]);
            }
        }

        _onClickEntityMaterials() {
            if (!this._entities) return;

            // open entity materials picker
            editor.call('picker:node', this._entities);
        }

        _groupMappingsByKey() {
            const result = {};
            this._entities.forEach(e => {
                const mapping = e.get('components.model.mapping');
                if (!mapping) return;

                for (const key in mapping) {
                    if (!result[key]) {
                        result[key] = [];
                    }

                    result[key].push(e);
                }
            });

            return result;
        }

        _getMeshInstanceName(index, entities) {
            // get name of meshinstance from engine
            let meshInstanceName;
            for (let i = 0; i < entities.length; i++) {
                if (entities[i].entity && entities[i].entity.model && entities[i].entity.model.meshInstances) {
                    const mi = entities[i].entity.model.meshInstances[index];
                    if (mi) {
                        if (!meshInstanceName) {
                            meshInstanceName = mi.node.name;
                            break;
                        }
                    }
                }
            }

            if (!meshInstanceName) {
                meshInstanceName = 'Node ' + index;
            }

            return meshInstanceName;
        }

        _createMappingInspector(key, entities) {
            const index = parseInt(key, 10);

            if (this._mappingInspectors[key]) {
                this._mappingInspectors[key].destroy();
            }

            const container = new pcui.Container({
                flex: true,
                flexDirection: 'row'
            });

            let previousMappings;

            const fieldMaterial = new pcui.AssetInput({
                assetType: 'material',
                assets: this._assets,
                text: this._getMeshInstanceName(index, entities),
                flexGrow: 1,
                renderChanges: true,
                binding: new pcui.BindingTwoWay({
                    history: this._history
                }),
                allowDragDrop: true,
                // update viewport materials on drag enter
                dragEnterFn: (dropType, dropData) => {
                    previousMappings = entities.map(e => {
                        return e.get('components.model.mapping.' + key);
                    });

                    entities.forEach(e => {
                        if (!e.entity || !e.entity.model) return;

                        const mapping = e.entity.model.mapping;
                        if (!mapping || !mapping.hasOwnProperty(key)) return;

                        mapping[key] = dropData.id;
                        e.entity.model.mapping = mapping;

                        editor.call('viewport:render');
                    });
                },
                // restore viewport materials on drag leave
                dragLeaveFn: () => {
                    entities.forEach((e, i) => {
                        if (!e.entity || !e.entity.model) return;

                        const mapping = e.entity.model.mapping;
                        if (!mapping || !mapping.hasOwnProperty(key)) return;

                        mapping[key] = previousMappings[i];
                        e.entity.model.mapping = mapping;

                        editor.call('viewport:render');
                    });
                }
            });

            if (entities.length !== this._entities.length) {
                fieldMaterial.class.add(CLASS_NOT_EVERYWHERE);
            }

            container.append(fieldMaterial);

            fieldMaterial.link(entities, `components.model.mapping.${key}`);

            const btnRemove = new pcui.Button({
                icon: 'E289',
                size: 'small',
                flexShrink: 0
            });
            btnRemove.style.alignSelf = 'flex-end';
            btnRemove.style.marginBottom = '9px';
            btnRemove.style.marginLeft = '0px';
            container.append(btnRemove);

            btnRemove.on('click', () => {
                fieldMaterial.binding.setValue(undefined);
            });

            const nextSibling = this._containerMappings.dom.childNodes[index];

            this._containerMappings.appendBefore(container, nextSibling);

            this._mappingInspectors[key] = container;

            this._timeoutRefreshMappings = null;
            this._dirtyMappings = {};

            return container;
        }

        _refreshMappings(dirtyMappings) {
            if (this._timeoutRefreshMappings) {
                cancelAnimationFrame(this._timeoutRefreshMappings);
            }

            this._timeoutRefreshMappings = requestAnimationFrame(() => {
                this._timeoutRefreshMappings = null;

                const mappings = this._groupMappingsByKey();
                dirtyMappings = dirtyMappings || mappings;

                for (const key in this._mappingInspectors) {
                    if (!mappings[key]) {
                        // destroy mappings that do not exist anymore
                        if (this._mappingInspectors[key]) {
                            this._mappingInspectors[key].destroy();
                            delete this._mappingInspectors[key];
                        }
                    }
                }

                for (const key in dirtyMappings) {
                    if (mappings[key]) {
                        // recreate dirty mappings
                        this._createMappingInspector(key, mappings[key]);
                    }
                }
            });
        }

        _getLightmapSize() {
            const app = editor.call('viewport:app');
            let value = '?';
            if (app && this._entities) {
                const lightmapper = app.lightmapper;

                let min = Infinity;
                let max = -Infinity;
                this._entities.forEach(e => {
                    if (!e.get('components.model.lightmapped') ||
                        !e.entity || !e.entity.model ||
                        !e.entity.model.asset && e.entity.model.type === 'asset' ||
                        e.entity.model.asset && !app.assets.get(e.entity.model.asset)) {

                        return;
                    }

                    const size = lightmapper.calculateLightmapSize(e.entity);
                    if (size > max) max = size;
                    if (size < min) min = size;
                });

                if (min) {
                    value = (min !== max ? `${min} - ${max}` : min);
                }
            }

            return value;
        }

        _isUv1Missing() {
            let missing = false;

            for (let i = 0; this._entities && i < this._entities.length && !missing; i++) {
                const e = this._entities[i];
                if (!e.has('components.model') ||
                    e.get('components.model.type') !== 'asset' ||
                    !e.get('components.model.asset')) {
                    continue;
                }

                const asset = this._assets.get(e.get('components.model.asset'));
                if (!asset) continue;

                if (!asset.has('meta.attributes.texCoord1')) {
                    missing = true;
                }
            }

            return missing;
        }

        _onAssetChange() {
            if (this._suppressAssetChange) return;

            this._refreshMappings();
        }

        _toggleFields() {
            if (this._suppressToggleFields) return;

            const fieldLightmapSize = this._field('lightmapSize');
            fieldLightmapSize.parent.hidden = !this._field('lightmapped').value;
            if (!fieldLightmapSize.parent.hidden) {
                fieldLightmapSize.value = this._getLightmapSize();
                this._labelUv1Missing.hidden = !this._isUv1Missing();
            } else {
                this._labelUv1Missing.hidden = true;
            }
            this._field('lightmapSizeMultiplier').parent.hidden = fieldLightmapSize.parent.hidden;

            this._containerButtons.hidden = this._field('type').value !== 'asset' || !this._field('asset').value;
            this._containerMappings.hidden = this._containerButtons.hidden;

            this._field('asset').hidden = this._field('type').value !== 'asset';
            this._field('materialAsset').hidden = this._field('type').value === 'asset' || this._field('type').value === null;
        }

        link(entities) {
            super.link(entities);

            this._suppressToggleFields = true;
            this._suppressAssetChange = true;

            this._attributesInspector.link(entities);

            const mappings = this._groupMappingsByKey();
            for (const key in mappings) {
                this._createMappingInspector(key, mappings[key]);
            }

            entities.forEach(e => {
                this._entityEvents.push(e.on('*:set', (path) => {
                    const match = path.match(REGEX_MAPPING);
                    if (!match) return;

                    this._dirtyMappings[match[1]] = true;

                    this._refreshMappings(this._dirtyMappings);
                }));

                this._entityEvents.push(e.on('*:unset', (path) => {
                    const match = path.match(REGEX_MAPPING);
                    if (!match) return;

                    this._dirtyMappings[match[1]] = true;

                    this._refreshMappings(this._dirtyMappings);
                }));

                this._entityEvents.push(e.on('components.model.mapping:set', () => {
                    this._refreshMappings();
                }));

                this._entityEvents.push(e.on('components.model.mapping:unset', () => {
                    this._refreshMappings();
                }));
            });

            this._suppressAssetChange = false;
            this._suppressToggleFields = false;

            this._toggleFields();
        }

        unlink() {
            super.unlink();
            this._attributesInspector.unlink();
            this._containerMappings.clear();
            this._mappingInspectors = {};

            if (this._timeoutRefreshMappings) {
                cancelAnimationFrame(this._timeoutRefreshMappings);
                this._timeoutRefreshMappings = null;
            }
            this._dirtyMappings = {};
        }
    }

    // Custom binding for asset field so that when we change the asset we
    // reset the model's mapping
    class AssetElementToObserversBinding extends pcui.BindingElementToObservers {
        constructor(assets, args) {
            super(args);
            this._assets = assets;
        }

        clone() {
            return new AssetElementToObserversBinding(this._assets, {
                history: this._history,
                historyPrefix: this._historyPrefix,
                historyPostfix: this._historyPostfix,
                historyName: this._historyName,
                historyCombine: this._historyCombine
            });
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

            let previous = {};

            const undo = () => {
                for (let i = 0; i < observers.length; i++) {
                    const latest = observers[i].latest();
                    if (!latest || !latest.has('components.model')) continue;

                    let history = false;
                    if (latest.history) {
                        history = latest.history.enabled;
                        latest.history.enabled = false;
                    }

                    const path = this._pathAt(paths, i);

                    const prevEntry = previous[latest.get('resource_id')];

                    latest.set(path, prevEntry.value);

                    if (prevEntry.hasOwnProperty('mapping')) {
                        latest.set('components.model.mapping', prevEntry.mapping);
                    }

                    if (history) {
                        latest.history.enabled = true;
                    }
                }
            };

            const redo = () => {
                previous = {};

                for (let i = 0; i < observers.length; i++) {
                    const latest = observers[i].latest();
                    if (!latest || !latest.has('components.model')) continue;

                    let history = false;
                    if (latest.history) {
                        history = latest.history.enabled;
                        latest.history.enabled = false;
                    }

                    const path = this._pathAt(paths, i);
                    const oldValue = latest.get(path);

                    const entry = {
                        value: oldValue
                    };

                    latest.set(path, value);

                    if (value !== oldValue && latest.get('components.model.mapping')) {
                        const mapping = latest.get('components.model.mapping');
                        if (mapping) {
                            entry.mapping = mapping;
                            latest.unset('components.model.mapping');
                        }
                    }

                    previous[latest.get('resource_id')] = entry;

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

    return {
        ModelComponentInspector: ModelComponentInspector
    };
})());


/* editor/inspector/components/layoutchild.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [{
        label: 'Min Width',
        path: 'components.layoutchild.minWidth',
        type: 'number'
    }, {
        label: 'Max Width',
        path: 'components.layoutchild.maxWidth',
        type: 'number'
    }, {
        label: 'Min Height',
        path: 'components.layoutchild.minHeight',
        type: 'number'
    }, {
        label: 'Max Height',
        path: 'components.layoutchild.maxHeight',
        type: 'number'
    }, {
        label: 'Fit Width Proportion',
        path: 'components.layoutchild.fitWidthProportion',
        type: 'number'
    }, {
        label: 'Fit Height Proportion',
        path: 'components.layoutchild.fitHeightProportion',
        type: 'number'
    }, {
        label: 'Exclude from Layout',
        path: 'components.layoutchild.excludeFromLayout',
        type: 'boolean'
    }];

    ATTRIBUTES.forEach(attr => {
        const parts = attr.path.split('.');
        attr.reference = `layoutchild:${parts[parts.length - 1]}`;
    });

    class LayoutchildComponentInspector extends pcui.ComponentInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.component = 'layoutchild';

            super(args);

            this._attributesInspector = new pcui.AttributesInspector({
                history: args.history,
                attributes: ATTRIBUTES,
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);
        }

        link(entities) {
            super.link(entities);
            this._attributesInspector.link(entities);
        }

        unlink() {
            super.unlink();
            this._attributesInspector.unlink();
        }
    }

    return {
        LayoutchildComponentInspector: LayoutchildComponentInspector
    };
})());


/* editor/inspector/components/layoutgroup.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [{
        label: 'Orientation',
        path: 'components.layoutgroup.orientation',
        type: 'select',
        args: {
            type: 'number',
            options: [{
                v: ORIENTATION_HORIZONTAL, t: 'Horizontal'
            }, {
                v: ORIENTATION_VERTICAL, t: 'Vertical'
            }]
        }
    }, {
        label: 'Reverse X',
        path: 'components.layoutgroup.reverseX',
        type: 'boolean'
    }, {
        label: 'Reverse Y',
        path: 'components.layoutgroup.reverseY',
        type: 'boolean'
    }, {
        label: 'Alignment',
        path: 'components.layoutgroup.alignment',
        type: 'vec2',
        args: {
            placeholder: ['↔', '↕'],
            precision: 2,
            step: 0.1,
            min: 0,
            max: 1
        }
    }, {
        label: 'Padding',
        path: 'components.layoutgroup.padding',
        type: 'vec4',
        args: {
            placeholder: ['←', '↓', '→', '↑']
        }
    }, {
        label: 'Spacing',
        path: 'components.layoutgroup.spacing',
        type: 'vec2',
        args: {
            placeholder: ['↔', '↕']
        }
    }, {
        label: 'Width Fitting',
        path: 'components.layoutgroup.widthFitting',
        type: 'select',
        args: {
            type: 'number',
            options: [{
                v: FITTING_NONE, t: 'None'
            }, {
                v: FITTING_STRETCH, t: 'Stretch'
            }, {
                v: FITTING_SHRINK, t: 'Shrink'
            }, {
                v: FITTING_BOTH, t: 'Both'
            }]
        }
    }, {
        label: 'Height Fitting',
        path: 'components.layoutgroup.heightFitting',
        type: 'select',
        args: {
            type: 'number',
            options: [{
                v: FITTING_NONE, t: 'None'
            }, {
                v: FITTING_STRETCH, t: 'Stretch'
            }, {
                v: FITTING_SHRINK, t: 'Shrink'
            }, {
                v: FITTING_BOTH, t: 'Both'
            }]
        }
    }, {
        label: 'Wrap',
        path: 'components.layoutgroup.wrap',
        type: 'boolean'
    }];

    ATTRIBUTES.forEach(attr => {
        const parts = attr.path.split('.');
        attr.reference = `layoutgroup:${parts[parts.length - 1]}`;
    });

    class LayoutgroupComponentInspector extends pcui.ComponentInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.component = 'layoutgroup';

            super(args);

            this._attributesInspector = new pcui.AttributesInspector({
                history: args.history,
                attributes: ATTRIBUTES,
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);
        }

        link(entities) {
            super.link(entities);
            this._attributesInspector.link(entities);
        }

        unlink() {
            super.unlink();
            this._attributesInspector.unlink();
        }
    }

    return {
        LayoutgroupComponentInspector: LayoutgroupComponentInspector
    };
})());


/* editor/inspector/components/light.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [{
        label: 'Type',
        path: 'components.light.type',
        type: 'select',
        args: {
            type: 'string',
            options: [{
                v: 'directional', t: 'Directional'
            }, {
                v: 'spot', t: 'Spot'
            }, {
                v: 'point', t: 'Point'
            }]
        }
    }, {
        label: 'Color',
        path: 'components.light.color',
        type: 'rgb'
    }, {
        label: 'Intensity',
        path: 'components.light.intensity',
        type: 'slider',
        args: {
            precision: 2,
            min: 0,
            max: 32,
            step: 0.1
        }
    }, {
        label: 'Range',
        path: 'components.light.range',
        type: 'number',
        args: {
            precision: 2,
            step: 0.1,
            min: 0
        }
    }, {
        label: 'Falloff Mode',
        path: 'components.light.falloffMode',
        type: 'select',
        args: {
            type: 'number',
            options: [{
                v: 0, t: 'Linear'
            }, {
                v: 1, t: 'Inverse Squared'
            }]
        }
    }, {
        label: 'Cone Angles',
        path: 'components.light.innerConeAngle',
        type: 'number',
        args: {
            precision: 2,
            step: 1,
            min: 0,
            max: 90
        }
    }, {
        label: 'Outer Cone Angle',
        path: 'components.light.outerConeAngle',
        type: 'number',
        args: {
            precision: 2,
            step: 1,
            min: 0,
            max: 90
        }
    }, {
        type: 'divider'
    }, {
        label: 'Static',
        path: 'components.light.isStatic',
        type: 'boolean'
    }, {
        label: 'Bake Lightmap',
        path: 'components.light.bake',
        type: 'boolean'
    }, {
        label: 'Lightmap Direction',
        path: 'components.light.bakeDir',
        type: 'boolean'
    }, {
        label: 'Affect Dynamic',
        path: 'components.light.affectDynamic',
        type: 'boolean'
    }, {
        label: 'Affect Lightmapped',
        path: 'components.light.affectLightmapped',
        type: 'boolean'
    }, {
        type: 'divider'
    }, {
        label: 'Cast Shadows',
        path: 'components.light.castShadows',
        type: 'boolean'
    }, {
        label: 'Shadow Update Mode',
        path: 'components.light.shadowUpdateMode',
        type: 'select',
        args: {
            type: 'number',
            options: [{
                v: pc.SHADOWUPDATE_THISFRAME, t: 'Once'
            }, {
                v: pc.SHADOWUPDATE_REALTIME, t: 'Realtime'
            }]
        }
    }, {
        label: 'Resolution',
        path: 'components.light.shadowResolution',
        type: 'select',
        args: {
            type: 'number',
            options: [{
                v: 16, t: '16 x 16'
            }, {
                v: 32, t: '32 x 32'
            }, {
                v: 64, t: '64 x 64'
            }, {
                v: 128, t: '128 x 128'
            }, {
                v: 256, t: '256 x 256'
            }, {
                v: 512, t: '512 x 512'
            },  {
                v: 1024, t: '1024 x 1024'
            }, {
                v: 2048, t: '2048 x 2048'
            }, {
                v: 4096, t: '4096 x 4096'
            }]
        }
    }, {
        label: 'Distance',
        path: 'components.light.shadowDistance',
        type: 'number',
        args: {
            precision: 2,
            step: 1,
            min: 0
        }
    }, {
        label: 'Shadow Type',
        path: 'components.light.shadowType',
        type: 'select',
        args: {
            type: 'number',
            options: [{
                v: 0, t: 'Shadow Map PCF 3x3'
            }, {
                v: 4, t: 'Shadow Map PCF 5x5'
            }, {
                v: 1, t: 'Variance Shadow Map (8bit)'
            }, {
                v: 2, t: 'Variance Shadow Map (16bit)'
            }, {
                v: 3, t: 'Variance Shadow Map (32bit)'
            }]
        }
    }, {
        label: 'VSM Blur Mode',
        path: 'components.light.vsmBlurMode',
        type: 'select',
        args: {
            type: 'number',
            options: [{
                v: 0, t: 'Box'
            }, {
                v: 1, t: 'Gaussian'
            }]
        }
    }, {
        label: 'VSM Blur Size',
        path: 'components.light.vsmBlurSize',
        type: 'slider',
        args: {
            min: 1,
            max: 25,
            precision: 0,
            step: 1
        }
    }, {
        label: 'VSM Bias',
        path: 'components.light.vsmBias',
        type: 'number',
        args: {
            min: 0,
            max: 1,
            precision: 4,
            step: 0.001
        }
    }, {
        label: 'Shadow Bias',
        path: 'components.light.shadowBias',
        type: 'number',
        args: {
            min: 0,
            max: 1,
            precision: 4,
            step: 0.001
        }
    }, {
        label: 'Normal Offset Bias',
        path: 'components.light.normalOffsetBias',
        type: 'number',
        args: {
            min: 0,
            max: 1,
            precision: 3,
            step: 0.001
        }
    }, {
        type: 'divider',
        alias: 'components.light.cookieDivider'
    }, {
        label: 'Cookie',
        path: 'components.light.cookieAsset',
        type: 'asset'
    }, {
        label: 'Cookie Intensity',
        path: 'components.light.cookieIntensity',
        type: 'slider',
        args: {
            min: 0,
            max: 1,
            precision: 3
        }
    }, {
        label: 'Cookie Angle',
        path: 'components.light.cookieAngle',
        type: 'slider',
        args: {
            min: 0,
            max: 360,
            placeholder: '°',
            precision: 1
        }
    }, {
        label: 'Cookie Offset',
        path: 'components.light.cookieOffset',
        type: 'vec2',
        args: {
            precision: 3,
            step: 0.01,
            placeholder: ['U', 'V']
        }
    }, {
        label: 'Cookie Scale',
        path: 'components.light.cookieScale',
        type: 'vec2',
        args: {
            precision: 3,
            step: 0.01,
            placeholder: ['U', 'V']
        }
    }, {
        label: 'Cookie Falloff',
        path: 'components.light.cookieFalloff',
        type: 'boolean'
    }, {
        label: 'Cookie Channel',
        path: 'components.light.cookieChannel',
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
        }
    }, {
        type: 'divider'
    }, {
        label: 'Layers',
        path: 'components.light.layers',
        type: 'layers',
        args: {
            excludeLayers: [
                LAYERID_DEPTH,
                LAYERID_SKYBOX,
                LAYERID_IMMEDIATE
            ]
        }
    }];

    ATTRIBUTES.forEach(attr => {
        if (!attr.path) return;
        const parts = attr.path.split('.');
        attr.reference = `light:${parts[parts.length - 1]}`;
    });

    class LightComponentInspector extends pcui.ComponentInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.component = 'light';

            super(args);

            this._attributesInspector = new pcui.AttributesInspector({
                assets: args.assets,
                projectSettings: args.projectSettings,
                history: args.history,
                attributes: ATTRIBUTES,
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);

            [
                'type',
                'cookieAsset',
                'bake',
                'castShadows',
                'shadowType',
                'shadowUpdateMode',
                'affectDynamic'
            ].forEach(field => {
                this._field(field).on('change', this._toggleFields.bind(this));
            });

            // add update shadow button
            this._btnUpdateShadow = new pcui.Button({
                size: 'small',
                icon: 'E128'
            });
            this._field('shadowUpdateMode').parent.append(this._btnUpdateShadow);

            this._eventUpdateShadow = null;

            const tooltip = Tooltip.attach({
                target: this._btnUpdateShadow.dom,
                text: 'Update Shadows',
                align: 'bottom',
                root: editor.call('layout.root')
            });
            this._btnUpdateShadow.once('destroy', () => {
                tooltip.destroy();
            });

            this._skipToggleFields = false;
        }

        _field(name) {
            return this._attributesInspector.getField(`components.light.${name}`);
        }

        _toggleFields() {
            if (this._skipToggleFields) return;

            const type = this._field('type').value;
            const isDirectional = type === 'directional';
            const isSpot = type === 'spot';
            const isPoint = type === 'point';
            const castShadows = this._field('castShadows').value;
            const shadowType = this._field('shadowType').value;
            const cookie = this._field('cookieAsset').value;

            ['range', 'falloffMode'].forEach(field => {
                this._field(field).parent.hidden = isDirectional;
            });

            ['innerConeAngle', 'outerConeAngle'].forEach(field => {
                this._field(field).parent.hidden = !isSpot;
            });

            ['bakeDir', 'affectLightmapped'].forEach(field => {
                this._field(field).parent.disabled = !this._field('bake').value;
            });

            [
                'cookieIntensity',
                'cookieChannel'
            ].forEach(field => {
                this._field(field).parent.hidden = isDirectional || !cookie;
            });

            [
                'cookieAngle',
                'cookieOffset',
                'cookieScale'
            ].forEach(field => {
                this._field(field).parent.hidden = isDirectional || isPoint || !cookie;
            });

            this._field('cookieAsset').hidden = isDirectional;
            this._field('cookieDivider').hidden = this._field('cookieAsset').hidden;
            this._field('cookieAsset').assetType = (isPoint ? 'cubemap' : 'texture');

            this._field('cookieFalloff').parent.hidden = !isSpot || !cookie;

            [
                'shadowResolution',
                'shadowDistance',
                'shadowType'
            ].forEach(field => {
                this._field(field).parent.hidden = !castShadows;
            });

            this._field('shadowUpdateMode').parent.hidden = !castShadows || this._field('bake').value && !this._field('affectDynamic').value;

            [
                'vsmBlurMode',
                'vsmBlurSize',
                'vsmBias'
            ].forEach(field => {
                this._field(field).parent.hidden = !castShadows || shadowType === 0 || shadowType === 4;
            });

            [
                'shadowBias',
                'normalOffsetBias'
            ].forEach(field => {
                this._field(field).parent.hidden = !castShadows || shadowType !== 0 && shadowType !== 4;
            });

            this._btnUpdateShadow.hidden = this._field('shadowUpdateMode').value !== pc.SHADOWUPDATE_THISFRAME;
        }

        _updateShadows(entities) {
            for (let i = 0; i < entities.length; i++) {
                if (entities[i].entity && entities[i].entity.light && entities[i].entity.light.shadowUpdateMode === pc.SHADOWUPDATE_THISFRAME)
                    entities[i].entity.light.light.shadowUpdateMode = pc.SHADOWUPDATE_THISFRAME;
            }
            editor.call('viewport:render');
        }

        link(entities) {
            super.link(entities);

            this._skipToggleFields = true;
            this._attributesInspector.link(entities);

            this._eventUpdateShadow = this._btnUpdateShadow.on('click', () => {
                this._updateShadows(entities);
            });

            this._skipToggleFields = false;

            this._toggleFields();
        }

        unlink() {
            super.unlink();
            this._attributesInspector.unlink();
            if (this._eventUpdateShadow) {
                this._eventUpdateShadow.unbind();
                this._eventUpdateShadow = null;
            }
        }
    }

    return {
        LightComponentInspector: LightComponentInspector
    };
})());


/* editor/inspector/components/particlesystem.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [{
        label: 'Auto Play',
        path: 'components.particlesystem.autoPlay',
        type: 'boolean'
    }, {
        label: 'Particle Count',
        path: 'components.particlesystem.numParticles',
        type: 'number'
    }, {
        label: 'Lifetime',
        path: 'components.particlesystem.lifetime',
        type: 'number',
        args: {
            placeholder: 'Seconds'
        }
    }, {
        label: 'Emission Rate',
        alias: 'components.particlesystem.emissionRate',
        type: 'vec2',
        args: {
            placeholder: ['From', 'To']
        },
        reference: 'particlesystem:rate'
    }, {
        label: 'Start Angle',
        alias: 'components.particlesystem.startAngle',
        type: 'vec2',
        args: {
            placeholder: ['From', 'To']
        }
    }, {
        label: 'Loop',
        path: 'components.particlesystem.loop',
        type: 'boolean'
    }, {
        label: 'Pre Warm',
        path: 'components.particlesystem.preWarm',
        type: 'boolean'
    }, {
        label: 'Lighting',
        path: 'components.particlesystem.lighting',
        type: 'boolean'
    }, {
        label: 'Half Lambert',
        path: 'components.particlesystem.halfLambert',
        type: 'boolean'
    }, {
        label: 'Intensity',
        path: 'components.particlesystem.intensity',
        type: 'number'
    }, {
        label: 'Depth Write',
        path: 'components.particlesystem.depthWrite',
        type: 'boolean'
    }, {
        label: 'Depth Softening',
        path: 'components.particlesystem.depthSoftening',
        type: 'number'
    }, {
        label: 'Sort',
        path: 'components.particlesystem.sort',
        type: 'select',
        args: {
            type: 'number',
            options: [{
                v: 0, t: 'None'
            }, {
                v: 1, t: 'Camera Distance'
            }, {
                v: 2, t: 'Newest First'
            }, {
                v: 3, t: 'Oldest First'
            }]
        }
    }, {
        label: 'Blend Type',
        path: 'components.particlesystem.blendType',
        type: 'select',
        args: {
            type: 'number',
            options: [{
                v: 2, t: 'Alpha'
            }, {
                v: 1, t: 'Additive'
            }, {
                v: 5, t: 'Multiply'
            }]
        },
        reference: 'particlesystem:blend'
    }, {
        label: 'Stretch',
        path: 'components.particlesystem.stretch',
        type: 'number'
    }, {
        label: 'Align To Motion',
        path: 'components.particlesystem.alignToMotion',
        type: 'boolean'
    }, {
        label: 'Emitter Shape',
        path: 'components.particlesystem.emitterShape',
        type: 'select',
        args: {
            type: 'number',
            options: [{
                v: 0, t: 'Box'
            }, {
                v: 1, t: 'Sphere'
            }]
        }
    }, {
        label: 'Emitter Extents',
        path: 'components.particlesystem.emitterExtents',
        type: 'vec3',
        args: {
            placeholder: ['X', 'Y', 'Z']
        }
    }, {
        label: 'Inner Extents',
        path: 'components.particlesystem.emitterExtentsInner',
        type: 'vec3',
        args: {
            placeholder: ['X', 'Y', 'Z']
        }
    }, {
        label: 'Emitter Radius',
        path: 'components.particlesystem.emitterRadius',
        type: 'number'
    }, {
        label: 'Inner Radius',
        path: 'components.particlesystem.emitterRadiusInner',
        type: 'number'
    }, {
        label: 'Wrap',
        path: 'components.particlesystem.wrap',
        type: 'boolean'
    }, {
        label: 'Local Space',
        path: 'components.particlesystem.localSpace',
        type: 'boolean'
    }, {
        label: 'Layers',
        path: 'components.particlesystem.layers',
        type: 'layers',
        args: {
            excludeLayers: [
                LAYERID_DEPTH,
                LAYERID_SKYBOX,
                LAYERID_IMMEDIATE
            ]
        }
    }, {
        label: 'Wrap Bounds',
        path: 'components.particlesystem.wrapBounds',
        type: 'vec3',
        args: {
            placeholder: ['X', 'Y', 'Z']
        }
    }, {
        label: 'Orientation',
        path: 'components.particlesystem.orientation',
        type: 'select',
        args: {
            type: 'number',
            options: [{
                v: 0, t: 'Screen'
            }, {
                v: 1, t: 'World Normal'
            }, {
                v: 2, t: 'Emitter Normal'
            }]
        }
    }, {
        label: 'Particle Normal',
        path: 'components.particlesystem.particleNormal',
        type: 'vec3',
        args: {
            placeholder: ['X', 'Y', 'Z']
        }
    }, {
        label: 'Color Map',
        path: 'components.particlesystem.colorMapAsset',
        type: 'asset',
        args: {
            assetType: 'texture'
        },
        reference: 'particlesystem:colorMap'
    }, {
        label: 'Normal Map',
        path: 'components.particlesystem.normalMapAsset',
        type: 'asset',
        args: {
            assetType: 'texture'
        },
        reference: 'particlesystem:normalMap'
    }, {
        label: 'Horizontal Tiles',
        path: 'components.particlesystem.animTilesX',
        type: 'number',
        args: {
            min: 1
        }
    }, {
        label: 'Vertical Tiles',
        path: 'components.particlesystem.animTilesY',
        type: 'number',
        args: {
            min: 1
        }
    }, {
        label: 'Start Frame',
        path: 'components.particlesystem.animStartFrame',
        type: 'number',
        args: {
            min: 0
        }
    }, {
        label: 'Frame Count',
        path: 'components.particlesystem.animNumFrames',
        type: 'number',
        args: {
            min: 1
        }
    }, {
        label: 'Animation Speed',
        path: 'components.particlesystem.animSpeed',
        type: 'number'
    }, {
        label: 'Animation Loop',
        path: 'components.particlesystem.animLoop',
        type: 'boolean'
    }, {
        label: 'Mesh',
        path: 'components.particlesystem.mesh',
        type: 'asset',
        args: {
            assetType: 'model'
        }
    }, {
        label: 'Local Velocity',
        paths: ['components.particlesystem.localVelocityGraph', 'components.particlesystem.localVelocityGraph2'],
        type: 'curveset',
        args: {
            curves: ['X', 'Y', 'Z']
        }
    }, {
        label: 'Velocity',
        paths: ['components.particlesystem.velocityGraph', 'components.particlesystem.velocityGraph2'],
        type: 'curveset',
        args: {
            curves: ['X', 'Y', 'Z']
        }
    }, {
        label: 'Radial Speed',
        paths: ['components.particlesystem.radialSpeedGraph', 'components.particlesystem.radialSpeedGraph2'],
        type: 'curveset',
        args: {
            curves: ['R']
        }
    }, {
        label: 'Rotation Speed',
        paths: ['components.particlesystem.rotationSpeedGraph', 'components.particlesystem.rotationSpeedGraph2'],
        type: 'curveset',
        args: {
            curves: ['Angle'],
            verticalValue: 180
        }
    }, {
        label: 'Scale',
        paths: ['components.particlesystem.scaleGraph', 'components.particlesystem.scaleGraph2'],
        type: 'curveset',
        args: {
            curves: ['Scale'],
            verticalValue: 1,
            min: 0
        }
    }, {
        label: 'Color',
        path: 'components.particlesystem.colorGraph',
        type: 'gradient',
        args: {
            channels: 3
        }
    }, {
        label: 'Opacity',
        paths: ['components.particlesystem.alphaGraph', 'components.particlesystem.alphaGraph2'],
        type: 'curveset',
        args: {
            curves: ['Opacity'],
            min: 0,
            max: 1
        }
    }];

    ATTRIBUTES.forEach(attr => {
        if (!attr.path && !attr.paths && !attr.alias || attr.reference) return;

        const parts = (attr.path || attr.alias || attr.paths[0]).split('.');
        attr.reference = `particlesystem:${parts[parts.length - 1]}`;
    });

    class ParticlesystemComponentInspector extends pcui.ComponentInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.component = 'particlesystem';

            super(args);

            this._attributesInspector = new pcui.AttributesInspector({
                assets: args.assets,
                projectSettings: args.projectSettings,
                history: args.history,
                attributes: !editor.call('users:hasFlag', 'hasParticleSystemAnimStartFrame') ?
                    ATTRIBUTES.filter(attr => attr.path !== 'components.particlesystem.animStartFrame') : ATTRIBUTES,
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);

            this._suppressToggleFields = false;

            [
                'loop',
                'lighting',
                'emitterShape',
                'wrap',
                'orientation',
                'colorMapAsset',
                'normalMapAsset'
            ].forEach(field => {
                this._field(field).on('change', this._toggleFields.bind(this));
            });

            // add control buttons
            const btnPlay = new pcui.Button({
                size: 'small',
                icon: 'E131',
                hidden: true
            });
            btnPlay.style.flex = 'initial';

            btnPlay.on('click', this._onClickPlay.bind(this));

            this._btnPlay = btnPlay;

            const btnPause = new pcui.Button({
                size: 'small',
                text: '&#10074;&#10074;',
                unsafe: true
            });
            btnPause.style.flex = 'initial';

            btnPause.on('click', this._onClickPause.bind(this));

            this._btnPause = btnPause;

            const btnStop = new pcui.Button({
                size: 'small',
                icon: 'E135'
            });
            btnStop.style.flex = 'initial';

            btnStop.on('click', this._onClickStop.bind(this));

            const btnReset = new pcui.Button({
                size: 'small',
                icon: 'E113'
            });
            btnReset.style.flex = 'initial';

            btnReset.on('click', this._onClickReset.bind(this));

            const controls = new pcui.LabelGroup({
                text: 'Controls'
            });
            controls.append(btnPlay);
            controls.append(btnPause);
            controls.append(btnStop);
            controls.append(btnReset);

            this._attributesInspector.prepend(controls);

            if (this._templateOverridesSidebar) {
                const emissionRate = this._field('emissionRate').inputs;
                this._templateOverridesSidebar.registerElementForPath(`components.particlesystem.rate`, emissionRate[0].dom);
                this._templateOverridesSidebar.registerElementForPath(`components.particlesystem.rate2`, emissionRate[1].dom);

                const startAngle = this._field('startAngle').inputs;
                this._templateOverridesSidebar.registerElementForPath(`components.particlesystem.startAngle`, startAngle[0].dom);
                this._templateOverridesSidebar.registerElementForPath(`components.particlesystem.startAngle2`, startAngle[1].dom);
            }
        }

        _field(name) {
            return this._attributesInspector.getField(`components.particlesystem.${name}`);
        }

        _toggleFields() {
            if (this._suppressToggleFields) return;

            const emitterShape = this._field('emitterShape').value;

            this._field('preWarm').parent.hidden = !this._field('loop').value;
            this._field('halfLambert').parent.hidden = !this._field('lighting').value;
            this._field('emitterExtents').parent.hidden = emitterShape !== 0;
            this._field('emitterExtentsInner').parent.hidden = emitterShape !== 0;
            this._field('emitterRadius').parent.hidden = emitterShape !== 1;
            this._field('emitterRadiusInner').parent.hidden = emitterShape !== 1;
            this._field('wrapBounds').parent.hidden = !this._field('wrap').value;
            this._field('particleNormal').parent.hidden = this._field('orientation').value === 0;

            const hideAnimTiles = !this._field('normalMapAsset').value && !this._field('colorMapAsset').value;
            this._field('animTilesX').parent.hidden = hideAnimTiles;
            this._field('animTilesY').parent.hidden = hideAnimTiles;
            this._field('animNumFrames').parent.hidden = hideAnimTiles;
            this._field('animSpeed').parent.hidden = hideAnimTiles;
            this._field('animLoop').parent.hidden = hideAnimTiles;
        }

        _onClickPlay() {
            if (!this._entities) return;

            this._btnPlay.hidden = true;
            this._btnPause.hidden = false;

            this._entities.forEach(e => {
                if (!e.entity || !e.entity.particlesystem || !e.entity.particlesystem.emitter) return;

                if (e.entity.particlesystem.data.paused) {
                    e.entity.particlesystem.unpause();
                } else {
                    e.entity.particlesystem.stop();
                    e.entity.particlesystem.reset();
                    e.entity.particlesystem.play();
                }
            });
        }

        _onClickPause() {
            if (!this._entities) return;

            this._btnPlay.hidden = false;
            this._btnPause.hidden = true;

            this._entities.forEach(e => {
                if (!e.entity || !e.entity.particlesystem || !e.entity.particlesystem.emitter) return;

                e.entity.particlesystem.pause();
            });

        }

        _onClickStop() {
            if (!this._entities) return;

            this._entities.forEach(e => {
                if (!e.entity || !e.entity.particlesystem || !e.entity.particlesystem.emitter) return;

                e.entity.particlesystem.stop();
            });

            this._btnPlay.hidden = false;
            this._btnPause.hidden = true;
        }

        _onClickReset() {
            if (!this._entities) return;

            this._entities.forEach(e => {
                if (!e.entity || !e.entity.particlesystem || !e.entity.particlesystem.emitter) return;

                e.entity.particlesystem.rebuild();
                e.entity.particlesystem.reset();
                e.entity.particlesystem.play();
            });
        }

        link(entities) {
            super.link(entities);

            this._suppressToggleFields = true;
            this._attributesInspector.link(entities);

            // link dummy vector fields to actual paths
            const emissionRate = this._field('emissionRate').inputs;
            emissionRate[0].link(entities, 'components.particlesystem.rate');
            emissionRate[1].link(entities, 'components.particlesystem.rate2');

            const startAngle = this._field('startAngle').inputs;
            startAngle[0].link(entities, 'components.particlesystem.startAngle');
            startAngle[1].link(entities, 'components.particlesystem.startAngle2');

            this._suppressToggleFields = false;
            this._toggleFields();

            // play particles from the beginning
            this._onClickPlay();
        }

        unlink() {
            super.unlink();
            this._attributesInspector.unlink();

            ['emissionRate', 'startAngle'].forEach(field => {
                const inputs = this._field(field).inputs;
                for (let i = 0; i < inputs.length; i++) {
                    inputs[i].unlink();
                }
            });
        }

        destroy() {
            if (this._destroyed) return;

            if (this._templateOverridesSidebar) {
                this._templateOverridesSidebar.unregisterElementForPath(`components.particlesystem.rate`);
                this._templateOverridesSidebar.unregisterElementForPath(`components.particlesystem.rate2`);
                this._templateOverridesSidebar.unregisterElementForPath(`components.particlesystem.startAngle`);
                this._templateOverridesSidebar.unregisterElementForPath(`components.particlesystem.startAngle2`);
            }

            super.destroy();
        }
    }

    return {
        ParticlesystemComponentInspector: ParticlesystemComponentInspector
    };
})());


/* editor/inspector/components/rigidbody.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [{
        label: 'Type',
        path: 'components.rigidbody.type',
        type: 'select',
        args: {
            type: 'string',
            options: [{
                v: 'static', t: 'Static'
            }, {
                v: 'dynamic', t: 'Dynamic'
            }, {
                v: 'kinematic', t: 'Kinematic'
            }]
        }
    }, {
        label: 'Mass',
        path: 'components.rigidbody.mass',
        type: 'number',
        args: {
            precision: 2,
            step: 0.1,
            min: 0,
            placeholder: 'Kg'
        }
    }, {
        label: 'Linear Damping',
        path: 'components.rigidbody.linearDamping',
        type: 'number',
        args: {
            precision: 6,
            step: 0.01,
            min: 0,
            max: 1
        }
    }, {
        label: 'Angular Damping',
        path: 'components.rigidbody.angularDamping',
        type: 'number',
        args: {
            precision: 6,
            step: 0.01,
            min: 0,
            max: 1
        }
    }, {
        label: 'Linear Factor',
        path: 'components.rigidbody.linearFactor',
        type: 'vec3',
        args: {
            precision: 4,
            step: 0.01,
            min: 0,
            max: 1,
            placeholder: ['X', 'Y', 'Z']
        }
    }, {
        label: 'Angular Factor',
        path: 'components.rigidbody.angularFactor',
        type: 'vec3',
        args: {
            precision: 4,
            step: 0.01,
            min: 0,
            max: 1,
            placeholder: ['X', 'Y', 'Z']
        }
    }, {
        label: 'Friction',
        path: 'components.rigidbody.friction',
        type: 'slider',
        args: {
            precision: 4,
            step: 0.01,
            min: 0,
            max: 1
        }
    }, {
        label: 'Restitution',
        path: 'components.rigidbody.restitution',
        type: 'slider',
        args: {
            precision: 4,
            step: 0.01,
            min: 0,
            max: 1
        }
    }];

    ATTRIBUTES.forEach(attr => {
        const parts = attr.path.split('.');
        attr.reference = `rigidbody:${parts[parts.length - 1]}`;
    });

    class RigidbodyComponentInspector extends pcui.ComponentInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.component = 'rigidbody';

            super(args);

            this._attributesInspector = new pcui.AttributesInspector({
                assets: args.assets,
                history: args.history,
                attributes: ATTRIBUTES,
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);

            this._field('type').on('change', this._toggleFields.bind(this));

            this._suppressToggleFields = false;

            this._importAmmoPanel = editor.call('attributes:appendImportAmmo', this);
            this._importAmmoPanel.hidden = true;
            this._importAmmoPanel.label.text = 'Ammo module not found';
            this._importAmmoPanel.class.add('library-warning');
            this._importAmmoPanel.label.class.add('library-warning-text');
            this._importAmmoPanel.style.margin = '6px';

            this.on('show', () => {
                this._importAmmoPanel.hidden = editor.call('project:settings:hasPhysics');
            });
        }

        _field(name) {
            return this._attributesInspector.getField(`components.rigidbody.${name}`);
        }

        _toggleFields() {
            if (this._suppressToggleFields) return;

            const isDynamic = this._field('type').value === 'dynamic';

            [
                'mass',
                'linearDamping',
                'angularDamping',
                'linearFactor',
                'angularFactor'
            ].forEach(field => {
                this._field(field).parent.hidden = !isDynamic;
            });
        }

        link(entities) {
            super.link(entities);
            this._suppressToggleFields = true;
            this._attributesInspector.link(entities);
            this._suppressToggleFields = false;
            this._toggleFields();
        }

        unlink() {
            super.unlink();
            this._attributesInspector.unlink();
        }
    }

    return {
        RigidbodyComponentInspector: RigidbodyComponentInspector
    };
})());


/* editor/inspector/components/screen.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [{
        label: 'Screen Space',
        path: 'components.screen.screenSpace',
        type: 'boolean'
    }, {
        label: 'Resolution',
        path: 'components.screen.resolution',
        type: 'vec2',
        args: {
            placeholder: ['Width', 'Height']
        }
    }, {
        label: 'Ref Resolution',
        path: 'components.screen.referenceResolution',
        type: 'vec2',
        args: {
            placeholder: ['Width', 'Height']
        }
    }, {
        label: 'Scale Mode',
        path: 'components.screen.scaleMode',
        type: 'select',
        args: {
            type: 'string',
            options: [{
                v: 'none', t: 'None'
            }, {
                v: 'blend', t: 'Blend'
            }]
        }
    }, {
        label: 'Scale Blend',
        path: 'components.screen.scaleBlend',
        type: 'slider',
        args: {
            min: 0,
            max: 1,
            precision: 2,
            step: 0.1
        }
    }];

    ATTRIBUTES.forEach(attr => {
        const parts = attr.path.split('.');
        attr.reference = `screen:${parts[parts.length - 1]}`;
    });

    class ScreenComponentInspector extends pcui.ComponentInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.component = 'screen';

            super(args);

            this._attributesInspector = new pcui.AttributesInspector({
                history: args.history,
                attributes: utils.deepCopy(ATTRIBUTES),
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);

            this._field('scaleMode').on('change', this._toggleFields.bind(this));
            this._field('screenSpace').on('change', this._toggleFields.bind(this));

            this._suppressToggleFields = false;
        }

        _field(name) {
            return this._attributesInspector.getField(`components.screen.${name}`);
        }

        _toggleFields() {
            if (this._suppressToggleFields) return;

            const scaleMode = this._field('scaleMode').value;
            const screenSpace = this._field('screenSpace').value;

            this._field('resolution').parent.hidden = !!screenSpace;
            this._field('referenceResolution').parent.hidden = scaleMode === 'none' || !screenSpace;
            this._field('scaleMode').parent.hidden = !screenSpace;
            this._field('scaleBlend').parent.hidden = scaleMode !== 'blend' || !screenSpace;
        }

        link(entities) {
            super.link(entities);
            this._suppressToggleFields = true;
            this._attributesInspector.link(entities);
            this._suppressToggleFields = false;
            this._toggleFields();
        }

        unlink() {
            super.unlink();
            this._attributesInspector.unlink();
        }
    }

    return {
        ScreenComponentInspector: ScreenComponentInspector
    };
})());


/* editor/inspector/components/script.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_SCRIPT_CONTAINER = 'script-component-inspector-scripts';
    const CLASS_SCRIPT = 'script-component-inspector-script';
    const CLASS_SCRIPT_ENABLED = CLASS_SCRIPT + '-enabled';
    const CLASS_SCRIPT_VALID = CLASS_SCRIPT + '-valid';
    const CLASS_SCRIPT_INVALID = CLASS_SCRIPT + '-invalid';

    const ATTRIBUTE_SUBTITLES = {
        boolean: '{Boolean}',
        number: '{Number}',
        string: '{String}',
        json: '{Object}',
        asset: '{pc.Asset}',
        entity: '{pc.Entity}',
        rgb: '{pc.Color}',
        rgba: '{pc.Color}',
        vec2: '{pc.Vec2}',
        vec3: '{pc.Vec3}',
        vec4: '{pc.Vec4}',
        curve: '{pc.Curve}'
    };

    class ScriptComponentInspector extends pcui.ComponentInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.component = 'script';

            super(args);

            this._scriptPanels = {};

            this._argsAssets = args.assets;
            this._argsEntities = args.entities;

            this._editorEvents = [];

            this._selectScript = new pcui.SelectInput({
                placeholder: '+ ADD SCRIPT',
                allowInput: true,
                allowCreate: true,
                createLabelText: 'Create Script',
                createFn: this._onCreateScript.bind(this),
                optionsFn: this._updateDropDown.bind(this)
            });
            this.append(this._selectScript);

            this._selectScript.on('change', this._onSelectScript.bind(this));

            this._containerScripts = new pcui.Container({
                flex: true,
                class: CLASS_SCRIPT_CONTAINER
            });
            this._containerScripts.style.margin = '6px';
            this.append(this._containerScripts);

            this._containerScripts.on('child:dragend', this._onDragEnd.bind(this));

            this._dirtyScripts = new Set();
            this._dirtyScriptsTimeout = null;

            this._updateScriptsTimeout = null;
        }

        _createScriptPanel(scriptName) {
            const panel = new ScriptInspector({
                scriptName: scriptName,
                flex: true,
                collapsible: true,
                removable: true,
                assets: this._argsAssets,
                entities: this._argsEntities,
                history: this._history,
                class: CLASS_SCRIPT
            });

            this._scriptPanels[scriptName] = panel;

            this._containerScripts.append(panel);

            return panel;
        }

        _deferUpdateDirtyScripts() {
            if (this._dirtyScriptsTimeout) {
                cancelAnimationFrame(this._dirtyScriptsTimeout);
            }

            this._dirtyScriptsTimeout = requestAnimationFrame(this._updateDirtyScripts.bind(this));
        }

        _updateDirtyScripts() {
            if (this._dirtyScriptsTimeout) {
                cancelAnimationFrame(this._dirtyScriptsTimeout);
            }

            this._dirtyScriptsTimeout = null;

            if (this._dirtyScripts.size) {
                this._updateScripts(this._dirtyScripts);
            }

            this._dirtyScripts = new Set();
        }

        _updateScripts(filterScriptsSet) {
            if (!this._entities) return;

            const entitiesPerScript = {};

            this._entities.forEach((e, i) => {
                const order = e.get('components.script.order');
                if (!order) return;

                order.forEach((script, j) => {
                    if (filterScriptsSet && !filterScriptsSet.has(script)) return;

                    if (!entitiesPerScript[script]) {
                        entitiesPerScript[script] = [e];
                    } else {
                        entitiesPerScript[script].push(e);
                    }

                    if (!this._scriptPanels[script]) {
                        this._createScriptPanel(script);
                    }

                    if (i === 0) {
                        this._containerScripts.move(this._scriptPanels[script], j);
                    }
                });
            });

            for (const script in entitiesPerScript) {
                const panel = this._scriptPanels[script];
                panel.sortable = this._entities.length === 1;
                panel.headerText = entitiesPerScript[script].length === this._entities.length ? script : script + ' *';
                panel.link(entitiesPerScript[script]);
            }

            if (filterScriptsSet) {
                filterScriptsSet.forEach(script => {
                    if (!entitiesPerScript[script]) {
                        this._scriptPanels[script].destroy();
                        delete this._scriptPanels[script];
                    }
                });
            }
        }

        _updateDropDown() {
            
            if (!this._entities) return [];

            const unparsed = this._findUnparsedScripts();

            this._parseUnparsedScripts(unparsed);

            return this._findDropdownScripts();
        }

        _findUnparsedScripts() {
            let assets = this._argsAssets.array();

            assets = assets.filter(a => a.get('type') === 'script');

            return assets.filter(a => {
                return a.get('data.lastParsedHash') === null &&
                    a.get('file.hash');
            });
        }

        _parseUnparsedScripts(assets) {
            assets.forEach(a => editor.call('scripts:parse', a, err => {
                a.set('data.lastParsedHash', a.get('file.hash'));
            }));
        }

        _findDropdownScripts() {
            const scripts = editor.call('assets:scripts:list');

            // do not allow scripts that already exist to be created
            this._selectScript.invalidOptions = scripts;

            // remove scripts that are added in all entities
            const counts = {};
            this._entities.forEach(e => {
                const order = e.get('components.script.order');
                if (!order) return;

                order.forEach(script => {
                    if (!counts[script]) {
                        counts[script] = 1;
                    } else {
                        counts[script]++;
                    }
                });
            });

            // sort list
            scripts.sort((a, b) => {
                if (a.toLowerCase() > b.toLowerCase()) {
                    return 1;
                } else if (a.toLowerCase() < b.toLowerCase()) {
                    return -1;
                }

                return 0;
            });

            const result = scripts.filter(s => {
                return counts[s] !== this._entities.length;
            }).map(s => {
                return {
                    v: s,
                    t: s
                };
            });

            return result;
        }

        _onSelectScript(script) {
            if (!script) return;

            this._selectScript.value = null;

            this._selectScript.blur();

            this._addScriptToEntities(script);
        }

        _onCreateScript(script) {
            this._selectScript.blur();

            const filename = editor.call('picker:script-create:validate', script);

            const onFilename = (filename) => {
                editor.call('assets:create:script', {
                    filename: filename,
                    boilerplate: true,
                    noSelect: true,
                    callback: (err, asset, result) => {
                        if (result && result.scripts) {
                            const keys = Object.keys(result.scripts);
                            if (keys.length === 1) {
                                this._addScriptToEntities(keys[0]);
                            }
                        }
                    }
                });
            };

            if (filename) {
                onFilename(filename);
            } else {
                editor.call('picker:script-create', onFilename, script);
            }
        }

        _addScriptToEntities(script) {
            const entities = this._entities.slice();

            let changed = {};

            const undo = () => {
                entities.forEach(e => {
                    e = e.latest();
                    if (!e || !changed[e.get('resource_id')] || !e.has('components.script')) return;

                    const history = e.history.enabled;
                    e.history.enabled = false;
                    e.unset(`components.script.scripts.${script}`);
                    e.removeValue('components.script.order', script);
                    e.history.enabled = history;
                });

            };

            const redo = () => {
                changed = {};
                entities.forEach(e => {
                    e = e.latest();
                    if (!e || !e.has('components.script') || e.has(`components.script.scripts.${script}`)) return;

                    changed[e.get('resource_id')] = true;
                    const history = e.history.enabled;
                    e.history.enabled = false;
                    e.set(`components.script.scripts.${script}`, {
                        enabled: true,
                        attributes: {}
                    });
                    e.insert('components.script.order', script);
                    e.history.enabled = history;
                });
            };

            redo();

            if (this._history && Object.keys(changed).length) {
                this._history.add({
                    name: 'entities.components.script.scripts.' + script,
                    undo: undo,
                    redo: redo
                });
            }
        }

        _onDragEnd(scriptInspector, newIndex, oldIndex) {
            if (!this._entities || this._entities.length !== 1 || newIndex === oldIndex) return;

            this._entities[0].move('components.script.order', oldIndex, newIndex);
        }

        _onScriptAddOrRemove() {
            
            if (this._updateScriptsTimeout) return;

            this._updateScriptsTimeout = setTimeout(() => {
                this._updateScriptsTimeout = null;
                this._selectScript.options = this._findDropdownScripts();
            });
        }

        link(entities) {
            
            super.link(entities);

            this._updateScripts();

            entities.forEach(e => {
                this._entityEvents.push(e.on('components.script.order:remove', value => {
                    this._dirtyScripts.add(value);
                    this._deferUpdateDirtyScripts();
                }));

                this._entityEvents.push(e.on('components.script.order:insert', value => {
                    this._dirtyScripts.add(value);
                    this._deferUpdateDirtyScripts();
                }));

                this._entityEvents.push(e.on('components.script.order:move', value => {
                    this._dirtyScripts.add(value);
                    this._deferUpdateDirtyScripts();
                }));

                this._entityEvents.push(e.on('components.script.order:set', value => {
                    if (!value) return;

                    value.forEach(script => {
                        this._dirtyScripts.add(script);
                    });
                    this._deferUpdateDirtyScripts();
                }));
            });

            this._editorEvents.push(editor.on('assets:scripts:add', this._onScriptAddOrRemove.bind(this)));
            this._editorEvents.push(editor.on('assets:scripts:remove', this._onScriptAddOrRemove.bind(this)));
        }

        unlink() {
            super.unlink();

            this._editorEvents.forEach(evt => evt.unbind());
            this._editorEvents.length = 0;

            this._selectScript.close();
            this._selectScript.value = '';
            this._containerScripts.clear();
            this._scriptPanels = {};
            this._dirtyScripts = new Set();

            if (this._dirtyScriptsTimeout) {
                cancelAnimationFrame(this._dirtyScriptsTimeout);
            }

            if (this._updateScriptsTimeout) {
                clearTimeout(this._updateScriptsTimeout);
                this._updateScriptsTimeout = null;
            }
        }
    }

    class ScriptInspector extends pcui.Panel {
        constructor(args) {
            super(args);
            this._scriptName = args.scriptName;

            this._attributesInspector = null;

            this._history = args.history;
            this._argsAssets = args.assets;
            this._argsEntities = args.entities;

            this._asset = editor.call('assets:scripts:assetByScript', this._scriptName);

            if (this._asset) {
                this._initializeScriptAttributes();
            }

            this._labelTitle.on('click', this._onClickTitle.bind(this));

            const doesScriptNameCollide = editor.call('assets:scripts:collide', this._scriptName);

            if (!this._asset || doesScriptNameCollide) {
                this.class.add(CLASS_SCRIPT_INVALID);
            }

            this._btnEdit = new pcui.Button({
                icon: 'E130',
                class: CLASS_SCRIPT_VALID
            });
            this._btnEdit.dom.tabIndex = -1;
            this._btnEdit.style.fontSize = '15px';
            this.header.append(this._btnEdit);
            this._btnEdit.on('click', this._onClickEdit.bind(this));

            const tooltipEdit = Tooltip.attach({
                target: this._btnEdit.dom,
                text: 'Edit',
                align: 'bottom',
                root: editor.call('layout.root')
            });
            this._btnEdit.once('destroy', () => {
                tooltipEdit.destroy();
            });

            this._btnParse = new pcui.Button({
                icon: 'E128',
                class: CLASS_SCRIPT_VALID
            });
            this._btnParse.dom.tabIndex = -1;
            this._btnParse.style.marginRight = '6px';
            this._btnParse.style.fontSize = '15px';
            this.header.append(this._btnParse);
            this._btnParse.on('click', this._onClickParse.bind(this));

            const tooltipParse = Tooltip.attach({
                target: this._btnParse.dom,
                text: 'Parse',
                align: 'bottom',
                root: editor.call('layout.root')
            });
            this._btnParse.on('destroy', () => {
                tooltipParse.destroy();
            });

            this._fieldEnable = new pcui.BooleanInput({
                type: 'toggle',
                binding: new pcui.BindingTwoWay({
                    history: args.history
                })
            });

            const enableGroup = new pcui.LabelGroup({
                text: 'On',
                class: CLASS_SCRIPT_ENABLED,
                field: this._fieldEnable
            });
            this.header.append(enableGroup);

            this._fieldEnable.on('change', value => {
                enableGroup.text = value ? 'On' : 'Off';
            });

            this._labelInvalid = new pcui.Label({
                text: '!',
                class: CLASS_SCRIPT_INVALID
            });
            this.header.appendBefore(this._labelInvalid, this._labelTitle);

            this._tooltipInvalid = editor.call('attributes:reference', {
                title: 'Invalid',
                description: this._getInvalidTooltipText()
            });
            this._tooltipInvalid.attach({
                target: this,
                element: this._labelInvalid.dom
            });

            this._labelInvalid.on('destroy', () => {
                this._tooltipInvalid.destroy();
            });

            this._entities = null;
            this._entityEvents = [];
            this._editorEvents = [];

            this._editorEvents.push(editor.on(`assets:scripts[${this._scriptName}]:attribute:set`, this._onAddAttribute.bind(this)));
            this._editorEvents.push(editor.on(`assets:scripts[${this._scriptName}]:attribute:unset`, this._onRemoveAttribute.bind(this)));
            this._editorEvents.push(editor.on(`assets:scripts[${this._scriptName}]:attribute:change`, this._onChangeAttribute.bind(this)));
            this._editorEvents.push(editor.on(`assets:scripts[${this._scriptName}]:attribute:move`, this._onMoveAttribute.bind(this)));
            this._editorEvents.push(editor.on(`assets:scripts[${this._scriptName}]:primary:set`, this._onPrimaryScriptSet.bind(this)));
            this._editorEvents.push(editor.on(`assets:scripts[${this._scriptName}]:primary:unset`, this._onPrimaryScriptUnset.bind(this)));
        }

        _initializeScriptAttributes() {
            
            const attributes = this._asset.get(`data.scripts.${this._scriptName}.attributes`);
            if (!attributes) return;

            const order = this._asset.get(`data.scripts.${this._scriptName}.attributesOrder`) || [];

            // script attributes inspector
            const inspectorAttributes = order.map(attribute => {
                return this._convertAttributeDataToInspectorData(attribute, attributes[attribute]);
            });

            if (this._attributesInspector) {
                this._attributesInspector.destroy();
            }

            this._attributesInspector = new pcui.AttributesInspector({
                attributes: inspectorAttributes,
                history: this._history,
                assets: this._argsAssets,
                entities: this._argsEntities
            });

            if (this._entities) {
                this._attributesInspector.link(this._entities);
            }

            this.append(this._attributesInspector);
        }

        _getInvalidTooltipText() {
            if (editor.call('assets:scripts:collide', this._scriptName)) {
                return `'${this._scriptName}' Script Object is defined in multiple preloaded assets. Please uncheck preloading for undesirable script assets.`;
            } else if (!this._asset) {
                return `'${this._scriptName}' Script Object is not defined in any preloaded script assets.`;
            }

            return '';
        }

        _onClickTitle(evt) {
            evt.stopPropagation();
            evt.preventDefault();

            if (this._asset) {
                editor.call('selector:set', 'asset', [this._asset]);
            }
        }

        _onClickEdit(evt) {
            if (this._asset) {
                editor.call('assets:edit', this._asset);
            }
        }

        _onClickParse(evt) {
            if (!this._asset) return;

            this._btnParse.enabled = false;
            editor.call('scripts:parse', this._asset, err => {
                this._btnParse.enabled = true;
                if (err) {
                    this._btnParse.class.add(pcui.CLASS_ERROR);
                } else {
                    this._btnParse.class.remove(pcui.CLASS_ERROR);
                }
            });
        }

        _onClickRemove(evt) {
            super._onClickRemove(evt);

            if (!this._entities) return;

            const entities = this._entities.slice();

            let prev = {};

            const undo = () => {
                entities.forEach(e => {
                    e = e.latest();
                    if (!e) return;

                    if (!prev[e.get('resource_id')]) return;
                    if (!e.has('components.script') || e.get('components.script.order').indexOf(this._scriptName) !== -1) return;

                    const history = e.history.enabled;
                    e.history.enabled = false;
                    e.set(`components.script.scripts.${this._scriptName}`, prev[e.get('resource_id')].script);
                    e.insert('components.script.order', this._scriptName, prev[e.get('resource_id')].order);
                    e.history.enabled = history;
                });
            };

            const redo = () => {
                prev = {};
                entities.forEach(e => {
                    e = e.latest();
                    if (!e) return;

                    if (!e.has(`components.script.scripts.${this._scriptName}`)) return;

                    prev[e.get('resource_id')] = {
                        script: e.get(`components.script.scripts.${this._scriptName}`),
                        order: e.get('components.script.order').indexOf(this._scriptName)
                    };

                    const history = e.history.enabled;
                    e.history.enabled = false;
                    e.unset(`components.script.scripts.${this._scriptName}`);
                    e.removeValue('components.script.order', this._scriptName);
                    e.history.enabled = history;
                });
            };

            redo();

            if (this._history) {
                this._history.add({
                    name: 'entities.components.script.scripts.' + this._scriptName,
                    undo: undo,
                    redo: redo
                });
            }
        }

        _convertAttributeDataToInspectorData(attributeName, attributeData) {
            let type = attributeData.type;

            let fieldArgs = {};

            // figure out attribute type
            if (attributeData.enum) {
                type = 'select';
                const selectInputArgs = {
                    type: attributeData.type,
                    options: []
                };

                for (let i = 0; i < attributeData.enum.order.length; i++) {
                    const key = attributeData.enum.order[i];
                    selectInputArgs.options.push({
                        v: attributeData.enum.options[key],
                        t: key
                    });
                }

                if (attributeData.array) {
                    fieldArgs.elementArgs = selectInputArgs;
                } else {
                    fieldArgs = selectInputArgs;
                }

            } else if (attributeData.color) {
                type = 'gradient';
                if (attributeData.color.length) {
                    fieldArgs.channels = attributeData.color.length;
                }
            } else if (type === 'curve') {
                type = 'curveset';
                fieldArgs.curves = attributeData.curves || ['Value'];
                fieldArgs.hideRandomize = true;
            } else if (type === 'asset') {
                if (attributeData.assetType) {
                    fieldArgs.assetType = attributeData.assetType;
                }
            } else if (type === 'number') {
                if (typeof(attributeData.min) === 'number' && typeof(attributeData.max) === 'number') {
                    type = 'slider';
                }
            }

            if (attributeData.array) {
                type = 'array:' + type;
            }

            const data = {
                label: attributeData.title || attributeName,
                type: type,
                path: `components.script.scripts.${this._scriptName}.attributes.${attributeName}`,
                tooltip: {
                    title: attributeName,
                    subTitle: this._getAttributeSubtitle(attributeData),
                    description: attributeData.description || ''
                },
                args: fieldArgs
            };

            if (attributeData.default !== undefined) {
                data.value = attributeData.default;
            }

            // add additional properties
            ['precision', 'step', 'min', 'max', 'placeholder'].forEach(field => {
                if (attributeData.hasOwnProperty(field)) {
                    data.args[field] = attributeData[field];
                }
            });

            return data;
        }

        _getAttributeSubtitle(attributeData) {
            let subTitle = ATTRIBUTE_SUBTITLES[attributeData.type];

            if (attributeData.type === 'curve') {
                if (attributeData.color) {
                    if (attributeData.color.length > 1) {
                        subTitle = '{pc.CurveSet}';
                    }
                } else if (attributeData.curves && attributeData.curves.length > 1) {
                    subTitle = '{pc.CurveSet}';
                }
            }

            if (attributeData.array) {
                subTitle = '[ ' + subTitle + ' ]';
            }

            return subTitle;
        }

        _onAddAttribute(asset, name, index) {
            if (this._asset !== asset || !this._asset) return;

            const data = this._asset.get(`data.scripts.${this._scriptName}.attributes.${name}`);
            if (!data) return;

            const inspectorData = this._convertAttributeDataToInspectorData(name, data);
            this._attributesInspector.addAttribute(inspectorData, index);
        }

        _onRemoveAttribute(asset, name) {
            if (this._asset !== asset || !this._asset) return;
            this._attributesInspector.removeAttribute(`components.script.scripts.${this._scriptName}.attributes.${name}`);
        }

        _onChangeAttribute(asset, name) {
            if (this._asset !== asset || !this._asset) return;

            const order = this._asset.get(`data.scripts.${this._scriptName}.attributesOrder`);
            const index = order.indexOf(name);
            if (index >= 0) {
                this._onRemoveAttribute(asset, name);
                this._onAddAttribute(asset, name, index);
            }
        }

        _onMoveAttribute(asset, name, index) {
            if (this._asset !== asset || !this._asset) return;

            this._attributesInspector.moveAttribute(`components.script.scripts.${this._scriptName}.attributes.${name}`, index);
        }

        _onPrimaryScriptSet(asset) {
            this._asset = asset;
            this.class.remove(CLASS_SCRIPT_INVALID);
            this._initializeScriptAttributes();
        }

        _onPrimaryScriptUnset() {
            this.class.add(CLASS_SCRIPT_INVALID);
            this._asset = null;
            if (this._attributesInspector) {
                this._attributesInspector.destroy();
                this._attributesInspector = null;
            }

            this._tooltipInvalid.html = editor.call('attributes:reference:template', {
                title: 'Invalid',
                description: this._getInvalidTooltipText()
            });
        }

        link(entities) {
            this.unlink();

            this._entities = entities;

            if (this._attributesInspector) {
                this._attributesInspector.link(entities);
            }
            this._fieldEnable.link(entities, `components.script.scripts.${this._scriptName}.enabled`);
        }

        unlink() {
            if (!this._entities) return;

            this._entities = null;

            if (this._attributesInspector) {
                this._attributesInspector.unlink();
            }
            this._fieldEnable.unlink();
        }

        destroy() {
            if (this._destroyed) return;

            this._editorEvents.forEach(e => e.unbind());
            this._editorEvents.length = 0;

            super.destroy();
        }
    }

    return {
        ScriptComponentInspector: ScriptComponentInspector
    };
})());


/* editor/inspector/components/scrollbar.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [{
        label: 'Orientation',
        path: 'components.scrollbar.orientation',
        type: 'select',
        args: {
            type: 'number',
            options: [{
                v: ORIENTATION_HORIZONTAL, t: 'Horizontal'
            }, {
                v: ORIENTATION_VERTICAL, t: 'Vertical'
            }]
        }
    }, {
        label: 'Value',
        path: 'components.scrollbar.value',
        type: 'number',
        args: {
            precision: 3,
            step: 0.01,
            min: 0,
            max: 1
        }
    }, {
        label: 'Handle',
        path: 'components.scrollbar.handleEntity',
        type: 'entity'
    }, {
        label: 'Handle Size',
        path: 'components.scrollbar.handleSize',
        type: 'number',
        args: {
            precision: 3,
            step: 0.01,
            min: 0,
            max: 1
        }
    }];

    ATTRIBUTES.forEach(attr => {
        const parts = attr.path.split('.');
        attr.reference = `scrollbar:${parts[parts.length - 1]}`;
    });

    class ScrollbarComponentInspector extends pcui.ComponentInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.component = 'scrollbar';

            super(args);

            const attrs = utils.deepCopy(ATTRIBUTES);
            attrs.forEach(attr => {
                if (attr.type === 'entity') {
                    attr.args = attr.args || {};
                    attr.args.entities = args.entities;
                }
            });

            this._attributesInspector = new pcui.AttributesInspector({
                history: args.history,
                entities: args.entities,
                attributes: attrs,
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);
        }

        link(entities) {
            super.link(entities);
            this._attributesInspector.link(entities);
        }

        unlink() {
            super.unlink();
            this._attributesInspector.unlink();
        }
    }

    return {
        ScrollbarComponentInspector: ScrollbarComponentInspector
    };
})());


/* editor/inspector/components/scrollview.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [{
        label: 'Scroll Mode',
        path: 'components.scrollview.scrollMode',
        type: 'select',
        args: {
            type: 'number',
            options: [{
                v: SCROLL_MODE_CLAMP, t: 'Clamp'
            }, {
                v: SCROLL_MODE_BOUNCE, t: 'Bounce'
            }, {
                v: SCROLL_MODE_INFINITE, t: 'Infinite'
            }]
        }
    }, {
        label: 'Bounce',
        path: 'components.scrollview.bounceAmount',
        type: 'number',
        args: {
            precision: 3,
            step: 0.01,
            min: 0,
            max: 10
        }
    }, {
        label: 'Friction',
        path: 'components.scrollview.friction',
        type: 'number',
        args: {
            precision: 3,
            step: 0.01,
            min: 0,
            max: 10
        }
    }, {
        label: 'Viewport',
        path: 'components.scrollview.viewportEntity',
        type: 'entity'
    }, {
        label: 'Content',
        path: 'components.scrollview.contentEntity',
        type: 'entity'
    }, {
        type: 'divider'
    }, {
        label: 'Horizontal',
        path: 'components.scrollview.horizontal',
        type: 'boolean'
    }, {
        label: 'Scrollbar',
        path: 'components.scrollview.horizontalScrollbarEntity',
        type: 'entity'
    }, {
        label: 'Visibility',
        path: 'components.scrollview.horizontalScrollbarVisibility',
        type: 'select',
        args: {
            type: 'number',
            options: [{
                v: SCROLLBAR_VISIBILITY_SHOW_ALWAYS, t: 'Show Always'
            }, {
                v: SCROLLBAR_VISIBILITY_SHOW_WHEN_REQUIRED, t: 'Show When Required'
            }]
        }
    }, {
        type: 'divider'
    }, {
        label: 'Vertical',
        path: 'components.scrollview.vertical',
        type: 'boolean'
    }, {
        label: 'Scrollbar',
        path: 'components.scrollview.verticalScrollbarEntity',
        type: 'entity'
    }, {
        label: 'Visibility',
        path: 'components.scrollview.verticalScrollbarVisibility',
        type: 'select',
        args: {
            type: 'number',
            options: [{
                v: SCROLLBAR_VISIBILITY_SHOW_ALWAYS, t: 'Show Always'
            }, {
                v: SCROLLBAR_VISIBILITY_SHOW_WHEN_REQUIRED, t: 'Show When Required'
            }]
        }
    }];

    ATTRIBUTES.forEach(attr => {
        if (!attr.path) return;
        const parts = attr.path.split('.');
        attr.reference = `scrollview:${parts[parts.length - 1]}`;
    });

    class ScrollviewComponentInspector extends pcui.ComponentInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.component = 'scrollview';

            super(args);

            const attrs = utils.deepCopy(ATTRIBUTES);
            attrs.forEach(attr => {
                if (attr.type === 'entity') {
                    attr.args = attr.args || {};
                    attr.args.entities = args.entities;
                }
            });

            this._attributesInspector = new pcui.AttributesInspector({
                entities: args.entities,
                history: args.history,
                attributes: attrs,
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);

            ['scrollMode', 'vertical', 'horizontal'].forEach(field => {
                this._field(field).on('change', this._toggleFields.bind(this));
            });

            this._suppressToggleFields = false;
        }

        _field(name) {
            return this._attributesInspector.getField(`components.scrollview.${name}`);
        }

        _toggleFields() {
            if (this._suppressToggleFields) return;

            const isBounceMode = this._field('scrollMode').value === SCROLL_MODE_BOUNCE;
            const verticalScrollingEnabled = this._field('vertical').value === true;
            const horizontalScrollingEnabled = this._field('horizontal').value === true;

            this._field('bounceAmount').parent.hidden = !isBounceMode;
            this._field('verticalScrollbarEntity').parent.hidden = !verticalScrollingEnabled;
            this._field('verticalScrollbarVisibility').parent.hidden = !verticalScrollingEnabled;
            this._field('horizontalScrollbarEntity').parent.hidden = !horizontalScrollingEnabled;
            this._field('horizontalScrollbarVisibility').parent.hidden = !horizontalScrollingEnabled;
        }

        link(entities) {
            super.link(entities);
            this._suppressToggleFields = true;
            this._attributesInspector.link(entities);
            this._suppressToggleFields = false;
            this._toggleFields();
        }

        unlink() {
            super.unlink();
            this._attributesInspector.unlink();
        }
    }

    return {
        ScrollviewComponentInspector: ScrollviewComponentInspector
    };
})());


/* editor/inspector/components/sound.js */
Object.assign(pcui, (function () {
    'use strict';

    const COMPONENT_ATTRIBUTES = [{
        label: 'Positional',
        path: 'components.sound.positional',
        type: 'boolean',
        reference: 'sound:positional'
    }, {
        label: 'Volume',
        path: 'components.sound.volume',
        type: 'slider',
        args: {
            precision: 2,
            step: 0.01,
            min: 0,
            max: 1
        },
        reference: 'sound:volume'
    }, {
        label: 'Pitch',
        path: 'components.sound.pitch',
        type: 'number',
        args: {
            min: 0,
            step: 0.1
        },
        reference: 'sound:pitch'
    }, {
        label: 'Ref Distance',
        path: 'components.sound.refDistance',
        type: 'number',
        args: {
            min: 0,
            step: 1,
            precision: 2
        },
        reference: 'sound:refDistance'
    }, {
        label: 'Max Distance',
        path: 'components.sound.maxDistance',
        type: 'number',
        args: {
            min: 0,
            step: 1,
            precision: 2
        },
        reference: 'sound:maxDistance'
    }, {
        label: 'Distance Model',
        path: 'components.sound.distanceModel',
        type: 'select',
        args: {
            type: 'string',
            options: [{
                v: 'linear', t: 'Linear',
            }, {
                v: 'exponential', t: 'Exponential',
            }, {
                v: 'inverse', t: 'Inverse',
            }]
        },
        reference: 'sound:distanceModel'
    }, {
        label: 'Roll-off Factor',
        path: 'components.sound.rollOffFactor',
        type: 'number',
        args: {
            min: 0,
            precision: 2,
            step: 0.1
        },
        reference: 'sound:rollOffFactor'
    }];

    const SLOT_ATTRIBUTES = [{
        label: 'Name',
        path: 'components.sound.slots.$.name',
        type: 'string',
        reference: 'sound:slot:name'
    }, {
        label: 'Asset',
        type: 'asset',
        path: 'components.sound.slots.$.asset',
        args: {
            assetType: 'audio'
        },
        reference: 'sound:slot:asset'
    }, {
        label: 'Start Time',
        type: 'number',
        path: 'components.sound.slots.$.startTime',
        args: {
            min: 0,
            precision: 2,
            step: 0.01
        },
        reference: 'sound:slot:startTime'
    }, {
        label: 'Duration',
        type: 'number',
        path: 'components.sound.slots.$.duration',
        args: {
            min: 0,
            precision: 2,
            step: 0.01,
            allowNull: true
        },
        reference: 'sound:slot:duration'
    }, {
        label: 'Auto Play',
        type: 'boolean',
        path: 'components.sound.slots.$.autoPlay',
        reference: 'sound:slot:autoPlay'
    }, {
        label: 'Overlap',
        type: 'boolean',
        path: 'components.sound.slots.$.overlap',
        reference: 'sound:slot:overlap'
    }, {
        label: 'Loop',
        type: 'boolean',
        path: 'components.sound.slots.$.loop',
        reference: 'sound:slot:loop'
    }, {
        label: 'Volume',
        type: 'slider',
        path: 'components.sound.slots.$.volume',
        args: {
            min: 0,
            max: 1,
            precision: 2,
            step: 0.01
        },
        reference: 'sound:slot:volume'
    }, {
        label: 'Pitch',
        type: 'number',
        path: 'components.sound.slots.$.pitch',
        args: {
            precision: 2,
            step: 0.1,
            min: 0
        },
        reference: 'sound:slot:pitch'
    }];

    const CLASS_SLOT = 'sound-component-inspector-slot';

    class SoundComponentInspector extends pcui.ComponentInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.component = 'sound';

            super(args);

            this._assets = args.assets;

            this._attributesInspector = new pcui.AttributesInspector({
                history: args.history,
                assets: args.assets,
                attributes: COMPONENT_ATTRIBUTES,
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);

            this._containerSlots = new pcui.Container({
                flex: true
            });
            this.append(this._containerSlots);

            this._slotInspectors = {};

            this._btnAddSlot = new pcui.Button({
                text: 'ADD SLOT',
                icon: 'E120',
                flexGrow: 1,
                hidden: true
            });
            this.append(this._btnAddSlot);

            this._field('positional').on('change', this._toggleFields.bind(this));

            this._suppressToggleFields = false;
        }

        _field(name) {
            return this._attributesInspector.getField(`components.sound.${name}`);
        }

        _toggleFields() {
            if (this._suppressToggleFields) return;

            const positional = this._field('positional').value;
            this._field('refDistance').parent.hidden = !positional;
            this._field('maxDistance').parent.hidden = !positional;
            this._field('distanceModel').parent.hidden = !positional;
            this._field('rollOffFactor').parent.hidden = !positional;
        }

        _onClickAddSlot(entity) {
            let keyName = 1;
            let count = 0;
            const idx = {};
            const slots = entity.get('components.sound.slots');
            for (const key in slots) {
                keyName = parseInt(key, 10);
                idx[slots[key].name] = true;
                count++;
            }

            keyName++;
            let name = `Slot ${count + 1}`;
            while (idx[name]) {
                count++;
                name = `Slot ${count + 1}`;
            }

            entity.set(`components.sound.slots.${keyName}`, {
                name: name,
                loop: false,
                autoPlay: false,
                overlap: false,
                asset: null,
                startTime: 0,
                duration: null,
                volume: 1,
                pitch: 1
            });
        }

        _createSlotInspector(entity, slotKey, slot) {
            const inspector = new SoundSlotInspector({
                slotKey: slotKey,
                slot: slot,
                history: this._history,
                assets: this._assets,
                removable: true,
                templateOverridesSidebar: this._templateOverridesSidebar
            });

            this._containerSlots.append(inspector);

            this._slotInspectors[slotKey] = inspector;

            inspector.link([entity]);

            return inspector;
        }

        link(entities) {
            super.link(entities);

            this._suppressToggleFields = true;
            this._attributesInspector.link(entities);
            this._suppressToggleFields = false;
            this._toggleFields();

            if (entities.length === 1) {
                this._btnAddSlot.hidden = false;

                // event for new slots
                this._entityEvents.push(entities[0].on('*:set', (path, value) => {
                    var matches = path.match(/^components.sound.slots.(\d+)$/);
                    if (! matches) return;

                    this._createSlotInspector(entities[0], matches[1], value);
                }));

                // event for deleted slots
                this._entityEvents.push(entities[0].on('*:unset', (path) => {
                    var matches = path.match(/^components.sound.slots.(\d+)$/);
                    if (! matches) return;

                    const inspector = this._slotInspectors[matches[1]];
                    if (inspector) {
                        inspector.destroy();
                        delete this._slotInspectors[matches[1]];
                    }
                }));

                // create all existing slots
                const slots = entities[0].get('components.sound.slots');
                for (const key in slots) {
                    this._createSlotInspector(entities[0], key, slots[key]);
                }

                // register click add slots
                this._entityEvents.push(
                    this._btnAddSlot.on('click', () => this._onClickAddSlot(entities[0]))
                );
            }
        }

        unlink() {
            super.unlink();
            this._attributesInspector.unlink();

            for (const key in this._slotInspectors) {
                this._slotInspectors[key].destroy();
            }
            this._slotInspectors = {};

            this._btnAddSlot.hidden = true;
        }
    }

    class SoundSlotInspector extends pcui.Panel {
        constructor(args) {
            args = Object.assign({
                headerText: args.slot.name || 'New Slot',
                collapsible: true
            }, args);

            super(args);

            this.class.add(CLASS_SLOT);

            this._entities = null;
            this._slotEvents = [];

            this._templateOverridesSidebar = args.templateOverridesSidebar;

            this._slotKey = args.slotKey;

            this._attrs = utils.deepCopy(SLOT_ATTRIBUTES);
            // replace '$' with the actual slot key
            this._attrs.forEach(attr => {
                attr.path = attr.path.replace('$', args.slotKey);
            });

            this._inspector = new pcui.AttributesInspector({
                attributes: this._attrs,
                assets: args.assets,
                history: args.history,
                templateOverridesSidebar: this._templateOverridesSidebar
            });

            this.append(this._inspector);

            if (this._templateOverridesSidebar) {
                this._templateOverridesSidebar.registerElementForPath(`components.sound.slots.${this._slotKey}`, this.dom);
            }

            const fieldName = this._inspector.getField(this._getPathTo('name'));
            fieldName.on('change', value => {
                this.headerText = value;
            });
        }

        _getPathTo(field) {
            return `components.sound.slots.${this._slotKey}.${field}`;
        }

        _onClickRemove(evt) {
            super._onClickRemove(evt);
            if (this._entities && this._entities.length) {
                this._entities[0].unset(`components.sound.slots.${this._slotKey}`);
            }
        }

        link(entities) {
            this.unlink();

            this._entities = entities;

            this._inspector.link(entities);

            const fieldName = this._inspector.getField(this._getPathTo('name'));

            // if the name already exists show error
            fieldName.onValidate = (value) => {
                if (!value) return false;

                const slots = entities[0].get('components.sound.slots');
                for (const key in slots) {
                    if (slots[key].name === value) {
                        return false;
                    }
                }

                return true;
            };
        }

        unlink() {
            if (!this._entities) return;

            this._entities = null;

            this._slotEvents.forEach(e => e.unbind());
            this._slotEvents.length = 0;

            this._inspector.unlink();
        }

        destroy() {
            if (this._destroyed) return;

            if (this._templateOverridesSidebar) {
                this._templateOverridesSidebar.unregisterElementForPath(`components.sound.slots.${this._slotKey}`);
            }

            super.destroy();
        }
    }

    return {
        SoundComponentInspector: SoundComponentInspector
    };
})());



/* editor/inspector/components/zone.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [{
        label: 'Size',
        path: 'components.zone.size',
        type: 'vec3',
        args: {
            precision: 2,
            step: 0.1,
            min: 0,
            placeholder: ['W', 'H', 'D']
        }
    }];

    class ZoneComponentInspector extends pcui.ComponentInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.component = 'zone';

            super(args);

            this._attributesInspector = new pcui.AttributesInspector({
                assets: args.assets,
                history: args.history,
                attributes: ATTRIBUTES,
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);
        }

        link(entities) {
            super.link(entities);
            this._attributesInspector.link(entities);
        }

        unlink() {
            super.unlink();
            this._attributesInspector.unlink();
        }
    }

    return {
        ZoneComponentInspector: ZoneComponentInspector
    };
})());




