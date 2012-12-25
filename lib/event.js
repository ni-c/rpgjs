/*
Visit http://rpgjs.com for documentation, updates and examples.

Copyright (C) 2011 by Samuel Ronce

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/**
 * @class Event Create an event and makes it look, movement, action, event orders, etc..
 * @author Samuel Ronce
 */

if (typeof(RPGJS) === "undefined") {
	var Interpreter = require('./interpreter.js')._class;
	var Cache = require('./cache.js')._class;
}

function Area(points, event) {
	this.points = points || [];
	this.event = event;
	if (points) {
		this.setGlobalArea();
	}
	this.real_x = 0, this.real_y = 0;
	this._debug = false;
	this.callback;
}
 
 Area.prototype = {
	// points : [[x1, y1], [x2, y2]...]
	setPoints: function(points) {
		this.points = points;
		this.setGlobalArea();
	},
	setGlobalArea: function() {
		var p;
		this.min_x = false;
		this.max_x = 0;
		this.min_y = false;
		this.max_y = 0;
		for (var i=0 ; i < this.points.length ; i++) {
			p = this.points[i];
			if (p[0] < this.min_x || this.min_x === false) {
				this.min_x = p[0] ;
			}
			if (p[1] < this.min_y || this.min_y === false) {
				this.min_y = p[1];
			}
			if (p[0] > this.max_x) {
				this.max_x = p[0];
			}
			if (p[1] > this.max_y) {
				this.max_y = p[1];
			}
		}
	},
	onCollision: function(callback) {
		this.callback = callback;
	},
	getGlobaPosition: function() {
		return {
			min_x: this.min_x + this.real_x, 
			max_x: this.max_x + this.real_x,
			min_y: this.min_y + this.real_y, 
			max_y: this.max_y + this.real_y
		};
	},
	setPosition: function(x, y) {
		this.real_x = x;
		this.real_y = y;
	},
	test: function(area, position) {
		if (area instanceof Event || area instanceof Player) {
			area = area.collisionPoints;
			if (!area) return false;
		}
		if (position) {
			if (this.event) {
				this.setPosition(this.event.real_x, this.event.real_y);
			}
		}
		if (area.event) {
			area.setPosition(area.event.real_x, area.event.real_y);
		}
		
		var p1 = {}, p2, i, j, x0, x1, y0, y1, ret = false;
		var pos = this.getGlobaPosition();
		var _area = area.getGlobaPosition();
		var tmp_pos, reverse;
			
		var obj = {
			this_points: this.points, 
			area_points: area.points,
			area_real_x: area.real_x,
			area_real_y: area.real_y,
			this_real_x: this.real_x,
			this_real_y: this.real_y,
			this_pos_min_x: pos.min_x,
			this_pos_min_y: pos.min_y,
			this_pos_max_x: pos.max_x,
			this_pos_max_y: pos.max_y,
			area_pos_min_x: _area.min_x,
			area_pos_min_y: _area.min_y,
			area_pos_max_x: _area.max_x,
			area_pos_max_y: _area.max_y
		};
		// reverse if area of this event is bigger than other event area
		if (((this.event.direction == "up" || this.event.direction == "bottom") && pos.max_y - pos.min_y > _area.max_y - _area.min_y) ||
			((this.event.direction == "left" || this.event.direction == "right") && pos.max_x - pos.min_x > _area.max_x - _area.min_x)) {
			reverse = ["points", "real_x", "real_y", "pos_min_x", "pos_max_x", "pos_min_y", "pos_max_y"];
			for (var i=0 ; i < reverse.length ; i++) {
				tmp_pos = obj["area_" + reverse[i]];
				obj["area_" + reverse[i]] = obj["this_" + reverse[i]];
				obj["this_" + reverse[i]] = tmp_pos;
				
			}
		}
		if (allTestContact()) {
			for (var k=0 ; k < obj.this_points.length ; k++) {
				p1 = {x: obj.this_points[k][0] + obj.this_real_x, y: obj.this_points[k][1] + obj.this_real_y};
				for (i = 0, j = obj.area_points.length - 1; i < obj.area_points.length; j = i++) {
					p2 = obj.area_points;
					x0 = p2[i][0] + obj.area_real_x;
					x1 = p2[i][1] + obj.area_real_y;
					y0 = p2[j][0] + obj.area_real_x;
					y1 = p2[j][1] + obj.area_real_y;
					if (
						((x1 > p1.y) != (y1 > p1.y)) && 
						(p1.x < (y0 - x0) * (p1.y - x1) / (y1 - x1) + x0)
					) {
						ret = !ret;
					}
				}
				if (ret) {
					if (this.callback) this.callback();
					return true;
				}
			}
		}
		
		function allTestContact(equal) {
			var w = obj.this_pos_min_x + ((obj.this_pos_max_x - obj.this_pos_min_x) / 2);
			var h = obj.this_pos_min_y + ((obj.this_pos_max_y - obj.this_pos_min_y) / 2);
			if ((testContact(obj.this_pos_min_x, obj.this_pos_min_y, equal) ||
				testContact(obj.this_pos_max_x, obj.this_pos_min_y, equal) ||
				testContact(w, obj.this_pos_min_y, equal) ||
				testContact(obj.this_pos_min_x, obj.this_pos_max_y, equal) ||
				testContact(obj.this_pos_min_x, h, equal) ||
				testContact(w, h, equal) ||
				testContact(w, obj.this_pos_max_y, equal) ||
				testContact(obj.this_pos_max_x, obj.this_pos_max_y, equal))
				) {
				return true;
			}
			return false;
		}
		
		function testContact(x, y, equal) {
			// var ex = _area.min_x;
			// var ey = obj.real_y;
			// if  (equal && x == ex && y == ey) {
				// return true;
			// }
			return x > obj.area_pos_min_x && x < obj.area_pos_max_x && y > obj.area_pos_min_y && y < obj.area_pos_max_y;
			
		}
		
		return false;
	}
 }

function Event(prop, rpg, client, share, is_player) {
	if (!prop) return;
	// Global
	this.rpg = rpg;
	this.share = share ? "currentMap" : "this";
	/**
     * List of local switches. The key is the identifier, the value is a boolean (on or off)
	 * @property self_switch
     * @type Object
     */
	this.self_switch = {};
	this.func_trigger = {};
	
	// Action
	/**
     * List of actions of the event. Each element is a string indicating the name of the action
	 * @property actions 
     * @type Array
     */
	this.actions = prop[0].actions || [];
	
	this.action_prop = {};
	/**
     * Whether the event performs an action
	 * @property inAction
     * @type Boolean
     */
	this.inAction = false;
	this.blockMovement = false;
	this.labelDetection = "";
	
	// Prop
	this.name = prop[0].name ? prop[0].name : "";
	this.commands = prop.commands;	
	this.id = !prop[0].id ? Math.floor(Math.random() * 100000) : prop[0].id;
	this.pages = prop[1];
	this.x = prop[0].x;
	this.y = prop[0].y;
	this.real_x = prop[0].real_x;
	this.real_y = prop[0].real_y;
	
	if (!this.real_x) {
		this.real_x = this.rpg._positionValueToReal(this.x, this.y).x;
	}
	if (!this.real_y) {
		this.real_y = this.rpg._positionValueToReal(this.x, this.y).y;
	}
	
	
	this.opacity = 1;
	
	this.exp = [];
	this.params = {};
	this.paramPoints = {};
	this.currentLevel = 1;
	this.currentExp = 0;
	this.maxLevel = 100;
	this.itemEquiped = {};
	this.skillsByLevel = {};
	this.skills = {};
	this.elements = {};
	this.states = [];
	this.className = "";
	this.typeMove = "tile";
	this.behaviorMove = "";
	
	/**
     * Amount of money the player
	 * @property gold
     * @type Integer
	 * @default 0
    */
	this.gold = 0;
	/** 
	* List of switches. The key is the name or identifier of the switch. The value is a boolean
	* @property switches
	* @type Object
	*/
	this.switches = {};
	
	/** 
	* List of variables. The key is the name or identifier of the variable. The value is an integer.
	* @property variables
	* @type Object
	*/
	this.variables = {};
	
	this.width = this.tile_w;
	this.height = this.tile_h;
	
	// State
	/**
     * Whether the event is moving
	 * @property moving
     * @type Boolean
     */
	this.moving = false;
	this.stopMove = false;
	this.eventsContact = false;
	/** 
	* The player is detected or not
	* @property detection
	* @type Boolean
	*/
	this.detection = false;
	this._wait = {frame: 0};
	this.currentFreq = 1;
	this.fixcamera  = false;
	this.targetPos = {x: this.x, y: this.y};
	
	// Bitmap
	this.bitmap;
	this.bar;
	
	
	// Page
	this.changePage = true;
	/**
     * The current page of the event being played  [Real Only]
	 * @property currentPage
     * @type Integer
     */
	this.currentPage = 0;
	
	
	
	
	this.tickPlayer;
	this.initialize(client, is_player);
}

var interpreter = Event.prototype = new Interpreter();

