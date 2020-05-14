function hypot(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1)
}

function checkString(str) {
    if (!isString(str)) throw new TypeError("expected string")
}

function isString(str) {
    return "string" == typeof str
}

var step = 0.1;

function getPrecisionNumber(e) {
    return checkNumber(e),
        0 === step ? e : keepPrecision(e, 1 / step)
}

function keepPrecision(e, t) {
    return Math.round(e * t) / t
}

function checkNumber(e) {
    if (!isNumberNotInfinite(e))
        throw new TypeError("expected finite number")
}

function isNumberNotInfinite(e) {
    return isNumber(e) && isFinite(e)
}

function isNumber(e) {
    return "number" == typeof e
}

function Keyframe() {

    this.data = new Observer({
        _Value: 0,
        _Step: 0,
        _Index: 0,
        _Enabled: true,
        _Ease: "Default",
        _PathMode: "Default" //Line Be
    })

    this._Timeline = null;
    this._TimelineRow = null;
}

Object.defineProperty(Keyframe.prototype, 'Ease', {
    get: function () {
        return this.data.get("_Ease");
    },
    set: function (value) {
        this.data.set("_Ease", value);
    }
});

Object.defineProperty(Keyframe.prototype, 'PathMode', {
    get: function () {
        return this.data.get("_PathMode");
    },
    set: function (value) {
        this.data.set("_PathMode", value);
    }
});
Object.defineProperty(Keyframe.prototype, 'Index', {
    get: function () {
        return this.data.get("_Index");
    },
    set: function (value) {
        this.data.set("_Index", value);
    }
});


Object.defineProperty(Keyframe.prototype, 'Timeline', {
    get: function () {
        return this._Timeline;
    },
    set: function (value) {
        this._Timeline = value;
    }
});
Object.defineProperty(Keyframe.prototype, 'TimelineRow', {
    get: function () {
        return this._TimelineRow;
    },
    set: function (value) {
        this._TimelineRow = value;
    }
});

Object.defineProperty(Keyframe.prototype, 'Value', {
    get: function () {
        return this.data.get("_Value");
    },
    set: function (value) {
        this.data.set("_Value", value);
    }
});

Object.defineProperty(Keyframe.prototype, 'Step', {
    get: function () {
        return this.data.get("_Step");
    },
    set: function (value) {
        this.data.set("_Step", value);

        this.element.style.transform = `translate(${value * this.Timeline.rulerBaseWidth()}px, 13px)`;
    }
});

