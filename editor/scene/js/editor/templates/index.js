/* editor/templates/template-pipeline-tasks.js */
editor.once('load', function() {
    'use strict';

    function checkCircularReferences(entity, templateIds) {
        const templateId = entity.get('template_id');

        if (templateId) {
            if (templateIds[templateId]) {
                return true;
            }

            templateIds[templateId] = true;
        }

        const children = entity.get('children');
        for (let i = 0; i < children.length; i++) {
            const child = editor.call('entities:get', children[i]);
            if (!child) continue;

            if (checkCircularReferences(child, Object.assign({}, templateIds))) {
                return true;
            }
        }

        return false;
    }

    function checkCircularReferencesSingleOverride(root, override) {
        let entity = editor.call('entities:get', override.resource_id);

        const templateIds = {};

        while (entity) {
            const templateId = entity.get('template_id');
            if (templateId) {
                if (templateIds[templateId]) {
                    return true;
                }

                templateIds[templateId] = true;
            }

            if (entity === root) {
                break;
            }

            entity = editor.call('entities:get', entity.get('parent'));
        }

        return false;
    }

    function checkIfReparentedUnderNewEntity(root, override) {
        const templateEntIds = root.get('template_ent_ids');
        if (!templateEntIds) return;

        let parent = editor.call('entities:get', override.src_value);
        while (parent) {
            if (parent === root) break;

            if (!templateEntIds[parent.get('resource_id')]) {
                return parent;
            }

            parent = editor.call('entities:get', parent.get('parent'));
        }
    }

    const submitApplyTask = function (taskData, callback) {
        editor.call("submit:template_apply:task",taskData,callback)
    };

    editor.method('templates:apply', function (root, callback) {
        
        if (! editor.call('permissions:write')) {
            return;
        }

        var resourceId = root.get('resource_id');

        var templateId = root.get('template_id');

        // check if there are any circular references
        if (checkCircularReferences(root, {})) {
            editor.call(
                'picker:confirm',
                "Template instances cannot contain children that are instances of the same template. Please remove those children and try applying again.",
                function () {},
                {
                    yesText: 'OK',
                    noText: ''
                });
            return false;
        }

        var taskData = {
            task_type: 'propagate_template_changes',
            entity_id: resourceId,
            template_id: templateId
        };

        submitApplyTask(taskData, callback);

        return true;
    });

    editor.method('templates:applyOverride', function (root, override, callback) {
        
        if (! editor.call('permissions:write')) {
            return;
        }

        var resourceId = root.get('resource_id');
        var templateId = root.get('template_id');

        // check if there are any circular references
        if (checkCircularReferencesSingleOverride(root, override)) {
            editor.call(
                'picker:confirm',
                "Template instances cannot contain children that are instances of the same template. Please remove those children and try applying again.",
                function () {},
                {
                    yesText: 'OK',
                    noText: ''
                });
            return false;
        }

        // check if this is a reparenting and if so do not allow it
        // if the entity was reparented under a new entity that has not been applied yet
        if (override.path === 'parent') {
            const newEntity = checkIfReparentedUnderNewEntity(root, override);
            if (newEntity) {
                editor.call(
                    'picker:confirm',
                    `This Entity was reparented under "${newEntity.get('name')}" which is a new Entity. Please apply "${newEntity.get('name')}" first.`,
                    function () {},
                    {
                        yesText: 'OK',
                        noText: ''
                    }
                );

                return false;
            }
        }

        var taskData = {
            task_type: 'propagate_single',
            entity_id: resourceId,
            resource_id: override.resource_id,
            template_id: templateId,
            overrides: [{
                type: override.override_type,
                path: override.path
            }]
        };

        if (override.path) {
            taskData.path = override.path;
        }

        submitApplyTask(taskData, callback);

        return true;
    });
});


/* editor/templates/add-template-instance.js */
editor.once('load', function () {
    'use strict';

    editor.method('template:addInstance', function (asset, parent, opts) {
        if (! editor.call('permissions:write')) {
            return;
        }

        return new AddTemplateInstance(asset, parent, opts).run();
    });

    class AddTemplateInstance {
        constructor(asset, parent, opts) {
            this.asset = asset;

            this.parent = parent;

            this.opts = opts || {};

            this.childIndex = this.opts.childIndex;

            this.subtreeRootId = this.opts.subtreeRootId;
        }

        run() {
            this.prepData();

            this.subtreeRootId ? this.prepSubtree() : this.prepFull();

            return editor.call(
                'template:utils',
                'addEntitySubtree',
                this.dstRootEnt,
                this.dstEnts,
                this.parent,
                this.childIndex
            );
        }

        prepData() {
            this.setMaps();

            this.allSrcEnts = this.asset.get('data').entities;

            const a = Object.values(this.allSrcEnts);

            this.scriptAttrs = editor.call('template:getScriptAttributes', a);
        }

        setMaps() {
            this.dstToSrc = this.opts.dstToSrc || {};

            this.srcToDst = this.opts.srcToDst ||
                editor.call('template:utils', 'invertMap', this.dstToSrc);
        }

        prepSubtree() {
            this.subtreeRootEnt = this.allSrcEnts[this.subtreeRootId];

            this.createSubtreeEnts();

            const dstRootId = this.srcToDst[this.subtreeRootId];

            this.dstRootEnt = this.dstEnts[dstRootId];

            this.setChildIndex();
        }

        createSubtreeEnts() {
            const ents = editor.call(
                'template:utils',
                'getDescendants',
                this.subtreeRootEnt,
                this.allSrcEnts,
                {}
            );

            this.createDstEnts(ents);
        }

        setChildIndex() {
            const p = this.allSrcEnts[this.subtreeRootEnt.parent];

            this.childIndex = p.children.indexOf(this.subtreeRootId);
        }

        prepFull() {
            /**预制件名称 */
            this.createDstEnts(this.allSrcEnts);

            const srcRootId = editor.call('template:utils', 'findIdWithoutParent', this.allSrcEnts);

            const dstRootId = this.srcToDst[srcRootId];

            this.dstRootEnt = this.dstEnts[dstRootId];

            if(this.asset.get('name').endsWith(".template")){
                this.dstRootEnt.name = this.asset.get('name').slice(0,this.asset.get('name').length - 9);
            }else{
                this.dstRootEnt.name = this.asset.get('name');
            }

           

            this.setInstanceRootFields();
        }

        setInstanceRootFields() {
            this.dstRootEnt.template_ent_ids = this.dstToSrc;

            this.dstRootEnt.parent = this.parent.get('resource_id');

            this.dstRootEnt.template_id = this.asset.get('id');
        }

        createDstEnts(ents) {
            this.dstEnts = editor.call( // updates maps
                'template:createInstanceEntities',
                ents,
                this.srcToDst,
                this.dstToSrc,
                this.scriptAttrs
            );
        }
    }
});


/* editor/templates/create-instance-entities.js */
editor.once('load', function () {
    'use strict';

    editor.method('template:createInstanceEntities', function (srcEnts, srcToDst, dstToSrc, scriptAttrs) {

        return new CreateInstanceEntities(srcEnts, srcToDst, dstToSrc, scriptAttrs).run();
    });

    class CreateInstanceEntities {
        constructor(srcEnts, srcToDst, dstToSrc, scriptAttrs) {
            this.srcEnts = srcEnts;

            this.srcToDst = srcToDst;

            this.dstToSrc = dstToSrc;

            this.scriptAttrs = scriptAttrs;

            this.dstEnts = {};
        }

        run() {
            this.createAllEnts(); // updates maps

            this.remapAllEntIds();

            return this.dstEnts;
        }

        createAllEnts() {
            const ids = Object.keys(this.srcEnts);

            ids.forEach(id => this.createEnt(id, this.srcEnts[id]));
        }

        createEnt(srcId, srcEnt) {
            const dstId = this.srcToDst[srcId] || pc.guid.create();

            const dstEnt = editor.call('template:utils', 'cloneWithId', srcEnt, dstId);

            this.updateMaps(srcId, dstId);

            this.dstEnts[dstId] = dstEnt;
        }

        updateMaps(srcId, dstId) {
            this.srcToDst[srcId] = dstId;

            this.dstToSrc[dstId] = srcId;
        }

        remapAllEntIds() {
            const ents = Object.values(this.dstEnts);

            ents.forEach(ent => {
                editor.call(
                    'template:remapEntityIds',
                    ent,
                    this.scriptAttrs,
                    this.srcToDst
                );
            });
        }
    }
});


