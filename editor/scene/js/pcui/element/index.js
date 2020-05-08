/* pcui/element/element.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ELEMENT = 'pcui-element';

    // these are properties that are
    // available as Element properties and
    // can also be set through the Element constructor
    const SIMPLE_CSS_PROPERTIES = [
        'flexDirection',
        'flexGrow',
        'flexBasis',
        'flexShrink',
        'flexWrap',
        'alignItems',
        'alignSelf',
        'justifyContent',
        'justifySelf'
    ];

    // utility function to expose a CSS property
    // via an Element.prototype property
    function exposeCssProperty(name) {
        Object.defineProperty(Element.prototype, name, {
            get: function () {
                return this.style[name];
            },
            set: function (value) {
                this.style[name] = value;
            }
        });
    }

    // Stores Element types by name and default arguments
    const ELEMENT_REGISTRY = {};

  
    class Element extends Events {
        constructor(dom, args) {
            super();

            if (!args) args = {};

            this._destroyed = false;
            this._parent = null;

            this._domEventClick = this._onClick.bind(this);
            this._domEventMouseOver = this._onMouseOver.bind(this);
            this._domEventMouseOut = this._onMouseOut.bind(this);
            this._eventsParent = [];

            this._dom = dom || document.createElement('div');

            if (args.id !== undefined) {
                this._dom.id = args.id;
            }

            // add ui reference
            this._dom.ui = this;

            // add event listeners
            this._dom.addEventListener('click', this._domEventClick);
            this._dom.addEventListener('mouseover', this._domEventMouseOver);
            this._dom.addEventListener('mouseout', this._domEventMouseOut);

            // add element class
            this._dom.classList.add(CLASS_ELEMENT);

            // add user classes
            if (args.class) {
                if (Array.isArray(args.class)) {
                    for (let i = 0; i < args.class.length; i++) {
                        this._dom.classList.add(args.class[i]);
                    }
                } else {
                    this._dom.classList.add(args.class);
                }
            }

            this.enabled = args.enabled !== undefined ? args.enabled : true;
            this.hidden = args.hidden || false;
            this.readOnly = args.readOnly || false;
            this.ignoreParent = args.ignoreParent || false;

            if (args.width !== undefined) {
                this.width = args.width;
            }
            if (args.height !== undefined) {
                this.height = args.height;
            }
            if (args.tabIndex !== undefined) {
                this.tabIndex = args.tabIndex;
            }

            // copy CSS properties from args
            for (const key in args) {
                if (args[key] === undefined) continue;
                if (SIMPLE_CSS_PROPERTIES.indexOf(key) !== -1) {
                    this[key] = args[key];
                }
            }

            // set the binding object
            if (args.binding) {
                this.binding = args.binding;
            }

            this._flashTimeout = null;
        }

        link(observers, paths) {
            this._binding.link(observers, paths);
        }


        /**
         * @name pcui.Element#unlink
         * @description Unlinks the Element from its observers
         */
        unlink() {
            if (this._binding) {
                this._binding.unlink();
            }
        }

        /**
         * @name pcui.Element#flash
         * @description Triggers a flash animation on the Element.
         */
        flash() {
            if (this._flashTimeout) return;

            this.class.add(pcui.CLASS_FLASH);
            this._flashTimeout = setTimeout(function () {
                this._flashTimeout = null;
                this.class.remove(pcui.CLASS_FLASH);
            }.bind(this), 200);
        }

        _onClick(evt) {
            if (this.enabled) {
                this.emit('click', evt);
            }
        }

        _onMouseOver(evt) {
            this.emit('hover', evt);
        }

        _onMouseOut(evt) {
            this.emit('hoverend', evt);
        }

        _onEnabledChange(enabled) {
            
            if (enabled) {
                this.class.remove(pcui.CLASS_DISABLED);
            } else {
                this.class.add(pcui.CLASS_DISABLED);
            }

            this.emit(enabled ? 'enable' : 'disable');
        }

        _onParentDestroy() {
            this.destroy();
        }

        _onParentDisable() {
            if (this._ignoreParent) return;
            if (this._enabled) {
                this._onEnabledChange(false);
            }
        }

        _onParentEnable() {
            if (this._ignoreParent) return;
            if (this._enabled) {
                this._onEnabledChange(true);
            }
        }

        _onReadOnlyChange(readOnly) {
            if (readOnly) {
                this.class.add(pcui.CLASS_READONLY);
            } else {
                this.class.remove(pcui.CLASS_READONLY);
            }

            this.emit('readOnly', readOnly);
        }

        _onParentReadOnlyChange(readOnly) {
            if (this._ignoreParent) return;
            if (readOnly) {
                if (!this._readOnly) {
                    this._onReadOnlyChange(true);
                }
            } else {
                if (!this._readOnly) {
                    this._onReadOnlyChange(false);
                }
            }

        }

        /**
         * @name pcui.Element#destroy
         * @description Destroys the Element and its events.
         */
        destroy() {
            if (this._destroyed) return;

            this._destroyed = true;

            if (this.binding) {
                this.binding = null;
            } else {
                this.unlink();
            }

            if (this.parent) {
                const parent = this.parent;
                this._parent = null;

                for (let i = 0; i < this._eventsParent.length; i++) {
                    this._eventsParent[i].unbind();
                }
                this._eventsParent.length = 0;

                if (this._dom && this._dom.parentElement) {
                    this._dom.parentElement.removeChild(this._dom);
                }

                // emit remove event on parent
                // check if parent has been destroyed already
                // because we do not want to be emitting events
                // on a destroyed parent after it's been destroyed
                // as it is easy to lead to null exceptions
                if (parent.remove && !parent._destroyed) {
                    parent.emit('remove', this);
                }
            }

            if (this._dom) {
                // remove event listeners
                this._dom.removeEventListener('click', this._domEventClick);
                this._dom.removeEventListener('mouseover', this._domEventMouseOver);
                this._dom.removeEventListener('mouseout', this._domEventMouseOut);

                // remove ui reference
                delete this._dom.ui;

                this._dom = null;
            }

            this._domEventClick = null;
            this._domEventMouseOver = null;
            this._domEventMouseOut = null;

            if (this._flashTimeout) {
                clearTimeout(this._flashTimeout);
            }

            this.emit('destroy');

            this.unbind();
        }

        /**
         * @static
         * Registers a new Element type
         * @param {String} type The type we want to reference this Element by
         * @param {Object} cls The actual class of the Element
         * @param {Object} [defaultArguments] Default arguments when creating this type
         */
        static register(type, cls, defaultArguments) {
            ELEMENT_REGISTRY[type] = { cls, defaultArguments };
        }

        /**
         * @static
         * Unregisters the specified Element type
         * @param {String} type The type we want to unregister
         */
        static unregister(type) {
            delete ELEMENT_REGISTRY[type];
        }

        /**
         * @static
         * Creates a new Element by type
         * @param {String} type The type of the Element (registered by pcui.Element#register)
         * @param {Object} args Arguments for the Element
         * @returns {pcui.Element} A new pcui.Element of the desired type
         */
        static create(type, args) {
            const entry = ELEMENT_REGISTRY[type];
            if (!entry) {
                console.error('Invalid type passed to pcui.Element#create', type);
                return;
            }

            const cls = entry.cls;
            const clsArgs = {};

            if (entry.defaultArguments) {
                Object.assign(clsArgs, entry.defaultArguments);
            }
            if (args) {
                Object.assign(clsArgs, args);
            }

            return new cls(clsArgs);
        }

        get enabled() {
            if (this._ignoreParent) return this._enabled;
            return this._enabled && (!this._parent || this._parent.enabled);
        }

        set enabled(value) {
            if (this._enabled === value) return;

            // remember if enabled in hierarchy
            const enabled = this.enabled;

            this._enabled = value;

            // only fire event if hierarchy state changed
            if (enabled !== value) {
                this._onEnabledChange(value);
            }
        }

        get ignoreParent() {
            return this._ignoreParent;
        }

        set ignoreParent(value) {
            this._ignoreParent = value;
            this._onEnabledChange(this.enabled);
            this._onReadOnlyChange(this.readOnly);
        }

        get dom() {
            return this._dom;
        }

        get parent() {
            return this._parent;
        }

        set parent(value) {
            if (value === this._parent) return;

            const oldEnabled = this.enabled;
            const oldReadonly = this.readOnly;

            if (this._parent) {
                for (let i = 0; i < this._eventsParent.length; i++) {
                    this._eventsParent[i].unbind();
                }
                this._eventsParent.length = 0;
            }

            this._parent = value;

            if (this._parent) {
                this._eventsParent.push(this._parent.once('destroy', this._onParentDestroy.bind(this)));
                this._eventsParent.push(this._parent.on('disable', this._onParentDisable.bind(this)));
                this._eventsParent.push(this._parent.on('enable', this._onParentEnable.bind(this)));
                this._eventsParent.push(this._parent.on('readOnly', this._onParentReadOnlyChange.bind(this)));
            }

            this.emit('parent', this._parent);

            const newEnabled = this.enabled;
            if (newEnabled !== oldEnabled) {
                this._onEnabledChange(newEnabled);
            }

            const newReadonly = this.readOnly;
            if (newReadonly !== oldReadonly) {
                this._onReadOnlyChange(newReadonly);
            }

        }

        get hidden() {
            return this._hidden;
        }

        set hidden(value) {
            if (value === this._hidden) return;

            this._hidden = value;

            if (value) {
                this.class.add(pcui.CLASS_HIDDEN);
            } else {
                this.class.remove(pcui.CLASS_HIDDEN);
            }

            this.emit(value ? 'hide' : 'show');
        }

        get readOnly() {
            if (this._ignoreParent) return this._readOnly;
            return this._readOnly || !!(this._parent && this._parent.readOnly);
        }

        set readOnly(value) {
            if (this._readOnly === value) return;
            this._readOnly = value;

            this._onReadOnlyChange(value);
        }

        get error() {
            return this._hasError;
        }

        set error(value) {
            if (this._hasError === value) return;
            this._hasError = value;
            if (value) {
                this.class.add(pcui.CLASS_ERROR);
            } else {
                this.class.remove(pcui.CLASS_ERROR);
            }
        }

        get style() {
            return this._dom.style;
        }

        get class() {
            return this._dom.classList;
        }

        get width() {
            return this._dom.clientWidth;
        }

        set width(value) {
            if (typeof value === 'number') {
                value += 'px';
            }
            this.style.width = value;
        }

        get height() {
            return this._dom.clientHeight;
        }

        set height(value) {
            if (typeof value === 'number') {
                value += 'px';
            }
            this.style.height = value;
        }

        get tabIndex() {
            return this._dom.tabIndex;
        }

        set tabIndex(value) {
            this._dom.tabIndex = value;
        }

        get binding() {
            return this._binding;
        }

        set binding(value) {
            if (this._binding === value) return;

            let prevObservers;
            let prevPaths;

            if (this._binding) {
                prevObservers = this._binding.observers;
                prevPaths = this._binding.paths;

                this.unlink();
                this._binding.element = null;
                this._binding = null;
            }

            this._binding = value;

            if (this._binding) {
                this._binding.element = this;
                if (prevObservers && prevPaths) {
                    this.link(prevObservers, prevPaths);
                }
            }
        }

        get destroyed() {
            return this._destroyed;
        }

        /*  Backwards Compatibility */
        // we should remove those after we migrate
        get disabled() {
            return !this.enabled;
        }

        set disabled(value) {
            this.enabled = !value;
        }

        get element() {
            return this.dom;
        }

        set element(value) {
            this.dom = value;
        }

        get innerElement() {
            return this.domContent;
        }

        set innerElement(value) {
            this.domContent = value;
        }
    }

    // expose rest of CSS properties
    SIMPLE_CSS_PROPERTIES.forEach(exposeCssProperty);

    return {
        Element: Element
    };
})());


/* pcui/element/element-container.js */
Object.assign(pcui, (function () {
    'use strict';

    const RESIZE_HANDLE_SIZE = 4;

    const VALID_RESIZABLE_VALUES = [
        null,
        'top',
        'right',
        'bottom',
        'left'
    ];

    const CLASS_RESIZING = pcui.CLASS_RESIZABLE + '-resizing';
    const CLASS_RESIZABLE_HANDLE = 'pcui-resizable-handle';
    const CLASS_CONTAINER = 'pcui-container';

    const CLASS_DRAGGED = CLASS_CONTAINER + '-dragged';
    const CLASS_DRAGGED_CHILD = CLASS_DRAGGED + '-child';

    /**
     * @event
     * @name pcui.Container#append
     * @description Fired when a child Element gets added to the Container
     * @param {pcui.Element} element The element that was added
     */

    /**
     * @event
     * @name pcui.Container#remove
     * @description Fired when a child Element gets removed from the Container
     * @param {pcui.Element} element The element that was removed
     */

    /**
     * @event
     * @name pcui.Container#scroll
     * @description Fired when the container is scrolled.
     * @param {Event} evt The native scroll event.
     */

    /**
     * @event
     * @name pcui.Container#resize
     * @description Fired when the container gets resized using the resize handle.
     */

    /**
     * @name pcui.Container
     * @classdesc A container is the basic building block for Elements that are grouped together.
     * A container can contain any other element including other containers.
     * @property {Boolean} flex Gets / sets whether the container supports the flex layout. Cannot coexist with grid.
     * @property {Boolean} grid Gets / sets whether the container supports the grid layout. Cannot coexist with flex.
     * @property {Number} resizeMin Gets / sets the minimum size the Container can take when resized in pixels.
     * @property {Number} resizeMax Gets / sets the maximum size the Container can take when resized in pixels.
     * @property {Boolean} scrollable Gets / sets whether the container should be scrollable. Defaults to false.
     * @property {String} resizable Gets / sets whether the Container is resizable and where the resize handle is located. Can
     * be one of 'top', 'bottom', 'right', 'left'. Set to null to disable resizing.
     * @extends pcui.Element
     * @mixes pcui.IContainer
     * @mixes pcui.IFlex
     * @mixes pcui.IGrid
     * @mixes pcui.IScrollable
     * @mixes pcui.IResizable
     */
    class Container extends pcui.Element {
        /**
         * Creates a new Container.
         * @param {Object} args The arguments. Extends the pcui.Element constructor arguments. All settable properties can also be set through the constructor.
         * @param {HTMLElement} [args.dom] The DOM element to use for the container. If unspecified a new element will be created.
         */
        constructor(args) {
            if (!args) args = {};

            const dom = args.dom || document.createElement('div');

            super(dom, args);

            this.class.add(CLASS_CONTAINER);

            this._domEventScroll = this._onScroll.bind(this);
            this.domContent = this._dom;

            // scroll
            this.scrollable = args.scrollable !== undefined ? args.scrollable : false;

            // flex
            this.flex = !!args.flex;

            // grid
            let grid = !!args.grid;
            if (grid) {
                if (this.flex) {
                    console.error('Invalid pcui.Container arguments: "grid" and "flex" cannot both be true.');
                    grid = false;
                }
            }
            this.grid = grid;

            // resize related
            this._domResizeHandle = null;
            this._domEventResizeStart = this._onResizeStart.bind(this);
            this._domEventResizeMove = this._onResizeMove.bind(this);
            this._domEventResizeEnd = this._onResizeEnd.bind(this);
            this._domEventResizeTouchStart = this._onResizeTouchStart.bind(this);
            this._domEventResizeTouchMove = this._onResizeTouchMove.bind(this);
            this._domEventResizeTouchEnd = this._onResizeTouchEnd.bind(this);
            this._resizeTouchId = null;
            this._resizeData = null;
            this._resizeHorizontally = true;

            this.resizable = args.resizable || null;
            this._resizeMin = 100;
            this._resizeMax = 300;

            if (args.resizeMin !== undefined) {
                this.resizeMin = args.resizeMin;
            }
            if (args.resizeMax !== undefined) {
                this.resizeMax = args.resizeMax;
            }

            this._draggedStartIndex = -1;
        }

        /**
         * @name pcui.Container#append
         * @description Appends an element to the container.
         * @param {pcui.Element} element The element to append.
         * @fires 'append'
         */
        append(element) {
            const dom = this._getDomFromElement(element);
            this._domContent.appendChild(dom);
            this._onAppendChild(element);
        }

        /**
         * @name pcui.Container#appendBefore
         * @description Appends an element to the container before the specified reference element.
         * @param {pcui.Element} element The element to append.
         * @param {pcui.Element} referenceElement The element before which the element will be appended.
         * @fires 'append'
         */
        appendBefore(element, referenceElement) {
            const dom = this._getDomFromElement(element);
            this._domContent.appendChild(dom);
            const referenceDom =  referenceElement && this._getDomFromElement(referenceElement);

            this._domContent.insertBefore(dom, referenceDom);

            this._onAppendChild(element);
        }

        /**
         * @name pcui.Container#appendAfter
         * @description Appends an element to the container just after the specified reference element.
         * @param {pcui.Element} element The element to append.
         * @param {pcui.Element} referenceElement The element after which the element will be appended.
         * @fires 'append'
         */
        appendAfter(element, referenceElement) {
            const dom = this._getDomFromElement(element);
            const referenceDom = referenceElement && this._getDomFromElement(referenceElement);

            const elementBefore = referenceDom ? referenceDom.nextSibling : null;
            if (elementBefore) {
                this._domContent.insertBefore(dom, elementBefore);
            } else {
                this._domContent.appendChild(dom);
            }

            this._onAppendChild(element);
        }

        /**
         * @name pcui.Container#prepend
         * @description Inserts an element in the beginning of the container.
         * @param {pcui.Element} element The element to prepend.
         * @fires 'append'
         */
        prepend(element) {
            const dom = this._getDomFromElement(element);
            const first = this._domContent.firstChild;
            if (first) {
                this._domContent.insertBefore(dom, first);
            } else {
                this._domContent.appendChild(dom);
            }

            this._onAppendChild(element);
        }

        /**
         * @name pcui.Container#remove
         * @description Removes the specified child element from the container.
         * @param {pcui.Element} element The element to remove.
         * @fires 'remove'
         */
        remove(element) {
            if (element.parent !== this) return;

            const dom = this._getDomFromElement(element);
            this._domContent.removeChild(dom);

            this._onRemoveChild(element);
        }

        /**
         * @name pcui.Container#move
         * @description Moves the specified child at the specified index.
         * @param {pcui.Element} element The element to move.
         * @param {Number} index The index
         */
        move(element, index) {
            let idx = -1;
            for (let i = 0; i < this.dom.childNodes.length; i++) {
                if (this.dom.childNodes[i].ui === element) {
                    idx = i;
                    break;
                }
            }

            if (idx === -1) {
                this.appendBefore(element, this.dom.childNodes[index]);
            } else if (index !== idx) {
                this.remove(element);
                if (index < idx) {
                    this.appendBefore(element, this.dom.childNodes[index]);
                } else {
                    this.appendAfter(element, this.dom.childNodes[index - 1]);
                }
            }
        }

        /**
         * @name pcui.Container#clear
         * @description Clears all children from the container.
         * @fires 'remove' for each child element.
         */
        clear() {
            let i = this._domContent.childNodes.length;
            while (i--) {
                const node = this._domContent.childNodes[i];
                if (node.ui) {
                    node.ui.destroy();
                }
            }

            this._domContent.innerHTML = '';
        }

        // Used for backwards compatibility with the legacy ui framework
        _getDomFromElement(element) {
            if (element.dom) {
                return element.dom;
            }

            if (element.element) {
                // console.log('Legacy ui.Element passed to pcui.Container', this.class, element.class);
                return element.element;
            }

            return element;
        }

        _onAppendChild(element) {
            element.parent = this;
            this.emit('append', element);
        }

        _onRemoveChild(element) {
            element.parent = null;
            this.emit('remove', element);
        }

        _onScroll(evt) {
            this.emit('scroll', evt);
        }

        _createResizeHandle() {
            const handle = document.createElement('div');
            handle.classList.add(CLASS_RESIZABLE_HANDLE);
            handle.ui = this;

            handle.addEventListener('mousedown', this._domEventResizeStart);
            handle.addEventListener('touchstart', this._domEventResizeTouchStart);

            this._domResizeHandle = handle;
        }

        _onResizeStart(evt) {
            evt.preventDefault();
            evt.stopPropagation();

            window.addEventListener('mousemove', this._domEventResizeMove);
            window.addEventListener('mouseup', this._domEventResizeEnd);

            this._resizeStart();
        }

        _onResizeMove(evt) {
            evt.preventDefault();
            evt.stopPropagation();

            this._resizeMove(evt.clientX, evt.clientY);
        }

        _onResizeEnd(evt) {
            evt.preventDefault();
            evt.stopPropagation();

            window.removeEventListener('mousemove', this._domEventResizeMove);
            window.removeEventListener('mouseup', this._domEventResizeEnd);

            this._resizeEnd();
        }

        _onResizeTouchStart(evt) {
            evt.preventDefault();
            evt.stopPropagation();

            for (let i = 0; i < evt.changedTouches.length; i++) {
                const touch = evt.changedTouches[i];
                if (touch.target === this._domResizeHandle) {
                    this._resizeTouchId = touch.identifier;
                }
            }

            window.addEventListener('touchmove', this._domEventResizeTouchMove);
            window.addEventListener('touchend', this._domEventResizeTouchEnd);

            this._resizeStart();
        }

        _onResizeTouchMove(evt) {
            for (let i = 0; i < evt.changedTouches.length; i++) {
                const touch = evt.changedTouches[i];
                if (touch.identifier !== this._resizeTouchId) {
                    continue;
                }

                evt.stopPropagation();
                evt.preventDefault();

                this._resizeMove(touch.clientX, touch.clientY);

                break;
            }
        }

        _onResizeTouchEnd(evt) {
            for (let i = 0; i < evt.changedTouches.length; i++) {
                const touch = evt.changedTouches[i];
                if (touch.identifier === this._resizeTouchId) {
                    continue;
                }

                this._resizeTouchId = null;

                evt.preventDefault();
                evt.stopPropagation();

                window.removeEventListener('touchmove', this._domEventResizeTouchMove);
                window.removeEventListener('touchend', this._domEventResizeTouchEnd);

                this._resizeEnd();

                break;
            }
        }

        _resizeStart() {
            this.class.add(CLASS_RESIZING);
        }

        _resizeMove(x, y) {
            // if we haven't initialized resizeData do so now
            if (!this._resizeData) {
                this._resizeData = {
                    x: x,
                    y: y,
                    width: this.dom.clientWidth,
                    height: this.dom.clientHeight
                };

                return;
            }

            if (this._resizeHorizontally) {
                // horizontal resizing
                let offsetX = this._resizeData.x - x;

                if (this._resizable === 'right') {
                    offsetX = -offsetX;
                }

                this.width = RESIZE_HANDLE_SIZE + Math.max(this._resizeMin, Math.min(this._resizeMax, (this._resizeData.width + offsetX)));
            } else {
                // vertical resizing
                let offsetY = this._resizeData.y - y;

                if (this._resizable === 'bottom') {
                    offsetY = -offsetY;
                }

                this.height = Math.max(this._resizeMin, Math.min(this._resizeMax, (this._resizeData.height + offsetY)));
            }

            this.emit('resize');
        }

        _resizeEnd() {
            this._resizeData = null;
            this.class.remove(CLASS_RESIZING);
        }

        /**
         * Resize the container
         * @param {Number} x The amount of pixels to resize the width
         * @param {Number} y The amount of pixels to resize the height
         */
        resize(x, y) {
            x = x || 0;
            y = y || 0;

            this._resizeStart();
            this._resizeMove(0, 0);
            this._resizeMove(-x + RESIZE_HANDLE_SIZE, -y);
            this._resizeEnd();
        }

        _getDraggedChildIndex(draggedChild) {
            for (let i = 0; i < this.dom.childNodes.length; i++) {
                if (this.dom.childNodes[i].ui === draggedChild) {
                    return i;
                }
            }

            return -1;
        }

        _onChildDragStart(evt, childPanel) {
            this.class.add(CLASS_DRAGGED_CHILD);

            this._draggedStartIndex = this._getDraggedChildIndex(childPanel);

            childPanel.class.add(CLASS_DRAGGED);

            this._draggedHeight = childPanel.height;

            this.emit('child:dragstart', childPanel, this._draggedStartIndex);
        }

        _onChildDragMove(evt, childPanel) {
            const rect = this.dom.getBoundingClientRect();

            const dragOut = (evt.clientX < rect.left || evt.clientX > rect.right || evt.clientY < rect.top || evt.clientY > rect.bottom);

            const childPanelIndex = this._getDraggedChildIndex(childPanel);

            if (dragOut) {
                childPanel.class.remove(CLASS_DRAGGED);
                if (this._draggedStartIndex !== childPanelIndex) {
                    this.remove(childPanel);
                    if (this._draggedStartIndex < childPanelIndex) {
                        this.appendBefore(childPanel, this.dom.childNodes[this._draggedStartIndex]);
                    } else {
                        this.appendAfter(childPanel, this.dom.childNodes[this._draggedStartIndex - 1]);
                    }
                }

                return;
            }

            childPanel.class.add(CLASS_DRAGGED);

            const y = evt.clientY - rect.top;
            let ind = null;

            // hovered script
            for (let i = 0; i < this.dom.childNodes.length; i++) {
                const otherPanel = this.dom.childNodes[i].ui;
                const otherTop = otherPanel.dom.offsetTop;
                if (i < childPanelIndex) {
                    if (y <= otherTop + otherPanel.header.height) {
                        ind = i;
                        break;
                    }
                } else if (i > childPanelIndex) {
                    if (y + childPanel.height >= otherTop + otherPanel.height) {
                        ind = i;
                        break;
                    }
                }
            }

            if (ind !== null && childPanelIndex !== ind) {
                this.remove(childPanel);
                if (ind < childPanelIndex) {
                    this.appendBefore(childPanel, this.dom.childNodes[ind]);
                } else {
                    this.appendAfter(childPanel, this.dom.childNodes[ind - 1]);
                }
            }
        }

        _onChildDragEnd(evt, childPanel) {
            this.class.remove(CLASS_DRAGGED_CHILD);

            childPanel.class.remove(CLASS_DRAGGED);

            const index = this._getDraggedChildIndex(childPanel);

            this.emit('child:dragend', childPanel, index, this._draggedStartIndex);

            this._draggedStartIndex = -1;
        }

        forEachChild(fn) {
            for (let i = 0; i < this.dom.childNodes.length; i++) {
                const node = this.dom.childNodes[i].ui;
                if (node) {
                    const result = fn(node);
                    if (result === false) {
                        // early out
                        break;
                    }
                }
            }
        }

        /**
         * If the current node contains a root, recursively append it's children to this node
         * and return it. Otherwise return the current node. Also add each child to the parent
         * under its keyed name.
         *
         * @param {Object} node - The current element in the dom structure which must be recursively
         * traversed and appended to it's parent
         *
         * @returns {pcui.Element} - The recursively appended element node
         *
         */
        _buildDomNode(node) {
            const keys = Object.keys(node);
            let rootNode;
            if (keys.includes('root')) {
                rootNode = this._buildDomNode(node.root);
                node.children.forEach(childNode => {
                    const childNodeElement = this._buildDomNode(childNode);
                    if (childNodeElement !== null) {
                        rootNode.append(childNodeElement);
                    }
                });
            } else {
                rootNode = node[keys[0]];
                this[`_${keys[0]}`] = rootNode;
            }
            return rootNode;
        }

        /**
         * Takes an array of pcui elements, each of which can contain their own child elements, and
         * appends them to this container. These child elements are traversed recursively using
         * _buildDomNode.
         *
         * @param {array} dom - An array of child pcui elements to append to this container.
         *
         * @example
         *
         *     buildDom([
         *          {
         *              child1: pcui.Label()
         *          },
         *          {
         *              root: {
         *                  container1: pcui.Container()
         *              },
         *              children: {
         *                  [
         *                      {child2: pcui.Label()},
         *                      {child3: pcui.Label()}
         *                  ]
         *              }
         *          }
         *     ])
         */
        buildDom(dom) {
            dom.forEach(node => {
                const builtNode = this._buildDomNode(node);
                this.append(builtNode);
            });
        }

        destroy() {
            if (this._destroyed) return;
            this.domContent = null;

            if (this._domResizeHandle) {
                this._domResizeHandle.removeEventListener('mousedown', this._domEventResizeStart);
                window.removeEventListener('mousemove', this._domEventResizeMove);
                window.removeEventListener('mouseup', this._domEventResizeEnd);

                this._domResizeHandle.removeEventListener('touchstart', this._domEventResizeTouchStart);
                window.removeEventListener('touchmove', this._domEventResizeTouchMove);
                window.removeEventListener('touchend', this._domEventResizeTouchEnd);
            }

            this._domResizeHandle = null;
            this._domEventResizeStart = null;
            this._domEventResizeMove = null;
            this._domEventResizeEnd = null;
            this._domEventResizeTouchStart = null;
            this._domEventResizeTouchMove = null;
            this._domEventResizeTouchEnd = null;
            this._domEventScroll = null;

            super.destroy();
        }

        get flex() {
            return this._flex;
        }

        set flex(value) {
            if (value === this._flex) return;

            this._flex = value;

            if (value) {
                this.class.add(pcui.CLASS_FLEX);
            } else {
                this.class.remove(pcui.CLASS_FLEX);
            }
        }

        get grid() {
            return this._grid;
        }

        set grid(value) {
            if (value === this._grid) return;

            this._grid = value;

            if (value) {
                this.class.add(pcui.CLASS_GRID);
            } else {
                this.class.remove(pcui.CLASS_GRID);
            }
        }

        get scrollable() {
            return this._scrollable;
        }

        set scrollable(value) {
            if (this._scrollable === value) return;

            this._scrollable = value;

            if (value) {
                this.class.add(pcui.CLASS_SCROLLABLE);
            } else {
                this.class.remove(pcui.CLASS_SCROLLABLE);
            }

        }

        get resizable() {
            return this._resizable;
        }

        set resizable(value) {
            if (value === this._resizable) return;

            if (VALID_RESIZABLE_VALUES.indexOf(value) === -1) {
                console.error('Invalid resizable value: must be one of ' + VALID_RESIZABLE_VALUES.join(','));
                return;
            }

            // remove old class
            if (this._resizable) {
                this.class.remove(`${pcui.CLASS_RESIZABLE}-${this._resizable}`);
            }

            this._resizable = value;
            this._resizeHorizontally = (value === 'right' || value === 'left');

            if (value) {
                // add resize class and create / append resize handle
                this.class.add(pcui.CLASS_RESIZABLE);
                this.class.add(`${pcui.CLASS_RESIZABLE}-${value}`);

                if (!this._domResizeHandle) {
                    this._createResizeHandle();
                }
                this._dom.appendChild(this._domResizeHandle);
            } else {
                // remove resize class and resize handle
                this.class.remove(pcui.CLASS_RESIZABLE);
                if (this._domResizeHandle) {
                    this._dom.removeChild(this._domResizeHandle);
                }
            }

        }

        get resizeMin() {
            return this._resizeMin;
        }

        set resizeMin(value) {
            this._resizeMin = Math.max(0, Math.min(value, this._resizeMax));
        }

        get resizeMax() {
            return this._resizeMax;
        }

        set resizeMax(value) {
            this._resizeMax = Math.max(this._resizeMin, value);
        }

        // The internal dom element used as a the container of all children.
        // Can be overriden by derived classes
        get domContent() {
            return this._domContent;
        }

        set domContent(value) {
            if (this._domContent === value) return;

            if (this._domContent) {
                this._domContent.removeEventListener('scroll', this._domEventScroll);
            }

            this._domContent = value;

            if (this._domContent) {
                this._domContent.addEventListener('scroll', this._domEventScroll);
            }
        }
    }

    utils.implements(Container, pcui.IContainer);
    utils.implements(Container, pcui.IFlex);
    utils.implements(Container, pcui.IGrid);
    utils.implements(Container, pcui.IScrollable);
    utils.implements(Container, pcui.IResizable);

    pcui.Element.register('container', Container);

    return {
        Container: Container
    };
})());