Keyframe.prototype.bindPointerEvent = function () {
    var self = this;
    var Timeline = self.Timeline;

    document.removeEventListener("UIPointerMove", keyframePointerMove, true)
    document.removeEventListener("UIPointerUp", keyframePointerUp, true)
    this.element.addEventListener("UIPointerDown", keyframePointerDown);

    var _lastKeyframeId, _lastKeyframePosx, _lastKeyframePosy, _moveKeyframe, _keyframepos;

    function keyframePointerDown(evt) {

        if (self.lock) return;
        _keyframepos = self.Step;
        const e = evt.detail;
        document.addEventListener("UIPointerMove", keyframePointerMove, true),
            document.addEventListener("UIPointerUp", keyframePointerUp, true),
            _lastKeyframeId = e.id,
            _lastKeyframePosx = e.clientX,
            _lastKeyframePosy = e.clientY,
            _moveKeyframe = false
        console.log('_keyframepos', _keyframepos);



        // self.obsdata = self.obsdata || new Observer(self.data);

        // TimeLine._KeyframeAttributesInspector.unlink();
        // TimeLine._KeyframeAttributesInspector.link(self.data);

        editor.call("attributes:inspect", "keyframe", self.data)


    }


    function keyframePointerUp(evt) {
        console.log('_keyframeposUp', self.Step)


        var TimeLine = editor.call('timeline:get');

        const e = evt.detail;
        if (e.id === _lastKeyframeId) {
            document.removeEventListener("UIPointerMove", keyframePointerMove, true)
            document.removeEventListener("UIPointerUp", keyframePointerUp, true)

            _lastKeyframeId = null,
                _lastKeyframePosx = null,
                _lastKeyframePosy = null,
                _moveKeyframe = false;

            var dragKeyframeGhost = self.Timeline.dragKeyframeGhost;
            dragKeyframeGhost && dragKeyframeGhost.parentNode && dragKeyframeGhost.parentNode.removeChild(dragKeyframeGhost);


            if (!self.TimelineRow.instancesTrack.findKeyframeAtStep(_keyframepos)) {
                //keep value

                if (self.TimelineRow._type !== "master") {

                    console.log('self.Step', self.Step)

                    //if has not master
                    if (!self.TimelineRow.getMasterRow().instancesTrack.findKeyframeAtStep(_keyframepos)) {
                        var _masterkeyframe = new MasterKeyframe(_keyframepos);
                        _masterkeyframe.Value = self.data.get("_Value");
                        self.TimelineRow.getMasterRow().instancesTrack.addKeyframe(_masterkeyframe);
                    }

                    console.log('self.Step', self.Step)

                    var _propertykeyframe = new PerpertyKeyframe(_keyframepos);
                    console.log('self.Step', self.Step)
                    _propertykeyframe.Value = self.data.get("_Value");
                    console.log('self.Step', self.Step)
                    self.TimelineRow.instancesTrack.addKeyframe(_propertykeyframe);
                    console.log('self.Step', self.Step)

                    editor.call("attributes:inspect", "keyframe", _propertykeyframe.data)


                } else { //replace
                    var oldStep = self.Step;

                    var oldkeyframe = self.TimelineRow.instancesTrack.findKeyframeAtStep(oldStep);
                    self.TimelineRow.instancesTrack.removeKeyframe(oldkeyframe);

                    oldkeyframe.Step = _keyframepos;
                    self.TimelineRow.instancesTrack.addKeyframe(oldkeyframe);

                    recurSetStep(self.TimelineRow);

                    function recurSetStep(timelineRow) {
                        for (var i = 0; i < timelineRow.children.length; i++) {
                            var tlrow = timelineRow.children[i];
                            if (tlrow._type === "property") {
                                var oldkeyframe = tlrow.instancesTrack.findKeyframeAtStep(oldStep);
                                if (oldkeyframe) {
                                    tlrow.instancesTrack.removeKeyframe(oldkeyframe);
                                    oldkeyframe.Step = _keyframepos;
                                    tlrow.instancesTrack.addKeyframe(oldkeyframe);
                                }



                            } else if (tlrow._type === "folder") {
                                recurSetStep(tlrow);
                            }
                        }
                    }

                }

                //self.MasterKeyframe = 
            }
            _keyframepos = null;


        }


    }



    function keyframePointerMove(evt) {

        const e = evt.detail;
        if (e.id === _lastKeyframeId) {
            var Timeline = self.Timeline;

            const t = hypot(_lastKeyframePosx, _lastKeyframePosy, e.clientX, e.clientY);
            if (!_moveKeyframe && t >= 10) {
                _moveKeyframe = true;
                keyframeGhostMove(e.clientX, e.clientY);

                let dx = evt.detail.clientX - _lastKeyframePosx;
                0 != dx % 2 && dx--;
                const rbasewidth = Timeline.rulerBaseWidth();
                var newPos = self.Step + dx / rbasewidth;
                var ppos = getPrecisionNumber(newPos);
                _keyframepos = ppos;

                var dragKeyframeGhost = self.Timeline.dragKeyframeGhost;
                dragKeyframeGhost.style.transform = `translate(${ppos * Timeline.rulerBaseWidth()}px, 0px)`;
            }
        }
    }
    //处理移动

    function keyframeGhostMove(e, f) {
        var Timeline = self.Timeline;
        var tracksGrid = Timeline.tracksGrid;
        if (!Timeline.dragKeyframeGhost) {
            Timeline.dragKeyframeGhost = el("div", {
                className: "dragKeyframeGhost marker"
            }, [
                el("div", {
                    className: "dragKeyframeTime"
                }, [

                ]),
                el("div", {
                    className: "dragKeyframeTime"
                }, [

                ])
            ]);
        }
        tracksGrid.appendChild(Timeline.dragKeyframeGhost);
        const t = tracksGrid.getBoundingClientRect();
        const n = t.x + tracksGrid.clientWidth,
            i = t.y + tracksGrid.clientHeight;

        _moveKeyframe = false;
    }


}
var keyframemenu = new ui.Menu();
var keyframemenuitem = new ui.MenuItem({
    text: '删除',
    value: 'removeKeyframe',
    icon: '&#57864;'
});
keyframemenuitem.on('select', function () {
    var keyframe = keyframemenu.keyframe;
    keyframe.TimelineRow.instancesTrack.removeKeyframe(keyframe);
    //if 没有propertyKeyframe 则同时删除master
    if(keyframe.TimelineRow.getMasterRow().children.length == 0){
        deleteMasterKeyframe(keyframe);
    }else{
        var hasPropertykeyframeAtPos = false;
        keyframe.TimelineRow.getMasterRow().children.forEach(row => {
            var instancesTrack =    row.instancesTrack;
            var _Keyframe = instancesTrack.findKeyframeAtStep(keyframe.Step);
            if(_Keyframe){
                hasPropertykeyframeAtPos = true;
            }
        });

        if(!hasPropertykeyframeAtPos){
            deleteMasterKeyframe(keyframe);
        }
    }

    function deleteMasterKeyframe(keyframe){
        var instancesTrack = keyframe.TimelineRow.getMasterRow().instancesTrack;
        var _masterKeyframe = instancesTrack.findKeyframeAtStep(keyframe.Step);
        _masterKeyframe && instancesTrack.removeKeyframe(_masterKeyframe);
    }

    
    keyframemenu.keyframe = null;
    //overlay.hidden = false;          
});
keyframemenu.append(keyframemenuitem);

