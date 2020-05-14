editor.once('load', function() {
    var time;
    var rect = new pc2d.Vec4(0, 0, 1, 1);


    function dataURLtoBlob(dataurl,callback) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        var blob = new Blob([u8arr], { type: mime });
        blobToDataURL(blob,callback);
    }
    function blobToDataURL(blob, callback) {
        let a = new FileReader();
        a.onload = function (e) { callback(e.target.result); }
        a.readAsText(blob);
    }


    var selectedEntity;
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


    var _sync = pc2d.Entity.prototype._sync;
    pc2d.Entity.prototype._sync = function () {
        var _defer = false;
        if(this.root !== this){
            
            this.dom = this.dom || document.createElement("div");

            if(!this.dom.attachedEvent){
                function clickgizimo(event){
                    
                    // this.dom.removeEventListner("click",clickgizimo);
                    // this.dom.attachedEvent = false;
                    if(editor.call("entities:get",this.getGuid()) !== selectedEntity){
                        event.stopPropagation();
                        selectedEntity && editor.call('selector:remove', selectedEntity);
                        editor.call('selector:add', 'entity',  editor.call("entities:get",this.getGuid()));
                    }
                    
                }
                this.dom.addEventListener("click",clickgizimo.bind(this),false);
                this.dom.attachedEvent = true;
            }
          
            
            this.dom.className = this.tags.list().join(" ");

            if(this.name !== "New Entity") this.dom.classList.add(this.name);

            if(this.dom.getAttribute("data-pc2d-asset-texture")){
                var asset = editor.call("assets:get",this.dom.getAttribute("data-pc2d-asset-texture"));
                if(this.css && this.css.type === "image"){
                    asset && this.dom.setAttribute("src",asset.get("file.url"));
                }else{
                    this.dom.style.backgroundImage = "url(" + asset.get("file.url") + ")";
                }
                
                
            }else{
                this.dom.removeAttribute("src");
                if(this.css){
                    this.dom.style.backgroundImage = "";
                }
                
            }

            //可以交换顺序 
            if(!this.dom.parentNode && (this.dom.parentNode !== this.parent.dom)){
                this.parent.dom.appendChild(this.dom);
            }  

            if(!this.enabled && !this.css){
                this.dom && (this.dom.style.display = "none");
            }
            
        }


        if(!_defer){
            return _sync.call(this);
        }

        
    }


 
    // Object.defineProperty(pc2d.CubeCarouselComponent.prototype, "mockdata", {
    //     get: function () {
    //         return this._mockdata;
    //     },

    //     set: function (value) {
    //         if (value !== this._mockdata) {
    //             this._mockdata = value; 
    //             var asset = editor.call("assets:get",value);

    //             dataURLtoBlob(asset.get("file").url, (data) => {
    //                 this._mockresult = JSON.parse(data);
    //                 this._sync.call(this);
    //             });
    //         }
    //     }
    // });


    editor.method('viewport:application', function() {
        return Application;
    });

    var Application = function (canvas, options) {
        this._inTools = true;
        pc2d.app = this;

      
        for (var key in this.systems) {
            if (this.systems.hasOwnProperty(key))
                this.systems[key]._inTools = true;
        }

        // Draw immediately
        this.redraw = true;

        // define the tick method
        this.tick = this.makeTick();

    };




    pc2d.inherits = function (Self, Super) {
        var Temp = function () {};
        var Func = function (arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
            Super.call(this, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
            Self.call(this, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
            // this.constructor = Self;
        };
        Func._super = Super.prototype;
        Temp.prototype = Super.prototype;
        Func.prototype = new Temp();

        return Func;
    };

    Application = pc2d.inherits(Application, pc2d.Application);

    Application.prototype.render = function() {
        console.log('render');
        this.root._frozen = false;
        this.root._dirtyLocal = true;
        this.root.syncHierarchy();

        this.fire('prerender', null);
        editor.emit('viewport:preRender');

       // this.renderer.renderComposition(this.scene.layers);
        this.fire('postrender');
    };

    Application.prototype.getDt = function () {
        var now = (window.performance && window.performance.now) ? performance.now() : Date.now();
        var dt = (now - (time || now)) / 1000.0;
        dt = pc2d.math.clamp(dt, 0, 0.1); // Maximum delta is 0.1s or 10 fps.
        time = now;
        return dt;
    };

    Application.prototype.makeTick = function() {
        var app = this;
        return function() {
            requestAnimationFrame(app.tick);
            

            pc2d.app = app;

            var dt = app.getDt();
            if (app.redraw) {
                app.redraw = editor.call('viewport:keepRendering');

                // Perform ComponentSystem update
                editor.emit('viewport:preUpdate', dt);
                editor.emit('viewport:update', dt);
                pc2d.ComponentSystem.fire('toolsUpdate', dt);
                editor.emit('viewport:postUpdate', dt);

                editor.emit('viewport:gizmoUpdate', dt);

                app.render();

                editor.emit('viewport:postRender');
            }
        };
    };

    Application.prototype.resize = function (w, h) {
        this.graphicsDevice.width = w;
        this.graphicsDevice.height = h;
        this.picker.resize(w, h);
        this.redraw = true;
    };

    Application.prototype.setEditorSettings = function (settings) {
        this.editorSettings = settings;

        // var gridLayer = editor.call('gizmo:layers', 'Viewport Grid');

        //  if (this.grid) {
        //      gridLayer.removeMeshInstances(this.grid.model.meshInstances);
        //      this.grid.destroy();
        //  }

        //  settings.gridDivisions = parseInt(settings.gridDivisions, 10);
        //  if (settings.gridDivisions > 0 && settings.gridDivisionSize > 0) {
        //      var size = settings.gridDivisions * settings.gridDivisionSize;
        //      this.grid = new pc2d.Grid(this.graphicsDevice, size, settings.gridDivisions);
        //      this.grid.model.meshInstances[0].aabb.halfExtents.set(size / 2, size / 2, size / 2);
        //      gridLayer.addMeshInstances(this.grid.model.meshInstances);
        //  }

        this.redraw = true;
    };

  
});