/* pcui/element/element-panel.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_PANEL = 'pcui-panel';
    const CLASS_PANEL_HEADER = CLASS_PANEL + '-header';
    const CLASS_PANEL_HEADER_TITLE = CLASS_PANEL_HEADER + '-title';
    const CLASS_PANEL_CONTENT = CLASS_PANEL + '-content';
    const CLASS_PANEL_HORIZONTAL = CLASS_PANEL + '-horizontal';
    const CLASS_PANEL_SORTABLE_ICON = CLASS_PANEL + '-sortable-icon';
    const CLASS_PANEL_REMOVE = CLASS_PANEL + '-remove';

    // TODO: document panelType

    /**
     * @event
     * @name pcui.Panel#collapse
     * @description Fired when the panel gets collapsed
     */

    /**
     * @event
     * @name pcui.Panel#expand
     * @description Fired when the panel gets expanded
     */

    /**
     * @name pcui.Panel
     * @classdesc The Panel is a pcui.Container that itself contains a header container and a content container. The
     * respective pcui.Container functions work using the content container. One can also append elements to the header of the Panel.
     * @property {Boolean} flex Gets / sets whether the container supports flex layout. Defaults to false. Cannot co-exist with grid.
     * @property {Boolean} grid Gets / sets whether the container supports grid layout. Defaults to false. Cannot co-exist with flex.
     * @property {Boolean} collapsible Gets / sets whether the panel can be collapsed by clicking on its header or by setting collapsed to true. Defaults to false.
     * @property {Boolean} sortable Gets / sets whether the panel can be reordered
     * @property {Boolean} collapsed Gets / sets whether the panel is collapsed or expanded. Defaults to false.
     * @property {Boolean} collapseHorizontally Gets / sets whether the panel collapses horizontally - this would be the case for side panels. Defaults to false.
     * @property {Boolean} removable Gets / sets whether the panel can be removed
     * @property {Number} headerSize The height of the header in pixels. Defaults to 32.
     * @property {String} headerText The header text of the panel. Defaults to the empty string.
     * @property {pcui.Container} header Gets the header conttainer.
     * @property {pcui.Container} content Gets the content conttainer.
     * @extends pcui.Container
     * @mixes pcui.IContainer
     * @mixes pcui.IFlex
     * @mixes pcui.IGrid
     * @mixes pcui.IScrollable
     * @mixes pcui.IResizable
     */
    class Panel extends pcui.Container {
        /**
         * Creates a new Panel.
         * @param {Object} args The arguments. Extends the pcui.Container constructor arguments. All settable properties can also be set through the constructor.
         */
        constructor(args) {
            if (!args) args = {};

            const panelArgs = Object.assign({}, args);
            panelArgs.flex = true;
            delete panelArgs.grid;
            delete panelArgs.flexDirection;
            delete panelArgs.scrollable;

            super(panelArgs);

            this.class.add(CLASS_PANEL);

            if (args.panelType) {
                this.class.add(CLASS_PANEL + '-' + args.panelType);
            }

            // do not call reflow on every update while
            // we are initializing
            this._suspendReflow = true;

            // initialize header container
            this._initializeHeader(args);

            // initialize content container
            this._initializeContent(args);

            // header size
            this.headerSize = args.headerSize !== undefined ? args.headerSize : 32;

            this._domEvtDragStart = this._onDragStart.bind(this);
            this._domEvtDragMove = this._onDragMove.bind(this);
            this._domEvtDragEnd = this._onDragEnd.bind(this);

            // collapse related
            this._reflowTimeout = null;
            this._widthBeforeCollapse = null;
            this._heightBeforeCollapse = null;

            this.collapsible = args.collapsible || false;
            this.collapsed = args.collapsed || false;
            this.collapseHorizontally = args.collapseHorizontally || false;

            this._iconSort = null;
            this.sortable = args.sortable || false;

            this._btnRemove = null;
            this.removable = args.removable || false;

            // set the contents container to be the content DOM element
            // from now on calling append functions on the panel will append themn
            // elements to the contents container
            this.domContent = this._containerContent.dom;

            // execute reflow now after all fields have been initialized
            this._suspendReflow = false;
            this._reflow();
        }

        _initializeHeader(args) {
            // header container
            this._containerHeader = new pcui.Container({
                flex: true,
                flexDirection: 'row',
                class: CLASS_PANEL_HEADER
            });

            // header title
            this._labelTitle = new pcui.Label({
                text: args.headerText,
                class: CLASS_PANEL_HEADER_TITLE
            });
            this._containerHeader.append(this._labelTitle);

            // use native click listener because the pcui.Element#click event is only fired
            // if the element is enabled. However we still want to catch header click events in order
            // to collapse them
            this._containerHeader.dom.addEventListener('click', this._onHeaderClick.bind(this));

            this.append(this._containerHeader);
        }

        _onHeaderClick(evt) {
            if (!this._collapsible) return;
            if (evt.target !== this.header.dom && evt.target !== this._labelTitle.dom) return;

            // toggle collapsed
            this.collapsed = !this.collapsed;
        }

        _onClickRemove(evt) {
            evt.preventDefault();
            evt.stopPropagation();

            this.emit('click:remove');
        }

        _initializeContent(args) {
            // containers container
            this._containerContent = new pcui.Container({
                class: CLASS_PANEL_CONTENT,
                grid: args.grid,
                flex: args.flex,
                flexDirection: args.flexDirection,
                scrollable: args.scrollable
            });

            this.append(this._containerContent);
        }

        // Collapses or expands the panel as needed
        _reflow() {
            if (this._suspendReflow) {
                return;
            }

            if (this._reflowTimeout) {
                cancelAnimationFrame(this._reflowTimeout);
                this._reflowTimeout = null;
            }

            if (this.hidden || !this.collapsible) return;

            if (this.collapsed && this.collapseHorizontally) {
                this._containerHeader.style.top = -this.headerSize + 'px';
            } else {
                this._containerHeader.style.top = '';
            }

            // we rely on the content width / height and we have to
            // wait for 1 frame before we can get the final values back
            this._reflowTimeout = requestAnimationFrame(() => {
                this._reflowTimeout = null;

                if (this.collapsed) {
                    // remember size before collapse
                    if (!this._widthBeforeCollapse) {
                        this._widthBeforeCollapse = this.style.width;
                    }
                    if (!this._heightBeforeCollapse) {
                        this._heightBeforeCollapse = this.style.height;
                    }

                    if (this._collapseHorizontally) {
                        this.height = '';
                        this.width = this.headerSize;
                    } else {
                        this.height = this.headerSize;
                    }

                    // add collapsed class after getting the width and height
                    // because if we add it before then because of overflow:hidden
                    // we might get innacurate width/heights.
                    this.class.add(pcui.CLASS_COLLAPSED);
                } else {
                    // remove collapsed class first and the restore width and height
                    // (opposite order of collapsing)
                    this.class.remove(pcui.CLASS_COLLAPSED);

                    if (this._collapseHorizontally) {
                        this.height = '';
                        if (this._widthBeforeCollapse !== null) {
                            this.width = this._widthBeforeCollapse;
                        }
                    } else {
                        if (this._heightBeforeCollapse !== null) {
                            this.height = this._heightBeforeCollapse;
                        }
                    }

                    // reset before collapse vars
                    this._widthBeforeCollapse = null;
                    this._heightBeforeCollapse = null;
                }
            });
        }

        _onDragStart(evt) {
            if (this.disabled || this.readOnly) return;

            evt.stopPropagation();
            evt.preventDefault();

            window.addEventListener('mouseup', this._domEvtDragEnd);
            window.addEventListener('mouseleave', this._domEvtDragEnd);
            window.addEventListener('mousemove', this._domEvtDragMove);

            this.emit('dragstart');
            if (this.parent && this.parent._onChildDragStart) {
                this.parent._onChildDragStart(evt, this);
            }
        }

        _onDragMove(evt) {
            this.emit('dragmove');
            if (this.parent && this.parent._onChildDragStart) {
                this.parent._onChildDragMove(evt, this);
            }
        }

        _onDragEnd(evt) {
            window.removeEventListener('mouseup', this._domEvtDragEnd);
            window.removeEventListener('mouseleave', this._domEvtDragEnd);
            window.removeEventListener('mousemove', this._domEvtDragMove);

            if (this._draggedChild === this) {
                this._draggedChild = null;
            }

            this.emit('dragend');
            if (this.parent && this.parent._onChildDragStart) {
                this.parent._onChildDragEnd(evt, this);
            }
        }



        destroy() {
            if (this._destroyed) return;
            if (this._reflowTimeout) {
                cancelAnimationFrame(this._reflowTimeout);
                this._reflowTimeout = null;
            }

            window.removeEventListener('mouseup', this._domEvtDragEnd);
            window.removeEventListener('mouseleave', this._domEvtDragEnd);
            window.removeEventListener('mousemove', this._domEvtDragMove);

            super.destroy();
        }

        get collapsible() {
            return this._collapsible;
        }

        set collapsible(value) {
            if (value === this._collapsible) return;

            this._collapsible = value;

            if (value) {
                this.class.add(pcui.CLASS_COLLAPSIBLE);
            } else {
                this.class.remove(pcui.CLASS_COLLAPSIBLE);
            }

            this._reflow();

            if (this.collapsed) {
                this.emit(value ? 'collapse' : 'expand');
            }

        }

        get collapsed() {
            return this._collapsed;
        }

        set collapsed(value) {
            if (this._collapsed === value) return;

            this._collapsed = value;

            this._reflow();

            if (this.collapsible) {
                this.emit(value ? 'collapse' : 'expand');
            }
        }

        get sortable() {
            return this._sortable;
        }

        set sortable(value) {
            if (this._sortable === value) return;

            this._sortable = value;

            if (value) {
                this._iconSort = new pcui.Label({
                    class: CLASS_PANEL_SORTABLE_ICON
                });

                this._iconSort.dom.addEventListener('mousedown', this._domEvtDragStart);

                this.header.prepend(this._iconSort);
            } else if (this._iconSort) {
                this._iconSort.destroy();
                this._iconSort = null;
            }
        }

        get removable() {
            return !!this._btnRemove;
        }

        set removable(value) {
            if (this.removable === value) return;

            if (value) {
                this._btnRemove = new pcui.Button({
                    icon: 'E289',
                    class: CLASS_PANEL_REMOVE
                });
                this._btnRemove.on('click', this._onClickRemove.bind(this));
                this.header.append(this._btnRemove);
            } else {
                this._btnRemove.destroy();
                this._btnRemove = null;
            }
        }

        get collapseHorizontally() {
            return this._collapseHorizontally;
        }

        set collapseHorizontally(value) {
            if (this._collapseHorizontally === value) return;

            this._collapseHorizontally = value;
            if (value) {
                this.class.add(CLASS_PANEL_HORIZONTAL);
            } else {
                this.class.remove(CLASS_PANEL_HORIZONTAL);
            }

            this._reflow();
        }

        get content() {
            return this._containerContent;
        }

        get header() {
            return this._containerHeader;
        }

        get headerText() {
            return this._labelTitle.text;
        }

        set headerText(value) {
            this._labelTitle.text = value;
        }

        get headerSize() {
            return this._headerSize;
        }

        set headerSize(value) {
            this._headerSize = value;
            const style = this._containerHeader.dom.style;
            style.height = Math.max(0, value) + 'px';
            style.lineHeight = style.height;
            this._reflow();
        }
    }

    utils.implements(Panel, pcui.ICollapsible);

    pcui.Element.register('panel', Panel);

    return {
        Panel: Panel
    };
})());


/* pcui/element/element-overlay.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_OVERLAY = 'pcui-overlay';
    const CLASS_OVERLAY_INNER = CLASS_OVERLAY + '-inner';
    const CLASS_OVERLAY_CLICKABLE = CLASS_OVERLAY + '-clickable';
    const CLASS_OVERLAY_TRANSPARENT = CLASS_OVERLAY + '-transparent';
    const CLASS_OVERLAY_CONTENT = CLASS_OVERLAY + '-content';

    /**
     * @name pcui.Overlay
     * @classdesc An overlay element.
     * @property {Boolean} clickable Whether the overlay can be hidden by clicking on it.
     * @property {Boolean} transparent Whether the overlay is transparent.
     * @extends pcui.Container
     */
    class Overlay extends pcui.Container {
        /**
         * Creates a new pcui.Overlay.
         * @param {Object} args The arguments.
         */
        constructor(args) {
            if (!args) args = {};
            super(args);

            this.class.add(CLASS_OVERLAY);

            this._domClickableOverlay = document.createElement('div');
            this._domClickableOverlay.ui = this;
            this._domClickableOverlay.classList = CLASS_OVERLAY_INNER;
            this.dom.appendChild(this._domClickableOverlay);

            this._domEventMouseDown = this._onMouseDown.bind(this);
            this._domClickableOverlay.addEventListener('mousedown', this._domEventMouseDown);

            this.domContent = document.createElement('div');
            this.domContent.ui = this;
            this.domContent.classList.add(CLASS_OVERLAY_CONTENT);
            this.dom.appendChild(this.domContent);

            this.clickable = args.clickable || false;
            this.transparent = args.transparent || false;
        }

        _onMouseDown(evt) {
            if (!this.clickable) return;

            // some field might be in focus
            document.body.blur();

            // wait till blur is done
            requestAnimationFrame(() => {
                this.hidden = true;
            });

            evt.preventDefault();
        }

        /**
         * @name pcui.Overlay#position
         * @description Position the overlay at specific x, y coordinates.
         * @param {Number} x The x coordinate
         * @param {Number} y The y coordinate
         */
        position(x, y) {
            const area = this._domClickableOverlay.getBoundingClientRect();
            const rect = this.domContent.getBoundingClientRect();

            x = Math.max(0, Math.min(area.width - rect.width, x));
            y = Math.max(0, Math.min(area.height - rect.height, y));

            this.domContent.style.position = 'absolute';
            this.domContent.style.left = `${x}px`;
            this.domContent.style.top = `${y}px`;
        }

        destroy() {
            if (this._destroyed) return;
            this._domClickableOverlay.removeEventListener('mousedown', this._domEventMouseDown);
            super.destroy();
        }

        get clickable() {
            return this.class.contains(CLASS_OVERLAY_CLICKABLE);
        }

        set clickable(value) {
            if (value) {
                this.class.add(CLASS_OVERLAY_CLICKABLE);
            } else {
                this.class.remove(CLASS_OVERLAY_CLICKABLE);
            }
        }

        get transparent() {
            return this.class.contains(CLASS_OVERLAY_TRANSPARENT);
        }

        set transparent(value) {
            if (value) {
                this.class.add(CLASS_OVERLAY_TRANSPARENT);
            } else {
                this.class.remove(CLASS_OVERLAY_TRANSPARENT);
            }
        }
    }

    return {
        Overlay: Overlay
    };
})());


/* pcui/element/element-label.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_LABEL = 'pcui-label';

    /**
     * @name pcui.Label
     * @classdesc The Label is a simple span element that displays some text.
     * @property {String} placeholder Gets / sets the placeholder label that appears on the right of the label.
     * @property {String} text Gets / sets the text of the Label.
     * @property {Boolean} renderChanges If true then the Label will flash when its text changes.
     * @extends pcui.Element
     * @mixes pcui.IBindable
     */
    class Label extends pcui.Element {
        /**
         * Creates a new Label.
         * @param {Object} args The arguments. Extends the pcui.Element constructor arguments. All settable properties can also be set through the constructor.
         * @param {Boolean} [args.unsafe] If true then the innerHTML property will be used to set the text. Otherwise textContent will be used instead.
         * @param {Boolean} [args.nativeTooltip] If true then use the text of the label as the native HTML tooltip.
         */
        constructor(args) {
            if (!args) args = {};

            super(document.createElement('span'), args);

            this.class.add(CLASS_LABEL);

            this._unsafe = args.unsafe || false;
            this.text = args.text || args.value || '';

            if (args.nativeTooltip) {
                this.dom.title = this.text;
            }
            this.placeholder = args.placeholder || null;

            this.renderChanges = args.renderChanges || false;

            this.on('change', () => {
                if (this.renderChanges) {
                    this.flash();
                }
            });
        }

        _updateText(value) {
            this.class.remove(pcui.CLASS_MULTIPLE_VALUES);

            if (this._text === value) return false;

            this._text = value;

            if (this._unsafe) {
                this._dom.innerHTML = value;
            } else {
                this._dom.textContent = value;
            }

            this.emit('change', value);

            return true;
        }

        get text() {
            return this._text;
        }

        set text(value) {
            if (value === undefined || value === null) {
                value = '';
            }

            const changed = this._updateText(value);

            if (changed && this._binding) {
                this._binding.setValue(value);
            }
        }

        get value() {
            return this.text;
        }

        set value(value) {
            this.text = value;
        }

        set values(values) {
            let different = false;
            const value = values[0];
            for (let i = 1; i < values.length; i++) {
                if (values[i] !== value) {
                    different = true;
                    break;
                }
            }

            if (different) {
                this._updateText('');
                this.class.add(pcui.CLASS_MULTIPLE_VALUES);
            } else {
                this._updateText(values[0]);
            }
        }

        get placeholder() {
            return this.dom.getAttribute('placeholder');
        }

        set placeholder(value) {
            if (value) {
                this.dom.setAttribute('placeholder', value);
            } else {
                this.dom.removeAttribute('placeholder');
            }
        }
    }

    utils.implements(Label, pcui.IBindable);

    pcui.Element.register('label', Label);

    return {
        Label: Label
    };
})());


/* pcui/element/element-text-input.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_TEXT_INPUT = 'pcui-text-input';

    /**
     * @name pcui.TextInput
     * @classdesc The TextInput is an input element of type text.
     * @extends pcui.Element
     * @mixes pcui.IBindable
     * @mixes pcui.IFocusable
     * @property {String} placeholder Gets / sets the placeholder label that appears on the right of the input.
     * @property {HTMLElement} input Gets the HTML input element.
     * @property {Boolean} renderChanges If true then the TextInput will flash when its text changes.
     * @property {Boolean} blurOnEnter Gets / sets whether pressing Enter will blur (unfocus) the field. Defaults to true.
     * @property {Boolean} blurOnEscape Gets / sets whether pressing Escape will blur (unfocus) the field. Defaults to true.
     * @property {Boolean} keyChange Gets / sets whether any key up event will cause a change event to be fired.} args
     * @property {Function} onValidate A function that validates the value that is entered into the input and returns true if it is valid or false otherwise.
     * If false then the input will be set in an error state and the value will not propagate to the binding.
     */
    class TextInput extends pcui.Element {
        /**
         * Creates a new TextInput.
         * @param {Object} args The arguments. Extends the pcui.Element constructor arguments. All settable properties can also be set through the constructor.
         */
        constructor(args) {
            if (!args) args = {};
            super(document.createElement('div'), args);

            this.class.add(CLASS_TEXT_INPUT);

            let input = args.input;
            if (!input) {
                input = document.createElement('input');
                input.ui = this;
                input.type = 'text';
                input.tabIndex = 0;
            }
            this._domInput = input;

            this._domEvtChange = this._onInputChange.bind(this);
            this._domEvtFocus = this._onInputFocus.bind(this);
            this._domEvtBlur = this._onInputBlur.bind(this);
            this._domEvtKeyDown = this._onInputKeyDown.bind(this);
            this._domEvtKeyUp = this._onInputKeyUp.bind(this);
            this._domEvtCtxMenu = this._onInputCtxMenu.bind(this);

            this._domInput.addEventListener('change', this._domEvtChange);
            this._domInput.addEventListener('focus', this._domEvtFocus);
            this._domInput.addEventListener('blur', this._domEvtBlur);
            this._domInput.addEventListener('keydown', this._domEvtKeyDown);
            this._domInput.addEventListener('contextmenu', this._domEvtCtxMenu, false);
            this.dom.appendChild(this._domInput);

            this._suspendInputChangeEvt = false;

            if (args.value !== undefined) {
                this.value = args.value;
            }
            this.placeholder = args.placeholder || null;
            this.renderChanges = args.renderChanges || false;
            this.blurOnEnter = (args.blurOnEnter !== undefined ? args.blurOnEnter : true);
            this.blurOnEscape = (args.blurOnEscape !== undefined ? args.blurOnEscape : true);
            this.keyChange = args.keyChange || false;

            if (args.onValidate) {
                this.onValidate = args.onValidate;
            }

            this.on('change', () => {
                if (this.renderChanges) {
                    this.flash();
                }
            });

            this.on('disable', this._updateInputReadOnly.bind(this));
            this.on('enable', this._updateInputReadOnly.bind(this));
            this.on('readOnly', this._updateInputReadOnly.bind(this));
            this._updateInputReadOnly();
        }

        _onInputChange(evt) {
            if (this._suspendInputChangeEvt) return;

            if (this._onValidate) {
                const error = !this._onValidate(this.value);
                this.error = error;
                if (error) {
                    return;
                }
            } else {
                this.error = false;
            }

            this.emit('change', this.value);

            if (this._binding) {
                this._binding.setValue(this.value);
            }
        }

        _onInputFocus(evt) {
            this.class.add(pcui.CLASS_FOCUS);
            this.emit('focus', evt);
        }

        _onInputBlur(evt) {
            this.class.remove(pcui.CLASS_FOCUS);
            this.emit('blur', evt);
        }

        _onInputKeyDown(evt) {
            if ((evt.keyCode === 27 && this.blurOnEscape) || (evt.keyCode === 13 && this.blurOnEnter)) {
                this._domInput.blur();
            }

            this.emit('keydown', evt);
        }

        _onInputKeyUp(evt) {
            this._onInputChange(evt);

            this.emit('keyup', evt);
        }

        _onInputCtxMenu(evt) {
            this._domInput.select();
        }

        _updateInputReadOnly() {
            const readOnly = !this.enabled || this.readOnly;
            if (readOnly) {
                this._domInput.setAttribute('readonly', true);
            } else {
                this._domInput.removeAttribute('readonly');
            }
        }

        _updateValue(value) {
            this.class.remove(pcui.CLASS_MULTIPLE_VALUES);

            if (value === this.value) return false;

            this._suspendInputChangeEvt = true;
            this._domInput.value = (value === null || value === undefined) ? '' : value;
            this._suspendInputChangeEvt = false;

            this.emit('change', value);

            return true;
        }

        /**
         * @name pcui.TextInput#focus
         * @description Focuses the Element.
         * @param {Boolean} select If true then this will also select the text after focusing.
         */
        focus(select) {
            this._domInput.focus();
            if (select) {
                this._domInput.select();
            }
        }

        /**
         * @name pcui.TextInput#blur
         * @description Blurs (unfocuses) the Element.
         */
        blur() {
            this._domInput.blur();
        }

        destroy() {
            if (this._destroyed) return;
            this._domInput.removeEventListener('change', this._domEvtChange);
            this._domInput.removeEventListener('focus', this._domEvtFocus);
            this._domInput.removeEventListener('blur', this._domEvtBlur);
            this._domInput.removeEventListener('keydown', this._domEvtKeyDown);
            this._domInput.removeEventListener('keyup', this._domEvtKeyUp);
            this._domInput.removeEventListener('contextmenu', this._domEvtCtxMenu);
            this._domInput = null;

            super.destroy();
        }

        get value() {
            return this._domInput.value;
        }

        set value(value) {
            const changed = this._updateValue(value);

            if (changed) {
                // reset error
                this.error = false;
            }

            if (changed && this._binding) {
                this._binding.setValue(value);
            }
        }

        set values(values) {
            let different = false;
            const value = values[0];
            for (let i = 1; i < values.length; i++) {
                if (values[i] !== value) {
                    different = true;
                    break;
                }
            }

            if (different) {
                this._updateValue(null);
                this.class.add(pcui.CLASS_MULTIPLE_VALUES);
            } else {
                this._updateValue(values[0]);
            }
        }

        get placeholder() {
            return this.dom.getAttribute('placeholder');
        }

        set placeholder(value) {
            if (value) {
                this.dom.setAttribute('placeholder', value);
            } else {
                this.dom.removeAttribute('placeholder');
            }
        }

        get keyChange() {
            return this._keyChange;
        }

        set keyChange(value) {
            if (this._keyChange === value) return;

            this._keyChange = value;
            if (value) {
                this._domInput.addEventListener('keyup', this._domEvtKeyUp);
            } else {
                this._domInput.removeEventListener('keyup', this._domEvtKeyUp);
            }
        }

        get input() {
            return this._domInput;
        }

        get onValidate() {
            return this._onValidate;
        }

        set onValidate(value) {
            this._onValidate = value;
        }
    }

    utils.implements(TextInput, pcui.IBindable);
    utils.implements(TextInput, pcui.IFocusable);

    pcui.Element.register('string', TextInput, { renderChanges: true });

    return {
        TextInput: TextInput
    };
})());


/* pcui/element/element-text-area-input.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_TEXT_AREA_INPUT = 'pcui-text-area-input';

    /**
     * @name pcui.TextInput
     * @classdesc The TextAreaInput wraps a textarea element. It has the same interface as pcui.TextInput.
     * @extends pcui.TextInput
     */
    class TextAreaInput extends pcui.TextInput {
        /**
         * Creates a new TextAreaInput.
         * @param {Object} args The arguments. Extends the pcui.TextInput constructor arguments.
         */
        constructor(args) {
            args = Object.assign({
                input: document.createElement('textarea')
            }, args);

            super(args);

            this.class.add(CLASS_TEXT_AREA_INPUT);
        }

        _onInputKeyDown(evt) {
            if ((evt.keyCode === 27 && this.blurOnEscape) || (evt.keyCode === 13 && this.blurOnEnter && !evt.shiftKey)) {
                this._domInput.blur();
            }

            this.emit('keydown', evt);
        }
    }

    pcui.Element.register('text', TextAreaInput, { renderChanges: true });

    return {
        TextAreaInput: TextAreaInput
    };
})());


/* pcui/element/element-numeric-input.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_NUMERIC_INPUT = 'pcui-numeric-input';

    /**
     * @name pcui.NumericInput
     * @classdesc The NumericInput represents an input element that holds numbers.
     * @property {Number} min Gets / sets the minimum value this field can take.
     * @property {Number} max Gets / sets the maximum value this field can take.
     * @property {Number} precision Gets / sets the maximum number of decimals a value can take.
     * @property {Number} step Gets / sets the amount that the value will be increased or decreased when using the arrow keys. Holding Shift will use 10x the step.
     * @extends pcui.TextInput
     */
    class NumericInput extends pcui.TextInput {
        /**
         * Creates a new NumericInput.
         * @param {Object} args The arguments. Extends the pcui.TextInput constructor arguments.
         * @param {Boolean} [args.allowNull] Gets / sets whether the value can be null. If not then it will be 0 instead of null.
         */
        constructor(args) {
            // make copy of args
            args = Object.assign({}, args);
            const value = args.value;
            // delete value because we want to set it after
            // the other arguments
            delete args.value;
            const renderChanges = args.renderChanges || false;
            delete args.renderChanges;

            super(args);

            this.class.add(CLASS_NUMERIC_INPUT);

            this._min = args.min !== undefined ? args.min : null;
            this._max = args.max !== undefined ? args.max : null;
            this._allowNull = args.allowNull || false;
            this._precision = args.precision !== undefined ? args.precision : null;

            if (args.step !== undefined) {
                this._step = args.step;
            } else {
                if (this._precision !== null) {
                    this._step = 1 / Math.pow(10, this._precision);
                } else {
                    this._step  = 1;
                }
            }

            this._oldValue = undefined;
            this.value = value;

            this.renderChanges = renderChanges;
        }

        _onInputChange(evt) {
            // get the content of the input and pass it
            // through our value setter
            this.value = this._domInput.value;
        }

        _onInputKeyDown(evt) {
            if (!this.enabled || this.readOnly) return super._onInputKeyDown(evt);

            // increase / decrease value with arrow keys
            if (evt.keyCode === 38 || evt.keyCode === 40) {
                const inc = (evt.shiftKey ? 10 : 1) * (evt.keyCode === 40 ? -1 : 1);
                this.value = this.value + this.step * inc;
                return;
            }

            super._onInputKeyDown(evt);
        }

        _normalizeValue(value) {
            if (value === undefined) {
                value = null;
            }

            value = parseFloat(value, 10);
            if (!isNaN(value)) {
                // clamp between min max
                if (this.min !== null && value < this.min) {
                    value = this.min;
                }
                if (this.max !== null && value > this.max) {
                    value = this.max;
                }

                // fix precision
                if (this.precision !== null) {
                    value = parseFloat(value.toFixed(this.precision), 10);
                }
            } else if (this._allowNull) {
                value = null;
            } else {
                value = 0;
            }

            return value;
        }

        _updateValue(value, force) {
            const different = (value !== this._oldValue || force);

            // always set the value to the input because
            // we always want it to show an actual number or nothing
            this._oldValue = value;
            this._domInput.value = value;

            this.class.remove(pcui.CLASS_MULTIPLE_VALUES);

            if (different) {
                this.emit('change', value);
            }

            return different;
        }

        get value() {
            const val = super.value;
            return val !== '' ? parseFloat(val, 10) : null;
        }

        set value(value) {
            value = this._normalizeValue(value);

            const forceUpdate = this.class.contains(pcui.CLASS_MULTIPLE_VALUES) && value === null && this._allowNull;
            const changed = this._updateValue(value, forceUpdate);

            if (changed && this._binding) {
                this._binding.setValue(value);
            }
        }

        set values(values) {
            let different = false;
            const value = this._normalizeValue(values[0]);
            for (let i = 1; i < values.length; i++) {
                if (value !== this._normalizeValue(values[i])) {
                    different = true;
                    break;
                }
            }

            if (different) {
                this._updateValue(null);
                this.class.add(pcui.CLASS_MULTIPLE_VALUES);
            } else {
                this._updateValue(values[0]);
            }
        }

        get min() {
            return this._min;
        }

        set min(value) {
            if (this._min === value) return;
            this._min = value;

            // reset value
            if (this._min !== null) {
                this.value = this.value;
            }
        }

        get max() {
            return this._max;
        }

        set max(value) {
            if (this._max === value) return;
            this._max = value;

            // reset value
            if (this._max !== null) {
                this.value = this.value;
            }
        }

        get precision() {
            return this._precision;
        }

        set precision(value) {
            if (this._precision === value) return;
            this._precision = value;

            // reset value
            if (this._precision !== null) {
                this.value = this.value;
            }
        }

        get step() {
            return this._step;
        }

        set step(value) {
            this._step = value;
        }
    }

    pcui.Element.register('number', NumericInput, { renderChanges: true });

    return {
        NumericInput: NumericInput
    };
})());


