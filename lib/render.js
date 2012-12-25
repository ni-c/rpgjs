function RenderInterpreter() {
	this.cmdfinish = false;
	this.next = true;
	
}

RenderInterpreter.prototype = {

	cmdShowText: function(params, self) {
		var prevCmd = params. prevCmd;
		var nextCmd = params.nextCmd;
		var text = params.text;
		
		Menu.sceneRefresh(params.menu_id, function() {
            var content = Menu.getElement(params.menu_id, "__text__");
    		var dialog = self.dialog ? self.dialog : Menu.getSceneClass(params.menu_id).scene;
            content.hide();
            content.css({
                'border-color': '',
                'border-width': '14px',
                'border-image': ''
            });
            content.addClass("window_custom");
            content.html(text);
            content.fadeIn('fast');
			dialog.onExit = function() {
				self.nextCommand();
			};
			var keys = [Input.Space, Input.Enter];
			Input.press(keys, function(e) {
				if (nextCmd.name != "SHOW_TEXT") {
					Input.clearKeys(keys);
					var opacity = 1;
					
					function fade() {
						opacity -= 0.1;
						if (opacity <= 0) {
							clearInterval(interval);
							opacity = 0;
							dialog.exit();
							delete self.dialog;
						}
						content.css('opacity', opacity);
					}
					
					var interval = setInterval(fade, 25);
				}
				else {
					self.nextCommand();
					self.dialog = dialog;
				}
			});
		});
       
		
	},
	
	cmdShowAnimation: function(anim, self) {
		if (anim.wait && anim.wait == "_no") anim.wait = false;
		if (self.render.animations[anim.name]) {
			var target = self._target(anim.target);
			if (anim.zoom && anim.zoom != "") {
				self.render.animations[anim.name].setZoom(anim.zoom);
			}
			self.render.animations[anim.name].setPositionEvent(target);
			if (anim.wait) {
				self.render.animations[anim.name].play(onAnimationFinish);
			}
			else {
				self.render.animations[anim.name].play();
			}
		}
		
		if (!anim.wait) {
			onAnimationFinish();
		}
		
		function onAnimationFinish() {
			self.nextCommand();
		}
	},
	
	cmdSwitches: function(params, self) {	
		self.nextCommand();
	},
	
	cmdSelfSwitches: function(params, self) {
		self.nextCommand();
	},
	
	cmdScreenColorTone: function(param, self) {
		function onFinish() {
			self.nextCommand();
		}
		var callback = param.wait ? onFinish : false;
		self.render.changeScreenColorTone(param.color, param.speed, param.composite, param.opacity, callback);
		if (!callback) {
			onFinish();
		}
	},
	
	cmdScreenShake: function(param, self) {
		function onFinish() {
			self.nextCommand();
		}
		var callback = param.wait && param.wait != "_no" ? onFinish : false;
		self.render.screenShake(param.power[0], param.speed[0], param.duration, param.axis, callback);
		if (!callback) {
			onFinish();
		}
	},
	
	cmdMoveRoute: function(dir, self) {
		self.nextCommand();
	},
	
	cmdChangeItems: function(param, self) {
		self.nextCommand();
	},
	
	cmdErase: function(params, self) {
		self.nextCommand();
	},
	
	cmdBlink: function(prop, self) {
		var target = self._target(prop.target);
		if (prop.wait && prop.wait != "_no") {
			target.blink(prop.duration, prop.frequence, self.nextCommand);
		}
		else {
			target.blink(prop.duration, prop.frequence);
			self.nextCommand();
		}
	},
	
	cmdScreenFlash: function(param, self) {
		function onFinish() {
			self.nextCommand();
		}
		var callback = param.wait ? onFinish : false;
		self.render.screenFlash(param.color, param.speed, callback);
		if (!callback) {
			onFinish();
		}
	},
	
	cmdChangeGold: function(param, self) {
		self.nextCommand();
	},
	
	cmdVariables: function(param, self) {
		self.nextCommand();
	},
	
	cmdTransferPlayer: function(param, self) {
		self.nextCommand();
	},
	
	cmdSetEventLocation: function(param, self) {
		self.nextCommand();
	},
	
	cmdChangeEXP: function(param, self) {
		self.nextCommand();
	},
	
	cmdChangeLevel: function(param, self) {
		self.nextCommand();
	},
	
	cmdChangeSkills: function(param, self) {
		self.nextCommand();
	},
	
	cmdChangeName: function(param, self) {
		self.nextCommand();
	},
	
	cmdChangeClass: function(param, self) {
		self.nextCommand();
	},
	
	cmdChangeEquipment: function(param, self) {
		self.nextCommand();
	},
	
	cmdChangeParams: function(param, self) {
		self.nextCommand();
	},
	
	cmdChangeParamPoints: function(param, self) {
		self.nextCommand();
	},
	
	cmdRecoverAll: function(param, self) {
		self.nextCommand();
	},
	
	cmdCallCommonEvent: function(param, self) {
		self.nextCommand();
	},
	
	cmdCallSystem: function(param, self) {
		self.nextCommand();
	},
	
	cmdPlayBGM: function(filename, self) {
		self._cmdPlayMusic("BGM", filename, self);
	},
	
	cmdPlayBGS: function(filename, self) {
		self._cmdPlayMusic("BGS", filename, self);
	},
	
	cmdPlayME: function(filename, self) {
		self._cmdPlayMusic("ME", filename, self);
	},
	
	cmdPlaySE: function(filename, self) {
		self._cmdPlayMusic("SE", filename, self);
	},
	
	_cmdPlayMusic: function(type, filename, self) {
		self.render["play" + type](filename, function() {
			self.nextCommand();
		});
	},
	
	cmdStopSE: function(params, self) {
		Cache.audioStop("se");
		self.nextCommand();
	},
	
	cmdFadeOutSound: function(params, self) {
		self.cmdFadeOutAudio(["me", "se"], params, self);
	},
	
	cmdFadeOutMusic: function(params, self) {
		self.cmdFadeOutAudio(["bgm", "bgs"], params, self);
	},
	
	cmdMemorizeMusic: function(params, self) {
		self._memorizeMusic = {
			bgm: self.render.currentSound["bgm"],
			bgs: self.render.currentSound["bgs"]
		};
		self.nextCommand();
	},
	
	cmdRestoreMusic: function(params, self) {
		if (self._memorizeMusic["bgm"]) {
			self._memorizeMusic["bgm"].play();
		}
		if (self._memorizeMusic["bgs"]) {
			self._memorizeMusic["bgs"].play();
		}
		self.nextCommand();
	},
	
	cmdFadeOutAudio: function(types, params, self) {
		var bgm = self.render.soundVolume[types[0]],
			bgs = self.render.soundVolume[types[1]];
		var interval = setInterval(fade, params.frame / 10);
		function fade() {
			bgm -= 0.1;
			bgs -= 0.1;
			if (bgm > 0) {
				self.render.setVolumeAudio(bgm, types[0]);
			}
			if (bgs > 0) {
				self.render.setVolumeAudio(bgs, types[1]);
			}
			if (bgm <= 0 && bgs <= 0) {
				clearInterval(interval);
				self.nextCommand();
			}
		}
	},
	
	cmdChangeGraphic: function(graphic, self) {
		self.render.layer[3].removeChild(self.render.player.sprite);
		self.render.player.displayEvent(graphic, true);
		self.nextCommand();
	},
	
	cmdCall: function(param, self) {
		self.nextCommand();
	},
	
	cmdShowPicture: function(param, self) {
		self.render.addPicture(params.id, params.filename, params, function() {
			self.nextCommand();
		});
	},
	
	cmdMovePicture: function(param, self) {
		self.render.movePicture(params.id, params.duration, params);
		self.nextCommand();
	},
	
	cmdRotatePicture: function(params, self) {
		var wait = typeof params.value == "number" && params.wait;
		self.render.rotatePicture(params.id, params.duration, params.value, wait ? onFinish() : false);
		if (!wait) {
			onFinish();
		}
		function onFinish() {
			self.nextCommand();
		}
	},
	
	cmdErasePicture: function(id, self) {
		self.render.erasePicture(id);
		self.nextCommand();
	},
	
	cmdWait: function(param, self) {
		self.wait(param.frame, param.block, function() {
			self.nextCommand();
		});
	},
	
	cmdScript: function(script, self) {
		eval(script);
	},
	
	// Private
	_target: function(target) {
		var _target = this;
		if (target && target != "this") {
			if (target == 'Player' || target == 'player') {
				_target = this.render.player;
			}
			else {
				console.log(this.render.renderEvents);
				_target = this.render.getEventRenderById(target);
			}
		}
		return _target;
	},
	
	nextCommand: function() {
		if (this.next) {
			DataLink.emit("nextCommand", {id: this.id});
		}
	}
}

var interpreterRender = RenderEvent.prototype = new RenderInterpreter();

function RenderEvent(render, id, prop) {
	
	if (!render) return;

	/**
     * The sprite of the event. It also contains the Bitmap
	 * @property sprite
     * @type Container
     */
	this.render = render;
	this.sprite = new createjs.Container();
	this.id = id;
	this.htmlElements = []; 
	this.htmlElementMouse;
	
	this.width = this.render.tile_w;
	this.height = this.render.tile_h;
	
	this.real_x;
	this.real_y;
	
	this.fixcamera  = false;
	this._wait = {frame: 0};
	this.currentFreq = 1;
	
	this.action_motions = {};
	this.action_prop = {};
	
	this.htmlElements = [];
	this.htmlElementMouse;
	this.tickPlayer;

	this.bitmap;
	this.refresh(prop);

	
	this.func_trigger = {};
	
	createjs.Ticker.addListener(this);

}



