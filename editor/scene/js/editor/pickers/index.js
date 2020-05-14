













/* editor/pickers/version-control/picker-version-control-svg.js */
editor.once('load', function () {
    'use strict';

    // spinner svg
    editor.method('picker:versioncontrol:svg:spinner', function (size) {
        var spinner = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        spinner.classList.add('spin');
        spinner.setAttribute('width', size);
        spinner.setAttribute('height', size);
        spinner.setAttribute('x', 0);
        spinner.setAttribute('y', 0);
        spinner.setAttribute('viewBox', '0 0 64 64');
        spinner.innerHTML = '<g width="65" height="65"><path fill="#773417" d="M32,60 C47.463973,60 60,47.463973 60,32 C60,16.536027 47.463973,4 32,4 C16.536027,4 4,16.536027 4,32 C4,47.463973 16.536027,60 32,60 Z M32,64 C14.326888,64 0,49.673112 0,32 C0,14.326888 14.326888,0 32,0 C49.673112,0 64,14.326888 64,32 C64,49.673112 49.673112,64 32,64 Z"></path><path class="spin" fill="#FF6600" d="M62.3041668,42.3124142 C58.1809687,54.9535127 46.0037894,64 32,64 L32,60.0514995 C44.0345452,60.0514995 54.8533306,51.9951081 58.5660922,41.0051114 L62.3041668,42.3124142 Z"></path></g>';
        return spinner;
    });

    // completed svg
    editor.method('picker:versioncontrol:svg:completed', function (size) {
        var completed = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        completed.setAttribute('width', size);
        completed.setAttribute('height', size);
        completed.setAttribute('x', 0);
        completed.setAttribute('y', 0);
        completed.setAttribute('viewBox', '0 0 65 65');
        completed.innerHTML = '<defs><path id="playcanvas-spinner-complete-a" d="M55.6576027,9.34239734 C58.6394896,12.564759 60.9420008,16.1598026 62.5652053,20.127636 C64.1884099,24.0954693 65,28.2195494 65,32.5 C65,36.7804506 64.1884099,40.9045307 62.5652053,44.872364 C60.9420008,48.8401974 58.6394896,52.435241 55.6576027,55.6576027 C52.435241,58.6394896 48.8401974,60.9420008 44.872364,62.5652053 C40.9045307,64.1884099 36.7804506,65 32.5,65 C28.2195494,65 24.0954693,64.1884099 20.127636,62.5652053 C16.1598026,60.9420008 12.564759,58.6394896 9.34239734,55.6576027 C6.28836801,52.483336 3.96782148,48.9183513 2.38068812,44.9625416 C0.793554772,41.006732 0,36.852593 0,32.5 C0,28.147407 0.793554772,23.993268 2.38068812,20.0374584 C3.96782148,16.0816487 6.28836801,12.516664 9.34239734,9.34239734 C12.564759,6.36051043 16.1598026,4.05799924 20.127636,2.43479467 C24.0954693,0.811590108 28.2195494,0 32.5,0 C36.7804506,0 40.9045307,0.811590108 44.872364,2.43479467 C48.8401974,4.05799924 52.435241,6.36051043 55.6576027,9.34239734 Z M32.5,61.953125 C37.8388067,61.953125 42.7668619,60.6376936 47.2843137,58.0067913 C51.8017655,55.3758889 55.3758889,51.8017655 58.0067913,47.2843137 C60.6376936,42.7668619 61.953125,37.8388067 61.953125,32.5 C61.953125,27.1611933 60.6376936,22.2331381 58.0067913,17.7156863 C55.3758889,13.1982345 51.8017655,9.62411106 47.2843137,6.99320874 C42.7668619,4.36230643 37.8388067,3.046875 32.5,3.046875 C27.1611933,3.046875 22.2331381,4.36230643 17.7156863,6.99320874 C13.1982345,9.62411106 9.62411106,13.1982345 6.99320874,17.7156863 C4.36230643,22.2331381 3.046875,27.1611933 3.046875,32.5 C3.046875,37.8388067 4.36230643,42.7668619 6.99320874,47.2843137 C9.62411106,51.8017655 13.1982345,55.3758889 17.7156863,58.0067913 C22.2331381,60.6376936 27.1611933,61.953125 32.5,61.953125 Z M47.7580466,26.5843507 L28.063263,46.0627081 L16.0155383,33.9789123 L19.1424459,30.8520047 L28.063263,39.7728219 L44.3786418,23.4574431 L47.7580466,26.5843507 Z"/></defs><g fill="none" fill-rule="evenodd"><use fill="#F60" xlink:href="#playcanvas-spinner-complete-a"/></g>';
        return completed;
    });

    // error svg
    editor.method('picker:versioncontrol:svg:error', function (size) {
        var error = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        error.setAttribute('width', size);
        error.setAttribute('height', size);
        error.setAttribute('x', 0);
        error.setAttribute('y', 0);
        error.setAttribute('viewBox', '0 0 65 65');
        error.innerHTML = '<defs><path id="playcanvas-spinner-error-a" d="M55.6576027,9.34239734 C58.6394896,12.564759 60.9420008,16.1598026 62.5652053,20.127636 C64.1884099,24.0954693 65,28.2195494 65,32.5 C65,36.7804506 64.1884099,40.9045307 62.5652053,44.872364 C60.9420008,48.8401974 58.6394896,52.435241 55.6576027,55.6576027 C52.435241,58.6394896 48.8401974,60.9420008 44.872364,62.5652053 C40.9045307,64.1884099 36.7804506,65 32.5,65 C28.2195494,65 24.0954693,64.1884099 20.127636,62.5652053 C16.1598026,60.9420008 12.564759,58.6394896 9.34239734,55.6576027 C6.28836801,52.483336 3.96782148,48.9183513 2.38068812,44.9625416 C0.793554772,41.006732 0,36.852593 0,32.5 C0,28.147407 0.793554772,23.993268 2.38068812,20.0374584 C3.96782148,16.0816487 6.28836801,12.516664 9.34239734,9.34239734 C12.564759,6.36051043 16.1598026,4.05799924 20.127636,2.43479467 C24.0954693,0.811590108 28.2195494,0 32.5,0 C36.7804506,0 40.9045307,0.811590108 44.872364,2.43479467 C48.8401974,4.05799924 52.435241,6.36051043 55.6576027,9.34239734 Z M32.5,61.953125 C37.8388067,61.953125 42.7668619,60.6376936 47.2843137,58.0067913 C51.8017655,55.3758889 55.3758889,51.8017655 58.0067913,47.2843137 C60.6376936,42.7668619 61.953125,37.8388067 61.953125,32.5 C61.953125,27.1611933 60.6376936,22.2331381 58.0067913,17.7156863 C55.3758889,13.1982345 51.8017655,9.62411106 47.2843137,6.99320874 C42.7668619,4.36230643 37.8388067,3.046875 32.5,3.046875 C27.1611933,3.046875 22.2331381,4.36230643 17.7156863,6.99320874 C13.1982345,9.62411106 9.62411106,13.1982345 6.99320874,17.7156863 C4.36230643,22.2331381 3.046875,27.1611933 3.046875,32.5 C3.046875,37.8388067 4.36230643,42.7668619 6.99320874,47.2843137 C9.62411106,51.8017655 13.1982345,55.3758889 17.7156863,58.0067913 C22.2331381,60.6376936 27.1611933,61.953125 32.5,61.953125 Z M35.5816525,32.2391268 L43.7840074,40.4684849 L40.6947836,43.605265 L32.3920037,35.3937245 L24.0892238,43.605265 L21,40.4684849 L29.2023549,32.2391268 L21,24.1269076 L24.3794048,21 L32.3920037,29.0389773 L40.4046026,21 L43.7840074,24.1269076 L35.5816525,32.2391268 Z"/></defs><g fill="none" fill-rule="evenodd"><use fill="#fb222f" xlink:href="#playcanvas-spinner-error-a"/></g>';
        return error;
    });
});


/* editor/pickers/version-control/picker-version-control-common.js */
"use strict";

/**
 * Represents a box widget that is commonly used in version control side panels
 * @param {Object} args Various options for the widget
 * @param {String} [args.header] The box title
 * @param {String} [args.headerNote] The text of the note next to the header
 * @param {Boolean} [args.discardChanges] If true then this box will also contain a panel to discard un-checkpointed changes
 * @param {String} [args.discardChangesHelp] The text of the help tooltip in the discard changes panel
 * @param {Boolean} [args.noIcon] If true the box header will not have a top left icon
 */
var VersionControlSidePanelBox = function (args) {
    Events.call(this);

    // main box panel
    this.panel = new ui.Panel(args && args.header || ' ');
    this.panel.headerElementTitle.classList.add('selectable');

    if (args && args.noIcon) {
        this.panel.class.add('no-icon');
    }

    var panel = this.panel;
    panel.flexGrow = 1;
    panel.class.add('version-control-side-panel-box');

    // holds child panels appended to the box with the `append` method
    this.children = [];

    // add little note on the right of the header
    if (args && args.headerNote) {
        var labelHeader = new ui.Label({
            text: args.headerNote
        });
        labelHeader.class.add('header-note');
        panel.headerElement.appendChild(labelHeader.element);
    }

    // add discard your changes panel
    if (args && args.discardChanges) {
        var panelDiscard = new ui.Panel();
        this.panelDiscard = panelDiscard;
        panelDiscard.class.add('discard');
        panelDiscard.flexGrow = 1;
        var label = new ui.Label({
            text: 'Discard un-checkpointed changes?'
        });
        panelDiscard.append(label);

        var checkboxDiscardChanges = new ui.Checkbox();
        this.checkboxDiscardChanges = checkboxDiscardChanges;
        checkboxDiscardChanges.class.add('tick');
        panelDiscard.append(checkboxDiscardChanges);

        checkboxDiscardChanges.on('change', function (value) {
            this.emit('discardChanges', value);
        }.bind(this));

        // add little help icon
        var labelDiscardHelp = new ui.Label({
            text: '&#57656;',
            unsafe: true
        });
        labelDiscardHelp.class.add('help');
        panelDiscard.append(labelDiscardHelp);

        if (args.discardChangesHelp) {
            var tooltip = Tooltip.attach({
                target: labelDiscardHelp.element,
                text: args.discardChangesHelp,
                align: 'top',
                root: editor.call('layout.root')
            });
            tooltip.class.add('discard-changes-tooltip');
        }
    }
};

VersionControlSidePanelBox.prototype = Object.create(Events.prototype);

/**
 * Adds specified panel to the box
 * @param {ui.Panel} panel The panel
 */
VersionControlSidePanelBox.prototype.append = function (panel) {
    // make sure we remove the discard panel first
    // because it's meant to be added to the end
    if (this.panelDiscard) {
        this.panel.remove(this.panelDiscard);
    }

    this.panel.append(panel);
    this.children.push(panel);

    // add discard panel after the content
    if (this.panelDiscard) {
        this.panel.append(this.panelDiscard);
    }
};

/**
 * Creates a panel to show info for the specified checkpoint and adds this panel to the box
 * @param {Object} checkpoint The checkpoint
 */
VersionControlSidePanelBox.prototype.setCheckpoint = function (checkpoint) {
    // create panel to show checkpoint info
    var panel = editor.call('picker:versioncontrol:widget:checkpoint', checkpoint);
    this.append(panel);

    // this needs to be called to update the 'read more' button
    panel.onAddedToDom();
};

/**
 * Clears the contents of the box
 */
VersionControlSidePanelBox.prototype.clear = function () {
    var panel = this.panel;

    if (this.panelDiscard) {
        panel.remove(this.panelDiscard);
        this.checkboxDiscardChanges.value = false;
    }

    this.children.forEach(function (child) {
        child.destroy();
    });
};

/**
 * Gets / sets the header text of the box
 */
Object.defineProperty(VersionControlSidePanelBox.prototype, 'header', {
    get: function () {
        return this.panel.header;
    },
    set: function (value) {
        this.panel.header = value;
    }
});

window.ui.VersionControlSidePanelBox = VersionControlSidePanelBox;


/* editor/pickers/version-control/picker-version-control-side-panel.js */
editor.once('load', function () {
    'use strict';

    var sidePanelIndex = 1;

    editor.method('picker:versioncontrol:createSidePanel', function (args) {
        var panel = new ui.Panel();
        panel.class.add('side-panel-widget');

        var panelTop = new ui.Panel();
        panelTop.class.add('top');
        panel.append(panelTop);

        var labelTitle = new ui.Label({
            text: args.title || ''
        });
        labelTitle.renderChanges = false;
        labelTitle.class.add('title', 'selectable');
        panelTop.append(labelTitle);

        var labelNote = new ui.Label({
            text: args.note || ''
        });
        labelNote.renderChanges = false;
        labelNote.class.add('note', 'selectable');
        panelTop.append(labelNote);

        var panelMain;
        if (args.mainContents) {
            panelMain = new ui.Panel();
            panel.append(panelMain);
            panelMain.class.add('main');
            panelMain.flex = true;

            for (var i = 0; i < args.mainContents.length; i++) {
                panelMain.append(args.mainContents[i]);
            }
        }

        var panelButtons = new ui.Panel();
        panelButtons.class.add('buttons');
        panel.append(panelButtons);

        var getButtonOption = function (button, name) {
            return args.buttons && args.buttons[button] && args.buttons[button][name];
        };

        var btnConfirm = new ui.Button({
            text: getButtonOption('confirm', 'text') || 'Confirm'
        });
        if (getButtonOption('confirm', 'highlighted')) {
            btnConfirm.class.add('highlighted');
        }
        panelButtons.append(btnConfirm);

        btnConfirm.on('click', function () {
            var onClick = getButtonOption('confirm', 'onClick');
            if (onClick) {
                onClick();
            } else {
                panel.emit('confirm');
            }
        });

        var btnCancel = new ui.Button({
            text: getButtonOption('cancel', 'text') || 'Cancel'
        });
        if (getButtonOption('cancel', 'highlighted')) {
            btnCancel.class.add('highlighted');
        }
        panelButtons.append(btnCancel);
        btnCancel.on('click', function () {
            var onClick = getButtonOption('cancel', 'onClick');
            if (onClick) {
                onClick();
            } else {
                panel.emit('cancel');
            }
        });

        panel.labelTitle = labelTitle;
        panel.labelNote = labelNote;
        panel.panelMain = panelMain;
        panel.buttonCancel = btnCancel;
        panel.buttonConfirm = btnConfirm;

        var enterHotkeyAction = 'version-control-enter-' + sidePanelIndex++;

        panel.on('show', function () {
            // make main panel cover all the height between the top and bottom sections
            if (panelMain) {
                panelMain.element.style.height = 'calc(100% - ' + (panelTop.element.offsetHeight + panelButtons.element.offsetHeight) + 'px)';
            }

            // Register Enter hotkey to click the highlighted button
            editor.call('hotkey:register', enterHotkeyAction, {
                key: 'enter',
                callback: function (e) {
                    if (btnCancel.class.contains('highlighted')) {
                        if (btnCancel.disabled) return;
                        btnCancel.emit('click');
                    } else if (btnConfirm.class.contains('highlighted')) {
                        if (btnConfirm.disabled) return;
                        btnConfirm.emit('click');
                    }
                }
            });
        });

        panel.on('hide', function () {
            // if we remove during the 'hide' event it will throw an error in the hotkey lib
            requestAnimationFrame(function () {
                editor.call('hotkey:unregister', enterHotkeyAction);
            });
        });

        return panel;
    });
});


/* editor/pickers/version-control/picker-version-control-progress.js */
editor.once('load', function () {
    'use strict';

    // this is true if ANY progress widget is currently
    // showing a spinner. This is so that we don't show
    // version control overlays on top of these windows if any widget here is showing a spinner
    // because it looks bad.
    var showingProgress = false;
    var showingError = false;

    editor.method('picker:versioncontrol:isProgressWidgetVisible', function () {
        return showingProgress;
    });

    editor.method('picker:versioncontrol:isErrorWidgetVisible', function () {
        return showingError;
    });

    editor.method('picker:versioncontrol:createProgressWidget', function (args) {
        var panel = new ui.Panel();
        panel.class.add('progress-widget');

        // message
        var labelMessage = new ui.Label({
            text: args.progressText
        });
        labelMessage.renderChanges = false;
        panel.append(labelMessage);

        // note
        var labelNote = new ui.Label();
        labelNote.class.add('note');
        labelNote.renderChanges = false;
        panel.append(labelNote);

        // spinner svg
        var spinner = editor.call('picker:versioncontrol:svg:spinner', 65);
        panel.innerElement.appendChild(spinner);

        // completed svg
        var completed = editor.call('picker:versioncontrol:svg:completed', 65);
        panel.innerElement.appendChild(completed);
        completed.classList.add('hidden');

        // error svg
        var error = editor.call('picker:versioncontrol:svg:error', 65);
        panel.innerElement.appendChild(error);
        error.classList.add('hidden');

        // Call this when the asynchronous action is finished
        panel.finish = function (err) {
            if (err) {
                panel.setMessage(args.errorText);
                panel.setNote(err);
                error.classList.remove('hidden');
                showingError = true;
            } else {
                panel.setMessage(args.finishText);
                panel.setNote('');
                completed.classList.remove('hidden');
                showingError = false;
            }
            spinner.classList.add('hidden');
        };

        panel.setMessage = function (text) {
            labelMessage.text = text;
        };

        panel.setNote = function (text) {
            labelNote.text = text;
            labelNote.hidden = !text;
        };

        panel.on('show', function () {
            showingProgress = true;
            panel.parent.class.add('align-center');
        });

        // restore panel contents when the panel is hidden
        panel.on('hide', function () {
            if (panel.parent) {
                panel.parent.class.remove('align-center');
            }

            labelMessage.text = args.progressText;
            labelNote.hidden = true;
            completed.classList.add('hidden');
            error.classList.add('hidden');
            spinner.classList.remove('hidden');
            showingProgress = false;
            showingError = false;
        });

        return panel;
    });
});


/* editor/pickers/version-control/picker-version-control-create-checkpoint.js */
editor.once('load', function () {
    'use strict';

    var labelDesc = new ui.Label({
        text: 'Description:'
    });
    labelDesc.class.add('small');

    var fieldDescription = new ui.TextAreaField({
        blurOnEnter: false
    });
    fieldDescription.renderChanges = false;
    fieldDescription.keyChange = true;
    fieldDescription.flexGrow = 1;

    var create = function () {
        panel.emit('confirm', {
            description: fieldDescription.value.trim()
        });
    };

    fieldDescription.elementInput.addEventListener('keydown', function (e) {
        if (e.keyCode === 13 && (e.ctrlKey || e.metaKey)) {
            if (! panel.buttonConfirm.disabled) {
                create();
            }
        }
    });

    var panel = editor.call('picker:versioncontrol:createSidePanel', {
        title: 'Create a new checkpoint',
        note: 'A new checkpoint will take a snapshot of the current branch which you can revert to at a later date.',
        mainContents: [labelDesc, fieldDescription],
        buttons: {
            confirm: {
                highlighted: true,
                text: 'Create Checkpoint',
                onClick: create
            }
        }
    });
    panel.class.add('create-checkpoint');

    panel.buttonConfirm.disabled = true;

    fieldDescription.on('change', function (value) {
        panel.buttonConfirm.disabled = !value.trim();
    });

    panel.on('hide', function () {
        fieldDescription.value = '';
        panel.buttonConfirm.disabled = true;
    });

    panel.on('show', function () {
        setTimeout(function () {
            fieldDescription.focus();
        });
    });

    editor.method('picker:versioncontrol:widget:createCheckpoint', function () {
        return panel;
    });
});


/* editor/pickers/version-control/picker-version-control-restore-checkpoint.js */
editor.once('load', function () {
    'use strict';

    var boxRestore = new ui.VersionControlSidePanelBox({
        header: 'RESTORING TO',
        discardChanges: true,
        discardChangesHelp: 'If you choose not to discard your changes then a checkpoint will be created first, before restoring.'
    });

    var panel = editor.call('picker:versioncontrol:createSidePanel', {
        mainContents: [boxRestore.panel],
        buttons: {
            cancel: {
                highlighted: true
            },
            confirm: {
                text: 'Restore Checkpoint'
            }
        }
    });
    panel.class.add('restore-checkpoint');

    editor.method('picker:versioncontrol:widget:restoreCheckpoint', function () {
        return panel;
    });

    panel.setCheckpoint = function (checkpoint) {
        panel.checkpoint = checkpoint;
        boxRestore.setCheckpoint(checkpoint);
        panel.labelTitle.text = 'Restore checkpoint "' + checkpoint.id.substring(0, 7) + '" ?';
    };

    boxRestore.on('discardChanges', function (value) {
        panel.discardChanges = value;
    });

    panel.on('hide', function () {
        boxRestore.clear();
    });
});


/* editor/pickers/version-control/picker-version-control-create-branch.js */
editor.once('load', function () {
    'use strict';

    var boxFrom = new ui.VersionControlSidePanelBox({
        headerNote: 'Branching from'
    });

    var labelIcon = new ui.Label({
        text: '&#58265;',
        unsafe: true
    });
    labelIcon.class.add('branch-icon');

    var boxNewBranch = new ui.VersionControlSidePanelBox({
        headerNote: 'New branch'
    });

    var panelName = new ui.Panel();
    panelName.flex = true;
    var label = new ui.Label({
        text: 'New Branch Name'
    });
    label.class.add('left');
    panelName.append(label);
    panelName.style.padding = '10px';

    var fieldBranchName = new ui.TextField();
    fieldBranchName.flexGrow = 1;
    fieldBranchName.renderChanges = false;
    fieldBranchName.keyChange = true;
    panelName.append(fieldBranchName);

    // blur on enter
    fieldBranchName.elementInput.addEventListener('keydown', function (e) {
        if (e.keyCode === 13) {
            this.blur();
            createBranch();
        }
    });

    boxNewBranch.append(panelName);

    var panel = editor.call('picker:versioncontrol:createSidePanel', {
        title: 'Create a new branch',
        note: 'A new branch will create an independent line of development where you can work in isolation from other team members.',
        mainContents: [boxFrom.panel, labelIcon, boxNewBranch.panel],
        buttons: {
            confirm: {
                text: 'Create New Branch',
                highlighted: true,
                onClick: function () {
                    createBranch();
                }
            }
        }
    });
    panel.class.add('create-branch');

    var createBranch = function () {
        if (panel.buttonConfirm.disabled) return;
        panel.emit('confirm', {
            name: fieldBranchName.value
        });
    };

    panel.on('hide', function () {
        boxFrom.clear();
        boxNewBranch.header = ' ';
        fieldBranchName.value = '';
        panel.buttonConfirm.disabled = true;
    });

    panel.on('show', function () {
        panel.checkpoint = null;
        panel.sourceBranch = null;
        fieldBranchName.focus();
    });

    fieldBranchName.on('change', function (value) {
        panel.buttonConfirm.disabled = !value;
        boxNewBranch.header = value || ' ';
    });

    panel.setSourceBranch = function (branch) {
        panel.sourceBranch = branch;
        boxFrom.header = branch.name;
    };

    panel.setCheckpoint = function (checkpoint) {
        panel.checkpoint = checkpoint;
        boxFrom.setCheckpoint(checkpoint);
    };

    editor.method('picker:versioncontrol:widget:createBranch', function () {
        return panel;
    });
});