/* pcui/element/element-slider-input.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_SLIDER = 'pcui-slider';
    const CLASS_SLIDER_CONTAINER = CLASS_SLIDER + '-container';
    const CLASS_SLIDER_BAR = CLASS_SLIDER + '-bar';
    const CLASS_SLIDER_HANDLE = CLASS_SLIDER + '-handle';
    const CLASS_SLIDER_ACTIVE = CLASS_SLIDER + '-active';

    // fields that are proxied between the slider and the numeric input
    const PROXY_FIELDS = [
        'allowNull',
        'max',
        'min',
        'keyChange',
        'placeholder',
        'precision',
        'renderChanges',
        'step'
    ];

    /**
     * @name pcui.SliderInput
     * @classdesc The SliderInput shows a pcui.NumericInput and a slider widget next to it. It acts as a proxy
     * of the NumericInput.
     * @property {Number} min Gets / sets the minimum value that the numeric input field can take.
     * @property {Number} max Gets / sets the maximum value that the numeric input field can take.
     * @property {Number} sliderMin Gets / sets the minimum value that the slider field can take.
     * @property {Number} sliderMax Gets / sets the maximum value that the slider field can take.
     * @property {Number} pre Gets / sets the maximum number of decimals a value can take.
     * @property {Number} step Gets / sets the amount that the value will be increased or decreased when using the arrow keys. Holding Shift will use 10x the step.
     * @property {Boolean} allowNull Gets / sets whether the value can be null. If not then it will be 0 instead of null.
     * @extends pcui.Element
     * @mixes pcui.IBindable
     * @mixes pcui.IFocusable
     */
    class SliderInput extends pcui.Element {
        /**
         * Creates a new SliderInput.
         * @param {Object} args The arguments. Extends the pcui.NumericInput constructor arguments.
         */
        constructor(args) {
            args = Object.assign({}, args);

            const inputArgs = {};
            PROXY_FIELDS.forEach(field => {
                inputArgs[field] = args[field];
            });

            if (inputArgs.precision === undefined) {
                inputArgs.precision = 2;
            }

            // binding should only go to the slider
            // and the slider will propagate changes to the numeric input
            delete inputArgs.binding;

            super(document.createElement('div'), args);

            this.class.add(CLASS_SLIDER);

            this._combineHistory = false;

            this._numericInput = new pcui.NumericInput(inputArgs);

            // propagate change event
            this._numericInput.on('change', this._onValueChange.bind(this));
            // propagate focus / blur events
            this._numericInput.on('focus', () => {
                this.emit('focus');
            });

            this._numericInput.on('blur', () => {
                this.emit('blur');
            });

            this._sliderMin = (args.sliderMin !== undefined ? args.sliderMin : this.min || 0);
            this._sliderMax = (args.sliderMax !== undefined ? args.sliderMax : this.max || 1);

            this.dom.appendChild(this._numericInput.dom);
            this._numericInput.parent = this;

            this._domSlider = document.createElement('div');
            this._domSlider.classList.add(CLASS_SLIDER_CONTAINER);
            this.dom.appendChild(this._domSlider);

            this._domBar = document.createElement('div');
            this._domBar.classList.add(CLASS_SLIDER_BAR);
            this._domBar.ui = this;
            this._domSlider.appendChild(this._domBar);

            this._domHandle = document.createElement('div');
            this._domHandle.ui = this;
            this._domHandle.tabIndex = 0;
            this._domHandle.classList.add(CLASS_SLIDER_HANDLE);
            this._domBar.appendChild(this._domHandle);

            this._domMouseDown = this._onMouseDown.bind(this);
            this._domMouseMove = this._onMouseMove.bind(this);
            this._domMouseUp = this._onMouseUp.bind(this);
            this._domTouchStart = this._onTouchStart.bind(this);
            this._domTouchMove = this._onTouchMove.bind(this);
            this._domTouchEnd = this._onTouchEnd.bind(this);
            this._domKeyDown = this._onKeyDown.bind(this);

            this._touchId = null;

            this._domBar.addEventListener('mousedown', this._domMouseDown);
            this._domBar.addEventListener('touchstart', this._domTouchStart);
            this._domHandle.addEventListener('keydown', this._domKeyDown);
        }

        _onMouseDown(evt) {
            if (evt.button !== 0 || !this.enabled || this.readOnly) return;
            this._onSlideStart(evt.pageX);
        }

        _onMouseMove(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            this._onSlideMove(evt.pageX);
        }

        _onMouseUp(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            this._onSlideEnd(evt.pageX);
        }

        _onTouchStart(evt) {
            if (!this.enabled || this.readOnly) return;

            for (let i = 0; i < evt.changedTouches.length; i++) {
                const touch = evt.changedTouches[i];
                if (! touch.target.ui || touch.target.ui !== this)
                    continue;

                this._touchId = touch.identifier;
                this._onSlideStart(touch.pageX);
                break;
            }
        }

        _onTouchMove(evt) {
            for (let i = 0; i < evt.changedTouches.length; i++) {
                const touch = evt.changedTouches[i];

                if (touch.identifier !== this._touchId)
                    continue;

                evt.stopPropagation();
                evt.preventDefault();

                this._onSlideMove(touch.pageX);
                break;
            }
        }

        _onTouchEnd(evt) {
            for (let i = 0; i < evt.changedTouches.length; i++) {
                const touch = evt.changedTouches[i];

                if (touch.identifier !== this._touchId)
                    continue;

                evt.stopPropagation();
                evt.preventDefault();

                this._onSlideEnd(touch.pageX);
                this._touchId = null;
                break;
            }
        }

        _onKeyDown(evt) {
            if (evt.keyCode === 27) {
                this.blur();
                return;
            }

            if (!this.enabled || this.readOnly) return;

            // move slider with left / right arrow keys
            if (evt.keyCode !== 37 && evt.keyCode !== 39) return;

            evt.stopPropagation();
            evt.preventDefault();
            let x = evt.keyCode === 37 ? -1 : 1;
            if (evt.shiftKey) {
                x *= 10;
            }

            this.value += x * this.step;
        }

        _updateHandle(value) {
            const left = Math.max(0, Math.min(1, ((value || 0) - this._sliderMin) / (this._sliderMax - this._sliderMin))) * 100;
            this._domHandle.style.left = left + '%';
        }

        _onValueChange(value) {
            this._updateHandle(value);
            this.emit('change', value);

            if (this._binding) {
                this._binding.setValue(value);
            }
        }

        _onSlideStart(pageX) {
            this._domHandle.focus();
            if (this._touchId === null) {
                window.addEventListener('mousemove', this._domMouseMove);
                window.addEventListener('mouseup', this._domMouseUp);
            } else {
                window.addEventListener('touchmove', this._domTouchMove);
                window.addEventListener('touchend', this._domTouchEnd);
            }

            this.class.add(CLASS_SLIDER_ACTIVE);

            this._onSlideMove(pageX);

            if (this.binding) {
                this._combineHistory = this.binding.historyCombine;
                this.binding.historyCombine = true;
            }
        }

        _onSlideMove(pageX) {
            const rect = this._domSlider.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (pageX - rect.left) / rect.width));

            const range = this._sliderMax - this._sliderMin;
            let value = (x * range) + this._sliderMin;
            value = parseFloat(value.toFixed(this.precision), 10);

            this.value = value;
        }

        _onSlideEnd(pageX) {
            this._onSlideMove(pageX);

            this.class.remove(CLASS_SLIDER_ACTIVE);

            if (this._touchId === null) {
                window.removeEventListener('mousemove', this._domMouseMove);
                window.removeEventListener('mouseup', this._domMouseUp);
            } else {
                window.removeEventListener('touchmove', this._domTouchMove);
                window.removeEventListener('touchend', this._domTouchEnd);
            }

            if (this.binding) {
                this.binding.historyCombine = this._combineHistory;
            }

        }

        focus() {
            this._numericInput.focus();
        }

        blur() {
            this._domHandle.blur();
            this._numericInput.blur();
        }

        destroy() {
            if (this._destroyed) return;
            this._domBar.removeEventListener('mousedown', this._domMouseDown);
            this._domBar.removeEventListener('touchstart', this._domTouchStart);

            this._domHandle.removeEventListener('keydown', this._domKeyDown);

            this.dom.removeEventListener('mouseup', this._domMouseUp);
            this.dom.removeEventListener('mousemove', this._domMouseMove);
            this.dom.removeEventListener('touchmove', this._domTouchMove);
            this.dom.removeEventListener('touchend', this._domTouchEnd);
            super.destroy();
        }

        get sliderMin() {
            return this._sliderMin;
        }

        set sliderMin(value) {
            if (this._sliderMin === value) return;

            this._sliderMin = value;
            this._updateHandle(this.value);
        }

        get sliderMax() {
            return this._sliderMax;
        }

        set sliderMax(value) {
            if (this._sliderMax === value) return;

            this._sliderMax = value;
            this._updateHandle(this.value);
        }

        get value() {
            return this._numericInput.value;
        }

        set value(value) {
            this._numericInput.value = value;
            if (this._numericInput.class.contains(pcui.CLASS_MULTIPLE_VALUES)) {
                this.class.add(pcui.CLASS_MULTIPLE_VALUES);
            } else {
                this.class.remove(pcui.CLASS_MULTIPLE_VALUES);
            }
        }

        set values(values) {
            this._numericInput.values = values;
            if (this._numericInput.class.contains(pcui.CLASS_MULTIPLE_VALUES)) {
                this.class.add(pcui.CLASS_MULTIPLE_VALUES);
            } else {
                this.class.remove(pcui.CLASS_MULTIPLE_VALUES);
            }
        }
    }

    utils.proxy(SliderInput, '_numericInput', PROXY_FIELDS);
    utils.implements(SliderInput, pcui.IBindable);
    utils.implements(SliderInput, pcui.IFocusable);

    pcui.Element.register('slider', SliderInput, { renderChanges: true });

    return {
        SliderInput: SliderInput
    };
})());


/* pcui/element/element-color-input.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_COLOR_INPUT = 'pcui-color-input';

    /**
     * @name pcui.ColorInput
     * @classdesc Represents a color input. Clicking on the color input will open a color picker.
     * @property {Number[]} value An array of 1 to 4 numbers that range from 0 to 1. The length of the array depends on the number of channels.
     * @property {Number} channels Can be 1 to 4.
     * @property {Boolean} renderChanges If true the input will flash when changed.
     * @mixes pcui.IBindable
     * @mixes pcui.IFocusable
     */
    class ColorInput extends pcui.Element {
        /**
         * Creates a new ColorInput.
         * @param {Object} args The arguments. Extends the pcui.Element arguments. Any settable property can also be set through the constructor.
         */
        constructor(args) {
            args = Object.assign({
                tabIndex: 0
            }, args);

            super(document.createElement('div'), args);

            this.class.add(CLASS_COLOR_INPUT);
            this.class.add(pcui.CLASS_NOT_FLEXIBLE);

            // this element shows the actual color. The
            // parent element shows the checkerboard pattern
            this._domColor = document.createElement('div');
            this.dom.appendChild(this._domColor);

            this._domEventKeyDown = this._onKeyDown.bind(this);
            this._domEventFocus = this._onFocus.bind(this);
            this._domEventBlur = this._onBlur.bind(this);

            this.dom.addEventListener('keydown', this._domEventKeyDown);
            this.dom.addEventListener('focus', this._domEventFocus);
            this.dom.addEventListener('blur', this._domEventBlur);

            this.on('click', () => {
                if (!this.enabled || this.readOnly) return;
                this._openColorPicker();
            });

            this._historyCombine = false;
            this._historyPostfix = null;

            this._value = args.value || [0, 0, 0, 1];
            this._channels = args.channels || 3;
            this._setValue(this._value);

            this._isColorPickerOpen = false;

            this.renderChanges = args.renderChanges || false;

            this.on('change', () => {
                if (this.renderChanges) {
                    this.flash();
                }
            });
        }

        focus() {
            this.dom.focus();
        }

        blur() {
            this.dom.blur();
        }

        _onKeyDown(evt) {
            // escape blurs the field
            if (evt.keyCode === 27) {
                this.blur();
            }

            // enter opens the color picker
            if (evt.keyCode !== 13 || !this.enabled || this.readOnly) {
                return;
            }

            evt.stopPropagation();
            evt.preventDefault();

            this._openColorPicker();
        }

        _onFocus(evt) {
            this.emit('focus');
        }

        _onBlur(evt) {
            this.emit('blur');
        }

        _openColorPicker() {
            // TODO - this needs to open the picker
            // without relying on the editor global methods
            this._isColorPickerOpen = true;

            // open color picker
            editor.call('picker:color', this.value.map(c => Math.floor(c * 255)));

            // picked color
            let evtColorPick = editor.on('picker:color', (color) => {
                this.value = color.map(c => c / 255);
            });

            let evtColorPickStart = editor.on('picker:color:start', () => {
                if (this.binding) {
                    this._historyCombine = this.binding.historyCombine;
                    this._historyPostfix = this.binding.historyPostfix;

                    this.binding.historyCombine = true;

                    // assign a history postfix which will limit how far back
                    // the history will be combined. We only want to combine
                    // history between this picker:color:start and picker:color:end events
                    // not further back
                    this._binding.historyPostfix = `(${Date.now()})`;

                } else {
                    this._historyCombine = false;
                    this._historyPostfix = null;
                }
            });

            let evtColorPickEnd = editor.on('picker:color:end', () => {
                if (this.binding) {
                    this.binding.historyCombine = this._historyCombine;
                    this.binding.historyPostfix = this._historyPostfix;
                }
            });

            // position picker
            const rectPicker = editor.call('picker:color:rect');
            const rectElement = this.dom.getBoundingClientRect();
            editor.call('picker:color:position', rectElement.left - rectPicker.width, rectElement.top);

            // color changed, update picker
            let evtColorToPicker = this.on('change', () => {
                editor.call('picker:color:set', this.value.map(c => Math.floor(c * 255)));
            });

            // picker closed
            editor.once('picker:color:close', () => {
                evtColorPick.unbind();
                evtColorPick = null;

                evtColorToPicker.unbind();
                evtColorToPicker = null;

                evtColorPickStart.unbind();
                evtColorPickStart = null;

                evtColorPickEnd.unbind();
                evtColorPickEnd = null;

                this._isColorPickerOpen = false;
                this.focus();
            });
        }

        _valueToColor(value) {
            value = Math.floor(value * 255);
            return Math.max(0, Math.min(value, 255));

        }

        _setValue(value) {
            const r = this._valueToColor(value[0]);
            const g = this._valueToColor(value[1]);
            const b = this._valueToColor(value[2]);
            const a = value[3];

            if (this._channels === 1) {
                this._domColor.style.backgroundColor = `rgb(${r}, ${r}, ${r})`;
            } else if (this._channels === 3) {
                this._domColor.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            } else if (this._channels === 4) {
                this._domColor.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
            }
        }

        _updateValue(value) {
            let dirty = false;
            for (let i = 0; i < value.length; i++) {
                if (this._value[i] !== value[i]) {
                    dirty = true;
                    this._value[i] = value[i];
                }
            }

            this.class.remove(pcui.CLASS_MULTIPLE_VALUES);

            if (dirty) {
                this._setValue(value);

                this.emit('change', value);
            }

            return dirty;
        }

        destroy() {
            if (this._destroyed) return;
            this.dom.removeEventListener('keydown', this._domEventKeyDown);
            this.dom.removeEventListener('focus', this._domEventFocus);
            this.dom.removeEventListener('blur', this._domEventBlur);
            super.destroy();
        }

        get value() {
            return this._value.slice(0, this._channels);
        }

        set value(value) {
            value = value || [0, 0, 0, 0];
            const changed = this._updateValue(value);

            if (changed && this._binding) {
                this._binding.setValue(value);
            }
        }

        set values(values) {
            let different = false;
            const value = values[0];
            for (let i = 1; i < values.length; i++) {
                if (Array.isArray(value)) {
                    if (!value.equals(values[i])) {
                        different = true;
                        break;
                    }
                } else {
                    if (value !== values[i]) {
                        different = true;
                        break;
                    }
                }
            }

            if (different) {
                this.value = null;
                this.class.add(pcui.CLASS_MULTIPLE_VALUES);
            } else {
                this.value = values[0];
            }
        }

        get channels() {
            return this._channels;
        }

        set channels(value) {
            if (this._channels === value) return;
            this._channels = Math.max(0, Math.min(value, 4));
            this._setValue(this.value);
        }
    }

    utils.implements(ColorInput, pcui.IBindable);
    utils.implements(ColorInput, pcui.IFocusable);

    pcui.Element.register('rgb', ColorInput, { channels: 3, renderChanges: true });
    pcui.Element.register('rgba', ColorInput, { channels: 4, renderChanges: true });

    return {
        ColorInput: ColorInput
    };
})());


/* pcui/element/element-gradient-input.js */
Object.assign(pcui, (function () {
    'use strict';

    const REGEX_KEYS = /keys/;
    const REGEX_TYPE = /type/;
    const CLASS_GRADIENT = 'pcui-gradient';

    function createCheckerboardPattern(context) {
        // create checkerboard pattern
        const canvas = document.createElement('canvas');
        const size = 24;
        const halfSize = size / 2;
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#';
        ctx.fillStyle = "#949a9c";
        ctx.fillRect(0, 0, halfSize, halfSize);
        ctx.fillRect(halfSize, halfSize, halfSize, halfSize);
        ctx.fillStyle = "#657375";
        ctx.fillRect(halfSize, 0, halfSize, halfSize);
        ctx.fillRect(0, halfSize, halfSize, halfSize);

        return context.createPattern(canvas, 'repeat');
    }

    /**
     * @name pcui.GradientInput
     * @classdesc Shows a color gradient.
     * @property {Boolean} renderChanges If true the input will flash when changed.
     * @extends pcui.Element
     */
    class GradientInput extends pcui.Element {
        /**
         * Creates a new pcui.GradientInput.
         * @param {Object} args The arguments.
         * @param {Number} [args.channels] The number of color channels. Between 1 and 4.
         */
        constructor(args) {
            args = Object.assign({
                tabIndex: 0
            }, args);

            super(document.createElement('div'), args);

            this.class.add(CLASS_GRADIENT);

            this._canvas = new pcui.Canvas({useDevicePixelRatio:true});
            this.dom.appendChild(this._canvas.dom);
            this._canvas.parent = this;
            this._canvas.on('resize', this._renderGradient.bind(this));

            this._checkerboardPattern = createCheckerboardPattern(this._canvas.dom.getContext('2d'));

            // make sure canvas is the same size as the container element
            // 20 times a second
            this._resizeInterval = setInterval(() => {
                this._canvas.resize(this.width, this.height);
            }, 1000 / 20);

            this._domEventKeyDown = this._onKeyDown.bind(this);
            this._domEventFocus = this._onFocus.bind(this);
            this._domEventBlur = this._onBlur.bind(this);

            this.dom.addEventListener('keydown', this._domEventKeyDown);
            this.dom.addEventListener('focus', this._domEventFocus);
            this.dom.addEventListener('blur', this._domEventBlur);

            this.on('click', () => {
                if (!this.enabled || this.readOnly || this.class.contains(pcui.CLASS_MULTIPLE_VALUES)) return;
                this._openGradientPicker();
            });

            this._channels = args.channels || 3;
            this._value = null;
            if (args.value) {
                this.value = args.value;
            }

            this.renderChanges = args.renderChanges || false;

            this.on('change', () => {
                if (this.renderChanges) {
                    this.flash();
                }
            });
        }

        _onKeyDown(evt) {
            // escape blurs the field
            if (evt.keyCode === 27) {
                this.blur();
            }

            // enter opens the gradient picker
            if (evt.keyCode !== 13 || !this.enabled || this.readOnly || this.class.contains(pcui.CLASS_MULTIPLE_VALUES)) {
                return;
            }

            evt.stopPropagation();
            evt.preventDefault();

            this._openGradientPicker();
        }

        _onFocus(evt) {
            this.emit('focus');
        }

        _onBlur(evt) {
            this.emit('blur');
        }

        _getDefaultValue() {
            return {
                type: 4,
                keys: (new Array(this._channels)).fill([0, 0]),
                betweenCurves: false
            };
        }

        _openGradientPicker() {
            // TODO: this would ideally not call global functions
            editor.call('picker:gradient', [this.value || this._getDefaultValue()]);

            // position picker
            const rectPicker = editor.call('picker:gradient:rect');
            const rectField = this.dom.getBoundingClientRect();
            editor.call('picker:gradient:position', rectField.right - rectPicker.width, rectField.bottom);

            // change event from the picker sets the new value
            let evtPickerChanged = editor.on('picker:curve:change', this._onPickerChange.bind(this));

            // refreshing the value resets the picker
            let evtRefreshPicker = this.on('change', (value) => {
                editor.call('picker:gradient:set', [value]);
            });

            // clean up when the picker is closed
            editor.once('picker:gradient:close', () => {
                evtRefreshPicker.unbind();
                evtRefreshPicker = null;
                evtPickerChanged.unbind();
                evtPickerChanged = null;
            });
        }

        _onPickerChange(paths, values) {
            const value = this.value || this._getDefaultValue();

            // TODO: this is all kinda hacky. We need to clear up
            // the events raised by the picker
            if (REGEX_KEYS.test(paths[0])) {
                // set new value with new keys but same type
                this.value = {
                    type: value.type,
                    keys: values,
                    betweenCurves: false
                };
            } else if (REGEX_TYPE.test(paths[0])) {
                // set new value with new type but same keys
                this.value = {
                    type: values[0],
                    keys: value.keys,
                    betweenCurves: false
                };
            }
        }

        _renderGradient() {
            const canvas = this._canvas.dom;
            const context = canvas.getContext('2d');

            const width = this._canvas.width;
            const height = this._canvas.height;
            const ratio = this._canvas.pixelRatio;

            context.setTransform(ratio, 0, 0, ratio, 0, 0);

            context.fillStyle = this._checkerboardPattern;
            context.fillRect(0, 0, width, height);

            if (!this.value || !this.value.keys || !this.value.keys.length) {
                return;
            }

            const rgba = [];

            const curve = this.channels === 1 ? new pc.CurveSet([this.value.keys]) : new pc.CurveSet(this.value.keys);
            curve.type = this.value.type;

            const precision = 2;

            const gradient = context.createLinearGradient(0, 0, width, 0);

            for (let t = precision; t < width; t += precision) {
                curve.value(t / width, rgba);

                const r = Math.round((rgba[0] || 0) * 255);
                const g = Math.round((rgba[1] || 0) * 255);
                const b = Math.round((rgba[2] || 0) * 255);
                const a = this.channels === 4 ? (rgba[3] || 0) : 1;

                gradient.addColorStop(t / width, `rgba(${r}, ${g}, ${b}, ${a})`);
            }

            context.fillStyle = gradient;
            context.fillRect(0, 0, width, height);
        }

        focus() {
            this.dom.focus();
        }

        blur() {
            this.dom.blur();
        }

        destroy() {
            if (this._destroyed) return;
            this.dom.removeEventListener('keydown', this._domEventKeyDown);
            this.dom.removeEventListener('focus', this._domEventFocus);
            this.dom.removeEventListener('blur', this._domEventBlur);

            clearInterval(this._resizeInterval);
            this._resizeInterval = null;

            super.destroy();
        }

        get channels() {
            return this._channels;
        }

        set channels(value) {
            if (this._channels === value) return;
            this._channels = Math.max(1, Math.min(value, 4));

            // change default value

            if (this.value) {
                this._renderGradient();
            }
        }

        get value() {
            return this._value;
        }

        set value(value) {
            // TODO: maybe we should check for equality
            // but since this value will almost always be set using
            // the picker it's not worth the effort
            this._value = value;

            this.class.remove(pcui.CLASS_MULTIPLE_VALUES);

            this._renderGradient();

            this.emit('change', value);

            if (this._binding) {
                this._binding.setValue(value);
            }
        }

        set values(values) {
            // we do not support multiple values so just
            // add the multiple values class which essentially disables
            // the input
            this.class.add(pcui.CLASS_MULTIPLE_VALUES);
            this._renderGradient();
        }
    }

    utils.implements(GradientInput, pcui.IBindable);
    utils.implements(GradientInput, pcui.IFocusable);

    pcui.Element.register('gradient', GradientInput, { renderChanges: true });

    return {
        GradientInput: GradientInput
    };
})());


/* pcui/element/element-curve-input.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_CURVE = 'pcui-curve';

    /**
     * @name pcui.CurveInput
     * @classdesc Shows a curve or curveset
     * @property {Boolean} renderChanges If true the input will flash when changed.
     * @extends pcui.Element
     */
    class CurveInput extends pcui.Element {
        /**
         * Creates a new pcui.CurveInput.
         * @param {Object} args The arguments.
         * @param {Number} [args.lineWidth] The width of the rendered lines in pixels.
         * @param {Number} [args.min] The minimum value that curves can take.
         * @param {Number} [args.max] The maximum value that curves can take.
         * @param {Number} [args.verticalValue] The default maximum and minimum values to show if min and max are undefined.
         * @param {Boolean} [args.hideRandomize] Whether to hide the randomize button in the curve picker.
         */
        constructor(args) {
            args = Object.assign({
                tabIndex: 0
            }, args);

            super(document.createElement('div'), args);

            this.class.add(CLASS_CURVE);

            this._canvas = new pcui.Canvas({ useDevicePixelRatio: true });
            this.dom.appendChild(this._canvas.dom);
            this._canvas.parent = this;
            this._canvas.on('resize', this._renderCurves.bind(this));

            // make sure canvas is the same size as the container element
            // 20 times a second
            this._resizeInterval = setInterval(() => {
                this._canvas.resize(this.width, this.height);
            }, 1000 / 20);

            this._pickerChanging = false;
            this._combineHistory = false;
            this._historyPostfix = null;

            this._domEventKeyDown = this._onKeyDown.bind(this);
            this._domEventFocus = this._onFocus.bind(this);
            this._domEventBlur = this._onBlur.bind(this);

            this.dom.addEventListener('keydown', this._domEventKeyDown);
            this.dom.addEventListener('focus', this._domEventFocus);
            this.dom.addEventListener('blur', this._domEventBlur);

            this.on('click', () => {
                if (!this.enabled || this.readOnly || this.class.contains(pcui.CLASS_MULTIPLE_VALUES)) return;
                this._openCurvePicker();
            });

            this._lineWidth = args.lineWidth || 1;

            this._min = 0;
            if (args.min !== undefined) {
                this._min = args.min;
            } else if (args.verticalValue !== undefined) {
                this._min = -args.verticalValue;
            }

            this._max = 1;
            if (args.max !== undefined) {
                this._max = args.max;
            } else if (args.verticalValue !== undefined) {
                this._max = args.verticalValue;
            }

            // default value
            this._value = this._getDefaultValue();

            if (args.value) {
                this.value = args.value;
            }

            this.renderChanges = args.renderChanges || false;

            this.on('change', () => {
                if (this.renderChanges) {
                    this.flash();
                }
            });

            // arguments for the curve picker
            this._pickerArgs = {
                min: args.min,
                max: args.max,
                verticalValue: args.verticalValue,
                curves: args.curves,
                hideRandomize: args.hideRandomize
            };
        }

        _onKeyDown(evt) {
            // escape blurs the field
            if (evt.keyCode === 27) {
                this.blur();
            }

            // enter opens the gradient picker
            if (evt.keyCode !== 13 || !this.enabled || this.readOnly || this.class.contains(pcui.CLASS_MULTIPLE_VALUES)) {
                return;
            }

            evt.stopPropagation();
            evt.preventDefault();

            this._openCurvePicker();
        }

        _onFocus(evt) {
            this.emit('focus');
        }

        _onBlur(evt) {
            this.emit('blur');
        }

        _getDefaultValue() {
            return [{
                type: 4,
                keys: [0, 0],
                betweenCurves: false
            }];
        }

        _openCurvePicker() {
            // TODO: don't use global functions
            editor.call('picker:curve', utils.deepCopy(this.value), this._pickerArgs);

            // position picker
            const rectPicker = editor.call('picker:curve:rect');
            const rectField = this.dom.getBoundingClientRect();
            editor.call('picker:curve:position', rectField.right - rectPicker.width, rectField.bottom);

            let evtChangeStart = editor.on('picker:curve:change:start', () => {
                if (this._pickerChanging) return;
                this._pickerChanging = true;

                if (this._binding) {
                    this._combineHistory = this._binding.historyCombine;
                    this._historyPostfix = this._binding.historyPostfix;

                    this._binding.historyCombine = true;
                    // assign a history postfix which will limit how far back
                    // the history will be combined. We only want to combine
                    // history between this curve:change:start and curve:change:end events
                    // not further back
                    this._binding.historyPostfix = `(${Date.now()})`;
                }
            });

            let evtChangeEnd = editor.on('picker:curve:change:end', () => {
                if (!this._pickerChanging) return;
                this._pickerChanging = false;

                if (this._binding) {
                    this._binding.historyCombine = this._combineHistory;
                    this._binding.historyPostfix = this._historyPostfix;

                    this._combineHistory = false;
                    this._historyPostfix = null;
                }
            });

            let evtPickerChanged = editor.on('picker:curve:change', this._onPickerChange.bind(this));

            let evtRefreshPicker = this.on('change', value => {
                const args = Object.assign({
                    keepZoom: true
                }, this._pickerArgs);

                editor.call('picker:curve:set', value, args);
            });

            editor.once('picker:curve:close', function () {
                evtRefreshPicker.unbind();
                evtRefreshPicker = null;
                evtPickerChanged.unbind();
                evtPickerChanged = null;
                evtChangeStart.unbind();
                evtChangeStart = null;
                evtChangeEnd.unbind();
                evtChangeEnd = null;
            });
        }

        _onPickerChange(paths, values) {
            if (!this.value) return;

            // maybe we should deepCopy the value instead but not doing
            // it now for performance
            const value = utils.deepCopy(this.value);

            // patch our value with the values coming from the picker
            // which will trigger a change to the binding if one exists
            for (let i = 0; i < paths.length; i++) {
                const parts = paths[i].split('.');
                const curve = value[parseInt(parts[0], 10)];
                if (!curve) continue;

                if (parts.length === 3) {
                    curve[parts[1]][parseInt(parts[2], 10)] = values[i];
                } else {
                    curve[parts[1]] = values[i];
                }
            }

            this.value = value;
        }

        _getMinMaxValues(value) {
            let minValue = Infinity;
            let maxValue = -Infinity;

            if (value) {
                if (!Array.isArray(value)) {
                    value = [value];
                }

                value.forEach(value => {
                    if (!value || !value.keys || !value.keys.length) return;

                    if (Array.isArray(value.keys[0])) {
                        value.keys.forEach(data => {
                            for (let i = 1; i < data.length; i += 2) {
                                if (data[i] > maxValue) {
                                    maxValue = data[i];
                                }

                                if (data[i] < minValue) {
                                    minValue = data[i];
                                }
                            }
                        });
                    } else {
                        for (let i = 1; i < value.keys.length; i += 2) {
                            if (value.keys[i] > maxValue) {
                                maxValue = value.keys[i];
                            }

                            if (value.keys[i] < minValue) {
                                minValue = value.keys[i];
                            }
                        }
                    }
                });
            }

            if (minValue === Infinity) {
                minValue = this._min;
            }

            if (maxValue === -Infinity) {
                maxValue = this._max;
            }

            // try to limit minValue and maxValue
            // between the min / max values for the curve field
            if (minValue > this._min) {
                minValue = this._min;
            }

            if (maxValue < this._max) {
                maxValue = this._max;
            }

            return [minValue, maxValue];
        }

        // clamp val between min and max only if it's less / above them but close to them
        // this is mostly to allow splines to go over the limit but if they are too close to
        // the edge then they will avoid rendering half-height lines
        _clampEdge(val, min, max) {
            if (val < min && val > min - 2) return min;
            if (val > max && val < max + 2) return max;
            return val;
        }

        _convertValueToCurves(value) {
            if (!value || !value.keys || !value.keys.length) return null;

            if (value.keys[0].length !== undefined) {
                return value.keys.map(data => {
                    const curve = new pc.Curve(data);
                    curve.type = value.type;
                    return curve;
                });
            }

            const curve = new pc.Curve(value.keys);
            curve.type = value.type;
            return [curve];
        }

        _renderCurves() {
            const canvas = this._canvas.dom;
            const context = canvas.getContext('2d');
            const value = this.value;

            const width = this._canvas.width;
            const height = this._canvas.height;
            const ratio = this._canvas.pixelRatio;

            context.setTransform(ratio, 0, 0, ratio, 0, 0);

            // draw background
            context.clearRect(0, 0, width, height);

            const curveColors = ['rgb(255, 0, 0)', 'rgb(0, 255, 0)', 'rgb(133, 133, 252)', 'rgb(255, 255, 255)'];
            const fillColors = ['rgba(255, 0, 0, 0.5)', 'rgba(0, 255, 0, 0.5)', 'rgba(133, 133, 252, 0.5)', 'rgba(255, 255, 255, 0.5)'];

            const minMax = this._getMinMaxValues(value);

            if (!value || !value[0]) return;

            // draw curves
            const primaryCurves = this._convertValueToCurves(value[0]);

            if (!primaryCurves) return;

            const secondaryCurves = value[0].betweenCurves && value.length > 1 ? this._convertValueToCurves(value[1]) : null;

            const minValue = minMax[0];
            const maxValue = minMax[1];

            context.lineWidth = this._lineWidth;

            // prevent divide by 0
            if (width === 0) return;

            for (let i = 0; i < primaryCurves.length; i++) {
                context.strokeStyle = curveColors[i];
                context.fillStyle = fillColors[i];

                context.beginPath();
                context.moveTo(0, this._clampEdge(height * (1 - (primaryCurves[i].value(0) - minValue) / (maxValue - minValue)), 1, height - 1));

                const precision = 1;

                for (let x = 0; x < Math.floor(width / precision); x++) {
                    const val = primaryCurves[i].value(x * precision / width);
                    context.lineTo(x * precision, this._clampEdge(height * (1 - (val - minValue) / (maxValue - minValue)), 1, height - 1));
                }

                if (secondaryCurves) {
                    for (let x = Math.floor(width / precision); x >= 0; x--) {
                        const val = secondaryCurves[i].value(x * precision / width);
                        context.lineTo(x * precision, this._clampEdge(height * (1 - (val - minValue) / (maxValue - minValue)), 1, height - 1));
                    }

                    context.closePath();
                    context.fill();
                }

                context.stroke();
            }
        }

        focus() {
            this.dom.focus();
        }

        blur() {
            this.dom.blur();
        }

        destroy() {
            if (this._destroyed) return;
            this.dom.removeEventListener('keydown', this._domEventKeyDown);
            this.dom.removeEventListener('focus', this._domEventFocus);
            this.dom.removeEventListener('blur', this._domEventBlur);

            clearInterval(this._resizeInterval);
            this._resizeInterval = null;

            super.destroy();
        }

        get value() {
            return this._value;
        }

        set value(value) {
            // TODO: maybe we should check for equality
            // but since this value will almost always be set using
            // the picker it's not worth the effort
            this._value = Array.isArray(value) ? utils.deepCopy(value) : [utils.deepCopy(value)];

            this.class.remove(pcui.CLASS_MULTIPLE_VALUES);

            this._renderCurves();

            this.emit('change', value);

            if (this._binding) {
                this._binding.setValues(this._value);
            }
        }

        set values(values) {
            // we do not support multiple values so just
            // add the multiple values class which essentially disables
            // the input
            this.class.add(pcui.CLASS_MULTIPLE_VALUES);
            this._renderCurves();
        }
    }

    utils.implements(CurveInput, pcui.IBindable);
    utils.implements(CurveInput, pcui.IFocusable);

    pcui.Element.register('curveset', CurveInput, { renderChanges: true });

    return {
        CurveInput: CurveInput
    };
})());


