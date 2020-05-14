Object.assign(pc2d, function () {
    // #ifdef DEBUG
    var _debugLogging = false;
    // #endif

 
    pc2d.ELEMENTTYPE_GROUP = 'group';
    pc2d.ELEMENTTYPE_IMAGE = 'image';
    pc2d.ELEMENTTYPE_TEXT = 'text';

    var CssComponent = function CssComponent(system, entity) {
        pc2d.Component.call(this, system, entity);

        // set to true by the ElementComponentSystem while
        // the component is being initialized
        this._beingInitialized = false;

        this.entity.on('insert', this._onInsert, this);

        this._patch();

        this._type = pc2d.ELEMENTTYPE_GROUP;

        this._cssText = null;
        this._innerText = "";
        this._textureAsset = null;
        // element types
        this._image = null;
        this._text = null;
        this._group = null;

        this._drawOrder = 0;

        if(!this.system.app.buildsource){
            this.buildinStyle = document.createElement("style");
            this.buildinStyle.setAttribute("data-buildin","yes");
        }

        this._styleSheets = {};

    };
    CssComponent.prototype = Object.create(pc2d.Component.prototype);
    CssComponent.prototype.constructor = CssComponent;

    Object.assign(CssComponent.prototype, {
        _patch: function () {
            this.entity._sync = this._sync;
        },

        _unpatch: function () {
            this.entity._sync = pc2d.Entity.prototype._sync;
        },

        // this method overwrites GraphNode#sync and so operates in scope of the Entity.
        _sync: function () {
            
            var css = this.css;

            if(!css.system.app.buildsource){
                var sheets = "";
                var name = this.name;
                if(name !== "New Entity" &&  css.cssText){
                    sheets += "." + name + "{" +
                    css.cssText
                     + "}";
                }
    
               
    
                for (key in css.styleSheets) {
                    var stylesheet = css.styleSheets[key];
                    if (stylesheet && key) {
                        sheets +=  key + "{"+ (stylesheet || '') + "}" ;
                    };           
                }
                css.buildinStyle.innerHTML =  sheets;   
            }


            
            
            if(this.dom){
                if(css.type === pc2d.ELEMENTTYPE_IMAGE || css.type === pc2d.ELEMENTTYPE_GROUP){
                    css.textureAsset && this.dom.setAttribute("data-pc2d-asset-texture",css.textureAsset || ""); 
                }else{
                    this.dom.removeAttribute("data-pc2d-asset-texture");   
                }


                if(css.type !== pc2d.ELEMENTTYPE_IMAGE && css.innerText){
                    this.dom.innerHTML = css.innerText;
                }
            }
            return pc2d.Entity.prototype._sync.call(this);
        },

        domOn: function (node, eventName, handler) {
            if (!(document.attachEvent && typeof Windows === "undefined")) {
              node.addEventListener(eventName, handler, false);
              return function () {
                node.removeEventListener(eventName, handler, false);
              };
            } else {
              node.attachEvent('on' + eventName, handler);
              return function () {
                node.detachEvent('on' + eventName, handler);
              };
            }
        },
        show: function () {
            this.entity.dom.style.display = "";
        },
        hide: function () {
            this.entity.dom.style.display = "none";
        },
        querySet:function(selector,value) {
            this.entity.dom && this.entity.dom.querySelector(selector) && (this.entity.dom.querySelector(selector).innerHTML = value);
        },

        _onInsert: function (parent) {
            // when the entity is reparented find a possible new screen and mask

            this.entity._dirtifyWorld();

        },
        onUpdate: function () {
            
            
        },
        onEnable: function () {
            // if (this._image) this._image.onEnable();
            // if (this._text) this._text.onEnable();
            // if (this._group) this._group.onEnable();

            if(!this.system.app.buildsource){
                this.system.app.root.head.appendChild(this.buildinStyle);
            }

           
            this.entity.dom && (this.entity.dom.style.display = "");
            this.fire("enablecss");
        },

        onDisable: function () {
            
            if(!this.system.app.buildsource){
                this.buildinStyle.parentNode && this.system.app.root.head.removeChild(this.buildinStyle);
            }
           
            this.entity.dom && (this.entity.dom.style.display = "none");
            this.fire("disablecss");
        },

        onRemove: function () {
            this.entity.off('insert', this._onInsert, this);
            this._unpatch();
            if(!this.system.app.buildsource){
                this.buildinStyle.parentNode && this.system.app.root.head.removeChild(this.buildinStyle);
            }
            
            this.off();
        },

        addStyleSheet: function (data) {

            this._styleSheets[data.name] = data.text;


            return data.text;
        },

        removeStyleSheet: function (name) {
            delete this._styleSheets[name];
        }
    });


    Object.defineProperty(CssComponent.prototype, "styleSheets", {
        get: function () {
            return this._styleSheets;
        },
        set: function (value) {
            var name, key;

            // if value is null remove all clips
            if (!value) {
                for (name in this._styleSheets) {
                    this.removeStyleSheet(name);
                }
                return;
            }

            // remove existing clips not in new value
            // and update clips in both objects
            for (name in this._styleSheets) {
                var found = false;
                for (key in value) {
                    if (value[key].name === name) {
                        found = true;
                        this._styleSheets[name] = value[key].text;
                        break;
                    }
                }

                if (!found) {
                    this.removeStyleSheet(name);
                }
            }

            // add clips that do not exist
            for (key in value) {
                if (this._styleSheets[value[key].name]) continue;

                this.addStyleSheet(value[key]);
            }


            

        }
    });

    Object.defineProperty(CssComponent.prototype, "type", {
        get: function () {
            return this._type;
        },

        set: function (value) {
            if (value !== this._type || !this.entity.dom) {
                this._type = value;

                var olddom = this.entity.dom;
                
                if(this.type === pc2d.ELEMENTTYPE_IMAGE){
                    this.entity.dom = document.createElement("IMG");
                }else if(this.type === pc2d.ELEMENTTYPE_TEXT){
                    this.entity.dom = document.createElement("span");
                }else{
                    this.entity.dom = document.createElement("div");
                }

                if(olddom && olddom.parentNode){
                    var nextSlibing = olddom.nextSlibing;
                    var childNodes = olddom.childNodes;

                    var parentNode = olddom.parentNode;
                    parentNode.removeChild(olddom);

                    var nodes = [];
                    for(var i = 0;i < childNodes.length;i++){
                        nodes.push(childNodes[i]);
                    }


                    if(nodes.length){
                        for(var i = 0;i < nodes.length;i++){
                            this.entity.dom.appendChild(nodes[i]);  
                        }

                    }
                    nextSlibing &&  parentNode.insertBefore(this.entity.dom,nextSlibing);
                    !nextSlibing &&  parentNode.appendChild(this.entity.dom);
                }

                olddom = null;
            }
        }
    });
    

    Object.defineProperty(CssComponent.prototype, "cssText", {
        get: function () {
            return this._cssText;
        },

        set: function (value) {
            if (value !== this._cssText) {
                this._cssText = value;         
            }
        }
    });

    Object.defineProperty(CssComponent.prototype, "innerText", {
        get: function () {
            return this._innerText;
        },

        set: function (value) {
            if (value !== this._innerText) {
                this._innerText = value;   
                
                if(this.entity.dom && this.type !== pc2d.ELEMENTTYPE_IMAGE){
                    this.entity.dom.innerHTML = value;
                }
            }
        }
    });
    

    Object.defineProperty(CssComponent.prototype, "textureAsset", {
        get: function () {
            return this._textureAsset;
        },

        set: function (value) {
            if (value !== this._textureAsset) {
                this._textureAsset = value; 
                
                if(this.entity.dom){
                    if(this.type === pc2d.ELEMENTTYPE_IMAGE || this.type === pc2d.ELEMENTTYPE_GROUP){
                        this.textureAsset && this.entity.dom.setAttribute("data-pc2d-asset-texture",this.textureAsset || ""); 
                    }else{
                
                        this.entity.dom.removeAttribute("data-pc2d-asset-texture");  
                    }
                }

            }
        }
    });


    return {
        CssComponent: CssComponent
    };
}());