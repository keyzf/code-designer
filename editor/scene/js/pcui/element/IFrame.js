Object.assign(pcui, (function () {
    'use strict';

    const CLASS_CANVAS = 'pcui-iframe';

    /**
     * @name pcui.IFrame
     * @classdesc A iframe element.
     * @property {Number} canvasWidth The width of the HTML iframe
     * @property {Number} canvasHeight The height of the HTML iframe
     * @extends pcui.Element
     */
    class IFrame extends pcui.Element {
        constructor(args) {
            if (!args) args = {};
            super(document.createElement('animtaorweb-webview'), args);

            this.class.add(CLASS_CANVAS);
            this.elememt = this.dom;
            this.class.add("iphone6-6s-7");




            this.dom.style.display = "block";

            this._pixelWidth = 300;
            this._pixelHeight = 150;
            this._pixelRatio = args.useDevicePixelRatio !== undefined && args.useDevicePixelRatio ? window.devicePixelRatio : 1;
        }

        /**
         * @name pcui.IFrame#resize
         * @description Resizes the HTML canvas
         * @param {Number} width The width
         * @param {Number} height The height
         */
        resize(width, height) {
            const pixelWidth = Math.floor(this._pixelRatio * width);
            const pixelHeight = Math.floor(this._pixelRatio * height);
            if (pixelWidth === this._pixelWidth && pixelHeight === this._pixelHeight) {
                return;
            }
            this._pixelWidth = pixelWidth;
            this._pixelHeight = pixelHeight;
            this.dom.width = pixelWidth;
            this.dom.height = pixelHeight;
            this.width = width;
            this.height = height;

            this.emit('resize', this.width, this.height);
        }

        get width() {
            return super.width;
        }

        set width(value) {
            const pixelWidth = Math.floor(this._pixelRatio * value);
            if (pixelWidth === this._pixelWidth) {
                return;
            }
            this._pixelWidth = pixelWidth;
            this.dom.width = pixelWidth;
            super.width = value;
            this.emit('resize', this.width, this.height);
        }

        get height() {
            return super.height;
        }

        set height(value) {
            const pixelHeight = Math.floor(this._pixelRatio * value);
            if (pixelHeight === this._pixelHeight) {
                return;
            }
            this._pixelHeight = pixelHeight;
            this.dom.height = pixelHeight;
            super.height = value;
            this.emit('resize', this.width, this.height);
        }

        get pixelWidth() {
            return this._pixelWidth;
        }

        get pixelHeight() {
            return this._pixelHeight;
        }

        get pixelRatio() {
            return this._pixelRatio;
        }
    }

    /**
     * @event
     * @name pcui.Element#resize
     * @description
     */

    return {
        IFrame: IFrame
    };
})());