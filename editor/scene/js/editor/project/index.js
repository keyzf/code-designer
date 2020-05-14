/* editor/project/project.js */
editor.once('load', function() {
    'use strict';


    editor.method('project:list', function (callback) {
        localforage.getItem("TWPROJECTS:LIST").then(projectlist => {
            callback && callback(projectlist || []);
        });     
    });



    var _projectPromise =  Promise.resolve();
    editor.method('project:create', function (projectinfo,callback) {

        var projectname = projectinfo.name;
        var projecttype = projectinfo.type;
      
        _projectPromise = _projectPromise.then(_ => {
            return localforage.getItem("TWPROJECTS:LIST").then(projectlists => {
                
                var projectid = 500000;
                if(projectlists && projectlists.length){
                    var lastproject = projectlists[projectlists.length - 1];
                    projectid = lastproject.id + 1;
                }

                var projectdata = {
                    "new_owner":null,
                    "private":false,
                    "engine_version":"stable",
                    "disabled":true,
                    "last_post_id":null,
                    "owner":"tester",
                    "watched":0,
                    "uniqueId":projectid,
                    "id":projectid,
                    "plays":0,
                    "private_settings":{},
                    "access_level":"admin",
                    "size":{"code":0,"total":0,"apps":0,"assets":0},
                    "owner_id":172848,
                    "website":"",
                    "fork_from":null,
                    "hash":"8LbWDVFD",
                    "description":"",
                    "views":0,
                    "private_source_assets":false,
                    "last_post_date":null,
                    "master_branch":null,
                    "tags":[],
                    "permissions":{"admin":[""],"write":[],"read":[]},
                    "locked":false,
                    "name":projectname,
                    "type":projecttype,
                    "created":"2020-04-13T06:44:41.824000",
                    "repositories":{
                        "current":"directory",
                        "directory":{"state":{"status":"ready"},"modified":"2020-04-13T06:44:41.824000","created":"2020-04-13T06:44:41.824000"}
                    },
                    "settings":{
                        "scripts":[]
                    },
                        "modified":"2020-04-13T06:44:41.824000",
                        "flags":{},
                        "activity":{"level":0},
                        "primary_app":null,
                        "starred":0
                };
                projectlists = projectlists || [];
                projectlists.push(projectdata);
               

                return localforage.setItem("TWPROJECTS:LIST",projectlists).then(_ => {
                    callback && callback(projectdata);
                    return projectid;
                });
              
    
            });
    });
        
        


    });


});


/* editor/project/module.js */
editor.once('load', function() {
    'use strict';

    // method if the module is included in the project
    editor.method('project:module:hasModule', function(wasmFilename) {
        var moduleAssets = editor.call('assets:find', function(item) {
            var name = item.get('name');
            var type = item.get('type');
            return name.indexOf(wasmFilename) >= 0 && (type === 'script' || type === 'wasm');
        });
        return moduleAssets.length > 0;
    });
});