/* editor/inspector/settings-panels/editor.js */
Object.assign(pcui, (function () {
    'use strict';

    const ATTRIBUTES = [
        {
            observer: 'settings',
            label: 'Grid Divisions',
            path: 'editor.gridDivisions',
            alias: 'grid',
            type: 'number',
            args: {
                min: 0,
                max: 100
            }
        },
        {
            observer: 'settings',
            label: 'Grid Division Size',
            path: 'editor.gridDivisionSize',
            alias: 'grid',
            type: 'number',
            args: {
                min: 0,
                max: 100
            }
        },
        {
            observer: 'settings',
            label: 'Snap',
            path: 'editor.snapIncrement',
            alias: 'snap',
            type: 'number',
            args: {
                min: 0,
                max: 100,
                placeholder: 'Increment'
            }
        },
        {
            observer: 'settings',
            label: 'Camera Clip Near',
            alias: 'cameraClip',
            paths: 'editor.cameraNearClip',
            type: 'number',
            args: {
                min: 0
            }
        },
        {
            observer: 'settings',
            label: 'Camera Clip Far',
            alias: 'cameraClip',
            path: 'editor.cameraFarClip',
            type: 'number',
            args: {
                min: 0
            }
        },
        {
            observer: 'settings',
            label: 'Clear Color',
            path: 'editor.cameraClearColor',
            alias: 'clearColor',
            type: 'rgba'
        },
        {
            observer: 'userSettings',
            label: 'Icons Size',
            path: 'editor.iconSize',
            alias: 'iconSize',
            type: 'number',
            args: {
                min: 0,
                max: 100
            }
        },
        {
            observer: 'settings',
            label: 'Local Server',
            path: 'editor.localServer',
            type: 'string',
            args: {
                onValidate: value => /^http(s)?:\/\/\S+/.test(value)
            }
        },
        {
            observer: 'settings',
            label: 'Locale',
            path: 'editor.locale',
            type: 'string'
        },
        {
            alias: 'chatNotification',
            label: 'Chat Notification',
            type: 'boolean'
        }
    ];

    class EditorSettingsPanel extends pcui.BaseSettingsPanel {
        constructor(args) {
            
            args = Object.assign({}, args);
            args.headerText = 'EDITOR';
            args.attributes = ATTRIBUTES;

            super(args);

            const evtPermission = editor.on('notify:permission', this._checkChatNotificationState.bind(this));
            const evtChatNofityState = editor.on('chat:notify', this._checkChatNotificationState.bind(this));
            const fieldChatNotification = this._attributesInspector.getField('chatNotification');
            this._checkChatNotificationState();
            fieldChatNotification.on('change', (value) => {
                if (editor.call('notify:state') !== 'granted') {
                    editor.call('notify:permission');
                } else {
                    editor.call('localStorage:set', 'editor:notifications:chat', value);
                    editor.emit('chat:notify', value);
                    this._checkChatNotificationState();
                }
            });
            this.once('destroy', () => {
                evtPermission.unbind();
                evtChatNofityState.unbind();
            });
        }

        _checkChatNotificationState() {
            const permission = editor.call('notify:state');
            const fieldChatNotification = this._attributesInspector.getField('chatNotification');

            fieldChatNotification.enabled = permission !== 'denied';

            if (permission !== 'granted' && permission !== 'denied')
                fieldChatNotification.value = null;

            if (permission === 'granted') {
                // restore localstorage state
                const granted = editor.call('localStorage:get', 'editor:notifications:chat');
                if (granted === null) {
                    fieldChatNotification.value = true;
                } else {
                    fieldChatNotification.value = granted;
                }
            }
        }
    }

    return {
        EditorSettingsPanel: EditorSettingsPanel
    };
})());