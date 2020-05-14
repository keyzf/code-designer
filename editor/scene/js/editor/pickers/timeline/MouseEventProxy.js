var device = {
    plateform: !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) ?"iOS":"Other"
}
function proxyEvent(eventName) {
    return function(_e) {
        if (!(_e.sourceCapabilities && _e.sourceCapabilities.firesTouchEvents) && "iOS" !== device.plateform) {
            let evt = document.createEvent("CustomEvent");
            evt.initCustomEvent(eventName, true, true, {
                id: -1,
                button: _e.button,
                isTouch: false,
                screenX: _e.screenX,
                screenY: _e.screenY,
                clientX: _e.clientX,
                clientY: _e.clientY,
                pageX: _e.pageX,
                pageY: _e.pageY,
                ctrlKey: _e.ctrlKey,
                shiftKey: _e.shiftKey,
                altKey: _e.altKey,
                metaKey: _e.metaKey
            }),
            _e.target.dispatchEvent(evt) || _e.preventDefault()
        }
    }
}
function touchProxyEvent(eventName) {
    return function(event) {
        for (var i = 0; i < event.changedTouches.length; i++) {
            _e = event.changedTouches[i];
            let evt = document.createEvent("CustomEvent")
              , _stoped = false
              , _originStopPropagation = evt.stopPropagation;
              evt.stopPropagation = function() {
                _stoped = true,
                _originStopPropagation.call(evt)
            };
            let eventData = {
                id: _e.identifier,
                button: _e.button,
                isTouch: true,
                screenX: _e.screenX,
                screenY: _e.screenY,
                clientX: _e.clientX,
                clientY: _e.clientY,
                pageX: _e.pageX,
                pageY: _e.pageY,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false
            };

            evt.initCustomEvent(eventName, false, false, eventData);
            let r = !event.target.dispatchEvent(evt);
            (r) && event.preventDefault(),
            _stoped && event.stopPropagation()
        }
    }
}
var options = {
    capture: true,
    passive: false
};
document.addEventListener("mousedown", proxyEvent("UIPointerDown"), options),
document.addEventListener("mousemove", proxyEvent("UIPointerMove"), options),
document.addEventListener("mouseup", proxyEvent("UIPointerUp"), options),
document.addEventListener("click", proxyEvent("UITap"), options),
document.addEventListener("dblclick", proxyEvent("UIDoubleTap"), options),
document.addEventListener("touchstart", touchProxyEvent("UIPointerDown"), options),
document.addEventListener("touchmove", touchProxyEvent("UIPointerMove"), {
    capture: true,
    passive: true
}),
document.addEventListener("touchend", touchProxyEvent("UIPointerUp"), options),
document.addEventListener("touchcancel", touchProxyEvent("UIPointerUp"), options)