var p = {
	
	refresh: function(prop) {
		this.sprite.removeAllChildren();
		this.x = prop.x;
		this.y = prop.y;
		this.regX = prop.regX;
		this.regY = prop.regY;
		this.real_x = prop.x * this.render.tile_w;
		this.real_y = prop.y * this.render.tile_h;
		this.nbSequenceX  = prop.nbSequenceX || 4;
		this.nbSequenceY  = prop.nbSequenceY || 4;
		this.speedAnimation  = prop.speedAnimation || 5;
		this.graphic_pattern = prop.graphic_pattern === undefined ? 0 : prop.graphic_pattern;
		this.direction = prop.direction;
		this.direction_fix = prop.direction_fix;   // Direction does not change ; no animation
		this.no_animation = prop.no_animation; // no animation even if the direction changes
		this.stop_animation = prop.stop_animation;
		this.frequence = (prop.frequence ||  0) * 5;
		this.speed = prop.speed === undefined ? 4 : prop.speed;
		this.sprite.z = prop.alwaysOnBottom ? 0 : false; // For z sort;
		this.actions = prop.actions || [];
		this.currentPage = prop.currentPage;
		if (prop.alwaysOnBottom === false) {
			this.sprite.z = prop.alwaysOnTop ? (this.render.getMapHeight() + 1) * this.render.tile_h : false;
		}

	},
	
	_start: function() {
		if (this.stop_animation) {
			this.animation('stop');
		}
	},

	displayEvent: function(graphic, only_change) {
		var self = this;
		var i;
		this.character_hue = graphic;
		
		Cache.characters(graphic, function(chara) {
			self.height = chara.height/self.nbSequenceY;
			self.width = chara.width/self.nbSequenceX;
			if (self.regY === undefined) {
				self.regY = self.height - self.render.tile_h;
			}
			if (self.regX === undefined) {
				self.regX = self.width - self.render.tile_w;
			}
			var up = self.nbSequenceX * (self.nbSequenceY-1) + self.graphic_pattern; // last line
			var right = self.nbSequenceX * (self.nbSequenceY-2 < 0 ? 0 : self.nbSequenceY-2) + self.graphic_pattern;
			var left = self.nbSequenceX * (self.nbSequenceY-3 < 0 ? 0 : self.nbSequenceY-3) + self.graphic_pattern;
			var bottom = 0 + self.graphic_pattern;
			var nb = self.nbSequenceX-1;
			
			var anim = {
						walkUp: [up, up + nb], 
						walkRight: [right,right + nb], 
						walkBottom: [bottom, bottom + nb],
						walkLeft: [left, left + nb],
						up: [up],
						right: [right],
						bottom: [bottom],
						left: [left]				
				  }
			
			var spriteSheet = new createjs.SpriteSheet({
				  images: [
				  	chara
				  ],
				  frames: {
				  	width:self.width, 
				  	height:self.height
				  },
				  animations: anim
			});
			var bmpSeq = new createjs.BitmapAnimation(spriteSheet);
			if (self.direction) {
				bmpSeq.gotoAndStop(self.direction);
			}
			bmpSeq.waitFrame = Math.round(self.render.fps / self.speedAnimation);
			
			self.sprite.regY = self.regY;
			self.sprite.regX = self.regX;
			
			if (!only_change) self.render.setPosition(self.id, self.x, self.y);
			
			bmpSeq.name = "event";
			bmpSeq.id = self.id;
			self.bitmap = bmpSeq;
			self.sprite.addChild(bmpSeq);
			self.render.layer[3].addChild(self.sprite);
		
			
			if (!only_change) {
				var act, name, spritesheet;
				var regex = new RegExp("(.*?)\\.(.*?)$", "gi");
				var match = regex.exec(graphic);
				
				for (i=0 ; i < self.actions.length ; i++) {	
					name = self.actions[i];
					act = self.render.actions[name];
					if (match != null) {
						Cache.characters(match[1] + act.suffix_motion[0] + '.' + match[2], function(img, name) {
							spritesheet = new createjs.SpriteSheet({
				  			images: [
				  				img
				  			],
				  			frames: {
				  				width:img.width/self.nbSequenceX, 
				  				height:img.height/self.nbSequenceY
				  			},
				  			animations: anim
							});
							bmpSeq = bmpSeq.clone();
							bmpSeq.spriteSheet = spritesheet;
							self.action_motions[name] = bmpSeq;
						}, name);
					}
				}
				
				
				if (Render.debug) {
					var size = new Shape();
					size.graphics.beginStroke("#00FF00").drawRect(0, 0, self.width, self.height);
					self.sprite.addChild(size);
					var point_reg = new Shape();
					point_reg.graphics.beginStroke("#FF0000").drawRect(self.sprite.regX, self.sprite.regY, self.render.tile_w, self.render.tile_h);
					self.sprite.addChild(point_reg);
				}
			
			
				self._start();
				self.render._sortEventsDepthIndex();
				self.htmlElementMouse = document.createElement("div");
				self.setMouseElement(0, 0, self.width, self.height);
				DataLink.emit("loadEvent", {id: self.id});
			}
		});
		
	},
	// Private
	tick: function() { // -C?
		var self = this;
		if (this.bitmap == undefined) return;
	
		if (this._wait.frame > 0) {
			this._wait.frame--;
			if (this._wait.frame == 0 && this._wait.callback) this._wait.callback();
			if (this._wait.block) return;
		}
		
		var bmp_x = this.sprite.x;
		var bmp_y = this.sprite.y;
		var real_x = /*this.x * this.rpg.tile_w; */ this.real_x;
		var real_y = /*this.y * this.rpg.tile_h;*/ this.real_y;
		var finish_step = '';
		// if (!this._moveReal) {
			if (bmp_x != real_x) {
				if (real_x > bmp_x) {
					bmp_x += +this.speed;		
					if (bmp_x >= real_x) {
						bmp_x = real_x;
						finish_step = 'right';

					}
				}
				else if (real_x < bmp_x) {
					bmp_x -= +this.speed;
					if (bmp_x <= real_x) {
						bmp_x = real_x;
						finish_step = 'left';
					}
					
				}
				if (this.fixcamera) {
					this.render.screen_x = bmp_x - this.render.canvas.width/2 + (this.render.canvas.width/2 % this.render.tile_w);
					
				}
				this.sprite.x = bmp_x;

			}
			if (bmp_y != real_y) {
				
				if (real_y > bmp_y) {
					bmp_y += +this.speed;
					if (bmp_y >= real_y) {
						bmp_y = real_y;
						finish_step = 'bottom';
					}
					
					
				}
				else if (real_y < bmp_y) {
					bmp_y -= +this.speed;
					if (bmp_y <= real_y) {
						bmp_y = real_y;
						finish_step = 'up';
					}
		
				}
				if (this.fixcamera) {
					this.render.screen_y = bmp_y - this.render.canvas.height/2 + (this.render.canvas.height/2 % this.render.tile_h);
				}
				this.sprite.y = bmp_y;
			}
			if (finish_step != '' || this.currentFreq > 1) {
				if (this.currentFreq == this.frequence || this.frequence == 0) {
					
					this.call('onFinishStep', finish_step);
					this.currentFreq = 1;
				}
				else {
					this.animation('stop');
					this.currentFreq++;
				}
			}
			
	
		if (this.tickPlayer) {
			this.tickPlayer();
		}
		
		
		
		/*
		if (this.actionBattle) {
			var detect = this.detectionPlayer(this.actionBattle.area);			
			if (detect && !this.detection) {
				this.detection = true;
				var detection = this.rpg.actionBattle.detection ? this.rpg.actionBattle.detection[this.actionBattle.detection] : false;
				this.rpg.setEventMode(this, 'detection');
				if (detection) {
					detection(this);
				}
			}
			else if (!detect && this.detection) {
				this.detection = false;
				var nodetection = this.rpg.actionBattle.nodetection ? this.rpg.actionBattle.nodetection[this.actionBattle.nodetection] : false;
				this.rpg.setEventMode(this, 'nodetection');
				if (nodetection) {
					nodetection(this);
				}
			}
			
			if (this.actionBattle.mode == 'offensive') {
				if (this.rpg.actionBattle.eventOffensive && this.actionBattle.offensive) {
					this.rpg.actionBattle.eventOffensive[this.actionBattle.offensive](this);			
				}
				//var player = this.getEventAround(true);
				var real_x = this.sprite.x;
				var real_y = this.sprite.y;
				switch(this.direction) {
					case 'up':
						real_y -= this.speed;
					break;
					case 'right':
						real_x += this.speed;
					break;
					case 'left':	
						real_x -= this.speed;
					break;
					case 'bottom':
						real_y += this.speed;
					break;
				}
				var player = this.contactWithEvent(real_x, real_y);
				if (player.length > 0) {
					this.rpg.setEventMode(this, 'attack');
					if (this.rpg.actionBattle.eventAttack && this.actionBattle.attack) {
						this.rpg.actionBattle.eventAttack[this.actionBattle.attack](this);			
					}
				}
				
				// if (player.up.length > 0 || player.left.length > 0 || player.right.length > 0 || player.bottom.length > 0) {
					// this.rpg.setEventMode(this, 'attack');
					// if (this.rpg.actionBattle.eventAttack && this.actionBattle.attack) {
						// this.rpg.actionBattle.eventAttack[this.actionBattle.attack](this);			
					// }
				// }
			}
		}	
		*/
		// -- Begin Action Wait
		for (var key in this.action_prop) {
			if (!isNaN(this.action_prop[key].wait)) {
				this.action_prop[key].wait++;
			}
		}
		// -- End Action Wait
		
		// -- Begin Blink 
		if (this._blink && this._blink.current) {
			if (this._blink.currentDuration != this._blink.duration) {
				if (this._blink.currentFrequence >= this._blink.frequence) {
					this._blink.currentFrequence = 0;
					this._blink.visible = this._blink.visible ? false : true;
					this.visible(this._blink.visible);
				}
				this._blink.currentDuration++
				this._blink.currentFrequence++
			}
			else {
				this._blink.current = false;
				this.visible(true);
				if (this._blink.callback) this._blink.callback();
			}
		}
		// -- End Blink
		
		var element = this.htmlElementMouse;
		var x = element.getAttribute("data-px");
		var y = element.getAttribute("data-py");
		var pt = this.sprite.localToGlobal(x, y);
		element.style.left = pt.x + "px";
		element.style.top = pt.y + "px";
		
		//this._tickState();

	},
	/**
     * Animation Event
	 * @method animation
	 * @param {String} sequence up|bottom|left|right|walkUp|walkBottom|walkLeft|walkRight|walk|stop <br />
			<ul>
				<li>walk: Walking Animation in the current direction of the event</li>
				<li>stop: No animation in the current direction of the event</li>
			</ul>
	 * @param {Integer} speed Speed of the animation. The higher the value, the greater the fade is slow
	 * @param {Function} onFinish (optional) Callback when the animation is finished.
	 * @param {Function} nbSequence (optional) Number of times the animation is repeated. By default loop
    */
	animation: function(sequence, speed, onFinish, nbSequence, onChangeFrame) { // -C
		if (!this.bitmap) return false;
		if (sequence == 'stop') {
			if (this.stop_animation) {
				sequence = 'walk';
			}
			else if (!this.direction_fix) {		
				this.bitmap.gotoAndStop(this.direction);
				return;
			}
			else if (this.direction_fix) {
				return;
			}
			
		}
		if (sequence == 'walk') {
			// if (!this.direction_fix) {
				switch (this.direction) {
					case 'left':
						sequence = 'walkLeft';
					break;
					case 'right':
						sequence = 'walkRight';
					break;
					case 'up':
						sequence = 'walkUp';
					break;
					case 'bottom':
						sequence = 'walkBottom';
					break;
				}
			// }
		}
		if (this.bitmap.currentSequence != sequence) {
			this.bitmap.nbSequenceToPlay = nbSequence ? nbSequence : -1;
			//this.bitmap.onChangeFrame(onChangeFrame);
			this.bitmap.gotoAndPlay(sequence);
			this.bitmap.waitFrame = speed ? Math.ceil(this.render.fps / speed) : this.bitmap.waitFrame;
			this.bitmap.callback  = onFinish;
		}
	},
	/**
     * Set the camera to the event. Moving the map will be based on this event
	 * @method fixCamera
	 * @param {Boolean} bool Set the camera if true.
    */
	fixCamera: function(bool) {
		for (var i=0; i < this.render.renderEvents.length ; i++) {
			this.render.renderEvents[i].fixcamera = false;
		}
		if (this.render.player) {
			this.render.player.fixcamera = false;
		}
		this.fixcamera = bool;
	},	
	/**
     * Remove the event with a fade
	 * @method fadeOut
	 * @param {Integer} speed Fade rate. The higher the value, the greater the fade is slow
	 * @param {Function} callback (optional) Callback when the fade is complete
    */
	fadeOut: function(speed, callback) { // -C
		new Effect(this.sprite).fadeOut(speed, callback);
	},
	
	/**
     * Show the event with a fade
	 * @method fadeIn
	 * @param {Integer} speed Fade rate. The higher the value, the greater the fade is slow
	 * @param {Function} callback (optional) Callback when the fade is complete
    */
	fadeIn: function(speed, callback) { // -C
		new Effect(this.sprite).fadeIn(speed, callback);
	},
	
	/**
     * Blink.
	 * @method blink
	 * @param {Integer} duration Duration of blink in frames
	 * @param {Integer} frequence Frequency of blinking. The higher the value, the more it flashes fast
	 * @param {Function} callback (optional) Callback when the blink is complete
    */
	blink: function(duration, frequence, callback) { // -C
		this._blink = {}
		this._blink.duration = duration;
		this._blink.currentDuration = 0;
		this._blink.frequence = frequence;
		this._blink.currentFrequence = 0;
		this._blink.visible = true;
		this._blink.current = true;
		this._blink.callback = callback;
	},
	/**
     * Makes visible or not the event
	 * @method visible
	 * @param {Boolean} visible false to make invisible
    */
	visible: function(visible) { // -C
		this.sprite.visible = visible;
	},
	/**
     * Changes the direction of the event and stops the animation
	 * @method setStopDirection
	 * @param {String} dir left|right|up|bottom Direction
    */
	setStopDirection: function(dir) { // -C?
		this.direction = dir;
		this.animation('stop');
	},
	changeBitmap: function(bitmap) {  // -C
		this.sprite.removeChild(this.bitmap);
		this.bitmap = bitmap.clone();
		this.sprite.addChild(this.bitmap);
	},
	/**
     * Put the event in under another évèvnement (retrieve its index)
	 * @method setIndexBefore
	 * @param {Integer} index Index of the other event
    */
	setIndexBefore: function(index) { //  -C
		var i = index-1;
		if (i < 0) {
			i = 0;
		}
		this.setIndexAfter(i);
	},
	
	/**
     * Put the event at the top of another event (state index)
	 * @method setIndexAfter
	 * @param {Integer} index Index of the other event
    */
	setIndexAfter: function(index) { // -C
		var layer = this.rpg.layer[3];
		layer.removeChild(this.sprite);
		layer.addChildAt(this.sprite, index);
	},
	
	/**
     * Get the index
	 * @method getIndex
	 * @return {Integer} index Index
    */
	getIndex: function() { // -C
		return this.rpg.layer[3].getChildIndex(this.sprite);
	},
	
	/**
     * Event waiting for a number of frames. 
	 * @method wait
	 * @param {Integer} frame Number of frames
	 * @param {Boolean} block (optional) The method "tick" is blocked during this time. By default : false
	 * @param {Function} callback (optional) Callback when the wait is over
    */
	wait: function(frame, block, callback) {
		this._wait.frame = frame;
		this._wait.block = block;
		this._wait.callback = callback ;
	},
	
	move: function(dir, real_x, real_y, is_passable) {

		var pos = 0, self = this;
		if (!this.no_animation) {
			switch (dir[0]) {
				case 'up':
				case 2:
					this.direction = "up";
					 self.animation('walkUp');
				break;
				case 'left':
				case 4:
					this.direction = "left";
					self.animation('walkLeft');
				break;
				case 'right':
				case 6:
					this.direction = "right";
					self.animation('walkRight');
				break;
				case 'bottom':
				case 8:
					this.direction = "bottom";
					self.animation('walkBottom');
				break;
			}
		}
		
		if (!is_passable) {
			self.animation('stop');
			return;
		}
		

		this.bind('onFinishStep', function(_passable) {
			pos++;
			if (pos >= dir.length) {
				self.call('onFinishMove', _passable);
				self.moving = false;
				
			}
			else {
				//moving();
			}
		});
		
		if (!is_passable) {
			this.call('onFinishStep', is_passable);
		}
		
		this.render._sortEventsDepthIndex();
	
		this.real_x = real_x;
		this.real_y = real_y;
		
	},
	// Private
	bind: function(name, func) {
		this.func_trigger[name] = func;
	},
	
	// Private
	call: function(name, params) {
		if (this.func_trigger[name]) {
			this.func_trigger[name](params);
		}
	},
	
	/**
     * The animation is stopped and put in the direction of player. See "directionRelativeToPlayer"
	 * @method turnTowardPlayer
    */
	turnTowardPlayer: function() { // -C
		var player = this.render.player;
		if (player) {
			var dir = this.directionRelativeToPlayer();
			if (dir == 2) {
				this.setStopDirection('up');
			}
			else if (dir == 8) {
				this.setStopDirection('bottom');
			}
			else if (dir == 6) {
				this.setStopDirection('right');
			}
			else if (dir == 4) {
				this.setStopDirection('left');
			}
		}
	},
	
	setStopDirection: function(dir) { // -C?
		this.direction = dir;
		this.animation('stop');
	},
	
	directionRelativeToPlayer: function() {
		var player = this.render.player;
		var real_x = Math.floor(this.real_x / player.speed) * player.speed;
		var real_y = Math.floor(this.real_y / player.speed) * player.speed;
		if (player) {
			if (player.real_y < real_y) {
				return 2;
			}
			 if (player.real_y > real_y) {
				return 8;
			}
			 if (player.real_x > real_x) {
				return 6;
			}
			 if (player.real_x < real_x) {
				return 4;
			}
		}
		

		
		return false;
	},
	
	/**
     * The current movement is stopped. For cons, the "move" can always be called
	 * @method moveStop
	 * @param animation_stop (optional) {Boolean} Also stop the animation (if true);
    */
	moveStop: function(animation_stop) {
		if (animation_stop) this.animation('stop');
		this._setBehaviorMove("stop");
		this.stopMove = true;
	},
	
	/*
     * The movement may continue
	 * @method moveStart
    */
	moveStart: function() {
		this.stopMove = false;
	},
	
	_setBehaviorMove: function(move) {
		this.real_x = this.sprite.x;
		this.real_y = this.sprite.y;
		this.behaviorMove = move;
	},
	
	/**
     * Perform an action on the event. The action must first be added. See "addAction" in class Rpg
	 * @method action
	 * @param {String} name Action Name
	 * @param {Function} onFinish (optional) Callback function when the action is over. One parameter: the event which made the action
    */
	action: function(name) {
		// Initialize
		var action = this.render.actions[name];
		var i = 0;
		var self = this;
		var bmp_ini = this.bitmap;
		var anim, duration;
		
		// Change Proprieties Movement
		this.changeBitmap(this.action_motions[name]);
		this.direction_fix = true;
		this.no_animation = true;
		this.inAction = true;
		this.blockMovement = action.block_movement;
		
				
		
		
		// Animation
		function playAnimation(animation_type) {
			if (action[animation_type]) {
				if (typeof action[animation_type] === "string") {
					anim = action[animation_type];
				}
				else {
					anim = action[animation_type][self.direction];
				}
				if (anim) {
					self.rpg.animations[anim].setPosition(self.x, self.y);
					self.rpg.animations[anim].play();
				}
			}
		}
		
		// Action Battle
		//this.actionType(action.action);

		// Animation Event
		duration = action.duration_motion ? action.duration_motion : 1;
		playAnimation('animations');
		this.animation('walk', action.speed !== undefined ? action.speed : 10, function(bmp) {
			if (i > 0) {
				playAnimation('animations');
			}
			if (duration-1 == i) {
				bmp.paused = true;
				actionFinish();
			}
			i++;
		}, duration, function(frame) {
			
		});
		

		// Action Finish
		function actionFinish() {
			self.blockMovement = false;
			self.direction_fix = false;
			self.no_animation = false;
			self.changeBitmap(bmp_ini);
			self.animation('stop');
			self.inAction = false;
			self.action_prop[name] = {}
			self.action_prop[name].wait = 0;
			playAnimation('animation_finish');
			DataLink.emit('actionFinish', {name: name});
			if (action.onFinish) action.onFinish(self);
			//if (onFinish) onFinish(self);
		}
	
	},
	
	/**
     * Defines the position and size of the square on the event that triggers the event of the mouse (onMouseOver and onMouseOut)
	 * @method setMouseElement
     * @param {Integer} x Position X in pixels
     * @param {Integer} y Position Y in pixels
     * @param {Integer} width Width in pixels
     * @param {Integer} height Height in pixels
    */
	setMouseElement: function(x, y, width, height) { // -C
		var element = this.htmlElementMouse;
		var pt = this.sprite.localToGlobal(x, y);
		element.style.position = 'absolute';
		element.style.width  = 	width + "px";
		element.style.height =	height + "px";
		element.style.left  = 	pt.x + "px";
		element.style.top 	=	pt.y + "px";
		element.setAttribute("data-px", x);
		element.setAttribute("data-py", y);
		this.htmlElementMouse = element;
	},
	
	/**
     * Get the HTML element of the event according to its ID.
	 * @method getElementById
	 * @param {String} id Div id
	 * @return HTMLElement or false if absent. Example :
		<pre>
			var event = rpg.getEventByName("foo");
			rpg.addHtmlElement("<div id="bar">Hello World</div>", -10, -15, event);
			event.getElementById("bar"); // Return HTMLElement
		</pre>
    */
	getElementById: function(id) {
		var i;
		var reg = new RegExp("^" + id + "-");
		for (i=0 ; i < this.htmlElements.length ; i++) {
			var element = this.htmlElements[i].childNodes[0];
			if (reg.test(element.getAttribute('id'))) {
				return element;
			}
		}
		return false;
	}
}