/* pcui/element/element-asset-thumbnail.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ASSET_THUMB = 'pcui-asset-thumb';
    const CLASS_ASSET_THUMB_EMPTY = 'pcui-asset-thumb-empty';
    const CLASS_ASSET_THUMB_MISSING = 'pcui-asset-thumb-missing';
    const CLASS_FLIP_Y = 'flip-y';

    /**
     * @name pcui.AssetThumbnail
     * @classdesc Shows an asset thumbnail. Depending on the asset type that can be an image or a canvas rendering.
     * @property {Boolean} renderChanges If true the input will flash when changed.
     * @extends pcui.Element
     */
    class AssetThumbnail extends pcui.Element {
        /**
         * Creates a new pcui.AssetThumbnail.
         * @param {Object} args The arguments
         * @param {ObserverList} args.assets The assets list
         */
        constructor(args) {
            if (!args) args = {};
            super(document.createElement('div'), args);

            this.class.add(CLASS_ASSET_THUMB, CLASS_ASSET_THUMB_EMPTY);

            this._assets = args.assets;

            this._domImage = null;
            this._domCanvas = null;

            this._canvasRenderer = null;
            this._renderCanvasTimeout = null;

            this._evtThumbnailSet = null;
            this._evtThumbnailUnset = null;

            this.value = args.value || null;

            this.renderChanges = args.renderChanges || false;

            this.on('change', () => {
                if (this.renderChanges) {
                    this.flash();
                }
            });
        }

        _showImageThumbnail(asset) {
        
            this._destroyCanvas();
            this._createImage();

            let src;
            if (!asset) {
                src = `${config.url.home}/editor/scene/img/asset-placeholder-texture.png`;
            } else {
                if (asset.has('thumbnails.m')) {
                    src = asset.get('thumbnails.m');
                    if (!src.startsWith('data:image/png;base64')) {
                        src = config.url.home + src.appendQuery('t=' + asset.get('file.hash'));
                    }
                } else {
                    src = `${config.url.home}/editor/scene/img/asset-placeholder-${asset.get('type')}.png`;
                }
            }

            this._domImage.src = src;
        }

        // Wait until the element is displayed and has a valid width and height
        // before attempting to create a new canvas and render a thumbnail, otherwise
        // an exception will be raised because we will be trying to create a canvas
        // with 0 width / height.
        _renderCanvasThumbnailWhenReady(asset) {
            if (this._renderCanvasTimeout) {
                clearTimeout(this._renderCanvasTimeout);
                this._renderCanvasTimeout = null;
            }

            if (this.hidden || this._destroyed) return;

            if (!this.width || !this.height) {
                this._renderCanvasTimeout = setTimeout(() => {
                    this._renderCanvasThumbnailWhenReady(asset);
                });
                return;
            }

            this._renderCanvasThumbnail(asset);
        }

        _renderCanvasThumbnail(asset) {
            this._destroyImage();
            this._createCanvas();

            var type = asset.get('type');
            var renderer;
            switch (type) {
                case 'cubemap':
                    renderer = new pcui.CubemapThumbnailRenderer(asset, this._domCanvas, this._assets);
                    break;
                case 'font':
                    renderer = new pcui.FontThumbnailRenderer(asset, this._domCanvas);
                    break;
                case 'material':
                    renderer = new pcui.MaterialThumbnailRenderer(asset, this._domCanvas);
                    break;
                case 'model':
                    renderer = new pcui.ModelThumbnailRenderer(asset, this._domCanvas);
                    break;
                case 'sprite':
                    renderer = new pcui.SpriteThumbnailRenderer(asset, this._domCanvas, this._assets);
                    break;
            }

            this._canvasRenderer = renderer;

            this._canvasRenderer.render();

            if (type !== 'sprite' && type !== 'cubemap') {
                this._domCanvas.classList.add(CLASS_FLIP_Y);
            } else {
                this._domCanvas.classList.remove(CLASS_FLIP_Y);
            }
        }

        _createImage() {
            if (this._domImage) return;
            this._domImage = new Image();
            this.dom.appendChild(this._domImage);
        }

        _destroyImage() {
            if (!this._domImage) return;
            this.dom.removeChild(this._domImage);
            this._domImage = null;
        }

        _createCanvas() {
            if (this._domCanvas) return;

            this._domCanvas = document.createElement('canvas');
            this._domCanvas.width = this.width;
            this._domCanvas.height = this.height;
            this.dom.appendChild(this._domCanvas);
        }

        _destroyCanvas() {
            if (this._renderCanvasTimeout) {
                clearTimeout(this._renderCanvasTimeout);
                this._renderCanvasTimeout = null;
            }

            if (!this._domCanvas) return;
            this.dom.removeChild(this._domCanvas);
            this._domCanvas = null;
        }

        _updateValue(value) {
            this.class.remove(pcui.CLASS_MULTIPLE_VALUES);

            if (this._value === value) return false;

            this._value = value;

            this._onChange(value);

            this.emit('change', value);

            return true;
        }

        _onChange(value) {
            if (this._evtThumbnailSet) {
                this._evtThumbnailSet.unbind();
                this._evtThumbnailSet = null;
            }

            if (this._evtThumbnailUnset) {
                this._evtThumbnailUnset.unbind();
                this._evtThumbnailUnset = null;
            }

            if (this._canvasRenderer) {
                this._canvasRenderer.destroy();
                this._canvasRenderer = null;
            }

            this.class.remove(CLASS_ASSET_THUMB_MISSING);

            if (value) {
                this.class.remove(CLASS_ASSET_THUMB_EMPTY);
            } else {
                this.class.add(CLASS_ASSET_THUMB_EMPTY);
            }

            // don't show anything on null value
            if (!value) {
                this._destroyImage();
                this._destroyCanvas();
                return;
            }

            // show placeholder image on missing asset
            const asset = this._assets.get(value);
            if (!asset) {
                this.class.add(CLASS_ASSET_THUMB_MISSING);
                this._showImageThumbnail(null);
                return;
            }

            var type = asset.get('type');

            if (type === 'cubemap' || type === 'font' || type === 'material' || type === 'model' || type === 'sprite') {
                this._renderCanvasThumbnailWhenReady(asset);
            } else {
                this._showImageThumbnail(asset);

                this._evtThumbnailSet = asset.on('thumbnails.m:set', () => {
                    this._showImageThumbnail(asset);
                });
                this._evtThumbnailUnset = asset.on('thumbnails.m:unset', () => {
                    this._showImageThumbnail(asset);
                });
            }
        }

        destroy() {
            if (this._destroyed) return;

            this._destroyImage();
            this._destroyCanvas();

            if (this._evtThumbnailSet) {
                this._evtThumbnailSet.unbind();
                this._evtThumbnailSet = null;
            }

            if (this._evtThumbnailUnset) {
                this._evtThumbnailUnset.unbind();
                this._evtThumbnailUnset = null;
            }

            super.destroy();
        }

        get value() {
            return this._value;
        }

        set value(value) {
            const changed = this._updateValue(value);

            if (changed && this._binding) {
                this._binding.setValue(value);
            }
        }

        set values(values) {
            let different = false;
            const value = values[0];
            for (let i = 1; i < values.length; i++) {
                if (values[i] !== value) {
                    different = true;
                    break;
                }
            }

            if (different) {
                this._updateValue(null);
                this.class.add(pcui.CLASS_MULTIPLE_VALUES);
            } else {
                this._updateValue(values[0]);
            }
        }
    }

    utils.implements(AssetThumbnail, pcui.IBindable, { renderChanges: true });

    return {
        AssetThumbnail: AssetThumbnail
    };
})());


/* pcui/element/element-asset-input.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ASSET_INPUT = 'pcui-asset-input';
    const CLASS_ASSET_INPUT_THUMB = 'pcui-asset-input-thumb';
    const CLASS_ASSET_INPUT_LABEL = 'pcui-asset-input-label';
    const CLASS_ASSET_INPUT_CONTROLS = 'pcui-asset-input-controls';
    const CLASS_ASSET_INPUT_ASSET = 'pcui-asset-input-asset';
    const CLASS_ASSET_INPUT_EDIT = 'pcui-asset-input-edit';
    const CLASS_ASSET_INPUT_REMOVE = 'pcui-asset-input-remove';

    /**
     * @name pcui.AssetInput
     * @classdesc Represents an asset input field. It shows a thumbnail of the asset and
     * allows picking of an asset using an asset picker.
     * @extends pcui.Element
     * @property {String} assetType The type of assets that this input can display. Used when picking assets with the asset picker.
     * @property {pcui.Label} label Gets the label element on the top right of the input.
     * @property {Boolean} renderChanges If true the input will flash when changed.
     * @property {Function} dragEnterFn A function that is called when we drag an item over the element.
     * @property {Function} dragLeaveFn A function that is called when we stop dragging an item over the element.
     * @mixes pcui.IBindable
     */
    class AssetInput extends pcui.Element {
        /**
         * Returns a new AssetInput.
         * @param {Object} args The arguments. Extends the pcui.Element arguments.
         * @param {ObserverList} args.assets The assets observer list.
         * @param {String} [args.text] The text on the top right of the field.
         * @param {String} [args.assetType] The type of assets that this input can display. Used when picking assets with the asset picker.
         * @param {Boolean} [args.allowDragDrop] If true then this will enable drag and drop of assets on the input
         * @param {Function} [args.pickAssetFn] A function to pick an asset and pass its id to the callback parameter. If none is provided
         * the default Editor asset picker will be used.
         * @param {Function} [args.selectAssetFn] A function that selects the asset id passed as a parameter. If none is provided the default
         * Editor selector will be used.
         */
        constructor(args) {
            if (!args) args = {};

            super(document.createElement('div'), args);

            this.class.add(CLASS_ASSET_INPUT);

            // asset thumbnail on the left
            this._thumbnail = new pcui.AssetThumbnail({
                binding: new pcui.BindingObserversToElement(),
                assets: args.assets
            });
            this._thumbnail.class.add(CLASS_ASSET_INPUT_THUMB);
            this.dom.appendChild(this._thumbnail.dom);
            this._thumbnail.parent = this;
            this._thumbnail.on('click', this._onClickThumb.bind(this));

            // input label
            this._label = new pcui.Label({
                text: args.text
            });
            this._label.class.add(CLASS_ASSET_INPUT_LABEL);
            this.dom.appendChild(this._label.dom);
            this._label.parent = this;

            // container for controls
            this._containerControls = new pcui.Container({
                class: CLASS_ASSET_INPUT_CONTROLS
            });
            this.dom.appendChild(this._containerControls.dom);
            this._containerControls.parent = this;

            // asset name
            this._labelAsset = new pcui.Label({
                binding: new pcui.BindingObserversToElement()
            });
            this._labelAsset.class.add(CLASS_ASSET_INPUT_ASSET);
            this._containerControls.append(this._labelAsset);

            // only shown when we are displaying multiple different values
            this._labelVarious = new pcui.Label({
                text: 'various',
                hidden: true
            });
            this._labelVarious.class.add(CLASS_ASSET_INPUT_ASSET);
            this._containerControls.append(this._labelVarious);

            // select asset button
            this._btnEdit = new pcui.Button({
                icon: 'E336'
            });
            this._btnEdit.class.add(CLASS_ASSET_INPUT_EDIT);
            this._containerControls.append(this._btnEdit);
            this._btnEdit.on('click', this._onClickEdit.bind(this));

            // remove asset button
            this._btnRemove = new pcui.Button({
                icon: 'E132'
            });
            this._btnRemove.class.add(CLASS_ASSET_INPUT_REMOVE);
            this._containerControls.append(this._btnRemove);
            this._btnRemove.on('click', this._onClickRemove.bind(this));

            this._assets = args.assets;
            this._assetType = args.assetType;
            this._pickAssetFn = args.pickAssetFn || this._defaultPickAssetFn.bind(this);
            this._selectAssetFn = args.selectAssetFn || this._defaultSelectAssetFn.bind(this);

            this.dragEnterFn = args.dragEnterFn;
            this.dragLeaveFn = args.dragLeaveFn;

            if (args.allowDragDrop) {
                this._initializeDropTarget();
            }

            this.value = args.value || null;

            this.renderChanges = args.renderChanges || false;

            this.on('change', () => {
                if (this.renderChanges) {
                    this._containerControls.flash();
                }
            });
        }

        _initializeDropTarget() {
            editor.call('drop:target', {
                ref: this,
                filter: (type, dropData) => {
                    if (dropData.id && type.startsWith('asset') &&
                        (!this._assetType || type === `asset.${this._assetType}`) &&
                        dropData.id !== this.value) {

                        const asset = this._assets.get(dropData.id);
                        return !!asset && !asset.get('source');
                    }
                },
                drop: (type, dropData) => {
                    this.value = dropData.id;
                },
                over: (type, dropData) => {
                    if (this._dragEnterFn) {
                        this._dragEnterFn(type, dropData);
                    }
                },
                leave: () => {
                    if (this._dragLeaveFn) {
                        this._dragLeaveFn();
                    }
                }
            });
        }

        // Fired when edit button is clicked
        _onClickEdit() {
            this._pickAssetFn((pickedAssetId) => {
                this.value = pickedAssetId;
            });
        }

        // Fired when the thumnail is clicked
        _onClickThumb() {
            this._selectAssetFn(this.value);
        }

        // Fired when remove button is clicked
        _onClickRemove() {
            this.value = null;
        }

        // Default pick asset function. Uses global asset picker
        _defaultPickAssetFn(callback) {
            // TODO: use less global functions here
            editor.call('picker:asset', {
                type: this._assetType || '*',
                currentAsset: this._assets.get(this.value)
            });

            let evt = editor.once('picker:asset', (asset) => {
                evt = null;
                callback(asset.get('id'));
            });

            editor.once('picker:asset:close', () => {
                if (evt) {
                    evt.unbind();
                    evt = null;
                }
            });
        }

        // Default select function. Uses global selector
        _defaultSelectAssetFn(assetId) {
            const asset = this._assets.get(assetId);
            if (! asset) return;

            editor.call('selector:set', 'asset', [asset]);

            let folder = null;
            if (asset.get('type') === 'script') {
                const settings = editor.call('settings:project');
                if (settings && settings.get('useLegacyScripts')) {
                    folder = 'scripts';
                }
            }

            if (!folder) {
                const path = asset.get('path');
                if (path.length) {
                    folder = this._assets.get(path[path.length - 1]);
                }
            }

            editor.call('assets:panel:currentFolder', folder);
        }

        _updateValue(value, force) {
            if (this._value === value && !force) return false;

            this._value = value;

            if (value) {
                let asset;
                if (this._assets) {
                    // try to get the asset
                    asset = this._assets.get(value);
                    if (asset) {
                        // link the asset name to the label
                        this._labelAsset.link(asset, 'name');
                    } else {
                        // if we did not find the asset then show Missing
                        this._labelAsset.unlink();
                        this._labelAsset.text = 'Missing';
                    }
                } else {
                    // no assets registry passed so just show the asset id
                    this._labelAsset.text = value;
                }
            } else {
                // null asset id
                this._labelAsset.text = 'Empty';
            }

            // if we are not bound to anything yet then
            // set the thumbnail value as well
            if (!this.binding || !this.binding.linked) {
                this._thumbnail.value = value;
            }

            this._labelAsset.hidden = false;
            this._labelVarious.hidden = true;

            this.emit('change', value);

            return true;
        }

        link(observers, paths) {
            super.link(observers, paths);
            this._thumbnail.link(observers, paths);
        }

        unlink() {
            super.unlink();
            this._thumbnail.unlink();
        }

        get text() {
            return this._label.value;
        }

        set text(value) {
            this._label.value = value;
        }

        get label() {
            return this._label;
        }

        get value() {
            return this._value;
        }

        get assetType() {
            return this._assetType;
        }

        set assetType(value) {
            this._assetType = value;
        }

        get dragEnterFn() {
            return this._dragEnterFn;
        }

        set dragEnterFn(value) {
            this._dragEnterFn = value;
        }

        get dragLeaveFn() {
            return this._dragLeaveFn;
        }

        set dragLeaveFn(value) {
            this._dragLeaveFn = value;
        }

        set value(value) {
            const forceUpdate = !this._labelVarious.hidden && value === null;
            const changed = this._updateValue(value, forceUpdate);

            if (changed && this._binding) {
                this._binding.setValue(value);
            }
        }

        set values(values) {
            let different = false;
            const value = values[0];
            for (let i = 1; i < values.length; i++) {
                if (values[i] !== value) {
                    different = true;
                    break;
                }
            }

            if (different) {
                this._updateValue(null);
                this._labelAsset.hidden = true;
                this._labelVarious.hidden = false;
            } else {
                this._updateValue(values[0] || null);
            }
        }

        get renderChanges() {
            return this._renderChanges;
        }

        set renderChanges(value) {
            this._renderChanges = value;
            this._thumbnail.renderChanges = value;
        }
    }

    utils.implements(AssetInput, pcui.IBindable);

    pcui.Element.register('asset', AssetInput, { allowDragDrop: true, renderChanges: true });

    return {
        AssetInput: AssetInput
    };
})());


/* pcui/element/element-entity-input.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ENTITY_INPUT = 'pcui-entity-input';
    const CLASS_EMPTY = CLASS_ENTITY_INPUT + '-empty';

    /**
     * @name pcui.EntityInput
     * @classdesc An input that accepts an Entity.
     * @property {Boolean} renderChanges If true then the Element will flash when its value changes.
     * @extends pcui.Element
     */
    class EntityInput extends pcui.Element {
        /**
         * Creates a new pcui.EntityInput.
         * @param {Object} args The arguments.
         * @param {ObserverList} args.entities The entities list
         * @param {Function} [args.pickEntityFn] A function with signature (callback) => void. The function should allow the user to pick an Entity and then the functino should call the callback passing the Entity's resource id as the argument.
         * @param {Function} [args.highlightEntityFn] A function that highlights an Entity with signature (string, boolean) => void. The first argument is the resource id of the Entity and the second argument signifies whether we should highlight the entity or not.
         * @param {Boolean} [args.allowDragDrop] If true then this will enable drag and drop of entities on the input
         */
        constructor(args) {
            const container = new pcui.Container();

            args = Object.assign({
                tabIndex: 0
            }, args);

            super(container.dom, args);

            this.class.add(CLASS_ENTITY_INPUT);

            this._entities = args.entities;

            this._container = container;
            this._container.parent = this;

            this._domEvtFocus = this._onFocus.bind(this);
            this._domEvtBlur = this._onBlur.bind(this);
            this._domEvtKeyDown = this._onKeyDown.bind(this);

            this.dom.addEventListener('focus', this._domEvtFocus);
            this.dom.addEventListener('blur', this._domEvtBlur);
            this.dom.addEventListener('keydown', this._domEvtKeyDown);

            this._label = new pcui.Label({
                flexGrow: 1,
                binding: new pcui.BindingObserversToElement()
            });

            this._container.append(this._label);

            this._buttonRemove = new pcui.Button({
                icon: 'E132'
            });
            this._container.append(this._buttonRemove);
            this._buttonRemove.on('click', (evt) => {
                // don't propagate click to container
                // because it will open the entity picker
                evt.stopPropagation();

                this.value = null;
            });

            this._pickEntityFn = args.pickEntityFn || this._pickEntity.bind(this);
            this._highlightEntityFn = args.highlightEntityFn || this._highlightEntity.bind(this);

            this.value = args.value || null;

            this.renderChanges = args.renderChanges || false;

            this.on('change', () => {
                if (this.renderChanges) {
                    this.flash();
                }
            });

            this.on('click', (evt) => {
                if (this.readOnly) return;

                this.focus();

                this._pickEntity(resourceId => {
                    this.value = resourceId;
                });
            });

            this.on('hover', () => {
                if (this.value) {
                    this._highlightEntityFn(this.value, true);
                }
            });

            this.on('hoverend', () => {
                if (this.value) {
                    this._highlightEntityFn(this.value, false);
                }
            });

            this.on('hide', () => {
                if (this.value) {
                    this._highlightEntityFn(this.value, false);
                }
            });

            if (args.allowDragDrop) {
                this._initializeDropTarget();
            }
        }

        _initializeDropTarget() {
            editor.call('drop:target', {
                ref: this,
                filter: (type, dropData) => {
                    return (dropData.resource_id && dropData.resource_id !== this.value && type === 'entity');
                },
                drop: (type, dropData) => {
                    this.value = dropData.resource_id;
                }
            });
        }

        _pickEntity(callback) {
            let evtEntityPick = editor.once('picker:entity', entity => {
                callback(entity ? entity.get('resource_id') : null);
                evtEntityPick = null;
            });

            editor.call('picker:entity', this.value);

            editor.once('picker:entity:close', function () {
                if (evtEntityPick) {
                    evtEntityPick.unbind();
                    evtEntityPick = null;
                }
            });
        }

        _highlightEntity(resourceId, highlight) {
            editor.call('entities:panel:highlight', resourceId, highlight);
        }

        _updateValue(value) {
            if (this._value) {
                this._highlightEntityFn(this._value, false);
            }

            this._value = value;

            this.class.remove(pcui.CLASS_MULTIPLE_VALUES);

            if (value) {
                const entity = this._entities.get(value);
                this.class.remove(CLASS_EMPTY);
                if (entity) {
                    this._label.link(entity, 'name');
                } else {
                    this._label.unlink();
                    this._label.value = 'Missing';
                }
            } else {
                this._label.unlink();
                this._label.value = this.readOnly ? '' : 'Select Entity';
                this.class.add(CLASS_EMPTY);
            }

            this.emit('change', value);
        }

        _onFocus() {
            this.class.add(pcui.CLASS_FOCUS);
            this.emit('focus');
        }

        _onBlur() {
            this.class.remove(pcui.CLASS_FOCUS);
            this.emit('blur');
        }

        _onKeyDown(evt) {
            // blur on esc
            if (evt.keyCode === 27) {
                evt.stopPropagation();
                this.blur();
                return;
            }

            // open picker on space
            if (evt.keyCode !== 32) return;
            if (!this.enabled || this.readOnly) return;

            evt.stopPropagation();

            this._pickEntityFn((resourceId) => {
                this.value = resourceId;
                this.focus();
            });
        }

        focus() {
            this.dom.focus();
        }

        blur() {
            this.dom.blur();
        }

        destroy() {
            if (this._destroyed) return;
            this.dom.removeEventListener('focus', this._domEvtFocus);
            this.dom.removeEventListener('blur', this._domEvtBlur);
            this._highlightEntity(this.value, false);

            super.destroy();
        }

        get value() {
            return this._value;
        }

        set value(value) {
            if (this._value === value) return;
            this._updateValue(value);

            if (this._binding) {
                this._binding.setValue(value);
            }
        }

        set values(values) {
            let different = false;
            const value = values[0];
            for (let i = 1; i < values.length; i++) {
                if (values[i] !== value) {
                    different = true;
                    break;
                }
            }

            if (different) {
                this._updateValue(null);
                this.class.add(pcui.CLASS_MULTIPLE_VALUES);
            } else {
                this._updateValue(values[0]);
            }
        }
    }

    utils.implements(EntityInput, pcui.IBindable);
    utils.implements(EntityInput, pcui.IFocusable);

    pcui.Element.register('entity', EntityInput, { allowDragDrop: true, renderChanges: true });

    return {
        EntityInput: EntityInput
    };
})());


/* pcui/element/element-vector-input.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_VECTOR_INPUT = 'pcui-vector-input';

    /**
     * @name pcui.VectorInput
     * @classdesc A vector input
     * @extends pcui.Element
     */
    class VectorInput extends pcui.Element {
        /**
         * Creates a new pcui.VectorInput.
         * @param {Object} args The arguments.
         * @param {Number} [args.dimensions] The number of dimensions in the vector. Can be between 2 to 4. Defaults to 3.
         * @param {Number} [args.min] The minimum value for each vector element.
         * @param {Number} [args.max] The maximum value for each vector element.
         * @param {Number} [args.precision] The decimal precision for each vector element.
         * @param {Number} [args.step] The incremental step when using arrow keys for each vector element.
         * @param {Boolean} [args.renderChanges] If true each vector element will flash on changes.
         * @param {String[]|String} [args.placeholder] The placeholder string for each vector element.
         */
        constructor(args) {
            args = Object.assign({}, args);

            // set binding after inputs have been created
            const binding = args.binding;
            delete args.binding;

            super(document.createElement('div'), args);

            this.class.add(CLASS_VECTOR_INPUT);

            const dimensions = Math.max(2, Math.min(4, args.dimensions || 3));

            const onInputChange = this._onInputChange.bind(this);
            this._inputs = new Array(dimensions);
            for (let i = 0; i < this._inputs.length; i++) {
                this._inputs[i] = new pcui.NumericInput({
                    min: args.min,
                    max: args.max,
                    precision: args.precision,
                    step: args.step,
                    renderChanges: args.renderChanges,
                    placeholder: args.placeholder ? (Array.isArray(args.placeholder) ? args.placeholder[i] : args.placeholder) : null
                });
                this._inputs[i].on('change', onInputChange);
                this._inputs[i].on('focus', () => {
                    this.emit('focus');
                });
                this._inputs[i].on('blur', () => {
                    this.emit('blur');
                });
                this.dom.appendChild(this._inputs[i].dom);
                this._inputs[i].parent = this;
            }

            // set the binding after the inputs have been created
            // because we rely on them in the overriden setter
            if (binding) {
                this.binding = binding;
            }

            this._applyingChange = false;

            if (args.value !== undefined) {
                this.value = args.value;
            }

        }

        _onInputChange() {
            if (this._applyingChange) return;

            this.emit('change', this.value);
        }

        _updateValue(value) {
            this.class.remove(pcui.CLASS_MULTIPLE_VALUES);

            if (this.value.equals(value)) return false;

            this._applyingChange = true;

            for (let i = 0; i < this._inputs.length; i++) {
                // disable binding for each individual input when we use
                // the 'value' setter for the whole vector value. That is because
                // we do not want the individual inputs to emit their own binding events
                // since we are setting the whole vector value here
                const binding = this._inputs[i].binding;
                let applyingChange = false;
                if (binding) {
                    applyingChange = binding.applyingChange;
                    binding.applyingChange = true;
                }
                this._inputs[i].value = (value && value[i] !== undefined ? value[i] : null);
                if (binding) {
                    binding.applyingChange = applyingChange;
                }
            }

            this.emit('change', this.value);

            this._applyingChange = false;

            return true;
        }

        link(observers, paths) {
            super.link(observers, paths);
            observers = Array.isArray(observers) ? observers : [observers];
            paths = Array.isArray(paths) ? paths : [paths];

            const useSinglePath = paths.length === 1 || observers.length !== paths.length;
            if (useSinglePath) {
                for (let i = 0; i < this._inputs.length; i++) {
                    // link observers to path.i for each dimension
                    this._inputs[i].link(observers, paths[0] + `.${i}`);
                }
            } else {
                for (let i = 0; i < this._inputs.length; i++) {
                    // link observers to paths[i].i for each dimension
                    this._inputs[i].link(observers, paths.map(path => `${path}.${i}`));
                }

            }
        }

        unlink() {
            super.unlink();
            for (let i = 0; i < this._inputs.length; i++) {
                this._inputs[i].unlink();
            }
        }

        focus() {
            this._inputs[0].focus();
        }

        blur() {
            for (let i = 0; i < this._inputs.length; i++) {
                this._inputs[i].blur();
            }
        }

        get value() {
            const value = new Array(this._inputs.length);
            for (let i = 0; i < this._inputs.length; i++) {
                value[i] = this._inputs[i].value;
            }

            return value;
        }

        set value(value) {
            if (!Array.isArray(value)) {
                value = [];
            }

            const changed = this._updateValue(value);

            if (changed && this._binding) {
                this._binding.setValue(value);
            }
        }

        set values(values) {
            let different = false;
            const value = values[0] || [];
            for (let i = 1; i < values.length; i++) {
                if (!value.equals(values[i])) {
                    different = true;
                    break;
                }
            }

            if (different) {
                this._updateValue(null);
                this.class.add(pcui.CLASS_MULTIPLE_VALUES);
            } else {
                this._updateValue(values[0]);
            }
        }

        // override binding setter to set a binding clone to
        // each input
        set binding(value) {
            super.binding = value;
            for (let i = 0; i < this._inputs.length; i++) {
                this._inputs[i].binding = (value ? value.clone() : null);
            }
        }

        // we have to override the getter too because
        // we have overriden the setter
        get binding() {
            return super.binding;
        }

        get placeholder() {
            return this._inputs.map(input => input.placeholder);
        }

        set placeholder(value) {
            for (let i = 0; i < this._inputs.length; i++) {
                this._inputs[i].placeholder = value[i] || value || null;
            }
        }

        get inputs() {
            return this._inputs.slice();
        }
    }

    // add proxied properties
    [
        'min',
        'max',
        'precision',
        'step',
        'renderChanges'
    ].forEach(property => {
        Object.defineProperty(VectorInput.prototype, property, {
            get: function () {
                return this._inputs[0][property];
            },
            set: function (value) {
                for (let i = 0; i < this._inputs.length; i++) {
                    this._inputs[i][property] = value;
                }
            }
        });
    });

    utils.implements(VectorInput, pcui.IBindable);
    utils.implements(VectorInput, pcui.IFocusable);

    // register with ElementFactory
    pcui.Element.register('vec2', VectorInput, { dimensions: 2, renderChanges: true });
    pcui.Element.register('vec3', VectorInput, { dimensions: 3, renderChanges: true });
    pcui.Element.register('vec4', VectorInput, { dimensions: 4, renderChanges: true });

    return {
        VectorInput: VectorInput
    };
})());


