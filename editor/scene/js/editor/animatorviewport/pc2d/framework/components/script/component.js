Object.assign(pc2d, function () {

    var ScriptComponent = function ScriptComponent(system, entity) {
        pc2d.Component.call(this, system, entity);

        // holds all script instances for this component
        this._scripts = [];
        // holds all script instances with an update method
        this._updateList = new pc2d.SortedLoopArray({ sortBy: '__executionOrder' });
        // holds all script instances with a postUpdate method
        this._postUpdateList = new pc2d.SortedLoopArray({ sortBy: '__executionOrder' });

        this._scriptsIndex = {};
        this._destroyedScripts = [];
        this._destroyed = false;
        this._scriptsData = null;
        this._oldState = true;

        // override default 'enabled' property of base pc2d.Component
        // because this is faster
        this._enabled = true;

        // whether this component is currently being enabled
        this._beingEnabled = false;
        // if true then we are currently looping through
        // script instances. This is used to prevent a scripts array
        // from being modified while a loop is being executed
        this._isLoopingThroughScripts = false;

        // the order that this component will be updated
        // by the script system. This is set by the system itself.
        this._executionOrder = -1;

        this.on('set_enabled', this._onSetEnabled, this);
    };
    ScriptComponent.prototype = Object.create(pc2d.Component.prototype);
    ScriptComponent.prototype.constructor = ScriptComponent;

    ScriptComponent.scriptMethods = {
        initialize: 'initialize',
        postInitialize: 'postInitialize',
        update: 'update',
        postUpdate: 'postUpdate',
        swap: 'swap'
    };

    Object.assign(ScriptComponent.prototype, {
        onEnable: function () {
            this._beingEnabled = true;
            this._checkState();

            if (!this.entity._beingEnabled) {
                this.onPostStateChange();
            }

            this._beingEnabled = false;
        },

        onDisable: function () {
            this._checkState();
        },

        onPostStateChange: function () {
            var script;

            var wasLooping = this._beginLooping();

            for (var i = 0, len = this.scripts.length; i < len; i++) {
                script = this.scripts[i];

                if (script._initialized && !script._postInitialized && script.enabled) {
                    script._postInitialized = true;

                    if (script.postInitialize)
                        this._scriptMethod(script, ScriptComponent.scriptMethods.postInitialize);
                }
            }

            this._endLooping(wasLooping);
        },

        // Sets isLoopingThroughScripts to false and returns
        // its previous value
        _beginLooping: function () {
            var looping = this._isLoopingThroughScripts;
            this._isLoopingThroughScripts = true;
            return looping;
        },

        // Restores isLoopingThroughScripts to the specified parameter
        // If all loops are over then remove destroyed scripts form the _scripts array
        _endLooping: function (wasLoopingBefore) {
            this._isLoopingThroughScripts = wasLoopingBefore;
            if (!this._isLoopingThroughScripts) {
                this._removeDestroyedScripts();
            }
        },

        _onSetEnabled: function (prop, old, value) {
            this._beingEnabled = true;
            this._checkState();
            this._beingEnabled = false;
        },

        _checkState: function () {
            var state = this.enabled && this.entity.enabled;
            if (state === this._oldState)
                return;

            this._oldState = state;

            this.fire(state ? 'enable' : 'disable');
            this.fire('state', state);

            if (state) {
                this.system._addComponentToEnabled(this);
            } else {
                this.system._removeComponentFromEnabled(this);
            }

            var wasLooping = this._beginLooping();

            var script;
            for (var i = 0, len = this.scripts.length; i < len; i++) {
                script = this.scripts[i];
                script.enabled = script._enabled;
            }

            this._endLooping(wasLooping);
        },

        _onBeforeRemove: function () {
            this.fire('remove');

            var wasLooping = this._beginLooping();

            // destroy all scripts
            for (var i = 0; i < this.scripts.length; i++) {
                var script = this.scripts[i];
                if (!script) continue;

                this.destroy(script.__scriptType.__name);
            }

            this._endLooping(wasLooping);
        },

        _removeDestroyedScripts: function () {
            var len = this._destroyedScripts.length;
            if (!len) return;

            var i;
            for (i = 0; i < len; i++) {
                var script = this._destroyedScripts[i];
                this._removeScriptInstance(script);
            }

            this._destroyedScripts.length = 0;

            // update execution order for scripts
            this._resetExecutionOrder(0, this._scripts.length);
        },

        _onInitializeAttributes: function () {
            for (var i = 0, len = this.scripts.length; i < len; i++)
                this.scripts[i].__initializeAttributes();
        },

        _scriptMethod: function (script, method, arg) {
            // #ifdef DEBUG
            try {
            // #endif
                script[method](arg);
            // #ifdef DEBUG
            } catch (ex) {
                // disable script if it fails to call method
                script.enabled = false;

                if (!script._callbacks || !script._callbacks.error) {
                    console.warn('unhandled exception while calling "' + method + '" for "' + script.__scriptType.__name + '" script: ', ex);
                    console.error(ex);
                }

                script.fire('error', ex, method);
                this.fire('error', script, ex, method);
            }
            // #endif
        },

        _onInitialize: function () {
            var script, scripts = this._scripts;

            var wasLooping = this._beginLooping();

            for (var i = 0, len = scripts.length; i < len; i++) {
                script = scripts[i];
                if (!script._initialized && script.enabled) {
                    script._initialized = true;
                    if (script.initialize)
                        this._scriptMethod(script, ScriptComponent.scriptMethods.initialize);
                }
            }

            this._endLooping(wasLooping);
        },

        _onPostInitialize: function () {
            this.onPostStateChange();
        },

        _onUpdate: function (dt) {
            var self = this;
            var list = self._updateList;
            if (! list.length) return;

            var script;

            var wasLooping = self._beginLooping();

            for (list.loopIndex = 0; list.loopIndex < list.length; list.loopIndex++) {
                script = list.items[list.loopIndex];
                if (script.enabled) {
                    self._scriptMethod(script, ScriptComponent.scriptMethods.update, dt);
                }
            }

            self._endLooping(wasLooping);
        },

        _onPostUpdate: function (dt) {
            var self = this;
            var list = self._postUpdateList;
            if (! list.length) return;

            var wasLooping = self._beginLooping();

            var script;

            for (list.loopIndex = 0; list.loopIndex < list.length; list.loopIndex++) {
                script = list.items[list.loopIndex];
                if (script.enabled) {
                    self._scriptMethod(script, ScriptComponent.scriptMethods.postUpdate, dt);
                }
            }

            self._endLooping(wasLooping);
        },

      
        _insertScriptInstance: function (scriptInstance, index, scriptsLength) {
            if (index === -1) {
                // append script at the end and set execution order
                this._scripts.push(scriptInstance);
                scriptInstance.__executionOrder = scriptsLength;

                // append script to the update list if it has an update method
                if (scriptInstance.update) {
                    this._updateList.append(scriptInstance);
                }

                // add script to the postUpdate list if it has a postUpdate method
                if (scriptInstance.postUpdate) {
                    this._postUpdateList.append(scriptInstance);
                }
            } else {
                // insert script at index and set execution order
                this._scripts.splice(index, 0, scriptInstance);
                scriptInstance.__executionOrder = index;

                // now we also need to update the execution order of all
                // the script instances that come after this script
                this._resetExecutionOrder(index + 1, scriptsLength + 1);

                // insert script to the update list if it has an update method
                // in the right order
                if (scriptInstance.update) {
                    this._updateList.insert(scriptInstance);
                }

                // insert script to the postUpdate list if it has a postUpdate method
                // in the right order
                if (scriptInstance.postUpdate) {
                    this._postUpdateList.insert(scriptInstance);
                }
            }
        },

        _removeScriptInstance: function (scriptInstance) {
            var idx = this._scripts.indexOf(scriptInstance);
            if (idx === -1) return idx;

            this._scripts.splice(idx, 1);

            if (scriptInstance.update) {
                this._updateList.remove(scriptInstance);
            }

            if (scriptInstance.postUpdate) {
                this._postUpdateList.remove(scriptInstance);
            }

            return idx;
        },

        _resetExecutionOrder: function (startIndex, scriptsLength) {
            for (var i = startIndex; i < scriptsLength; i++) {
                this._scripts[i].__executionOrder = i;
            }
        },

     
        has: function (name) {
            return !!this._scriptsIndex[name];
        },

      
        get: function (name) {
            var index = this._scriptsIndex[name];
            return (index && index.instance) || null;
        },

        /* eslint-enable jsdoc/no-undefined-types */
        create: function (name, args) {
            var self = this;
            args = args || { };

            var scriptType = name;
            var scriptName = name;

            // shorthand using script name
            if (typeof scriptType === 'string') {
                scriptType = this.system.app.scripts.get(scriptType);
            } else if (scriptType) {
                scriptName = scriptType.__name;
            }

            if (scriptType) {
                if (!this._scriptsIndex[scriptType.__name] || !this._scriptsIndex[scriptType.__name].instance) {
                    // create script instance
                    var scriptInstance = new scriptType({
                        app: this.system.app,
                        entity: this.entity,
                        enabled: args.hasOwnProperty('enabled') ? args.enabled : true,
                        attributes: args.attributes
                    });

                    var len = this._scripts.length;
                    var ind = -1;
                    if (typeof args.ind === 'number' && args.ind !== -1 && len > args.ind)
                        ind = args.ind;

                    this._insertScriptInstance(scriptInstance, ind, len);

                    this._scriptsIndex[scriptType.__name] = {
                        instance: scriptInstance,
                        onSwap: function () {
                            self.swap(scriptType.__name);
                        }
                    };

                    this[scriptType.__name] = scriptInstance;

                    if (!args.preloading)
                        scriptInstance.__initializeAttributes();

                    this.fire('create', scriptType.__name, scriptInstance);
                    this.fire('create:' + scriptType.__name, scriptInstance);

                    this.system.app.scripts.on('swap:' + scriptType.__name, this._scriptsIndex[scriptType.__name].onSwap);

                    if (!args.preloading) {

                        if (scriptInstance.enabled && !scriptInstance._initialized) {
                            scriptInstance._initialized = true;

                            if (scriptInstance.initialize)
                                this._scriptMethod(scriptInstance, ScriptComponent.scriptMethods.initialize);
                        }

                        if (scriptInstance.enabled && !scriptInstance._postInitialized) {
                            scriptInstance._postInitialized = true;
                            if (scriptInstance.postInitialize)
                                this._scriptMethod(scriptInstance, ScriptComponent.scriptMethods.postInitialize);
                        }
                    }


                    return scriptInstance;
                }

                console.warn('script \'' + scriptName + '\' is already added to entity \'' + this.entity.name + '\'');
            } else {
                this._scriptsIndex[scriptName] = {
                    awaiting: true,
                    ind: this._scripts.length
                };

                console.warn('script \'' + scriptName + '\' is not found, awaiting it to be added to registry');
            }

            return null;
        },

        destroy: function (name) {
            var scriptName = name;
            var scriptType = name;

            // shorthand using script name
            if (typeof scriptType === 'string') {
                scriptType = this.system.app.scripts.get(scriptType);
                if (scriptType)
                    scriptName = scriptType.__name;
            }

            var scriptData = this._scriptsIndex[scriptName];
            delete this._scriptsIndex[scriptName];
            if (!scriptData) return false;

            if (scriptData.instance && !scriptData.instance._destroyed) {
                scriptData.instance.enabled = false;
                scriptData.instance._destroyed = true;

                // if we are not currently looping through our scripts
                // then it's safe to remove the script
                if (!this._isLoopingThroughScripts) {
                    var ind = this._removeScriptInstance(scriptData.instance);
                    if (ind >= 0) {
                        this._resetExecutionOrder(ind, this._scripts.length);
                    }
                } else {
                    // otherwise push the script in _destroyedScripts and
                    // remove it from _scripts when the loop is over
                    this._destroyedScripts.push(scriptData.instance);
                }
            }

            // remove swap event
            this.system.app.scripts.off('swap:' + scriptName, scriptData.onSwap);

            delete this[scriptName];

            this.fire('destroy', scriptName, scriptData.instance || null);
            this.fire('destroy:' + scriptName, scriptData.instance || null);

            if (scriptData.instance)
                scriptData.instance.fire('destroy');

            return true;
        },

        swap: function (script) {
            var scriptType = script;

            // shorthand using script name
            if (typeof scriptType === 'string')
                scriptType = this.system.app.scripts.get(scriptType);

            var old = this._scriptsIndex[scriptType.__name];
            if (!old || !old.instance) return false;

            var scriptInstanceOld = old.instance;
            var ind = this._scripts.indexOf(scriptInstanceOld);

            var scriptInstance = new scriptType({
                app: this.system.app,
                entity: this.entity,
                enabled: scriptInstanceOld.enabled,
                attributes: scriptInstanceOld.__attributes
            });

            if (!scriptInstance.swap)
                return false;

            scriptInstance.__initializeAttributes();

            // add to component
            this._scripts[ind] = scriptInstance;
            this._scriptsIndex[scriptType.__name].instance = scriptInstance;
            this[scriptType.__name] = scriptInstance;

            // set execution order and make sure we update
            // our update and postUpdate lists
            scriptInstance.__executionOrder = ind;
            if (scriptInstanceOld.update) {
                this._updateList.remove(scriptInstanceOld);
            }
            if (scriptInstanceOld.postUpdate) {
                this._postUpdateList.remove(scriptInstanceOld);
            }

            if (scriptInstance.update) {
                this._updateList.insert(scriptInstance);
            }
            if (scriptInstance.postUpdate) {
                this._postUpdateList.insert(scriptInstance);
            }

            this._scriptMethod(scriptInstance, ScriptComponent.scriptMethods.swap, scriptInstanceOld);

            this.fire('swap', scriptType.__name, scriptInstance);
            this.fire('swap:' + scriptType.__name, scriptInstance);

            return true;
        },

        resolveDuplicatedEntityReferenceProperties: function (oldScriptComponent, duplicatedIdsMap) {
            var newScriptComponent = this.entity.script;

            // for each script in the old compononent
            for (var scriptName in oldScriptComponent._scriptsIndex) {
                // get the script type from the script registry
                var scriptType = this.system.app.scripts.get(scriptName);
                if (! scriptType) {
                    continue;
                }

                // get the script from the component's index
                var script = oldScriptComponent._scriptsIndex[scriptName];
                if (! script || ! script.instance) {
                    continue;
                }

                var newAttributesRaw = newScriptComponent[scriptName].__attributesRaw;
                var newAttributes = newScriptComponent[scriptName].__attributes;
                if (! newAttributesRaw && ! newAttributes) {
                    continue;
                }

                // get the old script attributes from the instance
                var oldAttributes = script.instance.__attributes;
                for (var attributeName in oldAttributes) {
                    if (! oldAttributes[attributeName]) {
                        continue;
                    }

                    // get the attribute definition from the script type
                    var attribute = scriptType.attributes.get(attributeName);
                    if (! attribute || attribute.type !== 'entity') {
                        continue;
                    }

                    if (attribute.array) {
                        // handle entity array attribute
                        var oldGuidArray = oldAttributes[attributeName];
                        var len = oldGuidArray.length;
                        if (! len) {
                            continue;
                        }

                        var newGuidArray = oldGuidArray.slice();
                        for (var i = 0; i < len; i++) {
                            var guid = newGuidArray[i] instanceof pc2d.Entity ? newGuidArray[i].getGuid() : newGuidArray[i];
                            if (duplicatedIdsMap[guid]) {
                                // if we are using attributesRaw then use the guid otherwise use the entity
                                newGuidArray[i] = newAttributesRaw ? duplicatedIdsMap[guid].getGuid() : duplicatedIdsMap[guid];
                            }
                        }

                        if (newAttributesRaw) {
                            newAttributesRaw[attributeName] = newGuidArray;
                        } else {
                            newAttributes[attributeName] = newGuidArray;
                        }
                    } else {
                        // handle regular entity attribute
                        var oldGuid = oldAttributes[attributeName];
                        if (oldGuid instanceof pc2d.Entity) {
                            oldGuid = oldGuid.getGuid();
                        } else if (typeof oldGuid !== 'string') {
                            continue;
                        }

                        if (duplicatedIdsMap[oldGuid]) {
                            if (newAttributesRaw) {
                                newAttributesRaw[attributeName] = duplicatedIdsMap[oldGuid].getGuid();
                            } else {
                                newAttributes[attributeName] = duplicatedIdsMap[oldGuid];
                            }
                        }

                    }
                }
            }
        },

        move: function (name, ind) {
            var len = this._scripts.length;
            if (ind >= len || ind < 0)
                return false;

            var scriptName = name;

            if (typeof scriptName !== 'string')
                scriptName = name.__name;

            var scriptData = this._scriptsIndex[scriptName];
            if (!scriptData || !scriptData.instance)
                return false;

            var indOld = this._scripts.indexOf(scriptData.instance);
            if (indOld === -1 || indOld === ind)
                return false;

            // move script to another position
            this._scripts.splice(ind, 0, this._scripts.splice(indOld, 1)[0]);

            // reset execution order for scripts and re-sort update and postUpdate lists
            this._resetExecutionOrder(0, len);
            this._updateList.sort();
            this._postUpdateList.sort();

            this.fire('move', scriptName, scriptData.instance, ind, indOld);
            this.fire('move:' + scriptName, scriptData.instance, ind, indOld);

            return true;
        }
    });

    Object.defineProperty(ScriptComponent.prototype, 'enabled', {
        get: function () {
            return this._enabled;
        },
        set: function (value) {
            var oldValue = this._enabled;
            this._enabled = value;
            this.fire('set', 'enabled', oldValue, value);
        }
    });

    Object.defineProperty(ScriptComponent.prototype, 'scripts', {
        get: function () {
            return this._scripts;
        },
        set: function (value) {
            this._scriptsData = value;

            for (var key in value) {
                if (!value.hasOwnProperty(key))
                    continue;

                var script = this._scriptsIndex[key];
                if (script) {
                    // existing script

                    // enabled
                    if (typeof value[key].enabled === 'boolean')
                        script.enabled = !!value[key].enabled;

                    // attributes
                    if (typeof value[key].attributes === 'object') {
                        for (var attr in value[key].attributes) {
                            if (pc2d.createScript.reservedAttributes[attr])
                                continue;

                            if (!script.__attributes.hasOwnProperty(attr)) {
                                // new attribute
                                var scriptType = this.system.app.scripts.get(key);
                                if (scriptType)
                                    scriptType.attributes.add(attr, { });
                            }

                            // update attribute
                            script[attr] = value[key].attributes[attr];
                        }
                    }
                } else {
                    // TODO scripts2
                    // new script
                    console.log(this.order);
                }
            }
        }
    });

    return {
        ScriptComponent: ScriptComponent
    };
}());