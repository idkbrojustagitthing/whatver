
RotateScreenManager = function(){
    this.isValidOrientation = false;

    this.rotateElement = document.createElement('div');
    this.rotateElement.id = 'rotate-screen';
    this.rotateElement.style.textIndent = '-100%';
    
    this.rotateElement.style.position = "absolute";
    this.rotateElement.style.width = "100%";
    this.rotateElement.style.height = "100%";
    this.rotateElement.style.top = 0;
    this.rotateElement.style.left = 0;
    this.rotateElement.style["z-index"] = 2147483647;
    this.rotateElement.style["background-color"] = "#000000";
    this.rotateElement.style["background-image"] = "url('./mobilepie/rotate_overlay.png')";
    this.rotateElement.style["background-repeat"] = "no-repeat";
    this.rotateElement.style["background-size"] = "contain";
    this.rotateElement.style["background-position"] = "center";
    this.rotateElement.innerHTML = 'please rotate your device';
    this.rotateElement.style.display = "none";

    document.getElementById("fb-root").appendChild(this.rotateElement);
    
    this.onValidOrientation = null;

    window.addEventListener("resize", this.OnResize.bind(this));
    window.addEventListener("orientationchange", this.CheckOrientation.bind(this));
    
    this.CheckOrientation();
};

RotateScreenManager.prototype = Object.create(RotateScreenManager.prototype);
RotateScreenManager.prototype.constructor = RotateScreenManager;

RotateScreenManager.prototype.OnResize = function() {
    setTimeout(function(){
        this.Resize();
    }.bind(this),50);
};

RotateScreenManager.prototype.Resize = function() {
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    this.rotateElement.style.width = windowWidth + "px";
    this.rotateElement.style.height = windowHeight + "px";

    this.CheckOrientation();
};

RotateScreenManager.prototype.CheckOrientation = function() {
    
    var isValidOrientation = window.innerWidth > window.innerHeight;
    
    this.isValidOrientation = isValidOrientation;
    
    this.rotateElement.style.display = this.isValidOrientation ? "none" : "block";
};

var rotateScreenManager = new RotateScreenManager();