editor.once('load',function(){
    'use strict';
     // create UI
     var root = editor.call('layout.root');


     var suspendCloseUndo;
     var popover = document.createElement("wc-popup");
   
     // overlay
      var overlay = new ui.Overlay();
      overlay.class.add('timeline-editor');
      overlay.hidden = true;
     root.append(popover);

     popover.classList.add('timeline-popup');
     //zidnex under droptarget
 
     var panel = new ui.Panel();
     panel.class.add('root-panel');
     panel.flex = true;
     panel.flexDirection = 'row';
     panel.header = 'TIMELINE EDITOR';
     popover.section  = panel.element;


     

     var _asset,_filedata;

     // close button
     var btnClose = new ui.Button({
         text: '&#57650;'
     });
     btnClose.class.add('close');
     btnClose.on('click', function () {


        var TimeLine = editor.call('timeline:get');
        var jsontimeline = TimeLine.json();

        var assetRaw = _asset;
       
         var FS = editor.call('FS:offline-system');
         var filepath = "TWCacheFiles/" + config.project.id + "/" + _asset.get("id");

         FS.getFileByPath(filepath).then(file => {


             if (!file) return;

             var newfile = new Blob([ JSON.stringify(jsontimeline) || '' ], { type: 'application/json' });
             newfile.name = file.filename || file.name || _asset.get("name");

             file.file = newfile;

            var reader = new FileReader();
           

            reader.addEventListener("load", function () {
                assetRaw.set("file.url",reader.result);
                reader = null;
            });
            reader.readAsDataURL(file.file);

            return localforage.setItem(filepath,file);

         });

         editor.call('picker:timeline:close');


       
     });
     panel.headerElement.appendChild(btnClose.element);



     function dataURLtoText(dataurl,callback) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        var blob = new Blob([u8arr], { type: mime });
        blobToText(blob,callback);
    }
    
    
    function blobToText(blob, callback) {
        let a = new FileReader();
        a.onload = function (e) { callback(e.target.result); }
        a.readAsText(blob);
    }

   

    var timelineEditor
     
     var showEditor = function (asset) {
        _asset = asset;

        wcUtils.eventUtil.off(editor.call('timeline:get').element,"mousedown",wcUtils.utils.stopEvent);
        wcUtils.eventUtil.on(editor.call('timeline:get').element,"mousedown",wcUtils.utils.stopEvent);

        panel.header = 'Timeline EDITOR - ' + asset.get('name').toUpperCase();

        if(!timelineEditor){
            timelineEditor = editor.call('timeline:get').element;
            panel.innerElement.appendChild(timelineEditor);


            var dropRef = editor.call('drop:target', {
                ref: timelineEditor.querySelector(".instancesGrid"),
                filter: function (type, data) {                 
                    return type === "entity";
                },
                drop: function (type, data) {
                   var dropManager = editor.call('editor:dropManager')
                   console.log(type, data)
                   console.log(dropManager)
                   addMasterTimelineTarget(data.resource_id,editor.call('entities:get',data.resource_id).get("name") + "-anim");
                }
            });
        
            dropRef.class.add('drop-area-project-img');
        }
       
        
       
        // show overlay
        overlay.hidden = false;
        popover.show();
        // clear current selection so that we don't
        // accidentally delete any selected assets when pressing delete
        editor.call('selector:history', false);
        editor.call('selector:clear');
        // restore selector history in a timeout
        // because selector:clear emits a history
        // event also in a timeout... annoying

        /**初始化 */


        function rebuildTimeline(json){

            var TimeLine = editor.call('timeline:get');
            var TimeLineRow = editor.call('TimeLineRow:Class');
            var MasterKeyframe = editor.call('MasterKeyframe:Class');
            var PerpertyKeyframe = editor.call('PerpertyKeyframe:Class');


            TimeLine.reinit();
          

            TimeLine.totalTimeHandlePos = json.totaltime;

            json.rowInstances.forEach(function(tlrdata){
                createTimelineRow(TimeLine,tlrdata);

                TimeLine.rowInstance.filter(d => d._type === "master").forEach(function(tlr){


                    if(!tlr.animateTarget){

                        TimeLine.foldRow(tlr);
                        tlr.hide();
                    }

                })

               
            });

            function createTimelineRow(timeline,data,parenttimeline){
                var tlrow = new TimeLineRow(timeline,data._type,data.instancesTrack._Name);
                tlrow.row = data.row;
                parenttimeline && tlrow.insertRow(parenttimeline);
                !parenttimeline && tlrow.insertRow();
                
                //!data._fold && tlrow.expandRow();
                // data._fold && timeline.foldRow(tlrow);;
                
                tlrow.expandRow();

                tlrow.hided = data.hided;
                tlrow.locked = data.locked;
              
                data.locked && tlrow.lock();
                data.hided && tlrow.hide();
                
                tlrow.animateTarget = data.animateTarget;

                for(var p in data.instancesTrack){
                    if(p === 'keyframes'){                   
                        for(var k in data.instancesTrack[p]){

                            var keyframedata = data.instancesTrack[p][k];

                            if(data._type === 'master'){

                                var masterKeyframe = new MasterKeyframe(keyframedata._Step);
                                masterKeyframe.lock = keyframedata.lock; 
                                for(var _p in keyframedata){
                                    masterKeyframe.data.set(_p,keyframedata[_p]);
                                }

                                keyframedata.Step = keyframedata._Step;
                                keyframedata.Enable = keyframedata._Enable;
                                tlrow.instancesTrack.addKeyframe(masterKeyframe);
                 
                            }else{
                                var propertyKeyframe = new PerpertyKeyframe(keyframedata._Step);
                                propertyKeyframe.lock = keyframedata.lock; 
                                for(var _p in keyframedata){
                                    propertyKeyframe.data.set(_p,keyframedata[_p]);
                                }
                                keyframedata.Step = keyframedata._Step;
                                keyframedata.Enable = keyframedata._Enable;                               
                                tlrow.instancesTrack.addKeyframe(propertyKeyframe,keyframedata._Value);
    
                            }              
                        }
                                       
                    }else{
                       tlrow.instancesTrack[p] = data.instancesTrack[p];
                    }
                }
 
                if(data.children.length){
                    data.children.forEach(function(tlr2data){
                        createTimelineRow(timeline,tlr2data,tlrow);
                    });
                }
            }
        }

        function addMasterTimelineTarget(animateTarget,MasterName){
            var TimeLine = editor.call('timeline:get');
            var TimeLineRow = editor.call('TimeLineRow:Class');
            var MasterKeyframe = editor.call('MasterKeyframe:Class');
            var PerpertyKeyframe = editor.call('PerpertyKeyframe:Class');
            
            var startrow = TimeLine.getVisibleRow();
            startrow = startrow + 1;
            var tlrow1 = new TimeLineRow(TimeLine,"master",MasterName || "NoName");
            tlrow1.row = startrow;
            tlrow1.insertRow();
            tlrow1.expandRow();
            tlrow1.lock();
            tlrow1.animateTarget = animateTarget;
            
            startrow = startrow + 1;
            var tlrow2 = new TimeLineRow(TimeLine,"property","X");
            tlrow2.row = startrow; 
            tlrow2.insertRow(tlrow1);
            tlrow2.expandRow();
            
            
            startrow = startrow + 1;
            var tlrow3 = new TimeLineRow(TimeLine,"property","Y");
            tlrow3.row = startrow;
            tlrow3.insertRow(tlrow1);
            tlrow3.expandRow();
            
          
            startrow = startrow + 1;
            var tlrow4 = new TimeLineRow(TimeLine,"property","Rotate");
            tlrow4.row = startrow;
            tlrow4.insertRow(tlrow1);
            tlrow4.expandRow();
            
        
            startrow = startrow + 1;
            var tlrow5 = new TimeLineRow(TimeLine,"property","ScaleX");
            tlrow5.row = startrow;
            tlrow5.insertRow(tlrow1);
            tlrow5.expandRow();
        
        
            startrow = startrow + 1;
            var tlrow6 = new TimeLineRow(TimeLine,"property","ScaleY");
            tlrow6.row = startrow;
            tlrow6.insertRow(tlrow1);
            tlrow6.expandRow();


            startrow = startrow + 1;
            var tlrow7 = new TimeLineRow(TimeLine,"property","Opacity");
            tlrow7.row = startrow;
            tlrow7.insertRow(tlrow1);
            tlrow7.expandRow();
        
            var masterKeyframe = new MasterKeyframe(0);
            masterKeyframe.lock = true; 
            tlrow1.instancesTrack.addKeyframe(masterKeyframe);
            tlrow2.instancesTrack.addKeyframe(new PerpertyKeyframe(0));
            tlrow3.instancesTrack.addKeyframe(new PerpertyKeyframe(0));
            tlrow4.instancesTrack.addKeyframe(new PerpertyKeyframe(0));  
            tlrow5.instancesTrack.addKeyframe(new PerpertyKeyframe(0,1));
            tlrow6.instancesTrack.addKeyframe(new PerpertyKeyframe(0,1)); 
            tlrow7.instancesTrack.addKeyframe(new PerpertyKeyframe(0,1));          
        }

    
        var timelines = asset.get("data.timelines");
        if(timelines == null){
           // timelines = {};
           // timelines[a.get("id")]
           // asset.set("data.timelines",);
        }

        var dataurl = _asset.get("file.url");
        
        if(dataurl){
            dataURLtoText(dataurl,function(json){
                if(json){          
                    var data = JSON.parse(json);
                    if(data && Object.keys(data).length)
                    rebuildTimeline(data);
                }
            });
        }

        /**TODO */

        setTimeout(function () {
            editor.call('selector:history', true);
        });
    };

          // open Timeline Editor (undoable)
 editor.method('picker:timeline', function (asset) {
     
    editor.call('history:add', {
        name: 'open timeline editor',
        undo: function () {
            overlay.hidden = true;
            popover.close();
        },
        redo: function () {
            var currentAsset = editor.call('assets:get', asset.get('id'));
            if (!currentAsset) return;

            showEditor(currentAsset);
        }
    });

    showEditor(asset);
});


var TimeLine = new pcui.Timeline();

editor.method('timeline:get',function(){
    return TimeLine;
});


// Close Sprite Editor (undoable)
editor.method('picker:timeline:close', function () {
    overlay.hidden = true;
    popover.close();
});

overlay.on('show', function () {
    // editor-blocking picker opened
    editor.emit('picker:open', 'timeline-editor');
});

// Clean up
overlay.on('hide', function () {
    if (!suspendCloseUndo) {

        editor.call('history:add', {
            name: 'close sprite editor',
            undo: function () {
                var asset = editor.call('assets:get', currentAsset.get('id'));
                if (!asset) return;

                showEditor(asset);
            },
            redo: function () {
                suspendCloseUndo = true;
                overlay.hidden = true;
                suspendCloseUndo = false;
            }
        });
    }

    cleanUp();

    // editor-blocking picker closed
    editor.emit('picker:close', 'timeline-editor');
});


});