/* pcui/element/element-boolean-input.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_BOOLEAN_INPUT = 'pcui-boolean-input';
    const CLASS_BOOLEAN_INPUT_TICKED = CLASS_BOOLEAN_INPUT + '-ticked';
    const CLASS_BOOLEAN_INPUT_TOGGLE = CLASS_BOOLEAN_INPUT + '-toggle';

    /**
     * @name pcui.BooleanInput
     * @classdesc A checkbox element.
     * @property {Boolean} renderChanges If true the input will flash when changed.
     * @extends pcui.Element
     */
    class BooleanInput extends pcui.Element {
        /**
         * Creates a new pcui.BooleanInput.
         * @param {Object} args The arguments.
         * @param {String} [args.type] The type of checkbox currently can be null or 'toggle'.
         */
        constructor(args) {
            args = Object.assign({
                tabIndex: 0
            }, args);

            super(document.createElement('div'), args);

            if (args.type === 'toggle') {
                this.class.add(CLASS_BOOLEAN_INPUT_TOGGLE);
            } else {
                this.class.add(CLASS_BOOLEAN_INPUT);
            }
            this.class.add(pcui.CLASS_NOT_FLEXIBLE);

            this._domEventKeyDown = this._onKeyDown.bind(this);
            this._domEventFocus = this._onFocus.bind(this);
            this._domEventBlur = this._onBlur.bind(this);

            this.dom.addEventListener('keydown', this._domEventKeyDown);
            this.dom.addEventListener('focus', this._domEventFocus);
            this.dom.addEventListener('blur', this._domEventBlur);

            this._value = null;
            if (args.value !== undefined) {
                this.value = args.value;
            }

            this.renderChanges = args.renderChanges;
        }

        _onClick(evt) {
            if (this.enabled) {
                this.focus();
            }

            if (this.enabled && !this.readOnly) {
                this.value = !this.value;
            }

            return super._onClick(evt);
        }

        _onKeyDown(evt) {
            if (evt.keyCode === 27) {
                this.blur();
                return;
            }

            if (!this.enabled || this.readOnly) return;

            if (evt.keyCode === 32) {
                evt.stopPropagation();
                evt.preventDefault();
                this.value = !this.value;
            }
        }

        _onFocus() {
            this.emit('focus');
        }

        _onBlur() {
            this.emit('blur');
        }

        _updateValue(value) {
            this.class.remove(pcui.CLASS_MULTIPLE_VALUES);

            if (value === this.value) return false;

            this._value = value;

            if (value) {
                this.class.add(CLASS_BOOLEAN_INPUT_TICKED);
            } else {
                this.class.remove(CLASS_BOOLEAN_INPUT_TICKED);
            }

            if (this.renderChanges) {
                this.flash();
            }

            this.emit('change', value);

            return true;
        }

        focus() {
            this.dom.focus();
        }

        blur() {
            this.dom.blur();
        }

        destroy() {
            if (this._destroyed) return;

            this.dom.removeEventListener('keydown', this._domEventKeyDown);
            this.dom.removeEventListener('focus', this._domEventFocus);
            this.dom.removeEventListener('blur', this._domEventBlur);

            super.destroy();
        }

        get value() {
            return this._value;
        }

        set value(value) {
            const changed = this._updateValue(value);
            if (changed && this._binding) {
                this._binding.setValue(value);
            }
        }

        set values(values) {
            let different = false;
            const value = values[0];
            for (let i = 1; i < values.length; i++) {
                if (values[i] !== value) {
                    different = true;
                    break;
                }
            }

            if (different) {
                this._updateValue(null);
                this.class.add(pcui.CLASS_MULTIPLE_VALUES);
            } else {
                this._updateValue(values[0]);
            }
        }
    }


    utils.implements(BooleanInput, pcui.IBindable);
    utils.implements(BooleanInput, pcui.IFocusable);

    pcui.Element.register('boolean', BooleanInput, { renderChanges: true });

    return {
        BooleanInput: BooleanInput
    };
})());


/* pcui/element/element-label-group.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_LABEL_GROUP = 'pcui-label-group';
    const CLASS_LABEL_TOP = CLASS_LABEL_GROUP + '-align-top';

    /**
     * @name pcui.LabelGroup
     * @classdesc Represents a group of a pcui.Label and a pcui.Element. Useful for rows of labeled fields.
     * @extends pcui.Container
     * @property {String} text Gets / sets the label text.
     * @property {pcui.Element} field Gets the field. This can only be set through the constructor by passing it in the arguments.
     * @property {pcui.Element} label Gets the label element.
     * @property {Boolean} labelAlignTop Whether to align the label at the top of the group. Defaults to false which aligns it at the center.
     */
    class LabelGroup extends pcui.Container {
        /**
         * Creates a new LabelGroup.
         * @param {Object} args The arguments. Extends the pcui.Element arguments. Any settable property can also be set through the constructor.
         * @param {Boolean} [args.nativeTooltip] If true then use the text as the HTML tooltip of the label.
         */
        constructor(args) {
            if (!args) args = {};

            super(args);

            this.class.add(CLASS_LABEL_GROUP);

            this._label = new pcui.Label({
                text: args.text || 'Label',
                nativeTooltip: args.nativeTooltip
            });
            this.append(this._label);

            this._field = args.field;
            if (this._field) {
                this.append(this._field);
            }

            this.labelAlignTop = args.labelAlignTop || false;
        }

        get label() {
            return this._label;
        }

        get field() {
            return this._field;
        }

        get text() {
            return this._label.text;
        }

        set text(value) {
            this._label.text = value;
        }

        get labelAlignTop() {
            return this.class.contains(CLASS_LABEL_TOP);
        }

        set labelAlignTop(value) {
            if (value) {
                this.class.add(CLASS_LABEL_TOP);
            } else {
                this.class.remove(CLASS_LABEL_TOP);
            }
        }
    }

    pcui.Element.register('labelgroup', LabelGroup);

    return {
        LabelGroup: LabelGroup
    };
})());


/* pcui/element/element-button.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_BUTTON = 'pcui-button';

    /**
     * @name pcui.Button
     * @classdesc Represents a button.
     * @property {String} text Gets / sets the text of the button
     * @property {String} size Gets / sets the 'size' type of the button. Can be null or 'small'.
     * @property {String} icon The CSS code for an icon for the button. e.g. E401 (notice we omit the '\' character).
     * @mixes pcui.IFocusable
     */
    class Button extends pcui.Element {
        /**
         * Creates a new Button.
         * @param {Object} args The arguments. Extends the pcui.Element constructor arguments. All settable properties can also be set through the constructor.
         * @param {Boolean} [args.unsafe] If true then the innerHTML property will be used to set the text. Otherwise textContent will be used instead.
         */
        constructor(args) {
            if (!args) args = {};

            super(document.createElement('button'), args);

            this.class.add(CLASS_BUTTON);

            this._unsafe = args.unsafe || false;

            this.text = args.text || '';
            this.size = args.size || null;
            this.icon = args.icon || '';

            this._domEventKeyDown = this._onKeyDown.bind(this);
            this.dom.addEventListener('keydown', this._onKeyDown.bind(this));
        }

        // click on enter
        // blur on escape
        _onKeyDown(evt) {
            if (evt.keyCode === 27) {
                this.blur();
            } else if (evt.keyCode === 13) {
                this._onClick(evt);
            }
        }

        _onClick(evt) {
            this.blur();
            if (this.readOnly) return;

            super._onClick(evt);
        }

        focus() {
            this.dom.focus();
        }

        blur() {
            this.dom.blur();
        }

        destroy() {
            if (this._destroyed) return;

            this.dom.removeEventListener('keydown', this._domEventKeyDown);
            super.destroy();
        }

        get text() {
            return this._text;
        }

        set text(value) {
            if (this._text === value) return;
            this._text = value;
            if (this._unsafe) {
                this.dom.innerHTML = value;
            } else {
                this.dom.textContent = value;
            }
        }

        get icon() {
            return this._icon;
        }

        set icon(value) {
            if (this._icon === value) return;
            this._icon = value;
            if (value) {
                // set data-icon attribute but first convert the value to a code point
                this.dom.setAttribute('data-icon', String.fromCodePoint(parseInt(value, 16)));
            } else {
                this.dom.removeAttribute('data-icon');
            }
        }

        get size() {
            return this._size;
        }

        set size(value) {
            if (this._size === value) return;
            if (this._size) {
                this.class.remove('pcui-' + this._size);
                this._size = null;
            }

            this._size = value;

            if (this._size) {
                this.class.add('pcui-' + this._size);
            }
        }
    }

    utils.implements(Button, pcui.IFocusable);

    pcui.Element.register('button', Button);

    return {
        Button: Button
    };
})());


/* pcui/element/element-divider.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'pcui-divider';

    class Divider extends pcui.Element {
        constructor(args) {
            if (!args) args = {};
            super(document.createElement('div'), args);

            this.class.add(CLASS_ROOT);
        }
    }

    pcui.Element.register('divider', Divider);

    return {
        Divider: Divider
    };
})());


/* pcui/element/element-asset-list.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ASSET_LIST = 'pcui-asset-list';
    const CLASS_ASSET_LIST_SELECTION_MODE = CLASS_ASSET_LIST + '-selection-mode';
    const CLASS_ASSET_LIST_EMPTY = CLASS_ASSET_LIST + '-empty';
    const CLASS_BUTTON_SELECTION_MODE = CLASS_ASSET_LIST + '-btn-selection-mode';
    const CLASS_BUTTON_ADD = CLASS_ASSET_LIST + '-btn-add';
    const CLASS_BUTTON_DONE = CLASS_ASSET_LIST + '-btn-done';
    const CLASS_BUTTON_REMOVE = CLASS_ASSET_LIST + '-btn-remove';
    const CLASS_CONTAINER_BUTTONS = CLASS_ASSET_LIST + '-buttons';
    const CLASS_CONTAINER_ASSETS = CLASS_ASSET_LIST + '-assets';
    const CLASS_ASSET_ITEM = CLASS_ASSET_LIST + '-item';
    const CLASS_ASSET_NOT_EVERYWHERE = CLASS_ASSET_LIST + '-not-everywhere';

    /**
     * @name pcui.AssetList
     * @classdesc Element that can allows selecting multiple assets.
     * @property {Boolean} renderChanges If true the input will flash when changed.
     * @extends pcui.Element
     */
    class AssetList extends pcui.Element {
        /**
         * Creates a new pcui.AssetList.
         * @param {Object} args The arguments
         * @param {ObserverList} args.assets The assets list
         * @param {String} [args.assetType] An optional filter for a specific asset type.
         * @param {Function} [args.filterFn] An optional filter function when determining which assets to show with the asset picker.
         * @param {Boolean} [args.allowDragDrop] If true then this will enable drag and drop of assets on the input
         * The function takes an asset observer as an argument and returns true or false.
         */
        constructor(args) {
            if (!args) args = {};

            const container = new pcui.Container({
                flex: true
            });

            super(container.dom, args);

            this.class.add(CLASS_ASSET_LIST, CLASS_ASSET_LIST_EMPTY);

            this._container = container;
            this._container.parent = this;

            this._assets = args.assets;
            this._assetType = args.assetType;
            this._filterFn = args.filterFn;

            // button that enables selection mode
            this._btnSelectionMode = new pcui.Button({
                class: CLASS_BUTTON_SELECTION_MODE,
                text: 'Add Assets',
                icon: 'E120'
            });
            this._btnSelectionMode.on('click', this._onClickSelectionMode.bind(this));
            this._container.append(this._btnSelectionMode);

            // label for buttons container
            this._labelAddAssets = new pcui.Label({
                text: 'Add Assets',
                hidden: true
            });
            this._container.append(this._labelAddAssets);

            // container for buttons that are visible while in selection mode
            this._containerButtons = new pcui.Container({
                class: CLASS_CONTAINER_BUTTONS,
                flex: true,
                flexDirection: 'row',
                alignItems: 'center',
                hidden: true
            });
            this._container.append(this._containerButtons);

            // button to add selected assets to list
            this._btnAdd = new pcui.Button({
                text: 'ADD SELECTION',
                enabled: false,
                class: CLASS_BUTTON_ADD,
                icon: 'E120',
                flexGrow: 1
            });
            this._btnAdd.on('click', this._onClickAdd.bind(this));
            this._containerButtons.append(this._btnAdd);

            // button to exit selection mode
            this._btnDone = new pcui.Button({
                text: 'DONE',
                class: CLASS_BUTTON_DONE,
                icon: 'E133',
                flexGrow: 1
            });
            this._btnDone.on('click', this._onClickDone.bind(this));
            this._containerButtons.append(this._btnDone);

            // search input field
            this._searchInput = new pcui.TextInput({
                hidden: true,
                placeholder: 'Filter assets',
                keyChange: true
            });
            this._searchInput.on('change', this._onSearchChange.bind(this));
            this._container.append(this._searchInput);

            // asset list
            this._containerAssets = new pcui.Container({
                class: CLASS_CONTAINER_ASSETS,
                hidden: true
            });

            // show assets and search input when assets are added
            this._containerAssets.on('append', () => {
                this._containerAssets.hidden = false;
                this._searchInput.hidden = false;
            });

            // hide assets and search input if all assets are removed
            this._containerAssets.on('remove', () => {
                this._containerAssets.hidden = this._containerAssets.dom.childNodes.length === 0;
                this._searchInput.hidden = this._containerAssets.hidden;
            });
            this._container.append(this._containerAssets);

            this._containerAssets.on('show', () => {
                this.class.remove(CLASS_ASSET_LIST_EMPTY);
            });

            this._containerAssets.on('hide', () => {
                this.class.add(CLASS_ASSET_LIST_EMPTY);
            });

            if (args.allowDragDrop) {
                this._initializeDropTarget();
            }

            this._selectedAssets = [];
            this._indexAssets = {};

            this._values = [];
            this.value = args.value || null;

            this.renderChanges = args.renderChanges || false;

            this.on('change', () => {
                if (this.renderChanges) {
                    this.flash();
                }
            });
        }

        _initializeDropTarget() {
            editor.call('drop:target', {
                ref: this,
                filter: (type, dropData) => {
                    if (dropData.id && type.startsWith('asset') &&
                        (!this._assetType || type === `asset.${this._assetType}`) &&
                        dropData.id !== this.value) {

                        const asset = this._assets.get(dropData.id);
                        if (!asset || asset.get('source')) {
                            return false;
                        }

                        // if asset already added to every observer then
                        // return false
                        if (this._indexAssets[dropData.id] && !this._indexAssets[dropData.id].element.class.contains(CLASS_ASSET_NOT_EVERYWHERE)) {
                            return false;
                        }

                        return true;
                    }

                    return false;
                },
                drop: (type, dropData) => {
                    this._addAssets([dropData.id]);
                }
            });
        }

        _onClickSelectionMode() {
            this._startSelectionMode();
        }

        // Add selected assets to the list
        _onClickAdd() {
            if (!this._selectedAssets.length) return;

            this._addAssets(this._selectedAssets);
            this._selectedAssets.length = 0;
        }

        _addAssets(assets) {
            assets.forEach(assetId => {
                const entry = this._indexAssets[assetId] || this._createAssetItem(assetId);
                entry.count = this._values.length;
                entry.element.class.remove(CLASS_ASSET_NOT_EVERYWHERE);
                if (!entry.element.parent) {
                    this._containerAssets.append(entry.element);
                }

                // add to all values
                this._values.forEach(array => {
                    if (!array) return;
                    if (array.indexOf(assetId) === -1) {
                        array.push(assetId);
                    }
                });
            });

            this.emit('change', this.value);

            if (this._binding) {
                this._binding.addValues(assets.slice());
            }
        }

        // End selection mode
        _onClickDone() {
            this._endSelectionMode();
        }

        // Opens asset picker and gets element into selection mode
        _startSelectionMode() {
            
            this.class.add(CLASS_ASSET_LIST_SELECTION_MODE);

            this._btnSelectionMode.hidden = true;
            this._labelAddAssets.hidden = false;
            this._containerButtons.hidden = false;

            // clear filter
            this._searchInput.value = '';

            // pick assets and filter them
            this._pickAssets((assets) => {
                this._selectedAssets = assets.filter(asset => {
                    if (this._filterFn) {
                        return this._filterFn(asset);
                    }

                    // do not allow picking legacy scripts
                    if (asset.get('type') === 'script') {
                        const settings = editor.call('settings:project');
                        if (settings && settings.get('useLegacyScripts')) {
                            return false;
                        }
                    }

                    return true;
                }).map(a => a.get('id'));

                this._btnAdd.enabled = this._selectedAssets.length > 0;
            });
        }

        _endSelectionMode() {
            editor.call('picker:asset:close');

            this._btnSelectionMode.hidden = false;
            this._labelAddAssets.hidden = true;
            this._containerButtons.hidden = true;

            this.class.remove(CLASS_ASSET_LIST_SELECTION_MODE);
        }

        // Use search filter to filter which assets are visible or hidden
        _onSearchChange(filter) {
            if (! filter) {
                for (const id in this._indexAssets) {
                    this._indexAssets[id].element.hidden = false;
                }
                return;
            }

            const items = [];
            for (const id in this._indexAssets) {
                items.push([this._indexAssets[id].label.value, id]);
            }

            // TODO: use a class here instead of a global seach:items
            const results = editor.call('search:items', items, filter);
            for (const id in this._indexAssets) {
                if (results.indexOf(id) === -1) {
                    this._indexAssets[id].element.hidden = true;
                } else {
                    this._indexAssets[id].element.hidden = false;
                }
            }

        }

        // Opens asset picker and allows asset selection
        _pickAssets(callback) {
            editor.call('picker:asset', {
                type: this._assetType || '*',
                multi: true
            });

            let evt = editor.on('picker:assets', callback);

            editor.once('picker:asset:close', () => {
                evt.unbind();
                evt = null;
                this._endSelectionMode();
            });
        }

        // Selects the specified asset
        _selectAsset(asset) {
            editor.call('selector:set', 'asset', [asset]);

            let folder = null;
            if (asset.get('type') === 'script') {
                const settings = editor.call('settings:project');
                if (settings && settings.get('useLegacyScripts')) {
                    folder = 'scripts';
                }
            }

            if (!folder) {
                const path = asset.get('path');
                if (path.length) {
                    folder = this._assets.get(path[path.length - 1]);
                }
            }

            editor.call('assets:panel:currentFolder', folder);
        }

        // Creates a new element for the specified asset id
        _createAssetItem(assetId) {
            const asset = this._assets.get(assetId);

            const container = new pcui.Container({
                flex: true,
                flexDirection: 'row',
                alignItems: 'center',
                class: CLASS_ASSET_ITEM
            });

            container.dom.setAttribute('data-asset-id', assetId);

            const type = asset ? asset.get('type') : this._assetType;
            // add asset type class
            container.class.add(CLASS_ASSET_ITEM + '-' + type);

            if (asset) {
                // select asset on click
                container.on('click', () => {
                    this._selectAsset(asset);
                });
            }

            // clean the index when the element is destroyed
            container.on('destroy', () => {
                delete this._indexAssets[assetId];
            });

            // asset name - bind it to the asset name
            const label = new pcui.Label({
                text: asset ? asset.get('name') : 'Missing',
                binding: new pcui.BindingObserversToElement()
            });
            if (asset) {
                label.link(asset, 'name');
            }
            container.append(label);

            // button to remove asset from list
            const btnRemove = new pcui.Button({
                icon: 'E289',
                size: 'small',
                class: CLASS_BUTTON_REMOVE
            });
            btnRemove.on('click', () => {
                this._removeAssetItem(assetId);
            });
            container.append(btnRemove);

            // cache the container with some metadata
            const entry = {
                element: container, // the container
                label: label, // the label element used to get the asset name
                count: 0 // the number of observers that have this asset
            };

            this._indexAssets[assetId] = entry;

            return entry;
        }

        _removeAssetItem(assetId) {
            const entry = this._indexAssets[assetId];
            if (!entry) return;
            entry.element.destroy();

            // remove from all values
            this._values.forEach(array => {
                if (!array) return;
                const idx = array.indexOf(assetId);
                if (idx !== -1) {
                    array.splice(idx, 1);
                }
            });

            this.emit('change', this.value);

            if (this._binding) {
                this._binding.removeValue(assetId);
            }
        }

        _updateValues(values) {
            this._values = values;

            // zero counts of all existing asset items
            for (const key in this._indexAssets) {
                this._indexAssets[key].count = 0;
            }

            let prevElement = null;
            const appendedIndex = {};

            // for every array in values add all
            // assets to the list
            values.forEach(array => {
                if (!array) return;
                array.forEach(assetId => {
                    const entry = this._indexAssets[assetId] || this._createAssetItem(assetId);
                    entry.count++;
                    if (!appendedIndex[assetId]) {
                        this._containerAssets.appendAfter(entry.element, prevElement);
                        prevElement = entry.element;
                        appendedIndex[assetId] = true;
                    }
                });
            });

            for (const key in this._indexAssets) {
                if (this._indexAssets[key].count === 0) {
                    // delete items that are no longer in the values
                    this._indexAssets[key].element.destroy();
                } else if (this._indexAssets[key].count < values.length) {
                    // this asset is not used by all observers so add special class to it
                    this._indexAssets[key].element.class.add(CLASS_ASSET_NOT_EVERYWHERE);
                } else {
                    // this asset is used by all observers so remove special class
                    this._indexAssets[key].element.class.remove(CLASS_ASSET_NOT_EVERYWHERE);
                }
            }

            const newValue = this.value;

            this.emit('change', newValue);

            return newValue;
        }

        get value() {
            // create value from the list of assets we are currently displaying,
            // this is a lossy concept as it doesn't capture whether an asset id is only
            // in some observers
            const result = [];
            let node = this._containerAssets.dom.childNodes[0];
            while (node) {
                const assetId = node.getAttribute('data-asset-id');
                if (assetId) {
                    result.push(assetId);
                }

                node = node.nextSibling;
            }

            return result;
        }

        set value(value) {
            if (!value) {
                value = null;
            }

            const current = this.value;
            if (current === value) return;
            if (Array.isArray(value) && value.equals(current)) return;

            // set values property - try to use the existing array length of values
            value = this._updateValues(new Array(this._values.length || 1).fill(value));

            if (this._binding) {
                this._binding.setValue(value);
            }
        }

        set values(values) {
            if (this._values.equals(values)) return;
            this._updateValues(values);
        }

        // Returns an array of {assetId, element} entries
        // for each animation asset and list item representing it
        get listItems() {
            const result = [];
            for (const assetId in this._indexAssets) {
                result.push({
                    assetId: assetId,
                    element: this._indexAssets[assetId].element
                });
            }

            return result;
        }
    }

    utils.implements(AssetList, pcui.IBindable);

    pcui.Element.register('assets', AssetList, { allowDragDrop: true, renderChanges: true });

    return {
        AssetList: AssetList
    };
})());


/* pcui/element/element-array-input.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ARRAY_INPUT = 'pcui-array-input';
    const CLASS_ARRAY_EMPTY = 'pcui-array-empty';
    const CLASS_ARRAY_SIZE = CLASS_ARRAY_INPUT + '-size';
    const CLASS_ARRAY_CONTAINER = CLASS_ARRAY_INPUT + '-items';
    const CLASS_ARRAY_ELEMENT = CLASS_ARRAY_INPUT + '-item';
    const CLASS_ARRAY_DELETE = CLASS_ARRAY_ELEMENT + '-delete';

    var DEFAULTS = {
        boolean: false,
        number: 0,
        string: '',
        asset: null,
        entity: null,
        rgb: [1, 1, 1],
        rgba: [1, 1, 1, 1],
        vec2: [0, 0],
        vec3: [0, 0, 0],
        vec4: [0, 0, 0, 0],
        curveset: { keys: [0, 0], type: 2 }
    };

    /**
     * @name pcui.ArrayInput
     * @classdesc Element that allows editing an array of values.
     * @property {Boolean} renderChanges If true the input will flash when changed.
     * @extends pcui.Element
     */
    class ArrayInput extends pcui.Element {
        /**
         * Creates a new pcui.ArrayInput.
         * @param {Object} args The arguments.
         * @param {String} [args.type] The type of values that the array can hold.
         * Can be one of 'boolean', 'number', 'string', 'asset', 'entity', 'rgb',
         * 'vec2', 'vec3', 'vec4', 'curveset'.
         * @param {Object} [args.elementArgs] Arguments for each array Element.
         */
        constructor(args) {
            args = Object.assign({}, args);

            // remove binding because we want to set it later
            const binding = args.binding;
            delete args.binding;

            const container = new pcui.Container({
                flex: true
            });

            super(container.dom, args);

            this._container = container;
            this._container.parent = this;

            this.class.add(CLASS_ARRAY_INPUT, CLASS_ARRAY_EMPTY);

            this._sizeInput = new pcui.NumericInput({
                class: [CLASS_ARRAY_SIZE],
                placeholder: 'Array Size',
                value: 0
            });
            this._sizeInput.on('change', this._onSizeChange.bind(this));
            this._sizeInput.on('focus', this._onFocus.bind(this));
            this._sizeInput.on('blur', this._onBlur.bind(this));
            this._suspendSizeChangeEvt = false;
            this._container.append(this._sizeInput);

            this._containerArray = new pcui.Container({
                class: CLASS_ARRAY_CONTAINER,
                hidden: true
            });
            this._containerArray.on('append', () => {
                this._containerArray.hidden = false;
            });
            this._containerArray.on('remove', () => {
                this._containerArray.hidden = this._arrayElements.length == 0;
            });
            this._container.append(this._containerArray);
            this._suspendArrayElementEvts = false;
            this._arrayElementChangeTimeout = null;

            let valueType = args.elementArgs && args.elementArgs.type || args.type;
            if (!DEFAULTS.hasOwnProperty(valueType)) {
                valueType = 'string';
            }

            this._valueType = valueType;
            this._elementType = args.type;
            this._elementArgs = args.elementArgs || args;

            this._arrayElements = [];

            // set binding now
            this.binding = binding;

            this._values = [];

            if (args.value) {
                this.value = args.value;
            }

            this.renderChanges = args.renderChanges || false;
        }

        _onSizeChange(size) {
            // if size is explicitely 0 then add empty class
            // size can also be null with multi-select so do not
            // check just !size
            if (size === 0) {
                this.class.add(CLASS_ARRAY_EMPTY);
            } else {
                this.class.remove(CLASS_ARRAY_EMPTY);
            }

            if (size === null) return;
            if (this._suspendSizeChangeEvt) return;

            const values = this._values.map(array => {
                if (!array) {
                    array = new Array(size);
                    for (let i = 0; i < size; i++) {
                        array[i] = utils.deepCopy(DEFAULTS[this._valueType]);
                    }
                } else if (array.length < size) {
                    const newArray = new Array(size - array.length);
                    for (let i = 0; i < newArray.length; i++) {
                        newArray[i] = utils.deepCopy(DEFAULTS[this._valueType]);
                    }
                    array = array.concat(newArray);
                } else {
                    const newArray = new Array(size);
                    for (let i = 0; i < size; i++) {
                        newArray[i] = utils.deepCopy(array[i]);
                    }
                    array = newArray;
                }

                return array;
            });

            if (!values.length) {
                const array = new Array(size);
                for (let i = 0; i < size; i++) {
                    array[i] = utils.deepCopy(DEFAULTS[this._valueType]);
                }
                values.push(array);
            }

            this._updateValues(values, true);
        }

        _onFocus() {
            this.emit('focus');
        }

        _onBlur() {
            this.emit('blur');
        }

        _createArrayElement() {
            const args = Object.assign({
                binding: this._binding && this._binding.clone()
            }, this._elementArgs);

            // set renderChanges after value is set
            // to prevent flashing on initial value set
            args.renderChanges = false;

            const container = new pcui.Container({
                flex: true,
                flexDirection: 'row',
                alignItems: 'center',
                class: [CLASS_ARRAY_ELEMENT, CLASS_ARRAY_ELEMENT + '-' + this._elementType]
            });

            const element = pcui.Element.create(this._elementType, args);
            container.append(element);

            element.renderChanges = this.renderChanges;

            const entry = {
                container: container,
                element: element
            };

            this._arrayElements.push(entry);

            const btnDelete = new pcui.Button({
                icon: 'E289',
                size: 'small',
                class: CLASS_ARRAY_DELETE,
                tabIndex: -1 // skip buttons on tab
            });
            btnDelete.on('click', () => {
                this._removeArrayElement(entry);
            });

            container.append(btnDelete);

            element.on('change', (value) => {
                this._onArrayElementChange(entry, value);
            });

            this._containerArray.append(container);

            return entry;
        }

        _removeArrayElement(entry) {
            const index = this._arrayElements.indexOf(entry);
            if (index === -1) return;

            // remove row from every array in values
            const values = this._values.map(array => {
                if (!array) return null;
                array.splice(index, 1);
                return array;
            });

            this._updateValues(values, true);
        }

        _onArrayElementChange(entry, value) {
            if (this._suspendArrayElementEvts) return;

            const index = this._arrayElements.indexOf(entry);
            if (index === -1) return;

            // Set the value to the same row of every array in values.
            this._values.forEach(array => {
                if (array && array.length > index) {
                    array[index] = value;
                }
            });

            // use a timeout here because when our values change they will
            // first emit change events on each array element. However since the
            // whole array changed we are going to fire a 'change' event later from
            // our '_updateValues' function. We only want to emit a 'change' event
            // here when only the array element changed value and not the whole array so
            // wait a bit and fire the change event later otherwise the _updateValues function
            // will cancel this timeout and fire a change event for the whole array instead
            this._arrayElementChangeTimeout = setTimeout(() => {
                this._arrayElementChangeTimeout = null;
                this.emit('change', this.value);
            });
        }

        _linkArrayElement(element, index) {
            const observers = this._binding.observers;
            const paths = this._binding.paths;
            const useSinglePath = paths.length === 1 || observers.length !== paths.length;
            element.unlink();
            element.value = null;

            if (useSinglePath) {
                element.link(observers, paths[0] + `.${index}`);
            } else {
                element.link(observers, paths.map(path => `${path}.${index}`));
            }
        }

        _updateValues(values, applyToBinding) {
            this._values = values || [];

            this._suspendArrayElementEvts = true;
            this._suspendSizeChangeEvt = true;

            // apply values to the binding
            if (applyToBinding && this._binding) {
                this._binding.setValues(values);
            }

            // each row of this array holds
            // all the values for that row
            const valuesPerRow = [];
            // holds the length of each array
            const arrayLengths = [];

            values.forEach(array => {
                if (!array) return;

                arrayLengths.push(array.length);

                array.forEach((item, i) => {
                    if (!valuesPerRow[i]) {
                        valuesPerRow[i] = [];
                    }

                    valuesPerRow[i].push(item);
                });
            });

            let lastElementIndex = -1;
            for (let i = 0; i < valuesPerRow.length; i++) {
                // if the number of values on this row does not match
                // the number of arrays then stop adding rows
                if (valuesPerRow[i].length !== values.length) {
                    break;
                }

                // create row if it doesn't exist
                if (!this._arrayElements[i]) {
                    this._createArrayElement();
                }

                // bind to observers for that row or just display the values
                if (this._binding && this._binding.observers) {
                    this._linkArrayElement(this._arrayElements[i].element, i);
                } else {
                    if (valuesPerRow[i].length > 1) {
                        this._arrayElements[i].element.values = valuesPerRow[i];
                    } else {
                        this._arrayElements[i].element.value = valuesPerRow[i][0];
                    }
                }

                lastElementIndex = i;
            }

            // destory elements that are no longer in our values
            for (let i = this._arrayElements.length - 1; i > lastElementIndex; i--) {
                this._arrayElements[i].container.destroy();
                this._arrayElements.splice(i, 1);
            }


            this._sizeInput.values = arrayLengths;

            this._suspendSizeChangeEvt = false;
            this._suspendArrayElementEvts = false;

            if (this._arrayElementChangeTimeout) {
                clearTimeout(this._arrayElementChangeTimeout);
                this._arrayElementChangeTimeout = null;
            }

            this.emit('change', this.value);
        }

        focus() {
            this._sizeInput.focus();
        }

        blur() {
            this._sizeInput.blur();
        }

        destroy() {
            if (this._destroyed) return;
            this._arrayElements.length = 0;
            super.destroy();
        }

        get binding() {
            return super.binding;
        }

        // override binding setter to create
        // the same type of binding on each array element too
        set binding(value) {
            super.binding = value;

            this._arrayElements.forEach(entry => {
                entry.element.binding = value ? value.clone() : null;
            });
        }

        get value() {
            // construct value from values of array elements
            return this._arrayElements.map(entry => entry.element.value);
        }

        set value(value) {
            const current = this.value || [];
            if (current.equals(value)) return;

            // update values and binding
            this._updateValues(new Array(this._values.length || 1).fill(value), true);
        }

        set values(values) {
            if (this._values.equals(values)) return;
            // update values but do not update binding
            this._updateValues(values, false);
        }

        get renderChanges() {
            return this._renderChanges;
        }

        set renderChanges(value) {
            this._renderChanges = value;
            this._arrayElements.forEach(entry => {
                entry.element.renderChanges = value;
            });
        }
    }

    utils.implements(ArrayInput, pcui.IBindable);
    utils.implements(ArrayInput, pcui.IFocusable);

    for (const type in DEFAULTS) {
        pcui.Element.register(`array:${type}`, ArrayInput, { type: type, renderChanges: true });
    }
    pcui.Element.register('array:select', ArrayInput, { type: 'select', renderChanges: true });

    return {
        ArrayInput: ArrayInput
    };
})());