/* editor/templates/new-template-data.js */
editor.once('load', function() {
    'use strict';

    editor.method('template:newTemplateData', function (root, sceneEnts) {
        return new NewTemplateData(root, sceneEnts).run();
    });

    class NewTemplateData {
        constructor(root, srcEnts) {
            this.root = root;

            this.srcEnts = srcEnts;

            this.dstEnts = [];

            this.srcToDst = {};
        }

        run() {
            this.prepDstEnts();

            this.setScriptAttrs();

            this.dstEnts.forEach(this.remapIds, this);

            return this.prepResult();
        }

        prepDstEnts() {
            this.rootId = this.root.get('resource_id');

            this.srcEnts.forEach(this.handleSrcEnt, this);
        }

        handleSrcEnt(srcEnt) {
            const srcId = srcEnt.get('resource_id');

            const dstId = pc.guid.create();

            const dstEnt = srcEnt.json();

            dstEnt.resource_id = dstId;

            this.dstEnts.push(dstEnt);

            this.srcToDst[srcId] = dstId;

            if (srcId === this.rootId) {
                dstEnt.parent = null;

                // remove template fields if this is a template root
                delete dstEnt.template_id;
                delete dstEnt.template_ent_ids;
            }
        }

        setScriptAttrs() {
            this.scriptAttrs = editor.call(
                'template:getScriptAttributes', this.dstEnts);
        }

        remapIds(ent) {
            editor.call(
                'template:remapEntityIds',
                ent,
                this.scriptAttrs,
                this.srcToDst
            );
        }

        prepResult() {
            const ents = editor.call(
                'template:utils',
                'entArrayToMap',
                this.dstEnts
            );

            return {
                assetData: { entities: ents },
                srcToDst: this.srcToDst
            }
        }
    }
});


/* editor/templates/remap-entity-ids.js */
editor.once('load', function () {
    'use strict';

    editor.method('template:remapEntityIds', function (entity, scriptAttrs, srcToDst) {
        new RemapEntityIds(entity, scriptAttrs, srcToDst).run();
    });

    class RemapEntityIds {
        constructor(entity, scriptAttrs, srcToDst) {
            this.entity = entity;

            this.scriptAttrs = scriptAttrs;

            this.srcToDst = srcToDst;
        }

        run() {
            this.handleTemplMap();

            this.setEntPaths();

            this.entPaths.forEach(this.remapAtPath, this);
        }

        handleTemplMap() {
            if (this.entity.template_ent_ids) {
                this.entity.template_ent_ids = editor.call(
                    'template:utils',
                    'remapOrAssignKeys',
                    this.entity.template_ent_ids,
                    this.srcToDst
                );
            }
        }

        setEntPaths() {
            this.entPaths = editor.call(
                'template:allEntityPaths',
                this.entity,
                this.scriptAttrs
            );
        }

        remapAtPath(path) {
            editor.call(
                'template:utils',
                'remapEntAtPath',
                this.entity,
                path,
                this.srcToDst
            );
        }
    }
});


/* editor/templates/template-utils.js */
editor.once('load', function() {
    'use strict';

    const IGNORE_ROOT_PATHS_FOR_OVERRIDES = {
        parent: 1,
        template_id: 1,
        position: 1,
        rotation: 1,
        name: 1
    };

    const IGNORE_ROOT_PATHS_FOR_REVERT = [
        'position',
        'rotation',
        'name'
    ];

    editor.method('template:utils', function () {
        const a = Array.from(arguments);

        const method = a[0];

        const args = a.slice(1);

        return TemplateUtils[method].apply(null, args);
    });

    const TemplateUtils = {
        stopAndReportAttrTypes: { 'curve' : 1 },

        SCRIPT_NAME_REG: /^components\.script\.scripts\.([^.]+)$/,

        getScriptNameReg: function() {
            return TemplateUtils.SCRIPT_NAME_REG;
        },

        isIgnoreRootOverride: function(path) {
            return IGNORE_ROOT_PATHS_FOR_OVERRIDES[path];
        },

        ignoreRootPathsForRevert: function() {
            return IGNORE_ROOT_PATHS_FOR_REVERT;
        },

        makeInstanceData: function (ents, idToTemplEntId) {
            const h = {
                entIdToEntity: ents,

                entities: Object.values(ents),

                templIdToEntity: {},

                templIdToEntId: {}
            };

            h.entities.forEach(ent => TemplateUtils.updateIdMaps(h, ent, idToTemplEntId));

            return h;
        },

        updateIdMaps: function (h, instEnt, idToTemplEntId) {
            const instId = instEnt.resource_id;

            const templId = idToTemplEntId[instId] || instId;

            h.templIdToEntity[templId] = instEnt;

            h.templIdToEntId[templId] = instId;
        },

        makeIdToIdMap: function (orig) {
            const h = {};

            const a = Object.keys(orig);

            a.forEach(id => {
                h[id] = id;
            });

            return h;
        },

        getOtherType: function (type1) {
            return type1 === 'src' ? 'dst' : 'src';
        },

        getNodeAtPath(node, path) {
            path.forEach(key => {
                if (TemplateUtils.isMapObj(node)) {
                    node = node[key];
                } else {
                    node = undefined;
                }
            });

            return node;
        },

        insertAtPath: function (node, path, val) {
            const lastIndex = path.length - 1;

            const lastKey = path[lastIndex];

            for (let i = 0; i < lastIndex; i++) { // exclude last key
                const key = path[i];

                node[key] = node[key] || {};

                node = node[key];
            }

            node[lastKey] = val;
        },

        isMapObj: function (obj) {
            const isObj = typeof obj === "object";

            const isNull = obj === null;

            return isObj && !isNull && !Array.isArray(obj);
        },

        pathToStr: function (path) {
            return path.join('.');
        },

        strToPath: function (s) {
            return s.split('.');
        },

        setEntReferenceIfNeeded: function (conflict, scriptAttrs) {
            const entity = TemplateUtils.makeTmpEntity(conflict);

            const entPaths = editor.call(
                'template:allEntityPaths',
                entity,
                scriptAttrs
            );

            conflict.is_entity_reference = entPaths.length &&
                !TemplateUtils.isMapObj(conflict.src_value); // if path is components.script
        },

        makeTmpEntity: function (conflict) {
            const entity = {
                components: {}
            };

            const p = TemplateUtils.strToPath(conflict.path);

            TemplateUtils.insertAtPath(entity, p, conflict.src_value);

            return entity;
        },

        getAllEntitiesInSubtree: function (entity, result) {
            result.push(entity);

            const children = TemplateUtils.getChildEntities(entity);

            children.forEach(ch => TemplateUtils.getAllEntitiesInSubtree(ch, result));

            return result;
        },

        getChildEntities: function (entity) {
            const ids = entity.get('children');

            return ids.map(function (id) {
                return editor.call('entities:get', id);
            });
        },

        remapEntAtPath: function (h, path, srcToDst) {
            const v1 = TemplateUtils.getNodeAtPath(h, path);

            if (v1) {
                const v2 = TemplateUtils.remapEntVal(v1, srcToDst);

                TemplateUtils.insertAtPath(h, path, v2);
            }
        },

        remapEntVal: function (v, srcToDst) {
            return Array.isArray(v) ?
                TemplateUtils.remapEntArray(v, srcToDst) :
                TemplateUtils.remapEntStr(v, srcToDst);
        },

        remapEntArray: function(a, srcToDst) {
            return a.map(v => TemplateUtils.remapEntStr(v, srcToDst));
        },

        remapEntStr: function (v, srcToDst) {
            return srcToDst[v] || null;
        },

        remapOrAssignKeys: function(h1, srcToDst) {
            const h2 = {};

            const a = Object.keys(h1);

            a.forEach(k1 => {
                const k2 = srcToDst[k1] || pc.guid.create();

                h2[k2] = h1[k1];
            });

            return h2;
        },

        entArrayToMap: function (ents) {
            const h = {};

            ents.forEach(e => {
                h[e.resource_id] = e;
            });

            return h;
        },

        strArrayToMap: function(a) {
            const h = {};

            a.forEach(s => {
                h[s] = 1;
            });

            return h;
        },

        isStopPathInSchema: function (path) {
            const s = TemplateUtils.pathToStr(path);

            const method = editor.call('schema:getMergeMethodForPath', config.schema.scene, s);

            return method === 'stop_and_report_conflict';
        },

        stopPathsFromAttrs: function (scriptAttrs) {
            const h = {};

            Object.keys(scriptAttrs).forEach(script => {
                const attrs = scriptAttrs[script];

                Object.keys(attrs).forEach(attr => {
                    const type = attrs[attr].type;

                    if (TemplateUtils.stopAndReportAttrTypes[type]) {
                        h[`components.script.scripts.${script}.attributes.${attr}`] = 1;
                    }
                });
            });

            return h;
        },

        deepClone: function (obj) {
            return JSON.parse(JSON.stringify(obj));
        },
        
        cloneWithId: function (ent, id) {
            const h = TemplateUtils.deepClone(ent);

            h.resource_id = id;

            return h;
        },

        invertMap: function (h1) {
            const h2 = {};

            Object.keys(h1).forEach(k => {
                const v = h1[k];

                h2[v] = k;
            });

            return h2;
        },

        rmFalsey: function (a) {
            return a.filter(v => v);
        },

        getDescendants: function (entity, idToEntity, result) {
            const id = entity && entity.resource_id;

            if (id && !result[id]) {
                result[id] = entity;

                TemplateUtils.addEntChildren(entity, idToEntity, result);
            }

            return result;
        },

        addEntChildren: function (entity, idToEntity, result) {
            entity.children.forEach(id => {
                const ch = idToEntity[id];

                TemplateUtils.getDescendants(ch, idToEntity, result);
            })
        },

        addEntitySubtree: function (entData, allEnts, parent, childIndex) {
            const childrenCopy = entData.children;

            entData.children = [];

            const entity = TemplateUtils.addEntObserver(entData, parent, childIndex);

            childrenCopy.forEach(childId => {
                TemplateUtils.addEntitySubtree(allEnts[childId], allEnts, entity);
            });

            return entity;
        },

        addEntObserver: function(data, parent, childIndex) {
            const entity = new Observer(data);

            editor.call('entities:addEntity', entity, parent, false, childIndex);

            return entity;
        },

        findIdWithoutParent: function(ents) {
            const ids = Object.keys(ents);

            return ids.find(id => !ents[id].parent);
        },

        selectPresentInSecond: function(a1, a2) {
            const h = TemplateUtils.strArrayToMap(a2);

            return a1.filter(s => h[s]);
        },

        matchFromRegex: function(s, r) {
            const match = r.exec(s);

            return match ? match[1] : match;
        },

        markAddRmScriptConflicts: function(overrides) {
            overrides.conflicts.forEach(TemplateUtils.setScriptName);

            const a = overrides.conflicts.filter(h => h.script_name);

            a.forEach(h => {
                if (h.missing_in_dst) {
                    h.override_type = 'override_add_script';

                } else if (h.missing_in_src) {
                    h.override_type = 'override_delete_script';

                    TemplateUtils.addScriptIndex(h, overrides);
                }
            });
        },

        setScriptName: function(h) {
            const s = TemplateUtils.matchFromRegex(h.path, TemplateUtils.getScriptNameReg());

            if (s) {
                h.script_name = s;
            }
        },

        addScriptIndex(h, overrides) {
            const dstId = overrides.srcToDst[h.resource_id];

            const ent = overrides.typeToInstData.dst.entIdToEntity[dstId];

            const a = TemplateUtils.getNodeAtPath(ent, ['components', 'script', 'order']);

            if (a) {
                h.order_index_in_asset = a.indexOf(h.script_name);
            }
        },

        remapOverrideForRevert(override) {
            const h = TemplateUtils.invertMap(override.srcToDst);

            return TemplateUtils.remapEntVal(override.dst_value, h);
        }
    };
});


