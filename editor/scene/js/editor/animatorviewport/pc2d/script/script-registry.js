Object.assign(pc2d, function () {

    var ScriptRegistry = function (app) {
        pc2d.EventHandler.call(this);

        this.app = app;
        this._scripts = { };
        this._list = [];
    };
    ScriptRegistry.prototype = Object.create(pc2d.EventHandler.prototype);
    ScriptRegistry.prototype.constructor = ScriptRegistry;

    ScriptRegistry.prototype.destroy = function () {
        this.app = null;
        this.off();
    };

    ScriptRegistry.prototype.add = function (script) {
        var self = this;
        var scriptName = script.__name;

        if (this._scripts.hasOwnProperty(scriptName)) {
            setTimeout(function () {
                if (script.prototype.swap) {
                    // swapping
                    var old = self._scripts[scriptName];
                    var ind = self._list.indexOf(old);
                    self._list[ind] = script;
                    self._scripts[scriptName] = script;

                    self.fire('swap', scriptName, script);
                    self.fire('swap:' + scriptName, script);
                } else {
                    console.warn('script registry already has \'' + scriptName + '\' script, define \'swap\' method for new script type to enable code hot swapping');
                }
            });
            return false;
        }

        this._scripts[scriptName] = script;
        this._list.push(script);

        this.fire('add', scriptName, script);
        this.fire('add:' + scriptName, script);

        // for all components awaiting Script Type
        // create script instance
        setTimeout(function () {
            if (!self._scripts.hasOwnProperty(scriptName))
                return;


            // this is a check for a possible error
            // that might happen if the app has been destroyed before
            // setTimeout has finished
            if (!self.app || !self.app.systems || !self.app.systems.script) {
                return;
            }

            var components = self.app.systems.script._components;
            var i, scriptInstance, attributes;
            var scriptInstances = [];
            var scriptInstancesInitialized = [];

            for (components.loopIndex = 0; components.loopIndex < components.length; components.loopIndex++) {
                var component = components.items[components.loopIndex];
                // check if awaiting for script
                if (component._scriptsIndex[scriptName] && component._scriptsIndex[scriptName].awaiting) {
                    if (component._scriptsData && component._scriptsData[scriptName])
                        attributes = component._scriptsData[scriptName].attributes;

                    scriptInstance = component.create(scriptName, {
                        preloading: true,
                        ind: component._scriptsIndex[scriptName].ind,
                        attributes: attributes
                    });

                    if (scriptInstance)
                        scriptInstances.push(scriptInstance);
                }
            }

            // initialize attributes
            for (i = 0; i < scriptInstances.length; i++)
                scriptInstances[i].__initializeAttributes();

            // call initialize()
            for (i = 0; i < scriptInstances.length; i++) {
                if (scriptInstances[i].enabled) {
                    scriptInstances[i]._initialized = true;

                    scriptInstancesInitialized.push(scriptInstances[i]);

                    if (scriptInstances[i].initialize)
                        scriptInstances[i].initialize();
                }
            }

            // call postInitialize()
            for (i = 0; i < scriptInstancesInitialized.length; i++) {
                if (!scriptInstancesInitialized[i].enabled || scriptInstancesInitialized[i]._postInitialized) {
                    continue;
                }

                scriptInstancesInitialized[i]._postInitialized = true;

                if (scriptInstancesInitialized[i].postInitialize)
                    scriptInstancesInitialized[i].postInitialize();
            }
        });

        return true;
    };

    ScriptRegistry.prototype.remove = function (nameOrType) {
        var scriptType = nameOrType;
        var scriptName = nameOrType;

        if (typeof scriptName !== 'string') {
            scriptName = scriptType.__name;
        } else {
            scriptType = this.get(scriptName);
        }

        if (this.get(scriptName) !== scriptType)
            return false;

        delete this._scripts[scriptName];
        var ind = this._list.indexOf(scriptType);
        this._list.splice(ind, 1);

        this.fire('remove', scriptName, scriptType);
        this.fire('remove:' + scriptName, scriptType);

        return true;
    };

    ScriptRegistry.prototype.get = function (name) {
        return this._scripts[name] || null;
    };

    ScriptRegistry.prototype.has = function (nameOrType) {
        if (typeof nameOrType === 'string') {
            return this._scripts.hasOwnProperty(nameOrType);
        }

        if (!nameOrType) return false;
        var scriptName = nameOrType.__name;
        return this._scripts[scriptName] === nameOrType;
    };

    ScriptRegistry.prototype.list = function () {
        return this._list;
    };


    return {
        ScriptRegistry: ScriptRegistry
    };
}());