
editor.on('load',function(){

    editor.emit('realtime:authenticated');
   
    editor.emit('app:authenticated');


    var assetsLoaded = false;
    var entitiesLoaded = false;

    editor.once('assets:load', function () {
        assetsLoaded = true;
        // if entities already loaded then create them
        if (entitiesLoaded)
           projectReady();
    });

    editor.once('entities:load', function() {
        entitiesLoaded = true;
        // if assets already loaded then create entities
        if (assetsLoaded)
            projectReady();
    });


    function projectReady(){

        // editor.call("plugins:load","mp");
        editor.call("plugins:load","template_apply");
        editor.call("plugins:load","build_check");
    }
    
});