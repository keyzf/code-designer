(function () {

/**utils */
var overflowRegex = /(auto|scroll)/;


// <3 Modernizr
// https://raw.githubusercontent.com/Modernizr/Modernizr/master/feature-detects/dom/dataset.js
function useNative() {
    const elem = document.createElement('div');
    elem.setAttribute('data-a-b', 'c');

    return Boolean(elem.dataset && elem.dataset.aB === 'c');
}

function nativeDataset(element) {
    return element.dataset;
}

function _allKeys(obj) {
    var keys = [],
        key;
    for (key in obj) {
        keys.push(key);
    }
    return keys;
}

function extendOrMixin(objs, override) {
    var obj = objs[0],
        length = objs.length,
        source,
        index = 1,
        i,
        key,
        keys,
        l;

    if (length < 2 || obj === null) {
        return obj;
    }
    for (index; index < length; index++) {
        source = objs[index];
        keys = _allKeys(source);
        l = keys.length;

        for (i = 0; i < l; i++) {
            key = keys[i];
            if (obj[key] === void 0 || override) {
                obj[key] = source[key];
            }
        }
    }
    return obj;
}


function isNode(content) {
    return !!content && !!content.nodeType;
}


function isArrayOfNodes(content) {
    return Array.isArray(content) && content.reduce(function(previousElementWasANode, currentElement) {
            return previousElementWasANode && isNode(currentElement);
        }, true);
}


function isObject(value) {
    return (!!value && value.toString() === '[object Object]');
}


function appendChildren(parent, children) {
    if (isNode(parent)) {
        children.filter(function(child) {
            return isNode(child);
        })
            .forEach(function(childNode) {
                parent.appendChild(childNode);
            });
    }
}

function createElement(tagName, properties, children) {
    var _element = document.createElement(tagName),
        _properties = isObject(properties) ? properties : {},
        _children = Array.isArray(children) ? children : [];

    function isAttribute(string) {
        return /^attr-/.test(string);
    }

    function parseAttribute(string) {
        return string.substring('attr-'.length, string.length);
    }

    Object.keys(_properties).forEach(function(prop) {
        var value = _properties[prop];

        if (isAttribute(prop)) {
            _element.setAttribute(parseAttribute(prop), value);
        } else {
            _element[prop] = value;
        }
    });

    appendChildren(_element, _children);

    return _element;
}


function removeAllChildrenFrom(parentNode) {
    while (parentNode && parentNode.firstChild) {
        parentNode.removeChild(parentNode.firstChild);
    }
}

function arrayOfChildrenFrom(element) {
    if (isNode(element)) {
        return Array.prototype.slice.call(element.children);
    } else {
        return [];
    }
}

function queryChildOf(parent, selector) {
    return queryChildrenOf(parent, selector)[0] || null;
}

function queryChildrenOf(parent, selector) {
    var results = [],
        hasChild = function(child) {
            return arrayOfChildrenFrom(parent).indexOf(child) !== -1;
        };

    if (isNode(parent) && !!selector) {
        results = Array.prototype.slice.call(parent.querySelectorAll(selector));
    }

    return results.filter(hasChild);
}

function ifSafeChain(root, chain, callback) {
    var bindIfFunction = function(prevLink, prop) {
            return ((typeof prop) === 'function') ? prop.bind(prevLink) : prop;
        },
        toFinalLink = function(prevLink, propName) {
            var prop = prevLink[propName];
            return (prevLink && prop) ? bindIfFunction(prevLink, prop) : null;
        },
        finalLink = (chain || []).reduce(toFinalLink, root);

    return (callback && finalLink) ? callback(finalLink) : undefined;
}

function getFunctionName(func) {
    if (typeof func === 'function') {
        if (func.name) {
            return func.name;
        } else {
            var funcName = func.toString().match(/^function\s*([^\s(]+)/);
            return funcName ? funcName[1] : 'anonymous func';
        }
    }
}

function checkReactChildrenType(children, componentName, types, typesString) {
    var childNodes = children || [],
        i, errorFlag, currentType;
    // handle single child prop http://facebook.github.io/react/tips/children-props-type.html
    childNodes = Array.isArray(childNodes) ? childNodes : [childNodes];
    types = Array.isArray(types) ? types : [types];
    for (var child in childNodes) {
        if (childNodes[child] && childNodes[child].type) {
            errorFlag = true;
            currentType = childNodes[child].type;
            for (i = 0; i < types.length; i++) {
                if (currentType === types[i]) {
                    errorFlag = false;
                    break;
                }
            }
        }
        if (errorFlag) {
            return new Error(componentName + '\'s children can only have one instance of the following types: ' +
                typesString + '; not accept type: ' + currentType);
        }
    }
}

var utils = {
    getTextWidth: function(text, font, canvasElement) {
        var canvas = canvasElement || document.createElement('canvas'),
            context = canvas.getContext('2d'),
            width;

        context.font = font;

        width = Math.floor(context.measureText(text).width);
        // Width may be 0, in that case we don't want to add 1 px.
        return width ? width + 1 : width;
    },

    removeNodesSafe: function(component, nodeList) {
        var removedChildNodes = [],
            nodes;

        nodes = Array.prototype.slice.apply(nodeList);
        nodes.filter(function(node) {
            return component === node.parentNode;
        }).map(function(node) {
            removedChildNodes.push(component.removeChild(node));
            if (node.render) {
                node.render();
            }
        });

        return removedChildNodes;
    },
    appendChildCollection: function(component, nodeList) {
        var idx;

        for (idx = 0; idx < nodeList.length; ++idx) {
            component.appendChild(nodeList[idx]);
        }
    },

    stopEvent: function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
    },

    /**
     * Answers the name of the animation events.
     * @return {Object} Object.animationstart {String}
     *                  Object.animationend {String}
     */
    getAnimationEventNames: function() {
        var animationstart =
                'webkitAnimationName' in document.documentElement.style ?
                    'webkitAnimationStart' : 'animationstart',
            animationend =
                'webkitAnimationName' in document.documentElement.style ?
                    'webkitAnimationEnd' : 'animationend',
            transitionend =
                'onwebkittransitionend' in window ?
                    'webkitTransitionEnd' : 'transitionend';

        return {
            animationstart: animationstart,
            animationend: animationend,
            transitionend: transitionend
        };
    },

    getComponentFromElement: function(component, targetTagName) {
        while (component && component.tagName !== targetTagName) {
            component = component.parentNode;
        }
        return component;
    },

    getComponentFromElementByClassName: function(component, className) {
        while (component && !component.classList.contains(className)) {
            component = component.parentNode;
        }
        return component;
    },

    validationRequired: function(component) {
        return component.required || component.pattern || component.validator || component.min || component.max || component.numeric || component.password || component.minDate || component.maxDate;
    },

    extend: function() {
        return extendOrMixin(Array.prototype.slice.call(arguments), false);
    },

    mixin: function() {
        return extendOrMixin(Array.prototype.slice.call(arguments), true);
    },

    stopNativeEvent: function(component, element, eventName) {
        component.listenTo(element, eventName, function(ev) {
            ev.stopPropagation();
        });
    },

    getSafeTargetFromEvent: function(event) {
        return event.relatedTarget || event.explicitOriginalTarget || document.activeElement;
    },

    getNextSiblingOfType: function(node, nodeName) {
        while ((node = node.nextSibling) && node.nodeName !== nodeName) {
        }
        return node;
    },

    getPrevSiblingOfType: function(node, nodeName) {
        while ((node = node.previousSibling) && node.nodeName !== nodeName) {
        }
        return node;
    },
    getArrayDiff: function(a, b) {
        a = a ? a : [];
        b = b ? b : [];
        return a.filter(function(item) {
            return b.indexOf(item) < 0;
        });
    },

    getDirectChildByType: function(parentNode, type) {
        var children = parentNode.children,
            child;
        Array.prototype.forEach.call(children, function(node) {
            if (node.tagName.toLowerCase() === type) {
                child = node;
            }
        });
        return child;
    },
    getScrollParent: function(node) {
        var parent = node,
            style,
            excludeStaticParent = getComputedStyle(node).position === 'absolute',
            found = false;

        do {
            parent = parent.parentElement || parent.parentNode;
            if (parent === null) {
                return node.ownerDocument;
            }

            if (parent === node.ownerDocument) {
                found = true;
                continue;
            }

            style = getComputedStyle(parent);

            if (excludeStaticParent && style.position === 'static') {
                continue;
            }

            if (overflowRegex.test(style.overflow) ||
                overflowRegex.test(style.overflowX) ||
                overflowRegex.test(style.overflowY)) {
                found = true;
            }
        } while (!found);

        return parent;
    },
    throttle: function(callback, delay) {
        var ready = true;

        return function() {
            if (ready) {
                ready = false;

                setTimeout(function() {
                    ready = true;
                }, delay);

                callback.apply(this, arguments);
            }
        };
    },
    throttleDebounce: function(callback, delay) {
        var ready = true,
            args = null;

        return function throttled() {
            var context = this;

            if (ready) {
                ready = false;

                setTimeout(function() {
                    ready = true;

                    if (args) {
                        throttled.apply(context);
                    }
                }, delay);

                if (args) {
                    callback.apply(this, args);
                    args = null;
                } else {
                    callback.apply(this, arguments);
                }
            } else {
                args = arguments;
            }
        };
    },
    type: function(value) {
        /*jshint indent:false, eqnull:true*/
        switch (value == null ? '' + value : Object.prototype.toString.call(value).slice(8, -1).toLowerCase()) {
            case 'string': return String;
            case 'boolean': return Utils.YesNoType; // booleans cannot have defaults, so use this instead
            case 'number': return Number;
            case 'object': return Object;
            case 'array': return Array;
        }
    },
    updateClassWithProps: function(component, classProps) {
        if (component.classList.length > 0) {
            var props, mergedClasses, preservedClasses = [];

            if (component.supportedClasses) {
                preservedClasses = component.supportedClasses.filter(function(supportedClass) {
                    return (component.classList.contains(supportedClass) &&
                    preservedClasses.indexOf(supportedClass) === -1);
                });

                if (classProps) {
                    mergedClasses = preservedClasses.concat(classProps.split(' '));
                } else {
                    mergedClasses = preservedClasses;
                }
                return mergedClasses.join(' ').trim();

            } else {
                // TOOD: old - keeping for now for testing on multiple components
                if (classProps) {
                    props = classProps.split(' ');
                    props.forEach(function(prop) {
                        if (!component.classList.contains(prop)) {
                            component.classList.add(prop);
                        }
                    });
                }

                return component.classList.toString();
            }
        } else {
            return classProps ? classProps : '';
        }
    },

    YesNoType: {
        parse: function(attrValue) {
            return attrValue.toLowerCase() === 'yes';
        },
        stringify: function(value) {
            return value ? 'yes' : 'no';
        }
    },

    toggleSuffixText: function(text, suffixText, state) {
        if (state) {
            if (text && text.slice(-2) !== suffixText) {
                text += suffixText;
            }
        } else {
            if (text && text.slice(-2) === suffixText) {
                text = text.slice(0, -2);
            }
        }

        return text;
    },

    debounce: function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this,
                args = arguments,
                later = function() {
                    timeout = null;
                    if (!immediate) {
                        func.apply(context, args);
                    }
                },
                callNow = immediate && !timeout;

            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                func.apply(context, args);
            }
        };
    },

    createElement: createElement,

    appendChildren: appendChildren,

    attachContentToNode: function(newValue, parentNode) {
        if (newValue) {
            if (typeof newValue === 'string') {
                parentNode.textContent = newValue;
            } else if (Array.isArray(newValue)) {
                newValue.forEach(function(value) {
                    if (value && value.nodeType) {
                        parentNode.appendChild(value);
                    }
                });
            } else {
                if (newValue.nodeType) {
                    parentNode.appendChild(newValue);
                }
            }
        }

        return parentNode;
    },

    removeAllChildrenFrom: removeAllChildrenFrom,
    wrapIfNotWrapped: function(wrapperTagName, content) {
        var wrappedContent = null,
            toLowerCase = String.prototype.toLowerCase;

        if (wrapperTagName) {
            if (isNode(content)) {
                if (toLowerCase.call(content.tagName) === toLowerCase.call(wrapperTagName)) {
                    wrappedContent = content;
                } else {
                    wrappedContent = createElement(wrapperTagName, {}, [content]);
                }
            } else if (isArrayOfNodes(content)) {
                wrappedContent = createElement(wrapperTagName, {}, content);
            }
        }

        return wrappedContent;
    },
    setAttributes: function(element, attributes) {
        var value;
        if (isNode(element) && isObject(attributes)) {
            Object.keys(attributes).forEach(function(name) {
                value = attributes[name];
                element.setAttribute(name, value);
            });
        }

        return element;
    },

    arrayOfChildrenFrom: arrayOfChildrenFrom,

    queryChildOf: queryChildOf,

    queryChildrenOf: queryChildrenOf,

    isNode: isNode,

    getFunctionName: getFunctionName,

    checkReactChildrenType: checkReactChildrenType,

    isOpen: function(popoverOrModal) {
        return popoverOrModal && (
                (popoverOrModal.nodeName === 'WC-POPOVER' && popoverOrModal.open) ||
                (popoverOrModal.nodeName === 'WC-MODAL' && popoverOrModal.classList.contains('show'))
            );
    },

    showPopoverOrModal: function(component, positionTarget, popup) {
        if (component) {
            if (this.isOpen(component)) {
                popup.setPosition(component, positionTarget, ['bottom', 'top'], ['left', 'right']);
            } else {
                popup.show(component, positionTarget, ['bottom', 'top'], ['left', 'right']);
            }
        }
    },

    replaceChildrenOf: function(parent, newContent) {
        if (isNode(parent)) {
            if (isNode(newContent)) {
                removeAllChildrenFrom(parent);
                parent.appendChild(newContent);
            } else if (isArrayOfNodes(newContent)) {
                removeAllChildrenFrom(parent);
                appendChildren(parent, newContent);
            }
        }
    },
    contentQueryFactory: function(parent, renderMapping) {
        return function renderedOrUserProvided(tagName) {
            var renderedSelector = [renderMapping[tagName], tagName].join(' > '),
                rendered = parent.querySelector(renderedSelector),
                userProvided = queryChildOf(parent, tagName);

            return rendered || userProvided;
        };
    },

    ifSafeChain: ifSafeChain,

    ifExists: function(subject, callback) {
        return ifSafeChain(subject, [], callback);
    },

    customMixin: function(dest, source, copyFunc, visited) {
        var name,
            s,
            empty = {};
        for (name in source) {
            s = source[name];
            if (!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))) {
                dest[name] = copyFunc ? copyFunc(s, visited) : s;
            }
        }

        return dest; // Object
    },

    clone: function(src, visited) {
        visited = visited || [];
        if (visited.indexOf(src) >= 0) {
            return null;
        }
        if (!src || typeof src !== 'object' || typeof src === 'function') {
            // null, undefined, any non-object, or function
            return src;	// anything
        }
        if (src.nodeType && 'cloneNode' in src) {
            // DOM Node
            visited.push(src);
            return src.cloneNode(true); // Node
        }
        if (src instanceof Date) {
            // Date
            return new Date(src.getTime());	// Date
        }
        if (src instanceof RegExp) {
            // RegExp
            return new RegExp(src);   // RegExp
        }
        var r;
        if (Array.isArray(src)) {
            // array
            visited.push(src);
            r = [];
        } else {
            // generic objects
            visited.push(src);
            try {
                r = src.constructor ? new src.constructor() : {};
            } catch (exception) {
                r = {};
            }
        }
        return Utils.customMixin(r, src, Utils.clone, visited);
    },

    animateScrollTo: function(element, scrollTop, duration) {
        var start = (new Date()).valueOf(),
            target = scrollTop,
            original = element.scrollTop;

        setTimeout(function animate() {
            var now = (new Date()).valueOf(),
                t = Math.min((now - start) / duration, 1);

            element.scrollTop = original + (target - original) * t;

            if (t < 1) {
                setTimeout(animate, 33);
            }
        }, 33);
    },

    hidePopoverOrModal: function(component, popup) {
        if (component.nodeName === 'WC-MODAL') {
            component.close();
        } else {
            popup.hide(component);
        }
    },

    closest: function(elem, selector) {
        if (typeof elem.closest === 'function') {
            return elem.closest(selector);
        }

        var firstChar = selector.charAt(0),
            attribute,
            value;

        if (firstChar === '[') {
            selector = selector.substr(1, selector.length - 2);
            attribute = selector.split('=');

            if (attribute.length > 1) {
                value = true;
                attribute[1] = attribute[1].replace(/"/g, '').replace(/'/g, '');
            }
        }

        for (; elem && elem !== document && elem.nodeType === 1; elem = elem.parentNode) {
            if (firstChar === '.') {
                if (elem.classList.contains(selector.substr(1))) {
                    return elem;
                }
            } else if (firstChar === '#') {
                if (elem.id === selector.substr(1)) {
                    return elem;
                }
            } else if (firstChar === '[' && elem.hasAttribute(attribute[0])) {
                if (value) {
                    if (elem.getAttribute(attribute[0]) === attribute[1]) {
                        return elem;
                    }
                } else {
                    return elem;
                }
            } else if (elem.tagName.toLowerCase() === selector) {
                return elem;
            }
        }

        return null;
    },
    supplant: function(template, values, pattern) {
        pattern = pattern || /\{\{([^\{\}]*)\}\}/g;
        return template.replace(pattern, function(a, b) {
          var p = b.split('.'),
            r = values;
          try {
            for (var s in p) {
              if (p.hasOwnProperty(s) ) {
                r = r[p[s]];
              }
            }
          } catch (e) {
            r = a;
          }
          return (typeof r === 'string' || typeof r === 'number') ? r : a;
        });
      },

    dataset: useNative()?nativeDataset :function(element){
            const map = {};
            const attributes = element.attributes;

            function getter() {
                return this.value;
            }

            function setter(name, value) {
                if (typeof value === 'undefined') {
                    this.removeAttribute(name);

                } else {
                    this.setAttribute(name, value);
                }
            }

            for (let i = 0, j = attributes.length; i < j; i++) {
                const attribute = attributes[i];

                if (attribute) {
                    const name = attribute.name;

                    if (name.indexOf('data-') === 0) {
                        const prop = name.slice(5).replace(/-./g, u => {
                            return u.charAt(1).toUpperCase();
                        });

                        const value = attribute.value;

                        Object.defineProperty(map, prop, {
                            enumerable: true,
                            get: getter.bind({value: value || ''}),
                            set: setter.bind(element, name)
                        });
                    }
                }
            }

            return map;
        }

};


