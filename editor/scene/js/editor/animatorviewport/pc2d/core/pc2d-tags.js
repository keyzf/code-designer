Object.assign(pc2d, (function () {
    var TagsCache = function (key) {
        this._index = { };
        this._key = key || null;
    };

    Object.assign(TagsCache.prototype, {
        addItem: function (item) {
            var tags = item.tags._list;

            for (var i = 0; i < tags.length; i++)
                this.add(tags[i], item);
        },

        removeItem: function (item) {
            var tags = item.tags._list;

            for (var i = 0; i < tags.length; i++)
                this.remove(tags[i], item);
        },

        add: function (tag, item) {
            // already in cache
            if (this._index[tag] && this._index[tag].list.indexOf(item) !== -1)
                return;

            // create index for tag
            if (!this._index[tag]) {
                this._index[tag] = {
                    list: []
                };
                // key indexing is available
                if (this._key)
                    this._index[tag].keys = { };
            }

            // add to index list
            this._index[tag].list.push(item);

            // add to index keys
            if (this._key)
                this._index[tag].keys[item[this._key]] = item;
        },

        remove: function (tag, item) {
            // no index created for that tag
            if (!this._index[tag])
                return;

            // check if item not in cache
            if (this._key) {
                // by key
                if (!this._index[tag].keys[item[this._key]])
                    return;
            }

            // by position in list
            var ind = this._index[tag].indexOf(item);
            if (ind === -1)
                return;

            // remove item from index list
            this._index[tag].list.splice(ind, 1);

            // rmeove item from index keys
            if (this._key)
                delete this._index[tag].keys[item[this._key]];

            // if index empty, remove it
            if (this._index[tag].list.length === 0)
                delete this._index[tag];
        },

        find: function (args) {
            var self = this;
            var index = { };
            var items = [];
            var i, n, t;
            var item, tag, tags, tagsRest, missingIndex;

            var sort = function (a, b) {
                return self._index[a].list.length - self._index[b].list.length;
            };

            for (i = 0; i < args.length; i++) {
                tag = args[i];

                if (tag instanceof Array) {
                    if (tag.length === 0)
                        continue;

                    if (tag.length === 1) {
                        tag = tag[0];
                    } else {
                        // check if all indexes are in present
                        missingIndex = false;
                        for (t = 0; t < tag.length; t++) {
                            if (!this._index[tag[t]]) {
                                missingIndex = true;
                                break;
                            }
                        }
                        if (missingIndex)
                            continue;

                        // sort tags by least number of matches first
                        tags = tag.slice(0).sort(sort);

                        // remainder of tags for `has` checks
                        tagsRest = tags.slice(1);
                        if (tagsRest.length === 1)
                            tagsRest = tagsRest[0];

                        for (n = 0; n < this._index[tags[0]].list.length; n++) {
                            item = this._index[tags[0]].list[n];
                            if ((this._key ? !index[item[this._key]] : (items.indexOf(item) === -1)) && item.tags.has(tagsRest)) {
                                if (this._key)
                                    index[item[this._key]] = true;
                                items.push(item);
                            }
                        }

                        continue;
                    }
                }

                if (tag && typeof tag === 'string' && this._index[tag]) {
                    for (n = 0; n < this._index[tag].list.length; n++) {
                        item = this._index[tag].list[n];

                        if (this._key) {
                            if (!index[item[this._key]]) {
                                index[item[this._key]] = true;
                                items.push(item);
                            }
                        } else if (items.indexOf(item) === -1) {
                            items.push(item);
                        }
                    }
                }
            }

            return items;
        }
    });

    var Tags = function (parent) {
        pc2d.EventHandler.call(this);

        this._index = { };
        this._list = [];
        this._parent = parent;
    };
    Tags.prototype = Object.create(pc2d.EventHandler.prototype);
    Tags.prototype.constructor = Tags;

    Object.assign(Tags.prototype, {
     
        add: function () {
            var changed = false;
            var tags = this._processArguments(arguments, true);

            if (!tags.length)
                return changed;

            for (var i = 0; i < tags.length; i++) {
                if (this._index[tags[i]])
                    continue;

                changed = true;

                this._index[tags[i]] = true;
                this._list.push(tags[i]);

                this.fire('add', tags[i], this._parent);
            }

            if (changed)
                this.fire('change', this._parent);

            return changed;
        },

        remove: function () {
            var changed = false;

            if (!this._list.length)
                return changed;

            var tags = this._processArguments(arguments, true);

            if (!tags.length)
                return changed;

            for (var i = 0; i < tags.length; i++) {
                if (!this._index[tags[i]])
                    continue;

                changed = true;

                delete this._index[tags[i]];
                this._list.splice(this._list.indexOf(tags[i]), 1);

                this.fire('remove', tags[i], this._parent);
            }

            if (changed)
                this.fire('change', this._parent);

            return changed;
        },


        clear: function () {
            if (!this._list.length)
                return;

            var tags = this._list.slice(0);
            this._list = [];
            this._index = { };

            for (var i = 0; i < tags.length; i++)
                this.fire('remove', tags[i], this._parent);

            this.fire('change', this._parent);
        },


        has: function () {
            if (!this._list.length)
                return false;

            return this._has(this._processArguments(arguments));
        },


        _has: function (tags) {
            if (!this._list.length || !tags.length)
                return false;

            for (var i = 0; i < tags.length; i++) {
                if (tags[i].length === 1) {
                    // single occurance
                    if (this._index[tags[i][0]])
                        return true;
                } else {
                    // combined occurance
                    var multiple = true;

                    for (var t = 0; t < tags[i].length; t++) {
                        if (this._index[tags[i][t]])
                            continue;

                        multiple = false;
                        break;
                    }

                    if (multiple)
                        return true;
                }
            }

            return false;
        },


        list: function () {
            return this._list.slice(0);
        },


        _processArguments: function (args, flat) {
            var tags = [];
            var tmp = [];

            if (!args || !args.length)
                return tags;

            for (var i = 0; i < args.length; i++) {
                if (args[i] instanceof Array) {
                    if (!flat)
                        tmp = [];

                    for (var t = 0; t < args[i].length; t++) {
                        if (typeof args[i][t] !== 'string')
                            continue;

                        if (flat) {
                            tags.push(args[i][t]);
                        } else {
                            tmp.push(args[i][t]);
                        }
                    }

                    if (!flat && tmp.length)
                        tags.push(tmp);
                } else if (typeof args[i] === 'string') {
                    if (flat) {
                        tags.push(args[i]);
                    } else {
                        tags.push([args[i]]);
                    }
                }
            }

            return tags;
        }
    });

  
    Object.defineProperty(Tags.prototype, 'size', {
        get: function () {
            return this._list.length;
        }
    });


    return {
        TagsCache: TagsCache,
        Tags: Tags
    };
}()));