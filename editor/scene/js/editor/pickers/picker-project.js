/* editor/pickers/picker-project.js */
editor.once('load', function () {
    'use strict';



    // overlay
    var overlay = new ui.Overlay();
    overlay.class.add('picker-project');
    overlay.clickable = true;
    overlay.hidden = true;

    var root = editor.call('layout.root');
    root.append(overlay);

    // main panel
    var panel = new ui.Panel();
    panel.class.add('project');
    overlay.append(panel);

    // left side panel
    var leftPanel = new ui.Panel();
    panel.append(leftPanel);
    leftPanel.class.add('left');

    // project image
    var blankImage = config.url.static + '/platform/images/common/blank_project.png';

    var projectImg = document.createElement('div');
    projectImg.classList.add('image');
    projectImg.style.backgroundImage = 'url("' + (blankImage) + '")';
    leftPanel.append(projectImg);

    var uploadProjectImage = function (file) {
        if (!editor.call('permissions:write'))
            return;

        if (uploadingImage)
            return;

        projectImg.style.backgroundImage = 'url("' + config.url.static + '/platform/images/common/ajax-loader.gif")';
        projectImg.classList.add('progress');

        uploadingImage = true;

        editor.call('images:upload', file, function (data) {
            editor.call('project:save', {
                image_url: data.url
            }, function () {
                uploadingImage = false;

            }, function () {
                // error
                uploadingImage = false;

            });
        }, function (status, data) {
            // error
            uploadingImage = false;
        });
    };

    var dropRef = editor.call('drop:target', {
        ref: projectImg,
        filter: function (type, data) {
            return editor.call('permissions:write') &&
                !leftPanel.disabled &&
                !uploadingImage &&
                type === 'files';
        },
        drop: function (type, data) {
            if (type !== 'files')
                return;

            var file = data[0];
            if (!file)
                return;

            if (!/^image\//.test(file.type))
                return;

            uploadProjectImage(file);
        }
    });

    dropRef.class.add('drop-area-project-img');

    // hidden file input to upload project image
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    var currentSelection = null;
    var uploadingImage = false;

    projectImg.addEventListener('click', function () {
        if (!editor.call('permissions:write') || leftPanel.disabled)
            return;

        fileInput.click();
    });


    fileInput.addEventListener('change', function () {
        var file = fileInput.files[0];
        fileInput.value = null;

        uploadProjectImage(file);
    });

    // project info
    var info = document.createElement('div');
    info.classList.add('info');
    leftPanel.append(info);

    // name
    var projectName = new ui.Label({
        text: ''
    });
    projectName.class.add('name');
    info.appendChild(projectName.element);

    // quick stats
    // TODO

    // store all panels for each menu option
    var menuOptions = {};

    var defaultMenuOption = null;

    // menu
    var list = new ui.List();
    leftPanel.append(list);

    // right side panel
    var rightPanel = new ui.Panel('Project');
    panel.append(rightPanel);
    rightPanel.class.add('right');

    // close button
    var btnClose = new ui.Button({
        text: '&#57650;'
    });
    btnClose.class.add('close');
    btnClose.on('click', function () {
        overlay.hidden = true;
    });
    rightPanel.headerElement.appendChild(btnClose.element);

    var container = new ui.List();
    container.class.add('scene-list');
    rightPanel.append(container);
    container.hidden = true;





    var container2 = new ui.Panel();
    rightPanel.append(container2);
    container2.hidden = true;



    // new scene button
    var newProject = new ui.Button({
        text: 'Add new Project'
    });

    // handlePermissions(newScene);
    newProject.class.add('new');

    rightPanel.append(newProject);

    newProject.on('click', function () {
        newProject.disabled = true;
        container2.hidden = false;


        // add new scene input field
        var input = new ui.TextField({
            default: 'Untitled',
            placeholder: 'Enter Project name and press Enter'
        });

        // input.blurOnEnter = false;
        container2.element.appendChild(input.element);
        input.elementInput.focus();
        input.elementInput.select();

        var select = new ui.SelectField({
            type: 'string',
            options: [{
                v: 'mobileh5',
                t: 'HTML5'
            }]
        });

        container2.element.appendChild(select.element);


        var destroyField = function () {
            input.destroy();
            newProject.disabled = false;
        };

        // input.elementInput.addEventListener('blur', destroyField);

        input.elementInput.addEventListener('keydown', function (e) {
            if (e.keyCode === 13) {
                if (!input.value) return;

                editor.call('picker:project:close');
                editor.call('project:create', {
                    name: input.value,
                    type: select.value
                }, function (project) {
                    config.project = project;
                    var ProjectId = project.id;
                    loadEditorScript(function () {
                        editor.emit('project:ready');
                        editor.emit('offline:loadedproject');

                        var FS = editor.call("FS:offline-system");
                        FS.sceneRaw(ProjectId).then(scene => {
                            editor.emit('scene:load', scene.data.item_id, ProjectId);
                            editor.emit('scene:raw', scene.data);
                            editor.emit('fsoffline:assets');
                        });
                    });
                });
            }
        });
    });


    // create row for scene
    var createProjectEntry = function (project) {
        var row = new ui.ListItem();
        row.element.id = 'picker-scene-' + project.id;

        container.append(row);

        if (config.project.id && parseInt(project.id, 10) === parseInt(config.project.id, 10))
            row.class.add('current');

        // project name
        var name = new ui.Label({
            text: project.name
        });
        name.class.add('name');

        row.element.appendChild(name.element);

        // project date
        var date = new ui.Label({
            text: editor.call('datetime:convert', project.modified)
        });
        date.class.add('date');
        row.element.appendChild(date.element);

        // dropdown
        var dropdown = new ui.Button({
            text: '&#57689;'
        });
        dropdown.class.add('dropdown');
        row.element.appendChild(dropdown.element);

        dropdown.on('click', function () {
            dropdown.class.add('clicked');
            dropdown.element.innerHTML = '&#57687;';

            dropdownProject = project;
            dropdownMenu.open = true;
            var rect = dropdown.element.getBoundingClientRect();
            dropdownMenu.position(rect.right - dropdownMenu.innerElement.clientWidth, rect.bottom);
        });

        if (parseInt(config.project.id, 10) !== parseInt(project.id, 10)) {
            events.push(row.on('click', function (e) {
                if (e.target === row.element || e.target === name.element || e.target === date.element) {
                    if (parseInt(config.project.id, 10) === parseInt(project.id, 10))
                        return;
                    editor.call('picker:project:close');


                    config.project = project;


                    var ProjectId = project.id;
                    var FS = editor.call("FS:offline-system");
                    FS.sceneRaw(ProjectId).then(scene => {

                        loadEditorScript(function () {
                            editor.emit('project:ready');
                            editor.emit('offline:loadedproject');

                            editor.emit('scene:load', scene.data.item_id, ProjectId);
                            editor.emit('scene:raw', scene.data);
                            editor.emit('fsoffline:assets');
                        });




                    })

                    // editor.call('scene:load', scene.uniqueId);
                }
            }));
        }

        return row;
    };


    function loadEditorScript(callback) {
        var scripts =
            `          
            <script src="./editor/scene/js/editor/permissions.js"></script>
            <script src="./editor/scene/js/editor/users/index.js"></script>
            <script src="./editor/scene/js/editor/settings/index.js"></script>
  <script src="./editor/scene/js/editor/settings/settings-attributes-rendering.js"></script> 
  <script src="./editor/scene/js/editor/settings/project-settings.js"></script>
  
  
  <script src="./editor/scene/js/editor/entities/entities.js"></script>
  <script src="./editor/scene/js/editor/assets/assets.js"></script>
  
  
  <script src="./editor/scene/js/editor/selector/index.js"></script>
  <script src="./editor/scene/js/editor/sourcefiles/sourcefiles.js"></script>
  <script src="./editor/scene/js/editor/sourcefiles/sourcefiles-skeleton.js"></script>
  <script src="./editor/scene/js/editor/sourcefiles/sourcefiles-attributes-scan.js"></script>
  <script src="./editor/scene/js/editor/schema/index.js"></script>
  
  <script src="./editor/scene/js/editor/entities/entities-selection.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-edit.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-addComponent.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-create.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-delete.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-duplicate.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-copy.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-paste.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-reparent.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-panel.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-treeview.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-menu.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-control.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-fuzzy-search.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-fuzzy-search-ui.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-load.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-layout-utils.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-history.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-sync.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-migrations.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-scripts.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-hotkeys.js"></script>
  <script src="./editor/scene/js/editor/entities/entities-context-menu.js"></script>
  <script src="./editor/scene/js/editor/entities/index.js"></script>
  <script src="./editor/scene/js/editor/assets/assets-registry.js"></script>
  <script src="./editor/scene/js/editor/assets/assets-sync.js"></script>
  <script src="./editor/scene/js/editor/assets/assets-fs.js"></script>
  <script src="./editor/scene/js/editor/assets/assets-panel.js"></script>
  <script src="./editor/scene/js/editor/assets/assets-panel-control.js"></script>
  <script src="./editor/scene/js/editor/assets/assets-pipeline-settings.js"></script>
  <script src="./editor/scene/js/editor/assets/assets-context-menu.js"></script>
  <script src="./editor/scene/js/editor/assets/assets-filter.js"></script>
  <script src="./editor/scene/js/editor/assets/assets-upload.js"></script>
  <script src="./editor/scene/js/editor/assets/assets-create-animation.js"></script>
  <script src="./editor/scene/js/editor/assets/index.js"></script>
  
  
  <script src="./editor/scene/js/editor/animatorviewport/gizimo/index.js"></script>
  <script src="./editor/scene/js/editor/animatorviewport/viewport-application.js"></script>
  <script src="./editor/scene/js/editor/animatorviewport/viewport.js"></script>
  <script src="./editor/scene/js/editor/animatorviewport/index.js"></script>
  <script src="./editor/scene/js/editor/animatorviewport/viewport-assets.js"></script>
  <script src="./editor/scene/js/editor/animatorviewport/viewport-entities-observer-binding.js"></script>
  <script src="./editor/scene/js/editor/animatorviewport/viewport-entities-components-binding.js"></script>
  
  
  <script src="./editor/scene/js/editor/templates/index.js"></script>
  <script src="./editor/scene/js/editor/project/project-scripts-order.js"></script>
  <script src="./editor/scene/js/editor/userdata/userdata.js"></script>
  <script src="./editor/scene/js/editor/attributes/index.js"></script>
  <script src="./editor/scene/js/editor/attributes/reference/index.js"></script>
  <script src="./editor/scene/js/editor/attributes/attributes-entity.js"></script>
  <script src="./editor/scene/js/editor/attributes/components/attributes-components-script.js"></script>
  <script src="./editor/scene/js/editor/templates/templates-override-panel.js"></script>
  <script src="./editor/scene/js/editor/templates/templates-entity-inspector.js"></script>
  <script src="./editor/scene/js/editor/inspector/attributes.js"></script>
  <script src="./editor/scene/js/editor/inspector/components/index.js"></script>
  <script src="./editor/scene/js/editor/inspector/components/sprite.js"></script>
  <script src="./editor/scene/js/editor/inspector/components/css.js"></script>
  <script src="./editor/scene/js/editor/inspector/components/cubecarousel.js"></script>
  <script src="./editor/scene/js/editor/inspector/entity.js"></script>
  <script src="./editor/scene/js/editor/inspector/asset.js"></script>
  <script src="./editor/scene/js/editor/inspector/keyframe.js"></script>
  <script src="./editor/scene/js/editor/inspector/assets/index.js"></script>
  <script src="./editor/scene/js/editor/inspector/settings.js"></script>
  <script src="./editor/scene/js/editor/inspector/settings-panels/base.js"></script>
  <script src="./editor/scene/js/editor/inspector/settings-panels/editor.js"></script>
  <script src="./editor/scene/js/editor/inspector/settings-panels/rendering.js"></script>
  <script src="./editor/scene/js/editor/inspector/settings-panels/index.js"></script>
  
  
  <script src="./editor/scene/js/editor/toolbar/index.js"></script>
  <script src="./editor/scene/js/editor/toolbar/toolbar-logo.js"></script>
  <script src="./editor/scene/js/editor/pickers/picker-confirm.js"></script>
  <script src="./editor/scene/js/editor/pickers/picker-script-create.js"></script>
  <script src="./editor/scene/js/editor/pickers/picker-asset.js"></script>
  <script src="./editor/scene/js/editor/pickers/picker-code.js"></script>
  <script src="./editor/scene/js/editor/pickers/picker-curve.js"></script>
  <script src="./editor/scene/js/editor/pickers/picker-gradient.js"></script>
  <script src="./editor/scene/js/editor/pickers/picker-color.js"></script>
  
  <script src="./editor/scene/js/editor/attributes/attributes-asset.js"></script>
  
  <script src="./editor/scene/js/editor/pickers/timeline/picker-timeline.js"></script>
  <script src="./editor/scene/js/editor/pickers/timeline/MouseEventProxy.js"></script>
  <script src="./editor/scene/js/editor/pickers/timeline/track.js"></script>
  <script src="./editor/scene/js/editor/pickers/timeline/keyframes.js"></script>
  <script src="./editor/scene/js/editor/attributes/attributes-keyframe.js"></script>
  
  <script src="./editor/scene/js/editor/attributes/assets/attributes-asset-texture.js"></script>
  <script src="./editor/scene/js/editor/viewport/viewport-preview-particles.js"></script>
  <script src="./editor/scene/js/editor/viewport/viewport-preview-animation.js"></script>
  
  <script src="./editor/scene/js/editor/plugins.js"></script>
  

            `;

        var div = document.createElement("div");
        div.innerHTML = scripts;

        var scriptsCount = 0,
            _loadedScriptCount = 0;

        for (var i = 0; i < div.childNodes.length; i++) {
            if (div.childNodes[i].tagName === "SCRIPT") {
                scriptsCount++;

            }
        }


        for (var i = 0; i < div.childNodes.length; i++) {
            if (div.childNodes[i].tagName === "SCRIPT") {

                var _script = document.createElement("script");
                _script.async = false;
                _script.onload = allloaded;
                _script.src = div.childNodes[i].getAttribute("src");
                document.body.appendChild(_script);

            }
        }




        function allloaded() {
           
            _loadedScriptCount += 1;
            if (scriptsCount === _loadedScriptCount) {
                editor.emit("load");
                editor.emit('realtime:authenticated');
                editor.emit('app:authenticated');
                // editor.emit('start');
                callback();
            }
        }


    }

    var sortProjects = function (projects) {
        projects.sort(function (a, b) {
            if (a.modified < b.modified) {
                return 1;
            } else if (a.modified > b.modified) {
                return -1;
            }

            return 0;
        });
    };

    var refreshProjects = function () {
        dropdownMenu.open = false;
        destroyTooltips();
        destroyEvents();
        container.element.innerHTML = '';
        sortProjects(projects);
        container.hidden = projects.length === 0;

        projects.forEach(createProjectEntry);
    };

    // dropdown menu for each scene
    var dropdownMenu = ui.Menu.fromData({
        'scene-duplicate': {
            title: 'Duplicate Project',
            filter: function () {
                return editor.call('permissions:write');
            },
            select: function () {
                var name = dropdownProject.name;
                var regex = /^(.*?) ([0-9]+)$/;
                var numberPart = 2;
                var namePart = dropdownProject.name;
                var matches = dropdownProject.name.match(regex);
                if (matches && matches.length === 3) {
                    namePart = matches[1];
                    numberPart = parseInt(matches[2], 10);
                }

                // create duplicate scene name
                while (true) {
                    name = namePart + ' ' + numberPart;
                    var found = true;
                    for (var i = 0; i < scenes.length; i++) {
                        if (scenes[i].name === name) {
                            numberPart++;
                            found = false;
                            break;
                        }
                    }

                    if (found)
                        break;
                }

                editor.call('scenes:duplicate', dropdownProject.id, name);
            }
        },
        'scene-delete': {
            title: 'Delete Scene',
            filter: function () {
                return editor.call('permissions:write');
            },
            select: function () {
                editor.call('picker:confirm', 'Are you sure you want to delete this Scene?');
                editor.once('picker:confirm:yes', function () {
                    var id = dropdownProject.id;
                    onSceneDeleted(id);
                    editor.call('scenes:delete', id);
                });
            }
        }
    });

    editor.call('layout.root').append(dropdownMenu);

    var projects = [];
    var tooltips = [];
    var events = [];

    // on show
    overlay.on('show', function () {
        //toggleProgress(true);

        // load scenes
        editor.call('project:list', function (items) {
            // toggleProgress(false);
            projects = items;

            refreshProjects();
        });

    });



    // register new panel / menu option
    editor.method('picker:project:registerMenu', function (name, title, panel) {
        var menuItem = new ui.ListItem({
            text: name
        });
        menuItem.class.add(name.replace(' ', '-'));
        list.append(menuItem);

        menuItem.on('click', function () {
            select(name);
        });

        menuOptions[name] = {
            item: menuItem,
            title: title,
            panel: panel
        };
        panel.hidden = true;
        rightPanel.append(panel);
        return menuItem;
    });

    // register panel without a menu option
    editor.method('picker:project:registerPanel', function (name, title, panel) {
        // just do the regular registration but hide the menu
        var item = editor.call('picker:project:registerMenu', name, title, panel);
        item.class.add('hidden');
        return item;
    });

    // set default menu option
    editor.method('picker:project:setDefaultMenu', function (name) {
        defaultMenuOption = name;
    });

    // open popup
    editor.method('picker:project', function (option) {
        overlay.hidden = false;
        select(option || defaultMenuOption);
    });

    // close popup
    editor.method('picker:project:close', function () {
        overlay.hidden = true;
    });

    // ESC key should close popup
    var onKeyDown = function (e) {
        if (e.target && /(input)|(textarea)/i.test(e.target.tagName))
            return;

        if (e.keyCode === 27 && overlay.clickable) {
            overlay.hidden = true;
        }
    };

    // handle show
    overlay.on('show', function () {
        window.addEventListener('keydown', onKeyDown);

        projectImg.classList.remove('progress');
        projectImg.style.backgroundImage = 'url("' + (blankImage) + '")';

        if (editor.call('permissions:write')) {
            projectImg.classList.add('hover');
        } else {
            projectImg.classList.remove('hover');
        }

        // editor-blocking picker open
        editor.emit('picker:open', 'project');
    });

    // handle hide
    overlay.on('hide', function () {
        currentSelection = null;

        // unsubscribe from keydown
        window.removeEventListener('keydown', onKeyDown);

        // hide all panels
        for (var key in menuOptions) {
            menuOptions[key].panel.hidden = true;
            menuOptions[key].item.class.remove('active');
            menuOptions[key].item.class.remove('selected');
        }

        // editor-blocking picker closed
        editor.emit('picker:close', 'project');
    });

    // prevent user closing popup
    editor.method('picker:project:setClosable', function (closable) {
        btnClose.hidden = !closable;
        overlay.clickable = closable;
    });

    // disable / enable the state of the left panel
    editor.method('picker:project:toggleLeftPanel', function (enabled) {
        leftPanel.disabled = !enabled;
    });

    // disables / enables a menu option on the left
    editor.method('picker:project:toggleMenu', function (name, enabled) {
        menuOptions[name].item.hidden = !enabled;
        if (!enabled) {
            menuOptions[name].panel.hidden = true;
        }
    });

    // activate menu option
    var select = function (name) {
        if (!name) return;

        if (currentSelection === name)
            return;

        currentSelection = name;

        // if this is not a scene URL disallow closing the popup
        if (!config.project.id) {
            editor.call('picker:project:setClosable', false);
        } else {
            // reset closable state
            editor.call('picker:project:setClosable', true);
        }

        // hide all first
        for (var key in menuOptions) {
            menuOptions[key].item.class.remove('active');
            menuOptions[key].panel.hidden = true;
        }

        // show desired option
        menuOptions[name].item.class.add('active');
        menuOptions[name].panel.hidden = false;
        rightPanel.headerElementTitle.textContent = menuOptions[name].title;
        rightPanel.innerElement.scrollTop = 0;
    };

    // subscribe to project image
    editor.on('messenger:project.image', function (data) {

        projectImg.style.backgroundImage = 'url("' + (blankImage) + '")';
        projectImg.classList.remove('progress');
    });


    var destroyTooltips = function () {
        tooltips.forEach(function (tooltip) {
            tooltip.destroy();
        });
        tooltips = [];
    };

    var destroyEvents = function () {
        events.forEach(function (evt) {
            evt.unbind();
        });
        events = [];
    };


});