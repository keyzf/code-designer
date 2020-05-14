
/* editor/users/users.js */
editor.once('load', function() {
    
    'use strict';

    var users = { };
    var userRequests = { };

    editor.method('users:get', function(id) {
        return users[id] || null;
    });
});


/* editor/users/users-usage.js */
editor.once('load', function () {
    'use strict';

    editor.on('messenger:user.usage', function (data) {
        if (data.user !== config.owner.id) return;

        config.owner.size += data.usage.total;

        editor.emit('user:' + config.owner.id + ':usage', config.owner.size);
    });
});


/* editor/users/users-flags.js */
editor.once("load", function () {
    'use strict';

    editor.method('users:hasOpenedEditor', function () {
        config.self.flags.openedEditor = true;
        return (config.self && config.self.flags.openedEditor);
    });

    editor.method('users:isSuperUser', function () {
        return true;
    });

    editor.method('users:hasFlag', function (flag) {

        if(!config.self.flags) return true;
        config.self.flags.superUser = true;

        return (config.self && config.self.flags[flag] || config.self.flags.superUser);
    });
});