/* pcui/element/element-select-input.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_SELECT_INPUT = 'pcui-select-input';
    const CLASS_SELECT_INPUT_CONTAINER_VALUE = CLASS_SELECT_INPUT + '-container-value';
    const CLASS_MULTI_SELECT = CLASS_SELECT_INPUT + '-multi';
    const CLASS_ALLOW_INPUT = 'pcui-select-input-allow-input';
    const CLASS_VALUE = CLASS_SELECT_INPUT + '-value';
    const CLASS_ICON = CLASS_SELECT_INPUT + '-icon';
    const CLASS_INPUT = CLASS_SELECT_INPUT + '-textinput';
    const CLASS_LIST = CLASS_SELECT_INPUT + '-list';
    const CLASS_TAGS = CLASS_SELECT_INPUT + '-tags';
    const CLASS_TAGS_EMPTY = CLASS_SELECT_INPUT + '-tags-empty';
    const CLASS_TAG = CLASS_SELECT_INPUT + '-tag';
    const CLASS_TAG_NOT_EVERYWHERE = CLASS_SELECT_INPUT + '-tag-not-everywhere';
    const CLASS_SHADOW = CLASS_SELECT_INPUT + '-shadow';
    const CLASS_FIT_HEIGHT = CLASS_SELECT_INPUT + '-fit-height';
    const CLASS_SELECTED = 'pcui-selected';
    const CLASS_HIGHLIGHTED = CLASS_SELECT_INPUT + '-label-highlighted';
    const CLASS_CREATE_NEW = CLASS_SELECT_INPUT + '-create-new';
    const CLASS_OPEN = 'pcui-open';

    const DEFAULT_BOTTOM_OFFSET = 25;


    class SelectInput extends pcui.Element {
        constructor(args) {
            if (!args) args = {};

            // main container
            const container = new pcui.Container();
            super(container.dom, args);
            this._container = container;
            this._container.parent = this;

            this.class.add(CLASS_SELECT_INPUT);

            this._containerValue = new pcui.Container({
                class: CLASS_SELECT_INPUT_CONTAINER_VALUE
            });
            this._container.append(this._containerValue);

            // focus / hover shadow element
            this._domShadow = document.createElement('div');
            this._domShadow.classList.add(CLASS_SHADOW);
            this._containerValue.append(this._domShadow);

            this._allowInput = args.allowInput || false;
            if (this._allowInput) {
                this.class.add(CLASS_ALLOW_INPUT);
            }

            this._allowCreate = args.allowCreate || false;
            this._createFn = args.createFn;
            this._createLabelText = args.createLabelText || null;

            // displays current value
            this._labelValue = new pcui.Label({
                class: CLASS_VALUE,
                tabIndex: 0
            });
            this._labelValue.on('click', this._onValueClick.bind(this));
            this._containerValue.append(this._labelValue);

            this._timeoutLabelValueTabIndex = null;

            // dropdown icon
            this._labelIcon = new pcui.Label({
                class: CLASS_ICON,
                hidden: args.allowInput && args.multiSelect
            });
            this._containerValue.append(this._labelIcon);

            // input for searching or adding new entries
            this._input = new pcui.TextInput({
                class: CLASS_INPUT,
                blurOnEnter: false,
                keyChange: true
            });
            this._containerValue.append(this._input);

            this._lastInputValue = '';
            this._suspendInputChange = false;
            this._input.on('change', this._onInputChange.bind(this));
            this._input.on('keydown', this._onInputKeyDown.bind(this));
            this._input.on('focus', this._onFocus.bind(this));
            this._input.on('blur', this._onBlur.bind(this));

            if (args.placeholder) {
                this.placeholder = args.placeholder;
            }

            // dropdown list
            this._containerOptions = new pcui.Container({
                class: CLASS_LIST,
                hidden: true
            });
            this._containerValue.append(this._containerOptions);

            // tags container
            this._containerTags = new pcui.Container({
                class: CLASS_TAGS,
                flex: true,
                flexDirection: 'row',
                hidden: true
            });
            this._container.append(this._containerTags);

            if (args.multiSelect) {
                this.class.add(CLASS_MULTI_SELECT);
                this._containerTags.hidden = false;
            }

            // events
            this._domEvtKeyDown = this._onKeyDown.bind(this);
            this._domEvtFocus = this._onFocus.bind(this);
            this._domEvtBlur = this._onBlur.bind(this);
            this._domEvtMouseDown = this._onMouseDown.bind(this);
            this._domEvtWindowMouseDown = this._onWindowMouseDown.bind(this);

            this._labelValue.dom.addEventListener('keydown', this._domEvtKeyDown);
            this._labelValue.dom.addEventListener('focus', this._domEvtFocus);
            this._labelValue.dom.addEventListener('blur', this._domEvtBlur);
            this._labelValue.dom.addEventListener('mousedown', this._domEvtMouseDown);

            this.on('hide', this.close.bind(this));

            this._type = args.type || 'string';
            

            this._optionsIndex = {};
            this._labelsIndex = {};
            this._labelHighlighted = null;
            this.invalidOptions = args.invalidOptions;
            this.options = args.options || [];
            this._optionsFn = args.optionsFn;

            this._allowNull = args.allowNull || false;

            this._values = null;

            if (args.value !== undefined) {
                this.value = args.value;
            } else if (args.defaultValue) {
                this.value = args.defaultValue;
            } else {
                this.value = null;
            }

            this.renderChanges = args.renderChanges || false;

            this.on('change', () => {
                this._updateInputFieldsVisibility();

                if (this.renderChanges && !this.multiSelect) {
                    this._labelValue.flash();
                }
            });

            this._updateInputFieldsVisibility(false);
        }

        _initializeCreateLabel() {
            const container = new pcui.Container({
                class: CLASS_CREATE_NEW,
                flex: true,
                flexDirection: 'row'
            });

            const label = new pcui.Label({
                text: this._input.value,
                tabIndex: -1
            });
            container.append(label);

            let evtChange = this._input.on('change', value => {
                // check if label is destroyed
                // during change event
                if (label.destroyed) return;
                label.text = value;
                if (this.invalidOptions && this.invalidOptions.indexOf(value) !== -1) {
                    if (!container.hidden) {
                        container.hidden = true;
                        this._resizeShadow();
                    }
                } else {
                    if (container.hidden) {
                        container.hidden = false;
                        this._resizeShadow();
                    }
                }
            });

            container.on('click', (e) => {
                e.stopPropagation();

                const text = label.text;

                this.focus();
                this.close();

                if (this._createFn) {
                    this._createFn(text);
                } else if (text) {
                    this._onSelectValue(text);
                }
            });

            label.on('destroy', () => {
                evtChange.unbind();
                evtChange = null;
            });

            const labelCreateText = new pcui.Label({
                text: this._createLabelText
            });
            container.append(labelCreateText);

            this._containerOptions.append(container);
        }

        _convertSingleValue(value) {
            if (value === null && this._allowNull) return value;

            if (this._type === 'string') {
                if (!value) {
                    value = '';
                } else {
                    value = value.toString();
                }
            } else if (this._type === 'number') {
                if (!value) {
                    value = 0;
                } else {
                    value = parseInt(value, 10);
                }
            } else if (this._type === 'boolean') {
                return !!value;
            }

            return value;
        }

        _convertValue(value) {
            if (value === null && this._allowNull) return value;

            if (this.multiSelect) {
                if (!Array.isArray(value)) return value;

                return value.map(val => this._convertSingleValue(val));
            }

            return this._convertSingleValue(value);
        }

        // toggle dropdown list
        _onValueClick() {
            if (!this.enabled || this.readOnly) return;

            this.toggle();
        }

        // Update our value with the specified selected option
        _onSelectValue(value) {
            value = this._convertSingleValue(value);

            if (!this.multiSelect) {
                this.value = value;
                return;
            }

            if (this._values) {
                let dirty = false;
                this._values.forEach(arr => {
                    if (!arr) {
                        arr = [value];
                        dirty = true;
                    } else {
                        if (arr.indexOf(value) === -1) {
                            arr.push(value);
                            dirty = true;
                        }
                    }
                });

                if (dirty) {
                    this._onMultipleValuesChange(this._values);

                    this.emit('change', this.value);

                    if (this._binding) {
                        this._binding.addValues([value]);
                    }
                }
            } else {
                if (!this._value || !Array.isArray(this._value)) {
                    this.value = [value];
                } else {
                    if (this._value.indexOf(value) === -1) {
                        this._value.push(value);

                        this._addTag(value);

                        this.emit('change', this.value);

                        if (this._binding) {
                            this._binding.addValues([value]);
                        }
                    }
                }
            }
        }

        _highlightLabel(label) {
            if (this._labelHighlighted === label) return;

            if (this._labelHighlighted) {
                this._labelHighlighted.class.remove(CLASS_HIGHLIGHTED);
            }

            this._labelHighlighted = label;

            if (this._labelHighlighted) {
                this._labelHighlighted.class.add(CLASS_HIGHLIGHTED);

                // scroll into view if necessary
                const labelTop = this._labelHighlighted.dom.offsetTop;
                const scrollTop = this._containerOptions.dom.scrollTop;
                if (labelTop < scrollTop) {
                    this._containerOptions.dom.scrollTop = labelTop;
                } else if (labelTop + this._labelHighlighted.height > this._containerOptions.height + scrollTop) {
                    this._containerOptions.dom.scrollTop = labelTop + this._labelHighlighted.height - this._containerOptions.height;
                }
            }
        }

        // when the value is changed show the correct title
        _onValueChange(value) {
            if (!this.multiSelect) {
                this._labelValue.value = this._optionsIndex[value] || '';

                value = '' + value;
                for (var key in this._labelsIndex) {
                    if (key === value) {
                        this._labelsIndex[key].class.add(CLASS_SELECTED);
                    } else {
                        this._labelsIndex[key].class.remove(CLASS_SELECTED);
                    }
                }
            } else {
                this._labelValue.value = '';
                this._containerTags.clear();
                this._containerTags.class.add(CLASS_TAGS_EMPTY);

                if (value && Array.isArray(value)) {
                    value.forEach(val => {
                        this._addTag(val);
                        if (this._labelsIndex[val]) {
                            this._labelsIndex[val].class.add(CLASS_SELECTED);
                        }
                    });

                    for (const key in this._labelsIndex) {
                        if (value.indexOf(this._convertSingleValue(key)) !== -1) {
                            this._labelsIndex[key].class.add(CLASS_SELECTED);
                        } else {
                            this._labelsIndex[key].class.remove(CLASS_SELECTED);
                        }
                    }
                }
            }
        }

        _onMultipleValuesChange(values) {
            this._labelValue.value = '';
            this._containerTags.clear();
            this._containerTags.class.add(CLASS_TAGS_EMPTY);

            const tags = {};
            const valueCounts = {};
            values.forEach(arr => {
                if (!arr) return;
                arr.forEach(val => {
                    if (!tags[val]) {
                        tags[val] = this._addTag(val);
                        valueCounts[val] = 1;
                    } else {
                        valueCounts[val]++;
                    }
                });
            });

            // add special class to tags that do not exist everywhere
            for (var val in valueCounts) {
                if (valueCounts[val] !== values.length) {
                    tags[val].class.add(CLASS_TAG_NOT_EVERYWHERE);
                    if (this._labelsIndex[val]) {
                        this._labelsIndex[val].class.remove(CLASS_SELECTED);
                    }
                }
            }
        }

        _addTag(value) {
            const container = new pcui.Container({
                flex: true,
                flexDirection: 'row',
                class: CLASS_TAG
            });

            container.append(new pcui.Label({
                text: this._optionsIndex[value] || value
            }));

            const btnRemove = new pcui.Button({
                size: 'small',
                icon: 'E132',
                tabIndex: -1
            });

            container.append(btnRemove);

            btnRemove.on('click', () => this._removeTag(container, value));

            this._containerTags.append(container);
            this._containerTags.class.remove(CLASS_TAGS_EMPTY);

            if (this._labelsIndex[value]) {
                this._labelsIndex[value].class.add(CLASS_SELECTED);
            }

            container.value = value;

            return container;
        }

        _removeTag(tagElement, value) {
            tagElement.destroy();

            if (this._labelsIndex[value]) {
                this._labelsIndex[value].class.remove(CLASS_SELECTED);
            }

            if (this._values) {
                this._values.forEach(arr => {
                    if (!arr) return;
                    const idx = arr.indexOf(value);
                    if (idx !== -1) {
                        arr.splice(idx, 1);
                    }
                });
            } else if (this._value && Array.isArray(this._value)) {
                const idx = this._value.indexOf(value);
                if (idx !== -1) {
                    this._value.splice(idx, 1);
                }
            }

            this.emit('change', this.value);

            if (this._binding) {
                this._binding.removeValues([value]);
            }
        }

        _onInputChange(value) {
            if (this._suspendInputChange) return;

            if (this._lastInputValue === value) return;

            this.open();

            this._lastInputValue = value;

            this._filterOptions(value);
        }

        _filterOptions(filter) {
            const searchIndex = {};

            if (filter) {
                const searchItems = this.options.map(option => {
                    return [option.t, option.v];
                });

                const searchResults = editor.call('search:items', searchItems, filter);
                searchResults.forEach(result => {
                    searchIndex[result] = true;
                });
            }

            let highlighted = false;
            this._containerOptions.forEachChild(label => {
                label.hidden = !!filter && !searchIndex[label._optionValue] && !label.class.contains(CLASS_CREATE_NEW);
                if (!highlighted && !label.hidden) {
                    this._highlightLabel(label);
                    highlighted = true;
                }
            });

            this._resizeShadow();
        }

        _onInputKeyDown(evt) {
            if (evt.keyCode === 13 && this.enabled && !this.readOnly) {
                evt.stopPropagation();
                evt.preventDefault();

                // on enter
                let value;

                if (this._labelHighlighted && this._labelHighlighted._optionValue !== undefined) {
                    value = this._labelHighlighted._optionValue;
                } else {
                    value = this._input.value;
                }

                if (value !== undefined) {
                    this.focus();
                    this.close();

                    if (this._optionsIndex[value]) {
                        this._onSelectValue(value);
                    } else if (this._allowCreate) {
                        if (this._createFn) {
                            this._createFn(value);
                        } else {
                            this._onSelectValue(value);
                        }
                    }

                    return;
                }
            }

            this._onKeyDown(evt);
        }

        _onWindowMouseDown(evt) {
            if (this.dom.contains(evt.target)) return;
            this.close();
        }

        _onKeyDown(evt) {
            // close options on ESC and blur
            if (evt.keyCode === 27) {
                this.close();
                return;
            }

            // handle tab
            if (evt.keyCode === 9) {
                this.close();
                return;
            }

            if (!this.enabled || this.readOnly) return;

            if (evt.keyCode === 13 && !this._allowInput) {
                if (this._labelHighlighted && this._labelHighlighted._optionValue !== undefined) {
                    this._onSelectValue(this._labelHighlighted._optionValue);
                    this.close();
                }

                return;
            }

            if ([38, 40].indexOf(evt.keyCode) === -1) {
                return;
            }

            evt.stopPropagation();
            evt.preventDefault();

            if ((this._allowInput || this.multiSelect) && this._containerOptions.hidden) {
                this.open();
                return;
            }

            if (this._containerOptions.hidden) {
                if (!this._options.length) return;

                let index = -1;
                for (let i = 0; i < this._options.length; i++) {
                    if (this._options[i].v === this.value) {
                        index = i;
                        break;
                    }
                }

                if (evt.keyCode === 38) {
                    index--;
                } else if (evt.keyCode === 40) {
                    index++;
                }

                if (index >= 0 && index < this._options.length) {
                    this._onSelectValue(this._options[index].v);
                }
            } else {
                if (!this._containerOptions.dom.childNodes.length) return;

                if (!this._labelHighlighted) {
                    this._highlightLabel(this._containerOptions.dom.childNodes[0].ui);
                } else {
                    let highlightedLabelDom = this._labelHighlighted.dom;
                    do {
                        if (evt.keyCode === 38) {
                            highlightedLabelDom = highlightedLabelDom.previousSibling;
                        } else if (evt.keyCode === 40) {
                            highlightedLabelDom = highlightedLabelDom.nextSibling;
                        }
                    } while (highlightedLabelDom && highlightedLabelDom.ui.hidden);

                    if (highlightedLabelDom) {
                        this._highlightLabel(highlightedLabelDom.ui);
                    }
                }
            }
        }

        _resizeShadow() {
            this._domShadow.style.height = (this._containerValue.height + this._containerOptions.height) + 'px';
        }

        _onMouseDown() {
            if (!this._allowInput) {
                this.focus();
            }
        }

        _onFocus() {
            this.class.add(pcui.CLASS_FOCUS);
            this.emit('focus');
            if (!this._input.hidden) {
                this.open();
            }
        }

        _onBlur() {
            this.class.remove(pcui.CLASS_FOCUS);
            this.emit('blur');
        }

        _updateInputFieldsVisibility(focused) {
            let showInput = false;
            let focusInput = false;

            if (this._allowInput) {
                if (focused) {
                    showInput = true;
                    focusInput = true;
                } else {
                    showInput = this.multiSelect || !this._labelsIndex[this.value];
                }
            }

            this._labelValue.hidden = showInput;
            this._labelIcon.hidden = showInput;
            this._input.hidden = !showInput;

            if (focusInput) {
                this._input.focus();
            }

            if (!this._labelValue.hidden) {
                // prevent label from being focused
                // right after input gets unfocused
                this._labelValue.tabIndex = -1;

                if (!this._timeoutLabelValueTabIndex) {
                    this._timeoutLabelValueTabIndex = requestAnimationFrame(() => {
                        this._timeoutLabelValueTabIndex = null;
                        this._labelValue.tabIndex = 0;
                    });
                }
            }

        }

        focus() {
            if (this._input.hidden) {
                this._labelValue.dom.focus();
            } else {
                this._input.focus();
            }
        }

        blur() {
            if (this._allowInput) {
                this._input.blur();
            } else {
                this._labelValue.dom.blur();
            }
        }

        /**
         * @name pcui.SelectInput#open
         * @description Opens the dropdown menu
         */
        open() {
            if (!this._containerOptions.hidden || !this.enabled || this.readOnly) return;

            this._updateInputFieldsVisibility(true);

            // auto-update options if necessary
            if (this._optionsFn) {
                this.options = this._optionsFn();
            }

            if (this._containerOptions.dom.childNodes.length === 0) return;

            // highlight label that displays current value
            this._containerOptions.forEachChild(label => {
                label.hidden = false;
                if (label._optionValue === this.value) {
                    this._highlightLabel(label);
                }
            });
            if (!this._labelHighlighted) {
                this._highlightLabel(this._containerOptions.dom.childNodes[0].ui);
            }

            // show options
            this._containerOptions.hidden = false;
            this.class.add(CLASS_OPEN);

            // register keydown on entire window
            window.addEventListener('keydown', this._domEvtKeyDown);
            // register mousedown on entire window
            window.addEventListener('mousedown', this._domEvtWindowMouseDown);

            // resize the outer shadow to fit the element and the dropdown list
            // we need this because the dropdown list is position: absolute
            this._resizeShadow();

            // if the dropdown list goes below the window show it above the field
            const startField = this._allowInput ? this._input.dom : this._labelValue.dom;
            const rect = startField.getBoundingClientRect();
            if (rect.bottom + this._containerOptions.height + DEFAULT_BOTTOM_OFFSET >= window.innerHeight) {
                this.class.add(CLASS_FIT_HEIGHT);
            } else {
                this.class.remove(CLASS_FIT_HEIGHT);
            }
        }

        /**
         * @name pcui.SelectInput#close
         * @description Closes the dropdown menu
         */
        close() {
            this._highlightLabel(null);

            this._updateInputFieldsVisibility(false);

            this._suspendInputChange = true;
            this._input.value = '';
            this._lastInputValue = '';
            this._suspendInputChange = false;

            if (this._containerOptions.hidden) return;

            this._containerOptions.hidden = true;

            this._domShadow.style.height = '';

            this.class.remove(CLASS_OPEN);
            window.removeEventListener('keydown', this._domEvtKeyDown);
            window.removeEventListener('mousedown', this._domEvtWindowMouseDown);
        }

        /**
         * @name pcui.SelectInput#toggle
         * @description Toggles the dropdown menu
         */
        toggle() {
            if (this._containerOptions.hidden) {
                this.open();
            } else {
                this.close();
            }
        }

        unlink() {
            super.unlink();

            if (!this._containerOptions.hidden) {
                this.close();
            }
        }

        destroy() {
            if (this._destroyed) return;

            this._labelValue.dom.removeEventListener('keydown', this._domEvtKeyDown);
            this._labelValue.dom.removeEventListener('mousedown', this._domEvtMouseDown);
            this._labelValue.dom.removeEventListener('focus', this._domEvtFocus);
            this._labelValue.dom.removeEventListener('blur', this._domEvtBlur);

            window.removeEventListener('keydown', this._domEvtKeyDown);
            window.removeEventListener('mousedown', this._domEvtWindowMouseDown);

            if (this._timeoutLabelValueTabIndex) {
                cancelAnimationFrame(this._timeoutLabelValueTabIndex);
                this._timeoutLabelValueTabIndex = null;
            }

            super.destroy();
        }

        get options() {
            return this._options.slice();
        }

        set options(value) {
            if (this._options && this._options.equals(value)) return;

            this._containerOptions.clear();
            this._labelHighlighted = null;
            this._optionsIndex = {};
            this._labelsIndex = {};
            this._options = value;

            // store each option value -> title pair in the optionsIndex
            this._options.forEach(option => {
                this._optionsIndex[option.v] = option.t;
                if (option.v === '') return;

                const label = new pcui.Label({
                    text: option.t,
                    tabIndex: -1
                });

                label._optionValue = option.v;

                // store labels in an index too
                this._labelsIndex[option.v] = label;

                // on clicking an option set it as the value and close the dropdown list
                label.on('click', (e) => {
                    e.stopPropagation();
                    this._onSelectValue(option.v);
                    this.close();
                });
                this._containerOptions.append(label);
            });

            if (this._createLabelText) {
                this._initializeCreateLabel();
            }

            if (this.multiSelect && this._values) {
                this._onMultipleValuesChange(this._values);
            } else {
                this._onValueChange(this.value);
            }

            if (this._lastInputValue) {
                this._filterOptions(this._lastInputValue);
            }
        }

        get invalidOptions() {
            return this._invalidOptions;
        }

        set invalidOptions(value) {
            this._invalidOptions = value || null;
        }

        get multiSelect() {
            return this.class.contains(CLASS_MULTI_SELECT);
        }

        get value() {
            if (!this.multiSelect) {
                return this._value;
            }

            // if multi-select then construct an array
            // value from the tags that are currently visible
            const result = [];
            this._containerTags.dom.childNodes.forEach(dom => {
                result.push(dom.ui.value);
            });

            return result;
        }

        set value(value) {
            this._values = null;

            this._suspendInputChange = true;
            this._input.value = '';
            this._lastInputValue = '';
            this._suspendInputChange = false;

            this.class.remove(pcui.CLASS_MULTIPLE_VALUES);

            value = this._convertValue(value);

            if (this._value === value || this.multiSelect && this._value && this._value.equals(value)) {
                // if the value is null because we are showing multiple values
                // but someone wants to actually set the value of all observers to null
                // then make sure we do not return early
                if (value !== null || !this._allowNull || !this.class.contains(pcui.CLASS_MULTIPLE_VALUES)) {
                    return;
                }
            }

            this._value = value;
            this._onValueChange(value);

            this.emit('change', value);

            if (this._binding) {
                this._binding.setValue(value);
            }
        }

        set values(values) {
            values = values.map(this._convertValue.bind(this));

            let different = false;
            const value = values[0];
            const multiSelect = this.multiSelect;

            this._values = null;

            for (let i = 1; i < values.length; i++) {
                if (values[i] !== value && (!multiSelect || !values[i] || !values[i].equals(value))) {
                    different = true;
                    break;
                }
            }

            if (different) {
                this._labelValue.values = values;

                // show all different tags
                if (multiSelect) {
                    this._values = values;
                    this._value = null;
                    this._onMultipleValuesChange(this._values);
                    this.emit('change', this.value);
                } else {
                    if (this._value !== null) {
                        this._value = null;
                        this.emit('change', null);
                    }
                }

                this.class.add(pcui.CLASS_MULTIPLE_VALUES);
            } else {
                this.value = values[0];
            }
        }

        get placeholder() {
            return this._input.placeholder;
        }

        set placeholder(value) {
            this._input.placeholder = value;
        }
    }

    utils.implements(SelectInput, pcui.IBindable);
    utils.implements(SelectInput, pcui.IFocusable);

    pcui.Element.register('select', SelectInput, { renderChanges: true });
    pcui.Element.register('multiselect', SelectInput, { multiSelect: true, renderChanges: true });
    pcui.Element.register('tags', SelectInput, { allowInput: true, allowCreate: true, multiSelect: true, renderChanges: true });

    return {
        SelectInput: SelectInput
    };
})());


/* pcui/element/element-batchgroup-input.js */
Object.assign(pcui, (function () {
    'use strict';

    /**
     * @name pcui.BatchGroupInput
     * @classdesc A select input that holds batch group options.
     * @extends pcui.SelectInput
     */
    class BatchGroupInput extends pcui.SelectInput {
        /**
         * Creates new pcui.BatchGroupInput.
         * @param {Object} args The arguments
         * @param {Observer} args.projectSettings The project settings
         */
        constructor(args) {
            if (!args) args = {};

            args.type = 'number';
            args.allowNull = true;
            args.allowInput = true;
            args.allowCreate = true;
            args.createLabelText = 'Create'
            args.options = [];

            super(args);

            this._createFn = this._createGroup.bind(this);

            this._projectSettings = args.projectSettings;

            this._refreshOptions();
        }

        _refreshOptions() {
            const options = [{
                v: null, t: 'None'
            }];

            const batchGroups = this._projectSettings.get('batchGroups');
            if (batchGroups) {
                for (const key in batchGroups) {
                    options.push({
                        v: parseInt(key, 10), t: batchGroups[key].name
                    });
                }
            }


            this.options = options;
        }

        _createGroup(name) {
            const group = editor.call('editorSettings:batchGroups:create', name);
            this._refreshOptions();
            this.value = group;
            editor.call('selector:set', 'editorSettings', [this._projectSettings]);
            setTimeout(() => {
                editor.call('editorSettings:batchGroups:focus', group);
            });
        }

        link(observers, paths) {
            // order is important here
            // we have to refresh the options first
            // and then link because updating options
            // hides tags
            this._refreshOptions();
            super.link(observers, paths);
        }
    }

    pcui.Element.register('batchgroup', BatchGroupInput, { renderChanges: true });

    return {
        BatchGroupInput: BatchGroupInput
    };
})());


