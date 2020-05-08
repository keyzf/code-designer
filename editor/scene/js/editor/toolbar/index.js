/* editor/toolbar/toolbar.js */
editor.once('load', function() {
    'use strict';

    var toolbar = editor.call('layout.toolbar');
});




/* editor/toolbar/toolbar-editor-settings.js */
editor.once('load', function() {
    'use strict';

    var toolbar = editor.call('layout.toolbar');

    // settings button
    var button = new ui.Button({
        text: '&#57652;'
    });
    button.class.add('pc-icon', 'editor-settings', 'bottom');
    toolbar.append(button);

    button.on('click', function() {
        editor.call('selector:set', 'editorSettings', [ editor.call('settings:projectUser') ]);
    });

    editor.on('attributes:clear', function() {
        button.class.remove('active');
    });

    editor.on('attributes:inspect[editorSettings]', function() {
        editor.call('attributes.rootPanel').collapsed = false;

        button.class.add('active');
    });

    editor.on('viewport:expand', function(state) {
        button.disabled = state;
    });

    Tooltip.attach({
        target: button.element,
        text: 'Settings',
        align: 'left',
        root: editor.call('layout.root')
    });
});


/* editor/toolbar/toolbar-contact.js */
editor.once('load', function() {
    'use strict';

    var toolbar = editor.call('layout.toolbar');

    var contact = new ui.Button({
        text: '&#57625;'
    });
    contact.class.add('pc-icon', 'contact', 'bottom');
    toolbar.append(contact);

    Tooltip.attach({
        target: contact.element,
        text: 'Feedback',
        align: 'left',
        root: editor.call('layout.root')
    });

    contact.on('click', function() {
        window.open('');
    });
});



/* editor/toolbar/toolbar-history.js */
editor.once('load', function() {
    'use strict';

    var root = editor.call('layout.root');
    var toolbar = editor.call('layout.toolbar');
    var history = editor.call('editor:history');

    // undo
    var buttonUndo = new ui.Button({
        text: '&#57620;'
    });
    buttonUndo.hidden = ! editor.call('permissions:write');
    buttonUndo.class.add('pc-icon');
    buttonUndo.enabled = history.canUndo;
    toolbar.append(buttonUndo);

    history.on('canUndo', function (state) {
        buttonUndo.enabled = state;
        if (state) {
            tooltipUndo.class.remove('innactive');
        } else {
            tooltipUndo.class.add('innactive');
        }
    });
    buttonUndo.on('click', function() {
        history.undo();
    });

    var tooltipUndo = Tooltip.attach({
        target: buttonUndo.element,
        text: 'Undo',
        align: 'left',
        root: root
    });
    if (! history.canUndo)
        tooltipUndo.class.add('innactive');


    // redo
    var buttonRedo = new ui.Button({
        text: '&#57621;'
    });
    buttonRedo.hidden = ! editor.call('permissions:write');
    buttonRedo.class.add('pc-icon');
    buttonRedo.enabled = history.canRedo;
    toolbar.append(buttonRedo);

    history.on('canRedo', function(state) {
        buttonRedo.enabled = state;
        if (state) {
            tooltipRedo.class.remove('innactive');
        } else {
            tooltipRedo.class.add('innactive');
        }
    });
    buttonRedo.on('click', function() {
        history.redo();
    });

    var tooltipRedo = Tooltip.attach({
        target: buttonRedo.element,
        text: 'Redo',
        align: 'left',
        root: root
    });
    if (! history.canRedo)
        tooltipRedo.class.add('innactive');

    editor.on('permissions:writeState', function(state) {
        buttonUndo.hidden = buttonRedo.hidden = ! state;
    });
});




