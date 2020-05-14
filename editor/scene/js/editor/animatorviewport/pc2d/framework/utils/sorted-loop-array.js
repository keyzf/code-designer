Object.assign(pc2d, function () {
    'use strict';

    var SortedLoopArray = function (args) {
        this._sortBy = args.sortBy;
        this.items = [];
        this.length = 0;
        this.loopIndex = -1;
        this._sortHandler = this._doSort.bind(this);
    };


    SortedLoopArray.prototype._binarySearch = function (item) {
        var left = 0;
        var right = this.items.length - 1;
        var search = item[this._sortBy];

        var middle;
        var current;
        while (left <= right) {
            middle = Math.floor((left + right) / 2);
            current = this.items[middle][this._sortBy];
            if (current <= search) {
                left = middle + 1;
            } else if (current > search) {
                right = middle - 1;
            }
        }

        return left;
    };

    SortedLoopArray.prototype._doSort = function (a, b) {
        var sortBy = this._sortBy;
        return a[sortBy] - b[sortBy];
    };


    SortedLoopArray.prototype.insert = function (item) {
        var index = this._binarySearch(item);
        this.items.splice(index, 0, item);
        this.length++;
        if (this.loopIndex >= index) {
            this.loopIndex++;
        }
    };


    SortedLoopArray.prototype.append = function (item) {
        this.items.push(item);
        this.length++;
    };

    SortedLoopArray.prototype.remove = function (item) {
        var idx = this.items.indexOf(item);
        if (idx < 0) return;

        this.items.splice(idx, 1);
        this.length--;
        if (this.loopIndex >= idx) {
            this.loopIndex--;
        }
    };

    SortedLoopArray.prototype.sort = function () {
        // get current item pointed to by loopIndex
        var current = (this.loopIndex >= 0 ? this.items[this.loopIndex] : null);
        // sort
        this.items.sort(this._sortHandler);
        // find new loopIndex
        if (current !== null) {
            this.loopIndex = this.items.indexOf(current);
        }
    };

    return {
        SortedLoopArray: SortedLoopArray
    };

}());