/* pcui/element/element-bundles-input.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'pcui-bundles-input';

    class BundlesInput extends pcui.SelectInput {
        constructor(args) {
            if (!args) args = {};

            args.options = [];
            args.type = 'number';
            args.multiSelect = true;

            super(args);

            this.class.add(CLASS_ROOT);

            this._assets = [];

            this._updateOptions();
        }

        _updateOptions() {
            let options = editor.call('assets:bundles:list');
            options = options.map(bundle => {
                return { v: bundle.get('id'), t: bundle.get('name') };
            });
            this.options = options;
        }

        _addTag(bundleId) {
            super._addTag(bundleId);
            var bundleAsset = editor.call('assets:get', bundleId);
            if (bundleAsset && this._assets.length > 0) {
                editor.call('assets:bundles:addAssets', this._assets, bundleAsset);
            }
        }

        _removeTag(tagElement, bundleId) {
            super._removeTag(tagElement, bundleId);
            var bundleAsset = editor.call('assets:get', bundleId);
            if (bundleAsset && this._assets.length > 0) {
                editor.call('assets:bundles:removeAssets', this._assets, bundleAsset);
            }
        }

        link(observers, paths) {
            // order is important here
            // we have to update the options first
            // and then link because updating options
            // hides tags
            this._updateOptions();
            super.link(observers, paths);

            this._assets = observers.filter(observer => {
                return observer._type === 'asset';
            });

            const selectedBundles = [];
            this._containerTags.dom.childNodes.forEach(dom => {
                selectedBundles.push(dom.ui.value);
            });

            this._assets.forEach(asset => {
                const assetBundles = editor.call('assets:bundles:listForAsset', asset);
                assetBundles.forEach(assetBundle => {
                    if (!selectedBundles.includes(assetBundle.get('id'))) {
                        this._addTag(assetBundle.get('id'));
                    }
                });
            });
            this._containerTags.dom.childNodes.forEach(dom => {
                const assetBundles = editor.call('assets:bundles:listForAsset', this._assets[0]).map(asset => {
                    return asset.get('id');
                });
                if (!assetBundles.includes(dom.ui.value)) {
                    this._removeTag(dom.ui, dom.ui.value);
                }
            });
        }

        unlink() {
            super.unlink();
            this._assets = [];
        }

    }

    pcui.Element.register('bundles', BundlesInput, { renderChanges: true });

    return {
        BundlesInput: BundlesInput
    };
})());


/* pcui/element/element-layers-input.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'pcui-layers-input';

    class LayersInput extends pcui.SelectInput {
        constructor(args) {
            if (!args) args = {};

            args.multiSelect = true;
            args.options = [];
            args.type = 'number';

            super(args);

            this.class.add(CLASS_ROOT);

            this._projectSettings = args.projectSettings;

            this._excludeLayers = (args.excludeLayers ? args.excludeLayers.slice() : []);

            this._updateOptions();
        }

        _updateOptions() {
            const options = [];
            const layers = this._projectSettings.get('layers');

            if (layers) {
                this._excludeLayers.forEach(id => {
                    delete layers[id];
                });

                for (const key in layers) {
                    options.push({
                        v: parseInt(key, 10), t: layers[key].name
                    });
                }
            }


            this.options = options;
        }

        link(observers, paths) {
            // order is important here
            // we have to update the options first
            // and then link because updating options
            // hides tags
            this._updateOptions();
            super.link(observers, paths);
        }
    }

    pcui.Element.register('layers', LayersInput, { renderChanges: true });

    return {
        LayersInput: LayersInput
    };
})());


/* pcui/element/element-canvas.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_CANVAS = 'pcui-canvas';

    /**
     * @name pcui.Canvas
     * @classdesc A canvas element.
     * @property {Number} canvasWidth The width of the HTML canvas
     * @property {Number} canvasHeight The height of the HTML canvas
     * @extends pcui.Element
     */
    class Canvas extends pcui.Element {
        constructor(args) {
            if (!args) args = {};
            super(document.createElement('canvas'), args);

            this.class.add(CLASS_CANVAS);

            this._pixelWidth = 300;
            this._pixelHeight = 150;
            this._pixelRatio = args.useDevicePixelRatio !== undefined && args.useDevicePixelRatio ? window.devicePixelRatio : 1;
        }

        /**
         * @name pcui.Canvas#resize
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
        Canvas: Canvas
    };
})());


/* pcui/element/element-tree-view-item.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'pcui-treeview-item';
    const CLASS_ICON = CLASS_ROOT + '-icon';
    const CLASS_TEXT = CLASS_ROOT + '-text';
    const CLASS_SELECTED = CLASS_ROOT + '-selected';
    const CLASS_OPEN = CLASS_ROOT + '-open';
    const CLASS_CONTENTS = CLASS_ROOT + '-contents';
    const CLASS_EMPTY = CLASS_ROOT + '-empty';
    const CLASS_RENAME = CLASS_ROOT + '-rename';

    /**
     * @event
     * @name pcui.TreeViewItem#select
     * @description Fired when we select the TreeViewItem.
     * @param {pcui.TreeViewItem} The item
     */

    /**
     * @event
     * @name pcui.TreeViewItem#deselect
     * @description Fired when we deselect the TreeViewItem.
     * @param {pcui.TreeViewItem} The item
     */

    /**
     * @event
     * @name pcui.TreeViewItem#open
     * @description Fired when we open a TreeViewItem
     * @param {pcui.TreeViewItem} The item
     */

    /**
     * @event
     * @name pcui.TreeViewItem#close
     * @description Fired when we close the TreeViewItem.
     * @param {pcui.TreeViewItem} The item
     */

     /**
      * @name pcui.TreeViewItem
      * @classdesc Represents a Tree View Item to be added to a pcui.TreeView.
      * @mixes pcui.IFocusable
      * @property {Boolean} selected Whether the item is selected.
      * @property {Boolean} selectable Whether the item can be selected.
      * @property {Boolean} open Whether the item is open meaning showing its children.
      * @property {Boolean} allowDrop Whether dropping is allowed on the tree item.
      * @property {String} text The text shown by the TreeViewItem.
      * @property {Number} The number of direct children.
      * @property {pcui.Label} textLabel Gets the internal label that shows the text.
      * @property {pcui.Label} iconLabel Gets the internal label that shows the icon.
      * @property {pcui.TreeView} treeView Gets / sets the parent TreeView.
      * @property {pcui.TreeViewItem} firstChild Gets the first child item.
      * @property {pcui.TreeViewItem} lastChild Gets the last child item.
      * @property {pcui.TreeViewItem} nextSibling Gets the first sibling item.
      * @property {pcui.TreeViewItem} previousSibling Gets the last sibling item.
      */
    class TreeViewItem extends pcui.Container {
        /**
         * Creates a new TreeViewItem.
         * @param {Object} [args] The arguments.
         */
        constructor(args) {
            if (!args) {
                args = {};
            }

            args.flex = true;

            super(args);

            this.class.add(CLASS_ROOT, CLASS_EMPTY);

            this._containerContents = new pcui.Container({
                class: CLASS_CONTENTS,
                flex: true,
                flexDirection: 'row',
                tabIndex: 0
            });
            this.append(this._containerContents);

            this._containerContents.dom.draggable = true;

            this._labelIcon = new pcui.Label({
                class: CLASS_ICON
            });
            this._containerContents.append(this._labelIcon);

            this._labelText = new pcui.Label({
                class: CLASS_TEXT
            });
            this._containerContents.append(this._labelText);

            this.selectable = (args.selectable !== undefined ? args.selectable : true);
            this.allowDrop = (args.allowDrop !== undefined ? args.allowDrop : true);
            if (args.text) {
                this.text = args.text;
            }

            this._numChildren = 0;

            // used the the parent treeview
            this._treeOrder = -1;

            this._domEvtFocus = this._onFocus.bind(this);
            this._domEvtBlur = this._onBlur.bind(this);
            this._domEvtKeyDown = this._onKeyDown.bind(this);
            this._domEvtDragStart = this._onDragStart.bind(this);
            this._domEvtMouseDown = this._onMouseDown.bind(this);
            this._domEvtMouseUp = this._onMouseUp.bind(this);
            this._domEvtMouseOver = this._onMouseOver.bind(this);
            this._domEvtClick = this._onClickContents.bind(this);
            this._domEvtDblClick = this._onDblClickContents.bind(this);
            this._domEvtContextMenu = this._onContextMenu.bind(this);

            this._containerContents.dom.addEventListener('focus', this._domEvtFocus);
            this._containerContents.dom.addEventListener('blur', this._domEvtBlur);
            this._containerContents.dom.addEventListener('keydown', this._domEvtKeyDown);
            this._containerContents.dom.addEventListener('dragstart', this._domEvtDragStart);
            this._containerContents.dom.addEventListener('mousedown', this._domEvtMouseDown);
            this._containerContents.dom.addEventListener('mouseover', this._domEvtMouseOver);
            this._containerContents.dom.addEventListener('click', this._domEvtClick);
            this._containerContents.dom.addEventListener('dblclick', this._domEvtDblClick);
            this._containerContents.dom.addEventListener('contextmenu', this._domEvtContextMenu);
        }

        _onAppendChild(element) {
            super._onAppendChild(element);

            if (!(element instanceof pcui.TreeViewItem)) return;

            this._numChildren++;
            this.class.remove(CLASS_EMPTY);

            if (this._treeView) {
                this._treeView._onAppendTreeViewItem(element);
            }
        }

        _onRemoveChild(element) {
            if (element instanceof pcui.TreeViewItem) {
                this._numChildren--;
                if (this._numChildren === 0) {
                    this.class.add(CLASS_EMPTY);
                }

                if (this._treeView) {
                    this._treeView._onRemoveTreeViewItem(element);
                }
            }

            super._onRemoveChild(element);
        }

        _onKeyDown(evt) {
            if (evt.target.tagName.toLowerCase() === 'input') return;

            if (!this.selectable) return;

            if (this._treeView) {
                this._treeView._onChildKeyDown(evt, this);
            }
        }

        _onMouseDown(evt) {
            if (!this._treeView || !this._treeView.allowDrag) return;

            evt.stopPropagation();
        }

        _onMouseUp(evt) {
            evt.stopPropagation();
            evt.preventDefault();

            window.removeEventListener('mouseup', this._domEvtMouseUp);
            if (this._treeView) {
                this._treeView._onChildDragEnd(evt, this);
            }
        }

        _onMouseOver(evt) {
            evt.stopPropagation();

            if (this._treeView) {
                this._treeView._onChildDragOver(evt, this)
            }
        }

        _onDragStart(evt) {
            evt.stopPropagation();
            evt.preventDefault();

            if (!this._treeView || !this._treeView.allowDrag) return;

            if (this.class.contains(CLASS_RENAME)) return;

            this._treeView._onChildDragStart(evt, this);

            window.addEventListener('mouseup', this._domEvtMouseUp);
        }

        _onClickContents(evt) {
            if (!this.selectable || evt.button !== 0) return;
            if (evt.target.tagName.toLowerCase() === 'input') return;

            evt.stopPropagation();

            const rect = this._containerContents.dom.getBoundingClientRect();
            if (this._numChildren > 0 && evt.clientX - rect.left < 0) {
                this.open = !this.open;
                this.focus();
            } else if (this._treeView) {
                this._treeView._onChildClick(evt, this);
            }
        }

        _onDblClickContents(evt) {
            if (!this._treeView || !this._treeView.allowRenaming || evt.button !== 0) return;
            if (evt.target.tagName.toLowerCase() === 'input') return;

            evt.stopPropagation();
            const rect = this._containerContents.dom.getBoundingClientRect();
            if (this.numChildren && evt.clientX - rect.left < 0) {
                return;
            }

            if (this.selectable) {
                this._treeView.deselect();
                this._treeView._onChildClick(evt, this);
            }

            this.rename();
        }

        _onContextMenu(evt) {
            if (this._treeView && this._treeView._onContextMenu) {
                this._treeView._onContextMenu(evt, this);
            }
        }

        _onFocus(evt) {
            this.emit('focus');
        }

        _onBlur(evt) {
            this.emit('blur');
        }

        rename() {
            this.class.add(CLASS_RENAME);

            // show text input to enter new text
            const textInput = new pcui.TextInput({
                renderChanges: false,
                value: this.text
            });

            textInput.on('blur', () => {
                textInput.destroy();
            });

            textInput.on('destroy', () => {
                this.class.remove(CLASS_RENAME);
                this.focus();
            });

            textInput.on('change', value => {
                value = value.trim();
                if (value) {
                    this.text = value;
                    textInput.destroy();
                }
            });

            textInput.on('disable', () => {
                // make sure text input is editable even if this
                // tree item is disabled
                textInput.input.removeAttribute('readonly');
            });

            this._containerContents.append(textInput);

            textInput.focus(true);
        }

        focus() {
            this._containerContents.dom.focus();
        }

        blur() {
            this._containerContents.dom.blur();
        }

        destroy() {
            if (this._destroyed) return;

            this._containerContents.dom.removeEventListener('focus', this._domEvtFocus);
            this._containerContents.dom.removeEventListener('blur', this._domEvtBlur);
            this._containerContents.dom.removeEventListener('keydown', this._domEvtKeyDown);
            this._containerContents.dom.removeEventListener('mousedown', this._domEvtMouseDown);
            this._containerContents.dom.removeEventListener('dragstart', this._domEvtDragStart);
            this._containerContents.dom.removeEventListener('mouseover', this._domEvtMouseOver);
            this._containerContents.dom.removeEventListener('click', this._domEvtClick);
            this._containerContents.dom.removeEventListener('dblclick', this._domEvtDblClick);
            this._containerContents.dom.removeEventListener('contextmenu', this._domEvtContextMenu);

            window.removeEventListener('mouseup', this._domEvtMouseUp);

            super.destroy();
        }

        get selected() {
            return this._containerContents.class.contains(CLASS_SELECTED);
        }

        set selected(value) {
            if (value) {
                this.focus();
            }

            if (value === this.selected) return;

            if (value) {
                this._containerContents.class.add(CLASS_SELECTED);
                this.emit('select', this);
                if (this._treeView) {
                    this._treeView._onChildSelected(this);
                }
            } else {
                this._containerContents.class.remove(CLASS_SELECTED);
                this.blur();
                this.emit('deselect', this);
                if (this._treeView) {
                    this._treeView._onChildDeselected(this);
                }
            }
        }

        get text() {
            return this._labelText.value;
        }

        set text(value) {
            if (this._labelText.value !== value) {
                this._labelText.value = value;
                if (this._treeView) {
                    this._treeView._onChildRename(this, value);
                }
            }
        }

        get textLabel() {
            return this._labelText;
        }

        get iconLabel() {
            return this._labelIcon;
        }

        get open() {
            return this.class.contains(CLASS_OPEN) || this.parent === this._treeView;
        }

        set open(value) {
            if (this.open === value) return;

            if (value) {
                if (!this.numChildren) return;

                this.class.add(CLASS_OPEN);
                this.emit('open', this);
            } else {
                this.class.remove(CLASS_OPEN);
                this.emit('close', this);
            }
        }

        get allowDrop() {
            return this._allowDrop;
        }

        set allowDrop(value) {
            this._allowDrop = value;
        }

        get selectable() {
            return this._selectable;
        }

        set selectable(value) {
            this._selectable = value;
        }

        get treeView() {
            return this._treeView;
        }

        set treeView(value) {
            if (this._treeView === value) return;

            this._treeView = value;
        }

        get numChildren() {
            return this._numChildren;
        }

        get firstChild() {
            if (this._numChildren) {
                for (let i = 0; i < this.dom.childNodes.length; i++) {
                    if (this.dom.childNodes[i].ui instanceof pcui.TreeViewItem) {
                        return this.dom.childNodes[i].ui;
                    }
                }
            }

            return null;
        }

        get lastChild() {
            if (this._numChildren) {
                for (let i = this.dom.childNodes.length - 1; i >= 0; i--) {
                    if (this.dom.childNodes[i].ui instanceof pcui.TreeViewItem) {
                        return this.dom.childNodes[i].ui;
                    }
                }
            }

            return null;
        }

        get nextSibling() {
            let sibling = this.dom.nextSibling;
            while (sibling && !(sibling.ui instanceof pcui.TreeViewItem)) {
                sibling = sibling.nextSibling;
            }

            return sibling && sibling.ui;
        }

        get previousSibling() {
            let sibling = this.dom.previousSibling;
            while (sibling && !(sibling.ui instanceof pcui.TreeViewItem)) {
                sibling = sibling.previousSibling;
            }

            return sibling && sibling.ui;
        }
    }

    utils.implements(TreeViewItem, pcui.IFocusable);

    return {
        TreeViewItem: TreeViewItem
    };
})());


/* pcui/element/element-tree-view.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'pcui-treeview';
    const CLASS_DRAGGED_ITEM = CLASS_ROOT + '-item-dragged';
    const CLASS_DRAGGED_HANDLE = CLASS_ROOT + '-drag-handle';
    const CLASS_FILTERING = CLASS_ROOT + '-filtering';
    const CLASS_FILTER_RESULT = CLASS_FILTERING + '-result';

    const DRAG_AREA_INSIDE = 'inside';
    const DRAG_AREA_BEFORE = 'before';
    const DRAG_AREA_AFTER = 'after';

    /**
     * @event
     * @name pcui.TreeView#dragstart
     * @param {pcui.TreeViewItem[]} The dragged items
     * @description Fired when we start dragging a TreeViewItem
     */

    /**
     * @event
     * @name pcui.TreeView#dragend
     * @description Fired when we stop dragging a TreeViewItem
     */

    /**
     * @event
     * @name pcui.TreeView#reparent
     * @description Fired when we reparent TreeViewItems
     * @param {Object[]} An array of items we reparented. Each array element contains an object like so: {item, newParent, oldParent}.
     */

    /**
     * @event
     * @name pcui.TreeView#select
     * @description Fired when we select a TreeViewItem
     * @param {pcui.TreeViewItem} The item
     */

    /**
     * @event
     * @name pcui.TreeView#deselect
     * @description Fired when we deselect a TreeViewItem
     * @param {pcui.TreeViewItem} The item
     */

     /**
     * @event
     * @name pcui.TreeView#rename
     * @description Fired when we rename a TreeViewItem
     * @param {pcui.TreeViewItem} The item
     * @param {String} The new name
     */

    /**
     * @name pcui.TreeView
     * @classdesc A container that can show a treeview like a hierarchy. The treeview contains
     * pcui.TreeViewItems.
     * @extends pcui.Container
     * @property {Boolean} allowDrag Whether dragging a TreeViewItem is allowed.
     * @property {Boolean} allowReordering Whether reordering TreeViewItems is allowed.
     * @property {Boolean} allowRenaming Whether renaming TreeViewItems is allowed by double clicking on them.
     * @property {Boolean} isDragging Whether we are currently dragging a TreeViewItem.
     * @property {String} filter Gets / sets a filter that searches TreeViewItems and only shows the ones that are relevant to the filter.
     * @property {pcui.TreeViewItem[]} selected Gets the selected TreeViewItems.
     */
    class TreeView extends pcui.Container {
        /**
         * Creates a new TreeView.
         * @param {Object} [args] The arguments. All properties can be set through the arguments as well.
         * @param {Function} [args.onContextMenu] A function to be called when we right click on a TreeViewItem.
         */
        constructor(args) {
            if (!args) args = {};

            super(args);

            this.class.add(CLASS_ROOT);

            this._selectedItems = [];
            this._dragItems = [];
            this._allowDrag = (args.allowDrag !== undefined ? args.allowDrag : true);
            this._allowReordering = (args.allowReordering !== undefined ? args.allowReordering : true);
            this._allowRenaming = (args.allowRenaming !== undefined ? args.allowRenaming : false);
            this._dragging = false;
            this._dragOverItem = null;
            this._dragArea = DRAG_AREA_INSIDE;
            this._dragScroll = 0;
            this._dragScrollInterval = null;
            this._dragHandle = new pcui.Element(document.createElement('div'), {
                class: CLASS_DRAGGED_HANDLE
            });
            this.append(this._dragHandle);

            this._onContextMenu = args.onContextMenu;

            this._pressedCtrl = false;
            this._pressedShift = false;

            this._filter = null;
            this._filterResults = [];
            this._wasDraggingAllowedBeforeFiltering = this._allowDrag;

            this._domEvtModifierKeys = this._updateModifierKeys.bind(this);
            this._domEvtMouseLeave = this._onMouseLeave.bind(this);
            this._domEvtDragMove = this._onDragMove.bind(this);
            this._domEvtMouseMove = this._onMouseMove.bind(this);

            window.addEventListener('keydown', this._domEvtModifierKeys);
            window.addEventListener('keyup', this._domEvtModifierKeys);
            window.addEventListener('mousedown', this._domEvtModifierKeys);

            this.dom.addEventListener('mouseleave', this._domEvtMouseLeave);

            this._dragHandle.dom.addEventListener('mousemove', this._domEvtDragMove);
        }

        _updateModifierKeys(evt) {
            if (this._pressedCtrl !== (evt.ctrlKey || evt.metaKey)) {
                this._pressedCtrl = evt.ctrlKey || evt.metaKey;
            }

            if (this._pressedShift !== evt.shiftKey) {
                this._pressedShift = evt.shiftKey;
            }
        }

        /**
         * Finds the next tree item that is not currently hidden
         * @param {pcui.TreeViewItem} currentItem The current tree item
         * @returns {pcui.TreeViewItem} The next tree item.
         */
        _findNextVisibleTreeItem(currentItem) {
            if (currentItem.numChildren > 0 && currentItem.open) {
                return currentItem.firstChild;
            }

            const sibling = currentItem.nextSibling;
            if (sibling) return sibling;

            let parent = currentItem.parent;
            if (!(parent instanceof pcui.TreeViewItem)) return null;

            let parentSibling = parent.nextSibling;
            while (!parentSibling) {
                parent = parent.parent;
                if (!(parent instanceof pcui.TreeViewItem)) {
                    break;
                }

                parentSibling = parent.nextSibling;
            }

            return parentSibling;
        }

        /**
         * Finds the last visible child tree item of the specified tree item.
         * @param {pcui.TreeViewItem} currentItem The current item.
         * @returns {pcui.TreeViewItem} The last child item.
         */
        _findLastVisibleChildTreeItem(currentItem) {
            if (!currentItem.numChildren || !currentItem.open) return null;

            let lastChild = currentItem.lastChild;
            while (lastChild.numChildren && lastChild.open) {
                lastChild = lastChild.lastChild;
            }

            return lastChild;
        }

        /**
         * Finds the previous visible tree item of the specified tree item.
         * @param {pcui.TreeViewItem} currentItem The current tree item.
         * @returns {pcui.TreeViewItem} The previous item.
         */
        _findPreviousVisibleTreeItem(currentItem) {
            const sibling = currentItem.previousSibling;
            if (sibling) {
                if (sibling.numChildren > 0 && sibling.open)  {
                    return this._findLastVisibleChildTreeItem(sibling);
                }

                return sibling;
            }

            const parent = currentItem.parent;
            if (!(parent instanceof pcui.TreeViewItem)) return null;

            return parent;
        }

        /**
         * Gets the visible tree items between the specified start and end tree items.
         * @param {pcui.TreeViewItem} startChild The start tree item.
         * @param {pcui.TreeViewItem} endChild The end tree item.
         * @returns {pcui.TreeViewItem[]} The tree items.
         */
        _getChildrenRange(startChild, endChild) {
            const rectStart = startChild.dom.getBoundingClientRect();
            const rectEnd = endChild.dom.getBoundingClientRect();
            const result = [];

            if (rectStart.top < rectEnd.top) {
                let current = startChild;
                while (current && current !== endChild) {
                    current = this._findNextVisibleTreeItem(current);
                    if (current && current !== endChild) {
                        result.push(current);
                    }
                }
            } else {
                let current = startChild;
                while (current && current !== endChild) {
                    current = this._findPreviousVisibleTreeItem(current);
                    if (current && current !== endChild) {
                        result.push(current);
                    }
                }
            }

            result.push(endChild);

            return result;
        }

        _onAppendChild(element) {
            super._onAppendChild(element);

            if (element instanceof pcui.TreeViewItem) {
                this._onAppendTreeViewItem(element);
            }
        }

        _onRemoveChild(element) {
            if (element instanceof pcui.TreeViewItem) {
                this._onRemoveTreeViewItem(element);
            }

            super._onRemoveChild(element);
        }

        _onAppendTreeViewItem(element) {
            element.treeView = this;

            if (this._filter) {
                // add new item to filtered results if it
                // satisfies the current filter
                this._searchItems([[element.text, element]], this._filter);
            }

            // do the same for all children of the element
            element.forEachChild(child => {
                if (child instanceof pcui.TreeViewItem) {
                    this._onAppendTreeViewItem(child);
                }
            });
        }

        _onRemoveTreeViewItem(element) {
            element.selected = false;

            // do the same for all children of the element
            element.forEachChild(child => {
                if (child instanceof pcui.TreeViewItem) {
                    this._onRemoveTreeViewItem(child);
                }
            });
        }

        /**
         * Called when a key is down on a child TreeViewItem.
         */
        _onChildKeyDown(evt, element) {
            if ([9, 37, 38, 39, 40].indexOf(evt.keyCode) === -1) return;

            evt.preventDefault();
            evt.stopPropagation();

            if (evt.keyCode === 40) {
                // down - select next tree item
                if (this._selectedItems.length) {
                    const next = this._findNextVisibleTreeItem(element);
                    if (next) {
                        if (this._pressedShift || this._pressedCtrl) {
                            next.selected = true;
                        } else {
                            this._selectSingleItem(next);
                        }
                    }
                }
            } else if (evt.keyCode === 38) {
                // up - select previous tree item
                if (this._selectedItems.length) {
                    const prev = this._findPreviousVisibleTreeItem(element);
                    if (prev) {
                        if (this._pressedShift || this._pressedCtrl) {
                            prev.selected = true;
                        } else {
                            this._selectSingleItem(prev);
                        }
                    }
                }

            } else if (evt.keyCode === 37) {
                // left (close)
                if (element.parent !== this) {
                    element.open = false;
                }
            } else if (evt.keyCode === 39) {
                // right (open)
                element.open = true;
            } else if (evt.keyCode === 9) {
                // tab
                // skip
            }
        }

        /**
         * Called when we click on a child TreeViewItem
         */
        _onChildClick(evt, element) {
            if (evt.button !== 0) return;
            if (!element.selectable) return;

            if (this._pressedCtrl) {
                // toggle selection when Ctrl is pressed
                element.selected = !element.selected;
            } else if (this._pressedShift) {
                // on shift add to selection
                if (!this._selectedItems.length || this._selectedItems.length === 1 && this._selectedItems[0] === element) {
                    element.selected = true;
                    return;
                }

                const selected = this._selectedItems[this._selectedItems.length - 1];
                this._openHierarchy(selected);

                const children = this._getChildrenRange(selected, element);
                children.forEach(child => {
                    if (child.selectable) {
                        child.selected = true;
                    }
                });

            } else {
                // deselect other items
                this._selectSingleItem(element);
            }
        }

        /**
         * Call specified function on every child TreeViewItem by traversing the hierarchy depth first.
         * @param {Function} fn The function to call. The function takes the TreeViewItem as an argument.
         */
        _traverseDepthFirst(fn) {
            function traverse(item) {
                if (!item || !(item instanceof pcui.TreeViewItem)) return;

                fn(item);

                if (item.numChildren) {
                    for (let i = 0; i < item.dom.childNodes.length; i++) {
                        traverse(item.dom.childNodes[i].ui);
                    }
                }
            }

            for (let i = 0; i < this.dom.childNodes.length; i++) {
                traverse(this.dom.childNodes[i].ui);
            }
        }

        /**
         * Do a depth first traversal of all tree items
         * and assign an order to them so that we know which one
         * is above the other. Performance wise this means it traverses
         * all tree items every time however seems to be pretty fast even with 15 - 20 K entities.
         */
        _updateTreeOrder() {
            let order = 0;

            this._traverseDepthFirst(item => {
                item._treeOrder = order++;
            });
        }

        /**
         * Called when we start dragging a TreeViewItem.
         */
        _onChildDragStart(evt, element) {
            if (!this.allowDrag || this._dragging) return;

            this._dragItems = [];

            // cannot drag root
            if (element.parent === this) return;

            if (this._selectedItems.indexOf(element) !== -1) {
                const dragged = [];

                // check that all selected items to be dragged are
                // at the same depth from the root
                let desiredDepth = -1;
                for (let i = 0; i < this._selectedItems.length; i++) {
                    let parent = this._selectedItems[i].parent;
                    let depth = 0;
                    let isChild = false;
                    while (parent && parent instanceof pcui.TreeViewItem) {
                        // if parent is already in dragged items then skip
                        // depth calculation for this item
                        if (this._selectedItems.indexOf(parent) !== -1) {
                            isChild = true;
                            break;
                        }

                        depth++;
                        parent = parent.parent;
                    }

                    if (!isChild) {
                        if (desiredDepth === -1) {
                            desiredDepth = depth;
                        } else if (desiredDepth !== depth) {
                            return;
                        }

                        dragged.push(this._selectedItems[i]);
                    }
                }

                // add dragged class to each item
                this._dragItems = dragged;
            } else {
                element.class.add(CLASS_DRAGGED_ITEM);
                this._dragItems.push(element);
            }

            if (this._dragItems.length) {
                this._dragItems.forEach(item => {
                    item.class.add(CLASS_DRAGGED_ITEM);
                });

                this.isDragging = true;

                this.emit('dragstart', this._dragItems.slice());
            }
        }

        /**
         * Called when we stop dragging a TreeViewItem.
         */
        _onChildDragEnd(evt, element) {
            if (!this.allowDrag || !this._dragging) return;

            this._dragItems.forEach(item => item.class.remove(CLASS_DRAGGED_ITEM));

            if (this._dragOverItem) {
                if (this._dragItems.length > 1) {
                    // sort items based on order in the hierarchy
                    if (this._dragItems.length > 1) {
                        this._updateTreeOrder();
                        this._dragItems.sort((a, b) => {
                            return a._treeOrder - b._treeOrder;
                        });
                    }
                }

                if (this._dragItems.length) {
                    // reparent items
                    const reparented = [];
                    let lastDraggedItem = this._dragOverItem;

                    this._dragItems.forEach(item => {
                        if (item.parent !== this._dragOverItem || this._dragArea !== DRAG_AREA_INSIDE) {

                            const oldParent = item.parent;
                            let newParent = null;

                            item.parent.remove(item);

                            if (this._dragArea === DRAG_AREA_BEFORE) {
                                // If dragged before a TreeViewItem...
                                newParent = this._dragOverItem.parent;
                                this._dragOverItem.parent.appendBefore(item, this._dragOverItem);
                            } else if (this._dragArea === DRAG_AREA_INSIDE) {
                                // If dragged inside a TreeViewItem...
                                newParent = this._dragOverItem;
                                this._dragOverItem.append(item);
                                this._dragOverItem.open = true;
                            } else if (this._dragArea === DRAG_AREA_AFTER) {
                                // If dragged after a TreeViewItem...
                                newParent = this._dragOverItem.parent;
                                this._dragOverItem.parent.appendAfter(item, lastDraggedItem);
                                lastDraggedItem = item;
                            }

                            reparented.push({
                                item, newParent, oldParent
                            });
                        }
                    });

                    if (reparented.length) {
                        this.emit('reparent', reparented);
                    }
                }
            }

            this._dragItems = [];

            this.isDragging = false;

            this.emit('dragend');
        }

        /**
         * Called when we drag over a TreeViewItem.
         */
        _onChildDragOver(evt, element) {
            if (!this._allowDrag || !this._dragging) return;

            if (element.allowDrop && this._dragItems.indexOf(element) === -1) {
                this._dragOverItem = element;
            } else {
                this._dragOverItem = null;
            }

            this._updateDragHandle();
            this._onDragMove(evt);
        }


        /**
         * Called when the mouse cursor leaves the tree view.
         */
        _onMouseLeave(evt) {
            if (!this._allowDrag || !this._dragging) return;

            this._dragOverItem = null;
            this._updateDragHandle();
        }

        /**
         * Called when the mouse moves while dragging
         */
        _onMouseMove(evt) {
            if (!this._dragging) return;

            // Determine if we need to scroll the treeview if we are dragging towards the edges
            const rect = this.dom.getBoundingClientRect();
            this._dragScroll = 0;
            if (evt.clientY - rect.top < 32 && this.dom.scrollTop > 0) {
                this._dragScroll = -1;
            } else if (rect.bottom - evt.clientY < 32 && this.dom.scrollHeight - (rect.height + this.dom.scrollTop) > 0) {
                this._dragScroll = 1;
            }
        }

        /**
         * Scroll treeview if we are dragging towards the edges
         */
        _scrollWhileDragging() {
            if (!this._dragging) return;
            if (this._dragScroll === 0) return;

            this.dom.scrollTop += this._dragScroll * 8;
            this._dragOverItem = null;
            this._updateDragHandle();
        }

        /**
         * Called while we drag the drag handle
         */
        _onDragMove(evt) {
            evt.preventDefault();
            evt.stopPropagation();

            if (! this._allowDrag || ! this._dragOverItem) return;

            const rect = this._dragHandle.dom.getBoundingClientRect();
            const area = Math.floor((evt.clientY - rect.top) / rect.height * 5);

            const oldArea = this._dragArea;
            const oldDragOver = this._dragOverItem;

            if (this._dragOverItem.parent === this) {
                let parent = false;
                for (let i = 0; i < this._dragItems.length; i++) {
                    if (this._dragItems[i].parent === this._dragOverItem) {
                        parent = true;
                        this._dragOverItem = null;
                        break;
                    }
                }

                if (! parent) {
                    this._dragArea = DRAG_AREA_INSIDE;
                }
            } else {
                // check if we are trying to drag item inside any of its children
                let invalid = false;
                for (let i = 0; i < this._dragItems.length; i++) {
                    if (this._dragItems[i].dom.contains(this._dragOverItem.dom)) {
                        invalid = true;
                        break;
                    }
                }

                if (invalid) {
                    this._dragOverItem = null;
                } else if (this._allowReordering && area <= 1 && this._dragItems.indexOf(this._dragOverItem.previousSibling) === -1) {
                    this._dragArea = DRAG_AREA_BEFORE;
                } else if (this._allowReordering && area >= 4 && this._dragItems.indexOf(this._dragOverItem.nextSibling) === -1 && (this._dragOverItem.numChildren === 0 || ! this._dragOverItem.open)) {
                    this._dragArea = DRAG_AREA_AFTER;
                } else {
                    let parent = false;
                    if (this._allowReordering && this._dragOverItem.open) {
                        for(var i = 0; i < this._dragItems.length; i++) {
                            if (this._dragItems[i].parent === this._dragOverItem) {
                                parent = true;
                                this._dragArea = DRAG_AREA_BEFORE;
                                break;
                            }
                        }
                    }
                    if (! parent)
                        this._dragArea = DRAG_AREA_INSIDE;
                }
            }

            if (oldArea !== this._dragArea || oldDragOver !== this._dragOverItem) {
                this._updateDragHandle();
            }
        }

        /**
         * Updates the drag handle position and size
         */
        _updateDragHandle() {
            if (!this._allowDrag || !this._dragging) return;

            if (!this._dragOverItem) {
                this._dragHandle.hidden = true;
            } else {
                const rect = this._dragOverItem._containerContents.dom.getBoundingClientRect();

                this._dragHandle.hidden = false;
                this._dragHandle.class.remove(DRAG_AREA_AFTER, DRAG_AREA_BEFORE, DRAG_AREA_INSIDE);
                this._dragHandle.class.add(this._dragArea);

                let top = rect.top;
                let left = rect.left;
                let width = rect.width;
                if (this.dom.parentElement) {
                    const parentRect = this.dom.parentElement.getBoundingClientRect();
                    left = Math.max(left, parentRect.left);
                    width = Math.min(width, this.dom.parentElement.clientWidth - left + parentRect.left);
                }

                this._dragHandle.style.top = top  + 'px';
                this._dragHandle.style.left = left + 'px';
                this._dragHandle.style.width = (width - 7) + 'px';
            }
        }

        /**
         * Opens all the parents of the specified item
         * @param {pcui.TreeViewItem} endItem The end tree view item
         */
        _openHierarchy(endItem) {
            let parent = endItem.parent;
            while (parent && parent instanceof pcui.TreeViewItem) {
                parent.open = true;
                parent = parent.parent;
            }
        }

        /**
         * Selects a tree view item
         * @param {pcui.TreeViewItem} item The tree view item
         */
        _selectSingleItem(item) {
            let i = this._selectedItems.length;
            let othersSelected = false;
            while (i--) {
                if (this._selectedItems[i] !== item) {
                    this._selectedItems[i].selected = false;
                    othersSelected = true;
                }
            }

            if (othersSelected) {
                item.selected = true;
            } else {
                item.selected = !item.selected;
            }
        }

        /**
         * Called when a child tree view item is selected.
         * @param {pcui.TreeViewItem} item The tree view item.
         */
        _onChildSelected(item) {
            this._selectedItems.push(item);
            this._openHierarchy(item);
            this.emit('select', item);
        }

        /**
         * Called when a child tree view item is deselected.
         * @param {pcui.TreeViewItem} item The tree view item.
         */
        _onChildDeselected(element) {
            const index = this._selectedItems.indexOf(element);
            if (index !== -1) {
                this._selectedItems.splice(index, 1);
                this.emit('deselect', element);
            }
        }

        /**
         * Called when a child tree view item is renamed.
         * @param {pcui.TreeViewItem} item The tree view item.
         */
        _onChildRename(item, newName) {
            if (this._filter) {
                // unfilter this item
                item.class.remove(CLASS_FILTER_RESULT);
                const index = this._filterResults.indexOf(item);
                if (index !== -1) {
                    this._filterResults.splice(index, 1);
                }

                // see if we can include it in the current filter
                this._searchItems([[item.text, item]], this._filter);
            }
            this.emit('rename', item, newName);
        }

        /**
         * Searches the treeview for tree view items that have a text similar to the search term.
         * Only shows the filtered items and hides the rest.
         * @param {[]} searchItems The search terms. An array of arrays where each subarray contains [text, pcui.TreeViewItem].
         * @param {String} filter The search filter
         */
        _searchItems(searchItems, filter) {
            const results = editor.call('search:items', searchItems, filter);
            if (!results.length) return;

            results.forEach(item => {
                this._filterResults.push(item);
                item.class.add(CLASS_FILTER_RESULT);
            });

        }

        /**
         * Searches treeview
         * @param {String} filter The search filter
         */
        _applyFilter(filter) {
            this._clearFilter();

            this._wasDraggingAllowedBeforeFiltering = this._allowDrag;
            this._allowDrag = false;

            this.class.add(CLASS_FILTERING);

            const search = [];
            this._traverseDepthFirst(item => {
                search.push([item.text, item]);
            });

            this._searchItems(search, filter);
        }

        /**
         * Clears search filter.
         */
        _clearFilter() {
            this._filterResults.forEach(item => {
                if (item.destroyed) return;
                item.class.remove(CLASS_FILTER_RESULT);
            });
            this._filterResults.length = 0;

            this.class.remove(CLASS_FILTERING);

            this._allowDrag = this._wasDraggingAllowedBeforeFiltering;
        }

        /**
         * @name pcui.TreeView#deselect
         * @description Deselects all selected tree view items.
         */
        deselect() {
            let i = this._selectedItems.length;
            while (i--) {
                this._selectedItems[i].selected = false;
            }
        }

        /**
         * @name pcui.TreeView#clearTreeItems
         * @description Removes all child tree view items
         */
        clearTreeItems() {
            let i = this.dom.childNodes.length;
            while (i--) {
                const ui = this.dom.childNodes[i].ui;
                if (ui instanceof pcui.TreeViewItem) {
                    ui.destroy();
                }
            }

            this._selectedItems = [];
            this._dragItems = [];
            this._allowDrag = this._wasDraggingAllowedBeforeFiltering;
        }

        destroy() {
            if (this._destroyed) return;

            window.removeEventListener('keydown', this._domEvtModifierKeys);
            window.removeEventListener('keyup', this._domEvtModifierKeys);
            window.removeEventListener('mousedown', this._domEvtModifierKeys);
            window.removeEventListener('mousemove', this._domEvtMouseMove);

            this.dom.removeEventListener('mouseleave', this._domEvtMouseLeave);

            this._dragHandle.removeEventListener('mousemove', this._domEvtDragMove);

            if (this._dragScrollInterval) {
                clearInterval(this._dragScrollInterval);
                this._dragScrollInterval = null;
            }

            super.destroy();
        }

        get allowDrag() {
            return this._allowDrag;
        }

        set allowDrag(value) {
            this._allowDrag = value;
            if (this._filter) {
                this._wasDraggingAllowedBeforeFiltering = value;
            }
        }

        get allowReordering() {
            return this._allowReordering;
        }

        set allowReordering(value) {
            this._allowReordering = value;
        }

        get allowRenaming() {
            return this._allowRenaming;
        }

        set allowRenaming(value) {
            this._allowRenaming = value;
        }

        get isDragging() {
            return this._dragging;
        }

        set isDragging(value) {
            if (this._dragging === value) return;

            if (value) {
                this._dragging = true;
                this._updateDragHandle();

                // handle mouse move to scroll when dragging if necessary
                if (this.scrollable) {
                    window.removeEventListener('mousemove', this._domEvtMouseMove);
                    window.addEventListener('mousemove', this._domEvtMouseMove);
                    if (!this._dragScrollInterval) {
                        this._dragScrollInterval = setInterval(this._scrollWhileDragging.bind(this), 1000 / 60);
                    }
                }
            } else {
                this._dragOverItem = null;
                this._updateDragHandle();

                this._dragging = false;

                window.removeEventListener('mousemove', this._domEvtMouseMove);
                if (this._dragScrollInterval) {
                    clearInterval(this._dragScrollInterval);
                    this._dragScrollInterval = null;
                }
            }
        }

        get selected() {
            return this._selectedItems.slice();
        }

        get filter() {
            return this._filter;
        }

        set filter(value) {
            if (this._filter === value) return;

            this._filter = value;

            if (value) {
                this._applyFilter(value);
            } else {
                this._clearFilter();
            }
        }

    }

    return {
        TreeView: TreeView
    };
})());


