



"use strict";

self.addEventListener("message", e =>
{
	if (e.data.name === "download")
	{
		importScripts("./via/controller/object.js",
					  "./via/controller/property.js",
					  "./via/controller/controller.js");
		importScripts("/workers/kvStorage.js", "/workers/localForageAdaptor.js","/jszip.js");
		Via.postMessage = (data => self.postMessage(data));
		Download(e.data.projectId);
	}
	else
	{
		// Via.OnMessage(e.data);
	}
});

async function Download(projectId)
{
	var document = via.document;

	saveProject(projectId);

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
	  
	  function hashCode(str) {
		  var hash = 0;
		  for (var i = 0, len = str.length; i < len; i++) {
			hash = ((hash << 5) - hash) + str.charCodeAt(i);
			// Convert to 32bit integer
			hash |= 0;
		  }
		  return hash;
		}
	  
	   
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
				  if (asset.type !== "folder") {
					var filepath = "";
					if (asset.path.length) {
					  var filepath = asset.path.map(p => assets[p].name).join("/") + '/';
					}
	  
					zip.file(filepath + asset.name, asset.file);
					
					asset.fileType = asset.file.type;
					delete asset.file;
	  
					zip.file(filepath + asset.name + ".meta", JSON.stringify(asset));
					assetsmeta[filepath + asset.name] = asset;
				  } else if (asset.type === "folder") {
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
	  
	  
		var _promiselp = Promise.resolve();
	  
		function saveFile(zip, assetslistName, assetobj, schemeAsset, projectid) {
		  /**  error **/
		  zip.file(assetslistName).async("blob").then(function (blob) {
	  
			if (assetobj.type === "texture") {
			  var file = new File([blob], assetobj.name, {
				type: assetobj.fileType
			  });
			  delete assetobj.fileType;
			  assetobj.file = file;
			}else if (assetobj.type !== "folder") {
			  var file = new File([blob], assetobj.name, {
				type: assetobj.fileType
			  });
			  delete assetobj.fileType;
			  assetobj.file = file;
			}else {
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
					var assetsmeta = asssetlistmeta.assetsmeta;//文件绝对路径
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
	  
					var scheme = scenemeta.scheme;//文件绝对路径
	  
					localforage.setItem(scheme.replace("${projectId}", projectid), scenelist);
				  });
	  
				});
			  });
	  
	  
			});
		  });
		}
	  
	  
	  
		function loadProjectFile(e) {
		  e = e || window.event;
		  var file = e.target.files[0];
		  unbundle(file);
	  
		}
	

	
}