/**keys */
var keys = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    SPACEBAR: 32,
    ESCAPE: 27,
    PAGEUP: 33,
    PAGEDOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    DELETE: 46,
    MINUS: 189,
    EQUALS: 187,
    NUM_PAD_MINUS: 109,
    NUM_PAD_PLUS: 107,
    H: 72,
    K: 75,
    M: 77,
    R: 82,
    T: 84,
    W: 87,
    Y: 89,
    isLetter: function(keycode) {
        return (keycode > 64 && keycode < 91);
    },
    isNumber: function(keycode) {
        return ((keycode > 47 && keycode < 58) || (keycode > 95 && keycode < 106));
    },
    isSpecialChar: function(keycode) {
        return ((keycode > 106 && keycode < 112) || (keycode > 185 && keycode < 223));
    }
};


/**
 * a11y
 */
var a11y, _elementsFocusable = [
        'INPUT',
        'SELECT',
        'BUTTON',
        'TEXTAREA',
        'A',
        'AREA',
        'OBJECT'
    ];

function _stopEvt(evt) {
    evt.stopPropagation();
    evt.preventDefault();
}

function _firstElementKeydownHandler(event, component) {
    if (event.shiftKey) {
        component.focus();
    }
}

function _lastElementBlurKeydownHandler(event, component) {
    if (!event.shiftKey) {
        component.focus();
    }
}