/* pcui/element/element-drop-manager.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_DROP_MANAGER = 'pcui-dropmanager';
    const CLASS_DROP_MANAGER_WALL = CLASS_DROP_MANAGER + '-wall';
    const CLASS_DROP_MANAGER_WALL_FULL = CLASS_DROP_MANAGER_WALL + '-full';
    const CLASS_DROP_MANAGER_WALL_TOP = CLASS_DROP_MANAGER_WALL + '-top';
    const CLASS_DROP_MANAGER_WALL_LEFT = CLASS_DROP_MANAGER_WALL + '-left';
    const CLASS_DROP_MANAGER_WALL_RIGHT = CLASS_DROP_MANAGER_WALL + '-right';
    const CLASS_DROP_MANAGER_WALL_BOTTOM = CLASS_DROP_MANAGER_WALL + '-bottom';
    const CLASS_DROP_MANAGER_TARGETS = CLASS_DROP_MANAGER + '-targets';
    const CLASS_DROP_MANAGER_ACTIVE = CLASS_DROP_MANAGER + '-active';

    /**
     * @name pcui.DropManager
     * @classdesc Handles drag and drop
     * @property {Boolean} active True when we are currently dragging
     * @property {String} dropType The type of data that is being dropped
     * @property {Any} dropData The data being dropped
     * @extends pcui.Container
     */
    class DropManager extends pcui.Container {
        /**
         * Creates a new DropManager
         * @param {Object} args The arguments.
         */
        constructor(args) {
            super(args);

            this.class.add(CLASS_DROP_MANAGER);

            // 1 full screen element for when we want to overlay the entire screen
            this._domWallFull = document.createElement('div');
            this._domWallFull.classList.add(CLASS_DROP_MANAGER_WALL);
            this._domWallFull.classList.add(CLASS_DROP_MANAGER_WALL_FULL);
            this.append(this._domWallFull);

            // 4 elements that form the walls around a hole in the middle.
            // these 4 elements are resized to surround a drop target but they leave
            // a hole in the middle just big enough for the drop target to be able
            // to receive mouse events
            this._domWallTop = document.createElement('div');
            this._domWallTop.classList.add(CLASS_DROP_MANAGER_WALL);
            this._domWallTop.classList.add(CLASS_DROP_MANAGER_WALL_TOP);
            this.append(this._domWallTop);

            this._domWallBottom = document.createElement('div');
            this._domWallBottom.classList.add(CLASS_DROP_MANAGER_WALL);
            this._domWallBottom.classList.add(CLASS_DROP_MANAGER_WALL_BOTTOM);
            this.append(this._domWallBottom);

            this._domWallLeft = document.createElement('div');
            this._domWallLeft.classList.add(CLASS_DROP_MANAGER_WALL);
            this._domWallLeft.classList.add(CLASS_DROP_MANAGER_WALL_LEFT);
            this.append(this._domWallLeft);

            this._domWallRight = document.createElement('div');
            this._domWallRight.classList.add(CLASS_DROP_MANAGER_WALL);
            this._domWallRight.classList.add(CLASS_DROP_MANAGER_WALL_RIGHT);
            this.append(this._domWallRight);

            // container for all the drop targets
            const targets = document.createElement('div');
            targets.classList.add(CLASS_DROP_MANAGER_TARGETS);
            this.append(targets);

            // from now on all append calls will be directed to this element.
            this.domContent = targets;

            // deactivate when disabled or readonly
            this.on('disable', () => { this.active = false; });
            this.on('readOnly', readOnly => { if (!readOnly) this.active = false; });

            this._domEventDragEnter = this._onDragEnter.bind(this);
            this._domEventDragOver = this._onDragOver.bind(this);
            this._domEventDragLeave = this._onDragLeave.bind(this);
            this._domEventDrop = this._onDrop.bind(this);
            this._domEventMouseUp = this._onMouseUp.bind(this);

            window.addEventListener('dragenter', this._domEventDragEnter);
            window.addEventListener('dragover', this._domEventDragOver);
            window.addEventListener('dragleave', this._domEventDragLeave);
            window.addEventListener('drop', this._domEventDrop);

            this._active = false;

            // Increases on dragenter events
            // and decreases on dragleave events.
            // Used to activate or deactivate the manager
            // because dragenter / dragleave events are also raised
            // by child elements of the body
            this._dragEventCounter = 0;

            this._dropType = 'files';
            this._dropData = {};
        }

        _onActivate() {
            // cursor:set grabbing
            this.class.add(CLASS_DROP_MANAGER_ACTIVE);

            window.addEventListener('mouseup', this._domEventMouseUp);

            let top = this.parent.height;
            let bottom = 0;
            let left = this.parent.width;
            let right = 0;

            this._domWallFull.classList.remove(pcui.CLASS_HIDDEN);
            this._domWallTop.classList.add(pcui.CLASS_HIDDEN);
            this._domWallLeft.classList.add(pcui.CLASS_HIDDEN);
            this._domWallBottom.classList.add(pcui.CLASS_HIDDEN);
            this._domWallRight.classList.add(pcui.CLASS_HIDDEN);
            this.domContent.style.pointerEvents = '';

            // go through our child drop targets and show the ones
            // that are valid based on our current dropData
            const children = this.domContent.childNodes;
            for (let i = 0; i < children.length; i++) {
                const dropTarget = children[i].ui;
                if (!(dropTarget instanceof pcui.DropTarget)) continue;

                dropTarget.hidden = !dropTarget.onFilter(this.dropType, this.dropData);

                if (!dropTarget.hidden && dropTarget.hole) {

                    const rect = dropTarget.rect;
                    if (top > rect.top) top = rect.top;
                    if (bottom < rect.bottom) bottom = rect.bottom;
                    if (left > rect.left) left = rect.left;
                    if (right < rect.right) right = rect.right;

                    this._domWallTop.classList.remove(pcui.CLASS_HIDDEN);
                    this._domWallTop.style.height = top + 'px';

                    this._domWallRight.classList.remove(pcui.CLASS_HIDDEN);
                    this._domWallRight.style.top = top + 'px';
                    this._domWallRight.style.bottom = (this.parent.height - bottom) + 'px';
                    this._domWallRight.style.width = (this.parent.width - right) + 'px';

                    this._domWallBottom.classList.remove(pcui.CLASS_HIDDEN);
                    this._domWallBottom.style.height = (this.parent.height - bottom) + 'px';

                    this._domWallLeft.classList.remove(pcui.CLASS_HIDDEN);
                    this._domWallLeft.style.top = top + 'px';
                    this._domWallLeft.style.bottom = (this.parent.height - bottom) + 'px';
                    this._domWallLeft.style.width = left + 'px';

                    this._domWallFull.classList.add(pcui.CLASS_HIDDEN);

                    if (dropTarget.passThrough) {
                        this.domContent.style.pointerEvents = 'none';
                    }
                }
            }


            this.emit('activate');
        }

        _onDeactivate() {
            this._dragEventCounter = 0;

            this.class.remove(CLASS_DROP_MANAGER_ACTIVE);

            window.removeEventListener('mouseup', this._domEventMouseUp);

            const children = this.domContent.childNodes;
            for (let i = 0; i < children.length; i++) {
                const dropTarget = children[i].ui;
                if (!(dropTarget instanceof pcui.DropTarget)) continue;

                dropTarget.hidden = true;
            }

            this.dropType = null;
            this.dropData = null;

            this.emit('deactivate');
        }

        _onDragEnter(evt) {
            if (!this.enabled) return;

            evt.preventDefault();

            if (this.readOnly) return;

            this._dragEventCounter++;
            this.active = true;
        }

        _onDragOver(evt) {
            if (!this.enabled) return;

            evt.preventDefault();

            if (this.readOnly) return;

            evt.dataTransfer.dropEffect = 'move';

            this.active = true;
        }

        _onDragLeave(evt) {
            if (!this.enabled) return;

            evt.preventDefault();

            if (this.readOnly) return;

            this._dragEventCounter--;

            if (this._dragEventCounter <= 0) {
                this._dragEventCounter = 0; // sanity check
                this.active = false;
            }
        }

        _onMouseUp(evt) {
            if (!this.enabled) return;
            if (this.readOnly) return;

            this.active = false;
        }

        _onDrop(evt) {
            if (!this.enabled) return;

            evt.preventDefault();

            if (this.readOnly) return;

            // deactivate
            this.active = false;
        }

        _onAppendChild(element) {
            super._onAppendChild(element);
            if (!(element instanceof pcui.DropTarget)) return;

            element.dropManager = this;
            element.hidden = true;
        }

        _onRemoveChild(element) {
            super._onRemoveChild(element);
            if (!(element instanceof pcui.DropTarget)) return;

            element.dropManager = null;
        }

        getDropData(evt) {
            let data = this.dropData;
            if (this.dropType === 'files' && evt.dataTransfer && evt.dataTransfer.files) {
                data = evt.dataTransfer.files;
            }

            return data;
        }

        destroy() {
            if (this._destroyed) return;
            window.removeEventListener('dragenter', this._domEventDragEnter);
            window.removeEventListener('dragover', this._domEventDragOver);
            window.removeEventListener('dragleave', this._domEventDragLeave);
            window.removeEventListener('drop', this._domEventDrop);
            window.removeEventListener('mouesup', this._domEventMouseUp);

            super.destroy();
        }

        get active() {
            return this._active;
        }

        set active(value) {
            if (this._active === value) return;
            this._active = value;
            if (value) {
                this._onActivate();
            } else {
                this._onDeactivate();
            }
        }

        get dropType() {
            return this._dropType;
        }

        set dropType(value) {
            if (this._dropType === value) return;
            this._dropType = value || 'files';
            this.emit('dropType', this.dropType);
        }

        get dropData() {
            return this._dropData;
        }

        set dropData(value) {
            if (this._dropData === value) return;
            this._dropData = value || {};
            this.emit('dropData', value);
        }

    }

    return {
        DropManager: DropManager
    };
})());


/* pcui/element/element-drop-target.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_DROP_TARGET = 'pcui-droptarget';
    const CLASS_DROP_TARGET_HOLE = CLASS_DROP_TARGET + '-hole';
    const CLASS_DROP_TARGET_PASSTHROUGH = CLASS_DROP_TARGET + '-passthrough';
    const CLASS_DROP_TARGET_DRAG_OVER = CLASS_DROP_TARGET + '-dragover';
    const CLASS_DROP_TARGET_FRONT = CLASS_DROP_TARGET + '-front';

    /**
     * @name pcui.DropTarget
     * @classdesc Defines an area where we can drag drop data
     * @extends pcui.Element
     */
    class DropTarget extends pcui.Element {
        /**
         * Creates a new pcui.DropTarget.
         * @param {pcui.Element} targetElement The element that will allow drag dropping
         * @param {Object} args The arguments
         * @param {String} [args.dropType] The type of data that is valid for this drop target.
         * @param {pcui.DropManager} [args.dropManager] The drop manager.
         * @param {Boolean} [args.hole] If true then the drop target will be above other overlays and will receive drag drop events (unless passThrough is true).
         * @param {Boolean} [args.passThrough] If true then the drop target will not receive mouse events
         * @param {Function} [args.onFilter] A function with signature (type, data) => bool that returns true if the dragged type and data is valid for this drop target.
         * @param {Function} [args.onDragEnter] A function with signature (type, data) => void that is called when something is dragged over the drop target.
         * @param {Function} [args.onDragLeave] A function with signature () => void that is called when something is no longer dragged over the drop target.
         * @param {Function} [args.onDrop] A function with signature (type, data) => void that is called when something is dropped over the drop target.
         */
        constructor(targetElement, args) {
            if (!args) args = {};
            super(document.createElement('div'), args);

            this.class.add(CLASS_DROP_TARGET);

            this._onFilterFn = args.onFilter;
            this._onDragEnterFn = args.onDragEnter;
            this._onDragLeaveFn = args.onDragLeave;
            this._onDropFn = args.onDrop;

            // destroy drop target if its target element gets destroyed
            if (targetElement.once) {
                targetElement.once('destroy', this.destroy.bind(this));
            }

            this._domTargetElement = targetElement.dom || targetElement.element || targetElement;

            this._dropType = args.dropType || null;

            this._dropManager = args.dropManager || null;

            this._hole = args.hole;
            if (this._hole) {
                this.class.add(CLASS_DROP_TARGET_HOLE);
            }

            this._passThrough = args.passThrough;
            if (this._passThrough) {
                this.class.add(CLASS_DROP_TARGET_PASSTHROUGH);
            }

            this._domEventDragEnter = this._onDragEnter.bind(this);
            this._domEventDragLeave = this._onDragLeave.bind(this);
            this._domEventDrop = this._onDrop.bind(this);

            this.dom.addEventListener('dragenter', this._domEventDragEnter);
            this.dom.addEventListener('mouseenter', this._domEventDragEnter);
            this.dom.addEventListener('dragleave', this._domEventDragLeave);
            this.dom.addEventListener('mouseleave', this._domEventDragLeave);

            if (this.passThrough) {
                this._domTargetElement.addEventListener('drop', this._domEventDrop);
                this._domTargetElement.addEventListener('mouseup', this._domEventDrop);
            } else {
                this.dom.addEventListener('drop', this._domEventDrop);
                this.dom.addEventListener('mouseup', this._domEventDrop);
            }

            this.on('show', this._onShow.bind(this));
            this.on('hide', this._onHide.bind(this));
        }

        onFilter(type, data) {
            if (!this._preDropFilter(type, data)) {
                return false;
            }

            // check whether our target element is visible
            if (!this._isTargetElementVisible()) {
                return false;
            }

            return true;
        }

        _preDropFilter(type, data) {
            // do not show if disabled or readonly
            if (!this.enabled || this.readOnly) {
                return false;
            }

            // if our desired dropType does not match the current type then do not show
            if (this._dropType && this._dropType !== type) {
                return false;
            }

            // if we have been giver a filter function call that
            if (this._onFilterFn) {
                return this._onFilterFn(type, data);
            }

            return true;
        }

        _onDragEnter(evt) {
            if (!this.enabled) return;
            if (this.readOnly) return;

            this.class.add(CLASS_DROP_TARGET_DRAG_OVER);

            this.emit('dragenter');

            if (this._dropManager && this._onDragEnterFn) {
                this._onDragEnterFn(this._dropManager.dropType, this._dropManager.getDropData(evt));
            }
        }

        _onDragLeave(evt) {
            if (!this.enabled) return;

            if (this.readOnly) return;

            // check if we have alrady called drag leave. This can happen
            // if we call onDragLeave from onDrop and then our mouse leaves
            // the drop target in which case onDragLeave will be called twice
            // (once in onDrop and once on mouseleave)
            if (!this.class.contains(CLASS_DROP_TARGET_DRAG_OVER)) return;

            this.class.remove(CLASS_DROP_TARGET_DRAG_OVER);

            this.emit('dragleave');

            if (this._onDragLeaveFn) {
                this._onDragLeaveFn();
            }
        }

        _onDrop(evt) {
            this._onDragLeave();

            if (this._dropManager && this._onDropFn) {
                const type = this._dropManager.dropType;
                const data = this._dropManager.getDropData(evt);

                if (this._preDropFilter(type, data)) {
                    this._onDropFn(type, data);
                }
            }
        }

        _onShow() {
            const rect = this.rect;
            const margin = this.hole ? 2 : 1;
            this.style.left = (rect.left + margin) + 'px';
            this.style.top = (rect.top + margin) + 'px';
            this.style.width = (rect.width - 2 * margin) + 'px';
            this.style.height = (rect.height - 2 * margin) + 'px';

            if (!this.hole) {
                this._domTargetElement.classList.add(CLASS_DROP_TARGET_FRONT);
            }
        }

        _onHide() {
            this._domTargetElement.classList.remove(CLASS_DROP_TARGET_FRONT);
        }

        _isTargetElementVisible() {
            const rect = this.rect;
            if (!rect.width || !rect.height) {
                return false;
            }

            const parent = this._domTargetElement.parentNode;
            if (!parent.offsetHeight) {
                return false;
            }

            const style = getComputedStyle(this._domTargetElement);
            if (style.visibility === 'hidden' || style.display === 'none') {
                return false;
            }

            return true;
        }

        destroy() {
            if (this._destroyed) return;
            this.dom.removeEventListener('dragenter', this._domEventDragEnter);
            this.dom.removeEventListener('mouseenter', this._domEventDragEnter);
            this.dom.removeEventListener('dragleave', this._domEventDragLeave);
            this.dom.removeEventListener('mouseleave', this._domEventDragLeave);

            if (this.passThrough) {
                this._domTargetElement.removeEventListener('drop', this._domEventDrop);
                this._domTargetElement.removeEventListener('mouseup', this._domEventDrop);
            } else {
                this.dom.removeEventListener('drop', this._domEventDrop);
                this.dom.removeEventListener('mouseup', this._domEventDrop);
            }

            this._onDragEnterFn = null;
            this._onDragLeaveFn = null;
            this._onDropFn = null;
            this.dropManager = null;

            super.destroy();
        }

        get hole() {
            return this._hole;
        }

        get passThrough() {
            return this._passThrough;
        }

        get dropManager() {
            return this._dropManager;
        }

        set dropManager(value) {
            this._dropManager = value;
        }

        get rect() {
            return this._domTargetElement.getBoundingClientRect();
        }
    }

    return {
        DropTarget: DropTarget
    };
})());


/* pcui/element/element-progress.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'pcui-progress';
    const CLASS_INNER = CLASS_ROOT + '-inner';

    class Progress extends pcui.Container {
        constructor(args) {
            if (!args) args = {};
            super(document.createElement('div'), args);
            this.class.add(CLASS_ROOT);

            this._inner = new pcui.Element();
            this.append(this._inner);
            this._inner.class.add(CLASS_INNER);
        }

        set value(val) {
            this._value = val;
            this._inner.width = `${this._value}%`;
        }

        get value() {
            return this._value;
        }
    }

    pcui.Element.register('progress', Progress);

    return {
        Progress: Progress
    };
})());


/* pcui/element/element-infobox.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_INFOBOX = 'pcui-infobox';

    /**
     * @name pcui.InfoBox
     * @classdesc Represents an information box.
     * @property {String} icon The CSS code for an icon for the info box. e.g. E401 (notice we omit the '\' character).
     * @property {String} title Gets / sets the 'title' of the info box
     * @property {String} text Gets / sets the 'text' of the info box
     */
    class InfoBox extends pcui.Container {
        /**
         * Creates a new InfoBox.
         * @param {Object} args The arguments. Extends the pcui.Container constructor arguments. All settable properties can also be set through the constructor.
         * @param {Boolean} [args.unsafe] If true then the innerHTML property will be used to set the title/text. Otherwise textContent will be used instead.
         */
        constructor(args) {
            if (!args) args = {};
            super(args);

            this.class.add(CLASS_INFOBOX);
            this._titleElement = new pcui.Element();
            this._textElement = new pcui.Element();
            this.append(this._titleElement);
            this.append(this._textElement);

            this._unsafe = args.unsafe || false;

            this.icon = args.icon || '';
            this.title = args.title || '';
            this.text = args.text || '';
        }

        get icon() {
            return this._icon;
        }

        set icon(value) {
            if (this._icon === value) return;
            this._icon = value;
            if (value) {
                // set data-icon attribute but first convert the value to a code point
                this.dom.setAttribute('data-icon', String.fromCodePoint(parseInt(value, 16)));
            } else {
                this.dom.removeAttribute('data-icon');
            }
        }

        get title() {
            return this._title;
        }

        set title(value) {
            if (this._title === value) return;
            this._title = value;
            if (this._unsafe) {
                this._titleElement.dom.innerHTML = value;
            } else {
                this._titleElement.dom.textContent = value;
            }
        }

        get text() {
            return this._text;
        }

        set text(value) {
            if (this._text === value) return;
            this._text = value;
            if (this._unsafe) {
                this._textElement.dom.innerHTML = value;
            } else {
                this._textElement.dom.textContent = value;
            }
        }
    }

    pcui.Element.register('infobox', InfoBox);

    return {
        InfoBox: InfoBox
    };
})());


/* pcui/element/element-code.js */
Object.assign(pcui, (function () {
    'use strict';

    const CLASS_ROOT = 'pcui-code';
    const CLASS_INNER = CLASS_ROOT + '-inner';

    class Code extends pcui.Container {
        constructor(args) {
            if (!args) args = {};
            super(document.createElement('div'), args);
            this.class.add(CLASS_ROOT);

            this._inner = new pcui.Label();
            this.append(this._inner);
            this._inner.class.add(CLASS_INNER);
        }

        set text(value) {
            this._text = value;
            this._inner.text = value;
        }

        get text() {
            return this._text;
        }
    }

    pcui.Element.register('code', Code);

    return {
        Code: Code
    };
})());