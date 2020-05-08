/* editor/first-load.js */
(function() {
    // first load
    document.addEventListener('DOMContentLoaded', function() {
        editor.emit('load');
        editor.call('status:text', 'starting');
        editor.emit('start');

        editor.call('status:text', 'ready');


         
        if (!config.scene.id) {
            
            editor.call('picker:project');
        }
    }, false);
})();