function _getTabIndex(elem) {
    if (elem.hasAttribute('tabIndex')) {
        return +elem.getAttribute('tabIndex');
    } else {
        return _elementsFocusable.indexOf(elem.tagName) > -1 ? 0 : undefined;
    }
}

function _isHidden(elem, component) {
    var isHidden,
        styles;
    if (component) {
        isHidden = false;
        do {
            isHidden = elem.style.display === 'none' || elem.style.visibility === 'hidden' ||
                elem.classList.contains('hidden');
            elem = elem.parentElement;
        } while (elem && elem !== component && !isHidden);
        return isHidden;
    } else {
        styles = window.getComputedStyle(elem);
        return ((styles.display && styles.display === 'none') || (styles.visibility && styles.visibility === 'hidden'));
    }
}

a11y = {
    getBoundariesTabableElement: function(component, last, displayedOnly) {
        var elements = {},
            i = 0,
            innerElements = component.querySelectorAll('*'),
            currentElement,
            styles;

        elements.first = null;
        for (i; null === elements.first && i < innerElements.length; ++i) {
            currentElement = innerElements[i];
            if (displayedOnly) {
                styles = window.getComputedStyle(currentElement);
            }
            if (currentElement && this.isTabNavigable(currentElement, component)) {
                if (!displayedOnly || (styles.display !== 'none' && styles.visibility !== 'hidden')) {
                    elements.first = currentElement;
                }
            }
        }

        elements.last = null;
        if (last) {
            i = innerElements.length - 1;
            for (i; null === elements.last && i > 0; --i) {
                currentElement = innerElements[i];
                if (displayedOnly) {
                    styles = window.getComputedStyle(currentElement);
                }
                if (innerElements[i] && this.isTabNavigable(innerElements[i], component)) {
                    if (!displayedOnly ||(styles.display !== 'none' && styles.visibility !== 'hidden')) {
                        elements.last = currentElement;
                    }
                }
            }
        }

        return elements;
    },

    _getFirstTabable: function(component) {
        var innerElements = component.querySelectorAll('*'),
            element,
            i;

        element = null;
        for (i = 0; i < innerElements.length; ++i) {
            if (this.isTabNavigable(innerElements[i])) {
                element = innerElements[i];
                break;
            }
        }

        return element;
    },

    _getFirstFocusable: function(component) {
        var innerElements = component.querySelectorAll('*'),
            element,
            i;

        element = null;
        for (i = 0; i < innerElements.length; ++i) {
            if (this.isFocusable(innerElements[i])) {
                element = innerElements[i];
                break;
            }
        }

        return element;
    },

    isTabNavigable: function(elem, component) {
        return !elem.disabled && !_isHidden(elem, component) && _getTabIndex(elem)  >= 0;
    },

    isFocusable: function(elem) {
        return !elem.disabled && !_isHidden(elem) && _getTabIndex(elem) >= -1;
    },

    keepFocusInsideListener: function(evt, component) {
        var elements,
            target;

        if (evt.keyCode === keys.TAB) {
            elements = this.getBoundariesTabableElement(component, true);
            target = evt.target;

            if (elements.first && elements.last) {

                if (evt.shiftKey) {

                    if (target === elements.first) {
                        _stopEvt(evt);
                        _firstElementKeydownHandler(evt, component);

                    } else if (target === component) {
                        _stopEvt(evt);
                        elements.last.focus();
                    }

                } else if (target === (elements.last)) {
                    _stopEvt(evt);
                    _lastElementBlurKeydownHandler(evt, component);
                }
            } else {
                _stopEvt(evt);
                _lastElementBlurKeydownHandler(evt, component);
            }
        }
    },

    setFocusOnFirst: function(component) {
        var elements = this.getBoundariesTabableElement(component);

        if (elements.first) {
            elements.first.focus();
            return elements.first;
        }
    },

    setFocusOnAnyFirst: function(component) {
        var element;

        element = this._getFirstTabable(component) ||  this._getFirstFocusable(component);

        if (element) {
            element.focus();
        }

        return element;
    },

    setFocusOnPreviousElement: function(component) {
        var parent = component.parentElement,
            previousSibling = component.previousElementSibling;

        while (previousSibling) {
            if (this.isFocusable(previousSibling) && !_isHidden(previousSibling)) {
                previousSibling.focus();
                return;
            }
            previousSibling = previousSibling.previousElementSibling;
        }

        if (this.isFocusable(parent)) {
            parent.focus();
            return;
        } else {
            //We force focusable
            parent.classList.add('hidden-focus-style');
            parent.setAttribute('tabindex', -1);
            parent.focus();
        }

    },

    addA11yFocus: function(component) {
        component._mouseActive = false;
        component.classList.add('wc-a11y-focus');
        component.listenTo(component, 'mousedown', function() {
            component._mouseActive = true;
            setTimeout(function() {
                component._mouseActive = false;
            }, 150);
        });

        component.listenTo(component, 'focus', function() {
            if (!component._mouseActive) {
                component.classList.add('wc-a11y-focused');
            }
        }, true);

        component.listenTo(component, 'blur', function() {
            component.classList.remove('wc-a11y-focused');
        }, true);
    },

    hideChildElementsFromAria: function(parentNode, exclusions) {
        var isExcluded = false,
            i,
            removals = [],
            attribute = 'aria-hidden';

        exclusions = exclusions || [];

        Array.prototype.slice.call(parentNode.children, 0).forEach(function(child) {
            isExcluded = false;

            for (i = 0; i < exclusions.length; i++) {
                if (exclusions[i] === child) {
                    isExcluded = true;
                    break;
                }
            }

            if (!isExcluded) {
                removals.push({
                    element: child,
                    oldValue: child.getAttribute(attribute)
                });
                child.setAttribute(attribute, true);
            }
        });

        exclusions.forEach(function(node) {
            if (node) {
                removals.push({
                    element: node,
                    oldValue: node.getAttribute(attribute)
                });

                node.removeAttribute('aria-hidden');
            }
        });

        return {
            remove: function() {
                removals.forEach(function(values) {
                    if (!values.oldValue) {
                        values.element.removeAttribute(attribute);
                    } else {
                        values.element.setAttribute(attribute, values.oldValue);
                    }
                });
            }
        };
    }
};

