/* editor/apps/apps.js */
editor.once('load', function () {
    'use strict';

    // Fetch list of apps from the server and
    // pass them to the callback
    editor.method('apps:list', function (callback) {
      
    });

    // Get a specific app from the server and pass result to callback
    editor.method('apps:get', function (appId, callback) {
      
    });

    // Create app and pass result to callback
    editor.method('apps:new', function (data, callback, error) {
        
    });

    // Download app
    editor.method('apps:download', function (data, callback, error) {
       
    });

    // Delete a app
    editor.method('apps:delete', function (appId, callback) {
       
    });

});