/* editor/templates/deep-equal.js */
editor.once('load', function() {
    'use strict';

    /**
     * Perform a deep comparison of two nodes consisting of
     * ojbects, arrays and scalar values.
     *
     * @param {Object} node1 First object to compare
     * @param {Object} node2 Second object to compare
     * @returns {Boolean} True if the nodes are deep-equal
     */
    editor.method('assets:isDeepEqual', function (node1, node2) {
        return new DeepEqual(node1, node2).run();
    });

    class DeepEqual {
        constructor(node1, node2) {
            this.node1 = node1;

            this.node2 = node2;

            this.bothNodes = [ node1, node2 ];
        }

        run() {
            if (this.node1 === this.node2) {
                return true;

            } else if (this.areBothMaps()) {
                return this.handleMaps();

            } else if (this.areBothArrays()) {
                return this.handleArrays();

            } else {
                return false;
            }
        }

        handleMaps() {
            const keys1 = Object.keys(this.node1);

            const keys2 = Object.keys(this.node2);

            const sameLen = keys1.length === keys2.length;

            return sameLen && this.compareMapsRecursively(keys1);
        }

        compareMapsRecursively(keys1) {
            return keys1.every(k1 => {

                const v1 = this.node1[k1];

                const v2 = this.node2[k1];

                return new DeepEqual(v1, v2).run();
            });
        }

        handleArrays() {
            const sameLen = this.node1.length === this.node2.length;

            return sameLen && this.compareArraysRecursively();
        }

        compareArraysRecursively() {
            return this.node1.every((v1, index) => {

                const v2 = this.node2[index];

                return new DeepEqual(v1, v2).run();
            });
        }

        areBothMaps() {
            return this.bothNodes.every(h => {
                return editor.call('template:utils', 'isMapObj', h);
            });
        }

        areBothArrays() {
            return this.bothNodes.every(Array.isArray);
        }
    }
});



/* editor/templates/template-node-traversal.js */
editor.once('load', function() {
    'use strict';

    /**
     * A generalized node traversal mechanism.
     *
     * Given a path (data.path) and a type (data.type1), which is in turn
     * 'src' or 'dst', compare the node at that path in both src and dst
     * (of data.typeToRoot) and either stop (and add a conflict to data.conflicts),
     * or make recursive calls with all children nodes.
     *
     * 'NodeTraversal' is used in combination with a handler class, in this case
     * 'DiffTemplateNode' defined below.
     *
     * 'NodeTraversal' calls the 'handleNode' method of a handler instance,
     * which in turn calls the 'makeRecursiveCalls' or 'addCurPathToKnown'
     * of 'NodeTraversal'.
     *
     * @param {Object} data Traversal state data with fields:
     *   typeToRoot, conflicts, path, type1
     */
    editor.method('assets:templateNodeTraversal', function (data) {
        new NodeTraversal(data).run();
    });

    const bothTypes = [ 'src', 'dst' ];

    class NodeTraversal {
        constructor(data) {
            this.data = data;
        }

        run() {
            if (!this.resultKnown()) {
                this.handleNewPath();
            }
        }

        addCurPathToKnown() {
            this.data.knownResultPaths.add(this.data.path);
        }

        makeRecursiveCalls() {
            const a = Object.keys(this.data.node1);

            a.forEach(this.recursiveCallForKey, this);
        }

        resultKnown() {
            return this.data.knownResultPaths.includes(this.data.path);
        }

        handleNewPath() {
            this.nodeHandler = new DiffTemplateNode(this.data, this);

            this.completeData();

            this.setTypeToNode();

            this.nodeHandler.handleNode();
        }

        completeData() {
            const type1 = this.data.type1;

            const type2 = type1 === 'src' ? 'dst' : 'src';

            const h = {
                type2: type2,

                node1: this.nodeFromRoot(type1),

                node2: this.nodeFromRoot(type2)
            };

            Object.assign(this.data, h);
        }

        setTypeToNode() {
            const h = {};

            h[this.data.type1] = this.data.node1;

            h[this.data.type2] = this.data.node2;

            this.data.typeToNode = h;
        }

        recursiveCallForKey(key) {
            const h = Object.assign({}, this.data); // copy

            h.path = this.data.path.slice(0); // copy

            h.path.push(key);

            new NodeTraversal(h).run();
        }

        nodeFromRoot(type) {
            const root = this.data.typeToRoot[type];

            return editor.call(
                'template:utils', 'getNodeAtPath', root, this.data.path);
        }
    }

    /**
     * Handle a node for the purposes of finding diff conflicts
     * during recursive traversal of a tree.
     *
     * A reference to a NodeTraversal instance is provided
     * as an argument. We call its 'makeRecursiveCalls' method,
     * unless a conflict or deep equality of nodes has been
     * found here, in which case the traversal's
     * 'addCurPathToKnown' methods is called.
     *
     * @param {Object} data Traversal state data
     * @param {Object} traversal A NodeTraversal instance
     */
    class DiffTemplateNode {
        constructor(data, traversal) {
            this.data = data;

            this.traversal = traversal;
        }

        handleNode() {
            if (this.areNodesEqual()) {
                this.traversal.addCurPathToKnown();

            } else if (this.needRecursion()) {
                this.traversal.makeRecursiveCalls();

            } else {
                this.reportDiff();

                this.traversal.addCurPathToKnown();
            }
        }

        areNodesEqual() {
            return editor.call(
                'assets:isDeepEqual', this.data.node1, this.data.node2);
        }

        needRecursion() {
            return this.areBothNodesMaps() && !this.shouldStopAndReport();
        }

        areBothNodesMaps() {
            return [ this.data.node1, this.data.node2 ].every(h => {
                return editor.call('template:utils', 'isMapObj', h);
            });
        }

        shouldStopAndReport() {
            const fullPath = [ 'entities', this.data.entityResourceId ].concat(this.data.path);

            return this.isAttrStopPath() ||
                editor.call('template:utils', 'isStopPathInSchema', fullPath);
        }

        isAttrStopPath() {
            const s = editor.call('template:utils', 'pathToStr', this.data.path);

            return this.data.attrStopPaths[s];
        }

        reportDiff() {
            const h = new MakeNodeConflict(this.data).run();

            this.data.conflicts.push(h);
        }
    }

    class MakeNodeConflict {
        constructor(data) {
            this.data = data;

            this.typeToNode = this.data.typeToNode || this.data.typeToRoot;
        }

        run() {
            this.setBasicConflict();

            if (this.isPathPresent()) {
                bothTypes.forEach(this.checkAndSetValueField, this);

                this.conflict.path = editor.call('template:utils', 'pathToStr', this.data.path);
            }

            return this.conflict;
        }

        isPathPresent() {
            return this.data.path && this.data.path.length;
        }

        setBasicConflict() {
            this.conflict = new MakeBasicConflict(this.typeToNode).run();
        }

        checkAndSetValueField(type) {
            const node = this.typeToNode[type];

            if (node !== undefined) {
                const field = type + '_value';

                this.conflict[field] = node;
            }
        }
    }

    class MakeBasicConflict {
        constructor(typeToNode) {
            this.typeToNode = typeToNode;
        }

        run() {
            this.initialize();

            bothTypes.forEach(this.missingFlagForField, this);

            return this.result;
        }

        initialize() {
            const guid = pc.guid.create();

            this.result = {
                conflict_id: guid,
                use_src: 0,
                use_dst: 0
            };
        }

        missingFlagForField(type) {
            if (this.typeToNode[type] === undefined) {
                const missingField = 'missing_in_' + type;

                this.result[missingField] = 1;
            }
        }
    }
});