/**viewport */
function _isMobile() {
    return /iPhone|iPod|iPad|Android|BlackBerry/.test(navigator.userAgent);
}

function _handleResizeHandlerAttachment(actionType, callback) {
    var focusableElements = ['input', 'select', 'textarea'],
        body = document.getElementsByTagName('body')[0],
        action = actionType === 'add' ? HTMLElement.prototype.addEventListener : HTMLElement.prototype.removeEventListener,
        safeWindowsAction = actionType === 'add' ? window.addEventListener : window.removeEventListener,
        delegatedCallback = function(event) {
            var targetType = event.target.nodeName.toLowerCase();
            if (focusableElements.indexOf(targetType) > -1) {
                callback();
            }
        };

    if (_isMobile()) {
        action.call(body, 'focusin', delegatedCallback, false);
        action.call(body, 'focusout', delegatedCallback, false);
        action.call(document, 'orientationchange', callback, false);
    } else {
        safeWindowsAction.call(window, 'resize', callback, false);
    }
}


var viewport = {

    onResize: function(callback) {
        _handleResizeHandlerAttachment('add', callback);
    },

    offResize: function(callback) {
        _handleResizeHandlerAttachment('remove', callback);
    }

};


/**event */
function matches(node, selector, contextNode) {
    /* istanbul ignore next */
    var matchesSelector = node.matches || node.webkitMatchesSelector || node.mozMatchesSelector || node.msMatchesSelector;

    while (node && node.nodeType === 1 && node !== contextNode) {
        if (matchesSelector.call(node, selector)) {
            return node;
        } else {
            node = node.parentNode;
        }
    }
    return false;
}

