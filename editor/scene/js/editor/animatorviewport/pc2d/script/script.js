Object.assign(pc2d, function () {
    /* eslint-enable jsdoc/no-undefined-types */
    var createScript = function (name, app) {
        if (createScript.reservedScripts[name])
            throw new Error('script name: \'' + name + '\' is reserved, please change script name');

        var script = function (args) {
            pc2d.ScriptType.call(this, args);
        };

        script.prototype = Object.create(pc2d.ScriptType.prototype);
        script.prototype.constructor = script;

        script.extend = pc2d.ScriptType.extend;
        script.attributes = new pc2d.ScriptAttributes(script);

        pc2d.registerScript(script, name, app);
        return script;
    };

    /* eslint-disable jsdoc/no-undefined-types */
    /* eslint-disable jsdoc/check-examples */
    /**
     * @static
     * @function
     * @name pc2d.registerScript
     * @description Register a existing class type as a Script Type to {@link pc2d.ScriptRegistry}.
     * Useful when defining a ES6 script class that extends {@link pc2d.ScriptType} (see example).
     * @param {Class<pc2d.ScriptType>} script - The existing class type (constructor function) to be registered as a Script Type.
     * Class must extend {@link pc2d.ScriptType} (see example). Please note: A class created using {@link pc2d.createScript} is auto-registered,
     * and should therefore not be pass into {@link pc2d.registerScript} (which would result in swapping out all related script instances).
     * @param {string} [name] - Optional unique name of the Script Type. By default it will use the same name as the existing class.
     * If a Script Type with the same name has already been registered and the new one has a `swap` method defined in its prototype,
     * then it will perform hot swapping of existing Script Instances on entities using this new Script Type.
     * Note: There is a reserved list of names that cannot be used, such as list below as well as some starting from `_` (underscore):
     * system, entity, create, destroy, swap, move, scripts, onEnable, onDisable, onPostStateChange, has, on, off, fire, once, hasEvent.
     * @param {pc2d.Application} [app] - Optional application handler, to choose which {@link pc2d.ScriptRegistry} to register the script type to.
     * By default it will use `pc2d.Application.getApplication()` to get current {@link pc2d.Application}.
     * @example
     * // define a ES6 script class
     * class PlayerController extends pc2d.ScriptType {
     *
     *     initialize() {
     *         // called once on initialize
     *     }
     *
     *     update(dt) {
     *         // called each tick
     *     }
     * }
     *
     * // register the class as a script
     * pc2d.registerScript(PlayerController);
     *
     * // declare script attributes (Must be after pc2d.registerScript())
     * PlayerController.attributes.add('attribute1', {type: 'number'});
     */
    /* eslint-enable jsdoc/check-examples */
    /* eslint-enable jsdoc/no-undefined-types */
    var registerScript = function (script, name, app) {
        if (typeof script !== 'function')
            throw new Error('script class: \'' + script + '\' must be a constructor function (i.e. class).');

        if (!(script.prototype instanceof pc2d.ScriptType))
            throw new Error('script class: \'' + pc2d.ScriptType.__getScriptName(script) + '\' does not extend pc2d.ScriptType.');

        name = name || script.__name || pc2d.ScriptType.__getScriptName(script);

        if (createScript.reservedScripts[name])
            throw new Error('script name: \'' + name + '\' is reserved, please change script name');

        script.__name = name;

        // add to scripts registry
        var registry = app ? app.scripts : pc2d.Application.getApplication().scripts;
        registry.add(script);

        pc2d.ScriptHandler._push(script);
    };

    // reserved scripts
    createScript.reservedScripts = [
        'system', 'entity', 'create', 'destroy', 'swap', 'move',
        'scripts', '_scripts', '_scriptsIndex', '_scriptsData',
        'enabled', '_oldState', 'onEnable', 'onDisable', 'onPostStateChange',
        '_onSetEnabled', '_checkState', '_onBeforeRemove',
        '_onInitializeAttributes', '_onInitialize', '_onPostInitialize',
        '_onUpdate', '_onPostUpdate',
        '_callbacks', 'has', 'get', 'on', 'off', 'fire', 'once', 'hasEvent'
    ];
    var reservedScripts = { };
    var i;
    for (i = 0; i < createScript.reservedScripts.length; i++)
        reservedScripts[createScript.reservedScripts[i]] = 1;
    createScript.reservedScripts = reservedScripts;


    // reserved script attribute names
    createScript.reservedAttributes = [
        'app', 'entity', 'enabled', '_enabled', '_enabledOld', '_destroyed',
        '__attributes', '__attributesRaw', '__scriptType', '__executionOrder',
        '_callbacks', 'has', 'get', 'on', 'off', 'fire', 'once', 'hasEvent'
    ];
    var reservedAttributes = { };
    for (i = 0; i < createScript.reservedAttributes.length; i++)
        reservedAttributes[createScript.reservedAttributes[i]] = 1;
    createScript.reservedAttributes = reservedAttributes;


    return {
        createScript: createScript,
        registerScript: registerScript
    };
}());