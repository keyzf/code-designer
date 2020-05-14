/* editor/history/history.js */
editor.once('load', function () {
    'use strict';

    var history = new pcui.History();

    /**
     * Returns the history object.
     */
    editor.method('editor:history', function () {
        return history;
    });

    // Keep for backwards compatibilty
    editor.method('history:add', function (action) {
        history.add(action);
    });
});
