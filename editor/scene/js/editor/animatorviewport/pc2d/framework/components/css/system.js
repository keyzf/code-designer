Object.assign(pc2d, function () {
    var _schema = [
        'enabled'
    ];

   
    var CssComponentSystem = function CssComponentSystem(app) {
        pc2d.ComponentSystem.call(this, app);

        this.id = 'css';
        this.app = app;

        this.ComponentType = pc2d.CssComponent;
        this.DataType = pc2d.CssComponentData;

        this.schema = _schema;

        this.on('beforeremove', this._onRemoveComponent, this);

        pc2d.ComponentSystem.bind('update', this.onUpdate, this);
    };
    CssComponentSystem.prototype = Object.create(pc2d.ComponentSystem.prototype);
    CssComponentSystem.prototype.constructor = CssComponentSystem;

    pc2d.Component._buildAccessors(pc2d.CssComponent.prototype, _schema);

    Object.assign(CssComponentSystem.prototype, {
        initializeComponentData: function (component, data, properties) {

            if(data.type !== undefined){
                component.type = data.type;
            }
           
            if(data.cssText !== undefined){
                component.cssText = data.cssText;
            }

            if(data.textureAsset !== undefined){
                component.textureAsset = data.textureAsset;
            }

            if (data.styleSheets) {
                for (var name in data.styleSheets) {
                    component.addStyleSheet(data.styleSheets[name]);
                }
            }      

            if (data.innerText !== undefined) {
                component.innerText = data.innerText;
            }

            if (data.enabled !== undefined) {
                component.enabled = data.enabled;
            }
            pc2d.ComponentSystem.prototype.initializeComponentData.call(this, component, data, properties);;
            component._beingInitialized = false;
        },

        cloneComponent: function (entity, clone) {
            this.addComponent(clone, {});        
            clone.css.type = entity.css.type;
            //clone的防止重复生成样式
           // clone.css.data.cssText = entity.css.cssText;
           // clone.css.cssText = entity.css.cssText;
            clone.css.textureAsset = entity.css.textureAsset;
            clone.css.innerText = entity.css.innerText;
            clone.css.enabled = entity.css.enabled;
            // if (entity.css.styleSheets) {
            //     for (var name in entity.css.styleSheets) {
            //         clone.css.addStyleSheet(entity.css.styleSheets[name]);
            //     }
            // }    
        },

        onUpdate: function (dt) {
            var components = this.store;

            for (var id in components) {
                var entity = components[id].entity;
                var component = entity.css;
                if (component.enabled && entity.enabled) {
                    component.onUpdate();
                }
            }
        },

        _onRemoveComponent: function (entity, component) {
            component.onRemove();
        }
    });

    return {
        CssComponentSystem: CssComponentSystem
    };
}());