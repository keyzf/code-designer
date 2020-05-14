/* ui/div.js */
"use strict";

function DivElement() {
    ui.ContainerElement.call(this);
    this.element = document.createElement('div');
}
DivElement.prototype = Object.create(ui.ContainerElement.prototype);



window.ui.DivElement = DivElement;