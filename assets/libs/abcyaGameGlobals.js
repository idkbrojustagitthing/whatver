 var game = null;
 var abcyaWindow = null;

        function init() {
            var host = window.location.hostname;
            var domain = host === 'www.ixl.com' || host === 'ixl.com' ? 'ixl.com' : 'abcya.com';
            document.domain = domain;
            abcyaWindow = window.parent;
            abcyaWindow.abcya = abcyaWindow.abcya || {};
            if(!abcyaWindow.abcya.platformData) {
                abcyaWindow.abcya.platformData = initGamePlatformData(abcya.GameConfig.GAME_ORIENTATION);
            }
            
            //!! Those constants seem to be defined in almost all games, can't define new constants
            var androidAppCheck = window.navigator.userAgent.match(/ABCya-Android/i);
            game = new abcya.GameMain();
            //!! After game is made, tack on additional focus window event handlers
            //!! Really should move all window events out here somewhere
           var androidAppCheck = window.navigator.userAgent.match(/ABCya-Android/i);
            if (androidAppCheck || abcyaWindow.abcya.platformData.browserType == abcya.GameConfig.ANDROID || abcyaWindow.abcya.platformData.browserType == "WEBKITTYPE") {
              window.addEventListener("visibilitychange", function (event) {
                 if (document['hidden'] !== "undefined") {
                     createjs.Sound.muted = document['hidden'];
                 }
              }, false);
            }
            game.initGame();

        }

    function initGamePlatformData(orientation) {

        var platformSettings = {};
        platformSettings.deviceType = null;
        platformSettings.browserType = null;
        platformSettings.tranformTypePrefix = "";
        platformSettings.allowsFullScreen = false;
        platformSettings.hasHomeButton = false;
        platformSettings.force43 = false;
        platformSettings.maxViewScale = 0;
        platformSettings.isMuted = false;
        platformSettings.allowsTouch = false;
        platformSettings.allowsMouseover = false;

        platformSettings.allowsPrint = false;
        platformSettings.touchSave = false;

        platformSettings.orientation = orientation;

        platformSettings.pauseEvent = "view_focus_change"; // String of the event name in viewer so game will listen

        if (typeof window.orientation !== 'undefined') { // Using orientation to check if we are on mobile
            platformSettings.isMobile = true;

        }else{ // We are on desktop
            platformSettings.maxViewScale = 1;
            platformSettings.isMobile = false;
            platformSettings.deviceType = abcya.GameConstants.DESKTOP;
        }

        var isIphone = navigator.userAgent.match(/iPhone/i);
        if (isIphone != null) {
            platformSettings.deviceType = abcya.GameConstants.IPHONE;
        }

        var isIpod = navigator.userAgent.match(/iPod/i);
        if (isIpod != null) {
            platformSettings.deviceType = abcya.GameConstants.IPHONE;
        }

        if(!platformSettings.deviceType) {
            var isIpad = navigator.userAgent.match(/iPad/i) || 
                        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) && 
                        !window.MSStream
            if(isIpad) {
                platformSettings.deviceType = abcya.GameConstants.IPAD
            }
        }

        if(!platformSettings.deviceType) {
            platformSettings.deviceType = abcya.GameConstants.DESKTOP;
        }

        if (navigator.userAgent.match(/android/i) !== null) {
            platformSettings.deviceType = abcya.GameConstants.ANDROID;
        }

        if (navigator.userAgent.match(/silk/i) !== null){
            platformSettings.deviceType = abcya.GameConstants.KINDLE;
        }

        // Browser stuff
        platformSettings.browserType = "notset";
        var isChrome = navigator.userAgent.match(/chrome/i);
        if (isChrome) {
            platformSettings.browserType = "WEBKITTYPE";
            platformSettings.tranformTypePrefix = "-webkit-";
        }
        isChrome = navigator.userAgent.match(/safari/i);
        if (isChrome) {
            platformSettings.browserType = "WEBKITTYPE";
            platformSettings.tranformTypePrefix = "-webkit-";
        }

        if (navigator.userAgent.match(/MSIE/i)) {
            platformSettings.tranformTypePrefix = "-ms-";
            platformSettings.browserType = "IE";
        }
        if (navigator.userAgent.match(/Trident/i)) {
            platformSettings.tranformTypePrefix = "-ms-";
            platformSettings.browserType = "IE";
        }


        if(window.navigator.standalone == true){ // If running as homescreen on iOS
            platformSettings.browserType = "WEBKITTYPE";
            platformSettings.tranformTypePrefix = "-webkit-";
        }

        if (navigator.userAgent.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i)) {
             platformSettings.browserType = "ABCya_iOS";
            platformSettings.tranformTypePrefix = "-webkit-";
        }
        var ua = window.navigator.userAgent;
        if (ua.match(/ABCya-Android/i)) {
            platformSettings.browserType = "ABCya_Android";
        }


        platformSettings.allowsFullScreen = (platformSettings.deviceType === abcya.GameConstants.ANDROID || platformSettings.deviceType === abcya.GameConstants.KINDLE);
        platformSettings.force43 = (platformSettings.deviceType === abcya.GameConstants.DESKTOP  || platformSettings.deviceType === abcya.GameConstants.IPAD || platformSettings.orientation === abcya.GameConstants.PORTRAIT)
        platformSettings.allowsTouch = true; // Always true, letting createJS handle it
        platformSettings.allowsMouseover = !platformSettings.isMobile;

        return platformSettings;
    };

(function () {

    window.abcya = window.abcya || {};

    var GameConstants = {
        DESKTOP: 'desktop',
        IPAD: 'ipad',
        IPHONE: 'iphone',
        ANDROID: 'android',
        KINDLE: 'kindle',
        ABCYA_IOS: 'ABCya_iOS',
        ABCYA_ANDROID: 'ABCYa_android',

        PORTRAIT: "Portrait",
        LANDSCAPE: "Landscape",
        ORIENTATION_DIMS: [1024, 768, 576],

        COMMON_AUDIO_ASSETS_PATH: '../../../assets/audio/',
        COMMON_IMAGE_ASSETS_PATH: '../../../assets/images/',
        IMAGE_ASSETS_PATH: 'assets/images/',
        AUDIO_ASSETS_PATH: 'assets/audio/',
        DATA_ASSETS_PATH: 'assets/data/'

    };

   
    window.abcya.GameConstants = GameConstants;

}());

