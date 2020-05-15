/* editor/assets/assets-sync.js */
editor.once('load', function () {
    'use strict';

    var syncPaths = [
        'name',
        'preload',
        'scope',
        'data',
        'meta',
        'file',
        'i18n'
    ];
    var docs = {};



    function hashCode(str) {
        var hash = 0;
        for (var i = 0, len = str.length; i < len; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            // Convert to 32bit integer
            hash |= 0;
        }
        return hash;
    }

   var count = 0;
  
    editor.method('loadAsset', function (filePath, callback) {
        var FS = editor.call('FS:offline-system');
        FS.getFileByPath(filePath).then(assetData => {
            var _promise = Promise.resolve();
           

            if (! assetData) {
                console.error('Could not load asset: ' + filePath);
                editor.call('status:error', 'Could not load asset: ' + filePath);
                return callback && callback();
            }
            delete assetData.item_id;
            delete assetData.branch_id;   
            
            if (assetData.file) {  
                if(assetData.type === "texture"){
                    _promise = new Promise((resolve) => {
                        var reader  = new FileReader();
                        reader.addEventListener("load", function () {
                           // assetData.source = false;
                            assetData.file.url = reader.result;
                            assetData.file.hash = hashCode(reader.result);
                            assetData.source = false;
                            assetData.data = assetData.data || {
                                addressu: "repeat",
                                addressv: "repeat",
                                minfilter: "linear_mip_linear",
                                magfilter: "linear",
                                anisotropy: 1,
                                rgbm: false,
                                mipmaps: true
                            };
                            assetData.meta  = assetData.meta || {
                                compress: {
                                    alpha: false,
                                    normals: false,
                                    dxt: false,
                                    pvr: false,
                                    pvrBpp: 4,
                                    etc1: false,
                                    etc2: false,
                                    basis: false,
                                    quality: 128
                                },
                                format: "png",
                                type: "TrueColorAlpha",
                                width: 512,
                                height: 64,
                                alpha: true,
                                depth: 8,
                                srgb: true,
                                interlaced: false
                            };

                            resolve();
                        }, false);
                        reader.readAsDataURL(assetData.file);
                    });
                }else if(assetData.type === "script" || assetData.type === "css" || assetData.type === "json"  || assetData.type === "animation"){
                    _promise = new Promise((resolve) => {
                        var reader  = new FileReader();
                        reader.addEventListener("load", function () {
                            // assetData.source = false;
                            assetData.file.hash = hashCode(reader.result);

                            var reader2  = new FileReader();
                            reader2.addEventListener("load", function () {
                                // assetData.source = false;
                                assetData.file.url = reader2.result;
                                assetData.source = false;
                                resolve();
                            }, false);
                            
                            reader2.readAsDataURL(assetData.file);


                        }, false);
                        reader.addEventListener("error", function () {
                            resolve();                    
                        }, false);
                        reader.readAsText(assetData.file);
                    })
                }
    
               // assetData.file.url = getFileUrl(assetData.id, assetData.revision, assetData.file.filename);
    
                // if (assetData.file.variants) {
                //     for (var key in assetData.file.variants) {
                //         assetData.file.variants[key].url = getFileUrl(assetData.id, assetData.revision, assetData.file.variants[key].filename);
                //     }
                // }
            }
            
            
            // allow duplicate values in data.frameKeys of sprite asset
    
            _promise.then(_ => {
                var options = null;
                if(assetData.type === "texture"){
                    var file = assetData.file;
                    assetData.file = {
                        url: file.url,
                        size:file.size,
                        type:file.type,
                        name:file.name,
                        hash:file.hash || ""
                    };
                    assetData.thumbnails = {
                        m:file.url
                    };
                    delete assetData.fileurl;
                }else if(assetData.type === "script"){
                    var file = assetData.file;
                    assetData.file = {
                        url: file.url,
                        size:file.size,
                        type:file.type,
                        name:file.name,
                        hash:file.hash || ""
                    };
                    delete assetData.fileurl;
                }


                var asset = new Observer(assetData, options);

                editor.call('assets:add', asset);
        
                if (callback)
                    callback(asset);
        
            })
            

        })


        // for (var i = 0; i < ops.length; i++) {
        //     editor.emit('realtime:op:assets', ops[i], uniqueId);
        // }

        // // notify of operations
        // doc.on('op', function (ops, local) {
        //     if (local) return;

        //     for (var i = 0; i < ops.length; i++) {
        //         editor.emit('realtime:op:assets', ops[i], uniqueId);
        //     }
        // });

        // notify of asset load
       // assetData.id = assetData.item_id;
       // assetData.uniqueId = uniqueId;

        // delete unnecessary fields
        

    });

    editor.method('assets:fs:paths:patch', function (data) {
        var connection = editor.call('realtime:connection');
        var assets = connection.collections.assets;

        for(var i = 0; i < data.length; i++) {
            if (! assets.hasOwnProperty(data[i].uniqueId))
                continue;

            // force snapshot path data
            assets[data[i].uniqueId].data.path = data[i].path;

            // sync observer
            editor.emit('realtime:op:assets', {
                p: ['path'],
                oi: data[i].path,
                od: null
            }, data[i].uniqueId);
        }
    });

    var onLoad = function (data) {
        editor.call('assets:progress', 0.5);

        var count = 0;

        var load = function (uniqueId) {
            editor.call('loadAsset', uniqueId, function () {
                count++;
                editor.call('assets:progress', (count / data.length) * 0.5 + 0.5);
               
                if (count >= data.length) {
                    editor.call('assets:progress', 1);
                    editor.emit('assets:load');
                }
            });
        };

        if (data.length) {
            //var connection = editor.call('realtime:connection');

            // do bulk subsribe in batches of 'batchSize' assets
            var batchSize = 256;
            var startBatch = 0;
            var total = data.length;

            while (startBatch < total) {
                // start bulk subscribe
                //connection.startBulk();
                for (var i = startBatch; i < startBatch + batchSize && i < total; i++) {
                    load(data[i].uniqueId);
                }
                // end bulk subscribe and send message to server
               // connection.endBulk();

                startBatch += batchSize;
            }

        } else {
            editor.call('assets:progress', 1);
            editor.emit('assets:load');
        }
    };

    // load all assets
    editor.on('fsoffline:assets', function () {
        editor.call('assets:clear');

        var FS = editor.call('FS:offline-system');
        FS.loadFileListByProjectId(config.project.id).then(data => {
            data= data || [];
            data = data.map(fsid =>( {id:fsid,uniqueId:fsid}));
            onLoad(data || []);
        });

        // Ajax({
        //     url: '{{url.api}}/projects/{{project.id}}/assets?branchId={{self.branch.id}}&view=designer',
        //     auth: true
        // })
        // .on('load', function (status, data) {
        //     onLoad(data);
        // })
        // .on('progress', function (progress) {
        //     editor.call('assets:progress', 0.1 + progress * 0.4);
        // })
        // .on('error', function (status, evt) {
        //     console.log(status, evt);
        // });
    });

    editor.call('assets:progress', 0.1);

    var onAssetSelect = function (asset) {
        editor.call('selector:set', 'asset', [asset]);

        // navigate to folder too
        var path = asset.get('path');
        if (path.length) {
            editor.call('assets:panel:currentFolder', editor.call('assets:get', path[path.length - 1]));
        } else {
            editor.call('assets:panel:currentFolder', null);
        }
    };

    // create asset
    editor.method('assets:create', function (data, fn, noSelect) {
        var evtAssetAdd;

        if (! noSelect) {
            editor.once('selector:change', function () {
                if (evtAssetAdd) {
                    evtAssetAdd.unbind();
                    evtAssetAdd = null;
                }
            });
        }

        editor.call('assets:uploadFile', data, function (err, res) {
            if (err) {
                editor.call('status:error', err);

                // TODO
                // disk allowance error

                if (fn) fn(err);

                return;
            }

            if (! noSelect) {
                var asset = editor.call('assets:get', res.id);
                if (asset) {
                    onAssetSelect(asset);
                } else {
                    evtAssetAdd = editor.once('assets:add[' + res.id + ']', onAssetSelect);
                }
            }

            if (fn) fn(err, res.id);
        });
    });

    // delete asset
    editor.method('assets:delete', function (list) {
        if (! (list instanceof Array))
            list = [list];

        var assets = [];

        for (var i = 0; i < list.length; i++) {
            assets.push(list[i]);
        }

        if (assets.length)
            editor.call('assets:fs:delete', assets);
    });

    editor.on('assets:remove', function (asset) {
        var id = asset.get('uniqueId');
        if (docs[id]) {
            docs[id].unsubscribe();
            docs[id].destroy();
            delete docs[id];
        }
    });



    var assetSetThumbnailPaths = function (asset) {
        if (asset.get('type') !== 'texture' && asset.get('type') !== 'textureatlas')
            return;

        if (asset.get('has_thumbnail')) {
            
            asset.set('thumbnails', {
                's': asset.get("file.url"),
                'm': asset.get("file.url"),
                'l': asset.get("file.url"),
                'xl': asset.get("file.url")
            });


        } else {
            asset.unset('thumbnails');
        }
    };

    // hook sync to new assets
    editor.on('assets:add', function (asset) {
        if (asset.sync)
            return;

        // convert material data to flat
        if (asset.get('type') === 'material') {
            editor.call('material:rememberMissingFields', asset);

            var assetData = asset.get('data');
            if (assetData)
                asset.set('data', editor.call('schema:material:getDefaultData', assetData));
        }

        asset.sync = new ObserverSync({
            item: asset,
            paths: syncPaths
        });

        // client > server
        asset.sync.on('op', function (op) {
            
            editor.call('realtime:assets:op', op, asset.get('uniqueId'));
        });

        // set thumbnails
        assetSetThumbnailPaths(asset);

        var setting = false;

        asset.on('*:set', function (path, value) {
            
            if (setting || ! path.startsWith('file') || path.endsWith('.url') || ! asset.get('file'))
                return;

            setting = true;

            var parts = path.split('.');

            if ((parts.length === 1 || parts.length === 2) && parts[1] !== 'variants') {
                // reset file url
                asset.set('file.url', getFileUrl(asset.get('id'), asset.get('revision'), asset.get('file.filename')));
                // set thumbnails
                assetSetThumbnailPaths(asset);
            } else if (parts.length >= 3 && parts[1] === 'variants') {
                var format = parts[2];
                asset.set('file.variants.' + format + '.url', getFileUrl(asset.get('id'), asset.get('revision'), asset.get('file.variants.' + format + '.filename')));
            }

            setting = false;
        });

        asset.on('has_thumbnail:set', function (value) {
            assetSetThumbnailPaths(asset);
        });
    });

    // write asset operations
    // editor.method('realtime:assets:op', function (op, uniqueId) {
    //
    //     debugger
    //
    //     if (! editor.call('permissions:write') || !docs[uniqueId])
    //         return;
    //
    //     // console.trace();
    //     // console.log('out: [ ' + Object.keys(op).filter(function(i) { return i !== 'p' }).join(', ') + ' ]', op.p.join('.'));
    //     // console.log(op);
    //
    //
    //
    //     docs[uniqueId].submitOp([op]);
    // });


    // server > client
    editor.on('realtime:op:assets', function (op, uniqueId) {
        
        var asset = editor.call('assets:getUnique', uniqueId);
        if (asset) {
            // console.log('in: ' + id + ' [ ' + Object.keys(op).filter(function(i) { return i !== 'p' }).join(', ') + ' ]', op.p.join('.'));
            // console.log(op);
            asset.sync.write(op);
        } else {
            console.error('realtime operation on missing asset: ' + op.p[1]);
        }
    });

    // handle disconnection
    editor.on('realtime:disconnected', function () {
        var app = editor.call('viewport:app');
        if (app) {
            app.assets._callbacks = { };
        }

        editor.call('assets:clear');
    });
});