/* editor/pickers/version-control/picker-version-control-close-branch.js */
editor.once('load', function () {
    'use strict';

    var boxBranch = new ui.VersionControlSidePanelBox({

        discardChanges: true,
        discardChangesHelp: 'If you choose to not discard your changes, a checkpoint will be created before closing the branch.'
    });

    var labelIcon = new ui.Label({
        text: '&#57686;',
        unsafe: true
    });
    labelIcon.class.add('close-icon');

    var boxConfirm = new ui.VersionControlSidePanelBox({
        header: 'ARE YOU SURE?',
        noIcon: true,
    });

    var panelTypeName = new ui.Panel();
    panelTypeName.flex = true;
    panelTypeName.style.padding = '10px';

    var label = new ui.Label({
        text: 'Type branch name to confirm:'
    });
    label.class.add('small');
    panelTypeName.append(label);

    var fieldName = new ui.TextField();
    fieldName.renderChanges = false;
    fieldName.flexGrow = 1;
    fieldName.keyChange = true;
    panelTypeName.append(fieldName);

    fieldName.elementInput.addEventListener('keydown', function (e) {
        if (e.keyCode === 13 && ! panel.buttonConfirm.disabled) {
            panel.emit('confirm');
        }
    });

    boxConfirm.append(panelTypeName);

    var checkpointRequest = null;

    var panel = editor.call('picker:versioncontrol:createSidePanel', {
        title: 'Close branch?',
        note: 'You will no longer be able to work on this branch unless you re-open it again.',
        mainContents: [boxConfirm.panel, labelIcon, boxBranch.panel],
        buttons: {
            confirm: {
                highlighted: true,
                text: 'Close Branch'
            }
        }
    });
    panel.class.add('close-branch');

    panel.buttonConfirm.disabled = true;
    fieldName.on('change', function () {
        if (! panel.branch) return;

        panel.buttonConfirm.disabled = fieldName.value.toLowerCase() !== panel.branch.name.toLowerCase();
    });

    boxBranch.on('discardChanges', function (value) {
        panel.discardChanges = value;
    });

    panel.on('show', function () {
        fieldName.focus();
    });

    panel.on('hide', function () {
        fieldName.value = '';
        panel.buttonConfirm.disabled = true;
        boxBranch.clear();
        if (checkpointRequest) {
            checkpointRequest.abort();
            checkpointRequest = null;
        }
    });

    panel.setBranch = function (branch) {
        panel.branch = branch;
        boxBranch.header = branch.name;

        if (checkpointRequest) {
            checkpointRequest.abort();
        }

        checkpointRequest = editor.call('checkpoints:get', branch.latestCheckpointId, function (err, checkpoint) {
            checkpointRequest = null;
            boxBranch.setCheckpoint(checkpoint);
        });
    };

    editor.method('picker:versioncontrol:widget:closeBranch', function () {
        return panel;
    });
});


/* editor/pickers/version-control/picker-version-control-merge-branches.js */
editor.once('load', function () {
    'use strict';

    var boxFrom = new ui.VersionControlSidePanelBox({
        headerNote: 'Merge from'
    });

    var labelArrow = new ui.Label({
        text: '&#57704;',
        unsafe: true
    });
    labelArrow.class.add('arrow');

    var boxInto = new ui.VersionControlSidePanelBox({
        headerNote: 'Merge to',
        discardChanges: true,
        discardChangesHelp: 'If you choose not to discard your changes then a new checkpoint will be created before merging.'
    });

    // holds pending requests to get checkpoints
    var checkpointRequests = [];

    var panel = editor.call('picker:versioncontrol:createSidePanel', {
        title: 'Merge branches',
        note: 'Beginning the merge process will lock other active users\' sessions in the current branch.',
        mainContents: [boxFrom.panel, labelArrow, boxInto.panel],
        buttons: {
            cancel: {
                highlighted: true
            },
            confirm: {
                text: 'START MERGE'
            }
        }
    });
    panel.class.add('merge-branches');

    boxInto.on('discardChanges', function (value) {
        panel.discardChanges = value;
    });

    panel.on('hide', function () {
        panel.setSourceBranch(null);
        panel.setDestinationBranch(null);

        boxFrom.clear();
        boxInto.clear();

        // abort all pending requests
        checkpointRequests.forEach(function (request) {
            request.abort();
        });
        checkpointRequests.length = 0;
    });

    var setBranchInfo = function (branch, isSourceBranch) {
        var panelField = isSourceBranch ? 'sourceBranch' : 'destinationBranch';
        panel[panelField] = branch;

        if (! branch) return;

        var box = isSourceBranch ? boxFrom : boxInto;
        box.header = branch.name;

        // get checkpoint from server
        var request = editor.call('checkpoints:get', branch.latestCheckpointId, function (err, checkpoint) {
            // remove request from pending array
            var idx = checkpointRequests.indexOf(request);
            checkpointRequests.splice(idx, 1);

            box.setCheckpoint(checkpoint);
        });

        // add the request to the pending array
        checkpointRequests.push(request);
    };

    panel.setSourceBranch = function (sourceBranch) {
        setBranchInfo(sourceBranch, true);
    };
    panel.setDestinationBranch = function (destinationBranch) {
        setBranchInfo(destinationBranch, false);
    };

    editor.method('picker:versioncontrol:widget:mergeBranches', function () {
        return panel;
    });
});


/* editor/pickers/version-control/picker-version-control-checkpoints.js */
editor.once('load', function () {
    'use strict';

    var events = [];

    var projectUserSettings = editor.call('settings:projectUser');

    var diffMode = false;

    var panel = new ui.Panel();
    panel.class.add('checkpoints-container');

    // checkpoints top
    var panelCheckpointsTop = new ui.Panel();
    panelCheckpointsTop.class.add('checkpoints-top');
    panel.append(panelCheckpointsTop);

    // current branch history
    var labelBranchName = new ui.Label({
        text: 'Branch'
    });
    labelBranchName.renderChanges = false;
    labelBranchName.class.add('branch-history', 'selectable');
    panelCheckpointsTop.append(labelBranchName);

    var labelBranchCheckpoints = new ui.Label({
        text: 'Checkpoints'
    });
    labelBranchCheckpoints.renderChanges = false;
    labelBranchCheckpoints.class.add('info');
    panelCheckpointsTop.append(labelBranchCheckpoints);

    var panelBranchActions = new ui.Panel();
    panelBranchActions.class.add('branch-actions', 'flex');
    panel.append(panelBranchActions);

    // add branch to favorites
    var btnFavorite = new ui.Button({
        text: 'Favorite'
    });
    btnFavorite.class.add('icon', 'favorite');
    panelBranchActions.append(btnFavorite);

    // open diff checkpoints panel
    var btnDiff = new ui.Button({
        text: 'View Diff'
    });
    btnDiff.class.add('icon', 'diff');
    panelBranchActions.append(btnDiff);

    // new checkpoint button
    var btnNewCheckpoint = new ui.Button({
        text: 'Checkpoint'
    });
    btnNewCheckpoint.class.add('icon', 'create');
    panelBranchActions.append(btnNewCheckpoint);

    var toggleTopButtons = function () {
        btnFavorite.disabled = ! panel.branch || panel.branch.closed || ! editor.call('permissions:write');
        btnNewCheckpoint.disabled = ! editor.call('permissions:write') || ! panel.branch || panel.branch.id !== config.self.branch.id;
    };

    toggleTopButtons();

    // checkpoints main panel
    var panelCheckpoints = new ui.Panel();
    panelCheckpoints.class.add('checkpoints');
    panel.append(panelCheckpoints);

    // checkpoints list
    var listCheckpoints = new ui.List();
    panelCheckpoints.append(listCheckpoints);

    // used to group displayed checkpoints into days
    var lastCheckpointDateDisplayed = null;

    // load more checkpoints list item
    var listItemLoadMore = new ui.ListItem();
    listItemLoadMore.class.add('load-more');
    listItemLoadMore.hidden = true;
    var btnLoadMore = new ui.Button({
        text: 'LOAD MORE'
    });
    listItemLoadMore.element.appendChild(btnLoadMore.element);

    // checkpoints for which context menu is currenty open
    var currentCheckpoint = null;

    var currentCheckpointListRequest = null;
    var checkpointsSkip = null;

    // checkpoints context menu
    var menuCheckpoints = new ui.Menu();
    menuCheckpoints.class.add('version-control');

    // restore checkpoint
    var menuCheckpointsRestore = new ui.MenuItem({
        text: 'Restore',
        value: 'restore-checkpoint'
    });
    menuCheckpoints.append(menuCheckpointsRestore);

    // branch from checkpoint
    var menuCheckpointsBranch = new ui.MenuItem({
        text: 'New Branch',
        value: 'new-branch'
    });
    menuCheckpoints.append(menuCheckpointsBranch);

    editor.call('layout.root').append(menuCheckpoints);

    // loading checkpoints icon
    var spinner = editor.call('picker:versioncontrol:svg:spinner', 64);
    spinner.classList.add('hidden');
    spinner.classList.add('spinner');
    panelCheckpoints.innerElement.appendChild(spinner);

    // Set the current branch of the panel
    panel.setBranch = function (branch) {
        // make sure we don't have any running checkpoint:list requests
        currentCheckpointListRequest = null;

        labelBranchName.text = branch && branch.name ? branch.name : 'Branch';
        panel.branch = branch;

        panel.updateFavorite();
        panel.setCheckpoints(null);
        panel.toggleLoadMore(false);

        toggleTopButtons();
    };

    panel.updateFavorite = function () {
      panel.branchIsFavorite = panel.branch && panel.branch.id && projectUserSettings.get('favoriteBranches').includes(panel.branch.id);
      btnFavorite.text = panel.branchIsFavorite ? 'Unfavorite' : 'Favorite';
    }

    // Set the checkpoints to be displayed
    panel.setCheckpoints = function (checkpoints) {
        listCheckpoints.clear();
        panelCheckpoints.element.scrollTop = 0;
        lastCheckpointDateDisplayed = null;

        var length = checkpoints && checkpoints.length;
        if (length && panel.branch && !panel.branch.closed) {
            createCurrentStateUi();
        }

        // create checkpoints
        panel.checkpoints = checkpoints;
        if (length) {
            checkpoints.forEach(createCheckpointListItem);
            checkpointsSkip = checkpoints[checkpoints.length - 1].id;
        } else {
            checkpointsSkip = null;
        }


        listCheckpoints.append(listItemLoadMore);
    };

    // Show button to load more checkpoints or not
    panel.toggleLoadMore = function (toggle) {
        listItemLoadMore.hidden = !toggle;
    };

    panel.loadCheckpoints = function () {
        btnLoadMore.disabled = true;
        btnLoadMore.text = 'LOADING...';

        var params = {
            branch: panel.branch.id,
            limit: 20
        };

        if (checkpointsSkip) {
            params.skip = checkpointsSkip;
        } else {
            // hide list of checkpoints and show spinner
            listCheckpoints.hidden = true;
            spinner.classList.remove('hidden');
        }

        // list checkpoints but make sure in the response
        // that the results are from this request and not another
        // Happens sometimes when this request takes a long time
        var request = editor.call('checkpoints:list', params, function (err, data) {
            if (request !== currentCheckpointListRequest || panel.hidden || panel.parent.hidden) {
                return;
            }

            btnLoadMore.disabled = false;
            btnLoadMore.text = 'LOAD MORE';

            // show list of checkpoints and hide spinner
            listCheckpoints.hidden = false;
            spinner.classList.add('hidden');

            currentCheckpointListRequest = null;

            if (err) {
                return console.error(err);
            }

            if (params.skip) {
                data.result = panel.checkpoints.concat(data.result);
            }

            panel.setCheckpoints(data.result);
            panel.toggleLoadMore(data.pagination.hasMore);
        });

        currentCheckpointListRequest = request;
    };

    var createCheckpointWidget = function (checkpoint) {
        var panelWidget = new ui.Panel();
        panelWidget.class.add('checkpoint-widget');
        panelWidget.flex = true;

        var imgUser = new Image();
        imgUser.src = '/api/users/' + checkpoint.user.id + '/thumbnail?size=28';
        imgUser.classList.add('noSelect');
        panelWidget.append(imgUser);

        var panelInfo = new ui.Panel();
        panelInfo.class.add('info');
        panelInfo.flex = true;
        panelWidget.append(panelInfo);

        var panelTopRow = new ui.Panel();
        panelTopRow.flexGrow = 1;
        panelTopRow.class.add('top-row');
        panelInfo.append(panelTopRow);

        var descWithoutNewLine = checkpoint.description;
        var newLineIndex = descWithoutNewLine.indexOf('\n');
        if (newLineIndex >= 0) {
            descWithoutNewLine = descWithoutNewLine.substring(0, newLineIndex);
        }
        var labelDesc = new ui.Label({
            text: descWithoutNewLine
        });
        labelDesc.renderChanges = false;
        labelDesc.class.add('desc', 'selectable');
        panelTopRow.append(labelDesc);

        var btnMore = new ui.Button({
            text: '...read more'
        });
        btnMore.on('click', function () {
            if (labelDesc.class.contains('more')) {
                labelDesc.class.remove('more');
                labelDesc.text = descWithoutNewLine;
                labelDesc.style.whiteSpace = '';
                btnMore.text = '...read more';
            } else {
                labelDesc.class.add('more');
                labelDesc.text = checkpoint.description;
                labelDesc.style.whiteSpace = 'pre-wrap';
                btnMore.text = '...read less';
            }
        });

        panelTopRow.append(btnMore);

        var panelBottomRow = new ui.Panel();
        panelBottomRow.flexGrow = 1;
        panelBottomRow.class.add('bottom-row');
        panelInfo.append(panelBottomRow);

        var labelInfo = new ui.Label({
            text: editor.call('datetime:convert', checkpoint.createdAt) +
                  ' - ' +
                  checkpoint.id.substring(0, 7) +
                  (checkpoint.user.fullName ? ' by ' + checkpoint.user.fullName : '')
        });
        labelInfo.class.add('info', 'selectable');
        panelBottomRow.append(labelInfo);


        // hide more button if necessary - do this here because the element
        // must exist in the DOM before scrollWidth / clientWidth are available,
        // Users of this widget need to call this function once the panel has been added to the DOM
        panelWidget.onAddedToDom = function () {
            btnMore.hidden = labelDesc.element.scrollWidth <= labelDesc.element.clientWidth && newLineIndex < 0;
        };

        return panelWidget;
    };

    var createCheckpointSectionHeader = function (title) {
        var header = document.createElement('div');
        header.classList.add('date');
        header.classList.add('selectable');
        header.textContent = title;
        listCheckpoints.innerElement.appendChild(header);
        return header;
    };

    var createCheckpointListItem = function (checkpoint) {
        // add current date if necessary
        var date = (new Date(checkpoint.createdAt)).toDateString();
        if (lastCheckpointDateDisplayed !== date) {
            lastCheckpointDateDisplayed = date;

            if (lastCheckpointDateDisplayed === (new Date()).toDateString()) {
                createCheckpointSectionHeader('Today');
            } else {
                var parts = lastCheckpointDateDisplayed.split(' ');
                createCheckpointSectionHeader(parts[0] + ', ' + parts[1] + ' ' + parts[2] + ', ' + parts[3]);
            }
        }

        var item = new ui.ListItem();
        item.element.id = 'checkpoint-' + checkpoint.id;

        var panelListItem = createCheckpointWidget(checkpoint);
        item.element.appendChild(panelListItem.element);

        // dropdown
        var dropdown = new ui.Button({
            text: '&#57689;'
        });
        dropdown.class.add('dropdown');
        panelListItem.append(dropdown);

        if (! editor.call('permissions:write') || diffMode) {
            dropdown.hidden = true;
        }

        dropdown.on('click', function (e) {
            e.stopPropagation();

            currentCheckpoint = checkpoint;

            dropdown.class.add('clicked');
            dropdown.element.innerHTML = '&#57687;';

            menuCheckpoints.open = true;
            var rect = dropdown.element.getBoundingClientRect();
            menuCheckpoints.position(rect.right - menuCheckpoints.innerElement.clientWidth, rect.bottom);
        });

        // select
        var checkboxSelect = new ui.Checkbox();
        checkboxSelect.class.add('tick');
        panelListItem.append(checkboxSelect);
        checkboxSelect.value = editor.call('picker:versioncontrol:widget:diffCheckpoints:isCheckpointSelected', panel.branch, checkpoint);

        var suppressCheckboxEvents = false;
        checkboxSelect.on('change', function (value) {
            if (suppressCheckboxEvents) return;
            if (value) {
                editor.emit('checkpoint:diff:select', panel.branch, checkpoint);
            } else {
                editor.emit('checkpoint:diff:deselect', panel.branch, checkpoint);
            }
        });

        events.push(editor.on('checkpoint:diff:deselect', function (deselectedBranch, deselectedCheckpoint) {
            if (deselectedCheckpoint && deselectedCheckpoint.id === checkpoint.id) {
                suppressCheckboxEvents = true;
                checkboxSelect.value = false;
                suppressCheckboxEvents = false;
            }
        }));

        listCheckpoints.append(item);

        if (!panelCheckpoints.hidden) {
            panelListItem.onAddedToDom();
        }
    };

    // Creates a list item for the current state visible only in diffMode
    var createCurrentStateListItem = function () {
        var item = new ui.ListItem();
        var panelItem = new ui.Panel();
        // panelItem.class.add('checkpoint-widget');
        panelItem.flex = true;

        var label = new ui.Label({
            text: 'Changes made since the last checkpoint'
        });
        panelItem.append(label);

        // select
        var checkboxSelect = new ui.Checkbox();
        checkboxSelect.class.add('tick');
        panelItem.append(checkboxSelect);
        checkboxSelect.value = editor.call('picker:versioncontrol:widget:diffCheckpoints:isCheckpointSelected', panel.branch, null);

        var suppressCheckboxEvents = false;
        checkboxSelect.on('change', function (value) {
            if (suppressCheckboxEvents) return;
            if (value) {
                editor.emit('checkpoint:diff:select', panel.branch, null);
            } else {
                editor.emit('checkpoint:diff:deselect', panel.branch, null);
            }
        });

        events.push(editor.on('checkpoint:diff:deselect', function (deselectedBranch, deselectedCheckpoint) {
            if (!deselectedCheckpoint && deselectedBranch && deselectedBranch.id === panel.branch.id) {
                suppressCheckboxEvents = true;
                checkboxSelect.value = false;
                suppressCheckboxEvents = false;
            }
        }));

        listCheckpoints.append(item);

        item.element.appendChild(panelItem.element);

        return item;
    };

    var createCurrentStateUi = function() {
        var currentStateHeader = createCheckpointSectionHeader('CURRENT STATE');
        currentStateHeader.classList.add('current-state');
        var currentStateListItem = createCurrentStateListItem();
        currentStateListItem.class.add('current-state');
    }

    btnFavorite.on('click', function() {
      if (!panel.branch) return;
      if (panel.branchIsFavorite) {
        var index = projectUserSettings.get('favoriteBranches').indexOf(panel.branch.id);
        if (index >= 0)
          projectUserSettings.remove('favoriteBranches', index);
      } else {
        projectUserSettings.insert('favoriteBranches', panel.branch.id);
      }
    })

    // show create checkpoint panel
    btnNewCheckpoint.on('click', function () {
        panel.emit('checkpoint:new');
    });

    // generate diff
    btnDiff.on('click', function () {
        panel.emit('checkpoint:diff');
    });

    // load more button
    btnLoadMore.on('click', function () {
        panel.loadCheckpoints();
    });

    // restore checkpoint
    menuCheckpointsRestore.on('select', function () {
        panel.emit('checkpoint:restore', currentCheckpoint);
    });

    // branch from checkpoint
    menuCheckpointsBranch.on('select', function () {
        panel.emit('checkpoint:branch', currentCheckpoint);
    });

    menuCheckpoints.on('open', function (open) {
        if (! currentCheckpoint) return;

        // filter menu options
        if (open) {
            menuCheckpointsRestore.hidden = panel.branch.id !== config.self.branch.id || ! editor.call('permissions:write');
            menuCheckpointsBranch.hidden = ! editor.call('permissions:write');
        }

        // when the checkpoints context menu is closed 'unclick' dropdowns
        if (! open) {
            var item = document.getElementById('checkpoint-' + currentCheckpoint.id);
            currentCheckpoint = null;
            if (! item) return;

            var dropdown = item.querySelector('.clicked');
            if (! dropdown) return;

            dropdown.classList.remove('clicked');
            dropdown.innerHTML = '&#57689;';
        }
    });

    panel.on('show', function () {
        toggleTopButtons();

        events.push(editor.on('permissions:writeState', function (writeEnabled) {
            // hide all dropdowns if we no longer have write access
            panel.innerElement.querySelectorAll('.dropdown').forEach(function (dropdown) {
                dropdown.ui.hidden = ! writeEnabled;
            });

            // hide new checkpoint button if we no longer have write access
            toggleTopButtons();
        }));

        events.push(projectUserSettings.on('favoriteBranches:insert', panel.updateFavorite));
        events.push(projectUserSettings.on('favoriteBranches:remove', panel.updateFavorite));

        if (!panelCheckpoints.hidden) {
            // go through all the checkpoint list items and call onAddedToDom() to recalculate
            // whether we need to show read more or not
            var listItems = listCheckpoints.element.querySelectorAll('.checkpoint-widget');
            for (var i = 0, len = listItems.length; i < len; i++) {
                var item = listItems[i].ui;
                item.onAddedToDom();
            }
        }
    });

    // clean up
    panel.on('hide', function () {
        if (currentCheckpointListRequest) {
            currentCheckpointListRequest.abort();
            currentCheckpointListRequest = null;
        }

        // restore state of buttons
        btnLoadMore.disabled = false;
        btnLoadMore.text = 'LOAD MORE';
        listCheckpoints.hidden = false;
        spinner.classList.add('hidden');

        events.forEach(function (evt) {
            evt.unbind();
        });
        events.length = 0;
    });

    // Toggles diff mode for the checkpoint view.
    panel.toggleDiffMode = function (enabled) {
        diffMode = enabled;
        btnFavorite.disabled = enabled;
        btnNewCheckpoint.disabled = enabled;
        btnDiff.disabled = enabled;
    };

    // Return checkpoints container panel
    editor.method('picker:versioncontrol:widget:checkpoints', function () {
        return panel;
    });

    // Creates single widget for a checkpoint useful for other panels
    // that show checkpoints
    editor.method('picker:versioncontrol:widget:checkpoint', createCheckpointWidget);
});


