
/**插件 */


Object.assign(pc2d, function () {
    var _schema = [
        'enabled'
    ];

   
    var MPPageComponentSystem = function MPPageComponentSystem(app) {
        pc2d.ComponentSystem.call(this, app);

        this.id = 'mppage';
        this.app = app;

        this.ComponentType = pc2d.CssComponent;
        this.DataType = pc2d.CssComponentData;

        this.schema = _schema;

        this.on('beforeremove', this._onRemoveComponent, this);

        pc2d.ComponentSystem.bind('update', this.onUpdate, this);
    };
    MPPageComponentSystem.prototype = Object.create(pc2d.ComponentSystem.prototype);
    MPPageComponentSystem.prototype.constructor = MPPageComponentSystem;

    pc2d.Component._buildAccessors(pc2d.MPPageComponent.prototype, _schema);

    Object.assign(MPPageComponentSystem.prototype, {
        initializeComponentData: function (component, data, properties) {

            if(data.data !== undefined){
                component.data = data.data;
            }
           
            if (data.enabled !== undefined) {
                component.enabled = data.enabled;
            }
            pc2d.ComponentSystem.prototype.initializeComponentData.call(this, component, data, properties);;
            component._beingInitialized = false;
        },

        cloneComponent: function (entity, clone) {
            this.addComponent(clone, {});        
            clone.mppage.enabled = entity.mppage.enabled; 
        },

        onUpdate: function (dt) {
            var components = this.store;

            for (var id in components) {
                var entity = components[id].entity;
                var component = entity.mppage;
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
        MPPageComponentSystem: MPPageComponentSystem
    };
}());


var pluginData = {
    'wxmp-sub-menu': {
        title: '微信小程序',
        icon: '',
        items: {
            'Page': {
                title: '列表for',
                icon: '',
                select: function () {
                    // editor.call('entities:new', {
                    //     name: 'container',
                    //     parent: getParentFn(),
                    //     components: {
                    //         css: createCssElementComponentData()
                    //     }
                    // });
                }
            },
            'foreach': {
                title: '列表for',
                icon: '',
                select: function () {
                    // editor.call('entities:new', {
                    //     name: 'container',
                    //     parent: getParentFn(),
                    //     components: {
                    //         css: createCssElementComponentData()
                    //     }
                    // });
                }
            }
        }
    }
}
editor.call("plugins:entitiesmenu:add", pluginData);
        