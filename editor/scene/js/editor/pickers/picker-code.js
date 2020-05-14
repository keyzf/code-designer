editor.once('load', function () {
    'use strict';

    var callback = null;


    var overlay = new ui.Overlay();
    overlay.class.add('picker-code');
    overlay.hidden = true;

    // main panel
    var panel = new ui.Panel();
    panel.class.add('picker-code');

    overlay.append(panel);

    
    

    var root = editor.call('layout.root');
    root.append(overlay);

    overlay.on('show', function () {
        editor.emit('picker:code:open');
        // editor-blocking picker open
        editor.emit('picker:open', 'code');
    });

    // on overlay hide
    overlay.on('hide', function () {
        editor.emit('picker:code:close');
        // editor-blocking picker closed
        editor.emit('picker:close', 'code');
    });


    // call picker
    editor.method('picker:code', function (text, fn, options) {
    
        callback = fn || null;
        // show overlay
        overlay.hidden = false;

        var canvas = editor.call("viewport:canvas");
        var app = editor.call("viewport:app");



        if(!canvas || !app) return;

        var head = canvas.contentWindow.document.head;

        var domCode =  "" + app.root.dom.innerHTML;
        var styleCode = "";
        var styles = head.querySelectorAll("style");

        for(var i = 0; i < styles.length; i++){
            if(styles[i].getAttribute("data-buildin") === "yes"){
                styleCode += styles[i].innerHTML;
            }     
        }

        
        

        panel.innerElement.innerHTML = `<div>css<div>
        <pre selectable contenteditable=true class="selectable">${styleCode}</pre>
        <div>HTML</div>
        `;

        var code = document.createElement("code");
        code.innerText = domCode;
        code.className = "selectable";
        code.setAttribute("selectable", "");
        code.setAttribute("contenteditable", true);
        panel.innerElement.append(code);


        
           
    });



    editor.method('picker:animation-code', function (codeHTML, fn) {
    
        callback = fn || null;
        // show overlay
        overlay.hidden = false;
        panel.innerElement.innerHTML =  `<pre selectable contenteditable=true class="selectable">${codeHTML}</pre>`;       
    });



    // close picker
    editor.method('picker:code:close', function () {
        overlay.hidden = true;
    });

});