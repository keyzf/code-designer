/**
 * @private
 * @function
 * @name _typeLookup
 * @description Create look up table for types.
 */
var _typeLookup = function () {
    var result = { };
    var names = ["Array", "Object", "Function", "Date", "RegExp", "Float32Array"];

    for (var i = 0; i < names.length; i++)
        result["[object " + names[i] + "]"] = names[i].toLowerCase();

    return result;
}();


var pc2d = {
    version: "__CURRENT_SDK_VERSION__",
    revision: "__REVISION__",
    config: { },
    common: { },
    apps: { }, // Storage for the applications using the PlayCanvas Engine
    data: { }, // Storage for exported entity data

    /**
     * @private
     * @function
     * @name pc2d.makeArray
     * @description Convert an array-like object into a normal array.
     * For example, this is useful for converting the arguments object into an array.
     * @param {object} arr - The array to convert.
     * @returns {Array} An array.
     */
    makeArray: function (arr) {
        var i,
            ret = [],
            length = arr.length;

        for (i = 0; i < length; ++i) {
            ret.push(arr[i]);
        }

        return ret;
    },

    /**
     * @private
     * @function
     * @name pc2d.type
     * @description Extended typeof() function, returns the type of the object.
     * @param {object} obj - The object to get the type of.
     * @returns {string} The type string: "null", "undefined", "number", "string", "boolean", "array", "object", "function", "date", "regexp" or "float32array".
     */
    type: function (obj) {
        if (obj === null) {
            return "null";
        }

        var type = typeof obj;

        if (type === "undefined" || type === "number" || type === "string" || type === "boolean") {
            return type;
        }

        return _typeLookup[Object.prototype.toString.call(obj)];
    },

    /**
     * @private
     * @function
     * @name pc2d.extend
     * @description Merge the contents of two objects into a single object.
     * @param {object} target - The target object of the merge.
     * @param {object} ex - The object that is merged with target.
     * @returns {object} The target object.
     * @example
     * var A = {
     *     a: function () {
     *         console.log(this.a);
     *     }
     * };
     * var B = {
     *     b: function () {
     *         console.log(this.b);
     *     }
     * };
     *
     * pc2d.extend(A, B);
     * A.a();
     * // logs "a"
     * A.b();
     * // logs "b"
     */
    extend: function (target, ex) {
        var prop,
            copy;

        for (prop in ex) {
            copy = ex[prop];
            if (pc2d.type(copy) == "object") {
                target[prop] = pc2d.extend({}, copy);
            } else if (pc2d.type(copy) == "array") {
                target[prop] = pc2d.extend([], copy);
            } else {
                target[prop] = copy;
            }
        }

        return target;
    },


    /**
     * @private
     * @function
     * @name pc2d.isDefined
     * @description Return true if the Object is not undefined.
     * @param {object} o - The Object to test.
     * @returns {boolean} True if the Object is not undefined.
     */
    isDefined: function (o) {
        var a;
        return (o !== a);
    }
};

var pc = pc2d;

pc2d.guid = function () {
    return {
        /**
         * @function
         * @name pc2d.guid.create
         * @description Create an RFC4122 version 4 compliant GUID.
         * @returns {string} A new GUID.
         */
        create: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = (c == 'x') ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    };
}();



