Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'keyframe-inspector';


    const ATTRIBUTES = [{
        label: 'Index',
        alias: 'Index',
        path: '_Index',
        type: 'label'
    }, {
        label: 'Name',
        path: '_Name',
        type: 'label'
    }, {
        label: 'Enabled',
        path: '_Enabled',
        alias: 'Enabled',
        type: 'boolean'
    }, {
        label: 'ResultMode',
        alias: 'ResultMode',
        path: '_ResultMode',
        type: 'select',
        args: {
            type: 'number',
            options: [
                { v: 0, t: 'Default' },
                { v: 1, t: 'Linear' },
            ]
        }
    }, {
        label: 'Value',
        path: '_Value',
        type: 'string'
    }, {
        label: 'Time',
        path: '_Step',
        type: 'number',
        args: {
            type: 'number',
            placeholder: 's'
        }
    }, {
        label: 'Ease',
        path: '_Ease',
        type: 'select',
        reference: 'asset:script:Ease',
        args: {
            type: 'number',
            options: [
                { v: 0, t: 'Default' },
                { v: 1, t: 'Linear' },
            ]
        }
    }, {
        label: 'PathMode',
        path: '_PathMode',
        type: 'select',
        reference: 'asset:script:PathMode',
        args: {
            type: 'number',
            options: [
                { v: 0, t: 'Default' },
                { v: 1, t: 'Line' },
                { v: 2, t: 'Cubic Bezier' }
            ]
        }
    }];

    ATTRIBUTES.forEach(attr => {
        const parts = attr.path.split('.');
        attr.reference = `keyframe:${parts[parts.length - 1]}`;
    });
    
    class KeyframeInspector extends pcui.Container {
        constructor(args) {
            if (!args) args = {};
            args.flex = true;

            super(args);

            this.class.add(CLASS_ROOT);

            this._projectSettings = args.projectSettings;
            
            this._editableTypes = args.editableTypes;
            this._attributesInspector = new pcui.AttributesInspector({
                history: args.history,
                attributes: ATTRIBUTES,
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);

            this._keyframesEvents = [];
        }

        link(keyframes) {
            this.unlink();

            if (!keyframes || !keyframes.length) return;

            this._keyframes = keyframes;

            this._attributesInspector.link(keyframes);

         
           // this._attributesInspector.getField('source_asset_id').class.add('pcui-selectable');

            this.hidden = false;
        }

        unlink() {
            super.unlink();

            if (!this._keyframes) return;

            this._keyframesEvents.forEach(evt => evt.unbind());
            this._keyframesEvents.length = 0;

            this._keyframes = null;

            this._attributesInspector.unlink();

        }
    }

    return {
        KeyframeInspector: KeyframeInspector
    };
})());