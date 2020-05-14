/* editor/inspector/components/css.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [{
        label: 'Type',
        path: 'components.css.type',
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
        label: 'CssText',
        path: 'components.css.cssText',
        type: 'text'
    }, {
        label: '文本',
        path: 'components.css.innerText',
        type: 'text'
    }, {
        label: 'Texture',
        path: 'components.css.textureAsset',
        type: 'asset',
        args: {
            assetType: 'texture'
        }
    }, {
        type: 'divider'
    }];

    ATTRIBUTES.forEach(attr => {
        const field = attr.path || attr.alias;
        if (!field) return;
        const parts = field.split('.');
        attr.reference = `css:${parts[parts.length - 1]}`;
    });



    const STYLESHEET_ATTRIBUTES = [{
        label: 'cssName',
        path: 'components.css.styleSheets.$.name',
        type: 'string'
    }, {
        label: 'cssText',
        path: 'components.css.styleSheets.$.text',
        type: 'text'
    }];

    STYLESHEET_ATTRIBUTES.forEach(attr => {
        if (!attr.path) return;
        const parts = attr.path.split('.');
        attr.reference = `cssStyle:${parts[parts.length - 1]}`;
    });


    const REGEX_CLIP = /^components.css.styleSheets.\d+$/;
    const REGEX_CLIP_NAME = /^components.css.styleSheets.\d+\.name$/;

    function getStyleSheetsGroupedByName(entities) {
        const result = {};

        // first group clips by name
        entities.forEach(e => {
            const clips = e.get('components.css.styleSheets');
            if (!clips) return;

            for (const key in clips) {
                const clip = clips[key];
                if (!result[clip.name]) {
                    result[clip.name] = [];
                }

                result[clip.name].push(key);
            }
        });

        return result;
    }

    function getCommonStyleSheets(entities) {
        const result = getStyleSheetsGroupedByName(entities);

        // then remove all clips who are not shared across all entities
        for (const key in result) {
            if (result[key].length !== entities.length) {
                delete result[key];
            }
        }

        return result;
    }

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
                    if (!latest || !latest.has('components.css')) continue;

                    let history = false;
                    if (latest.history) {
                        history = latest.history.enabled;
                        latest.history.enabled = false;
                    }

                    const path = this._pathAt(paths, i);

                    const prevEntry = previous[latest.get('resource_id')];

                    latest.set(path, prevEntry.value);


                    if (history) {
                        latest.history.enabled = true;
                    }
                }
            };

            const redo = () => {
                previous = {};

                const asset = this._assets.get(value);

                for (let i = 0; i < observers.length; i++) {
                    const latest = observers[i].latest();
                    if (!latest || !latest.has('components.css')) continue;

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

    

    class CssComponentInspector extends pcui.ComponentInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.component = 'css';

            super(args);

            this._attributesInspector = new pcui.AttributesInspector({
                assets: args.assets,
                projectSettings: args.projectSettings,
                history: args.history,
                attributes: ATTRIBUTES,
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);

            this._containerStyleSheets = new pcui.Container({
                flex: true
            });
            this.append(this._containerStyleSheets);


            this._styleSheetInspectors = {};

            this._btnAddStyleSheet = new pcui.Button({
                text: 'ADD StyleSheet',
                icon: 'E120',
                flexGrow: 1,
                hidden: true
            });

            this._btnAddStyleSheet.on('click', this._onClickAddStyleSheet.bind(this));

            this.append(this._btnAddStyleSheet);

            this._timeoutAfterstyleNameChange = null;

            this._entityEvents = [];

            [
                'type',
                'textureAsset',
            ].forEach(name => {
                this._field(name).on('change', this._toggleFields.bind(this));
            });



            // update binding of textureAsset field
            this._field('textureAsset').binding = new pcui.BindingTwoWay({
                history: args.history,
                bindingElementToObservers: new TextureAssetElementToObserversBinding(args.assets, {
                    history: args.history
                })
            });

            this._suppressToggleFields = false;
        }
        _createStyleSheetInspector(entities, styleName, styleSheets, insertBeforeElement) {
            const inspector = new StyleSheetInspector({
                styleName: styleName,
                styleSheets:styleSheets,
                removable: true,
                history: this._history
            });

            if (insertBeforeElement) {
                this._containerStyleSheets.appendBefore(inspector, insertBeforeElement);
            } else {
                this._containerStyleSheets.append(inspector);
            }

            this._styleSheetInspectors[styleName] = inspector;

            inspector.link(entities);

            return inspector;
        }
        _onClickAddStyleSheet() {
            // copy entities for redo / undo
            const entities = this._entities.slice();

            // search styleSheets of all entities for the largest key
            let largestKey = 1;
            for (let i = 0; i < entities.length; i++) {
                const styleSheets = entities[i].get('components.css.styleSheets');
                if (! styleSheets) continue;

                for (const key in styleSheets) {
                    largestKey = Math.max(largestKey, parseInt(key, 10) + 1);
                }
            }

            const groupedStyleSheets = getStyleSheetsGroupedByName(entities);
            let suffix = largestKey;
            let desiredName = 'StyleSheet ' + suffix;
            while (groupedStyleSheets[desiredName]) {
                suffix++;
                desiredName = 'StyleSheet ' + suffix;
            }

            function redo() {
                entities.forEach(e => {
                    const entity = e.latest();
                    if (!entity || !entity.has('components.css')) return;

                    const history = entity.history.enabled;
                    entity.history.enabled = false;
                    const styleSheets = entity.get('components.css.styleSheets') || {};
                    let clipKey = 0;
                    for (const key in styleSheets) {
                        clipKey = Math.max(clipKey, parseInt(key, 10) + 1);
                    }

                    entity.set('components.css.styleSheets.' + clipKey, {
                        name: desiredName,
                        text:""
                    });
                    entity.history.enabled = history;
                });
            }

            function undo() {
                entities.forEach(e => {
                    const entity = e.latest();
                    if (!entity) return;

                    const history = entity.history.enabled;
                    entity.history.enabled = false;

                    // find clip by clip name
                    const clips = entity.get('components.css.styleSheets');
                    if (! clips) return;

                    let clipKey = null;
                    for (const key in clips) {
                        if (clips[key].name === desiredName) {
                            clipKey = key;
                            break;
                        }
                    }

                    if (clipKey === null) return;

                    entity.unset('components.css.styleSheets.' + clipKey);
                    entity.history.enabled = history;
                });
            }

            if (this._history) {
                this._history.add({
                    name: 'entities.components.css.styleSheets',
                    undo: undo,
                    redo: redo
                });
            }

            redo();
        }

        _onSetStyleSheet(styleName) {
            const existing = this._styleSheetInspectors[styleName];
            if (existing) {
                existing.destroy();
                delete this._styleSheetInspectors[styleName];
            }

            const commonStyleSheets = getCommonStyleSheets(this._entities);

            // try to insert the clip at the correct index
            const idx = Object.keys(commonStyleSheets).indexOf(styleName);
            if (idx === -1) return;

            const nextSibling = this._containerStyleSheets.dom.childNodes[idx];

            this._createStyleSheetInspector(this._entities, styleName, commonStyleSheets[styleName], nextSibling);

           
        }


        _onUnsetStyleSheet(path) {
            
            for(var k in this._styleSheetInspectors){
                if(this._styleSheetInspectors[k]._attrs[0].paths[0].startsWith(path)){
                    var inspector = this._styleSheetInspectors[k];

                    inspector.destroy();
                    delete this._styleSheetInspectors[styleName];
                    break;
                }
            }

        }

        _field(name) {
            return this._attributesInspector.getField(`components.css.${name}`);
        }

        


        _toggleFields() {
            
            if (this._suppressToggleFields) return;

            const type = this._field('type').value;
            const isText = type === 'text';
            const isImage = (type === 'image' || type === 'group');

            const texture = this._field('textureAsset').value;

            this._field('textureAsset').hidden = !isImage;
 
            //this._field('innerText').hidden = !isText;
        

            if(type === 'image'){
                this._attributesInspector.removeAttribute("components.css.innerText");
            }else{
                this._attributesInspector.removeAttribute("components.css.innerText");
                this._attributesInspector.addAttribute(ATTRIBUTES[2],2);
            }

        }

        _onFieldPresetChange(value) {
            if (!value || value === 'custom' || this._suppressPresetEvents) return;

            if (!this._entities) return;

            // copy current entities for undo / redo
            const entities = this._entities.slice();

            this._suppressPresetEvents = true;

            const fields = value.split('/');

            const prev = {};


            function undo() {
                for (let i = 0; i < entities.length; i++) {
                    const entity = entities[i].latest();
                    if (!entity || !entity.has('components.css')) continue;

                    const history = entity.history.enabled;
                    entity.history.enabled = false;
                    const prevRecord = prev[entity.get('resource_id')];
                    entity.history.enabled = history;
                }
            }

            function redo() {
                for (var i = 0; i < entities.length; i++) {
                    const entity = entities[i].latest();
                    if (!entity || !entity.has('components.css')) continue;

                    const history = entity.history.enabled;
                    entity.history.enabled = false;


                    const prevRecord = prev[entity.get('resource_id')];

                    entity.history.enabled = history;
                }
            }

            redo();

            if (this._history) {
                this._history.add({
                    name: 'entities.components.css.preset',
                    undo: undo,
                    redo: redo
                });
            }

            this._suppressPresetEvents = false;
        }

        _onFieldKeyChange(value) {

        }



        link(entities) {
            super.link(entities);

            this._suppressToggleFields = true;
            this._attributesInspector.link(entities);


            this._btnAddStyleSheet.hidden = false;

            // event for new clips
            entities.forEach((e, i) => {
                this._entityEvents.push(e.on('*:set', (path, value, oldValue) => {
                    if (REGEX_CLIP.test(path)) {
                        this._onSetStyleSheet(value.name);
                    } else if (REGEX_CLIP_NAME.test(path)) {
                       // this._onSetStyleName(e, value, oldValue);
                    }
                }));
            });

            // event for deleted clips
            entities.forEach((e, i) => {
                this._entityEvents.push(e.on('*:unset', (path, value) => {
                    if (!REGEX_CLIP.test(path)) return;
                    this._onUnsetStyleSheet(path);
                }));
            });

            // group clips by name to find the ones that are common between entities
            const commonStyleSheets = getCommonStyleSheets(entities);

            // create all existing clips
            
            for (const name in commonStyleSheets) {
                this._createStyleSheetInspector(entities, name, commonStyleSheets[name]);
            }



            this._suppressToggleFields = false;


            this._toggleFields();
        }

        unlink() {
            super.unlink();
            this._attributesInspector.unlink();

            for (const key in this._styleSheetInspectors) {
                this._styleSheetInspectors[key].destroy();
            }
            this._styleSheetInspectors = {};
            
            this._btnAddStyleSheet.hidden = true;
        }
    }

    const CLASS_CLIP = 'sprite-component-inspector-clip';

    class StyleSheetInspector extends pcui.Panel {
        constructor(args) {
            args = Object.assign({
                collapsible: true,
                headerText: args.styleName
            }, args);

            super(args);

            this.class.add(CLASS_CLIP);

            this._entities = null;

            this._spriteInspector = args.spriteInspector;
            this._templateOverridesSidebar = args.templateOverridesSidebar;

            this._styleSheets = args.styleSheets;

            this._attrs = utils.deepCopy(STYLESHEET_ATTRIBUTES);
            // replace '$' with the actual clip key
            this._attrs.forEach(attr => {
                attr.paths = args.styleSheets.map(key => attr.path.replace('$', key));
                delete attr.path;
            });

            this._inspector = new pcui.AttributesInspector({
                attributes: this._attrs,
                assets: args.assets,
                history: args.history,
                templateOverridesSidebar: this._templateOverridesSidebar
            });

            this.append(this._inspector);

            if (this._templateOverridesSidebar) {
                this._templateOverridesSidebar.registerElementForPath(`components.css.styleSheets.${args.styleSheets[0]}`, this.dom);
            }

            const fieldName = this._inspector.getField(this._getPathTo('name'));
            fieldName.on('change', this._onstyleNameChange.bind(this));
        }

        _getPathTo(field) {
            return `components.css.styleSheets.${this._styleSheets[0]}.${field}`;
        }

        _onstyleNameChange(value) {
            this.headerText = value;
        }

        _onClickRemove(evt) {
            super._onClickRemove(evt);

            let prev = {};

            // copy for redo / undo
            const styleSheets = this._styleSheets.slice();
            const entities = this._entities.slice();

            const redo = () => {
                prev = {};

                entities.forEach((e, i) => {
                    const entity = e.latest();
                    if (!entity || !entity.has('components.css')) return;

                    const path = `components.css.styleSheets.${styleSheets[i]}`;
                    if (!entity.has(path)) return;

                    const clip = entity.get(path);
                    prev[e.get('resource_id')] = { clip };

                    const history = entity.history.enabled;
                    entity.history.enabled = false;

                    entity.unset(path);


                    entity.history.enabled = history;
                });
            };

            const undo = () => {
                entities.forEach((e, i) => {
                    const entity = e.latest();
                    if (!entity || !entity.has('components.css') || !prev[e.get('resource_id')]) return;

                    const record = prev[e.get('resource_id')];
                    if (!record) return;

                    const history = entity.history.enabled;
                    entity.history.enabled = false;
                    entity.set(`components.css.styleSheets.${styleSheets[i]}`, record.clip);
                   
                    entity.history.enabled = history;
                });
            };

            editor.call('history:add', {
                name: 'delete entities.components.css.styleSheets',
                undo: undo,
                redo: redo
            });

            redo();
        }

        link(entities) {
            this.unlink();

            this._entities = entities;

            this._inspector.link(entities);

            const fieldName = this._inspector.getField(this._getPathTo('name'));

            // if the name already exists show error
            fieldName.onValidate = (value) => {
                if (!value) {
                    return false;
                }

                const groupedClips = getStyleSheetsGroupedByName(entities);
                if (groupedClips[value]) {
                    return false;
                }

                return true;
            };
        }

        unlink() {
            this._entities = null;
            this._inspector.unlink();
        }

        destroy() {
            if (this._destroyed) return;

            if (this._templateOverridesSidebar) {
                this._templateOverridesSidebar.registerElementForPath(`components.css.styleSheets.${this._styleSheets[0]}`);
            }

            super.destroy();
        }
    }

    return {
        CssComponentInspector: CssComponentInspector
    };
})());