pc2d.path = function () {
    return {
        delimiter: "/",

        join: function () {
            var index;
            var num = arguments.length;
            var result = arguments[0];

            for (index = 0; index < num - 1; ++index) {
                var one = arguments[index];
                var two = arguments[index + 1];
                if (!pc2d.isDefined(one) || !pc2d.isDefined(two)) {
                    throw new Error("undefined argument to pc2d.path.join");
                }
                if (two[0] === pc2d.path.delimiter) {
                    result = two;
                    continue;
                }

                if (one && two && one[one.length - 1] !== pc2d.path.delimiter && two[0] !== pc2d.path.delimiter) {
                    result += (pc2d.path.delimiter + two);
                } else {
                    result += (two);
                }
            }

            return result;
        },

        normalize: function (path) {
            var lead = path.startsWith(pc2d.path.delimiter);
            var trail = path.endsWith(pc2d.path.delimiter);

            var parts = path.split('/');

            var result = '';

            var cleaned = [];

            for (var i = 0; i < parts.length; i++) {
                if (parts[i] === '') continue;
                if (parts[i] === '.') continue;
                if (parts[i] === '..' && cleaned.length > 0) {
                    cleaned = cleaned.slice(0, cleaned.length - 2);
                    continue;
                }

                if (i > 0) cleaned.push(pc2d.path.delimiter);
                cleaned.push(parts[i]);
            }


            result = cleaned.join('');
            if (!lead && result[0] === pc2d.path.delimiter) {
                result = result.slice(1);
            }

            if (trail && result[result.length - 1] !== pc2d.path.delimiter) {
                result += pc2d.path.delimiter;
            }

            return result;
        },

        split: function (path) {
            var parts = path.split(pc2d.path.delimiter);
            var tail = parts.slice(parts.length - 1)[0];
            var head = parts.slice(0, parts.length - 1).join(pc2d.path.delimiter);
            return [head, tail];
        },

        getBasename: function (path) {
            return pc2d.path.split(path)[1];
        },

        getDirectory: function (path) {
            var parts = path.split(pc2d.path.delimiter);
            return parts.slice(0, parts.length - 1).join(pc2d.path.delimiter);
        },
        getExtension: function (path) {
            var ext = path.split('?')[0].split('.').pop();
            if (ext !== path) {
                return "." + ext;
            }
            return "";
        },

        isRelativePath: function (s) {
            return s.charAt(0) !== "/" && s.match(/:\/\//) === null;
        },

        extractPath: function (s) {
            var path = "";
            var parts = s.split("/");
            var i = 0;

            if (parts.length > 1) {
                if (pc2d.path.isRelativePath(s)) {
                    if (parts[0] === ".") {
                        for (i = 0; i < parts.length - 1; ++i) {
                            path += (i === 0) ? parts[i] : "/" + parts[i];

                        }
                    } else if (parts[0] === "..") {
                        for (i = 0; i < parts.length - 1; ++i) {
                            path += (i === 0) ? parts[i] : "/" + parts[i];
                        }
                    } else {
                        path = ".";
                        for (i = 0; i < parts.length - 1; ++i) {
                            path += "/" + parts[i];
                        }
                    }
                } else {
                    for (i = 0; i < parts.length - 1; ++i) {
                        path += (i === 0) ? parts[i] : "/" + parts[i];
                    }
                }
            }
            return path;
        }
    };
}();


pc2d.string = function () {
    var ASCII_LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
    var ASCII_UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var ASCII_LETTERS = ASCII_LOWERCASE + ASCII_UPPERCASE;

    var HIGH_SURROGATE_BEGIN = 0xD800;
    var HIGH_SURROGATE_END = 0xDBFF;
    var LOW_SURROGATE_BEGIN = 0xDC00;
    var LOW_SURROGATE_END = 0xDFFF;
    var ZERO_WIDTH_JOINER = 0x200D;

    // Flag emoji
    var REGIONAL_INDICATOR_BEGIN = 0x1F1E6;
    var REGIONAL_INDICATOR_END = 0x1F1FF;

    // Skin color modifications to emoji
    var FITZPATRICK_MODIFIER_BEGIN = 0x1F3FB;
    var FITZPATRICK_MODIFIER_END = 0x1F3FF;

    // Accent characters
    var DIACRITICAL_MARKS_BEGIN = 0x20D0;
    var DIACRITICAL_MARKS_END = 0x20FF;

    // Special emoji joins
    var VARIATION_MODIFIER_BEGIN = 0xFE00;
    var VARIATION_MODIFIER_END = 0xFE0F;

    function getCodePointData(string, i) {
        var size = string.length;
        i = i || 0;
        // Account for out-of-bounds indices:
        if (i < 0 || i >= size) {
            return null;
        }
        var first = string.charCodeAt(i);
        var second;
        if (size > 1 && first >= HIGH_SURROGATE_BEGIN && first <= HIGH_SURROGATE_END) {
            second = string.charCodeAt(i + 1);
            if (second >= LOW_SURROGATE_BEGIN && second <= LOW_SURROGATE_END) {
                // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                return { code: (first - HIGH_SURROGATE_BEGIN) * 0x400 + second - LOW_SURROGATE_BEGIN + 0x10000, long: true };
            }
        }
        return { code: first, long: false };
    }

    function isCodeBetween(string, begin, end) {
        if (!string)
            return false;
        var codeData = getCodePointData(string);
        if (codeData) {
            var code = codeData.code;
            return code >= begin && code <= end;
        }
        return false;
    }

    function numCharsToTakeForNextSymbol(string, index) {
        if (index === string.length - 1) {
            // Last character in the string, so we can only take 1
            return 1;
        }
        if (isCodeBetween(string[index], HIGH_SURROGATE_BEGIN, HIGH_SURROGATE_END)) {
            var first = string.substring(index, index + 2);
            var second = string.substring(index + 2, index + 4);

            // check if second character is fitzpatrick (color) modifier
            // or if this is a pair of regional indicators (a flag)
            if (isCodeBetween(second, FITZPATRICK_MODIFIER_BEGIN, FITZPATRICK_MODIFIER_END) ||
                (isCodeBetween(first, REGIONAL_INDICATOR_BEGIN, REGIONAL_INDICATOR_END) &&
                isCodeBetween(second, REGIONAL_INDICATOR_BEGIN, REGIONAL_INDICATOR_END))
            ) {
                return 4;
            }

            // check if next character is a modifier, in which case we should return it
            if (isCodeBetween(second, VARIATION_MODIFIER_BEGIN, VARIATION_MODIFIER_END)) {
                return 3;
            }

            // return surrogate pair
            return 2;
        }

        // check if next character is the emoji modifier, in which case we should include it
        if (isCodeBetween(string[index + 1], VARIATION_MODIFIER_BEGIN, VARIATION_MODIFIER_END)) {
            return 2;
        }

        // just a regular character
        return 1;
    }

    return {
        ASCII_LOWERCASE: ASCII_LOWERCASE,
        ASCII_UPPERCASE: ASCII_UPPERCASE,
        ASCII_LETTERS: ASCII_LETTERS,

        format: function (s) {
            var i = 0,
                regexp,
                args = pc2d.makeArray(arguments);

            // drop first argument
            args.shift();

            for (i = 0; i < args.length; i++) {
                regexp = new RegExp('\\{' + i + '\\}', 'gi');
                s = s.replace(regexp, args[i]);
            }
            return s;
        },

        toBool: function (s, strict) {
            if (s === 'true') {
                return true;
            }

            if (strict) {
                if (s === 'false') {
                    return false;
                }

                throw new TypeError('Not a boolean string');
            }

            return false;
        },
        getCodePoint: function (string, i) {
            var codePointData = getCodePointData(string, i);
            return codePointData && codePointData.code;
        },
        getCodePoints: function (string) {
            if (typeof string !== 'string') {
                throw new TypeError('Not a string');
            }
            var i = 0;
            var arr = [];
            var codePoint;
            while (!!(codePoint = getCodePointData(string, i))) {
                arr.push(codePoint.code);
                i += codePoint.long ? 2 : 1;
            }
            return arr;
        },
        getSymbols: function (string) {
            if (typeof string !== 'string') {
                throw new TypeError('Not a string');
            }
            var index = 0;
            var length = string.length;
            var output = [];
            var take = 0;
            var ch;
            while (index < length) {
                take += numCharsToTakeForNextSymbol(string, index + take);
                ch = string[index + take];
                // Handle special cases
                if (isCodeBetween(ch, DIACRITICAL_MARKS_BEGIN, DIACRITICAL_MARKS_END)) {
                    ch = string[index + (take++)];
                }
                if (isCodeBetween(ch, VARIATION_MODIFIER_BEGIN, VARIATION_MODIFIER_END)) {
                    ch = string[index + (take++)];
                }
                if (ch && ch.charCodeAt(0) === ZERO_WIDTH_JOINER) {
                    ch = string[index + (take++)];
                    // Not a complete char yet
                    continue;
                }
                var char = string.substring(index, index + take);
                output.push(char);
                index += take;
                take = 0;
            }
            return output;
        },
        fromCodePoint: function (/* ...args */) {
            var chars = [];
            var current;
            var codePoint;
            var units;
            for (var i = 0; i < arguments.length; ++i) {
                current = Number(arguments[i]);
                codePoint = current - 0x10000;
                units = current > 0xFFFF ? [(codePoint >> 10) + 0xD800, (codePoint % 0x400) + 0xDC00] : [current];
                chars.push(String.fromCharCode.apply(null, units));
            }
            return chars.join('');
        }
    };
}();
Object.assign(pc2d, (function () {
    return {
        /**
         * @private
         * @function
         * @name pc2d.hashCode
         * @description Calculates simple hash value of a string. Designed for performance, not perfect.
         * @param {string} str - String.
         * @returns {number} Hash value.
         */
        hashCode: function (str) {
            var hash = 0;
            for (var i = 0, len = str.length; i < len; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                // Convert to 32bit integer
                hash |= 0;
            }
            return hash;
        }
    };
}()));


Object.assign(pc2d, (function () {
    var Timer = function Timer() {
        this._isRunning = false;
        this._a = 0;
        this._b = 0;
    };

    Object.assign(Timer.prototype, {

        start: function () {
            this._isRunning = true;
            this._a = pc2d.now();
        },

        stop: function () {
            this._isRunning = false;
            this._b = pc2d.now();
        },

        getMilliseconds: function () {
            return this._b - this._a;
        }
    });

    return {
        Timer: Timer,
        now: (typeof window !== 'undefined') && window.performance && window.performance.now && window.performance.timing ? function () {
            return window.performance.now();
        } : Date.now
    };
}()));



Object.assign(pc2d, function () {
    return {

        createURI: function (options) {
            var s = "";
            if ((options.authority || options.scheme) && (options.host || options.hostpath)) {
                throw new Error("Can't have 'scheme' or 'authority' and 'host' or 'hostpath' option");
            }
            if (options.host && options.hostpath) {
                throw new Error("Can't have 'host' and 'hostpath' option");
            }
            if (options.path && options.hostpath) {
                throw new Error("Can't have 'path' and 'hostpath' option");
            }

            if (options.scheme) {
                s += options.scheme + ":";
            }

            if (options.authority) {
                s += "//" + options.authority;
            }

            if (options.host) {
                s += options.host;
            }

            if (options.path) {
                s += options.path;
            }

            if (options.hostpath) {
                s += options.hostpath;
            }

            if (options.query) {
                s += "?" + options.query;
            }

            if (options.fragment) {
                s += "#" + options.fragment;
            }

            return s;
        },

        URI: function (uri) {
            // See http://tools.ietf.org/html/rfc2396#appendix-B for details of RegExp
            var re = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/,
                result = uri.match(re);

            this.scheme = result[2];

            this.authority = result[4];

            this.path = result[5];

            this.query = result[7];

            this.fragment = result[9];

            this.toString = function () {
                var s = "";

                if (this.scheme) {
                    s += this.scheme + ":";
                }

                if (this.authority) {
                    s += "//" + this.authority;
                }

                s += this.path;

                if (this.query) {
                    s += "?" + this.query;
                }

                if (this.fragment) {
                    s += "#" + this.fragment;
                }

                return s;
            };

            this.getQuery = function () {
                var vars;
                var pair;
                var result = {};

                if (this.query) {
                    vars = decodeURIComponent(this.query).split("&");
                    vars.forEach(function (item, index, arr) {
                        pair = item.split("=");
                        result[pair[0]] = pair[1];
                    }, this);
                }

                return result;
            };

            this.setQuery = function (params) {
                var q = "";
                for (var key in params) {
                    if (params.hasOwnProperty(key)) {
                        if (q !== "") {
                            q += "&";
                        }
                        q += encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
                    }
                }

                this.query = q;
            };
        }
    };
}());
window.pc2d = pc2d;
window.pc = window.pc2d;
if (typeof exports !== 'undefined')
    exports.pc2d = pc2d;