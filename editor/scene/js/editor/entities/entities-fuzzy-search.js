/* editor/entities/entities-fuzzy-search.js */
editor.once('load', function () {
    'use strict';


    editor.method('entities:fuzzy-search', function (query) {
        var items = [];
        var entities = editor.call('entities:list');

        for (var i = 0; i < entities.length; i++)
            items.push([entities[i].get('name'), entities[i]]);

        return editor.call('search:items', items, query);
    });
});