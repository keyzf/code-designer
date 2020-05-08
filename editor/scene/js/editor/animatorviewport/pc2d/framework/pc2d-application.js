Object.assign(pc2d, function () {
var Application = function (canvas, options) {
        pc2d.EventHandler.call(this);
        options = options || {};
    
        // Store application instance
        Application._applications[canvas.id] = this;
        Application._currentApplication = this;

        pc2d.app = this;

        this._time = 0;
        this.timeScale = 1;
        this.maxDeltaTime = 0.1; // Maximum delta is 0.1s or 10 fps.

        this.frame = 0; // the total number of frames the application has updated since start() was called

        this.autoRender = true;
        this.renderNextFrame = false;


        this._librariesLoaded = false;
        this._fillMode = pc2d.FILLMODE_KEEP_ASPECT;
        this._resolutionMode = pc2d.RESOLUTION_FIXED;
        this._allowResize = true;

        // for compatibility
        this.context = this;

        this.graphicsDevice = new pc2d.GraphicsDevice(canvas);
        
        


       // this._soundManager = new pc2d.SoundManager(options);

        this.loader = new pc2d.ResourceLoader(this);

        // stores all entities that have been created
        // for this app by guid
        this._entityIndex = {};
        this.rootIframe = canvas;

        this.scene = {};
        this.root = new pc2d.Entity(this);


        if(this.rootIframe.contentWindow){
            this.root.buildinStyle = document.createElement("style");
            this.root.buildinStyle.type = "text/css";
           
            this.root.dom = this.rootIframe.contentWindow.document.body;
            this.root.head = this.rootIframe.contentWindow.document.head;

            this.root.head.appendChild(this.root.buildinStyle);
        }else{
            this.root.dom = canvas;
            this.root.head = document.head;
        }

        this.root._enabledInHierarchy = true;
        this._enableList = [];
        this._enableList.size = 0;

        this.assets = new pc2d.AssetRegistry(this.loader);
        this.scriptsOrder = options.scriptsOrder || [];
        this.scripts = new pc2d.ScriptRegistry(this);


        this.scenes = new pc2d.SceneRegistry(this);

        this.loader.addHandler("scene", new pc2d.SceneHandler(this));
        this.loader.addHandler("template", new pc2d.TemplateHandler(this));
        this.loader.addHandler("script", new pc2d.ScriptHandler(this));
        this.loader.addHandler("css", new pc2d.CssHandler(this));
        this.loader.addHandler("json", new pc2d.JsonHandler(this));
        this._visibilityChangeHandler = this.onVisibilityChange.bind(this);

        this.systems = new pc2d.ComponentSystemRegistry();
        this.systems.add(new pc2d.ScriptComponentSystem(this));
        this.systems.add(new pc2d.CssComponentSystem(this));
       


        // Depending on browser add the correct visibiltychange event and store the name of the hidden attribute
        // in this._hiddenAttr.
        if (typeof document !== 'undefined') {
            if (document.hidden !== undefined) {
                this._hiddenAttr = 'hidden';
                document.addEventListener('visibilitychange', this._visibilityChangeHandler, false);
            } else if (document.mozHidden !== undefined) {
                this._hiddenAttr = 'mozHidden';
                document.addEventListener('mozvisibilitychange', this._visibilityChangeHandler, false);
            } else if (document.msHidden !== undefined) {
                this._hiddenAttr = 'msHidden';
                document.addEventListener('msvisibilitychange', this._visibilityChangeHandler, false);
            } else if (document.webkitHidden !== undefined) {
                this._hiddenAttr = 'webkitHidden';
                document.addEventListener('webkitvisibilitychange', this._visibilityChangeHandler, false);
            }
        }

        // bind tick function to current scope

        /* eslint-disable-next-line no-use-before-define */
        this.tick = makeTick(this); // Circular linting issue as makeTick and Application reference each other
    };
    Application.prototype = Object.create(pc2d.EventHandler.prototype);
    Application.prototype.constructor = Application;

    Application._currentApplication = null;
    Application._applications = {};

    Application.getApplication = function (id) {
        return id ? Application._applications[id] : Application._currentApplication;
    };

    // Mini-object used to measure progress of loading sets
    var Progress = function (length) {
        this.length = length;
        this.count = 0;

        this.inc = function () {
            this.count++;
        };

        this.done = function () {
            return (this.count === this.length);
        };
    };

    Object.defineProperty(Application.prototype, 'fillMode', {
        get: function () {
            return this._fillMode;
        }
    });

    Object.defineProperty(Application.prototype, 'resolutionMode', {
        get: function () {
            return this._resolutionMode;
        }
    });

    Object.assign(Application.prototype, {
        configure: function (url, callback) {
            var self = this;
            pc2d.http.get(url, function (err, response) {
                if (err) {
                    callback(err);
                    return;
                }

                var props = response.application_properties;
                var scenes = response.scenes;
                var assets = response.assets;

                self._parseApplicationProperties(props, function (err) {
                    self._parseScenes(scenes);
                    self._parseAssets(assets);
                    if (!err) {
                        callback(null);
                    } else {
                        callback(err);
                    }
                });
            });
        },

        preload: function (callback) {
            var self = this;
            var i, total;

            self.fire("preload:start");

            // get list of assets to preload
            var assets = this.assets.list({
                preload: true
            });

            var _assets = new Progress(assets.length);

            var _done = false;

            // check if all loading is done
            var done = function () {
                // do not proceed if application destroyed
                if (!self.graphicsDevice) {
                    return;
                }

                if (!_done && _assets.done()) {
                    _done = true;
                    self.fire("preload:end");
                    callback();
                }
            };

            // totals loading progress of assets
            total = assets.length;
            var count = function () {
                return _assets.count;
            };

            if (_assets.length) {
                var onAssetLoad = function (asset) {
                    _assets.inc();
                    self.fire('preload:progress', count() / total);

                    if (_assets.done())
                        done();
                };

                var onAssetError = function (err, asset) {
                    _assets.inc();
                    self.fire('preload:progress', count() / total);

                    if (_assets.done())
                        done();
                };

                // for each asset
                for (i = 0; i < assets.length; i++) {
                    if (!assets[i].loaded) {
                        assets[i].once('load', onAssetLoad);
                        assets[i].once('error', onAssetError);

                        this.assets.load(assets[i]);
                    } else {
                        _assets.inc();
                        self.fire("preload:progress", count() / total);

                        if (_assets.done())
                            done();
                    }
                }
            } else {
                done();
            }
        },

        getSceneUrl: function (name) {
            var entry = this.scenes.find(name);
            if (entry) {
                return entry.url;
            }
            return null;
        },

        loadSceneHierarchy: function (url, callback) {
            this.scenes.loadSceneHierarchy(url, callback);
        },
        loadSceneSettings: function (url, callback) {
            this.scenes.loadSceneSettings(url, callback);
        },


        loadScene: function (url, callback) {
            this.scenes.loadScene(url, callback);
        },


        _preloadScripts: function (sceneData, callback) {
            if (!pc2d.script.legacy) {
                callback();
                return;
            }

            var self = this;

            self.systems.script.preloading = true;

            var scripts = this._getScriptReferences(sceneData);

            var i = 0, l = scripts.length;
            var progress = new Progress(l);
            var scriptUrl;
            var regex = /^http(s)?:\/\//;

            if (l) {
                var onLoad = function (err, ScriptType) {
                    if (err)
                        console.error(err);

                    progress.inc();
                    if (progress.done()) {
                        self.systems.script.preloading = false;
                        callback();
                    }
                };

                for (i = 0; i < l; i++) {
                    scriptUrl = scripts[i];
                    
                    // support absolute URLs (for now)
                    if (!regex.test(scriptUrl.toLowerCase()) && self._scriptPrefix)
                        scriptUrl = pc2d.path.join(self._scriptPrefix, scripts[i]);

                    this.loader.load(scriptUrl, 'script', onLoad);
                }
            } else {
                self.systems.script.preloading = false;
                callback();
            }
        },

        // set application properties from data file
        _parseApplicationProperties: function (props, callback) {
            var i;
            var len;

            // TODO: remove this temporary block after migrating properties
            if (!props.useDevicePixelRatio)
                props.useDevicePixelRatio = props.use_device_pixel_ratio;
            if (!props.resolutionMode)
                props.resolutionMode = props.resolution_mode;
            if (!props.fillMode)
                props.fillMode = props.fill_mode;

            this._width = props.width;
            this._height = props.height;
            if (props.useDevicePixelRatio) {
                this.graphicsDevice.maxPixelRatio = window.devicePixelRatio;
            }

            this.setCanvasResolution(props.resolutionMode, this._width, this._height);
            this.setCanvasFillMode(props.fillMode, this._width, this._height);

            // set up layers
            if (props.layers && props.layerOrder) {
                var composition = new pc2d.LayerComposition();

                var layers = {};
                for (var key in props.layers) {
                    var data = props.layers[key];
                    data.id = parseInt(key, 10);
                    // depth layer should only be enabled when needed
                    // by incrementing its ref counter
                    data.enabled = data.id !== pc2d.LAYERID_DEPTH;
                    layers[key] = new pc2d.Layer(data);
                }

                for (i = 0, len = props.layerOrder.length; i < len; i++) {
                    var sublayer = props.layerOrder[i];
                    var layer = layers[sublayer.layer];
                    if (!layer) continue;

                    if (sublayer.transparent) {
                        composition.pushTransparent(layer);
                    } else {
                        composition.pushOpaque(layer);
                    }

                    composition.subLayerEnabled[i] = sublayer.enabled;
                }

                this.scene.layers = composition;
            }

            // add batch groups
            if (props.batchGroups) {
                for (i = 0, len = props.batchGroups.length; i < len; i++) {
                    var grp = props.batchGroups[i];
                    this.batcher.addGroup(grp.name, grp.dynamic, grp.maxAabbSize, grp.id, grp.layers);
                }

            }

            // set localization assets
            if (props.i18nAssets) {
                this.i18n.assets = props.i18nAssets;
            }

            this._loadLibraries(props.libraries, callback);
        },

        _loadLibraries: function (urls, callback) {
            var len = urls.length;
            var count = len;
            var self = this;

            var regex = /^http(s)?:\/\//;

            if (len) {
                var onLoad = function (err, script) {
                    count--;
                    if (err) {
                        callback(err);
                    } else if (count === 0) {
                        self.onLibrariesLoaded();
                        callback(null);
                    }
                };

                for (var i = 0; i < len; ++i) {
                    var url = urls[i];

                    if (!regex.test(url.toLowerCase()) && self._scriptPrefix)
                        url = pc2d.path.join(self._scriptPrefix, url);

                    this.loader.load(url, 'script', onLoad);
                }
            } else {
                self.onLibrariesLoaded();
                callback(null);
            }
        },

        // insert scene name/urls into the registry
        _parseScenes: function (scenes) {
            if (!scenes) return;

            for (var i = 0; i < scenes.length; i++) {
                this._sceneRegistry.add(scenes[i].name, scenes[i].url);
            }
        },

        // insert assets into registry
        _parseAssets: function (assets) {
            var i, id;
            var list = [];

            var scriptsIndex = {};
            var bundlesIndex = {};

            if (!pc2d.script.legacy) {
                // add scripts in order of loading first
                for (i = 0; i < this.scriptsOrder.length; i++) {
                    id = this.scriptsOrder[i];
                    if (!assets[id])
                        continue;

                    scriptsIndex[id] = true;
                    list.push(assets[id]);
                }

                // then add bundles
                if (this.enableBundles) {
                    for (id in assets) {
                        if (assets[id].type === 'bundle') {
                            bundlesIndex[id] = true;
                            list.push(assets[id]);
                        }
                    }
                }

                // then add rest of assets
                for (id in assets) {
                    if (scriptsIndex[id] || bundlesIndex[id])
                        continue;

                    list.push(assets[id]);
                }
            }

            for (i = 0; i < list.length; i++) {
                var data = list[i];
                var asset = new pc2d.Asset(data.name, data.type, data.file, data.data);
                asset.id = data.id;
                asset.preload = data.preload ? data.preload : false;
                // if this is a script asset and has already been embedded in the page then
                // mark it as loaded
                asset.loaded = data.type === 'script' && data.data && data.data.loadingType > 0;
                // tags
                asset.tags.add(data.tags);
                // i18n
                if (data.i18n) {
                    for (var locale in data.i18n) {
                        asset.addLocalizedAssetId(locale, data.i18n[locale]);
                    }
                }
                // registry
                this.assets.add(asset);
            }
        },

        _getScriptReferences: function (scene) {
            var i, key;

            var priorityScripts = [];
            if (scene.settings.priority_scripts) {
                priorityScripts = scene.settings.priority_scripts;
            }

            var _scripts = [];
            var _index = {};

            // first add priority scripts
            for (i = 0; i < priorityScripts.length; i++) {
                _scripts.push(priorityScripts[i]);
                _index[priorityScripts[i]] = true;
            }

            // then iterate hierarchy to get referenced scripts
            var entities = scene.entities;
            for (key in entities) {
                if (!entities[key].components.script) {
                    continue;
                }

                var scripts = entities[key].components.script.scripts;
                for (i = 0; i < scripts.length; i++) {
                    if (_index[scripts[i].url])
                        continue;
                    _scripts.push(scripts[i].url);
                    _index[scripts[i].url] = true;
                }
            }

            return _scripts;
        },

        start: function () {
            this.frame = 0;

            this.fire("start", {
                timestamp: pc2d.now(),
                target: this
            });

            if (!this._librariesLoaded) {
                this.onLibrariesLoaded();
            }

            pc2d.ComponentSystem.initialize(this.root);
            this.fire("initialize");

            pc2d.ComponentSystem.postInitialize(this.root);
            this.fire("postinitialize");

            this.tick();
        },

        update: function (dt) {
            this.frame++;
            

           // this.graphicsDevice.updateClientRect();

            pc2d.ComponentSystem.update(dt, this._inTools);
            pc2d.ComponentSystem.postUpdate(dt, this._inTools);

            // fire update event
            this.fire("update", dt);

            if (this.controller) {
                this.controller.update(dt);
            }
            if (this.mouse) {
                this.mouse.update(dt);
            }
            if (this.keyboard) {
                this.keyboard.update(dt);
            }
            if (this.gamepads) {
                this.gamepads.update(dt);
            }

            
        },

        render: function () {
          

            this.fire("prerender");
            this.root.syncHierarchy();
            this.batcher && this.batcher.updateAll();
            pc2d._skipRenderCounter = 0;
            this.renderer && this.renderer.renderComposition(this.scene.layers);
            this.fire("postrender");     
        },

        setCanvasFillMode: function (mode, width, height) {
            this._fillMode = mode;
            this.resizeCanvas(width, height);
        },

        setCanvasResolution: function (mode, width, height) {
            this._resolutionMode = mode;

            // In AUTO mode the resolution is the same as the canvas size, unless specified
            if (mode === pc2d.RESOLUTION_AUTO && (width === undefined)) {
                width = this.graphicsDevice.canvas.clientWidth;
                height = this.graphicsDevice.canvas.clientHeight;
            }

            this.graphicsDevice.resizeCanvas(width, height);
        },
        isHidden: function () {
            return document[this._hiddenAttr];
        },
        onVisibilityChange: function () {
            if (this.isHidden()) {
                this.fire("visibilityHidden")
             //   this._audioManager.suspend();
            } else {
                this.fire("visibilityVisible")
             //   this._audioManager.resume();
            }
        },
        resizeCanvas: function (width, height) {
            if (!this._allowResize) return; // prevent resizing (e.g. if presenting in VR HMD)

            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;

            if (this._fillMode === pc2d.FILLMODE_KEEP_ASPECT) {
                var r = this.graphicsDevice.canvas.width / this.graphicsDevice.canvas.height;
                var winR = windowWidth / windowHeight;

                if (r > winR) {
                    width = windowWidth;
                    height = width / r;
                } else {
                    height = windowHeight;
                    width = height * r;
                }
            } else if (this._fillMode === pc2d.FILLMODE_FILL_WINDOW) {
                width = windowWidth;
                height = windowHeight;
            } else {
                // FILLMODE_NONE use width and height that are provided
            }

            // this.graphicsDevice.canvas.style.width = width + 'px';
            // this.graphicsDevice.canvas.style.height = height + 'px';

            // In AUTO mode the resolution is changed to match the canvas size
            if (this._resolutionMode === pc2d.RESOLUTION_AUTO) {
                this.setCanvasResolution(pc2d.RESOLUTION_AUTO);
            }

            // return the final values calculated for width and height
            return {
                width: width,
                height: height
            };
        },
        onLibrariesLoaded: function () {
            this._librariesLoaded = true;
            
        },
        applySceneSettings: function (settings) {
            var asset;


        },


     
       

        _processTimestamp: function (timestamp) {
            return timestamp;
        },

        destroy: function () {
            var i, l;
            var canvasId = this.graphicsDevice.canvas.id;

            this.off('librariesloaded');
            document.removeEventListener('visibilitychange', this._visibilityChangeHandler, false);
            document.removeEventListener('mozvisibilitychange', this._visibilityChangeHandler, false);
            document.removeEventListener('msvisibilitychange', this._visibilityChangeHandler, false);
            document.removeEventListener('webkitvisibilitychange', this._visibilityChangeHandler, false);
            this._visibilityChangeHandler = null;
            this.onVisibilityChange = null;

            this.root.destroy();
            this.root = null;

            if (this.mouse) {
                this.mouse.off();
                this.mouse.detach();
                this.mouse = null;
            }

            if (this.keyboard) {
                this.keyboard.off();
                this.keyboard.detach();
                this.keyboard = null;
            }

            if (this.touch) {
                this.touch.off();
                this.touch.detach();
                this.touch = null;
            }

            if (this.elementInput) {
                this.elementInput.detach();
                this.elementInput = null;
            }

            if (this.controller) {
                this.controller = null;
            }

            var systems = this.systems.list;
            for (i = 0, l = systems.length; i < l; i++) {
                systems[i].destroy();
            }

            pc2d.ComponentSystem.destroy();

            // destroy all texture resources
            var assets = this.assets.list();
            for (i = 0; i < assets.length; i++) {
                assets[i].unload();
                assets[i].off();
            }
            this.assets.off();




            for (var key in this.loader.getHandler('script')._cache) {
                var element = this.loader.getHandler('script')._cache[key];
                var parent = element.parentNode;
                if (parent) parent.removeChild(element);
            }
            this.loader.getHandler('script')._cache = {};

            this.loader.destroy();
            this.loader = null;

            this.scene.destroy();
            this.scene = null;

            this.systems = [];
            this.context = null;

            // script registry
            this.scripts.destroy();
            this.scripts = null;

            this._sceneRegistry.destroy();
            this._sceneRegistry = null;

            this.lightmapper.destroy();
            this.lightmapper = null;

            this.batcher.destroyManager();
            this.batcher = null;

            this._entityIndex = {};

            this.defaultLayerDepth.onPreRenderOpaque = null;
            this.defaultLayerDepth.onPostRenderOpaque = null;
            this.defaultLayerDepth.onDisable = null;
            this.defaultLayerDepth.onEnable = null;
            this.defaultLayerDepth = null;
            this.defaultLayerWorld = null;

            pc2d.destroyPostEffectQuad();

            if (this.vr) {
                this.vr.destroy();
                this.vr = null;
            }
            this.xr.end();

            this.graphicsDevice.destroy();
            this.graphicsDevice = null;

            this.renderer = null;
            this.tick = null;

            this.off(); // remove all events

            if (this._audioManager) {
                this._audioManager.destroy();
                this._audioManager = null;
            }

            pc2d.http = new pc2d.Http();
            pc2d.script.app = null;
            // remove default particle texture
            pc2d.ParticleEmitter.DEFAULT_PARAM_TEXTURE = null;

            Application._applications[canvasId] = null;

            if (Application._currentApplication === this) {
                Application._currentApplication = null;
            }
        },
        getEntityFromIndex: function (guid) {
            return this._entityIndex[guid];
        }
    });

    // static data
    var _frameEndData = {};

    // create tick function to be wrapped in closure
    var makeTick = function (_app) {
        var app = _app;
        var frameRequest;

        return function (timestamp, frame) {
            if (!app.graphicsDevice)
                return;

            Application._currentApplication = app;

            if (frameRequest) {
                window.cancelAnimationFrame(frameRequest);
                frameRequest = null;
            }

            // have current application pointer in pc
            pc2d.app = app;

            var now = app._processTimestamp(timestamp) || pc2d.now();
            var ms = now - (app._time || now);
            var dt = ms / 1000.0;
            dt = pc2d.math.clamp(dt, 0, app.maxDeltaTime);
            dt *= app.timeScale;

            app._time = now;

            frameRequest = window.requestAnimationFrame(app.tick);
          
            app.update(dt);

            if (app.autoRender || app.renderNextFrame) {
                app.render();
                app.renderNextFrame = false;
            }

            // set event data
            _frameEndData.timestamp = pc2d.now();
            _frameEndData.target = app;

            app.fire("frameend", _frameEndData);
            app.fire("frameEnd", _frameEndData);// deprecated old event, remove when editor updated

        };
    };

    return {
     
        FILLMODE_NONE: 'NONE',
        FILLMODE_FILL_WINDOW: 'FILL_WINDOW',
        FILLMODE_KEEP_ASPECT: 'KEEP_ASPECT',
        RESOLUTION_AUTO: 'AUTO',
        RESOLUTION_FIXED: 'FIXED',

        Application: Application
    };
}());