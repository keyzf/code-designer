editor.once('load', function() {
    'use strict'
    

    var canvas = document.createElement("iframe");
    Object.defineProperty(canvas,"class",{
        get:function(){
            return canvas.classList;
        }
    });
    canvas.style.display = "block";
    canvas.style.margin = "0 auto";
    canvas.setAttribute("width","375");
    canvas.setAttribute("height","667");
    canvas.setAttribute("frameborder","no");
    canvas.setAttribute("border","0");
    canvas.setAttribute("id","canvas-iframe");
    canvas.classList.add("iphone6-6s-7");
    


    editor.on('project:ready',function(){
      
        if(config.project.type === "cube"){


            canvas.contentWindow.document.head.innerHTML = `<meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
  <meta name="renderer" content="webkit">
  <title>360导航_一个主页，整个世界</title>
  <link rel="stylesheet" type="text/css" href="https://cubedev.3600.com/static/css/common.css" />
  <link rel="stylesheet" type="text/css" href="https://cubedev.3600.com/static/css/cube_common.css" />
  <script src="https://cubedev.3600.com/static/js/cachesvc.js"></script>
  <script src="https://cubedev.3600.com/static/js/appdata.js"></script>
  <base target="_blank"/>`;

           canvas.contentWindow.document.body.innerHTML =  `<div class="container">
           <div class="cube-container">
             <div class="cube-mod" id="cube-mod-cubeproject" data-cubeid="cubeproject" data-cube-version="1.0.0">
               <div class="cube-hd">
                 <h3>ctrip_cube</h3>
                 <div class="cube-opera">
                   <span class="cube-dislike-btn" id="cube-dislike-cubeproject">不喜欢</span>
                   <span class="expand">
                     <span> | </span>
                     <span class="cube-collapse-btn" id="cube-collapse-cubeproject">收起</span>
                     <span class="cube-expand-btn" id="cube-expand-cubeproject">展开</span>
                   </span>
                   <ul class="cube-close">
                     <li class="top">您确定要关闭ctrip_cube吗？</li>
                     <li class="bottom">
                       <a href="javascript:void(0);" class="close"></a>
                       <a href="javascript:void(0);" class="left noshow">关闭</a>
                       <a href="javascript:void(0);" class="right continue-use">取消</a>
                     </li>
                   </ul>
                 </div>
               </div>
               <div class="cube-bd">
                 <div class="cube-card cube-card-XosjhLBGL1" id="cube-cXosjhLBGL1"></div>
               </div>
             </div>
            
           </div>
         </div>
      `;


          editor.call('viewport:app').root.dom = canvas.contentWindow.document.getElementById("cube-cXosjhLBGL1");


          var _iframedocument = canvas.contentWindow.document;

          
          _iframedocument.getElementById("cube-collapse-cubeproject").addEventListener('click',function(){
            _iframedocument.getElementById("cube-mod-cubeproject").classList.remove("cube-expand")
          });
          _iframedocument.getElementById("cube-expand-cubeproject").addEventListener('click',function(){
            _iframedocument.getElementById("cube-mod-cubeproject").classList.add("cube-expand")
          });



        }else{
            canvas.contentWindow.document.head.innerHTML = `<style type="text/css">
            html {
        line-height: 1.15; /* 1 */
        -webkit-text-size-adjust: 100%; /* 2 */
        }
        
        
        body {
        margin: 0;
        }
        
        
        main {
        display: block;
        }
        
        
        h1 {
        font-size: 2em;
        margin: 0.67em 0;
        }
        
        
        hr {
        box-sizing: content-box; /* 1 */
        height: 0; /* 1 */
        overflow: visible; /* 2 */
        }
        
        pre {
        font-family: monospace, monospace; /* 1 */
        font-size: 1em; /* 2 */
        }
        
        a {
        background-color: transparent;
        }
        
        abbr[title] {
        border-bottom: none; /* 1 */
        text-decoration: underline; /* 2 */
        text-decoration: underline dotted; /* 2 */
        }
        
        b,
        strong {
        font-weight: bolder;
        }
        
        code,
        kbd,
        samp {
        font-family: monospace, monospace; /* 1 */
        font-size: 1em; /* 2 */
        }
        
        
        small {
        font-size: 80%;
        }
        
        sub,
        sup {
        font-size: 75%;
        line-height: 0;
        position: relative;
        vertical-align: baseline;
        }
        
        sub {
        bottom: -0.25em;
        }
        
        sup {
        top: -0.5em;
        }
        
        img {
        border-style: none;
        }
        
        button,
        input,
        optgroup,
        select,
        textarea {
        font-family: inherit; /* 1 */
        font-size: 100%; /* 1 */
        line-height: 1.15; /* 1 */
        margin: 0; /* 2 */
        }
        
        button,
        input { /* 1 */
        overflow: visible;
        }
        
        button,
        select { /* 1 */
        text-transform: none;
        }
        
        button,
        [type="button"],
        [type="reset"],
        [type="submit"] {
        -webkit-appearance: button;
        }
        
        button::-moz-focus-inner,
        [type="button"]::-moz-focus-inner,
        [type="reset"]::-moz-focus-inner,
        [type="submit"]::-moz-focus-inner {
        border-style: none;
        padding: 0;
        }
        
        button:-moz-focusring,
        [type="button"]:-moz-focusring,
        [type="reset"]:-moz-focusring,
        [type="submit"]:-moz-focusring {
        outline: 1px dotted ButtonText;
        }
        
        fieldset {
        padding: 0.35em 0.75em 0.625em;
        }
        
        legend {
        box-sizing: border-box; /* 1 */
        color: inherit; /* 2 */
        display: table; /* 1 */
        max-width: 100%; /* 1 */
        padding: 0; /* 3 */
        white-space: normal; /* 1 */
        }
        
        progress {
        vertical-align: baseline;
        }
        
        textarea {
        overflow: auto;
        }
        
        [type="checkbox"],
        [type="radio"] {
        box-sizing: border-box; /* 1 */
        padding: 0; /* 2 */
        }
        
        [type="number"]::-webkit-inner-spin-button,
        [type="number"]::-webkit-outer-spin-button {
        height: auto;
        }
        
        [type="search"] {
        -webkit-appearance: textfield; /* 1 */
        outline-offset: -2px; /* 2 */
        }
        
        [type="search"]::-webkit-search-decoration {
        -webkit-appearance: none;
        }
        
        ::-webkit-file-upload-button {
        -webkit-appearance: button; /* 1 */
        font: inherit; /* 2 */
        }
        
        details {
        display: block;
        }
        
        summary {
        display: list-item;
        }
        
        template {
        display: none;
        }
        
        [hidden] {
        display: none;
        }
        </style>
        
        <style>
        * {
          box-sizing: border-box;
        }
        
        img {
          border: none;
          overflow: hidden;
        }
        
        .flex-x-center {
          display: flex;
          justify-content: center;
        }
        
        .flex-center {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .flex-row {
          display: flex;
          flex-direction: row;
        }
        .flex-col {
          display: flex;
          flex-direction: column;
        }
        .flex-columns {
          display: flex;
          flex-direction: column;
        }
        .flex {
          display: flex;
        }
        .flex-first {
          order: -1;
        }
        
        .flex-last {
          order: 1;
        }
        
        .flex-items-top {
          align-items: flex-start;
        }
        
        .flex-items-middle {
          align-items: center;
        }
        
        .flex-items-bottom {
          align-items: flex-end;
        }
        
        .flex-top {
          align-self: flex-start;
        }
        
        .flex-middle {
          align-self: center;
        }
        
        .flex-bottom {
          align-self: flex-end;
        }
        
        .flex-items-left {
          justify-content: flex-start;
        }
        
        .flex-items-center {
          justify-content: center;
        }
        
        .flex-items-right {
          justify-content: flex-end;
        }
        
        .flex-items-around {
          justify-content: space-around;
        }
        
        .flex-items-between {
          justify-content: space-between;
        }
        </style>
        
        
        `;
        
        }
    })
    // add canvas
    editor.call('layout.viewport').prepend(canvas);




    var keepRendering = false;
    var Application = editor.call('viewport:application');

    var idleFlagTimeoutId = null;
    var idleFlagTimeoutDelay = 250;

    // Allow anti-aliasing to be forcibly disabled - this is useful for Selenium tests in
    // order to ensure that the generated screenshots are consistent across different GPUs.
    var disableAntiAliasing = /disableAntiAliasing=true/.test(location.search);

    // create playcanvas application
    try {
        var app = new Application(canvas, {  
            editorSettings: {}
        });

        app.enableBundles = false;
    } catch(ex) {
        editor.emit('viewport:error', ex);
        return;
    }




    // get canvas
    editor.method('viewport:canvas', function() {
        return canvas;
    });

    // get app
    editor.method('viewport:app', function() {
        return app;
    });

    function idleTimeout() {
        if (!canvas.class.contains('viewport-idle')) {
            canvas.class.add('viewport-idle');
        }
    }

    // re-render viewport
    editor.method('viewport:render', function () {
        canvas.class.remove('viewport-idle');

        app.redraw = true;

        clearTimeout(idleFlagTimeoutId);
        idleFlagTimeoutId = setTimeout(idleTimeout, idleFlagTimeoutDelay);
    });

    // returns true if the viewport should continuously render
    editor.method('viewport:keepRendering', function (value) {
        if (typeof(value) === 'boolean')
            keepRendering = value;

        return keepRendering;
    });

    editor.method('viewport:flyMode', function () {
        return flyMode;
    });

    app.start();
    editor.emit('viewport:load', app);

    // editor.emit('viewport:load', app);





});