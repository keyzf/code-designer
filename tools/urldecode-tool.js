customElements.define('urldecode-tool',class extends UIComponent{
    constructor(){
        super();

    }
    init() {
        super.init();

        this.hostdiv = this;
        this.setupProperties({

        });
    }

    preRender() {
        this.template = () => `<div class="urldecode-tool urldecode-tool-wrapper frame-0" style="width:400px;height:500px;background:#2c393c;">
<wc-text-field style="width:400px;"></wc-text-field> <button class="wc-button wc-button-dark">解码</button>

<div class="encode-result" style="margin-top: 40px;color:#fff;"></div>
</div>
</div>`;
    }

    postRender() {
        var _component = this;

        this.nodes = {
            textfield:this.hostdiv.querySelector('.urldecode-tool wc-text-field'),
            button:this.hostdiv.querySelector('.urldecode-tool button'),
            encoderesult:this.hostdiv.querySelector('.urldecode-tool  .encode-result')
        };

        this.listenTo(this.nodes.button,'click',function(){
            _component.nodes.encoderesult.innerHTML = decodeURIComponent(_component.nodes.textfield.value);
        });
    }

    connectedCallback(){
        super.connectedCallback();
    }


    disconnectedCallback() {

    }

});
