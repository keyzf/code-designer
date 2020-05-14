function dragger(popover) {

    var _isDragging, _draggingPosition, offsetLeft = 0,
        offsetTop = 0;

    var mousemove = function (event) {
        if (_isDragging) {
            popover.style.left = event.pageX + _draggingPosition.x + 'px';
            popover.style.top = event.pageY + _draggingPosition.y + 'px';
        }
    };

    var mouseup = function () {
        _isDragging = false;

        popover.ownerDocument.removeEventListener('mouseup', mouseup);
        popover.ownerDocument.removeEventListener('mousemove', mousemove);
    };



    var mousedown = function (event) {
        _isDragging = true;
        _draggingPosition = {
            x: popover.offsetLeft - event.pageX,
            y: popover.offsetTop - event.pageY
        };
        event.preventDefault();

        popover.ownerDocument.addEventListener('mouseup', mouseup);
        popover.ownerDocument.addEventListener('mousemove', mousemove);
    }
    popover.addEventListener('mousedown', mousedown);

    var stopListen = function () {
        popover.removeEventListener('mousedown', mousedown);

    };
    return stopListen;
}