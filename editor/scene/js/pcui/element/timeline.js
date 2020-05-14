Object.assign(pcui, (function () {
    'use strict';
   
    var scalar = 1;

    var step = scalar * 0.1;

    var listenToCounter = 0;
    function matchesSelectorListener(selector, listener, contextNode) {
        return function(e) {
            var matchesTarget = matches(e.target, selector, contextNode);
            if (matchesTarget) {
                listener(e, matchesTarget);
            }
        };
    }

    function matches(node, selector, contextNode) {
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

    class UIComponent  extends pcui.Container{
        constructor(dom,args){
            super(dom, args);
        }
    
        listenTo(obj, name, callback, useCapture) {
            var listeningTo, id;
    
            if (!callback && typeof name === "object") {
                callback = this;
            }
    
            listeningTo = this._listeningTo || (this._listeningTo = {});
            id = "l" + (++listenToCounter);
            listeningTo[id] = {object: obj, name: name, callback: callback};
    
            if (obj.addEventListener) {
                var selector = name.match(/(.*):(.*)/);
                if (selector) {
                    name = selector[2];
                    selector = selector[1];
                    callback = matchesSelectorListener(selector, callback, obj);
                    listeningTo[id].callback = callback;
                    listeningTo[id].name = name;
                }
    
                obj.addEventListener(name, callback, !!useCapture);
    
    
            } else if (obj.on) {
                obj.on(name, callback, this);
            }
    
            return this;
        }
    
        stopListening(obj, name, callback, useCapture) {
            var listeningTo = this._listeningTo,
                map = {},
                item,
                id;
    
            if (!listeningTo) {
                return this;
            }
    
            if (obj && !name && !callback) {
                for (id in listeningTo) {
                    if (listeningTo[id].object === obj) {
                        map[id] = listeningTo[id];
                    }
                }
            } else if (obj && name && !callback) {
                for (id in listeningTo) {
                    if (listeningTo[id].object === obj && listeningTo[id].name === name) {
                        map[id] = listeningTo[id];
                    }
                }
            } else if (obj && name && callback) {
                for (id in listeningTo) {
                    if (listeningTo[id].object === obj && listeningTo[id].name === name && listeningTo[id].callback === callback) {
                        map[id] = listeningTo[id];
                    }
                }
            } else if (!obj && !name && !callback) {
                map = listeningTo;
            }
    
            for (id in map) {
                item = map[id];
                if (item.object.removeEventListener) {
                    item.object.removeEventListener(item.name, item.callback, !!useCapture);
                } else if (item.object.off) {
                    item.object.off(item.name, item.callback, this);
                }
    
                delete this._listeningTo[id];
            }
    
            return this;
        }
    
    }



    function checkString(str) {
        if (!isString(str)) throw new TypeError("expected string")
    }
    function isString(str) {
        return "string" == typeof str
    }

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
    var pointerTarget = null, _playHandlePos, _totalTimeHandlePos, _lastHandleClientX = 0;

    class Timeline extends UIComponent {
        constructor(args) {
            if (!args) args = {};
            super(document.createElement('div'), args);


            this.dom.innerHTML = `
            <ui-pane id="timelineBar" captioned="" floating="" role="section" style="transform: translate(0px, 0px); width: 1308px; height: 350px; z-index: 1; --track-height:25px;">
           
            <ui-caption><span class="pane-caption-text">Timeline</span>
        </ui-caption>
        <ui-body row2="" style="display: flex;"> <ui-toolbar-container level="0" horizontal="" wrap="">
        <ui-toolbar role="toolbar" horizontal="" wrap="" style="">
            <ui-toolbar-split-button type="split" wrap="" style="height: 26px; --arrow-size:10px; --arrow-color:#000000;">
                <div primary="" title="Add instances to the root of this timeline">
                    <ui-icon
                        style="width: 20px; height: 20px; background: url('./icon-sheet-1.png') -88px -88px no-repeat;">
                    </ui-icon>
                </div>
                <div secondary="" title="More actions">
                    <div class="arrow"></div>
                </div>
            </ui-toolbar-split-button>
            <ui-toolbar-button title="Editing mode" wrap="" style="width: 26px; height: 26px;">
                <ui-icon
                    style="width: 20px; height: 20px; background: url(./icon-sheet-1.png) -110px -22px no-repeat;">
                </ui-icon>
            </ui-toolbar-button>
            <ui-toolbar-separator horizontal="" wrap="" style="height: 26px;"></ui-toolbar-separator>
            <ui-toolbar-button title="Last master keyframe" wrap="" style="width: 26px; height: 26px;">
                <ui-icon
                    style="width: 20px; height: 20px; background: url(./icon-sheet-1.png)  -110px -88px no-repeat;">
                </ui-icon>
            </ui-toolbar-button>
            <ui-toolbar-button title="Play" wrap="" style="width: 26px; height: 26px;">
                <ui-icon
                    style="width: 20px; height: 20px; background: url(./icon-sheet-1.png) 0px -110px no-repeat;">
                </ui-icon>
            </ui-toolbar-button>
            <ui-toolbar-button title="Stop" wrap="" disable="" style="width: 26px; height: 26px;">
                <ui-icon
                    style="width: 20px; height: 20px; background: url(./icon-sheet-1.png) -22px -110px no-repeat;">
                </ui-icon>
            </ui-toolbar-button>
            <ui-toolbar-button title="Next master keyframe" wrap="" style="width: 26px; height: 26px;">
                <ui-icon
                    style="width: 20px; height: 20px; background: url(./icon-sheet-1.png) -44px -110px no-repeat;">
                </ui-icon>
            </ui-toolbar-button>


            <ui-toolbar-button title="Apply" wrap="" style="width: 26px; height: 26px;">
            <ui-icon
                style="width: 20px; height: 20px; background: url(./icon-sheet-2.png) -88px -88px no-repeat;">
            </ui-icon>
           </ui-toolbar-button>


        </ui-toolbar>
        <ui-toolbar-layout-remaining-space wrap="" style="--scrollbar-offset:-18px;">
            <div class="topContainer">
                <div class="instancesTop">
                    <div class="iconWrapper">
                        <ui-icon
                            style="width: 20px; height: 20px; background: url(./icon-sheet-1.png) 0px -22px no-repeat;">
                        </ui-icon>
                    </div>
                    <div class="timelineName">Timeline 1</div>
                </div>
                <div class="timeline"><canvas class="timelineCanvas" width="902" height="24"
                        style="width: 902px; height: 24px;"></canvas></div>
                <div class="optionsTop">
                    <div class="iconWrapper" title="Toggle the visibility of each instance">
                        <ui-icon
                            style="width: 20px; height: 20px; background: url(./icon-sheet-1.png) -66px -110px no-repeat;">
                        </ui-icon>
                    </div>
                    <div class="iconWrapper" title="Lock tracks to prevent editing">
                        <ui-icon
                            style="width: 20px; height: 20px; background: url(./icon-sheet-1.png) -88px -110px no-repeat;">
                        </ui-icon>
                    </div>
                    <div class="iconWrapper" title="Toggle the enable state of a track">
                        <ui-icon
                            style="width: 20px; height: 20px; background: url(./icon-sheet-1.png) -110px -110px no-repeat;">
                        </ui-icon>
                    </div>
                </div>
            </div>
            <div class="bottomContainer">
                <div class="optionsGrid" style="grid-template-rows: [start] 25px 25px 25px 25px 25px [middle] auto [end] 0px;">
                </div>
                <div class="instancesGrid" style="grid-template-rows: [start] 25px 25px 25px 25px 25px [middle] auto [end] 0px; grid-template-columns: [start] 25px 25px [middle] auto [end] 0px;">
                </div>
                <div class="tracksGrid" style="grid-template-rows: [start] 25px 25px 25px 25px 25px [middle] auto [end] 0px;">
                    <div class="playHead marker" style="transform: translate(0px, 0px);">
                        <div class="playHeadHandle handle"></div>
                    </div>
                    <div class="totalTime marker" style="transform: translate(600px, 0px);">
                        <div class="totalTimeHandle handle"></div>
                    </div>
                </div>
            </div>
            <div class="overlay"></div>
        </ui-toolbar-layout-remaining-space>
    </ui-toolbar-container>
</ui-body></ui-pane>`;

          this.init();
          this.bindEvent();

          this.iconEvent();
        }

        init(){
            this.rowInstance = [];
            this.tracksGrid = this.dom.querySelector(".tracksGrid");
            this.instancesGrid = this.dom.querySelector(".instancesGrid");
            this.optionsGrid = this.dom.querySelector(".optionsGrid");
            this.row = 0;

            this.playHeadHandlePos = 0;
            this.totalTimeHandlePos = 5 * scalar;

            this.handlePointerUp = this.handlePointerUp.bind(this);
            this.handlePointerMove = this.handlePointerMove.bind(this);

            this._fieldAttributes = {
                "playHeadHandlePos":{

                },
                "totalTimeHandlePos":{

                },
                "rowInstance":{
                    /**
                     * data.name
                     * data.type
                     * 
                     */

                }

            }

            
        }

        

        bindEvent(){
            var _timeline = this.dom.querySelector("div.timeline"), t, ctx;
            this.timelineCanvas = this.dom.querySelector(".timelineCanvas");
            this.playHeadHandle = this.dom.querySelector(".playHeadHandle.handle");
            this.totalTimeHandle = this.dom.querySelector(".totalTimeHandle.handle");
            this.totalTimeMark = this.dom.querySelector(".totalTime.marker");
            this.playHeadMark = this.dom.querySelector(".playHead.marker");



            var devicePixelRatio = 1;

            var timelineCanvas =  this.timelineCanvas;
        
            canvasDraw();
            function canvasDraw() {
                if (isNumberNotInfinite(t))
                    return;
                const render = () => {
                    const timelinedom = _timeline.getBoundingClientRect();
                    if (0 === timelinedom.width || 0 === timelinedom.height)
                        return void (t = requestAnimationFrame(render));
                    const _domWidth = timelinedom.width
                        , _domHeight = timelinedom.height
                        , scaleWidth = Math.floor(_domWidth * devicePixelRatio)
                        , scaleHeight = Math.floor(_domHeight * devicePixelRatio);
                    ctx || (ctx = timelineCanvas.getContext("2d")),
                        timelineCanvas.width = scaleWidth,
                        timelineCanvas.height = scaleHeight,
                        timelineCanvas.style.width = `${_domWidth}px`,
                        timelineCanvas.style.height = `${_domHeight}px`,
                        drawtickmark(ctx, scaleWidth, scaleHeight),
                        t = NaN
                };
                t = requestAnimationFrame(render)
            }
        
            var self = this;
            
            var tracksGrid = this.dom.querySelector(".tracksGrid");
            var timelineBar = this.dom.querySelector("#timelineBar");
            const timelineBarCompute = getComputedStyle(timelineBar);
        
            var timelineToolBarRS = this.dom.querySelector("ui-toolbar-layout-remaining-space");
        
            var timelineToolBarRSCompute = getComputedStyle(timelineToolBarRS)
            function paddingValue() {
                return parseFloat(timelineToolBarRSCompute.getPropertyValue("--totaltime-padding"))
            }
            var drawtickmark = function (ctx, width, height) {
                const dpr = devicePixelRatio
                    , d = paddingValue() * dpr
                    , r = self.rulerOffsetPos()
                    , o = self.rulerBaseWidth();
                let a = o * dpr
                    , l = Math.floor(r * dpr / a) + 1;
                const s = a
                    , c = Math.floor(s / 2)
                    , m = Math.floor(s / 10)
                    , v = height
                    , L = height * (1 / 2)
                    , p = height * (7 / 8) - 1;
                ctx.save(),
                    ctx.translate(.5 - r * dpr % s, .5),
                    ctx.font = "1em Arial",
                    ctx.textAlign = "center",
                    ctx.textBaseline = "bottom",
                    ctx.imageSmoothingEnabled = !1;
                const g = 's';
                do {
                    for (let i = 1; 4 >= i; i++) {
                        const posx = a - s + m * i;
                        ctx.moveTo(posx, v),
                            ctx.lineTo(posx, p)
                    }
                    for (let i = 6; 9 >= i; i++) {
                        const posx = a - s + m * i;
                        ctx.moveTo(posx, v),
                            ctx.lineTo(posx, p)
                    }
                    ctx.moveTo(a - c, v),
                        ctx.lineTo(a - c, height * (4 / 5) - 3),
                        ctx.moveTo(a, v),
                        ctx.lineTo(a, L),
                        ctx.fillText(`${l * scalar}${g}`, a, L),
                        a += o * dpr,
                        l++
                } while (a < width + 2 * (o * dpr) + d); ctx.stroke(),
                    ctx.restore()
            }
        
            function moveEndPos(pointerPosLeft, dom) {
                checkNumber(pointerPosLeft);
                const _timelinecanvas = self.timelineCanvas, _tracksGrid = self.tracksGrid;
                let i;
                i = dom === _timelinecanvas || dom === _tracksGrid ? _timelinecanvas.getBoundingClientRect() : _tracksGrid.getBoundingClientRect();
                return pointerPosLeft - i.left + self.rulerOffsetPos()
            }
        
            function getMoveStep(pointerPos, pointerDom) {
                checkNumber(pointerPos)
                const n = self.rulerBaseWidth(), i = moveEndPos(pointerPos, pointerDom);
                return getPrecisionNumber(i / n);
            }
        
            function canvasPointer(evt) {
                const clientX = evt.detail ? evt.detail.clientX : evt.clientX, t = evt.detail ? evt.detail.clientY : evt.clientY;
                if (evt.target === self.tracksGrid) {
                   
                }
                const n = getMoveStep(clientX, evt.target)
                self.playTimePosChange(n)
                self.attchPointerDown(evt);
            }
            this.timelineCanvas.addEventListener('UIPointerDown', (e) => canvasPointer(e));
            this.totalTimeHandle.addEventListener('UIPointerDown', (e) => this.attchPointerDown(e));
            this.playHeadHandle.addEventListener('UIPointerDown', (e) => this.attchPointerDown(e));




            var rafid;
            function scrollEvel(e){
                var scrollTop = e.target.scrollTop;
                rafid = requestAnimationFrame(()=>{
                    
                    const scroolldy = self._lastScrollTop - scrollTop;
                    self._lastScrollTop = scrollTop;
                    if(scroolldy != 0){
                        self.tracksGrid.scrollTop = scrollTop;
                        self.instancesGrid.scrollTop = scrollTop;
                        self.optionsGrid.scrollTop = scrollTop;
                    }
                    rafid = NaN
                });
            }
            this._lastScrollTop = 0;

            this.listenTo(this.tracksGrid,"scroll",scrollEvel);
            this.listenTo(this.instancesGrid,"scroll",scrollEvel);
            this.listenTo(this.optionsGrid,"scroll",scrollEvel);



            // this.tracksGrid.addEventListener("scroll",scrollEvel);
            // this.instancesGrid.addEventListener("scroll",scrollEvel);
            // this.optionsGrid.addEventListener("scroll",scrollEvel);
        
        }


        iconEvent(){

            var csscode = "",__code_picker;
            var uitoolbarsplitbutton = this.dom.querySelector("ui-toolbar-split-button");
            uitoolbarsplitbutton.addEventListener("mouseover",function(){
                uitoolbarsplitbutton.setAttribute("mouse-over","");
            },true);
            uitoolbarsplitbutton.addEventListener("mouseout",function(){
                uitoolbarsplitbutton.removeAttribute("mouse-over","");
            },true);
            


            var applybtn = this.dom.querySelector('ui-toolbar-button[title="Apply"]');
            applybtn.addEventListener("mouseover",function(){
                if(csscode){
                    applybtn.setAttribute("mouse-over","");
                    applybtn.setAttribute("mouse-over-light","");
                }
               
            },true);

            applybtn.addEventListener("click",function(){
                __code_picker && editor.call("picker:animation-code",__code_picker,function(){
                        
                });
               
            },true);


           


            applybtn.addEventListener("mouseout",function(){
                applybtn.removeAttribute("mouse-over","");
                applybtn.removeAttribute("mouse-over-light","");
            },true);



            
            var toolbarsplitprimarybtn = uitoolbarsplitbutton.querySelector("[primary]");
            var toolbarsplitsecondarybtn = uitoolbarsplitbutton.querySelector("[secondary]");
            toolbarsplitprimarybtn.addEventListener("mouseover",function(){
                toolbarsplitprimarybtn.setAttribute("mouse-over","");
                toolbarsplitsecondarybtn.setAttribute("mouse-over-light","");
            },true);
            toolbarsplitprimarybtn.addEventListener("mouseout",function(){
                toolbarsplitprimarybtn.removeAttribute("mouse-over");
                toolbarsplitsecondarybtn.removeAttribute("mouse-over-light","");
            },true);
            
            toolbarsplitsecondarybtn.addEventListener("mouseover",function(){
                toolbarsplitsecondarybtn.setAttribute("mouse-over","");
                toolbarsplitprimarybtn.setAttribute("mouse-over-light","");
            },true);
            toolbarsplitsecondarybtn.addEventListener("mouseout",function(){
                toolbarsplitsecondarybtn.removeAttribute("mouse-over");
                toolbarsplitprimarybtn.removeAttribute("mouse-over-light","");
            },true);
            
            var playbtn = this.dom.querySelector('ui-toolbar-button[title="Play"]');
            var raf;
            playbtn.addEventListener("UITap", function (evt) {
                evt = evt.detail;
                //TimeLine.build();
                var currentIframe = document.querySelector(".viewport iframe");
                var iframedocument = currentIframe.contentDocument || currentIframe.contentWindow.document;
                var buildinstyle = iframedocument.querySelector('#buildin-tyle');

                if (!buildinstyle) {
                    buildinstyle = iframedocument.createElement('style');
                    buildinstyle.setAttribute("id", "buildin-tyle");
                    iframedocument.head.appendChild(buildinstyle);
                }
                buildinstyle.innerHTML = "";
                var TimeLine = editor.call('timeline:get');


               
                TimeLine.rowInstance.filter(r => r._type === "master").forEach(r => {
                    var subrows = r.children;
                    var entries = r.instancesTrack.keyframes.entries();

                    var rows = [];
                    var item = entries.next();
                    var lastcol;
                    while (item && item.value) {
                        var col = [];
                        var animationPercent = Math.fround(parseFloat(item.value[0]) / TimeLine.totalTimeHandlePos * 100);
                        col.push(animationPercent)
                        subrows.forEach((sr, idx) => {

                            if (sr.instancesTrack.keyframes.get(item.value[0])) {
                                col.push({
                                    Name: sr.instancesTrack.Name,
                                    Value: sr.instancesTrack.keyframes.get(item.value[0]).Value
                                })
                            } else {
                                if (lastcol) col.push(lastcol[idx + 1]);
                            }


                        });
                        rows.push(col);
                        lastcol = col;
                        item = entries.next();
                    }

                    
                    rows = rows.sort((a, b) => a[0] - b[0]);

                    if (rows[rows.length - 1][0] != 100) {
                        var lastrow = rows[rows.length - 1];
                        var copyrow = [100];
                        for (var i = 1; i < lastrow.length; i++) {
                            copyrow.push(lastrow[i]);
                        }
                        rows.push(copyrow);
                    }
                    console.log(rows);

                    var animtionRawData = rows.sort((a, b) => a[0] - b[0]).map(animationRowData => {

                        var trs = {};

                        var temp = animationRowData[0] + "% {\n";
                        for (var i = 1; i < animationRowData.length; i++) {
                            var propertyName = animationRowData[i].Name;
                            if (propertyName === "X" || propertyName === "Y" || propertyName === "Rotate" || propertyName === "ScaleX"
                            || propertyName === "ScaleY" || propertyName === "Opacity") {
                                trs[propertyName] = animationRowData[i].Value;
                            } else {
                                temp += ` ${animationRowData[i].Name}:${animationRowData[i].Value};`;
                            }
                        }

                        var $translate = '', $rotate = '', $scale = '',$opacity = '';
                        if (trs.X !== undefined || trs.Y !== undefined) {
                            $translate = `translate(${trs.X || 0}px,${trs.Y || 0}px) `;
                        }

                        if (trs.Rotate !== undefined) {
                            $rotate = `rotate(${trs.Rotate}deg) `;
                        }

                        if (trs.ScaleX !== undefined || trs.ScaleY !== undefined) {
                            $scale = `scale(${trs.ScaleX || 1},${trs.ScaleY || 1}) `;
                        }

                        if (trs.Opacity !== undefined) {
                            $opacity =  Math.min(1, Math.max(trs.Opacity,0));
                        }

                        if ($translate || $rotate || $scale) {
                            temp += `transform:  ${$translate}  ${$rotate} ${$scale};`
                        }
                        if ($opacity !== undefined) {
                            temp += `opacity:  ${$opacity};`
                        }
                        temp += "}";
                        return temp;
                    }).join("");


                    var animationName = r.instancesTrack.Name;


                    var animationData = `@keyframes  ${animationName} {
  ${animtionRawData}
          }`;



                    buildinstyle.innerHTML = buildinstyle.innerHTML + animationData;

                    var animateTarget = r.animateTarget;

                    animateTarget = editor.call("entities:get",animateTarget).entity.dom;

                    var targetClassSelector = animateTarget.className.split(" ").filter(e => e).join(".");
                    targetClassSelector = targetClassSelector ? "." + targetClassSelector : "";
                    csscode += `${animateTarget.tagName.toLowerCase()}${targetClassSelector} {animation: ${animationName} linear ${TimeLine.totalTimeHandlePos}s;}`;

                    animateTarget.style.animation = "";
                    __code_picker = animationData + "\n" + csscode;

                    requestAnimationFrame(function(){
                        animateTarget.style.animation = `${animationName} linear ${TimeLine.totalTimeHandlePos}s`;                   
                    });

  
                    var totaltime = 0
                    clearTimeout(raf);

                    var runPlayHandle = function () {


                        raf = setTimeout(function () {

                            totaltime += 0.1;
                            if (totaltime <= TimeLine.totalTimeHandlePos) {
                                TimeLine.playTimePosChange(TimeLine.playHeadHandlePos + 0.1);
                                runPlayHandle();
                            } else {
                                TimeLine.playHeadHandlePos = 0;
                                TimeLine.playTimePosChange(0);
                                totaltime = 0;
                                animateTarget.style.animation = "";
                            }

                        }, 100);
                    };
                    clearTimeout(raf);
                    TimeLine.playHeadHandlePos = 0;
                    runPlayHandle();

                })



                console.log(`<pre class="ui-code">
                ${buildinstyle.innerHTML}
                ${csscode}
                </pre>`)

            });

        }

        set assetSync(value){
            if(this._asset !== value){
                var timelines = value.get("data.timelines");
                this.link(new Observer(timelines));
               
                this._asset = value;
            }
        }

        link(observers) {
            this.unlink();
            this._observers = observers;    
            //var rowInstance = observers.get("rowInstance");         
        }

        unlink() {

            //this._KeyframeAttributesInspector && this._KeyframeAttributesInspector.unlink();

            // if (!this._observers) return;

            // this._observers = null;

            // this.rowInstance.forEach(tlrow => {
            //     tlrow.distroy();
            // });      
        }

        destroy(){
            this.unlink();

            this.stopListening(this.tracksGrid,"scroll");
            this.stopListening(this.instancesGrid,"scroll");
            this.stopListening(this.optionsGrid,"scroll");

            document.removeEventListener("UIPointerUp", this.handlePointerUp);
            document.removeEventListener("UIPointerMove", this.handlePointerMove);

            super.destroy();

            // this.tracksGrid.addEventListener("scroll",scrollEvel);
            // this.instancesGrid.addEventListener("scroll",scrollEvel);
            // this.optionsGrid.addEventListener("scroll",scrollEvel);

        }


        playTimePosChange(newPos)  {
            var ppos = getPrecisionNumber(newPos);
            this.playHeadHandlePos = ppos;
            this.playHeadMark.style.transform = `translate(${ppos * this.rulerBaseWidth()}px, 0px)`;
        }
        totalTimePosChange(newPos){
            var ppos = getPrecisionNumber(newPos);
            this.totalTimeHandlePos = ppos;
            this.totalTimeMark.style.transform = `translate(${ppos * this.rulerBaseWidth()}px, 0px)`;
        }
        rulerBaseWidth() {
            return 120 * 1;
        }
        rulerOffsetPos() {
            return 0;
        }
        getVisibleRow(){
            return this.rowInstance.filter(e => !e.hided).length;
        }
        reinit(){
            this.row = 0;
            this.playHeadHandlePos = 0;
            this.totalTimeHandlePos = 0;
           

            for(var i = 0;i < this.rowInstance.length;i++){
                var tlr = this.rowInstance[i];
                tlr.destroy();
                i--;
            }

            this.rowInstance = [];
        }


        removeRow(timelinerow) {
            var self = this;
            var rowIdx = this.rowInstance.indexOf(timelinerow);
            var items = [];

            function deepfold(timelinerow) {
                var masterRow = timelinerow;
                masterRow._fold = true;
                var _masterrow = masterRow;
                items.push(_masterrow);

                for (var i = _masterrow.children.length - 1; i >= 0; i--) {
                    var childrow = _masterrow.children[i];

                    if (!childrow.isHide()) {
                        //childrow.hide();
                       
                        if (childrow._type !== "perperty") {
                            var _fold = childrow._fold;
                            deepfold(childrow);
                            childrow._fold = _fold;
                        }/** todo folder **/
                        else{
                            items.push(childrow);
                        }
                    } else {
                        items.push(childrow);
                    }

                }
            }
            deepfold(timelinerow);

            
            for(var i = 0 ;i < items.length;i++){
                items[i].destroy();
            }
            
            /**后面的timelinerow 都受影响 */
            var curRow = timelinerow.row - 1;
            for (rowIdx = rowIdx + 1 - 1; rowIdx < this.rowInstance.length; rowIdx++) {
                if (!this.rowInstance[rowIdx].isHide()) {
                    curRow = curRow + 1;
                    console.log('curRow', curRow)

                    this.rowInstance[rowIdx].row = curRow;

                    this.rowInstance[rowIdx].expandRow();
                } else {

                }
            }

        }


        foldRow(timelinerow) {
            var self = this;
            var rowIdx = this.rowInstance.indexOf(timelinerow);

            function deepfold(timelinerow) {
                var masterRow = timelinerow;
                masterRow._fold = true;
                var _masterrow = masterRow;
                for (var i = _masterrow.children.length - 1; i >= 0; i--) {
                    var childrow = _masterrow.children[i];

                    if (!childrow.isHide()) {
                        childrow.hide();

                        if (childrow._type !== "perperty") {
                            var _fold = childrow._fold;
                            deepfold(childrow);
                            childrow._fold = _fold;
                        }
                    } else {

                    }

                }
            }
            deepfold(timelinerow);

            /**后面的timelinerow 都受影响 */
            var curRow = timelinerow.row;
            for (rowIdx = rowIdx + 1; rowIdx < this.rowInstance.length; rowIdx++) {
                if (!this.rowInstance[rowIdx].isHide()) {
                    curRow = curRow + 1;
                    console.log('curRow', curRow)

                    this.rowInstance[rowIdx].row = curRow;

                    this.rowInstance[rowIdx].expandRow();
                } else {

                }
            }
        }

        expandRow(timelinerow) {
            var self = this;
            var rowIdx = this.rowInstance.indexOf(timelinerow);

            function deepexpand(timelinerow) {
                var masterRow = timelinerow;
                masterRow._fold = true;
                var _masterrow = masterRow;
                for (var i = _masterrow.children.length - 1; i >= 0; i--) {
                    var childrow = _masterrow.children[i];

                    childrow.show();

                    if (childrow._type !== "perperty" && !childrow._fold) {

                        var _fold = childrow._fold;
                        deepexpand(childrow);
                        childrow._fold = _fold;
                    }

                }
            }
            deepexpand(timelinerow);

            var curRow = timelinerow.row;
            for (rowIdx = rowIdx + 1; rowIdx < this.rowInstance.length; rowIdx++) {
                if (!this.rowInstance[rowIdx].isHide()) {
                    curRow = curRow + 1;
                    this.rowInstance[rowIdx].row = curRow;
                    this.rowInstance[rowIdx].expandRow();
                }
            }

        }

        resolveType(timeline, type) {
            timeline._resolveType = type;
        }
       
        attchPointerDown(evt, e) {
            evt.stopPropagation();
            evt.target === this.playHeadHandle ? (!!e && resolveType(t, "time"), pointerTarget = this.playHeadHandle) :
                evt.target === this.timelineCanvas ? (!!e && resolveType(t, "time"), pointerTarget = this.playHeadHandle) :
                    evt.target === this.totalTimeHandle && (!!e && resolveType(t, "total-time"), pointerTarget = this.totalTimeHandle),
                pointerTarget && (pointerTarget.setAttribute("pointer-down", ""),
                    _lastHandleClientX = evt.detail ? evt.detail.clientX : evt.clientX,
                    _playHandlePos = this.playHeadHandlePos,
                    _totalTimeHandlePos = this.totalTimeHandlePos,
                    document.addEventListener("UIPointerUp", this.handlePointerUp),
                    document.addEventListener("UIPointerMove", this.handlePointerMove)
                )
        } 
        handlePointerUp() {
            _lastHandleClientX = null;
            pointerTarget = null;
            this.playHeadHandle.removeAttribute("pointer-down");
            this.totalTimeHandle.removeAttribute("pointer-down");
            document.removeEventListener("UIPointerUp", this.handlePointerUp);
            document.removeEventListener("UIPointerMove", this.handlePointerMove);
    
        }
        handlePointerMove(evt) {
            let e = evt.detail.clientX - _lastHandleClientX;
            0 != e % 2 && e--;
            const rbasewidth = this.rulerBaseWidth();
            pointerTarget === this.playHeadHandle ? (this.resolveType(this, "time"), this.playTimePosChange(_playHandlePos + e / rbasewidth))
                : pointerTarget === this.totalTimeHandle && (this.resolveType(this, "total-time"), this.totalTimePosChange(_totalTimeHandlePos + e / rbasewidth))
        }

        json(){

            var rowInstanceTree = [];

            for(var i = 0; i < this.rowInstance.length;i++){
                var row = this.rowInstance[i];
                if(!row.parentRow){
                    
                    rowInstanceTree.push(row);
                }

            }

            function buildjson(rowinstances){
               return  rowinstances.map(tlrow => {

                    var keyframesobj = {};
                    tlrow.instancesTrack.keyframes.forEach(function(value, key, map) {
                        var kdata = value.data.json();
                        kdata.lock =  value.lock;
                        keyframesobj[key] = kdata;
                        
                    });
    
    
                    return {
                        animateTarget: tlrow.animateTarget,
                        row: tlrow.row,
                        _type: tlrow._type,
                        _fold: tlrow._fold,
                        hided : tlrow.hided,
                        locked: tlrow.locked,
                        instancesTrack: {
                            _Name: tlrow.instancesTrack._Name,
                            AnimationMode: tlrow.instancesTrack.AnimationMode,
                            ResultMode: tlrow.instancesTrack.ResultMode,
                            Ease: tlrow.instancesTrack.Ease,
                            PathMode: tlrow.instancesTrack.PathMode,//Line Be
                            _Enabled: tlrow.instancesTrack._Enabled,
                            TrackId: tlrow.instancesTrack.TrackId,
                            Editor: tlrow.instancesTrack.Editor,
                            keyframes: keyframesobj
                        },
                        children: buildjson(tlrow.children)
    
                    }          
                })
            }

            var rowInstancesData = buildjson(rowInstanceTree);
            
            return {
                totaltime: this.totalTimeHandlePos,
                rowInstances: rowInstancesData
            }
        }
    }
    return {
        Timeline: Timeline
    };
})());