/* editor/templates/find-template-conflicts.js */
editor.once('load', function() {
    'use strict';

    /**
     * Find template instance overrides via recursive traversal,
     * given data representing the instance and the template asset.
     * @param {Object} typeToInstData A map from type (src or dst)
     *    to an object with the fields: entities, templIdToEntity, templIdToEntId
     * @param {Object} typeToIdToTempl A map from type to a map from
     *    instance id to template id.
     * @returns {Object} An object with fields 'conflicts',
     *    'addedEntities' and 'deletedEntities'
     */
    editor.method('template:findConflicts', function (typeToInstData, typeToIdToTempl, attrStopPaths) {
        return new FindTemplateConflicts(typeToInstData, typeToIdToTempl, attrStopPaths).run();
    });

    class FindTemplateConflicts {
        constructor(typeToInstData, typeToIdToTempl, attrStopPaths) {
            this.typeToInstData = typeToInstData;

            this.typeToIdToTempl = typeToIdToTempl;

            this.attrStopPaths = attrStopPaths;

            this.visitedIds = {};

            this.result = {
                conflicts: [],
                addedEntities: [],
                deletedEntities: []
            };
        }

        run() {
            this.handleAllEnts('src'); // src first

            this.handleAllEnts('dst');

            return this.result;
        }

        handleAllEnts(type) {
            const a = this.typeToInstData[type].entities;

            a.forEach(ent => this.handleEntity(type, ent));
        }

        handleEntity(type, ent) {
            const id = this.getTemplId(type, ent);

            if (!this.visitedIds[id]) {
                this.handleUnvisited(type, ent);

                this.visitedIds[id] = 1;
            }
        }

        handleUnvisited(type, ent) {
            const typeToNode = this.makeTypeToNode(type, ent);

            if (typeToNode.dst && typeToNode.src) {
                this.useTraversal(ent, typeToNode);

            } else if (typeToNode.dst) {
                this.handleWholeEnt(ent, 'override_delete_entity', 'deletedEntities');

            } else if (typeToNode.src) {
                this.handleWholeEnt(ent, 'override_add_entity', 'addedEntities');
            }
        }

        makeTypeToNode(type1, ent) {
            const h = {};

            h[type1] = ent;

            const type2 = editor.call('template:utils', 'getOtherType', type1);

            h[type2] = this.findMatchingEnt(type1, type2, ent);

            return h;
        }

        findMatchingEnt(type1, type2, ent) {
            const id = this.getTemplId(type1, ent);

            return this.typeToInstData[type2].templIdToEntity[id];
        }

        getTemplId(type, ent) {
            const id = ent.resource_id;

            return this.typeToIdToTempl[type][id] || id;
        }

        useTraversal(ent, typeToNode) { // ent is always from src
            const conflicts = new TemplateTraversal(ent, typeToNode, this.attrStopPaths).run();

            Array.prototype.push.apply(this.result.conflicts, conflicts);
        }

        handleWholeEnt(ent, overrideType, resField) {
            ent.override_type = overrideType;

            this.result[resField].push(ent);
        }
    }

    class TemplateTraversal {
        constructor(ent, typeToNode, attrStopPaths) {
            this.ent = ent;

            this.typeToNode = typeToNode;

            this.attrStopPaths = attrStopPaths;

            this.conflicts = [];
        }

        run() { // ent is always from src
            this.runTraveral();

            this.conflicts.forEach(h => {
                h.resource_id = this.ent.resource_id;
            });

            return this.conflicts;
        }

        runTraveral() {
            const h = {
                typeToRoot: this.typeToNode,
                conflicts: this.conflicts,
                entityResourceId: this.ent.resource_id,
                attrStopPaths: this.attrStopPaths
            };

            new StartRecursiveTraversal(h).run();
        }
    }

    class StartRecursiveTraversal {
        constructor(data) {
            this.data = data;
        }

        run() {
            this.knownResultPaths = new MergePathStore();

            [ 'src', 'dst' ].forEach(this.handleType, this);
        }

        handleType(type) {
            const h = {
                type1: type,

                path: [],

                knownResultPaths: this.knownResultPaths
            };

            Object.assign(h, this.data);

            editor.call('assets:templateNodeTraversal', h);
        }
    }

    class MergePathStore {
        constructor() {
            this.store = {};
        }

        add(path) {
            const key = editor.call('template:utils', 'pathToStr', path);

            this.store[key] = 1;
        }

        includes(path) {
            const key = editor.call('template:utils', 'pathToStr', path);

            return this.store[key];
        }
    }
});



