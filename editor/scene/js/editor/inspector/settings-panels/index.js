

/* editor/inspector/settings-panels/loading-screen.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'settings-loading-screen';
    const CLASS_FEATURE_LOCKED = CLASS_ROOT + '-feature-locked';

    const ATTRIBUTES = [
        {
            observer: 'projectSettings',
            label: 'Script',
            type: 'asset',
            alias: 'loadingScreenScript'
        }
    ];

    const DOM = () => [
        {
            root: {
                buttonContainer: new pcui.Container({
                    flex: true,
                    flexDirection: 'row'
                })
            },
            children: [
                {
                    createDefaultButton: new pcui.Button({
                        text: 'CREATE DEFAULT',
                        icon: 'E120',
                        flexGrow: 1
                    })
                },
                {
                    selectExistingButton: new pcui.Button({
                        text: 'SELECT EXISTING',
                        icon: 'E184',
                        flexGrow: 1
                    })
                }
            ]
        },
        {
            featureLockedLabel: new pcui.Label({
                text: `This is an ORGANIZATION account feature. <a href="/upgrade?plan=organization&account=${config.owner.username}" target="_blank">UPGRADE</a> to create custom loading screens.`,
                unsafe: true,
                class: CLASS_FEATURE_LOCKED
            })
        }
    ];

    class LoadingscreenSettingsPanel extends pcui.BaseSettingsPanel {
        constructor(args) {
            args = Object.assign({}, args);
            args.headerText = 'LOADING SCREEN';
            args.attributes = ATTRIBUTES;

            super(args);

            this.buildDom(DOM());

            const selectExistingEvt = this._selectExistingButton.on('click', this._clickSelectExisting.bind(this));
            const createDefaultEvt = this._createDefaultButton.on('click', this._clickCreateDefault.bind(this));
            const updateAssetEvt = this._attributesInspector.getField('loadingScreenScript').on('change', value => {
                if (this._projectSettings) {
                    this._projectSettings.set('loadingScreenScript', value ? value.toString() : null);
                }
            });


            this._selectExistingTooltip = Tooltip.attach({
                target: this._selectExistingButton.element,
                text: 'Select an existing loading screen script',
                align: 'bottom',
                root: editor.call('layout.root')
            });

            this._createDefaultTooltip = Tooltip.attach({
                target: this._createDefaultButton.element,
                text: 'Create a default loading script',
                align: 'bottom',
                root: editor.call('layout.root')
            });

            editor.once('assets:load', () => {
                this._loadLayout();
            });
            this._projectSettings.on('*:set', path => {
                if (path === 'loadingScreenScript') {
                    this._loadLayout();
                }
            });
        }

        _loadLayout() {
            if (!editor.call("users:isSuperUser") && config.owner.plan.type !== 'org' && config.owner.plan.type !== 'organization') {
                this._featureLockedLabel.hidden = false;
                this._attributesInspector.destroy();
                this._buttonContainer.destroy();
                return;
            }

            this._featureLockedLabel.hidden = true;

            const scriptId = this._projectSettings.get('loadingScreenScript');
            const asset = this._args.assets.get(scriptId);
            if (scriptId && asset) {
                this._attributesInspector.getField('loadingScreenScript').hidden = false;
                this._buttonContainer.hidden = true;
                this._attributesInspector.getField('loadingScreenScript').value = scriptId;
            } else {
                this._attributesInspector.getField('loadingScreenScript').hidden = true;
                this._buttonContainer.hidden = false;
            }
        }

        _setLoadingScreen(asset) {
            const id = asset && asset.get ? asset.get('id') : null;
            if (id) {
                this._projectSettings.set('loadingScreenScript', id.toString());
            }
        }

        _clickSelectExisting() {
            let evtPick = editor.once("picker:asset", (asset) => {
                this._setLoadingScreen(asset);
                evtPick = null;
            });
            // show asset picker
            editor.call("picker:asset", { type: "script" });
            editor.once('picker:asset:close', () => {
                if (evtPick) {
                    evtPick.unbind();
                    evtPick = null;
                }
            });
        }

        _clickCreateDefault() {
            editor.call('picker:script-create', (filename) => {
                editor.call('assets:create:script', {
                    filename,
                    content: editor.call('sourcefiles:loadingScreen:skeleton'),
                    callback: (_, asset) => {
                        this._setLoadingScreen(asset);
                    }
                });
            });
        }
    }

    return {
        LoadingscreenSettingsPanel: LoadingscreenSettingsPanel
    };
})());


/* editor/inspector/settings-panels/external-scripts.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [
        {
            observer: 'projectSettings',
            label: 'URLs',
            type: 'array:select',
            path: 'externalScripts',
            alias: 'project.externalScripts',
            args: {
                type: 'string',
                elementArgs: {
                    placeholder: 'URL'
                }
            }
        }
    ];

    class ExternalscriptsSettingsPanel extends pcui.BaseSettingsPanel {
        constructor(args) {
            args = Object.assign({}, args);
            args.headerText = 'EXTERNAL SCRIPTS';
            args.attributes = ATTRIBUTES;
            args.splitReferencePath = false;

            super(args);
        }
    }

    return {
        ExternalscriptsSettingsPanel: ExternalscriptsSettingsPanel
    };
})());


/* editor/inspector/settings-panels/input.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [
        {
            observer: 'projectSettings',
            label: 'Keyboard',
            type: 'boolean',
            alias: 'project.useKeyboard',
            path: 'useKeyboard'
        },
        {
            observer: 'projectSettings',
            label: 'Mouse',
            type: 'boolean',
            alias: 'project.useMouse',
            path: 'useMouse'
        },
        {
            observer: 'projectSettings',
            label: 'Touch',
            type: 'boolean',
            alias: 'project.useTouch',
            path: 'useTouch'
        },
        {
            observer: 'projectSettings',
            label: 'Gamepads',
            type: 'boolean',
            alias: 'project.useGamepads',
            path: 'useGamepads'
        }
    ];

    class InputSettingsPanel extends pcui.BaseSettingsPanel {
        constructor(args) {
            args = Object.assign({}, args);
            args.headerText = 'INPUT';
            args.attributes = ATTRIBUTES;
            args.splitReferencePath = false;

            super(args);
        }
    }

    return {
        InputSettingsPanel: InputSettingsPanel
    };
})());


/* editor/inspector/settings-panels/localization.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [
        {
            observer: 'projectSettings',
            label: 'Assets',
            type: 'assets',
            path: 'i18nAssets',
            alias: 'localization.i18nAssets',
            args: {
                assetType: 'json'
            }
        },
        {
            label: '',
            type: 'button',
            alias: 'createAsset',
            args: {
                text: 'CREATE NEW ASSET',
                icon: 'E120'
            }
        }
    ];

    class LocalizationSettingsPanel extends pcui.BaseSettingsPanel {
        constructor(args) {
            args = Object.assign({}, args);
            args.headerText = 'LOCALIZATION';
            args.attributes = ATTRIBUTES;
            args.splitReferencePath = false;

            super(args);

            const createNewAssetEvt = this._attributesInspector.getField('createAsset').on('click', () => {
                editor.call('assets:create:i18n');
            });

            this.once('destroy', () => {
                createNewAssetEvt.unbind();
            });

        }

        link(observers) {
            super.link(observers);
            if (!this._createAssetTooltip)
                this._createAssetTooltip = editor.call('attributes:reference:attach', 'settings:localization:createAsset', this._attributesInspector.getField('createAsset'));
        }
    }

    return {
        LocalizationSettingsPanel: LocalizationSettingsPanel
    };
})());


/* editor/inspector/settings-panels/asset-tasks.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'asset-tasks-settings-panel';
    const CLASS_SECTION = CLASS_ROOT + '-section';
    const CLASS_ATTRIBUTES = CLASS_ROOT + '-attributes';

    const ATTRIBUTES = [
        {
            observer: 'settings',
            label: 'Search related assets',
            type: 'boolean',
            alias: 'asset-tasks:searchRelatedAssets',
            path: 'editor.pipeline.searchRelatedAssets'
        },
        {
            observer: 'settings',
            label: 'Textures POT',
            type: 'boolean',
            alias: 'asset-tasks:texturePot',
            path: 'editor.pipeline.texturePot'
        },
        {
            observer: 'settings',
            label: 'Create Atlases',
            type: 'boolean',
            alias: 'asset-tasks:textureDefaultToAtlas',
            path: 'editor.pipeline.textureDefaultToAtlas'
        },
        {
            observer: 'settings',
            label: 'Preserve material mappings',
            type: 'boolean',
            alias: 'asset-tasks:preserveMapping',
            path: 'editor.pipeline.preserveMapping'
        },
        {
            observer: 'settings',
            label: 'Force legacy model v2',
            type: 'boolean',
            alias: 'asset-tasks:useModelV2',
            path: 'useModelV2'
        },
        {
            observer: 'settings',
            label: 'Ovewrite Models',
            type: 'boolean',
            alias: 'asset-tasks:overwrite.model',
            path: 'editor.pipeline.overwriteModel'
        },
        {
            observer: 'settings',
            label: 'Overwrite Animations',
            type: 'boolean',
            alias: 'asset-tasks:overwrite.animation',
            path: 'editor.pipeline.overwriteAnimation'
        },
        {
            observer: 'settings',
            label: 'Overwrite Materials',
            type: 'boolean',
            alias: 'asset-tasks:overwrite.material',
            path: 'editor.pipeline.overwriteMaterial'
        },
        {
            observer: 'settings',
            label: 'Overwrite Textures',
            type: 'boolean',
            alias: 'asset-tasks:overwrite.texture',
            path: 'editor.pipeline.overwriteTexture'
        }
    ];

    class AssettasksSettingsPanel extends pcui.BaseSettingsPanel {
        constructor(args) {
            args = Object.assign({}, args);
            args.headerText = 'ASSET TASKS';
            args.attributes = ATTRIBUTES;
            args.splitReferencePath = false;

            super(args);

            this._attributesInspector.class.add(CLASS_ATTRIBUTES);

            // add sections
            this._appendSection('Texture Import Settings', this._attributesInspector.getField('editor.pipeline.searchRelatedAssets'));
            this._appendSection('Model Import Settings', this._attributesInspector.getField('editor.pipeline.textureDefaultToAtlas'));

            // reference
            this._panelTooltip = editor.call('attributes:reference:attach', 'settings:asset-tasks', this.header, this.header.dom);
        }

        _appendSection(title, attributeElement) {
            const section = new pcui.Panel({ headerText: title, class: CLASS_SECTION });
            attributeElement.parent.parent.appendAfter(section, attributeElement.parent);
        }
    }

    return {
        AssettasksSettingsPanel: AssettasksSettingsPanel
    };
})());


/* editor/inspector/settings-panels/scripts.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'scripts-settings-panel';
    const CLASS_SCRIPTS_LIST = CLASS_ROOT + '-scripts-list';
    const CLASS_SCRIPTS_LIST_CONTAINER = CLASS_SCRIPTS_LIST + '-container';
    const CLASS_SCRIPTS_LIST_ITEM = CLASS_SCRIPTS_LIST + '-item';

    class ScriptsSettingsPanel extends pcui.BaseSettingsPanel {
        constructor(args) {
            
            args = Object.assign({}, args);
            args.headerText = 'SCRIPTS LOADING ORDER';

            super(args);
            this._args = args;

            this._scriptList = [];
            this._scriptEvents = [];
            this._scriptListContainer = new pcui.Container({
                class: CLASS_SCRIPTS_LIST_CONTAINER
            });
            this.append(this._scriptListContainer);

            this._assetEvents = [];

            const dragEndEvt = this._scriptListContainer.on('child:dragend', (_, newIndex, oldIndex) => {
                
                this._projectSettings.move('scripts', oldIndex, newIndex);
            });
            editor.once('assets:load', () => {
                this._loadedInitialScripts = true;
                this._updateScriptList();
                const events = ['*:set', '*:unset', 'scripts:remove', 'scripts:move', 'scripts:insert'];
                events.forEach(evt => {
                    this._scriptEvents.push(this._projectSettings.on(evt, () => {
                        
                        
                        this._clearScriptList();
                        this._updateScriptList();

                    }));
                });
            });

            this.on('show', () => {
                this._clearScriptList();
                this._updateScriptList();
            });

            this.once('destroy', () => {
                dragEndEvt.unbind();
            });
        }


        _updateScriptList() {
            const scripts = this._projectSettings.get('scripts');
            const assets = this._args.assets;

            scripts.forEach((script, i) => {
                const asset = assets.get(script);

                const scriptPanel = new pcui.Panel({
                    headerText: asset ? asset.get('name') : script,
                    sortable: true,
                    class: CLASS_SCRIPTS_LIST_ITEM
                });

                // there is a chance that the asset hasn't been added yet
                // due to network delays. In that case when the asset is added
                // update the name
                if (!asset) {
                    this._assetEvents.push(editor.once(`assets:add[${script}]`, asset => {
                        this._assetEvents.push(asset.on('name:set', (name) => {
                            scriptPanel.headerText = name;
                        }));
                        scriptPanel.headerText = asset.get('name');
                    }));
                } else {
                    this._assetEvents.push(asset.on('name:set', (name) => {
                        scriptPanel.headerText = name;
                    }));
                }

                scriptPanel.header.append(new pcui.Label({ text: `#${i + 1}` }));
                this._scriptEvents.push(scriptPanel.on('click', () => {
                    const asset = assets.get(script);
                    if (asset) {
                        editor.call('selector:set', 'asset', [asset]);
                    }
                }));
                this._scriptList.push(scriptPanel);
                this._scriptListContainer.append(scriptPanel);
            });
        }


        _clearScriptList() {
            this._assetEvents.forEach(evt => evt.unbind());
            this._assetEvents.length = 0;

            this._scriptList.forEach(scriptPanel => {
                this._scriptListContainer.remove(scriptPanel);
                scriptPanel.destroy();
            });
            this._scriptList = [];
        }
    }

    return {
        ScriptsSettingsPanel: ScriptsSettingsPanel
    };
})());