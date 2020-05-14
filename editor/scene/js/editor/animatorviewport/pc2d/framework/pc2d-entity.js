Object.assign(pc2d, function () {
    var Entity = function (name, app){
        pc2d.GraphNode.call(this, name);

        if (name instanceof pc2d.Application) app = name;
        this._batchHandle = null; // The handle for a RequestBatch, set this if you want to Component's to load their resources using a pre-existing RequestBatch.
        this.c = {}; // Component storage

        this._app = app; // store app
        if (!app) {
            this._app = pc2d.Application.getApplication(); // get the current application
            if (!this._app) {
                throw new Error("Couldn't find current application");
            }
        }

        this._guid = null;

        // used by component systems to speed up destruction
        this._destroying = false;
    };
    Entity.prototype = Object.create(pc2d.GraphNode.prototype);
    Entity.prototype.constructor = Entity;

 
    Entity.prototype.addComponent = function (type, data) {
        var system = this._app.systems[type];
        if (!system) {
            // #ifdef DEBUG
            console.error("addComponent: System " + type + " doesn't exist");
            // #endif
            return null;
        }
        if (this.c[type]) {
            // #ifdef DEBUG
            console.warn("addComponent: Entity already has " + type + " component");
            // #endif
            return null;
        }
        return system.addComponent(this, data);
    };

    Entity.prototype.removeComponent = function (type) {
        var system = this._app.systems[type];
        if (!system) {
            // #ifdef DEBUG
            console.error("removeComponent: System " + type + " doesn't exist");
            // #endif
            return;
        }
        if (!this.c[type]) {
            // #ifdef DEBUG
            console.warn("removeComponent: Entity doesn't have " + type + " component");
            // #endif
            return;
        }
        system.removeComponent(this);
    };

    Entity.prototype.findComponent = function (type) {
        var entity = this.findOne(function (node) {
            return node.c && node.c[type];
        });
        return entity && entity.c[type];
    };

    Entity.prototype.findComponents = function (type) {
        var entities = this.find(function (node) {
            return node.c && node.c[type];
        });
        return entities.map(function (entity) {
            return entity.c[type];
        });
    };

    Entity.prototype.getGuid = function () {
        // if the guid hasn't been set yet then set it now
        // before returning it
        if (! this._guid) {
            this.setGuid(pc2d.guid.create());
        }

        return this._guid;
    };

    Entity.prototype.setGuid = function (guid) {
        // remove current guid from entityIndex
        var index = this._app._entityIndex;
        if (this._guid) {
            delete index[this._guid];
        }

        // add new guid to entityIndex
        this._guid = guid;
        index[this._guid] = this;
    };

    Entity.prototype._notifyHierarchyStateChanged = function (node, enabled) {
        var enableFirst = false;
        if (node === this && this._app._enableList.length === 0)
            enableFirst = true;

        node._beingEnabled = true;

        node._onHierarchyStateChanged(enabled);

        if (node._onHierarchyStatePostChanged)
            this._app._enableList.push(node);

        var i, len;
        var c = node._children;
        for (i = 0, len = c.length; i < len; i++) {
            if (c[i]._enabled)
                this._notifyHierarchyStateChanged(c[i], enabled);
        }

        node._beingEnabled = false;

        if (enableFirst) {
            // do not cache the length here, as enableList may be added to during loop
            for (i = 0; i < this._app._enableList.length; i++) {
                this._app._enableList[i]._onHierarchyStatePostChanged();
            }

            this._app._enableList.length = 0;
        }
    };

    Entity.prototype._onHierarchyStateChanged = function (enabled) {
        pc2d.GraphNode.prototype._onHierarchyStateChanged.call(this, enabled);

        // enable / disable all the components
        var component;
        var components = this.c;
        for (var type in components) {
            if (components.hasOwnProperty(type)) {
                component = components[type];
                if (component.enabled) {
                    if (enabled) {
                        component.onEnable();
                    } else {
                        component.onDisable();
                    }
                }
            }
        }
    };

    Entity.prototype._onHierarchyStatePostChanged = function () {
        // post enable all the components
        var components = this.c;
        for (var type in components) {
            if (components.hasOwnProperty(type))
                components[type].onPostStateChange();
        }
    };

    Entity.prototype.findByGuid = function (guid) {
        if (this._guid === guid) return this;

        var e = this._app._entityIndex[guid];
        if (e && (e === this || e.isDescendantOf(this))) {
            return e;
        }

        return null;
    };

    Entity.prototype.destroy = function () {
        var name;

        this._destroying = true;

        // Disable all enabled components first
        for (name in this.c) {
            this.c[name].enabled = false;
        }

        // Remove all components
        for (name in this.c) {
            this.c[name].system.removeComponent(this);
        }

        // Detach from parent
        if (this._parent)
            this._parent.removeChild(this);

        var children = this._children;
        var child = children.shift();
        while (child) {
            if (child instanceof pc2d.Entity) {
                child.destroy();
            }
            child._parent = null;

            child = children.shift();
        }

        // fire destroy event
        this.fire('destroy', this);

        // clear all events
        this.off();

        // remove from entity index
        if (this._guid) {
            delete this._app._entityIndex[this._guid];
        }

        this._destroying = false;
    };

    Entity.prototype.clone = function () {
        var duplicatedIdsMap = {};
        var clone = this._cloneRecursively(duplicatedIdsMap);
        duplicatedIdsMap[this.getGuid()] = clone;

        resolveDuplicatedEntityReferenceProperties(this, this, clone, duplicatedIdsMap);

        return clone;
    };

    Entity.prototype.cloneShallow = function() {
        var clone = new pc2d.Entity(this._app);
        pc2d.GraphNode.prototype._cloneInternal.call(this, clone);

        for (var type in this.c) {
            var component = this.c[type];
            component.system.cloneComponent(this, clone);
        }
        return clone;
    }

    Entity.prototype._cloneRecursively = function (duplicatedIdsMap) {
        var clone = new pc2d.Entity(this._app);
        pc2d.GraphNode.prototype._cloneInternal.call(this, clone);

        for (var type in this.c) {
            var component = this.c[type];
            component.system.cloneComponent(this, clone);
        }

        var i;
        for (i = 0; i < this._children.length; i++) {
            var oldChild = this._children[i];
            if (oldChild instanceof pc2d.Entity) {
                var newChild = oldChild._cloneRecursively(duplicatedIdsMap);
                clone.addChild(newChild);
                duplicatedIdsMap[oldChild.getGuid()] = newChild;
            }
        }

        return clone;
    };
    function resolveDuplicatedEntityReferenceProperties(oldSubtreeRoot, oldEntity, newEntity, duplicatedIdsMap) {
        var i, len;

        if (oldEntity instanceof pc2d.Entity) {
            var components = oldEntity.c;

            // Handle component properties
            for (var componentName in components) {
                var component = components[componentName];
                var entityProperties = component.system.getPropertiesOfType('entity');

                for (i = 0, len = entityProperties.length; i < len; i++) {
                    var propertyDescriptor = entityProperties[i];
                    var propertyName = propertyDescriptor.name;
                    var oldEntityReferenceId = component[propertyName];
                    var entityIsWithinOldSubtree = !!oldSubtreeRoot.findByGuid(oldEntityReferenceId);

                    if (entityIsWithinOldSubtree) {
                        var newEntityReferenceId = duplicatedIdsMap[oldEntityReferenceId].getGuid();

                        if (newEntityReferenceId) {
                            newEntity.c[componentName][propertyName] = newEntityReferenceId;
                        } else {
                            console.warn('Could not find corresponding entity id when resolving duplicated entity references');
                        }
                    }
                }
            }

            // Handle entity script attributes
            if (components.script && ! newEntity._app.useLegacyScriptAttributeCloning) {
                newEntity.script.resolveDuplicatedEntityReferenceProperties(components.script, duplicatedIdsMap);
            }

            // Recurse into children. Note that we continue to pass in the same `oldSubtreeRoot`,
            // in order to correctly handle cases where a child has an entity reference
            // field that points to a parent or other ancestor that is still within the
            // duplicated subtree.
            var _old = oldEntity.children.filter(function (e) {
                return (e instanceof pc2d.Entity);
            });
            var _new = newEntity.children.filter(function (e) {
                return (e instanceof pc2d.Entity);
            });

            for (i = 0, len = _old.length; i < len; i++) {
                resolveDuplicatedEntityReferenceProperties(oldSubtreeRoot, _old[i], _new[i], duplicatedIdsMap);
            }
        }
    }

    return {
        Entity: Entity
    };
}());