/* editor/toolbar/toolbar-scene.js */
editor.once('load', function() {
    'use strict';

    var root = editor.call('layout.root');
    var viewport = editor.call('layout.viewport');

    var panel = new ui.Panel();
    panel.class.add('widget-title');
    viewport.append(panel);

    editor.method('layout.toolbar.scene', function () {
        return panel;
    });

    var projectName = new ui.Label();
    projectName.text = config.project.name;
    projectName.class.add('project-name');
    projectName.renderChanges = false;
    panel.append(projectName);

    projectName.on('click', function (argument) {
       
    });

    Tooltip.attach({
        target: projectName.element,
        text: 'Project',
        align: 'top',
        root: root
    });

    // var sceneName = new ui.Label();
    // sceneName.class.add('scene-name');
    // sceneName.renderChanges = false;
    // panel.append(sceneName);

    // Tooltip.attach({
    //     target: sceneName.element,
    //     text: 'Settings',
    //     align: 'top',
    //     root: root
    // });

    // editor.on('scene:name', function(name) {
    //     sceneName.text = name;
    // });

    // sceneName.on('click', function() {
    //     editor.call('selector:set', 'editorSettings', [ editor.call('settings:projectUser') ]);
    // });

    // editor.on('attributes:clear', function() {
    //     sceneName.class.remove('active');
    // });

    // editor.on('attributes:inspect[editorSettings]', function() {
    //     sceneName.class.add('active');
    // });

    // editor.on('scene:unload', function () {
    //     sceneName.text = '';
    // });

    var branchButton = new ui.Label({
        text: 'Code'
    });
    branchButton.class.add('branch-name');
    panel.append(branchButton);
    branchButton.on('click', function () {
        editor.call('picker:code');
    });

    Tooltip.attach({
        target: branchButton.element,
        text: '查看代码',
        align: 'top',
        root: root
    });
});


/* editor/toolbar/toolbar-responsive.js */
editor.once('viewport:load', function() {
    'use strict';

    var viewport = editor.call('layout.viewport');
    var app = editor.call('viewport:app');
    if (! app) return; // webgl not available

    var canvas = editor.call('viewport:canvas');

    var list = [{
        id:"r1",
        name: 'responsive',
        title: 'Responsive',
        className: 'viewport-camera-perspective',
        screen: new pc.Vec2(1024, 768),
        default: true
    },{
        id:"r2",
        name: 'iPhone5 se',
        title: 'iPhone5 se',
        className: 'viewport-camera-top',
        screen: new pc.Vec2(320, 568)
    }, {
        id:"r3",
        name: 'iPhone6 7 8',
        title: 'iPhone6 7 8',
        className: 'viewport-camera-top',
        screen: new pc.Vec2(375, 667)
    }, {
        id:"r4",
        name: 'iPhone6 7 8 Plus',
        title: 'iPhone6 7 8 Plus',
        className: 'viewport-camera-bottom',
        screen: new pc.Vec2(414, 768)
    }, {
        id:"r5",
        name: 'iPhoneX',
        title: 'iPhoneX',
        className: 'viewport-camera-front',
        screen: new pc.Vec2(375, 812),
    }, {
        id:"r6",
        name: 'iPad',
        title: 'iPad',
        className: 'viewport-camera-back',
        screen: new pc.Vec2(1024, 768)
    }, {
        id:"r7",
        name: 'iPad pro',
        title: 'iPad pro',
        className: 'viewport-camera-right',
        screen: new pc.Vec2(1024, 1366)
    },{
        id:"r8",
        name: 'PCMP',
        title: 'PCMP',
        className: 'viewport-camera-right',
        screen: new pc.Vec2(960, 630)
    },{
        id:"cube",
        name: 'Cube',
        title: 'Cube',
        className: 'viewport-camera-right',
        screen: new pc.Vec2(1280, 720)
    }];

    var options = { };
    var index = { };
    var events = { };

    var combo = new ui.SelectField({
        options: options,
        optionClassNamePrefix: 'viewport-camera'
    });
    combo.disabledClick = true;
    combo.class.add('viewport-camera');

    combo.on('open', function() {
        tooltip.disabled = true;
    });
    combo.on('close', function() {
        tooltip.disabled = false;
    });


    viewport.append(combo);

    combo.on('change', function(value) {
        
        var screen = index[value].screen;
        
        canvas.setAttribute("width",screen.x);
        canvas.setAttribute("height",screen.y);
    });

    var tooltip = Tooltip.attach({
        target: combo.element,
        text: '响应式尺寸',
        align: 'top',
        root: editor.call('layout.root')
    });

    var refreshOptions = function() {
        combo._updateOptions(options);

        var writePermission = editor.call('permissions:write');
        for(var key in combo.optionElements) {
            if (index[key].__editorCamera)
                continue;

            if (writePermission) {
                combo.optionElements[key].classList.remove('hidden');
            } else {
                combo.optionElements[key].classList.add('hidden');
            }
        }
    };

    editor.on('permissions:writeState', refreshOptions);

    list.forEach(function(entity){
        options[entity.id] = entity.name;
        index[entity.id] = entity;
        refreshOptions();
    });
    combo.value = "r1";
});