/* editor/templates/find-apply-candidates.js */
editor.once('load', function () {
    'use strict';

    /**
     * Finds all the templates that an override could be applied to.
     * @param {Object} override The override (as returned by templates:computeOverrides).
     * @param {ObserverList} entities The entities observer list
     * @param {Observer} templateInstanceRoot The template instance that we are interested in. We are not going to search above this
     * entity when looking for candidates. Can be null to check up to the root of the scene.
     */
    editor.method('templates:findApplyCandidatesForOverride', (override, entities, templateInstanceRoot) => {
        entities = entities || editor.call('entities:raw');

        const result = [];
        let entity = entities.get(override.resource_id);
        while (entity) {
            if (entity.get('template_id') && entity.has(`template_ent_ids.${override.resource_id}`)) {
                // if this entity is the same entity as the override is refering to
                // and this entity is a template then do not consider it a candidate
                // if the path of the override is not supposed to be considered a valid
                // override for a template root
                if (entity.get('resource_id') !== override.resource_id || !editor.call('template:utils', 'isIgnoreRootOverride', override.path)) {
                    result.push(entity);
                }
            }

            // do not go further than the specified template instance root
            if (entity === templateInstanceRoot) break;

            entity = entities.get(entity.get('parent'));
        }

        return result;

    });

    /**
     * Finds all the templates that a new entity override could be applied to.
     * @param {Observer} templateInstanceRoot The template instance that we are interested in. We are not going to search above this
     * entity when looking for candidates.
     * @param {Object} newEntityData The new entity in JSON.
     * @param {ObserverList} entities The entities observer list
     */
    editor.method('templates:findApplyCandidatesForNewEntity', (templateInstanceRoot, newEntityData, entities) => {
        entities = entities || editor.call('entities:raw');

        const result = [];
        let entity = entities.get(newEntityData.parent);
        while (entity) {
            if (entity.get('template_id')) {
                result.push(entity);
            }

            // do not go further than the specified template instance root
            if (entity === templateInstanceRoot) break;

            entity = entities.get(entity.get('parent'));
        }

        return result;
    });

    /**
     * Finds all the templates that a deleted entity override could be applied to.
     * @param {Observer} templateInstanceRoot The template instance that we are interested in. We are not going to search above this
     * entity when looking for candidates.
     * @param {Object} deletedEntityData The deleted entity in JSON.
     * @param {ObserverList} entities The entities observer list
     */
    editor.method('templates:findApplyCandidatesForDeletedEntity', (templateInstanceRoot, deletedEntityData, entities) => {
        entities = entities || editor.call('entities:raw');

        const templateEntityIds = templateInstanceRoot.get('template_ent_ids');
        // find the parent of the deleted entity in the template instance
        // and also find the resource id of the deleted entity in the template instance
        let parent = templateInstanceRoot;
        let instanceResourceId;
        for (const key in templateEntityIds) {
            if (templateEntityIds[key] === deletedEntityData.parent) {
                parent = entities.get(key);
            } else if (templateEntityIds[key] === deletedEntityData.resource_id) {
                instanceResourceId = key;
            }
        }

        const result = [];

        // start from the parent and find all template roots up to currently selected entity
        // that have the deleted entity in their template_ent_ids
        while (parent) {
            if (parent.get('template_id') && parent.has(`template_ent_ids.${instanceResourceId}`)) {
                result.push(parent);

                if (parent === templateInstanceRoot) {
                    break;
                }
            }

            parent = entities.get(parent.get('parent'));
        }

        return result;
    });
});


/* editor/templates/revert-overrides.js */
editor.once('load', function () {
    'use strict';

    function rememberEntitiesPanelState(entity) {
        return editor.call('entities:panel:getExpandedState', entity);
    }

    function restoreEntitiesPanelState(state) {
        editor.call('entities:panel:restoreExpandedState', state);
    }

    editor.method('templates:revertNewEntity', (newEntityId, entities) => {
        entities = entities || editor.call('entities:raw');

        const entity = entities.get(newEntityId);
        if (entity) {
            editor.call('entities:delete', [entity]);
        }
    });

    editor.method('templates:revertDeletedEntity', (deletedEntity, templateInstanceRoot, entities) => {
        entities = entities || editor.call('entities:raw');

        let newEntity = null;

        function undo() {
            newEntity = newEntity.latest();
            if (!newEntity) return;

            editor.call('entities:removeEntity', newEntity, null, true);

            newEntity = null;
        }

        function redo() {
            const templId = templateInstanceRoot.get('template_id');
            const asset = editor.call('assets:get', templId);
            if (!asset) return;

            const dstToSrc = templateInstanceRoot.get('template_ent_ids'); // for create asset is src
            const srcToDst = editor.call('template:utils', 'invertMap', dstToSrc);
            const parentId = srcToDst[deletedEntity.parent];
            const parentEnt = entities.get(parentId);

            const opts = {
                subtreeRootId: deletedEntity.resource_id,
                dstToSrc: dstToSrc,
                srcToDst: srcToDst
            };

            newEntity = editor.call('template:addInstance', asset, parentEnt, opts);
        }

        redo();

        editor.call('history:add', {
            name: 'revert deleted entity ' + deletedEntity.resource_id,
            undo: undo,
            redo: redo
        });
    });

    function revertNewScript(entity, override, scriptName) {
        let previousIndex;

        // handle new script
        function undo() {
            entity = entity.latest();
            if (!entity) return;

            const history = entity.history.enabled;
            entity.history.enabled = false;

            if (!entity.has(override.path)) {
                entity.set(override.path, override.src_value);
                if (entity.get('components.script.order').indexOf(scriptName) === -1) {
                    entity.insert('components.script.order', scriptName, previousIndex < 0 ? undefined : previousIndex);
                }
            }

            entity.history.enabled = history;
        }

        function redo() {
            entity = entity.latest();
            if (!entity) return;

            const history = entity.history.enabled;
            entity.history.enabled = false;

            entity.unset(override.path);
            previousIndex = entity.get('components.script.order').indexOf(scriptName);
            entity.removeValue('components.script.order', scriptName);

            entity.history.enabled = history;
        }

        redo();

        editor.call('history:add', {
            name: `entities.${override.resource_id}.${override.path}`,
            undo: undo,
            redo: redo
        });
    }

    function revertDeletedScript(entity, override, scriptName) {
        if (!override.missing_in_src) return;

        function undo() {
            entity = entity.latest();
            if (!entity) return;

            const history = entity.history.enabled;
            entity.history.enabled = false;

            entity.unset('components.script.scripts.' + scriptName);
            entity.removeValue('components.script.order', scriptName);

            entity.history.enabled = history;
        }

        function redo() {
            entity = entity.latest();
            if (!entity) return;

            const history = entity.history.enabled;
            entity.history.enabled = false;

            if (!entity.has(override.path)) {
                // remap entity script attributes
                const scriptAsset = editor.call('assets:scripts:assetByScript', scriptName);
                if (scriptAsset && override.dst_value && override.dst_value.attributes) {
                    for (const name in override.dst_value.attributes) {
                        const attr = override.dst_value.attributes[name];
                        const assetAttribute = scriptAsset.get(`data.scripts.${scriptName}.attributes.${name}`);
                        if (assetAttribute && assetAttribute.type === 'entity') {
                            if (assetAttribute.array) {
                                if (Array.isArray(attr)) {
                                    for (let i = 0; i < attr.length; i++) {
                                        for (const key in override.srcToDst) {
                                            if (override.srcToDst[key] === attr[i]) {
                                                attr[i] = key;
                                            }
                                        }
                                    }
                                }
                            } else {
                                for (const key in override.srcToDst) {
                                    if (override.srcToDst[key] === attr) {
                                        override.dst_value.attributes[name] = key;
                                    }
                                }
                            }
                        }
                    }

                    entity.set(override.path, override.dst_value);
                }

            }
            if (entity.get('components.script.order').indexOf(scriptName) === -1) {
                entity.insert('components.script.order', scriptName);
            }


            entity.history.enabled = history;
        }

        redo();

        editor.call('history:add', {
            name: `entities.${override.resource_id}.${override.path}`,
            undo: undo,
            redo: redo
        });
    }

    function revertNewTemplateId(entity, override) {
        editor.call('templates:unlink', entity);
    }

    function revertReparenting(entity, override, entities) {
        let oldParent;
        for (const key in override.srcToDst) {
            if (override.srcToDst[key] === override.dst_value) {
                oldParent = key;
                break;
            }
        }
        const parent = entities.get(oldParent);
        if (!parent) {
            // TODO: show error visually
            editor.call(
                'picker:confirm',
                "Cannot revert this override because the parent does not exist.",
                null,
                {
                    yesText: 'OK',
                    noText: ''
                }
            );
            return;
        }

        // check if new parent is currently a child of the entity
        let isChild = false;
        let test = parent;
        while (test) {
            if (test.get('parent') === entity.get('resource_id')) {
                isChild = true;
                break;
            }

            test = entities.get(test.get('parent'));
        }

        if (isChild) {
            editor.call(
                'picker:confirm',
                "Cannot revert this override because the old parent is currently a child of the entity.",
                null,
                {
                    yesText: 'OK',
                    noText: ''
                }
            );
            return;
        }

        editor.call('entities:reparent', [{
            entity: entity,
            parent: parent
        }]);
    }

    function revertChildrenReordering(entity, override) {
        let oldChildren;

        function undo() {
            entity = entity.latest();
            if (!entity) return;

            const history = entity.history.enabled;
            entity.history.enabled = false;

            // use getRaw which will get the same array reference in children
            // as the observer in order to get the accurate current index of a child
            // when we are reordering them below
            const currentChildren = entity.getRaw('children');
            for (let i = 0; i < currentChildren.length; i++) {
                if (oldChildren.indexOf(currentChildren[i]) === -1) {
                    oldChildren.splice(i, 0, currentChildren[i]);
                }
            }

            for (let i = oldChildren.length; i >= 0; i--) {
                if (!editor.call('entities:get', oldChildren[i])) {
                    oldChildren.splice(i, 1);
                }
            }

            for (let i = oldChildren.length - 1; i >= 0; i--) {
                entity.move('children', currentChildren.indexOf(oldChildren[i]), i);
            }

            entity.history.enabled = history;
        }

        function redo() {
            entity = entity.latest();
            if (!entity) return;

            const history = entity.history.enabled;
            entity.history.enabled = false;

            // handle children reordering
            // create a new children array using the dst_value
            // and then add back any added entities and remove any missing entities
            let newOrder = override.dst_value.map(id => {
                for (const key in override.srcToDst) {
                    if (override.srcToDst[key] === id) {
                        return key;
                    }
                }
            });

            // add new entities
            oldChildren = entity.get('children');

            // use getRaw which will get the same array reference in children
            // as the observer in order to get the accurate current index of a child
            // when we are reordering them below
            const currentChildren = entity.getRaw('children');
            for (let i = 0; i < currentChildren.length; i++) {
                if (newOrder.indexOf(currentChildren[i]) === -1) {
                    newOrder.splice(i, 0, currentChildren[i]);
                }
            }

            for (let i = newOrder.length; i >= 0; i--) {
                if (!editor.call('entities:get', newOrder[i])) {
                    newOrder.splice(i, 1);
                }
            }

            for (let i = newOrder.length - 1; i >= 0; i--) {
                entity.move('children', currentChildren.indexOf(newOrder[i]), i);
            }

            entity.history.enabled = history;
        }

        redo();

        editor.call('history:add', {
            name: `entities.${override.resource_id}.${override.path}`,
            undo: undo,
            redo: redo
        });
    }

    function revertScriptOrder(entity, override) {
        // handle script order
        let oldOrder;

        function undo() {
            entity = entity.latest();
            if (!entity) return;

            const history = entity.history.enabled;
            entity.history.enabled = false;


            entity.history.enabled = history;
        }

        function redo() {
            entity = entity.latest();
            if (!entity) return;

            oldOrder = override.src_value.slice();

            const history = entity.history.enabled;
            entity.history.enabled = false;

            const newOrder = override.dst_value.slice();

            // add new scripts
            for (let i = 0; i < oldOrder.length; i++) {
                if (newOrder.indexOf(oldOrder[i]) === -1) {
                    newOrder.splice(i, 0, oldOrder[i]);
                }
            }

            // remove deleted scripts
            for (let i = newOrder.length - 1; i >= 0; i--) {
                if (oldOrder.indexOf(newOrder[i]) === -1) {
                    newOrder.splice(i, 1);
                }
            }

            entity.set('components.script.order', newOrder);

            entity.history.enabled = history;
        }

        redo();

        editor.call('history:add', {
            name: `entities.${override.resource_id}.${override.path}`,
            undo: undo,
            redo: redo
        });
    }

    editor.method('templates:revertOverride', (override, entities) => {
        entities = entities || editor.call('entities:raw');

        let entity = entities.get(override.resource_id);
        if (!entity) return;

        const scriptReg = editor.call('template:utils', 'getScriptNameReg');

        if (override.missing_in_dst) {
            const match = override.path.match(scriptReg);
            if (match) {
                revertNewScript(entity, override, match[1]);
            } else if (override.path === 'template_id') {
                revertNewTemplateId(entity, override);
            } else {
                entity.unset(override.path);
            }
        } else {
            if (override.path === 'parent') {
                // handle reparenting
                revertReparenting(entity, override, entities);
            } else if (override.path === 'children') {
                revertChildrenReordering(entity, override);
            } else if (override.path === 'components.script.order') {
                revertScriptOrder(entity, override);
            } else {
                // handle deleted script
                const match = override.path.match(scriptReg);
                if (match) {
                    revertDeletedScript(entity, override, match[1]);
                } else {
                    const val = override.is_entity_reference ?
                      editor.call('template:utils', 'remapOverrideForRevert', override) :
                      override.dst_value;

                    entity.set(override.path, val);
                }
            }
        }
    });

    editor.method('templates:revertAll', function (entity) {

        let templateId = entity.get('template_id');
        let templateEntIds = entity.get('template_ent_ids');
        if (!templateId || !templateEntIds) return false;

        let asset = editor.call('assets:get', templateId);
        if (!asset) return;

        let parent = editor.call('entities:get', entity.get('parent'));
        if (!parent) return;

        let removedEntityData;

        let entitiesPanelState;

        function undo() {
            parent = parent.latest();
            if (!parent) return;

            const newEntity = editor.call('entities:get', removedEntityData.resource_id);
            if (!newEntity) return;

            const childIndex = parent.get('children').indexOf(newEntity.get('resource_id'));

            editor.call('entities:removeEntity', newEntity, null, true);

            const entity = new Observer(removedEntityData);

            setTimeout(function () {
                editor.call('entities:addEntity', entity, parent, true, childIndex);

                restoreEntitiesPanelState(entitiesPanelState);
            });
        }

        function redo() {
            entity = entity.latest();
            if (!entity) return;

            templateId = entity.get('template_id');
            templateEntIds = entity.get('template_ent_ids');
            if (!templateId || !templateEntIds) return;

            asset = editor.call('assets:get', templateId);
            if (!asset) return;

            parent = editor.call('entities:get', entity.get('parent'));
            if (!parent) return;

            const ignorePaths = editor.call('template:utils', 'ignoreRootPathsForRevert');

            const ignorePathValues = ignorePaths.map(path => entity.get(path));

            removedEntityData = entity.json();

            entitiesPanelState = rememberEntitiesPanelState(entity);

            const childIndex = parent.get('children').indexOf(entity.get('resource_id'));

            // remove entity and then re-add instance from
            // the template keeping the same ids as before
            editor.call('entities:removeEntity', entity);

            setTimeout(function () {
                const opts = {
                    dstToSrc: templateEntIds,
                    childIndex: childIndex
                };

                entity = editor.call('template:addInstance', asset, parent, opts);

                entity.history.enabled = false;
                ignorePaths.forEach((path, i) => {
                    entity.set(path, ignorePathValues[i]);
                });
                entity.history.enabled = true;

                setTimeout(function () {
                    editor.call('selector:history', false);
                    editor.call('selector:set', 'entity', [entity]);
                    editor.once('selector:change', function () {
                        editor.call('selector:history', true);
                    });

                    restoreEntitiesPanelState(entitiesPanelState);
                }, 0);
            }, 0);
        }

        redo();

        editor.call('history:add', {
            name: 'template revert all',
            undo: undo,
            redo: redo
        });

        return true;
    });
});


