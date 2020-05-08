/* pcui/interface/interface-collapsible.js */
Object.assign(pcui, (function () {
    'use strict';

    /**
     * @name pcui.ICollapsible
     * @classdesc Provides an interface to allow collapsing / expanding of an Element.
     */
    class ICollapsible {
        get collapsible() {
            throw new Error('Not implemented');
        }

        set collapsible(value) {
            throw new Error('Not implemented');
        }

        get collapsed() {
            throw new Error('Not implemented');
        }

        set collapsed(value) {
            throw new Error('Not implemented');
        }
    }

    /**
     * @event
     * @name pcui.ICollapsible#collapse
     * @description Fired when the element gets collapsed
     */

    /**
     * @event
     * @name pcui.ICollapsible#expand
     * @description Fired when the element gets expanded
     */

    return {
        ICollapsible: ICollapsible
    };
})());


/* pcui/interface/interface-container.js */
Object.assign(pcui, (function () {
    'use strict';

    /**
     * @name pcui.IContainer
     * @classdesc Provides an interface for appending / removing children from an Element.
     */
    class IContainer {
        append(element) {
            throw new Error('Not Implemented');
        }

        appendBefore(element, referenceElement) {
            throw new Error('Not Implemented');
        }

        appendAfter(element, referenceElement) {
            throw new Error('Not Implemented');
        }

        prepend(element) {
            throw new Error('Not Implemented');
        }

        remove(element) {
            throw new Error('Not Implemented');
        }

        clear() {
            throw new Error('Not Implemented');
        }
    }

    /**
     * @event
     * @name pcui.IContainer#append
     * @description Fired when a child Element gets added
     * @param {pcui.Element} The element that was added
     */

    /**
     * @event
     * @name pcui.IContainer#remove
     * @description Fired when a child Element gets removed
     * @param {pcui.Element} The element that was removed
     */



    return {
        IContainer: IContainer
    };
})());


/* pcui/interface/interface-flex.js */
Object.assign(pcui, (function () {
    'use strict';

    /**
     * @name pcui.IFlex
     * @classdesc Provides an interface for allowing support for the flexbox CSS layout
     */
    class IFlex {
        get flex() {
            throw new Error('Not implemented');
        }

        set flex(value) {
            throw new Error('Not implemented');
        }
    }

    return {
        IFlex: IFlex
    };
})());


/* pcui/interface/interface-grid.js */
Object.assign(pcui, (function () {
    'use strict';

    /**
     * @name pcui.IGrid
     * @classdesc Provides an interface for allowing support for the grid CSS layout
     */
    class IGrid {
        get grid() {
            throw new Error('Not implemented');
        }

        set grid(value) {
            throw new Error('Not implemented');
        }
    }

    return {
        IGrid: IGrid
    };
})());


/* pcui/interface/interface-bindable.js */
Object.assign(pcui, (function () {
    'use strict';

    /**
     * @name pcui.IBindable
     * @classdesc Provides an interface for getting / setting a value for the Element.
     * @property {Any} value Gets / sets the value of the Element.
     * @property {Any[]} values Sets multiple values to the Element. It is up to the Element to determine how to display them.
     */
    class IBindable {
        get value() {
            throw new Error('Not implemented');
        }

        set value(value) {
            throw new Error('Not implemented');
        }

        set values(values) {
            throw new Error('Not implemented');
        }
    }

    /**
     * @event
     * @name pcui.IBindable#change
     * @description Fired when the value of the Element changes
     * @param {Object} value The new value
     */

    return {
        IBindable: IBindable
    };
})());


/* pcui/interface/interface-focusable.js */
Object.assign(pcui, (function () {
    'use strict';

    /**
     * @name pcui.IFocusable
     * @classdesc Provides an interface for focusing / unfocusing an Element.
     */
    class IFocusable {
        focus() {
            throw new Error('Not implemented');
        }

        blur() {
            throw new Error('Not implemented');
        }
    }

    /**
     * @event
     * @name pcui.IFocusable#focus
     * @description Fired when the element is focused
     */

    /**
     * @event
     * @name pcui.IFocusable#blur
     * @description Fired when the element is blurred (unfocused)
    */

    return {
        IFocusable: IFocusable
    };
})());


/* pcui/interface/interface-resizable.js */
Object.assign(pcui, (function () {
    'use strict';

    /**
     * @name pcui.IResizable
     * @classdesc Provides an interface for enabling resizing support for an Element
     */
    class IResizable {
        get resizable() {
            throw new Error('Not implemented');
        }

        set resizable(value) {
            throw new Error('Not implemented');
        }

        get resizeMin() {
            throw new Error('Not implemented');
        }

        set resizeMin(value) {
            throw new Error('Not implemented');
        }

        get resizeMax() {
            throw new Error('Not implemented');
        }

        set resizeMax(value) {
            throw new Error('Not implemented');
        }
    }

    /**
     * @event
     * @name pcui.IResizable#resize
     * @description Fired when the Element gets resized.
     */


    return {
        IResizable: IResizable
    };
})());


/* pcui/interface/interface-scrollable.js */
Object.assign(pcui, (function () {
    'use strict';

    /**
     * @name pcui.IScrollable
     * @classdesc Provides an interface for allowing scrolling on an Element.
     */
    class IScrollable {
        get scrollable() {
            throw new Error('Not implemented');
        }

        set scrollable(value) {
            throw new Error('Not implemented');
        }
    }

    /**
     * @event
     * @name pcui.IScrollable#scroll
     * @description Fired when the Element is scrolled.
     * @param {Event} The native scroll event.
     */


    return {
        IScrollable: IScrollable
    };
})());


/* pcui/interface/interface-selectable.js */
Object.assign(pcui, (function () {
    'use strict';

    /**
     * @name pcui.ISelectable
     * @classdesc Provides an interface for selecting an Element.
     */
    class ISelectable {
        get selected() {
            throw new Error('Not implemented');
        }

        set selected(value) {
            throw new Error('Not implemented');
        }
    }

    return {
        ISelectable: ISelectable
    };
})());


/* pcui/interface/interface-selection.js */
Object.assign(pcui, (function () {
    'use strict';

    /**
     * @name pcui.ISelection
     * @classdesc Provides an interface for allow the selection of child elements.
     */
    class ISelection {
        get allowSelection() {
            throw new Error('Not implemented');
        }

        set allowSelection(value) {
            throw new Error('Not implemented');
        }

        get multiSelect() {
            throw new Error('Not implemented');
        }

        set multiSelect(value) {
            throw new Error('Not implemented');
        }

        get selection() {
            throw new Error('Not implemented');
        }

        set selection(value) {
            throw new Error('Not implemented');
        }
    }

    return {
        ISelection: ISelection
    };
})());
