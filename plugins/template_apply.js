
editor.method('submit:template_apply:task',function(taskData,callback){
    if(taskData.task_type === "propagate_template_changes"){
        var templateAsset = editor.call("assets:get",taskData.template_id);
        var entity = editor.call("entities:get",taskData.entity_id);

        var root = entity;

        const sceneEnts = editor.call('template:utils', 'getAllEntitiesInSubtree', root, []);
        const data = editor.call('template:newTemplateData', root, sceneEnts);


        templateAsset.set("data",data.assetData);

        callback && callback();

       


    }
    

})