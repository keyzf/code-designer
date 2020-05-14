
/* editor/inspector/settings-panels/rendering.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'rendering-settings-panel';
    const CLASS_DIVIDER = CLASS_ROOT + '-divider';

    const ATTRIBUTES = [
        {
            observer: 'sceneSettings',
            label: 'Ambient Color',
            path: 'render.global_ambient',
            alias: 'ambientColor',
            type: 'rgb'
        },
        {
            observer: 'sceneSettings',
            label: 'Skybox',
            path: 'render.skybox',
            type: 'asset',
            args: {
                assetType: 'cubemap'
            }
        },
        {
            observer: 'sceneSettings',
            label: 'Intensity',
            path: 'render.skyboxIntensity',
            type: 'slider',
            args: {
                min: 0,
                max: 8
            }
        },
        {
            observer: 'sceneSettings',
            label: 'Mip',
            path: 'render.skyboxMip',
            type: 'select',
            args: {
                type: 'number',
                options: [
                    {
                        v: 0,
                        t: '1'
                    },
                    {
                        v: 1,
                        t: '2'
                    },
                    {
                        v: 2,
                        t: '3'
                    },
                    {
                        v: 3,
                        t: '4'
                    },
                    {
                        v: 4,
                        t: '5'
                    }
                ]
            }
        },
        {
            type: 'divider'
        },
        {
            observer: 'sceneSettings',
            label: 'Tonemapping',
            alias: 'toneMapping',
            path: 'render.tonemapping',
            type: 'select',
            args: {
                type: 'number',
                options: [
                    {
                        v: 0,
                        t: 'Linear'
                    },
                    {
                        v: 1,
                        t: 'Filmic'
                    },
                    {
                        v: 2,
                        t: 'Hejl'
                    },
                    {
                        v: 3,
                        t: 'ACES'
                    }
                ]
            }
        },

        {
            observer: 'sceneSettings',
            label: 'Responsive',
            alias: 'responsive',
            path: 'render.responsive',
            type: 'select',
            args: {
                type: 'string',
                options: [
                    {
                        v: "",
                        t: 'auto'
                    },
                    {
                        v: "375x667",
                        t: 'iPhone6 7 8'
                    },
                    {
                        v: "414x768",
                        t: 'iPhone6 7 8 Plus'
                    },
                    {
                        v: "375x812",
                        t: 'iPhoneX'
                    },
                    {
                        v: "768x1024",
                        t: 'iPad'
                    }
                ]
            }
        },

        {
            observer: 'sceneSettings',
            label: 'Exposure',
            path: 'render.exposure',
            type: 'slider',
            args: {
                min: 0,
                max: 8
            }
        },
        {
            observer: 'sceneSettings',
            label: 'Gamma',
            alias: 'gammaCorrection',
            path: 'render.gamma_correction',
            type: 'select',
            args: {
                type: 'number',
                options: [
                    {
                        v: 0,
                        t: '1.0'
                    },
                    {
                        v: 1,
                        t: '2.2'
                    }
                ]
            }
        },
        {
            type: 'divider'
        },
        {
            observer: 'sceneSettings',
            label: 'Fog',
            path: 'render.fog',
            type: 'select',
            args: {
                type: 'string',
                options: [
                    {
                        v: 'none',
                        t: 'None'
                    },
                    {
                        v: 'linear',
                        t: 'Linear'
                    },
                    {
                        v: 'exp',
                        t: 'Exponential'
                    },
                    {
                        v: 'exp2',
                        t: 'Exponential Squared'
                    }
                ]
            }
        },
        {
            observer: 'sceneSettings',
            label: 'Distance Start',
            alias: 'fogDistance',
            path: 'render.fog_start',
            type: 'number',
            args: {
                min: 0
            }
        },
        {
            observer: 'sceneSettings',
            label: 'Distance End',
            alias: 'fogDistance',
            path: 'render.fog_end',
            type: 'number',
            args: {
                min: 0
            }
        },
        {
            observer: 'sceneSettings',
            label: 'Density',
            alias: 'fogDensity',
            path: 'render.fog_density',
            type: 'number',
            args: {
                min: 0
            }
        },
        {
            observer: 'sceneSettings',
            label: 'Color',
            alias: 'fogColor',
            path: 'render.fog_color',
            type: 'rgb'
        },
        {
            type: 'divider'
        },
        {
            observer: 'projectSettings',
            label: 'Resolution Width',
            path: 'width',
            type: 'number',
            args: {
                min: 1
            }
        },
        {
            observer: 'projectSettings',
            label: 'Resolution Height',
            paths: 'height',
            type: 'number',
            args: {
                min: 1
            }
        },
        {
            observer: 'projectSettings',
            label: 'Resolution Mode',
            path: 'resolutionMode',
            alias: 'project:resolutionMode',
            type: 'select',
            args: {
                type: 'string',
                options: [
                    {
                        v: 'AUTO',
                        t: 'Auto'
                    },
                    {
                        v: 'FIXED',
                        t: 'Fixed'
                    }
                ]
            }
        },
        {
            observer: 'projectSettings',
            label: 'Fill Mode',
            path: 'fillMode',
            alias: 'project:fillMode',
            type: 'select',
            args: {
                type: 'string',
                options: [
                    {
                        v: 'NONE',
                        t: 'None'
                    },
                    {
                        v: 'KEEP_ASPECT',
                        t: 'Keep aspect ratio'
                    },
                    {
                        v: 'FILL_WINDOW',
                        t: 'Fill window'
                    }
                ]
            }
        },
        {
            observer: 'projectSettings',
            label: 'Prefer WebGL 2.0',
            type: 'boolean',
            alias: 'project:preferWebGl2',
            path: 'preferWebGl2'
        },
        {
            observer: 'projectSettings',
            label: 'Anti-Alias',
            type: 'boolean',
            alias: 'project:antiAlias',
            path: 'antiAlias'
        },
        {
            observer: 'projectSettings',
            label: 'Device Pixel Ratio',
            type: 'boolean',
            alias: 'project:pixelRatio',
            path: 'useDevicePixelRatio'
        },
        {
            observer: 'projectSettings',
            label: 'Transparent Canvas',
            type: 'boolean',
            alias: 'project:transparentCanvas',
            path: 'transparentCanvas'
        },
        {
            observer: 'projectSettings',
            label: 'Preserve Drawing Buffer',
            type: 'boolean',
            alias: 'project:preserveDrawingBuffer',
            path: 'preserveDrawingBuffer'
        },
        {
            type: 'divider'
        },
        {
            label: 'Basis Library',
            alias: 'basis',
            type: 'button',
            args: {
                text: 'IMPORT BASIS',
                icon: 'E228'
            }
        }
    ];

    class RenderingSettingsPanel extends pcui.BaseSettingsPanel {
        constructor(args) {
            args = Object.assign({}, args);
            args.headerText = 'RENDERING';
            args.attributes = ATTRIBUTES;

            super(args);
            const fogAttribute = this._attributesInspector.getField('render.fog');
            const fogChangeEvt = fogAttribute.on('change', value => {
                switch (value) {
                    case 'none':
                        this._attributesInspector.getField('render.fog_start').parent.hidden = true;
                        this._attributesInspector.getField('render.fog_end').parent.hidden = true;
                        this._attributesInspector.getField('render.fog_density').parent.hidden = true;
                        this._attributesInspector.getField('render.fog_color').parent.hidden = true;
                        break;
                    case 'linear':
                        this._attributesInspector.getField('render.fog_start').parent.hidden = false;
                        this._attributesInspector.getField('render.fog_end').parent.hidden = false;
                        this._attributesInspector.getField('render.fog_density').parent.hidden = true;
                        this._attributesInspector.getField('render.fog_color').parent.hidden = false;
                        break;
                    case 'exp':
                        this._attributesInspector.getField('render.fog_start').parent.hidden = true;
                        this._attributesInspector.getField('render.fog_end').parent.hidden = true;
                        this._attributesInspector.getField('render.fog_density').parent.hidden = false;
                        this._attributesInspector.getField('render.fog_color').parent.hidden = false;
                        break;
                    case 'exp2':
                        this._attributesInspector.getField('render.fog_start').parent.hidden = true;
                        this._attributesInspector.getField('render.fog_end').parent.hidden = true;
                        this._attributesInspector.getField('render.fog_density').parent.hidden = false;
                        this._attributesInspector.getField('render.fog_color').parent.hidden = false;
                        break;
                    default:
                        break;
                }
            });
            this.once('destroy', () => {
                fogChangeEvt.unbind();
            });


            if (editor.call('users:hasFlag', 'hasBasisTextures')) {
                const clickBasisEvt = this._attributesInspector.getField('basis').on('click', () => {
                    editor.call('project:module:addModule', 'basis.js', 'basis');
                });
                this.once('destroy', () => {
                    clickBasisEvt.unbind();
                });
            } else {
                this._attributesInspector.getField('basis').parent.hidden = true;
            }
        }
    }

    return {
        RenderingSettingsPanel: RenderingSettingsPanel
    };
})());