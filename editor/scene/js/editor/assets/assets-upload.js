/* editor/assets/assets-upload.js */
editor.once('load', function () {
    'use strict';

    var uploadJobs = 0;
    var userSettings = editor.call('settings:projectUser');

    var targetExtensions = {
        'jpg': true,
        'jpeg': true,
        'png': true,
        'gif': true,
        'css': true,
        'html': true,
        'json': true,
        'xml': true,
        'txt': true,
        'vert': true,
        'frag': true,
        'glsl': true,
        'mp3': true,
        'ogg': true,
        'wav': true,
        'mp4': true,
        'm4a': true,
        'js': true,
        'atlas': true,
        'template': true
    };

    var typeToExt = {
        'scene': ['fbx', 'dae', 'obj', '3ds'],
        'template': ['template'],
        'text': ['txt', 'xml', 'atlas'],
        'html': ['html'],
        'css': ['css'],
        'json': ['json'],
        'texture': ['tif', 'tga', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'dds', 'hdr', 'exr'],
        'audio': ['wav', 'mp3', 'mp4', 'ogg', 'm4a'],
        'shader': ['glsl', 'frag', 'vert'],
        'script': ['js'],
        'font': ['ttf', 'ttc', 'otf', 'dfont']
    };

    var extToType = {};
    for (var type in typeToExt) {
        for (var i = 0; i < typeToExt[type].length; i++) {
            extToType[typeToExt[type][i]] = type;
        }
    }


    editor.method('assets:canUploadFiles', function (files) {
        // check usage first
        var totalSize = 0;
        for (var i = 0; i < files.length; i++) {
            totalSize += files[i].size;
        }

        return config.owner.size + totalSize <= config.owner.diskAllowance;
    });

    editor.method('assets:upload:script', function (file) {
        
        var reader = new FileReader();

        reader.addEventListener('load', function () {
            editor.call('sourcefiles:create', file.name, reader.result, function (err) {
                if (err)
                    return;

                editor.call('assets:panel:currentFolder', 'scripts');
            });
        }, false);

        reader.readAsText(file);
    });

    var appendCommon = function (form, args) { 

        // parent folder
        if (args.parent) {
            if (args.parent instanceof Observer) {
                form.append('parent', args.parent.get('id'));
            } else {
                var id = args.parent;
                if (!id)
                    form.append('parent', id + '');
            }
        }

        // conversion pipeline specific parameters
        var settings = editor.call('settings:projectUser');
        switch (args.type) {
            case 'texture':
            case 'textureatlas':
                form.append('pow2', settings.get('editor.pipeline.texturePot'));
                form.append('searchRelatedAssets', settings.get('editor.pipeline.searchRelatedAssets'));
                break;
            case 'scene':
                form.append('searchRelatedAssets', settings.get('editor.pipeline.searchRelatedAssets'));
                form.append('overwriteModel', settings.get('editor.pipeline.overwriteModel'));
                form.append('overwriteAnimation', settings.get('editor.pipeline.overwriteAnimation'));
                form.append('overwriteMaterial', settings.get('editor.pipeline.overwriteMaterial'));
                form.append('overwriteTexture', settings.get('editor.pipeline.overwriteTexture'));
                form.append('pow2', settings.get('editor.pipeline.texturePot'));
                form.append('preserveMapping', settings.get('editor.pipeline.preserveMapping'));
                break;
            case 'font':
                break;
            default:
                break;
        }

        // filename
        if (args.filename) {
            form.append('filename', args.filename);
        }

        // file
        if (args.file && args.file.size) {
            form.append('file', args.file, (args.filename || args.name));
        }

        return form;
    };

    var create = function (args) {
        var form = new FormData();

        // scope
        form.append('projectId', config.project.id);

        // type
        if (!args.type) {
            console.error('\"type\" required for upload request');
        }
        form.append('type', args.type);

        // name
        if (args.name) {
            form.append('name', args.name);
        }

        // tags
        if (args.tags) {
            form.append('tags', args.tags.join('\n'));
        }

        // source_asset_id
        if (args.source_asset_id) {
            form.append('source_asset_id', args.source_asset_id);
        }

        // data
        if (args.data) {
            form.append('data', JSON.stringify(args.data));
        }

        // meta
        if (args.meta) {
            form.append('meta', JSON.stringify(args.meta));
        }

        // preload
        form.append('preload', args.preload === undefined ? true : args.preload);

        form = appendCommon(form, args);
        return form;
    };

    var update = function (assetId, args) {
        var form = new FormData();
        form = appendCommon(form, args);
        return form;
    };

    editor.method('assets:uploadFile', function (args, fn) {
        var form = null;
        if (args.asset) {
            var assetId = args.asset.get('id');
            form = update(assetId, args);
        } else {
            form = create(args);
        }

        var job = ++uploadJobs;
        editor.call('status:job', 'asset-upload:' + job, 0);

        var filedata = {};
        for (var key of form.keys()) {
            filedata[key] = form.get(key);
        }

        var _promise = Promise.resolve();
        if(filedata.type === "template" && filedata.file){
            _promise = new Promise((resolve) => {
           var reader  = new FileReader();
           reader.addEventListener("load", function () {
              // assetData.source = false;
               filedata.data = reader.result;
               delete filedata.file;
               resolve();
           }, false);
           reader.readAsText(filedata.file);
       })
      }

      _promise.then(_ => {
          var FS = editor.call("FS:offline-system");
          FS.saveFile(filedata).then(function (result) {
              editor.call('status:job', 'asset-upload:' + job);
              editor.call('status:job', 'asset-upload:' + job, 100);
              if (fn) {
                  fn(null, result);
              }

              var FilePath = "TWCacheFiles/" + config.project.id + "/" + result.id;
              editor.call('loadAsset', FilePath);
          });
      });


    });

    editor.method('assets:upload:files', function (files) {
        if (!editor.call('assets:canUploadFiles', files)) {
            var msg = 'Disk allowance exceeded. <a href="/upgrade" target="_blank">UPGRADE</a> to get more disk space.';
            editor.call('status:error', msg);
            return;
        }


        var currentFolder = editor.call('assets:panel:currentFolder');
        

        for (var i = 0; i < files.length; i++) {
            var path = [];

            if (currentFolder && currentFolder.get)
                path = currentFolder.get('path').concat(currentFolder.get('id'));

            var source = false;
            var ext = files[i].name.split('.');
            if (ext.length === 1)
                continue;

                /**上传template */

            ext = ext[ext.length - 1].toLowerCase();

            var type = extToType[ext] || 'binary';

                var source = type !== 'binary' && !targetExtensions[ext];

                // check if we need to convert textures to texture atlases
                if (type === 'texture' && userSettings.get('editor.pipeline.textureDefaultToAtlas')) {
                    type = 'textureatlas';
                }

                // can we overwrite another asset?
                var sourceAsset = null;
                var candidates = editor.call('assets:find', function (item) {
                    // check files in current folder only
                    if (!item.get('path').equals(path))
                        return false;

                    // try locate source when dropping on its targets
                    if (source && !item.get('source') && item.get('source_asset_id')) {
                        var itemSource = editor.call('assets:get', item.get('source_asset_id'));
                        if (itemSource && itemSource.get('type') === type && itemSource.get('name').toLowerCase() === files[i].name.toLowerCase()) {
                            sourceAsset = itemSource;
                            return false;
                        }
                    }


                    if (item.get('source') === source && item.get('name').toLowerCase() === files[i].name.toLowerCase()) {
                        // we want the same type or try to replace a texture atlas with the same name if one exists
                        if (item.get('type') === type || (type === 'texture' && item.get('type') === 'textureatlas')) {
                            return true;
                        }
                    }

                    return false;
                });

                // candidates contains [index, asset] entries. Each entry
                // represents an asset that could be overwritten by the uploaded asset.
                // Use the first candidate by default (or undefined if the array is empty).
                // If we are uploading a texture try to find a textureatlas candidate and
                // if one exists then overwrite the textureatlas instead.
                var asset = candidates[0];
                if (type === 'texture') {
                    for (var j = 0; j < candidates.length; j++) {
                        if (candidates[j][1].get('type') === 'textureatlas') {
                            asset = candidates[j];
                            type = 'textureatlas';
                            break;
                        }
                    }
                }

                var data = null;
                if (ext === 'js') {
                    data = {
                        order: 100,
                        scripts: {}
                    };
                }

                editor.call('assets:uploadFile', {
                    asset: asset ? asset[1] : sourceAsset,
                    file: files[i],
                    type: type,
                    name: files[i].name,
                    parent: editor.call('assets:panel:currentFolder'),
                    pipeline: true,
                    data: data,
                    meta: asset ? asset[1].get('meta') : null
                }, function (err, data) {
                    if (err || ext !== 'js') return;

                    var onceAssetLoad = function (asset) {
                        var url = asset.get('file.url');
                        if (url) {
                            editor.call('scripts:parse', asset);
                        } else {
                            asset.once('file.url:set', function () {
                                editor.call('scripts:parse', asset);
                            });
                        }
                    };

                    var asset = editor.call('assets:get', data.id);
                    if (asset) {
                        onceAssetLoad(asset);
                    } else {
                        editor.once('assets:add[' + data.id + ']', onceAssetLoad);
                    }
                });
        }
    });

    editor.method('assets:upload:picker', function (args) {
        args = args || {};

        var parent = args.parent || editor.call('assets:panel:currentFolder');

        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        // fileInput.accept = '';
        fileInput.multiple = true;
        fileInput.style.display = 'none';
        editor.call('layout.assets').append(fileInput);

        var onChange = function () {
            editor.call('assets:upload:files', this.files);

            this.value = null;
            fileInput.removeEventListener('change', onChange);
        };

        fileInput.addEventListener('change', onChange, false);
        fileInput.click();

        fileInput.parentNode.removeChild(fileInput);
    });
});
