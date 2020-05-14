/* editor/viewport/viewport-entities-observer-binding.js */
editor.once('load', function() {
    'use strict';


    editor.on('entities:add', function (obj) {
        // subscribe to changes
        obj.on('*:set', function(path, value) {
            var entity = obj.entity;
            if (! entity)
                return;

            if (path === 'name') {
                entity.name = obj.get('name');

            } else if (path.startsWith('position')) {
                entity.setLocalPosition(obj.get('position.0'), obj.get('position.1'), obj.get('position.2'));

            } else if (path.startsWith('rotation')) {
                entity.setLocalEulerAngles(obj.get('rotation.0'), obj.get('rotation.1'), obj.get('rotation.2'));

            } else if (path.startsWith('scale')) {
                entity.setLocalScale(obj.get('scale.0'), obj.get('scale.1'), obj.get('scale.2'));

            } else if (path.startsWith('enabled')) {
                entity.enabled = obj.get('enabled');

            } else if (path.startsWith('parent')) {
                var parent = editor.call('entities:get', obj.get('parent'));
                if (parent && parent.entity && entity.parent !== parent.entity)
                    entity.reparent(parent.entity);
            }else if (path === 'components.model.type' && value === 'asset') {
                // WORKAROUND
                // entity deletes asset when switching to primitive, restore it
                // do this in a timeout to allow the model type to change first
                setTimeout(function () {
                    var assetId = obj.get('components.model.asset');
                    if (assetId)
                        entity.model.asset = assetId;
                });
            }

           
            setTimeout(() => {
                entity._frozen = true;
                entity._dirtyLocal = true;
                entity._sync();
                editor.call('viewport:render');
            });
            // render
           // 
        });


        obj.on('*:insert', function(path, value, ind, remote){
            var entity = obj.entity;
            if (! entity)
                return;

            if (path === 'tags') {
                entity.tags.add(value);
                setTimeout(() => {
                    entity._frozen = true;
                    entity._dirtyLocal = true;
                    entity._sync();
                    editor.call('viewport:render');
                });

            }
        });


        obj.on('*:remove', function(path, value, ind, remote){

            var entity = obj.entity;
            if (! entity)
                return;

            if (path === 'tags') {
                entity.tags.remove(value);
                setTimeout(() => {
                    entity._frozen = true;
                    entity._dirtyLocal = true;
                    entity._sync();
                    editor.call('viewport:render');
                });

            }
        });

        var reparent = function (child, index) {
            var childEntity = editor.call('entities:get', child);
            if (childEntity && childEntity.entity && obj.entity) {
                var oldParent = childEntity.entity.parent;

                if (oldParent){
                    oldParent.removeChild(childEntity.entity);
                    try{
                        oldParent.dom.removeChild(childEntity.entity.dom);
                    }catch(e){
                        console.error(e);
                    }
                }
                    

                // skip any graph nodes
                if (index > 0) {
                    var children = obj.entity.children;
                    for (var i = 0, len = children.length; i < len && index > 0; i++) {
                        if (children[i] instanceof pc2d.Entity) {
                            index--;
                        }
                    }

                    index = i;
                }

                // re-insert
                obj.entity.insertChild(childEntity.entity, index);

                //dom insert

                //obj.entity.children[index];


                if(!obj.entity.dom) {
                    obj.entity.dom = document.createElement("div");
                }
                if(!childEntity.entity.dom) {
                    childEntity.entity.dom = document.createElement("div");
                }
                
                if(!obj.entity.dom.childNodes[index]){
                    childEntity.entity.dom && obj.entity.dom.appendChild(childEntity.entity.dom);
                }else{
                    childEntity.entity.dom && obj.entity.dom.insertBefore(childEntity.entity.dom,obj.entity.dom.childNodes[index]);
                }
                
                
                childEntity.entity.css && (childEntity.entity.css.enabled =  childEntity.entity.css.enabled);
                childEntity.entity.enabled =  childEntity.entity._enabled;

                if(!childEntity.entity.enabled){      
                    childEntity.entity.dom && (childEntity.entity.dom.style.display = "none");
                }

                // persist the positions and sizes of elements if they were previously
                // under control of a layout group but have now been reparented
                if (oldParent && oldParent.layoutgroup) {
                    editor.call('entities:layout:storeLayout', [childEntity.entity.getGuid()]);
                }
            }
        };

        obj.on('children:insert', reparent);
        obj.on('children:move', reparent);

        obj.on('destroy', function () {
            if (obj.entity) {
                obj.entity.destroy();
                obj.entity._frozen = true;
                obj.entity._dirtyLocal = true;
                editor.call('viewport:render');
            }
        });
    });

    editor.on('entities:remove', function (obj) {
        
        var entity = obj.entity;
        if (! entity)
            return;

        entity.destroy();


        entity.dom &&  entity.dom.parentNode && entity.dom.parentNode.removeChild(entity.dom);
        entity._frozen = true;
        entity._dirtyLocal = true;
        editor.call('viewport:render');
        editor.emit('viewport:gizmoUpdate', 0);
    });
});
