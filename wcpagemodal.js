;(function(window){

    var wcUtils =  window.wcUtils;
    var a11y =  wcUtils.a11y;
    var position = wcUtils.position;

    var underlay =  wcUtils.underlay;
    var keys = wcUtils.keys;
    var utils = wcUtils.utils;

    var contentNode = wcUtils.contentNode;
    var _animationend = 'webkitTransitionName' in document.documentElement.style ? 'webkitTransitionEnd' : 'animationend',

        _replaceContent = function(component, selector, content) {
            utils.replaceChildrenOf(component.querySelector(selector), content);
        },

        addPageModalFooterClass = function(element) {
            if (utils.isNode(element)) {
                element.classList.add('page-modal-footer');
            }
            return element;
        };

 customElements.define('wc-page-modal',class extends UIComponent {

        constructor(){
            super();
        }
        init() {

            super.init();

                this.lastFocus = null;

                this.setupProperties({

                    reactLayering: {
                        type: Boolean,
                        default: false
                    },
                    visible: {
                        type: Boolean,
                        default: false
                    },

                    noCloseOnDismiss: {
                        type: Boolean,
                        default: false
                    }
                });
        }

            get header() {
                return this._header;
            }

            get section() {
                return this._section;
            }

            get footer() {
                return this._footer;
            }

            set header(content) {
                _replaceContent(this, 'header', content);
                this._header = content;
            }

            set section(content) {
                _replaceContent(this, 'section', content);
                this._section = content;
            }

            set footer(content) {
                addPageModalFooterClass(content);
                _replaceContent(this, 'div.page-modal-panel > footer', content);
                this._footer = content;
            }

            get headerNode() {
                return this.querySelector('div.page-modal-panel > header');
            }

            get footerNode() {
                return this.querySelector('div.page-modal-panel > footer');
            }

            get sectionNode() {
                return this.querySelector('div.page-modal-panel > section');
            }

            connectedCallback() {
                super.connectedCallback();
                this.tabIndex = '-1';
                this.role = 'dialog';
            }

            postRender() {
                var _component = this;
                var el = utils.createElement,
                    renderedOrUserProvided = utils.contentQueryFactory(_component, {
                        'header': 'div.page-modal-panel > header',
                        'section': 'div.page-modal-panel > section',
                        'footer': 'div.page-modal-panel > footer'
                    }),
                    self = _component,
                    div, header, section, footer;

                header = renderedOrUserProvided('header') || el('header');
                section = renderedOrUserProvided('section');
                footer = renderedOrUserProvided('footer');

                addPageModalFooterClass(footer);


                super.postRender(this);


                this.on('keydown', function(evt) {
                    if (evt.keyCode === keys.ESCAPE) {
                        evt.stopPropagation();
                        evt.preventDefault();
                        self.emit('dismiss');
                        if (!this.noCloseOnDismiss) {
                            self.close();
                        }
                    }
                    if (keys.TAB === evt.keyCode) {
                        a11y.keepFocusInsideListener(evt, self);
                    }
                });

                this.on('dismiss', function(evt) {
                    if (evt.target.tagName === 'WC-PAGE-MODAL-HEADER') {
                        evt.stopImmediatePropagation();
                        self.emit('dismiss');
                        if (!this.noCloseOnDismiss) {
                            self.close();
                        }
                    }
                });

                utils.removeAllChildrenFrom(this);

                debugger

                div =
                    el('div', {
                        'className': 'page-modal-panel',
                        'attr-aria-hidden': 'true'
                    }, [
                        header,
                        el('section', {'attr-tabindex': '-1'}, [
                            section
                        ]),
                        el('footer', {'attr-tabindex': '-1'}, [
                            footer
                        ])
                    ]);

                _component.appendChild(div);
                this.classList.add('hidden');
            }


            show() {
                var pageModal,
                    self = this;

                if (!this.visible) {
                    this.visible = true;
                    this.classList.remove('hidden');

                    this.on(_animationend, function onShow() {
                        a11y.setFocusOnFirst(self.querySelector('section'));
                        if (!this.reactLayering) {
                            underlay.show(this);
                        }

                        if (!this.reactLayering) {
                            position.bringToFront(this);
                        }

                        self.off(_animationend, onShow);
                        self.emit('did-show');
                    });

                    if (!this.reactLayering) {
                        position.bringToFront(this);
                    }
                    this.lastFocus = this.ownerDocument.activeElement;
                    this.classList.remove('slide-out');
                    this.ownerDocument.body.classList.add('modal-open');

                    pageModal = this.querySelector('.page-modal-panel');
                    pageModal.setAttribute('aria-hidden', false);

                    setTimeout(function() {
                        this.classList.add('slide-in');
                    }.bind(this), 0);

                    this.emit('show');
                }
            }

            addContent(config) {
                var contentPropertyMap = {
                    'header': 'header',
                    'section': 'section',
                    'footer': 'footer'
                };

                contentNode.addContent(this, config, contentPropertyMap);
            }

            close() {
                var pageModal,
                    pageModalHeader,
                    self = this;

                if (this.visible) {
                    this.visible = false;

                    this.on(_animationend, function onHide() {
                        self.classList.remove('slide-out');
                        self.stopListening(pageModal, _animationend, onHide);
                        if (self.lastFocus) {
                            self.lastFocus.focus();
                        }
                        self.lastFocus = null;
                        self.off(_animationend, onHide);
                        self.classList.add('hidden');
                        self.emit('did-close');
                    });

                    pageModal = this.querySelector('.page-modal-panel');
                    pageModal.setAttribute('aria-hidden', true);

                    pageModalHeader = this.querySelector('wc-page-modal-header');

                    if (pageModalHeader) {
                        pageModalHeader.unselect();
                    }

                    if (!this.reactLayering) {
                        underlay.hide();
                    }

                    this.classList.remove('slide-in');
                    this.classList.add('slide-out');
                    this.ownerDocument.body.classList.remove('modal-open');

                    this.emit('close');
                }
            }
        });


})(window);