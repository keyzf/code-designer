var el = createElement;

function isNode(content) {
    return !!content && !!content.nodeType;
}


function isArrayOfNodes(content) {
    return Array.isArray(content) && content.reduce(function (previousElementWasANode, currentElement) {
        return previousElementWasANode && isNode(currentElement);
    }, true);
}


function isObject(value) {
    return (!!value && value.toString() === '[object Object]');
}


function appendChildren(parent, children) {
    if (isNode(parent)) {
        children.filter(function (child) {
            return isNode(child);
        }).forEach(function (childNode) {
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

    Object.keys(_properties).forEach(function (prop) {
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

function checkString(str) {
    if (!isString(str)) throw new TypeError("expected string")
}

function isString(str) {
    return "string" == typeof str
}
editor.once('load', function () {


    var TimeLine = editor.call('timeline:get');

    TimeLine.rowChange = function () {
        var n = 25;
        var t = 1;
        var f = TimeLine.row;

        var instancesGrid = this.instancesGrid;
        var tracksGrid = this.tracksGrid;
        var optionsGrid = this.optionsGrid;

        const templateRow = `[start] ${n}px repeat(${f}, ${n}px) [middle] auto [end] 0px`,
            templateColumns = `[start] ${n}px repeat(${t}, ${n}px) [middle] auto [end] 0px`;
        instancesGrid.style.gridTemplateRows = templateRow,
            instancesGrid.style.gridTemplateColumns = templateColumns;
        optionsGrid.style.gridTemplateRows = templateRow;
        tracksGrid.style.gridTemplateRows = templateRow;
    }



    function Track() {

    }
    Object.defineProperty(Track.prototype, 'Name', {
        get: function () {
            return this._Name;
        },
        set: function (value) {
            this._Name = value;
            this.element.querySelector(".instanceBlockName").innerHTML = value;
        }
    });
    Object.defineProperty(Track.prototype, 'Timeline', {
        get: function () {
            return this._Timeline;
        },
        set: function (value) {
            this._Timeline = value;
        }
    });


    Object.defineProperty(Track.prototype, 'TimelineRow', {
        get: function () {
            return this._TimelineRow;
        },
        set: function (value) {
            this._TimelineRow = value;
        }
    });


    Track.prototype.bindDrop = function () {
        var track = this;
        this.dropRef = editor.call('drop:target', {
            ref: this.element,
            filter: function (type, data) {
                return type === "entity";
            },
            drop: function (type, data) {
                var dropManager = editor.call('editor:dropManager')
                console.log(type, data)
                console.log(dropManager);
                track.TimelineRow.animateTarget = data.resource_id;

            }
        });
        this.dropRef.class.add('drop-area-project-img');
    }

    Track.prototype.unbindDrop = function () {

        this.dropRef && this.dropRef.destroy();
    }

    Track.prototype.insertChild = function (track, index) {
        this.children.push(track);
    }

    Track.prototype.removeChild = function (track, index) {
        this.children.splice(track);
    }

    Track.prototype.addKeyframe = function (keyframe) {
        console.log(this.TimelineRow);
        keyframe.TimelineRow = this.TimelineRow;
        keyframe.Timeline = this.Timeline;
        keyframe.Step = keyframe.data.get("_Step");
        console.log('thisrow' + this.TimelineRow.row, keyframe.Step);
        this.keyframes.set(keyframe.Step + "STEP", keyframe);
        this.TimelineRow.track.appendChild(keyframe.element);

    }


    Track.prototype.findKeyframeAtStep = function (step) {
        return this.keyframes.get(step + "STEP");
    }


    Track.prototype.removeKeyframe = function (keyframe) {
        this.keyframes.delete(keyframe.Step + "STEP");
        this.TimelineRow.track.removeChild(keyframe.element);
    }

    Track.prototype.removeKeyframeAtStep = function (step) {
        this.keyframes.delete(step + "STEP");
        this.TimelineRow.track.removeChild(this.findKeyframeAtStep(step).element);
    }


    function MasterTrack(Name) {


        this.element = el('div', {
            "className": "instanceBlockElement"
        }, [
            el("ui-icon", {
                "className": "instanceBlockIcon",
                "attr-style": "width: 20px; height: 20px; background: url(./8796c4fc-58c2-4773-9f65-888ab1b24cb7.png) -22px 0px no-repeat;"
            }),
            el("div", {
                "className": "instanceBlockName",
                "innerHTML": ""
            }),
        ]);

        this._Name = "";
        this.children = [];
        this.keyframes = new Map();


        this.Name = Name || "";
        this.AnimationMode = "Default";
        this.ResultMode = "Default"; //Relative Absolute
        this.Ease = "Default";
        this.PathMode = "Default"; //Line Be
        this._Enabled = true;
        this.TrackId = "";
        this.Editor = {
            Locked: false,
            Visible: true
        };

        this.bindDrop();


    }
    MasterTrack.prototype = Object.create(Track.prototype);


    function PropertyTrack(Name) {

        this.element = el('div', {
            "className": "instanceBlockElement"
        }, [
            el("ui-icon", {
                "className": "instanceBlockIcon",
                "attr-style": "width: 20px; height: 20px; background: url(./icon-sheet-2.png) -66px -88px no-repeat;"
            }),
            el("div", {
                "className": "instanceBlockName",
                "innerHTML": ""
            }),
        ]);

        this._Name = "";
        this.children = [];
        this.keyframes = new Map();
        this.Name = Name || "";
        this.AnimationMode = "Default";
        this.ResultMode = "Default"; //Relative Absolute
        this.Ease = "Default";
        this.PathMode = "Default"; //Line Be
        this._Enabled = true;

        this.Editor = {
            Locked: false
        };



    }
    PropertyTrack.prototype = Object.create(Track.prototype);


    function PropertyFolderTrack(Name) {
        this._Name = "";
        this.children = [];
        this.keyframes = new Map();
        this.element = el('div', {
            "className": "instanceBlockElement"
        }, [
            el("ui-icon", {
                "className": "instanceBlockIcon",
                "attr-style": "width: 20px; height: 20px; background: url(./icon-sheet-1.png) -44px 0px no-repeat;"
            }),
            el("div", {
                "className": "instanceBlockName",
                "innerHTML": ""
            }),
        ]);


        this.Name = Name || "";
        this.AnimationMode = "Default";
        this.ResultMode = "Default"; //Relative Absolute
        this.Ease = "Default";
        this.PathMode = "Default"; //Line Be
        this._Enabled = true;

        this.Editor = {
            Locked: false
        };
    }
    PropertyFolderTrack.prototype = Object.create(Track.prototype);



    editor.method('TimeLineRow:Class', function () {
        return TimeLineRow;
    });




    var trackmenu = new ui.Menu();
    var trackmenuitem = new ui.MenuItem({
        text: '删除',
        value: 'removetrack',
        icon: '&#57864;'
    });
    trackmenuitem.on('select', function () {

        var tlrow = trackmenu.cotextmenuTimelineRow;

        if (tlrow) tlrow._timeline.removeRow(tlrow);
        trackmenu.cotextmenuTimelineRow = null;

        //overlay.hidden = false;          
    });
    trackmenu.append(trackmenuitem);

    var trackmenuitem = new ui.MenuItem({
        text: '添加动画属性',
        value: 'addPropertyTrack',
        icon: '&#57864;'
    });
    trackmenuitem.on('select', function () {
        //overlay.hidden = false;          
    });
    trackmenu.append(trackmenuitem);



    function TimeLineRow(_timeline, type, propertyName) {
        checkString(type);

        this._timeline = _timeline;
        this.rowHeight = 25;
        this._type = type;
        this.hided = false;
        this._fold = false;

        this._timeline.rowInstance.push(this);

        this.children = [];

        if (type === "property") {
            this.instancesTrack = new PropertyTrack(propertyName);
            this.col = 1;
        } else if (type === "master") {
            this.instancesTrack = new MasterTrack(propertyName);
            this.expandIconContainer = el("div", {
                "className": "expandIconContainer"
            }, [
                el("ui-icon", {
                    "attr-style": "width: 13.3333px; height: 13.3333px; background: url(./icon-sheet-3.png) 0px 0px no-repeat;"
                })
            ]);
            this.col = 1;
        } else if (type === "folder") { //folder
            this.instancesTrack = new PropertyFolderTrack("Property Track Folder");
            this.expandIconContainer = el("div", {
                "className": "expandIconContainer"
            }, [
                el("ui-icon", {
                    "attr-style": "width: 13.3333px; height: 13.3333px; background: url(./icon-sheet-3.png) 0px 0px no-repeat;"
                })
            ]);
        }

        if (this.expandIconContainer) {
            this.expandIconContainer.addEventListener("UITap", () => {
                if (this._fold) {
                    _timeline.expandRow(this);
                    this._fold = false;

                } else {
                    _timeline.foldRow(this);
                    this._fold = true;
                }


            });
        }

        //instancesGrid
        this.instanceBlockElement = this.instancesTrack.element;
        this.instancesTrack.Timeline = this._timeline;
        this.instancesTrack.TimelineRow = this;

        this.instanceBlockBottomBorder = el("div", {
            "className": "instanceBlockBottomBorder",
            "attr-has-inset-mark": ""
        }, []);

        //trackGrid
        this.track = el("div", {
            "className": "track"
        });
        this.trackBlockBottomBorderTrackProperties = el("div", {
            "className": "trackBlockBottomBorder trackProperties"
        });


        //optionsGrid
        this.optionsBlockElement = el("div", {
            "className": "optionsBlockElement"
        });
        this.optionsBlockBottomBorder = el("div", {
            "className": "optionsBlockBottomBorder"
        });

        this.row = null;

        this.bindHighlightEvent();

        this.bindMenuContextEvent();

    }


    TimeLineRow.prototype.bindMenuContextEvent = function () {
        var tlrow = this;
        this.instanceBlockBottomBorder.addEventListener("contextmenu", function (evt) {
            evt.preventDefault();

            trackmenu.cotextmenuTimelineRow = tlrow;
            document.body.appendChild(trackmenu.element);

            trackmenu.position(evt.clientX + 1, evt.clientY);
            trackmenu.open = true;

        });
    }

    TimeLineRow.prototype.bindHighlightEvent = function () {
        var tlrow = this;

        this.instanceBlockBottomBorder.addEventListener("UITap", tapHighlight);
        this.optionsBlockBottomBorder.addEventListener("UITap", tapHighlight);
        this.trackBlockBottomBorderTrackProperties.addEventListener("UITap", tapHighlight);

        /**TODO folder Highlight*/
        function tapHighlight(evt) {
            if (tlrow._type === "property") {
                trunoffHighlight(tlrow);
            } else if (tlrow._type === "master") {
                trunoffHighlight(tlrow);
                recurOnOffHightlight(tlrow);

                function recurOnOffHightlight(tlrow) {

                    for (var i = 0; i < tlrow.children.length; i++) {
                        offHightlight(tlrow.children[i], "highlight");
                        if (tlrow.highlight) {
                            onHightlight(tlrow.children[i], "highlight-child");
                        } else {
                            offHightlight(tlrow.children[i], "highlight-child");
                        }

                    }
                }
            }
        }

        function offHightlight(_tlrow, hightlighType) {
            _tlrow.instanceBlockBottomBorder.removeAttribute(hightlighType);
            _tlrow.optionsBlockBottomBorder.removeAttribute(hightlighType);
            _tlrow.trackBlockBottomBorderTrackProperties.removeAttribute(hightlighType);
            _tlrow.highlight = false;
        }

        function onHightlight(_tlrow, hightlighType) {
            _tlrow.instanceBlockBottomBorder.setAttribute(hightlighType, "");
            _tlrow.optionsBlockBottomBorder.setAttribute(hightlighType, "");
            _tlrow.trackBlockBottomBorderTrackProperties.setAttribute(hightlighType, "");
            _tlrow.highlight = true;
        }

        function trunoffHighlight(_tlrow) {
            if (_tlrow.highlight) {
                offHightlight(_tlrow, "highlight");
                offHightlight(_tlrow, "highlight-child");
            } else {
                onHightlight(_tlrow, "highlight");
            }
        }

    }


    TimeLineRow.prototype.hide = function () {
        this.hided = true;


        var timeline = this.getTimeline();
        var instancesGrid = timeline.instancesGrid;
        var tracksGrid = timeline.tracksGrid;
        var optionsGrid = timeline.optionsGrid;

        try {
            this.instanceBlockElement && this.instanceBlockElement.parentNode.removeChild(this.instanceBlockElement);
            this.instanceBlockBottomBorder && this.instanceBlockBottomBorder.parentNode.removeChild(this.instanceBlockBottomBorder);
            this.expandIconContainer && this.expandIconContainer.parentNode.removeChild(this.expandIconContainer);
            //   instancesGrid.removeChild(this.instanceBlockElement);
            //   instancesGrid.removeChild(this.instanceBlockBottomBorder);
            //  this.expandIconContainer && instancesGrid.removeChild(this.expandIconContainer);

            //   tracksGrid.removeChild(this.track);
            //   tracksGrid.removeChild(this.trackBlockBottomBorderTrackProperties);
            //   optionsGrid.removeChild(this.optionsBlockElement);
            //   optionsGrid.removeChild(this.optionsBlockBottomBorder);

            this.track && this.track.parentNode.removeChild(this.track);
            this.trackBlockBottomBorderTrackProperties && this.trackBlockBottomBorderTrackProperties.parentNode.removeChild(this.trackBlockBottomBorderTrackProperties);
            this.optionsBlockElement && this.optionsBlockElement.parentNode.removeChild(this.optionsBlockElement);
            this.optionsBlockBottomBorder && this.optionsBlockBottomBorder.parentNode.removeChild(this.optionsBlockBottomBorder);
        } catch (e) {

        }



    }


    TimeLineRow.prototype.show = function () {
        this.hided = false;


        var timeline = this.getTimeline();
        var instancesGrid = timeline.instancesGrid;
        var tracksGrid = timeline.tracksGrid;
        var optionsGrid = timeline.optionsGrid;


        instancesGrid.appendChild(this.instanceBlockElement);
        instancesGrid.appendChild(this.instanceBlockBottomBorder);
        this.expandIconContainer && instancesGrid.appendChild(this.expandIconContainer);

        tracksGrid.appendChild(this.track);
        tracksGrid.appendChild(this.trackBlockBottomBorderTrackProperties);
        optionsGrid.appendChild(this.optionsBlockElement);
        optionsGrid.appendChild(this.optionsBlockBottomBorder);

        this.expandRow();
    }


    TimeLineRow.prototype.isHide = function () {
        return this.hided;
    }

    TimeLineRow.prototype.lock = function () {
        this.locked = true;
        this.instanceBlockBottomBorder.setAttribute("locked", "")
        this.trackBlockBottomBorderTrackProperties.setAttribute("locked", "")
        this.optionsBlockBottomBorder.setAttribute("locked", "locked")
    }

    TimeLineRow.prototype.unlock = function () {
        this.locked = false;
        this.instanceBlockBottomBorder.removeAttribute("locked")
        this.trackBlockBottomBorderTrackProperties.removeAttribute("locked")
        this.optionsBlockBottomBorder.removeAttribute("locked")
    }
    TimeLineRow.prototype.getMasterRow = function () {
        if (this._type === "master") {
            return this;
        }

        var masterRow = this;
        while (masterRow.parentRow) {
            masterRow = masterRow.parentRow;
        }
        if (masterRow !== this) {
            return masterRow;
        }
        console.error('must have mater row');
    }


    TimeLineRow.prototype.getTimeline = function () {
        return this._timeline;
    }


    TimeLineRow.prototype.insertRow = function (parentRow) {
        if (this._type !== "master") {
            if (!parent || !((parentRow instanceof TimeLineRow) && parentRow._type !== "property")) {
                console.error('must have a master or parentfolder');
                return;
            }
            if (this._type === "folder") {
                this.col = parentRow.col + 1;
            } else {
                this.col = parentRow.col;
            }

            this.parentRow = parentRow;

            parentRow.children.push(this);
        }
        var timeline = this.getTimeline();
        var instancesGrid = timeline.instancesGrid;
        var tracksGrid = timeline.tracksGrid;
        var optionsGrid = timeline.optionsGrid;


        instancesGrid.appendChild(this.instanceBlockElement);
        instancesGrid.appendChild(this.instanceBlockBottomBorder);
        this.expandIconContainer && instancesGrid.appendChild(this.expandIconContainer);

        tracksGrid.appendChild(this.track);
        tracksGrid.appendChild(this.trackBlockBottomBorderTrackProperties);
        optionsGrid.appendChild(this.optionsBlockElement);
        optionsGrid.appendChild(this.optionsBlockBottomBorder);
        this.unlock();


        TimeLine.row += 1;
        TimeLine.rowChange();
    }


    TimeLineRow.prototype.destroy = function () {
        this.hide();
        if (this._type !== "master") {
            var idx = this.parentRow.children.indexOf(this);
            this.parentRow.children.splice(idx, 1);
        }

        this.instancesTrack.unbindDrop();


        var idx = this._timeline.rowInstance.indexOf(this);
        this._timeline.rowInstance.splice(idx, 1);
    }

    TimeLineRow.prototype.expandRow = function () {


        var a = this.row;
        var l = this.col;

        let c = this.instanceBlockElement.style;
        c.gridColumnStart = l + 1,
            c.gridColumnEnd = "span end",
            c.gridRowStart = a,
            c.gridRowEnd = "span 1",
            c = this.instanceBlockBottomBorder.style,
            c.transform = `translate(0px, ${this.rowHeight * a}px)`;

        if (this.expandIconContainer) {
            c = this.expandIconContainer.style,
                c.gridColumnStart = l,
                c.gridColumnEnd = "span 1",
                c.gridRowStart = a,
                c.gridRowEnd = "span 1";
        }

        c = this.track.style,
            c.gridColumnStart = 1,
            c.gridColumnEnd = "span end",
            c.gridRowStart = a,
            c.gridRowEnd = "span 1",
            c = this.trackBlockBottomBorderTrackProperties.style,
            c.gridColumnStart = 1,
            c.gridColumnEnd = "span end",
            c.gridRowStart = a,
            c.gridRowEnd = "span 1",
            c = this.optionsBlockElement.style,
            c.gridColumnStart = 1,
            c.gridColumnEnd = "span end",
            c.gridRowStart = a,
            c.gridRowEnd = "span 1",
            c = this.optionsBlockBottomBorder.style,
            c.gridColumnStart = 1,
            c.gridColumnEnd = "span end",
            c.gridRowStart = a,
            c.gridRowEnd = "span 1"
    }




});