function matchesSelectorListener(selector, listener, contextNode) {
    return function(e) {
        var matchesTarget = matches(e.target, selector, contextNode);
        if (matchesTarget) {
            listener(e, matchesTarget);
        }
    };
}

function off(target, name, callback, useCapture) {
    target.removeEventListener(name, callback, !!useCapture);
}

function on(target, name, callback, useCapture) {
    var selector = name.match(/(.*):(.*)/);

    if (selector) {
        name = selector[2];
        selector = selector[1];
        callback = matchesSelectorListener(selector, callback, target);
    }

    target.addEventListener(name, callback, !!useCapture);

    return {
        remove: function() {
            return off(target, name, callback, useCapture);
        }
    };
}

function emit(target, eventName, eventObject) {
    var event;

    eventObject = eventObject || {};

    /* istanbul ignore else */
    if (!('bubbles' in eventObject)) {
        eventObject.bubbles = true;
    }

    /* istanbul ignore else */
    if (!('cancelable' in eventObject)) {
        eventObject.cancelable = false;
    }

    if (target.emit) {
        target.emit(eventName, eventObject);
    } else {
        event = document.createEvent('UIEvent');
        event.initUIEvent(eventName, eventObject.bubbles, eventObject.cancelable, window, 1);
        Object.keys(eventObject).forEach(function(eventProperty) {
            if (!(eventProperty in {bubbles: 1, cancelable: 1})) {
                event[eventProperty] = eventObject[eventProperty];
            }
        });
        target.dispatchEvent(event);
    }
}

var eventUtil = {
    on,
    off,
    emit
};
    /**Position */
    var baseZindex = 10000,
        topZindex = baseZindex;

    function _hasDimension(elem) {
        return (elem.offsetWidth > 0) && (elem.offsetHeight > 0);
    }

    var position = {
        get baseZindex() {
            return baseZindex;
        },

        set baseZindex(value) {
            if (baseZindex !== topZindex) {
                console.warn('The global z-index is already in use; baseZindex should be set at application initialization');
            } else {
                topZindex = value;
            }

            baseZindex = value;
        },
        getTopZindex: function () {
            return topZindex++;
        },
        bringToFront: function (element) {
            if (element.parentNode !== element.ownerDocument.body) {
                element.ownerDocument.body.appendChild(element);
            }
            
            element.style.zIndex = this.getTopZindex();
        },
        getBoxShadowSize: function (element) {
            var style = window.getComputedStyle(element),
                shadowSize,
                shadowSizeArray,
                hShadow,
                vShadow,
                spread,
                blur,
                result = {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                };

            shadowSize = style.getPropertyValue('box-shadow');
            if (shadowSize === 'none') {
                return result;
            }

            // Remove all possible color definitions
            shadowSize = shadowSize.replace(/rgba?\([^\)]+\)/gi, '');
            shadowSize = shadowSize.replace(/#[0-9a-f]+/gi, '');

            // Remove any alpha characters
            shadowSize = shadowSize.replace(/[a-z]+/gi, '').trim();

            shadowSizeArray = shadowSize.split(' ');

            // Some browsers (IE) don't include a default value (0) for unspecified properties
            hShadow = shadowSizeArray.length > 0 ? parseInt(shadowSizeArray[0], 10) : 0;
            vShadow = shadowSizeArray.length > 1 ? parseInt(shadowSizeArray[1], 10) : 0;
            blur = shadowSizeArray.length > 2 ? parseInt(shadowSizeArray[2], 10) : 0;
            spread = shadowSizeArray.length > 3 ? parseInt(shadowSizeArray[3], 10) : 0;

            result.left = Math.max(spread - hShadow + 0.5 * blur, 0);
            result.right = Math.max(spread + hShadow + 0.5 * blur, 0);
            result.top = Math.max(spread - vShadow + 0.5 * blur, 0);
            result.bottom = Math.max(spread + vShadow + 0.5 * blur, 0);

            return result;

        },
        getDimension: function (elem) {
            var dimensions = {},
                style = {
                    'position': '',
                    'display': '',
                    'top': '',
                    'left': ''
                },
                moved = false,
                domRect,
                rect = {},
                key = '';
            if (!_hasDimension(elem)) {
                domRect = elem.getBoundingClientRect();

                if (!domRect.width || !domRect.height) {
                    moved = true;
                    for (key in style) {
                        style[key] = elem.style[key] || '';
                    }

                    // @TODO Maybe a better strategy here. The main issue with this
                    // is performance.
                    elem.style.position = 'absolute';
                    elem.style.left = '-1000px';
                    elem.style.top = '-1000px';
                    elem.style.display = 'inline-block';
                } else {
                    rect.width = domRect.width;
                    rect.height = domRect.height;
                }
            }

            dimensions = {
                width: rect.width || elem.offsetWidth,
                height: rect.height || elem.offsetHeight
            };

            if (moved) {
                for (key in style) {
                    elem.style[key] = style[key];
                }
            }

            return dimensions;

        },


        getPageSize: function (elementOwnerDocument) {
            var documentEl = elementOwnerDocument.documentElement,
                bodyEl = elementOwnerDocument.body;
            return {
                width: Math.max(
                    bodyEl.scrollWidth, documentEl.scrollWidth,
                    bodyEl.offsetWidth, documentEl.offsetWidth,
                    bodyEl.clientWidth, documentEl.clientWidth
                ),
                height: Math.max(
                    bodyEl.scrollHeight, documentEl.scrollHeight,
                    bodyEl.offsetHeight, documentEl.offsetHeight,
                    bodyEl.clientHeight, documentEl.clientHeight
                )
            };
        },


        getPositionInDocument: function (elem) {
            var rect = elem.getBoundingClientRect(),
                // IE11 does not play nice with window.scrollX and window.scrollY
                scroll = {
                    x: window.pageXOffset || document.documentElement.scrollLeft,
                    y: window.pageYOffset || document.documentElement.scrollTop
                },
                // round values since some browsers (Firefox) like to provide double values
                result = {
                    left: Math.round(rect.left) + scroll.x,
                    right: Math.round(rect.right) + scroll.x,
                    top: Math.round(rect.top) + scroll.y,
                    bottom: Math.round(rect.bottom) + scroll.y,
                    width: Math.round(rect.width),
                    height: Math.round(rect.height)
                };

            return result;
        }
    };


    /**popup position */

    function _tryTopPosition(popup, currentPosition, currentPositionType) {
        var finalMargin = popup.margin + popup.boxShadow.bottom,
            available = popup.spaceToNextObject.top,
            needed = popup.dimensions.height + finalMargin;
    
        if (needed <= available) {
            currentPositionType.position = 'top';
            currentPosition.y = available - needed;
        }
    }
    
    function _tryBottomPosition(popup, currentPosition, currentPositionType, force) {
        var finalMargin = popup.margin + popup.boxShadow.top,
            available = position.getPageSize(this.ownerDocument).height - popup.spaceToNextObject.bottom,
            needed = popup.dimensions.height + finalMargin;
    
        if ((needed < available) || force) {
            currentPositionType.position = 'bottom';
            currentPosition.y = popup.parentPosition.bottom + finalMargin;
        }
    }
    
    function _tryRightPosition(popup, currentPosition, currentPositionType) {
        var finalMargin = popup.margin + popup.boxShadow.left,
            available = position.getPageSize(this.ownerDocument).width - popup.spaceToNextObject.right,
            needed = popup.dimensions.width + finalMargin;
    
        if (needed < available) {
            currentPositionType.position = 'right';
            currentPosition.x = popup.parentPosition.right + finalMargin;
        }
    }
    
    function _tryLeftPosition(popup, currentPosition, currentPositionType) {
        var finalMargin = popup.margin + popup.boxShadow.right,
            available = popup.parentPosition.left,
            needed = popup.dimensions.width + finalMargin;
    
        if (needed <= available) {
            currentPositionType.position = 'left';
            currentPosition.x = available - needed;
        }
    }
    
    var popupPositionUtils = {
        tryLeftPosition: _tryLeftPosition,
        tryRightPosition: _tryRightPosition,
        tryTopPosition: _tryTopPosition,
        tryBottomPosition: _tryBottomPosition
    };



    /* -------- Alignment --------*/