function InputPlayer(render, id, prop) {

	if (!render) return;
	
	var speed = prop.speed ? prop.speed : 8;
	// rpg.setScrolling(speed);
	var prop_event = [{
		name: 'Player',
		x: prop.x,
		y: prop.y,
		real_x: prop.real_x,
		real_y: prop.real_y,
		regX: prop.regX,
		regY: prop.regY,
		actions: prop.actions
	},
	
		[	
			{
				
				character_hue: prop.filename,
				direction: prop.direction ? prop.direction : 'bottom',
				trigger: 'player',
				no_animation: prop.no_animation,
				speed: speed,
				commands: [],
				action_battle: prop.actionBattle,
				nbSequenceX: prop.nbSequenceX,
				nbSequenceY: prop.nbSequenceY,
				speedAnimation: prop.speedAnimation
			}
		]
	];	
   render.speedScrolling = speed;

   this.moveWithMouse = false;
  
   this._useMouse = false;
   this.moving = false;
   this.keypress = false;
   this.freeze = false;

   this.transfert = [];
   this.inTransfert = false;
   
   this.parent = RenderEvent;  
   this.parent(render, id, prop);
   
   this.handleKeyPress();
   // this.setTypeMove("real");
   this.movementBlock = false;
   this.tickPlayer = this._tick;
   this.old_direction = this.direction;
	 
}

for (var obj in p) { 
	interpreterRender[obj] = p[obj]; 
} 


var p = InputPlayer.prototype = new RenderEvent();

p.handleKeyPress = function() {
	var self = this;
	var arrows = [Input.Left, Input.Up, Input.Right, Input.Bottom];
	var action_id;
	
	for (i = 0 ; i < this.actions.length ; i++) {
		act = this.render.actions[this.actions[i]];	
		if (act['keypress']) {
			action_id = this.actions[i];
			Input.press(act['keypress'], function(e) {
				DataLink.emit('action', {name: action_id});
			});
		}
	}
	
	Input.keyDown(arrows, function(e) {
		var blockMovement = self.movementIsBlocked();
		if (!self.freeze && !blockMovement) {
			if (!blockMovement) {
				
				if (Function.endArray(Input.keyBuffer) !=  e.keyCode) {
					Input.keyBuffer.push(e.keyCode);
					
				}

			}
		}
	});
	
	Input.press([Input.Enter, Input.Space], function(e) {
		self.triggerEventBeside();
	});
	
	Input.keyUp(function(e) {
		if (self.freeze) return false;	
		Input.keyBuffer = Function.unsetArrayElement(Input.keyBuffer, e.keyCode);
		Input.cacheKeyBuffer = Function.unsetArrayElement(Input.keyBuffer, e.keyCode);
	});

}


/**
 * Whether the player's movement is blocked. The movement is blocked when the player is in action or when a window is displayed and property "blockMovement" to true
 * @method movementIsBlocked
 * @return Boolean min Returns true if the player's movement is blocked
*/
p.movementIsBlocked = function() {
	var blockMovement = false;
	
	if (this.movementBlock) return true;
	if (this.render.inAction) return false;

	for (var i=0 ; i < this.render.currentWindows.length ; i++) {
		if (this.render.currentWindows[i].blockMovement) {
			blockMovement = true;
			break;
		}
	}
	return blockMovement;
}

p.movementPause = function(bool) {
	this.movementBlock = bool;
}

 /**
 * Indicate that the player can use the mouse to play
 * @method useMouse
 * @param {Boolean} bool Enables or disables the use of the mouse
 * @param {Function} callback (optional) Function called when the user clicks
 */
p.useMouse = function(bool, callback) {
	this._useMouse = bool;
	if (bool) {
		this.render.bindMouseEvent("click", function(obj) {
			if (callback) callback(obj);
		});
	}
	else {
		this.render.unbindMouseEvent("click");
	}
}


p.triggerEventBeside = function() {
	var blockMovement = this.movementIsBlocked();
	if (this.freeze && !blockMovement) return false;
	
	DataLink.emit("triggerEventBeside", {id: this.id});
}

p.interactionEventBeside = function(event, player_id) {
	var self = this;
	var is_player = player_id == this.id;
	if (is_player) {
		Input.memorize();
		Input.keyBuffer = [];
		this.freeze = true;
	}

	var ini_dir = event.direction;
	if (!event.direction_fix) {
		event.turnTowardPlayer();
	}
	var currentPage = event.currentPage;
	// event.moveStop();
	event.bind('onFinishCommand', function() {
		if (event.currentPage == currentPage) {
			event.setStopDirection(ini_dir);
			event.moveStart();
			//event.moveType();
		}
		self.freeze = false;
		//self.eventsContact = false;
		Input.restore();
	});
}

p._tick = function() {
	var self = this;
	 if ((Input.keyBuffer.length > 0 && !this.moving) || this.moveWithMouse) {
		if (!this.moveWithMouse) {
			var key = Function.endArray(Input.keyBuffer);
			var direction = 0;
			switch(key) {
				case Input.Left:
					// if (this.rpg.isPassable(this.x - 1, this.y)) {
						direction = 4;
					// }

					
				break;
				case Input.Up:
					// if (this.rpg.isPassable(this.x, this.y - 1)) {
						direction = 2;
					// }
					
				break;
				case Input.Right:	
					// if (this.rpg.isPassable(this.x + 1, this.y)) {
						direction = 6;
					// }
					
				break;
				case Input.Bottom:
					// if (this.rpg.isPassable(this.x, this.y + 1)) {
						direction = 8;
					// }
					
				break;
			}
		}
		
		if (!self.moving) {
			// self.moving = true;
			DataLink.emit("movePlayer", {dir: [direction]});
			
			this.bind('onFinishMove', function(passable) {
				if (passable && Input.keyBuffer.length == 0 && !self.inAction) {
					DataLink.emit("stopPlayer", {});
					self.animation('stop');
				}
			});

			
	
		}


	}
}

