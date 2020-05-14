Object.assign(pc2d, function () {
  
    
    var ComponentSystem = function (app) {
        pc2d.EventHandler.call(this);

        this.app = app;

        // The store where all pc2d.ComponentData objects are kept
        this.store = {};
        this.schema = [];
    };
    ComponentSystem.prototype = Object.create(pc2d.EventHandler.prototype);
    ComponentSystem.prototype.constructor = ComponentSystem;

    // Class methods
    Object.assign(ComponentSystem, {
        _helper: function (a, p) {
            for (var i = 0, l = a.length; i < l; i++) {
                a[i].f.call(a[i].s, p);
            }
        },

        initialize: function (root) {
            this._helper(this._init, root);
        },

        postInitialize: function (root) {
            this._helper(this._postInit, root);

            // temp, this is for internal use on entity-references until a better system is found
            this.fire('postinitialize', root);
        },

        // Update all ComponentSystems
        update: function (dt, inTools) {
            this._helper(inTools ? this._toolsUpdate : this._update, dt);
        },

        // Update all ComponentSystems
        fixedUpdate: function (dt, inTools) {
            this._helper(this._fixedUpdate, dt);
        },

        // Update all ComponentSystems
        postUpdate: function (dt, inTools) {
            this._helper(this._postUpdate, dt);
        },

        _init: [],
        _postInit: [],
        _toolsUpdate: [],
        _update: [],
        _fixedUpdate: [],
        _postUpdate: [],

        bind: function (event, func, scope) {
            switch (event) {
                case 'initialize':
                    this._init.push({ f: func, s: scope });
                    break;
                case 'postInitialize':
                    this._postInit.push({ f: func, s: scope });
                    break;
                case 'update':
                    this._update.push({ f: func, s: scope });
                    break;
                case 'postUpdate':
                    this._postUpdate.push({ f: func, s: scope });
                    break;
                case 'fixedUpdate':
                    this._fixedUpdate.push({ f: func, s: scope });
                    break;
                case 'toolsUpdate':
                    this._toolsUpdate.push({ f: func, s: scope });
                    break;
                default:
                    console.error('Component System does not support event', event);
            }
        },

        _erase: function (a, f, s) {
            for (var i = 0; i < a.length; i++) {
                if (a[i].f === f && a[i].s === s) {
                    a.splice(i--, 1);
                }
            }
        },

        unbind: function (event, func, scope) {
            switch (event) {
                case 'initialize':
                    this._erase(this._init, func, scope);
                    break;
                case 'postInitialize':
                    this._erase(this._postInit, func, scope);
                    break;
                case 'update':
                    this._erase(this._update, func, scope);
                    break;
                case 'postUpdate':
                    this._erase(this._postUpdate, func, scope);
                    break;
                case 'fixedUpdate':
                    this._erase(this._fixedUpdate, func, scope);
                    break;
                case 'toolsUpdate':
                    this._erase(this._toolsUpdate, func, scope);
                    break;
                default:
                    console.error('Component System does not support event', event);
            }
        }
    });

    // Instance methods
    Object.assign(ComponentSystem.prototype, {
     
        addComponent: function (entity, data) {
            var component = new this.ComponentType(this, entity);
            var componentData = new this.DataType();

            data = data || {};

            this.store[entity.getGuid()] = {
                entity: entity,
                data: componentData
            };

            entity[this.id] = component;
            entity.c[this.id] = component;

            this.initializeComponentData(component, data, []);

            this.fire('add', entity, component);

            return component;
        },

      
        removeComponent: function (entity) {
            var record = this.store[entity.getGuid()];
            var component = entity.c[this.id];
            this.fire('beforeremove', entity, component);
            delete this.store[entity.getGuid()];
            delete entity[this.id];
            delete entity.c[this.id];
            this.fire('remove', entity, record.data);
        },

    
        cloneComponent: function (entity, clone) {
            // default clone is just to add a new component with existing data
            var src = this.store[entity.getGuid()];
            return this.addComponent(clone, src.data);
        },

        initializeComponentData: function (component, data, properties) {
            data = data || {};

            var descriptor;
            var name, type, value;

            // initialize
            for (var i = 0, len = properties.length; i < len; i++) {
                descriptor = properties[i];

                // If the descriptor is an object, it will have `name` and `type` members
                if (typeof descriptor === 'object') {
                    name = descriptor.name;
                    type = descriptor.type;
                } else {
                    // Otherwise, the descriptor is just the property name
                    name = descriptor;
                    type = undefined;
                }

                value = data[name];

                if (value !== undefined) {
                    // If we know the intended type of the value, convert the raw data
                    // into an instance of the specified type.
                    if (type !== undefined) {
                        value = convertValue(value, type);
                    }

                    component[name] = value;
                } else {
                    component[name] = component.data[name];
                }
            }

            // after component is initialized call onEnable
            if (component.enabled && component.entity.enabled) {
                component.onEnable();
            }
        },

        /**
         * @private
         * @function
         * @name pc2d.ComponentSystem#getPropertiesOfType
         * @description Searches the component schema for properties that match the specified type.
         * @param {string} type - The type to search for.
         * @returns {string[]|object[]} An array of property descriptors matching the specified type.
         */
        getPropertiesOfType: function (type) {
            var matchingProperties = [];
            var schema = this.schema || [];

            schema.forEach(function (descriptor) {
                if (descriptor && typeof descriptor === 'object' && descriptor.type === type) {
                    matchingProperties.push(descriptor);
                }
            });

            return matchingProperties;
        },

        destroy: function () {
            this.off();
        }
    });

    function convertValue(value, type) {
        if (!value) {
            return value;
        }

        switch (type) {
            case 'rgb':
                if (value instanceof pc2d.Color) {
                    return value.clone();
                }
                return new pc2d.Color(value[0], value[1], value[2]);
            case 'rgba':
                if (value instanceof pc2d.Color) {
                    return value.clone();
                }
                return new pc2d.Color(value[0], value[1], value[2], value[3]);
            case 'vec2':
                if (value instanceof pc2d.Vec2) {
                    return value.clone();
                }
                return new pc2d.Vec2(value[0], value[1]);
            case 'vec3':
                if (value instanceof pc2d.Vec3) {
                    return value.clone();
                }
                return new pc2d.Vec3(value[0], value[1], value[2]);
            case 'vec4':
                if (value instanceof pc2d.Vec4) {
                    return value.clone();
                }
                return new pc2d.Vec4(value[0], value[1], value[2], value[3]);
            case 'boolean':
            case 'number':
            case 'string':
                return value;
            case 'entity':
                return value; // Entity fields should just be a string guid
            default:
                throw new Error('Could not convert unhandled type: ' + type);
        }
    }

    // Add event support
    pc2d.events.attach(ComponentSystem);

    ComponentSystem.destroy = function () {
        ComponentSystem.off('initialize');
        ComponentSystem.off('postInitialize');
        ComponentSystem.off('toolsUpdate');
        ComponentSystem.off('update');
        ComponentSystem.off('fixedUpdate');
        ComponentSystem.off('postUpdate');
    };

    return {
        ComponentSystem: ComponentSystem
    };
}());