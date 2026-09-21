var Funday;
(function (Funday) {
    class AudioId {
        constructor(key, markerName) {
            this.key = null;
            this.markerName = null;
            this.key = key;
            this.markerName = markerName;
        }
    }
    Funday.AudioId = AudioId;
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    class BitmapFontId {
        constructor(key) {
            this.key = null;
            this.key = key;
        }
    }
    Funday.BitmapFontId = BitmapFontId;
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    class SpriteId {
        constructor(key, frame) {
            this.key = null;
            this.frame = null;
            this.key = key;
            this.frame = frame;
        }
    }
    Funday.SpriteId = SpriteId;
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Animation;
    (function (Animation_1) {
        class Animation {
            constructor() {
                this.onPlay = new Phaser.Signal();
                this.onStop = new Phaser.Signal();
                this.onPause = new Phaser.Signal();
                this.onComplete = new Phaser.Signal();
            }
            play() {
                this._isPlaying = true;
                this._isPaused = false;
                this.onPlay.dispatch();
            }
            isPlaying() {
                return this._isPlaying;
            }
            stop() {
                this._isPlaying = false;
                this._isPaused = false;
                this.onStop.dispatch();
            }
            pause() {
                this._isPlaying = false;
                this._isPaused = true;
                this.onPause.dispatch();
            }
            isPaused() {
                return this._isPaused;
            }
            onCompleted() {
                this._isPlaying = false;
                this._isPaused = false;
                this.onComplete.dispatch();
            }
        }
        Animation_1.Animation = Animation;
    })(Animation = Funday.Animation || (Funday.Animation = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Animation;
    (function (Animation) {
        class AbstractGroup extends Funday.Animation.Animation {
            constructor(animations) {
                super();
                this.animations = new Array();
                if (!animations) {
                    throw "Animation array is 'null' or 'undefined'!";
                }
                if (animations.length <= 0) {
                    throw "Animation array is empty";
                }
                this.animations = animations;
                for (let index = 0; index < this.animations.length; index++) {
                    const animation = this.animations[index];
                    animation.onComplete.add(this.onChildAnimationComplete.bind(this, animation));
                }
            }
            stop() {
                for (let index = 0; index < this.animations.length; index++) {
                    const animation = this.animations[index];
                    animation.stop();
                }
                super.stop();
            }
            pause() {
                for (let index = 0; index < this.animations.length; index++) {
                    const animation = this.animations[index];
                    if (animation.isPlaying()) {
                        animation.pause();
                    }
                }
                super.pause();
            }
            onChildAnimationComplete(childAnimation) {
                console.log("child animation complete");
            }
            foreachAnimation(callback) {
                for (let index = 0; index < this.animations.length; index++) {
                    const animation = this.animations[index];
                    callback(animation);
                }
            }
        }
        Animation.AbstractGroup = AbstractGroup;
    })(Animation = Funday.Animation || (Funday.Animation = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Animation;
    (function (Animation) {
        class Bundle extends Funday.Animation.AbstractGroup {
            constructor() {
                super(...arguments);
                this.completedAnimationCount = 0;
            }
            play() {
                this.completedAnimationCount = 0;
                super.play();
                for (let index = 0; index < this.animations.length; index++) {
                    const animation = this.animations[index];
                    animation.play();
                }
            }
            onChildAnimationComplete(childAnimation) {
                this.completedAnimationCount++;
                if (this.completedAnimationCount === this.animations.length) {
                    this.onCompleted();
                }
            }
        }
        Animation.Bundle = Bundle;
    })(Animation = Funday.Animation || (Funday.Animation = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Animation;
    (function (Animation) {
        class CameraFade extends Funday.Animation.Animation {
            constructor(game, color, durationMs, isTo) {
                super();
                this.game = null;
                this.onCameraAnimationComplete = null;
                this.startFunction = null;
                this.color = 0;
                this.durationMs = 0;
                this.game = game;
                this.startFunction = isTo ? game.camera.flash.bind(game.camera) : game.camera.fade.bind(game.camera);
                this.onCameraAnimationComplete = isTo ? game.camera.onFlashComplete : game.camera.onFadeComplete;
                this.color = color;
                this.durationMs = durationMs;
            }
            play() {
                this.onCameraAnimationComplete.add(this.onCameraAnimationCompleted, this);
                this.startFunction(this.color, this.durationMs);
                super.play();
            }
            stop() {
                this.onCameraAnimationComplete.remove(this.onCameraAnimationCompleted, this);
                super.stop();
                this.game.camera.resetFX();
            }
            pause() {
                console.error("pause not implemented");
                this.stop();
            }
            onCameraAnimationCompleted() {
                this.onCameraAnimationComplete.remove(this.onCameraAnimationCompleted, this);
                this.onCompleted();
            }
        }
        Animation.CameraFade = CameraFade;
    })(Animation = Funday.Animation || (Funday.Animation = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Animation;
    (function (Animation) {
        class Event extends Animation.Animation {
            constructor(event) {
                super();
                this.onComplete.add(event);
            }
            play() {
                super.play();
                this.onCompleted();
            }
            pause() {
                console.warn("cannot pause event. ignoring");
            }
        }
        Animation.Event = Event;
    })(Animation = Funday.Animation || (Funday.Animation = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Animation;
    (function (Animation) {
        class Loop extends Animation.Animation {
            constructor(animationToLoop, maxRepeatCount) {
                super();
                this.repeatCount = 0;
                this.maxRepeatCount = -1;
                this.animationToLoop = null;
                this.maxRepeatCount = maxRepeatCount;
                animationToLoop.onComplete.add(this.onLoopCycleFinished.bind(this));
                this.animationToLoop = animationToLoop;
            }
            onLoopCycleFinished() {
                if (this.isLoopingForever()) {
                    this.play();
                }
                else {
                    if (this.hasRepeatsLeft()) {
                        this.repeatCount++;
                        this.play();
                    }
                    else {
                        this.repeatCount = 0;
                        this.onCompleted();
                    }
                }
            }
            isLoopingForever() {
                return this.maxRepeatCount === -1;
            }
            hasRepeatsLeft() {
                return this.repeatCount < this.maxRepeatCount;
            }
            play() {
                super.play();
                this.animationToLoop.play();
            }
            stop() {
                this.repeatCount = 0;
                this.animationToLoop.stop();
                super.stop();
            }
            pause() {
                this.animationToLoop.pause();
                super.pause();
            }
        }
        Animation.Loop = Loop;
    })(Animation = Funday.Animation || (Funday.Animation = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Animation;
    (function (Animation) {
        class Queue extends Funday.Animation.AbstractGroup {
            constructor() {
                super(...arguments);
                this.playIndex = 0;
            }
            play() {
                if (this.isPaused() && this.playIndex > 0) {
                    this.playAnimationAtIndex(this.playIndex);
                }
                else {
                    this.playAnimationAtIndex(0);
                }
                super.play();
            }
            playAnimationAtIndex(index) {
                this.playIndex = index;
                this.animations[index].play();
            }
            stop() {
                this.playIndex = 0;
                for (let index = 0; index < this.animations.length; index++) {
                    const animation = this.animations[index];
                    animation.stop();
                }
                super.stop();
            }
            onChildAnimationComplete(childAnimation) {
                let index = this.animations.indexOf(childAnimation);
                if (index === -1) {
                    throw "Animation is not member of this queue";
                }
                let nextIndex = index + 1;
                if (nextIndex === this.animations.length) {
                    this.onCompleted();
                    this.playIndex = 0;
                }
                else {
                    this.playAnimationAtIndex(nextIndex);
                }
            }
        }
        Animation.Queue = Queue;
    })(Animation = Funday.Animation || (Funday.Animation = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Animation;
    (function (Animation) {
        class Sprite extends Funday.Animation.Animation {
            constructor(target, animationName, durationMs) {
                super();
                this.target = null;
                this.animationName = null;
                this.durationMs = null;
                this.onCompleteCallback = null;
                this.target = target;
                this.animationName = animationName;
                this.durationMs = durationMs;
                this.onCompleteCallback = this.onSpriteAnimationCompleted.bind(this);
                if (!this.target.animations.getAnimation(animationName)) {
                    throw "Sprite animation with the name '" + animationName + "' does not exist";
                }
            }
            play() {
                super.play();
                if (this.target.animations.currentAnim.isPaused && this.target.animations.currentAnim.name === this.animationName) {
                    this.target.animations.currentAnim.paused = false;
                }
                else {
                    let fps = this.convertDurationToFps();
                    this.target.animations.play(this.animationName, fps);
                }
                this.target.events.onAnimationComplete.add(this.onSpriteAnimationCompleted, this);
            }
            convertDurationToFps() {
                let spriteAnimation = this.target.animations.getAnimation(this.animationName);
                return Sprite.convertDurationMsToFps(this.durationMs, spriteAnimation);
            }
            static convertDurationMsToFps(durationMs, spriteAnimation) {
                let durationSeconds = durationMs / 1000;
                let framesPerSecond = spriteAnimation.frameTotal / durationSeconds;
                return framesPerSecond;
            }
            static convertFpsToDurationMs(fps, spriteAnimation) {
                let durationMs = (spriteAnimation.frameTotal / fps) * 1000;
                return durationMs;
            }
            pause() {
                if (this.target.animations.currentAnim.name === this.animationName) {
                    this.target.animations.paused = true;
                }
                this.target.events.onAnimationComplete.remove(this.onSpriteAnimationCompleted, this);
                super.pause();
            }
            stop() {
                this.target.events.onAnimationComplete.remove(this.onSpriteAnimationCompleted, this);
                super.stop();
            }
            onSpriteAnimationCompleted(sprite, animation) {
                if (sprite === this.target && animation.name === this.animationName) {
                    this.onCompleted();
                    this.target.events.onAnimationComplete.remove(this.onSpriteAnimationCompleted, this);
                }
            }
        }
        Animation.Sprite = Sprite;
    })(Animation = Funday.Animation || (Funday.Animation = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Animation;
    (function (Animation) {
        class Tween extends Funday.Animation.Animation {
            constructor(game, target, to, durationMs, easing) {
                super();
                this.tween = null;
                this.isPause = false;
                this.tween = game.add.tween(target);
                this.tween.to(to, durationMs, easing);
                this.tween.onComplete.add(this.onComplete.dispatch, this.onComplete);
            }
            play() {
                super.play();
                if (this.tween.isPaused) {
                    this.tween.resume();
                }
                else {
                    this.tween.start();
                }
            }
            stop() {
                this.tween.stop();
                super.stop();
            }
            pause() {
                this.tween.pause();
                super.pause();
            }
            addOnUpdateCallback(callback, callbackContext) {
                this.tween.onUpdateCallback(callback, callbackContext);
            }
            setTimeScale(value) {
                this.tween.timeScale = value;
            }
        }
        Animation.Tween = Tween;
    })(Animation = Funday.Animation || (Funday.Animation = {}));
})(Funday || (Funday = {}));
var Toolbox;
(function (Toolbox) {
    class CartoonNetworkGame extends Phaser.Game {
        constructor() {
            super(1, 1, Phaser.CANVAS);
            this.version = new Version();
            this.services = null;
            this.modal = null;
            this.addedSounds = {};
            this.services = new Funday.Service.Provider(this);
            this.modal = new Funday.UI.Modal.Modal(this);
        }
        preBoot() {
            this.input.maxPointers = 1;
            this.stage.disableVisibilityChange = true;
            this.services.platform.determinePlatform();
            this.services.resolution.setupResolutionForGame();
            this.onBlur.add(this.onGameLoseFocus, this);
            this.onFocus.add(this.onGameFocus, this);
        }
        loadLoadScreenGfxForCurrentResolution() {
            let quality = this.services.resolution.getQuality();
            this.load.pack("Load_" + quality, "assets/data/assets.json");
        }
        loadGfxForCurrentResolution() {
            let quality = this.services.resolution.getQuality();
            this.load.pack(quality, "assets/data/assets.json");
        }
        applyResolutionRatio(value) {
            return this.services.resolution.applyResultionRatio(value);
        }
        applyResolutionRatioFloored(value) {
            return this.services.resolution.applyResultionRatioFloored(value);
        }
        responsiveDistanceFromBottom(value) {
            return this.height - this.applyResolutionRatio(value);
        }
        onGameFocus() {
            this.unmuteSounds();
        }
        onGameLoseFocus() {
            this.muteSounds();
        }
        muteSounds() {
            this.sound.mute = true;
        }
        unmuteSounds() {
            this.sound.mute = false;
        }
        createImage(x, y, spriteId, group) {
            if (!spriteId) {
                spriteId = new Funday.SpriteId(null, null);
            }
            let i = this.add.image(x || 0, y || 0, spriteId.key, spriteId.frame, group);
            return i;
        }
        createSprite(x, y, spriteId, group) {
            if (!spriteId) {
                spriteId = new Funday.SpriteId(null, null);
            }
            let s = this.add.sprite(x || 0, y || 0, spriteId.key, spriteId.frame, group);
            return s;
        }
        createTileSprite(x, y, width, height, spriteId, group) {
            return this.add.tileSprite(x, y, width, height, spriteId.key, spriteId.frame, group);
        }
        createButton(x, y, spriteId) {
            if (!spriteId) {
                spriteId = new Funday.SpriteId(null, null);
            }
            return new Funday.UI.Button(this, x, y, spriteId.key, spriteId.frame);
        }
        getFrameData(spriteId) {
            let data = this.cache.getFrameData(spriteId.key);
            let frame = data.getFrameByName(spriteId.frame);
            return frame;
        }
        getOrInitAudioSprite(audioId) {
            let audioSprite = this.addedSounds[audioId.key];
            if (!audioSprite) {
                this.addedSounds[audioId.key] = this.add.audioSprite(audioId.key);
                audioSprite = this.addedSounds[audioId.key];
            }
            return audioSprite;
        }
        playSound(audioId, volume = 1.0) {
            let audioSprite = this.getOrInitAudioSprite(audioId);
            return audioSprite.play(audioId.markerName, volume);
        }
    }
    Toolbox.CartoonNetworkGame = CartoonNetworkGame;
    class Version {
        constructor() {
            this.major = 0;
            this.minor = 0;
            this.revision = 0;
            this.name = "";
            this.description = "";
        }
        getVersionString() {
            return this.major + "." + this.minor + "." + this.revision;
        }
        getNameAndVersionString() {
            return this.name + " - " + this.getVersionString();
        }
    }
})(Toolbox || (Toolbox = {}));
var Funday;
(function (Funday) {
    var Service;
    (function (Service) {
        class Animation {
            constructor(game) {
                this.game = null;
                this.game = game;
            }
            tween(target, to, durationMs, easingMethod) {
                return new Funday.Animation.Tween(this.game, target, to, durationMs, easingMethod);
            }
            tweenArray(targets, to, durationMs, easingMethod) {
                let anims = [];
                for (let index = 0; index < targets.length; index++) {
                    const target = targets[index];
                    let anim = this.tween(target, to, durationMs, easingMethod);
                    anims.push(anim);
                }
                return this.bundle(anims);
            }
            tweenTint(sprite, toColor, durationMs, easingMethod) {
                let state = { progress: 0 };
                let maxProgress = 100;
                let animation = this.tween(state, { progress: maxProgress }, durationMs, easingMethod);
                let startColor = sprite.tint;
                animation.onPlay.add(function () {
                    startColor = sprite.tint;
                }, this);
                animation.addOnUpdateCallback(function () {
                    let color32 = Phaser.Color.interpolateColor(startColor, toColor, maxProgress, state.progress);
                    let rgb = Phaser.Color.getRGB(color32);
                    sprite.tint = Phaser.Color.getColor(rgb.r, rgb.g, rgb.b);
                }, this);
                return animation;
            }
            sprite(target, animationName, durationMs) {
                return new Funday.Animation.Sprite(target, animationName, durationMs);
            }
            spriteFps(target, animationName, framesPerSecond) {
                let phaserSpriteAnim = target.animations.getAnimation(animationName);
                let fps = framesPerSecond || phaserSpriteAnim.speed;
                let durationMs = Funday.Animation.Sprite.convertFpsToDurationMs(fps, phaserSpriteAnim);
                return new Funday.Animation.Sprite(target, animationName, durationMs);
            }
            delay(delayInMilliseconds) {
                let tween = this.tween({}, {}, delayInMilliseconds);
                tween.isPause = true;
                return tween;
            }
            event(callback) {
                return new Funday.Animation.Event(callback);
            }
            bundle(animations) {
                return new Funday.Animation.Bundle(animations);
            }
            queue(animations) {
                return new Funday.Animation.Queue(animations);
            }
            loop(animation) {
                return new Funday.Animation.Loop(animation, -1);
            }
            repeat(animation, repeatCount) {
                return new Funday.Animation.Loop(animation, repeatCount);
            }
            fadeFrom(color, durationMs) {
                return new Funday.Animation.CameraFade(this.game, color, durationMs, false);
            }
            fadeTo(color, durationMs) {
                return new Funday.Animation.CameraFade(this.game, color, durationMs, true);
            }
            fadeFromBlack(durationMs) {
                return new Funday.Animation.CameraFade(this.game, 0x000000, durationMs, true);
            }
            fadeToBlack(durationMs) {
                return new Funday.Animation.CameraFade(this.game, 0x000000, durationMs, false);
            }
            fadeFromWhite(durationMs) {
                return new Funday.Animation.CameraFade(this.game, 0xffffff, durationMs, true);
            }
            fadeToWhite(durationMs) {
                return new Funday.Animation.CameraFade(this.game, 0xffffff, durationMs, false);
            }
        }
        Service.Animation = Animation;
    })(Service = Funday.Service || (Funday.Service = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Service;
    (function (Service) {
        class CNArcadeProvider {
            constructor(cnArcadeSDK, game) {
                this.achievement = new Service.CNArcadeAchievementService(cnArcadeSDK);
                this.persistence = new Service.CNArcadePersistenceService(cnArcadeSDK);
                this.ads = new Service.CNAdService(cnArcadeSDK);
                this.analytics = new Service.CNArcadeAnalytics(cnArcadeSDK);
                this.platform = new Service.PlatformService(game);
                this.animation = new Service.Animation(game);
                this.resolution = new Service.ResolutionService(game);
            }
        }
        Service.CNArcadeProvider = CNArcadeProvider;
    })(Service = Funday.Service || (Funday.Service = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Service;
    (function (Service) {
        class Provider {
            constructor(game) {
                this.achievement = new Service.AchievementService();
                this.persistence = new Service.PersistenceService();
                this.ads = new Service.EmptyAdService();
                this.analytics = new Service.EmptyAnalytics();
                this.platform = new Service.PlatformService(game);
                this.animation = new Service.Animation(game);
                this.resolution = new Service.ResolutionService(game);
            }
        }
        Service.Provider = Provider;
    })(Service = Funday.Service || (Funday.Service = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Service;
    (function (Service) {
        var Achievement;
        (function (Achievement_1) {
            class Achievement {
                constructor(id, maxProgress) {
                    this.id = 0;
                    this.progress = 0;
                    this.maxProgress = 1;
                    this.hasBeenAwarded = false;
                    this.id = id;
                    this.maxProgress = maxProgress;
                }
                shouldBeAwarded() {
                    return !this.hasBeenAwarded && this.hasReachedGoal();
                }
                hasReachedGoal() {
                    return this.progress >= this.maxProgress;
                }
            }
            Achievement_1.Achievement = Achievement;
        })(Achievement = Service.Achievement || (Service.Achievement = {}));
    })(Service = Funday.Service || (Funday.Service = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Service;
    (function (Service) {
        var Achievement;
        (function (Achievement) {
            class AchievementMetadata {
                constructor(id, name, description, icon) {
                    this.id = 0;
                    this.name = null;
                    this.description = null;
                    this.iconSpriteId = null;
                    this.id = id;
                    this.name = name;
                    this.description = description;
                    this.iconSpriteId = icon;
                }
            }
            Achievement.AchievementMetadata = AchievementMetadata;
        })(Achievement = Service.Achievement || (Service.Achievement = {}));
    })(Service = Funday.Service || (Funday.Service = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Service;
    (function (Service) {
        class AchievementService {
            constructor() {
            }
            award(achievement, metadata) {
                if (AchievementService.alertAchievements) {
                    alert("Achievement Completed!\n" + metadata.name + "(" + metadata.description + ")");
                }
                achievement.hasBeenAwarded = true;
            }
            getProgress(achievement) {
                return Number(localStorage.getItem("achiev_" + achievement.id.toString()));
            }
            updateProgress(achievement, progress) {
                localStorage.setItem("achiev_" + achievement.id.toString(), progress.toString());
            }
        }
        AchievementService.alertAchievements = true;
        Service.AchievementService = AchievementService;
    })(Service = Funday.Service || (Funday.Service = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Service;
    (function (Service) {
        class CNArcadeAchievementService {
            constructor(cnArcadeSDK) {
                this.cnArcadeSDK = cnArcadeSDK;
            }
            loadAchievement(id) {
                return this.cnArcadeSDK.achievements.find((achievement) => achievement.id === id);
            }
            award(achievement) {
                if (achievement.hasBeenAwarded)
                    return;
                this.cnArcadeSDK.unlockAchievement(achievement.id).then((achiev) => {
                    achievement.hasBeenAwarded = true;
                }).catch((err) => {
                    console.log("Could not unlock achievement with id", achievement.id, ". ", err);
                });
            }
            getProgress(achievement) {
                return this.cnArcadeSDK.getAchievementProgress(achievement.id);
            }
            updateProgress(achievement, progress) {
                if (achievement.hasBeenAwarded)
                    return;
                achievement.progress = progress;
                this.cnArcadeSDK.setAchievementProgress(achievement.id, progress).then((achiev) => {
                    if (achiev.completed) {
                        this.award(achievement);
                    }
                    else {
                    }
                }).catch((err) => {
                    console.log("Could not update progress. ", err);
                });
            }
        }
        Service.CNArcadeAchievementService = CNArcadeAchievementService;
    })(Service = Funday.Service || (Funday.Service = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Service;
    (function (Service) {
        class CNAdService {
            constructor(cnSDK) {
                this.cnSDK = cnSDK;
            }
            showAd() {
                return this.cnSDK.showAd();
            }
        }
        Service.CNAdService = CNAdService;
    })(Service = Funday.Service || (Funday.Service = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Service;
    (function (Service) {
        class EmptyAdService {
            showAd() {
                return new Promise((resolve, reject) => {
                    return resolve();
                });
            }
        }
        Service.EmptyAdService = EmptyAdService;
    })(Service = Funday.Service || (Funday.Service = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Service;
    (function (Service) {
        Service.GameLocations = {
            TITLE: 'title',
            PAUSE: 'pause',
            SHOP: 'shop',
            PLAY: 'play'
        };
    })(Service = Funday.Service || (Funday.Service = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Service;
    (function (Service) {
        class CNArcadeAnalytics {
            constructor(cnSDK) {
                this.verbose = true;
                this.cnSDK = cnSDK;
            }
            trackLocation(location) {
                this.cnSDK.analytics.trackPlay(location);
                if (this.verbose)
                    console.log("Tracked play analytics from", location);
            }
        }
        Service.CNArcadeAnalytics = CNArcadeAnalytics;
    })(Service = Funday.Service || (Funday.Service = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Service;
    (function (Service) {
        class EmptyAnalytics {
            trackLocation(location) {
            }
        }
        Service.EmptyAnalytics = EmptyAnalytics;
    })(Service = Funday.Service || (Funday.Service = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Service;
    (function (Service) {
        class CNArcadePersistenceService {
            constructor(cnArcadeSDK) {
                this.state = {};
                this.highscoreKey = "highscore";
                this.sessionscoreKey = "sessionscore";
                this.verbose = true;
                this.cnArcadeSDK = cnArcadeSDK;
            }
            loadOrSetDefault(defaultGameState) {
                var gameStatePromise = this.cnArcadeSDK.getGameState();
                var highscorePromise = this.cnArcadeSDK.getHighScore();
                gameStatePromise.then((state) => {
                    this.state = state;
                    if (this.verbose)
                        console.log("Loaded game state!", state);
                    if (this.state == null || this.state == undefined) {
                        this.state = defaultGameState;
                        return Promise.reject("Game state is null or undefined.");
                    }
                    ;
                }).catch((err) => {
                    this.state = defaultGameState;
                    if (this.verbose)
                        console.log("Could not load game state. Setting default.", err);
                    this.cnArcadeSDK.setGameState(this.state).then(() => {
                        if (this.verbose)
                            console.log("Stored default game state!");
                    }).catch((err) => {
                        if (this.verbose)
                            console.log("Could not store game state.", err);
                    });
                });
                highscorePromise.then((highscore) => {
                    if (this.verbose)
                        console.log("Retrieved highscore to be", highscore);
                    this.cachedHighscore = highscore;
                }).catch((err) => {
                    if (this.verbose)
                        console.log("Could not retrieve highscore, setting default", err);
                    this.cachedHighscore = 0;
                });
                return Promise.all([gameStatePromise, highscorePromise]);
            }
            ;
            save(key, data) {
                if (key == this.highscoreKey) {
                    this.cnArcadeSDK.setHighScore(data).then((newScore) => {
                        if (this.verbose)
                            console.log("Set highscore to", newScore);
                        this.cachedHighscore = data;
                    }).catch((err) => {
                        if (this.verbose)
                            console.log("Could not set highscore", err);
                    });
                }
                else {
                    this.state[key] = data;
                    this.cnArcadeSDK.setGameState(this.state).then(() => {
                        if (this.verbose)
                            console.log("Stored game state!");
                    }).catch((err) => {
                        if (this.verbose)
                            console.log("Could not store game state. ", err);
                    });
                }
            }
            saveSessionScore(key, data) {
                if (key == this.sessionscoreKey) {
                    this.cnArcadeSDK.sessionScore(data).then((newScore) => {
                        console.log("Set sessionscore to", newScore);
                    }).catch((err) => {
                        console.log("Could not set sessionscore", err);
                    });
                }
            }
            load(key) {
                if (key == this.highscoreKey) {
                    return this.cachedHighscore.toString();
                }
                if (this.verbose)
                    console.log("Loading with key", key, this.state[key]);
                return this.state[key];
            }
            hasSavedKey(key) {
                if (this.verbose)
                    console.log("Checkin for saved key", this.state[key], "staten er", this.state);
                return !!this.state[key];
            }
            saveDto(key, obj) {
                this.save(key, obj);
            }
            loadDto(key) {
                return this.load(key);
            }
            clearAllData() {
            }
        }
        Service.CNArcadePersistenceService = CNArcadePersistenceService;
    })(Service = Funday.Service || (Funday.Service = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Service;
    (function (Service) {
        class PersistenceService {
            save(key, data) {
                localStorage.setItem(key, data.toString());
            }
            saveSessionScore(key, data) {
                localStorage.setItem(key, data.toString());
            }
            load(key) {
                return localStorage.getItem(key);
            }
            hasSavedKey(key) {
                return !!localStorage.getItem(key);
            }
            saveDto(key, obj) {
                let data = JSON.stringify(obj);
                this.save(key, data);
            }
            loadDto(key) {
                let data = this.load(key);
                return JSON.parse(data);
            }
            clearAllData() {
                localStorage.clear();
            }
        }
        Service.PersistenceService = PersistenceService;
    })(Service = Funday.Service || (Funday.Service = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Service;
    (function (Service) {
        class PlatformService {
            constructor(game) {
                this.game = null;
                this.platform = PlatformType.None;
                this.forcePlatform = PlatformType.None;
                this.game = game;
            }
            determinePlatform() {
                if (this.forcePlatform === PlatformType.None) {
                    if (this.game.device.desktop) {
                        this.platform = PlatformType.Browser;
                    }
                    else {
                        this.platform = PlatformType.CartoonNetworkPlay;
                    }
                }
                else {
                    this.platform = this.forcePlatform;
                }
            }
            getPlatform() {
                return this.platform;
            }
        }
        Service.PlatformService = PlatformService;
        let PlatformType;
        (function (PlatformType) {
            PlatformType[PlatformType["None"] = 0] = "None";
            PlatformType[PlatformType["Browser"] = 1] = "Browser";
            PlatformType[PlatformType["CartoonNetworkPlay"] = 2] = "CartoonNetworkPlay";
        })(PlatformType = Service.PlatformType || (Service.PlatformType = {}));
    })(Service = Funday.Service || (Funday.Service = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Service;
    (function (Service) {
        class CustomScaleManager {
            static calculateGameSize(minRes, maxRes) {
                let designAspectRatio = minRes.width / minRes.height;
                let thisRatio = window.innerWidth / window.innerHeight;
                let newWidth = minRes.width;
                let newHeight = minRes.height;
                if (thisRatio < designAspectRatio) {
                    newHeight = minRes.height * designAspectRatio / thisRatio;
                }
                else {
                    newWidth = minRes.width / (designAspectRatio / thisRatio);
                }
                return { width: newWidth, height: newHeight };
            }
        }
        Service.CustomScaleManager = CustomScaleManager;
    })(Service = Funday.Service || (Funday.Service = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Service;
    (function (Service) {
        class ResolutionConfiguration {
            constructor(name, min, max, ratio) {
                this.minScreenResolution = null;
                this.maxScreenResolution = null;
                this.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                this.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
                this.pageAlignHorizontally = true;
                this.pageAlignVertically = true;
                this.name = name;
                this.minScreenResolution = min;
                this.maxScreenResolution = max;
                this.ratio = ratio;
            }
            getName() {
                return this.name;
            }
            getMinScreenResolution() {
                return this.minScreenResolution;
            }
            getMaxScreenResolution() {
                return this.maxScreenResolution;
            }
            getRatio() {
                return this.ratio;
            }
            applyToGame(game) {
                game.scale.scaleMode = this.scaleMode;
                game.scale.fullScreenScaleMode = this.fullScreenScaleMode;
                game.scale.pageAlignHorizontally = this.pageAlignHorizontally;
                game.scale.pageAlignVertically = this.pageAlignVertically;
                if (this.minScreenResolution.width !== this.maxScreenResolution.width || this.minScreenResolution.height !== this.maxScreenResolution.height) {
                    let size = Service.CustomScaleManager.calculateGameSize(this.minScreenResolution, this.maxScreenResolution);
                    game.scale.setGameSize(size.width, size.height);
                }
                else {
                    game.scale.setGameSize(this.minScreenResolution.width, this.minScreenResolution.height);
                }
            }
            static createStaticResolutionConfiguration(name, width, height, ratio) {
                let minScreenSize = new ScreenResolution(width, height);
                let maxScreenSize = new ScreenResolution(width, height);
                let resolutionConfiguration = new ResolutionConfiguration(name, minScreenSize, maxScreenSize, ratio);
                return resolutionConfiguration;
            }
            static createFillAllResolutionConfiguration(name, minWidth, minHeight, maxWidth, maxHeight, ratio) {
                let minScreenSize = new ScreenResolution(minWidth, minHeight);
                let maxScreenSize = new ScreenResolution(maxWidth, maxHeight);
                let resolutionConfiguration = new ResolutionConfiguration(name, minScreenSize, maxScreenSize, ratio);
                return resolutionConfiguration;
            }
        }
        Service.ResolutionConfiguration = ResolutionConfiguration;
        class ScreenResolution {
            constructor(width, height) {
                this.width = 0;
                this.height = 0;
                this.width = width;
                this.height = height;
            }
        }
        Service.ScreenResolution = ScreenResolution;
        let Orientation;
        (function (Orientation) {
            Orientation[Orientation["Portrait"] = 0] = "Portrait";
            Orientation[Orientation["Landscape"] = 1] = "Landscape";
        })(Orientation = Service.Orientation || (Service.Orientation = {}));
    })(Service = Funday.Service || (Funday.Service = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Service;
    (function (Service) {
        class ResolutionConfigurationRepository {
            constructor() {
                this.resolutionConfigurations = new Array();
            }
            addResolutionConfiguration(resolutionConfiguration) {
                this.resolutionConfigurations.push(resolutionConfiguration);
            }
            addNewLockedResolutionConfiguration(name, width, height, ratio) {
                let resolutionConfiguration = Service.ResolutionConfiguration.createStaticResolutionConfiguration(name, width, height, ratio);
                this.addResolutionConfiguration(resolutionConfiguration);
            }
            addNewFillAllResolutionConfiguration(name, minWidth, minHeight, maxWidth, maxHeight, ratio) {
                let resolutionConfiguration = Service.ResolutionConfiguration.createFillAllResolutionConfiguration(name, minWidth, minHeight, maxWidth, maxHeight, ratio);
                this.addResolutionConfiguration(resolutionConfiguration);
            }
            getByName(name) {
                let configuration = null;
                for (let index = 0; index < this.resolutionConfigurations.length; index++) {
                    const resolutionConfiguration = this.resolutionConfigurations[index];
                    if (resolutionConfiguration.getName() === name) {
                        configuration = resolutionConfiguration;
                        break;
                    }
                }
                return configuration;
            }
        }
        Service.ResolutionConfigurationRepository = ResolutionConfigurationRepository;
    })(Service = Funday.Service || (Funday.Service = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Service;
    (function (Service) {
        class ResolutionService {
            constructor(game) {
                this.browserResolutionConfigurationRepository = null;
                this.cnPlayResolutionConfigurationRepository = null;
                this.resolutionConfiguration = null;
                this.game = game;
                this.browserResolutionConfigurationRepository = this.createBrowserResolutionRepository();
                this.cnPlayResolutionConfigurationRepository = this.createCNPlayResolutionRepository();
            }
            createBrowserResolutionRepository() {
                let resolutionConfigurationRepository = new Service.ResolutionConfigurationRepository();
                resolutionConfigurationRepository.addNewLockedResolutionConfiguration("HD", 1080, 1920, 1);
                resolutionConfigurationRepository.addNewLockedResolutionConfiguration("MD", 750, 1334, .7);
                resolutionConfigurationRepository.addNewLockedResolutionConfiguration("SD", 572, 1017, .53);
                return resolutionConfigurationRepository;
            }
            createCNPlayResolutionRepository() {
                let resolutionConfigurationRepository = new Service.ResolutionConfigurationRepository();
                resolutionConfigurationRepository.addNewFillAllResolutionConfiguration("HD", 1080, 1920, 1440, 1920, 1);
                resolutionConfigurationRepository.addNewFillAllResolutionConfiguration("MD", 750, 1334, 1001, 1334, .7);
                resolutionConfigurationRepository.addNewFillAllResolutionConfiguration("SD", 750, 1017, 763, 1017, .53);
                return resolutionConfigurationRepository;
            }
            getResolutionRepositoryForCurrentPlatform() {
                let platformService = this.game.services.platform;
                let resolutionRepository = null;
                if (platformService.getPlatform() === Service.PlatformType.Browser) {
                    resolutionRepository = this.browserResolutionConfigurationRepository;
                }
                else {
                    resolutionRepository = this.cnPlayResolutionConfigurationRepository;
                }
                return resolutionRepository;
            }
            getQuality() {
                return this.resolutionConfiguration.getName();
            }
            determineBestResolution() {
                let resolutionConfigurationRepository = this.getResolutionRepositoryForCurrentPlatform();
                let quality = "HD";
                this.resolutionConfiguration = resolutionConfigurationRepository.getByName(quality);
            }
            setupResolutionForGame() {
                if (!this.resolutionConfiguration) {
                    this.determineBestResolution();
                }
                if (!this.resolutionConfiguration) {
                    throw "Could not find resolution configuration!";
                }
                this.resolutionConfiguration.applyToGame(this.game);
            }
            applyResultionRatio(value) {
                return value * this.resolutionConfiguration.getRatio();
            }
            applyResultionRatioFloored(value) {
                return Math.floor(this.applyResultionRatio(value));
            }
            getNotchSafeTop() {
                if (!this.notchSafeTop) {
                    if ((screen.width == 375 && screen.height === 812) || (screen.width == 414 && screen.height === 896)) {
                        this.notchSafeTop = 64;
                    }
                    else {
                        this.notchSafeTop = 0;
                    }
                }
                return this.notchSafeTop;
            }
        }
        Service.ResolutionService = ResolutionService;
    })(Service = Funday.Service || (Funday.Service = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var UI;
    (function (UI) {
        class Button extends Phaser.Group {
            constructor(game, x, y, key, overFrame, outFrame, downFrame, upFrame) {
                super(game);
                this.button = null;
                this.onDown = new Phaser.Signal();
                this.onUp = new Phaser.Signal();
                this.onOver = new Phaser.Signal();
                this.onOut = new Phaser.Signal();
                this.xFlipModifier = 1;
                this.yFlipModifier = 1;
                this.currentHideOrShowAnim = null;
                this.position.x = x;
                this.position.y = y;
                this.button = new Phaser.Button(game, 0, 0, key, null, null, overFrame, outFrame || overFrame, downFrame || overFrame, upFrame || overFrame);
                this.button.anchor.setTo(.5);
                this.add(this.button);
                this.button.onOverMouseOnly = true;
                this.button.onInputDown.add(this.onButtonDown, this);
                this.button.onInputOut.add(this.onButtonOut, this);
                this.button.onInputOver.add(this.onButtonOver, this);
                this.button.onInputUp.add(this.onButtonUp, this);
            }
            loadTexture(key, frame, stopAnimation) {
                this.button.loadTexture(key, frame, stopAnimation);
            }
            flipX() {
                this.xFlipModifier *= -1;
                this.button.scale.x *= this.xFlipModifier;
            }
            flipY() {
                this.yFlipModifier *= -1;
                this.button.scale.y *= this.yFlipModifier;
            }
            onButtonOut(gameObject, pointer) {
                let animationFactory = this.game.services.animation;
                var tween = animationFactory.tween(this.button.scale, { x: 1 * this.xFlipModifier, y: 1 * this.yFlipModifier }, 100);
                tween.play();
            }
            onButtonOver() {
                let animationFactory = this.game.services.animation;
                var tween = animationFactory.tween(this.button.scale, { x: 1.05 * this.xFlipModifier, y: 1.05 * this.yFlipModifier }, 100);
                tween.play();
                this.onOver.dispatch();
            }
            onButtonDown() {
                let animationFactory = this.game.services.animation;
                var tween = animationFactory.tween(this.button.scale, { x: .9 * this.xFlipModifier, y: .9 * this.yFlipModifier }, 100);
                tween.play();
                this.onDown.dispatch();
            }
            onButtonUp(gameObject, pointer, isPointerOver) {
                let animationFactory = this.game.services.animation;
                var tween = animationFactory.tween(this.button.scale, { x: 1 * this.xFlipModifier, y: 1 * this.yFlipModifier }, 100);
                tween.play();
                if (isPointerOver) {
                    this.onUp.dispatch();
                }
            }
            disableHide() {
                this.button.inputEnabled = false;
                this.visible = false;
            }
            enableShow() {
                this.button.inputEnabled = true;
                this.visible = true;
            }
            animatedDisableHide(callback) {
                this.clearCurrentHideOrShowAnim();
                this.currentHideOrShowAnim = this.createDisableHideAnimation();
                if (callback) {
                    this.currentHideOrShowAnim.onComplete.add(callback);
                }
                this.currentHideOrShowAnim.play();
            }
            animatedEnableShow() {
                this.clearCurrentHideOrShowAnim();
                this.currentHideOrShowAnim = this.createEnableShowAnimation();
                this.currentHideOrShowAnim.play();
            }
            clearCurrentHideOrShowAnim() {
                if (this.currentHideOrShowAnim) {
                    this.currentHideOrShowAnim.stop();
                    this.currentHideOrShowAnim = null;
                }
            }
            createDisableHideAnimation() {
                let animationFactory = this.game.services.animation;
                let tween = animationFactory.tween(this.scale, { x: 0, y: 0 }, 800, Phaser.Easing.Elastic.In);
                tween.onPlay.add(function () {
                    this.scale.setTo(1);
                    this.visible = true;
                    this.button.inputEnabled = false;
                }, this);
                tween.onComplete.add(function () {
                    this.visible = false;
                    this.scale.setTo(1);
                }, this);
                return tween;
            }
            createEnableShowAnimation() {
                let animationFactory = this.game.services.animation;
                let myScale = { x: this.scale.x, y: this.scale.y };
                let tween = animationFactory.tween(this.scale, { x: myScale.x, y: myScale.y }, 800, Phaser.Easing.Elastic.Out);
                tween.onPlay.add(function () {
                    this.button.inputEnabled = true;
                    this.scale.setTo(0);
                    this.visible = true;
                }, this);
                tween.onComplete.add(function () {
                }, this);
                return tween;
            }
            isInputEnabled() {
                return this.button.inputEnabled;
            }
            addIconFromSpriteId(spriteId) {
                return this.addIconSprite(spriteId.key, spriteId.frame);
            }
            addIconSprite(key, frame) {
                let iconSprite = this.game.add.sprite(0, 0, key, frame);
                iconSprite.anchor.setTo(.5, .5);
                this.button.addChild(iconSprite);
                return iconSprite;
            }
            setAudioSettings(buttonAudioSettings) {
                let game = this.game;
                let audioSprite = game.getOrInitAudioSprite(buttonAudioSettings.out);
                this.button.setOutSound(audioSprite, buttonAudioSettings.out.markerName);
                audioSprite = game.getOrInitAudioSprite(buttonAudioSettings.out);
                this.button.setOverSound(audioSprite, buttonAudioSettings.over.markerName);
                audioSprite = game.getOrInitAudioSprite(buttonAudioSettings.down);
                this.button.setDownSound(audioSprite, buttonAudioSettings.down.markerName);
                audioSprite = game.getOrInitAudioSprite(buttonAudioSettings.up);
                this.button.setUpSound(audioSprite, buttonAudioSettings.up.markerName);
            }
        }
        UI.Button = Button;
        class ButtonAudioSettings {
            constructor(over, down, up, out) {
                this.over = null;
                this.down = null;
                this.up = null;
                this.out = null;
                this.over = over;
                this.down = down;
                this.up = up;
                this.out = out;
            }
        }
        UI.ButtonAudioSettings = ButtonAudioSettings;
    })(UI = Funday.UI || (Funday.UI = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var UI;
    (function (UI) {
        class CartoonNetworkLoadScreen extends Phaser.Group {
            constructor(state, fillTint) {
                super(state.game, null, "Cartoon Network Load Screen");
                state.add.existing(this);
                if (this.game.cache.getFrameByName("load", "load_background")) {
                    let background = state.add.sprite(this.game.world.centerX, this.game.height, "load", "load_background");
                    background.anchor.set(0.5, 1.0);
                }
                if (this.game.cache.getFrameByName("load", "load_logo")) {
                    let logo = state.add.sprite(state.game.canvas.width * .5, state.game.canvas.height * .15, "load", "load_logo");
                    logo.anchor.setTo(.5, 0);
                }
                let loadbar = state.add.sprite(state.game.canvas.width * .5, state.game.canvas.height * .5, "load", "load_bar");
                loadbar.anchor.setTo(.5, 0);
                let progressbar = state.add.sprite(state.game.canvas.width * .5, state.game.canvas.height * .5, "load", "load_progress");
                progressbar.anchor.setTo(.5, 0);
                progressbar.tint = fillTint;
                state.load.setPreloadSprite(progressbar, 0);
            }
        }
        UI.CartoonNetworkLoadScreen = CartoonNetworkLoadScreen;
    })(UI = Funday.UI || (Funday.UI = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var UI;
    (function (UI) {
        class LoadScreen extends Phaser.Group {
            constructor(game, loadScreenSettings) {
                super(game, null, "Load Bar");
                this.loadScreenSettings = null;
                this.background = null;
                this.box = null;
                this.progressBar = null;
                this.loadScreenSettings = loadScreenSettings;
                this.background = this.createBackgroundGraphics(loadScreenSettings.backgroundColor);
                this.progressBar = this.createProgressBarGraphics(loadScreenSettings.fillColor);
                this.box = this.createBoxGraphics(loadScreenSettings.boxColor);
            }
            onLoadProgess(progress) {
                let percentage = progress / 100;
                this.progressBar.scale.x = percentage;
            }
            listenToState(state) {
                state.load.onFileComplete.add(this.onLoadProgess, this);
            }
            createBackgroundGraphics(color) {
                let g = this.game.add.graphics(0, 0, this);
                g.beginFill(color);
                g.drawRect(0, 0, this.game.canvas.width, this.game.canvas.height);
                g.endFill();
                this.add(g);
                return g;
            }
            createBoxGraphics(color) {
                let g = this.game.add.graphics(this.game.canvas.height * .5, this.game.canvas.height * .5, this);
                g.lineStyle(this.game.canvas.width * .0025, color, 1);
                let width = this.game.canvas.width * .65;
                let height = this.game.canvas.height * .025;
                g.drawRect(0, 0, width, height);
                g.lineStyle(0);
                g.position.x -= g.width / 2;
                g.position.y -= g.height / 2;
                this.add(g);
                return g;
            }
            createProgressBarGraphics(color) {
                let g = this.game.add.graphics(this.game.canvas.width * .5, this.game.canvas.height * .5, this);
                g.beginFill(color);
                let width = this.game.canvas.width * .65;
                let height = this.game.canvas.height * .025;
                g.drawRect(0, 0, width, height);
                g.endFill();
                g.position.x -= g.width / 2;
                g.position.y -= g.height / 2;
                this.add(g);
                return g;
            }
            static add(state, boxColor, fillColor, backgroundColor) {
                let loadScreenSettings = new LoadScreenSettings(boxColor, fillColor, backgroundColor);
                let loadScreen = new LoadScreen(state.game, loadScreenSettings);
                state.add.existing(loadScreen);
                loadScreen.listenToState(state);
            }
        }
        UI.LoadScreen = LoadScreen;
        class LoadScreenSettings {
            constructor(boxColor, fillColor, backgroundColor) {
                this.boxColor = null;
                this.fillColor = null;
                this.backgroundColor = null;
                this.boxColor = boxColor;
                this.fillColor = fillColor;
                this.backgroundColor = backgroundColor;
            }
        }
    })(UI = Funday.UI || (Funday.UI = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var UI;
    (function (UI) {
        class NotificationBoard extends Phaser.Group {
            constructor(game, durationMs) {
                super(game);
                this.currentIndex = 0;
                this.durationMs = 0;
                this.durationMs = durationMs;
                this.startNotificationTextCycle();
            }
            startNotificationTextCycle() {
                if (this.children.length <= 1) {
                    return;
                }
                let game = this.game;
                let animationFactory = game.services.animation;
                let waitAnim = animationFactory.delay(this.durationMs);
                waitAnim.onComplete.add(this.showNextNotification, this);
                let loop = animationFactory.loop(waitAnim);
                loop.play();
            }
            showNextNotification() {
                let game = this.game;
                let animationFactory = game.services.animation;
                this.currentIndex = (this.currentIndex + 1) % this.children.length;
                let animScaleDown = animationFactory.tween(this.scale, { x: 0, y: 0 }, 150);
                let animScaleUp = animationFactory.tween(this.scale, { x: 1, y: 1 }, 150);
                animScaleDown.onComplete.add(this.showCurrentChildIndex, this);
                let queue = animationFactory.queue([animScaleDown, animScaleUp]);
                queue.play();
            }
            showCurrentChildIndex() {
                for (let index = 0; index < this.children.length; index++) {
                    const child = this.children[index];
                    child.visible = this.currentIndex === index;
                }
            }
        }
        UI.NotificationBoard = NotificationBoard;
    })(UI = Funday.UI || (Funday.UI = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var UI;
    (function (UI) {
        class ShadowTextGroup extends Phaser.Group {
            constructor(game, bitmapFontKey, caption, size, color, shadowOffset = 4) {
                super(game);
                this.text = null;
                this.shadowText = null;
                let shadowText = game.add.bitmapText(0, 0, bitmapFontKey, caption, size);
                shadowText.tint = 0x000000;
                shadowText.anchor.setTo(.5);
                shadowText.alpha = 0.5;
                this.addChild(shadowText);
                let text = game.add.bitmapText(0, 0, bitmapFontKey, caption, size);
                text.tint = color;
                text.anchor.setTo(.5);
                this.addChild(text);
                this.text = text;
                this.shadowText = shadowText;
                this.setShadowOffset(shadowOffset);
                this.cacheAsBitmap = true;
                this.updateCache();
            }
            setText(caption) {
                this.text.text = caption;
                this.shadowText.text = caption;
                this.updateCache();
            }
            setShadowOffset(shadowOffset) {
                let offset = this.game.applyResolutionRatio(shadowOffset);
                this.shadowText.position.x = offset;
                this.shadowText.position.y = offset;
                this.updateCache();
            }
            setAnchor(x, y) {
                this.text.anchor.x = x;
                this.text.anchor.y = y;
                this.shadowText.anchor.x = x;
                this.shadowText.anchor.y = y;
                this.updateCache();
            }
            setShadowColorAndAlpha(color, alpha = 1.0) {
                this.shadowText.tint = color;
                this.shadowText.alpha = alpha;
                this.updateCache();
            }
            setFontSize(size) {
                this.text.fontSize = size;
                this.shadowText.fontSize = size;
                this.updateCache();
            }
        }
        UI.ShadowTextGroup = ShadowTextGroup;
    })(UI = Funday.UI || (Funday.UI = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var UI;
    (function (UI) {
        class TransitionHandler {
            constructor(game) {
                this.game = null;
                this.game = game;
            }
            handleTransition(from, to) {
            }
        }
        UI.TransitionHandler = TransitionHandler;
    })(UI = Funday.UI || (Funday.UI = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var UI;
    (function (UI) {
        class View extends Phaser.Group {
            constructor(game) {
                super(game);
                this.onTransitionInStart = new Phaser.Signal();
                this.onTransitionInComplete = new Phaser.Signal();
                this.onTransitionOutStart = new Phaser.Signal();
                this.onTransitionOutComplete = new Phaser.Signal();
                this.parent.removeChild(this);
            }
            onTransitionInStarted() {
                this.onTransitionInStart.dispatch();
            }
            onTransitionInCompleted() {
                this.onTransitionInComplete.dispatch();
            }
            onTransitionOutStarted() {
                this.onTransitionOutStart.dispatch();
            }
            onTranstionOutCompleted() {
                this.onTransitionOutComplete.dispatch();
            }
        }
        UI.View = View;
    })(UI = Funday.UI || (Funday.UI = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var UI;
    (function (UI) {
        class ViewContainer extends UI.View {
            constructor(game) {
                super(game);
                this.views = new Array();
                this.currentView = null;
                this.position.x = game.canvas.width * .5;
                this.position.y = game.canvas.height * .5;
            }
            addView(view) {
                this.views.push(view);
                this.add(view);
            }
            transitionTo(view, transitionHandler) {
                transitionHandler.handleTransition(this.currentView, view);
            }
        }
        UI.ViewContainer = ViewContainer;
    })(UI = Funday.UI || (Funday.UI = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var UI;
    (function (UI) {
        var Modal;
        (function (Modal_1) {
            class Modal extends Phaser.Sprite {
                constructor(game) {
                    super(game, 0, 0, null);
                    this.currentView = null;
                    this.game = null;
                    this.hasBeenInitialized = false;
                    this.isHiding = false;
                    this.onHidden = new Phaser.Signal();
                    this.game = game;
                }
                static generateBackgroundTexture(game) {
                    if (!Funday.UI.Modal.Modal.backgroundTexture) {
                        let bmd = new Phaser.BitmapData(game, "ModalBackground", game.canvas.width, game.canvas.height);
                        bmd.ctx.fillStyle = "black";
                        bmd.ctx.globalAlpha = .6;
                        bmd.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
                        bmd.ctx.globalAlpha = 1;
                        bmd.dirty = true;
                        Funday.UI.Modal.Modal.backgroundTexture = bmd;
                    }
                    return Funday.UI.Modal.Modal.backgroundTexture;
                }
                static getBackgroundTexture(game) {
                    return this.generateBackgroundTexture(game);
                }
                setView(view) {
                    this.removeCurrentView();
                    if (view) {
                        this.addChild(view);
                        this.currentView = view;
                    }
                }
                removeCurrentView() {
                    if (this.currentView) {
                        this.currentView.kill();
                        this.removeChild(this.currentView);
                        this.currentView = null;
                    }
                }
                show() {
                    if (!this.hasBeenInitialized) {
                        this.loadTexture(Modal.getBackgroundTexture(this.game));
                        this.hasBeenInitialized = true;
                    }
                    this.revive();
                    this.currentView.revive();
                    this.inputEnabled = true;
                    let alphaAnim = this.game.services.animation.tween(this, { alpha: 1 }, 500);
                    if (this.currentView) {
                        this.currentView.scale.setTo(0);
                        this.currentView.alignIn(this, Phaser.CENTER);
                        let tweenAnim = this.game.services.animation.tween(this.currentView.scale, { x: 1, y: 1 }, 200, Phaser.Easing.Back.Out);
                        let queue = this.game.services.animation.queue([alphaAnim, tweenAnim]);
                        let currentView = this.currentView;
                        queue.onPlay.add(function () {
                            currentView.onTransitionInStarted();
                        });
                        queue.onComplete.add(function () {
                            currentView.onTransitionInCompleted();
                        }, this);
                        queue.play();
                    }
                    else {
                        alphaAnim.play();
                    }
                }
                instantShow() {
                    if (!this.hasBeenInitialized) {
                        this.loadTexture(Modal.getBackgroundTexture(this.game));
                        this.hasBeenInitialized = true;
                    }
                    this.currentView.scale.setTo(1);
                    this.currentView.alignIn(this, Phaser.CENTER);
                    this.alpha = 1;
                    this.visible = true;
                    this.revive();
                    this.currentView.revive();
                    this.inputEnabled = true;
                    this.currentView.onTransitionInStarted();
                    this.currentView.onTransitionInCompleted();
                }
                instantHide() {
                    this.alpha = 0;
                    this.onHide();
                }
                hide() {
                    this.isHiding = true;
                    let tweenAnim = this.game.services.animation.tween(this.currentView.scale, { x: 0, y: 0 }, 200, Phaser.Easing.Back.In);
                    let alphaAnim = this.game.services.animation.tween(this, { alpha: 0 }, 500);
                    let queue = this.game.services.animation.queue([tweenAnim, alphaAnim]);
                    queue.onPlay.add(this.currentView.onTransitionOutStarted, this.currentView);
                    queue.onComplete.add(this.onHide, this);
                    queue.onPlay.add(this.currentView.onTransitionOutStarted, this.currentView);
                    queue.onComplete.add(this.currentView.onTranstionOutCompleted, this.currentView);
                    queue.play();
                }
                onHide() {
                    this.kill();
                    this.currentView.onTranstionOutCompleted();
                    this.currentView.kill();
                    this.inputEnabled = false;
                    this.isHiding = false;
                    this.onHidden.dispatch();
                }
                update() {
                    if (this.alive && this.currentView) {
                        this.currentView.update();
                    }
                }
            }
            Modal.backgroundTexture = null;
            Modal_1.Modal = Modal;
        })(Modal = UI.Modal || (UI.Modal = {}));
    })(UI = Funday.UI || (Funday.UI = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Utils;
    (function (Utils) {
        class EnumToObjectMap {
            constructor() {
                this.backingArray = new Array();
            }
            add(key, obj) {
                if (this.backingArray[key]) {
                    throw "Enum to Object map already contains key";
                }
                this.backingArray[key] = obj;
            }
            get(key) {
                return this.backingArray[key];
            }
        }
        Utils.EnumToObjectMap = EnumToObjectMap;
    })(Utils = Funday.Utils || (Funday.Utils = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Utils;
    (function (Utils) {
        class LootTable {
            constructor() {
                this.autoResolveDroppedLootTables = true;
                this.lootTable = new Array();
            }
            addItem(item, weight) {
                let dropItem = new WeightedItem(item, weight);
                this.lootTable.push(dropItem);
            }
            getRandomItem() {
                let totalWeight = this.calculateTotalWeight();
                let targetWeight = this.getRandomValue(0, totalWeight);
                let lootTableItem = this.getDropItemFromWeight(targetWeight);
                return lootTableItem;
            }
            isEmpty() {
                return this.lootTable.length === 0;
            }
            hasItems() {
                return !this.isEmpty();
            }
            calculateTotalWeight() {
                let sum = 0;
                for (let i = 0; i < this.lootTable.length; i++) {
                    const weightedItem = this.lootTable[i];
                    sum += weightedItem.weight;
                }
                return sum;
            }
            getRandomValue(fromInclusive, toExclusive) {
                return Math.random() * (toExclusive - fromInclusive) + fromInclusive;
            }
            getDropItemFromWeight(targetWeight) {
                let item = null;
                let sum = 0;
                for (let i = 0; i < this.lootTable.length; i++) {
                    const weightedItem = this.lootTable[i];
                    sum += weightedItem.weight;
                    if (sum >= targetWeight) {
                        item = weightedItem.item;
                        if (this.autoResolveDroppedLootTables && item instanceof LootTable) {
                            item = item.getRandomItem();
                        }
                        break;
                    }
                }
                return item;
            }
        }
        Utils.LootTable = LootTable;
        class WeightedItem {
            constructor(item, weight) {
                this.item = null;
                this.weight = 0;
                this.item = item;
                this.weight = weight;
            }
        }
        Utils.WeightedItem = WeightedItem;
    })(Utils = Funday.Utils || (Funday.Utils = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var Utils;
    (function (Utils) {
        class MaskHelper {
            static addRectangleMask(game, width, height, parent) {
                let graphics = game.add.graphics(0, 0);
                if (parent) {
                    parent.addChild(graphics);
                }
                graphics.beginFill(0xFFFF00);
                graphics.drawRect(0, 0, width, height);
                graphics.endFill();
                return graphics;
            }
        }
        Utils.MaskHelper = MaskHelper;
    })(Utils = Funday.Utils || (Funday.Utils = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class Game extends Toolbox.CartoonNetworkGame {
            constructor(sdk) {
                super();
                this.highscorePersistenceKey = "highscore";
                this.sessionscorePersistenceKey = "sessionscore";
                this.SDKButtonBounds = { top: 0, bottom: 0, left: 0, right: 0 };
                this.version.name = "";
                this.version.major = 1;
                this.version.minor = 0;
                this.version.revision = 2;
                this.setupSDK(sdk);
                this.achievements = new OKKO.AchievementController(this, sdk);
                this.achievements.init();
                this.state.add(StateKey.Boot, OKKO.StateBoot, false);
                this.state.add(StateKey.Load, OKKO.StateLoad, false);
                this.state.add(StateKey.Game, OKKO.StateGame, false);
                window.game = this;
                this.startBoot();
            }
            setupSDK(sdk) {
                if (sdk == undefined)
                    return;
                this.services = new Funday.Service.CNArcadeProvider(sdk, this);
                sdk.setPlayFunction(() => {
                    this.paused = false;
                });
                sdk.setPauseFunction(() => {
                    this.paused = true;
                });
                let defaultGameState = new OKKO.GameState().getDefaultGameState();
                this.services.persistence.loadOrSetDefault(defaultGameState);
                this.highscorePersistenceKey = this.services.persistence.highscoreKey;
                let SDKbuttonBounds = Phaser.DOM.getBounds(document.getElementsByClassName('menu-button'), 0);
                SDKbuttonBounds.right = SDKbuttonBounds.right / innerWidth * this.width;
                SDKbuttonBounds.width = SDKbuttonBounds.width / innerWidth * this.width;
                SDKbuttonBounds.height = SDKbuttonBounds.height / innerHeight * this.height;
                SDKbuttonBounds.top = SDKbuttonBounds.top / innerHeight * this.height;
                this.SDKButtonBounds = SDKbuttonBounds;
            }
            startBoot() {
                this.state.start(StateKey.Boot);
            }
            startLoad() {
                this.state.start(StateKey.Load);
                this.stage.disableVisibilityChange = false;
                this.clearBeforeRender = false;
                this.tweens.frameBased = true;
                this.soundRepo = new OKKO.SoundRepository(this);
            }
            startGame() {
                this.state.start(StateKey.Game);
            }
            onLoadComplete() {
            }
            createButton(x, y, spriteId) {
                let btn = super.createButton(x, y, spriteId);
                btn.button.onInputOver.add(() => {
                    this.soundRepo.onMouseHover();
                });
                btn.button.onInputUp.add(() => {
                    this.soundRepo.onMouseClick();
                });
                return btn;
            }
        }
        OKKO.Game = Game;
        class StateKey {
        }
        StateKey.Boot = "Boot";
        StateKey.Load = "Load";
        StateKey.Game = "Game";
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class GameState {
            getDefaultGameState() {
                let state = {};
                state[PersistenceKeys.COINS] = 0;
                state[PersistenceKeys.METER_UPGRADE] = 0;
                state[PersistenceKeys.TUTORIAL_COMPLETE] = false;
                state[PersistenceKeys.SHOP_TUTORIAL_COMPLETE] = false;
                return state;
            }
        }
        OKKO.GameState = GameState;
        class PersistenceKeys {
        }
        PersistenceKeys.COINS = 'COINS';
        PersistenceKeys.METER_UPGRADE = 'METER_UPGRADE';
        PersistenceKeys.TUTORIAL_COMPLETE = 'TUTORIAL_COMPLETE';
        PersistenceKeys.SHOP_TUTORIAL_COMPLETE = 'SHOP_TUTORIAL_COMPLETE';
        OKKO.PersistenceKeys = PersistenceKeys;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class SoundRepository {
            constructor(game) {
                this.game = null;
                this.music = null;
                this.sfxMute = false;
                this.sfxSounds = [];
                this.game = game;
            }
            startMusic(loop = false) {
                if (!this.music || loop) {
                    this.music = this.game.playSound(Funday.OkKo.AudioLibrary.main.music.OKKOMusicLOOP);
                    this.music.allowMultiple = true;
                    this.music.loop = true;
                    this.music.onStop.addOnce(() => {
                        this.startMusic(true);
                    });
                }
            }
            muteSFX() {
                this.sfxMute = true;
                this.sfxSounds.forEach((sound) => {
                    sound.mute = true;
                });
            }
            unMuteSFX() {
                this.sfxMute = false;
                this.sfxSounds.forEach((sound) => {
                    sound.mute = false;
                });
            }
            isSFXMuted() {
                return this.sfxMute;
            }
            muteMusic() {
                this.music.mute = true;
            }
            unMuteMusic() {
                this.music.mute = false;
            }
            pauseSFX() {
                this.sfxSounds.forEach((sound) => {
                    sound.pause();
                });
            }
            resumeSFX() {
                this.sfxSounds.forEach((sound) => {
                    sound.resume();
                });
            }
            onCoinPickup() {
                this.playRandomKey(Funday.OkKo.AudioLibrary.main.sfxCoinPickUp);
            }
            onPlayerSwitchSide() {
                this.playRandomKey(Funday.OkKo.AudioLibrary.main.sfxDash);
                if (this.game.rnd.realInRange(0.0, 1.0) > 0.5)
                    this.playRandomKey(Funday.OkKo.AudioLibrary.main.voiceKO.voiceDash);
            }
            onPlayerRunning() {
                if (this.runningSound == null || !this.runningSound.isPlaying) {
                    this.runningSound = this.playRandomKey(Funday.OkKo.AudioLibrary.main.sfxFootsteps);
                }
            }
            onGlorbPickup() {
                this.playRandomKey(Funday.OkKo.AudioLibrary.main.sfxGlorb);
            }
            onJethroSwitch() {
                this.playRandomKey(Funday.OkKo.AudioLibrary.main.sfxJethroDash);
            }
            onJethroMoving() {
                let sound = this.playRandomKey(Funday.OkKo.AudioLibrary.main.sfxJethroTracksLoop);
                sound.loop = true;
                return sound;
            }
            onPlayerPunch() {
                this.playRandomKey(Funday.OkKo.AudioLibrary.main.sfxPunch);
            }
            onPlayerTKOTransform() {
                this.playRandomKey(Funday.OkKo.AudioLibrary.main.voiceKO.voiceGlorb);
            }
            onTakeDamage(health) {
                if (health == 0) {
                    this.play(Funday.OkKo.AudioLibrary.main.sfxTakeDamageGameOver.sfxKOTakeDamageGameOver);
                    if (this.alarmTimerEvent)
                        this.game.time.events.remove(this.alarmTimerEvent);
                    if (this.alarmSound)
                        this.alarmSound.stop();
                }
                else {
                    this.playRandomKey(Funday.OkKo.AudioLibrary.main.sfxTakeDamage);
                    this.playRandomKey(Funday.OkKo.AudioLibrary.main.sfxTakeDamageMusic);
                    this.music.volume = 0.15;
                    this.game.add.tween(this.music).to({ volume: 1 }, 1000, Phaser.Easing.Quadratic.In, true);
                    this.alarmTimerEvent = this.game.time.events.add(333, () => { this.alarmSound = this.play(Funday.OkKo.AudioLibrary.main.sfxTakeDamageAlarm.sfxTakeDamageAlarm); });
                }
            }
            onStartDamageAlarm() {
                this.playRandomKey(Funday.OkKo.AudioLibrary.main.sfxTakeDamageAlarm);
            }
            onMouseClick() {
                this.playRandomKey(Funday.OkKo.AudioLibrary.main.uiMouseClick);
            }
            onMouseHover() {
                this.playRandomKey(Funday.OkKo.AudioLibrary.main.uiMouseHover);
            }
            onPopUpExpand() {
                this.playRandomKey(Funday.OkKo.AudioLibrary.main.uiPopUpExpand);
            }
            onPopUpMinimize() {
                this.playRandomKey(Funday.OkKo.AudioLibrary.main.uiPopUpMinimize);
            }
            onPurchase() {
                this.playRandomKey(Funday.OkKo.AudioLibrary.main.sfxMakePurchase);
            }
            onGogo() {
                this.play(Funday.OkKo.AudioLibrary.main.voiceEnid.voiceGoGoGo);
            }
            play(audioId, volume = 1.0) {
                let sound = this.game.playSound(audioId, volume);
                this.addToArray(sound);
                return sound;
            }
            playRandomKey(object, volume = 1.0) {
                let keys = Object.keys(object);
                let key = Phaser.ArrayUtils.getRandomItem(keys);
                let value = object[key];
                let sound;
                if (value instanceof Funday.AudioId) {
                    sound = this.game.playSound(value, volume);
                }
                else if (value instanceof Object) {
                    sound = this.playRandomKey(value, volume);
                }
                this.addToArray(sound);
                return sound;
            }
            addToArray(sound) {
                this.sfxSounds.push(sound);
                sound.onMarkerComplete.addOnce(() => {
                    this.sfxSounds.splice(this.sfxSounds.indexOf(sound), 1);
                });
                sound.mute = this.isSFXMuted();
            }
        }
        OKKO.SoundRepository = SoundRepository;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OkKo;
    (function (OkKo) {
        class AudioLibrary {
        }
        AudioLibrary.main = {
            music: {
                OKKOMusicLOOP: new Funday.AudioId('main', '/music/OK KO_Music_LOOP'),
            },
            sfxCoinPickUp: {
                sfxCoinPickUp01: new Funday.AudioId('main', '/sfx_Coin_Pick_Up/sfx_Coin_Pick_Up_01'),
                sfxCoinPickUp02: new Funday.AudioId('main', '/sfx_Coin_Pick_Up/sfx_Coin_Pick_Up_02'),
                sfxCoinPickUp03: new Funday.AudioId('main', '/sfx_Coin_Pick_Up/sfx_Coin_Pick_Up_03'),
                sfxCoinPickUp04: new Funday.AudioId('main', '/sfx_Coin_Pick_Up/sfx_Coin_Pick_Up_04'),
                sfxCoinPickUp05: new Funday.AudioId('main', '/sfx_Coin_Pick_Up/sfx_Coin_Pick_Up_05'),
            },
            sfxDash: {
                sfxDash01: new Funday.AudioId('main', '/sfx_Dash/sfx_Dash_01'),
                sfxDash02: new Funday.AudioId('main', '/sfx_Dash/sfx_Dash_02'),
                sfxDash03: new Funday.AudioId('main', '/sfx_Dash/sfx_Dash_03'),
                sfxDash04: new Funday.AudioId('main', '/sfx_Dash/sfx_Dash_04'),
            },
            sfxFootsteps: {
                sfxFootsteps01: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_01'),
                sfxFootsteps02: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_02'),
                sfxFootsteps03: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_03'),
                sfxFootsteps04: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_04'),
                sfxFootsteps05: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_05'),
                sfxFootsteps06: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_06'),
                sfxFootsteps07: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_07'),
                sfxFootsteps08: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_08'),
                sfxFootsteps09: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_09'),
                sfxFootsteps10: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_10'),
                sfxFootsteps11: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_11'),
                sfxFootsteps12: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_12'),
                sfxFootsteps13: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_13'),
                sfxFootsteps14: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_14'),
                sfxFootsteps15: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_15'),
                sfxFootsteps16: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_16'),
                sfxFootsteps17: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_17'),
                sfxFootsteps18: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_18'),
                sfxFootsteps19: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_19'),
                sfxFootsteps20: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_20'),
                sfxFootsteps21: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_21'),
                sfxFootsteps22: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_22'),
                sfxFootsteps23: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_23'),
                sfxFootsteps24: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_24'),
                sfxFootsteps25: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_25'),
                sfxFootsteps26: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_26'),
                sfxFootsteps27: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_27'),
                sfxFootsteps28: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_28'),
                sfxFootsteps29: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_29'),
                sfxFootsteps30: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_30'),
                sfxFootsteps31: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_31'),
                sfxFootsteps32: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_32'),
                sfxFootsteps33: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_33'),
                sfxFootsteps34: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_34'),
                sfxFootsteps35: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_35'),
                sfxFootsteps36: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_36'),
                sfxFootsteps37: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_37'),
                sfxFootsteps38: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_38'),
                sfxFootsteps39: new Funday.AudioId('main', '/sfx_Footsteps/sfx_Footsteps_39'),
            },
            sfxGlorb: {
                sfxGlorbPowerUp01: new Funday.AudioId('main', '/sfx_Glorb/sfx_Glorb_Power_Up_01'),
                sfxGlorbPowerUp02: new Funday.AudioId('main', '/sfx_Glorb/sfx_Glorb_Power_Up_02'),
                sfxGlorbPowerUp03: new Funday.AudioId('main', '/sfx_Glorb/sfx_Glorb_Power_Up_03'),
            },
            sfxJethroDash: {
                sfxJethroDash01: new Funday.AudioId('main', '/sfx_Jethro_Dash/sfx_Jethro_Dash_01'),
                sfxJethroDash02: new Funday.AudioId('main', '/sfx_Jethro_Dash/sfx_Jethro_Dash_02'),
                sfxJethroDash03: new Funday.AudioId('main', '/sfx_Jethro_Dash/sfx_Jethro_Dash_03'),
            },
            sfxJethroTracks: {
                sfxJethroTracks01: new Funday.AudioId('main', '/sfx_Jethro_Tracks/sfx_Jethro_Tracks_01'),
                sfxJethroTracks02: new Funday.AudioId('main', '/sfx_Jethro_Tracks/sfx_Jethro_Tracks_02'),
                sfxJethroTracks03: new Funday.AudioId('main', '/sfx_Jethro_Tracks/sfx_Jethro_Tracks_03'),
                sfxJethroTracks04: new Funday.AudioId('main', '/sfx_Jethro_Tracks/sfx_Jethro_Tracks_04'),
            },
            sfxJethroTracksLoop: {
                sfxJethroTracksLoop01: new Funday.AudioId('main', '/sfx_Jethro_Tracks_Loop/sfx_Jethro_Tracks_Loop_01'),
                sfxJethroTracksLoop02: new Funday.AudioId('main', '/sfx_Jethro_Tracks_Loop/sfx_Jethro_Tracks_Loop_02'),
            },
            sfxMakePurchase: {
                sfxMakePurchase01: new Funday.AudioId('main', '/sfx_Make_Purchase/sfx_Make_Purchase_01'),
                sfxMakePurchase02: new Funday.AudioId('main', '/sfx_Make_Purchase/sfx_Make_Purchase_02'),
                sfxMakePurchase03: new Funday.AudioId('main', '/sfx_Make_Purchase/sfx_Make_Purchase_03'),
            },
            sfxPunch: {
                sfxPunch01: new Funday.AudioId('main', '/sfx_Punch/sfx_Punch_01'),
                sfxPunch02: new Funday.AudioId('main', '/sfx_Punch/sfx_Punch_02'),
                sfxPunch03: new Funday.AudioId('main', '/sfx_Punch/sfx_Punch_03'),
                sfxPunch04: new Funday.AudioId('main', '/sfx_Punch/sfx_Punch_04'),
            },
            sfxTakeDamage: {
                sfxKOTakeDamage01: new Funday.AudioId('main', '/sfx_Take_Damage/sfx_KO_Take_Damage_01'),
                sfxKOTakeDamage02: new Funday.AudioId('main', '/sfx_Take_Damage/sfx_KO_Take_Damage_02'),
                sfxKOTakeDamage03: new Funday.AudioId('main', '/sfx_Take_Damage/sfx_KO_Take_Damage_03'),
                sfxKOTakeDamage04: new Funday.AudioId('main', '/sfx_Take_Damage/sfx_KO_Take_Damage_04'),
            },
            sfxTakeDamageAlarm: {
                sfxTakeDamageAlarm: new Funday.AudioId('main', '/sfx_Take_Damage_Alarm/sfx_Take_Damage_Alarm'),
            },
            sfxTakeDamageGameOver: {
                sfxKOTakeDamageGameOver: new Funday.AudioId('main', '/sfx_Take_Damage_GameOver/sfx_KO_Take_Damage_Game_Over'),
            },
            sfxTakeDamageMusic: {
                sfxTakeDamageMusic01: new Funday.AudioId('main', '/sfx_Take_Damage_Music/sfx_Take_Damage_Music_01'),
                sfxTakeDamageMusic02: new Funday.AudioId('main', '/sfx_Take_Damage_Music/sfx_Take_Damage_Music_02'),
                sfxTakeDamageMusic03: new Funday.AudioId('main', '/sfx_Take_Damage_Music/sfx_Take_Damage_Music_03'),
            },
            uiMouseClick: {
                uiMouseClick01: new Funday.AudioId('main', '/ui_Mouse_Click/ui_Mouse_Click_01'),
                uiMouseClick02: new Funday.AudioId('main', '/ui_Mouse_Click/ui_Mouse_Click_02'),
                uiMouseClick03: new Funday.AudioId('main', '/ui_Mouse_Click/ui_Mouse_Click_03'),
            },
            uiMouseHover: {
                uiMouseHover: new Funday.AudioId('main', '/ui_Mouse_Hover/ui_Mouse_Hover'),
            },
            uiPopUpExpand: {
                uiPopUpExpand: new Funday.AudioId('main', '/ui_Pop_Up_Expand/ui_Pop_Up_Expand'),
                uiPopUpExpand02: new Funday.AudioId('main', '/ui_Pop_Up_Expand/ui_Pop_Up_Expand_02'),
                uiPopUpExpand03: new Funday.AudioId('main', '/ui_Pop_Up_Expand/ui_Pop_Up_Expand_03'),
            },
            uiPopUpMinimize: {
                uiPopUpMinimize: new Funday.AudioId('main', '/ui_Pop_Up_Minimize/ui_Pop_Up_Minimize'),
                uiPopUpMinimize02: new Funday.AudioId('main', '/ui_Pop_Up_Minimize/ui_Pop_Up_Minimize_02'),
            },
            voiceEnid: {
                voiceGoGoGo: new Funday.AudioId('main', '/voice_Enid/voice_Go_go_go'),
            },
            voiceKO: {
                voiceDash: {
                    voiceDash01: new Funday.AudioId('main', '/voice_KO/voice_Dash/voice_Dash_01'),
                    voiceDash02: new Funday.AudioId('main', '/voice_KO/voice_Dash/voice_Dash_02'),
                    voiceDash03: new Funday.AudioId('main', '/voice_KO/voice_Dash/voice_Dash_03'),
                    voiceDash04: new Funday.AudioId('main', '/voice_KO/voice_Dash/voice_Dash_04'),
                    voiceDash05: new Funday.AudioId('main', '/voice_KO/voice_Dash/voice_Dash_05'),
                },
                voiceGlorb: {
                    voiceGlorb01: new Funday.AudioId('main', '/voice_KO/voice_Glorb/voice_Glorb_01'),
                    voiceGlorb02: new Funday.AudioId('main', '/voice_KO/voice_Glorb/voice_Glorb_02'),
                    voiceGlorb03: new Funday.AudioId('main', '/voice_KO/voice_Glorb/voice_Glorb_03'),
                    voiceGlorb04: new Funday.AudioId('main', '/voice_KO/voice_Glorb/voice_Glorb_04'),
                },
            },
        };
        OkKo.AudioLibrary = AudioLibrary;
    })(OkKo = Funday.OkKo || (Funday.OkKo = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OkKo;
    (function (OkKo) {
        class BitmapFontLibrary {
        }
        BitmapFontLibrary.fonts = {
            okko_font_export: new Funday.BitmapFontId('okko_font_export'),
            okko_font2_export: new Funday.BitmapFontId('okko_font2_export')
        };
        OkKo.BitmapFontLibrary = BitmapFontLibrary;
    })(OkKo = Funday.OkKo || (Funday.OkKo = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OkKo;
    (function (OkKo) {
        class SpriteLibrary {
        }
        SpriteLibrary.bg = { Bush: new Funday.SpriteId('bg', 'Bush'),
            lamp: new Funday.SpriteId('bg', 'lamp'),
            Post: new Funday.SpriteId('bg', 'Post'),
            Road: new Funday.SpriteId('bg', 'Road'),
            shop_entrance: new Funday.SpriteId('bg', 'shop_entrance'),
            shop_icon: new Funday.SpriteId('bg', 'shop_icon'),
            Trafic_Line: new Funday.SpriteId('bg', 'Trafic_Line'),
            tree01: new Funday.SpriteId('bg', 'tree01'),
            tree02: new Funday.SpriteId('bg', 'tree02'),
            tree_shadow: new Funday.SpriteId('bg', 'tree_shadow'),
        };
        SpriteLibrary.game = { background: new Funday.SpriteId('game', 'background'),
            Clouds: new Funday.SpriteId('game', 'Clouds'),
            coin: new Funday.SpriteId('game', 'coin'),
            coin_shadow: new Funday.SpriteId('game', 'coin_shadow'),
            explosion_fx01: new Funday.SpriteId('game', 'explosion_fx01'),
            explosion_fx02: new Funday.SpriteId('game', 'explosion_fx02'),
            explosion_fx03: new Funday.SpriteId('game', 'explosion_fx03'),
            explosion_fx04: new Funday.SpriteId('game', 'explosion_fx04'),
            explosion_fx05: new Funday.SpriteId('game', 'explosion_fx05'),
            explosion_fx06: new Funday.SpriteId('game', 'explosion_fx06'),
            explosion_fx07: new Funday.SpriteId('game', 'explosion_fx07'),
            glorb: new Funday.SpriteId('game', 'glorb'),
            glorb_aura: new Funday.SpriteId('game', 'glorb_aura'),
            hit_fx01: new Funday.SpriteId('game', 'hit_fx01'),
            hit_fx02: new Funday.SpriteId('game', 'hit_fx02'),
            hit_fx03: new Funday.SpriteId('game', 'hit_fx03'),
            hit_fx04: new Funday.SpriteId('game', 'hit_fx04'),
            hit_fx05: new Funday.SpriteId('game', 'hit_fx05'),
            jethro_jump_anim01: new Funday.SpriteId('game', 'jethro_jump_anim01'),
            jethro_jump_anim02: new Funday.SpriteId('game', 'jethro_jump_anim02'),
            jethro_jump_anim03: new Funday.SpriteId('game', 'jethro_jump_anim03'),
            jethro_jump_anim04: new Funday.SpriteId('game', 'jethro_jump_anim04'),
            jethro_jump_anim05: new Funday.SpriteId('game', 'jethro_jump_anim05'),
            jethro_jump_anim06: new Funday.SpriteId('game', 'jethro_jump_anim06'),
            jethro_jump_anim07: new Funday.SpriteId('game', 'jethro_jump_anim07'),
            jethro_run_anim01: new Funday.SpriteId('game', 'jethro_run_anim01'),
            jethro_run_anim02: new Funday.SpriteId('game', 'jethro_run_anim02'),
            jethro_run_anim03: new Funday.SpriteId('game', 'jethro_run_anim03'),
            jethro_run_anim04: new Funday.SpriteId('game', 'jethro_run_anim04'),
            jethro_run_anim05: new Funday.SpriteId('game', 'jethro_run_anim05'),
            jethro_run_anim06: new Funday.SpriteId('game', 'jethro_run_anim06'),
            pause_button: new Funday.SpriteId('game', 'pause_button'),
            power_bar_end: new Funday.SpriteId('game', 'power_bar_end'),
            power_bar_glorb: new Funday.SpriteId('game', 'power_bar_glorb'),
            power_bar_middle: new Funday.SpriteId('game', 'power_bar_middle'),
            power_bar_start: new Funday.SpriteId('game', 'power_bar_start'),
            speed_line: new Funday.SpriteId('game', 'speed_line'),
        };
        SpriteLibrary.load = { load_bar: new Funday.SpriteId('load', 'load_bar'),
            load_logo: new Funday.SpriteId('load', 'load_logo'),
            load_progress: new Funday.SpriteId('load', 'load_progress'),
        };
        SpriteLibrary.loadbg = { load_background: new Funday.SpriteId('loadbg', 'load_background'),
        };
        SpriteLibrary.menus = { add_box: new Funday.SpriteId('menus', 'add_box'),
            add_box_2: new Funday.SpriteId('menus', 'add_box_2'),
            checkmark: new Funday.SpriteId('menus', 'checkmark'),
            close: new Funday.SpriteId('menus', 'close'),
            game_over_box: new Funday.SpriteId('menus', 'game_over_box'),
            hand: new Funday.SpriteId('menus', 'hand'),
            no_button: new Funday.SpriteId('menus', 'no_button'),
            option_box: new Funday.SpriteId('menus', 'option_box'),
            scroll_box_ads: new Funday.SpriteId('menus', 'scroll_box_ads'),
            tutorial_box: new Funday.SpriteId('menus', 'tutorial_box'),
            yes_button___Copy: new Funday.SpriteId('menus', 'yes_button - Copy'),
            yes_button: new Funday.SpriteId('menus', 'yes_button'),
        };
        SpriteLibrary.player = { ko_dead_anim01: new Funday.SpriteId('player', 'ko_dead_anim01'),
            ko_dead_anim02: new Funday.SpriteId('player', 'ko_dead_anim02'),
            ko_dead_anim03: new Funday.SpriteId('player', 'ko_dead_anim03'),
            ko_dead_anim04: new Funday.SpriteId('player', 'ko_dead_anim04'),
            ko_dead_anim05: new Funday.SpriteId('player', 'ko_dead_anim05'),
            ko_dead_anim06: new Funday.SpriteId('player', 'ko_dead_anim06'),
            ko_dead_anim07: new Funday.SpriteId('player', 'ko_dead_anim07'),
            ko_dead_anim08: new Funday.SpriteId('player', 'ko_dead_anim08'),
            ko_dead_anim09: new Funday.SpriteId('player', 'ko_dead_anim09'),
            ko_fast_run_anim01___Copy: new Funday.SpriteId('player', 'ko_fast_run_anim01 - Copy'),
            ko_fast_run_anim01: new Funday.SpriteId('player', 'ko_fast_run_anim01'),
            ko_fast_run_anim02: new Funday.SpriteId('player', 'ko_fast_run_anim02'),
            ko_fast_run_anim03: new Funday.SpriteId('player', 'ko_fast_run_anim03'),
            ko_fast_run_anim04: new Funday.SpriteId('player', 'ko_fast_run_anim04'),
            ko_fast_run_anim05: new Funday.SpriteId('player', 'ko_fast_run_anim05'),
            ko_fast_run_anim06___Copy: new Funday.SpriteId('player', 'ko_fast_run_anim06 - Copy'),
            ko_fast_run_anim06: new Funday.SpriteId('player', 'ko_fast_run_anim06'),
            ko_hit_anim01: new Funday.SpriteId('player', 'ko_hit_anim01'),
            ko_hit_anim02: new Funday.SpriteId('player', 'ko_hit_anim02'),
            ko_idle_anim01: new Funday.SpriteId('player', 'ko_idle_anim01'),
            ko_Jump_left_anim01: new Funday.SpriteId('player', 'ko_Jump_left_anim01'),
            ko_Jump_left_anim02: new Funday.SpriteId('player', 'ko_Jump_left_anim02'),
            ko_Jump_left_anim03: new Funday.SpriteId('player', 'ko_Jump_left_anim03'),
            ko_Jump_left_anim04: new Funday.SpriteId('player', 'ko_Jump_left_anim04'),
            ko_Jump_left_anim05: new Funday.SpriteId('player', 'ko_Jump_left_anim05'),
            ko_Jump_left_anim06___Copy: new Funday.SpriteId('player', 'ko_Jump_left_anim06 - Copy'),
            ko_Jump_left_anim07: new Funday.SpriteId('player', 'ko_Jump_left_anim07'),
            ko_run_anim01: new Funday.SpriteId('player', 'ko_run_anim01'),
            ko_run_anim02: new Funday.SpriteId('player', 'ko_run_anim02'),
            ko_run_anim03: new Funday.SpriteId('player', 'ko_run_anim03'),
            ko_run_anim04: new Funday.SpriteId('player', 'ko_run_anim04'),
            ko_run_anim05: new Funday.SpriteId('player', 'ko_run_anim05'),
            ko_run_anim06: new Funday.SpriteId('player', 'ko_run_anim06'),
            ko_to_tko_anim01: new Funday.SpriteId('player', 'ko_to_tko_anim01'),
            ko_to_tko_anim02: new Funday.SpriteId('player', 'ko_to_tko_anim02'),
            ko_to_tko_anim03: new Funday.SpriteId('player', 'ko_to_tko_anim03'),
            ko_to_tko_anim04: new Funday.SpriteId('player', 'ko_to_tko_anim04'),
            ko_to_tko_anim05: new Funday.SpriteId('player', 'ko_to_tko_anim05'),
            ko_to_tko_anim06: new Funday.SpriteId('player', 'ko_to_tko_anim06'),
            player_shadow___Copy: new Funday.SpriteId('player', 'player_shadow - Copy'),
            player_shadow: new Funday.SpriteId('player', 'player_shadow'),
            tko_aura_anim01: new Funday.SpriteId('player', 'tko_aura_anim01'),
            tko_aura_anim02: new Funday.SpriteId('player', 'tko_aura_anim02'),
            tko_aura_anim03: new Funday.SpriteId('player', 'tko_aura_anim03'),
            tko_run01: new Funday.SpriteId('player', 'tko_run01'),
            tko_run02: new Funday.SpriteId('player', 'tko_run02'),
            tko_run03: new Funday.SpriteId('player', 'tko_run03'),
            tko_run04: new Funday.SpriteId('player', 'tko_run04'),
            tko_to_ko_anim01: new Funday.SpriteId('player', 'tko_to_ko_anim01'),
            tko_to_ko_anim02: new Funday.SpriteId('player', 'tko_to_ko_anim02'),
            tko_to_ko_anim03: new Funday.SpriteId('player', 'tko_to_ko_anim03'),
            tko_to_ko_anim04: new Funday.SpriteId('player', 'tko_to_ko_anim04'),
        };
        SpriteLibrary.shop = { arrow_button: new Funday.SpriteId('shop', 'arrow_button'),
            ko_shop_idle_anim01: new Funday.SpriteId('shop', 'ko_shop_idle_anim01'),
            ko_shop_idle_anim02: new Funday.SpriteId('shop', 'ko_shop_idle_anim02'),
            ko_shop_idle_anim03: new Funday.SpriteId('shop', 'ko_shop_idle_anim03'),
            ko_shop_idle_anim04: new Funday.SpriteId('shop', 'ko_shop_idle_anim04'),
            ko_shop_upgrade_anim01: new Funday.SpriteId('shop', 'ko_shop_upgrade_anim01'),
            ko_shop_upgrade_anim02: new Funday.SpriteId('shop', 'ko_shop_upgrade_anim02'),
            Okkoshop: new Funday.SpriteId('shop', 'Okkoshop'),
            shop_background: new Funday.SpriteId('shop', 'shop_background'),
            shop_background02: new Funday.SpriteId('shop', 'shop_background02'),
            shop_glorb: new Funday.SpriteId('shop', 'shop_glorb'),
            shop_glorb_aura: new Funday.SpriteId('shop', 'shop_glorb_aura'),
            tutorial_box02: new Funday.SpriteId('shop', 'tutorial_box02'),
            upgrade_bar_selection_shop: new Funday.SpriteId('shop', 'upgrade_bar_selection_shop'),
            upgrade_bar_shop: new Funday.SpriteId('shop', 'upgrade_bar_shop'),
            upgrade_button: new Funday.SpriteId('shop', 'upgrade_button'),
        };
        SpriteLibrary.splash = { splash_screen_background02: new Funday.SpriteId('splash', 'splash_screen_background02'),
            start_button: new Funday.SpriteId('splash', 'start_button'),
            start_text: new Funday.SpriteId('splash', 'start_text'),
        };
        SpriteLibrary.splashbg = { splash_screen_background: new Funday.SpriteId('splashbg', 'splash_screen_background'),
        };
        OkKo.SpriteLibrary = SpriteLibrary;
    })(OkKo = Funday.OkKo || (Funday.OkKo = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class BgController {
            constructor(game, screen, powerAndScore, roadMask) {
                this.spawning = false;
                this.highscoreDist = 0;
                this.markerTravelDistance = 2400 + 150;
                this.envObjArray = [];
                this.lastSide = 1;
                this.sideChangeProbability = 0;
                this.distance = 0;
                this.lastSpawnDistance = 0;
                this.distanceToSpawn = 1000;
                this.game = game;
                this.powerAndScore = powerAndScore;
                this.highscoreDist = this.game.applyResolutionRatio(powerAndScore.getDistanceHighscore());
                this.markerTravelDistance = this.game.applyResolutionRatio(this.markerTravelDistance);
                this.roadBG = game.createSprite(game.world.centerX, this.game.height, Funday.OkKo.SpriteLibrary.bg.Road);
                this.roadBG.anchor.set(0.5, 1);
                this.roadBG.position.y += this.roadBG.height * 0.019;
                this.roadBG.scale.set(1.0, 1.02);
                this.roadBG.depth = 10;
                let skyBGGroup = game.add.group(screen);
                let skyBG = game.createSprite(game.world.centerX, this.roadBG.top, Funday.OkKo.SpriteLibrary.game.background);
                skyBG.anchor.set(0.5, 1.0);
                skyBG.position.y += this.game.applyResolutionRatio(180);
                skyBGGroup.add(skyBG);
                let clouds = game.createSprite(game.world.centerX, Math.max(0, skyBG.top) + this.game.applyResolutionRatio(50), Funday.OkKo.SpriteLibrary.game.Clouds);
                skyBGGroup.add(clouds);
                clouds.anchor.set(0.5, 0);
                skyBGGroup.cacheAsBitmap = true;
                this.shopSignPos = { x: game.world.centerX + game.applyResolutionRatio(435), y: game.responsiveDistanceFromBottom(1920 - (1920 / 2 + 230)) };
                this.shopSign = game.createSprite(this.shopSignPos.x, this.shopSignPos.y, Funday.OkKo.SpriteLibrary.bg.shop_icon);
                this.shopSign.anchor.set(0.5, 1.0);
                this.shopSignButton = game.createButton(0, game.applyResolutionRatio(-125), Funday.OkKo.SpriteLibrary.shop.arrow_button);
                let shopSignEntrace = game.createSprite(game.applyResolutionRatio(-120), game.applyResolutionRatio(70), Funday.OkKo.SpriteLibrary.bg.shop_entrance);
                shopSignEntrace.anchor.set(0, 0.5);
                this.shopSign.addChild(shopSignEntrace);
                this.shopSign.addChild(this.shopSign);
                this.shopSign.addChild(this.shopSignButton);
                this.shopSign.depth = 11;
                this.lines = new OKKO.Lines(game);
                this.lines.mask = roadMask;
                this.roadMask = roadMask;
                this.bgGroup = game.add.group();
                this.bgGroup.add(this.roadBG);
                this.bgGroup.add(this.shopSign);
                this.bgGroup.add(this.lines);
                this.spawnInitialObjs();
                window.bgController = this;
            }
            startSpawning() {
                this.spawning = true;
                this.lines.startMoving();
            }
            restart() {
                this.shopSign.revive();
                this.shopSign.x = this.shopSignPos.x;
                this.shopSign.y = this.shopSignPos.y;
                this.distance = 0;
                this.lastSpawnDistance = 0;
                this.highscoreDist = this.powerAndScore.getDistanceHighscore();
                if (this.highscoreMarker) {
                    this.highscoreMarker.spawnedThisRun = false;
                    this.highscoreMarker.kill();
                }
                this.envObjArray.forEach(obj => { obj.kill(); });
                this.game.tweens.removeAll();
                this.spawnInitialObjs();
            }
            spawnInitialObjs() {
                for (let i = 0; i < 3; i++) {
                    let envObj = this.getEnvObj();
                    envObj.randomizeSprite();
                    while (envObj.frameName == Funday.OkKo.SpriteLibrary.bg.lamp.frame)
                        envObj.randomizeSprite();
                    envObj.createShadow(this.bgGroup, this.roadMask);
                    envObj.pickSideAndPosition();
                    envObj.startTweens();
                    envObj.overHillTweener.fastForwardTweens(i / 3 + 0.1);
                }
                let xSides = [-1, -1];
                let yPositions = [700, -100];
                for (let i = 0; i < 2; i++) {
                    let envObj = this.getEnvObj();
                    envObj.randomizeSprite();
                    while (envObj.frameName == Funday.OkKo.SpriteLibrary.bg.lamp.frame)
                        envObj.randomizeSprite();
                    envObj.createShadow(this.bgGroup, this.roadMask);
                    envObj.pickSideAndPosition();
                    envObj.startTweens();
                    envObj.alpha = 1.0;
                    envObj.scale.set(0.96, 0.96);
                    envObj.position.x = this.game.world.centerX + this.game.applyResolutionRatio(envObj.xPoints[envObj.xPoints.length - 1]) * xSides[i];
                    envObj.position.y = this.game.world.centerY + this.game.responsiveDistanceFromBottom(1920 - yPositions[i]);
                    envObj.overHillTweener.topOfHillTweens();
                    envObj.overHillTweener.allTweensDone();
                    envObj.overHillTweener.pctFullSpeed.value = 1.0;
                    envObj.depth = 10 + envObj.position.y;
                }
            }
            updateDistance() {
                this.bgGroup.sort('depth', Phaser.Group.SORT_ASCENDING);
                if (!this.spawning)
                    return;
                this.distance += OKKO.Player.moveSpeed * this.game.time.physicsElapsed;
                if (this.distance - this.lastSpawnDistance > this.game.applyResolutionRatio(this.distanceToSpawn)) {
                    this.lastSpawnDistance = this.distance;
                    this.spawn();
                }
                if (this.highscoreDist - this.markerTravelDistance > 0 && this.distance > this.highscoreDist - this.markerTravelDistance) {
                    this.spawnHighscoreMarker();
                }
                this.moveShopSign();
            }
            moveShopSign() {
                if (this.shopSign.alive) {
                    this.shopSign.position.y += OKKO.Player.moveSpeed * this.game.time.physicsElapsed;
                    if (this.shopSign.position.y > this.game.world.height + this.shopSign.height)
                        this.shopSign.kill();
                }
            }
            getEnvObj() {
                let envObj = null;
                for (let obj of this.envObjArray) {
                    if (!obj.alive) {
                        envObj = obj;
                        break;
                    }
                }
                if (envObj == null) {
                    envObj = new OKKO.EnvObj(this.game, 0, 0);
                    this.bgGroup.add(envObj);
                    this.envObjArray.push(envObj);
                }
                envObj.revive();
                return envObj;
            }
            spawn() {
                let envObj = this.getEnvObj();
                envObj.randomizeSprite();
                envObj.createShadow(this.bgGroup, this.roadMask);
                if (this.distance > this.highscoreDist - this.markerTravelDistance * 1.25 && this.distance < this.highscoreDist - this.markerTravelDistance * 0.75) {
                    envObj.pickSideAndPosition(1);
                }
                else {
                    let changeSide = Math.random() > 0.5 - this.sideChangeProbability;
                    let newSide = changeSide ? this.lastSide * -1 : this.lastSide;
                    this.sideChangeProbability = changeSide ? 0 : this.sideChangeProbability + 0.25;
                    envObj.pickSideAndPosition(newSide);
                }
                this.lastSide = envObj.side;
                envObj.startTweens();
                if (envObj.frameName == Funday.OkKo.SpriteLibrary.bg.lamp.frame) {
                    let newLamp = this.getEnvObj();
                    newLamp.pickSideAndPosition(envObj.side * -1);
                    newLamp.spriteIndex = envObj.spriteIndex;
                    newLamp.key = Funday.OkKo.SpriteLibrary.bg.lamp.key;
                    newLamp.frameName = Funday.OkKo.SpriteLibrary.bg.lamp.frame;
                    newLamp.setCustomOffset(envObj.offset.x, envObj.offset.y);
                    newLamp.startTweens();
                }
                return envObj;
            }
            spawnHighscoreMarker() {
                if (this.highscoreMarker == null) {
                    this.highscoreMarker = new OKKO.HighscoreMarker(this.game, Funday.OkKo.SpriteLibrary.bg.Post, 0, 0);
                    this.highscoreMarker.key = Funday.OkKo.SpriteLibrary.bg.Post.key;
                    this.highscoreMarker.frameName = Funday.OkKo.SpriteLibrary.bg.Post.frame;
                }
                else if (this.highscoreMarker.spawnedThisRun) {
                    return;
                }
                if (!this.highscoreMarker.alive)
                    this.highscoreMarker.revive();
                this.highscoreMarker.setCustomOffset(-45, 45);
                this.highscoreMarker.pickSideAndPosition(-1);
                this.highscoreMarker.setHighscore(this.highscoreDist);
                this.highscoreMarker.startTweens();
                this.highscoreMarker.spawnedThisRun = true;
                this.highscoreMarker.depth = 0;
                this.bgGroup.add(this.highscoreMarker);
            }
        }
        OKKO.BgController = BgController;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class EnvObj extends Phaser.Sprite {
            constructor(game, x, y) {
                super(game, x, y, 'bg', 'Bush');
                this.possibleSpriteIds = [Funday.OkKo.SpriteLibrary.bg.tree01,
                    Funday.OkKo.SpriteLibrary.bg.tree02,
                    Funday.OkKo.SpriteLibrary.bg.Bush,
                    Funday.OkKo.SpriteLibrary.bg.lamp];
                this.spriteIndex = 0;
                this.spriteXOffset = [0, 0, 15, 0];
                this.spriteYOffset = [2, 6, 68, 25];
                this.offset = { x: 0.0, y: 0.0 };
                this.spawnPosX = { start: 220, midPoint: 510, end: 510 };
                this.spawnPosY = { start: 0, end: 0 };
                this.xPoints = [220, 225, 230, 250, 260, 270, 300, 330, 380, 420, 500, 510];
                this.sideSwappedXPoints = [];
                this.depth = 0;
                this.overHillTweener = new OKKO.OverHillTweener(game, this, this.topOfHillTweens.bind(this));
                this.sideSwappedXPoints = new Array(this.xPoints.length);
                this.spawnPosY.start = this.game.responsiveDistanceFromBottom(1920 - 625);
                this.spawnPosY.end = this.game.responsiveDistanceFromBottom(1920 - 615);
                this.anchor.set(0.5, 0.85);
            }
            startTweens() {
                this.overHillTweener.setYEnd(this.spawnPosY.end - this.texture.frame.height / 2 * 0.3 - this.offset.y);
                this.overHillTweener.startTweens();
            }
            topOfHillTweens() {
                this.topHillY = this.position.y;
            }
            drawMotionPath() {
                let path = this.game.add.graphics(0, 0);
                path.lineStyle(5, 0xFF00FF);
                for (let i = 0.4; i < 1.0; i += 0.01) {
                    path.lineTo(Phaser.Math.bezierInterpolation(this.sideSwappedXPoints, i), this.position.y + i * 500);
                }
                this.parent.parent.addChild(path);
            }
            pickSideAndPosition(forceSide = 0) {
                this.side = this.game.rnd.sign();
                if (forceSide != 0)
                    this.side = forceSide;
                this.position.x = this.game.world.centerX + (this.game.applyResolutionRatio(this.spawnPosX.start) + this.offset.x * 0.75) * this.side;
                this.position.y = this.spawnPosY.start;
                for (let i = 0; i < this.sideSwappedXPoints.length; i++) {
                    this.sideSwappedXPoints[i] = this.game.world.centerX + (this.game.applyResolutionRatio(this.xPoints[i]) + this.offset.x) * this.side;
                }
            }
            setCustomOffset(x, y) {
                this.offset = { x: this.game.applyResolutionRatio(x), y: this.game.applyResolutionRatio(y) };
            }
            randomizeSprite() {
                let spriteIndex = this.game.rnd.integerInRange(0, this.possibleSpriteIds.length - 1);
                this.key = this.possibleSpriteIds[spriteIndex].key;
                this.frameName = this.possibleSpriteIds[spriteIndex].frame;
                this.spriteIndex = spriteIndex;
                this.offset = { x: this.game.applyResolutionRatio(this.spriteXOffset[spriteIndex]), y: this.game.applyResolutionRatio(this.spriteYOffset[spriteIndex]) };
            }
            createShadow(shadowGroup, shadowMask) {
                if (this.spriteIndex != 0 && this.spriteIndex != 1)
                    return;
                this.shadowObj = null;
                for (let obj of shadowGroup.children) {
                    if (!obj.alive && obj instanceof OKKO.Shadow) {
                        this.shadowObj = obj;
                        break;
                    }
                }
                if (this.shadowObj == null) {
                    let shadowObj = new OKKO.Shadow(this.game, 0, 0, Funday.OkKo.SpriteLibrary.game.coin_shadow.key, Funday.OkKo.SpriteLibrary.game.coin_shadow.frame);
                    this.shadowObj = shadowObj;
                    this.shadowObj.mask = shadowMask;
                    this.shadowObj.anchor.set(0.5, 0);
                    shadowGroup.add(this.shadowObj);
                }
                else {
                    this.shadowObj.revive();
                }
                this.shadowObj.setMainObject(this);
                this.shadowObj.setScaleFactor(1);
                if (this.spriteIndex == 0)
                    this.shadowObj.setOffset(this.game.applyResolutionRatio(5), this.game.applyResolutionRatio(-350));
                if (this.spriteIndex == 1)
                    this.shadowObj.setOffset(this.game.applyResolutionRatio(-10), this.game.applyResolutionRatio(-350));
                this.shadowObj.alpha = 0;
                this.shadowObj.depth = 12;
            }
            kill() {
                this.depth = 0;
                if (this.shadowObj) {
                    this.shadowObj.kill();
                    this.shadowObj = null;
                }
                return super.kill();
            }
            update() {
                if (this.overHillTweener.isTopOfHill()) {
                    this.position.y += this.overHillTweener.getPctFullSpeed() * OKKO.Player.moveSpeed * this.game.time.physicsElapsed;
                    this.depth = 10 + this.position.y;
                    if (this.shadowObj)
                        this.shadowObj.alpha = Phaser.Math.clamp(3 * this.scale.y - 0.8, 0.0, 1.0);
                }
                else {
                    this.depth = 0;
                }
                if (this.overHillTweener.tweens[0] != null) {
                    this.followPath(this.overHillTweener.tweens[0].timeline[0].percent);
                }
                this.overHillTweener.update();
                if (this.position.y > this.game.world.height + this.height)
                    this.kill();
            }
            followPath(pct) {
                let pathX = Phaser.Math.bezierInterpolation(this.sideSwappedXPoints, pct);
                this.position.x = Phaser.Math.linearInterpolation([this.position.x, pathX], 1);
            }
        }
        OKKO.EnvObj = EnvObj;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class HighscoreMarker extends OKKO.EnvObj {
            constructor(game, spriteId, x, y) {
                super(game, x, y);
                this.spawnedThisRun = false;
                this.anchor.set(0.5, 1);
                this.spriteId = spriteId;
                this.name = "HighscoreMarker";
                let text = new Funday.UI.ShadowTextGroup(game, 'KOfont', '000', 46, 0xFFFF00, 4.5);
                text.position = new Phaser.Point(0, -285);
                text.setShadowColorAndAlpha(0x9d06eb, 1);
                this.text = text;
                this.addChild(this.text);
            }
            setHighscore(score) {
                let convertedScore = OKKO.UIController.convertGameUnitToMeters(score).toString();
                if (convertedScore.length > 5) {
                    this.text.setFontSize(36);
                }
                else if (convertedScore.length > 4) {
                    this.text.setFontSize(42);
                }
                else {
                    this.text.setFontSize(46);
                }
                this.text.setText(convertedScore);
            }
            topOfHillTweens() {
                this.text.visible = true;
            }
        }
        OKKO.HighscoreMarker = HighscoreMarker;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class Lines extends Phaser.Group {
            constructor(game) {
                super(game);
                this.moving = false;
                this.lineArray = [];
                this.depth = 100;
                for (let i = 0; i < 18; i++) {
                    this.lineArray[i] = new Line(game, game.world.centerX, 0 + this.game.responsiveDistanceFromBottom(1920 - i * 10), Funday.OkKo.SpriteLibrary.bg.Trafic_Line.key, Funday.OkKo.SpriteLibrary.bg.Trafic_Line.frame);
                    this.lineArray[i].anchor.set(0.5, 1);
                    if (i != 0) {
                        this.lineArray[i].lineBehind = this.lineArray[i - 1];
                    }
                    this.add(this.lineArray[i]);
                }
                this.backLine = this.lineArray[0];
                this.frontLine = this.lineArray[this.lineArray.length - 1];
                this.frontLine.position.y = this.game.world.height;
                this.positionLines();
            }
            startMoving() {
                this.moving = true;
            }
            calculateFactor(lineInFront) {
                return Math.min(1, (Math.max(lineInFront.position.y, this.game.responsiveDistanceFromBottom(1920 - 520)) - this.game.responsiveDistanceFromBottom(1920 - 500)) / this.game.responsiveDistanceFromBottom(1920 - (1000 - 520)));
            }
            positionAndScaleLine(line, lineInFront) {
                let factor = this.calculateFactor(lineInFront);
                line.position.y = Math.max(100, lineInFront.position.y - lineInFront.height * 0.9 - this.game.applyResolutionRatio(50) * factor);
                let desiredScale = { x: 0.4 + factor * 0.6, y: 0.1 + (factor * 0.6) };
                line.scale.set(desiredScale.x, desiredScale.y);
            }
            update() {
                if (!this.moving)
                    return;
                this.positionLines();
            }
            preUpdate() {
                if (this.frontLine.position.y > this.game.world.height + this.frontLine.height) {
                    let oldFrontLine = this.frontLine;
                    this.positionAndScaleLine(oldFrontLine, this.backLine);
                    this.backLine.lineBehind = oldFrontLine;
                    this.backLine = oldFrontLine;
                    this.frontLine = oldFrontLine.lineBehind;
                    oldFrontLine.lineBehind = null;
                }
            }
            positionLines() {
                this.frontLine.position.y += OKKO.Player.moveSpeed * this.game.time.physicsElapsed;
                let curLine = this.frontLine;
                while (curLine.lineBehind != null) {
                    this.positionAndScaleLine(curLine.lineBehind, curLine);
                    curLine = curLine.lineBehind;
                }
            }
        }
        OKKO.Lines = Lines;
        class Line extends Phaser.Sprite {
            constructor() {
                super(...arguments);
                this.lineBehind = null;
            }
        }
        OKKO.Line = Line;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class Shadow extends Phaser.Sprite {
            constructor() {
                super(...arguments);
                this.offset = { x: 0, y: 0 };
                this.scaleFactor = 1;
                this.depth = 0;
            }
            setMainObject(sprite) {
                this.mainObj = sprite;
            }
            setShadowProperties(properties) {
                this.scaleFactor = properties.scaleFactor;
                this.offsetX = properties.offsetX;
                this.offsetY = properties.offsetY;
            }
            setScaleFactor(num) {
                this.scaleFactor = num;
            }
            setOffset(x, y) {
                this.offset.x = x;
                this.offset.y = y;
            }
            update() {
                this.scale.set(this.mainObj.scale.x * this.scaleFactor, this.mainObj.scale.y * this.scaleFactor);
                this.position.x = this.mainObj.position.x + this.offset.x * this.scale.x;
                this.position.y = this.mainObj.position.y + this.mainObj.height / 2 + this.offset.y * this.mainObj.scale.y;
            }
            postUpdate() {
                this.scale.set(this.mainObj.scale.x * this.scaleFactor, this.mainObj.scale.y * this.scaleFactor);
                this.position.x = this.mainObj.position.x + this.offset.x * this.scale.x;
                this.position.y = this.mainObj.position.y + this.mainObj.height / 2 + this.offset.y * this.mainObj.scale.y;
            }
        }
        OKKO.Shadow = Shadow;
        class ShadowProperties {
            constructor(scaleFactor, offsetX, offsetY) {
                this.scaleFactor = 1.0;
                this.offsetX = 0.0;
                this.offsetY = 0.0;
                this.scaleFactor = scaleFactor;
                this.offsetX = offsetX;
                this.offsetY = offsetY;
            }
        }
        OKKO.ShadowProperties = ShadowProperties;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class AchievementController {
            constructor(game, cnSDK) {
                this.verbose = true;
                this.game = game;
                this.cnSDK = cnSDK;
                this.achievements = {};
                this.metaData = {};
            }
            init() {
                this.loadAchievements();
            }
            loadAchievements() {
                if (!this.cnSDK)
                    return;
                achievementIDs.list.forEach((id) => {
                    let loadedAchiev = this.cnSDK.achievements.find((achievement) => achievement.id === id);
                    if (loadedAchiev != undefined) {
                        this.achievements[id] = new Funday.Service.Achievement.Achievement(id, loadedAchiev.timesRequired);
                        this.metaData[id] = new Funday.Service.Achievement.AchievementMetadata(id, loadedAchiev.title, loadedAchiev.description, null);
                        this.achievements[id].progress = loadedAchiev.timesAcquired;
                        this.achievements[id].hasBeenAwarded = loadedAchiev.completed;
                        if (this.verbose)
                            console.log("[Achievement Controller] Loaded achievement ", loadedAchiev.title, ". Progress: " + this.achievements[id].progress + "/" + this.achievements[id].maxProgress, "has been awarded =", this.achievements[id].hasBeenAwarded);
                    }
                    else {
                        this.achievements[id] = undefined;
                        this.metaData[id] = undefined;
                        if (this.verbose)
                            console.log("[Achievement Controller] Could not load achievement with id: " + id);
                    }
                });
            }
            debugPrintAchievements() {
                for (let id in this.achievements) {
                    console.log("[Achievement " + id + "] " + this.achievements[id].progress + "/" + this.achievements[id].maxProgress + " has been awarded = " + this.achievements[id].hasBeenAwarded);
                }
                ;
            }
            saveProgress() {
                for (let id in this.achievements) {
                    this.game.services.achievement.updateProgress(this.achievements[id], this.achievements[id].progress);
                }
                ;
                if (this.verbose)
                    console.log("[Achievement Controller] Saved achievement progress");
            }
            resetProgress() {
                for (let id in this.achievements) {
                    this.game.services.achievement.updateProgress(this.achievements[id], 0);
                }
                ;
            }
            onRunCompleted(distance) {
                if (this.achievements[achievementIDs.distance1000] == undefined) {
                    if (this.verbose)
                        console.log("Achievement have not been initialized. Trying to reload...");
                    this.loadAchievements();
                    return;
                }
                distance = OKKO.UIController.convertGameUnitToMeters(distance);
                if (distance > this.achievements[achievementIDs.distance1000].progress) {
                    this.achievements[achievementIDs.distance1000].progress = distance;
                }
                this.checkForAchivementUnlock();
                this.saveProgress();
            }
            onGlorbCollected() {
                if (this.achievements[achievementIDs.glorbs50] == undefined)
                    return;
                this.achievements[achievementIDs.glorbs50].progress += 1;
                this.checkForAchivementUnlock();
            }
            onRobotSmash() {
                if (this.achievements[achievementIDs.smash100] == undefined)
                    return;
                this.achievements[achievementIDs.smash100].progress += 1;
                this.checkForAchivementUnlock();
            }
            onAvoidRobot() {
                if (this.achievements[achievementIDs.avoid50streak] == undefined)
                    return;
                this.achievements[achievementIDs.avoid50streak].progress += 1;
                this.checkForAchivementUnlock();
            }
            onFullyUpgraded() {
                if (this.achievements[achievementIDs.maxglorbmeter] == undefined)
                    return;
                this.achievements[achievementIDs.maxglorbmeter].progress += 1;
                this.checkForAchivementUnlock();
            }
            onHitRobotAndLoseStreak() {
                if (this.achievements[achievementIDs.avoid50streak] == undefined)
                    return;
                this.achievements[achievementIDs.avoid50streak].progress = 0;
            }
            checkForAchivementUnlock() {
                for (let id in this.achievements) {
                    const achievement = this.achievements[id];
                    if (achievement.shouldBeAwarded()) {
                        this.game.services.achievement.updateProgress(achievement, achievement.progress);
                    }
                }
            }
        }
        OKKO.AchievementController = AchievementController;
        class achievementIDs {
        }
        achievementIDs.distance1000 = '48d7ae48-f70c-48d3-b141-3a6c859c2e1d';
        achievementIDs.glorbs50 = 'd8ca4008-e6ca-4838-a735-c73fa37bebb4';
        achievementIDs.maxglorbmeter = 'b6159d31-08e3-4373-aaa6-7b5970bda241';
        achievementIDs.smash100 = '662a249f-5253-4828-85d3-6b3e8d30e326';
        achievementIDs.avoid50streak = '4691f1e4-8299-4084-a61d-07c5bb8cbc77';
        achievementIDs.list = [achievementIDs.distance1000, achievementIDs.glorbs50, achievementIDs.maxglorbmeter, achievementIDs.smash100, achievementIDs.avoid50streak];
        OKKO.achievementIDs = achievementIDs;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class DifficultyController {
            constructor(player) {
                this.player = player;
                this.reset();
            }
            advanceDifficulty() {
                this.totalSpawns += 2;
                this.maxEnemySideChanges += 1;
                this.spawnDistance = this.spawnDistance <= 200 ? 200 : this.spawnDistance - 10;
                this.laneSwitcherProbability = this.laneSwitcherProbability > 0.25 ? 0.25 : this.laneSwitcherProbability + 0.05;
                this.playerSpeed += 50;
                this.tkoSpeed += 50;
                this.updatePlayerSpeed();
                if (this.spawnDistance < 150)
                    console.log("Warning - spawn distance probably too low!");
            }
            updatePlayerSpeed() {
                if (this.player != null) {
                    this.player.baseSpeed = this.playerSpeed;
                    this.player.baseTKOSpeed = this.tkoSpeed;
                    this.player.updateSpeed();
                }
            }
            reset() {
                this.spawnDistance = 400;
                this.totalSpawns = 7;
                this.maxEnemySideChanges = 1;
                this.laneSwitcherProbability = 0.0;
                this.playerSpeed = 700;
                this.tkoSpeed = 1200;
                if (this.player != null) {
                    this.player.baseSpeed = this.playerSpeed;
                    this.player.baseTKOSpeed = this.tkoSpeed;
                }
            }
        }
        OKKO.DifficultyController = DifficultyController;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class LevelController {
            constructor(game, gameScreen, player, spawner, bgSpawner, ui) {
                this.paused = false;
                this.secondChanceUsed = false;
                this.headStart = undefined;
                this.game = game;
                this.gameScreen = gameScreen;
                this.player = player;
                this.spawner = spawner;
                this.bgController = bgSpawner;
                this.ui = ui;
                window.levelController = this;
                return this;
            }
            isPaused() {
                return this.paused;
            }
            askForHeadStart() {
                if (this.headStart == undefined) {
                    this.ui.showYesNoPrompt(this.ui.headstartPrompt, () => {
                        this.game.services.ads.showAd().then(() => {
                            this.getHeadStart(true);
                        });
                    }, () => { this.getHeadStart(false); }, this, this);
                }
            }
            startLevel() {
                this.startSystems();
                this.spawner.spawning = false;
                this.game.time.events.add(500, () => {
                    this.askForHeadStart();
                    this.player.inputController.disable();
                });
                this.game.time.events.add(1500, () => {
                    this.spawner.spawning = true;
                });
                this.game.time.events.add(4000, () => {
                    this.afterHeadStart();
                });
            }
            startSystems() {
                this.paused = false;
                this.spawner.startSpawning();
                this.bgController.startSpawning();
                this.player.inputController.enable();
                this.player.restart();
                this.player.startMoving();
                this.player.animController.resume();
                this.game.tweens.resumeAll();
                this.game.time.events.resume();
                this.spawner.spawnGroup.resumeAllAnimationsInGroup();
            }
            resumeSystems() {
                this.paused = false;
                this.game.tweens.resumeAll();
                this.game.time.events.resume();
                this.game.soundRepo.resumeSFX();
                this.player.inputController.enable();
                this.player.animController.resume();
                OKKO.Player.moveSpeed = this.pausedMoveSpeed;
                this.spawner.spawnGroup.resumeAllAnimationsInGroup();
            }
            pauseSystems() {
                this.paused = true;
                this.game.tweens.pauseAll();
                this.game.time.events.pause();
                this.game.soundRepo.pauseSFX();
                this.player.inputController.disable();
                this.player.animController.pause();
                this.pausedMoveSpeed = OKKO.Player.moveSpeed;
                OKKO.Player.moveSpeed = 0;
                this.spawner.spawnGroup.pauseAllAnimationsInGroup();
            }
            restartLevel() {
                let animation = this.game.services.animation;
                let duration = 500;
                let transitionOutAnimation = animation.fadeToBlack(duration);
                let transitionInAnimation = animation.fadeFromBlack(duration);
                animation.queue([transitionOutAnimation, transitionInAnimation]).play();
                this.game.screenManager.blockInput();
                this.ui.hideCurrentPrompt();
                transitionOutAnimation.onComplete.addOnce(() => {
                    this.game.tweens.removeAll();
                    this.game.time.removeAll();
                    this.player.restart();
                    this.spawner.restart();
                    this.ui.animator.clear();
                    this.bgController.restart();
                    this.gameScreen.startGame();
                    this.game.screenManager.unblockInput();
                });
            }
            loseAndCheckForSecondChance() {
                this.player.powerAndScore.checkAndSaveDistanceHighscore(this.spawner.getDistance());
                this.player.powerAndScore.saveDistanceSessionScore(this.spawner.getDistance());
                this.player.powerAndScore.saveCoins();
                this.game.achievements.onRunCompleted(this.spawner.getDistance());
                this.deathEvent = null;
                if (this.secondChanceUsed) {
                    this.reallyLose();
                }
                else {
                    this.ui.showYesNoPrompt(this.ui.reviveAdPrompt, this.secondChance, this.reallyLose, this, this);
                }
            }
            reallyLose() {
                if (this.ui.currentPrompt != null) {
                    this.ui.hideCurrentPrompt().onComplete.addOnce(() => {
                        this.ui.showGameOver(this.restartLevel, this);
                    });
                }
                else {
                    this.ui.showGameOver(this.restartLevel, this);
                }
                this.secondChanceUsed = false;
            }
            getHeadStart(headStart) {
                this.headStart = headStart;
                this.ui.hideCurrentPrompt();
                this.player.inputController.enable();
                this.spawner.spawning = true;
            }
            afterHeadStart() {
                if (this.headStart == true) {
                    this.player.powerAndScore.onHeadStart();
                    this.ui.powerBar.updateSize();
                    this.player.becomeTKO();
                }
                ;
                if (this.headStart == undefined) {
                    this.ui.hideCurrentPrompt();
                }
                this.headStart = undefined;
                this.player.inputController.enable();
            }
            secondChance() {
                this.game.services.ads.showAd().then(() => {
                    this.secondChanceUsed = true;
                    this.ui.hideCurrentPrompt().onComplete.addOnce(() => {
                        this.startSystems();
                        this.player.becomeInvulnerable(2500);
                        this.spawner.spawnGroup.blowUpAllEnemies();
                    });
                });
            }
            checkCollisions() {
                this.game.physics.arcade.overlap(this.player, this.spawner.spawnGroup, this.playerCollideWithSpawnGroup, null, this);
            }
            playerCollideWithSpawnGroup(player, obj) {
                player.onCollision(obj);
                obj.onCollisionWithPlayer(player);
                if (this.player.health <= 0 && this.deathEvent == null) {
                    this.deathEvent = this.game.time.events.add(600, this.loseAndCheckForSecondChance, this);
                }
            }
        }
        OKKO.LevelController = LevelController;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class Spawner {
            constructor(game) {
                this.distance = 0;
                this.lastSpawnDistance = 0;
                this.spawnCalled = 0;
                this.waveNum = 0;
                this.game = game;
                this.shadowGroup = this.game.add.group();
                this.spawnGroup = new OKKO.WaveGroup(game);
                this.FXGroup = this.game.add.group();
                this.createMaskBGs();
            }
            setCurrentWave(wave) {
                this.currentWave = wave;
            }
            createMaskBGs() {
                let skyMaskPoints = [{ x: 0, y: 588 }, { x: 114, y: 555 }, { x: 282, y: 523 }, { x: 547, y: 502 },
                    { x: 800, y: 523 }, { x: 970, y: 555 }, { x: 1080, y: 584 }, { x: 1080, y: 0 }, { x: 0, y: 0 }];
                skyMaskPoints.forEach(p => {
                    p.x = this.game.applyResolutionRatio(p.x) + this.game.world.centerX - this.game.applyResolutionRatio(1080 / 2);
                    p.y = this.game.responsiveDistanceFromBottom(1920 - p.y);
                });
                this.skyMask = this.game.add.graphics(0, -5);
                this.skyMask.beginFill(0xFF00FF, 1);
                this.skyMask.drawPolygon(skyMaskPoints);
                this.skyMask.endFill();
                this.skyMask.visible = false;
                let roadMaskPoints = [{ x: -250, y: 650 }, { x: 0, y: 588 }, { x: 114, y: 555 }, { x: 282, y: 523 }, { x: 547, y: 502 },
                    { x: 800, y: 523 }, { x: 970, y: 555 }, { x: 1080, y: 584 }, { x: 1080 + 250, y: 646 }, { x: 1080 + 250, y: 1920 }, { x: -250, y: 1920 }];
                roadMaskPoints.forEach(p => {
                    p.x = this.game.applyResolutionRatio(p.x) + this.game.world.centerX - this.game.applyResolutionRatio(1080 / 2);
                    p.y = this.game.responsiveDistanceFromBottom(1920 - p.y);
                });
                this.roadMask = this.game.add.graphics(0, 0);
                this.roadMask.beginFill(0xFF00FF, 1);
                this.roadMask.drawPolygon(roadMaskPoints);
                this.roadMask.endFill();
                this.roadMask.visible = true;
            }
            restart() {
                this.spawning = false;
                this.distance = 0;
                this.lastSpawnDistance = 0;
                this.waveNum = 0;
                this.spawnGroup.killAll();
                this.shadowGroup.killAll();
                this.FXGroup.killAll();
                this.currentWave.reset();
            }
            startSpawning() {
                this.waveNum += 1;
                this.spawning = true;
            }
            updateDistance() {
                this.distance += OKKO.Player.moveSpeed * this.game.time.physicsElapsed;
                this.spawnGroup.sort('z', Phaser.Group.SORT_ASCENDING);
                if (!this.spawning)
                    return;
                if (this.distance - this.lastSpawnDistance > this.game.applyResolutionRatio(this.currentWave.spawnDistance)) {
                    this.lastSpawnDistance = this.distance;
                    this.spawn();
                }
            }
            getDistance() {
                return this.distance;
            }
            spawn() {
                if (this.currentWave.spawnCalled >= this.currentWave.totalSpawns) {
                    this.nextWave();
                    return;
                }
                this.currentWave.spawn();
            }
            nextWave() {
                this.currentWave.nextWave();
                this.spawning = false;
                let waitEvent = this.game.time.events.add(1000, this.startSpawning, this);
            }
            spawnCollectible(spriteId, x, y, obj) {
                let collectible;
                collectible = this.spawnGroup.getOrCreateGameObj(spriteId, x, y, obj);
                collectible.mask = this.skyMask;
                collectible.shadowMask = this.roadMask;
                collectible.createShadow(this.shadowGroup);
                return collectible;
            }
            spawnEnemy(spriteId, x, y, obj) {
                let enemy;
                enemy = this.spawnGroup.getOrCreateGameObj(spriteId, x, y, obj);
                enemy.mask = this.skyMask;
                enemy.shadowMask = this.roadMask;
                enemy.setFXGroup(this.FXGroup);
                enemy.createShadow(this.shadowGroup);
                return enemy;
            }
        }
        OKKO.Spawner = Spawner;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class GameObj extends Phaser.Sprite {
            constructor(game, spriteId, x, y) {
                super(game, x, y, spriteId.key, spriteId.frame);
                this.collided = false;
                this.currentSpeed = 0;
                this.shadowObj = null;
                this.currentSpeed = OKKO.Player.moveSpeed;
                this.anchor.set(0.5, 1);
                game.physics.arcade.enable(this);
                this.overHillTweener = new OKKO.OverHillTweener(game, this, this.topOfHillTweens.bind(this));
                this.startTweens();
            }
            startTweens() {
                this.tweenYEnd = this.game.responsiveDistanceFromBottom(1412);
                this.overHillTweener.setYEnd(this.tweenYEnd);
                this.overHillTweener.startTweens();
                let posTweenX = this.game.add.tween(this.position).to({ x: this.position.x + this.game.applyResolutionRatio(120) * this.overHillTweener.side }, this.overHillTweener.tweenDuration * 1, Phaser.Easing.Sinusoidal.In, true);
                this.overHillTweener.addTween(posTweenX);
            }
            topOfHillTweens() {
                this.mask = null;
                if (this.shadowObj) {
                    this.shadowObj.alpha = 0;
                    this.shadowObj.visible = true;
                    this.game.add.tween(this.shadowObj).to({ alpha: 1.0 }, 200, Phaser.Easing.Linear.None, true);
                }
            }
            onCollisionWithPlayer(player) {
                if (!this.collided) {
                    this.collided = true;
                    this.playHitAnimation();
                }
            }
            onSpeedChange() {
            }
            playHitAnimation() {
                this.customKill();
            }
            customKill() {
                this.alive = false;
                this.visible = false;
                this.overHillTweener.allTweensDone();
                this.body.reset(0, 0);
                if (this.shadowObj)
                    this.shadowObj.kill();
            }
            customRevive() {
                this.startTweens();
                this.alive = true;
                this.visible = true;
                this.collided = false;
            }
            createShadow(shadowGroup) {
                this.shadowObj = shadowGroup.getFirstDead(false);
                if (this.shadowObj == null) {
                    let shadowObj = new OKKO.Shadow(this.game, 0, 0, Funday.OkKo.SpriteLibrary.game.coin_shadow.key, Funday.OkKo.SpriteLibrary.game.coin_shadow.frame);
                    this.shadowObj = shadowObj;
                    this.shadowObj.mask = this.shadowMask;
                    this.shadowObj.anchor.set(0.5, 0.5);
                    shadowGroup.add(this.shadowObj);
                }
                else {
                    this.shadowObj.revive();
                }
                this.shadowObj.setMainObject(this);
                this.shadowObj.setScaleFactor(this.shadowProperties.scaleFactor);
                this.shadowObj.setOffset(this.game.applyResolutionRatio(this.shadowProperties.offsetX), this.game.applyResolutionRatio(this.shadowProperties.offsetY));
                this.shadowObj.visible = false;
            }
            revive(health) {
                this.collided = false;
                return super.revive(health);
            }
            update() {
                if (!this.alive) {
                    if (this.exists)
                        this.exists = false;
                    return;
                }
                if (this.collided)
                    return;
                if (this.overHillTweener.isTopOfHill()) {
                    this.z = this.position.y;
                    this.position.y += this.overHillTweener.getPctFullSpeed() * OKKO.Player.moveSpeed * this.game.time.physicsElapsed;
                    if (this.position.y > this.game.world.height + this.height)
                        this.customKill();
                }
                else {
                    this.z = 0;
                }
                if (this.currentSpeed != OKKO.Player.moveSpeed) {
                    this.onSpeedChange();
                    this.currentSpeed = OKKO.Player.moveSpeed;
                }
            }
        }
        OKKO.GameObj = GameObj;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class AbstractEnemy extends OKKO.GameObj {
            constructor(game, spriteId, x, y) {
                super(game, spriteId, x, y);
                this.name = "Enemy";
                this.body.setCircle(game.applyResolutionRatio(80), game.applyResolutionRatio(85), game.applyResolutionRatio(170));
                this.anchor.set(0.5, 1);
                this.shadowProperties = new OKKO.ShadowProperties(0.78, 0, -198);
                this.moveSound = this.game.soundRepo.onJethroMoving();
                this.moveSound.volume = 0.0;
            }
            setFXGroup(group) {
                this.FXGroup = group;
            }
            onCollisionWithPlayer(player) {
                if (!this.collided) {
                    this.collided = true;
                    this.game.time.events.add(100, this.playHitAnimation, this);
                    this.shake = true;
                    this.shakePos = this.position;
                    this.shakeIntensity = 25;
                }
            }
            playHitAnimation() {
                if (Math.abs(this.scale.x) < 0.3) {
                    return;
                }
                this.smoke = this.FXGroup.getFirstDead(false);
                if (this.smoke == null) {
                    this.smoke = new OKKO.FXSprite(this.game, Funday.OkKo.SpriteLibrary.game.explosion_fx01, 'explosion_fx', 1, 7, 10);
                    this.FXGroup.add(this.smoke);
                }
                this.smoke.scale = this.scale;
                this.smoke.reset(this.position.x, this.position.y - 60 * this.scale.y);
                this.smoke.moveWithPlayerSpeed(0.75 * this.scale.y);
                this.customKill();
            }
            onSpeedChange() {
                if (this.animations.currentAnim.name == "run" && !this.animations.paused) {
                    this.animations.currentAnim.speed = 12 * (OKKO.Player.moveSpeed / 700);
                    this.animations.currentAnim.play();
                }
            }
            customRevive() {
                this.moveSound = this.game.soundRepo.onJethroMoving();
                this.moveSound.volume = 0.0;
                this.shake = false;
                super.customRevive();
            }
            customKill() {
                this.moveSound.loop = false;
                this.moveSound.stop();
                this.moveSound = null;
                if (this.bottom > this.game.height) {
                    this.game.achievements.onAvoidRobot();
                }
                super.customKill();
            }
            update() {
                super.update();
                if (this.shake) {
                    this.shakeIntensity = Math.max(this.shakeIntensity - 1, 0);
                    this.position.x = Phaser.Math.linearInterpolation([this.position.x, this.shakePos.x + Math.random() * this.shakeIntensity * this.game.rnd.sign()], 0.35);
                    this.position.y = Phaser.Math.linearInterpolation([this.position.y, this.shakePos.y + Math.random() * this.shakeIntensity * this.game.rnd.sign()], 0.35);
                }
                if (this.moveSound != null) {
                    let maxVolumePosition = (this.game.world.height - 800);
                    let distToPlayer = this.position.y - maxVolumePosition;
                    this.moveSound.volume = 1.0 - Phaser.Math.clamp(Math.abs(distToPlayer) / 800, 0.5, 1);
                    this.moveSound.volume *= OKKO.Player.moveSpeed == 0 ? 0 : 1;
                }
            }
        }
        OKKO.AbstractEnemy = AbstractEnemy;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class Coin extends OKKO.GameObj {
            constructor(game, spriteId, x, y) {
                super(game, spriteId, x, y);
                this.value = 1;
                this.name = "Coin";
                this.anchor.set(0.5, 2);
                this.shadowProperties = new OKKO.ShadowProperties(game.applyResolutionRatio(0.35), 0, game.applyResolutionRatio(-50));
            }
            playHitAnimation() {
                this.game.soundRepo.onCoinPickup();
                this.game.add.tween(this).to({ alpha: 0 }, 500, Phaser.Easing.Cubic.Out, true);
                this.game.add.tween(this.position).to({ y: this.position.y - this.game.applyResolutionRatio(75) }, 500, Phaser.Easing.Cubic.Out, true);
                let pickupTween = this.game.add.tween(this.scale).to({ x: 1.5, y: 1.5 }, 200, "Linear", true);
                pickupTween.onComplete.add(this.customKill, this);
            }
            customRevive() {
                super.customRevive();
                this.alpha = 1;
            }
        }
        OKKO.Coin = Coin;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class Enemy extends OKKO.AbstractEnemy {
            constructor(game, spriteId, x, y) {
                super(game, spriteId, x, y);
                this.animations.add('run', Phaser.Animation.generateFrameNames('jethro_run_anim', 1, 6, '', 2), 12, true).play();
            }
        }
        OKKO.Enemy = Enemy;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class Glorb extends OKKO.GameObj {
            constructor(game, spriteId, x, y) {
                super(game, spriteId, x, y);
                this.value = 10;
                this.name = "Glorb";
                this.anchor.set(0.5, 2);
                this.shadowProperties = new OKKO.ShadowProperties(0.35, 0, -50);
                this.aura = new Phaser.Sprite(game, game.applyResolutionRatio(-0.5), game.applyResolutionRatio(-106), Funday.OkKo.SpriteLibrary.game.glorb_aura.key, Funday.OkKo.SpriteLibrary.game.glorb_aura.frame);
                this.aura.anchor.set(102 / 234, 125 / 234);
                this.aura.rotation = Math.random() * Math.PI * 2;
                this.addChild(this.aura);
                let glorb = new Phaser.Sprite(game, 0, 0, Funday.OkKo.SpriteLibrary.game.glorb.key, Funday.OkKo.SpriteLibrary.game.glorb.frame);
                glorb.anchor.set(0.5, 2);
                this.addChild(glorb);
            }
            playHitAnimation() {
                this.game.soundRepo.onGlorbPickup();
                this.game.add.tween(this).to({ alpha: 0 }, 200, Phaser.Easing.Cubic.Out, true);
                this.game.add.tween(this.position).to({ y: this.position.y - this.game.applyResolutionRatio(50) }, 200, Phaser.Easing.Cubic.Out, true);
                let pickupTween = this.game.add.tween(this.scale).to({ x: 1.5, y: 1.5 }, 200, "Linear", true);
                pickupTween.onComplete.add(this.customKill, this);
            }
            customRevive() {
                super.customRevive();
                this.alpha = 1;
            }
            update() {
                super.update();
                this.aura.rotation += 0.5 * this.game.time.physicsElapsed;
            }
        }
        OKKO.Glorb = Glorb;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class LaneSwitcherEnemy extends OKKO.AbstractEnemy {
            constructor(game, spriteId, x, y) {
                super(game, spriteId, x, y);
                this.switched = false;
                this.animations.add('run', Phaser.Animation.generateFrameNames('jethro_run_anim', 1, 6, '', 2), 12, true).play();
                this.animations.add('switch', Phaser.Animation.generateFrameNames('jethro_jump_anim', 1, 6, '', 2), 12, false);
                this.animations.play('run');
                this.body.setCircle(game.applyResolutionRatio(80), game.applyResolutionRatio(85), game.applyResolutionRatio(170));
                this.tintSprite = game.add.sprite(0, 0, spriteId.key, spriteId.frame);
                this.tintSprite.anchor.set(this.anchor.x, this.anchor.y);
                this.addChild(this.tintSprite);
                this.tintSprite.blendMode = PIXI.blendModes.HUE;
                this.tintSprite.tint = 0xFF0000;
                this.roadCenterPos = this.game.responsiveDistanceFromBottom(1920 - 1920 / 2);
                window.laneSwitcher = this;
            }
            startColorTweens() {
            }
            pauseColorTweens() {
            }
            resumeColorTweens() {
            }
            customRevive() {
                super.customRevive();
                this.switched = false;
            }
            update() {
                super.update();
                if (this.position.y > this.roadCenterPos && !this.switched) {
                    let newSide = this.position.x > this.game.world.centerX ? -1 : 1;
                    this.animations.play('switch').onComplete.addOnce(() => this.animations.play('run'));
                    this.game.add.tween(this.position).to({ x: this.game.world.centerX + this.game.applyResolutionRatio(200) * newSide }, 200, Phaser.Easing.Cubic.Out, true);
                    this.switched = true;
                    this.game.soundRepo.onJethroSwitch();
                }
                this.tintSprite.frame = this.frame;
            }
            customKill() {
                super.customKill();
            }
        }
        OKKO.LaneSwitcherEnemy = LaneSwitcherEnemy;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class Player extends Phaser.Sprite {
            constructor(game, x, y) {
                super(game, x, y, Funday.OkKo.SpriteLibrary.player.ko_run_anim01.key, Funday.OkKo.SpriteLibrary.player.ko_run_anim01.frame);
                this.baseSpeed = 0;
                this.baseTKOSpeed = 0;
                this.invulnerability = false;
                this.vulnerableTime = 5000;
                this.state = PlayerState.normal;
                this.game = game;
                this.health = 1;
                game.physics.arcade.enable(this);
                this.body.setCircle(game.applyResolutionRatio(60), game.applyResolutionRatio(25), game.applyResolutionRatio(100));
                this.anchor.set(0.5, 0.5);
                this.shadow = new OKKO.Shadow(game, 0, 0, Funday.OkKo.SpriteLibrary.player.player_shadow.key, Funday.OkKo.SpriteLibrary.player.player_shadow.frame);
                this.shadow.setMainObject(this);
                this.shadow.setOffset(0, this.game.applyResolutionRatio(-20));
                this.shadow.anchor.set(0.5);
                this.shadow.setScaleFactor(0.65);
                this.fxContainer = new OKKO.PlayerFXContainer(game, this);
                this.powerAndScore = new OKKO.PlayerPowerAndScore(game);
                this.inputController = new OKKO.PlayerInput(game, this);
                this.animController = new OKKO.PlayerAnimation(game, this, this.fxContainer);
                this.restart();
                window.player = this;
                window.Player = Player;
            }
            startMoving() {
                Player.moveSpeed = this.game.applyResolutionRatio(this.baseSpeed);
            }
            restart() {
                this.animController.play(OKKO.AnimationState.run);
                this.powerAndScore.restart();
                this.inputController.restart();
                this.health = 2;
                this.tint = 0xFFFFFF;
                this.invulnerability = false;
            }
            updateSpeed() {
                if (this.state == PlayerState.normal) {
                    Player.moveSpeed = this.game.applyResolutionRatio(this.baseSpeed);
                }
                else {
                    Player.moveSpeed = this.game.applyResolutionRatio(this.baseTKOSpeed);
                }
            }
            onCollision(obj) {
                if (obj.collided)
                    return;
                if (obj.name == "Enemy" && this.state != PlayerState.TKO && this.invulnerability == false) {
                    this.health -= 1;
                    this.game.camera.shake(0.015, 400);
                    this.game.soundRepo.onTakeDamage(this.health);
                    this.game.achievements.onHitRobotAndLoseStreak();
                    if (this.health > 0) {
                        this.animController.flash(this.vulnerableTime, 0xFF0000, this.notVulnerable.bind(this));
                        this.animController.play(OKKO.AnimationState.hit, 2);
                    }
                    else {
                        let slowDownTween = this.game.add.tween(Player).to({ moveSpeed: 0 }, 300, Phaser.Easing.Cubic.Out, true, 0, 0, false);
                        this.animController.play(OKKO.AnimationState.dead);
                        this.animController.removeFlash();
                        this.inputController.disable();
                    }
                }
                else if (obj.name == "Enemy" && this.state == PlayerState.TKO) {
                    this.animController.showHitFX();
                    this.game.soundRepo.onPlayerPunch();
                    this.game.achievements.onRobotSmash();
                    if (this.tkoSpeedUpTween != null)
                        this.tkoSpeedUpTween.stop();
                    Player.moveSpeed = this.game.applyResolutionRatio(this.baseTKOSpeed);
                }
                if (obj.name == "Glorb") {
                    this.powerAndScore.addPower(obj.value);
                    if (this.powerAndScore.getPower() >= this.powerAndScore.getMaxPower()) {
                        this.becomeTKO();
                    }
                }
                if (obj.name == "Coin") {
                    this.powerAndScore.addCoin(obj.value);
                }
            }
            notVulnerable() {
                this.health = 2;
                this.tint = 0xFFFFFF;
            }
            inVulnerabilityOver() {
                this.invulnerability = false;
                this.tint = 0xFFFFFF;
            }
            becomeTKO() {
                if (this.state == PlayerState.TKO)
                    return;
                this.state = PlayerState.TKO;
                this.animController.play(OKKO.AnimationState.tko_transform);
                this.animController.removeFlash();
                this.game.soundRepo.onPlayerTKOTransform();
                this.game.camera.shake(0.01, 200);
                this.parent.addChildAt(this.fxContainer, this.parent.getChildIndex(this) - 1);
                this.fxContainer.showFX();
                this.animations.currentAnim.onComplete.addOnce(() => {
                    Player.moveSpeed = this.game.applyResolutionRatio(this.baseTKOSpeed);
                    this.scale.x = 1;
                });
            }
            becomeNormalKO() {
                this.state = PlayerState.normal;
                Player.moveSpeed = this.game.applyResolutionRatio(this.baseSpeed);
                this.invulnerability = true;
                this.animController.play(OKKO.AnimationState.tko_to_ko);
                this.game.time.events.add(300, () => {
                    this.becomeInvulnerable(800);
                });
                this.fxContainer.hideFX();
            }
            becomeInvulnerable(time) {
                this.invulnerability = true;
                this.animController.flash(time, 0x9752de, this.inVulnerabilityOver.bind(this));
            }
            update() {
                this.inputController.update();
                this.animController.update();
                if (this.state == PlayerState.TKO) {
                    this.powerAndScore.losePower(this.game.time.physicsElapsed * Math.min(1.0, Player.moveSpeed / this.game.applyResolutionRatio(this.baseSpeed)));
                    if (this.powerAndScore.getPower() <= 0) {
                        this.becomeNormalKO();
                    }
                }
                if (Player.moveSpeed > 0)
                    this.game.soundRepo.onPlayerRunning();
            }
        }
        Player.moveSpeed = 0;
        OKKO.Player = Player;
        class PlayerState {
        }
        PlayerState.normal = "normal";
        PlayerState.TKO = "TKO";
        OKKO.PlayerState = PlayerState;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class PlayerAnimation {
            constructor(game, player, fxContainer) {
                this.fxArray = [];
                this.repeats = 0;
                this.game = game;
                this.player = player;
                this.fxContainer = fxContainer;
                let dead_anim_frames = Phaser.Animation.generateFrameNames(AnimationState.hit, 1, 2, '', 2);
                dead_anim_frames = dead_anim_frames.concat(Phaser.Animation.generateFrameNames(AnimationState.hit, 1, 2, '', 2));
                dead_anim_frames = dead_anim_frames.concat(Phaser.Animation.generateFrameNames(AnimationState.dead, 1, 9, '', 2));
                dead_anim_frames.push(AnimationState.dead + '08');
                dead_anim_frames.push(AnimationState.dead + '09');
                this.player.animations.add(AnimationState.idle, Phaser.Animation.generateFrameNames(AnimationState.run, 1, 1, '', 2), 12, true);
                this.player.animations.add(AnimationState.run, Phaser.Animation.generateFrameNames(AnimationState.run, 1, 6, '', 2), 12, true);
                this.player.animations.add(AnimationState.fastrun, Phaser.Animation.generateFrameNames(AnimationState.fastrun, 1, 6, '', 2), 12, true);
                this.player.animations.add(AnimationState.hit, Phaser.Animation.generateFrameNames(AnimationState.hit, 1, 2, '', 2), 12, false);
                this.player.animations.add(AnimationState.dead, dead_anim_frames, 12, false);
                this.player.animations.add(AnimationState.switch, Phaser.Animation.generateFrameNames(AnimationState.switch, 1, 7, '', 2), 24, false);
                this.player.animations.add(AnimationState.tko_to_ko, Phaser.Animation.generateFrameNames(AnimationState.tko_to_ko, 1, 4, '', 2), 12, false);
                this.player.animations.add(AnimationState.tko_transform, Phaser.Animation.generateFrameNames(AnimationState.tko_transform, 1, 6, '', 2), 12, false);
                this.player.animations.add(AnimationState.tko_run, Phaser.Animation.generateFrameNames(AnimationState.tko_run, 1, 4, '', 2), 12, true);
            }
            pause() {
                if (this.flashEvent != null)
                    this.flashEvent.timer.pause();
                this.player.animations.paused = true;
                this.fxContainer.pause();
            }
            resume() {
                if (this.flashEvent != null)
                    this.flashEvent.timer.resume();
                this.player.animations.paused = false;
                this.fxContainer.resume();
            }
            play(state, repeat = 0) {
                if (repeat > 0) {
                    this.player.animations.play(state, this.player.animations.getAnimation(state).speed, true).onLoop.add(() => {
                        this.repeats += 1;
                        if (this.repeats >= repeat) {
                            this.player.animations.currentAnim.complete();
                            this.player.animations.currentAnim.onLoop.dispose();
                            this.repeats = 0;
                        }
                    });
                }
                else {
                    this.player.animations.play(state);
                }
                return this.player.animations.currentAnim;
            }
            showHitFX() {
                if (this.hitFX == null) {
                    this.hitFX = new OKKO.FXSprite(this.game, Funday.OkKo.SpriteLibrary.game.hit_fx01, 'hit_fx', 1, 5, 10);
                }
                this.hitFX.reset(this.player.position.x - this.game.applyResolutionRatio(100), this.player.position.y - this.game.applyResolutionRatio(170));
                this.player.parent.addChild(this.hitFX);
            }
            flash(timeMs, color, callback) {
                if (this.flashEvent != null)
                    this.removeFlash();
                this.player.tint = color;
                let repeats = timeMs / 1000 * 6;
                this.flashEvent = this.game.time.events.repeat(timeMs / repeats, repeats, () => {
                    this.player.tint = (this.player.tint == color) ? 0xFFFFFF : color;
                });
                this.flashEvent.timer.onComplete.addOnce(() => callback());
                this.flashEvent.timer.start();
            }
            removeFlash() {
                if (this.flashEvent != null) {
                    this.game.time.events.remove(this.flashEvent);
                    this.player.tint = 0xFFFFFF;
                }
            }
            update() {
                let runAnim = OKKO.Player.moveSpeed > 925 ? AnimationState.fastrun : AnimationState.run;
                if (this.player.animations.currentAnim.isFinished && this.player.animations.currentAnim.name != AnimationState.idle && this.player.animations.currentAnim.name != AnimationState.dead) {
                    if (this.player.state == OKKO.PlayerState.normal) {
                        this.play(runAnim);
                    }
                    else {
                        this.play(AnimationState.tko_run);
                    }
                }
                if (this.player.animations.currentAnim.name == AnimationState.fastrun) {
                    this.player.animations.currentAnim.speed = 12 * (Math.max(700, OKKO.Player.moveSpeed) / 800);
                }
                else if (this.player.animations.currentAnim.name == AnimationState.run) {
                    this.player.animations.currentAnim.speed = 12 * (Math.max(700, OKKO.Player.moveSpeed) / 700);
                }
            }
        }
        OKKO.PlayerAnimation = PlayerAnimation;
        class AnimationState {
        }
        AnimationState.idle = "ko_idle_anim";
        AnimationState.run = "ko_run_anim";
        AnimationState.fastrun = "ko_fast_run_anim";
        AnimationState.switch = "ko_Jump_left_anim";
        AnimationState.hit = "ko_hit_anim";
        AnimationState.dead = "ko_dead_anim";
        AnimationState.tko_transform = "ko_to_tko_anim";
        AnimationState.tko_run = "tko_run";
        AnimationState.tko_to_ko = "tko_to_ko_anim";
        OKKO.AnimationState = AnimationState;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class PlayerInput {
            constructor(game, playerSprite) {
                this.side = 1;
                this.readyToMove = true;
                this.disabled = true;
                this.onSwitchedSide = new Phaser.Signal();
                this.game = game;
                this.sprite = playerSprite;
                this.sprite.scale.x = -1;
                this.game.onPause.add(() => {
                    this.readyToMove = false;
                });
            }
            enable() {
                this.readyToMove = true;
                this.disabled = false;
            }
            disable() {
                this.disabled = true;
            }
            restart() {
                this.side = 1;
            }
            update() {
                if (this.disabled)
                    return;
                if (this.game.input.activePointer.isDown && this.readyToMove == true && this.game.input.activePointer.y > 100) {
                    this.side = this.sprite.position.x > this.game.world.centerX ? 1 : -1;
                    this.side *= -1;
                    if (this.sprite.state == OKKO.PlayerState.TKO) {
                        this.sprite.scale.x = 1;
                    }
                    else {
                        this.sprite.scale.x = -this.side;
                    }
                    if (this.sprite.state != OKKO.PlayerState.TKO) {
                        this.sprite.animController.play(OKKO.AnimationState.switch).onComplete.addOnce(() => { this.sprite.scale.x = 1; });
                        this.moveTween = this.game.add.tween(this.sprite.position).to({ x: this.game.world.centerX + this.game.applyResolutionRatio(200) * this.side }, 150, Phaser.Easing.Quadratic.InOut, true, 50);
                    }
                    else {
                        this.moveTween = this.game.add.tween(this.sprite.position).to({ x: this.game.world.centerX + this.game.applyResolutionRatio(200) * this.side }, this.game.applyResolutionRatio(200), Phaser.Easing.Back.Out, true, 0);
                    }
                    this.onSwitchedSide.dispatch();
                    this.game.soundRepo.onPlayerSwitchSide();
                    this.readyToMove = false;
                }
                if (!this.readyToMove) {
                    if (this.game.input.activePointer.isUp && this.moveTween != null && !this.moveTween.isRunning) {
                        this.readyToMove = true;
                    }
                }
            }
        }
        OKKO.PlayerInput = PlayerInput;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class PlayerPowerAndScore {
            constructor(game) {
                this.power = 0;
                this.coins = 0;
                this.meterUpgrade = 0;
                this.headStart = false;
                this.highscore = 0;
                this.score = 0;
                this.powerPerSec = 4;
                this.game = game;
            }
            restart() {
                this.power = 0;
                this.loadCoins();
                this.loadMeterUpgrades();
                this.loadHighscore();
            }
            loadCoins() {
                this.coins = Number(this.game.services.persistence.load(OKKO.PersistenceKeys.COINS));
            }
            saveCoins() {
                this.game.services.persistence.save(OKKO.PersistenceKeys.COINS, this.coins);
            }
            loadMeterUpgrades() {
                this.meterUpgrade = Number(this.game.services.persistence.load(OKKO.PersistenceKeys.METER_UPGRADE));
            }
            loadHighscore() {
                let highscoreInMeters = Number(this.game.services.persistence.load(this.game.highscorePersistenceKey));
                this.highscore = OKKO.UIController.convertMeterstoGameUnits(highscoreInMeters);
            }
            addPower(value) {
                if (this.power == 0) {
                    this.power = this.getMaxPower();
                }
                else {
                    this.power += value;
                    if (this.power >= this.getMaxPower())
                        this.power = this.getMaxPower();
                }
                this.game.achievements.onGlorbCollected();
            }
            onHeadStart() {
                this.headStart = true;
                this.meterUpgrade = 6;
                this.power = this.getMaxPower() + 2;
            }
            addCoin(value) {
                this.coins += value;
            }
            getPower() {
                return this.power;
            }
            getCoins() {
                return this.coins;
            }
            getMaxPower() {
                return 7 + this.meterUpgrade * 2.5;
            }
            getDistanceHighscore() {
                return Math.round(this.highscore);
            }
            checkAndSaveDistanceHighscore(dist) {
                if (dist > this.highscore) {
                    this.highscore = dist;
                    let convertedHighscore = OKKO.UIController.convertGameUnitToMeters(this.highscore);
                    console.log("Saving " + convertedHighscore + " normal highscore: " + this.highscore);
                    this.game.services.persistence.save(this.game.highscorePersistenceKey, convertedHighscore);
                    return true;
                }
                else {
                    return false;
                }
            }
            saveDistanceSessionScore(dist) {
                this.score = dist;
                let convertedScore = OKKO.UIController.convertGameUnitToMeters(this.score);
                this.game.services.persistence.saveSessionScore(this.game.sessionscorePersistenceKey, convertedScore);
            }
            losePower(deltaTime) {
                this.power -= this.powerPerSec * deltaTime;
                this.power = Math.max(0, this.power);
                if (this.power == 0 && this.headStart) {
                    this.headStart = false;
                    this.loadMeterUpgrades();
                }
            }
        }
        OKKO.PlayerPowerAndScore = PlayerPowerAndScore;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class PlayerFXContainer extends Phaser.Group {
            constructor(game, player) {
                super(game);
                this.player = player;
                this.auraFX = new OKKO.FXSprite(game, Funday.OkKo.SpriteLibrary.player.tko_aura_anim01, 'tko_aura_anim', 1, 3, 12, true);
                this.auraFX.kill();
                this.speedLines = new OKKO.SpeedLines(game);
                this.speedLines.kill();
                this.add(this.auraFX);
                this.add(this.speedLines);
            }
            pause() {
                this.auraFX.animations.paused = true;
                this.speedLines.paused = true;
            }
            resume() {
                this.auraFX.animations.paused = false;
                this.speedLines.paused = false;
            }
            showFX() {
                this.auraFX.revive();
                this.auraFX.scale.set(0.05, 0.05);
                this.game.add.tween(this.auraFX.scale).to({ x: 1, y: 1 }, 300, Phaser.Easing.Elastic.Out, true, 450);
                this.speedLines.revive();
                this.speedLines.alpha = 0;
                this.game.add.tween(this.speedLines).to({ alpha: 1.0 }, 250, Phaser.Easing.Linear.None, true, 450);
            }
            hideFX() {
                this.auraFX.kill();
                this.game.add.tween(this.speedLines).to({ alpha: 0.0 }, 250, Phaser.Easing.Linear.None, true, 0).onComplete.addOnce(() => {
                    this.speedLines.kill();
                });
            }
            update() {
                this.auraFX.positionAt(this.player, 10, 90);
                this.speedLines.update();
            }
        }
        OKKO.PlayerFXContainer = PlayerFXContainer;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class SpeedLines extends Phaser.Group {
            constructor(game) {
                super(game);
                this.lineArray = [];
                this.lineStartPos = [];
                for (let i = 0; i < 8; i++) {
                    let side = i >= 4 ? -1 : 1;
                    let line = new Phaser.Sprite(game, this.game.world.centerX + (game.applyResolutionRatio(280 + 65 * (i % 4))) * side, this.game.world.height * 0.75, Funday.OkKo.SpriteLibrary.game.speed_line.key, Funday.OkKo.SpriteLibrary.game.speed_line.frame);
                    line.anchor.set(0.5, 0.5);
                    this.addChild(line);
                    this.lineArray.push(line);
                    this.lineStartPos.push(new Phaser.Point(line.position.x, line.position.y));
                }
                return this;
            }
            update() {
                if (!this.visible || this.paused)
                    return;
                for (let i = 0; i < 8; i++) {
                    let line = this.lineArray[i];
                    line.x = Phaser.Math.linearInterpolation([line.x, this.lineStartPos[i].x + Math.random() * this.game.applyResolutionRatio(50) * this.game.rnd.sign()], 0.15);
                    line.y = Phaser.Math.linearInterpolation([line.y, this.lineStartPos[i].y + Math.random() * this.game.applyResolutionRatio(50) * this.game.rnd.sign()], 0.25);
                    line.alpha = Phaser.Math.linearInterpolation([line.alpha, Math.random() * 0.5], 0.35);
                    line.scale.x = Phaser.Math.linearInterpolation([line.scale.x, 0.5 + Math.random() * 0.5 * this.game.rnd.sign()], 0.25);
                    line.scale.y = Phaser.Math.linearInterpolation([line.scale.y, 1.85 + Math.random() * 0.5 * this.game.rnd.sign()], 0.25);
                }
            }
        }
        OKKO.SpeedLines = SpeedLines;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class Screen extends Phaser.Group {
            constructor(screenManager) {
                super(screenManager.game);
                this.screenManager = screenManager;
                this.screenManager.screenContainer.addChild(this);
                this.kill();
            }
            onTransitionInCompleted() {
            }
            onTransitionOutCompleted() {
            }
            onTransitionInBegin() {
            }
            onTransitionOutBegin() {
            }
            screenUpdate() {
            }
            screenRender() {
            }
        }
        OKKO.Screen = Screen;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class GameScreen extends OKKO.Screen {
            constructor(screenManager) {
                super(screenManager);
                let game = this.game;
                game.physics.startSystem(Phaser.Physics.ARCADE);
                let player = new OKKO.Player(game, 0, 0);
                this.playerSpawnPos = new Phaser.Point(this.game.world.centerX + game.applyResolutionRatio(200), this.game.responsiveDistanceFromBottom(1920 * (1 - .72)));
                this.spawner = new OKKO.Spawner(game);
                this.spawner.setCurrentWave(new OKKO.RandomEnemyWave(this.game, this.spawner, new OKKO.DifficultyController(player)));
                this.bgController = new OKKO.BgController(game, this, player.powerAndScore, this.spawner.roadMask);
                this.ui = new OKKO.UIController(game, player.powerAndScore, this, this.spawner);
                this.tapKOIndicator = new OKKO.TapKOIndicator(this.game, this.game.world.centerX, this.game.responsiveDistanceFromBottom(1920 * (1 - 0.85)), "Tap K.O. to start!", this.playerSpawnPos);
                this.levelController = new OKKO.LevelController(game, this, player, this.spawner, this.bgController, this.ui);
                this.addAllInOrder();
            }
            initDebugMenu() {
                let debugMenu = new OKKO.DebugMenu(this.game);
                this.game.debugMenu = debugMenu;
                debugMenu.addButton('Play tutorial', () => {
                    this.game.services.persistence.save(OKKO.PersistenceKeys.TUTORIAL_COMPLETE, false);
                    this.game.services.persistence.save(OKKO.PersistenceKeys.SHOP_TUTORIAL_COMPLETE, true);
                    this.levelController.pauseSystems();
                    this.game.state.start('Game', true, false);
                });
                debugMenu.addButton('Play shop tutorial', () => {
                    this.game.services.persistence.save(OKKO.PersistenceKeys.TUTORIAL_COMPLETE, true);
                    this.game.services.persistence.save(OKKO.PersistenceKeys.SHOP_TUTORIAL_COMPLETE, false);
                    this.game.services.persistence.save(OKKO.PersistenceKeys.COINS, Number(this.game.services.persistence.load(OKKO.PersistenceKeys.COINS)) + 1000);
                    this.levelController.pauseSystems();
                    this.game.state.start('Game', true, false);
                });
                debugMenu.addButton('Skip tutorials', () => {
                    this.game.services.persistence.save(OKKO.PersistenceKeys.TUTORIAL_COMPLETE, true);
                    this.game.services.persistence.save(OKKO.PersistenceKeys.SHOP_TUTORIAL_COMPLETE, true);
                    this.levelController.pauseSystems();
                    this.game.state.start('Game', true, false);
                });
                debugMenu.addButton('Get money', () => {
                    this.game.services.persistence.save(OKKO.PersistenceKeys.COINS, Number(this.game.services.persistence.load(OKKO.PersistenceKeys.COINS)) + 1000);
                    this.levelController.player.powerAndScore.loadCoins();
                });
            }
            addAllInOrder() {
                let player = this.levelController.player;
                this.add(this.bgController.bgGroup);
                this.add(this.spawner.shadowGroup);
                this.add(this.spawner.spawnGroup);
                this.add(player.shadow);
                this.add(player);
                this.add(this.spawner.FXGroup);
                this.add(this.tapKOIndicator);
                this.add(this.ui);
            }
            startGame() {
                this.playerSpawnPos.copyTo(this.levelController.player);
                if (!Boolean(this.game.services.persistence.load(OKKO.PersistenceKeys.TUTORIAL_COMPLETE))) {
                    if (!this.tutController) {
                        this.tutController = new OKKO.Tutorial(this.game, this, this.levelController.player, this.spawner, this.bgController, this.ui);
                    }
                    this.add(this.tutController);
                    this.bgController.shopSign.kill();
                    this.tutController.startTutorial();
                }
                else if (Number(this.game.services.persistence.load(OKKO.PersistenceKeys.COINS)) >= this.screenManager.screens.shopScreen.upgradePrice[0] && !Boolean(this.game.services.persistence.load(OKKO.PersistenceKeys.SHOP_TUTORIAL_COMPLETE))) {
                    if (!this.shopTut) {
                        this.shopTut = new OKKO.ShopTutorial(this.game, this.bgController.shopSignButton, this.screenManager.screens.shopScreen, this.ui);
                    }
                    this.screenManager.screens.shopScreen.setTutorialObject(this.shopTut);
                    this.shopTut.startTutorial();
                    this.waitForTap(true);
                    this.add(this.shopTut);
                }
                else {
                    this.waitForTap(false);
                }
            }
            waitForTap(tutorial = false) {
                let sign = this.bgController.shopSignButton;
                let player = this.levelController.player;
                sign.onUp.addOnce(() => {
                    this.levelController.player.animController.play(OKKO.AnimationState.run);
                    this.game.add.tween(this.levelController.player.position).to({ x: this.game.world.width + this.game.applyResolutionRatio(100), y: this.playerSpawnPos.y - this.game.applyResolutionRatio(125) }, 800, Phaser.Easing.Linear.None, true).onComplete.addOnce(() => {
                        this.screenManager.transitionToScreen(this.screenManager.screens.shopScreen);
                        this.screenManager.screens.shopScreen.setUIController(this.ui);
                        this.screenManager.screens.shopScreen.setPlayerPowerAndScore(this.levelController.player.powerAndScore);
                    });
                    this.tapKOIndicator.stopTimersAndRemove();
                    player.events.onInputUp.dispose();
                });
                if (tutorial)
                    return;
                this.tapKOIndicator.startTimerToShow();
                player.inputEnabled = true;
                player.events.onInputUp.addOnce(() => {
                    sign.onUp.dispose();
                    this.levelController.startLevel();
                    this.tapKOIndicator.stopTimersAndRemove();
                    player.inputEnabled = false;
                    this.game.soundRepo.onGogo();
                });
            }
            returnFromShop() {
                this.ui.distanceCounter.visible = true;
                this.ui.animator.clear();
                this.add(this.ui);
                this.levelController.player.animController.play(OKKO.AnimationState.run);
                this.game.add.tween(this.levelController.player.position).to({ x: this.playerSpawnPos.x, y: this.playerSpawnPos.y }, 800, Phaser.Easing.Linear.None, true).onComplete.addOnce(() => {
                    this.startGame();
                    this.levelController.player.animController.play(OKKO.AnimationState.run);
                });
            }
            screenUpdate() {
                this.levelController.checkCollisions();
                this.spawner.updateDistance();
                this.bgController.updateDistance();
            }
            screenRender() {
            }
        }
        OKKO.GameScreen = GameScreen;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class SplashScreen extends OKKO.Screen {
            constructor(screenManager) {
                super(screenManager);
                this.game.stage.backgroundColor = 0xfdf280;
                let game = this.game;
                let background = game.createSprite(game.world.centerX, game.world.height, Funday.OkKo.SpriteLibrary.splashbg.splash_screen_background);
                background.anchor.set(0.5, 1.0);
                this.addChild(background);
                let backgroundTop = game.createSprite(game.world.centerX, background.top, Funday.OkKo.SpriteLibrary.splash.splash_screen_background02);
                backgroundTop.anchor.set(0.5, 1.0);
                this.addChild(backgroundTop);
                let startButtonContainer = game.createSprite(game.world.centerX, game.world.height * .85, Funday.OkKo.SpriteLibrary.splash.start_button);
                startButtonContainer.anchor.set(0.5);
                this.addChild(startButtonContainer);
                let highscore = Number(game.services.persistence.load(game.highscorePersistenceKey));
                let text = new Funday.UI.ShadowTextGroup(game, 'KOfont', 'High Score: ' + highscore, game.applyResolutionRatio(62), 0xFFFF00, 5);
                text.position = new Phaser.Point(0, game.applyResolutionRatio(-70));
                text.setShadowColorAndAlpha(0x9d06eb, 1);
                let startTextButton = game.createButton(0, 0, new Funday.SpriteId(null, null));
                let startText = new Funday.UI.ShadowTextGroup(game, 'KOfont', 'Play', game.applyResolutionRatio(120), 0xFFFF00, 8);
                startText.position = new Phaser.Point(0, game.applyResolutionRatio(65));
                startText.setShadowColorAndAlpha(0x9d06eb, 1);
                startButtonContainer.addChild(text);
                startButtonContainer.addChild(startTextButton);
                startTextButton.button.addChild(startText);
                startTextButton.button.hitArea = new Phaser.Rectangle(-startButtonContainer.width / 2, -startButtonContainer.height / 2, startButtonContainer.width * 1.5, startButtonContainer.height * 1.5);
                game.soundRepo.startMusic();
                startTextButton.onUp.add(this.onStartButtonUp, this);
            }
            onStartButtonUp() {
                let gameScreen = this.screenManager.screens.gameScreen;
                this.screenManager.transitionToScreen(gameScreen, gameScreen.startGame.bind(gameScreen));
            }
        }
        OKKO.SplashScreen = SplashScreen;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class ScreenManager {
            constructor(game) {
                this.inputBlocker = null;
                this.game = game;
                this.screenContainer = game.add.group();
                this.screens = new Screens(this);
                this.inputBlocker = new Phaser.Sprite(this.game, 0, 0);
                this.inputBlocker.hitArea = new Phaser.Rectangle(0, 0, this.game.world.width, this.game.world.height);
                this.inputBlocker.inputEnabled = true;
                this.screenContainer.addChild(this.inputBlocker);
            }
            blockInput() {
                this.inputBlocker.bringToTop();
            }
            unblockInput() {
                this.inputBlocker.parent.setChildIndex(this.inputBlocker, 0);
            }
            setScreen(screen) {
                this.currentScreen = screen;
                screen.revive();
                let location = null;
                if (screen instanceof OKKO.SplashScreen) {
                    location = Funday.Service.GameLocations.TITLE;
                }
                if (screen instanceof OKKO.ShopScreen) {
                    location = Funday.Service.GameLocations.SHOP;
                }
                if (screen instanceof OKKO.GameScreen) {
                    location = Funday.Service.GameLocations.PLAY;
                }
                this.game.services.analytics.trackLocation(location);
            }
            clearCurrentScreen() {
                if (this.currentScreen) {
                    this.currentScreen.kill();
                    this.currentScreen = null;
                }
            }
            updateScreens() {
                this.currentScreen.screenUpdate();
            }
            renderScreens() {
                this.currentScreen.screenRender();
            }
            transitionToScreen(screen, callback) {
                let trans = this.createTransitionAnimation(screen, this.currentScreen, callback);
                trans.play();
                return trans;
            }
            createTransitionAnimation(to, from, callback) {
                let game = this.game;
                let animation = game.services.animation;
                let duration = 250;
                let transitionOutAnimation = animation.fadeToBlack(duration);
                let transitionInAnimation = animation.fadeFromBlack(duration);
                let transitionAnimation = animation.queue([transitionOutAnimation, transitionInAnimation]);
                transitionOutAnimation.onPlay.add(function () {
                    this.blockInput();
                    from.onTransitionOutBegin();
                    to.onTransitionInBegin();
                }, this);
                transitionOutAnimation.onComplete.add(function () {
                    this.clearCurrentScreen();
                    this.setScreen(to);
                    this.unblockInput();
                    from.onTransitionOutCompleted();
                    to.onTransitionInCompleted();
                    if (callback) {
                        callback();
                    }
                }, this);
                return transitionAnimation;
            }
        }
        OKKO.ScreenManager = ScreenManager;
        class Screens {
            constructor(screenManager) {
                this.splashScreen = null;
                this.gameScreen = null;
                this.shopScreen = null;
                this.splashScreen = new OKKO.SplashScreen(screenManager);
                this.gameScreen = new OKKO.GameScreen(screenManager);
                this.shopScreen = new OKKO.ShopScreen(screenManager);
            }
        }
        OKKO.Screens = Screens;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class ShopScreen extends OKKO.Screen {
            constructor(screenManager) {
                super(screenManager);
                this.upgradePrice = [25, 100, 200, 300, 500, 600];
                this.game = this.game;
                let bg = this.game.createSprite(this.game.world.centerX, this.game.height, Funday.OkKo.SpriteLibrary.shop.shop_background, this);
                bg.anchor.set(0.5, 1.0);
                let bgTop = this.game.createSprite(this.game.world.centerX, bg.top, Funday.OkKo.SpriteLibrary.shop.shop_background02, this);
                bgTop.anchor.set(0.5, 1.0);
                this.koSprite = this.game.createSprite(this.game.world.centerX + this.game.applyResolutionRatio(15), this.game.responsiveDistanceFromBottom(1920 * (1 - 0.79)), Funday.OkKo.SpriteLibrary.shop.ko_shop_idle_anim01);
                this.koSprite.anchor.set(0.5);
                this.koSprite.animations.add('idle', Phaser.Animation.generateFrameNames('ko_shop_idle_anim', 1, 4, '', 2), 12, true);
                this.backButton = this.game.createButton(this.game.world.width, this.game.responsiveDistanceFromBottom(235), Funday.OkKo.SpriteLibrary.shop.arrow_button);
                this.backButton.position.x = this.game.world.width - this.game.applyResolutionRatio(25) - this.backButton.width * 0.5;
                this.koSprite.animations.add('upgrade', ['ko_shop_upgrade_anim01', 'ko_shop_upgrade_anim02', 'ko_shop_upgrade_anim01', 'ko_shop_upgrade_anim02', 'ko_shop_upgrade_anim02', 'ko_shop_upgrade_anim02', 'ko_shop_upgrade_anim02', 'ko_shop_upgrade_anim02', 'ko_shop_upgrade_anim02'], 12, false);
                this.koSprite.animations.getAnimation('upgrade').onComplete.add(() => {
                    this.koSprite.animations.play('idle', 12, true);
                });
                this.upgradeButton = new OKKO.ShopUpgradeButton(this.game, this.game.world.centerX + this.game.applyResolutionRatio(140), this.game.responsiveDistanceFromBottom(1920 / 2 + 225), Funday.OkKo.SpriteLibrary.shop.upgrade_button);
                this.glorbGlow = this.game.createSprite(this.game.world.centerX - this.game.applyResolutionRatio(300), 0, Funday.OkKo.SpriteLibrary.shop.shop_glorb_aura, this);
                this.glorbGlow.anchor.set(0.5);
                this.floatingGlorb = this.game.createSprite(this.game.world.centerX - this.game.applyResolutionRatio(370), 0, Funday.OkKo.SpriteLibrary.shop.shop_glorb, this);
                this.feedbackBox = this.game.add.sprite(this.game.world.centerX, this.game.world.height * 0.16, Funday.OkKo.SpriteLibrary.shop.tutorial_box02.key, Funday.OkKo.SpriteLibrary.shop.tutorial_box02.frame);
                this.feedbackBox.anchor.set(0.5, 0.5);
                this.feedbackBox.kill();
                let feedbackText = new Funday.UI.ShadowTextGroup(this.game, 'KOfont', '', this.game.applyResolutionRatio(82), 0xFFFF00, 8);
                feedbackText.position = new Phaser.Point(this.game.applyResolutionRatio(-135), this.game.applyResolutionRatio(15));
                feedbackText.setShadowColorAndAlpha(0x9d06eb, 1);
                this.feedbackText = feedbackText;
                this.feedbackText.setText('Not enough\n      coins');
                this.feedbackText.updateCache();
                this.feedbackBox.addChild(this.feedbackText);
                this.add(this.koSprite);
                this.add(this.backButton);
                this.add(this.upgradeButton);
                this.add(this.feedbackBox);
                window.shop = this;
            }
            setUIController(ui) {
                this.ui = ui;
            }
            setPlayerPowerAndScore(playerPowerAndScore) {
                this.powerAndScore = playerPowerAndScore;
            }
            setTutorialObject(shopTutorial) {
                this.shopTutorial = shopTutorial;
            }
            startTweensAndAnimation() {
                this.floatingGlorb.position.y = this.game.responsiveDistanceFromBottom(1920 / 2 + 300);
                this.glorbGlow.position.y = this.game.responsiveDistanceFromBottom(1920 / 2 + 250);
                this.glorbGlow.alpha = 0.15;
                this.game.add.tween(this.glorbGlow).to({ alpha: 0.354 }, 500, Phaser.Easing.Quadratic.Out, true, 0, -1, true);
                this.game.add.tween(this.floatingGlorb.position).to({ y: '+' + this.game.applyResolutionRatio(15).toString() }, 400, Phaser.Easing.Quadratic.InOut, true, 0, -1, true);
                this.game.add.tween(this.glorbGlow.position).to({ y: '+' + this.game.applyResolutionRatio(15).toString() }, 400, Phaser.Easing.Quadratic.InOut, true, 0, -1, true);
                this.koSprite.animations.play('idle');
            }
            onTransitionInCompleted() {
                this.add(this.ui);
                this.ui.distanceCounter.visible = false;
                this.startTweensAndAnimation();
                this.koSprite.animations.play('idle');
                if (this.shopTutorial != null) {
                    this.upgradeButton.onUp.dispose();
                    this.shopTutorial.startTutorialInShop();
                    this.add(this.shopTutorial);
                    return;
                }
                this.koSprite.inputEnabled = true;
                this.koSprite.events.onInputUp.add(() => {
                    this.koSprite.play('upgrade');
                });
                this.backButton.onUp.addOnce(() => {
                    this.returnToGame();
                });
                if (!this.upgradeButton.onUp.has(this.tryToBuy, this)) {
                    this.upgradeButton.onUp.add(this.tryToBuy, this);
                }
                let upgradeLevel = Number(this.game.services.persistence.load(OKKO.PersistenceKeys.METER_UPGRADE));
                let price = this.upgradePrice[upgradeLevel];
                this.upgradeButton.updateButton(price, upgradeLevel);
            }
            showFeedbackText() {
                if (!this.game.tweens.isTweening(this.feedbackBox)) {
                    this.feedbackBox.alpha = 0;
                    this.feedbackBox.scale.set(0.05, 0.05);
                    this.feedbackBox.visible = true;
                    this.game.add.tween(this.feedbackBox.scale).to({ x: 1.0, y: 1.0 }, 800, Phaser.Easing.Elastic.Out, true);
                    this.game.add.tween(this.feedbackBox).to({ alpha: 1.0 }, 500, Phaser.Easing.Linear.None, true).onComplete.addOnce(() => {
                        ;
                        this.game.add.tween(this.feedbackBox.scale).to({ x: 0.1, y: 0.1 }, 500, Phaser.Easing.Exponential.In, true, 1000);
                        this.game.add.tween(this.feedbackBox).to({ alpha: 0.0 }, 400, Phaser.Easing.Exponential.In, true, 1100).onComplete.addOnce(() => {
                            this.feedbackBox.visible = false;
                        });
                    });
                }
            }
            tryToBuy() {
                let currentCoins = Number(this.game.services.persistence.load(OKKO.PersistenceKeys.COINS));
                let currentMeterLevel = Number(this.game.services.persistence.load(OKKO.PersistenceKeys.METER_UPGRADE));
                let price = this.upgradePrice[currentMeterLevel];
                if (currentCoins >= price) {
                    this.game.services.persistence.save(OKKO.PersistenceKeys.COINS, currentCoins - price);
                    this.game.services.persistence.save(OKKO.PersistenceKeys.METER_UPGRADE, currentMeterLevel + 1);
                    this.powerAndScore.loadCoins();
                    this.powerAndScore.loadMeterUpgrades();
                    this.upgradeButton.updateButton(this.upgradePrice[currentMeterLevel + 1], currentMeterLevel + 1);
                    this.ui.powerBar.updateSize();
                    this.koSprite.play('upgrade');
                    this.game.soundRepo.onPurchase();
                }
                else {
                    this.showFeedbackText();
                }
            }
            returnToGame() {
                let gameScreen = this.screenManager.screens.gameScreen;
                this.screenManager.transitionToScreen(gameScreen, gameScreen.returnFromShop.bind(gameScreen));
            }
            tutorialOver() {
                this.game.services.persistence.save(OKKO.PersistenceKeys.SHOP_TUTORIAL_COMPLETE, true);
                this.returnToGame();
                this.shopTutorial = null;
            }
        }
        OKKO.ShopScreen = ShopScreen;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class StateBoot extends Phaser.State {
            init() {
                let game = this.game;
                game.preBoot();
            }
            preload() {
                let game = this.game;
                game.loadLoadScreenGfxForCurrentResolution();
            }
            create() {
                let game = this.game;
                game.startLoad();
            }
        }
        OKKO.StateBoot = StateBoot;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class StateGame extends Phaser.State {
            create() {
                let game = this.game;
                let screenManager = new OKKO.ScreenManager(game);
                screenManager.setScreen(screenManager.screens.splashScreen);
                screenManager.unblockInput();
                this.screenManager = screenManager;
                game.screenManager = screenManager;
            }
            update() {
                this.screenManager.updateScreens();
            }
            render() {
                this.screenManager.renderScreens();
            }
        }
        OKKO.StateGame = StateGame;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class StateLoad extends Phaser.State {
            preload() {
                let cartoonNetworkGame = this.game;
                cartoonNetworkGame.loadGfxForCurrentResolution();
                this.load.pack("Audio", "assets/data/assets.json");
                this.load.bitmapFont('KOfont', 'assets/fonts/okko_font-export.png', 'assets/data/fonts/okko_font-export.xml');
                this.load.bitmapFont('OutlineFont', 'assets/fonts/okko_font2-export.png', 'assets/data/fonts/okko_font2-export.xml');
                let loadBG = this.add.sprite(this.game.world.centerX, this.game.world.height, Funday.OkKo.SpriteLibrary.loadbg.load_background.key, Funday.OkKo.SpriteLibrary.loadbg.load_background.frame);
                loadBG.anchor.setTo(0.5, 1.0);
                let loadScreenNew = new Funday.UI.CartoonNetworkLoadScreen(this, 0xD9F0FF);
                this.game.stage.backgroundColor = 0xfad27d;
            }
            create() {
                let game = this.game;
                this.game.cache.getBitmapFont('KOfont').font.lineHeight = 120;
                let animationFactory = game.services.animation;
                let animFadeToBlack = animationFactory.fadeToBlack(900);
                animFadeToBlack.onComplete.add(function () {
                    game.startGame();
                    game.onLoadComplete();
                });
                animFadeToBlack.play();
            }
        }
        OKKO.StateLoad = StateLoad;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class ShopTutorial extends Phaser.Group {
            constructor(game, sign, shopScreen, ui) {
                super(game);
                this.skipTutorial = true;
                this.tutorialStep = 0;
                this.game = game;
                this.shopScreen = shopScreen;
                this.sign = sign;
                this.ui = ui;
                this.tutBoxLarge = this.game.add.sprite(this.game.world.centerX, this.game.world.height * 0.25, Funday.OkKo.SpriteLibrary.menus.tutorial_box.key, Funday.OkKo.SpriteLibrary.menus.tutorial_box.frame);
                this.tutBoxLarge.anchor.set(0.5, 0.5);
                this.tutBoxLarge.kill();
                this.tutBox = this.game.add.sprite(this.game.world.centerX, this.game.world.height * 0.18, Funday.OkKo.SpriteLibrary.shop.tutorial_box02.key, Funday.OkKo.SpriteLibrary.shop.tutorial_box02.frame);
                this.tutBox.anchor.set(0.5, 0.5);
                this.tutBox.kill();
                let tutText = new Funday.UI.ShadowTextGroup(game, 'KOfont', 'Tap!', 72, 0xFFFF00, 6);
                tutText.position = new Phaser.Point(230, 10);
                tutText.setShadowColorAndAlpha(0x9d06eb, 1);
                this.tutText = tutText;
                this.tutBoxLarge.addChild(this.tutText);
                this.tutHand = new OKKO.TutHand(game, 0, 0, Funday.OkKo.SpriteLibrary.menus.hand);
                this.tutHand.anchor.set(0.3, 0.1);
                this.ui.addChild(this.tutBoxLarge);
                this.ui.addChild(this.tutBox);
                this.ui.addChild(this.tutHand);
                this.ui.addChild(this.ui.optionsMenu);
                window.shopTut = this;
            }
            startTutorial() {
            }
            startTutorialInShop() {
                this.tutHand.fadeOut();
                this.tutorialStep += 1;
            }
            doSteps() {
                switch (this.tutorialStep) {
                    case (0):
                        this.tutText.setText("Tap the\nsign to go\nto the\nshop!");
                        this.lastTween = this.ui.tweenInImg(this.tutBoxLarge);
                        this.tutHand.fadeInAt(this.game.world.centerX + 425, this.game.responsiveDistanceFromBottom(1920 / 2 - 125));
                        this.tutorialStep += 1;
                        this.sign.onDown.addOnce(() => {
                            this.ui.tweenOutImg(this.tutBoxLarge);
                            this.tutHand.fadeOut();
                        });
                        break;
                    case (1):
                        break;
                    case (2):
                        this.tutText.setFontSize(82);
                        this.tutText.setText("Tap to\nupgrade!");
                        this.tutText.position.x = -180;
                        this.tutBox.addChild(this.tutText);
                        this.tutBoxLarge.destroy();
                        this.tutBox.position.y = this.game.world.height * 0.15;
                        this.lastTween = this.ui.tweenInImg(this.tutBox);
                        this.tutHand.fadeInAt(this.shopScreen.upgradeButton.position.x, this.shopScreen.upgradeButton.position.y + this.game.applyResolutionRatio(50));
                        this.tutorialStep += 1;
                        this.shopScreen.upgradeButton.onUp.addOnce(() => {
                            this.shopScreen.tryToBuy();
                            this.tutHand.fadeOut();
                            this.ui.tweenOutImg(this.tutBox).onComplete.addOnce(() => { this.tutorialStep += 1; });
                            this.tutorialStep += 1;
                        });
                        break;
                    case (3):
                        break;
                    case (4):
                        break;
                    case (5):
                        this.tutText.setFontSize(66);
                        this.tutText.setText("Tap to get\nback on\nthe road!");
                        this.tutBox.position.y = this.game.world.height * 0.20;
                        this.lastTween = this.ui.tweenInImg(this.tutBox);
                        this.tutHand.fadeInAt(this.shopScreen.backButton.position.x - 15, this.shopScreen.backButton.position.y);
                        this.tutorialStep += 1;
                        this.shopScreen.backButton.onDown.addOnce(() => {
                            this.tutorialStep += 1;
                            this.tutHand.fadeOut();
                            this.game.time.events.resume();
                            this.game.time.events.add(150, () => { this.tutorialStep += 1; });
                        });
                        break;
                    case (6):
                        break;
                    case (7):
                        break;
                    case (8):
                        this.shopScreen.tutorialOver();
                        this.tutHand.destroy();
                        this.tutBox.destroy(true);
                        this.destroy(true);
                        break;
                }
            }
            update() {
                this.doSteps();
                this.tutText.updateCache();
                if (this.ui.optionsMenu.alive || this.tutorialStep > 6) {
                    this.ui.blackOverlay.inputEnabled = true;
                }
                else {
                    this.ui.blackOverlay.inputEnabled = false;
                }
            }
        }
        OKKO.ShopTutorial = ShopTutorial;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class TapKOIndicator extends Phaser.Group {
            constructor(game, x, y, text, playerPos) {
                super(game);
                this.playerPos = playerPos;
                let textfield = new Funday.UI.ShadowTextGroup(game, 'KOfont', text, game.applyResolutionRatio(72), 0xFFFF00, 6);
                textfield.setShadowColorAndAlpha(0x9d06eb, 1);
                textfield.position = new Phaser.Point(x, y);
                this.textfield = textfield;
                this.tutHand = new OKKO.TutHand(game, 0, 0, Funday.OkKo.SpriteLibrary.menus.hand);
                this.tutHand.anchor.set(0.3, 0.1);
                this.add(this.tutHand);
                this.add(this.textfield);
                this.kill();
            }
            startTimerToShow() {
                this.showTimer = this.game.time.events.add(1500, () => {
                    this.textfield.alpha = 0;
                    this.textfield.scale.set(0.5, 0.5);
                    this.game.add.tween(this.textfield).to({ alpha: 1.0 }, 300, Phaser.Easing.Cubic.Out, true);
                    this.game.add.tween(this.textfield.scale).to({ x: 1.0, y: 1.0 }, 500, Phaser.Easing.Elastic.Out, true, 0, 0, false);
                    this.tutHand.fadeInAt(this.playerPos.x, this.playerPos.y);
                    this.revive();
                });
            }
            stopTimersAndRemove() {
                this.game.time.events.remove(this.showTimer);
                this.tutHand.fadeOut();
                this.game.add.tween(this.textfield).to({ alpha: 0.0 }, 300, Phaser.Easing.Cubic.Out, true).onComplete.addOnce(() => {
                    this.kill();
                });
            }
        }
        OKKO.TapKOIndicator = TapKOIndicator;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class TutHand extends Phaser.Sprite {
            constructor(game, x, y, spriteId) {
                super(game, x, y, spriteId.key, spriteId.frame);
            }
            fadeInAt(x, y) {
                if (this.fadeTween)
                    this.fadeTween.stop(false);
                if (this.scaleTween)
                    this.scaleTween.stop(false);
                this.alpha = 0.0;
                this.scale.set(1.0, 1.0);
                this.position.x = x;
                this.position.y = y;
                this.visible = true;
                this.fadeTween = this.game.add.tween(this).to({ alpha: 1.0 }, 300, Phaser.Easing.Linear.None, true, 0);
                this.fadeTween.onComplete.addOnce(() => {
                    this.scaleTween = this.game.add.tween(this.scale).to({ x: 0.75, y: 0.75 }, 500, Phaser.Easing.Quadratic.Out, true, 0, -1, true);
                });
            }
            fadeOut() {
                if (this.fadeTween)
                    this.fadeTween.stop(false);
                if (this.scaleTween)
                    this.scaleTween.stop(false);
                this.fadeTween = this.game.add.tween(this).to({ alpha: 0.0 }, 300, Phaser.Easing.Linear.None, true, 0);
                this.fadeTween.onComplete.addOnce(() => {
                    this.visible = false;
                });
            }
        }
        OKKO.TutHand = TutHand;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class Tutorial extends Phaser.Group {
            constructor(game, screen, player, spawner, bgSpawner, ui) {
                super(game);
                this.tutorialStep = 0;
                this.waitingForInput = false;
                this.game = game;
                this.screen = screen;
                this.player = player;
                this.spawner = spawner;
                this.bgSpawner = bgSpawner;
                this.ui = ui;
                this.tutBox = this.game.add.sprite(game.world.centerX, game.world.height * 0.28, Funday.OkKo.SpriteLibrary.menus.tutorial_box.key, Funday.OkKo.SpriteLibrary.menus.tutorial_box.frame);
                this.tutBox.anchor.set(0.5, 0.5);
                this.tutBox.kill();
                let tutText = new Funday.UI.ShadowTextGroup(game, 'KOfont', 'Tap!', game.applyResolutionRatio(100), 0xFFFF00, 8);
                tutText.position = new Phaser.Point(game.applyResolutionRatio(215), 0);
                tutText.setShadowColorAndAlpha(0x9d06eb, 1);
                this.tutText = tutText;
                this.tutBox.addChild(this.tutText);
                this.tutHand = new OKKO.TutHand(game, 0, 0, Funday.OkKo.SpriteLibrary.menus.hand);
                this.tutHand.anchor.set(0.3, 0.1);
                this.ui.addChild(this.tutHand);
                this.ui.addChild(this.tutBox);
                this.ui.addChild(this.ui.optionsMenu);
                this.spawnPos = { x: this.game.world.centerX + game.applyResolutionRatio(125), y: game.applyResolutionRatio(560) };
                this.moveSpeed = 700;
                this.initSteps();
                window.tutorial = this;
            }
            startTutorial() {
                this.tutorialStep = 0;
                this.player.inputEnabled = true;
                this.spawner.spawning = false;
                this.tutText.setText("Tap\nK.O. to\nstart!");
                this.ui.tweenInImg(this.tutBox);
                this.tutHand.fadeInAt(this.player.position.x, this.player.position.y);
                this.player.events.onInputUp.addOnce(() => {
                    this.ui.tweenOutImg(this.tutBox);
                    this.tutHand.fadeOut();
                    this.player.inputEnabled = false;
                    this.tutorialStep += 1;
                    this.tutWave = new OKKO.TutorialWave(this.game, this.spawner);
                    this.spawner.setCurrentWave(this.tutWave);
                    this.spawner.startSpawning();
                    this.spawner.spawnGroup.resumeAllAnimationsInGroup();
                    this.bgSpawner.startSpawning();
                    this.player.inputController.enable();
                    this.player.restart();
                    this.player.startMoving();
                    this.game.time.events.resume();
                    this.game.soundRepo.onGogo();
                    this.player.inputController.onSwitchedSide.add(this.switchedSide.bind(this));
                });
            }
            tutorialOver() {
                this.spawner.setCurrentWave(new OKKO.RandomEnemyWave(this.game, this.spawner, new OKKO.DifficultyController(this.player)));
                this.spawner.startSpawning();
            }
            timeFreeze() {
                OKKO.Player.moveSpeed = 0;
                this.spawner.spawnGroup.pauseAllAnimationsInGroup();
                this.player.animController.pause();
            }
            unfreezeTime() {
                OKKO.Player.moveSpeed = this.moveSpeed;
                this.spawner.spawnGroup.resumeAllAnimationsInGroup();
                this.player.animController.resume();
            }
            isSameSide(player, obj) {
                let playerSide = player.position.x > this.game.world.centerX ? 1 : -1;
                let objSide = obj.position.x > this.game.world.centerX ? 1 : -1;
                return playerSide == objSide;
            }
            pauseWhenClose(obj, showWhenSameSide = true, textString = "Tap!", distance = 500) {
                if (obj == null)
                    return;
                let correctSide = (this.isSameSide(this.player, obj) == showWhenSameSide);
                if (this.player.position.y - obj.position.y < this.game.applyResolutionRatio(distance) && correctSide) {
                    this.ui.tweenInImg(this.tutBox).onComplete.addOnce(() => {
                        this.player.inputController.enable();
                    });
                    this.tutText.setText(textString);
                    this.timeFreeze();
                    this.tutorialStep += 1;
                }
            }
            checkIfObjectPassed(obj) {
                if (obj == null) {
                    return;
                }
                ;
                if (this.player.position.y - obj.position.y < 0) {
                    this.tutorialStep += 2;
                }
            }
            waitForInput() {
                this.waitingForInput = true;
            }
            switchedSide() {
                if (this.waitingForInput) {
                    this.ui.tweenOutImg(this.tutBox);
                    if (this.tutHand.visible)
                        this.tutHand.fadeOut();
                    this.unfreezeTime();
                    this.tutorialStep += 1;
                    this.waitingForInput = false;
                    this.player.inputController.disable();
                }
            }
            initSteps() {
                this.stepArray = [];
                this.stepArray.push(() => {
                });
                this.stepArray.push(() => {
                    this.pauseWhenClose(this.tutWave.firstEnemy, true, "Tap to\nchange\nlanes");
                    this.checkIfObjectPassed(this.tutWave.firstEnemy);
                });
                this.stepArray.push(() => {
                    if (!this.tutHand.visible)
                        this.tutHand.fadeInAt(this.game.world.centerX, this.game.world.height * 0.835);
                    this.waitForInput();
                });
                this.stepArray.push(() => {
                    this.pauseWhenClose(this.tutWave.glorb, false, "Tap to\nget the\nglorb");
                    this.checkIfObjectPassed(this.tutWave.glorb);
                });
                this.stepArray.push(() => {
                    if (!this.tutHand.visible)
                        this.tutHand.fadeInAt(this.game.world.centerX, this.game.world.height * 0.835);
                    this.waitForInput();
                });
                this.stepArray.push(() => {
                    if (this.player.tkoSpeedUpTween != null)
                        this.player.tkoSpeedUpTween.stop();
                    if (this.tutText.text.fontSize != this.game.applyResolutionRatio(86))
                        this.tutText.setFontSize(this.game.applyResolutionRatio(86));
                    this.pauseWhenClose(this.tutWave.laneSwitcher, true, "Tap to\navoid\nRed\nJethro", 350);
                    this.checkIfObjectPassed(this.tutWave.laneSwitcher);
                });
                this.stepArray.push(() => {
                    if (!this.tutHand.visible)
                        this.tutHand.fadeInAt(this.game.world.centerX, this.game.world.height * 0.835);
                    this.waitForInput();
                });
                this.stepArray.push(() => {
                    this.game.time.events.add(1000, () => {
                        this.tutorialStep += 1;
                        this.player.inputController.enable();
                    });
                    this.tutorialStep += 1;
                });
                this.stepArray.push(() => {
                });
                this.stepArray.push(() => {
                    this.tutText.setText("Well\ndone!");
                    this.ui.tweenInImg(this.tutBox);
                    this.tutorialStep += 1;
                    this.game.time.events.add(2000, () => {
                        this.tutorialStep += 1;
                    });
                });
                this.stepArray.push(() => {
                });
                this.stepArray.push(() => {
                    this.ui.tweenOutImg(this.tutBox);
                    this.tutorialStep += 1;
                });
                this.stepArray.push(() => {
                    if (this.player.health > 1) {
                        this.tutorialOver();
                        this.tutorialStep += 1;
                    }
                });
                this.stepArray.push(() => {
                    if (this.player.health == 1) {
                        this.tutText.position.x += 15;
                        this.tutText.setFontSize(this.game.applyResolutionRatio(54));
                        this.tutText.setShadowOffset(4);
                        this.tutText.setText("Ouch!\nTry not to hit\nanother robot\nfor 5 seconds,\nor it's over!");
                        this.ui.tweenInImg(this.tutBox);
                        this.player.inputController.disable();
                        this.moveSpeed = OKKO.Player.moveSpeed;
                        this.timeFreeze();
                        this.tutorialStep += 1;
                    }
                });
                this.stepArray.push(() => {
                    this.tutorialStep += 1;
                    this.game.add.tween(this.tutBox.position).to({ x: '+0' }, 5000, Phaser.Easing.Linear.None, true).onComplete.addOnce(() => {
                        this.tutorialStep += 1;
                        this.player.inputController.enable();
                    });
                });
                this.stepArray.push(() => {
                });
                this.stepArray.push(() => {
                    this.unfreezeTime();
                    this.ui.tweenOutImg(this.tutBox).onComplete.addOnce(() => {
                        this.tutorialStep += 1;
                    });
                    this.tutorialStep += 1;
                });
                this.stepArray.push(() => {
                });
                this.stepArray.push(() => {
                    this.game.services.persistence.save(OKKO.PersistenceKeys.TUTORIAL_COMPLETE, true);
                    this.tutHand.destroy();
                    this.tutBox.destroy(true);
                    this.destroy(true);
                });
            }
            doSteps() {
                this.stepArray[this.tutorialStep]();
            }
            update() {
                this.doSteps();
                this.tutText.updateCache();
                if (this.ui.optionsMenu.alive || this.tutorialStep > 16) {
                    this.ui.blackOverlay.inputEnabled = true;
                }
                else {
                    this.ui.blackOverlay.inputEnabled = false;
                }
            }
        }
        OKKO.Tutorial = Tutorial;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class AreYouSurePopup extends Funday.UI.View {
            constructor(game) {
                super(game);
                let bg = game.createImage(0, 0, Funday.OkKo.SpriteLibrary.menus.add_box_2);
                bg.anchor.set(0.5, 0.5);
                this.bg = bg;
                this.addChild(bg);
                this.yesButton = game.createButton(bg.position.x + game.applyResolutionRatio(200), bg.position.y + game.applyResolutionRatio(200), Funday.OkKo.SpriteLibrary.menus.yes_button);
                this.noButton = game.createButton(bg.position.x - game.applyResolutionRatio(200), bg.position.y + game.applyResolutionRatio(200), Funday.OkKo.SpriteLibrary.menus.no_button);
                this.blackOverlay = game.add.graphics(0, 0, this);
                this.blackOverlay.beginFill(0x000000, 0.4);
                this.blackOverlay.drawRect(-this.game.width / 2, -this.game.height / 2, this.game.world.width, this.game.world.height);
                this.blackOverlay.inputEnabled = true;
                this.addChild(this.blackOverlay);
                this.popupGroup = this.game.add.group(this);
                this.popupGroup.kill();
                this.blackOverlay.kill();
                this.popupGroup.addChild(bg);
                this.popupGroup.addChild(this.yesButton);
                this.popupGroup.addChild(this.noButton);
            }
            addText(caption, size = 100, offsetY = 0) {
                let text = new Funday.UI.ShadowTextGroup(this.game, 'KOfont', caption, this.game.applyResolutionRatio(size), 0xFFFF00, 5);
                text.position = new Phaser.Point(this.bg.x, this.bg.y);
                text.setShadowColorAndAlpha(0x9d06eb, 1);
                text.setAnchor(0.5, 0.5);
                text.position.y = -this.game.applyResolutionRatio(offsetY);
                this.popupGroup.addChild(text);
            }
            show() {
                this.blackOverlay.revive();
                this.popupGroup.revive();
                this.blackOverlay.alpha = 0;
                this.popupGroup.scale.set(0.0, 0.0);
                this.game.add.tween(this.blackOverlay).to({ alpha: 1.0 }, 250, Phaser.Easing.Linear.None, true);
                this.game.add.tween(this.popupGroup.scale).to({ x: 1.0, y: 1.0 }, 250, Phaser.Easing.Back.Out, true);
            }
            hide() {
                this.game.add.tween(this.blackOverlay).to({ alpha: 0.0 }, 350, Phaser.Easing.Linear.None, true);
                this.game.add.tween(this.popupGroup.scale).to({ x: 0.0, y: 0.0 }, 350, Phaser.Easing.Exponential.Out, true).onComplete.addOnce(() => {
                    this.blackOverlay.kill();
                    this.popupGroup.kill();
                });
            }
            clearEvents() {
                this.yesButton.onUp.dispose();
                this.noButton.onUp.dispose();
            }
        }
        OKKO.AreYouSurePopup = AreYouSurePopup;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class DistanceCounter extends Phaser.Group {
            constructor(game, yPos) {
                super(game);
                this.maxRightPos = 0;
                let distanceText = new Phaser.BitmapText(game, game.SDKButtonBounds.right + game.applyResolutionRatio(100), yPos, 'OutlineFont', '0');
                distanceText.fontSize = game.applyResolutionRatio(92);
                distanceText.anchor.set(0, 0.5);
                this.add(distanceText);
                let highscoreText = new Phaser.BitmapText(game, game.applyResolutionRatio(200), yPos, 'OutlineFont', '/ 1000');
                highscoreText.fontSize = game.applyResolutionRatio(92);
                highscoreText.anchor.set(0, 0.5);
                this.add(highscoreText);
                this.distanceText = distanceText;
                this.highscoreText = highscoreText;
            }
            updateText(distance, highscore) {
                this.distanceText.setText(OKKO.UIController.convertGameUnitToMeters(distance).toString());
                this.highscoreText.setText("/" + OKKO.UIController.convertGameUnitToMeters(highscore));
                if (this.distanceText.right > this.maxRightPos || distance == 0) {
                    this.maxRightPos = this.distanceText.right;
                }
                this.highscoreText.left = Phaser.Math.linearInterpolation([this.highscoreText.left, this.maxRightPos + this.game.applyResolutionRatio(0)], 0.5);
            }
        }
        OKKO.DistanceCounter = DistanceCounter;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class OptionsMenu extends Phaser.Sprite {
            constructor(game, x, y, spriteId) {
                super(game, x, y, spriteId.key, spriteId.frame);
                let verticalPadding = game.applyResolutionRatio(32);
                let musicToggleButtonInfo = this.createToggleButton(-this.height / 2.5 - verticalPadding, "Music", this.onMusicButtonUp);
                let audioToggoleButtonInfo = this.createToggleButton(musicToggleButtonInfo.button.bottom + verticalPadding, "SFX", this.onAudioButtonUp);
                let resetProgressButton = this.createTextButton(audioToggoleButtonInfo.button.bottom + verticalPadding, "Clear all progress", this.onClearProgressButtonUp);
                let closeMenuButton = this.createTextButton(this.height / 3.5 + verticalPadding, "Back to game", this.onCloseButtonUp);
                let versionNumber = game.add.text(0, 0, 'Version: ' + game.version.getNameAndVersionString());
                versionNumber.fontSize = game.applyResolutionRatio(30);
                versionNumber.anchor.set(1, 0);
                versionNumber.addColor('#000000', 0);
                this.addChild(versionNumber);
                this.areYouSurePopup = new OKKO.AreYouSurePopup(game);
                this.areYouSurePopup.position.set(0, 0);
                this.areYouSurePopup.addText("Are you sure\nyou want to\nreset your progress?", 62, 75);
                this.addChild(this.areYouSurePopup);
            }
            checkForPauseConditions(levelController) {
                this.wasInputEnabled = !levelController.player.inputController.disabled;
                levelController.player.inputController.disable();
                this.gameWasPaused = levelController.isPaused();
                if (this.gameWasPaused == false) {
                    levelController.pauseSystems();
                }
            }
            checkForResumeConditions(levelController) {
                if (this.gameWasPaused == false) {
                    levelController.resumeSystems();
                }
                if (this.wasInputEnabled) {
                    levelController.player.inputController.enable();
                }
                else {
                    levelController.player.inputController.disable();
                }
            }
            createToggleButton(y, caption, callback) {
                let optionToggleButtonObjects = new OptionToggleButtonObjects();
                let game = this.game;
                let button = new Funday.UI.Button(game, 0, y, Funday.OkKo.SpriteLibrary.menus.option_box.key, Funday.OkKo.SpriteLibrary.menus.option_box.frame);
                button.position.y += (button.height / 2);
                this.addChild(button);
                optionToggleButtonObjects.button = button;
                let text = new Funday.UI.ShadowTextGroup(game, 'KOfont', caption, game.applyResolutionRatio(70), 0xFFFF00, 6);
                text.position = new Phaser.Point(0, 10);
                text.setShadowColorAndAlpha(0x9d06eb, 1);
                button.button.addChild(text);
                button.onUp.add(callback, this, 0, optionToggleButtonObjects);
                let horizontalPadding = game.applyResolutionRatio(32);
                text.position.x = button.button.left + (text.width * .5) + horizontalPadding;
                optionToggleButtonObjects.text = text;
                let icon = button.addIconSprite(Funday.OkKo.SpriteLibrary.menus.checkmark.key, Funday.OkKo.SpriteLibrary.menus.checkmark.frame);
                icon.position.x = button.button.right - (icon.width * .5) - horizontalPadding;
                optionToggleButtonObjects.icon = icon;
                return optionToggleButtonObjects;
            }
            createTextButton(y, caption, callback) {
                let game = this.game;
                let button = new Funday.UI.Button(game, 0, y, Funday.OkKo.SpriteLibrary.menus.option_box.key, Funday.OkKo.SpriteLibrary.menus.option_box.frame);
                button.position.y += (button.height / 2);
                this.addChild(button);
                let text = new Funday.UI.ShadowTextGroup(game, 'KOfont', caption, game.applyResolutionRatio(70), 0xFFFF00, 6);
                text.position = new Phaser.Point(0, 10);
                text.setShadowColorAndAlpha(0x9d06eb, 1);
                button.button.addChild(text);
                button.onUp.add(callback, this, 0);
                return button;
            }
            onMusicButtonUp(buttonInfo) {
                let game = this.game;
                if (game.soundRepo.music.mute) {
                    game.soundRepo.unMuteMusic();
                }
                else {
                    game.soundRepo.muteMusic();
                }
                let frameName = game.soundRepo.music.mute ? "close" : "checkmark";
                buttonInfo.icon.loadTexture(Funday.OkKo.SpriteLibrary.menus.checkmark.key, frameName);
            }
            onAudioButtonUp(buttonInfo) {
                let game = this.game;
                if (game.soundRepo.isSFXMuted()) {
                    game.soundRepo.unMuteSFX();
                }
                else {
                    game.soundRepo.muteSFX();
                }
                let frameName = game.soundRepo.isSFXMuted() ? "close" : "checkmark";
                buttonInfo.icon.loadTexture(Funday.OkKo.SpriteLibrary.menus.checkmark.key, frameName);
            }
            onClearProgressButtonUp() {
                this.areYouSurePopup.show();
                this.areYouSurePopup.yesButton.onUp.addOnce(() => {
                    this.clearProgress();
                    this.areYouSurePopup.hide();
                    this.areYouSurePopup.clearEvents();
                });
                this.areYouSurePopup.noButton.onUp.addOnce(() => {
                    this.areYouSurePopup.hide();
                    this.areYouSurePopup.clearEvents();
                });
            }
            clearProgress() {
                let defaultState = new OKKO.GameState().getDefaultGameState();
                for (var key in defaultState) {
                    this.game.services.persistence.save(key, defaultState[key]);
                }
                location.reload();
            }
            onCloseButtonUp() {
                this.parent.showOptions();
            }
        }
        OKKO.OptionsMenu = OptionsMenu;
        class OptionToggleButtonObjects {
            constructor() {
                this.button = null;
                this.icon = null;
                this.text = null;
            }
        }
        OKKO.OptionToggleButtonObjects = OptionToggleButtonObjects;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class PowerBar extends Phaser.Group {
            constructor(game, playerPowerAndScore) {
                super(game);
                this.shadowOffset = new Phaser.Point(7, 7);
                this.game = game;
                this.playerPowerAndScore = playerPowerAndScore;
                let yPos = game.world.height * 0.92;
                let yBarPos = yPos + game.applyResolutionRatio(44);
                this.endShadow = this.game.add.image(0, yBarPos + this.shadowOffset.y, Funday.OkKo.SpriteLibrary.game.power_bar_end.key, Funday.OkKo.SpriteLibrary.game.power_bar_end.frame, this);
                this.midShadow = this.game.add.image(game.applyResolutionRatio(150) + this.shadowOffset.x, yBarPos + this.shadowOffset.y, Funday.OkKo.SpriteLibrary.game.power_bar_middle.key, Funday.OkKo.SpriteLibrary.game.power_bar_middle.frame, this);
                this.endShadow.tint = 0x7225f3;
                this.midShadow.tint = 0x7225f3;
                this.end = this.game.add.image(0, yBarPos, Funday.OkKo.SpriteLibrary.game.power_bar_end.key, Funday.OkKo.SpriteLibrary.game.power_bar_end.frame, this);
                this.mid = this.game.add.image(game.applyResolutionRatio(150), yBarPos, Funday.OkKo.SpriteLibrary.game.power_bar_middle.key, Funday.OkKo.SpriteLibrary.game.power_bar_middle.frame, this);
                this.end.tint = 0xdf9aff;
                this.mid.tint = 0xdf9aff;
                let powerBarStart = this.game.add.image(game.applyResolutionRatio(60), yPos, Funday.OkKo.SpriteLibrary.game.power_bar_start.key, Funday.OkKo.SpriteLibrary.game.power_bar_start.frame, this);
                let powerBarGlorb = this.game.add.image(game.applyResolutionRatio(100), yPos + 8, Funday.OkKo.SpriteLibrary.game.power_bar_glorb.key, Funday.OkKo.SpriteLibrary.game.power_bar_glorb.frame, this);
                this.midShadow.scale.x = this.playerPowerAndScore.getMaxPower();
                this.endShadow.position.x = this.midShadow.position.x + this.midShadow.width;
                this.mid.scale.set(0, 1);
                this.end.position.x = this.mid.position.x + this.mid.width;
            }
            updateSize() {
                this.game.add.tween(this.midShadow.scale).to({ x: this.playerPowerAndScore.getMaxPower() }, 400, Phaser.Easing.Exponential.Out, true);
                this.game.add.tween(this.endShadow.position).to({ x: this.midShadow.position.x + this.midShadow.width / this.midShadow.scale.x * this.playerPowerAndScore.getMaxPower() }, 400, Phaser.Easing.Exponential.Out, true);
            }
            update() {
                let targetScale = this.midShadow.scale.x;
                if (this.playerPowerAndScore.getPower() > 0) {
                    targetScale = this.playerPowerAndScore.getPower() / this.playerPowerAndScore.getMaxPower() * this.midShadow.scale.x;
                }
                else {
                    if (this.midShadow.scale.x != this.playerPowerAndScore.getMaxPower())
                        this.updateSize();
                }
                this.mid.scale.set(Phaser.Math.linearInterpolation([this.mid.scale.x, targetScale], 0.1), 1);
                this.end.position.x = this.mid.position.x + this.mid.width;
            }
        }
        OKKO.PowerBar = PowerBar;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class ShopUpgradeButton extends Funday.UI.Button {
            constructor(game, x, y, spriteId) {
                super(game, x, y, spriteId.key, spriteId.frame);
                this.upgradeBars = [];
                this.meterUpgrade = 0;
                this.button.onInputOver.add(this.showBarOnHover, this);
                this.button.onInputOut.add(this.hideBarOnOut, this);
                for (let i = 0; i < 6; i++) {
                    let upgradeBar = game.createSprite(game.applyResolutionRatio(-229 + 87 * i), game.applyResolutionRatio(43.5 + 26), Funday.OkKo.SpriteLibrary.shop.upgrade_bar_shop);
                    upgradeBar.anchor.set(0.5, 0.5);
                    upgradeBar.visible = false;
                    this.button.addChild(upgradeBar);
                    this.upgradeBars.push(upgradeBar);
                }
                this.dottedBar = game.createSprite(0, 0, Funday.OkKo.SpriteLibrary.shop.upgrade_bar_selection_shop);
                this.dottedBar.anchor.set(0.5);
                this.dottedBar.visible = false;
                this.button.addChild(this.dottedBar);
                this.headline = new Phaser.BitmapText(this.game, -this.button.width / 2 + game.applyResolutionRatio(40), game.applyResolutionRatio(-15), 'KOfont', 'Upgrade\nGlorb Power!');
                this.headline.anchor.set(0, 0.5);
                this.headline.fontSize = game.applyResolutionRatio(42);
                this.headline.tint = 0x000000;
                this.button.addChild(this.headline);
                let priceText = new Phaser.BitmapText(game, this.button.width / 2 - game.applyResolutionRatio(115), game.applyResolutionRatio(-66), 'OutlineFont', '0 / 0');
                priceText.fontSize = game.applyResolutionRatio(72);
                priceText.anchor.set(1, 0.5);
                this.button.addChild(priceText);
                this.priceText = priceText;
                this.coinImg = new Phaser.Sprite(this.game, this.button.width / 2 - game.applyResolutionRatio(38), game.applyResolutionRatio(-53), Funday.OkKo.SpriteLibrary.game.coin.key, Funday.OkKo.SpriteLibrary.game.coin.frame);
                this.coinImg.anchor.set(1, 0.5);
                this.coinImg.scale.set(0.75, 0.75);
                this.button.addChild(this.coinImg);
            }
            showBarOnHover() {
                if (this.meterUpgrade < this.upgradeBars.length) {
                    this.dottedBar.position = this.upgradeBars[this.meterUpgrade].position;
                    this.dottedBar.alpha = 0.25;
                    this.dottedBar.visible = true;
                    this.game.add.tween(this.dottedBar).to({ alpha: 1.0 }, 800, Phaser.Easing.Cubic.Out, true, 0, -1, true);
                }
            }
            hideBarOnOut() {
                this.game.tweens.removeFrom(this.dottedBar);
                this.game.add.tween(this.dottedBar).to({ alpha: 0.0 }, 200, Phaser.Easing.Linear.None, true, 0).onComplete.addOnce(() => {
                    this.dottedBar.visible = false;
                });
            }
            updateButton(price, meterUpgrade) {
                this.meterUpgrade = meterUpgrade;
                this.updatePrice(price);
                this.updateBars();
                this.checkFullyUpgraded();
            }
            checkFullyUpgraded() {
                if (this.meterUpgrade >= 6) {
                    this.headline.text = "Fully\nUpgraded!";
                    this.coinImg.visible = false;
                    this.game.achievements.onFullyUpgraded();
                    this.onUp.dispose();
                    this.button.onInputUp.dispose();
                    this.button.onInputDown.dispose();
                    this.button.onInputOver.dispose();
                    this.button.onInputOut.dispose();
                }
            }
            updatePrice(price) {
                if (price == undefined) {
                    this.priceText.setText("");
                    return;
                }
                this.priceText.setText(price.toString());
            }
            updateBars() {
                this.dottedBar.visible = false;
                for (let i = 0; i < this.meterUpgrade; i++) {
                    if (!this.upgradeBars[i].visible) {
                        this.upgradeBars[i].scale.set(1.5, 1.5);
                        this.upgradeBars[i].alpha = 0.5;
                        this.game.add.tween(this.upgradeBars[i]).to({ alpha: 1.0 }, 100, Phaser.Easing.Linear.None, true);
                        this.game.add.tween(this.upgradeBars[i].scale).to({ x: 1.0, y: 1.0 }, 500, Phaser.Easing.Bounce.Out, true);
                    }
                    this.upgradeBars[i].visible = true;
                }
            }
        }
        OKKO.ShopUpgradeButton = ShopUpgradeButton;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class PromptData {
            constructor(img) {
                this.fadeInTweens = [];
                this.fadeOutTweens = [];
                this.img = img;
            }
        }
        OKKO.PromptData = PromptData;
        class UIAnimator {
            constructor(game, blackOverlay) {
                this.game = game;
                this.blackOverlay = blackOverlay;
                this.activePrompts = [];
            }
            findInActivePrompts(img) {
                for (let i = 0; i < this.activePrompts.length; i++) {
                    if (this.activePrompts[i].img == img) {
                        return this.activePrompts[i];
                    }
                }
                return null;
            }
            clear() {
                if (this.activePrompts.length > 0) {
                    for (let i = 0; i < this.activePrompts.length; i++) {
                        this.activePrompts[i].img.kill();
                    }
                }
                this.activePrompts = [];
                this.blackOverlay.kill();
            }
            tweenInImg(img) {
                if (this.findInActivePrompts(img) != null) {
                    return;
                }
                img.scale.set(0.0, 0.0);
                img.alpha = 1.0;
                img.revive();
                if (this.activePrompts.length == 0) {
                    this.blackOverlay.alpha = 0;
                    this.blackOverlay.revive();
                    this.game.add.tween(this.blackOverlay).to({ alpha: 1.0 }, 350, Phaser.Easing.Linear.None, true);
                }
                let scaleInTween = this.game.add.tween(img.scale).to({ x: 1.0, y: 1.0 }, 500, Phaser.Easing.Elastic.Out, true, 0);
                let promptData = new PromptData(img);
                promptData.fadeInTweens.push(scaleInTween);
                this.activePrompts.push(promptData);
                this.game.soundRepo.onPopUpExpand();
                return scaleInTween;
            }
            tweenOutImg(img) {
                let promptData = this.findInActivePrompts(img);
                if (promptData.fadeOutTweens.length > 0)
                    return;
                this.game.tweens.remove(promptData.fadeInTweens[0]);
                promptData.fadeInTweens = [];
                let fadeOutTween = this.game.add.tween(img).to({ alpha: 0.0 }, 400, Phaser.Easing.Linear.None, true);
                let scaleOutTween = this.game.add.tween(img.scale).to({ x: 0.0, y: 0.0 }, 500, Phaser.Easing.Exponential.Out, true, 0);
                promptData.fadeOutTweens.push(fadeOutTween);
                promptData.fadeOutTweens.push(scaleOutTween);
                scaleOutTween.onComplete.addOnce(() => {
                    promptData.fadeOutTweens = [];
                    img.kill();
                });
                if (this.activePrompts.length == 1) {
                    let fadeOutTween = this.game.add.tween(this.blackOverlay).to({ alpha: 0.0 }, 400, Phaser.Easing.Linear.None, true);
                    fadeOutTween.onComplete.addOnce(() => {
                        this.blackOverlay.kill();
                    });
                }
                this.activePrompts.splice(this.activePrompts.indexOf(promptData, 0), 1);
                this.game.soundRepo.onPopUpMinimize();
                return scaleOutTween;
            }
        }
        OKKO.UIAnimator = UIAnimator;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class UIController extends Phaser.Group {
            constructor(game, playerPowerAndScore, gameScreen, spawner) {
                super(game);
                this.textMaxWidth = 0;
                this.game = game;
                this.spawner = spawner;
                this.gameScreen = gameScreen;
                this.playerPowerAndScore = playerPowerAndScore;
                this.powerBar = new OKKO.PowerBar(game, playerPowerAndScore);
                this.blackOverlay = game.add.graphics(0, 0, this);
                this.blackOverlay.beginFill(0x000000, 0.4);
                this.blackOverlay.drawRect(0, 0, this.game.world.width, this.game.world.height);
                this.blackOverlay.inputEnabled = true;
                this.blackOverlay.kill();
                this.gameOverImage = game.createSprite(game.world.centerX, game.world.centerY, Funday.OkKo.SpriteLibrary.menus.game_over_box, this);
                this.gameOverImage.anchor.set(0.5, 0.5);
                let gameOverText = new Funday.UI.ShadowTextGroup(game, 'KOfont', 'Game Over\nTry again!', game.applyResolutionRatio(56), 0xFFFF00, 5);
                gameOverText.position = new Phaser.Point(this.game.applyResolutionRatio(-175), this.game.applyResolutionRatio(60));
                gameOverText.setShadowColorAndAlpha(0x9d06eb, 1);
                gameOverText.rotation = -6 * Math.PI / 180;
                this.gameOverImage.addChild(gameOverText);
                this.gameOverImage.kill();
                this.animator = new OKKO.UIAnimator(game, this.blackOverlay);
                let safeTop = this.game.services.resolution.getNotchSafeTop();
                this.pauseBtn = this.game.createButton(this.game.world.width - game.applyResolutionRatio(25), game.applyResolutionRatio(25) + safeTop, Funday.OkKo.SpriteLibrary.game.pause_button);
                this.pauseBtn.onUp.add(this.showOptions.bind(this));
                this.pauseBtn.scale.set(1, 1);
                this.pauseBtn.position.x -= this.pauseBtn.width / 2;
                this.pauseBtn.position.y += this.pauseBtn.height / 2;
                this.coinImg = this.game.add.image(this.game.world.width - this.game.applyResolutionRatio(150), this.pauseBtn.y, Funday.OkKo.SpriteLibrary.game.coin.key, Funday.OkKo.SpriteLibrary.game.coin.frame);
                this.coinImg.anchor.set(1, 0.5);
                let coinText = new Phaser.BitmapText(game, this.coinImg.position.x - this.coinImg.width - game.applyResolutionRatio(25), this.pauseBtn.y - 0.175 * game.applyResolutionRatio(92), 'OutlineFont', '0 / 0');
                coinText.fontSize = game.applyResolutionRatio(92);
                coinText.anchor.set(1, 0.5);
                this.coinText = coinText;
                this.distanceCounter = new OKKO.DistanceCounter(game, this.coinText.y);
                this.optionsMenu = new OKKO.OptionsMenu(game, this.game.world.centerX, this.game.world.centerY, Funday.OkKo.SpriteLibrary.menus.scroll_box_ads);
                this.optionsMenu.anchor.set(0.5);
                this.optionsMenu.kill();
                this.reviveAdPrompt = new OKKO.YesNoPrompt(game, this, Funday.OkKo.SpriteLibrary.menus.add_box);
                this.reviveAdPrompt.addText('Watch an ad\n    to revive?', 86, 100);
                this.reviveAdPrompt.y -= this.game.applyResolutionRatio(200);
                this.headstartPrompt = new OKKO.YesNoPrompt(game, this, Funday.OkKo.SpriteLibrary.menus.add_box_2);
                this.headstartPrompt.addText('Watch an ad\nto start with\nGlorb energy?', 78, 70);
                this.headstartPrompt.y -= this.game.applyResolutionRatio(200);
                this.reviveAdPrompt.kill();
                this.headstartPrompt.kill();
                this.add(this.powerBar);
                this.add(this.blackOverlay);
                this.add(this.reviveAdPrompt);
                this.add(this.headstartPrompt);
                this.add(this.coinImg);
                this.add(this.pauseBtn);
                this.add(this.distanceCounter);
                this.add(this.coinText);
                this.add(this.optionsMenu);
                window.ui = this;
            }
            showOptions() {
                if (this.optionsMenu.alive) {
                    this.tweenOutImg(this.optionsMenu);
                    this.optionsMenu.checkForResumeConditions(this.gameScreen.levelController);
                    if (this.game.screenManager.currentScreen instanceof OKKO.GameScreen) {
                        this.game.services.analytics.trackLocation(Funday.Service.GameLocations.PLAY);
                    }
                    else if (this.game.screenManager.currentScreen instanceof OKKO.ShopScreen) {
                        this.game.services.analytics.trackLocation(Funday.Service.GameLocations.SHOP);
                    }
                }
                else {
                    this.tweenInImg(this.optionsMenu);
                    this.optionsMenu.checkForPauseConditions(this.gameScreen.levelController);
                    this.game.services.analytics.trackLocation(Funday.Service.GameLocations.PAUSE);
                }
            }
            showGameOver(resetCallback, context) {
                this.tweenInImg(this.gameOverImage).onComplete.addOnce(() => {
                    this.game.time.events.add(750, resetCallback, context);
                });
                this.currentPrompt = this.gameOverImage;
            }
            showYesNoPrompt(prompt, yesCallback, noCallback, yesContext, noContext) {
                let scaleInTween = this.tweenInImg(prompt);
                scaleInTween.onComplete.addOnce(() => {
                    prompt.yesButton.onUp.addOnce(yesCallback, yesContext);
                    prompt.noButton.onUp.addOnce(noCallback, noContext);
                });
                prompt.clearEvents();
                this.currentPrompt = prompt;
            }
            hideCurrentPrompt() {
                let promptTween = this.tweenOutImg(this.currentPrompt);
                this.currentPrompt = null;
                return promptTween;
            }
            tweenInImg(img) {
                return this.animator.tweenInImg(img);
            }
            tweenOutImg(img) {
                return this.animator.tweenOutImg(img);
            }
            static convertGameUnitToMeters(num) {
                return Math.round(12 / 700 * num);
            }
            static convertMeterstoGameUnits(num) {
                return Math.round(700 / 12 * num);
            }
            update() {
                this.coinText.setText((this.playerPowerAndScore.getCoins()).toString());
                this.distanceCounter.updateText(this.spawner.getDistance(), this.playerPowerAndScore.getDistanceHighscore());
                this.powerBar.update();
            }
        }
        OKKO.UIController = UIController;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class YesNoPrompt extends Phaser.Image {
            constructor(game, uiController, bgSpriteId) {
                super(game, game.world.centerX, game.world.centerY, bgSpriteId.key, bgSpriteId.frame);
                this.anchor.set(0.5, 0.5);
                this.position.y -= game.applyResolutionRatio(150);
                this.yesButton = this.game.createButton(game.applyResolutionRatio(200), game.applyResolutionRatio(200), Funday.OkKo.SpriteLibrary.menus.yes_button);
                this.noButton = this.game.createButton(-game.applyResolutionRatio(200), game.applyResolutionRatio(200), Funday.OkKo.SpriteLibrary.menus.no_button);
                this.noButton.scale.set(0.75);
                let btnWidth = this.yesButton.width;
                let btnHeight = this.yesButton.height;
                let hugeRect = new Phaser.Rectangle(-btnWidth, -btnHeight, btnWidth * 2, btnHeight * 2);
                this.yesButton.button.hitArea = hugeRect;
                this.noButton.button.hitArea = hugeRect;
                this.addChild(this.yesButton);
                this.addChild(this.noButton);
            }
            addText(caption, size, offsetY) {
                let text = new Funday.UI.ShadowTextGroup(this.game, 'KOfont', caption, this.game.applyResolutionRatio(size), 0xFFFF00, 5);
                text.position = new Phaser.Point(0, 0);
                text.setShadowColorAndAlpha(0x9d06eb, 1);
                text.setAnchor(0.5, 0.5);
                text.position.y = -this.game.applyResolutionRatio(offsetY);
                this.addChild(text);
            }
            clearEvents() {
                this.yesButton.onUp.dispose();
                this.noButton.onUp.dispose();
            }
        }
        OKKO.YesNoPrompt = YesNoPrompt;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class AvgCoinCalculator {
            constructor(timeInSeconds, coinSpawnRate) {
                let diff = new OKKO.DifficultyController(null);
                this.diff = diff;
                let totalTime = 0;
                let waveNum = 0;
                let totalCoins = 0;
                let totalDistance = 0;
                while (totalTime < timeInSeconds) {
                    let waveDistance = diff.spawnDistance * diff.totalSpawns;
                    let waveTime = waveDistance / diff.playerSpeed;
                    let laneSwitcherSpawns = diff.totalSpawns * diff.laneSwitcherProbability;
                    let coinSpawns = (diff.totalSpawns - laneSwitcherSpawns) * (coinSpawnRate);
                    waveNum += 1;
                    console.log("Wave:", waveNum, "spawned", coinSpawns, "coins");
                    totalTime += waveTime + 1;
                    totalDistance += waveDistance;
                    totalCoins += coinSpawns;
                    diff.advanceDifficulty();
                }
                totalDistance = OKKO.UIController.convertGameUnitToMeters(totalDistance);
                console.log("On average spawned a total of", totalCoins, "coins after", timeInSeconds, "seconds. (Distance of", totalDistance, ")");
                console.log("Approx coin per second is", (totalCoins / timeInSeconds));
            }
        }
        OKKO.AvgCoinCalculator = AvgCoinCalculator;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class DebugMenu extends Phaser.Group {
            constructor(game) {
                super(game);
                this.fields = [];
                this.position.y += 60;
                this.background = game.add.graphics(0, 0, this);
                this.game.input.keyboard.addKey(Phaser.KeyCode.D).onUp.add(() => {
                    this.visible = !this.visible;
                });
                this.visible = false;
            }
            updateBackground() {
                this.background.beginFill(0x000000);
                this.background.drawRect(0, 0, 400, this.fields.length * this.fields[0].height * 2);
                this.background.endFill();
            }
            addField(label, value) {
                let field = new Phaser.Text(this.game, 10, 10 + this.fields.length * 80, label + ": " + value);
                field.anchor.set(0, 0);
                field.font = 'Arial Black';
                field.fontSize = 32;
                field.fontWeight = 'bold';
                field.addColor('#ffffff', 0);
                this.add(field);
                this.fields.push(field);
                this.updateBackground();
            }
            addButton(label, callback) {
                let field = new Phaser.Text(this.game, 10, 10 + this.fields.length * 80 + 15, label);
                field.anchor.set(0, 0);
                field.font = 'Arial Black';
                field.fontSize = 32;
                field.fontWeight = 'bold';
                field.addColor('#ffffff', 0);
                let btnBackground = this.game.add.graphics(0, 10 + this.fields.length * 80, this);
                btnBackground.beginFill(0xFF00FF);
                btnBackground.drawRect(0, 0, field.width + 20, field.height * 1.5);
                btnBackground.endFill();
                field.inputEnabled = true;
                field.events.onInputUp.add(callback);
                this.add(btnBackground);
                this.add(field);
                this.fields.push(field);
                this.updateBackground();
            }
            update() {
            }
        }
        OKKO.DebugMenu = DebugMenu;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class FXSprite extends Phaser.Sprite {
            constructor(game, spriteId, animationName, startFrame, endFrame, fps = 24, loop = false) {
                super(game, 0, 0, spriteId.key, spriteId.frame);
                this.anchor.set(0.5, 0.5);
                this.anim = this.animations.add(animationName, Phaser.Animation.generateFrameNames(animationName, startFrame, endFrame, '', 2), fps, loop);
                this.anim.play();
                if (!loop)
                    this.anim.killOnComplete = true;
            }
            positionAt(obj, offsetX = 0, offsetY = 0) {
                this.position.x = obj.position.x + this.game.applyResolutionRatio(offsetX);
                this.position.y = obj.position.y + this.game.applyResolutionRatio(offsetY);
            }
            moveWithPlayerSpeed(slowDownFactor = 1.0) {
                this.game.add.tween(this.position).to({ y: this.position.y + OKKO.Player.moveSpeed * slowDownFactor }, 1000, Phaser.Easing.Linear.None, true);
            }
            kill() {
                this.alive = false;
                this.visible = false;
                this.position.x = -10000;
                return this;
            }
            reset(x, y, hp) {
                this.anim.play();
                return super.reset(x, y, hp);
            }
            update() {
                if (!this.alive) {
                    if (this.exists)
                        this.exists = false;
                    return;
                }
            }
        }
        OKKO.FXSprite = FXSprite;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class GroupUtilityFunctions {
            static pauseAllAnimationsInGroup(group) {
                group.forEach((child) => {
                    if (child instanceof OKKO.GameObj && child.animations.currentAnim != null) {
                        child.animations.paused = true;
                    }
                });
            }
            static resumeAllAnimationsInGroup(group) {
                group.forEach((child) => {
                    if (child instanceof OKKO.GameObj && child.animations.currentAnim != null) {
                        child.animations.paused = false;
                    }
                });
            }
        }
        OKKO.GroupUtilityFunctions = GroupUtilityFunctions;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class OverHillTweener {
            constructor(game, obj, topOfHillCallback) {
                this.pctFullSpeed = { value: 0.0 };
                this.topOfHill = false;
                this.yEnd = 0;
                this.tweens = [];
                this.obj = obj;
                this.game = game;
                this.currentSpeed = OKKO.Player.moveSpeed;
                this.topOfHillCallback = topOfHillCallback;
                this.tweenDuration = this.calcTweenDuration(700);
            }
            calcTweenDuration(speed) {
                if (speed <= 0.1)
                    return Number.MAX_VALUE;
                return 3500 * 700 / speed;
            }
            isTopOfHill() {
                return this.topOfHill;
            }
            getPctFullSpeed() {
                return this.pctFullSpeed.value;
            }
            setYEnd(val) {
                this.yEnd = val;
            }
            startTweens() {
                this.side = this.obj.position.x > this.game.world.centerX ? 1 : -1;
                this.obj.scale.set(0.01, 0.01);
                this.obj.alpha = 0.0;
                this.pctFullSpeed = { value: 0 };
                this.topOfHill = false;
                this.currentSpeed = -1;
                let alphaTween = this.game.add.tween(this.obj).to({ alpha: 1.0 }, 400, Phaser.Easing.Linear.None, true);
                let scaleTween = this.game.add.tween(this.obj.scale).to({ x: 0.96, y: 0.96 }, 1 * this.tweenDuration, Phaser.Easing.Quadratic.In, true);
                let posTweenY = this.game.add.tween(this.obj.position).to({ y: this.yEnd }, this.tweenDuration * 0.4, Phaser.Easing.Cubic.Out, true);
                this.tweens = [scaleTween, posTweenY, alphaTween];
                posTweenY.onComplete.addOnce(this.topOfHillTweens, this);
                scaleTween.onComplete.addOnce(this.allTweensDone, this);
                scaleTween.onUpdateCallback(this.checkSpeedChange, this);
            }
            topOfHillTweens() {
                this.topOfHill = true;
                let fullSpeedTween = this.game.add.tween(this.pctFullSpeed).to({ value: 1.0 }, this.tweenDuration * 0.6, Phaser.Easing.Quadratic.In, true);
                this.addTween(fullSpeedTween);
                this.topOfHillCallback();
            }
            fastForwardTweens(pct) {
                this.tweens[0].timeline[0].dt = this.tweenDuration * pct;
                let posTweenY = this.tweens[1];
                let alphaTween = this.tweens[2];
                this.game.tweens.remove(alphaTween);
                this.obj.alpha = 1.0;
                if (pct >= 0.4) {
                    this.obj.position.y = this.yEnd;
                    this.game.tweens.remove(posTweenY);
                    this.topOfHillTweens();
                    let pctFullSpeedTween = this.tweens[3];
                    let pctFullSpeedData = pctFullSpeedTween.generateData(60);
                    let tweenDt = this.tweenDuration * (pct - 0.4);
                    let numberOfFrames = Math.floor(pctFullSpeedData.length * tweenDt / pctFullSpeedTween.totalDuration);
                    for (let i = 0; i < numberOfFrames; i++) {
                        this.obj.position.y += pctFullSpeedData[i].value * this.game.applyResolutionRatio(700) * 1 / 60;
                    }
                    pctFullSpeedTween.timeline[0].dt = this.tweenDuration * (pct - 0.4);
                }
                else {
                    posTweenY.timeline[0].dt = this.tweenDuration * Math.min(0.4, pct);
                }
            }
            addTween(tween) {
                this.tweens.push(tween);
                tween.timeScale = this.tweens[0].timeScale;
            }
            allTweensDone() {
                this.tweens.forEach(tween => {
                    this.game.tweens.remove(tween);
                });
                this.tweens = [];
            }
            checkSpeedChange() {
                if (this.currentSpeed != OKKO.Player.moveSpeed) {
                    let newTimeScale = this.calcTweenDuration(this.game.applyResolutionRatio(700)) / this.calcTweenDuration(OKKO.Player.moveSpeed);
                    this.tweens.forEach(tween => {
                        tween.timeScale = newTimeScale;
                    });
                    this.currentSpeed = OKKO.Player.moveSpeed;
                }
            }
            update() {
            }
        }
        OKKO.OverHillTweener = OverHillTweener;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class DummyWave {
            constructor(game, spawner, player) {
                this.difficulty = null;
                this.spawnCalled = 0;
                this.spawnDistance = 250;
                this.totalSpawns = 1000;
                this.maxSideChanges = 0;
                this.laneSwitcherProbability = 0.0;
                this.spawnPos = { x: 0, y: 0 };
                this.sideSpawnX = 80;
                this.runs = 0;
                this.game = game;
                this.spawner = spawner;
                this.spawnCalled = 0;
                this.player = player;
                this.player.baseSpeed = 700;
                this.player.baseTKOSpeed = 1200;
                this.player.updateSpeed();
                this.spawnPos = { x: this.game.world.centerX + this.sideSpawnX * 1, y: 510 };
                this.runs = 0;
            }
            spawn() {
                if (this.spawnCalled == 1) {
                    this.spawnGlorb();
                    this.spawnDistance = 3200 + this.runs * 10;
                    this.runs += 1;
                }
                if (this.spawnCalled >= 2 && this.spawnCalled < 3) {
                    this.spawnDistance = 1;
                    this.spawnLaneSwitcher(-1);
                }
                if (this.spawnCalled == 3) {
                    this.spawnDistance = 500;
                    this.spawnCalled = 0;
                }
                this.spawnCalled += 1;
            }
            spawnEnemy(side = 1) {
                this.spawnPos.x = this.game.world.centerX + this.sideSpawnX * side;
                return this.spawner.spawnEnemy(Funday.OkKo.SpriteLibrary.game.jethro_run_anim01, this.spawnPos.x, this.spawnPos.y, OKKO.Enemy);
            }
            spawnLaneSwitcher(side = 1) {
                this.spawnPos.x = this.game.world.centerX + this.sideSpawnX * side;
                return this.spawner.spawnEnemy(Funday.OkKo.SpriteLibrary.game.jethro_jump_anim04, this.spawnPos.x, this.spawnPos.y, OKKO.LaneSwitcherEnemy);
            }
            spawnGlorb(side = 1) {
                this.spawnPos.x = this.game.world.centerX + this.sideSpawnX * side;
                return this.spawner.spawnCollectible(Funday.OkKo.SpriteLibrary.game.glorb, this.spawnPos.x, this.spawnPos.y, OKKO.Glorb);
            }
            nextWave() {
            }
            reset() {
            }
        }
        OKKO.DummyWave = DummyWave;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class RandomEnemyWave {
            constructor(game, spawner, difficulty) {
                this.laneSwitcherProbability = 0;
                this.glorbCounter = 0;
                this.coinsSpawned = 0;
                this.side = 1;
                this.sideChanges = 0;
                this.sideChangeProbability = 0.4;
                this.spawnCalled = 0;
                this.spawnPos = { x: 0, y: 0 };
                this.sideSpawnX = 85;
                this.game = game;
                this.spawner = spawner;
                this.difficulty = difficulty;
                this.sideSpawnX = this.game.applyResolutionRatio(this.sideSpawnX);
                this.spawnPos = { x: this.game.world.centerX + this.sideSpawnX * this.side, y: this.game.responsiveDistanceFromBottom(1920 - 510) };
                this.syncDifficulty();
                this.glorbCounter = 1;
            }
            syncDifficulty() {
                this.spawnDistance = this.difficulty.spawnDistance;
                this.totalSpawns = this.difficulty.totalSpawns;
                this.maxSideChanges = this.difficulty.maxEnemySideChanges;
                this.laneSwitcherProbability = this.difficulty.laneSwitcherProbability;
            }
            spawn() {
                if ((this.spawnCalled + 1) % 2 === 0) {
                    let enemy = this.spawnEnemy(this.spawnCalled);
                    if (!(enemy instanceof OKKO.LaneSwitcherEnemy))
                        this.spawnCollectible(this.spawnCalled);
                }
                else {
                    this.spawnCollectible(this.spawnCalled);
                }
                this.spawnCalled += 1;
            }
            spawnCollectible(spawnNum) {
                let colSpawnPos = { x: this.game.world.centerX + this.sideSpawnX * this.game.rnd.sign(), y: this.spawnPos.y };
                if ((spawnNum + 1) % 2 === 0) {
                    colSpawnPos.x = this.game.world.centerX + this.sideSpawnX * (this.side * -1);
                }
                if (this.game.rnd.realInRange(0.0, 1.0) <= 0.5 * this.totalSpawns && this.glorbCounter <= 0) {
                    this.spawner.spawnCollectible(Funday.OkKo.SpriteLibrary.game.glorb, colSpawnPos.x, colSpawnPos.y, OKKO.Glorb);
                    this.glorbCounter += 1;
                }
                else if (this.game.rnd.realInRange(0.0, 1.0) < 0.25) {
                    this.spawner.spawnCollectible(Funday.OkKo.SpriteLibrary.game.coin, colSpawnPos.x, colSpawnPos.y, OKKO.Coin);
                    this.coinsSpawned += 1;
                }
            }
            spawnEnemy(spawnNum) {
                if (this.sideChanges < this.maxSideChanges && spawnNum > 0) {
                    this.side = this.game.rnd.realInRange(0.0, 1.0) >= this.sideChangeProbability ? this.side : (this.side * -1);
                    let newX = this.game.world.centerX + this.sideSpawnX * this.side;
                    if (this.spawnPos.x != newX) {
                        this.sideChanges += 1;
                    }
                    else {
                        this.sideChangeProbability += 0.2;
                    }
                    this.spawnPos.x = newX;
                }
                var enemy;
                let ran = this.game.rnd.realInRange(0.0, 1.0);
                if (ran < this.laneSwitcherProbability) {
                    enemy = this.spawner.spawnEnemy(Funday.OkKo.SpriteLibrary.game.jethro_jump_anim04, this.spawnPos.x, this.spawnPos.y, OKKO.LaneSwitcherEnemy);
                }
                else {
                    enemy = this.spawner.spawnEnemy(Funday.OkKo.SpriteLibrary.game.jethro_run_anim01, this.spawnPos.x, this.spawnPos.y, OKKO.Enemy);
                }
                return enemy;
            }
            nextWave() {
                this.coinsSpawned = 0;
                this.sideChanges = 0;
                this.spawnCalled = 0;
                this.sideChangeProbability = 0.4;
                this.glorbCounter = Math.max(0, this.glorbCounter - 0.5);
                this.difficulty.advanceDifficulty();
                this.syncDifficulty();
            }
            reset() {
                this.glorbCounter = 1;
                this.sideChangeProbability = 0.4;
                this.difficulty.reset();
                this.syncDifficulty();
            }
        }
        OKKO.RandomEnemyWave = RandomEnemyWave;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class TutorialWave {
            constructor(game, spawner) {
                this.difficulty = null;
                this.spawnCalled = 0;
                this.spawnDistance = 250;
                this.totalSpawns = 5;
                this.maxSideChanges = 0;
                this.laneSwitcherProbability = 0.0;
                this.spawnPos = { x: 0, y: 0 };
                this.sideSpawnX = 80;
                this.game = game;
                this.spawner = spawner;
                this.spawnCalled = 0;
                this.spawnDistance = game.applyResolutionRatio(this.spawnDistance);
                this.sideSpawnX = game.applyResolutionRatio(this.sideSpawnX);
                this.spawnPos = { x: this.game.world.centerX + this.game.applyResolutionRatio(this.sideSpawnX), y: this.game.responsiveDistanceFromBottom(1920 - 510) };
            }
            spawn() {
                if (this.spawnCalled == 1) {
                    this.firstEnemy = this.spawnEnemy(1);
                    this.spawnDistance = this.game.applyResolutionRatio(1500);
                }
                if (this.spawnCalled == 2) {
                    this.glorb = this.spawnGlorb();
                }
                if (this.spawnCalled == 3) {
                    this.spawnEnemy(-1);
                    this.spawnEnemy(1);
                }
                if (this.spawnCalled == 4) {
                    this.laneSwitcher = this.spawnLaneSwitcher(-1);
                }
                this.spawnCalled += 1;
            }
            spawnEnemy(side = 1) {
                this.spawnPos.x = this.game.world.centerX + this.sideSpawnX * side;
                return this.spawner.spawnEnemy(Funday.OkKo.SpriteLibrary.game.jethro_run_anim01, this.spawnPos.x, this.spawnPos.y, OKKO.Enemy);
            }
            spawnLaneSwitcher(side = 1) {
                this.spawnPos.x = this.game.world.centerX + this.sideSpawnX * side;
                return this.spawner.spawnEnemy(Funday.OkKo.SpriteLibrary.game.jethro_jump_anim04, this.spawnPos.x, this.spawnPos.y, OKKO.LaneSwitcherEnemy);
            }
            spawnGlorb() {
                return this.spawner.spawnCollectible(Funday.OkKo.SpriteLibrary.game.glorb, this.spawnPos.x, this.spawnPos.y, OKKO.Glorb);
            }
            nextWave() {
            }
            reset() {
            }
        }
        OKKO.TutorialWave = TutorialWave;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
var Funday;
(function (Funday) {
    var OKKO;
    (function (OKKO) {
        class WaveGroup extends Phaser.Group {
            constructor(game) {
                super(game);
            }
            getOrCreateGameObj(spriteId, targetX, targetY, obj) {
                for (var i = 0; i < this.children.length; i++) {
                    let child = this.children[i];
                    if (!child.alive && child instanceof obj) {
                        child.position.x = targetX;
                        child.position.y = targetY;
                        child.reset(targetX, targetY);
                        child.customRevive();
                        return child;
                    }
                }
                let newObj = new obj(this.game, spriteId, targetX, targetY);
                this.add(newObj);
                return newObj;
            }
            blowUpAllEnemies() {
                this.children.forEach(child => {
                    if (child instanceof OKKO.AbstractEnemy && child.alive) {
                        child.playHitAnimation();
                    }
                });
            }
            pauseAllAnimationsInGroup() {
                OKKO.GroupUtilityFunctions.pauseAllAnimationsInGroup(this);
            }
            resumeAllAnimationsInGroup() {
                OKKO.GroupUtilityFunctions.resumeAllAnimationsInGroup(this);
            }
        }
        OKKO.WaveGroup = WaveGroup;
    })(OKKO = Funday.OKKO || (Funday.OKKO = {}));
})(Funday || (Funday = {}));
//# sourceMappingURL=game.js.map