Object.assign(pc2d, function () {
    
    var Component = function (system, entity) {
        pc2d.EventHandler.call(this);

        this.system = system;
        this.entity = entity;

        if (this.system.schema && !this._accessorsBuilt) {
            this.buildAccessors(this.system.schema);
        }

        this.on("set", function (name, oldValue, newValue) {
            this.fire("set_" + name, name, oldValue, newValue);
        });

        this.on('set_enabled', this.onSetEnabled, this);
    };
    Component.prototype = Object.create(pc2d.EventHandler.prototype);
    Component.prototype.constructor = Component;

    Component._buildAccessors = function (obj, schema) {
        // Create getter/setter pairs for each property defined in the schema
        schema.forEach(function (descriptor) {
            // If the property descriptor is an object, it should have a `name`
            // member. If not, it should just be the plain property name.
            var name = (typeof descriptor === 'object') ? descriptor.name : descriptor;

            Object.defineProperty(obj, name, {
                get: function () {
                    return this.data[name];
                },
                set: function (value) {
                    var data = this.data;
                    var oldValue = data[name];
                    data[name] = value;
                    this.fire('set', name, oldValue, value);
                },
                configurable: true
            });
        });

        obj._accessorsBuilt = true;
    };

    Object.assign(Component.prototype, {
        buildAccessors: function (schema) {
            Component._buildAccessors(this, schema);
        },

        onSetEnabled: function (name, oldValue, newValue) {
            if (oldValue !== newValue) {
                if (this.entity.enabled) {
                    if (newValue) {
                        this.onEnable();
                    } else {
                        this.onDisable();
                    }
                }
            }
        },

        onEnable: function () { },

        onDisable: function () { },

        onPostStateChange: function () { }
    });


    Object.defineProperty(Component.prototype, "data", {
        get: function () {
            var record = this.system.store[this.entity.getGuid()];
            return record ? record.data : null;
        }
    });

    return {
        Component: Component
    };
}());