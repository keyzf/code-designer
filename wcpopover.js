;(function(window){
    var wcutils = window.wcUtils;
    var a11y = wcutils.a11y;
    var keys = wcutils.keys;
    var utils = wcutils.utils;
    var popup = wcutils.popup;


    function _closePopover(component) {
        if (component.contains(document.activeElement)) {
            document.activeElement.blur();
        }
        component.classList.remove('visible');
        component.classList.remove('leave');
    
    
        if (!component._noAutoFocusLastActiveElementOnClose && component.lastFocus) {
            component.lastFocus.focus();
        }
    
        component.open = false;
        component.emit('close');
    }
    
    
    function _onAnimationEnd(eventName, component) {
        var lastElementChild, focusedElement;
    
        switch (eventName) {
            case 'wc-fade-in':
                component.classList.remove('enter');
                if (!component._noAutoFocusFirstTabbableElementOnShow) {
                    lastElementChild = component.lastElementChild;
                    if (lastElementChild) {
                        focusedElement = a11y.setFocusOnAnyFirst(lastElementChild);
                        if (!focusedElement) {
                            lastElementChild.focus();
                        }
                    }
                }
    
                component.open = true;
                component.emit('show');
                break;
            case 'wc-fade-out':
                _closePopover(component);
                break;
        }
    }
    
    function _handleOwnerPopover(popover, element) {
        var ownerElement, popoverElement;
    
        popoverElement = utils.getComponentFromElement(element, 'WC-POPOVER');
        if (popoverElement) {
            ownerElement = popover.querySelector(popoverElement.targetSelector);
        }
    
        return ownerElement;
    }
    
    
    function ownerComponentFromPopover(popover, element) {
        var ownerElement;
    
        if (element.tagName === 'WC-POPOVER') {
            ownerElement = popover.querySelector(element.targetSelector);
        } else {
            ownerElement = _handleOwnerPopover(popover, element);
        }
    
        return ownerElement;
    }
    
    
    function contains(popover, element) {
        var result,
            elementToMatch = element;
    
        if (popover.contains(elementToMatch)) {
            result = true;
        } else {
            elementToMatch = ownerComponentFromPopover(popover, element);
            result = elementToMatch ? popover.contains(elementToMatch) : false;
        }
    
        return result;
    }
    
    
    function updateConnector(component, targetSelector) {
        var connector = component.querySelector('.connector'),
            target;
        if (targetSelector === '_previousSibling') {
            target = component.previousElementSibling;
        } else if (targetSelector !== '') {
            target = component.ownerDocument.querySelector(targetSelector);
        } else {
            target = component.target;
        }
    
        if (!target) {
            return;
        }
    
        if ( ((target.tagName === 'BUTTON' || target.tagName === 'A') && !target.classList.contains('no-connector'))
        || target.classList.contains('has-connector')) {
            if (!connector) {
                connector = component.ownerDocument.createElement('div');
                connector.classList.add('connector');
                component.insertBefore(connector, component.firstChild);
            }
        } else if (connector) {
            component.removeChild(connector);
        }
    }


    class  Popover extends UIComponent {
    
        constructor(){
            super();
        }
        init() {
            super.init();
           
            this._horizontalAlign = ['left', 'right'];
    
            this.setupProperties({
    
                targetSelector: {
                    default: '_previousSibling',
                    change: function(newValue) {
                        if (newValue === '_previousSibling') {
                            this._target = this.previousElementSibling;
                        }
    
                        updateConnector(this, newValue);
                    }
                }
            });

        }
    
        get openOrOpening() {
            return this.open || this.classList.contains('enter');
        }
    
        set section(content) {
            var connector = this.querySelector('.connector');
    
            while (this.firstChildElement) {
                this.removeChild(this.firstChildElement);
            }
    
            if (connector) {
                this.appendChild(connector);
            }
    
            this.appendChild(content);
    
            this._section = content;
        }
    
        get section() {
            return this._section;
        }
    
        get target() {
            var target = this._target;
    
            if (!target) {
                if (this.targetSelector === '_previousSibling') {
                    this._target = this.previousElementSibling;
                    target = this._target;
                } else {
                    target = this.ownerDocument.querySelector(this.targetSelector);
                }
            }
    
            return target;
        }
    
        set target(newTarget) {
            this._target = newTarget;
    
            updateConnector(this, this.targetSelector);
        }
    
        set horizontalAlign(alignment) {
            this._horizontalAlign = alignment;
        }
    
        get horizontalAlign() {
            return this._horizontalAlign;
        }
    
        postRender() {
            super.postRender();
    
            this._noAutoFocusFirstTabbableElementOnShow = false;
    
            this._noAutoFocusLastActiveElementOnClose = false;
    
            this._closeOnBlur = true;
    
            this.open = false;
    
            var content = this.querySelector('.connector') ? this.children[1] : this.children[0];
    
            if (content) {
                this._section = content;
            }
    
            this.tabIndex = -1;
    
            this.listenTo(this, 'blur', function(evt) {
                if (this._closeOnBlur) {
                    if (!evt.currentTarget.contains(evt.target)) {
                        utils.stopEvent(evt);
                    }
                    this._handleCloseOnBlur(this, evt.target);
                }
            }.bind(this), true);
    
            this.on('keydown', function(evt) {
                if (keys.ESCAPE === evt.keyCode) {
                    var component = utils.getComponentFromElement(evt.target, this.tagName);
    
                    if (component) {
                        component.close();
                    }
                    this.postHandleKeydown(component);
                }
            }.bind(this));
    
            var anim = utils.getAnimationEventNames();
            this.on(anim.animationend, function(evt) {
                if (evt.target === this) {
                    _onAnimationEnd(evt.animationName, evt.target);
                }
            }.bind(this));
        }
    
        _handleCloseOnBlur(popover, target) {
            var activeElement,
                that = this;
    
            setTimeout(function() {
                activeElement = popover.ownerDocument.activeElement;
                if (!contains(popover, activeElement)) {
                    popover.close();
                    that.postHandleCloseOnBlur(popover, target);
                }
            }, 1);
        }
    
        postHandleCloseOnBlur() {}
    
        postHandleKeydown() {}
    
        adoptedCallback() {
            updateConnector(this);
        }
  
        addContent(content) {
            this.section = content;
        }
    
        show() {
            var hasPositionSet = this.className.indexOf('position-') > -1,
                resizeMethod,
                self = this;
    
            if (!this.target || this.classList.contains('visible')) {
                return;
            }
    
            if (hasPositionSet || popup.setPosition(this, this.target, null, this._horizontalAlign)) {
                resizeMethod = popup.installResizeMethod(this, this.target, null, this._horizontalAlign);
    
                this.on('close', function onClose(evt) {
                    self.off('close', onClose);
                    if (evt.target === this) {
                        popup.uninstallResizeMethod(resizeMethod);
                        popup.clearPosition(this);
                    }
                });
    
                this.lastFocus = this.ownerDocument.activeElement;
                this.classList.remove('leave');
                this.classList.add('enter');
                this.classList.add('visible');
                this.tabIndex = 0;
            }
        }
    
        close(noAnimate) {
            if (noAnimate || this.parentElement === null) {
                _closePopover(this);
            } else {
                this.classList.add('leave');
            }
        }
       
    }
    
    customElements.define('wc-popover',Popover);


    window.wcUtils.components.Popover = Popover;

    
})(window);



