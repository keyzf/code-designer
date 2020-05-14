/* editor/editor.js */
(function() {
    'use strict';

    function Editor() {
        Events.call(this);

        this._hooks = { };
    }
    Editor.prototype = Object.create(Events.prototype);


    Editor.prototype.method = function(name, fn) {
        if (this._hooks[name] !== undefined) {
            throw new Error('can\'t override hook: ' + name);
        }
        this._hooks[name] = fn;
    };


    Editor.prototype.methodRemove = function(name) {
        delete this._hooks[name];
    };


    Editor.prototype.call = function(name) {
        if (this._hooks[name]) {
            var args = Array.prototype.slice.call(arguments, 1);

            try {
                return this._hooks[name].apply(null, args);
            } catch(ex) {
                console.info('%c%s %c(editor.method error)', 'color: #06f', name, 'color: #f00');
                console.log(ex.stack);
            }
        } else {
            // console.info('%c%s %c - editor.method does not exist yet', 'color: #06f', name, 'color: #f00');
        }
        return null;
    };


    // editor
    window.editor = new Editor();
})();

window.config = {
    "self":{
        "id":100000,
        "username":"admin",
   },
    "owner":{"id":100000,"username":"admin","plan":{"id":1,"type":"free"},"size":0,"diskAllowance":200000000},
    "project":{
        "id":100000,"name":"test","description":"ads",
        "permissions":{"admin":[100000],"write":[],"read":[]},
        "thumbnails":{},
        "settings":{
            "id":"project_100000",
            "antiAlias":true,
            "fillMode":"FILL_WINDOW","resolutionMode":"AUTO",
            "width":1280,
            "height":720,
            "scripts":[],
            "externalScripts":[],
        }
    },
    "scene":{"id":"","uniqueId":""},
    "url":{
        "engine": window.location.href + "/pc2d/output/pc2d-entry.js",
    },
    "schema": {
        "scene": {
            "name": {
                "$type": "string"
            },
            "settings": {
                "priority_scripts": {
                    "$type": ["string"]
                }
            },
            "entities": {
                "$type": "map",
                "$of": {
                    "name": {
                        "$type": "string"
                    },
                    "resource_id": {
                        "$type": "string"
                    },
                    "enabled": {
                        "$type": "boolean"
                    },
                    "template": {
                        "$type": "number"
                    },
                    "tags": {
                        "$type": ["string"]
                    },
                    "labels": {
                        "$type": ["string"]
                    },
                    "parent": {
                        "$type": "string",
                        "$editorType": "entity"
                    },
                    "children": {
                        "$type": ["string"],
                        "$editorType": "array:entity",
                        "$mergeMethod": "merge_conflict_if_array_reorder"
                    },
                    "position": {
                        "$length": 3,
                        "$type": ["number"],
                        "$mergeMethod": "stop_and_report_conflict"
                    },
                    "rotation": {
                        "$length": 3,
                        "$type": ["number"],
                        "$mergeMethod": "stop_and_report_conflict"
                    },
                    "scale": {
                        "$length": 3,
                        "$type": ["number"],
                        "$mergeMethod": "stop_and_report_conflict"
                    },
                    "template_id": {
                        "$type": "number"
                    },
                    "template_ent_ids": {
                        "$type": "map",
                        "$of": "string"
                    },
                    "components": {
                       
                        "script": {
                            "enabled": {
                                "$type": "boolean",
                                "$default": true
                            },
                            "order": {
                                "$type": ["string"],
                                "$default": []
                            },
                            "scripts": {
                                "$type": "map",
                                "$of": {
                                    "enabled": {
                                        "$type": "boolean"
                                    },
                                    "attributes": {
                                        "$type": "map",
                                        "$of": {
                                            "$type": "mixed",
                                            "$mergeMethod": "merge_entity_script_attributes"
                                        }
                                    }
                                },
                                "$default": {}
                            }
                        },
                        "css": {
                            "enabled": {
                                "$type": "boolean",
                                "$default": true
                            },
                            "type": {
                                "$type": "string",
                                "$default": "group"
                            },
                            "cssText": {
                                "$type": "string",
                                "$default": ""
                            },
                            "textureAsset": {
                                "$type": "string",
                                "$editorType": "asset",
                                "$default": null
                            },
                            "styleSheets": {
                                "$type": "map",
                                "$of": {
                                    "name": {
                                        "$type": "string"
                                    },
                                    "text": {
                                        "$type": "text"
                                    }                               
                                },
                                "$default": {}
                            }
                        }
                    }
                }
            }
        },
        "settings": {
            "ide": {
                "fontSize": {
                    "$type": "number"
                },
                "continueComments": {
                    "$type": "boolean"
                },
                "autoCloseBrackets": {
                    "$type": "boolean"
                },
                "highlightBrackets": {
                    "$type": "boolean"
                }
            },
            "editor": {
               
            },

            "fillMode": {
                "$type": "string"
            },
            "resolutionMode": {
                "$type": "string"
            },
            "height": {
                "$type": "number"
            },
            "width": {
                "$type": "number"
            },
            "scripts": {
                "$type": ["number"],
                "$editorType": "array:asset",
                "$mergeMethod": "merge_conflict_if_array_reorder"
            },
            "loadingScreenScript": {
                "$type": "string",
                "$editorType": "asset"
            },
            "externalScripts": {
                "$type": ["string"]
            },
            "plugins": {
                "$type": ["string"]
            }
        },
        "asset": {
            "branch_id": {
                "$type": "string"
            },
            "checkpoint_id": {
                "$type": "string"
            },
            "data": "assetDataSelector",
            "has_thumbnail": {
                "$type": "boolean"
            },
            "file": {
                "filename": "string",
                "hash": "string",
                "size": "number",
                "variants": {
                    "dxt": {
                        "filename": "string",
                        "hash": "string",
                        "size": "number",
                        "sizeGzip": "number",
                        "opt": "number"
                    },
                    "etc1": {
                        "filename": "string",
                        "hash": "string",
                        "size": "number",
                        "sizeGzip": "number",
                        "opt": "number"
                    },
                    "etc2": {
                        "filename": "string",
                        "hash": "string",
                        "size": "number",
                        "sizeGzip": "number",
                        "opt": "number"
                    },
                    "pvr": {
                        "filename": "string",
                        "hash": "string",
                        "size": "number",
                        "sizeGzip": "number",
                        "opt": "number"
                    },
                    "basis": {
                        "filename": "string",
                        "hash": "string",
                        "size": "number",
                        "sizeGzip": "number",
                        "opt": "number"
                    }
                }
            },
            "immutable_backup": {},
            "item_id": {
                "$type": "string"
            },
            "i18n": {
                "$type": "map",
                "$of": {
                    "$type": "number",
                    "$editorType": "asset"
                }
            },
            "meta": "assetMetaSelector",
            "name": {
                "$type": "string"
            },
            "path": {
                "$type": ["number"],
                "$mergeMethod": "stop_and_report_conflict"
            },
            "preload": {
                "$type": "boolean"
            },
            "region": {
                "$type": "string"
            },
            "revision": {
                "$type": "number"
            },
            "same_as_backup": {
                "$type": "number"
            },
            "scope": {
                "type": {
                    "$type": "string"
                },
                "id": {
                    "$type": "number"
                }
            },
            "source": {
                "$type": "boolean"
            },
            "source_asset_id": {
                "$type": "string",
                "$editorType": "asset"
            },
            "tags": {
                "$type": ["string"]
            },
            "task": {
                "$type": "string"
            },
            "taskInfo": {
                "$type": "string"
            },
            "type": {
                "$type": "string",
                "$enum": ["material", "model", "scene", "texture", "animation", "audio", "image", "cubemap", "shader", "binary", "font", "textureAtlas", "sprite", "text", "json", "html", "css", "script", "bundle", "wasm"]
            },
            "user_id": {
                "$type": "number"
            }
        },
    }
};
// config
(function() {
    'use strict';
    

    var applyConfig = function(path, value) {
        if (typeof(value) === 'object') {
            for(var key in value) {
                applyConfig((path ? path + '.' : '') + key, value[key]);
            }
        } else {
           // Ajax.param(path, value);
        }
    };

    applyConfig('', config);
})();
