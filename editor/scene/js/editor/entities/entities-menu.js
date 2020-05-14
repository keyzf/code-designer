/* editor/entities/entities-menu.js */
editor.once('load', function() {
    'use strict';

    var componentsLogos = editor.call('components:logos');

    var applyAdditions = function(object, additions) {
        if (additions) {
            Object.keys(additions).forEach(function(name) {
                object[name] = additions[name];
            });
        }
    };



    var createCssElementComponentData = function(additions) {
        var data = editor.call('components:getDefault', 'css');     
        applyAdditions(data, additions);
        return data;
    };


    editor.method('menu:entities:new', function (getParentFn) {
        if (! getParentFn)
            getParentFn = function () {return editor.call('entities:selectedFirst');};

        return {
            'add-new-entity': {
                title: 'Entity',
                className: 'menu-item-add-entity',
                icon: '&#57632;',
                select: function() {
                    editor.call('entities:new', {parent: getParentFn()});
                }
            },
            // 'audio-sub-menu': {
            //     title: 'Audio',
            //     className: 'menu-item-audio-sub-menu',
            //     icon: componentsLogos.sound,
            //     items: {
            //         'add-new-listener': {
            //             title: 'Audio Listener',
            //             className: 'menu-item-add-audio-listener',
            //             icon: componentsLogos.audiolistener,
            //             select: function() {
            //                 editor.call('entities:new', {
            //                     name: 'Audio Listener',
            //                     parent: getParentFn(),
            //                     components: {
            //                         audiolistener: editor.call('components:getDefault', 'audiolistener')
            //                     }
            //                 });
            //             }
            //         },
            //         'add-new-audiosource': {
            //             title: 'Audio Source',
            //             className: 'menu-item-add-audio-source',
            //             icon: componentsLogos.audiosource,
            //             hide: function () {
            //                 return ! editor.call('settings:project').get('useLegacyAudio');
            //             },
            //             select: function() {
            //                 editor.call('entities:new', {
            //                     name: 'Audio Source',
            //                     parent: getParentFn(),
            //                     components: {
            //                         audiosource: editor.call('components:getDefault', 'audiosource')
            //                     }
            //                 });
            //             }
            //         },
            //         'add-new-sound': {
            //             title: 'Sound',
            //             className: 'menu-item-add-sound',
            //             icon: componentsLogos.sound,
            //             select: function() {
            //                 editor.call('entities:new', {
            //                     name: 'Sound',
            //                     parent: getParentFn(),
            //                     components: {
            //                         sound: editor.call('components:getDefault', 'sound')
            //                     }
            //                 });
            //             }
            //         }
            //     }
            // },


            // 'add-new-particles': {
            //     title: 'Particle System',
            //     className: 'menu-item-add-particle-system',
            //     icon: componentsLogos.particlesystem,
            //     select: function() {
            //         editor.call('entities:new', {
            //             name: 'Particle System',
            //             parent: getParentFn(),
            //             components: {
            //                 particlesystem: editor.call('components:getDefault', 'particlesystem')
            //             }
            //         });
            //     }
            // },

            'ui-sub-menu': {
                title: 'User Interface',
                className: 'menu-item-ui-sub-menu',
                icon: componentsLogos.userinterface,
                items: {
                   
                    'add-new-css': {
                        title: 'CSS Element',
                        className: 'menu-item-add-text-element-ui',
                        icon: componentsLogos['css-element'],
                        select: function() {
                            editor.call('entities:new', {
                                name: 'container',
                                parent: getParentFn(),
                                components: {
                                    css: createCssElementComponentData()
                                }
                            });
                        }
                    },
                }
            }
        };
    });
});