/* editor/pickers/version-control/picker-version-control-diff-checkpoints.js */
editor.once('load', function () {
    'use strict';

    var leftBranch = null;
    var leftCheckpoint = null;
    var rightBranch = null;
    var rightCheckpoint = null;

    var panel = new ui.Panel('DIFF');
    panel.class.add('diff-checkpoints');

    // close button
    var btnClose = new ui.Button({
        text: '&#57650;'
    });
    btnClose.class.add('close');
    btnClose.on('click', function () {
        panel.hidden = true;
    });
    panel.headerElement.appendChild(btnClose.element);

    // left checkpoint
    var panelLeft = new ui.Panel();
    panelLeft.class.add('checkpoint', 'checkpoint-left', 'empty');
    panel.append(panelLeft);

    var labelLeftInfo = new ui.Label({
        text: 'Select a checkpoint or a branch\'s current state'
    });
    labelLeftInfo.class.add('diff-info');
    panelLeft.append(labelLeftInfo);

    var panelLeftContent = new ui.Panel('title');
    panelLeftContent.class.add('checkpoint-content');

    // clear button
    var btnClearLeft = new ui.Button({
        text: '&#57650;'
    });
    btnClearLeft.class.add('close');
    btnClearLeft.on('click', function () {
        editor.emit('checkpoint:diff:deselect', leftBranch, leftCheckpoint);
    });
    panelLeftContent.headerElement.appendChild(btnClearLeft.element);

    var labelLeftCheckpoint = new ui.Label({
        text: 'Left Checkpoint'
    });
    labelLeftCheckpoint.renderChanges = false;
    labelLeftCheckpoint.class.add('title');
    panelLeftContent.append(labelLeftCheckpoint);

    var labelLeftDesc = new ui.Label({
        text: 'Description'
    });
    labelLeftDesc.renderChanges = false;
    labelLeftDesc.class.add('desc');
    panelLeftContent.append(labelLeftDesc);

    panelLeft.append(panelLeftContent);

    // arrow
    var labelArrow = new ui.Label({
        text: '&#57702;',
        unsafe: true
    });
    labelArrow.class.add('arrow');
    panel.append(labelArrow);

    // right checkpoint
    var panelRight = new ui.Panel();
    panelRight.class.add('checkpoint', 'checkpoint-right', 'empty');
    panel.append(panelRight);

    var labelRightInfo = new ui.Label({
        text: 'Select a checkpoint or a branch\'s current state'
    });
    labelRightInfo.renderChanges = false;
    labelRightInfo.class.add('diff-info');
    panelRight.append(labelRightInfo);

    var panelRightContent = new ui.Panel('title');
    panelRightContent.class.add('checkpoint-content');
    var labelRightCheckpoint = new ui.Label({
        text: 'Right Checkpoint'
    });
    labelRightCheckpoint.renderChanges = false;
    labelRightCheckpoint.class.add('title');
    panelRightContent.append(labelRightCheckpoint);

    // clear button
    var btnClearRight = new ui.Button({
        text: '&#57650;'
    });
    btnClearRight.class.add('close');
    btnClearRight.on('click', function () {
        editor.emit('checkpoint:diff:deselect', rightBranch, rightCheckpoint);
    });
    panelRightContent.headerElement.appendChild(btnClearRight.element);

    var labelRightDesc = new ui.Label({
        text: 'Description'
    });
    labelRightDesc.renderChanges = false;
    labelRightDesc.class.add('desc');
    panelRightContent.append(labelRightDesc);

    panelRight.append(panelRightContent);

    // compare button
    var btnCompare = new ui.Button({
        text: 'COMPARE'
    });
    btnCompare.class.add('compare');
    btnCompare.disabled = true;
    panel.append(btnCompare);

    btnCompare.on('click', function () {
        panel.emit('diff',
            leftBranch.id,
            leftCheckpoint ? leftCheckpoint.id : null,
            rightBranch.id,
            rightCheckpoint ? rightCheckpoint.id : null
        );
    });

    // swap button
    var btnSwitch = new ui.Button({
        text: 'SWAP'
    });
    btnSwitch.class.add('switch');
    btnSwitch.disabled = true;
    panel.append(btnSwitch);

    btnSwitch.on('click', function () {
        var tempCheckpoint = leftCheckpoint;
        var tempBranch = leftBranch;
        setLeftCheckpoint(rightBranch, rightCheckpoint);
        setRightCheckpoint(tempBranch, tempCheckpoint);
    });

    var setCheckpointContent = function (panel, panelCheckpoint, labelCheckpoint, labelDesc, branch, checkpoint) {
        if (branch) {
            panelCheckpoint.header = branch.name;
        }

        if (checkpoint || branch) {
            labelCheckpoint.text = checkpoint ? checkpoint.description : 'Current State';
            var text;
            if (checkpoint) {
                text = editor.call('datetime:convert', checkpoint.createdAt) + ' - ' + checkpoint.id.substring(0, 7) + (checkpoint.user.fullName ? ' by ' + checkpoint.user.fullName : '');
            } else {
                text = 'As of ' + editor.call('datetime:convert', Date.now());
            }

            labelDesc.text = text;

            panel.class.remove('empty');
        } else {
            panel.class.add('empty');
        }
    }

    var setLeftCheckpoint = function (branch, checkpoint) {
        leftBranch = branch;
        leftCheckpoint = checkpoint;
        setCheckpointContent(panelLeft, panelLeftContent, labelLeftCheckpoint, labelLeftDesc, branch, checkpoint);

    };

    var setRightCheckpoint = function (branch, checkpoint) {
        rightBranch = branch;
        rightCheckpoint = checkpoint;
        setCheckpointContent(panelRight, panelRightContent, labelRightCheckpoint, labelRightDesc, branch, checkpoint);
    };

    var isLeft = function (branch, checkpoint) {
        if (leftBranch && branch.id === leftBranch.id) {
            return (checkpoint && leftCheckpoint && checkpoint.id === leftCheckpoint.id) ||
                   (!checkpoint && !leftCheckpoint);
        }
    };

    var isRight = function (branch, checkpoint) {
        if (rightBranch && branch.id === rightBranch.id) {
            return (checkpoint && rightCheckpoint && checkpoint.id === rightCheckpoint.id) ||
                   (!checkpoint && !rightCheckpoint);
        }
    };

    panel.onCheckpointSelected = function (branch, checkpoint) {
        if (!leftCheckpoint && !leftBranch) {
            setLeftCheckpoint(branch, checkpoint);
        } else {
            setRightCheckpoint(branch, checkpoint);
        }

        if (panel.getSelectedCount() === 2) {
            btnCompare.disabled = false;
            btnSwitch.disabled = false;
        }
    };

    panel.onCheckpointDeselected = function (branch, checkpoint) {
        if (isLeft(branch, checkpoint)) {
            setLeftCheckpoint(null, null);
        } else if (isRight(branch, checkpoint)) {
            setRightCheckpoint(null, null);
        }

        if (panel.getSelectedCount() !== 2) {
            btnCompare.disabled = true;
            btnSwitch.disabled = true;
        }
    };

    panel.getSelectedCount = function () {
        var result = 0;
        if (leftCheckpoint || leftBranch) result++;
        if (rightCheckpoint || rightBranch) result++;
        return result;
    };

    panel.on('hide', function () {
        editor.emit('checkpoint:diff:deselect', leftBranch, leftCheckpoint);
        editor.emit('checkpoint:diff:deselect', rightBranch, rightCheckpoint);
    });

    editor.method('picker:versioncontrol:widget:diffCheckpoints:isCheckpointSelected', function (branch, checkpoint) {
        return isLeft(branch, checkpoint) || isRight(branch, checkpoint);
    });

    // Gets the diff checkpoints panel
    editor.method('picker:versioncontrol:widget:diffCheckpoints', function () {
        return panel;
    });
});


