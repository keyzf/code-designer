Object.assign(pc2d, function () {

    var funcNameRegex = new RegExp('^\\s*function(?:\\s|\\s*\\/\\*.*\\*\\/\\s*)+([^\\(\\s\\/]*)\\s*');

    /**
     * @class
     * @name pc2d.ScriptType
     * @augments pc2d.EventHandler
     * @classdesc Represents the type of a script. It is returned by {@link pc2d.createScript}.
     * Also referred to as Script Type.
     *
     * The type is to be extended using its JavaScript prototype. There is a **list of methods**
     * that will be executed by the engine on instances of this type, such as:
     *
     * * initialize
     * * postInitialize
     * * update
     * * postUpdate
     * * swap
     *
     * **initialize** and **postInitialize** - are called if defined when script is about to run
     * for the first time - postInitialize will run after all initialize methods are executed in
     * the same tick or enabling chain of actions.
     *
     * **update** and **postUpdate** - methods are called if defined for enabled (running state)
     * scripts on each tick.
     *
     * **swap** - This method will be called when a {@link pc2d.ScriptType} that already exists in
     * the registry gets redefined. If the new {@link pc2d.ScriptType} has a `swap` method in its
     * prototype, then it will be executed to perform hot-reload at runtime.
     * @property {pc2d.Application} app The {@link pc2d.Application} that the instance of this type
     * belongs to.
     * @property {pc2d.Entity} entity The {@link pc2d.Entity} that the instance of this type belongs to.
     * @property {boolean} enabled True if the instance of this type is in running state. False
     * when script is not running, because the Entity or any of its parents are disabled or the
     * Script Component is disabled or the Script Instance is disabled. When disabled no update
     * methods will be called on each tick. initialize and postInitialize methods will run once
     * when the script instance is in `enabled` state during app tick.
     * @param {object} args - The input arguments object
     * @param {pc2d.Application} args.app - The {@link pc2d.Application} that is running the script
     * @param {pc2d.Entity} args.entity - The {@link pc2d.Entity} that the script is attached to
     *
     */
    var ScriptType = function (args) {
        pc2d.EventHandler.call(this);

        var script = this.constructor; // get script type, i.e. function (class)

        // #ifdef DEBUG
        if (!args || !args.app || !args.entity) {
            console.warn('script \'' + script.__name + '\' has missing arguments in constructor');
        }
        // #endif

        this.app = args.app;
        this.entity = args.entity;
        this._enabled = typeof args.enabled === 'boolean' ? args.enabled : true;
        this._enabledOld = this.enabled;
        this.__destroyed = false;
        this.__attributes = { };
        this.__attributesRaw = args.attributes || { }; // need at least an empty object to make sure default attributes are initialized
        this.__scriptType = script;

        // the order in the script component that the
        // methods of this script instance will run relative to
        // other script instances in the component
        this.__executionOrder = -1;
    };
    ScriptType.prototype = Object.create(pc2d.EventHandler.prototype);
    ScriptType.prototype.constructor = ScriptType;

    ScriptType.__name = null; // Will be assigned when calling createScript or registerScript.

    ScriptType.__getScriptName = function (constructorFn) {
        if (typeof constructorFn !== 'function') return undefined;
        if ('name' in Function.prototype) return constructorFn.name;
        if (constructorFn === Function || constructorFn === Function.prototype.constructor) return 'Function';
        var match = ("" + constructorFn).match(funcNameRegex);
        return match ? match[1] : undefined;
    };


    Object.defineProperty(ScriptType, 'attributes', {
        get: function () {
            if (!this.hasOwnProperty('__attributes')) this.__attributes = new pc2d.ScriptAttributes(this);
            return this.__attributes;
        }
    });

    // initialize attributes
    ScriptType.prototype.__initializeAttributes = function (force) {
        if (!force && !this.__attributesRaw)
            return;

        // set attributes values
        for (var key in this.__scriptType.attributes.index) {
            if (this.__attributesRaw && this.__attributesRaw.hasOwnProperty(key)) {
                this[key] = this.__attributesRaw[key];
            } else if (!this.__attributes.hasOwnProperty(key)) {
                if (this.__scriptType.attributes.index[key].hasOwnProperty('default')) {
                    this[key] = this.__scriptType.attributes.index[key].default;
                } else {
                    this[key] = null;
                }
            }
        }

        this.__attributesRaw = null;
    };

    ScriptType.extend = function (methods) {
        for (var key in methods) {
            if (!methods.hasOwnProperty(key))
                continue;

            this.prototype[key] = methods[key];
        }
    };


    Object.defineProperty(ScriptType.prototype, 'enabled', {
        get: function () {
            return this._enabled && !this._destroyed && this.entity.script.enabled && this.entity.enabled;
        },
        set: function (value) {
            this._enabled = !!value;

            if (this.enabled === this._enabledOld) return;

            this._enabledOld = this.enabled;
            this.fire(this.enabled ? 'enable' : 'disable');
            this.fire('state', this.enabled);

            // initialize script if not initialized yet and script is enabled
            if (!this._initialized && this.enabled) {
                this._initialized = true;

                this.__initializeAttributes(true);

                if (this.initialize)
                    this.entity.script._scriptMethod(this, pc2d.ScriptComponent.scriptMethods.initialize);
            }
            if (this._initialized && !this._postInitialized && this.enabled && !this.entity.script._beingEnabled) {
                this._postInitialized = true;

                if (this.postInitialize)
                    this.entity.script._scriptMethod(this, pc2d.ScriptComponent.scriptMethods.postInitialize);
            }
        }
    });

    return {
        ScriptType: ScriptType
    };
}());