function _tryLeftAlignment(popup, currentPosition, currentPositionType) {
    var available = position.getPageSize(this.ownerDocument).width - popup.parentPosition.left,
        needed = popup.dimensions.width;

    currentPositionType.alignment = 'left';
    if (needed <= available) {
        currentPosition.x = popup.parentPosition.left;
    } else {
        currentPosition.x = popup.parentPosition.left - (needed - available);
    }
}


function _tryCenterAlignment(popup, currentPosition, currentPositionType) {
    var available = position.getPageSize(this.ownerDocument).width,
        needed = popup.dimensions.width,
        halfChild,
        targetCenterPos;

    /* istanbul ignore else */
    if (needed < available) {
        currentPositionType.alignment = 'center';

        halfChild = popup.dimensions.width / 2;
        targetCenterPos = popup.parentPosition.left + (popup.parentPosition.width / 2);

        if (targetCenterPos > halfChild) {
            if (targetCenterPos + halfChild < available) {
                currentPosition.x = targetCenterPos - halfChild;
                currentPosition.x = available - popup.dimensions.width;
            }
        } else {
            currentPosition.x = 0;
        }
    }
}

function _tryRightAlignment(popup, currentPosition, currentPositionType) {
    var available = popup.parentPosition.right,
        needed = popup.dimensions.width;

    if (needed < available) {
        currentPositionType.alignment = 'right';
        currentPosition.x = popup.parentPosition.left - popup.dimensions.width + popup.parentPosition.width;
    }
}

function _tryTopAlignment(popup, currentPosition, currentPositionType, force) {
    var available = position.getPageSize(this.ownerDocument).height - popup.parentPosition.top,
        needed = popup.dimensions.height;

    if ((needed < available) || force) {
        currentPositionType.alignment = 'top';
        currentPosition.y = popup.parentPosition.top;
    }
}

function _tryMiddleAlignment(popup, currentPosition, currentPositionType) {
    var available = position.getPageSize(this.ownerDocument).height,
        child,
        targetPos;

    currentPositionType.alignment = 'middle';

    child = popup.dimensions.height;
    targetPos = popup.parentPosition.top;
    if (targetPos + child < available) {
        currentPosition.y = targetPos;
    } else {
        currentPosition.y = Math.max(0, available - popup.dimensions.height);
    }
}

function _tryBottomAlignment(popup, currentPosition, currentPositionType) {
    var available = popup.parentPosition.bottom,
        needed = popup.dimensions.height;

    /* istanbul ignore else */
    if (needed < available) {
        currentPositionType.alignment = 'bottom';
        currentPosition.y = popup.parentPosition.bottom - needed;
    }
}

var  popupAlignmentUtils = {
    tryLeftAlignment: _tryLeftAlignment,
    tryRightAlignment: _tryRightAlignment,
    tryTopAlignment: _tryTopAlignment,
    tryBottomAlignment: _tryBottomAlignment,
    tryMiddleAlignment: _tryMiddleAlignment,
    tryCenterAlignment: _tryCenterAlignment
};




var BASE_MARGIN = 5,
    CONNECTOR_MARGIN = 4,
    VERTICAL_POSITIONS = ['top', 'bottom'],
    HORIZONTAL_POSITIONS = ['left', 'right'],
    VERTICAL_ALIGNMENTS = ['top', 'middle', 'bottom'],
    HORIZONTAL_ALIGNMENTS = ['left', 'center', 'right'];

