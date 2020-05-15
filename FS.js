editor.once('load',function(){

    const FolderFileData = function(uid,filedata){
        var createAt = editor.call('modifytime:convert',new Date());
        return {
            "id":uid,
            "uniqueId":uid,
            "createdAt":createAt,
            "modifiedAt":createAt,
            "file":filedata.file || null,
            "name":filedata.name,
            "type":filedata.type,
            "source":true,
            "tags":[],
            "preload":filedata.preload,
            "data":filedata.data?JSON.parse(filedata.data) : null,
            "i18n":{},
            "sourceId":null,
            "parent":filedata.parent || null
        }
    };

    var _filePromise = Promise.resolve(true);
    const FS = {
        fsUUID:function(){
            return "fs:xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
                return v.toString(16);
              });
        },
        loadFileListByProjectId:function(projectId){
            return localforage.getItem("TWCacheFiles/" + projectId +"/FileList");
        },
        saveFileListByProjectId:function(projectId,fileList){
            return localforage.setItem("TWCacheFiles/" + projectId +"/FileList",fileList);
        },
        rename:function(projectId,fsid,newName){
            var filepath = "TWCacheFiles/" + projectId + "/" + fsid;
            return FS.getFileByPath(filepath).then(function(asset){
                asset.name = newName;
                return localforage.setItem(filepath,asset);
            });
        },

        saveFile:function(filedata){

            _filePromise = _filePromise.then(_ => {
                var projectId  = filedata.projectId;
                return this.loadFileListByProjectId(projectId).then(_fileList => {
                    _fileList = _fileList || [];
                    var fsuniqueId = FS.fsUUID();
    
                    var FilePath = "TWCacheFiles/"+projectId+"/" +fsuniqueId,resolvedFileData;
                    _fileList.push(FilePath);
        
                    if(filedata.type === "folder"){
                        var resolvedFileData = FolderFileData(fsuniqueId,filedata);
           
                    }else{
                        var resolvedFileData = FolderFileData(fsuniqueId,filedata);
                    }
                    /**TODO */

                   
                    var _adp = resolvedFileData;
                    resolvedFileData.path = [];
                    while(_adp.parent){
                        _adp = editor.call('assets:get',resolvedFileData.parent);
                        resolvedFileData.path.unshift(_adp.get("id"));                       
                    }
                    var assetData = resolvedFileData;
                    delete assetData.item_id;
                    delete assetData.branch_id;
    
                    var _promise = null;
                    
                    if (assetData.file) {       
                        // if (assetData.file.variants) {
                        //     for (var key in assetData.file.variants) {
                        //         assetData.file.variants[key].url = getFileUrl(assetData.id, assetData.revision, assetData.file.variants[key].filename);
                        //     }
                        // }
                        
                        // /api/assets/29323325/file/4714a6caa0be3c4153b747562a4337b6.png?branchId=c77faedd-23c1-4b88-a8da-bff45daa380e
                       if(assetData.type === "texture"){
                        // _promise = new Promise((resolve) => {
                        //     var reader  = new FileReader();
                        //     reader.addEventListener("load", function () {
                        //        // assetData.source = false;
                        //         assetData.fileurl = reader.result;
                        //         resolve();
                        //     }, false);
                        //     reader.readAsDataURL(assetData.file);
                        // })

                        
                        assetData.source = false;
                        assetData.has_thumbnail = true;
                       }

                       
                       
    
                    }
                    return (_promise || Promise.resolve()).then(x => {
                        return localforage.setItem(FilePath,assetData).then(function(){    
                            return FS.saveFileListByProjectId(projectId,_fileList).then(_ => {
                                return assetData;
                            });                 
                           
                        });
                    })
                    
        
                });   
            });
            return _filePromise;
                   
        },
        deleteFileAndFileListByFsid:function(projectId,fsid){
           

            return this.loadFileListByProjectId(projectId).then(function(fileList){
                fileList = fileList || [];
                var FilePath = "TWCacheFiles/"+projectId+"/" +fsid;
                var idx = fileList.indexOf(FilePath);
                if(idx >= 0)  fileList.splice(idx,1);
               
                return FS.saveFileListByProjectId(projectId,fileList).then(_ => {
                    return localforage.removeItem(FilePath);
                }); 
            });
           
        },
        getFile:function(projectId,fsid){
            var FilePath = "TWCacheFiles/"+ projectId +"/" + fsid;
            return localforage.getItem(FilePath);
        },
        getFileByPath:function(FilePath){
            return localforage.getItem(FilePath);
        },
        loadFilesByProjectId:function(projectId){
            editor.call('assets:clear');
            this.loadFileListByProjectId(projectId).then(function(fileList){
                if(fileList){
                    for(var i = 0;i < fileList.length;i++){
                        FS.getFileByPath(fileList[i]).then(assetData => {
                            
                            var options = null;
                            if (assetData.type === 'sprite') {
                                options = {
                                    pathsWithDuplicates: ['data.frameKeys']
                                };
                            }  
                            
                            if(assetData.type === "texture"){
                                var file = assetData.file;
                                assetData.file = {
                                    url: assetData.fileurl,
                                    size:file.size,
                                    type:file.type,
                                    name:file.name,
                                    filename:file.name
                                };
                                delete assetData.fileurl;
                            }
                            var asset = new Observer(assetData, options);
                            editor.call('assets:add', asset);
                        });                           
                    }
                }
            });
            
        },
        op:function(){

        },
        sceneRaw:function(sceneId){

            var scene = {
                data:{
                    "branch_id":"c77faedd-23c1-4b88-a8da-bff45daa380e",
                    "project_id":config.project.id,
                    "name":"Untitled",
                    "created":"2020-03-22T11:56:37.635Z",
                    "settings":{"physics":{"gravity":[0,-9.8,0]},"render":{"fog_end":1000,"tonemapping":0,"skybox":null,"fog_density":0.01,"gamma_correction":1,"exposure":1,"fog_start":1,"global_ambient":[0.2,0.2,0.2],"skyboxIntensity":1,"fog_color":[0,0,0],"lightmapMode":1,"fog":"none","lightmapMaxResolution":2048,"skyboxMip":0,"lightmapSizeMultiplier":16}},
                    "scene":config.project.id,
                     "item_id":config.project.id + "",
                     "checkpoint_id":"cf8432a3-d033-4092-865d-5eb85b1df8f5"
                 }
            };


            var ScenePath = "TWCacheEntities/"+sceneId;
            return localforage.getItem(ScenePath).then(sceneData => {
                
                scene.data.entities = (sceneData && sceneData.entities) || {
                    "2f5414c3-6c34-11ea-97ae-026349a27a7c": {
                        position: [0, 0, 0],
                        scale: [1, 1, 1],
                        name: "Root",
                        parent: null,
                        resource_id: "2f5414c3-6c34-11ea-97ae-026349a27a7c",
                        components: {},
                        rotation: [0, 0, 0],
                        tags: [],
                        enabled: true,
                        children: []
                    }           
                };
                return scene;
               
            });

        },
        saveSettings:function(projectId,settings){
            localforage.getItem("TWPROJECTS:LIST").then(function(projectList){

                projectList.forEach(function(project){

                    if(project.id === projectId){
                        project.settings = settings;
                        localforage.setItem("TWPROJECTS:LIST",projectList);
                    }

                })

            })
        }
    }
    editor.method("FS:offline-system",function(){
    
        return FS;
    
    });

    var OpWait = Promise.resolve(true);
    /**o -> object   l -> list */
    editor.method('realtime:scene:op', function(op) {
        if (!editor.call('permissions:write'))
            return;

        if(OpWait){
            OpWait = OpWait.then(_ => {


                var ProjectId = config.project.id;  

                console.trace();
                console.log('out: [ ' + Object.keys(op).filter(function(i) { return i !== 'p' }).join(', ') + ' ]', op.p.join('.'));
                console.log(op)

                console.log(editor.call('entities:raw'))
                console.log(editor.call('entities:list'))


                var ScenePath = "TWCacheEntities/"+ProjectId;
                var opcode = Object.keys(op);
                

                return localforage.getItem(ScenePath).then(sceneData => {
                    sceneData = sceneData ||  {entities:{
                        "2f5414c3-6c34-11ea-97ae-026349a27a7c": {
                            position: [0, 0, 0],
                            scale: [1, 1, 1],
                            name: "Root",
                            parent: null,
                            resource_id: "2f5414c3-6c34-11ea-97ae-026349a27a7c",
                            components: {},
                            rotation: [0, 0, 0],
                            tags: [],
                            enabled: true,
                            children: []
                        }           
                    }};
                    var insertEntity = sceneData;
                    console.log(sceneData);
    
                    try{
                        if(op.p.length > 0){
                            for(var i = 0 ; i < op.p.length - 1; i++){
                                insertEntity = insertEntity[ op.p[i] ];
                            }    
                             //list insert
                          if(opcode.length === 2 && opcode[1] === 'li'){
                            //var ie = editor.call('entities:get',op.li).json();   

                            insertEntity.splice(op.p[op.p.length - 1],0,op.li);

                           // sceneData.entities[op.li] = ie;
                            return localforage.setItem(ScenePath,sceneData);    
                          }else if(opcode.length === 3 && opcode[1] === 'li'){  //list set  
                            insertEntity.splice(op.p[op.p.length - 1],1,op.li);
                            return localforage.setItem(ScenePath,sceneData);    
                          }else if(opcode.length === 2 && opcode[1] === 'oi'){
                            // object insert
                            insertEntity[op.p[op.p.length - 1]] = op[opcode[1]];
                            return localforage.setItem(ScenePath,sceneData);
                          }else if(opcode.length === 3 && opcode[1] === 'oi'){
                            // object insert
                            insertEntity[op.p[op.p.length - 1]] = op[opcode[1]];
                            return localforage.setItem(ScenePath,sceneData);
                          }else if(opcode.length === 2 && opcode[1] === 'ld'){
                              //list delete
                              insertEntity.splice(op.p[op.p.length - 1],1);
                              
                              return localforage.setItem(ScenePath,sceneData);
        
                          }else if(opcode.length === 2 && opcode[1] === 'od'){
                            //object delete
                            delete  insertEntity[op.p[op.p.length - 1]];
                           
                            return localforage.setItem(ScenePath,sceneData);
        
                          }     
                          
                         
                        }
                    }catch(e){
                        
                    }

                    return Promise.resolve();
                });

            })

        }
    });


    var OpFsWait = Promise.resolve(true);
    editor.method('realtime:send', function(name, data) {      
        if(name === "fs"){
            if(OpFsWait){
                OpFsWait = OpFsWait.then(() => {
                    if(data.op === "move"){

                        return Promise.all( [].concat(data.ids).map(fsid => {
                            var filepath = "TWCacheFiles/" + config.project.id + "/" + fsid;
                            return FS.getFileByPath(filepath);
                        })).then((files) => {

                            var _allreadyPromise = [],oi;

                            for(var i = 0; i < files.length;i++){   
                                //files[i].parent = data.to;
                                
                                if(!data.to){
                                    oi = [];
                                }else{
                                    oi = [data.to];
                                }

                                files[i].path = oi;
                                var filepath = "TWCacheFiles/"+ config.project.id + "/" + files[i].id;
                                _allreadyPromise.push(localforage.setItem(filepath,files[i]));
                            }
                            return Promise.all(_allreadyPromise).then(_ => {
                                //sync asset data
                                var ids = data.ids;

                                for(var i = 0;i< ids.length;i++){
                                   
                                    if(!data.to){
                                        oi = [];
                                    }else{
                                        oi = [data.to];
                                    }
                                    var ops = { p: ["path"],oi: oi,od: null};                         
                                    editor.emit('realtime:op:assets', ops,ids[i]);
                                }
                               
                            });
                        });
                               
                    }else  if(data.op === "delete"){
                        

                        for (var i = 0; i < data.ids.length; i++) {
                            var asset = editor.call('assets:getUnique',data.ids[i]);
                            if (! asset) continue;

                            var filepath = "TWCacheFiles/" + config.project.id + "/" + data.ids[i];
                            return FS.deleteFileAndFileListByFsid(config.project.id,data.ids[i]).then(x => {
                                editor.call('assets:remove', asset);
                            });

                        }

                    }
                })
            }        
        }
    });




    var fileEditPromise = Promise.resolve();

    editor.method('realtime:assets:op',function(op,uid){
    
        fileEditPromise = fileEditPromise.then(x => {
            var ProjectId = config.project.id;  
            var AssetPath = "TWCacheFiles/"+ProjectId + "/" + uid;
            var opcode = Object.keys(op);

            return localforage.getItem(AssetPath).then(assetData => {

                if(!assetData)  return true;
                var insertEntity = assetData;

                if(op.p.length > 0){
                    for(var i = 0 ; i < op.p.length - 1; i++){
                        insertEntity = insertEntity[ op.p[i] ];
                    }    
                     //list insert
                  if(opcode.length === 2 && opcode[1] === 'li'){
                    //var ie = editor.call('entities:get',op.li).json();   

                    insertEntity.splice(op.p[op.p.length - 1],0,op.li);

                   // sceneData.entities[op.li] = ie;
                    return localforage.setItem(AssetPath,assetData);    
                  }else if(opcode.length === 3 && opcode[1] === 'li'){  //list set  
                    insertEntity.splice(op.p[op.p.length - 1],0,op.li);
                    return localforage.setItem(AssetPath,assetData);    
                  }else if(opcode.length === 2 && opcode[1] === 'oi'){
                    // object insert
                    insertEntity[op.p[op.p.length - 1]] = op[opcode[1]];
                    return localforage.setItem(AssetPath,assetData);
                  }else if(opcode.length === 3 && opcode[1] === 'oi'){
                    // object insert
                    insertEntity[op.p[op.p.length - 1]] = op[opcode[1]];
                    return localforage.setItem(AssetPath,assetData);
                  }
                  
                  else if(opcode.length === 2 && opcode[1] === 'ld'){
                      //list delete
                      insertEntity.splice(op.p[op.p.length - 1],1);
                      
                      return localforage.setItem(AssetPath,assetData);

                  }else if(opcode.length === 2 && opcode[1] === 'od'){
                    //object delete
                    delete  insertEntity[op.p[op.p.length - 1]]
                    return localforage.setItem(AssetPath,assetData);

                  }
  
                  return Promise.resolve();

                   
                }
            });
    
        });
    
       
    
    });

    editor.method('realtime:op:assets',function(op){

                    /**脚本在settings里排序 */
            // if(asset.get('type') === 'scripts'){
            //     var ops = {
            //         li: asset.get('uniqueId'),
            //         p: ["scripts", 1]
            //     }
    
            //     editor.emit("settings:op",ops,false);
        
            // }

    });



    editor.on('messenger:assets.delete', function(data) {
       
    });

    // editor.method('realtime:send', function(name,data){
    //     if(name === "selection" && data.t === "editorSettings"){
    //     }
    // });

    editor.on('project:export', function(data) {
        var ProjectId =  config.project.id;
        var ScenePath = "TWCacheEntities/" + ProjectId;
        return localforage.getItem(ScenePath); 

        var blob = new Blob([typedArray.buffer], {type: 'application/json'});

        var construct = {
            project:{

            },
            entities:{

            },
            assets:{

            },
            filelist:[]  
        };

        var filereader = new FileReader();

        filereader.onload = function(){

        }
        filereader.readAsArrayBuffer()

        var blob = new Blob([typedArray.buffer], {type: 'application/octet-stream'});

        
    });
});



// data = msg.data.slice('fs:'.length);
// var ind = data.indexOf(':');
// if (ind !== -1) {
//     var op = data.slice(0, ind);
//     if (op === 'paths') {
//         data = JSON.parse(data.slice(ind + 1));
//         editor.call('assets:fs:paths:patch', data);
//     }
// }