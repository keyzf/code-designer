Object.assign(pc2d, function () {
    'use strict';

    var EVENT_RESIZE = 'resizecanvas';
var GraphicsDevice = function (canvas, options) {
    pc2d.EventHandler.call(this);
    var i;
    this.canvas = canvas;
    this._maxPixelRatio = 1;
    this.renderTarget = null;

    // local width/height without pixelRatio applied
    this._width = 0;
    this._height = 0;

  
}
GraphicsDevice.prototype = Object.create(pc2d.EventHandler.prototype);
GraphicsDevice.prototype.constructor = GraphicsDevice;

Object.assign(GraphicsDevice.prototype, {
    resizeCanvas: function (width, height) {
        this._width = width;
        this._height = height;

        var ratio = Math.min(this._maxPixelRatio, window.devicePixelRatio);
        width *= ratio;
        height *= ratio;
        // this.canvas.width = width;
        // this.canvas.height = height;
        this.fire(EVENT_RESIZE, width, height);
    },

    setResolution: function (width, height) {
        this._width = width;
        this._height = height;
        // this.canvas.width = width;
        // this.canvas.height = height;
        this.fire(EVENT_RESIZE, width, height);
    },
    destroy: function () {
        this.canvas = null;
    },
  
});


Object.defineProperty(GraphicsDevice.prototype, 'width', {
    get: function () {
        return this.canvas.width;
    }
});

Object.defineProperty(GraphicsDevice.prototype, 'height', {
    get: function () {
        return this.canvas.height;
    }
});


Object.defineProperty(GraphicsDevice.prototype, 'fullscreen', {
    get: function () {
        return !!document.fullscreenElement;
    },
    set: function (fullscreen) {
        if (fullscreen) {
            var canvas = this.canvas;
            canvas.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
});


Object.defineProperty(GraphicsDevice.prototype, 'maxPixelRatio', {
    get: function () {
        return this._maxPixelRatio;
    },
    set: function (ratio) {
        this._maxPixelRatio = ratio;
        this.resizeCanvas(this._width, this._height);
    }
});


return {
    GraphicsDevice: GraphicsDevice
};

}());