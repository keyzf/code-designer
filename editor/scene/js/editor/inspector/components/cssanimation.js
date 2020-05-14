// ditor/inspector/components/css.js
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [{
        label: 'Assets',
        path: 'components.cssanimation.assets',
        type: 'assets',
        args: {
            assetType: 'anim'
        }
    }, {
        label: 'Speed',
        path: 'components.cssanimation.speed',
        type: 'slider',
        args: {
            precision: 3,
            step: 0.1,
            sliderMin: -2,
            sliderMax: 2
        }
    }, {
        label: 'Activate',
        path: 'components.cssanimation.activate',
        type: 'boolean'
    }, {
        label: 'Loop',
        path: 'components.cssanimation.loop',
        type: 'boolean'
    }];

    ATTRIBUTES.forEach(attr => {
        const parts = attr.path.split('.');
        attr.reference = `animation:${parts[parts.length - 1]}`;
    });

    const ANIMATION_ATTRIBUTES = [{
        label: 'animationAssets',
        path: 'components.cssanimation.cssAnimations',
        type: 'assets',
        args: {
            assetType: 'anim'
        }
    }];

    ANIMATION_ATTRIBUTES.forEach(attr => {
        if (!attr.path) return;
        const parts = attr.path.split('.');
        attr.reference = `cssAnimations:${parts[parts.length - 1]}`;
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