var keyframemenuitem = new ui.MenuItem({
    text: '设定曲线',
    value: 'setEase',
    icon: '&#57864;'
});
keyframemenuitem.on('select', function () {
    //overlay.hidden = false;          
});
keyframemenu.append(keyframemenuitem);

Keyframe.prototype.bindMenuContextEvent = function () {
    var keyframe = this;
    keyframe.element.addEventListener("contextmenu", function (evt) {
        if (keyframe.lock) return;
        evt.preventDefault();
        keyframemenu.keyframe = keyframe;
        document.body.appendChild(keyframemenu.element);

        keyframemenu.position(evt.clientX + 1, evt.clientY);
        keyframemenu.open = true;

    });
}


function MasterKeyframe(_step, _value) {
    Keyframe.call(this);
    this.Tags = "";
    this.element = el("div", {
        className: "keyframe mainKeyframe"
    }, [
        el("div", {
            className: "secondaryDisplayBack"
        }),
        el("div", {
            className: "secondaryDisplayFront"
        })
    ]);
    this.data.set("_Step", _step);
    if (_value !== undefined) this.data.set("_Value", _value);
    this.Enable = true;

    this.bindPointerEvent();
    this.bindMenuContextEvent();
}
MasterKeyframe.prototype = Object.create(Keyframe.prototype);

Object.defineProperty(MasterKeyframe.prototype, 'Enable', {
    get: function () {
        return this.data.get("_Enable");
    },
    set: function (value) {
        this.data.set("_Enable", value);

        this.element.classList.add("enable");
    }
});


function PerpertyKeyframe(_step, _value) {
    Keyframe.call(this);

    this.element = el("div", {
        className: "keyframe propertyKeyframe"
    }, [
        el("div", {
            className: "secondaryDisplayBack"
        }),
        el("div", {
            className: "secondaryDisplayFront"
        })
    ]);

    this.Enable = true;
    this.data.set("_Name", "");
    this.data.set("_ResultMode", "Default");
    this.data.set("_Step", _step);
    if (_value !== undefined) this.data.set("_Value", _value);
    this.Enable = true;
    this.bindPointerEvent();
    this.bindMenuContextEvent();
}
PerpertyKeyframe.prototype = Object.create(Keyframe.prototype);


Object.defineProperty(PerpertyKeyframe.prototype, 'Enable', {
    get: function () {
        return this.data.get("_Enable");
    },
    set: function (value) {
        this.data.set("_Enable", value);

        this.element.classList.add("enable", "masterEnable");
    }
});

editor.method('MasterKeyframe:Class', function () {
    return MasterKeyframe;

});
editor.method('PerpertyKeyframe:Class', function () {
    return PerpertyKeyframe;
});

editor.once('load', function () {

    // var TimeLine = editor.call('timeline:get');


    // var history = editor.call("editor:history");
    // debugger
    // var _KeyframeAttributesInspector = new pcui.AttributesInspector({
    //     attributes: ATTRIBUTES,
    //     history: history
    // });

    // TimeLine._KeyframeAttributesInspector = _KeyframeAttributesInspector;

    // editor.call('layout.attributes').domContent.appendChild(TimeLine._KeyframeAttributesInspector.element);

});