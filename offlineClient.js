"use strict";
{
    window.OfflineClientInfo = new class {
        constructor() {
            this._rootBroadcastChannel = "undefined" == typeof BroadcastChannel ? null : new BroadcastChannel("root-offline"),
            this._broadcastChannel = "undefined" == typeof BroadcastChannel ? null : new BroadcastChannel("offline"),
            this._queuedMessages = [],
            this._onMessageCallback = null,
            this._rootBroadcastChannel && this._broadcastChannel && (this._rootBroadcastChannel.onmessage = (a)=>this._OnBroadcastChannelMessage(a, "root"),
            this._broadcastChannel.onmessage = (a)=>this._OnBroadcastChannelMessage(a, "main"))
        }
        _OnBroadcastChannelMessage(a, b) {
            return this._onMessageCallback ? void this._onMessageCallback(a, b) : void this._queuedMessages.push([a, b])
        }
        SetMessageCallback(a) {
            this._onMessageCallback = a;
            for (let b of this._queuedMessages)
                this._onMessageCallback(b[0], b[1]);
            this._queuedMessages.length = 0
        }
    }
}