/**
 * Whether the player's movement is blocked. The movement is blocked when the player is in action or when a window is displayed and property "blockMovement" to true
 * @method movementIsBlocked
 * @return Boolean min Returns true if the player's movement is blocked
*/
p.movementIsBlocked = function() {
	var blockMovement = false;
	
	if (this.movementBlock) return true;
	if (this.render.inAction) return false;

	for (var i=0 ; i < this.render.currentWindows.length ; i++) {
		if (this.render.currentWindows[i].blockMovement) {
			blockMovement = true;
			break;
		}
	}
	return blockMovement;
}

p.movementPause = function(bool) {
	this.movementBlock = bool;
}

p.assignKey = function() {
	this.handleKeyPress();
}





function Render(canvas_tag) {
	
	/**
     * The canvas 2D
	 * @property canvas
     * @type Canvas
     */
	
	this.canvas = document.getElementById(canvas_tag);

	/**
     * The canvas 2D context object to draw into
	 * @property ctx
     * @type CanvasRenderingContext2D
     */
	this.ctx = this.canvas.getContext("2d");
	
	 /**
     * Object "Stage"
	 * @property stage
     * @type Stage
     */
	this.stage = new createjs.Stage(this.canvas);
	
	this.tile_w = 32;
	this.tile_h = 32;
	this.nb_autotiles = 64;
	this.speedScrolling = 4;
	this.currentMap = [[]];
	// this.targetScreen;
	this.screen_x = 0;
	this.screen_y = 0;
	this.screen_refresh = {};
	this.isometric = false;
	
	this.containerMap = {x: 0, y: 0};
	this.layer = [];
	this.htmlElements = [];
	this.onMouseEvent = {};
	this._onLoadMap = function() {};
	
	this.renderEvents = [];
	
	this.animations = {};
	
	// -- Animations
	this.propAnimations = {};
	
	// -- Player
	/**
     * Object "Player". Properties player
	 * @property player
     * @type Player
    */
	this.player;

	this.actions = {};

	// -- Pictures
	this.pictures = {};



	// Sound
	 /**
     * Audio object of each type of sound. By default : {bgm: '', bgs: '', me: '', se: ''}
	 * @property currentSound
     * @type Object
     */
	this.currentSound = {
		bgm: '',
		bgs: '',
		me: '',
		se: ''
	};
	 /**
     * Current volume of each sound. By default : {bgm: 1, bgs: 1, me: 1, se: 1}
	 * @property soundVolume
     * @type Object
     */
	this.soundVolume = {
		bgm: 1,
		bgs: 1,
		me: 1,
		se: 1
	};

	// -- Windowskins
	/**
     * Windowskin default for dialog boxes
	 * @property windowskinDefault
     * @type String
	 * @default 001-Blue01.png
    */
	this.windowskinDefault = '001-Blue01.png';
	this.currentWindows = [];

	this.plugins = {};
	this._listener = {};
	
	this.init();
}