/* editor/pickers/version-control/picker-version-control.js */
editor.once('load', function () {
    'use strict';

    if (config.project.settings.useLegacyScripts) {
        return;
    }

    var events = [];

    var projectUserSettings = editor.call('settings:projectUser');
    var branches = {}; // branches by id

    var branchesSkip = null;
    var selectedBranch = null;
    var showNewCheckpointOnLoad = false;

    // main panel
    var panel = new ui.Panel();
    panel.class.add('picker-version-control');
    editor.call('picker:project:registerMenu', 'version control', 'Version Control', panel);
    panel.flex = true;

    // hide version control picker if we are not part of the team
    if (! editor.call('permissions:read')) {
        editor.call('picker:project:toggleMenu', 'version control', false);
    }
    editor.on('permissions:set', function () {
        editor.call('picker:project:toggleMenu', 'version control', editor.call('permissions:read'));
    });

    // branches container panel
    var panelBranchesContainer = new ui.Panel();
    panelBranchesContainer.class.add('branches-container');
    panel.append(panelBranchesContainer);
    panelBranchesContainer.flex = true;

    // branches top
    // var panelBranchesTop = new ui.Panel();
    // panelBranchesTop.class.add('branches-top');
    // panelBranchesTop.flex = true;
    // panelBranchesContainer.append(panelBranchesTop);

    // branches filter
    var panelBranchesFilter = new ui.Panel();
    panelBranchesFilter.class.add('branches-filter');
    panelBranchesFilter.flex = true;
    panelBranchesContainer.append(panelBranchesFilter);

    // filter
    var fieldBranchesFilter = new ui.SelectField({
        options: [{
            v: 'open', t: 'Open Branches'
        }, {
            v: 'favorite', t: 'Favorite Branches'
        }, {
            v: 'closed', t: 'Closed Branches'
        }]
    });
    fieldBranchesFilter.value = 'open';
    fieldBranchesFilter.flexGrow = 1;
    panelBranchesFilter.append(fieldBranchesFilter);

    // branches main panel
    var panelBranches = new ui.Panel();
    panelBranches.class.add('branches');
    panelBranches.flexGrow = 1;
    panelBranchesContainer.append(panelBranches);

    // branches list
    var listBranches = new ui.List();
    panelBranches.append(listBranches);

    var loadMoreListItem = new ui.ListItem();
    loadMoreListItem.hidden = true;
    loadMoreListItem.class.add('load-more');
    var btnLoadMoreBranches = new ui.Button({
        text: 'LOAD MORE'
    });
    loadMoreListItem.element.append(btnLoadMoreBranches.element);
    btnLoadMoreBranches.on('click', function (e) {
        e.stopPropagation(); // do not select parent list item on click
        loadBranches();
    });

    // right side container panel
    var panelRight = new ui.Panel();
    panelRight.class.add('side-panel');
    panelRight.flex = true;
    panelRight.flexGrow = 1;
    panel.append(panelRight);

    // checkpoints panel
    var panelCheckpoints = editor.call('picker:versioncontrol:widget:checkpoints');
    panelRight.append(panelCheckpoints);

    panelCheckpoints.on('checkpoint:new', function () {
        showRightSidePanel(panelCreateCheckpoint);
    });

    panelCheckpoints.on('checkpoint:restore', function (checkpoint) {
        showRightSidePanel(panelRestoreCheckpoint);
        panelRestoreCheckpoint.setCheckpoint(checkpoint);
    });

    panelCheckpoints.on('checkpoint:branch', function (checkpoint) {
        showRightSidePanel(panelCreateBranch);
        panelCreateBranch.setSourceBranch(panelCheckpoints.branch);
        panelCreateBranch.setCheckpoint(checkpoint);
    });

    panelCheckpoints.on('checkpoint:diff', function () {
        panelDiffCheckpoints.hidden = false;
    });

    editor.on('checkpoint:diff:select', function (branch, checkpoint) {
        var numSelected = panelDiffCheckpoints.getSelectedCount();
        panel.class.remove('diff-checkpoints-selected-' + numSelected)
        panelDiffCheckpoints.onCheckpointSelected(branch, checkpoint);
        numSelected = panelDiffCheckpoints.getSelectedCount();
        if (numSelected) {
            panel.class.add('diff-checkpoints-selected-' + numSelected)
        }
    });

    editor.on('checkpoint:diff:deselect', function (branch, checkpoint) {
        var numSelected = panelDiffCheckpoints.getSelectedCount();
        panel.class.remove('diff-checkpoints-selected-' + numSelected)
        panelDiffCheckpoints.onCheckpointDeselected(branch, checkpoint);
        numSelected = panelDiffCheckpoints.getSelectedCount();
        if (numSelected) {
            panel.class.add('diff-checkpoints-selected-' + numSelected)
        }
    });

    var panelDiffCheckpoints = editor.call('picker:versioncontrol:widget:diffCheckpoints');
    panelDiffCheckpoints.hidden = true;
    panel.append(panelDiffCheckpoints);

    panelDiffCheckpoints.on('show', function () {
        panel.class.add('diff-mode');
        panelCheckpoints.toggleDiffMode(true);
    });

    panelDiffCheckpoints.on('hide', function () {
        panel.class.remove('diff-mode');
        panelCheckpoints.toggleDiffMode(false);
    });

    // new checkpoint panel
    var panelCreateCheckpoint = editor.call('picker:versioncontrol:widget:createCheckpoint');
    panelCreateCheckpoint.hidden = true;
    panelRight.append(panelCreateCheckpoint);

    // create checkpoint progress
    var panelCreateCheckpointProgress = editor.call('picker:versioncontrol:createProgressWidget', {
        progressText: 'Creating checkpoint',
        finishText: 'Checkpoint created',
        errorText: 'Failed to create new checkpoint'
    });
    panelCreateCheckpointProgress.hidden = true;
    panelRight.append(panelCreateCheckpointProgress);

    // generate diff progress panel
    var panelGenerateDiffProgress = editor.call('picker:versioncontrol:createProgressWidget', {
        progressText: 'Getting changes',
        finishText: 'Showing changes',
        errorText: 'Failed to get changes'
    });
    panelGenerateDiffProgress.hidden = true;
    panelRight.append(panelGenerateDiffProgress);

    // new branch panel
    var panelCreateBranch = editor.call('picker:versioncontrol:widget:createBranch');
    panelCreateBranch.hidden = true;
    panelRight.append(panelCreateBranch);

    // create branch progress
    var panelCreateBranchProgress = editor.call('picker:versioncontrol:createProgressWidget', {
        progressText: 'Creating branch',
        finishText: 'Branch created - refreshing the browser',
        errorText: 'Failed to create new branch'
    });
    panelCreateBranchProgress.hidden = true;
    panelRight.append(panelCreateBranchProgress);

    // close branch panel
    var panelCloseBranch = editor.call('picker:versioncontrol:widget:closeBranch');
    panelCloseBranch.hidden = true;
    panelRight.append(panelCloseBranch);

    // close progress
    var panelCloseBranchProgress = editor.call('picker:versioncontrol:createProgressWidget', {
        progressText: 'Closing branch',
        finishText: 'Branch closed',
        errorText: 'Failed to close branch'
    });
    panelCloseBranchProgress.hidden = true;
    panelRight.append(panelCloseBranchProgress);

    // Close branch
    panelCloseBranch.on('cancel', function () {
        showCheckpoints();
    });
    panelCloseBranch.on('confirm', function (data) {
        togglePanels(false);

        var close = function () {
            showRightSidePanel(panelCloseBranchProgress);

            editor.call('branches:close', panelCloseBranch.branch.id, function (err) {
                panelCloseBranchProgress.finish(err);
                // if there was an error re-add the item to the list
                if (err) {
                    togglePanels(true);
                } else {
                    // remove item from list
                    setTimeout(function () {
                        togglePanels(true);
                        showCheckpoints();
                    }, 1000);
                }
            });
        };

        if (! panelCloseBranch.discardChanges) {
            // take a checkpoint first
            createCheckpoint(panelCloseBranch.branch.id, 'Checkpoint before closing branch "' + panelCloseBranch.branch.name + '"', close);
        } else {
            close();
        }

    });

    // open branch progress panel
    var panelOpenBranchProgress = editor.call('picker:versioncontrol:createProgressWidget', {
        progressText: 'Opening branch',
        finishText: 'Branch opened',
        errorText: 'Failed to open branch'
    });
    panelOpenBranchProgress.hidden = true;
    panelRight.append(panelOpenBranchProgress);

    // merge branches panel
    var panelMergeBranches = editor.call('picker:versioncontrol:widget:mergeBranches');
    panelMergeBranches.hidden = true;
    panelRight.append(panelMergeBranches);

    // merge branches progress
    var panelMergeBranchesProgress = editor.call('picker:versioncontrol:createProgressWidget', {
        progressText: 'Attempting to auto merge branches',
        finishText: 'Merge ready - Opening Merge Review',
        errorText: 'Unable to auto merge'
    });
    panelMergeBranchesProgress.hidden = true;
    panelRight.append(panelMergeBranchesProgress);

    // Merge branches
    panelMergeBranches.on('cancel', function () {
        showCheckpoints();
    });
    panelMergeBranches.on('confirm', function () {
        var sourceBranch = panelMergeBranches.sourceBranch;
        var destinationBranch = panelMergeBranches.destinationBranch;
        var discardChanges = panelMergeBranches.discardChanges;

        togglePanels(false);

        var merge = function () {
            showRightSidePanel(panelMergeBranchesProgress);

            editor.call('branches:merge', sourceBranch.id, destinationBranch.id, function (err, data) {
                panelMergeBranchesProgress.finish(err);
                if (err) {
                    togglePanels(true);
                } else {
                    // update merge object in config
                    config.self.branch.merge = data;

                    // if there are merge conflicts then show
                    // conflict manager
                    if (data.numConflicts) {
                        panelMergeBranchesProgress.setMessage('Unable to auto merge - opening conflict manager');
                        setTimeout(function () {
                            editor.call('picker:project:close');
                            editor.call('picker:versioncontrol:mergeOverlay:hide'); // hide this in case it's open
                            editor.call('picker:conflictManager');
                        }, 1500);
                    } else {
                        // otherwise merge was successful
                        // so review changes
                        setTimeout(function () {
                            editor.call('picker:project:close');
                            editor.call('picker:versioncontrol:mergeOverlay:hide'); // hide this in case it's open
                            editor.call('picker:diffManager');
                        }, 1500);
                    }
                }
            });
        };

        if (discardChanges) {
            merge();
        } else {
            // take a checkpoint first
            createCheckpoint(config.self.branch.id, 'Checkpoint before merging checkpoint "' + sourceBranch.latestCheckpointId + '" into "' + destinationBranch.latestCheckpointId + '"', merge);
        }
    });

    // restore checkpoint panel
    var panelRestoreCheckpoint = editor.call('picker:versioncontrol:widget:restoreCheckpoint');
    panelRestoreCheckpoint.hidden = true;
    panelRight.append(panelRestoreCheckpoint);

    // restore branch progress
    var panelRestoreCheckpointProgress = editor.call('picker:versioncontrol:createProgressWidget', {
        progressText: 'Restoring checkpoint',
        finishText: 'Checkpoint restored - refreshing the browser',
        errorText: 'Failed to restore checkpoint'
    });
    panelRestoreCheckpointProgress.hidden = true;
    panelRight.append(panelRestoreCheckpointProgress);

    // Restore checkpoints
    panelRestoreCheckpoint.on('cancel', function () {
        showCheckpoints();
    });
    panelRestoreCheckpoint.on('confirm', function () {
        togglePanels(false);

        var restore = function () {
            showRightSidePanel(panelRestoreCheckpointProgress);

            editor.call('checkpoints:restore', panelRestoreCheckpoint.checkpoint.id, config.self.branch.id, function (err, data) {
                panelRestoreCheckpointProgress.finish(err);
                if (err) {
                    togglePanels(true);
                } else {
                    refreshBrowser();
                }
            });
        };

        if (! panelRestoreCheckpoint.discardChanges) {
            // take a checkpoint first
            createCheckpoint(config.self.branch.id, 'Checkpoint before restoring "' + panelRestoreCheckpoint.checkpoint.id.substring(0, 7) + '"', restore);
        } else {
            restore();
        }

    });

    // switch branch progress
    var panelSwitchBranchProgress = editor.call('picker:versioncontrol:createProgressWidget', {
        progressText: 'Switching branch',
        finishText: 'Switched branch - refreshing the browser',
        errorText: 'Failed to switch branch'
    });
    panelSwitchBranchProgress.hidden = true;
    panelRight.append(panelSwitchBranchProgress);

    var showRightSidePanel = function (panel) {
        // hide all right side panels first
        var p = panelRight.innerElement.firstChild;
        while (p && p.ui) {
            p.ui.hidden = true;
            p = p.nextSibling;
        }

        // show specified panel
        if (panel) {
            panel.hidden = false;
        }
    };

    var showCheckpoints = function () {
        showRightSidePanel(panelCheckpoints);
    };

    // new branch button
    // var btnNewBranch = new ui.Button({
    //     text: 'NEW BRANCH'
    // });
    // btnNewBranch.flexGrow = 1;
    // btnNewBranch.class.add('icon', 'create');
    // panelBranchesTop.append(btnNewBranch);

    // branch for which context menu is open
    var contextBranch = null;

    // branches context menu
    var menuBranches = new ui.Menu();
    menuBranches.class.add('version-control');

    // when the branches context menu is closed 'unclick' dropdowns
    menuBranches.on('open', function (open) {
        if (open || ! contextBranch) return;

        var item = document.getElementById('branch-' + contextBranch.id);
        if (! item) return;

        var dropdown = item.querySelector('.clicked');
        if (! dropdown) return;

        dropdown.classList.remove('clicked');
        dropdown.innerHTML = '&#57689;';

        if (! open) {
            contextBranch = null;
            menuBranches.contextBranchIsFavorite = false;
        }
    });

    // favorite branch
    var menuBranchesFavorite = new ui.MenuItem({
        text: 'Favorite This Branch',
        value: 'favorite-branch'
    });
    menuBranches.append(menuBranchesFavorite);

    // favorite branch
    menuBranchesFavorite.on('select', function () {
        if (!contextBranch) return;
        if (menuBranches.contextBranchIsFavorite) {
          var index = projectUserSettings.get('favoriteBranches').indexOf(contextBranch.id);
          if (index >= 0)
            projectUserSettings.remove('favoriteBranches', index);
        } else {
          projectUserSettings.insert('favoriteBranches', contextBranch.id);
        }
    });

    // checkout branch
    var menuBranchesSwitchTo = new ui.MenuItem({
        text: 'Switch To This Branch',
        value: 'switch-branch'
    });
    menuBranches.append(menuBranchesSwitchTo);

    // switch to branch
    menuBranchesSwitchTo.on('select', function () {
        if (contextBranch) {
            togglePanels(false);
            showRightSidePanel(panelSwitchBranchProgress);
            editor.call('branches:checkout', contextBranch.id, function (err, data) {
                panelSwitchBranchProgress.finish(err);
                if (err) {
                    togglePanels(true);
                } else {
                    refreshBrowser();
                }
            });
        }
    });

    // merge branch
    var menuBranchesMerge = new ui.MenuItem({
        text: 'Merge Into Current Branch',
        value: 'merge-branch'
    });
    menuBranches.append(menuBranchesMerge);

    // merge branch
    menuBranchesMerge.on('select', function () {
        if (contextBranch) {
            showRightSidePanel(panelMergeBranches);
            panelMergeBranches.setSourceBranch(contextBranch);
            panelMergeBranches.setDestinationBranch(config.self.branch);
        }
    });


    // close branch
    var menuBranchesClose = new ui.MenuItem({
        text: 'Close This Branch',
        value: 'close-branch'
    });
    menuBranches.append(menuBranchesClose);

    // close branch
    menuBranchesClose.on('select', function () {
        if (contextBranch) {
            showRightSidePanel(panelCloseBranch);
            panelCloseBranch.setBranch(contextBranch);
        }
    });

    // open branch
    var menuBranchesOpen = new ui.MenuItem({
        text: 'Re-Open This Branch',
        value: 'open-branch'
    });
    menuBranches.append(menuBranchesOpen);

    // open branch
    menuBranchesOpen.on('select', function () {
        if (! contextBranch) return;

        var branch = contextBranch;

        togglePanels(false);
        showRightSidePanel(panelOpenBranchProgress);

        editor.call('branches:open', branch.id, function (err) {
            panelOpenBranchProgress.finish(err);
            if (err) {
                togglePanels(true);
            } else {
                // do this in a timeout to give time for the
                // success message to appear
                setTimeout(function () {
                    togglePanels(true);
                    showCheckpoints();
                }, 1000);
            }
        });
    });

    // Filter context menu items
    menuBranches.on('open', function () {
        var writeAccess = editor.call('permissions:write');

        menuBranchesFavorite.text = (menuBranches.contextBranchIsFavorite ? 'Unf' : 'F') + 'avorite This Branch';

        menuBranchesClose.hidden = !writeAccess || !contextBranch || contextBranch.closed || contextBranch.id === config.project.masterBranch || contextBranch.id === projectUserSettings.get('branch');
        menuBranchesOpen.hidden = !writeAccess || !contextBranch || !contextBranch.closed;

        menuBranchesFavorite.hidden = !writeAccess || !contextBranch || contextBranch.id === projectUserSettings.get('branch') || contextBranch.closed;
        menuBranchesSwitchTo.hidden = !contextBranch || contextBranch.id === projectUserSettings.get('branch') || contextBranch.closed;
        menuBranchesMerge.hidden = !writeAccess || !contextBranch || contextBranch.id === projectUserSettings.get('branch') || contextBranch.closed;
    });

    editor.call('layout.root').append(menuBranches);


    var createBranchListItem = function (branch) {
        var item = new ui.ListItem({
            allowDeselect: false
        });
        item.branch = branch;
        item.element.id = 'branch-' + branch.id;

        var panel = new ui.Panel();
        item.element.appendChild(panel.element);

        var labelIcon = new ui.Label({
            text: '&#58208;',
            unsafe: true
        });
        labelIcon.class.add('icon');
        // TODO: should this be a css class? feels bad to made another class just for this fontSize change
        labelIcon.style.fontSize = '8px';
        panel.append(labelIcon);

        var labelName = new ui.Label({
            text: branch.name
        });
        labelName.class.add('name', 'selectable');
        panel.append(labelName);

        var labelBranchId = new ui.Label({
            text: branch.id
        });
        labelBranchId.class.add('branch-id', 'selectable');
        panel.append(labelBranchId);

        // dropdown
        var dropdown = new ui.Button({
            text: '&#57689;'
        });
        dropdown.branch = branch;
        dropdown.class.add('dropdown');
        panel.append(dropdown);

        Object.defineProperty(item, 'isFavorite', {
            get: function() {
                return this._isFavorite;
            },
            set: function(value) {
              if (value !== this._isFavorite) {
                this._isFavorite = Boolean(value);
                labelIcon.text = this._isFavorite ? '&#9733;' : '&#58208;'
                labelIcon.style.fontSize = this._isFavorite ? '10px' : '8px';
              }
            }
        });

        item.isFavorite = projectUserSettings.get('favoriteBranches').includes(branch.id);

        dropdown.on('click', function (e) {
            e.stopPropagation();

            if (panelCheckpoints.hidden) {
                showCheckpoints();
            }

            if (panelBranches.disabled) return;

            dropdown.class.add('clicked');
            dropdown.element.innerHTML = '&#57687;';

            contextBranch = branch;
            menuBranches.contextBranchIsFavorite = item.isFavorite;
            menuBranches.open = true;
            var rect = dropdown.element.getBoundingClientRect();
            menuBranches.position(rect.right - menuBranches.innerElement.clientWidth, rect.bottom);
        });

        listBranches.append(item);

        // select branch
        item.on('select', function () {
            selectBranch(branch);
        });

        // if we are currently showing an error and we click
        // on a branch that is already selected then hide the error
        // and show the checkpoints
        var wasItemSelectedBeforeClick = false;
        item.element.addEventListener('mousedown', function () {
            wasItemSelectedBeforeClick = item.selected;
        });
        item.element.addEventListener('mouseup', function () {
            if (! wasItemSelectedBeforeClick || ! item.selected) return;
            wasItemSelectedBeforeClick = false;

            if (editor.call('picker:versioncontrol:isErrorWidgetVisible')) {
                showCheckpoints();
            }
        });

        // if this is our current branch then change the status icon
        // and hide the dropdown button because it doesn't currently
        // have any available actions for the current branch
        if (branch.id === config.self.branch.id) {
            labelIcon.class.add('active');
            dropdown.hidden = true;
        }
    };

    // Get the list item for a branch
    var getBranchListItem = function (branchId) {
        var item = document.getElementById('branch-' + branchId);
        return item && item.ui;
    };

    var updateBranchFavorite = function (branchId) {
      const item = getBranchListItem(branchId);
      if (item)
        item.isFavorite = projectUserSettings.get('favoriteBranches').includes(item.branch.id);
    }

    // Select specified branch and show its checkpoints
    var selectBranch = function (branch) {
        selectedBranch = branch;
        showCheckpoints();

        panelCheckpoints.setBranch(branch);
        panelCheckpoints.loadCheckpoints();
    };

    var createCheckpoint = function (branchId, description, callback) {
        togglePanels(false);
        showRightSidePanel(panelCreateCheckpointProgress);

        editor.call('checkpoints:create', branchId, description, function (err, checkpoint) {
            panelCreateCheckpointProgress.finish(err);
            if (err) {
                return togglePanels(true);
            }

            callback(checkpoint);
        });
    };

    panelDiffCheckpoints.on('diff', function (srcBranchId, srcCheckpointId, dstBranchId, dstCheckpointId) {
        panelDiffCheckpoints.hidden = true;

        togglePanels(false);
        showRightSidePanel(panelGenerateDiffProgress);
        editor.call('diff:create', srcBranchId, srcCheckpointId, dstBranchId, dstCheckpointId, function (err, diff) {
            panelGenerateDiffProgress.finish(err);

            togglePanels(true);

            if (!err && diff.numConflicts === 0) {
                panelGenerateDiffProgress.setMessage("There are no changes");
                setTimeout(function () {
                    showCheckpoints();
                }, 1500);
            } else if (! err) {
                editor.call('picker:project:close');
                editor.call('picker:versioncontrol:mergeOverlay:hide'); // hide this in case it's open
                editor.call('picker:diffManager', diff);
            }
        });
    });

    // show create branch panel
    // btnNewBranch.on('click', function () {
    //     showRightSidePanel(panelCreateBranch);
    //     panelCreateBranch.setSourceBranch(config.self.branch);
    //     if (config.self.branch.latestCheckpointId) {
    //         panelCreateBranch.setCheckpointId(config.self.branch.latestCheckpointId);
    //     }
    // });

    // Create checkpoint
    panelCreateCheckpoint.on('cancel', function () {
        // we need to load the checkpoints if we cancel creating checkpoints
        // because initially we might have opened this picker by showing the create checkpoint
        // panel without having a chance to load the checkpoints first
        if (! panelCheckpoints.checkpoints)  {
            selectBranch(selectedBranch);
        } else {
            showCheckpoints();
        }
    });
    panelCreateCheckpoint.on('confirm', function (data) {
        createCheckpoint(config.self.branch.id, data.description, function (checkpoint) {
            setTimeout(function () {
                togglePanels(true);

                // show checkpoints unless they haven't been loaded yet in which
                // case re-select the branch which reloads the checkpoints
                if (! panelCheckpoints.checkpoints) {
                    selectBranch(selectedBranch);
                } else {
                    showCheckpoints();
                }
            },  1000);
        });
    });

    // Create branch
    panelCreateBranch.on('cancel', showCheckpoints);
    panelCreateBranch.on('confirm', function (data) {
        togglePanels(false);
        showRightSidePanel(panelCreateBranchProgress);

        var params = {
            name: data.name,
            projectId: config.project.id,
            sourceBranchId: panelCheckpoints.branch.id
        };

        if (panelCreateBranch.checkpoint) {
            params.sourceCheckpointId = panelCreateBranch.checkpoint.id;
        }

        editor.call('branches:create', params, function (err, branch) {
            panelCreateBranchProgress.finish(err);
            if (err) {
                togglePanels(true);
            } else {
                refreshBrowser();
            }
        });
    });

    // Enable or disable the clickable parts of this picker
    var togglePanels = function (enabled) {
        editor.call('picker:project:setClosable', enabled && config.scene.id);
        editor.call('picker:project:toggleLeftPanel', enabled);
        // panelBranchesTop.disabled = !enabled;
        panelBranches.disabled = !enabled;
        panelBranchesFilter.disabled = !enabled;
    };

    var refreshBrowser = function () {
        // Do this in a timeout to give some time to the user
        // to read any information messages.
        // Also file picker-version-control-messenger.js will actually
        // refresh the browser first - so this is here really to make sure
        // the browser is refreshed if for some reason the messenger fails to deliver the message.
        // That's why the timeout here is larger than what's in picker-version-control-messenger
        setTimeout(function () {
            window.location.reload();
        }, 2000);
    };

    var loadBranches = function () {
        // change status of loading button
        btnLoadMoreBranches.disabled = true;
        btnLoadMoreBranches.text = 'LOADING...';

        // if we are reloading
        // clear branch from checkpoints so that checkpoints are also hidden
        if (! branchesSkip) {
            panelCheckpoints.setBranch(null);
            selectedBranch = null;
        }

        // request branches from server
        editor.call('branches:list', {
            limit: 40,
            skip: branchesSkip,
            closed: fieldBranchesFilter.value === 'closed',
            favorite: fieldBranchesFilter.value === 'favorite'
        }, function (err, data) {
            if (err) {
                return console.error(err);
            }

            // change status of loading button
            btnLoadMoreBranches.disabled = false;
            btnLoadMoreBranches.text = 'LOAD MORE';
            loadMoreListItem.hidden = !data.pagination.hasMore;


            // if we are re-loading the branch list then clear the current items
            if (! branchesSkip) {
                listBranches.clear();
                branches = {};

                // create current branch as first item
                if (fieldBranchesFilter.value !== 'closed') {
                    createBranchListItem(config.self.branch);
                }
            }

            // use last item as a marker for loading the next batch of branches
            var lastItem = data.result[data.result.length - 1];
            branchesSkip = lastItem ? lastItem.id : null;

            if (! data.result[0]) return;

            // convert array to dict
            branches = data.result.reduce(function (map, branch) {
                map[branch.id] = branch;
                return map;
            }, branches);

            var selected = selectedBranch;

            // create list items for each branch
            data.result.forEach(function (branch) {
                // skip the current branch as we've already
                // created that first
                if (branch.id !== config.self.branch.id) {
                    createBranchListItem(branch);
                }
            });

            // if we didn't find a proper selection then select our branch
            if (! selected) {
                selected = config.self.branch;
            }

            if (selected) {
                var item = getBranchListItem(selected.id);
                if (item) {
                    item.selected = true;
                }
            }

            // add load more list item in the end
            listBranches.append(loadMoreListItem);

            // show new checkpoint panel if necessary
            if (showNewCheckpointOnLoad) {
                showNewCheckpointOnLoad = false;
                showRightSidePanel(panelCreateCheckpoint);
            }
        });
    };

    // When the filter changes clear our branch list and reload branches
    fieldBranchesFilter.on('change', function () {
        branchesSkip = null;
        listBranches.clear();
        loadBranches();
    });

    // on show
    panel.on('show', function () {
        showCheckpoints();

        // load and create branches
        branchesSkip = null;
        selectedBranch = null;
        loadBranches();

        events.push(editor.on('permissions:writeState', function (writeEnabled) {
            // hide all dropdowns if we no longer have write access
            panelBranches.innerElement.querySelectorAll('.dropdown').forEach(function (dropdown) {
                dropdown.ui.hidden = ! writeEnabled || dropdown.ui.branch.id === config.self.branch.id;
            });
        }));

        // when a checkpoint is created add it to the list
        events.push(editor.on('messenger:checkpoint.createEnded', function (data) {
            if (data.status === 'error') return;

            // update latest checkpoint in current branches
            if (branches[data.branch_id]) {
                branches[data.branch_id].latestCheckpointId = data.checkpoint_id;
            }

            // add new checkpoint to checkpoint list
            // but only if the checkpoints panel has loaded its checkpoints.
            // Otherwise do not add it but wait until the panel is shown and all of its checkpoints
            // (including the new one) are loaded
            if (panelCheckpoints.branch.id === data.branch_id) {
                var existingCheckpoints = panelCheckpoints.checkpoints;
                if (existingCheckpoints) {
                    existingCheckpoints.unshift({
                        id: data.checkpoint_id,
                        user: {
                            id: data.user_id,
                            fullName: data.user_full_name
                        },
                        createdAt: new Date(data.created_at),
                        description: data.description
                    });
                    panelCheckpoints.setCheckpoints(existingCheckpoints);
                }
            }
        }));

        // when a branch is unfavorited remove it from the list and select the next one
        events.push(projectUserSettings.on('favoriteBranches:remove', function (branchId) {
            // only handle when viewing favorites and when branch isn't current branch
            if (fieldBranchesFilter.value !== 'favorite' || config.self.branch.id === branchId) {
                return;
            }

            // we are seeing the favorite branches view so remove this branch from the list
            // and select the next branch
            var item = getBranchListItem(branchId);
            if (! item) return;

            var nextItem = null;
            if (item.selected) {
                if (item.element.nextSibling !== loadMoreListItem.element) {
                    nextItem = item.element.nextSibling;
                }

                if (! nextItem) {
                    nextItem = item.element.previousSibling;
                }
            }

            listBranches.remove(item);

            // select next or previous sibling
            if (nextItem && nextItem !== loadMoreListItem.element) {
                nextItem.ui.selected = true
            }
        }));

        // when a branch is closed remove it from the list and select the next one
        events.push(editor.on('messenger:branch.close', function (data) {
            if (fieldBranchesFilter.value === 'closed') {
                return;
            }

            // we are seeing the open branches view so remove this branch from the list
            // and select the next branch
            var item = getBranchListItem(data.branch_id);
            if (! item) return;

            var nextItem = null;
            if (item.selected) {
                if (item.element.nextSibling !== loadMoreListItem.element) {
                    nextItem = item.element.nextSibling;
                }

                if (! nextItem) {
                    nextItem = item.element.previousSibling;
                }
            }

            listBranches.remove(item);

            // select next or previous sibling
            if (nextItem && nextItem !== loadMoreListItem.element) {

                // if the progress panel is open it means we are the ones
                // closing the branch (or some other branch..) - so wait a bit
                // so that we can show the progress end message before selecting another branch
                if (! panelCloseBranchProgress.hidden) {
                    setTimeout(function () {
                        nextItem.ui.selected = true;
                    }, 500);
                } else {
                    // otherwise immediately select the next branch
                    nextItem.ui.selected = true;
                }
            }
        }));

        events.push(editor.on('messenger:branch.open', function (data) {
            if (fieldBranchesFilter.value === 'open') {
                return;
            }

            // we are seeing the closed branches list so remove this
            // branch from this list and select the next one or if there
            // are no more branches in this list then view the open branches
            var item = getBranchListItem(data.branch_id);
            if (! item) return;

            var wasSelected = item.selected;
            var nextItem = null;
            if (item.element.nextSibling !== loadMoreListItem.element) {
                nextItem = item.element.nextSibling;
            }

            if (! nextItem) {
                nextItem = item.element.previousSibling;
            }

            // remove branch from the list
            listBranches.remove(item);

            // select next or previous item
            var selectNext = function () {
                if (nextItem && wasSelected) {
                    nextItem.ui.selected = true;
                } else if (! nextItem) {
                    // if no more items exist in the list then view the open list
                    showRightSidePanel(null);
                    fieldBranchesFilter.value = 'open';
                }
            };

            // if the progress panel is open it means we are the ones
            // opening the branch (or some other branch..) - so wait a bit
            // so that we can show the progress end message before selecting another branch
            if (! panelOpenBranchProgress.hidden) {
                setTimeout(selectNext, 500);
            } else {
                // otherwise immediately select the next branch
                selectNext();
            }

        }));

        events.push(projectUserSettings.on('favoriteBranches:insert', updateBranchFavorite));
        events.push(projectUserSettings.on('favoriteBranches:remove', updateBranchFavorite));

        if (editor.call('viewport:inViewport')) {
            editor.emit('viewport:hover', false);
        }
    });

    // on hide
    panel.on('hide', function () {
        showRightSidePanel(null);

        // clear checkpoint
        panelCheckpoints.setCheckpoints(null);
        panelCheckpoints.toggleLoadMore(false);

        // hide diff panel
        panelDiffCheckpoints.hidden = true;

        showNewCheckpointOnLoad = false;

        events.forEach(function (evt) {
            evt.unbind();
        });
        events.length = 0;

        if (editor.call('viewport:inViewport')) {
            editor.emit('viewport:hover', true);
        }
    });

    // Prevent viewport hovering when the picker is shown
    editor.on('viewport:hover', function (state) {
        if (state && ! panel.hidden) {
            setTimeout(function () {
                editor.emit('viewport:hover', false);
            }, 0);
        }
    });

    // Show the picker
    editor.method('picker:versioncontrol', function () {
        editor.call('picker:project', 'version control');
    });

    // hotkey to create new checkpoint
    editor.call('hotkey:register', 'new-checkpoint', {
        key: 's',
        ctrl: true,
        callback: function (e) {
            if (! editor.call('permissions:write')) return;
            if (editor.call('picker:isOpen:otherThan', 'project')) {
                return;
            }

            if (panel.hidden) {
                showNewCheckpointOnLoad = true;
                editor.call('picker:versioncontrol');
            } else {
                showRightSidePanel(panelCreateCheckpoint);
            }
        }
    });

});


/* editor/pickers/version-control/picker-version-control-overlay-message.js */
editor.once('load', function () {
    'use strict';

    editor.method('picker:versioncontrol:createOverlay', function (args) {
        // overlay
        var overlay = new ui.Overlay();
        overlay.class.add('version-control-overlay');
        overlay.clickable = false;
        overlay.hidden = true;

        var root = editor.call('layout.root');
        root.append(overlay);

        // main panel
        var panel = new ui.Panel();
        panel.class.add('main');
        overlay.append(panel);

        // icon on the left
        var panelIcon = new ui.Panel();
        panelIcon.class.add('left');
        panel.append(panelIcon);

        panelIcon.innerElement.appendChild(args.icon);

        // content on the right
        var panelRight = new ui.Panel();
        panelRight.class.add('right');
        panel.append(panelRight);

        // title
        var labelTitle = new ui.Label({
            text: args.title
        });
        labelTitle.renderChanges = false;
        labelTitle.class.add('title');
        panelRight.append(labelTitle);

        // message
        var labelMessage = new ui.Label({
            text: args.message
        });
        labelMessage.renderChanges = false;
        labelMessage.class.add('message');
        panelRight.append(labelMessage);

        // public methods
        overlay.setMessage = function (msg) {
            labelMessage.text = msg;
        };

        overlay.setTitle = function (title) {
            labelTitle.text = title;
        };

        overlay.on('show', function () {
            if (editor.call('picker:versioncontrol:isProgressWidgetVisible')) {
                overlay.class.add('show-behind-picker');
            }

            // editor-blocking popup opened
            editor.emit('picker:open', 'version-control-overlay');
        });

        overlay.on('hide', function () {
            // editor-blocking popup closed
            editor.emit('picker:close', 'version-control-overlay');
        });

        return overlay;

    });
});