/* editor/templates/compute-overrides.js */
editor.once('load', function() {
    'use strict';

    /**
     * Given the root entity of a template instance, compute
     * and return data about its overrides by comparing it
     * with the corresponding template asset.
     *
     * @param {Object} root The root entity of a template instance
     * @returns {Object} An object with fields 'conflicts',
     * 'addedEntities' and 'deletedEntities'
     */
    editor.method('templates:computeOverrides', function (root) {
        const templateId = root.get('template_id');

        const asset = getAssetData(templateId);

        const instance = getInstanceData(root);

        const instRootId = root.get('resource_id');

        return new FindInstanceOverrides(asset, instance, instRootId).run();
    });

    const getAssetData = function (id) {
        const asset = editor.call('assets:get', id);

        return asset.get('data');
    };

    /**
     * Find all descendant entities and put them in an object under
     * the key 'entities' (so that the format is consistent with
     * template asset data).
     */
    const getInstanceData = function (root) {
        const ents = editor.call('template:utils', 'getAllEntitiesInSubtree', root, []);

        const h = { entities: {} };

        ents.forEach(ent => {
            const id = ent.get('resource_id');

            h.entities[id] = ent.json();
        });

        return h;
    };

    /**
     * Given asset and instance entity data, and the guid of the instance root,
     * return data about the instance's overrides.
     *
     * @param {Object} asset Asset data
     * @param {Object} instance Instance data
     * @param {String} instRootId The guid of the instance root
     * @returns {Object} An object with fields 'conflicts',
     * 'addedEntities' and 'deletedEntities'
     */
    class FindInstanceOverrides {
        constructor(asset, instance, instRootId) {
            this.asset = asset;

            this.instance = instance;

            this.instRootId = instRootId;
        }

        run() {
            this.initMaps();

            this.setScriptAttrs();

            this.setOverrides();

            this.filterInvalidConflicts();

            return this.overrides;
        }

        initMaps() {
            const rootEnt = this.instance.entities[this.instRootId];

            this.srcToDst = rootEnt.template_ent_ids;

            this.typeToInstData = {
                src: this.makeInstData(),

                dst: this.makeAssetData()
            };

            this.typeToIdToTempl = {
                src: this.srcToDst,

                dst: this.assetIdentity
            };
        }

        makeInstData() {
            return editor.call(
                'template:utils',
                'makeInstanceData',
                this.instance.entities,
                this.srcToDst
            );
        }

        makeAssetData() {
            this.assetIdentity = editor.call(
                'template:utils',
                'makeIdToIdMap',
                this.asset.entities
            );

            return editor.call(
                'template:utils',
                'makeInstanceData',
                this.asset.entities,
                this.assetIdentity
            );
        }

        setScriptAttrs() {
            const a = Object.values(this.instance.entities);

            this.scriptAttrs = editor.call('template:getScriptAttributes', a);

            this.attrStopPaths = editor.call(
                'template:utils',
                'stopPathsFromAttrs',
                this.scriptAttrs
            );
        }

        setOverrides() {
            this.overrides = editor.call(
                'template:findConflicts',
                this.typeToInstData,
                this.typeToIdToTempl,
                this.attrStopPaths
            );

            this.overrides.typeToInstData = this.typeToInstData;

            this.overrides.srcToDst = this.srcToDst;

            this.overrides.conflicts.forEach(h => {
                h.srcToDst = this.srcToDst;
            });
        }

        filterInvalidConflicts() {
            this.overrides.conflicts.forEach(this.markEntityReference, this);

            this.overrides.conflicts = this.overrides.conflicts.filter(h => {
                return editor.call(
                    'template:isValidTemplateConflict',
                    h,
                    this.instRootId,
                    this.srcToDst
                );
            });
        }

        markEntityReference(conflict) {
            editor.call(
                'template:utils',
                'setEntReferenceIfNeeded',
                conflict,
                this.scriptAttrs
            );
        }
    }
});