var p = {
	initialize: function(client, is_player) {	
		// Ticker.addListener(this);
		if (this.name != "Player") {
			client.pushEvent(this);
		}
		this.refresh(client, true, is_player);	
	},
	
	init_tab_move: function() {
		for (var i = 0 ; i < this.tactical.move * 2 + 1 ; i++) {
			this.tab_move_passable[i] = [];
			for (var j = 0 ; j < this.tactical.move * 2 + 1 ; j++) {
				this.tab_move_passable[i][j] = -1;
			}
		}
		var middle = Math.floor(this.tab_move_passable.length / 2);
		this.tab_move_passable[middle][middle] = 0;
		
	},
	
	onLoad: function(client) {
		if (this.real_x !== undefined && this.real_y !== undefined) {
			// self.setPositionReal(self.real_x, self.real_y);
		}
		else {
			//self.setPosition(self.x, self.y);
		}
		// self.rpg.send("all", "trigger"
		this._trigger(client);
	
	
	},
	
	/**
     * Refresh event. The properties of the right page is assigned to the event. The appearance of the event may also change if the picture is different
	 * @method refresh
    */
	refresh: function(client, init, is_player) {
		var self = this;
		
		
		// function load() {
			// if (prop.character_hue && self.direction) self.bitmap.gotoAndStop(self.direction); // -C
			
		// }
		var page = this.setPage(client);

		if (!page) {
			if (this.bitmap != undefined) {
				// this.rpg.layer[3].removeChild(this.sprite); // -C
				this.character_hue = undefined;
			}

			return;
		}
		else if (!this.initEvent) {
			init = true;
		}
		var prop = this.pages[this.currentPage];
		var abs = prop.action_battle;
		this.commands = prop.commands;
		this.tactical = prop.tactical;		
		if (!this.actionBattle && prop.action_battle) {
			this.actionBattle = abs;
			this.actionBattle.hp = this.actionBattle.hp_max;
			this.actions = this.actionBattle.actions;
			
			if (abs.maxLevel) {
				this.maxLevel = abs.maxLevel;
			}
			if (abs.expList) {
				this.makeExpList(abs.expList.basis, abs.expList.inflation);
			}
			if (abs.level) {
				this.setLevel(abs.level);
			}
			if (abs.params) {
				var param;
				for (var key in abs.params) {
					if (typeof abs.params[key] == "number") {
						param = abs.params[key]; 
						abs.params[key] = [param, param];
					}
					this.setParam(key, abs.params[key][0], abs.params[key][1], "proportional");
				}
			}
			if (abs.items) {
				for (var key in abs.items) {
					for (var i=0 ; i < abs.items[key].length ; i++) {
						this.equipItem(key, abs.items[key][i]);
					}
				}
			}
			if (abs.elements) {
				this.setElements(abs.elements);
			}
			if (abs.skillsToLearn) {
				this.skillsToLearn(abs.skillsToLearn);
			}
			if (abs["class"]) {
				this.setClass(abs["class"]);
			}
			if (abs.states) {
				for (var i=0 ; i < abs.states.length ; i++) {
					this.addState(abs.states[i]);
				}
			}
			this.setTypeMove("real");
		
		}
		this.trigger = prop.trigger;
		this.character_hue = prop.graphic;
		// this.direction_fix = prop.direction_fix;   // Direction does not change ; no animation
		// this.no_animation = prop.no_animation; // no animation even if the direction changes
		// this.stop_animation = prop.stop_animation || prop.move_animation;
		this.speed = prop.speed === undefined ? 4 : prop.speed;
		this.type = prop.type || 'fixed';
		this.frequence = prop.frequence ||  0;
		
		prop.options = prop.options || {};
		
		var options = ["direction_fix", "no_animation", "stop_animation", "alwaysOnTop", "through"];
		for (var i = 0 ; i < options.length ; i++) {
			initOptions.call(this, options[i]);
		}
		
		this.through = this.character_hue ? this.through : true;
		
		prop['graphic-params'] = prop['graphic-params'] || {};
		
		initGraphicParams.call(this, 'nbSequenceX', 4);
		initGraphicParams.call(this, 'nbSequenceY', 4);
		initGraphicParams.call(this, 'regX');
		initGraphicParams.call(this, 'regY');
		initGraphicParams.call(this, 'speedAnimation', 5);
		initGraphicParams.call(this, 'pattern', 0);
		initGraphicParams.call(this, 'direction', "up");
		
		this.speedAnimation  = prop.speedAnimation || 5;
		this.collisionPoints = new Area(prop.collisionPoints || [[0,0], [client.tile_w, 0], [client.tile_w, client.tile_h], [0, client.tile_h]], this);
		
		//this.alwaysOnTop = prop.alwaysOnTop || false;
		this.alwaysOnBottom = prop.alwaysOnBottom || false;
		// this.sprite.z = this.alwaysOnBottom ? 0 : false; // For z sort;
		// if (this.alwaysOnBottom === false) {
			// this.sprite.z = this.alwaysOnTop ? (this.rpg.getMapHeight() + 1) * this.rpg.tile_h : false;
		// }
		this.direction = prop['graphic-params'].direction;
		
		this.setCharacterHue(client, init, is_player);
		
		function initGraphicParams(name, _default) {
			this[name] = prop['graphic-params'][name] && prop['graphic-params'][name] != "" ? prop['graphic-params'][name] : _default;
		}
		
		function initOptions(name) {
			for (var i = 0 ; i < prop['options'].length ; i++) {
				if (prop['options'][i] == name) {
					this[name] = true;
					return true;
				}
			}
			this[name] = false;
		}
		
		/*if (this.character_hue !== undefined) {
			this.character_hue = prop.character_hue;
			this.setCharacterHue(client, init, is_player);
		}
		else {
			this.character_hue = prop.character_hue;
			if (prop.character_hue !== undefined) {
				this.setCharacterHue(client, init, is_player);
			}
			else {
				
				this.onLoad();
			}
			
		}*/
	
	},
	
	
	/**
     * Enables or disables a local switch. The event is then refreshed
	 * @method setSelfSwitch
     * @param {String} id ID local switch
     * @param {Boolean} bool Active if true
    */
	setSelfSwitch: function(id, bool, client) {
		var _id = client.currentMapInfo.name + "_" + this.id;
		this.self_switch[id] = bool;
		if (!Cache.events_data[_id]) {
			Cache.events_data[_id] = {};
		}
		if (!Cache.events_data[_id].self_switch) {
			Cache.events_data[_id].self_switch = {};
		}
		Cache.events_data[_id].self_switch[id] = bool;
		//this.rpg.call("selfSwitch", {event: this, id: id, enable: bool});
		this.refresh(client);
	},
	
	/**
     * Whether a local switch is activated
	 * @method selfSwitchesIsOn
     * @param {String} id ID local switch
    */
	selfSwitchesIsOn: function(id, client) {
		var _id = client.currentMapInfo.name + "_" + this.id;
		var e = Cache.events_data[_id];
		if (e && e.self_switch && e.self_switch[id]) {
			return true;
		}
		else {
			return false;
		}
	},
	
	/**
     * Sprite updates of the event. Verify that the Sprite has been removed from the layer
	 * @method refreshBitmap
    */
	refreshBitmap: function() { // -C
		if (this.bitmap) {
			this.rpg.layer[3].addChild(this.sprite);
		}
	},
	
	// Private
	setCharacterHue: function(client, init, is_player) {
			var self = this;
			var prop = {
				nbSequenceX: this.nbSequenceX,
				nbSequenceY: this.nbSequenceY,
				speedAnimation: this.speedAnimation ,
				graphic_pattern: this.pattern,
				direction: this.direction,
				direction_fix: this.direction_fix,
				no_animation: this.no_animation,
				stop_animation: this.stop_animation,
				frequence: this.frequence,
				speed: this.speed,
				regX: this.regX,
				regY: this.regY,
				actions: this.actions,
				alwaysOnBottom: this.alwaysOnBottom,
				alwaysOnTop: this.alwaysOnTop,
				currentPage: this.currentPage
			};

			if (!is_player) {
				prop.x = this.x;
				prop.y = this.y;
			}

			var prop_send = {id: this.id, graphic: this.character_hue, params: prop};
			if (is_player) {
				client.send("currentMapWithoutThis", "addEvent", prop_send);
				client.send("this", "initPlayer", prop_send);
			}
			else if (init) {
				this.initEvent = true;
				client.send("this", "addEvent", prop_send);
			}
			else {
				client.send(this.share, "refreshEvent", prop_send);
			}
			
	},
	
	// Private
	_trigger: function(client) {
	
		if (this.trigger == 'parallel_process' || this.trigger == 'auto' || this.trigger == 'auto_one_time') {
			this.onCommands(client);
		}
		
		this.moveType(client);
		
	},
	
	
	
	moveType: function(client) {
		if (this.type == 'random') {
			this.moveRandom(client);
		}
		else if (this.type == 'approach') {
			this.approachPlayer(client);
		}
	},
	
	// Private
	click: function() { // -C
		if (this.trigger == 'click') {
			this.onCommands();
		}
		if (this.rpg.isTactical()) {
			this.rpg.tacticalAreaClear();
			this.rpg.tactical.event_selected = this;
			if (this.tactical.status == 'wait') {
				this.pathMove();
				for (var i = 0 ; i < this.tab_move.length ; i++) {
					var x = this.tab_move[i][0];
					var y = this.tab_move[i][1];
					this.rpg.tacticalMap[x][y].visible = true;
					this.tactical.status = 'readyMove';
				}
			}
			else if (this.tactical.status == 'readyMove') {
				this.rpg.tacticalAreaClear();
				this.tactical.status = 'wait';
			}
		}
	},
	
	
	
	// Private
	tick: function() { // -C?
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
					bmp_x += /*this.rpg.tile_w / */this.speed;		
					if (bmp_x >= real_x) {
						bmp_x = real_x;
						finish_step = 'right';

					}
				}
				else if (real_x < bmp_x) {
					bmp_x -= this.speed;
					if (bmp_x <= real_x) {
						bmp_x = real_x;
						finish_step = 'left';
					}
					
				}
				if (this.fixcamera) {
					this.rpg.screen_x = bmp_x - this.rpg.canvas.width/2 + (this.rpg.canvas.width/2 % this.rpg.tile_w);
					
				}
				this.sprite.x = bmp_x;

			}
			if (bmp_y != real_y) {
				
				if (real_y > bmp_y) {
					bmp_y += this.speed;
					if (bmp_y >= real_y) {
						bmp_y = real_y;
						finish_step = 'bottom';
					}
					
					
				}
				else if (real_y < bmp_y) {
					bmp_y -= this.speed;
					if (bmp_y <= real_y) {
						bmp_y = real_y;
						finish_step = 'up';
					}
		
				}
				if (this.fixcamera) {
					this.rpg.screen_y = bmp_y - this.rpg.canvas.height/2 + (this.rpg.canvas.height/2 % this.rpg.tile_h);
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
		// }
		/*else {
			var bmp_x = this.sprite.x;
			var bmp_y = this.sprite.y;
			var real_x = this._moveReal.xfinal;
			var real_y = this._moveReal.yfinal;
			
			if (bmp_x != real_x) {
				this._moveReal.vx = Math.abs(bmp_x - real_x) / this._moveReal.speed;
				if (this._moveReal.vx < 0.01) {
					this._moveReal.vx = 0;
				}
				if (real_x > bmp_x) {	
					bmp_x += this._moveReal.vx;	
					if (bmp_x >= real_x-0.2) bmp_x = real_x;
				}
				else if (real_x < bmp_x) {
					bmp_x -= this._moveReal.vx;	
					if (bmp_x <= real_x-0.2) bmp_x = real_x;
				}
				this.x = Math.floor(bmp_x / this.rpg.tile_w); 
				this.sprite.x = bmp_x;
			}
			if (bmp_y != real_y) {
				this._moveReal.vy = Math.abs(bmp_y - real_y) / this._moveReal.speed;
				if (this._moveReal.vy < 0.01) {
					this._moveReal.vy = 0;
				}
				if (real_y > bmp_y) {	
					bmp_y += this._moveReal.vy;	
					if (bmp_y >= real_x-0.2) bmp_y = real_y;
				}
				else if (real_y < bmp_y) {
					bmp_y -= this._moveReal.vy;	
					if (bmp_y <= real_x-0.2) bmp_y = real_y;
				}
				this.y = Math.floor(bmp_y / this.rpg.tile_h); 
				this.sprite.y = bmp_y;
			}
		}*/

		if (this.tickPlayer) {
			this.tickPlayer();

		}
		
	
		
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
		
		
		//this._tickState();

	},
	
	_contactWith: function(real_x, real_y, type) {
		
		if (type == "event") {
			return events;
		}
	
		
	},
	
	contactWithEvent: function(client, real_x, real_y, ignoreEventThrough) {
		var events = [];
		var events_contact = [];
		for (i=0 ; i <= this.rpg.events.length ; i++) {
			if (!client.player) continue;
			ev = client.events.length == i ? client.player : client.events[i];
			if (ev.id != this.id) {
				this.collisionPoints.setPosition(real_x, real_y);
				if (this.collisionPoints.test(ev)) {
					if (!ignoreEventThrough || (ignoreEventThrough && !ev.through)) {
						events.push(ev);
					}
					events_contact.push(ev);
				}
			}
		}
		//var events = this._contactWith(real_x, real_y, "event");
		this.call("contact", events_contact);
		client.call("eventContact", [events_contact], this);
		return events;
	},
	
	/*contactWithTile: function(real_x, real_y) {
		real_x = real_x || this.real_x;
		real_y = real_y || this.real_y;
		var w = this.rpg.tile_w, h = this.rpg.tile_h;
		this._contactWith(real_x, real_y, "tile");
		
		if ((testContact(real_x, real_y, ev) ||
			testContact(real_x + w, real_y, ev) ||
			testContact(real_x + w / 2, real_y, ev) ||
			testContact(real_x, real_y + h, ev) ||
			testContact(real_x, real_y + h / 2, ev) ||
			testContact(real_x + w / 2, real_y + h, ev) ||
			testContact(real_x + w, real_y + h / 2, ev) ||
			testContact(real_x + w, real_y + h, ev))
			) {
			
			return true;
		}
		Math.floor(real_x / self.rpg.tile_w), Math.floor(real_y / self.rpg.tile_h)
		
	},*/
	
	

	/**
     * Makes visible or not the event
	 * @method visible
	 * @param {Boolean} visible false to make invisible
    */
	visible: function(visible) { // -C
		this.sprite.visible = visible;
	},

	
	
	/**
     * The event detects the hero in his field of vision
	 * @method detectionPlayer
	 * @param {Integer} area Number of tiles around the event
	 * @return {Boolean} true if the player is in the detection zone
    */
	detectionPlayer: function(area) {
		var player = this.rpg.player;
		if (!player) return false;
		if (player.x <= this.x + area && player.x >= this.x - area && player.y <= this.y + area && player.y >= this.y - area) return true;
		return false;
	},
	
	/**
     * Detects events around this event. Events are refreshed to activate a page with the trigger condition "detection"
	 * @method detectionEvents
	 * @param {Integer} area Number of pixels around the event
	 * @param {String} label The name of the label to activate the pages with the same name (see example)
	 * @return {Array} List of detected events (except player and itself).
	 Example :<br />
	 In some event :
	 <pre>
		{
            "conditions": {"detection": "foo"},
            [...]
            "commands": [
              
            ]
        }
	 
	 </pre>
	 Code :
	 <pre>
		event.detectionEvents(64, "foo"); 
	 </pre>
	 All events in the area of 64 pixels with the trigger condition "foo" will be triggered
    */
	detectionEvents: function(area, label) {
		var events = this.rpg.events;
		var events_detected = [];
		var i, ev;
		for (i=0; i < events.length ; i++) {
			ev = events[i];
			if (ev.real_x <= this.real_x + area && ev.real_x >= this.real_x - area && ev.real_y <= this.real_y + area && ev.real_y >= this.real_y - area && ev.id != this.id) {
				ev.labelDetection = label;
				ev.refresh();
				events_detected.push(ev);
			}
		
		}
		//this.rpg.call("eventDetected", {src: this, events: events_detected});
		return events_detected;
	
	},
	
	// Private
	distance: function(xfinal, yfinal, x, y) {
		var dis_final = Math.abs(xfinal - x) + Math.abs(yfinal - y);
		var dis_ini = Math.abs(this.x - x) + Math.abs(this.y - y);
		var somme_dis = dis_final + dis_ini;
		return  {'_final': dis_final, 'ini' : dis_ini, 'somme': somme_dis};
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
	
	/**
     * The animation is stopped and put in the direction of player. See "directionRelativeToPlayer"
	 * @method turnTowardPlayer
    */
	turnTowardPlayer: function(client) { // -C
		var player = client.player;
		if (player) {
			var dir = this.directionRelativeToPlayer(client);
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
	
	/**
     * The event will start in the opposite direction of the player. He moves from one tile
	 * @method moveAwayFromPlayer
	 * @param onFinish {Function} Callback when the movement is finished
	 * @param passable (optional) {Boolean} If true, the movement ends if the event can not pass on the next tile
    */
	moveAwayFromPlayer: function(onFinish, passable, client) {
		var dir;
		var player = client.player;
		
		if (player) {
			if (player.y < this.y) {
				dir = 8
			}
			else if (player.y > this.y) {
				dir = 2;
			}
			else if (player.x > this.x) {
				dir = 4;
			}
			else if (player.x < this.x) {
				dir = 6;
			}
			this.move([dir], onFinish, passable, client);
		}
		
	},
	
	/**
     * Return the direction of the event relative to the player. For example, if the player is right for the event, direction of the event will be on the right
	 * @method directionRelativeToPlayer
	 * @return {Integer|Boolean} Value direction (2: Up, 4: left; 6: right; 8: bottom). Return false if the player does not exist
    */
	directionRelativeToPlayer: function(client) {
		var player = client.player;
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
	
	_setBehaviorMove: function(move) {
		this.behaviorMove = move;
	},
	
	_isBehaviorMove: function(move) {
		return this.behaviorMove == move;
	},
	
	/**
     * The event is approaching the player. If the event is blocked, the A* algorithm will be made to enable him to take the shortest path to the player
	 * @method approachPlayer
    */
	approachPlayer: function(client) {
		var self = this;
		this._setBehaviorMove("approachPlayer");
		approach();
		function approach() {
			if (!self._isBehaviorMove("approachPlayer")) return;
			var dir = self.directionRelativeToPlayer(client);
			if (dir) {
			
				//console.log(dir);
				self.move(dir, function(moving) {
					if (moving) {
						approach();
					}
				}, true, client);
			
				// if (self.canMove(dir)) {
					
				// }
				// else {
					// var dir = self.pathfinding(self.rpg.player.x, self.rpg.player.y);
					// dir.pop();
					// self.move(dir);
				// }
			}
		}
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
	
	/**
     * Random walk in 4 directions
	 * @method moveRandom
    */
	moveRandom: function(client) {
		var self = this;
		this._setBehaviorMove("moveRandom");
		rand();
		function rand() {
			if (!self._isBehaviorMove("moveRandom")) return;
			var dir_id = (Math.floor(Math.random()*4) + 1) * 2;
			var dir = [];
			if (self.typeMove == "tile") {
				
				var length = 8;
				for (var i=0 ; i < length ; i++) {
					dir.push(dir_id);
				}
			}
			else {
				dir = dir_id;
			}
			// if (self.canMove(dir)) {
			self.move(dir, rand, true, client);
			// }
			// else {
				// rand();
			// }
		}
	},
	
	/**
     * Whether the event can move into their new positions. The event is blocked if it meets another event or the player, if the tile is not fair.
	 * @method canMove
	 * @param dir {Integer} Value direction (2: Up, 4: left; 6: right; 8: bottom). The positions will be checked against the direction of the event. For example, if direction is left, it will position the X-1
	 * @return {Boolean} true if the event can move
    */
	canMove: function(dir) { // obsolete
		var x = this.x;
		var y = this.y;
		var passable = true;
		switch (dir) {
			case 2:
				y--;
			break;
			case 4:
				x--;
			break;
			case 6:
				x++;
			break;
			case 8:
				y++;
			break;
		}
		if (this.rpg.player && this.rpg.player.x == x && this.rpg.player.y == y) {
			this.moving = false;
			return false;
		}
		passable = this.rpg.isPassable(x, y);
		if (!passable) {
			this.moving = false;
		}
		return passable;
	},
	
	/**
     * Move the event by specifying a path
	 * @method move
	 * @param dir {Array|Integer|String} Array containing the directions to make. For example, ["up", "left", "left"] will move the event of a tile up and two tiles to the left. Notice that the table can be written as: [2, 4, 4]. The elements are the value of the direction (2: up, 4: left; 6: right; 8: bottom)
	 * @param onFinishMove (optional) {Function} Callback when all trips are completed. One paramaters : 
		<ul>
			<li>moving {Boolean} : The event was able to move</li>
		</ul>
	 * @param passable (optional) {Boolean} If true, the movement ends if the event can not pass on the next tile
    */
	move: function(dir, onFinishMove, passable, client) { // -C?
		var self = this;
		var pos = 0;
		//var new_position = false;
		var is_passable = true;
		
		if (typeof dir == "number" || typeof dir == "string") {
			dir = [dir];
		}
		if (dir.length == 0 || this.blockMovement) {
			this.moving = false;
			return;
		}
		
		
		function testPassable(real_x, real_y, old_real_x, old_real_y, dir) {
			var pos = client._positionRealToValue(real_x, real_y);
			var old_pos = client._positionRealToValue(old_real_x, old_real_y);
			var current_tile = 1 /* self.rpg.isPassable(self.x, self.y, dir, self) */;
			var _dir;
			switch (dir) {
				case "up": _dir = "bottom"; break;
				case "right": _dir = "left"; break;
				case "bottom": _dir = "top"; break;
				case "left": _dir = "right"; break;
			}
			var next_tile;
			next_tile = client.isPassable(pos.x, pos.y, _dir, self);
			
			return next_tile && current_tile;
		}
		
		function pointsPassable(real_x, real_y, dir) {
			var c = /*self.typeMove == "tile" || self.moveWithMouse ? 1 : 1;*/ 1;
			var w = client.tile_w - c;
			var h = client.tile_h - c;
			var bool_y, bool_x;
			
			// if (real_x % self.rpg.tile_w != 0) {
			if (dir == "right") {
				
			}
			// }
			// if (real_y % self.rpg.tile_h != 0) {
			var str = "";
			bool_x = testPassable(real_x, real_y, self.real_x, self.real_y, dir);
			bool_x &= testPassable(real_x + w, real_y, self.real_x + w, self.real_y, dir);
			
			bool_y = testPassable(real_x, real_y + h, self.real_x, self.real_y + h, dir);
			bool_y &= testPassable(real_x + w, real_y + h, self.real_x + w, self.real_y + h, dir);
			
			
			
			/*if (!bool_y && real_y % self.rpg.tile_h == 0 && (dir == "left" || dir == "right")) {
				bool_y = true;
			}
			if (!bool_x && real_x % self.rpg.tile_w == 0 && (dir == "bottom" || dir == "up")) {
				bool_x = true;
			}*/
			//return bool_x && bool_y;
			

			return bool_x && bool_y;;
			
		}
		
		function valueMove(dir) {
			var move;
			var value = self.typeMove == "tile" || self.moveWithMouse ? (dir == "left" ? self.rpg.tile_w : self.rpg.tile_h) : self.speed;
			if (dir == "left" || dir == "up") {
				return -value;
			}
			else {
				return value;
			}
		}
		
		function moveX(dir) {
			var move;
			var real_x = self.real_x + valueMove(dir);
			var real_y = self.rpg.isometric ? self.real_y + valueMove(dir) / 2 : self.real_y;
			var new_x = self.rpg._positionRealToValue(real_x, real_y).x;
			var contact = /*changeRealPosition(real_x, real_y, dir); */ self.contactWithEvent(client, real_x, real_y, true).length > 0;
			self.collisionPoints.setPosition(real_x, real_y);
			// if (new_x != self.x) {
				if (!passable || (passable && pointsPassable(real_x, real_y, dir) && !contact )) {
					self.real_x = real_x;
					self.real_y = real_y;
					self.x = new_x;
					//console.log("Passing through");
				}
				else {
					/*var mod = self.real_y % self.rpg.tile_h;
					if(mod > 0){ 		  	//if not squarely positioned in the center of a grid..
						var topPassable; 	//..check if I can pass between..
						var bottomPassable; //..grids
						var pos = self.rpg._positionRealToValue(real_x, real_y);
						if(dir == 'left'){
							topPassable = self.rpg.isPassable(pos.x, pos.y);
							bottomPassable = self.rpg.isPassable(pos.x, pos.y + 1);
						}else{
							topPassable = self.rpg.isPassable(pos.x+1, pos.y);
							bottomPassable = self.rpg.isPassable(pos.x + 1, pos.y + 1);
						}
						
						if(bottomPassable){
							self.real_y = real_y + mod;
						}
						if(topPassable){
							self.real_y = real_y - mod;
						}
					}*/
				//	real_x = Math.floor(real_x/self.rpg.tile_w) * self.rpg.tile_w;
				//	changeRealPosition(real_x, real_y);
					is_passable = false;
					if (contact) {
						//replacePosition(real_x, real_y, dir) ;
					}
					else {
						//is_passable = false;
					}
				}
			// }
			/*else {
				changeRealPosition(real_x, real_y, dir);

			}*/
			self.direction = dir;
		}
		
		function moveY(dir) {
			if (self.rpg.isometric) {
				var real_x = self.real_x + -valueMove(dir);
				var real_y = self.real_y + valueMove(dir) / 2;
			}
			else {
				var real_y = self.real_y + valueMove(dir);
				var real_x = self.real_x;
			}
			var contact = self.contactWithEvent(client, real_x, real_y, true).length > 0;
			
			var new_y =  self.rpg._positionRealToValue(real_x, real_y).y;
			self.collisionPoints.setPosition(real_x, real_y);
			// if (new_y != self.y) {
				//console.log(passable);
				if (!passable || (passable && pointsPassable(real_x, real_y, dir) && !contact )) {
					self.real_y = real_y;
					self.real_x = real_x;
					self.y = new_y;
				}
				else {
					/*var mod = self.real_x % self.rpg.tile_w;
					if(mod > 0){ 		  //if not squarely positioned in the center of a grid..
						var leftPassable; //..check if I can pass between..
						var rightPassable;//..grids
						var pos = self.rpg._positionRealToValue(real_x, real_y);
						if(dir == 'up'){
							leftPassable = self.rpg.isPassable(pos.x, pos.y);
							rightPassable = self.rpg.isPassable(pos.x + 1, pos.y);
						}else{
							leftPassable = self.rpg.isPassable(pos.x, pos.y + 1);
							rightPassable = self.rpg.isPassable(pos.x + 1, pos.y + 1);
						}
						
						if(rightPassable){
							self.real_x = real_x + mod;
						}
						if(leftPassable){
							self.real_x = real_x - mod;
						}
					}*/
				//	real_y = Math.floor(real_y/self.rpg.tile_h) * self.rpg.tile_h;
				//	changeRealPosition(real_x, real_y);
					is_passable = false;
					if (contact) {
						//replacePosition(real_x, real_y, dir) ;
					}
					else {
						//is_passable = false;
					}
				}
			/*}
			else {
				changeRealPosition(real_x, real_y, dir);

			}*/
			self.direction = dir;
		}
		
		/*
			false : event but not passable
			{Integer} : number of events
		*/
		function changeRealPosition(real_x, real_y, dir) {
			var i, rx, ry;
			rx = real_x;
			ry = real_y;
			if (self.typeMove == "tile" || self.moveWithMouse) {
				if (dir == "left" || dir == "right") {
					rx = real_x + (dir == "left" ? self.rpg.tile_w : -self.rpg.tile_w) / 2;
				}
				else {
					ry = real_y + (dir == "up" ? self.rpg.tile_h : -self.rpg.tile_h) / 2;
				}
			}
			
			var c = self.contactWithEvent(client, rx, ry);
			if (c.length > 0) {
				for (i=0 ; i < c.length ; i++) {
					if (!c[i].through) {	
						return replacePosition(real_x, real_y, dir, c[i]);
					}
				}
			}

			
			return true;
			
		}
		
		function replacePosition(real_x, real_y, dir, event) {
			is_passable = false;
			if (self.typeMove == "tile" || self.moveWithMouse) {
				return false;
			}
			if (dir == "left" || dir == "right") {
				if (event) {
					self.real_x = event.real_x - (dir == "right" ? self.rpg.tile_w : 0);
				}
				else {
					self.real_x = Math.floor(Math.abs(real_x/self.rpg.tile_w)) * self.rpg.tile_w;
				}
				//self.x = self.real_x / self.rpg.tile_w;
			}
			else {
				if (event) {
					self.real_y = event.real_y - (dir == "bottom" ? self.rpg.tile_h : 0);
				}
				else {
					self.real_y = Math.floor(Math.abs(real_y/self.rpg.tile_h)) * self.rpg.tile_h;
				}
				//self.y = self.real_y / self.rpg.tile_h;

			}
			
			if (dir == "left" && real_x > 0) {
				self.real_x += self.rpg.tile_w;
			}
			if (dir == "up" && real_y > 0) {
				self.real_y += self.rpg.tile_h;
			}
			
			return false;
		}
		
		function moving() {
			switch (dir[pos]) {
				case 'upLeft':
				/*case 1:
					if (!passable || (passable && this.rpg.isPassable(self.x-1, self.y-1))) {
						self.y -= 1;
						self.x -= 1;
					}
					else {
						is_passable = false;
					}
					
					self.direction = 'up';
					if (!self.no_animation) self.animation('walkUp');
				break;*/
				case 'up':
				case 2:
					moveY("up");
					// if (!self.no_animation) self.animation('walkUp');
				break;
				case 'left':
				case 4:
					moveX("left");
					// if (!self.no_animation) self.animation('walkLeft');
				break;
				case 'right':
				case 6:
					moveX("right");
					// if (!self.no_animation) self.animation('walkRight');
				break;
				case 'bottom':
				case 8:
					moveY("bottom");
					// if (!self.no_animation) self.animation('walkBottom');
				break;
				
				
			}
			self.moving = true;

			// self.rpg._sortEventsDepthIndex();
			
			client.send(self.share, "move", {
				id: self.id, 
				dir: dir,
				real_x: self.real_x, 
				real_y: self.real_y, 
				is_passable: is_passable
			});
			
			pos++;
			var fps =  (1000 / 25) * self.speed * (self.frequence+1) + 150;
			if (pos >= dir.length) {
				if (onFinishMove) {
					var timer = setTimeout(function() {
						clearTimeout(timer);
						onFinishMove(is_passable);
					}, fps); 
				}
				self.moving = false;
			}
			else {
				setTimeout(moving, fps); 
			}
			

			// if (!is_passable) {
				// self.call('onFinishStep', is_passable);
			// }
			
		}
		
		
		
		/*this.bind('onFinishStep', function(_passable) {
			pos++;
			if (pos >= dir.length) {
				if (onFinishMove) onFinishMove(_passable);
				self.moving = false;
			}
			else {
				moving();
			}
		});*/
		
		this.bind('contact', function(events) {
			if (events.length > 0) {
				self.eventsContact = events;
				if (self.name == "Player") {
					self.interactionEventBeside(events, "contact");
				}
			}
			else {
				self.eventsContact = false;
			}
		});
		moving();

	},
		
	/**
     * Get the event which is next to the event (according to his direction)
	 * @method getEventBeside
	 * @param {Boolean} player Get the player next to the event
	 * @return {Event} Return the event or null if none
    */
	getEventBeside: function(player) {
		var x = this.x;
		var y = this.y;
		var event;
		switch(this.direction) {
			case 'up':
				y--;
			break;
			case 'right':
				x++;
			break;
			case 'left':	
				x--;
			break;
			case 'bottom':
				y++;
			break;
		}
		if (player) {
			if (this.rpg.player && this.rpg.player.x == x && this.rpg.player.y == y) {
				event = this.rpg.player;
			}
		}
		else {
			event = this.rpg.getEventByPosition(x, y);
		}
		return event;
	},
	
	
	/**
     * Get events around the event
	 * @method getEventAround
	 * @param {Boolean} player Get the player next to the event
	 * @return {Object} Each event consists of a key (direction) and value (event or null if none). For example : {up: null, right: null, left: {Object Event}, bottom: null}
    */
	getEventAround: function(player) {
		var i, x, y, find_player;
		var event_dir = {};
		var dir = ['up', 'right', 'left', 'bottom'];
		for (i=0 ; i < 4 ; i++) {
			find_player = false;
			x = this.x;
			y = this.y;
			switch(dir[i]) {
				case 'up':
					y--;
				break;
				case 'right':
					x++;
				break;
				case 'left':	
					x--;
				break;
				case 'bottom':
					y++;
				break;
			}
			if (player) {
				if (this.rpg.player && this.rpg.player.x == x && this.rpg.player.y == y) {
					event_dir[dir[i]] = [this.rpg.player];
					find_player = true;
				}
			}
			if (!find_player) {
				event_dir[dir[i]] = this.rpg.getEventByPosition(x, y, true);
			}
		}
		return event_dir;
	},
	
	
	
	actionType: function(type) {
		var event;
		var self = this;
		
		switch (type) {
			case 'attack':
				event = this.getEventBeside();
				if (event && event.actionBattle) {
				
					if (event.actionBattle.mode == 'invinsible') {
						if (this.rpg.actionBattle.eventInvinsible && event.actionBattle.invinsible) {
							this.rpg.actionBattle.eventInvinsible[event.actionBattle.invinsible](event);			
						}
						return;
					}
				
					if (this.rpg.actionBattle.eventAffected && event.actionBattle.affected) {
						this.rpg.setEventMode(event, 'affected');
						this.rpg.actionBattle.eventAffected[event.actionBattle.affected](event);			
					}
			
					if (event.actionBattle.hp <= 0) {
						this.rpg.setEventMode(event, 'death');
						var anim = event.actionBattle.animation_death;
						if (anim) {
							this.rpg.animations[anim].setPosition(event.x, event.y);
							this.rpg.animations[anim].play();
						}
						event.fadeOut(5, function() {
							var item_drop = event.actionBattle.ennemyDead;
							var random = Math.floor(Math.random()*100);
							var min = 0, max = 0, drop_id = null;
							if (item_drop) {
								for (var i=0 ; i < item_drop.length ; i++) {
									max += item_drop[i].probability;
									if (random >= min && random <= max-1) {
										drop_id = i;
										break;
									}
									min += max;
								}
							}
							self.rpg.removeEvent(event.id);
							if (drop_id != null) {
								var drop_name = item_drop[drop_id].name;
								var drop = self.rpg.actionBattle.ennemyDead ? self.rpg.actionBattle.ennemyDead[item_drop[drop_id].call] : false;
								if (drop) drop(event, drop_name);
							}
							
						});
					}
					else {
						event.displayBar(event.actionBattle.hp);
					}
				}
			break;
		}
	},
	
	/**
     * Perform an action on the event. The action must first be added. See "addAction" in class Rpg
	 * @method action
	 * @param {String} name Action Name
	 * @param {Function} onFinish (optional) Callback function when the action is over. One parameter: the event which made the action
    */
	action: function(name, client, onFinish) {
		// Initialize
		var action = client.actions[name];
		var i = 0;
		var self = this;
		var bmp_ini = this.bitmap;
		var anim, duration;
		
		// Stop Action
		/* if (this.action_prop[name] && !isNaN(this.action_prop[name].wait) && this.action_prop[name].wait < action.wait_finish) {
			return false;
		} */
		
		if (this.inAction) return false;
		if (action.condition && !action.condition()) return false;
		
		// Callback
		if (action.onStart) action.onStart(this);
		
		this.direction_fix = true;
		this.no_animation = true;
		this.inAction = true;
		this.blockMovement = action.block_movement;
		
		client.call("action", [name, action.action], this);
		
		var hitbox = new Area(false, this);
		
		var interval = setInterval(function() {
			var frame = 0;
			switch (self.direction) {
				case "up": frame = 12; break;
				case "left": frame = 4; break;
				case "right": frame = 8; break;
			}
			actionHit(frame);
		}, 1000 / 25);
		
		function actionHit(frame) {
			frame = +frame;
			if (action.hitbox && action.hitbox[frame]) {
			//	var l = action.hitbox[frame].length;
				var a_frames = []; 
				for (var i=0; i < action.hitbox[frame].length ; i++) {
					a_frames.push([
						action.hitbox[frame][i][0] - self.regX,
						action.hitbox[frame][i][1] - self.regY,
					]);
				}
				hitbox.setPoints(a_frames, self);
				client.call("actionHitbox", [name, hitbox, frame, action.action], self);
			}
			if (frame > self.nbSequenceX * self.nbSequenceY) {
				clearInterval(interval);
			}
		}
		
		client.send(this.share, "action", {name: name, id: this.id});
		
	},
	
	actionFinish: function(name, client) {
		var action = client.actions[name];
		this.blockMovement = false;
		this.direction_fix = false;
		this.no_animation = false;
		this.inAction = false;
		if (action.onFinish) action.onFinish(this);
		//if (onFinish) onFinish(self);
	},
	
	turn: function() {
		
	},

	
	changeBitmap: function(bitmap) {  // -C
		this.sprite.removeChild(this.bitmap);
		this.bitmap = bitmap.clone();
		this.sprite.addChild(this.bitmap);
	},
	
	/**
     * Find the shortest path between the position of the event and a final position
	 * @method pathfinding
	 * @param {Integer} xfinal Final position X
	 * @param {Integer} yfinal Final position Y
	 * @param {Boolean} eventIgnore (optional) Ignore events
	 * @return {Array} Array containing the values ​​of directions. For example: [2, 4, 4, 8]. See "move"
    */

	pathfinding: function(xfinal, yfinal, eventIgnore) {
		var x = this.x;
		var y = this.y;
		var array_dir = [];
		var list_ouvert = {}; 
		list_ouvert[x] = {};
		list_ouvert[x][y] = [null, null, null];
		var dis = this.distance(xfinal, yfinal, x, y);
		var list_ferme = {}; 
		list_ferme[x] = {};
		list_ferme[x][y] = [0, dis._final, dis.somme, 0];
		var id = 0, event_passable;

		while (!(x == xfinal && y == yfinal)) {
			if (y == null || x == null) return [];
			id++;
			for (var i = 0 ; i < 4 ; i++) {
				x = parseInt(x);
				y = parseInt(y);
				switch (i) {
					case 0: 		
						var new_y = y-1;
						var new_x = x;
					break;
					case 1: 		
						var new_y = y;
						var new_x = x+1;
					break;
					case 2: 		
						var new_y = y+1;
						var new_x = x;
					break;
					case 3: 		
						var new_y = y;
						var new_x = x-1;
					break;
				}
				event_passable = true;
				if (!eventIgnore) {
					for (var j=0 ; j < this.rpg.events.length ; j++) {
						if (this.rpg.events[j].x == new_x && this.rpg.events[j].y == new_y && !this.rpg.events[j].through) {
							event_passable = false;
							break;
						}
					}
				}

				if (!Rpg.keyExist(list_ouvert, [new_x, new_y])) {
					if ((this.rpg.isPassable(new_x, new_y) && event_passable) || Rpg.valueExist(this.tab_move, [new_x, new_y])) {
						var dis = this.distance(xfinal, yfinal, new_x, new_y);
						if (list_ouvert[new_x] == undefined) {
							list_ouvert[new_x] = {};
						}
						list_ouvert[new_x][new_y] = [dis.ini, dis._final, dis.somme, id];
						// alert(">" + new_x + " " + new_y);
					}
				}
				
			}

			 list_ouvert[x][y] = [null, null, null];
			 
			 var min_dis_final = min_somme_dis = 200;
			 var new_value = new_pos = [];
			 for (var key_x in list_ouvert) {
				for (var key_y in list_ouvert[key_x]) {
					var value = list_ouvert[key_x][key_y];
					if (value[2] != null) {
						if (value[2] <= min_somme_dis && value[1] <= min_dis_final) {
							min_dis_final = value[1]; 
							min_somme_dis = value[2];
							new_value = value;
							new_pos = [key_x, key_y];
							// alert(new_pos + " " + id);
						}
					}
					
				}
			}
			if (list_ferme[new_pos[0]] == undefined) {
				list_ferme[new_pos[0]] = {};
			}
		    list_ferme[new_pos[0]][new_pos[1]] = new_value;
			x = new_pos[0];
			y = new_pos[1];
	
		}

		var min_dis_ini = 200;
		while (min_dis_ini != 0) {
			var min_dis_ini = min_somme_dis = min_dis_id = 200;
			x = parseInt(x);
			y = parseInt(y);
			if (y == null || x == null) return [];
			for (var i = 0 ; i < 4 ; i++) {
				switch (i) {
					case 0: 		
						var new_y = y-1;
						var new_x = x;
						var dir = 8;
					break;
					case 1: 		
						var new_y = y;
						var new_x = x+1;
						var dir = 4;
					break;
					case 2: 		
						var new_y = y+1;
						var new_x = x;
						var dir = 2;
					break;
					case 3: 		
						var new_y = y;
						var new_x = x-1;
						var dir = 6;
					break;
				}
		 
		if (list_ferme[new_x] == undefined) {
			list_ferme[new_x] = {};
		}
          var value = list_ferme[new_x][new_y];
          list_ferme[x][y] = null;
          if (value != null) {
            if (value[3] < min_dis_id) {	
              min_dis_id = value[3] ; 
              min_dis_ini = value[0]; 	  
              var n_dir = dir;
              var n_new_x = new_x;
              var n_new_y = new_y;
            }
          }
        }
        x = n_new_x;
        y = n_new_y;
        array_dir.push(n_dir);
      }
       return array_dir.reverse();
	},
	
	pathMove: function() {
		
		var x = this.x;
		var y = this.y;
		var pos_temporaire = [];
		var pos_semi_tempor = [[x, y]];
		var path = 0;
		var diff_x = pos_semi_tempor[0][0] - this.tactical.move;
		var diff_y = pos_semi_tempor[0][1] - this.tactical.move;
		this.tab_move = [];
		this.init_tab_move();
		while (path != this.tactical.move && !pos_semi_tempor.length == 0) {
			pos_temporaire = [];
			for (var i = 0 ; i < pos_semi_tempor.length ; i++) {
				var new_pos_x = pos_semi_tempor[i][0];
				var new_pos_y = pos_semi_tempor[i][1];
				var tab_x = new_pos_x - diff_x;
				var tab_y = new_pos_y - diff_y;
				for (var j = 0 ; j < 4 ; j++) {
					switch (j) {
						case 0: 		
							if (this.rpg.isPassable(new_pos_x,new_pos_y  + 1) && this.tab_move_passable[tab_x][tab_y + 1] == -1) {
								  pos_temporaire.push([new_pos_x,new_pos_y + 1]);
								  this.tab_move.push([new_pos_x,new_pos_y + 1]);
								  this.tab_move_passable[tab_x][tab_y + 1] = 0;
							}
						break;
						case 1: 		
							if (this.rpg.isPassable(new_pos_x + 1,new_pos_y) && this.tab_move_passable[tab_x + 1][tab_y] == -1) {
								  pos_temporaire.push([new_pos_x + 1,new_pos_y]);
								  this.tab_move.push([new_pos_x + 1,new_pos_y]);
								  this.tab_move_passable[tab_x + 1][tab_y] = 0;
							}
							
						break;
						case 2: 		
							if (this.rpg.isPassable(new_pos_x,new_pos_y - 1) && this.tab_move_passable[tab_x][tab_y - 1] == -1) {
								  pos_temporaire.push([new_pos_x,new_pos_y - 1]);
								  this.tab_move.push([new_pos_x,new_pos_y - 1]);
								  this.tab_move_passable[tab_x][tab_y - 1] = 0;
							}
								
						break;
						case 3: 		
							if (this.rpg.isPassable(new_pos_x - 1,new_pos_y) && this.tab_move_passable[tab_x - 1][tab_y] == -1) {
								  pos_temporaire.push([new_pos_x - 1,new_pos_y]);
								  this.tab_move.push([new_pos_x - 1,new_pos_y]);
								  this.tab_move_passable[tab_x - 1][tab_y] = 0;
							}
						break;
					}
				}
				
			}
        
			pos_semi_tempor = this.rpg.clone(pos_temporaire);
			path += 1;
		}

	
	},
	
	/**
     * Assigns a fixed position on the map. Put the animation to stop
	 * @method setPosition
	 * @param {Integer} x Position X
	 * @param {Integer} y Position Y
    */
	setPosition: function(client, x, y) { 
		this.rpg.send("all", "setPosition", {id: this.id, x:x, y:y});
		this.real_x = this.rpg._positionValueToReal(x, y).x;
		this.real_y = this.rpg._positionValueToReal(x, y).y;
		this.x = x;
		this.y = y;
		// this._setPosition();
	},
	
	/**
     * Assigns a fixed real position (in pixels) on the map. Put the animation to stop
	 * @method setPositionReal
	 * @param {Integer} real_x Position X (pixels)
	 * @param {Integer} real_y Position Y (pixels)
    */
	setPositionReal: function(real_x, real_y) { // -C?
		/*this.sprite.x = this.real_x = real_x;
		this.sprite.y = this.real_y = real_y;
		this.x = this.rpg._positionRealToValue(real_x, real_y).x;
		this.y = this.rpg._positionRealToValue(real_x, real_y).y;
		this._setPosition();*/
	},
	
	

	
	// Private
	_setPosition: function() { // -C?
		this.moving = false;
		this.animation('stop');
	},
	
	/**
     * Choose the type of movement
	 * @method setTypeMove
	 * @param {String} type tile|real
		<ul>
			<li>tile : Movement by tile. The event must pass through all the tiles before changing direction. Default except for the player</li>
			<li>real : Real movement. The event moves a few pixels (as defined in the attribute "speed")<li>
		</ul>
    */
	setTypeMove: function(type) {
		this.typeMove = type;
	},
	
	
	/**
     * Create an event depending on the position of the current event
	 * @method createEventRelativeThis
	 * @param {String} name Event Name
	 * @param {Object} prop Owned by the creation :<br />
	 *   x {Integer} (optional) : Real Position  X relative to the event<br />
	 *   y {Integer} (optional) : Real position Y relative to the event<br />
	 *	 dir {Integer} (optional) : The event created is positioned at N tiles along the direction of the event<br />
	 *	 move {Boolean} (optional) : The event moves to the position indicated. The movement is real
    */
	createEventRelativeThis: function(name, prop) { // -C?
		
		if (prop.x === undefined) prop.x = 0;
		if (prop.y === undefined) prop.y = 0;
		
		var x = this.real_x + prop.x * this.rpg.tile_w;
		var y = this.real_y + prop.y * this.rpg.tile_h;
		var new_x = x, new_y = y;
		if (prop.dir !== undefined) {
			var dir = prop.dir * this.rpg.tile_w;
			switch (this.direction) {
				case 'up': new_y = y - dir; break;
				case 'left': new_x = x - dir; break;
				case 'right': new_x = x + dir; break;
				case 'bottom': new_y = y + dir; break;
			}
		}
		
		this.rpg.setEventPrepared(name, {real_x: prop.move ? x : new_x, real_y: prop.move ? y : new_y});
		var event = this.rpg.addEventPrepared(name);
		
		if (prop.move) {
			event.real_x = new_x;
			event.real_y = new_y;
		}

		if (!event) return false;

	},
	
	
	// Private
	setPage: function(client) {
		var page_find = false;
		for (var i = this.pages.length-1 ; i >= 0 ; i--) {
			if (!page_find) {
				if (!this.pages[i].conditions) {
					this.currentPage = i;
					page_find = true;
				}
				else {
					var valid = true;
					var condition = this.pages[i].conditions;
					var j=1, switches = [];
					for (var key in condition) {
						if (/switch_[0-9]+/.test(key) && condition[key] != 0) {
							switches.push(condition[key]);
						}
					}
					if (switches.length > 0) {
						condition.switches = switches;
					}
					if (condition.switches !== undefined) {
						valid &= client.switchesIsOn(condition.switches);
					}
					if (condition.self_switch !== undefined && condition.self_switch != 0) {
						valid &= this.selfSwitchesIsOn(condition.self_switch, client);
					}
					if (condition.variable !== undefined && condition.variable != 0) {
						var _var = client.getVariable(condition.variable);
						var test_value = condition.variable_value;
						valid &= _var >= test_value;
					}
					if (condition.detection !== undefined && condition.detection != 0) {
						valid &= condition.detection == this.labelDetection;
					}
					if (valid) {
						this.currentPage = i;
						page_find = true;
					}
				}
			}
		}
		return page_find;
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
     * Experience points necessary for each level.
	 * @method makeExpList
	 * @param {Array} exp Array with the total experience required for each level. Example
	 * 	<pre>
			rpg.player.makeExpList([0, 0, 25, 65, 127, 215, 337, 449, 709, 974, 1302]);
		</pre>
		The first is the level 0. It is always 0. Level 1 is always 0 also. In the example, the maximum level is 10 and you have 1302 Exp.
    */
	/**
     * Experience points necessary for each level.
	 * @method makeExpList
	 * @param {Integer} basis Base value for calculing necessary EXP
	 * @param {Integer} inflation Percentage increase of necessary EXP
	 * @param {Integer} max_level (optional) Maximum level. Attribute "maxLevel" by default
	 * @return Array Array of experiences generated. Example :
	 * 	<pre>
			rpg.player.makeExpList(25, 30, 10);
		</pre>
		Returns : <br />
		<pre>
			[0, 0, 25, 65, 127, 215, 337, 499, 709, 974, 1302]
		</pre>
		Here is the calculation : <br />
		L(n) : level<br />
		B : basis<br />
		I : inflation<br />
		<br />
		pow = 2.4 * I / 100<br />
		L(n) = (B * ((n + 3) ^ pow) / (5 ^ pow)) + L(n-1)
    */
	makeExpList: function(expOrBasis, inflation, max_level) {
		max_level = max_level || this.maxLevel;
		if (expOrBasis instanceof Array) {
			this.exp = expOrBasis;
		}
		else {
			this.exp[0] = this.exp[1] =  0;
			var pow_i = 2.4 + inflation / 100.0;
			var n;
			for (var i=2 ; i <= max_level ; i++) {
				n = expOrBasis * (Math.pow((i + 3), pow_i)) / (Math.pow(5, pow_i));
				this.exp[i] = this.exp[i-1] + parseInt(n);
			}
		}
		return this.exp;
	},
	
	/**
     * Adds experience points. Changes level according to the experience points given. makeExpList() must be called before addExp()
	 * @method addExp
	 * @param {Integer} exp Experience points
	 * @return Integer see setExp()
    */
	addExp: function(exp, client) {
		client = client || this.rpg;
		client.call("addExp", [exp], this);
		return this.setExp(this.currentExp + exp, client);
	},
	
	/**
     * Fixed experience points. Changes level according to the experience points given. makeExpList() must be called before setExp()
	 * @method setExp
	 * @param {Unsigned Integer} exp Experience points. If EXP exceed the maximum level, they will be set at maximum
	 * @return Integer Difference between two levels gained or lost. For example, if the return is 2, this means that the event has gained 2 levels after changing its EXP
    */
	setExp: function(exp, client) {
		client = client || this.rpg;
		if (this.exp.length == 0) {
			throw "makeExpList() must be called before setExp()";
			return false;
		}
		var new_level;
		var current_level = this.currentLevel;
		this.currentExp = exp;
		for (var i=0 ; i < this.exp.length ; i++) {
			if (this.exp[i] > exp) {
				new_level = i-1;
				break;
			}
		}
		if (!new_level) {
			new_level = this.maxLevel;
			this.currentExp = this.exp[this.exp.length-1];
		}
		this.currentLevel = new_level;
		var diff_level = new_level - current_level;
		if (diff_level != 0) {
			client.call("changeLevel", [new_level, current_level], this);
			this._changeSkills();
		}
		return diff_level;
	},
	
	/**
     * Sets the level of the event. Fixed points depending on the level of experience assigned
	 * @method setLevel
	 * @param {Unsigned Integer} level Level
	 * @return Integer Difference between two levels gained or lost.
    */
	setLevel: function(level, client) {
		client = client || this.rpg;
		var old_level = this.currentLevel;
		this.currentLevel = level;
		if (this.exp.length > 0) this.currentExp = this.exp[level];
		client.call("changeLevel", [level, old_level], this);
		this._changeSkills(client);
		return level - old_level;
	},
	
	_changeSkills: function(client) {
		var s;
		for (var i=0 ; i <= this.currentLevel ; i++) {
			s = this.skillsByLevel[i];
			if (s && !this.skills[s.id]) {
				this.learnSkill(s, client);
			}
		}
	},
	
	/**
     * Sets a parameter for each level
	 * @method setParam
	 * @param {String} name Parameter name
	 * @param {Array} array Level Array with the parameter values for each level. The first element is always 0. Example:
		<pre>
			rpg.player.setParam("attack", [0, 622, 684, 746, 807, 869, 930, 992, 1053, 1115, 1176, 1238, 1299, 1361, 1422, 1484, 1545]);
		</pre>
		At Level 4, the player will have 807 points of attack
    */
	/**
     * Sets a parameter for each level
	 * @method setParam
	 * @param {String} name Parameter name
	 * @param {Integer} valueOneLevel Value at the first level
	 * @param {Integer} valueMaxLevel Value at the last level
	 * @param {String} curveType Type Curve :
		<ul>
			<li>proportional : Parameter increases in a manner proportional</li>
		</ul>
	 * @return {Array} Array generated. The array will be the size of "this.maxLevel + 1". Example :
	 <pre>
		rpg.player.maxLevel = 16; // Limits the maximum level to 16 for this example
		var param = rpg.player.setParam("attack", 622, 1545, "proportional");
		console.log(param);
	 </pre>
	 Displays :<br />
	 <pre>
		[0, 622, 684, 746, 807, 869, 930, 992, 1053, 1115, 1176, 1238, 1299, 1361, 1422, 1484, 1545, 1545]
	 </pre>
	 <br />
	 The first element is always 0
    */
	setParam: function(name, arrayOrLevelOne, valueMaxLevel, curveType) {
		if (!this.params[name]) {
			this.params[name] = [0];
		}
		if (arrayOrLevelOne instanceof Array) {
			this.params[name] = arrayOrLevelOne;
		}
		else {
			var ratio;
			if (curveType == "proportional") {
				ratio = (valueMaxLevel - arrayOrLevelOne) / (this.maxLevel - 1);
			}
			for (var i=1 ; i <= this.maxLevel ; i++) {
				this.params[name][i] = Math.ceil(arrayOrLevelOne + (i-1) * ratio);
			}
			this.params[name].push(valueMaxLevel);
		}
		return this.params[name];
	},
	
	setParamLevel: function(name, level, value) {
		if (this.params[name][level]) {
			this.params[name][level] = value;
		}
	},
	
	initParamPoints: function(type, current, min, max, callbacks) {
		this.paramPoints[type] = {
			current: current,
			min: min,
			max: max,
			callbacks: callbacks || {}
		};
	},
	
	changeParamPoints: function(type, nb, client) {
		client = client || this.rpg;
		if (!this.paramPoints[type]) {
			throw "Call the 'initParamPoints' before";
			return;
		}
		var current = this.paramPoints[type].current,
			max = this.paramPoints[type].max,
			min = this.paramPoints[type].min,
			callbacks = this.paramPoints[type].callbacks;
		if (typeof max === "string") {
			max = this.getCurrentParam(max);
		}
		current += nb;
		if (current <= min) {
			current = min;
			if (callbacks.onMin) callbacks.onMin.call(this);
		}
		else if (current >= max) {
			current = max;
			if (callbacks.onMax) callbacks.onMax.call(this);
		}
		this.paramPoints[type].current = current;
		client.call("changeParamPoints", [type, nb, current], this);
		return current;
	},
	
	/**
     * Get the value of a parameter at the current level of the event
	 * @method getCurrentParam
	 * @param {String} name Parameter name
	 * @return {Integer} Value
    */
	getCurrentParam: function(name) {
		return this.params[name][this.currentLevel];
	},
	
	/**
     * Equipping the event of an object. Useful for calculations of fighting
	 * @method equipItem
	 * @param {String} type Name type
	 * @param {String} name Item Name. Example :
	 <pre>
		Database.items = {
			"sword": {
				name: "Sword",
				type: "weapons", 
				id: 1,
				atk: 112
			}
		};
		rpg.addItem(Database.items["sword"]);
		rpg.player.equipItem("weapons", "sword");
	 </pre>
    */
	equipItem: function(type, name) {
		if (!this.itemEquiped[type]) {
			this.itemEquiped[type] = [];
		}
		this.itemEquiped[type].push(name);
	},
	
	/**
     * Whether an item is equipped
	 * @method itemIsEquiped
	 * @param {String} type Name type (See Rpg.addItem())
	 * @param {String} name Item Name
	 * @return {Boolean} true if equipped
    */
	itemIsEquiped: function(type, name) {
		if (this.itemEquiped[type][name]) {
			return true;
		}
		else {
			return false;
		}
	},
	
	/**
     * Remove an item equipped
	 * @method removeItemEquiped
	 * @param {String} type Name type (See Rpg.addItem())
	 * @param {String} name Item Name
	 * @return {Boolean} false if the object does not exist
    */
	removeItemEquiped: function(type, name) {
		if (!this.itemEquiped[type]) return false;
		delete this.itemEquiped[type][name];
		return true;
	},
	
	/**
     * Get all items equiped in a type
	 * @method getItemsEquipedByType
	 * @param {String} type Name type (See Rpg.addItem())
	 * @return {Array|Boolean} Returns an array of items. false if the type does not exist
    */
	getItemsEquipedByType: function(type) {
		if (!this.itemEquiped[type]) return false;
		return this.itemEquiped[type];
	},
	
	/**
     * Skills mastered at level-up for event
	 * @method skillsToLearn
	 * @param {Object|String} skills Skills. Key is the level and value is the identifier of skill. Example :
	 <pre>
		Database.skills = {
			"fire": {
				name: "Fire",
				id: 1,
				sp_cost: 75,
				power: 140,
				mdef_f: 100
				// [...]
			}
		};
		rpg.player.skillsToLearn({
			2: Database.skills["fire"] // Learn the skill #1 in level 2
		});
		// or 
		// rpg.player.skillsToLearn({
		// 		2:	"fire"
		// });
	 // </pre>
    */
	skillsToLearn: function(skills) {
		this.skillsByLevel = skills;
	},
	
	/**
     * Change the skill to learn for a specific level
	 * @method setSkillToLearn
	 * @param {Integer} level Level
	 * @param {Object|String} skill Properties of the skill or the name of the skill in "Database.skills"
    */
	setSkillToLearn: function(level, skill) {
		this.skillsByLevel[level] = skill;
	},
	
	/**
     * Change the class of the event
	 * @method setClass
	 * @param {String} name Class Name. If the class exists in "Database.classes" skills and elements can change. Example :
	 <pre>
		Database.classes = {
			"fighter": {
				name: "Fighter",
				id: 1,
				skills: {1: "fire", 3: "water"},	// See skillsToLearn()
				elements: {"thunder": 200}			// See setElements()
			}
		};
		rpg.player.setClass("Fighter");
	 </pre>
    */
	setClass: function(id, data, client) {
		client = client || this.rpg;
		if (data) {
			this.className = data.name;
			if (data.skills) this.skillsToLearn(data.skills);
			if (data.elements) this.setElements(data.elements);
		}
		else {
			var _class = client.getDatabase('classes', id);
			var _elements = {}, c;
			for (var i=0 ; i < _class._elements ; i++)  {
				c = _class._elements[i];
				_elements[c[0]] = c[1];
			}
			this.className = _class.name;
			this.setElements(_elements);
		}
	},
	
	/**
     * Fixed elements to the event
	 * @method setElements
	 * @param {Object} The different properties of elements
	 <pre>
		rpg.player.setElements({"thunder": 200, "water": 50});
	 </pre>
    */
	setElements: function(elements) {
		this.elements = elements;
	},
	
	/**
     * To learn a skill to the event
	 * @method learnSkill
	 * @param {Integer} id Skill ID
	 * @param {Object} prop Skill properties
    */
	/**
     * To learn a skill to the event
	 * @method learnSkill
	 * @param {String} name Name skill in "Database.skills". The data must have the property "id". Example :
	 <pre>
		Database.skills = {
			"fire": {
				name: "Fire",
				id: 1	// required
			}
		};
		rpg.player.learnSkill("fire");
	 </pre>
    */
	learnSkill: function(id, client) {
		client = client || this.rpg;
		var prop = client.getDatabase("skills", id);
		this.skills[id] = prop;
		client.call('learnSkill', [id, prop], this);
	},
	
	/**
     * Remove a skill
	 * @method removeSkill
	 * @param {Integer|String} id Skill ID. If it is a string, it will take the id in "Database.skills"
	 * @return {Boolean} true if deleted
    */
	removeSkill: function(id, client) {
		client = client || this.rpg;
		if (this.skills[id]) {
			delete this.skills[id];
			client.call('removeSkill', [id], this);
			return true;
		}
		else
			return false;
	},
	
	/**
     * Change the properties of a skill
	 * @method setSkill
	 * @param {Integer} id Skill ID.
	 * @param {Object} prop Skill properties
    */
	setSkill: function(id, prop) {
		for (var key in prop) {
			this.skills[id][key] = prop[key];
		}
	},
	
	/**
     * Get a skill under its id
	 * @method getSkill
	 * @param {Integer} id Skill ID.
	 * @return {Object|Boolean} Skill properties. false if the skill does not exist
    */
	getSkill: function(id) {
		return this.skills[id] ? this.skills[id] : false;
	},
	
	
	/**
     * Adds a state event that affects his ability to fight or his movement
	 * @method addState
	 * @param {Object|String} prop State property. If you use the Database object, you can only put the name of the state. The state must contain at least the following parameters:
		<ul>
			<li>id {Integer} : State ID</li>
			<li>onStart {Function} : Callback when the status effect begins. One parameter: the event affected</li>
			<li>onDuring {Function} (optional) : callback during the alteration of state. Two parameters : 
				<ul>
					<li>event {Event} : the event affected</li>
					<li>time (Integer} : The time frame from the beginning of the change of state</li>
				</ul>
			</li>
			<li>onRelease {Function} : Callback when the status effect is complete. Use the removeState() to leave the state altered. One parameter: the event affected</li>
		</ul>
		Example : 
	 <pre>
		Database.states = {
			"venom": {
				id: 1,							// required
				onStart: function(event) {		// required
					rpg.animations['Venom'].setPositionEvent(event);
					rpg.animations['Venom'].play();
				},
				onDuring: function(event, time) { 	// optional
					if (time % 50 == 0) {
						console.log("Lost 100 HP");
					}
					if (time % 150 == 0) {
						event.removeState("venom");
					}
				},
				onRelease: function(event) { 	// required
					console.log("phew !");
				}
			}
		};
		rpg.player.addState("venom");
	 </pre>
    */
	addState: function(id, client) {
		client = client || this.rpg;
		var self = this;
		var prop = client.getDatabase("states", id);
		prop.duringTime = 0;
		this.states.push(prop);
		client.call('addState', [prop], this);
		if (prop.on_release != 0) {
			var commands = client.getDatabase("common_events", prop.on_start, "commands");
			client.player.executeCommands(commands, client);
		}
		if (prop.on_during != 0) {
			var commands = client.getDatabase("common_events", prop.on_during, "commands");
			var interval = setInterval(_onDuring, 3000);
			
			function _onDuring() {
				prop.duringTime++;
				if (prop.duringTime < 5) {
					client.player.executeCommands(commands, client);
					if (prop.onDuring) {
						prop.onDuring(this, prop.duringTime);
					}
				}
				else {
					prop.duringTime = 0;
					self.removeState(id, client);
					clearInterval(interval);
				}
			}
			
		}
		if (prop.onStart) prop.onStart(this);
	},
	
	/**
     * Removes a state of the event
	 * @method removeState
	 * @param {Integer|String} id The identifier of the state. If you use the Database object, you can put the name of the state
    */
	removeState: function(id, client) {
		client = client || this.rpg;
		var prop = client.getDatabase("states", id);
		for (var i=0 ; i < this.states.length ; i++) {
			if (this.states[i].id == id) {
				// this.states[i].onRelease(this); // common event
				client.call('removeState', [this.states[i]], this);
				if (prop.on_release != 0) {
					var commands = client.getDatabase("common_events", prop.on_release, "commands");
					client.player.executeCommands(commands, client);
				}
				if (prop.onRelease) prop.onRelease(this);
				delete this.states[i];
				return;
			}
		}
	},
	
	/**
     * Whether a state is inflicted in the event
	 * @method stateInflicted
	 * @param {Integer|String} id The identifier of the state. If you use the Database object, you can put the name of the state
	 * @return {Boolean} true if inflicted
    */
	stateInflicted: function(id) {
		for (var i=0 ; i < this.states.length ; i++) {
			if (this.states[i].id == id) {
				return true;
			}
		}
		return false;
	},

}

for (var obj in p) { 
	interpreter[obj] = p[obj]; 
}

if (typeof(RPGJS) === "undefined") {
	exports._class = Event;
}