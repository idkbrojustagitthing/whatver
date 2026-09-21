/*:
* @plugindesc Edits to plugin functions.
* @author vgperson
*/

/* Add Touchpad Mode Option */

ConfigManager.touchpadMode = false;

// Save touchpadMode setting to config data.
ConfigManager.makeData = function() {
	var config = {};
	config.alwaysDash = this.alwaysDash;
	config.commandRemember = this.commandRemember;
	config.touchpadMode = this.touchpadMode;
	config.bgmVolume = this.bgmVolume;
	config.bgsVolume = this.bgsVolume;
	config.meVolume = this.meVolume;
	config.seVolume = this.seVolume;
	return config;
};

// Load touchpadMode setting from config data.
ConfigManager.applyData = function(config) {
	this.alwaysDash = this.readFlag(config, 'alwaysDash');
	this.commandRemember = this.readFlag(config, 'commandRemember');
	this.touchpadMode = this.readFlag(config, 'touchpadMode');
	this.bgmVolume = this.readVolume(config, 'bgmVolume');
	this.bgsVolume = this.readVolume(config, 'bgsVolume');
	this.meVolume = this.readVolume(config, 'meVolume');
	this.seVolume = this.readVolume(config, 'seVolume');
};


/* Add Mouse Hover Trigger Type */

// Remove the mousePressed check for moving mouse cursor.
TouchInput._onMouseMove = function(event) {
	var x = Graphics.pageToCanvasX(event.pageX);
	var y = Graphics.pageToCanvasY(event.pageY);
	this._onMove(x, y);
};

// Define 13th trigger handler for hover and hover variable.
var _Sprite_Picture_initialize = Sprite_Picture.prototype.initialize;
Sprite_Picture.prototype.initialize = function(pictureId) {
	_Sprite_Picture_initialize.call(this, pictureId);
	this._triggerHandler[13] = this.isHover;
	this._hoverMouse = false;
};

// Extend maximum value for trigger argument in call commands to 13.
var getArgNumber = function(arg, min, max) {
	if (arguments.length < 2) min = -Infinity;
	if (arguments.length < 3) max = Infinity;
	return (parseInt(arg, 10) || 0).clamp(min, max);
};

var getArgBoolean = function(arg) {
	return (arg || '').toUpperCase() === 'ON';
};

var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	var pictureId, commonId, trigger, variableNum, transparent;
	switch (command.toUpperCase()) {
		case 'P_CALL_CE' :
		case 'ピクチャのボタン化':
			pictureId   = getArgNumber(args[0], 1, $gameScreen.maxPictures());
			commonId    = getArgNumber(args[1], 1, $dataCommonEvents.length - 1);
			trigger     = getArgNumber(args[2], 1, 13);
			transparent = (args.length > 3 ? getArgBoolean(args[3]) : null);
			$gameScreen.setPictureCallCommon(pictureId, commonId, trigger, transparent);
			return;
		case 'P_CALL_CEA' :
		case 'ピクチャのボタン化A':
			pictureId   = getArgNumber(args[0], 1, $gameScreen.maxPictures());
			commonId    = getArgNumber(args[1], 1, $dataCommonEvents.length - 1) + 1000;
			trigger     = getArgNumber(args[2], 1, 13);
			transparent = (args.length > 3 ? getArgBoolean(args[3]) : null);
			$gameScreen.setPictureCallCommon(pictureId, commonId, trigger, transparent);
			return;
	}
	_Game_Interpreter_pluginCommand.call(this, command, args);
};

// Set hoverMouse when mouse is hovering over picture.
Sprite_Picture.prototype.updateMouseMove = function() {
	if (this.isTouchable() && this.isTouchPosInRect() && !this.isTransparent()) {
		this._hoverMouse = true;
		if (!this._wasOnMouse) {
			this._onMouse    = true;
			this._wasOnMouse = true;
		}
	} else {
		this._hoverMouse = false;
		if (this._wasOnMouse) {
			this._outMouse   = true;
			this._wasOnMouse = false;
		}
	}
};

// Define getter for mouse hover.
Sprite_Picture.prototype.isHover = function() {
	return this._hoverMouse;
};


/* Add Auto-Click Event Trigger Type */

