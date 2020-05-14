/* editor/viewport/viewport-application.js */
editor.once('load', function() {
    var time;
    var rect = new pc.Vec4(0, 0, 1, 1);

    var Application = function (canvas, options) {
        this._inTools = true;
        pc.app = this;

        if (! this.scene)
            this.scene = new pc.Scene();

        for (var key in this.systems) {
            if (this.systems.hasOwnProperty(key))
                this.systems[key]._inTools = true;
        }

        this.grid = null;
        this.setEditorSettings(options.editorSettings);

        this.picker = new pc.Picker(this, 1, 1);
        this.shading = pc.RENDERSTYLE_SOLID;

        // Draw immediately
        this.redraw = true;

        // define the tick method
        this.tick = this.makeTick();

        pc.ComponentSystem.on('toolsUpdate', this.systems.particlesystem.onUpdate, this.systems.particlesystem);
        pc.ComponentSystem.on('toolsUpdate', this.systems.animation.onUpdate, this.systems.animation);

        // TODO: remove if once layoutgroups merged
        if (this.systems.layoutgroup) {
            pc.ComponentSystem.on('toolsUpdate', this.systems.layoutgroup._onPostUpdate, this.systems.layoutgroup);
        }
    };

    editor.method('viewport:application', function() {
        return Application;
    });

    Application = pc.inherits(Application, pc.Application);

    Application.prototype.render = function() {
        this.root.syncHierarchy();

        this.fire('prerender', null);
        editor.emit('viewport:preRender');

        // render current camera
        var cameraEntity = editor.call('camera:current');
        if (cameraEntity && cameraEntity.camera) {
            if (cameraEntity.__editorCamera) {
                var clearColor = this.editorSettings.cameraClearColor;
                cameraEntity.camera.clearColor = new pc.Color(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
                if (cameraEntity.camera.projection === pc.PROJECTION_PERSPECTIVE) {
                    cameraEntity.camera.nearClip = this.editorSettings.cameraNearClip || 0.0001;
                    cameraEntity.camera.farClip = this.editorSettings.cameraFarClip;
                }
            }

            cameraEntity.camera.rect = rect;
        }

        this.renderer.renderComposition(this.scene.layers);
        this.fire('postrender');
    };

    Application.prototype.getDt = function () {
        var now = (window.performance && window.performance.now) ? performance.now() : Date.now();
        var dt = (now - (time || now)) / 1000.0;
        dt = pc.math.clamp(dt, 0, 0.1); // Maximum delta is 0.1s or 10 fps.
        time = now;
        return dt;
    };

    Application.prototype.makeTick = function() {
        var app = this;
        return function() {
            requestAnimationFrame(app.tick);

            pc.app = app;

            var dt = app.getDt();

            if (app.redraw) {
                app.redraw = editor.call('viewport:keepRendering');

                app.graphicsDevice.updateClientRect();

                // Perform ComponentSystem update
                editor.emit('viewport:preUpdate', dt);
                editor.emit('viewport:update', dt);
                pc.ComponentSystem.fire('toolsUpdate', dt);
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

        var gridLayer = editor.call('gizmo:layers', 'Viewport Grid');

         if (this.grid) {
             gridLayer.removeMeshInstances(this.grid.model.meshInstances);
             this.grid.destroy();
         }

         settings.gridDivisions = parseInt(settings.gridDivisions, 10);
         if (settings.gridDivisions > 0 && settings.gridDivisionSize > 0) {
             var size = settings.gridDivisions * settings.gridDivisionSize;
             this.grid = new pc.Grid(this.graphicsDevice, size, settings.gridDivisions);
             this.grid.model.meshInstances[0].aabb.halfExtents.set(size / 2, size / 2, size / 2);
             gridLayer.addMeshInstances(this.grid.model.meshInstances);
         }

        this.redraw = true;
    };

    // Redraw when we set the skybox
    Application.prototype._setSkybox = function (cubemaps) {
        Application._super._setSkybox.call(this, cubemaps);
        this.redraw = true;
    };
});