/* editor/pickers/version-control/picker-version-control-messenger.js */
editor.once('load', function () {
    'use strict';

    var currentCheckpointBeingCreated = null;

    var overlayBranchSwitched = editor.call('picker:versioncontrol:createOverlay', {
        message: 'Refreshing browser window...',
        icon: editor.call('picker:versioncontrol:svg:completed', 50)
    });

    var overlayCreatingCheckpoint = editor.call('picker:versioncontrol:createOverlay', {
        message: 'Please wait while the checkpoint is being created.',
        icon: editor.call('picker:versioncontrol:svg:spinner', 50)
    });

    var overlayRestoringCheckpoint = editor.call('picker:versioncontrol:createOverlay', {
        message: 'Please wait while the checkpoint is restored.',
        icon: editor.call('picker:versioncontrol:svg:spinner', 50)
    });

    var overlayCheckpointRestored = editor.call('picker:versioncontrol:createOverlay', {
        message: 'Refreshing browser window...',
        icon: editor.call('picker:versioncontrol:svg:completed', 50)
    });

    var overlayBranchClosed = editor.call('picker:versioncontrol:createOverlay', {
        title: 'This branch has been closed.',
        message: 'Switching to master branch...',
        icon: editor.call('picker:versioncontrol:svg:spinner', 50)
    });

    var overlayMergeStopped = editor.call('picker:versioncontrol:createOverlay', {
        message: 'Refreshing browser...',
        icon: editor.call('picker:versioncontrol:svg:error', 50)
    });

    var overlayMergeCompleted = editor.call('picker:versioncontrol:createOverlay', {
        title: 'Merge completed.',
        message: 'Refreshing browser...',
        icon: editor.call('picker:versioncontrol:svg:completed', 50)
    });


    // don't let the user's full name be too big
    var truncateFullName = function (fullName) {
        return fullName.length > 36 ? fullName.substring(0, 33) + '...' : fullName;
    };

    // If we are currently in a scene this will first request the
    // scene from the server. If the scene no longer exists then we will
    // refresh to the Project URL. If the scene exists then just refresh the browser window
    var refresh = function () {
        setTimeout(function () {
            if (config.scene && config.scene.id) {
                editor.call('scenes:get', config.scene.id, function (err, data) {
                    if (err || ! data) {
                        window.location = '/editor/project/' + config.project.id + window.location.search;
                    } else {
                        window.location.reload();
                    }
                });
            } else {
                window.location.reload();
            }
        }, 1000);
    };

    // show overlay when branch ended
    editor.on('messenger:branch.createEnded', function (data) {
        if (data.status === 'error' || data.user_id !== config.self.id) {
            return;
        }

        // if this is us then we need to refresh the browser
        config.self.branch.id = data.branch_id;
        overlayBranchSwitched.setTitle('Switched to branch "' + data.name + '"');
        overlayBranchSwitched.hidden = false;
        refresh();
    });

    // show overlay when the branch of this user has been changed
    editor.on('messenger:branch.switch', function (data) {
        if (data.project_id !== config.project.id) {
            return;
        }

        config.self.branch.id = data.branch_id;
        overlayBranchSwitched.setTitle('Switched to branch "' + data.name + '"');
        overlayBranchSwitched.hidden = false;
        refresh();
    });

    // Show overlay when checkpoint started being created
    editor.on('messenger:checkpoint.createStarted', function (data) {
        if (data.branch_id !== config.self.branch.id) return;

        currentCheckpointBeingCreated = data.checkpoint_id;
        overlayCreatingCheckpoint.setTitle(truncateFullName(data.user_full_name) + ' is creating a checkpoint.');
        overlayCreatingCheckpoint.hidden = false;
    });

    // If the checkpoint that was being created finished and we were showing an
    // overlay for it then hide that overlay
    editor.on('messenger:checkpoint.createEnded', function (data) {
        if (data.checkpoint_id !== currentCheckpointBeingCreated) return;
        currentCheckpointBeingCreated = null;
        overlayCreatingCheckpoint.hidden = true;

        // update latest checkpoint in branch
        if (data.status !== 'error' && data.branch_id === config.self.branch.id) {
            config.self.branch.latestCheckpointId = data.checkpoint_id;
        }
    });

    // show overlay when checkpoint starts being restored
    editor.on('messenger:checkpoint.revertStarted', function (data) {
        if (data.branch_id !== config.self.branch.id) return;
        overlayRestoringCheckpoint.setTitle(truncateFullName(data.user_full_name) + ' is restoring checkpoint ' + data.checkpoint_id.substring(0, 7));
        overlayRestoringCheckpoint.hidden = false;
    });

    // show overlay when checkpoint was restored
    editor.on('messenger:checkpoint.revertEnded', function (data) {
        if (data.branch_id !== config.self.branch.id) return;
        if (data.status === 'success') {
            overlayRestoringCheckpoint.hidden = true;
            overlayCheckpointRestored.setTitle(truncateFullName(data.user_full_name) + ' restored checkpoint ' + data.checkpoint_id.substring(0, 7));
            overlayCheckpointRestored.hidden = false;
            refresh();
        } else {
            // hide the overlay
            overlayRestoringCheckpoint.hidden = true;
        }
    });

    // show overlay if our current branch was closed
    editor.on('messenger:branch.close', function (data) {
        if (data.branch_id !== config.self.branch.id) return;

        overlayBranchClosed.hidden = false;

        // check out master branch and then refresh the browser
        Ajax({
            url: '/api/branches/{{project.masterBranch}}/checkout',
            method: 'POST',
            auth: true
        })
        .on('load', refresh)
        .on('error', refresh);
    });

    // if a merge has started for our branch then show overlay
    editor.on('messenger:merge.new', function (data) {
        if (data.dst_branch_id !== config.self.branch.id) return;

        config.self.branch.merge = {
            id: data.merge_id,
            user: {
                id: data.user_id,
                fullName: data.user_full_name
            }
        };

        editor.call('picker:versioncontrol:mergeOverlay');
    });

    // show overlay if the current merge has been force stopped
    editor.on('messenger:merge.delete', function (data) {
        if (! config.self.branch.merge) return;
        if (config.self.branch.merge.id !== data.merge_id) return;

        editor.call('picker:versioncontrol:mergeOverlay:hide');

        var name = data.user.length > 33 ? data.user.substring(0, 30) + '...' : data.user;
        overlayMergeStopped.setTitle('Merge force stopped by ' + name);
        overlayMergeStopped.hidden = false;
        setTimeout(refresh, 1000); // delay this a bit more
    });

    // show overlay when merge is complete and refresh browser
    editor.on('messenger:merge.complete', function (data) {
        if (data.dst_branch_id !== config.self.branch.id) return;
        if (editor.call('picker:isOpen', 'conflict-manager')) return;

        editor.call('picker:versioncontrol:mergeOverlay:hide');
        overlayMergeCompleted.hidden = false;
        refresh();
    });

    // if we stopped the merge but the conflict manager is open then show the overlay behind the conflict manager
    overlayMergeStopped.on('show', function () {
        if (editor.call('picker:isOpen', 'conflict-manager')) {
            overlayMergeStopped.class.add('show-behind-picker');
        } else {
            overlayMergeStopped.class.remove('show-behind-picker');
        }
    });

    // check if our current branch is different than the one we have currently loaded
    // this can happen say if the branch is switch while the window is being refreshed
    function checkValidBranch() {
        if (!editor.call('permissions:read')) return;

        editor.call('branches:getCurrentBranch', function (status, data) {
            if (data && data.id !== config.self.branch.id) {
                console.log('Branch switched while refreshing. Reloading page...');
                refresh();
            }
        });
    }

    editor.on('messenger:connected', checkValidBranch);

    if (editor.call('messenger:isConnected')) {
        checkValidBranch();
    }
});


/* editor/pickers/version-control/picker-version-control-overlay-merge.js */
editor.once('load', function () {
    'use strict';

    var icon = document.createElement('div');
    icon.classList.add('icon');
    icon.innerHTML = '&#57880;';

    var overlay = editor.call('picker:versioncontrol:createOverlay', {
        message: 'Please wait until merging has been completed',
        icon: icon
    });
    overlay.class.add('merge-overlay');

    // switch to branch ui
    var panelSwitch = new ui.Panel();
    panelSwitch.class.add('switch-branch');
    var labelSwitch = new ui.Label({
        text: 'Switch to'
    });
    panelSwitch.append(labelSwitch);

    var dropdownBranches = new ui.SelectField({
        placeholder: 'Select Branch'
    });
    panelSwitch.append(dropdownBranches);

    var btnSwitch = new ui.Button({
        text: 'SWITCH'
    });
    btnSwitch.disabled = true;
    panelSwitch.append(btnSwitch);
    overlay.innerElement.querySelector('.right').ui.append(panelSwitch);

    // switch to branch
    btnSwitch.on('click', function () {
        overlay.innerElement.classList.add('hidden'); // hide the inner contents of the overlay but not the whole overlay
        editor.call('branches:checkout', dropdownBranches.value, refresh);
    });

    // If we are currently in a scene this will first request the
    // scene from the server. If the scene no longer exists then we will
    // refresh to the Project URL. If the scene exists then just refresh the browser window
    var refresh = function () {
        setTimeout(function () {
            if (config.scene && config.scene.id) {
                editor.call('scenes:get', config.scene.id, function (err, data) {
                    if (err || ! data) {
                        window.location = '/editor/project/' + config.project.id + window.location.search;
                    } else {
                        window.location.reload();
                    }
                });
            } else {
                window.location.reload();
            }
        }, 1000);
    };

    // bottom buttons panel
    var panelButtons = new ui.Panel();
    panelButtons.class.add('buttons');
    overlay.append(panelButtons);

    var btnForceStopMerge = new ui.Button({
        text: 'FORCE STOP MERGE'
    });
    btnForceStopMerge.disabled = ! editor.call('permissions:write');
    panelButtons.append(btnForceStopMerge);
    btnForceStopMerge.on('click', function () {
        editor.call('picker:confirm', 'Are you sure you want to force stop this merge process?', function () {
            overlay.innerElement.classList.add('hidden'); // hide the inner contents of the overlay but not the whole overlay
            editor.call('branches:forceStopMerge', config.self.branch.merge.id, function (err, data) {
                window.location.reload();
            });
        });
    });

    // load 100 branches
    var branches = [];
    var loadBranches = function (skip, fn) {
        var params = {};
        if (skip) {
            params.skip = skip;
        }
        editor.call('branches:list', params, function (err, data) {
            if (err) {
                console.error(err);
                return;
            }

            var lastBranch = data.result[data.result.length - 1];

            // remove 'our' branch
            for (var i = 0; i < data.result.length; i++) {
                if (data.result[i].id === config.self.branch.id) {
                    data.result.splice(i, 1);
                    break;
                }
            }

            // concatenate result and load more branches
            branches = branches.concat(data.result);
            if (lastBranch && data.pagination.hasMore && branches.length < 100) {
                loadBranches(lastBranch.id, fn);
            } else {
                fn();
            }
        });
    };

    overlay.on('show', function () {
        loadBranches(null, function () {
            if (! branches.length) {
                return;
            }

            // update dropdown
            btnSwitch.disabled = false;
            dropdownBranches._updateOptions(branches.map(function (branch) {
                return {
                    v: branch.id, t: branch.name
                };
            }));
            dropdownBranches.value = branches[0].id;
        });
    });

    overlay.on('hide', function () {
        dropdownBranches._updateOptions({});
        dropdownBranches.value = null;
        btnSwitch.disabled = true;
    });

    editor.method('picker:versioncontrol:mergeOverlay', function () {
        var fullName = config.self.branch.merge.user.fullName;
        if (fullName && fullName.length > 33) {
            fullName = fullName.substring(0, 30) + '...';
        }

        overlay.setTitle(fullName ? fullName + ' is merging branches' : 'Merge in progress');
        overlay.hidden = false;
    });

    editor.method('picker:versioncontrol:mergeOverlay:hide', function () {
        overlay.hidden = true;
    });
});


/* editor/pickers/conflict-manager/picker-conflict-manager-section-field.js */
editor.once('load', function () {
    'use strict';

    // Base class for fields
    var ConflictField = function () {
        this.element = null;
    };

    // Creates a field with the specified value based on the specified type
    ConflictField.create = function (type, value) {
        switch (type) {
            case 'asset':
                return new ConflictFieldAsset(value);
            case 'curve':
            case 'curveset':
                return new ConflictFieldCurve(value);
            case 'entity':
                return new ConflictFieldEntity(value);
            case 'layer':
            case 'batchGroup':
                return new ConflictFieldLayer(value);
            case 'sublayer':
                return new ConflictFieldSublayer(value);
            case 'vec2':
            case 'vec3':
            case 'vec4':
                return new ConflictFieldVector(value);
            case 'rgb':
            case 'rgba':
                return new ConflictFieldColor(value);
            case 'object':
                return new ConflictFieldNotRenderable();
            default:
                return new ConflictFieldString(value);
        }
    };

    ConflictField.prototype.onAddedToDom = function () {
        // reset height
        this.element.parent.style.height = '';
    };

    // Gets / sets the height of the field
    Object.defineProperty(ConflictField.prototype, 'height', {
        get: function () {
            return this.element.parent.element.clientHeight;
        },
        set: function (value) {
            this.element.parent.style.height = value + 'px';
        }
    });

    // A String field
    var ConflictFieldString = function (value) {
        this.element = new ui.Label({
            text: value + ''
        });
        this.element.class.add('field-string', 'selectable');
    };
    ConflictFieldString.prototype = Object.create(ConflictField.prototype);

    // A Vector field
    var ConflictFieldVector = function (value) {
        var panel = new ui.Panel();
        var vars = ['x: ', 'y: ', 'z: ', 'w: '];
        for (var i = 0; i < value.length; i++) {
            var label = new ui.Label({
                text: vars[i] + value[i] + ''
            });
            label.class.add('selectable');
            panel.append(label);
        }

        this.element = panel;
        this.element.class.add('field-vector');
    };
    ConflictFieldVector.prototype = Object.create(ConflictField.prototype);

    // A Color field
    var ConflictFieldColor = function (value) {
        this.element = new ui.ColorField();
        this.element.value = value.map(function (c) { return c * 255; });
        this.element.class.add('field-color');
    };
    ConflictFieldColor.prototype = Object.create(ConflictField.prototype);

    // A Curve field
    var ConflictFieldCurve = function (value) {
        this.element = new ui.CurveField({
            lineWidth: 3
        });
        this.element.value = value ? [value] : null;
        this.element.class.add('field-curve');
    };
    ConflictFieldCurve.prototype = Object.create(ConflictField.prototype);

    // An Asset field
    var ConflictFieldAsset = function (value) {
        this.element = new ui.Panel();
        this.element.class.add('field-asset');

        if (value && value.name) {
            var labelName = new ui.Label({
                text: value.name
            });
            labelName.class.add('asset-name', 'selectable');
            this.element.append(labelName);
        }

        var labelId = new ui.Label({
            text: value ? 'ID: ' + value.id : value + ''
        });
        labelId.class.add('asset-id', 'selectable');
        this.element.append(labelId);
    };
    ConflictFieldAsset.prototype = Object.create(ConflictField.prototype);

    // An Entity field
    var ConflictFieldEntity = function (value) {
        this.element = new ui.Panel();
        this.element.class.add('field-entity');

        if (value) {
            if (value.deleted) {
                var labelDeleted = new ui.Label({
                    text: 'The following parent was deleted on this branch:'
                });
                labelDeleted.class.add('deleted');
                this.element.append(labelDeleted);
            }

            if (value.name) {
                var labelName = new ui.Label({
                    text: value.name
                });
                labelName.class.add('entity-name', 'selectable');
                this.element.append(labelName);
            }
        }

        var labelId = new ui.Label({
            text: value ? 'GUID: ' + value.id : value + ''
        });
        labelId.class.add('entity-id', 'selectable');
        this.element.append(labelId);
    };
    ConflictFieldEntity.prototype = Object.create(ConflictField.prototype);

    // A Layer field
    var ConflictFieldLayer = function (value) {
        this.element = new ui.Label({
            text: value !== null && value !== undefined ? (value.name || value.id) : value + ''
        });
        this.element.class.add('field-layer', 'selectable');
    };
    ConflictFieldLayer.prototype = Object.create(ConflictField.prototype);

    // A sublayer field
    var ConflictFieldSublayer = function (value) {
        this.element = new ui.Label({
            text: value ? value.layer + ' ' + (value.transparent ? 'Transparent' : 'Opaque') : value
        });
        this.element.class.add('field-sublayer', 'selectable');
    };
    ConflictFieldSublayer.prototype = Object.create(ConflictField.prototype);


    // A field saying that the object was deleted in one branch
    var ConflictFieldDeleted = function () {
        this.element = new ui.Panel();
        this.element.class.add('field-deleted');

        var label =  new ui.Label({
            text: 'DELETED'
        });
        label.class.add('title');
        this.element.append(label);

        label =  new ui.Label({
            text: 'This item was deleted on this branch'
        });
        this.element.append(label);
    };
    ConflictFieldDeleted.prototype = Object.create(ConflictField.prototype);

    // A field saying that the object was created in this branch
    var ConflictFieldCreated = function () {
        this.element = new ui.Panel();
        this.element.class.add('field-edited');

        var label =  new ui.Label({
            text: 'CREATED'
        });
        label.class.add('title');
        this.element.append(label);

        label =  new ui.Label({
            text: 'This item was created on this branch'
        });
        this.element.append(label);
    };
    ConflictFieldCreated.prototype = Object.create(ConflictField.prototype);

    // A field saying that the object was edited in one branch
    var ConflictFieldEdited = function () {
        this.element = new ui.Panel();
        this.element.class.add('field-edited');

        var label =  new ui.Label({
            text: 'EDITED'
        });
        label.class.add('title');
        this.element.append(label);

        label =  new ui.Label({
            text: 'This item was edited on this branch'
        });
        this.element.append(label);
    };
    ConflictFieldEdited.prototype = Object.create(ConflictField.prototype);

    // A field saying that no value is available
    var ConflictFieldNotAvailable = function (value) {
        this.element = new ui.Label({
            text: 'Not available'
        });
        this.element.class.add('field-missing');
    };
    ConflictFieldNotAvailable.prototype = Object.create(ConflictField.prototype);

    // A field saying that its value is not renderable
    var ConflictFieldNotRenderable = function (value) {
        this.element = new ui.Label({
            text: 'No preview available'
        });
        this.element.class.add('field-missing');
    };
    ConflictFieldNotRenderable.prototype = Object.create(ConflictField.prototype);

    // An array field is a list of other fields
    var ConflictArrayField = function (type, value) {
        this._size = value.length;

        this.element = new ui.Panel();
        this.element.class.add('field-array');
        this._labelSize = new ui.Label({
            text: 'Array Size: ' + this._size
        });
        this._labelSize.class.add('size');
        this.element.append(this._labelSize);

        this._list = new ui.List();

        for (var i = 0; i < this._size; i++) {
            var item = new ui.ListItem();
            var field = ConflictField.create(type, value[i]);
            field.element.class.add('array-' + type);
            item.element.appendChild(field.element.element);
            this._list.append(item);
        }

        this.element.append(this._list);
    };
    ConflictArrayField.prototype = Object.create(ConflictField.prototype);

    Object.defineProperty(ConflictArrayField.prototype, 'size', {
        get: function () {
            return this._size;
        }
    });

    window.ui.ConflictField = ConflictField;
    window.ui.ConflictArrayField = ConflictArrayField;
    window.ui.ConflictFieldDeleted = ConflictFieldDeleted;
    window.ui.ConflictFieldCreated = ConflictFieldCreated;
    window.ui.ConflictFieldEdited = ConflictFieldEdited;
    window.ui.ConflictFieldNotAvailable = ConflictFieldNotAvailable;
    window.ui.ConflictFieldNotRenderable = ConflictFieldNotRenderable;
});


