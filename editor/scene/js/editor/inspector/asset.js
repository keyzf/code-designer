/* editor/inspector/asset.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'asset-inspector';

    const ATTRIBUTES = [{
        label: 'ID',
        alias: 'id',
        path: 'id',
        type: 'label'
    }, {
        label: 'Assets',
        path: 'assets',
        type: 'label'
    }, {
        label: 'Name',
        path: 'name',
        type: 'string'
    }, {
        label: 'Tags',
        alias: 'tags',
        path: 'tags',
        type: 'tags',
        args: {
            type: 'string',
            placeholder: 'Add Tags'
        }
    }, {
        label: 'Runtime',
        alias: 'source',
        type: 'label'
    }, {
        label: 'Type',
        alias: 'type',
        type: 'label',
        args: {
            renderChanges: false
        }
    }, {
        label: 'Preload',
        path: 'preload',
        alias: 'preload',
        type: 'boolean'
    }, {
        label: 'Loading Order',
        alias: 'loadingOrder',
        type: 'button',
        reference: 'asset:script:order',
        args: {
            text: 'MANAGE'
        }
    }, {
        label: 'Loading Type',
        path: 'data.loadingType',
        type: 'select',
        reference: 'asset:script:loadingType',
        args: {
            type: 'number',
            options: [{
                    v: LOAD_SCRIPT_AS_ASSET,
                    t: 'Asset'
                },
                {
                    v: LOAD_SCRIPT_BEFORE_ENGINE,
                    t: 'Before Engine'
                },
                {
                    v: LOAD_SCRIPT_AFTER_ENGINE,
                    t: 'After Engine'
                }
            ]
        }
    }, {
        label: 'Size',
        alias: 'size',
        type: 'label',
        args: {
            renderChanges: false
        }
    }, {
        label: 'Source',
        alias: 'source_asset_id',
        type: 'label',
        args: {
            renderChanges: false
        }
    }];

    ATTRIBUTES.forEach(attr => {
        if (attr.reference) return;

        const path = attr.alias || attr.path;
        if (!path) return;
        const parts = path.split('.');
        attr.reference = `asset:${parts[parts.length - 1]}`;
    });

    // Hide fields based on current asset type
    const HIDDEN_FIELDS = {
        'tags': [
            'folder',
            'scene.source',
            'texture.source',
            'font.source'
        ],
        'source_asset_id': [
            'folder',
            'scene.source',
            'texture.source',
            'font.source'
        ],
        'preload': [
            'folder',
            'scene.source',
            'texture.source',
            'font.source'
        ],
        'assets': [
            'single'
        ],
        'id': [
            'multi'
        ],
        'name': [
            'multi'
        ]
    };

    class AssetInspector extends pcui.Container {
        constructor(args) {
            if (!args) args = {};
            args.flex = true;

            super(args);

            this.class.add(CLASS_ROOT);

            this._projectSettings = args.projectSettings;

            this._editableTypes = args.editableTypes;

            this._assetTypes = editor.call('schema:assets:list');

            this._attributesInspector = new pcui.AttributesInspector({
                history: args.history,
                attributes: ATTRIBUTES
            });
            this.append(this._attributesInspector);

            this._btnContainer = new pcui.Container({
                flex: true,
                flexDirection: 'row'
            });
            this.append(this._btnContainer);

            // add download button
            this._btnDownloadAsset = new pcui.Button({
                text: 'DOWNLOAD',
                icon: 'E228',
                ignoreParent: true
            });
            this._btnDownloadAsset.style.flex = 1;

            this._btnDownloadAsset.hidden = !editor.call('permissions:read');
            const evtBtnDownloadPermissions = editor.on('permissions:set:' + config.self.id, () => {
                this._btnDownloadAsset.hidden = !editor.call('permissions:read');
            });
            this._btnDownloadAsset.once('destroy', () => {
                evtBtnDownloadPermissions.unbind();
            });
            this._btnContainer.append(this._btnDownloadAsset);

            this._btnDownloadAsset.on('click', this._onClickDownloadAsset.bind(this));

            // add edit button

            this._btnEditAsset = new pcui.Button({
                text: editor.call('permissions:write') ? 'EDIT' : 'VIEW',
                icon: 'E130',
                ignoreParent: true
            });
            this._btnEditAsset.style.flex = 1;
            const evtBtnEditPermissions = editor.on('permissions:writeState', (state) => {
                this._btnEditAsset.text = state ? 'EDIT' : 'VIEW';
            });
            this._btnEditAsset.once('destroy', () => {
                evtBtnEditPermissions.unbind();
            });
            this._btnEditAsset.on('click', this._onClickEditAsset.bind(this));
            this._btnContainer.append(this._btnEditAsset);

            // add edit button
            this._btnEditSprite = new pcui.Button({
                text: 'SPRITE EDITOR',
                icon: 'E395'
            });
            this._btnEditSprite.style.flex = 1;
            this._btnEditSprite.on('click', this._onClickEditSprite.bind(this));
            this._btnContainer.append(this._btnEditSprite);




            this._btnEditTimeline = new pcui.Button({
                text: 'Timeline EDITOR',
                icon: 'E395'
            });
            this._btnEditTimeline.style.flex = 1;
            this._btnEditTimeline.on('click', this._onClickEditTimeline.bind(this));
            this._btnContainer.append(this._btnEditTimeline);



            this._attributesInspector.getField('loadingOrder').on('click', this._onClickLoadingOrder.bind(this));

            // one way binding from observers to element for name field
            // because the other way is handled by calling assets:rename
            this._attributesInspector.getField('name').binding = new pcui.BindingObserversToElement({
                history: args.history
            });

            // add typed asset inspectors
            this._typedAssetInspectors = [];
            this._typedAssetPreviews = [];


            this._assetTypes.forEach(assetType => {
                // check if class exists
                const cls = `${assetType[0].toUpperCase()}${assetType.substring(1)}AssetInspector`;
                if (pcui.hasOwnProperty(cls)) {
                    const inspector = new pcui[cls]({
                        hidden: true,
                        assets: args.assets,
                        projectSettings: args.projectSettings,
                        history: args.history
                    });

                    this._typedAssetInspectors[assetType] = inspector;

                    this.append(inspector);
                }
                const clsSource = `${assetType[0].toUpperCase()}${assetType.substring(1)}SourceAssetInspector`;
                if (pcui.hasOwnProperty(clsSource)) {
                    const inspector = new pcui[clsSource]({
                        hidden: true,
                        assets: args.assets,
                        projectSettings: args.projectSettings,
                        history: args.history
                    });

                    this._typedAssetInspectors[`${assetType}-source`] = inspector;

                    this.append(inspector);
                }
                const clsPreview = `${assetType[0].toUpperCase()}${assetType.substring(1)}AssetInspectorPreview`;
                if (pcui.hasOwnProperty(clsPreview)) {
                    const inspector = new pcui[clsPreview]({
                        hidden: true,
                        assets: args.assets,
                        projectSettings: args.projectSettings,
                        history: args.history
                    });

                    this._typedAssetPreviews[assetType] = inspector;

                    this.prepend(inspector);
                }
            });

            this._assetsList = args.assets;
            this._assets = null;
            this._assetEvents = [];
        }

        _onClickDownloadAsset(evt) {
            /**下载 */
            debugger
            // const legacyScripts = this._projectSettings.get('useLegacyScripts');
            if (this._assets[0].get('type') !== 'folder' && this._assets[0].get('type') !== 'sprite') {

                if (this._assets[0].get('source') || this._assets[0].get('type') === 'texture' || this._assets[0].get('type') === 'audio') {

                    if (this._assets[0].get('type') === 'template') {


                        var _self = this;
                        let a = new FileReader();
                        a.onload = function (e) {
                            var link = document.createElement('A');
                            var downloadname = _self._assets[0].get('name')
                            if (!downloadname.endsWith(".template")) {
                                downloadname += ".template";
                            }
                            link.download = downloadname;
                            link.href = e.target.result;
                            link.click();
                        };
                        a.readAsDataURL(new Blob([JSON.stringify(this._assets[0].get('data'))], {
                            type: 'application/json'
                        }));

                        return;
                    }

debugger
                    if (this._assets[0].get('type') === 'animation') {
                        var _self = this;
                        var link = document.createElement('A');
                        var downloadname = _self._assets[0].get('name')
                        if (!downloadname.endsWith(".anim")) {
                            downloadname += ".anim";
                        }
                        link.download = downloadname;
                        link.href = this._assets[0].get('file.url');
                        link.click();

                        return;
                    }
                    window.open(this._assets[0].get('file.url'));
                } else {

                    var a = document.createElement('A');
                    var downloadname = this._assets[0].get('name');
                    if (this._assets[0].get('type') === 'animation') {                   
                       
                        if (!downloadname.endsWith(".anim")) {
                            downloadname += ".anim";
                        }
                        a.download = downloadname;
                      
                    }else{
                       
                        a.download = downloadname;
                      
                    }
                   
                    a.href = this._assets[0].get('file.url');
                    a.click();
                }
            }
        }

        _onClickEditAsset(evt) {
            editor.call('assets:edit', this._assets[0]);
        }

        _onClickEditSprite(evt) {
            editor.call('picker:sprites', this._assets[0]);
        }

        _onClickEditTimeline(evt) {

            editor.call('picker:timeline', this._assets[0]);
        }

        _onClickSourceAsset(evt) {
            const sourceId = this._assets[0].get('source_asset_id');
            if (!sourceId)
                return;

            const asset = editor.call('assets:get', sourceId);

            if (!asset)
                return;

            editor.call('selector:set', 'asset', [asset]);
        }

        _onClickLoadingOrder() {
            editor.call('selector:set', 'editorSettings', [editor.call('settings:projectUser')]);
            setTimeout(function () {
                editor.call('editorSettings:panel:unfold', 'scripts-order');
            }, 0);
        }

        _updateFileSize(assets) {
            if (!this._assets) return;

            const totalSize = this._assets.map(asset => {
                return asset.has('file.size') ? asset.get('file.size') : 0;
            }).reduce((total, curr) => {
                return total + curr;
            });

            this._attributesInspector.getField('size').values = this._assets.map(asset => {
                return bytesToHuman(totalSize);
            });
        }

        _updateDownloadButtonOnCubemapChange() {
            if (!this._assets || !this._assets[0].get('type') === 'cubemap') return;
            let hasAllCubemapTextures = true;
            this._assets[0].get('data.textures').forEach(texture => {
                if (texture === null) {
                    hasAllCubemapTextures = false;
                }
            });
            if (!hasAllCubemapTextures) {
                this._btnDownloadAsset.disabled = true;
            } else {
                this._btnDownloadAsset.disabled = false;
            }
        }

        updatePreview() {
            Object.keys(this._typedAssetPreviews).forEach(assetPreviewKey => {
                const assetPreview = this._typedAssetPreviews[assetPreviewKey];
                if (!assetPreview.hidden && typeof assetPreview.updatePreview === 'function') {
                    assetPreview.updatePreview();
                }
            });
        }

        _updateAssetName(value) {
            if (value === '') return;
            editor.call('assets:rename', this._assets[0], value);
        }

        link(assets) {
            this.unlink();

            if (!assets || !assets.length) return;

            this._assets = assets;

            this._attributesInspector.link(assets);

            this._attributesInspector.getField('source').values = assets.map(asset => {
                return asset.get('source') ? 'no' : 'yes';
            });
            this._attributesInspector.getField('assets').values = assets.map(asset => {
                return assets.length;
            });
            this._attributesInspector.getField('type').values = assets.map(asset => {
                if (asset.get('type') === 'scene') {
                    return 'source scene';
                }

                return asset.get('type');
            });
            this._updateFileSize();
            assets.forEach(asset => {
                this._assetEvents.push(asset.on('file.size:set', this._updateFileSize.bind(this)));
            });

            this._attributesInspector.getField('source_asset_id').values = assets.map(asset => {
                const sourceAssetId = asset.get('source_asset_id');
                if (!sourceAssetId) return 'none';

                const sourceAsset = this._assetsList.get(sourceAssetId);
                return sourceAsset ? sourceAsset.get('name') : sourceAssetId;
            });

            this._assetTypes.forEach(assetType => {
                // check if class exists
                const cls = `${assetType[0].toUpperCase()}${assetType.substring(1)}AssetInspector`;
                if (pcui.hasOwnProperty(cls)) {
                    let shouldDisplayTypedInspector = true;
                    assets.forEach(asset => {
                        if (asset.get('type') !== assetType.toLowerCase() || asset.get('source')) {
                            shouldDisplayTypedInspector = false;
                        }
                    });
                    if (shouldDisplayTypedInspector) {
                        this._typedAssetInspectors[assetType].link(assets);
                        this._typedAssetInspectors[assetType].hidden = false;
                    } else {
                        this._typedAssetInspectors[assetType].hidden = true;
                    }
                }
                if (assets.length === 1) {
                    const clsSource = `${assetType[0].toUpperCase()}${assetType.substring(1)}SourceAssetInspector`;
                    if (pcui.hasOwnProperty(clsSource)) {
                        let shouldDisplayTypedInspector = true;
                        assets.forEach(asset => {
                            if (asset.get('type') !== assetType.toLowerCase() || !asset.get('source') || !asset.get('type') === 'scene') {
                                shouldDisplayTypedInspector = false;
                            }
                        });
                        if (shouldDisplayTypedInspector) {
                            this._typedAssetInspectors[`${assetType}-source`].link(assets);
                            this._typedAssetInspectors[`${assetType}-source`].hidden = false;
                        } else {
                            this._typedAssetInspectors[`${assetType}-source`].hidden = true;
                        }
                    }
                    const clsPreview = `${assetType[0].toUpperCase()}${assetType.substring(1)}AssetInspectorPreview`;
                    if (pcui.hasOwnProperty(clsPreview)) {
                        let shouldDisplayTypedInspector = true;
                        assets.forEach(asset => {
                            if (asset.get('type') !== assetType.toLowerCase() || asset.get('source')) {
                                shouldDisplayTypedInspector = false;
                            }
                        });
                        if (shouldDisplayTypedInspector) {
                            this._typedAssetPreviews[assetType].link(assets);
                            this._typedAssetPreviews[assetType].hidden = false;
                        } else {
                            this._typedAssetPreviews[assetType].hidden = true;
                        }
                    }
                }
            });

            // Determine if the Edit/View button should be displayed
            this._btnEditAsset.hidden = assets.length > 1 || !this._editableTypes[assets[0].get('type')];

            // Determine if the Download button should be displayed
            this._btnDownloadAsset.hidden = assets.length > 1 || ['folder', 'sprite'].includes(assets[0].get('type'));

            // Determine if the Edit sprite button should be displayed
            this._btnEditSprite.hidden = assets.length > 1 || !['sprite', 'textureatlas'].includes(assets[0].get('type'));


            this._btnEditTimeline.hidden = assets.length > 1 || !['animation'].includes(assets[0].get('type'));


            // Determine if Download button should be disabled
            this._btnDownloadAsset.disabled = false;
            if (assets[0].get('type') === 'cubemap') {
                this._updateDownloadButtonOnCubemapChange.bind(this)();
                for (let ind = 0; ind < 6; ind++) {
                    this._assetEvents.push(assets[0].on('data.textures.' + ind + ':set', this._updateDownloadButtonOnCubemapChange.bind(this)));
                }
            }

            Object.keys(HIDDEN_FIELDS).forEach(attribute => {
                this._toggleAssetField(attribute);
            });
            this._toggleAssetField('loadingOrder');
            this._toggleAssetField('data.loadingType');

            // Set source asset attribute link
            this._assetEvents.push(this._attributesInspector.getField('source_asset_id').on(
                'click',
                this._onClickSourceAsset.bind(this)
            ));
            // Set name in S3 on change
            this._assetEvents.push(this._attributesInspector.getField('name').on(
                'change',
                this._updateAssetName.bind(this)
            ));
            this._attributesInspector.getField('source_asset_id').class.add('pcui-selectable');

            this.hidden = false;
        }

        _toggleAssetField(attribute) {
            // const legacyScripts = this._projectSettings.get('useLegacyScripts');

            const hiddenField = HIDDEN_FIELDS[attribute];

            let hiddenForAnyAsset = false;
            this._assets.forEach(asset => {
                let assetType = asset.get('type');
                if (asset.get('source') === true) {
                    assetType += '.source';
                }

                if (hiddenField && hiddenField.includes(assetType)) {
                    hiddenForAnyAsset = true;
                } else if (attribute === 'loadingOrder' || attribute === 'data.loadingType') {
                    if (assetType !== 'script') {
                        hiddenForAnyAsset = true;
                    }
                }
            });

            if (hiddenForAnyAsset ||
                (hiddenField && hiddenField.includes('multi') && this._assets.length > 1) ||
                (hiddenField && hiddenField.includes('single') && this._assets.length === 1)
            ) {
                this._attributesInspector.getField(attribute).parent.hidden = true;
            } else {
                this._attributesInspector.getField(attribute).parent.hidden = false;
            }

        }

        unlink() {
            super.unlink();

            if (!this._assets) return;

            this._assetEvents.forEach(evt => evt.unbind());
            this._assetEvents.length = 0;

            this._assets = null;

            this._attributesInspector.unlink();

            this._assetTypes.forEach(assetType => {
                const cls = `${assetType[0].toUpperCase()}${assetType.substring(1)}AssetInspector`;
                if (pcui.hasOwnProperty(cls)) {
                    this._typedAssetInspectors[assetType].unlink();
                    this._typedAssetInspectors[assetType].hidden = true;
                }
                const clsSource = `${assetType[0].toUpperCase()}${assetType.substring(1)}SourceAssetInspector`;
                if (pcui.hasOwnProperty(clsSource)) {
                    this._typedAssetInspectors[`${assetType}-source`].unlink();
                    this._typedAssetInspectors[`${assetType}-source`].hidden = true;
                }
                const clsPreview = `${assetType[0].toUpperCase()}${assetType.substring(1)}AssetInspectorPreview`;
                if (pcui.hasOwnProperty(clsPreview)) {
                    this._typedAssetPreviews[assetType].unlink();
                    this._typedAssetPreviews[assetType].hidden = true;
                }
            });
        }
    }

    return {
        AssetInspector: AssetInspector
    };
})());