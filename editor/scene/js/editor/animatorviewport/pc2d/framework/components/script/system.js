Object.assign(pc2d, function () {
    var METHOD_INITIALIZE_ATTRIBUTES = '_onInitializeAttributes';
    var METHOD_INITIALIZE = '_onInitialize';
    var METHOD_POST_INITIALIZE = '_onPostInitialize';
    var METHOD_UPDATE = '_onUpdate';
    var METHOD_POST_UPDATE = '_onPostUpdate';


    var executionOrderCounter = 0;


    var ScriptComponentSystem = function ScriptComponentSystem(app) {
        pc2d.ComponentSystem.call(this, app);

        this.id = 'script';
        this.app = app;

        this.ComponentType = pc2d.ScriptComponent;
        this.DataType = pc2d.ScriptComponentData;

        this._components = new pc2d.SortedLoopArray({
            sortBy: '_executionOrder'
        });


        this._enabledComponents = new pc2d.SortedLoopArray({
            sortBy: '_executionOrder'
        });


        this.preloading = true;

        this.on('beforeremove', this._onBeforeRemove, this);
        pc2d.ComponentSystem.bind('initialize', this._onInitialize, this);
        pc2d.ComponentSystem.bind('postInitialize', this._onPostInitialize, this);
        pc2d.ComponentSystem.bind('update', this._onUpdate, this);
        pc2d.ComponentSystem.bind('postUpdate', this._onPostUpdate, this);
    };
    ScriptComponentSystem.prototype = Object.create(pc2d.ComponentSystem.prototype);
    ScriptComponentSystem.prototype.constructor = ScriptComponentSystem;

    Object.assign(ScriptComponentSystem.prototype, {
        initializeComponentData: function (component, data) {
            // Set execution order to an ever-increasing number
            // and add to the end of the components array.
            component._executionOrder = executionOrderCounter++;
            this._components.append(component);

            // check we don't overflow executionOrderCounter
            if (executionOrderCounter > Number.MAX_SAFE_INTEGER) {
                this._resetExecutionOrder();
            }

            component.enabled = data.hasOwnProperty('enabled') ? !!data.enabled : true;

            if (component.enabled && component.entity.enabled) {
                this._enabledComponents.append(component);
            }

            if (data.hasOwnProperty('order') && data.hasOwnProperty('scripts')) {
                component._scriptsData = data.scripts;

                for (var i = 0; i < data.order.length; i++) {
                    component.create(data.order[i], {
                        enabled: data.scripts[data.order[i]].enabled,
                        attributes: data.scripts[data.order[i]].attributes,
                        preloading: this.preloading
                    });
                }
            }
        },

        cloneComponent: function (entity, clone) {
            var i, key;
            var order = [];
            var scripts = { };

            for (i = 0; i < entity.script._scripts.length; i++) {
                var scriptInstance = entity.script._scripts[i];
                var scriptName = scriptInstance.__scriptType.__name;
                order.push(scriptName);

                var attributes = { };
                for (key in scriptInstance.__attributes)
                    attributes[key] = scriptInstance.__attributes[key];

                scripts[scriptName] = {
                    enabled: scriptInstance._enabled,
                    attributes: attributes
                };
            }

            for (key in entity.script._scriptsIndex) {
                if (key.awaiting) {
                    order.splice(key.ind, 0, key);
                }
            }

            var data = {
                enabled: entity.script.enabled,
                order: order,
                scripts: scripts
            };

            return this.addComponent(clone, data);
        },

        _resetExecutionOrder: function () {
            executionOrderCounter = 0;
            for (var i = 0, len = this._components.length; i < len; i++) {
                this._components.items[i]._executionOrder = executionOrderCounter++;
            }
        },

        _callComponentMethod: function (components, name, dt) {
            for (components.loopIndex = 0; components.loopIndex < components.length; components.loopIndex++) {
                components.items[components.loopIndex][name](dt);
            }
        },

        _onInitialize: function () {
            this.preloading = false;

            // initialize attributes on all components
            this._callComponentMethod(this._components, METHOD_INITIALIZE_ATTRIBUTES);

            // call onInitialize on enabled components
            this._callComponentMethod(this._enabledComponents, METHOD_INITIALIZE);
        },

        _onPostInitialize: function () {
            // call onPostInitialize on enabled components
            this._callComponentMethod(this._enabledComponents, METHOD_POST_INITIALIZE);
        },

        _onUpdate: function (dt) {
            // call onUpdate on enabled components
            this._callComponentMethod(this._enabledComponents, METHOD_UPDATE, dt);
        },

        _onPostUpdate: function (dt) {
            // call onPostUpdate on enabled components
            this._callComponentMethod(this._enabledComponents, METHOD_POST_UPDATE, dt);
        },

        // inserts the component into the enabledComponents array
        // which finds the right slot based on component._executionOrder
        _addComponentToEnabled: function (component)  {
            this._enabledComponents.insert(component);
        },

        // removes the component from the enabledComponents array
        _removeComponentFromEnabled: function (component) {
            this._enabledComponents.remove(component);
        },

        _onBeforeRemove: function (entity, component) {
            var ind = this._components.items.indexOf(component);
            if (ind >= 0) {
                component._onBeforeRemove();
            }

            this._removeComponentFromEnabled(component);

            // remove from components array
            this._components.remove(component);
        }
    });

    return {
        ScriptComponentSystem: ScriptComponentSystem
    };
}());