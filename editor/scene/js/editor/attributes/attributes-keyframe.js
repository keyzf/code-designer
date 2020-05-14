editor.once('load', function() {
    'use strict';


    var keyframePanel = null;

    let keyframeInspector = null;
    let keyframeInspectorEvents = [];

    keyframeInspector = new pcui.KeyframeInspector({
        assets: editor.call('assets:raw'),
        entities: editor.call('entities:raw'),
        projectSettings: editor.call('settings:project'),
        history: editor.call('editor:history')
    });
    keyframeInspector.once('destroy', () => {
        keyframeInspectorEvents.forEach(evt => evt.unbind());
        keyframeInspectorEvents = [];
    });

    editor.on('attributes:beforeClear', function() {
        keyframeInspector.unlink();
        if (keyframeInspector.parent) {
            keyframeInspector.parent.remove(keyframeInspector);
        }
    });

    editor.on('attributes:clear', function () {
        keyframeInspector.unlink();
    });

    editor.on('attributes:inspect[keyframe]', function(keyframes) {
        // Set panel title
        // var multi = assets.length > 1;
        // var type = ((assets[0].get('source') && assets[0].get('type') !== 'folder') ? 'source ' : '') + assets[0].get('type');

        // if (multi) {
        //     editor.call('attributes:header', assets.length + ' assets');

        //     for (let i = 0; i < assets.length; i++) {
        //         if (type !== ((assets[0].get('source') && assets[0].get('type') !== 'folder') ? 'source ' : '') + assets[i].get('type')) {
        //             type = null;
        //             break;
        //         }
        //     }
        // } else {
        //     editor.call('attributes:header', type);
        // }

        var root = editor.call('attributes.rootPanel');

        if (!keyframeInspector.parent)
            root.append(keyframeInspector);
        keyframeInspector.link(keyframes);

        var events = [ ];
        var panel = editor.call('attributes:addPanel');
        panel.class.add('component');
        keyframePanel = panel;
        panel.once('destroy', function () {
            keyframePanel = null;

            for(var i = 0; i < events.length; i++)
                events[i].unbind();

            events = null;
        });
       // keyframeInspectorEvents.push(root.on('resize', keyframeInspector.updatePreview.bind(keyframeInspector)));

    });

    editor.on('attributes:keyframe:toggleInfo', function (enabled) {
        if (keyframePanel) {
            keyframePanel.hidden = !enabled;
        }
        keyframeInspector.hidden = !enabled;
    });

    editor.method('attributes:keyframe:panel', function() {
        return keyframePanel;
    });
});