/* editor/pickers/conflict-manager/picker-conflict-manager-section-row.js */
editor.once('load', function () {
    'use strict';

    var BASE_PANEL = 0;
    var DEST_PANEL = 1;
    var SOURCE_PANEL = 2;

    /**
     * A row that contains the base, source and destination fields.
     * @param {Object} resolver The conflict resolver object
     * @param {Object} args The arguments
     * @param {String} args.name The name of the field
     * @param {Boolean} args.noPath If true then this field has no path (which means the whole object is considered to be a conflict e.g. a whole asset)
     * @param {String} args.type The type of the field (if same type for base, source and destination values)
     * @param {String} args.baseType The type of the base value
     * @param {String} args.sourceType The type of the source value
     * @param {String} args.destType The type of the destination value
     * @param {Object} args.conflict The conflict object
     * @param {Boolean} args.prettify If true the name will be prettified
     */
    var ConflictSectionRow = function (resolver, args) {
        Events.call(this);

        var self = this;
        this._resolver = resolver;
        this._name = args.name;
        if (args.type) {
            this._types = [args.type, args.type, args.type];
        } else {
            this._types = [args.baseType || '', args.destType || '', args.sourceType || ''];
        }
        this._conflict = args.conflict;
        this._resolved = false;

        this._indent = 0;

        this._panels = [];
        this._fields = [];

        var values = this._convertValues(self._conflict);

        // Create 3 panels for base, source and destionation values
        for (var i = 0; i < 3; i++) {
            var panel = new ui.Panel();
            panel.class.add('conflict-field');
            var isArray = self._types[i].startsWith('array:');
            if (isArray) {
                panel.class.add('field-array-container');
                self._types[i] = self._types[i].slice('array:'.length);
            }
            this._panels.push(panel);

            if (!resolver.isDiff) {
                panel.on('hover', this._onHover.bind(this));
                panel.on('blur', this._onUnHover.bind(this));
            }

            // Add indentation to all panels
            // except the base
            if (i !== BASE_PANEL) {
                if (this._indent) {
                    panel.class.add('indent-' + this._indent);
                }
            }

            var label = null;
            if (self._name) {
                label = new ui.Label({
                    text: (args.prettify ? this._prettifyName(self._name) : self._name) + ' :'
                });
                label.class.add('name');
                panel.append(label);
            }

            var field = null;

            if (this._wasMissing(i, self._conflict, resolver.isDiff)) {
                field = new ui.ConflictFieldNotAvailable();
            } else if (this._wasDeleted(i, self._conflict, resolver.isDiff)) {
                field = new ui.ConflictFieldDeleted();
            } else if (this._wasCreated(i, self._conflict, resolver.isDiff)) {
                field = new ui.ConflictFieldCreated();
            } else if (self._types[i].endsWith('object') || args.noPath) {
                if (this._wasEdited(i, self._conflict, resolver.isDiff)) {
                    field = new ui.ConflictFieldEdited();
                } else {
                    field = new ui.ConflictFieldNotRenderable();
                }
            }

            // if for some reason the value is undefined (e.g it could have been too big)
            // then show a missing field
            if (! field && values[i] === undefined) {
                field = new ui.ConflictFieldNotAvailable();
            }

            if (! field) {
                if (isArray) {
                    field = new ui.ConflictArrayField(self._types[i], values[i]);
                } else {
                    field = ui.ConflictField.create(self._types[i], values[i]);
                }
            }

            field.element.class.add('value');
            this._fields.push(field);

            panel.append(field.element);
        }

        if (self._conflict.useSrc) {
            this._panels[SOURCE_PANEL].class.add('selected');
            this._resolved = true;
        } else if (self._conflict.useDst) {
            this._panels[DEST_PANEL].class.add('selected');
            this._resolved = true;
        }

        if (!resolver.isDiff) {
            this._panels[SOURCE_PANEL].on('click', function () {
                if (self._conflict.useSrc) {
                    self.unresolve();
                } else {
                    self.resolveUsingSource();
                }
            });

            this._panels[DEST_PANEL].on('click', function () {
                if (self._conflict.useDst) {
                    self.unresolve();
                } else {
                    self.resolveUsingDestination();
                }
            });
        }
    };

    ConflictSectionRow.prototype = Object.create(Events.prototype);

    ConflictSectionRow.prototype._wasMissing = function (side, conflict, isDiff) {
        if (side === BASE_PANEL && conflict.missingInBase) {
            return true;
        }
        if (side === SOURCE_PANEL && conflict.missingInSrc) {
            if (isDiff) {
                return conflict.missingInDst;
            }
            return conflict.missingInBase;
        }

        if (side === DEST_PANEL && conflict.missingInDst) {
            if (isDiff) {
                return true;
            }
            return conflict.missingInBase;
        }

        return false;
    };

    ConflictSectionRow.prototype._wasDeleted = function (side, conflict, isDiff) {
        if (side === SOURCE_PANEL) {
            if (conflict.missingInSrc) {
                if (isDiff) {
                    return !conflict.missingInDst;
                }
                return !conflict.missingInBase;
            }
        } else if (side === DEST_PANEL) {
            if (conflict.missingInDst) {
                if (isDiff) {
                    // for diffs 'dest' is considered to be the base
                    return false;
                }
                return !conflict.missingInBase;
            }
        }

        return false;
    };

    ConflictSectionRow.prototype._wasCreated = function (side, conflict, isDiff) {
        if (side === SOURCE_PANEL) {
            if (!conflict.missingInSrc) {
                if (isDiff) {
                    return conflict.missingInDst;
                }
                return conflict.missingInBase;
            }
        } else if (side === DEST_PANEL) {
            if (!conflict.missingInDst) {
                if (isDiff) {
                    // we assume the base is the dest when diffing
                    return false;
                }
                return conflict.missingInBase;
            }
        }

        return false;
    };

    ConflictSectionRow.prototype._wasEdited = function (side, conflict, isDiff) {
        if (side === SOURCE_PANEL) {
            if (!conflict.missingInSrc) {
                if (isDiff) {
                    return !conflict.missingInDst;
                }
                return !conflict.missingInBase;
            }
        } else if (side === DEST_PANEL) {
            if (!conflict.missingInDst) {
                if (isDiff) {
                    // we assume the base is the dest when diffing
                    return false;
                }
                return !conflict.missingInBase;
            }
        }

        return false;
    };

    // Returns an array of the 3 values (base, source, dest) after it converts
    // those values from IDs to names (if necessary)
    ConflictSectionRow.prototype._convertValues = function (conflict) {
        var self = this;

        var base = conflict.baseValue;
        var src = conflict.srcValue;
        var dst = conflict.dstValue;

        var baseType = self._types[BASE_PANEL];
        var srcType = self._types[SOURCE_PANEL];
        var dstType = self._types[DEST_PANEL];

        var indexes = {
            'asset': [self._resolver.srcAssetIndex, self._resolver.dstAssetIndex],
            'entity': [self._resolver.srcEntityIndex, self._resolver.dstEntityIndex],
            'layer': [self._resolver.srcSettingsIndex.layers, self._resolver.dstSettingsIndex.layers],
            'batchGroup': [self._resolver.srcSettingsIndex.batchGroups, self._resolver.dstSettingsIndex.batchGroups]
        };

        // convert ids to names
        if (base) {
            // for base values try to find the name first in the source index and then in the destination index
            var handled = false;
            for (var type in indexes) {
                if (baseType === type) {
                    base = self._convertIdToName(base, indexes[type][0], indexes[type][1]);
                    handled = true;
                    break;
                } else if (baseType === 'array:' + type) {
                    base = base.map(function (id) {
                        return self._convertIdToName(id, indexes[type][0], indexes[type][1]);
                    });
                    handled = true;
                    break;
                }
            }

            // special handling for sublayers - use the 'layer' field as the id for the field
            if (! handled && baseType === 'array:sublayer' && base) {
                base.forEach(function (sublayer) {
                    self._convertSublayer(sublayer, indexes.layer[0], indexes.layer[1]);
                });
            }
        }

        if (src) {
            var handled = false;
            for (var type in indexes) {
                if (srcType === type) {
                    src = self._convertIdToName(src, indexes[type][0]);
                    handled = true;
                    break;

                    // TODO: Commented out because in order to do this we also need the base checkpoint
                    // to see if the entity exists in there. Ideally whether the parent was deleted or not should
                    // be stored in the conflict object.
                    // if (type === 'entity' && conflict.path.endsWith('.parent')) {
                    //     // check if parent is deleted
                    //     if (! self._resolver.dstEntityIndex[conflict.srcValue]) {
                    //         src.deleted = true;
                    //     }
                    // }

                } else if (srcType === 'array:' + type) {
                    src = src.map(function (id) {
                        return self._convertIdToName(id, indexes[type][0]);
                    });
                    handled = true;
                    break;
                }
            }

            // special handling for sublayers - use the 'layer' field as the id for the field
            if (! handled && srcType === 'array:sublayer' && src) {
                src.forEach(function (sublayer) {
                    self._convertSublayer(sublayer, indexes.layer[0]);
                });
            }
        }

        if (dst) {
            var handled = false;
            for (var type in indexes) {
                if (dstType === type) {
                    dst = self._convertIdToName(dst, indexes[type][1]);
                    handled = true;
                    break;

                    // TODO: Commented out because in order to do this we also need the base checkpoint
                    // to see if the entity exists in there. Ideally whether the parent was deleted or not should
                    // be stored in the conflict object.
                    // if (type === 'entity' && conflict.path.endsWith('.parent')) {
                    //     // check if parent is deleted
                    //     if (! self._resolver.srcEntityIndex[conflict.dstValue]) {
                    //         dst.deleted = true;
                    //     }
                    // }
                } else if (dstType === 'array:' + type) {
                    dst = dst.map(function (id) {
                        return self._convertIdToName(id, indexes[type][1]);
                    });
                    handled = true;
                    break;
                }
            }

            // special handling for sublayers - use the 'layer' field as the id for the field
            if (! handled && dstType === 'array:sublayer' && dst) {
                dst.forEach(function (sublayer) {
                    self._convertSublayer(sublayer, indexes.layer[1]);
                });
            }
        }

        var result = new Array(3);
        result[BASE_PANEL] = base;
        result[SOURCE_PANEL] = src;
        result[DEST_PANEL] = dst;
        return result;
    };

    ConflictSectionRow.prototype._convertIdToName = function (id, index, alternativeIndex) {
        if (id === null || id === undefined) {
            return id;
        }

        var result = {
            id: id,
            name: null
        };

        var name = index[id];
        if (name === undefined && alternativeIndex) {
            name = alternativeIndex[id];
        }

        if (name !== undefined) {
            result.name = name;
        }

        return result;
    };

    ConflictSectionRow.prototype._convertSublayer = function (sublayer, index, alternativeIndex) {
        var layer = this._convertIdToName(sublayer.layer, index, alternativeIndex);
        sublayer.layer = (layer.name || layer.id);
    };

    ConflictSectionRow.prototype._onHover = function () {
        for (var i = 0; i < 3; i++) {
            this._panels[i].class.add('hovered');
        }
    };

    ConflictSectionRow.prototype._onUnHover = function () {
        for (var i = 0; i < 3; i++) {
            this._panels[i].class.remove('hovered');
        }
    };

    ConflictSectionRow.prototype.indent = function () {
        this._panels[BASE_PANEL].class.remove('indent-' + this._indent);
        this._indent++;
        this._panels[BASE_PANEL].class.add('indent-' + this._indent);
    };

    ConflictSectionRow.prototype.unindent = function () {
        this._panels[BASE_PANEL].class.remove('indent-' + this._indent);
        this._indent--;
        if (this._indent) {
            this._panels[BASE_PANEL].class.add('indent-' + this._indent);
        }
    };

    // Converts values like so: thisIsSomeValue to this: This Is Some Value
    ConflictSectionRow.prototype._prettifyName = function (name) {
        var firstLetter = name[0];
        var rest = name.slice(1);
        return firstLetter.toUpperCase() +
        rest
        // insert a space before all caps and numbers
        .replace(/([A-Z0-9])/g, ' $1')
        // replace special characters with spaces
        .replace(/[^a-zA-Z0-9](.)/g, function (match, group) {
            return ' ' + group.toUpperCase();
        });
    };

    ConflictSectionRow.prototype.unresolve = function () {
        if (! this._resolved) return;

        this._resolved = false;

        this._conflict.useDst = false;
        this._conflict.useSrc = false;

        this._panels[SOURCE_PANEL].class.remove('selected');
        this._panels[DEST_PANEL].class.remove('selected');

        this.emit('unresolve', this._conflict.id);
    };

    ConflictSectionRow.prototype.resolveUsingSource = function () {
        if (this._conflict.useSrc) return;

        this.unresolve();
        this._conflict.useSrc = true;
        this._panels[SOURCE_PANEL].class.add('selected');
        this._resolved = true;

        this.emit('resolve', this._conflict.id, {
            useSrc: true
        });
    };

    ConflictSectionRow.prototype.resolveUsingDestination = function () {
        if (this._conflict.useDst) return;

        this.unresolve();
        this._conflict.useDst = true;
        this._panels[DEST_PANEL].class.add('selected');
        this._resolved = true;

        this.emit('resolve', this._conflict.id, {
            useDst: true
        });
    };

    // Appends all row panels to parent panels
    ConflictSectionRow.prototype.appendToParents = function (parents) {
        for (var i = 0; i < parents.length; i++) {
            parents[i].append(this._panels[i]);
        }
    };

    // Sets the height of each value to be the maximum of the 3 heights
    ConflictSectionRow.prototype.onAddedToDom = function () {
        var i;
        for (i = 0; i < 3; i++) {
            this._fields[i].onAddedToDom();
        }

        var maxHeight = Math.max(this._fields[0].height, this._fields[1].height);
        maxHeight = Math.max(maxHeight, this._fields[2].height);

        for (i = 0; i < 3; i++) {
            this._fields[i].height = maxHeight;
        }
    };

    ConflictSectionRow.prototype.destroy = function () {
        this.unbind();
    };

    Object.defineProperty(ConflictSectionRow.prototype, 'resolved', {
        get: function () {
            return this._resolved;
        }
    });

    window.ui.ConflictSectionRow = ConflictSectionRow;
});


/* editor/pickers/conflict-manager/picker-conflict-manager-section.js */
editor.once('load', function () {
    'use strict';

    // A section contains multiple conflicts and it's meant to group
    // conflicts into meaningful categories
    var ConflictSection = function (resolver, title, foldable, allowCloaking) {
        Events.call(this);
        this._resolver = resolver;
        this._numConflicts = 0;
        this._numResolvedConflicts = 0;
        this._indent = 0;

        this._foldable = foldable;
        this._allowCloaking = allowCloaking;
        this._cloaked = false;
        this._cloakFn = this.cloakIfNecessary.bind(this);

        this.panel = new ui.Panel(title);
        this.panel.class.add('section');
        this.panel.foldable = foldable;
        this.panel.flex = true;
        this.panel.on('fold', function () {
            resolver.emit('section:fold');
        });
        this.panel.on('unfold', function () {
            resolver.emit('section:unfold');
        });

        if (this._allowCloaking) {
            resolver.on('section:fold', this.cloakIfNecessaryDeferred.bind(this));
            resolver.on('section:unfold', this.cloakIfNecessaryDeferred.bind(this));
            resolver.on('scroll', this.cloakIfNecessaryDeferred.bind(this));
        }

        this._panelBase = new ui.Panel();
        this._panelBase.class.add('base');
        this.panel.append(this._panelBase);
        this._panelBase.hidden = resolver.isDiff;

        this._panelDest = new ui.Panel();
        this._panelDest.class.add('mine');
        this.panel.append(this._panelDest);

        this._panelSource = new ui.Panel();
        this._panelSource.class.add('theirs');
        this.panel.append(this._panelSource);

        this.panels = [
            this._panelBase,
            this._panelDest,
            this._panelSource
        ];

        this._labelNumConflicts = new ui.Label({
            text: '0/0'
        });
        this._labelNumConflicts.renderChanges = false;
        this._labelNumConflicts.class.add('num-conflicts');
        this._labelNumConflicts.hidden = resolver.isDiff;
        this.panel.headerElement.appendChild(this._labelNumConflicts.element);

        this._rows = [];
    };

    ConflictSection.prototype = Object.create(Events.prototype);

    ConflictSection.prototype.indent = function () {
        this._indent++;
    };

    ConflictSection.prototype.unindent = function () {
        this._indent--;
    };

    // Adds a title that spans all 3 panels
    ConflictSection.prototype.appendTitle = function (title, light) {
        var label;

        var startIndex = this._resolver.isDiff ? 1 : 0;

        for (var i = startIndex; i < 3; i++) {
            label = new ui.Label({
                text: i === startIndex ? title : ''
            });
            label.class.add('title');
            if (light) {
                label.class.add('light');
            }
            if (this._indent) {
                label.class.add('indent-' + this._indent);
            }
            this.panels[i].append(label);
        }
    };

    /**
     * Append a new field to the section. This will create
     * a new field on all 3 panels (base, source, destination);
     * @param {Object} args The field options
     * @param {String} args.name The name of the field
     * @param {Boolean} args.prettify If true the name will be 'prettified'
     * @param {String} args.type The type of the field if it's the same for all base, source and destination values
     * @param {String} args.baseType The type of the base value
     * @param {String} args.sourceType The type of the source value
     * @param {String} args.destType The type of the destination value
     * @param {Object} args.conflict The conflict object
     */
    ConflictSection.prototype.appendField = function (args) {
        var row = new ui.ConflictSectionRow(this._resolver, args);
        this._rows.push(row);

        for (var i = 0; i < this._indent; i++) {
            row.indent();
        }

        row.appendToParents(this.panels);

        row.on('resolve', this.onConflictResolved.bind(this));
        row.on('unresolve', this.onConflictUnresolved.bind(this));

        this.numConflicts++;
        if (row.resolved) {
            this.numResolvedConflicts++;
        }
    };

    ConflictSection.prototype.appendAllFields = function (args) {
        var fields = args.fields;
        var title = args.title;
        var except = args.except;
        var schema = args.schema;

        // check if 'fields' is actually a conflict object already
        // and if missingInDst or missingInSrc is true in which case
        // report this entry as 'deleted' or 'edited' in the UI
        if (fields.missingInDst || fields.missingInSrc) {
            this.appendField({
                type: editor.call('schema:' + schema + ':getType', fields.path),
                conflict: fields
            });
            return;
        }

        var addedTitle = false;

        for (var field in fields)  {
            if (except && except.indexOf(field) !== -1) continue;

            var path = fields[field].path;
            if (! path) continue;

            if (! addedTitle && title) {
                addedTitle = true;
                this.appendTitle(title);
            }

            var type = editor.call('schema:' + schema + ':getType', path);

            this.appendField({
                name: field,
                type: type,
                conflict: fields[field],
                prettify: true
            });
        }
    };

    ConflictSection.prototype.onConflictResolved = function (conflictId, data) {
        this.numResolvedConflicts++;
        this.emit('resolve', conflictId, data);
    };

    ConflictSection.prototype.onConflictUnresolved = function (conflictId) {
        this.numResolvedConflicts--;
        this.emit('unresolve', conflictId);
    };

    ConflictSection.prototype.onAddedToDom = function () {
        // make value fields in the same row have equal heights
        for (var i = 0, len = this._rows.length; i < len; i++) {
            this._rows[i].onAddedToDom();
        }

        if (this._allowCloaking) {
            this.cloakIfNecessary();
        }
    };

    ConflictSection.prototype.cloakIfNecessaryDeferred = function () {
        setTimeout(this._cloakFn, 100);
    };

    // Checks if the section is visible in the viewport. If not it will 'cloak'
    // it meaning it will hide all of its contents but keep its original height
    // to make the DOM faster to render
    ConflictSection.prototype.cloakIfNecessary = function () {
        if (!this.panel.parent) {
            return;
        }

        var parentRect = this.panel.parent.element.getBoundingClientRect();
        var rect = this.panel.element.getBoundingClientRect();
        var safetyMargin = 200;
        if (rect.bottom < parentRect.top - safetyMargin || rect.top > parentRect.bottom + safetyMargin) {
            if (!this._cloaked) {
                this._cloaked = true;
                var height = rect.height;
                this.panel.element.style.height = height + 'px';
                this.panel.class.remove('foldable');
                this.panel.class.add('cloaked');
            }
        } else if (this._cloaked) {
            this._cloaked = false;
            this.panel.element.style.height = '';
            this.panel.class.remove('cloaked');
            if (this._foldable) {
                this.panel.foldable = true;
            }
        }
    };

    ConflictSection.prototype.resolveUsingSource = function () {
        for (var i = 0, len = this._rows.length; i < len; i++) {
            this._rows[i].resolveUsingSource();
        }
    };

    ConflictSection.prototype.resolveUsingDestination = function () {
        for (var i = 0, len = this._rows.length; i < len; i++) {
            this._rows[i].resolveUsingDestination();
        }
    };

    ConflictSection.prototype.destroy = function () {
        this.unbind();
        this.panel.destroy();
        this.panels.length = 0;
        this._rows.forEach(function (row) {
            row.destroy();
        });
        this._rows.length = 0;
    };

    Object.defineProperty(ConflictSection.prototype, 'numConflicts', {
        get: function () {
            return this._numConflicts;
        },
        set: function (value) {
            this._numConflicts = value;
            this._labelNumConflicts.text = this._numResolvedConflicts + '/' + this._numConflicts;
        }
    });

    Object.defineProperty(ConflictSection.prototype, 'numResolvedConflicts', {
        get: function () {
            return this._numResolvedConflicts;
        },
        set: function (value) {
            this._numResolvedConflicts = value;
            this._labelNumConflicts.text = this._numResolvedConflicts + '/' + this._numConflicts;
        }
    });

    window.ui.ConflictSection = ConflictSection;
});


/* editor/pickers/conflict-manager/picker-conflict-manager-resolver.js */
editor.once('load', function () {
    'use strict';

    // Shows all the conflicts for an item
    var ConflictResolver = function (conflicts, mergeObject) {
        Events.call(this);

        // holds conflict UI elements
        this.elements = [];

        this._conflicts = conflicts;
        this._mergeId = mergeObject.id;
        this.isDiff = mergeObject.isDiff;

        this.srcAssetIndex = mergeObject.srcCheckpoint.assets;
        this.dstAssetIndex = mergeObject.dstCheckpoint.assets;

        var srcScene = conflicts.itemType === 'scene' ? mergeObject.srcCheckpoint.scenes[conflicts.itemId] : null;
        this.srcEntityIndex = srcScene && srcScene.entities || {};
        var dstScene = conflicts.itemType === 'scene' ? mergeObject.dstCheckpoint.scenes[conflicts.itemId] : null;
        this.dstEntityIndex = dstScene && dstScene.entities || {};

        this.srcSettingsIndex = mergeObject.srcCheckpoint.settings;
        this.dstSettingsIndex = mergeObject.dstCheckpoint.settings;

        this._pendingResolvedConflicts = {};
        this._pendingRevertedConflicts = {};
        this._timeoutSave = null;

        this._parent = null;

        this._scrollListener = function () {
            this.emit('scroll');
        }.bind(this);
    };

    ConflictResolver.prototype = Object.create(Events.prototype);

    // When a conflict is resolved add it to the pending resolved conflicts
    // So that it's saved to the server after a frame
    ConflictResolver.prototype.onConflictResolved = function (conflictId, data) {
        delete this._pendingRevertedConflicts[conflictId];
        this._pendingResolvedConflicts[conflictId] = data;
        if (this._timeoutSave) {
            clearTimeout(this._timeoutSave);
        }
        this._timeoutSave = setTimeout(this.saveConflicts.bind(this));

        this.emit('resolve', conflictId, data);
    };

    // When a conflict is unresolved add it to the pending unresolved conflicts
    // so that it's saved to the server after a frame
    ConflictResolver.prototype.onConflictUnresolved = function (conflictId) {
        delete this._pendingResolvedConflicts[conflictId];
        this._pendingRevertedConflicts[conflictId] = true;
        if (this._timeoutSave) {
            clearTimeout(this._timeoutSave);
        }
        this._timeoutSave = setTimeout(this.saveConflicts.bind(this));

        this.emit('unresolve', conflictId);
    };

    // Save conflict status on the server
    ConflictResolver.prototype.saveConflicts = function () {
        var useSrc = [];
        var useDst = [];
        var revert = Object.keys(this._pendingRevertedConflicts);

        // Group conflicts by status to minimize REST API calls
        for (var conflictId in this._pendingResolvedConflicts) {
            if (this._pendingResolvedConflicts[conflictId].useSrc) {
                useSrc.push(conflictId);
            } else {
                useDst.push(conflictId);
            }
        }

        if (useSrc.length) {
            editor.call('branches:resolveConflicts', this._mergeId, useSrc, { useSrc: true });
        }
        if (useDst.length) {
            editor.call('branches:resolveConflicts', this._mergeId, useDst, { useDst: true });
        }
        if (revert.length) {
            editor.call('branches:resolveConflicts', this._mergeId, revert, { revert: true });
        }
    };

    // Creates a section that has a title and can be foldable. Sections contain conflicts
    ConflictResolver.prototype.createSection = function (title, foldable, cloakIfNecessary) {
        var section = new ui.ConflictSection(this, title, foldable, cloakIfNecessary);
        section.on('resolve', this.onConflictResolved.bind(this));
        section.on('unresolve', this.onConflictUnresolved.bind(this));
        this.elements.push(section);
        return section;
    };

    // Creates a separator which is a title that spans all conflict panels
    ConflictResolver.prototype.createSeparator = function (title) {
        var label = new ui.Label({
            text: title
        });
        label.class.add('section-separator');
        this.elements.push(label);
        return label;
    };

    // Append the resolver to a parent
    ConflictResolver.prototype.appendToParent = function (parent) {
        this._parent = parent;

        for (var i = 0, len = this.elements.length; i < len; i++) {
            var element = this.elements[i];
            if (element instanceof ui.ConflictSection) {
                // only append a section if it has conflicts
                if (element.numConflicts) {
                    parent.append(element.panel);
                }
            } else {
                parent.append(element);
            }
        }

        parent.element.addEventListener('scroll', this._scrollListener, false);

        // Reflow (call onAddedToDom) after 2 frames. The reason why it's 2 frames
        // and not 1 is it doesn't always work on 1 frame and I don't know why yet..
        // The problem is that if we don't wait then sometimes some elements will not report
        // the correct height, probably because of some animation or delayed layout calculation
        // somewhere...
        var self = this;
        requestAnimationFrame(function () {
            requestAnimationFrame(self.reflow.bind(self));
        });
    };

    // Calls onAddedToDom on every section
    ConflictResolver.prototype.reflow = function () {
        for (var i = 0, len = this.elements.length; i < len; i++) {
            var element = this.elements[i];
            if (element instanceof ui.ConflictSection) {
                element.onAddedToDom();
            }
        }

        this.emit('reflow');
    };

    // Resolves all conflicts using the source values
    ConflictResolver.prototype.resolveUsingSource = function () {
        for (var i = 0, len = this.elements.length; i < len; i++) {
            var element = this.elements[i];
            if (element instanceof ui.ConflictSection) {
                element.resolveUsingSource();
            }
        }
    };

    // Resolves all conflicts using the destination values
    ConflictResolver.prototype.resolveUsingDestination = function () {
        for (var i = 0, len = this.elements.length; i < len; i++) {
            var element = this.elements[i];
            if (element instanceof ui.ConflictSection) {
                element.resolveUsingDestination();
            }
        }
    };

    // Destroyes the resolver and its UI elements
    ConflictResolver.prototype.destroy = function () {
        this.unbind();

        if (this._parent) {
            this._parent.element.removeEventListener('scroll', this._scrollListener, false);
            this._parent = null;
        }

        for (var i = 0, len = this.elements.length; i < len; i++) {
            this.elements[i].destroy();
        }
        this.elements.length = 0;
    };

    window.ui.ConflictResolver = ConflictResolver;
});


