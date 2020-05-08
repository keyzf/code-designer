Object.assign(pc2d, function () {
    'use strict';

    var Template = function Template(app, data) {
        this._app = app;

        this._data = data;

        this._expandedData = {};

        this._templateRoot = null;
    };

    Template.prototype.instantiate = function () {
        if (!this._templateRoot) { // at first use, after scripts are loaded
            this._parseTemplate();
        }

        return this._templateRoot.clone();
    };


    Template.prototype.getExpandedData = function () {
        if (!this._expandedData.entities) {
            this._expandedData.entities = pc2d.TemplateUtils.expandTemplateEntities(
                this._app, this._data.entities);
        }

        return this._expandedData;
    };

    Template.prototype._parseTemplate = function () {
        var parser = new pc2d.SceneParser(this._app, true);

        this._templateRoot = parser.parse(this.getExpandedData());
    };

    return {
        Template: Template
    };
}());