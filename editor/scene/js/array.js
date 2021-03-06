/* array.js */
Object.defineProperty(Array.prototype, 'equals', {
    enumerable: false,
    value: function(array) {
        if (! array)
            return false;

        if (this.length !== array.length)
            return false;

        for (var i = 0, l = this.length; i < l; i++) {
            if (this[i] instanceof Array && array[i] instanceof Array) {
                if (! this[i].equals(array[i]))
                    return false;
            } else if (this[i] !== array[i]) {
                return false;
            }
        }
        return true;
    }
});

Object.defineProperty(Array.prototype, 'match', {
    enumerable: false,
    value: function(pattern) {
        if (this.length !== pattern.length)
            return;

        for(var i = 0, l = this.length; i < l; i++) {
            if (pattern[i] !== '*' && pattern[i] !== this[i])
                return false;
        }

        return true;
    }
});


// Object.defineProperty(Array.prototype, 'binaryIndexOf', {
//     enumerable: false,
//     value: function(b) {
//         var min = 0;
//         var max = this.length - 1;
//         var cur;
//         var a;

//         while (min <= max) {
//             cur = Math.floor((min + max) / 2);
//             a = this[cur];

//             if (a < b) {
//                 min = cur + 1;
//             } else if (a > b) {
//                 max = cur - 1;
//             } else {
//                 return cur;
//             }
//         }

//         return -1;
//     }
// });