Render.prototype = {
	init: function() {

		if (Render.debug) {
			this.fpsLabel = new Text("-- fps","Bold 18px Arial","#FFF");
			this.stage.addChild(this.fpsLabel);
			this.fpsLabel.x = 10;
			this.fpsLabel.y = 20;
		}
		
		var container = new createjs.Container();
		var id = this.canvas.id + '-dom';
		div = document.createElement("div");
		div.setAttribute("id", id);
		div.style.position = 'absolute';
		div.style.overflow = 'hidden';
		// Disable Highlight Color in Android Browser
		if (!document.head) document.head = document.getElementsByTagName('head')[0];
		document.head.appendChild(document.createElement("style"));
		var insertCss = Function.endArray(document.styleSheets);
		insertCss.insertRule("#" + id + " {-webkit-tap-highlight-color: rgba(0, 0, 0, 0);}", insertCss.cssRules.length);
		//--
		div.style.left = Math.round(this.canvas.offsetLeft) + "px";
		div.style.top = Math.round(this.canvas.offsetTop) + "px";
		div.style.width = this.canvas.width + "px";
		div.style.height = this.canvas.height + "px";
		
		if (navigator.userAgent.toLowerCase().indexOf('msie') != -1) div.style.backgroundColor = "rgba(0, 0, 0, 0)"; 
		document.body.appendChild(div) ;
		this._setMouseEvent(div);
		
		this.setFPS(25);
		createjs.Ticker.addListener(this);	
		
		this.initPlugins();
		this._datalinks();
	},
	_datalinks: function() {
		var self = this;
		DataLink.on("loadMap", function(data) {
			self.map(data);
		});
		DataLink.on("addEvent", function(data) {
			self.addEvent(data.id, data.graphic, data.params);
		});
		DataLink.on("addAction", function(data) {
			self.addAction(data.name, data.prop);
		});
		DataLink.on("refreshEvent", function(data) {
			self.refreshEvent(data.id, data.graphic, data.params);
		});
		DataLink.on("initPlayer", function(data) {
			self.initPlayer(data.id, data.graphic, data.params);
		});
		DataLink.on("setPosition", function(data) {
			self.setPosition(data.id, data.x, data.y);
		});
		DataLink.on("move", function(data) {
			var event = self.getEventRenderById(data.id);
			event.move(data.dir, data.real_x, data.real_y, data.is_passable, data.callback);
		});
		DataLink.on("stop", function(data) {
			var event = self.getEventRenderById(data.id);
			event.animation('stop');
		});
		DataLink.on("action", function(data) {
			var event = self.getEventRenderById(data.id);
			event.action(data.name);
		});
		DataLink.on("removeEvent", function(data) {
			self.removeEvent(data.id);
		});
		DataLink.on("eventCommand", function(data) {
			var event = self.getEventRenderById(data.event_id);
			self.player.interactionEventBeside(event, data.player_id);
		});
		DataLink.on("eventInterpreter", function(data) {
			var event = self.getEventRenderById(data.event_id);
			if (event) {
				if (event[data.func]) {
					event.cmdfinish = data.params.nextCmd ? false : true;
					event.next = data.player_id == self.player.id;
					event[data.func](data.params, event);
				}
				else {
					event.call('onFinishCommand');
				}
			}
			else {
				self.player.freeze = false;
				Input.restore();
			}
		});
		DataLink.on("callListener", function(data) {
			self.callListener(data.name, data.params);
		});
		DataLink.on("callPlugin", function(data) {
			self.call(data.plugin_func, data.plugin_data, data.plugin_id);
		});
	},
	
	start: function() {
		DataLink.emit("start");	
	},
	
	// Private
	tick: function() {
		var self = this;
		var containerMap = {x: this.containerMap.x, y: this.containerMap.y};
		
		if (this.targetScreen == "Mouse") {
			this.screen_x = this.stage.mouseX;
			this.screen_y = this.stage.mouseY;	
		}
		else if (this.targetScreen == "Player") {
			//this.scroll(this.player.real_x, this.player.real_y);	
		}
		
		
		
		if (this.targetScreen) {
			

			// containerMap.x -= Math.abs(containerMap.x) == this.screen_x ? 0 : Math.floor((this.screen_x < Math.abs(containerMap.x) ? -32 : 32) / this.speedScrolling);
			// containerMap.y -= Math.abs(containerMap.y) == this.screen_y ? 0 : Math.floor((this.screen_y < Math.abs(containerMap.y) ? -32 : 32) / this.speedScrolling);
			
			//this.screen_x = this._multipleScreen(this.screen_x, 0).x;
			//console.log(containerMap.x, this.screen_x);
			//containerMap.x -= Math.abs(containerMap.x) == this.screen_x ? 0 : Math.floor((this.screen_x < Math.abs(containerMap.x) ? -this.tile_w : this.tile_w) / this.speedScrolling);
			containerMap.y -= Math.abs(containerMap.y) == this.screen_y ? 0 : Math.floor((this.screen_y < Math.abs(containerMap.y) ? -this.tile_h : this.tile_h) / this.speedScrolling);
			
			
			var absx = Math.abs(containerMap.x);
			var absy = Math.abs(containerMap.y);
			var speed_x = this.speedScrolling;
			var speed_y = this.speedScrolling;
			
			if (absx != this.screen_x) {
				if (this.screen_x > absx) {
					if (absx > this.screen_x - speed_x) {
						containerMap.x = -this.screen_x;
					}
					else {
						containerMap.x -= speed_x;
					}
				}
				else if (this.screen_x < absx) {
					if (absx < this.screen_x + speed_x) {
						containerMap.x = -this.screen_x;
					}
					else {
						containerMap.x += speed_x;
					}
				}
			}
			if (absy != this.screen_y) {
				if (this.screen_y > absy) {
					if (absy > this.screen_y - speed_y) {
						containerMap.y = -this.screen_y;
					}
					else {
						containerMap.y -= speed_y;
					}
				}
				else if (this.screen_y < absy) {
					if (absy < this.screen_y + speed_y) {
						containerMap.y = -this.screen_y;
					}
					else {
						containerMap.y += speed_y;
					}
				}
			}
			
			

			
			// containerMap.x -= Math.floor((this.screen_x - this.canvas.width/2) / this.speedScrolling);
			// containerMap.y -= Math.floor((this.screen_y - this.canvas.height/2) / this.speedScrolling);			
			
			if (containerMap.x > 0) {
				this.screen_x = containerMap.x = 0;
			}
			else if (containerMap.x + this.getMapWidth(true) < this.canvas.width) {
				containerMap.x = this.canvas.width - this.getMapWidth(true);
				containerMap.x = this._multipleScreen(containerMap.x, 0).x;
				this.screen_x = Math.abs(containerMap.x);
			}
			
			if (containerMap.y > 0) {
				this.screen_y = containerMap.y = 0;
			}
			else if (containerMap.y + this.getMapHeight(true) < this.canvas.height) {
				containerMap.y = this.canvas.height - this.getMapHeight(true);
				containerMap.y = this._multipleScreen(0, containerMap.y).y;
				this.screen_y = Math.abs(containerMap.y);
			}
			
			function refreshScreen(screen_xORy) {
				var screen, tile, coor, coor_start, scroll;
				
				if (screen_xORy) {
					screen = self.screen_x;
					tile = self.tile_w;
					coor = self.screen_refresh.x;
					coor_start = self.screen_refresh.start_x;
					scroll = self.screen_refresh.scroll_x;
				}
				else {
					screen = self.screen_y;
					tile = self.tile_h;
					coor = self.screen_refresh.y;
					coor_start = self.screen_refresh.start_y;
					scroll = self.screen_refresh.scroll_y;
				}
				
				

				if (Math.abs(coor - coor_start) >= tile/2 && scroll) {
					if (screen_xORy) {
						coor = self.screen_refresh.x = screen ;
						
					}
					else {
						coor = self.screen_refresh.y = screen;
					}
				}
				if (!isNaN(coor)) {
					if (coor != screen && !scroll) {
						var params = {};
						if (screen_xORy) {
							self.screen_refresh.start_x = screen ;
							self.screen_refresh.scroll_x = true;
						}
						else {
							self.screen_refresh.start_y = screen;
							self.screen_refresh.scroll_y = true;
						}
						if (coor > screen) {
							if (screen_xORy) {
								params.direction = 'left';
							}
							else {
								params.direction = 'up';
							}
						}
						else {
							if (screen_xORy) {
								params.direction = 'right';
							}
							else {
								params.direction = 'bottom';
							}
						}
						self.screen_refresh.dir = params.direction;
						
						// self.call('_scrollStart', params);
					}
					else if (coor == screen && scroll) {
						if (screen_xORy) {
							self.screen_refresh.scroll_x = false;
						}
						else {
							self.screen_refresh.scroll_y = false;
						}
		
						// self.call('_scrollFinish', {direction: self.screen_refresh.dir});
					}
				}
			}
			
			// refreshScreen(true);
			// refreshScreen(false);
			
			
		}
		
		if (this.currentMap) {
			this.screen_refresh.x = this.screen_x;
			this.screen_refresh.y = this.screen_y;
						
			if (this.canvas.width <= this.getMapWidth(true)) {
				this.containerMap.x = containerMap.x;
				
				
			}
			if (this.canvas.height <= this.getMapHeight(true)) {
				
				this.containerMap.y = containerMap.y;
				// if (this.layer && this.layer[0]) this.layer[0].y = containerMap.y;
			}	
			
		}
		
		this._tickHtmlElements();
		this._tickShake();
		//this._tickTransition();
		
		if (Render.debug) {
			this.fpsLabel.text = Math.round(createjs.Ticker.getMeasuredFPS())+" fps";
		}
		
		// this.call('update');
		this.stage.update();
	},
	// Private
	_multipleScreen: function(x, y) {
		var multiple_w = this.tile_w / this.speedScrolling;
		var multiple_h = this.tile_h / this.speedScrolling;
		
		x = Math.floor(x/multiple_w) * multiple_w ; 
		y = Math.floor(y/multiple_h) * multiple_h;
		return {x: x, y: y};
	},
	
	/**
     * Add an animation and create a object "Animation" 
	 * @method addAnimation
     * @param {Object} anim The object of the following structure :  <br />
			{ <br />
				name: {String} Name animation, <br />
				graphic: {String} Filename, <br /> 
				framesDefault (optional): {Object} Default properties of frames. For example: {x: 10} will move the position X 10 pixels each frame where the x property is not indicated. See the next property to the various properties of frames <br />
				frames: {Array} Each frame of animation, the element is an object with the properties of the frame : <br />
					<blockquote>pattern: {Integer} Id pattern <br />
					opacity (Optional): {Integer} Opacity pattern between 0 and 255. 0 being transparent <br />
					zoom (Optional): {Integer} Zoom pattern between 0 and 100 <br />
					x (Optional): {Integer} X position of the pattern animation <br />
					y (Optional): {Integer} Y position of the pattern animation </blockquote><br />
					rotation (Optional): {Integer} Rotation pattern between 0 and 360 <br />
				[sound: {String} Filename],
			}
     */
	addAnimation: function(anim, id) {
		var name = id || anim.name;
		this.animations[name] = new Animation(anim, this);
	},
	
	/**
     * Sets the size of a pattern animation
	 * @method setGraphicAnimation
     * @param {Integer} width Width pattern
     * @param {Integer} height Height pattern
    */
	setGraphicAnimation: function(width, height) {
		this.propAnimations.pattern_w = width;
		this.propAnimations.pattern_h = height;
	},
	
	/**
     * Width of the current map
	 * @method getMapWidth
     * @param {Boolean} real (Optional) if true, return the exact size in pixels
     * @return {Integer} Map width
    */
	getMapWidth: function(real) {
		return this.currentMap.length * (real ? this.tile_w : 1);
	},
	
	/**
     * Height of the current map
	 * @method getMapHeight
     * @param {Boolean} real (Optional) if true, return the exact size in pixels
     * @return {Integer} Map height
    */
	getMapHeight: function(real) {
		return this.currentMap[0].length * (real ? this.tile_h : 1);
	},
	
	/**
     * Move map to positions
	 * @method scroll
     * @param {Integer} x X Position
	 * @param {Integer} y Y Position
    */
	scroll: function(x, y) { 
        this.screen_x = x;
        this.screen_y = y;
    },
	/**
     * Sets FPS
	 * @method setFPS
     * @param {Integer} fps
	 * @default 20
    */
	setFPS: function(fps) {
		this.fps = fps;
		createjs.Ticker.setFPS(fps);
	},
	
	mapFreeze: function(value) {
		createjs.Ticker.setPaused(value);
	},
	clone: function(srcInstance) {
		var i;
		if(typeof(srcInstance) != 'object' || srcInstance == null) {
			return srcInstance;
		}
		var newInstance = srcInstance.constructor();
		for(i in srcInstance){
			newInstance[i] = this.clone(srcInstance[i]);
		}
		return newInstance;
	},
	/**
     * Priority of the tile to the superposition
	 * @method tilePriority
     * @param {Integer} tile_id Tile ID
	 * @return {Integer} Priority. Between 0 and 2, the tile is below the events (and player). Beyond 4 (included), the tile overlaps the event (and player). A tile Priority 2 superimposes a square of 0. The latter being the ground
    */
	tilePriority: function(tile_id) {
		if (!this.mapData.propreties[tile_id]) {
			return 0;
		}
		return this.mapData.propreties[tile_id][0];
	},
	
	_positionValueToReal: function(x, y) {
		var pos = {};
		if (this.isometric) {
			pos.x = 320 + this.screen_x + (x - y) * this.tile_w / 2;
			pos.y = this.screen_y + (x + y) * this.tile_h / 2;
		}	
		else {
			pos.x = x * this.tile_w
			pos.y = y * this.tile_h;
		}
		return pos;
	},
	
	_positionRealToValue: function(real_x, real_y) {
		var pos = {};
		if (this.isometric) {

			pos.x = real_y / this.tile_h  + real_x / this.tile_w;
			pos.y = real_y / this.tile_h  - real_x / this.tile_w;
			
		}	
		else {
			pos.x = Math.floor(real_x / this.tile_w);
			pos.y = Math.floor(real_y / this.tile_h);
		}
		return pos;
	},
	
	
	/**
     * Remove the map
	 * @method clearMap
    */
	clearMap: function() {
		var i;
		for (i=0 ; i < 9 ; i++) {
			this.layer[i] = new createjs.Container();
		}
		
		for (i=0 ; i < this.renderEvents.length ; i++) {
			createjs.Ticker.removeListener(this.renderEvents[i]);
		}
		
		this.renderEvents = [];
		
		Input.keyBuffer = [];
		
		//this.bind('update', function() {});
		
		if (this.containerMap.name !== undefined) {
			this.stage.clear();
			this.containerMap.removeAllChildren();
			if (this.player) {
				this.player.moving = false;
				//this.player.refreshBitmap();
			}
			if (this.tone) {
				this.tone = false;
			}

			this.stage.removeChild(this.containerMap);
		}
	},
	
	/*getEventById: function(id) {
		var i, events = this.renderEvents;
		for (i=0; i < events.length ; i++) {
			if (events[i].id && events[i].id == id) {
				return events[i];
			}
		}
		return false;
	},*/
	
	/**
     * Display the map. If it is already displayed, the function does nothing
	 * @method displayMap
	 * @return Boolean true if the map is displayed
    */
	displayMap: function() {
		if (!this.stage.contains(this.containerMap)) {
			this.stage.addChildAt(this.containerMap, 0);
			return true;
		}
		return false;
	},
	
	onLoadMap: function(callback) {
		this._onLoadMap = callback;
	},
	
	map: function(data) {
	
		this.clearMap();
	
		var propreties = data.propreties
		this.mapData = map_data = data.map_data;
		this.currentMap = map = this.mapData.map;
		this.containerMap = new createjs.Container();
	
		var self = this;
		var autotiles_array = [];
		var i, j, k, l;
		
		
		
		function progressLoad() {
			Cache._progressLoadData("client", function() {
				self._sortEventsDepthIndex();
				
				if (propreties.autoDisplay) {
					self.displayMap();
				}
				self._onLoadMap.call(self);
			});
				
		}
		
		propreties.autoDisplay = propreties.autoDisplay === undefined ? true : propreties.autoDisplay;
		
		// Tileset + Generate Layer (2)
		Cache.totalLoad["client"] = 3;

		// Auotiles
		Cache.totalLoad["client"] += (propreties.autotiles ? propreties.autotiles.length : 0);
		// Cache.totalLoad += (propreties.autotiles ? propreties.autotiles.length : 0);
		// Graphics Characters Player
		
		
		function bitmapAutoTiles(bmp, position, animated) {
			var i=0;
			var cont = new createjs.Container();
			var mi_tile = self.tile_w / 2;
			var nb_seq = animated / mi_tile;
			autotiles_array.push(cont);
			
			for (i=0 ; i < 4 ; i++) {
				bmp.currentFrame = nb_seq * position[i][1] + position[i][0];
				
				if (animated / mi_tile > 6) {
					bmp.waitFrame = 5;
					bmp.arrayFrames = [];
					for (k=0 ; k < nb_seq / 6 ; k++) {
						bmp.arrayFrames.push(bmp.currentFrame + (k*6));
					}
				}
				
				switch (i) {
					case 1: bmp.x = mi_tile; break;
					case 2: bmp.y = mi_tile; break;
					case 3: bmp.x = 0; break;
				}
				cont.addChild(bmp);
				bmp = bmp.clone(); 
			}
		}
		
		function dataAutotile(x, y) {
			var i = 0;
			x = (x - 1) * 2;
			y = (y - 1) * 2;
			var tab = [];
			for (i=0 ; i < 4 ; i++) {
				switch (i) {
					case 1:
						x++;
					break;
					case 2:
						y++;
					break;
					case 3:
						x--;
					break;
				}
				tab.push([x, y]);
			}
			
			return tab;
			

		}
		
		function constructAutoTiles(seq, bmp, autotile, animated) {
			var i, j, k;
			switch (seq) {
				case 0:
					bitmapAutoTiles(bmp, autotile.center, animated);				
				break;
				case 1: 
					var array_corner = [];
					var corner_close = [];
					var split;
					for (i=1 ; i <= 4 ; i++) {
						for (j=0 ; j <= array_corner.length ; j++) {
							corner_close.push((j != 0 ? array_corner[j-1] : '') + i + ";");
						}
						for (j=0 ; j < corner_close.length ; j++) {
							array_corner.push(corner_close[j]);
							split = corner_close[j].split(';');
							split.pop();
							var tile_corner = [];
							for (k=1 ; k <= 4 ; k++) {
								if (Function.valueExist(split, k) !== false) {
									tile_corner.push(autotile.corner[k-1]);
								}
								else {
									tile_corner.push(autotile.center[k-1]);
								}
							}
							
							bitmapAutoTiles(bmp, tile_corner, animated);	
							bmp = bmp.clone();
						}
						corner_close = [];
					}
					
				break;
				case 2:
					var dir = [autotile.left, autotile.top, autotile.right, autotile.bottom];
					var new_tile;
					var corner_id = [2, 3];
					var pos;
					for (i=0 ; i < 4 ; i++) {
						for (j=0 ; j < 4 ; j++) {
						  
							new_tile = self.clone(dir[i]);
							
							if (j == 1 || j == 3) {
								pos = corner_id[0]-1;
								new_tile[pos] = autotile.corner[pos];
							}
							
							if (j == 2 || j == 3) {
								
								pos = corner_id[1]-1;
								new_tile[pos] = autotile.corner[pos];
							}
							
							bitmapAutoTiles(bmp, new_tile, animated);
							bmp = bmp.clone(); 
							
							 
						}
						
						corner_id[0]++;
						corner_id[1]++;
						
						if (corner_id[0] > 4) corner_id[0] = 1;
						if (corner_id[1] > 4) corner_id[1] = 1;		
					}

				break;
				case 3:
					bitmapAutoTiles(bmp, [autotile.left[0], autotile.right[1], autotile.right[2], autotile.left[3]], animated);	
					bmp = bmp.clone();
					bitmapAutoTiles(bmp, [autotile.top[0], autotile.top[1], autotile.bottom[2], autotile.bottom[3]], animated);	
				break;
				case 4:
					var dir = [autotile.top_left, autotile.top_right, autotile.bottom_right, autotile.bottom_left];
					var new_tile;
					var pos = 3;
					for (i=0 ; i < dir.length ; i++) {
						for (j=0 ; j < 2 ; j++) {
							new_tile = self.clone(dir[i]);
							if (j == 1) {
								new_tile[pos-1] = autotile.corner[pos-1];
							}
							bitmapAutoTiles(bmp, new_tile, animated);
							bmp = bmp.clone(); 
						}
						pos++;
						if (pos > 4) pos = 1;
					}
				break;
				case 5:
					var dir = [
						[autotile.top_left[0], autotile.top_right[1], autotile.right[2], autotile.left[3]],
						[autotile.top_left[0], autotile.top[1], autotile.bottom[2], autotile.bottom_left[3]],
						[autotile.left[0], autotile.right[1], autotile.bottom_right[2], autotile.bottom_left[3]],
						[autotile.top[0], autotile.top_right[1], autotile.bottom_right[2], autotile.bottom[3]]
					];
					
					for (i=0 ; i < dir.length ; i++) {
						bitmapAutoTiles(bmp, dir[i], animated);	
						bmp = bmp.clone(); 
					}
					
				break;
				case 6:
					bitmapAutoTiles(bmp, autotile.full, animated);
					bmp = bmp.clone(); 		
					bitmapAutoTiles(bmp, autotile.full, animated);
				break;
			}
		}
		
		function callback() {
			
				if (propreties.autotiles) {
					var autotile = {
						center: dataAutotile(2, 3),
						full: 	dataAutotile(1, 1),
						corner: dataAutotile(3, 1),
						left:   dataAutotile(1, 3),
						right:  dataAutotile(3, 3),
						top:    dataAutotile(2, 2),
						bottom: dataAutotile(2, 4),
						top_left: dataAutotile(1, 2),
						top_right: dataAutotile(3, 2),
						bottom_left: dataAutotile(1, 4),
						bottom_right: dataAutotile(3, 4)
					};				
							
					var img_autotiles, cont,  bitmap_autotiles, sprite;
					for (i=0 ; i < propreties.autotiles.length ; i++) {
						img_autotiles = Cache.get(propreties.autotiles[i], "autotiles");
						sprite = new createjs.SpriteSheet({
				  		images: [
				  			img_autotiles
				 			],
				  		frames: {
				  			width:self.tile_w / 2, 
				  			height:self.tile_h / 2
				  		}
						});
						bitmap_autotiles = new createjs.BitmapAnimation(sprite);
						for (j=0 ; j < 7 ; j++) {
							constructAutoTiles(j, bitmap_autotiles, autotile, img_autotiles.width);
							bitmap_autotiles = bitmap_autotiles.clone(); 
						}
					}
				}
				
				if (!map_data.layer1) {
					var img_tileset = Cache.get(propreties.tileset, "tilesets");
					var spriteSheet = new createjs.SpriteSheet({
			  		images: [
			  			img_tileset
			 			],
			  		frames: {
			  			width: self.tile_w, 
			  			height: self.tile_h
			  		}
					});
					var bmpSeq = new createjs.BitmapAnimation(spriteSheet);
					
					var k = 0, 
					canvas, stage
					map_img = [];
					 for (i=0 ; i < 2 ; i++) {
						var canvas = document.createElement("canvas");
						canvas.width = map.length * self.tile_w;
						canvas.height = map[0].length * self.tile_h;
						stage = new createjs.Stage(canvas);
						map_img.push(stage);
					 }
					 
					 for (l=0 ; l < 3 ; l++) {
						for (i=0 ; i < map.length ; i++) {
							for (j=0 ; j < map[0].length ; j++) {
								var id = map[i][j][l];
								 if (id != null) {
									var priority = self.tilePriority(id);
									var map_img_id = (priority == 0 ? 0 : 1);
									priority = l + (priority == 0 ? 0 : 4);
									if (!map[i][j][3]) {
										map[i][j][3] = {};
									}
									if (id - autotiles_array.length >= 0) {
										bmpSeq.name = "tile" + k + "_" + i + "_" + j ;	
										bmpSeq.x = self._positionValueToReal(i, j).x;
										bmpSeq.y = self._positionValueToReal(i, j).y;
										bmpSeq.currentFrame = id - 384;
										map[i][j][3][priority] = bmpSeq;
										map_img[map_img_id].addChild(bmpSeq);
										bmpSeq = bmpSeq.clone();
									}	else {
										var cont = autotiles_array[id];
										if (cont) {
											cont = cont.clone(true);
											cont.x = self._positionValueToReal(i, j).x;
											cont.y = self._positionValueToReal(i, j).y;
											map[i][j][3][priority] = cont;
											map_img[map_img_id].addChild(cont);
										}
									}
									k++;
								}
							}
						}	
					 }
					 
					 
				} // endif layer1	
				
				var img;
				for (i=0 ; i < 2 ; i++) {
					img = Cache.getMapGraphics(propreties.filename, i);
					if (!img) {
						img = new Image();
						if (map_data.layer1) {
							img.src = map_data['layer' + (i+1)];
							Cache.setMapGraphics(propreties.filename, img);
						}
						else {
							var context = map_img[i].canvas.getContext('2d');
							map_img[i].draw(context);
							img = map_img[i].canvas;
							Cache.setMapGraphics(propreties.filename, img);
						}
					}
					self.layer[(i * 4)].addChild(new createjs.Bitmap(img));	
					progressLoad();
				}

				for (i=0 ; i < self.layer.length ; i++) {
					 self.containerMap.addChild(self.layer[i]);
				}
				
		
			/*	function graphicPlayerLoad() {
					if (!self.player) {
						self.player = new Player(propreties.player, self);	
					}
					if (load && load.player) {
						for (var key in load.player) {
							self.player[key] = load.player[key];
						}
						propreties.player.x = load.player.x;
						propreties.player.y = load.player.y;
						self.player.freeze = false;
					}
					self.player.setPosition(propreties.player.x, propreties.player.y);
					self.setCamera(self.player.x, self.player.y);
					self.player.fixCamera(true);
					self.player.setTransfert([]);
					if (propreties.transfert) {
						self.player.setTransfert(propreties.transfert);
					}
					self.player.inTransfert = false;
					progressLoad();
				}
				
				if (propreties.player) {
					if (!self.player) {
						Cache.characters(propreties.player.filename, function() {
							graphicPlayerLoad();
						});
						
					}
					else {
						graphicPlayerLoad();
						
					}	
				}
		
				var event, nocache, custompath, path;
				if (propreties.events) {
					if (!Rpg.isArray(propreties.events)) {
						path = propreties.events.path;
						custompath = true;
						nocache = propreties.events.noCache;
						propreties.events = [path];
					}
					for (i=0 ; i < propreties.events.length ; i++) {
						event = propreties.events[i];
						preloadEvent(event);
					}
					
				}
				
				function preloadEvent(event) {
					Cache.event(event, function(prop) {
						if (prop[1][0].character_hue) {
							Cache.characters(prop[1][0].character_hue, function() {
								loadEvent(prop, event);
								progressLoad();
							});
						}
						else {
							loadEvent(prop, event);	
							progressLoad();
						}
					}, filename, custompath, nocache);
				}
				
				function loadEvent(prop, event_name) {
					progressLoad();
					var event, load_event;
					if (load && load.events) {
						for (var i=0 ; i < load.events.length ; i++) {
							load_event = load.events[i];
							if (event_name == load_event.name) {
								prop[0].x = load_event.x;
								prop[0].y = load_event.y;
								event = new Event(prop, self);
								for (var key in load_event) {
									if (key != "x" && key != "y") {
										event[key] = load_event[key];
									}
								}
								break;
							}
						}
					}
					else {
						event = new Event(prop, self);
					}
					//self.events.push(event);
				}
				*/	
			
		}
			
		/*	if (map_data.layer1) {
				var onfinish = Cache.loadFinish;
				Cache.loadFinish = undefined;
				onfinish();
				progressLoad();
			}
			else {*/
				
			// }
			
			if (propreties.autotiles) {
				for (i=0 ; i < propreties.autotiles.length ; i++) {
					autotilesLoad(i);
				}
			}
			else {
				tilesetLoad();
			}
			
			function autotilesLoad(i) {
				Cache.autotiles(propreties.autotiles[i], function() {
					progressLoad();
					if (propreties.autotiles.length-1 == i) {
						tilesetLoad();
					}
				});
			}
			
			function tilesetLoad() {
				Cache.tilesets(propreties.tileset, function() {
					callback();
					progressLoad();
				});
			}
			
			function playMusic(type) {
				if (propreties[type]) {
					var regex = /\/([^\/]+)$/;
					var array = regex.exec(self.currentSound[type].src);
					var bg = true;
					if (array) {
						if (typeof propreties[type] == 'string') {
							bg = array[1] != propreties[type];
						}
						else {
							bg = array[1] != propreties[type].mp3 + '.mp3' && array[1] != propreties[type].ogg + '.ogg';
						}
						if (bg) { 
							playBG(propreties[type], type);
						}
					}
					else {
						playBG(propreties[type], type);
					}
				}		
			}
			
			function playBG(filename, type) {
				if (type == "bgm") {
					self.playBGM(filename);
				}
				else {
					self.playBGS(filename);
				}
			}
			
			playMusic("bgm");
			playMusic("bgs");
			
		
	
	},
	initPlayer: function(id, graphic, params) {
		this.player = new InputPlayer(this, id, params);
		this._addEvent(this.player, graphic);
	},
	
	
	addEvent: function(id, graphic, params) {
		var eventRender = new RenderEvent(this, id, params);
		this._addEvent(eventRender, graphic);
		
	},
	
	refreshEvent: function(id, graphic, params) {
		var eventRender = this.getEventRenderById(id);
		if (eventRender) {
			eventRender.refresh(params);
			if (graphic) {
				this.layer[3].removeChild(eventRender.sprite);
				eventRender.displayEvent(graphic);
			}
		}
	},
	
	_addEvent: function(eventRender, graphic) {
		this.renderEvents.push(eventRender);
		if (graphic) {
			eventRender.displayEvent(graphic);
		}
	},

	setPosition: function(id, x, y) {
		var event = this.getEventRenderById(id);
		event.sprite.x = this._positionValueToReal(x, y).x;
		event.sprite.y = this._positionValueToReal(x, y).y;
		event.x = x;
		event.y = y;
		event.real_x = event.sprite.x;
		event.real_y = event.sprite.y;
		
		if (this.player && this.player.id == id) {
			this.setCamera(this.player.real_x, this.player.real_y);
			this.player.fixCamera(true);
			this.targetScreen = "Player";
		}
	},
	getEventRenderById: function(id, seek) {
		var i;
		for (i=0; i < this.renderEvents.length ; i++) {
			if (this.renderEvents[i].id == id) {
				return seek ? {seek: i, event: this.renderEvents[i]} : this.renderEvents[i];
			}
		}
	},
	removeEvent: function(id) {
		var obj = this.getEventRenderById(id, true);
		if (obj != null) {
			createjs.Ticker.removeListener(obj.event);
			obj.event.bitmap = undefined;
			this.layer[3].removeChild(obj.event.sprite);
			this.renderEvents.splice(obj.seek, 1);
			return true;
		}
		return false;
	},
	/**
     * Place the screen at fixed positions. 
	 * @method setCamera (alias setScreen)
     * @param {Integer} x X Position
	 * @param {Integer} y Y Position
    */
	setScreen: function(x, y) { this.setCamera(x, y); },
	setCamera: function(real_x, real_y) {
		var width;
		var height;
		
		if (real_x <= this.canvas.width/2) {
			width = 0;
		}
		else if (real_x + this.canvas.width/2 >= this.getMapWidth(true)) {
			width = -(this.getMapWidth(true) - this.canvas.width);
		}
		else {
			width = -(real_x - this.canvas.width/2 + (this.canvas.width/2 % this.tile_w))
		}
		
		if (real_y <= this.canvas.height/2) {
			height = 0;
		}
		else if (real_y + this.canvas.height/2 >= this.getMapHeight(true)) {
			height = -(this.getMapHeight(true) - this.canvas.height);
		}
		else {
			height = -(real_y - this.canvas.height/2 + (this.canvas.height/2 % this.tile_h));
		}
		
		this.containerMap.x = width;
		this.containerMap.y = height;
		
		
		
		var multiple_w = this.tile_w / this.speedScrolling;
		var multiple_h = this.tile_h / this.speedScrolling;
		this.containerMap.x = Math.floor(this.containerMap.x/multiple_w) * multiple_w ; 
		this.containerMap.y = Math.floor(this.containerMap.y/multiple_h) * multiple_h;
		
		this.screen_x = Math.abs(this.containerMap.x);
		this.screen_y = Math.abs(this.containerMap.y);
		
		this.screen_refresh.x = this.screen_x;
		this.screen_refresh.y = this.screen_y;
		this.screen_refresh.scroll_y = false;
		this.screen_refresh.scroll_x = false;
		var m = this._multipleScreen(this.screen_x, this.screen_y);
		this.screen_x = m.x;
		this.screen_y = m.y;
		// this.call('setScreen', {x: x, y: y});
		this._sortEventsDepthIndex();
		this.refreshMap(true);
		

	},
	// Private
	refreshMap: function(allclear, clear_prop) {
		return;
		var i, j, k, map;
		var width = Math.ceil(this.canvas.width / this.tile_w);
		var height = Math.ceil(this.canvas.height / this.tile_h);
		var x = Math.floor(Math.abs(this.containerMap.x) / this.tile_w);
		var y = Math.floor(Math.abs(this.containerMap.y) / this.tile_h);
		
		if (allclear) {
			for (k=0 ; k < 8 ; k++) {
				if (k != 3) {
					this.layer[k].removeAllChildren();
					for (i=0 ; i < width ; i++) {
						for (j=0 ; j < height ; j++) {
							map = this.currentMap[x+i][y+j][3][k];
							if (map) {
								this.layer[k].addChild(map);
								
							}	
						}	
					}
					
				}
			}
			// this.layer[0].cache(0, 0, 640*2, 480*2);
			//console.log(img);
		}
		
		if (clear_prop) {
			var dir = clear_prop.direction;
			var type = clear_prop.add ? 'add' : 'del';
			var a; // Add a value position
			var x = Math.floor(this.screen_x / this.tile_w);
			var y = Math.floor(this.screen_y / this.tile_h);
			
			
			
			var clear_x = clear_prop.direction == 'up' || clear_prop.direction == 'bottom' ? false : true;
			var size = clear_x ? height : width;
		
			for (k=0 ; k < 8 ; k++) {
				for (i=0 ; i < size ; i++) {
					if (dir == 'left' || dir == 'up') {
						a = type == 'add' ? 0 : (clear_x ? width : height);
					}
					else {
						a = type == 'add' ? (clear_x ? width : height) : -1;
					}
					
					if (clear_x) {		
						map = this.currentMap[x+a][y+i][3][k];
					}
					else {
						map = this.currentMap[x+i][y+a][3][k];
					}
					if (map) {
						if (type == 'add') {
							this.layer[k].addChild(map);
						}
						else {
							this.layer[k].removeChild(map);
						}
					}
					
				}
			}
			
		}
	},
	_sortEventsDepthIndex: function() {
		this.layer[3].sortChildren(function (a,b) {
			var za = a.z !== false ? a.z : a.y;
			var zb = b.z !== false ? b.z : b.y;
			return za - zb;
		});
	},
	
	/**
     * Change the tone of the screen
	 * @method changeScreenColorTone
     * @param {String} color Hexadecimal color value. Example : 000000 for black. You can put "reset" to reset the tone of the screen : br />
		<pre>
			rpg.changeScreenColorTone("reset");
		</pre>
     * @param {Integer} speed Speed of the tone color between 0 and 255. The higher the value, the faster is
     * @param {String} composite lighter|darker Darken or lighten the screen
     * @param {Integer} opacity Change the tone to the opacity assigned. Value between 0 and 1
     * @param {Function} callback (optional) Callback when the tone color is completed
    */
	changeScreenColorTone: function(color, speed, composite, opacity, callback) {
		var self = this;
		var exist_tone = false;
		if (this.tone) {
			this.containerMap.removeChild(this.tone);
			delete this.tone;
			exist_tone = true;
			if (color == 'reset') return;
		}
		this.tone = new Shape();
		this.tone.graphics.beginFill('#' + color).drawRect(0, 0, this.getMapWidth(true), this.getMapHeight(true));
		this.tone.compositeOperation = composite;
		this.containerMap.addChild(this.tone);
		if (!exist_tone) {
			this.tone.alpha = 0;
			if (speed > 0) {
				new Effect(this.tone).fadeStartTo(speed, 0, opacity, function() {
					if (callback) callback();
				});
			}
			else {
				this.tone.alpha = opacity;
			}
		}
	},
	
	/**
     * Perform a flash on the screen
	 * @method screenFlash
     * @param {String} color Hexadecimal color value. Example : ff0000 for red
     * @param {Integer} speed Speed of the flash between 0 and 255. The higher the value, the faster is
     * @param {Function} callback (optional) Callback when the flash is completed
    */
	screenFlash: function(color, speed, callback) {
		var self = this;
		var flash = new Shape();
		flash.graphics.beginFill('#' + color).drawRect(0, 0, this.canvas.width * 2, this.canvas.height * 2);
		flash.x = this.screen_x - Math.round(this.canvas.width / 2);
		flash.y = this.screen_y - Math.round(this.canvas.height / 2);
		flash.alpha = .5;
		this.containerMap.addChild(flash);
		this.call('screenFlash', {color: color, speed: speed});
		new Effect(flash).fadeOut(speed, function() {
			self.containerMap.removeChild(flash);
			if (callback) callback();
		});
		
	},
	
	/**
     * Shakes the screen
	 * @method screenShake
     * @param {Integer} power Intensity of the shake. The higher the value, the greater the shaking is strong
     * @param {Integer} speed Speed of the shake. The higher the value, the greater the shaking is fast
     * @param {Integer} duration Duration of shake in frame
     * @param {String} axis (optional) The axis where there will shake : "x", "y" or "xy". "x" by default
     * @param {Function} callback (optional) Callback when the shake is completed <br />
		Examples 
		
		<pre>
			rpg.screenShake(7, 5, 20, function() { // You can omit the parameter "axis" if you do a shake on the X axis
				alert("finish"); 
			});
		</pre>
		
		<pre>
			rpg.screenShake(3, 5, 24, "xy");
		</pre>
		
		<pre>
			rpg.screenShake(3, 5, 24, "xy", function() {
				alert("finish"); 
			});
		</pre>
    */
	screenShake: function(power, speed, duration, axis, callback) {
		if (typeof axis == "function") {
			callback = axis;
			axis = false;
		}
		this.shake = {};
		this.shake.power = power;
		this.shake.speed = speed;
		this.shake.duration = duration;
		this.shake.callback = callback;
		this.shake.current = 0;
		this.shake.direction = 1;
		this.shake.axis = axis || "x";
		this.call('screenShake', {power: power, speed: speed, duration: duration, axis: axis});
	},
	
	_tickShake: function() {
		if (this.shake && (this.shake.duration >= 1 || this.shake.current != 0)) {
			var delta = (this.shake.power * this.shake.speed * this.shake.direction) / 10.0;
			if (this.shake.duration <= 1 && this.shake.current * (this.shake.current + delta) < 0) {
				this.shake.current = 0;
			}
			else {
				this.shake.current += delta;
			}
			if (this.shake.current > this.shake.power * 2) {
				this.shake.direction = -1;
			}
			if (this.shake.current < -this.shake.power * 2) {
				this.shake.direction = 1;
			}
			if (this.shake.duration >= 1) {
				this.shake.duration -= 1;
			}
			if (/x/.test(this.shake.axis)) {
				this.stage.x = this.shake.current;
			}
			if (/y/.test(this.shake.axis)) {
				this.stage.y = this.shake.current;
			}
			if (this.shake.duration-1 == 0 && this.shake.callback) {
				this.shake.callback();
			}
		}
	},
	
	addAction: function(name, prop) {
		this.actions[name] = prop;
	},
	
	/**
     * Sets the speed of scrolling. The higher the number, the higher the speed is slow
	 * @method setScrolling
     * @param {Integer} speed
	 * @default 0
    */
	setScrolling: function(speed) {
		this.speedScrolling = speed;
	},
		/**
     * Change the audio volume for one or all types
	 * @method setVolumeAudio
     * @param {Integer} volume Volume between 0 and 1. 0 being mute
     * @param {String} type (optional) If undefined, all types are changed. Possible type: <br />
		bgm: Background Music<br />
		bgs: Background Sound<br />
		me: Music Effect<br />
		se: Sound Effect<br />
    */
	setVolumeAudio: function(volume, type) {
		var self = this;
		if (type) {
			setVolume(type);
		}
		else {
			for (var key in this.soundVolume) {
				setVolume(key);
			}
		}
		this.call('changeVolumeAudio');
		function setVolume(key) {
			self.soundVolume[key] = volume;
			self.currentSound[key].volume = volume;
		}
	},
	
	/**
     * Stop all background music and plays music
	 * @method playBGM
     * @param {String|Object} filename Filename. Can also define several types depending on the browser. For example : {mp3: "foo", ogg: "bar"}
     * @param {Function} load (optional) Callback when the music is loaded. A parameter is returned: an object "Audio"
    */
	playBGM: function(filename, load) {
		this._playBG("bgm", filename, load);
	},
	
	/**
     * Stop all background sound and plays sound
	 * @method playBGS
     * @param {String|Object} filename Filename. Can also define several types depending on the browser. For example : {mp3: "foo", ogg: "bar"}
     * @param {Function} load (optional) Callback when the music is loaded. A parameter is returned: an object "Audio"
    */
	playBGS: function(filename, load) {
		this._playBG("bgs", filename, load);
	},
	
	_playBG: function(type, filename, load) {
		var self = this;
		var cache = type == "bgm" ? Cache.BGM : Cache.BGS;
		Cache.audioStop(type);
		cache(filename, function(snd) {
			console.log(snd, self.soundVolume[type]);
			self.currentSound[type] = snd;
			snd.volume = self.soundVolume[type];
			if (typeof snd.loop == 'boolean') {
					snd.loop = true;
			}
			else {
				snd.addEventListener('ended', function() {
					this.currentTime = 0;
					this.play();
				}, false);
			}
			snd.play();
			if (load) load(snd);
		});
	},
	
	/**
     * Play a sound effect
	 * @method playSE
     * @param {String|Object} filename Filename. Can also define several types depending on the browser. For example : {mp3: "foo", ogg: "bar"}
     * @param {Function} load (optional) Callback when the sound is loaded. A parameter is returned: an object "Audio"
    */
	playSE: function(filename, load) {
		this._playSoundEffect("se", filename, load);
	},
	
	/**
     * Play a music effect
	 * @method playME
     * @param {String|Object} filename Filename. Can also define several types depending on the browser. For example : {mp3: "foo", ogg: "bar"}
     * @param {Function} load (optional) Callback when the sound is loaded. A parameter is returned: an object "Audio"
    */
	playME: function(filename, load) {
		this._playSoundEffect("me", filename, load);
	},
	
	_playSoundEffect: function(type, filename, load) {
		var self = this;
		var cache = type == "se" ? Cache.SE : Cache.ME;
		cache(filename, function(snd) {
			snd.volume = self.soundVolume[type];
			snd.play();
			if (load) load(snd);
		});
	},
	
		/**
     * Sets the size of the canvas
	 * @method setCanvasSize
     * @param {String} type Put in full screen if "fullscreen"
    */
	/**
     * Sets the size of the canvas. Enlarges also the parent div (if exist) named "(Canvas ID)-parent"
	 * @method setCanvasSize
     * @param {Integer} width Width.
	 * @param {Integer} height Height.
    */
	setCanvasSize: function(width, height) {
		var m = "px";
		if (width == "fullscreen") {
			width = window.innerWidth;
			height = window.innerHeight;
		}

		this.canvas.width = width;
		this.canvas.height = height;
		
		var el = document.getElementById(this.canvas.id + '-dom');
		var parent = document.getElementById(this.canvas.id + '-parent');
		el.style.width = width + m;
		el.style.height = height + m;
		if (parent) {
			parent.style.width = width + m;
			parent.style.height = height + m;
		}
	},
	

	
	/**
     * Add an HTML element on the map. The scrolling also applies to the element
	 * @method addHtmlElement
     * @param {String|HTMLElement} html HTML element<br />
		<pre>
			rpg.addHtmlElement('<div>Hello World</div>', 10, 15);
		</pre>
		<br />
		Or<br />
		<br />
		<pre>
			var element = document.getElementById("foo");
			rpg.addHtmlElement(element, 10, 15);
			[...]
			</script>
			<div id="foo">Hello World</div>
		</pre>
     * @param {Integer} x  X position in pixel
     * @param {Integer} y  Y position in pixel
     * @param {Event|Array} event  (optional) Place the HTML element on the event<br />
		You can get the HTML element with the function "getElementById()"<br />
		<pre>
			var event = rpg.getEventByName("foo");
			rpg.addHtmlElement("<div id="bar">Hello World</div>", -10, -15, event);
			event.getElementById("bar"); // Return HTMLElement
		</pre>
	 * @return HTMLElement Element HTML created or modified
    */
	addHtmlElement: function(html, x, y, event) {
		var self = this, element;
		var div, element_param, math;
		var id = this.canvas.id + '-dom';
		var match_id;
		div = document.getElementById(id);
		
		if (html instanceof HTMLElement) {
			match = match_id = html.getAttribute("id");
			element_param = html;
		}
		else {
			match = /id="([^"]+)"/.exec(html);
			match_id = match[1];
			
		}
		var container;
		
		if (event) {
			if (event instanceof Array) {
				for (var i=0 ; i < event.length ; i++) {
					displayElement(event[i]);
				}
			}
			else {
				displayElement(event);
			}
		}
		else {
			displayElement();
		}
		
		function displayElement(event) {
			var new_id = match_id + (event ? '-' + event.id : '');
			if (event) {
				container = event.sprite;
			}
			else {
				container = self.containerMap;
			}
			var pt = container.localToGlobal(x, y);
			element = element_param ? element_param : document.createElement("div");
			element.setAttribute("data-px", x);
			element.setAttribute("data-py", y);
			
			if (match) {
				element.setAttribute("id", new_id + '-parent');
			}
			element.style.position = 'absolute';
			element.style.left = Math.round(pt.x) + "px";
			element.style.top = Math.round(pt.y) + "px";
			if (!element_param) {
				html = html.replace(/id="([^"]+)"/, 'id="' + new_id + '"');
				element.innerHTML = html;
			}
			div.appendChild(element);
			if (element && event) event.htmlElements.push(element);
			self.htmlElements.push({element: element, event: event});
		}
		return element;
	},
	
	
	// Private
	_tickHtmlElements: function() {
		var i, element, x, y, pt, event;
		for (i=0 ; i < this.htmlElements.length ; i++) {
			element = this.htmlElements[i].element;
			event = this.htmlElements[i].event;	
			x = element.getAttribute('data-px');
			y = element.getAttribute('data-py');
			if (event) {
				container = event.sprite;
			}
			else {
				container = this.containerMap;
			}
			pt = container.localToGlobal(x, y);
			element.style.left = Math.round(pt.x) + "px";
			element.style.top = Math.round(pt.y) + "px";
		}
	
	},
	
	/**
     * Removes mouse behavior (This does not remove the movement of the hero with the mouse)
	 * @method unbindMouseEvent
     * @param {String} mouse_event click|dblclick|up|down[over|out
    */
	unbindMouseEvent: function(mouse_event) {
		this.onMouseEvent[mouse_event] = undefined;
		if (this.player && this.player._useMouse) {
			this.player.useMouse(true);
		}
	},
	
	/**
     * Attach a mouse behavior to a function
	 * @method bindMouseEvent
     * @param {String} mouse_event click|dblclick|up|down[over|out
     * @param Function} callback  Callback when the mouse action trigger. The function returns an object as follows :<br />
		<ul>
			<li>mouse_x : X position of the mouse relative to the canvas (pixels)</li>
			<li>mouse_y : Y position of the mouse relative to the canvas (pixels)</li>
			<li>real_x : X position of the mouse relative to the map (pixels)</li>
			<li>real_y : Y position of the mouse relative to the map (pixels)</li>
			<li>x : X position (tiles) on the map</li>
			<li>y : Y position (tiles) on the map</li>
			<li>event : Event. null if no event</li>
		</ul>
		<br />
		<pre>
			rpg.bindMouseEvent("click", function(obj) {
				console.log(obj); // Object above
			});
		</pre>
		
     * @param {Event|Array} event  Define this event for the types "over" and "out"<br />
		<pre>
			var event = rpg.getEventByName("foo");
			rpg.bindMouseEvent("over", function(obj) {
				// Code
			}, event);
		</pre>
    */
	bindMouseEvent: function(mouse_event, callback, event) {
		var self = this, div, element, ev;
		div = document.getElementById(this.canvas.id + '-dom');
		if (event) {
			if (!(event instanceof Array)) {
				event = [event];
			}
			for (var i=0 ; i < event.length ; i++) {
				ev =  event[i];
				element = ev.htmlElementMouse;
				mouse("out", ev);
				mouse("over", ev);
				div.appendChild(element);
			}
			
		}
		
		function mouse(type, ev) {
			element["onmouse" + type] = function(e) {
				self._getMouseData(type, e, div, ev);
			}
		}
		
		this.onMouseEvent[mouse_event] = callback;
	},
	
	// Private
	_setMouseEvent: function(div) {
		var self = this;
		
		div.onclick = function(e) {
			self._getMouseData("click", e, this);
		}
		div.ondblclick = function(e) {
			self._getMouseData("dblclick", e, this);
		}
		div.onmouseup = function(e) {
			self._getMouseData("up", e, this);
		}
		div.onmousedown = function(e) {
			self._getMouseData("down", e, this);
		}
		
		
	},
	
	// Private
	_getMouseData: function(type, e, target, obj) {
		var event;
		var self = this;
		if (this.onMouseEvent[type]) {
			var real_x = e.clientX - target.offsetLeft;
			var real_y = e.clientY - target.offsetTop;
			var x = real_x  - this.containerMap.x;
			var y = real_y  - this.containerMap.y;
			var tile_x = Math.floor(x / this.tile_w);
			var tile_y = Math.floor(y / this.tile_h);
			obj = obj || this.containerMap.getObjectUnderPoint(x, y);
			if (this.player && this.player.id == obj.id) {
				event = this.player;
			}
			else if (obj.name == "event") {
				event = this.getEventById(obj.id);
				if (event != null) {
					event = event.event;
					if (type == "click") {
						event.click();
					}
					if (this.player._useMouse) {
						this.player.moveMouseTo(tile_x, tile_y, true, function() {
							if (self.player.distance(0, 0, tile_x,  tile_y).ini <= 1) {
								self.player.triggerEventBeside();
							}
						});
						//this.player.triggerEventBeside();
					}
				}
			}
			else {
				if (this.player._useMouse) {
					this.player.moveMouseTo(tile_x, tile_y);
				}
			}
			
			this.onMouseEvent[type]({
				mouse_x: real_x,
				mouse_y: real_y,
				real_x: x,
				real_y: y,
				x: tile_x,
				y: tile_y,
				event: event || null
			});
		}
		
		/*function mouseRealMove(mouse_x, mouse_y) {	
			var real_x = self.player.real_x ;
			var real_y = self.player.real_y ;
			
			var move_id = 0;
			var move_x_finish = move_y_finish = false;
			var diff_x, diff_y;
			if (real_x < mouse_x) {
				move_id = 6;
				diff_x = mouse_x - real_x;
				
			}
			else if (real_x > mouse_x) {
				move_id = 4;
				diff_x = real_x - mouse_x;

			}
			else if (real_y < mouse_y) {
				move_id = 8;
				diff_y = mouse_y - real_y;
				if (diff_y <= self.player.speed) {
					mouse_y = real_y;
				}
			}
			else if (real_y > mouse_y) {
				move_id = 2;
				diff_y = real_y - mouse_y;
				if (diff_y <= self.player.speed) {
					mouse_y = real_y;
				}
			}
			
			if (mouse_y != real_y || mouse_x != real_x) {
				if (diff_x <= self.player.speed) {
					mouse_x = real_x;
				}
				self.player.move(move_id, function() {
					mouseRealMove(mouse_x, mouse_y);
				});
			}
		}*/
	},
	
	/**
     * Add a picture and post it on the screen. This image remains fixed relative to the canvas
	 * @method addPicture
     * @param {Integer} id Unique identifier of the image in order to manipulate it later
     * @param {String} filename Name of this image in the "Graphics/Pictures"
     * @param {Object} propreties The properties of the image :
		<ul>
			<li>x : X Position. Default 0</li> 
			<li>y : Y Position. Default 0</li> 
			<li>zoom_x : Zoom ratio in the X axis. Default 100</li> 
			<li>zoom_y : Zoom ratio in the Y axis. Default 100</li> 
			<li>opacity : Opacity between 0 and 1. Default 1</li> 
			<li>regX : X Point of Origin. Default 0</li> 
			<li>regY : Y Point of Origin. Default 0</li> 
			<li>reg : if "center", point of origin is in center. Default false</li> 
		</ul>
	 * @param {Function} (optional) onLoad Callback function when the image is loaded
    */
	addPicture: function(id, filename, prop, onLoad) {
		var self = this;
		if (!prop) prop = {};
		Cache.pictures(filename, function(img) {
			var bitmap = new createjs.Bitmap(img);
			bitmap.x = prop.x ? prop.x : 0;
			bitmap.y = prop.y ? prop.y : 0;
			bitmap.scaleX = prop.zoom_x ? prop.zoom_x / 100 : 1;
			bitmap.scaleY = prop.zoom_y ? prop.zoom_y / 100 : 1;
			bitmap.alpha = prop.opacity ? prop.opacity : 1;
			if (prop.reg == "center") {
				prop.regX = img.width / 2;
				prop.regY = img.height / 2;
			}
			bitmap.regX = prop.regX ? prop.regX : 0
			bitmap.regY = prop.regY ? prop.regY : 0
			if (prop.origin = "center") {
				prop.regX = img.width / 2;
				prop.regY = img.height / 2;
			}
			self.pictures[id] = bitmap;
			self.stage.addChild(bitmap);
			self.call("addPicture", {id: id, filemane: filename, prop: prop});
			if (onLoad) onLoad(img);
		});
	},
	
	/**
     * Move, resize or change the opacity of a picture over a period
	 * @method movePicture
     * @param {Integer} id Unique identifier of the image
     * @param {Integer} duration Duration in frame
     * @param {Object} propreties New Property image. See "addPicture".
    */
	movePicture: function(id, duration, prop) {
		var pic = this.pictures[id];
		if (prop.opacity) {
			new Effect(pic).fadeStartTo(duration, pic.alpha, prop.opacity);
		}
		if (prop.x !== undefined) {
			new Effect(pic).linear(duration, prop.x, "x");
		}
		if (prop.y !== undefined) {
			new Effect(pic).linear(duration, prop.y, "y");
		}
		if (prop.scaleX) {
			new Effect(pic).scaling(duration, prop.scaleX, "x");
		}
		if (prop.scaleY) {
			new Effect(pic).scaling(duration, prop.scaleY, "y");
		}
		if (prop.regX !== undefined) {
			pic.regX = prop.regX;
		}
		if (prop.regX !== undefined) {
			pic.regY = prop.regY;
		}
		this.call("movePicture", {id: id, duration: duration, prop: prop});
	},
	
	/**
     * Rotating a picture
	 * @method rotatePicture
     * @param {Integer} id ID of the image
     * @param {Integer} duration Duration in frame
     * @param {Integer|String} value Value in degrees of rotation. Put "loop" for a full turn and loop
     * @param {Function} callback Callback when the rotation is complete. Call each turn if the value is "loop"
    */
	rotatePicture: function(id, duration, value, callback) {
		var pic = this.pictures[id];
		var loop = false;
		if (typeof value == "string" && value == "loop") {
			loop = true;
			value = 360;
		}
		this.call("rotatePicture", {id: id, duration: duration, value: value});
		rotateLoop();
		function rotateLoop() {
			new Effect(pic).rotate(duration, value, loop ? rotateLoop : callback);
			if (callback && loop) callback();
		}
	},
	
	/**
     * Delete an image
	 * @method erasePicture
     * @param {Integer} id Image ID
    */
	erasePicture: function(id) {
		this.stage.removeChild(this.pictures[id]);
		this.call("erasePicture", id);
		delete this.pictures[id];
	},
	
	initPlugins: function() {
		var name, original_name;
		for (var i=0 ; i < RPGJS.plugins.length ; i++) {
			original_name = RPGJS.plugins[i];
			if (/\//.test(original_name)) {
				var result = /\/([^\/]+)$/.exec(original_name);
				original_name = result[1];
			}
			name = original_name.charAt(0).toUpperCase() + original_name.slice(1);
			this.addPlugin(original_name, new window[name]());
		}
	},
	
	/**
     * Add a plugin
	 * @method addPlugin
     * @param {String} id ID (plugin name)
	 * @param {Object} plugin_class the class.
	 * @example
		<pre>
			rpg.addPlugin("myplug", new MyPlugin());
		</pre>
    */
	addPlugin: function(id, plugin_class) {
		plugin_class.rpg = this;
		if (!plugin_class._id) plugin_class._id = id;
		this.plugins[id] = plugin_class;
	},
	
	/**
     * Get a plugin as its identifier (or name)
	 * @method plugin
     * @param {String} id ID (name)
	 * @return {Object|Boolean} The class of the plugin or false if no plugin
	 * @example
		<pre>
			var myplugin = rpg.plugin("myplugin");
			if (myplugin) {
				myplugin.callMyMethod();
			}
		</pre>
    */
	plugin: function(name) {
		return this.plugins[name] ? this.plugins[name] : false;
	},	
	
	emit: function(name, params) {
		DataLink.emit(name, params);
	},
	
	/**
     * Called a trigger
	 * @method call
     * @param {String} name Name trigger
	 * @param {Object} params Parameter of the function assigned	
	 * @return {Object} Function value
    */
	call: function(name, params, id, instance) {
		// if (this.func_trigger[name] != undefined) {
			// return this.func_trigger[name](params);
		// }
		var p;
		if (!(params instanceof Array)) {
			params = [params];
		}
		if (!instance) instance = this;
		for (var i in this.plugins) {
			if (!id || (id && this.plugins[i]._id == id)) {
				if (instance instanceof Event) {
					this.plugins[i].event = instance;
					p = this.plugins[i]['Event'];
				}
				else {
					p = this.plugins[i]['Core'];
				}
				if (p[name]) {
					p[name].apply(this.plugins[i], params);
				}
			}
		}
	},
	callListener: function(name, params) {
		if (!this._listener[name]) return;
		var l;
		for (var i=0; i < this._listener[name].length ; i++) {
			l = this._listener[name][i];
			l.call(this, params);
		}
	},
	addListener: function(name, callback) {
		if (!this._listener[name]) this._listener[name] = [];
		this._listener[name].push(callback);
	}
	
}