/* editor/pickers/conflict-manager/picker-conflict-manager-text-resolver.js */
editor.once('load', function () {
    'use strict';

    /**
     * Contains the UI for showing text conflicts using
     * an i-framed code editor. Also contains buttons to resolve
     * the merged file.
     * @param {Object} conflict The conflict group
     * @param {Object} mergeObject The merge object
     */
    var TextResolver = function (conflict, mergeObject) {
        Events.call(this);

        this._mergeId = mergeObject.id;
        this._conflict = conflict;
        this._sourceBranchId = mergeObject.sourceBranchId;
        this._destBranchId = mergeObject.destinationBranchId;

        this._isDiff = mergeObject.isDiff;

        this._panelTop = new ui.Panel();
        this._panelTop.class.add('textmerge-top');
        this._panelTop.hidden = true;

        this._labelName = new ui.Label({
            text: conflict.itemName
        });
        this._labelName.class.add('name');
        this._labelName.renderChanges = false;
        this._panelTop.append(this._labelName);

        // find textual merge conflict
        this._textualMergeConflict = null;
        for (var i = 0; i < conflict.data.length; i++) {
            if (conflict.data[i].isTextualMerge) {
                this._textualMergeConflict = conflict.data[i];
                break;
            }
        }

        // button to mark resolved
        this._btnMarkResolved = new ui.Button({
            text: 'MARK AS RESOLVED'
        });
        this._btnMarkResolved.class.add('mark-resolved');
        this._btnMarkResolved.on('click', this._onClickMarkResolved.bind(this));
        this._btnMarkResolved.hidden = this._isDiff;
        this._panelTop.append(this._btnMarkResolved);

        // button that opens dropdown menu
        this._btnUseAllFrom = new ui.Button({
            text: 'USE ALL FROM...'
        });
        this._btnUseAllFrom.class.add('use-all');
        this._panelTop.append(this._btnUseAllFrom);
        this._btnUseAllFrom.on('click', this._onClickUseAllFrom.bind(this));
        this._btnUseAllFrom.hidden = this._isDiff;

        // revert all changes
        this._btnRevert = new ui.Button({
            text: 'REVERT CHANGES'
        });
        this._btnRevert.on('click', this._onClickRevert.bind(this));
        this._panelTop.append(this._btnRevert);
        this._btnRevert.hidden = this._isDiff;

        // dropdown menu
        this._menu = new ui.Menu();
        this._menu.class.add('textmerge-dropdown');
        editor.call('layout.root').append(this._menu);

        // use all from source
        this._btnUseSource = new ui.MenuItem({
            icon: '&#58265;',
            text: mergeObject.sourceBranchName
        });
        this._menu.append(this._btnUseSource);
        this._btnUseSource.on('select', this._onClickUseSource.bind(this));

        // use all from dest
        this._btnUseDest = new ui.MenuItem({
            icon: '&#58265;',
            text: mergeObject.destinationBranchName
        });
        this._menu.append(this._btnUseDest);
        this._btnUseDest.on('select', this._onClickUseDest.bind(this));

        // go to next conflict
        this._btnNextConflict = new ui.Button({
            text: 'NEXT'
        });
        this._btnNextConflict.class.add('go-to-next');
        this._panelTop.append(this._btnNextConflict);
        this._btnNextConflict.on('click', this._onClickNext.bind(this));
        this._btnNextConflict.hidden = this._isDiff;

        // go to prev conflict
        this._btnPrevConflict = new ui.Button({
            text: 'PREV'
        });
        this._btnPrevConflict.class.add('go-to-prev');
        this._panelTop.append(this._btnPrevConflict);
        this._btnPrevConflict.on('click', this._onClickPrev.bind(this));
        this._btnPrevConflict.hidden = this._isDiff;

        // go back to asset conflicts
        this._btnGoBack = new ui.Button({
            text: this._isDiff ? 'VIEW ASSET CHANGES' : 'VIEW ASSET CONFLICTS'
        });
        // hide this button if there are only textual conflicts
        if (this._textualMergeConflict && conflict.data.length <= 1)  {
            this._btnGoBack.hidden = true;
        }

        this._btnGoBack.class.add('go-back');
        this._panelTop.append(this._btnGoBack);
        this._btnGoBack.on('click', this._onClickGoBack.bind(this));

        this._iframe = document.createElement('iframe');
        this._iframe.addEventListener('load', function () {
            this._panelTop.hidden = false;
        }.bind(this));

        this._iframe.src = '/editor/code/' + config.project.id + '?mergeId=' + this._mergeId + '&conflictId=' + this._textualMergeConflict.id + '&assetType=' + this._conflict.assetType + '&mergedFilePath=' + this._textualMergeConflict.mergedFilePath;

        this._sourceFile = null;
        this._destFile = null;
        this._unresolvedFile = null;
    };

    TextResolver.prototype = Object.create(Events.prototype);

    TextResolver.prototype.appendToParent = function (parent) {
        parent.append(this._panelTop);
        parent.append(this._iframe);
    };

    TextResolver.prototype.destroy = function () {
        this._panelTop.destroy();
        if (this._iframe.parentElement) {
            this._iframe.parentElement.removeChild(this._iframe);
        }

        this._panelTop = null;
        this._iframe = null;
    };

    TextResolver.prototype._codeEditorMethod = function (method, arg1, arg2, arg3, arg4) {
        return this._iframe.contentWindow.editor.call(method, arg1, arg2, arg3, arg4);
    };

    TextResolver.prototype._onClickMarkResolved = function () {
        var hasMoreConflicts = this._codeEditorMethod('editor:merge:getNumberOfConflicts') > 0;
        if (hasMoreConflicts) {
            editor.call(
                'picker:confirm',
                'There are more unresolved conflicts in this file. Are you sure you want to mark it as resolved?',
                this._uploadResolved.bind(this)
            );
        } else {
            this._uploadResolved();
        }
    };

    TextResolver.prototype._uploadResolved = function () {
        this._toggleButtons(false);

        this._btnMarkResolved.disabled = true;
        var content = this._codeEditorMethod('editor:merge:getContent');
        var file = new Blob([content]);
        editor.call('conflicts:uploadResolvedFile', this._textualMergeConflict.id, file, function (err) {
            this._toggleButtons(true);
            this._btnMarkResolved.disabled = false;
            if (err) {
                console.error(err);
                return;
            }

            this._textualMergeConflict.useMergedFile = true;
            this.emit('resolve', this._textualMergeConflict.id, {
                useMergedFile: true
            });

        }.bind(this));
    };

    TextResolver.prototype._toggleButtons = function (toggle) {
        this._btnGoBack.disabled = !toggle;
        this._btnMarkResolved.disabled = !toggle;
        this._btnUseAllFrom.disabled = !toggle;
        this._btnRevert.disabled = !toggle;
        this._btnUseDest.disabled = !toggle;
        this._btnUseSource.disabled = !toggle;
    };

    TextResolver.prototype._onClickUseAllFrom = function () {
        this._menu.open = !this._menu.open;
        requestAnimationFrame(function () {
            var menuRect = this._menu.innerElement.getBoundingClientRect();
            var btnRect = this._btnUseAllFrom.element.getBoundingClientRect();
            this._menu.position(btnRect.left - (menuRect.width - btnRect.width), btnRect.bottom);
        }.bind(this));
    };

    TextResolver.prototype._onClickGoBack = function () {
        if (!this._isDiff && this._codeEditorMethod('editor:merge:isDirty')) {
            editor.call('picker:confirm', 'Your changes will not be saved unless you hit "Mark As Resolved". Are you sure you want to go back?', function () {
                this.emit('close');
            }.bind(this));
        } else {
            this.emit('close');
        }
    };

    TextResolver.prototype._onClickUseSource = function () {
        if (this._sourceFile) {
            this._codeEditorMethod('editor:merge:setContent', this._sourceFile);
            return;
        }

        this._toggleButtons(false);

        editor.call(
            'checkpoints:getAssetFile',
            this._conflict.itemId,
            this._sourceBranchId,
            this._conflict.srcImmutableBackup,
            this._conflict.srcFilename,
            function (err, data) {
                this._toggleButtons(true);

                if (err) {
                    return editor.call('status:error', err);
                }

                this._sourceFile = data;
                this._codeEditorMethod('editor:merge:setContent', this._sourceFile);

            }.bind(this)
        );
    };

    TextResolver.prototype._onClickUseDest = function () {

        if (this._destFile) {
            this._codeEditorMethod('editor:merge:setContent', this._destFile);
            return;
        }

        this._toggleButtons(false);
        editor.call(
            'checkpoints:getAssetFile',
            this._conflict.itemId,
            this._destBranchId,
            this._conflict.dstImmutableBackup,
            this._conflict.dstFilename,
            function (err, data) {
                this._toggleButtons(true);

                if (err) {
                    return editor.call('status:error', err);
                }

                this._destFile = data;
                this._codeEditorMethod('editor:merge:setContent', this._destFile);
            }.bind(this)
        );

    };

    TextResolver.prototype._onClickRevert = function () {
        if (this._unresolvedFile) {
            this._codeEditorMethod('editor:merge:setContent', this._unresolvedFile);
            return;
        }

        this._toggleButtons(false);

        editor.call('conflicts:getUnresolvedFile',
            this._mergeId,
            this._textualMergeConflict.id,
            this._textualMergeConflict.mergedFilePath,
            function (err, data) {
                this._toggleButtons(true);
                if (err) {
                    return editor.call('status:error', err);
                }

                this._unresolvedFile = data;
                this._codeEditorMethod('editor:merge:setContent', this._unresolvedFile);
            }.bind(this)
        );
    };

    TextResolver.prototype._onClickNext = function () {
        this._codeEditorMethod('editor:merge:goToNextConflict');
    };

    TextResolver.prototype._onClickPrev = function () {
        this._codeEditorMethod('editor:merge:goToPrevConflict');
    };

    window.ui.TextResolver = TextResolver;
});


/* editor/pickers/conflict-manager/picker-conflict-manager-scene.js */
editor.once('load', function () {
    'use strict';

    var componentSchema = config.schema.scene.entities.$of.components;

    // Shows conflicts for a scene
    editor.method('picker:conflictManager:showSceneConflicts', function (parent, conflicts, mergeObject) {
        // create resolver
        var resolver = new ui.ConflictResolver(conflicts, mergeObject);

        // Build index of conflicts so that the conflicts become
        // a hierarchical object
        var index = {};
        for (var i = 0, len = conflicts.data.length; i < len; i++) {
            var conflict = conflicts.data[i];
            // check if the whole scene has changed (e.g. deleted in one branch)
            if (conflict.path === '') {
                index = conflict;
                break;
            }

            var parts = conflict.path.split('.');
            var plen = parts.length;
            var target = index;

            for (var p = 0; p < plen - 1; p++) {
                if (! target.hasOwnProperty(parts[p])) {
                    target[parts[p]] = {};
                }
                target = target[parts[p]];
            }

            target[parts[plen - 1]] = conflict;
        }

        // Check if the whole scene has been deleted in one branch
        if (index.missingInDst || index.missingInSrc) {
            var sectionScene = resolver.createSection(conflicts.itemName);
            sectionScene.appendField({
                type: 'object',
                conflict: index
            });

            resolver.appendToParent(parent);
            return resolver;
        }

        // Scene properties
        var sectionProperties = resolver.createSection('PROPERTIES');
        sectionProperties.appendAllFields({
            schema: 'scene',
            fields: index
        });

        // append scene settings
        if (index.settings) {
            for (var key in index.settings) {
                sectionProperties.appendAllFields({
                    schema: 'scene',
                    fields: index.settings[key]
                });
            }
        }

        // Entities
        if (index.entities) {
            resolver.createSeparator('ENTITIES');

            // for diffs it's more likely that we are going to have a large
            // number of entities so cloak sections that are out of view if we have a lot
            // of entities to improve DOM performance
            var allowSectionCloaking = false;
            if (resolver.isDiff) {
                var numEntities = Object.keys(index.entities).length;
                allowSectionCloaking = numEntities > 50;
            }

            for (var key in index.entities) {
                // create title for entity section
                var entityName = resolver.srcEntityIndex[key] || resolver.dstEntityIndex[key];
                if (entityName) {
                    entityName = "'" + entityName + "' - " + key;
                } else {
                    entityName = key;
                }

                // create entity section
                var sectionEntity = resolver.createSection(entityName, true, allowSectionCloaking);
                var entity = index.entities[key];

                // append entity properties
                sectionEntity.appendAllFields({
                    schema: 'scene',
                    fields: entity,
                    title: 'ENTITY PROPERTIES'
                });

                // Components
                if (entity.components) {
                    for (var component in componentSchema) {
                        if (! entity.components.hasOwnProperty(component)) continue;
                        sectionEntity.appendTitle(component.toUpperCase() + ' COMPONENT');

                        // handle script component so that script attributes appear
                        // after the rest of the component properties
                        if (component === 'script') {
                            sectionEntity.appendAllFields({
                                schema: 'scene',
                                fields: entity.components[component],
                                except: ['scripts']
                            });

                            // add script attributes after
                            var scripts = entity.components.script.scripts;
                            if (scripts) {
                                for (var scriptName in scripts) {
                                    if (! scripts[scriptName]) continue;

                                    sectionEntity.appendTitle(scriptName, true);

                                    // check if script was deleted in one of the branches
                                    if (scripts[scriptName].missingInSrc || scripts[scriptName].missingInDst) {
                                        sectionEntity.appendField({
                                            type: editor.call('schema:scene:getType', scripts[scriptName].path),
                                            conflict: scripts[scriptName]
                                        });
                                        continue;
                                    }

                                    // append all fields for that specific script instance
                                    // except script attributes which are done after
                                    sectionEntity.appendAllFields({
                                        schema: 'scene',
                                        fields: scripts[scriptName],
                                        except: ['attributes']
                                    });

                                    var attributes = scripts[scriptName].attributes;
                                    if (! attributes) continue;

                                    for (var attributeName in attributes) {
                                        var attribute = attributes[attributeName];
                                        if (! attribute) continue;

                                        sectionEntity.appendField({
                                            name: attributeName,
                                            baseType: attribute.baseType,
                                            sourceType: attribute.srcType,
                                            destType: attribute.dstType,
                                            conflict: attribute
                                        });
                                    }
                                }
                            }
                        } else if (component === 'sound') {
                            // handle sound component so that sound slots appear after the rest of the component properties
                            sectionEntity.appendAllFields({
                                schema: 'scene',
                                fields: entity.components[component],
                                except: ['slots']
                            });

                            var slots = entity.components.sound.slots;
                            if (slots) {
                                for (var key in slots) {
                                    sectionEntity.appendTitle('SOUND SLOT ' + key, true);
                                    sectionEntity.appendAllFields({
                                        schema: 'scene',
                                        fields: slots[key]
                                    });
                                }
                            }
                        } else if (component === 'sprite') {
                            // handle sprite component so that clips appear after the rest of the component properties
                            sectionEntity.appendAllFields({
                                schema: 'scene',
                                fields: entity.components[component],
                                except: ['clips']
                            });

                            var clips = entity.components.sprite.clips;
                            if (clips) {
                                for (var key in clips) {
                                    sectionEntity.appendTitle('CLIP ' + key, true);
                                    sectionEntity.appendAllFields({
                                        schema: 'scene',
                                        fields: clips[key]
                                    });
                                }
                            }
                        } else if (component === 'model') {
                            // handle all model properties except mapping
                            sectionEntity.appendAllFields({
                                schema: 'scene',
                                fields: entity.components[component],
                                except: ['mapping']
                            });

                            // handle mapping
                            var mapping = entity.components.model.mapping;
                            if (mapping) {
                                for (var key in mapping) {
                                    sectionEntity.appendTitle('ENTITY MATERIAL ' + key, true);

                                    sectionEntity.appendField({
                                        name: 'Material',
                                        type: editor.call('schema:scene:getType', mapping[key].path),
                                        conflict: mapping[key]
                                    });
                                }
                            }
                        } else {
                            // add component fields
                            sectionEntity.appendAllFields({
                                schema: 'scene',
                                fields: entity.components[component]
                            });
                        }
                    }
                }

            }
        }

        resolver.appendToParent(parent);

        return resolver;
    });
});


/* editor/pickers/conflict-manager/picker-conflict-manager-settings.js */
editor.once('load', function () {
    'use strict';

    var getLayerName = function (id, mergeObject) {
        // try to get layer name from destination checkpoint first and if not
        // available try the source checkpoint
        return mergeObject.dstCheckpoint.settings.layers[id] ||
               mergeObject.srcCheckpoint.settings.layers[id] ||
               id;
    };

    var getBatchGroupName = function (id, mergeObject) {
        // try to get batch group name from destination checkpoint first and if not
        // available try the source checkpoint
        return mergeObject.dstCheckpoint.settings.batchGroups[id] ||
               mergeObject.srcCheckpoint.settings.batchGroups[id] ||
               id;
    };

    // Shows conflicts for project settings
    editor.method('picker:conflictManager:showSettingsConflicts', function (parent, conflicts, mergeObject) {
        var resolver = new ui.ConflictResolver(conflicts, mergeObject);

        // temp check to see if just all settings have changed with no
        // more details
        if (conflicts.data.length === 1 && conflicts.data[0].path === '') {
            var sectionSettings = resolver.createSection('PROJECT SETTINGS');
            sectionSettings.appendField({
                type: 'object',
                conflict: conflicts.data[0]
            });
            resolver.appendToParent(parent);
            return resolver;
        }

        // Build index of conflicts so that the conflicts become
        // a hierarchical object
        var index = {};
        for (var i = 0, len = conflicts.data.length; i < len; i++) {
            var conflict = conflicts.data[i];
            var parts = conflict.path.split('.');
            var target = index;

            for (var p = 0; p < parts.length - 1; p++) {
                if (! target.hasOwnProperty(parts[p])) {
                    target[parts[p]] = {};
                }
                target = target[parts[p]];
            }

            target[parts[parts.length - 1]] = conflict;
        }

        // Settings that need no special handling first
        var sectionProperties = resolver.createSection('SETTINGS');
        sectionProperties.appendAllFields({
            schema: 'settings',
            fields: index,
            except: ['batchGroups', 'layers', 'layerOrder', 'scripts']
        });

        // Layers
        if (index.layers || index.layerOrder) {
            resolver.createSeparator('LAYERS');
        }

        if (index.layers) {
            for (var key in index.layers) {
                var section = resolver.createSection('LAYER ' + getLayerName(key, mergeObject), true);
                section.appendAllFields({
                    schema: 'settings',
                    fields: index.layers[key]
                });
            }
        }

        if (index.layerOrder) {
            var section = resolver.createSection('LAYER ORDER', true);
            section.appendField({
                type: 'array:sublayer',
                conflict: index.layerOrder
            });
        }

        // Batch groups
        if (index.batchGroups) {
            resolver.createSeparator('BATCH GROUPS');
            for (var key in index.batchGroups) {
                var section = resolver.createSection('BATCH GROUP ' + getBatchGroupName(key, mergeObject), true);
                section.appendAllFields({
                    schema: 'settings',
                    fields: index.batchGroups[key]
                });
            }
        }

        // Script order
        if (index.scripts) {
            resolver.createSeparator('SCRIPTS LOADING ORDER');
            var section = resolver.createSection('SCRIPTS', true);
            section.appendField({
                type: 'array:asset',
                conflict: index.scripts
            });
        }

        resolver.appendToParent(parent);

        return resolver;
    });
});


/* editor/pickers/conflict-manager/picker-conflict-manager-asset.js */
editor.once('load', function () {
    'use strict';

    // Shows asset field conflicts
    editor.method('picker:conflictManager:showAssetFieldConflicts', function (parent, conflicts, mergeObject) {
        var resolver = new ui.ConflictResolver(conflicts, mergeObject);

        var sectionAsset = resolver.createSection(conflicts.itemName + ' - ID: ' + conflicts.itemId);

        for (var i = 0; i < conflicts.data.length; i++) {
            if (conflicts.data[i].isTextualMerge) continue;

            // get the type from the path - force 'data' to be an object for now
            var path = conflicts.data[i].path;
            var noPath = !path;
            var type = !path || path === 'data' ? 'object' : editor.call('schema:asset:getType', conflicts.data[i].path);

            sectionAsset.appendField({
                name: conflicts.data[i].path,
                noPath: noPath,
                prettify: true,
                type: type,
                conflict: conflicts.data[i]
            });
        }

        resolver.appendToParent(parent);
        return resolver;
    });

    // Shows asset text file contents
    editor.method('picker:conflictManager:showAssetFileConflicts', function (parent, conflicts, mergeObject) {
        var resolver = new ui.TextResolver(conflicts, mergeObject);
        resolver.appendToParent(parent);
        return resolver;
    });
});


