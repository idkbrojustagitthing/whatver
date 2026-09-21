
function getUrlParams() {
    var params = {};
    window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,
        function (str, key, value) {
            params[key] = value;
        });
    return params;
}

function getRandom(min, max) {
    return Math.floor(Math.random()*(1+max-min)+min);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function str_pad_left(string,pad,length){
    return (new Array(length+1).join(pad)+string).slice(-length);
}

function shuffleArray(array) {
    var randomArray = array;
    var oTemp;
    var randomIndex;
    for(var i = 0; i< array.length; i++)
    {
        oTemp = randomArray[i];
        randomIndex = i + Math.floor(Math.random() * (array.length - i));
        randomArray[i] = randomArray[randomIndex];
        randomArray[randomIndex] = oTemp;
    }

    return randomArray;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16)
    } : null;
}

function pxValue(value) {
    return value + "px";
}

function getHighestNum(arr) {
    var num = 0;
    for(var i = 0; i< arr.length; i++)
    {
        if(arr[i] > num) num = arr[i];
    }
    return num;
}

function createCenteredText(str,size,font,color,spc){
    var container = new createjs.Container();
    var lines = str.split("\n");
    var spacing = (spc) ? spc : 2;
    for(var i = 0; i<lines.length; i++) {
        var lineTxt = new createjs.Text(lines[i], size + "pt " + font, color);
        lineTxt.textBaseline = "middle";
        lineTxt.x = lineTxt.getMeasuredWidth()/2 * -1;
        if(i > 0) lineTxt.y = lines[i - 1].y + lines[i-1].getMeasuredHeight() + spacing;
        container.addChild(lineTxt);
        lines[i] = lineTxt;
    }

    return container;
}

function createOutlineTxt(txtStr,font,size,outlineColor,fillColor){
    var container = new createjs.Container();
    var outlineTxt = new createjs.Text(txtStr,size + "pt " + font,outlineColor);
    outlineTxt.textBaseline = "middle";
    outlineTxt.outline = 5;
    //outlineTxt.cache(0,0,outlineTxt.getMeasuredWidth() + 1,outlineTxt.getMeasuredHeight()+ 1);
    var solidTxt = new createjs.Text(txtStr,size + "pt " + font,fillColor);
    solidTxt.textBaseline = "middle";
    container.addChild(outlineTxt);
    container.addChild(solidTxt);
    //container.cache(0,0,solidTxt.getMeasuredWidth() + 5,outlineTxt.getMeasuredHeight() + 5);
    return container;

}

function resizeDimensions(currentWidth, currentHeight, maxWidth, maxHeight) {
    var imageWidth = currentWidth;
    var imageHeight = currentHeight;
    var imageScale = 1.0;
    if (imageWidth > imageHeight) {
        if (imageWidth > maxWidth) {
            imageScale = maxWidth / imageWidth;
            imageHeight *= imageScale;
            imageWidth = maxWidth;
            if (imageHeight > maxHeight) {
                imageScale = maxHeight / imageHeight;
                imageWidth *= imageScale;
                imageHeight = maxHeight;
            }
        }else{
            if (imageHeight > maxHeight) {
                imageScale = maxHeight / imageHeight;
                imageWidth *= imageScale;
                imageHeight = maxHeight;
            }
        }
    }else{
        if (imageHeight > maxHeight) {
            imageScale = maxHeight / imageHeight;
            imageWidth *= imageScale;
            imageHeight = maxHeight;
        }
    }
    return {width:imageWidth, height:imageHeight, scale:imageScale};
}

function getRotatedPoint(rotateAngle, radius){
    var deg_to_rad = 0.0174532925;
    var px = radius * Math.cos(rotateAngle * deg_to_rad);
    var py = radius * Math.sin(rotateAngle * deg_to_rad);
    var point = new createjs.Point(px,py);
    return point;
}


function removeTweenedItem(item){
    if(item.parent) item.parent.removeChild(item);
}

function calculateDistance(pt1x,pt1y,pt2x,pt2y){
    var xDistance = pt1x - pt2x;
    var yDistance = pt1y - pt2y;
    return Math.sqrt( Math.pow( xDistance, 2 ) + Math.pow( yDistance, 2 ) );

}

function createCenteredSprite(sheet,name){
    var s = new createjs.Sprite(sheet,name);
    s.regX = s.getBounds().width/2;
    s.regY = s.getBounds().height/2;
    return s;

}