Object.assign(pc2d, function () {


    var GraphNode = function GraphNode(name) {
        pc2d.EventHandler.call(this);

        this.name = typeof name === "string" ? name : "Untitled"; // Non-unique human readable name
        this.tags = new pc2d.Tags(this);

        this._labels = {};

  
        this._dirtyLocal = false;
        this._aabbVer = 0;


        this._frozen = false;

        this._dirtyWorld = false;

        this._dirtyNormal = true;

        this._right = null;
        this._up = null;
        this._forward = null;

        this._parent = null;
        this._children = [];
        this._graphDepth = 0;

        this._enabled = true;
        this._enabledInHierarchy = false;

        this.scaleCompensation = false;
    };
    GraphNode.prototype = Object.create(pc2d.EventHandler.prototype);
    GraphNode.prototype.constructor = GraphNode;

    Object.defineProperty(GraphNode.prototype, 'enabled', {
        get: function () {
            return this._enabled && this._enabledInHierarchy;
        },

        set: function (enabled) {
            if (this._enabled !== enabled) {
                this._enabled = enabled;

                if (!this._parent || this._parent.enabled)
                    this._notifyHierarchyStateChanged(this, enabled);
            }
        }
    });
    Object.defineProperty(GraphNode.prototype, 'parent', {
        get: function () {
            return this._parent;
        }
    });
    Object.defineProperty(GraphNode.prototype, 'path', {
        get: function () {
            var parent = this._parent;
            if (parent) {
                var path = this.name;
                var format = "{0}/{1}";

                while (parent && parent._parent) {
                    path = pc2d.string.format(format, parent.name, path);
                    parent = parent._parent;
                }

                return path;
            }
            return '';
        }
    });
    Object.defineProperty(GraphNode.prototype, 'root', {
        get: function () {
            var parent = this._parent;
            if (!parent)
                return this;

            while (parent._parent)
                parent = parent._parent;

            return parent;
        }
    });
    Object.defineProperty(GraphNode.prototype, 'children', {
        get: function () {
            return this._children;
        }
    });

    Object.defineProperty(GraphNode.prototype, 'graphDepth', {
        get: function () {
            return this._graphDepth;
        }
    });

    Object.assign(GraphNode.prototype, {
        _notifyHierarchyStateChanged: function (node, enabled) {
            node._onHierarchyStateChanged(enabled);

            var c = node._children;
            for (var i = 0, len = c.length; i < len; i++) {
                if (c[i]._enabled)
                    this._notifyHierarchyStateChanged(c[i], enabled);
            }
        },

        _onHierarchyStateChanged: function (enabled) {
            // Override in derived classes
            this._enabledInHierarchy = enabled;
            if (enabled && !this._frozen)
                this._unfreezeParentToRoot();
        },

        _cloneInternal: function (clone) {
            clone.name = this.name;

            var tags = this.tags._list;
            for (var i = 0; i < tags.length; i++)
                clone.tags.add(tags[i]);

            clone._labels = Object.assign({}, this._labels);

          
            clone._dirtyLocal = this._dirtyLocal;
            clone._dirtyWorld = this._dirtyWorld;
            clone._dirtyNormal = this._dirtyNormal;
            clone._aabbVer = this._aabbVer + 1;
            clone._enabled = this._enabled;
            // false as this node is not in the hierarchy yet
            clone._enabledInHierarchy = false;
        },

        clone: function () {
            var clone = new pc2d.GraphNode();
            this._cloneInternal(clone);
            return clone;
        },

        find: function (attr, value) {
            var result, results = [];
            var len = this._children.length;
            var i, descendants;

            if (attr instanceof Function) {
                var fn = attr;

                result = fn(this);
                if (result)
                    results.push(this);

                for (i = 0; i < len; i++) {
                    descendants = this._children[i].find(fn);
                    if (descendants.length)
                        results = results.concat(descendants);
                }
            } else {
                var testValue;

                if (this[attr]) {
                    if (this[attr] instanceof Function) {
                        testValue = this[attr]();
                    } else {
                        testValue = this[attr];
                    }
                    if (testValue === value)
                        results.push(this);
                }

                for (i = 0; i < len; ++i) {
                    descendants = this._children[i].find(attr, value);
                    if (descendants.length)
                        results = results.concat(descendants);
                }
            }

            return results;
        },
        findOne: function (attr, value) {
            var i;
            var len = this._children.length;
            var result = null;

            if (attr instanceof Function) {
                var fn = attr;

                result = fn(this);
                if (result)
                    return this;

                for (i = 0; i < len; i++) {
                    result = this._children[i].findOne(fn);
                    if (result)
                        return result;
                }
            } else {
                var testValue;
                if (this[attr]) {
                    if (this[attr] instanceof Function) {
                        testValue = this[attr]();
                    } else {
                        testValue = this[attr];
                    }
                    if (testValue === value) {
                        return this;
                    }
                }

                for (i = 0; i < len; i++) {
                    result = this._children[i].findOne(attr, value);
                    if (result !== null)
                        return result;
                }
            }

            return null;
        },

        findByTag: function () {
            var tags = this.tags._processArguments(arguments);
            return this._findByTag(tags);
        },

        _findByTag: function (tags) {
            var result = [];
            var i, len = this._children.length;
            var descendants;

            for (i = 0; i < len; i++) {
                if (this._children[i].tags._has(tags))
                    result.push(this._children[i]);

                descendants = this._children[i]._findByTag(tags);
                if (descendants.length)
                    result = result.concat(descendants);
            }

            return result;
        },

        findByName: function (name) {
            if (this.name === name) return this;

            for (var i = 0; i < this._children.length; i++) {
                var found = this._children[i].findByName(name);
                if (found !== null) return found;
            }
            return null;
        },
        findByPath: function (path) {
            // split the paths in parts. Each part represents a deeper hierarchy level
            var parts = path.split('/');
            var currentParent = this;
            var result = null;

            for (var i = 0, imax = parts.length; i < imax && currentParent; i++) {
                var part = parts[i];

                result = null;

                // check all the children
                var children = currentParent._children;
                for (var j = 0, jmax = children.length; j < jmax; j++) {
                    if (children[j].name == part) {
                        result = children[j];
                        break;
                    }
                }

                // keep going deeper in the hierarchy
                currentParent = result;
            }

            return result;
        },
        forEach: function (callback, thisArg) {
            callback.call(thisArg, this);

            var children = this._children;
            for (var i = 0; i < children.length; i++) {
                children[i].forEach(callback, thisArg);
            }
        },
        isDescendantOf: function (node) {
            var parent = this._parent;
            while (parent) {
                if (parent === node)
                    return true;

                parent = parent._parent;
            }
            return false;
        },
        isAncestorOf: function (node) {
            return node.isDescendantOf(this);
        },


        reparent: function (parent, index) {
            var current = this._parent;

            if (current)
                current.removeChild(this);

            if (parent) {
                if (index >= 0) {
                    parent.insertChild(this, index);
                } else {
                    parent.addChild(this);
                }
            }
        },

        _dirtifyLocal: function () {
            if (!this._dirtyLocal) {
                this._dirtyLocal = true;
                if (!this._dirtyWorld)
                    this._dirtifyWorld();
            }
        },

        _unfreezeParentToRoot: function () {
            var p = this._parent;
            while (p) {
                p._frozen = false;
                p = p._parent;
            }
        },

        _dirtifyWorld: function () {
            if (!this._dirtyWorld)
                this._unfreezeParentToRoot();
            this._dirtifyWorldInternal();
        },

        _dirtifyWorldInternal: function () {
            if (!this._dirtyWorld) {
                this._frozen = false;
                this._dirtyWorld = true;
                for (var i = 0; i < this._children.length; i++) {
                    if (!this._children[i]._dirtyWorld)
                        this._children[i]._dirtifyWorldInternal();
                }
            }
            this._dirtyNormal = true;
            this._aabbVer++;
        },


        addChild: function (node) {
            if (node._parent !== null)
                throw new Error("GraphNode is already parented");

            this._children.push(node);
            this._onInsertChild(node);
        },

        addChildAndSaveTransform: function (node) {

            var current = node._parent;
            if (current)
                current.removeChild(node);


            this._children.push(node);
            this._onInsertChild(node);
        },

        insertChild: function (node, index) {
            if (node._parent !== null)
                throw new Error("GraphNode is already parented");

            this._children.splice(index, 0, node);
            this._onInsertChild(node);
        },

        _onInsertChild: function (node) {
            node._parent = this;

            // the child node should be enabled in the hierarchy only if itself is enabled and if
            // this parent is enabled
            var enabledInHierarchy = (node._enabled && this.enabled);
            if (node._enabledInHierarchy !== enabledInHierarchy) {
                node._enabledInHierarchy = enabledInHierarchy;
                node._notifyHierarchyStateChanged(node, enabledInHierarchy);
            }

            // The graph depth of the child and all of its descendants will now change
            node._updateGraphDepth();

            // The child (plus subhierarchy) will need world transforms to be recalculated
            node._dirtifyWorld();
            // node might be already marked as dirty, in that case the whole chain stays frozen, so let's enforce unfreeze
            if (this._frozen)
                node._unfreezeParentToRoot();

            // alert an entity that it has been inserted
            if (node.fire) node.fire('insert', this);

            // alert the parent that it has had a child inserted
            if (this.fire) this.fire('childinsert', node);
        },

        _updateGraphDepth: function () {
            if (this._parent) {
                this._graphDepth = this._parent._graphDepth + 1;
            } else {
                this._graphDepth = 0;
            }

            for (var i = 0, len = this._children.length; i < len; i++) {
                this._children[i]._updateGraphDepth();
            }
        },

        removeChild: function (child) {
            var i;
            var length = this._children.length;

            // Remove from child list
            for (i = 0; i < length; ++i) {
                if (this._children[i] === child) {
                    this._children.splice(i, 1);

                    // Clear parent
                    child._parent = null;

                    // alert child that it has been removed
                    if (child.fire) child.fire('remove', this);

                    // alert the parent that it has had a child removed
                    if (this.fire) this.fire('childremove', child);

                    return;
                }
            }
        },

        _sync: function () {
            if (this._dirtyLocal) {
                this._dirtyLocal = false;
            }
        },

        syncHierarchy: function () {
            if (!this._enabled)
                return;

            if (this._frozen)
                return;
            this._frozen = true;

            if (this._dirtyLocal || this._dirtyWorld) {
                this._sync();
            }

            var children = this._children;
            for (var i = 0, len = children.length; i < len; i++) {
                children[i].syncHierarchy();
            }
        }
    });

    return {
        GraphNode: GraphNode
    };
}());