function _getPopupPosition(component, target, positionOrder, alignmentOrder, margin, customPositioningMethods) {
    var currentPosition = {
            x: -1,
            y: -1
        },
        positionMap = {
            'top': popupPositionUtils.tryTopPosition,
            'left': popupPositionUtils.tryLeftPosition,
            'right': popupPositionUtils.tryRightPosition,
            'bottom': popupPositionUtils.tryBottomPosition
        },
        alignmentMap = {
            'top': popupAlignmentUtils.tryTopAlignment,
            'left': popupAlignmentUtils.tryLeftAlignment,
            'right': popupAlignmentUtils.tryRightAlignment,
            'bottom': popupAlignmentUtils.tryBottomAlignment,
            'middle': popupAlignmentUtils.tryMiddleAlignment,
            'center': popupAlignmentUtils.tryCenterAlignment
        },
        currentPositionType = {},
        connector = component.querySelector('.connector'),
        positionFound,
        alignmentFound,
        verticalPosition,
        method,
        possibleAlignments,
        popup = {
            boxShadow: {
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            },
            margin: 0,
            parentPosition: {},
            spaceToNextObject: {},
            dimensions: {}
        };

    customPositioningMethods = customPositioningMethods || {};

    /* ----------- Position -------------- */
    popup.parentPosition = position.getPositionInDocument(target);  // formally targetRect
    popup.spaceToNextObject = popup.parentPosition;                 // formally absoluteRect

    if (!component.style.minWidth) {
        component.style.minWidth = popup.parentPosition.width + 'px';
    }
    popup.dimensions = position.getDimension(component);            // formally popupDimensions

    // If the component has a connector, we need to add extra margin
    if (connector) {
        popup.margin = BASE_MARGIN + (margin || CONNECTOR_MARGIN);        // formally margin
    } else {
        popup.margin = BASE_MARGIN + (margin || 0);
        popup.boxShadow = position.getBoxShadowSize(component);                 // formally boxShadow
    }

    // Checks every position on the array until one fits on the page
    positionFound = positionOrder.some(function(pos) {
        var method = customPositioningMethods[pos] || positionMap[pos];
        if (method) {
            method.call(target, popup, currentPosition, currentPositionType);
            return currentPositionType.position;
        }
    });

    if (!positionFound) {
        method = customPositioningMethods.bottom || positionMap.bottom;
        // If there's no space anywhere, popup is forced to be added at the bottom
        method.call(target, popup, currentPosition, currentPositionType, true);
    }

    /* -------- Alignment -------- */

    verticalPosition = VERTICAL_POSITIONS.indexOf(currentPositionType.position) > -1;
    if (verticalPosition) {
        possibleAlignments = HORIZONTAL_ALIGNMENTS;
    } else {
        possibleAlignments = VERTICAL_ALIGNMENTS;
    }

    // Check every alignment on the array that matches with the position until one fits on the page
    alignmentFound = alignmentOrder.some(function(align) {
        var method;
        if (possibleAlignments.indexOf(align) > -1) {
            method = customPositioningMethods[align] || alignmentMap[align];
            method.call(target, popup, currentPosition, currentPositionType);       // This method is also called in validtable.js.
            return currentPositionType.alignment;
        }
    });

    // If there's no space anywhere, popup is forced to be aligned to the top
    if (!alignmentFound && !verticalPosition) {
        method = customPositioningMethods.top || alignmentMap.top;
        alignmentMap.top.call(target, popup, currentPosition, currentPositionType, true);
    }

    if (connector && currentPositionType.alignment === 'middle') {
        connector.style.top = ((Math.min(popup.dimensions.height, popup.parentPosition.height) - 14) / 2) + 'px';
    }

    return {
        'currentPosition': currentPosition,
        'currentPositionType': currentPositionType
    };
}


function _clearPosition(component) {
    VERTICAL_POSITIONS.forEach(function(pos) {
        this.classList.remove('position-' + pos);
    }, component);

    HORIZONTAL_POSITIONS.forEach(function(pos) {
        this.classList.remove('position-' + pos);
    }, component);

    VERTICAL_ALIGNMENTS.forEach(function(alignment) {
        this.classList.remove('alignment-' + alignment);
    }, component);

    HORIZONTAL_ALIGNMENTS.forEach(function(alignment) {
        this.classList.remove('alignment-' + alignment);
    }, component);
}

/**
 * Updates styles of component with position and alignments
 * @param  {HTMLElement}    component      Component to show as a popup
 * @param  {Object}         positionTarget Position and alignments to be set
 */
function _updateComponent(component, positionTarget) {
    _clearPosition(component);

    component.classList.add('position-' + positionTarget.currentPositionType.position);
    component.classList.add('alignment-' + positionTarget.currentPositionType.alignment);

    component.style.left = positionTarget.currentPosition.x + 'px';
    component.style.top = positionTarget.currentPosition.y + 'px';
}

function getScrollingPopupParent(node) {
    if (node._scrollTarget) {
        return node._scrollTarget;
    }

    var parent = node.parentElement || node.parentNode;

    while (parent) {
        if (parent._scrollTarget) {
            return parent._scrollTarget;
        }

        if (parent.scrollHandler) {
            return parent;
        }

        if (parent === node.ownerDocument) {
            return;
        }

        parent = parent.parentElement || parent.parentNode;
    }
}

function removeScrollHandler(popupElement) {
    if (popupElement.scrollHandler) {
        popupElement.scrollParent.removeEventListener('scroll', popupElement.scrollHandler);
        popupElement.scrollHandler = null;
        popupElement.scrollParent = null;
    }
}

var handleVisibilityChange = function(component, referenceElement) {
    // A popover with _closeOnBlur set to true will initiate its "close" process by setting
    // the CSS class "leave"
    if (component.classList.contains('leave') || component.classList.contains('closed')) {
        removeScrollHandler(component);
        component.addEventListener('close', function closeHandler(event) {
            if (event.target.classList.contains('no-transition')) {
                event.target.classList.remove('no-transition');
            }

            event.target.removeEventListener('close', closeHandler);
        });

        if (!component.classList.contains('no-transition')) {
            component.classList.add('no-transition');
        }

        return;
    }

    var referenceElementRect = position.getPositionInDocument(referenceElement),
        parentRect = position.getPositionInDocument(component.scrollParent);

    // If the element has been scrolled out of sight hide it (or close it)
    if ((referenceElementRect.bottom < parentRect.top) ||
        (referenceElementRect.top > parentRect.bottom) ||
        (referenceElementRect.right < parentRect.left) ||
        (referenceElementRect.left > parentRect.right)) {
        if (component.classList.contains('visible')) {
            if (component._closeOnBlur) {
                removeScrollHandler(component);
                component._tmpNoAutoFocusLastActiveElementOnClose = component._noAutoFocusLastActiveElementOnClose;
                component._noAutoFocusLastActiveElementOnClose = true;
                component.addEventListener('close', function closeHandler(event) {
                    if (event.target.classList.contains('no-transition')) {
                        event.target.classList.remove('no-transition');
                    }
                    event.target.removeEventListener('close', closeHandler);
                });

                if (!component.classList.contains('no-transition')) {
                    component.classList.add('no-transition');
                }

                component.close();
            } else {
                if (component.classList.contains('visible')) {
                    component.classList.remove('visible');
                    component.emit('wc-popup-obscured');
                }
            }
        }
        // If the element has been scrolled back into view, make it visible
    } else {
        if (!component.classList.contains('visible')) {
            component.classList.add('visible');
            component.emit('wc-popup-revealed');
        }
    }
};

