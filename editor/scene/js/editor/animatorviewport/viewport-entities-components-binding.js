


/* editor/viewport/viewport-entities-components-binding.js */
editor.once('load', function() {
    'use strict';

    // converts the data to runtime types
    var runtimeComponentData = function (component, data) {
        var result = {};
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                result[key] = editor.call('components:convertValue', component, key, data[key]);
            }
        }

        return result;
    };

    var approxEqual = function(a, b) {
        return Math.abs(a - b) < 1e-4;
    };

    editor.on('entities:add', function (obj) {
        var app;

        // subscribe to changes
        obj.on('*:set', function(path, value) {
            

            if (obj._silent || ! path.startsWith('components'))
                return;

            var entity = obj.entity;
            if (! entity) return;

            var parts = path.split('.');
            var component = parts[1];
            var property = parts[2];
            var callSetter = true;

            // ignore script component
            if (component === 'script')
                return;               

            if (!entity[component]) {
                if (!property) {
                    // add component
                    var data = runtimeComponentData(component, value);

                    // override particlesystem
                    if (component === 'particlesystem') {
                        data.enabled = false;
                        data.autoPlay = true;
                    } else if (component === 'animation') {
                        data.enabled = false;
                    }

                    app = editor.call('viewport:app');
                    if (! app) return; // webgl not available
                    app.context.systems[component].addComponent(entity, data);


                    if (component === 'particlesystem') {
                        editor.call('viewport:render');
                    } else if (component === 'animation') {
                       
                    }
                    // render
                    
                }
            } else if (property) {
                // edit component property
                value = obj.get('components.' + component + '.' + property);

                if (component === 'particlesystem') {
                    if (property === 'enabled') {
                        value = false;
                    } else if (property === 'autoPlay') {
                        value = true;
                    }
                } else if (component === 'animation') {
                    if (property === 'enabled') {
                        value = false;
                    }
                } 


                if (callSetter) {
                    entity[component][property] = editor.call('components:convertValue', component, property, value);
                }

                // render
                editor.call('viewport:render');
            }
        });

        var setComponentProperty = function (path, value) {
            
            
            if (obj._silent || ! path.startsWith('components'))
                return;

            var entity = obj.entity;
            if (! entity) return;

            var parts = path.split('.');
            var component = parts[1];
            var property = parts[2];

            // ignore script component
            if (component === 'script')
                return;

            if (property) {
                // edit component property
                value = obj.get('components.' + component + '.' + property);
                entity[component][property] = editor.call('components:convertValue', component, property, value);

                //entity._frozen = true;

                entity._frozen = true;
                entity._dirtyLocal = true;
                // render
                editor.call('viewport:render');
            }
        };

        obj.on('*:insert', setComponentProperty);
        obj.on('*:remove', setComponentProperty);

        obj.on('*:unset', function (path) {
            if (obj._silent || ! path.startsWith('components'))
                return;

            var entity = obj.entity;
            if (! entity) return;

            var parts = path.split('.');
            var component = parts[1];
            var property = parts[2];

            if (component === 'script')
                return;

            if (property) {
                // edit component property
                var value = obj.get('components.' + component + '.' + property);
                entity[component][property] = editor.call('components:convertValue', component, property, value);
            } else if (entity[component]) {
                // remove component
                var app = editor.call('viewport:app');
                if (! app) return; // webgl not available

                app.context.systems[component].removeComponent(entity);
            }

           
            // render
            editor.call('viewport:render');
        });
    });
});