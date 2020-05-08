editor.on('load',function(){

    editor.emit('realtime:authenticated');
   
    editor.emit('app:authenticated');


    editor.call('picker:project:close');
    var project = {
        "new_owner":null,
        "private":false,
        "engine_version":"stable",
        "disabled":true,
        "last_post_id":null,
        "owner":"tester",
        "watched":0,
        "uniqueId":500000,
        "id":500000,
        "plays":0,
        "private_settings":{},
        "access_level":"admin",
        "size":{"code":0,"total":0,"apps":0,"assets":0},
        "owner_id":100000,
        "website":"",
        "fork_from":null,
        "hash":"aaaaaa",
        "description":"",
        "views":0,
        "private_source_assets":false,
        "last_post_date":null,
        "master_branch":null,
        "tags":[],
        "permissions":{"admin":[""],"write":[],"read":[]},
        "locked":false,
        "name":'demo',
        "type":'mobileh5',
        "created":"2020-05-08T06:44:41.824000",
        "repositories":{
            "current":"directory",
            "directory":{"state":{"status":"ready"},"modified":"2020-05-08T06:44:41.824000","created":"2020-05-08T06:44:41.824000"}
        },
        "settings":{
            "scripts":[]
        },
            "modified":"2020-05-08T06:44:41.824000",
            "flags":{},
            "activity":{"level":0},
            "primary_app":null,
            "starred":0
    };
    config.project = project;
    

    editor.emit('project:ready');
    editor.emit('offline:loadedproject');


    var scene =  {
        entities:{
            "2f5414c3-6c34-11ea-97ae-026349a27a7c": {
                position: [0, 0, 0],
                scale: [1, 1, 1],
                name: "Root",
                parent: null,
                resource_id: "2f5414c3-6c34-11ea-97ae-026349a27a7c",
                components: {
                    css:{
                       cssText: "color:red;",
                       enabled: true,
                       innerText: "hello" ,                                    
                       styleSheets: {},
                       textureAsset: null,
                       type: "group"
                    }
                },
                rotation: [0, 0, 0],
                tags: [],
                enabled: true,
                children: []
            }           
        }
    };

    editor.emit('scene:load', 500000, 500000);
    editor.emit('scene:raw', scene);

    
    editor.emit('assets:load');

    editor.emit('entities:load');

});