/* editor/templates/compute-overrides-filter.js */
editor.once('load', function () {
    'use strict';

    editor.method('templates:computeFilteredOverrides', function (root) {
        const overrides = editor.call('templates:computeOverrides', root);

        filterRemovableConflicts(
            overrides, 'children', 'templates:handleChildrenConflict');

        filterRemovableConflicts(
            overrides, 'components.script.order', 'templates:handleScriptOrderConflict');

        editor.call('template:utils', 'markAddRmScriptConflicts', overrides);

        setAllReparentPaths(overrides);

        keepOnePerSubtree(overrides, 'addedEntities');

        keepOnePerSubtree(overrides, 'deletedEntities');

        setNumOverrides(overrides);

        return overrides;

    });

    function filterRemovableConflicts(overrides, path, method)  {
        const a = overrides.conflicts.map(h => {
            return h.path === path ?
                editor.call(method, h, overrides) :
                h;
        });

        overrides.conflicts = editor.call('template:utils', 'rmFalsey', a);
    }

    function setAllReparentPaths(overrides) {
        overrides.conflicts.forEach(h => {
            if (h.path === 'parent') {
                editor.call('templates:setReparentPath', h, overrides);
            }
        });
    }

    function keepOnePerSubtree(overrides, type) {
        const a = overrides[type];

        const h = editor.call('template:utils', 'entArrayToMap', a);

        overrides[type] = a.filter(ent => !h[ent.parent]);
    }

    function setNumOverrides(overrides) {
        overrides.totalOverrides = 0;

        [ 'conflicts', 'addedEntities', 'deletedEntities' ].forEach(k => {
            overrides.totalOverrides += overrides[k].length;
        })
    }
});


/* editor/templates/filter-overrides/handle-children-conflict.js */
editor.once('load', function () {
    'use strict';

    editor.method('templates:handleChildrenConflict', function (conflict, overrides) {

        return new HandleChildrenConflict(conflict, overrides).run();
    });

    class HandleChildrenConflict {
        constructor(conflict, overrides) {
            this.conflict = conflict;

            this.overrides = overrides;
        }

        run() {
            this.setMaps();

            this.rmAdded();

            this.rmReparented();

            return this.isReorder() ?
                this.prepReorderConflict() : null;
        }

        setMaps() {
            this.addedIds = editor.call(
                'template:utils',
                'entArrayToMap',
                this.overrides.addedEntities
            );

            this.dstToSrc = editor.call(
                'template:utils',
                'invertMap',
                this.overrides.srcToDst
            );
        }

        rmAdded() {
            this.conflict.src_value = this.conflict.src_value.filter(id => {
                return !this.addedIds[id];
            });
        }

        rmReparented() {
            this.conflict.src_value = this.conflict.src_value.filter(srcId => {
                const dstId = this.overrides.srcToDst[srcId];

                return this.conflict.dst_value.includes(dstId);
            });
        }

        isReorder() {
            return this.conflict.src_value.length >= 2 &&
                !this.sameSrcDstOrder();
        }

        sameSrcDstOrder() {
            let a = this.conflict.dst_value.map(dstId => {
                const srcId = this.dstToSrc[dstId];

                return this.conflict.src_value.includes(srcId) && srcId;
            });

            a = editor.call('template:utils', 'rmFalsey', a);

            return editor.call('assets:isDeepEqual', this.conflict.src_value, a);
        }

        prepReorderConflict() {
            this.conflict.override_type = 'override_reorder_children';

            return this.conflict;
        }
    }
});


/* editor/templates/filter-overrides/handle-script-order-conflict.js */
editor.once('load', function () {
    'use strict';

    editor.method('templates:handleScriptOrderConflict', function (conflict) {

        return new HandleScriptOrderConflict(conflict).run();
    });

    class HandleScriptOrderConflict {
        constructor(conflict) {
            this.conflict = conflict;
        }

        run() {
            this.rmAdded();

            return this.isReorder() ?
                this.prepReorderConflict() : null;
        }

        rmAdded() {
            this.conflict.src_value = editor.call(
                'template:utils',
                'selectPresentInSecond',
                this.conflict.src_value,
                this.conflict.dst_value
            );
        }

        isReorder() {
            return this.conflict.src_value.length >= 2 &&
                !this.sameSrcDstOrder();
        }

        sameSrcDstOrder() {
            const a = editor.call(
                'template:utils',
                'selectPresentInSecond',
                this.conflict.dst_value,
                this.conflict.src_value
            );

            return editor.call('assets:isDeepEqual', this.conflict.src_value, a);
        }

        prepReorderConflict() {
            this.conflict.override_type = 'override_reorder_scripts';

            return this.conflict;
        }
    }
});


/* editor/templates/filter-overrides/set-reparent-path.js */
editor.once('load', function () {
    'use strict';

    editor.method('templates:setReparentPath', function (conflict, overrides) {

        return new SetReparentPath(conflict, overrides).run();
    });

    class SetReparentPath {
        constructor(conflict, overrides) {
            this.conflict = conflict;

            this.overrides = overrides;

            this.path_data = {
                src: { ids: [], names: [] },
                dst: { ids: [], names: [] }
            };
        }

        run() {
            this.setPaths();

            this.conflict.override_type = 'override_reparent_entity';

            this.conflict.path_data = this.path_data;
        }

        setPaths() {
            const srcId = this.conflict.resource_id;

            this.findPathFromId('src', srcId);

            const dstId = this.overrides.srcToDst[srcId];

            this.findPathFromId('dst', dstId);
        }

        findPathFromId(type, id) {
            const ent = this.findEnt(type, id);

            this.findPathFromEnt(type, ent);
        }

        findPathFromEnt(type, ent) {
            this.path_data[type].ids.unshift(ent.resource_id);

            this.path_data[type].names.unshift(ent.name);

            const parent = this.findEnt(type, ent.parent);

            if (parent) {
                this.findPathFromEnt(type, parent);
            }
        }

        findEnt(type, id) {
            return this.overrides.typeToInstData[type].entIdToEntity[id];
        }
    }
});


