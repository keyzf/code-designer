/* ui/grid.js */
"use strict";

function Grid(args) {
    var self = this;
    ui.ContainerElement.call(this);

    this.element = document.createElement('ul');
    this._element.tabIndex = 0;
    this._element.classList.add('ui-grid');

    this._lastSelect = null;
    this._selecting = false;
    this._multiSelect = args && args.multiSelect !== undefined ? args.multiSelect : true;

    this.on('select', this._onSelect);
    this.on('beforeDeselect', this._onBeforeDeselect);

    this.on('append', this._onAppend);
    this.on('remove', this._onRemove);
}
Grid.prototype = Object.create(ui.ContainerElement.prototype);


Grid.prototype._onSelect = function(item) {
    if (this._selecting)
        return;

    if (this._multiSelect && Grid._shift && Grid._shift()) {
        var children = Array.prototype.slice.call(this._element.childNodes, 0);

        // multi select from-to
        if (this._lastSelect) {
            this._selecting = true;

            var startInd = children.indexOf(this._lastSelect.element);
            var endInd = children.indexOf(item.element);

            // swap if backwards
            if (startInd > endInd) {
                var t = startInd;
                startInd = endInd;
                endInd = t;
            }

            for(var i = startInd; i < endInd; i++) {
                if (! children[i] || ! children[i].ui || children[i].ui.hidden)
                    continue;

                children[i].ui.selected = true;
            }

            this._selecting = false;
        } else {
            this._lastSelect = item;
        }
    } else if (this._multiSelect && Grid._ctrl && Grid._ctrl()) {
        // multi select
        this._lastSelect = item;
    } else {
        // single select
        var items = this._element.querySelectorAll('.ui-grid-item.selected');

        if (items.length > 1) {
            for(var i = 0; i < items.length; i++) {
                if (items[i].ui === item)
                    continue;

                items[i].ui.selected = false;
            }
        }

        this._lastSelect = item;
    }
};


Grid.prototype._onBeforeDeselect = function(item) {
    if (this._selecting)
        return;

    this._selecting = true;

    if (this._multiSelect && Grid._shift && Grid._shift()) {
        this._lastSelect = null;
    } else if (this._multiSelect && Grid._ctrl && Grid._ctrl()) {
        this._lastSelect = null;
    } else {
        var items = this._element.querySelectorAll('.ui-grid-item.selected');
        if (items.length > 1) {
            for(var i = 0; i < items.length; i++) {
                if (items[i].ui === item)
                    continue;
                items[i].ui.selected = false;
            }
            item._selectPending = true;
            this._lastSelect = item;
        }
    }

    this._selecting = false;
};


Grid.prototype.filter = function(fn) {
    this.forEach(function(item) {
        item.hidden = ! fn(item);
    });
};


Grid.prototype.forEach = function(fn) {
    var child = this._element.firstChild;
    while(child) {
        if (child.ui)
            fn(child.ui);

        child = child.nextSibling;
    };
};

Object.defineProperty(Grid.prototype, 'selected', {
    get: function() {
        var items = [ ];
        var elements = this._element.querySelectorAll('.ui-grid-item.selected');

        for(var i = 0; i < elements.length; i++)
            items.push(elements[i].ui);

        return items;
    },
    set: function(value) {
        if (this._selecting)
            return;

        this._selecting = true;

        // deselecting
        var items = this.selected;
        for(var i = 0; i < items.length; i++) {
            if (value && value.indexOf(items[i]) !== -1)
                continue;
            items[i].selected = false;
        }

        if (! value)
            return;

        // selecting
        for(var i = 0; i < value.length; i++) {
            if (! value[i])
                continue;

            value[i].selected = true;
        }

        this._selecting = false;
    }
});


window.ui.Grid = Grid;
