
editor.method('build:check:task',function(projectId,fn){


    var Root = editor.call("entities:root");
    var AppJS = editor.call("assets:findOne",function(asset){
        return asset.get("name") === "app.js";
    });


    var scenePromise = localforage.getItem("TWCacheEntities/" + projectId);
    scenePromise.then(function(data){

        var entities = data.entities;
        var RootEntity = entities[Root.get("resource_id")];
        
        var meta =  `
        "appId": ${RootEntity.components.script.scripts.app.attributes.appId},
        "env": ${RootEntity.components.script.scripts.app.attributes.env}`
        
        window.alert(meta);

        fn();

    })

  
    


  
   

})