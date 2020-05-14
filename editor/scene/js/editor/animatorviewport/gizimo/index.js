editor.once('load', function() {
    'use strict';

    var vecA = new pc.Vec3();
    var vecB = new pc.Vec3();
    var vecC = new pc.Vec3();
    var vecD = new pc.Vec3();

    var selectedEntity = null;

    var evtTapStart = null;
    var moving = false;
    var mouseTap = null;
    var mouseTapMoved = false;
    var pickStart = new pc.Vec3();
    var posCameraLast = new pc.Vec3();

    var posStart = [];
    var posCurrent = [];
    var sizeStart = [0,0];
    var sizeCurrent = [0,0];
    var startWorldCorners = [new pc.Vec3(), new pc.Vec3(), new pc.Vec3(), new pc.Vec3()];
    var worldToEntitySpace = new pc.Mat4();
    var entitySpaceToParentSpace = new pc.Mat4();
    var dirty = false;

    var offset = new pc.Vec3();
    var localOffset = new pc.Vec3();
    var offsetWithPivot = new pc.Vec3();

    var gizimodom,marginAnchorX,marginAnchorY;

    editor.once('viewport:load', function (app) {
       
        
        editor.on('selector:add', function (item, type) {
            if (type !== 'entity') return;

            if (! selectedEntity) {
                selectedEntity = item;
            }
        });

        editor.on('selector:remove', function (item, type) {
            if (selectedEntity === item) {
                selectedEntity = null;
            }
        });

        editor.on('viewport:gizmoUpdate', function (dt) {
            // gizmo.root.enabled = gizmoEnabled();
            // if (! gizmo.root.enabled)
            //     return;
            var iframe = editor.call('viewport:canvas');

            if(!selectedEntity){
                gizimodom && (gizimodom.style.display = "none");
                return;
            }
          
            if(!gizimodom){
                gizimodom = iframe.contentWindow.document.createElement("gizimo");
                iframe.contentWindow.document.body.appendChild(gizimodom);

                marginAnchorX = iframe.contentWindow.document.createElement("gizimo-anchormarginx");
                marginAnchorX.style.display = "block";
                marginAnchorX.style.width = "50px";
                marginAnchorX.style.height = "2px";
                marginAnchorX.style.position = "fixed";
                marginAnchorX.style.cursor = "w-resize";
                marginAnchorX.style.background = "blue";

                marginAnchorY = iframe.contentWindow.document.createElement("gizimo-anchormarginy");
                marginAnchorY.style.display = "block";
                marginAnchorY.style.width = "2px";
                marginAnchorY.style.height = "50px";
                marginAnchorY.style.position = "fixed";
                marginAnchorY.style.background = "green";
                marginAnchorY.style.cursor = "n-resize";
                
                gizimodom.style.pointerEvents = "none";
                iframe.contentWindow.document.body.appendChild(marginAnchorX);
                iframe.contentWindow.document.body.appendChild(marginAnchorY);

                iframe.contentWindow.addEventListener('scroll',function(){
                    editor.emit('viewport:gizmoUpdate');
                });
                iframe.contentWindow.addEventListener('resize',function(){
                    editor.emit('viewport:gizmoUpdate');
                });
                var _lastData = null;
               

                // marginAnchorX.addEventListener("mousedown",function(evt){
        
                //     const e = evt.detail;
                //     document.addEventListener("mousemove", gizimoXPointerMove, true);
                //     document.addEventListener("mouseup", gizimoXPointerUp, true);
                //     _lastEventId = e.id;
                //     _lastKeyframePosx = e.clientX;
                //     _lastKeyframePosy = e.clientY;
                // });

                function hypot(x1, y1, x2, y2) {
                    return Math.hypot(x2 - x1, y2 - y1)
                }

                function gizimoXPointerUp(){
                    var buildinStyle = selectedEntity.entity.findComponent("css").buildinStyle;
                    buildinStyle.sheet.cssRules[0].style.margin = "0 auto";
                    var cssText =  buildinStyle.sheet.cssRules[0].cssText;
                    cssText.replace(buildinStyle.sheet.cssRules[0].selectorText,"").replace("{","").replace("}","");

                    selectedEntity.sync.set("component.css.cssText",cssText);

                    document.removeEventListener("mouseup", gizimoXPointerUp, true);
                    document.removeEventListener("mousemove", gizimoXPointerMove, true);
                }

                function gizimoXPointerMove(evt) {
        
                    const e = evt.detail;
                    if (e.id === _lastEventId) {
                                       
                        const t = hypot(_lastKeyframePosx, _lastKeyframePosy, e.clientX, e.clientY);
                        if (!_moveKeyframe && t >= 1) {
                            _moveKeyframe = true;
                           
                            let dx = evt.detail.clientX - _lastKeyframePosx;
                            0 != dx % 2 && dx--;
                            // const rbasewidth = Timeline.rulerBaseWidth();
                            // var newPos = self.Step + dx / rbasewidth;
                            // var ppos = getPrecisionNumber(newPos);
                            // _keyframepos = ppos;
            
                            // var dragKeyframeGhost = self.Timeline.dragKeyframeGhost;
                            // dragKeyframeGhost.style.transform = `translate(${ppos * Timeline.rulerBaseWidth()}px, 0px)`;
                        }
                    }

                    
                }
            }
            gizimodom.style.display = "block";
            gizimodom.style.position = "fixed";
            gizimodom.style.border = "1px solid red";
            var entity = selectedEntity.entity;

            if(!entity.dom) return;

            var gozimoaabb = entity.dom.getBoundingClientRect();

            gizimodom.style.left = (gozimoaabb.left - 1) + 'px';
            gizimodom.style.top = (gozimoaabb.top - 1) + 'px';
            gizimodom.style.width = gozimoaabb.width + 2 +'px';
            gizimodom.style.height = gozimoaabb.height + 2 +'px';
            // scale to screen space
          
            marginAnchorX.style.left = gozimoaabb.left + gozimoaabb.width/2 +'px';
            marginAnchorX.style.top = gozimoaabb.top + gozimoaabb.height/2 +'px';
            marginAnchorY.style.left = gozimoaabb.left + gozimoaabb.width/2 +'px';
            marginAnchorY.style.top = gozimoaabb.top + gozimoaabb.height/2 +'px';

            mouseTapMoved = false;

        });

        editor.on('viewport:pick:hover', function(node, picked) {
            if (! node || gizmo.handles.indexOf(node) === -1) {
                if (gizmo.handle) {
                    gizmo.handle = null;

                    for (var i = 0; i < 4; i++) {
                        gizmo.handles[i].model.meshInstances[0].material = gizmo.matInactive;
                    }

                    if (evtTapStart) {
                        evtTapStart.unbind();
                        evtTapStart = null;
                    }
                }
            } else if (! gizmo.handle || gizmo.handle !== node) {

                gizmo.handle = node;

                for (var i = 0; i < 4; i++) {
                    gizmo.handles[i].model.meshInstances[0].material = (gizmo.handles[i] === node ? gizmo.matActive : gizmo.matInactive);
                }

                if (! evtTapStart) {
                    evtTapStart = editor.on('viewport:tap:start', onTapStart);
                }
            }
        });


        var onTapStart = function (tap) {
            if (moving || tap.button !== 0)
                return;

            editor.emit('camera:toggle', false);
            editor.call('viewport:pick:state', false);

            moving = true;
            mouseTap = tap;
            dirty = false;

            if (selectedEntity) {
                selectedEntity.history.enabled = false;

                posStart = selectedEntity.get('position').slice(0);
                sizeStart[0] = selectedEntity.get('components.element.width');
                sizeStart[1] = selectedEntity.get('components.element.height');
                worldToEntitySpace.copy(selectedEntity.entity.getWorldTransform()).invert();
                entitySpaceToParentSpace.copy(selectedEntity.entity.parent.getWorldTransform()).invert().mul(selectedEntity.entity.getWorldTransform());

                for (var i = 0; i < 4; i++)
                    startWorldCorners[i].copy(selectedEntity.entity.element.worldCorners[i]);

            }

            if (gizmo.root.enabled) {
                pickStart.copy(pickPlane(tap.x, tap.y));
            }

            editor.call('gizmo:translate:visible', false);
            editor.call('gizmo:rotate:visible', false);
            editor.call('gizmo:scale:visible', false);
        };

        var onTapMove = function(tap) {
            if (! moving)
                return;

            mouseTap = tap;
            mouseTapMoved = true;
        };

        var onTapEnd = function(tap) {
            if (tap.button !== 0)
                return;

            editor.emit('camera:toggle', true);

            if (! moving)
                return;

            moving = false;
            mouseTap = tap;

            editor.call('gizmo:translate:visible', true);
            editor.call('gizmo:rotate:visible', true);
            editor.call('gizmo:scale:visible', true);
            editor.call('viewport:pick:state', true);

            if (selectedEntity) {
                if (dirty) {
                    var resourceId = selectedEntity.get('resource_id');
                    var previousPos = posStart.slice(0);
                    var newPos = posCurrent.slice(0);
                    var previousSize = sizeStart.slice(0);
                    var newSize = sizeCurrent.slice(0);

                    editor.call('history:add', {
                        name: 'entity.element.size',
                        undo: function() {
                            var item = editor.call('entities:get', resourceId);
                            if (! item)
                                return;

                            var history = item.history.enabled;
                            item.history.enabled = false;
                            item.set('position', previousPos);
                            item.set('components.element.width', previousSize[0]);
                            item.set('components.element.height', previousSize[1]);
                            item.history.enabled = history;
                        },
                        redo: function() {
                            var item = editor.call('entities:get', resourceId);
                            if (! item)
                                return;

                            var history = item.history.enabled;
                            item.history.enabled = false;
                            item.set('position', newPos);
                            item.set('components.element.width', newSize[0]);
                            item.set('components.element.height', newSize[1]);
                            item.history.enabled = history;
                        }
                    });
                }

                selectedEntity.history.enabled = true;
            }
        };

        var pickPlane = function(x, y) {
            var camera = editor.call('camera:current');
            var entity = selectedEntity.entity;

            var posEntity = startWorldCorners[gizmo.handles.indexOf(gizmo.handle)];
            var posMouse = camera.camera.screenToWorld(x, y, 1);
            var rayOrigin = vecA.copy(camera.getPosition());
            var rayDirection = vecB.set(0, 0, 0);

            vecC.copy(entity.forward);
            var planeNormal = vecC.scale(-1);

            if (camera.camera.projection === pc.PROJECTION_PERSPECTIVE) {
                rayDirection.copy(posMouse).sub(rayOrigin).normalize();
            } else {
                rayOrigin.add(posMouse);
                camera.getWorldTransform().transformVector(vecD.set(0, 0, -1), rayDirection);
            }

            var rayPlaneDot = planeNormal.dot(rayDirection);
            var planeDist = posEntity.dot(planeNormal);
            var pointPlaneDist = (planeNormal.dot(rayOrigin) - planeDist) / rayPlaneDot;
            var pickedPos = rayDirection.scale(-pointPlaneDist).add(rayOrigin);

            return pickedPos;
        };

        editor.on('viewport:tap:move', onTapMove);
        editor.on('viewport:tap:end', onTapEnd);

    });
});