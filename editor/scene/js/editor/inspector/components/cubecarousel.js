/* editor/inspector/components/cubecarousel.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [ {
        label: 'Carousel Item Prefab',
        path: 'components.cubecarousel.carouselPrefab',
        type: 'entity'
    }, {
        label: 'mock data',
        path: 'components.cubecarousel.mockdata',
        type: 'asset',
        args: {
            assetType: 'json'
        }
    }, {
        label: 'fetchurl',
        path: 'components.cubecarousel.fetchurl',
        type: 'string'
    }];

    ATTRIBUTES.forEach(attr => {
        const field = attr.path || attr.alias;
        if (!field) return;
        const parts = field.split('.');
        attr.reference = `cubecarousel:${parts[parts.length - 1]}`;
    });



    class MockDataElementToObserversBinding extends pcui.BindingElementToObservers {
        constructor(assets, args) {
            super(args);
            this._assets = assets;
        }

        clone() {
            return new MockDataElementToObserversBinding(this._assets, {
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
                    if (!latest || !latest.has('components.cubecarousel')) continue;

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
                    if (!latest || !latest.has('components.cubecarousel')) continue;

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

    class CubecarouselComponentInspector extends pcui.ComponentInspector {
        constructor(args) {
            args = Object.assign({}, args);
            args.component = 'cubecarousel';

            super(args);

            this._attributesInspector = new pcui.AttributesInspector({
                entities:args.entities,
                assets: args.assets,
                projectSettings: args.projectSettings,
                history: args.history,
                attributes: ATTRIBUTES,
                templateOverridesSidebar: this._templateOverridesSidebar
            });
            this.append(this._attributesInspector);


            this._timeoutAfterstyleNameChange = null;

            this._entityEvents = [];

            [
                'mockdata',
            ].forEach(name => {
                this._field(name).on('change', this._toggleFields.bind(this));
            });



            // update binding of textureAsset field
            this._field('mockdata').binding = new pcui.BindingTwoWay({
                history: args.history,
                bindingElementToObservers: new MockDataElementToObserversBinding(args.assets, {
                    history: args.history
                })
            });

            this._suppressToggleFields = false;
        }
       

        _field(name) {
            return this._attributesInspector.getField(`components.cubecarousel.${name}`);
        }

        


        _toggleFields() {
            
            if (this._suppressToggleFields) return;

        

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
                    if (!entity || !entity.has('components.cubecarousel')) continue;

                    const history = entity.history.enabled;
                    entity.history.enabled = false;
                    const prevRecord = prev[entity.get('resource_id')];
                    entity.history.enabled = history;
                }
            }

            function redo() {
                for (var i = 0; i < entities.length; i++) {
                    const entity = entities[i].latest();
                    if (!entity || !entity.has('components.cubecarousel')) continue;

                    const history = entity.history.enabled;
                    entity.history.enabled = false;


                    const prevRecord = prev[entity.get('resource_id')];

                    entity.history.enabled = history;
                }
            }

            redo();

            if (this._history) {
                this._history.add({
                    name: 'entities.components.cubecarousel.preset',
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

            // event for new clips
            entities.forEach((e, i) => {
                this._entityEvents.push(e.on('*:set', (path, value, oldValue) => {
                   
                }));
            });

            // event for deleted clips
            entities.forEach((e, i) => {
                this._entityEvents.push(e.on('*:unset', (path, value) => {
                    
                }));
            });

          
            this._suppressToggleFields = false;


            this._toggleFields();
        }

        unlink() {
            super.unlink();
            this._attributesInspector.unlink();
        }
    }


    return {
        CubecarouselComponentInspector: CubecarouselComponentInspector
    };
})());