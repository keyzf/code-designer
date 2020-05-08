/* editor/history/history-status-text.js */
editor.once('load', function () {
    'use strict';

    var history = editor.call('editor:history');

    history.on('add', function (name) {
        editor.call('status:text', name);
    });

    history.on('undo', function () {
        if (history.currentAction) {
            editor.call('status:text', history.currentAction.name);
        } else {
            editor.call('status:text', '');
        }
    });

    history.on('redo', function (name) {
        editor.call('status:text', name);
    });
});