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



/* editor/toolbar/toolbar-help.js */
editor.once('load', function() {
    'use strict';

    var toolbar = editor.call('layout.toolbar');

    var button = new ui.Button({
        text: '&#57656;'
    });
    button.class.add('pc-icon', 'help-howdoi', 'bottom', 'push-top');
    toolbar.append(button);

    button.on('click', function() {
        editor.call('help:howdoi:toggle');
    });

    editor.on('help:howdoi:open', function () {
        button.class.add('active');
    });

    editor.on('help:howdoi:close', function () {
        button.class.remove('active');
    });

    Tooltip.attach({
        target: button.element,
        text: 'How do I...?',
        align: 'left',
        root: editor.call('layout.root')
    });
});


/* editor/toolbar/toolbar-gizmos.js */
editor.once('load', function() {
    'use strict';

    var root = editor.call('layout.root');
    var toolbar = editor.call('layout.toolbar');

    var activeGizmo = null;
    var gizmoButtons = { };

    // create gizmo type buttons
   

    editor.on('permissions:writeState', function(state) {
        for(var key in gizmoButtons) {
            gizmoButtons[key].hidden = ! state;
        }
    });


    // focus on entity
    var buttonFocus = new ui.Button({
        text: '&#57623;'
    });
    buttonFocus.disabled = true;
    buttonFocus.class.add('pc-icon');
    buttonFocus.on('click', function() {
        editor.call('viewport:focus');
    });
    toolbar.append(buttonFocus);

    editor.on('attributes:clear', function() {
        buttonFocus.disabled = true;
        tooltipFocus.class.add('innactive');
    });
    editor.on('attributes:inspect[*]', function(type) {
        buttonFocus.disabled = type !== 'entity';
        if (type === 'entity') {
            tooltipFocus.class.remove('innactive');
        } else {
            tooltipFocus.class.add('innactive');
        }
    });

    var tooltipFocus = Tooltip.attach({
        target: buttonFocus.element,
        text: 'Focus',
        align: 'left',
        root: root
    });
    tooltipFocus.class.add('innactive');


    // translate hotkey
    editor.call('hotkey:register', 'gizmo:translate', {
        key: '1',
        callback: function() {
            if (editor.call('picker:isOpen:otherThan', 'curve')) return;
           // gizmoButtons['translate'].emit('click');
        }
    });

    // rotate hotkey
    editor.call('hotkey:register', 'gizmo:rotate', {
        key: '2',
        callback: function() {
            if (editor.call('picker:isOpen:otherThan', 'curve')) return;
           // gizmoButtons['rotate'].emit('click');
        }
    });

    // scale hotkey
    editor.call('hotkey:register', 'gizmo:scale', {
        key: '3',
        callback: function() {
            if (editor.call('picker:isOpen:otherThan', 'curve')) return;
           // gizmoButtons['scale'].emit('click');
        }
    });

    // resize hotkey
    editor.call('hotkey:register', 'gizmo:resize', {
        key: '4',
        callback: function() {
            if (editor.call('picker:isOpen:otherThan', 'curve')) return;
            //gizmoButtons['resize'].emit('click');
        }
    });

    // world/local hotkey
    editor.call('hotkey:register', 'gizmo:world', {
        key: 'l',
        callback: function() {
            if (editor.call('picker:isOpen:otherThan', 'curve')) return;
           // buttonWorld.emit('click');
        }
    });

    // focus
    editor.call('hotkey:register', 'viewport:focus', {
        key: 'f',
        callback: function() {
            if (editor.call('picker:isOpen:otherThan', 'curve')) return;
            editor.call('viewport:focus');
        }
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


/* editor/toolbar/toolbar-publish.js */
editor.once('load', function() {
    'use strict';

    var toolbar = editor.call('layout.toolbar');

    var button = new ui.Button({
        text: '&#57911;'
    });
    button.class.add('pc-icon', 'publish-download');
    toolbar.append(button);

    button.on('click', function() {
        
        editor.call('picker:publish');
    });

    editor.on('picker:publish:open', function () {
        button.class.add('active');
    });

    editor.on('picker:publish:close', function () {
        button.class.remove('active');
    });

    Tooltip.attach({
        target: button.element,
        text: 'Publish / Download',
        align: 'left',
        root: editor.call('layout.root')
    });
});


/* editor/toolbar/toolbar-code-editor.js */
editor.once('load', function() {
    'use strict';

    if (editor.call('settings:project').get('useLegacyScripts'))
        return;

    var toolbar = editor.call('layout.toolbar');
    var firefox = navigator.userAgent.indexOf('Firefox') !== -1;

    var button = new ui.Button({
        text: '&#57648;'
    });
    button.class.add('pc-icon');

    var publishButton = toolbar.dom.querySelector('.publish-download');
    toolbar.appendBefore(button, publishButton);

    button.on('click', function() {
        editor.call('picker:codeeditor');
    });


    var windows = [];
    editor.method('picker:codeeditor', function (asset) {

        // open the new code editor - try to focus existing tab if it exists
        // (only works in Chrome and only if the Code Editor has been opened by the Editor)

        var url = './code-editor-v3/index.html' + '?projectid=' + config.project.id;
        if (asset) {
            url += '&tabs=' + asset.get('id');
        }
        var name = 'codeeditor:' + config.project.id;

        if (true) {
            // (Firefox doesn't work at all so open a new tab everytime)
            if(!windows[url]){
                var wnd = window.open(url);
                wnd.onclose = (function(){
                    return function(){
                        delete windows[url];
                    }
                })(url);
                windows[url] = wnd;
            }

            windows[url].focus();
           
        } else {
            var wnd = window.open('', name);
            try {
                if (wnd.editor && wnd.editor.isCodeEditor) {
                    if (asset) {
                        wnd.editor.call('integration:selectWhenReady', asset.get('id'));
                    }

                } else {
                    wnd.location = url;
                }
            } catch (ex) {
                // accessing wnd will throw an exception if it
                // is at a different domain
                window.open(url, name);
            }

        }
    });

    Tooltip.attach({
        target: button.element,
        text: 'Code Editor',
        align: 'left',
        root: editor.call('layout.root')
    });

    editor.call('hotkey:register', 'code-editor', {
        key: 'i',
        ctrl: true,
        callback: function () {
            editor.call('picker:codeeditor');
        }
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



    // var sceneList = new ui.Label();
    // sceneList.class.add('scene-list');
    // panel.append(sceneList);

    // Tooltip.attach({
    //     target: sceneList.element,
    //     text: 'Manage Scenes',
    //     align: 'top',
    //     root: root
    // });

    // sceneList.on('click', function () {
    //     editor.call('picker:scene');
    // });

    // editor.on('picker:scene:open', function () {
    //     sceneList.class.add('active');
    // });

    // editor.on('picker:scene:close', function () {
    //     sceneList.class.remove('active');
    // });
});


/* editor/toolbar/toolbar-launch.js */
editor.once('load', function() {
    'use strict';

    var root = editor.call('layout.root');
    var viewport = editor.call('layout.viewport');
    var legacyScripts = editor.call('settings:project').get('useLegacyScripts');

    var settings = editor.call('settings:projectUser');

    // panel
    var panel = new ui.Panel();
    panel.class.add('top-controls');
    viewport.append(panel);

    editor.method('layout.toolbar.launch', function () {
        return panel;
    });

    // launch
    var launch = new ui.Panel();
    launch.class.add('launch');
    panel.append(launch);
    launch.disabled = true;

    editor.on('scene:load', function () {
        launch.disabled = false;
    });

    editor.on('scene:unload', function () {
        launch.disabled = true;
    });

    var buttonLaunch = new ui.Button({
        text: '&#57649;'
    });
    buttonLaunch.class.add('icon');
    launch.append(buttonLaunch);

    var launchApp = function () {

        // var url = window.location.origin + "/lauch.html";

        // var query = [ ];
        // query.push('projectId=' + config.project.id);
        
        // if (query.length)
        //     url += '?' + query.join('&');

        // var launcher = window.open();
        // launcher.opener = null;
        // launcher.location = url;


        var url = window.location.origin + "/lauch_pcmp.html";

        var query = [ ];
        query.push('projectId=' + config.project.id);
        
        if (query.length)
            url += '?' + query.join('&');

        var launcher = window.open();
        launcher.opener = null;
        launcher.location = url + "#/pages/index/index";
    };

    buttonLaunch.on('click', launchApp);

    var tooltip = Tooltip.attach({
        target: launch.element,
        text: 'Launch',
        root: root
    });

    var layoutRight = editor.call('layout.attributes');

    var launchOptions = { };

    var panelOptions = new ui.Panel();
    panelOptions.class.add('options');
    launch.append(panelOptions);
    panelOptions.hidden = true;

    var createOption = function (name, title) {
        var panel = new ui.Panel();
        panel.flex = true;
        panelOptions.append(panel);

        var option = new ui.Checkbox();
        option.style.marginTop = '6px';
        option.value = false;
        option.class.add('tick');
        panel.append(option);

        option.on('click', function (e) {
            e.stopPropagation();
        });

        var label = new ui.Label({text: title});
        panel.append(label);

        panel.on('click', function () {
            option.value = !option.value;
        });

        launchOptions[name] = false;
        option.on('change', function (value) {
            launchOptions[name] = value;
        });

        return option;
    };

    var optionProfiler = createOption('profiler', 'Profiler');
    var tooltipProfiler = Tooltip.attach({
        target: optionProfiler.parent.element,
        text: 'Enable the visual performance profiler in the launch page.',
        align: 'right',
        root: root
    });
    tooltipProfiler.class.add('launch-tooltip');

    var optionDebug = createOption('debug', 'Debug');

    var suspendDebug = false;
    optionDebug.value = settings.get('editor.launchDebug');
    settings.on('editor.launchDebug:set', function (value) {
        suspendDebug = true;
        optionDebug.value = value;
        suspendDebug = false;
    });
    optionDebug.on('change', function (value) {
        if (suspendDebug) return;
        settings.set('editor.launchDebug', value);
    });

    var tooltipDebug = Tooltip.attach({
        target: optionDebug.parent.element,
        text: 'Enable the logging of warning and error messages to the JavaScript console.',
        align: 'right',
        root: root
    });
    tooltipDebug.class.add('launch-tooltip');


    var optionConcatenate = createOption('concatenate', 'Concatenate Scripts');
    var tooltipConcatenate = Tooltip.attach({
        target: optionConcatenate.parent.element,
        text: 'Concatenate scripts on launch to reduce scene load time.',
        align: 'right',
        root: root
    });
    tooltipConcatenate.class.add('launch-tooltip');

    if (editor.call('users:hasFlag', 'hasBundles')) {
        var optionDisableBundles = createOption('disableBundles', 'Disable Asset Bundles');

        var tooltipBundles = Tooltip.attach({
            target: optionDisableBundles.parent.element,
            text: 'Disable loading assets from Asset Bundles.',
            align: 'right',
            root: root
        });
        tooltipBundles.class.add('launch-tooltip');
    }

    var preferWebGl1 = createOption('webgl1', 'Prefer WebGL 1.0');

    var tooltipPreferWebGl1 = Tooltip.attach({
        target: preferWebGl1.parent.element,
        text: 'Force the use of WebGL 1 regardless of whether WebGL 2 is preferred in Scene Settings.',
        align: 'right',
        root: root
    });
    tooltipPreferWebGl1.class.add('launch-tooltip');

    if (! editor.call('settings:project').get('preferWebGl2'))
        preferWebGl1.parent.disabled = true;

    editor.call('settings:project').on('preferWebGl2:set', function(value) {
        preferWebGl1.parent.disabled = ! value;
    });

    editor.method('launch', launchApp);

    editor.call('hotkey:register', 'launch', {
        key: 'enter',
        ctrl: true,
        callback: function () {
            if (editor.call('picker:isOpen')) return;
            launchApp();
        }
    });


    var timeout;

    // show dropdown menu
    launch.element.addEventListener('mouseenter', function () {
        if (! editor.call('permissions:read') || launch.disabled)
            return;

        tooltip.align = (layoutRight && (layoutRight.hidden || layoutRight.folded)) ? 'right' : 'left';

        panelOptions.hidden = false;
        if (timeout)
            clearTimeout(timeout);
    });

    // hide dropdown menu after a delay
    launch.element.addEventListener('mouseleave', function () {
        if (! editor.call('permissions:write'))
            return;

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(function () {
            panelOptions.hidden = true;
            timeout = null;
        }, 50);
    });

    // cancel hide
    panel.element.addEventListener('mouseenter', function () {
        if (!panelOptions.hidden && timeout)
            clearTimeout(timeout);

    });

    // hide options after a while
    panel.element.addEventListener('mouseleave', function () {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(function () {
            panelOptions.hidden = true;
            timeout = null;
        }, 50);
    });


    // fullscreen
    var buttonExpand = new ui.Button({
        text: '&#57639;'
    });
    buttonExpand.class.add('icon', 'expand');
    panel.append(buttonExpand);

    buttonExpand.on('click', function() {
        editor.call('viewport:expand');
    });
    editor.on('viewport:expand', function(state) {
        if (state) {
            tooltipExpand.text = 'Show Panels';
            buttonExpand.class.add('active');
        } else {
            tooltipExpand.text = 'Hide Panels';
            buttonExpand.class.remove('active');
        }

        tooltipExpand.hidden = true;
    });

    var tooltipExpand = Tooltip.attach({
        target: buttonExpand.element,
        text: 'Hide Panels',
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


/* editor/toolbar/toolbar-usage.js */
editor.once('load', function () {
    'use strict';

    if (config.owner.plan.type !== 'free')
        return;

    var root = editor.call('layout.root');
    var container = new pcui.Container({
        id: 'usage-alert'
    });

    var label = new ui.Label({
        unsafe: true
    });
    container.append(label);

    var btnClose = new ui.Button({
        text: '&#57650;'
    });
    container.append(btnClose);
    btnClose.class.add('close');
    btnClose.on('click', function () {
        container.hidden = true;
    });

    var refreshUsage = function () {
        var diff = config.owner.diskAllowance - config.owner.size;
        var upgrade = '<a href="/upgrade" target="_blank">UPGRADE</a> to get more disk space.';
        if (diff > 0 && diff < 30000000) {
            label.text = 'You are close to your disk allowance limit. ' + upgrade;
            container.hidden = false;
        } else if (diff < 0) {
            label.text = 'You are over your disk allowance limit. ' + upgrade;
            container.hidden = false;
        } else {
            container.hidden = true;
        }
    };

    root.append(container);

    refreshUsage();

    editor.on('user:' + config.owner.id + ':usage', refreshUsage);
});


/* editor/toolbar/toolbar-script.js */
editor.once('load', function () {
    'use script';

    if (! editor.call('settings:project').get('useLegacyScripts'))
        return;

    var root = editor.call('layout.root');
    var overlay = new ui.Overlay();
    overlay.class.add('new-script');
    overlay.clickable = true;
    overlay.hidden = true;
    root.append(overlay);

    var panel = new ui.Panel();
    overlay.append(panel);

    var label = new ui.Label({
        text: 'Enter script name and press Enter:'
    });
    label.class.add('action');
    panel.append(label);

    var fieldName = new ui.TextField();
    fieldName.blurOnEnter = false;
    fieldName.renderChanges = false;
    panel.append(fieldName);

    var fieldError = new ui.Label();
    fieldError.renderChanges = false;
    fieldError.class.add('error');
    panel.append(fieldError);
    fieldError.hidden = true;

    var newContent = '';
    var creating = false;

    // close overlay on esc
    var onKey = function (e) {
        if (e.keyCode === 27) {
            overlay.hidden = true;
        }
    };

    overlay.on('show', function () {
        editor.emit('sourcefiles:new:open');
        window.addEventListener('keydown', onKey);
        setTimeout(function () {
            fieldName.elementInput.focus();
        }, 100);
    });

    overlay.on('hide', function () {
        window.removeEventListener('keydown', onKey);
        fieldName.value = '';
        fieldError.hidden = true;
        fieldError.text = '';
        newContent = '';
        creating = false;
        editor.emit('sourcefiles:new:close');

    });

    editor.method('sourcefiles:new', function (content) {
        newContent = content;
        overlay.hidden = false;
    });

    var onError = function (error) {
        fieldError.text = error;
        fieldError.hidden = false;
    };

    var onSubmit = function () {
        if (creating)
            return;

        creating = true;

        fieldError.hidden = true;

        if (! validateFilename(fieldName.value)) {
            creating = false;
            onError('Invalid filename');
            return;
        }

        if (!fieldName.value.toLowerCase().endsWith('.js'))
            fieldName.value = fieldName.value + '.js';

        createScript(fieldName.value, function (err, script) {
            creating = false;

            if (err) {
                onError(err);
            } else {
                // select script
                editor.call('assets:panel:currentFolder', 'scripts');
                editor.call('selector:set', 'asset', [script]);

                overlay.hidden = true;
            }
        });
    };

    // submit on enter
    fieldName.elementInput.addEventListener('keydown', function (e) {
        if (e.keyCode === 13) {
            onSubmit();
        }
    });

    // clear error on input
    fieldName.elementInput.addEventListener('input', function () {
        if (!fieldError.hidden) {
            fieldError.hidden = true;
            fieldError.text = '';
        }
    });

    var pattern = /^(?:[\w\.-]+\/)*[_\.-]*[A-Za-z][\w_\.-]*?$/i;
    var validateFilename = function (filename) {
        return pattern.test(filename);
    };

    var createScript = function (filename, callback) {
        // try to get the file first and create it only if it doesn't exist
        // TODO: don't do that when scripts are assets
        editor.call('sourcefiles:content', filename, function (err) {
            if (! err) {
                // already exists
                callback('Script with that name already exists.');
            } else {
                // create script
                var content = newContent || editor.call('sourcefiles:skeleton', filename);
                editor.call('sourcefiles:create', filename, content, function (err, sourcefile) {
                    callback(err, sourcefile);
                });
            }
        });
    };
});