function addScrollHandler(component, referenceElement, positions, alignment, margin, customPositioningMethods) {
    var popupParent,
        requestId = 0;

    // If referenceElement is within a scrolling popup then we can listen to its
    // 'wc-popup-move' event
    popupParent = getScrollingPopupParent(referenceElement);

    if (popupParent) {
        component._scrollTarget = popupParent;

        /* istanbul ignore else */
        if (!component.moveHandler) {
            /* istanbul ignore next */
            component.moveHandler = function(event) {
                component.style.left = (parseInt(component.style.left, 10) + event.dx) + 'px';
                component.style.top = (parseInt(component.style.top, 10) + event.dy) + 'px';
                component.style.zIndex = position.getTopZindex();
            };

            /* istanbul ignore next */
            component.parentCloseHandler = function() {
                if (!component.classList.contains('no-transition')) {
                    component.classList.add('no-transition');
                }
            };

            // These are necessary in case there is a popover with a popupParent that doesn't close on blur.
            // In that case we need to hide and reveal the child popovers as the parent popover is hidden and revealed
            /* istanbul ignore next */
            component.parentObscuredHandler = function() {
                component.classList.add('no-transition');
                component.classList.remove('visible');
                setTimeout(function() {
                    component.classList.remove('no-transition');
                }, 20);
            };

            /* istanbul ignore next */
            component.parentRevealedHandler = function() {
                component.classList.add('no-transition');
                component.classList.add('visible');
                setTimeout(function() {
                    component.classList.remove('no-transition');
                }, 20);
            };

            popupParent.addEventListener('wc-popup-move', component.moveHandler);
            popupParent.addEventListener('close', component.parentCloseHandler);
            popupParent.addEventListener('wc-popup-obscured', component.parentObscuredHandler);
            popupParent.addEventListener('wc-popup-revealed', component.parentRevealedHandler);
            /* istanbul ignore next */
            component.addEventListener('close', function closeHandler(event) {
                popupParent.removeEventListener('wc-popup-move', event.target.moveHandler);
                popupParent.removeEventListener('close', event.target.parentCloseHandler);
                popupParent.removeEventListener('wc-popup-obscured', event.target.parentObscuredHandler);
                popupParent.removeEventListener('wc-popup-revealed', event.target.parentRevealedHandler);
                event.target.moveHandler = null;
                event.target.parentCloseHandler = null;
                event.target.parentObscuredHandler = null;
                event.target.parentRevealedHandler = null;
                event.target.removeEventListener('close', closeHandler);
                if (event.target.classList.contains('no-transition')) {
                    event.target.classList.remove('no-transition');
                }
            });
        }
        // Otherwise check to see if referenceElement requires a scroll handler
    } else if (!component.scrollHandler) {
        component.scrollParent = utils.getScrollParent(referenceElement);

        if (component.scrollParent !== component.ownerDocument) {
            /* istanbul ignore next */
            component.scrollHandler = utils.throttleDebounce(function() {
                handleVisibilityChange(component, referenceElement);

                if (component.classList.contains('leave') || !component.classList.contains('visible')) {
                    return;
                }

                if (requestId === 0) {
                    requestId = requestAnimationFrame(function() {
                        _setPosition(component, referenceElement, positions, alignment, margin, customPositioningMethods);
                        requestId = 0;
                    });
                }
            }, 20);

            component.scrollParent.addEventListener('scroll', component.scrollHandler);

            if (!component.closeHandler) {
                component.closeHandler = function(event) {
                    /* istanbul ignore if */
                    if (requestId) {
                        cancelAnimationFrame(requestId);
                        requestId = 0;
                    }

                    removeScrollHandler(event.target);
                    component._noAutoFocusLastActiveElementOnClose = component._tmpNoAutoFocusLastActiveElementOnClose;
                    event.target.removeEventListener('close', component.closeHandler);
                    component.closeHandler = null;
                };

                component.addEventListener('close', component.closeHandler);
            }
        }
    }
}


function _setPosition(component, referenceElement, positions, alignment, margin, customPositioningMethods) {
    var finalAlignment  = alignment || ['left', 'right'],
        orderPosition = positions || ['bottom', 'top'],
        positionTarget;

    addScrollHandler(component, referenceElement, positions, alignment, margin, customPositioningMethods);

    position.bringToFront(component);

    positionTarget = _getPopupPosition(component, referenceElement, orderPosition, finalAlignment, margin, customPositioningMethods);

    if (!positionTarget.currentPositionType.position || !positionTarget.currentPositionType.alignment) {
        _hide(component);
        return false;
    }

    // The 'wc-popup-move' event can be listened to by elements that wish to update their position in sync with
    // the popup. The event includes 'dx' and 'dy' properties to indicate the delta values in the x and y axes.
    if (component.style.top && component.style.left) {
        eventUtil.emit(component, 'wc-popup-move', {
            dx: positionTarget.currentPosition.x - parseInt(component.style.left, 10),
            dy: positionTarget.currentPosition.y - parseInt(component.style.top, 10)
        });
    }

    _updateComponent(component, positionTarget);

    return true;

}

function _installResizeMethod(popupElement, referenceElement, positions, alignment, margin, customPositioningMethods) {
    var resizeMethod;

    resizeMethod = function() {
        
        if (popupElement.classList.contains('visible')) {
            _setPosition(popupElement, referenceElement, positions, alignment, margin, customPositioningMethods);
        }
    };

    Viewport.onResize(resizeMethod);

    return resizeMethod;
}

function _uninstallResizeMethod(callback) {
    Viewport.offResize(callback);
}


function _show(popupElement, referenceElement, positions, alignment, margin, customPositioningMethods) {
    var setupSuccessful = false;

    if (!document.body.contains(referenceElement)) {
        // Silently fail if the target is not in the DOM.
        return;
    }
    
    if (popupElement.show && !popupElement.classList.contains('visible')) {
        setupSuccessful = _setPosition(popupElement, referenceElement, positions, alignment, margin, customPositioningMethods);
        if (setupSuccessful) {
            popupElement.show();
        }
    }

}


function _hide(popupElement) {
    if (popupElement && popupElement.open) {
        popupElement.close();
    }
    removeScrollHandler(popupElement);
}

var popup = {
    installResizeMethod: _installResizeMethod,
    uninstallResizeMethod: _uninstallResizeMethod,
    clearPosition: _clearPosition,
    setPosition: _setPosition,
    show: _show,
    hide: _hide
};


/**contenrNode */
function _parse(component, htmlFragment, targetSelector, transformations) {
    var parsedFragment;
    if (transformations && transformations.hasOwnProperty(targetSelector)) {
        parsedFragment = transformations[targetSelector](component, htmlFragment, targetSelector);
        component._cachedChildNodes[targetSelector] = parsedFragment;
    } else {
        component._cachedChildNodes[targetSelector] = htmlFragment.parentElement.removeChild(htmlFragment);
    }
}

function cacheInputContent(component, contentPropertyMap, transformations) {
    var key;

    if (contentPropertyMap && component.childNodes && component.childNodes.length) {
        component._cachedChildNodes = {};

        for (key in contentPropertyMap) {
            if (contentPropertyMap.hasOwnProperty(key) && component.querySelector(key)) {
                _parse(component, component.querySelector(key), key, transformations);
            }
        }
    }
}


function storeCachedInput(component, contentPropertyMap) {
    var key,
        target;

    if (component._cachedChildNodes) {
        for (key in component._cachedChildNodes) {
            if (component._cachedChildNodes.hasOwnProperty(key)) {
                target = contentPropertyMap[key];
                component[target] = [].slice.call(component._cachedChildNodes[key].childNodes);
            }
        }

        delete component._cachedChildNodes;
    }
}


var contentNode = {
    cacheInputContent: cacheInputContent,
    storeCachedInput: storeCachedInput
};




var wcutils = window.wcUtils = (window.wcUtils || {});

wcutils.keys = keys;
wcutils.a11y = a11y;
wcutils.utils = utils;
wcutils.eventUtil = eventUtil;
wcutils.viewport = viewport;
wcutils.popup = popup;
wcutils.position = position;
wcutils.contentNode = contentNode;

wcutils.components = {};

})(window);

