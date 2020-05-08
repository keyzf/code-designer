;(function(window){
    var wcutils = window.wcUtils;
    var a11y = wcutils.a11y;
    var keys = wcutils.keys;
    var utils = wcutils.utils;
    var position = wcutils.position;
    var contentNode = wcutils.contentNode;

    var Popover = wcutils.components.Popover;

    class  Popup extends Popover {
    
        constructor(){
            super();
        }
        init() {
            super.init();
           
            this.contentSelectorMap = {
                section: 'section'
            };
            this.template = () => `<template>
            <section></section>
        </template>`;
            this._lastXPosition = null;
            this._lastYPosition = null;
            this._isDragging = false;
            this._draggingPosition = {};
            contentNode.cacheInputContent(this, this.contentSelectorMap);
        }
    
      
        postRender() {
            super.postRender();
    
            this._section = null;
            contentNode.storeCachedInput(this, this.contentSelectorMap);

            this._closeOnBlur = false;
        }
    
        _setupListeners() {
            this.listenTo(this, 'mousedown', function(event) {
                this._isDragging = true;
                this._draggingPosition = {
                    x: this.offsetLeft - event.pageX,
                    y: this.offsetTop - event.pageY
                };
                event.preventDefault();
            }.bind(this));

            this.listenTo(this.ownerDocument, 'mouseup', function() {
                this._isDragging = false;
            }.bind(this));

            this.listenTo(this.ownerDocument, 'mousemove', function(event) {
                if (this._isDragging) {
                    this.style.left = event.pageX + this._draggingPosition.x + 'px';
                    this.style.top = event.pageY + this._draggingPosition.y + 'px';
                }
            }.bind(this));


            this.listenTo(this, 'close', function() {
                this._saveState();
                this.toggleHistoryView(true);
            }.bind(this));

        }
    
        connectedCallback() {
            super.connectedCallback();
            var connector = this.querySelector('.connector');

            if (connector) {
                connector.parentNode.removeChild(connector);
            }
            this._setupListeners();
        }
        disconnectedCallback() {
            this.stopListening();
        }
        addContent(content) {
            this.section = content;
        }
    
        show() {
            if (!this.classList.contains('visible')) {
                var getOffsetString = function(offsetValue) {
                        if (offsetValue < 0) {
                            return ' + ' + (-1 * offsetValue);
                        } else {
                            return ' - ' + offsetValue;
                        }
                    },
                    yOffsetValue = getOffsetString(234 - (window.pageYOffset || window.scrollY || 0)),
                    xOffsetValue = getOffsetString(350 - (window.pageXOffset || window.scrollX || 0));

                position.bringToFront(this);
                this.style.top = this._lastYPosition !== null ? this._lastYPosition : 'calc(50%' + yOffsetValue + 'px)';
                this.style.left = this._lastXPosition !== null ? this._lastXPosition : 'calc(50%' + xOffsetValue + 'px)';
                this.lastFocus = this.ownerDocument.activeElement;

                this.classList.remove('leave');
                this.classList.add('enter');
                this.classList.add('visible');

                if (this.offsetTop < 0) {
                    this.style.top = '0px';
                }

                if (this.offsetLeft < 0) {
                    this.style.left = '0px';
                }
               
                this.focus();
            }
        }
    
        close() {
            this.classList.remove('enter');
            this.classList.remove('visible');
            this.classList.add('leave');
        }


        set section(section) {
            section = Array.isArray(section) ? section[0] : section;
           
            this._section = section;
           
            if (this._section) {
                this.querySelector('section').appendChild(section);
            }
        }

        get section() {
            return this._section;
        }
       
    }
    
    customElements.define('wc-popup',Popup);


    window.wcUtils.components.Popup = Popup;

    
})(window);