/* editor/pickers/conflict-manager/picker-conflict-manager.js */
editor.once('load', function () {
    'use strict';

    var LAYOUT_NONE = 0;
    var LAYOUT_FIELDS_ONLY = 1;
    var LAYOUT_FIELDS_AND_FILE_CONFLICTS = 2;
    var LAYOUT_FILE_CONFLICTS_ONLY = 3;

    var layoutMode = LAYOUT_NONE;

    // if true then we are showing a diff instead of a merge
    var diffMode = false;

    // overlay
    var root = editor.call('layout.root');
    var overlay = new ui.Overlay();
    overlay.clickable = false;
    overlay.hidden = true;
    overlay.class.add('picker-conflict-manager');
    root.append(overlay);

    // main panel
    var panel = new ui.Panel('CONFLICT MANAGER');
    panel.flex = true;
    overlay.append(panel);

    // left panel
    var panelLeft = new ui.Panel();
    panelLeft.flex = true;
    panelLeft.class.add('left');
    panel.append(panelLeft);

    // list of conflicted items
    var listItems = new ui.List();
    listItems.flexGrow = 1;
    panelLeft.append(listItems);

    // review merge button
    var btnReview = new ui.Button({
        text: 'REVIEW MERGE'
    });
    btnReview.disabled = true;
    panelLeft.append(btnReview);

    // complete merge button
    var btnComplete = new ui.Button({
        text: 'COMPLETE MERGE'
    });
    panelLeft.append(btnComplete);

    // right panel
    var panelRight = new ui.Panel();
    panelRight.class.add('right');
    panelRight.flex = true;
    panelRight.flexGrow = 1;
    panel.append(panelRight);


    // main progress text
    var labelMainProgress = new ui.Label();
    labelMainProgress.class.add('progress-text');
    labelMainProgress.renderChanges = false;
    labelMainProgress.hidden = true;
    panelRight.append(labelMainProgress);

    // main progress icons
    var spinnerIcon = editor.call('picker:versioncontrol:svg:spinner', 64);
    spinnerIcon.classList.add('progress-icon');
    spinnerIcon.classList.add('hidden');
    spinnerIcon.classList.add('spin');
    var completedIcon = editor.call('picker:versioncontrol:svg:completed', 64);
    completedIcon.classList.add('progress-icon');
    completedIcon.classList.add('hidden');
    var errorIcon = editor.call('picker:versioncontrol:svg:error', 64);
    errorIcon.classList.add('progress-icon');
    errorIcon.classList.add('hidden');
    panelRight.innerElement.appendChild(spinnerIcon);
    panelRight.innerElement.appendChild(completedIcon);
    panelRight.innerElement.appendChild(errorIcon);

    // create vertical borders
    var verticalBorders = [];
    for (var i = 0; i < 2; i++) {
        var border = document.createElement('div');
        border.classList.add('vertical-border');
        border.classList.add('vertical-border-' + i);
        panelRight.append(border);
        verticalBorders.push(border);
    }

    // headers for each branch
    var panelTop = new ui.Panel();
    panelTop.flex = true;
    panelTop.class.add('top');
    panelRight.append(panelTop);

    var panelTopBase = new ui.Panel();
    panelTopBase.class.add('base');
    var label = new ui.Label({
        text: 'BASE'
    });
    label.renderChanges = false;
    panelTopBase.append(label);
    panelTop.append(panelTopBase);

    var panelDest = new ui.Panel();
    panelDest.class.add('mine');
    var labelTopMine = new ui.Label({
        text: 'DEST'
    });
    labelTopMine.renderChanges = false;
    panelDest.append(labelTopMine);
    panelTop.append(panelDest);

    var panelSource = new ui.Panel();
    panelSource.class.add('theirs');
    var labelTopTheirs = new ui.Label({
        text: 'SOURCE'
    });
    labelTopTheirs.renderChanges = false;
    panelSource.append(labelTopTheirs);
    panelTop.append(panelSource);

    // conflict panel
    var panelConflicts = new ui.Panel();
    panelConflicts.class.add('conflicts');
    panelRight.append(panelConflicts);

    // bottom panel with buttons
    var panelBottom = new ui.Panel();
    panelBottom.flex = true;
    panelBottom.class.add('bottom');

    var panelBottomBase = new ui.Panel();
    panelBottomBase.flex = true;
    panelBottomBase.class.add('base');
    panelBottom.append(panelBottomBase);

    var panelBottomDest = new ui.Panel();
    panelBottomDest.flex = true;
    panelBottomDest.class.add('mine');
    panelBottom.append(panelBottomDest);

    var btnPickDest = new ui.Button({
        text: 'USE ALL FROM THIS BRANCH'
    });
    panelBottomDest.append(btnPickDest);
    btnPickDest.on('click', function () {
        if (resolver) {
            resolver.resolveUsingDestination();
        }
    });

    var panelBottomSource = new ui.Panel();
    panelBottomSource.flex = true;
    panelBottomSource.class.add('theirs');
    panelBottom.append(panelBottomSource);

    var btnPickSource = new ui.Button({
        text: 'USE ALL FROM THIS BRANCH'
    });
    panelBottomSource.append(btnPickSource);
    btnPickSource.on('click', function () {
        if (resolver) {
            resolver.resolveUsingSource();
        }
    });

    panelRight.append(panelBottom);

    // panel that warns about file merge
    var panelFileConflicts = new ui.Panel('FILE CONFLICTS');
    panelFileConflicts.class.add('file-conflicts');
    panelFileConflicts.flex = true;
    panelFileConflicts.hidden = true;
    panelRight.append(panelFileConflicts);

    var labelInfo = new ui.Label({
        text: '&#58368;',
        unsafe: true
    });
    labelInfo.class.add('font-icon');
    panelFileConflicts.append(labelInfo);

    var labelFileConflicts = new ui.Label({
        text: 'FILE CONFLICTS'
    });
    labelFileConflicts.renderChanges = false;
    labelFileConflicts.class.add('file-conflicts');
    panelFileConflicts.append(labelFileConflicts);

    var labelFileConflictsSmall = new ui.Label({
        text: 'The asset also has file conflicts'
    });
    labelFileConflictsSmall.renderChanges = false;
    labelFileConflictsSmall.class.add('file-conflicts-small');
    panelFileConflicts.append(labelFileConflictsSmall);

    var btnViewFileConflicts = new ui.Button({
        text: 'VIEW FILE CONFLICTS'
    });
    panelFileConflicts.append(btnViewFileConflicts);

    // close button
    var btnClose = new ui.Button({
        text: '&#57650;'
    });
    btnClose.class.add('close');
    btnClose.on('click', function () {
        if (config.self.branch.merge) {
            editor.call('picker:confirm', 'Closing the conflict manager will stop the merge. Are you sure?', function () {
                if (resolver) {
                    resolver.destroy();
                }

                setLayoutMode(LAYOUT_NONE);
                showMainProgress(spinnerIcon, 'Stopping merge');
                editor.call('branches:forceStopMerge', config.self.branch.merge.id, function (err) {
                    if (err) {
                        showMainProgress(errorIcon, err);
                    } else {
                        showMainProgress(completedIcon, 'Merge stopped. Refreshing browser');
                        setTimeout(function () {
                            window.location.reload();
                        }, 1000);
                    }
                });

                if (diffMode && currentMergeObject && currentMergeObject.id !== config.self.branch.merge.id) {
                    // delete current diff too
                    editor.call('branches:forceStopMerge', currentMergeObject.id);
                }
            });
        } else if (diffMode && currentMergeObject) {
            // delete regular diff
            editor.call('branches:forceStopMerge', currentMergeObject.id);
            overlay.hidden = true;
            editor.call('picker:versioncontrol');
        }
    });
    panel.headerElement.appendChild(btnClose.element);

    // the current conflict we are editing
    var currentConflicts = null;
    // the merge data that we requested from the server
    var currentMergeObject = null;
    // the UI to resolve conflicts for an item
    var resolver = null;

    // Returns true if the conflict group has any file conflicts
    var hasFileConflicts = function (group) {
        for (var i = 0; i < group.data.length; i++) {
            if (group.data[i].isTextualMerge) {
                return true;
            }
        }

        return false;
    };

    // Returns true if the conflict group has any regular data conflicts
    var hasDataConflicts = function (group) {
        for (var i = 0; i < group.data.length; i++) {
            if (! group.data[i].isTextualMerge) {
                return true;
            }
        }

        return false;
    };

    // Returns true if all of the conflicts of a group (a group has a unique itemId)
    // have been resolved
    var isConflictGroupResolved = function (group) {
        var resolved = true;
        for (var i = 0; i < group.data.length; i++) {
            if (!group.data[i].useSrc && !group.data[i].useDst && !group.data[i].useMergedFile) {
                resolved = false;
                break;
            }
        }
        return resolved;
    };

    // Returns true if all of the conflicts have been resolved for all groups
    var checkAllResolved = function () {
        var result = true;

        for (var i = 0; i < currentMergeObject.conflicts.length; i++) {
            if (!isConflictGroupResolved(currentMergeObject.conflicts[i])) {
                return false;
            }
        }

        return result;
    };

    // Creates a list item for the list on the left panel
    var createLeftListItem = function (conflictGroup) {
        var item = new ui.ListItem();

        // add some links between the item and the data
        item.conflict = conflictGroup;
        conflictGroup.listItem = item;

        var panel = new ui.Panel();
        item.element.appendChild(panel.element);

        // icon
        var labelIcon = new ui.Label({
            text: '&#58208;',
            unsafe: true
        });
        labelIcon.class.add('icon');
        labelIcon.class.add(isConflictGroupResolved(conflictGroup) ? 'resolved' : 'conflict');

        panel.append(labelIcon);
        item.icon = labelIcon;

        var panelInfo = new ui.Panel();
        panel.append(panelInfo);

        // name
        var labelName = new ui.Label({
            text: conflictGroup.itemName === 'project settings' ? 'Project Settings' : conflictGroup.itemName
        });
        labelName.class.add('name');
        panelInfo.append(labelName);

        // type
        var type = conflictGroup.assetType || conflictGroup.itemType;
        var labelType = new ui.Label({
            text: type
        });
        labelType.renderChanges = false;
        labelType.class.add('type');
        panelInfo.append(labelType);

        listItems.append(item);

        item.on('select', function () {
            showConflicts(conflictGroup);
        });

        // Called when all the conflicts of this list item have been resolved
        item.onResolved = function () {
            labelIcon.class.remove('conflict');
            labelIcon.class.add('resolved');
        };

        // Called when a conflict of this list item has been un-resolved
        item.onUnresolved = function () {
            labelIcon.class.add('conflict');
            labelIcon.class.remove('resolved');
        };

        item.refreshResolvedCount = function () {
            var resolved = 0;
            var total = conflictGroup.data.length;
            for (var i = 0; i < total; i++) {
                if (conflictGroup.data[i].useSrc ||
                    conflictGroup.data[i].useDst ||
                    conflictGroup.data[i].useMergedFile) {

                    resolved++;
                }
            }

            if (diffMode) {
                labelType.text = type + ' -  ' + total + ' Change' + (total > 1 ? 's' : '');
            } else {
                labelType.text = type + ' - Resolved ' + resolved + '/' + total;
            }
        };

        item.refreshResolvedCount();

        return item;
    };

    var showRegularConflicts = function () {
        panelTop.hidden = false;
        panelConflicts.hidden = false;
        panelBottom.hidden = diffMode;

        for (var i = 0; i < verticalBorders.length; i++) {
            verticalBorders[i].classList.remove('hidden');
        }
    };

    var showFileConflictsPanel = function () {
        panelFileConflicts.hidden = false;
        panelRight.class.add('file-conflicts-visible');
    };

    // Enables / disables the appropriate panels for the right
    // side depending on the specified mode
    var setLayoutMode = function (mode)  {
        layoutMode = mode;

        // turn off all right panel children first
        // and then enable the fields required by
        // the mode
        panelRight.class.remove('file-conflicts-visible');
        var children = panelRight.innerElement.childNodes;
        for (var i = 0; i < children.length; i++) {
            children[i].classList.add('hidden');
        }

        switch (mode) {
            case LAYOUT_FIELDS_ONLY:
                showRegularConflicts();
                break;
            case LAYOUT_FIELDS_AND_FILE_CONFLICTS:
                showRegularConflicts();
                showFileConflictsPanel();
                break;
        }
    };

    // Hide conflicts and show a progress icon
    var showMainProgress = function (icon, text) {
        [spinnerIcon, completedIcon, errorIcon].forEach(function (i) {
            if (icon === i) {
                i.classList.remove('hidden');
            } else {
                i.classList.add('hidden');
            }
        });

        labelMainProgress.hidden = false;
        labelMainProgress.text = text;
    };

    // Shows the conflicts of a group
    var showConflicts = function (group, forceLayoutMode) {
        // destroy the current resolver
        if (resolver) {
            resolver.destroy();
            resolver = null;
        }

        currentConflicts = group;

        var parent = panelConflicts;

        var mode = forceLayoutMode ||  LAYOUT_FIELDS_ONLY;
        if (! forceLayoutMode) {
            if (hasFileConflicts(group)) {
                if (hasDataConflicts(group)) {
                    mode = LAYOUT_FIELDS_AND_FILE_CONFLICTS;
                } else {
                    mode = LAYOUT_FILE_CONFLICTS_ONLY;
                }
            }
        }

        // create resolver based on type
        var methodName;
        switch (group.itemType) {
            case 'scene':
                methodName = 'picker:conflictManager:showSceneConflicts';
                break;
            case 'settings':
                methodName = 'picker:conflictManager:showSettingsConflicts';
                break;
            default: // asset
                if (mode === LAYOUT_FILE_CONFLICTS_ONLY) {
                    parent = panelRight;
                    methodName = 'picker:conflictManager:showAssetFileConflicts';
                } else {
                    methodName = 'picker:conflictManager:showAssetFieldConflicts';
                }
                break;
        }

        setLayoutMode(mode);

        resolver = editor.call(
            methodName,
            parent,
            currentConflicts,
            currentMergeObject
        );

        var timeoutCheckAllResolved;

        // Called when any conflict is resolved
        resolver.on('resolve', function () {
            group.listItem.refreshResolvedCount();

            // go back to regular layout
            if (layoutMode === LAYOUT_FILE_CONFLICTS_ONLY) {
                if (hasDataConflicts(group)) {
                    showConflicts(group);
                }
            }

            // Check if all the conflicts of a group have been
            // resolved
            if (! isConflictGroupResolved(group)) return;

            // Check if all conflicts of all groups are now resolved
            // in a timeout. Do it in a timeout in case the user
            // clicks on one of the resolve all buttons in which case
            // the resolve event will be fired mutliple times in the same frame
            group.listItem.onResolved();

            if (timeoutCheckAllResolved) {
                clearTimeout(timeoutCheckAllResolved);
            }
            timeoutCheckAllResolved = setTimeout(function () {
                timeoutCheckAllResolved = null;
                btnReview.disabled = ! checkAllResolved();
            });
        });

        // Called when any conflict has been un-resolved
        resolver.on('unresolve', function () {
            group.listItem.onUnresolved();
            if (timeoutCheckAllResolved) {
                clearTimeout(timeoutCheckAllResolved);
                timeoutCheckAllResolved = null;
            }

            group.listItem.refreshResolvedCount();
            btnReview.disabled = true;
        });

        // fired by the text resolver to go back
        // to viewing asset conflicts
        resolver.on('close', function () {
            if (hasDataConflicts(group)) {
                showConflicts(group);
            }
        });

        // adjust the positioning of the vertical borders because a scrollbar
        // might have been displayed which might have changed the rendered width
        // of the conflicts panel
        resolver.on('reflow', function () {
            var width = panelConflicts.element.clientWidth / (diffMode ? 2 : 3);
            verticalBorders[0].style.left = width + 'px';
            verticalBorders[1].style.left = 2 * width + 'px';
        });
    };

    btnViewFileConflicts.on('click', function () {
        showConflicts(currentConflicts, LAYOUT_FILE_CONFLICTS_ONLY);
    });

    // Complete merge button click
    btnComplete.on('click', function () {
        listItems.selected = [];
        btnComplete.disabled = true;

        if (resolver) {
            resolver.destroy();
            resolver = null;
        }

        setLayoutMode(LAYOUT_NONE);
        showMainProgress(spinnerIcon, 'Completing merge...');

        editor.call('branches:applyMerge', config.self.branch.merge.id, true, function (err) {

            if (err) {
                // if there was an error show it in the UI and then go back to the conflicts
                showMainProgress(errorIcon, err);
                setTimeout(function () {
                    btnComplete.disabled = false;
                    listItems.innerElement.firstChild.ui.selected = true;
                }, 2000);
            } else {
                // if no error then refresh the browser
                showMainProgress(completedIcon, 'Merge complete - refreshing browser...');
                setTimeout(function () {
                    window.location.reload();
                }, 1000);
            }
        });
    });

    // Review merge button click
    btnReview.on('click', function () {
        listItems.selected = [];
        btnReview.disabled = true;

        if (resolver) {
            resolver.destroy();
            resolver = null;
        }

        setLayoutMode(LAYOUT_NONE);
        showMainProgress(spinnerIcon, 'Resolving conflicts...');

        editor.call('branches:applyMerge', config.self.branch.merge.id, false, function (err) {
            if (err) {
                // if there was an error show it in the UI and then go back to the conflicts
                showMainProgress(errorIcon, err);
                setTimeout(function () {
                    btnReview.disabled = false;
                    listItems.innerElement.firstChild.ui.selected = true;
                }, 2000);
            } else {
                // if no error then show the merge diff
                // vaios
                showMainProgress(spinnerIcon, 'Loading changes...');
                editor.call('diff:merge', function (err, data) {
                    toggleDiffMode(true);
                    if (err) {
                        return showMainProgress(errorIcon, err);
                    }

                    btnReview.disabled = false;
                    btnReview.hidden = true;
                    btnComplete.disabled = false;
                    btnComplete.hidden = false;
                    onMergeDataLoaded(data);
                });
            }
        });
    });

    // Called when we load the merge object from the server
    var onMergeDataLoaded = function (data) {
        listItems.clear();
        currentMergeObject = data;

        if (diffMode) {
            if (config.self.branch.merge) {
                labelTopTheirs.text = 'Merge Result';
            } else {
                labelTopTheirs.text = data.sourceBranchName + ' - ' + (data.sourceCheckpointId ? 'Checkpoint [' + data.sourceCheckpointId.substring(0, 7) + ']' : 'Current State');
            }
            labelTopMine.text = data.destinationBranchName + ' - ' + (data.destinationCheckpointId ? 'Checkpoint [' + data.destinationCheckpointId.substring(0, 7) + ']' : 'Current State');
        } else {
            labelTopTheirs.text = data.sourceBranchName + ' - [Source Branch]';
            labelTopMine.text = data.destinationBranchName + ' - [Destination Branch]';
        }

        if (!currentMergeObject.conflicts || !currentMergeObject.conflicts.length) {
            btnReview.disabled = false;
            if (diffMode) {
                return showMainProgress(completedIcon, 'No changes found - Click Complete Merge');
            } else {
                return showMainProgress(completedIcon, 'No conflicts found - Click Review Merge');
            }
        }

        for (var i = 0; i < currentMergeObject.conflicts.length; i++) {
            var item = createLeftListItem(currentMergeObject.conflicts[i]);
            if (i === 0) {
                item.selected = true;
            }
        }

        if (!diffMode) {
            btnReview.disabled = !checkAllResolved();
        }
    };

    // Enables / Disables diff mode
    var toggleDiffMode = function (toggle) {
        diffMode = toggle;
        if (diffMode) {
            overlay.class.add('diff');
        } else {
            overlay.class.remove('diff');
        }

        if (diffMode) {
            if (config.self.branch.merge) {
                btnComplete.hidden = false;
                btnComplete.disabled = false;
                btnReview.hidden = true;
                panel.header = 'REVIEW MERGE CHANGES';
            } else {
                btnComplete.hidden = true;
                btnReview.hidden = true;
                panel.header = 'DIFF'
            }

            labelFileConflicts.text = "FILE CHANGES";
            labelFileConflictsSmall.text = "The asset also has file changes";
            btnViewFileConflicts.text = "VIEW FILE CHANGES";
            panelFileConflicts.header = 'FILE CHANGES';
        } else {
            btnReview.hidden = false;
            btnReview.disabled = true;
            btnComplete.hidden = true;
            panel.header = 'RESOLVE CONFLICTS'

            labelFileConflicts.text = "FILE CONFLICTS";
            labelFileConflictsSmall.text = "The asset also has file conflicts";
            btnViewFileConflicts.text = "VIEW FILE CONFLICTS";
            panelFileConflicts.header = 'FILE CONFLICTS';
        }
        panelBottom.hidden = diffMode;
        panelTopBase.hidden = diffMode;
    };

    // load and show data
    overlay.on('show', function () {
        // editor-blocking picker opened
        editor.emit('picker:open', 'conflict-manager');

        setLayoutMode(LAYOUT_NONE);

        if (!currentMergeObject) {
            if (diffMode) {
                // in this case we are doing a diff between the current merge
                // and the destination checkpoint
                showMainProgress(spinnerIcon, 'Loading changes...');
                editor.call('diff:merge', function (err, data) {
                    console.log(data);
                    if (err) {
                        return showMainProgress(errorIcon, err);
                    }

                    onMergeDataLoaded(data);
                });

            } else {
                // get the conflicts of the current merge
                showMainProgress(spinnerIcon, 'Loading conflicts...');
                editor.call('branches:getMerge', config.self.branch.merge.id, function (err, data) {
                    console.log(data);
                    if (err) {
                        return showMainProgress(errorIcon, err);
                    }

                    onMergeDataLoaded(data);
                });
            }

        } else {
            onMergeDataLoaded(currentMergeObject);
        }


        if (editor.call('viewport:inViewport')) {
            editor.emit('viewport:hover', false);
        }
    });

    // clean up
    overlay.on('hide', function () {
        currentMergeObject = null;

        listItems.clear();

        if (resolver) {
            resolver.destroy();
            resolver = null;
        }

        // editor-blocking picker closed
        editor.emit('picker:close', 'conflict-manager');

        if (editor.call('viewport:inViewport')) {
            editor.emit('viewport:hover', true);
        }
    });

    // Prevent viewport hovering when the picker is shown
    editor.on('viewport:hover', function (state) {
        if (state && !overlay.hidden) {
            setTimeout(function () {
                editor.emit('viewport:hover', false);
            }, 0);
        }
    });

    // show conflict manager
    editor.method('picker:conflictManager', function (data) {
        toggleDiffMode(false);
        currentMergeObject = data;
        overlay.hidden = false;
    });

    // Returns the current merge object
    editor.method('picker:conflictManager:currentMerge', function () {
        return currentMergeObject;
    });

    editor.method('picker:conflictManager:rightPanel', function () {
        return panelRight;
    });

    // shows diff manager which is the conflict manager in a different mode
    editor.method('picker:diffManager', function (diff) {
        toggleDiffMode(true);
        currentMergeObject = diff;
        overlay.hidden = false;
    });
});


