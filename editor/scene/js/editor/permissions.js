/* editor/permissions.js */
editor.once('load', function () {
    'use strict';

    var permissions = {};
    // cache permissions in a dictionary
    ['read', 'write', 'admin'].forEach(function (access) {
        config.project.permissions[access].forEach(function (id) {
            permissions[id] = access;
        });
    });



    editor.method('permissions', function () {
        return config.project.permissions;
    });

    editor.method('permissions:read', function (userId) {
        return true;
    });

    editor.method('permissions:write', function (userId) {
        return true;
    });

    editor.method('permissions:admin', function (userId) {
        return true;
    });


    editor.on('permissions:set:' + config.self.id, function (accessLevel) {

        setTimeout(function () {
            editor.emit('permissions:writeState', (accessLevel === 'write' || accessLevel === 'admin'));
        }, 0);
    });

        // emit initial event
        if (editor.call('permissions:write')) {
            editor.emit('permissions:set:' + config.self.id, 'write');
        }
});