/* editor/templates/all-entity-paths.js */
editor.once('load', function() {
    'use strict';

    const parentChildren = [ 'parent', 'children' ];

    /**
     * Given an entity and data about all declared script attribute types
     * (by script name), return an array of paths to all entity references
     * inside the provided entity.
     *
     * @param {Object} entity The entity
     * @param {Object} scriptAttrs Data about script attributes by script name
     * @returns {Object[]} An array of paths
     */
    editor.method('template:allEntityPaths', function (entity, scriptAttrs) {
        const paths1 = new ComponentEntityPaths(entity).run();

        const paths2 = new ScriptAttrEntityPaths(entity, scriptAttrs).run();

        const result = paths1.concat(paths2);

        parentChildren.forEach(field => addIfPresent(entity, field, result));

        return result || [];
    });

    const addIfPresent = function(entity, field, result) {
        if (entity[field]) {
            const path = [field];

            result.push(path);
        }
    };

    /**
     * Given an entity, return an array of paths to all entity references inside
     * its components, other than script attributes.
     *
     * @param {Object} entity The entity
     * @returns {Object[]} An array of paths
     */
    class ComponentEntityPaths {
        constructor(entity) {
            this.entity = entity;

            this.result = [];
        }

        run() {
            this.setCompNames();

            this.compNames.forEach(this.handleCompName, this);

            return this.result;
        }

        setCompNames() {
            this.compNames = Object.keys(this.entity.components);
        }

        handleCompName(compName) {
            const fields = editor.call('components:getFieldsOfType', compName, 'entity');

            fields.forEach(field => this.addPathToRes(compName, field));
        }

        addPathToRes(compName, field) {
            const path = [
                'components',
                compName,
                field
            ];

            this.result.push(path);
        }
    }

    /**
     * Given an entity and data about all declared script attribute types
     * (by script name), return an array of paths to all entity references,
     * which are values of script attributes.
     *
     * @param {Object} entity The entity
     * @param {Object} scriptAttrs Data about script attributes by script name
     * @returns {Object[]} An array of paths
     */
    class ScriptAttrEntityPaths {
        constructor(entity, scriptAttrs) {
            this.entity = entity;

            this.scriptAttrs = scriptAttrs;

            this.result = [];
        }

        run() {
            this.setScriptData();

            this.scriptNames.forEach(this.handleScriptName, this);

            return this.result;
        }

        setScriptData() {
            const scriptComps = this.entity.components.script || {};

            this.scripts = scriptComps.scripts || {};

            this.scriptNames = Object.keys(this.scripts);
        }

        handleScriptName(scrName) {
            const data = this.scripts[scrName] || {};

            const attrs = data.attributes || {};

            const attrNames = Object.keys(attrs);

            attrNames.forEach(attrName => this.handleAttr(attrName, scrName));
        }

        handleAttr(attrName, scrName) {
            let h = this.scriptAttrs[scrName] || {};

            h = h[attrName] || {};

            if (h.type === 'entity') {
                this.addPathToRes(scrName, attrName);
            }
        }

        addPathToRes(scrName, attrName) {
            const path = [
                'components',
                'script',
                'scripts',
                scrName,
                'attributes',
                attrName
            ];

            this.result.push(path);
        }
    }
});


/* editor/templates/get-script-attributes.js */
editor.once('load', function() {
    'use strict';

    /**
     * Given an array of entities, return data about all their
     * script attributes by script name
     *
     * @param {Object[]} entities The entities
     * @returns {Object} Data about script attributes by script name
     */
    editor.method('template:getScriptAttributes', function (entities) {
        return new GetScriptAttributes(entities).run();
    });

    class GetScriptAttributes {
        constructor(entities) {
            this.entities = entities;

            this.assets = [];
        }

        run() {
            this.entities.forEach(this.handleEntity, this);

            return new AttributesFromScriptAssets(this.assets).run();
        }

        handleEntity(ent) {
            const path = [ 'components', 'script' ];

            const comp = editor.call('template:utils', 'getNodeAtPath', ent, path);

            if (comp) {
                const names = Object.keys(comp.scripts);

                names.forEach(this.handleCompName, this);
            }
        }

        handleCompName(name) {
            const asset = editor.call('assets:scripts:assetByScript', name);

            if (asset) {
                this.assets.push(asset);
            }
        }
    }

    class AttributesFromScriptAssets {
        constructor(assets) {
            this.assets = assets;

            this.scriptNameToAttributes = {};
        }

        run() {
            this.assets.forEach(this.handleScriptData, this);

            return this.scriptNameToAttributes;
        }

        handleScriptData(asset) {
            const data = asset.get('data') || {};

            const scripts = data.scripts || {};

            const names = Object.keys(scripts);

            names.forEach(name => {
                const attrs = scripts[name].attributes;

                this.scriptNameToAttributes[name] = attrs;
            });
        }
    }
});


/* editor/templates/is-valid-template-conflict.js */
editor.once('load', function() {
    'use strict';

    /**
     * Determine if a conflict found by recursive comparison
     * of an instance and a template asset should be reported as an
     * override or ignored.
     * This takes into account that entity id's are expected to be
     * different. The 'srcToDst' argument provides the expected id mapping.
     *
     * @param {Object} conflict The conflict
     * @param {String} rootId The guid of the root entity to determine
     *   if this conflict involves the root entity
     * @param {Object} srcToDst The guid mapping
     * @returns {Boolean} True if the conflict should be reported as an override
     */
    editor.method('template:isValidTemplateConflict',
        function (conflict, rootId, srcToDst) {

            return new IsValidTemplateConflict(conflict, rootId, srcToDst).run();
    });

    const ignorePathsForAll = {
        resource_id: 1
    };

    const templIdsReg = /^template_ent_ids/;

    class IsValidTemplateConflict {
        constructor(conflict, rootId, srcToDst) {
            this.conflict = conflict;

            this.isRoot = conflict.resource_id === rootId;

            this.srcToDst = srcToDst;

            this.path = conflict.path;

            this.src_value = conflict.src_value;

            this.dst_value = conflict.dst_value;
        }

        run() {
            if (this.ignorePath()) {
                return false;

            } else if (this.conflict.is_entity_reference) {
                return this.handleEntityPathConflict();

            } else {
                return true;
            }
        }

        ignorePath() {
            return ignorePathsForAll[this.path] ||
                templIdsReg.test(this.path) ||
                this.ignoreForRoot();
        }

        ignoreForRoot() {
            return this.isRoot &&
                editor.call(
                    'template:utils',
                    'isIgnoreRootOverride',
                    this.path
                );
        }

        handleEntityPathConflict() {
            return this.areBothArrays() ?
                this.isArrayDifferent(this.src_value, this.dst_value) :
                this.isValueDifferent(this.src_value, this.dst_value);
        }

        areBothArrays() {
            return [ this.src_value, this.dst_value ].every(Array.isArray);
        }

        isArrayDifferent(srcAr, dstAr) {
            const diffLen = srcAr.length !== dstAr.length;

            return diffLen || this.isSomeValueDifferent(srcAr, dstAr);
        }

        isSomeValueDifferent(srcAr, dstAr) {
            return srcAr.some((src, index) => {

                const dst = dstAr[index];

                return this.isValueDifferent(src, dst);
            });
        }

        // external entity references are stored as null in asset
        isValueDifferent(src, dst) {
            const oneTrue = src || dst;

            const diffMapped = this.srcToDst[src] !== dst;

            return oneTrue && diffMapped;
        }
    }
});


/* editor/templates/is-template.js */
editor.once('load', function () {
    'use strict';

    editor.method('templates:isTemplateChild', function (entity) {
        const templateEntIdsPath = `template_ent_ids.${entity.get('resource_id')}`;

        let current = entity;
        while (true) {
            const parent = current.get('parent');
            if (!parent) {
                break;
            }

            current = editor.call('entities:get', parent);
            if (!current) {
                break;
            }

            if (current.get('template_id') && current.get(templateEntIdsPath)) {
                return true;
            }
        }

        return false;
    });
});


/* editor/templates/unlink-template.js */
editor.once('load', function () {
    'use strict';

    editor.method('templates:unlink', function (entity) {
        if (! editor.call('permissions:write')) {
            return;
        }

        let templateId, template_ent_ids;

        function undo() {
            entity = entity.latest();
            if (!entity) return;

            const history = entity.history.enabled;
            entity.history.enabled = false;

            // if template asset does not exist anymore then skip undo
            const asset = editor.call('assets:get', templateId);
            if (!asset) return;

            // remove invalid entries from template_ent_ids
            for (const id in template_ent_ids) {
                if (!asset.has(`data.entities.${template_ent_ids[id]}`)) {
                    delete template_ent_ids[id];
                }
            }

            entity.set('template_id', templateId);
            entity.set('template_ent_ids', template_ent_ids);

            entity.history.enabled = history;
        }

        function redo() {
            entity = entity.latest();
            if (!entity) return;

            templateId = entity.get('template_id');
            template_ent_ids = entity.get('template_ent_ids');

            if (!templateId) {
                return;
            }

            const history = entity.history.enabled;
            entity.history.enabled = false;
            entity.unset('template_id');
            entity.unset('template_ent_ids');
            entity.history.enabled = history;
        }

        editor.call('history:add', {
            name: 'unlink template',
            undo: undo,
            redo: redo
        });

        redo();
    });
});