// Add autoclick event trigger property.
var _Game_Event_pd_TE_resetPropaty = Game_Event.prototype.pd_TE_resetPropaty;
Game_Event.prototype.pd_TE_resetPropaty = function() {
	_Game_Event_pd_TE_resetPropaty.call(this, arguments);
	this.__pd_TE.touchpadModeAutoclick = 0;
};

// Add "toucha" definition for events that can be triggered by touching or (only in touchpadMode) just by hovering over them.
var pd_TE_Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
Game_Event.prototype.setupPageSettings = function() {
	pd_TE_Game_Event_setupPageSettings.call(this);
	var pd_TE_Plugin_Command_List_Top = this.list()[0];
	if (pd_TE_Plugin_Command_List_Top.code === 118) {
		var pd_TE_command = pd_TE_Plugin_Command_List_Top.parameters[0].toLowerCase().replace(/　/g," ").replace(/\(/g,"[").split(" ");
		for (var i = 0; i < pd_TE_command.length; i++) {
			if (pd_TE_command[i] === "タッチa" || pd_TE_command[i] === "toucha") {
				this.__pd_TE.touchTriggerType = 1;
				this.__pd_TE.touchpadModeAutoclick = 1;
			}
		}
	}
};

// Add additional check for activating "toucha" events by mouse hover in touchpadMode.
Game_Event.prototype.pd_TE_CheckTouchEvent = function() {
	if (this.__pd_TE.touchTriggerType >= 1 && this.__pd_TE.touchpadModeAutoclick == 1 && ConfigManager["touchpadMode"])
	{
		var realMouseX = ($gameMap._displayX * $gameMap.tileWidth() + TouchInput.x) / $gameMap.tileWidth();
		var realMouseY = ($gameMap._displayY * $gameMap.tileHeight() + TouchInput.y) / $gameMap.tileHeight();
		if(realMouseX >= this._realX && realMouseX < this._realX + 1 &&
		  realMouseY >= this._realY && realMouseY < this._realY + 1){
			return true;
		}
	}
	if (this.__pd_TE.touchTriggerType >= 1 && TouchInput.isTriggered()) {
		if($gameTemp._pd_TE_realTouchMapX >= this._realX && $gameTemp._pd_TE_realTouchMapX < this._realX + 1 &&
		  $gameTemp._pd_TE_realTouchMapY >= this._realY && $gameTemp._pd_TE_realTouchMapY < this._realY + 1){
			return true;
		}
	}
	return false;
};


/* Accept Shift Key as Shortcut for Move Button */

// Define IDs of "Move" common events that can be activated with Shift.
Sprite_Picture.moveCommonList = [
	9, // Chapter 1, Part One
	122, // Chapter 1, Part Two
	310, // Chapter 2, Part One
	960, // Chapter 2, Part Two
	963, // Chapter 2, Part Two: Intro (Sou's nightmare)
	1064, // Chapter 3, Part One: Close floor map (placed first so it takes priority over "re-opening")
	1063, // Chapter 3, Part One: Open floor map
	1087, // Chapter 3, Part One: Scenes that occur upon selecting "move" #1
	1088, // Chapter 3, Part One: Scenes that occur upon selecting "move" #2
	1100 // Chapter 3, Part One: Scenes that occur upon selecting "move" #3
];

var getParamOther = function(paramNames) {
	if (!Array.isArray(paramNames)) paramNames = [paramNames];
	for (var i = 0; i < paramNames.length; i++) {
		var name = PluginManager.parameters("PictureCallCommon2")[paramNames[i]];
		if (name) return name;
	}
	return null;
};

var getParamBoolean = function(paramNames) {
	var value = getParamOther(paramNames);
	return (value || '').toUpperCase() === 'ON';
};

// Check for Shift as alternative to clicking if the common ID is a "Move" common event.
Sprite_Picture.prototype.callTouch = function() {
	var commandIds = $gameScreen.getPictureCid(this._pictureId);
	if (!commandIds) return;
	for (var i = 0, n = this._triggerHandler.length; i < n; i++) {
		var handler = this._triggerHandler[i];
		
		// Additional check for Shift if calling a Move common
		if (Sprite_Picture.moveCommonList.includes(commandIds[i]) && Input.isTriggered('shift') && this.visible)
		{
			$gameTemp.setPictureCallInfo(commandIds[i], this._pictureId);
			break;
		}
		
		if (handler && commandIds[i] && handler.call(this) && (i === 5 || i === 4 || !this.isTransparent())) {
			if (getParamBoolean(['SuppressTouch', 'タッチ操作抑制'])) TouchInput.suppressEvents();
			if (i === 3) TouchInput._pressedTime = -60;
			if (i === 4) this._onMouse = false;
			if (i === 5) this._outMouse = false;
			$gameTemp.setPictureCallInfo(commandIds[i], this._pictureId);
		}
	}
};


/* Auto-Adjust Pauses at Start of Message */

// Automatically fixes messages so they start with a "\." if they need a short pause (not necessary when there's a textbox opening animation), and vice versa.
Window_Message.prototype.startMessage = function() {
	this.delayTime = Galv.MSE.delay;
	
	this._textState = {};
	this._textState.index = 0;
	this._textState.text = this.convertEscapeCharacters($gameMessage.allText());
	
	if (this._textState.text.trim() !== "") {
		var text = this._textState.text.trim();
		var mayNeedAdjustment = 0;
		
		if (this.openness == 0 && text.includes("\x1b.")) { // Has opening delay, so there shouldn't be a \. - if there is, it should be removed provided it's at start
			mayNeedAdjustment = -1;
		}
		else if (this.openness > 0&& !text.startsWith("\x1b>")) { // Has no opening delay, so make sure there's a \. at start (unless it should type instantly)
			mayNeedAdjustment = 1;
		}
		
		if (mayNeedAdjustment != 0) {
			if (!text.startsWith("\x1b.") && !text.startsWith("\x1b>")) { // If pause or instant-type is not already identifiable at start, remove all other escape codes to determine whether there is or isn't one
				text = text.replace(/\x1bC\[(\d+)\]/gi, "");
				text = text.replace(/\x1bI\[(\d+)\]/gi, "");
				text = text.replace(/\x1b!/gi, "");
				text = text.replace(/\x1b</gi, "");
				text = text.replace(/\x1bN/gi, "");
				text = text.replace(/\x1b\|/gi, "");
				text = text.replace(/\x1b\^/gi, "");
				text = text.replace(/\x1b\{/gi, "");
				text = text.replace(/\x1b\}/gi, "");
				text = text.replace(/\x1b\$/gi, "");
				text = text.replace(/\x1b\#/gi, "");
				text = text.replace(/\x1bsp\[(\d+)\]/gi, "");
				text = text.replace(/\x1bsw\[(\d+)\]/gi, "");
				text = text.replace(/\x1bse\[([^\]]*)\]/gi, "");
				text = text.replace(/\x1bfs\[(\d+)\]/gi, "");
				text = text.replace(/\x1bat\[(\d+)\]/gi, "");
			}
			
			if (mayNeedAdjustment == 1 && !text.startsWith("\x1b.") && !text.startsWith("\x1b>")) { // No starting pause when there should be one, and doesn't start with \>
				this._textState.text = "\x1b." + this._textState.text;
			}
			else if (mayNeedAdjustment == -1 && text.startsWith("\x1b.")) { // Starting pause when there shouldn't be one
				this._textState.text = this._textState.text.replace("\x1b.", "");
			}
		}
	}
	
	this.newPage(this._textState);
	this.updatePlacement();
	this.updateBackground();
	this.open();
};



/* Convenience and Compatibility */

if (typeof $modifiedTestPlay !== "undefined" && $modifiedTestPlay) {
	// Change skip button to Page Down.
	utakata.MessageSkip.isPressedMsgSkipButton = function() {
		if (Utils.isOptionValid('test'))
			this._skipKey = "pagedown";
		return Input.isPressed(this._skipKey);
	};
	
	// Disable Print Screen screenshot function.
	SceneManager.onKeyUpForCapture = function() { };
}

// Add prefix to local storage save files to prevnt overlap.
if (typeof $useStoragePrefix !== "undefined" && $useStoragePrefix) {
	StorageManager.webStorageKey = function(savefileId) {
		if (savefileId < 0) {
			return 'Kimi RPG Config';
		} else if (savefileId === 0) {
			return 'Kimi RPG Global';
		} else {
			return 'Kimi RPG File%1'.format(savefileId);
		}
	};
}

// Add dataFolder prefix for resource files.
if (typeof $useDataFolder !== "undefined" && $useDataFolder) {
	DataManager.loadDataFile = function(name, src) {
		var xhr = new XMLHttpRequest();
		var url = $dataFolder + 'data/' + src;
		xhr.open('GET', url);
		xhr.overrideMimeType('application/json');
		xhr.onload = function() {
			if (xhr.status < 400) {
				window[name] = JSON.parse(xhr.responseText);
				DataManager.onLoad(window[name]);
			}
		};
		xhr.onerror = this._mapLoader || function() {
			DataManager._errorUrl = DataManager._errorUrl || url;
		};
		window[name] = null;
		xhr.send();
	};
	
	DataManager.loadMapData = function(mapId) {
		if (mapId > 0) {
			var filename = 'Map%1.json'.format(mapId.padZero(3));
			this._mapLoader = ResourceHandler.createLoader($dataFolder + 'data/' + filename, this.loadDataFile.bind(this, '$dataMap', filename));
			this.loadDataFile('$dataMap', filename);
		} else {
			this.makeEmptyMap();
		}
	};
	
	ImageManager.loadAnimation = function(filename, hue) {
		return this.loadBitmap($dataFolder + 'img/animations/', filename, hue, true);
	};

	ImageManager.loadBattleback1 = function(filename, hue) {
		return this.loadBitmap($dataFolder + 'img/battlebacks1/', filename, hue, true);
	};

	ImageManager.loadBattleback2 = function(filename, hue) {
		return this.loadBitmap($dataFolder + 'img/battlebacks2/', filename, hue, true);
	};

	ImageManager.loadEnemy = function(filename, hue) {
		return this.loadBitmap($dataFolder + 'img/enemies/', filename, hue, true);
	};

	ImageManager.loadCharacter = function(filename, hue) {
		return this.loadBitmap($dataFolder + 'img/characters/', filename, hue, false);
	};

	ImageManager.loadFace = function(filename, hue) {
		return this.loadBitmap($dataFolder + 'img/faces/', filename, hue, true);
	};

	ImageManager.loadParallax = function(filename, hue) {
		return this.loadBitmap($dataFolder + 'img/parallaxes/', filename, hue, true);
	};

	ImageManager.loadPicture = function(filename, hue) {
		return this.loadBitmap($dataFolder + 'img/pictures/', filename, hue, true);
	};

	ImageManager.loadSvActor = function(filename, hue) {
		return this.loadBitmap($dataFolder + 'img/sv_actors/', filename, hue, false);
	};

	ImageManager.loadSvEnemy = function(filename, hue) {
		return this.loadBitmap($dataFolder + 'img/sv_enemies/', filename, hue, true);
	};

	ImageManager.loadSystem = function(filename, hue) {
		return this.loadBitmap($dataFolder + 'img/system/', filename, hue, false);
	};

	ImageManager.loadTileset = function(filename, hue) {
		return this.loadBitmap($dataFolder + 'img/tilesets/', filename, hue, false);
	};

	ImageManager.loadTitle1 = function(filename, hue) {
		return this.loadBitmap($dataFolder + 'img/titles1/', filename, hue, true);
	};

	ImageManager.loadTitle2 = function(filename, hue) {
		return this.loadBitmap($dataFolder + 'img/titles2/', filename, hue, true);
	};
	
	ImageManager.reserveAnimation = function(filename, hue, reservationId) {
		return this.reserveBitmap($dataFolder + 'img/animations/', filename, hue, true, reservationId);
	};

	ImageManager.reserveBattleback1 = function(filename, hue, reservationId) {
		return this.reserveBitmap($dataFolder + 'img/battlebacks1/', filename, hue, true, reservationId);
	};

	ImageManager.reserveBattleback2 = function(filename, hue, reservationId) {
		return this.reserveBitmap($dataFolder + 'img/battlebacks2/', filename, hue, true, reservationId);
	};

	ImageManager.reserveEnemy = function(filename, hue, reservationId) {
		return this.reserveBitmap($dataFolder + 'img/enemies/', filename, hue, true, reservationId);
	};

	ImageManager.reserveCharacter = function(filename, hue, reservationId) {
		return this.reserveBitmap($dataFolder + 'img/characters/', filename, hue, false, reservationId);
	};

	ImageManager.reserveFace = function(filename, hue, reservationId) {
		return this.reserveBitmap($dataFolder + 'img/faces/', filename, hue, true, reservationId);
	};

	ImageManager.reserveParallax = function(filename, hue, reservationId) {
		return this.reserveBitmap($dataFolder + 'img/parallaxes/', filename, hue, true, reservationId);
	};

	ImageManager.reservePicture = function(filename, hue, reservationId) {
		return this.reserveBitmap($dataFolder + 'img/pictures/', filename, hue, true, reservationId);
	};

	ImageManager.reserveSvActor = function(filename, hue, reservationId) {
		return this.reserveBitmap($dataFolder + 'img/sv_actors/', filename, hue, false, reservationId);
	};

	ImageManager.reserveSvEnemy = function(filename, hue, reservationId) {
		return this.reserveBitmap($dataFolder + 'img/sv_enemies/', filename, hue, true, reservationId);
	};

	ImageManager.reserveSystem = function(filename, hue, reservationId) {
		return this.reserveBitmap($dataFolder + 'img/system/', filename, hue, false, reservationId || this._systemReservationId);
	};

	ImageManager.reserveTileset = function(filename, hue, reservationId) {
		return this.reserveBitmap($dataFolder + 'img/tilesets/', filename, hue, false, reservationId);
	};

	ImageManager.reserveTitle1 = function(filename, hue, reservationId) {
		return this.reserveBitmap($dataFolder + 'img/titles1/', filename, hue, true, reservationId);
	};

	ImageManager.reserveTitle2 = function(filename, hue, reservationId) {
		return this.reserveBitmap($dataFolder + 'img/titles2/', filename, hue, true, reservationId);
	};
	
	ImageManager.requestAnimation = function(filename, hue) {
		return this.requestBitmap($dataFolder + 'img/animations/', filename, hue, true);
	};

	ImageManager.requestBattleback1 = function(filename, hue) {
		return this.requestBitmap($dataFolder + 'img/battlebacks1/', filename, hue, true);
	};

	ImageManager.requestBattleback2 = function(filename, hue) {
		return this.requestBitmap($dataFolder + 'img/battlebacks2/', filename, hue, true);
	};

	ImageManager.requestEnemy = function(filename, hue) {
		return this.requestBitmap($dataFolder + 'img/enemies/', filename, hue, true);
	};

	ImageManager.requestCharacter = function(filename, hue) {
		return this.requestBitmap($dataFolder + 'img/characters/', filename, hue, false);
	};

	ImageManager.requestFace = function(filename, hue) {
		return this.requestBitmap($dataFolder + 'img/faces/', filename, hue, true);
	};

	ImageManager.requestParallax = function(filename, hue) {
		return this.requestBitmap($dataFolder + 'img/parallaxes/', filename, hue, true);
	};

	ImageManager.requestPicture = function(filename, hue) {
		return this.requestBitmap($dataFolder + 'img/pictures/', filename, hue, true);
	};

	ImageManager.requestSvActor = function(filename, hue) {
		return this.requestBitmap($dataFolder + 'img/sv_actors/', filename, hue, false);
	};

	ImageManager.requestSvEnemy = function(filename, hue) {
		return this.requestBitmap($dataFolder + 'img/sv_enemies/', filename, hue, true);
	};

	ImageManager.requestSystem = function(filename, hue) {
		return this.requestBitmap($dataFolder + 'img/system/', filename, hue, false);
	};

	ImageManager.requestTileset = function(filename, hue) {
		return this.requestBitmap($dataFolder + 'img/tilesets/', filename, hue, false);
	};

	ImageManager.requestTitle1 = function(filename, hue) {
		return this.requestBitmap($dataFolder + 'img/titles1/', filename, hue, true);
	};

	ImageManager.requestTitle2 = function(filename, hue) {
		return this.requestBitmap($dataFolder + 'img/titles2/', filename, hue, true);
	};
	
	SceneManager.initGraphics = function() {
		var type = this.preferableRendererType();
		Graphics.initialize(this._screenWidth, this._screenHeight, type);
		Graphics.boxWidth = this._boxWidth;
		Graphics.boxHeight = this._boxHeight;
		Graphics.setLoadingImage($dataFolder + 'img/system/Loading.png');
		if (Utils.isOptionValid('showfps')) {
			Graphics.showFps();
		}
		if (type === 'webgl') {
			this.checkWebGL();
		}
	};
}