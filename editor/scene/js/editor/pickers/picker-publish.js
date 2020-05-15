/* editor/pickers/picker-publish.js */
editor.once('load', function () {
    'use strict';

    // main panel
    var panel = new ui.Panel();
    panel.class.add('picker-publish');
    panel.flex = true;

    // register panel with project popup
    editor.call('picker:project:registerMenu', 'publish', 'Publish', panel);


  

    // disables / enables field depending on permissions
    var handlePermissions = function (field) {
        field.disabled = ! editor.call('permissions:write');
        return editor.on('permissions:set:' + config.self.id, function (accessLevel) {
            if (accessLevel === 'write' || accessLevel == 'admin') {
                field.disabled = false;
            } else {
                field.disabled = true;
            }
        });
    };

    // open publishing popup
    editor.method('picker:publish', function () {
        editor.call('picker:project', 'publish');
    });


    // playcanv.as
    var panelPlaycanvas = new ui.Panel();
    panelPlaycanvas.flex = true;
    panelPlaycanvas.class.add('buttons');
    panel.append(panelPlaycanvas);

    var labelIcon = new ui.Label({
        text: '&#57960;',
        unsafe: true
    });
    labelIcon.class.add('icon');
    panelPlaycanvas.append(labelIcon);

    var labelDesc = new ui.Label({
        text: 'Publish your project publicly'
    });
    labelDesc.class.add('desc');
    panelPlaycanvas.append(labelDesc);

    // publish button
    var btnPublish = new ui.Button({text: 'Publish Build'});
    btnPublish.class.add('publish');
    handlePermissions(btnPublish);
    panelPlaycanvas.append(btnPublish);

    panelPlaycanvas.on('click', function () {
        projectPublishDownload(config.project.id);
        editor.emit('picker:publish:close');
        editor.call('picker:project:close');

    });

    // self host
    var panelSelfHost = new ui.Panel();
    panelSelfHost.flex = true;
    panelSelfHost.class.add('buttons');
    panel.append(panelSelfHost);

    labelIcon = new ui.Label({
        text: '&#57925;',
        unsafe: true
    });
    labelIcon.class.add('icon');
    panelSelfHost.append(labelIcon);

    labelDesc = new ui.Label({
        text: 'Download build and host it on your own server.'
    });
    labelDesc.class.add('desc');
    panelSelfHost.append(labelDesc);

    // download button
    var btnDownload = new ui.Button({text: 'Download .wd1p'});
    btnDownload.class.add('download');
    handlePermissions(btnDownload);
    panelSelfHost.append(btnDownload);

    panelSelfHost.on('click', function () {
        /**下载项目 */


        // var worker = new Worker("./viewportworkers/downloadproject.worker.js");
        // worker.postMessage({
        //     name: "download",
        //     projectId:config.project.id
        // });

        // worker.onmessage = function (e) {
            
        // };
        panel.hidden = true;     
        editor.call('picker:project:close');
        projectDownload(config.project.id);
        
    });
    function hashCode(str) {
        var hash = 0;
        for (var i = 0, len = str.length; i < len; i++) {
          hash = ((hash << 5) - hash) + str.charCodeAt(i);
          // Convert to 32bit integer
          hash |= 0;
        }
        return hash;
      }

      function click(node) {
		try {
		  node.dispatchEvent(new MouseEvent('click'));
		} catch (e) {
		  var evt = document.createEvent('MouseEvents');
		  evt.initMouseEvent('click', true, true);
		  node.dispatchEvent(evt);
		}
	  }
	  function saveAs(blob, name, opts) {
		var a = document.createElement('a');
		name = name || blob.name || 'download';
		a.download = name;
		a.rel = 'noopener'; // tabnabbing
		// TODO: detect chrome extensions & packaged apps
		// a.target = '_blank'
		{
		  // Support blobs
		  a.href = URL.createObjectURL(blob);
		  setTimeout(function () {
			URL.revokeObjectURL(a.href);
		  }, 4E4); // 40s
	  
		  setTimeout(function () {
			click(a);
		  }, 0);
		}
	  }
function  projectDownload(projectId){
    saveProject(projectId);


	   
		function saveProject(projectId) {
		  var zip = new JSZip();
		  var projectName = "Download";
	  
		  var assetsHash = "", sceneHash = "";
	  
	  
		  var assets = {
	  
		  };
	  
		  var folder = {
	  
		  };
		  var filelistPromise = localforage.getItem("TWCacheFiles/" + projectId + "/FileList");
		  var scenePromise = localforage.getItem("TWCacheEntities/" + projectId);
	  
		  var projectPromise = localforage.getItem("TWPROJECTS:LIST").then(projects => {
	  
			var project = projects.filter(p => p.id === projectId)[0];
			return project;
	  
		  });
	  
	  
		  projectPromise.then(project => {
	  
			if (!project) return;
	  
			Promise.all([filelistPromise, scenePromise]).then(([filelist, scene]) => {
			  var assetslist = filelist.map(filename => {
				return filename.replace("TWCacheFiles/" + projectId + "/", "");
			  });
	  
			  var assetsmeta = {};
	  
	  
			  var assetsPromise = filelist.map(filename => {
				return localforage.getItem(filename).then(asset => {
				  assets[asset.id] = asset;
				  return asset;
				})
			  });
	  
	  
			  Promise.all(assetsPromise).then(_ => {
	  
				for (var i = 0; i < assetslist.length; i++) {
				  var asset = assets[assetslist[i]];
				  if (asset.type !== "folder" && asset.type !== "template") {
					var filepath = "";
					if (asset.path.length) {
					  var filepath = asset.path.map(p => assets[p].name).join("/") + '/';
					}
	  
					zip.file(filepath + asset.name, asset.file);
					
					asset.fileType = asset.file.type;
					delete asset.file;
	  
					zip.file(filepath + asset.name + ".meta", JSON.stringify(asset));
					assetsmeta[filepath + asset.name] = asset;
				  }else if (asset.type === "template") {

            var filepath = "";
            if (asset.path.length) {
              var filepath = asset.path.map(p => assets[p].name).join("/") + '/';
            }

            zip.file(filepath + asset.name, JSON.stringify(asset.data));
          
            asset.fileType = "template";

            zip.file(filepath + asset.name + ".meta", JSON.stringify(asset));
            assetsmeta[filepath + asset.name] = asset;

          }  else if (asset.type === "folder") {
					var filepath = "";
					if (asset.path.length) {
					  var filepath = asset.path.map(p => assets[p].name).join("/") + '/';
					}
					zip.folder(filepath + asset.name);
					assetsmeta[filepath + asset.name] = asset;
				  }
				}
	  
				convertProject();
			  });
	  
	  
			  function convertProject() {
				assetsHash = hashCode(JSON.stringify({ assetslist }));
				sceneHash = hashCode(JSON.stringify({ scene }));
	  
				zip.file("assets_mainifest.meta", JSON.stringify({
				  "scheme": "TWCacheFiles/${projectId}/FileList",
				  "schemeAsset": "TWCacheFiles/${projectId}/${assetFsName}",
				  "version": "0.0.1",
				  "list": assetslist,
				  "assetsmeta": assetsmeta,
				}));
	  
				zip.file("main.scene", JSON.stringify({
				  "scheme": "TWCacheEntities/${projectId}",
				  "version": "0.0.1",
				  "list": scene
				}));
	  
				zip.file("project.meta", JSON.stringify({
				  "projectId": projectId,
				  "projectName": projectName,
				  "version": "0.0.1",
				  "project": project,
				  "assets": {
					name: "assets_mainifest.meta",
					hash: assetsHash
				  },
				  "scenes": {
					"name": "main.scene",
					"hash": sceneHash,
				  }
				}));
	  
				bundle(projectName);
	  
			  }
			});
	  
	  
		  });
	  
	  
	  
		  function bundle(projectName) {
			zip.generateAsync({ type: "blob" }).then(function (blob) {
			  saveAs(blob, projectName + ".wd1p");
			});
		  }
		}
}


function projectPublishDownload(projectId){

    editor.call("build:check:task",projectId,function(){
      buildBundProject(projectId);
    });

   
  function buildBundProject(projectId) {
    var zip = new JSZip();
    var projectName = "build";

    var assetsHash = "", sceneHash = "";


    var assets = {

    };

    var assetsList = [];

    var folder = {

    };
    var filelistPromise = localforage.getItem("TWCacheFiles/" + projectId + "/FileList");
    var scenePromise = localforage.getItem("TWCacheEntities/" + projectId);

    var projectPromise =  new Promise(function(resolve,reject){
      localforage.getItem("TWPROJECTS:LIST").then(projectlists => {
       if(!projectlists) return null;

          var project = projectlists.filter(p => p.id == projectId)[0];

         

          resolve(project);

       });
    });


    projectPromise.then(project => {

      if (!project) return;


      var loadscripts = project.settings.scripts;
      var appCssFileData = "";

      Promise.all([filelistPromise, scenePromise]).then(([filelist, scene]) => {

        function resolveSceneCssBuildIn(entities){
           for(var k in entities){
             var entity = entities[k];

             if(entity.components.css){
            
              var css = entity.components.css;
              var sheets = "";
              var name = entity.name;
              if (name !== "New Entity" && css.cssText) {
                sheets += "." + name + "{" +
                  css.cssText +
                  "}";
              }
  
              
  
              for (key in css.styleSheets) {
                var stylesheet = css.styleSheets[key];
                if (stylesheet && stylesheet.name) {
                  sheets += stylesheet.name + "{" + (stylesheet.text || '') + "}";
                };
              }

              appCssFileData += sheets;


              css.cssText = "";
              css.styleSheets = {};
  
             }

           }

           
        }
        resolveSceneCssBuildIn(scene.entities);
        zip.file("scene.css", appCssFileData);
        


        var assetslist = filelist.map(filename => {
          return filename.replace("TWCacheFiles/" + projectId + "/", "");
        });

        var assetsmeta = {};


        var assetsPromise = filelist.map(filename => {
          return localforage.getItem(filename).then(asset => {
            assets[asset.id] = asset;
            
            return asset;
          })
        });


        Promise.all(assetsPromise).then(_ => {

            var combineJSFileP = [];
            

          for (var i = 0; i < assetslist.length; i++) {
            var asset = assets[assetslist[i]];
            
            if (asset.type !== "folder" && asset.type !== "template") {
              var filepath = "";
              if (asset.path.length) {
                var filepath = asset.path.map(p => assets[p].name).join("/") + '/';
              }

              zip.file(filepath + asset.name, asset.file);

              assetsList.push(asset);
              
              asset.fileType = asset.file.type;

              if(asset.fileType === "text/javascript"){  

                    (function(name,id){
                        combineJSFileP.push(zip.file(filepath + name).async("string").then(function (text) {
                          return {name:name,content:text,order:loadscripts.indexOf(id)};
                       }))
                    })(asset.name,asset.id);
                               
              }
              delete asset.file;

              zip.file(filepath + asset.name + ".meta", JSON.stringify(asset));
              assetsmeta[filepath + asset.name] = asset;


              
            } else if (asset.type === "template") {
              

              var filepath = "";
              if (asset.path.length) {
                var filepath = asset.path.map(p => assets[p].name).join("/") + '/';
              }

              zip.file(filepath + asset.name, JSON.stringify(asset.data));

              assetsList.push(asset);         
              asset.fileType = "template";

              zip.file(filepath + asset.name + ".meta", JSON.stringify(asset));
              assetsmeta[filepath + asset.name] = asset;

            } else if (asset.type === "folder") {
              var filepath = "";
              if (asset.path.length) {
                var filepath = asset.path.map(p => assets[p].name).join("/") + '/';
              }
              assetsList.push(asset);
              zip.folder(filepath + asset.name);
              assetsmeta[filepath + asset.name] = asset;
            }
          }


          Promise.all(combineJSFileP).then(function(textcontets) {
              
            zip.file("__load__script.js", textcontets.filter(t => t.order !== -1).sort(function(a,b){
              return a.order - b.order;
            }).map(t => {
              return t.content;  
            }).join("\n"));
            convertProject(loadscripts);

          })
          
        });


        function convertProject(loadscripts) {
          assetsHash = hashCode(JSON.stringify({ assetslist }));
          sceneHash = hashCode(JSON.stringify({ scene }));


          zip.file("application.json",JSON.stringify({
            "application_properties":{
                  fill_mode: "KEEP_ASPECT",
                  height: 1280,
                  libraries: [],
                  loading_screen_script: null,
                  preserve_drawing_buffer: false,
                  resolution_mode: "FIXED",
                  scripts: loadscripts,
                  transparent_canvas: false,
                  use_device_pixel_ratio: false,
                  use_legacy_scripts: false,
                  width: 720
              },
              assets:assetsList || [],
              scenes:scene || {}
          }))

        
          bundle(projectName);

        }
      });


    });



    function bundle(projectName) {
      zip.generateAsync({ type: "blob" }).then(function (blob) {
        saveAs(blob, projectName + ".zip");
      });
    }
  }

}

    // on show
    panel.on('show', function () {
        editor.emit('picker:publish:open');

        if (editor.call('viewport:inViewport'))
            editor.emit('viewport:hover', false);
    });

    // on hide
    panel.on('hide', function () {
        editor.emit('picker:publish:close');

        if (editor.call('viewport:inViewport'))
            editor.emit('viewport:hover', true);
    });

    editor.on('viewport:hover', function(state) {
        if (state && ! panel.hidden) {
            setTimeout(function() {
                editor.emit('viewport:hover', false);
            }, 0);
        }
    });


    var panelOpenProject = new ui.Panel();
    panelOpenProject.class.add('picker-publish');
    panelOpenProject.flex = true;

    editor.call('picker:project:registerMenu', 'open', 'Open Project', panelOpenProject);



    var panelPlaycanvas2 = new ui.Panel();
    panelPlaycanvas2.flex = true;
    panelPlaycanvas2.class.add('buttons');
    panelOpenProject.append(panelPlaycanvas2);

    var labelIcon = new ui.Label({
        text: '&#57960;',
        unsafe: true
    });
    labelIcon.class.add('icon');
    panelPlaycanvas2.append(labelIcon);

    var labelDesc = new ui.Label({
        text: 'Open local wd1p Project'
    });
    labelDesc.class.add('desc');
    panelPlaycanvas2.append(labelDesc);

    // publish button
    var btnPublish = new ui.Button({text: 'Open wd1p Project'});
    btnPublish.class.add('publish');
    handlePermissions(btnPublish);
    panelPlaycanvas2.append(btnPublish);


   
    var _promiselp = Promise.resolve();
    var input  = document.createElement('input');
    input.style.display = "none";
    input.type = "file";
    input.addEventListener("change",function(e){
        openProjectFile(e,function(project){
            if (parseInt(config.project.id, 10) === parseInt(project.id, 10))
                return;
            panelPlaycanvas2.hidden = true; 
            editor.call('picker:project:close');

            config.project = project;
            editor.emit('project:ready');

            var ProjectId = project.id;
            var FS = editor.call("FS:offline-system");
            loadEditorScript(function () {
              editor.emit('project:ready');
              editor.emit('offline:loadedproject');

              var FS = editor.call("FS:offline-system");
              FS.sceneRaw(ProjectId).then(scene => {
                  editor.emit('scene:load', scene.data.item_id, ProjectId);
                  editor.emit('scene:raw', scene.data);
                  editor.emit('fsoffline:assets');
              });
          });

        });  
                         
    });

    panelPlaycanvas2.append(input);



    panelPlaycanvas2.on('click', function () {
        /**upload */
        input.click();

    });


    function loadEditorScript(callback) {
      var scripts =
          `
          <script src="./editor/scene/js/editor/permissions.js"></script>
          <script src="./editor/scene/js/editor/users/index.js"></script>
          <script src="./editor/scene/js/editor/settings/index.js"></script>
<script src="./editor/scene/js/editor/settings/settings-attributes-rendering.js"></script> 
<script src="./editor/scene/js/editor/settings/project-settings.js"></script>


<script src="./editor/scene/js/editor/entities/entities.js"></script>
<script src="./editor/scene/js/editor/assets/assets.js"></script>


<script src="./editor/scene/js/editor/selector/index.js"></script>
<script src="./editor/scene/js/editor/sourcefiles/sourcefiles.js"></script>
<script src="./editor/scene/js/editor/sourcefiles/sourcefiles-skeleton.js"></script>
<script src="./editor/scene/js/editor/sourcefiles/sourcefiles-attributes-scan.js"></script>
<script src="./editor/scene/js/editor/schema/index.js"></script>

<script src="./editor/scene/js/editor/entities/entities-selection.js"></script>
<script src="./editor/scene/js/editor/entities/entities-edit.js"></script>
<script src="./editor/scene/js/editor/entities/entities-addComponent.js"></script>
<script src="./editor/scene/js/editor/entities/entities-create.js"></script>
<script src="./editor/scene/js/editor/entities/entities-delete.js"></script>
<script src="./editor/scene/js/editor/entities/entities-duplicate.js"></script>
<script src="./editor/scene/js/editor/entities/entities-copy.js"></script>
<script src="./editor/scene/js/editor/entities/entities-paste.js"></script>
<script src="./editor/scene/js/editor/entities/entities-reparent.js"></script>
<script src="./editor/scene/js/editor/entities/entities-panel.js"></script>
<script src="./editor/scene/js/editor/entities/entities-treeview.js"></script>
<script src="./editor/scene/js/editor/entities/entities-menu.js"></script>
<script src="./editor/scene/js/editor/entities/entities-control.js"></script>
<script src="./editor/scene/js/editor/entities/entities-fuzzy-search.js"></script>
<script src="./editor/scene/js/editor/entities/entities-fuzzy-search-ui.js"></script>
<script src="./editor/scene/js/editor/entities/entities-load.js"></script>
<script src="./editor/scene/js/editor/entities/entities-layout-utils.js"></script>
<script src="./editor/scene/js/editor/entities/entities-history.js"></script>
<script src="./editor/scene/js/editor/entities/entities-sync.js"></script>
<script src="./editor/scene/js/editor/entities/entities-migrations.js"></script>
<script src="./editor/scene/js/editor/entities/entities-scripts.js"></script>
<script src="./editor/scene/js/editor/entities/entities-hotkeys.js"></script>
<script src="./editor/scene/js/editor/entities/entities-context-menu.js"></script>
<script src="./editor/scene/js/editor/entities/index.js"></script>
<script src="./editor/scene/js/editor/assets/assets-registry.js"></script>
<script src="./editor/scene/js/editor/assets/assets-sync.js"></script>
<script src="./editor/scene/js/editor/assets/assets-fs.js"></script>
<script src="./editor/scene/js/editor/assets/assets-panel.js"></script>
<script src="./editor/scene/js/editor/assets/assets-panel-control.js"></script>
<script src="./editor/scene/js/editor/assets/assets-pipeline-settings.js"></script>
<script src="./editor/scene/js/editor/assets/assets-context-menu.js"></script>
<script src="./editor/scene/js/editor/assets/assets-filter.js"></script>
<script src="./editor/scene/js/editor/assets/assets-upload.js"></script>
<script src="./editor/scene/js/editor/assets/assets-create-animation.js"></script>
<script src="./editor/scene/js/editor/assets/index.js"></script>


<script src="./editor/scene/js/editor/animatorviewport/gizimo/index.js"></script>
<script src="./editor/scene/js/editor/animatorviewport/viewport-application.js"></script>
<script src="./editor/scene/js/editor/animatorviewport/viewport.js"></script>
<script src="./editor/scene/js/editor/animatorviewport/index.js"></script>
<script src="./editor/scene/js/editor/animatorviewport/viewport-assets.js"></script>
<script src="./editor/scene/js/editor/animatorviewport/viewport-entities-observer-binding.js"></script>
<script src="./editor/scene/js/editor/animatorviewport/viewport-entities-components-binding.js"></script>


<script src="./editor/scene/js/editor/templates/index.js"></script>
<script src="./editor/scene/js/editor/project/project-scripts-order.js"></script>
<script src="./editor/scene/js/editor/userdata/userdata.js"></script>
<script src="./editor/scene/js/editor/attributes/index.js"></script>
<script src="./editor/scene/js/editor/attributes/reference/index.js"></script>
<script src="./editor/scene/js/editor/attributes/attributes-entity.js"></script>
<script src="./editor/scene/js/editor/attributes/components/attributes-components-script.js"></script>
<script src="./editor/scene/js/editor/templates/templates-override-panel.js"></script>
<script src="./editor/scene/js/editor/templates/templates-entity-inspector.js"></script>
<script src="./editor/scene/js/editor/inspector/attributes.js"></script>
<script src="./editor/scene/js/editor/inspector/components/index.js"></script>
<script src="./editor/scene/js/editor/inspector/components/sprite.js"></script>
<script src="./editor/scene/js/editor/inspector/components/css.js"></script>
<script src="./editor/scene/js/editor/inspector/components/cubecarousel.js"></script>
<script src="./editor/scene/js/editor/inspector/entity.js"></script>
<script src="./editor/scene/js/editor/inspector/asset.js"></script>
<script src="./editor/scene/js/editor/inspector/keyframe.js"></script>
<script src="./editor/scene/js/editor/inspector/assets/index.js"></script>
<script src="./editor/scene/js/editor/inspector/settings.js"></script>
<script src="./editor/scene/js/editor/inspector/settings-panels/base.js"></script>
<script src="./editor/scene/js/editor/inspector/settings-panels/editor.js"></script>
<script src="./editor/scene/js/editor/inspector/settings-panels/rendering.js"></script>
<script src="./editor/scene/js/editor/inspector/settings-panels/index.js"></script>


<script src="./editor/scene/js/editor/toolbar/index.js"></script>
<script src="./editor/scene/js/editor/toolbar/toolbar-logo.js"></script>
<script src="./editor/scene/js/editor/pickers/picker-confirm.js"></script>
<script src="./editor/scene/js/editor/pickers/picker-script-create.js"></script>
<script src="./editor/scene/js/editor/pickers/picker-asset.js"></script>
<script src="./editor/scene/js/editor/pickers/picker-code.js"></script>
<script src="./editor/scene/js/editor/pickers/picker-curve.js"></script>
<script src="./editor/scene/js/editor/pickers/picker-gradient.js"></script>
<script src="./editor/scene/js/editor/pickers/picker-color.js"></script>

<script src="./editor/scene/js/editor/attributes/attributes-asset.js"></script>

<script src="./editor/scene/js/editor/pickers/timeline/picker-timeline.js"></script>
<script src="./editor/scene/js/editor/pickers/timeline/MouseEventProxy.js"></script>
<script src="./editor/scene/js/editor/pickers/timeline/track.js"></script>
<script src="./editor/scene/js/editor/pickers/timeline/keyframes.js"></script>
<script src="./editor/scene/js/editor/attributes/attributes-keyframe.js"></script>

<script src="./editor/scene/js/editor/attributes/assets/attributes-asset-texture.js"></script>
<script src="./editor/scene/js/editor/viewport/viewport-preview-particles.js"></script>
<script src="./editor/scene/js/editor/viewport/viewport-preview-animation.js"></script>

<script src="./editor/scene/js/editor/plugins.js"></script>

          `;

      var div = document.createElement("div");
      div.innerHTML = scripts;

      var scriptsCount = 0,
          _loadedScriptCount = 0;

      for (var i = 0; i < div.childNodes.length; i++) {
          if (div.childNodes[i].tagName === "SCRIPT") {
              scriptsCount++;

          }
      }


      for (var i = 0; i < div.childNodes.length; i++) {
          if (div.childNodes[i].tagName === "SCRIPT") {

              var _script = document.createElement("script");
              _script.async = false;
              _script.onload = allloaded;
              _script.src = div.childNodes[i].getAttribute("src");
              document.body.appendChild(_script);

          }
      }




      function allloaded() {
         
          _loadedScriptCount += 1;
          if (scriptsCount === _loadedScriptCount) {
              editor.emit("load");
              editor.emit('realtime:authenticated');
              editor.emit('app:authenticated');
              // editor.emit('start');
              callback();
          }
      }
  }




    function openProjectFile(e,callback){
        e = e || window.event;
        var file = e.target.files[0];
        unbundle(file);

        function saveFile(zip, assetslistName, assetobj, schemeAsset, projectid) {
            /**  error **/
            zip.file(assetslistName).async("blob").then(function (blob) {

                if (assetobj.type === "texture") {
                    var file = new File([blob], assetobj.name, {
                        type: assetobj.fileType
                    });
                    delete assetobj.fileType;
                    assetobj.file = file;
                } else if (assetobj.type !== "folder") {

                   

                    if(assetobj.type === "template"){
                      delete assetobj.file;
                    }else{
                      var file = new File([blob], assetobj.name, {
                        type: assetobj.fileType
                      });
                      assetobj.file = file;
                    } 
                    delete assetobj.fileType;               
                } 
                
                
                else {
                    blob.type = assetobj.fileType;
                    delete assetobj.fileType;
                    assetobj.file = blob;
                }
                localforage.setItem(schemeAsset.replace("${projectId}", projectid).replace("${assetFsName}", assetobj.id), assetobj);
            });
        }


        function unbundle(f) {
            _promiselp = _promiselp.then(function () {
                localforage.getItem("TWPROJECTS:LIST").then(projectlists => {
                    var projectid = 500000;
                    if (projectlists && projectlists.length) {
                        var lastproject = projectlists[projectlists.length - 1];
                        projectid = lastproject.id + 1;
                    }

                    JSZip.loadAsync(f).then(function (zip) {

                        zip.file("project.meta").async("string").then(function (text) {

                            var projectmeta = JSON.parse(text);
                            var projectId_back = projectmeta.projectId;
                            var projectName = projectmeta.projectName;
                            var version = projectmeta.version;
                            var project = projectmeta.project;

                            project.id = projectid;
                            project.uniqueId = projectid;
                            projectlists = projectlists || [];
                            projectlists.push(project);

                            localforage.setItem("TWPROJECTS:LIST", projectlists);


                            var mainsceneName = projectmeta.scenes.name;
                            var assetslistName = projectmeta.assets.name;

                            zip.file(assetslistName).async("string").then(function (text) {
                                var asssetlistmeta = JSON.parse(text);

                                var assetslist = asssetlistmeta.list;
                                var assetsmeta = asssetlistmeta.assetsmeta; //文件绝对路径
                                var scheme = asssetlistmeta.scheme;
                                var schemeAsset = asssetlistmeta.schemeAsset;

                                for (var path in assetsmeta) {

                                    var assetobj = assetsmeta[path];
                                    /**meta **/
                                    if (assetobj.type !== "folder") {
                                        saveFile(zip, path, assetobj, schemeAsset, projectid);

                                    } else {
                                        localforage.setItem(schemeAsset.replace("${projectId}", projectid).replace("${assetFsName}", assetobj.id), assetobj);
                                    }
                                }
                                localforage.setItem(scheme.replace("${projectId}", projectid), assetslist.map(id => schemeAsset.replace("${projectId}", projectid).replace("${assetFsName}", id)));

                            });
                            zip.file(mainsceneName).async("string").then(function (text) {
                                var scenemeta = JSON.parse(text);
                                var scenelist = scenemeta.list;

                                var scheme = scenemeta.scheme; //文件绝对路径

                                localforage.setItem(scheme.replace("${projectId}", projectid), scenelist);
                            });


                            setTimeout(function(){
                                callback(project);
                            },2000);

                        });
                    });


                });
            });
        }

    }
});
