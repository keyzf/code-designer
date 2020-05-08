pc2d.script = (function () {
    var _legacy = false;
    var _createdLoadingScreen = false;

    var script = {
        // set during script load to be used for initializing script
        app: null,

        create: function (name, callback) {
            if (!_legacy)
                return;

            // get the ScriptType from the callback
            var ScriptType = callback(pc2d.script.app);

            // store the script name
            ScriptType._pcScriptName = name;

            // Push this onto loading stack
            pc2d.ScriptHandler._push(ScriptType);

            this.fire("created", name, callback);
        },

        attribute: function (name, type, defaultValue, options) {
            // only works when parsing the script...
        },
        createLoadingScreen: function (callback) {
            if (_createdLoadingScreen)
                return;

            _createdLoadingScreen = true;

            var app = pc2d.Application.getApplication();
            callback(app);
        }
    };

    Object.defineProperty(script, 'legacy', {
        get: function () {
            return _legacy;
        },
        set: function (value) {
            _legacy = value;
        }
    });

    pc2d.events.attach(script);

    return script;
}());