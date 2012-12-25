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
 * @class Rpg
 * @author Creative5 - Samuel Ronce
 * @version 2
 */

var Cache, DataLink, DataServer = {};
if (typeof(RPGJS) === "undefined") {
	DataLink = require('socket.io');
	Cache = require('./cache.js')._class;
	Event = require('./event.js')._class;
	Player = require('./player.js')._class;
	Function = require('./function.js')._class;
}

function Rpg(socket, listen) {

	if (socket) {
		this.socket = socket;
	}
	else {
		this.socket = DataLink;
	}
	this.datalink = DataLink;
	
	// -- Canvas
	
	// this.fps;
	this.func_trigger = {};
	this.currentLang;
	
	// -- Maps
	this.maps = [];
	this.currentMapInfo = {};
	
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
	
	// this.mapData;
	

	// this.mapClick;

	 /**
     * Event List. Each element is an object "Event"
	 * @property events
     * @type Array
     */
	
	this.typeDirection = 'normal';
	
	
	this.items = {};
	this.skills = {};
	this.events = [];
	this.eventsCache = [];
	
	// -- Player
	/**
     * Object "Player". Properties player
	 * @property player
     * @type Player
    */
	this.player;
	
	
	
	this.tile_w = 32;
	this.tile_h = 32;
	this.nb_autotiles = 64;
	
	// -- Pictures
	this.pictures = {};
	
	
	
	
	// -- System
	this._battleFormulas = {};
	
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
	//this.windowskinDefault = '001-Blue01.png';
	//this.currentWindows = [];
	
	this.actions = {};
	
	this.plugins = {};
	this.database = {};
	
	this._onUpdate = function() {};
	this._onEventCall = {};
	
	// -- Battle
	// this.tactical;
	this.tacticalMap = [];
	// this.actionBattle;
	this.initialize(socket);
}


Rpg.dataServer = {};

Rpg.tile_w = 32;
Rpg.tile_h = 32;


Rpg.prototype = {
	
	// Constructor
	initialize: function(socket) {
	
		if (socket) {
			this._disconnect();
		}
					
		// this._setMouseEvent(div);
		
					
		
	},
	
	initDatabase: function(Database) {
		this.database = Database;
	},

	getDatabase: function(type, id, param) {
		if (!id) {
			return this.database[type];
		}
		else if (!param) {
			return this.database[type][id];
		}
		if (this.database[type][id] === undefined) {
			return false;
		}
		return this.database[type][id][param];
	},
	
	setDatabase: function(type, id, param) {
		this.database[type][id] = param;
	},
	
	initPlugin: function(Plugins) {
		for (var key in Plugins) {
			this.addPlugin(key, new Plugins[key]());
		}
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
     * Refresh events. Helps restore the properties of the right page in the event
	 * @method eventsRefresh
    */
	eventsRefresh: function() {
		var i;
		for (i=0 ; i < this.events.length ; i++) {
			this.events[i].refresh(this);
		}
	},
		
	/**
     * Passage of the tile
	 * @method tilePassage
     * @param {Integer} tile_id Tile ID
	 * @return {Integer} Passage. For example, 2 means that the player (or event) can only pass on the tile down. There may be a combination in hexadecimal. The tile is entirely feasible if the value is 0 or 16
    */
	tilePassage: function(tile_id) {
		if (tile_id < this.nb_autotiles * 48) {
			tile_id = Math.floor(tile_id / 48) * 48;
		}
		if (this.mapData.propreties[tile_id] === undefined) {
			return 0;
		}
		return this.mapData.propreties[tile_id][1];
	},
	
	/**
     * Whether the X and Y position on the map is passable or not.
	 * @method isPassable
     * @param {Integer} x X position
     * @param {Integer} y Y Position
     * @param {Integer} dir (Optional) Direction (Not implemented yet)
	 * @return {Boolean} Return true if the position is passable. Everything depends on the tile. If the tile with the highest priority is fair, then the player (or event) can walk on it even if a tile lowest level is not fair. For example:<br />
	 [10, null, 5]<br />
	 If tile ID 10 is not fair but the 5 is. The player can still walk on it. Otherwise, the player will be blocked even if the tile is passable ID 10
    */
	isPassable: function(x, y, dir, event) {
	     var i;
		if (x < 0 || y < 0 || x >= this.currentMap.length || y >= this.currentMap[0].length) return false;
		//TODO: This is where the tile checking happens
		var tiles = this.currentMap[x][y];
		var passage, priority;
		switch (dir) {
			case "top":
			case "up": dir = 8; break;
			case "right": dir = 6; break;
			case "bottom": dir = 2; break; // 0x01
			case "left": dir = 4; break;
			default: dir = 0;
		}
		var bit;
		for (i=2 ; i >= 0 ; i--) {
			if (tiles[i] != null) {
					passage = this.tilePassage(tiles[i]);
					priority = this.tilePriority(tiles[i]);
					bit = (1 << (dir / 2 - 1)) & 0x0f;
					if (passage != 0 && passage != 16 && passage != 64) {
						if ((passage & bit) != 0) {
							if (!event) {
								return false;
							}
							var rx = x * this.tile_w;
							var ry = y * this.tile_h;
							var t = new Area([
								[rx, ry],
								[rx + this.tile_w, ry],
								[rx + this.tile_w, ry + this.tile_h],
								[rx, ry + this.tile_h]
							]);
							return !event.collisionPoints.test(t);
						}
					}
					else if (priority == 0) {
						return true;
					}
			}
		}
		return true;
	},
	
	tilePriority: function(tile_id) {
		if (tile_id < this.nb_autotiles * 48) {
			tile_id = Math.floor(tile_id / 48) * 48;
		}
		if (this.mapData.propreties[tile_id] === undefined) {
			return 0;
		}
		return this.mapData.propreties[tile_id][0];
	},
	
	/**
     * Prepares map data. You can then load the card with the method "callMap"
	 * @method prepareMap
     * @param {String} filename Filename
     * @param {Object} propreties Map Properties. See the method "loadMap"for more information
     * @param {Function} isLoad (Optional) Callback Function when the map is loaded
    */
	prepareMap: function(filename, propreties, isLoad) {
		this.maps.push({name: filename, propreties: propreties, callback: isLoad});
	},
	
	/**
     * Obtain the properties of a map prepared
	 * @method getPreparedMap
     * @param {String} name Map name
     * @return {Object|Boolean} return an object: <br />
		{ <br />
			name: Map name (and file) <br />
			propreties: propreties of the map (See the method "loadMap"for more information)<br />
			callback: Function when the map is loaded<br />
		}<br />
		Return false if no map is found.
    */
	getPreparedMap: function(name) {
		var i;
		for (i=0 ; i < this.maps.length ; i++) {
			if (this.maps[i].name == name) {
				return this.maps[i];
			}
		}
		return false;
	},
	
	/**
     * Change the properties of a map
	 * @method setPreparedMap
     * @param {String} name Name of map affected by the change
     * @param {Object} propreties Map Properties. See the method "loadMap"for more information
     * @param {Function} callback (Optional) Callback Function when the map is loaded
     * @return {Boolean} Return false if no map is found.
    */
	setPreparedMap: function(name, propreties, callback) {
		var map = this.getPreparedMap(name);
		if (map) {
			map.propreties = propreties;
			if (callback) map.callback = callback;
			return true;
		}
		return false;
	},
	
	/**
     * Call a map prepared with the function "prepareMap"
	 * @method callMap
     * @param {String} name Name calling map
     * @return {Boolean} Return false if no map is found.
    */
	callMap: function(name) {
		var map = this.getPreparedMap(name);
		if (map) {
			this.loadMap(name, map.propreties, map.callback);
			return true;
		}

		return false;
	},
	
	
	
	
	
	/**
     * Load a map with properties
	 * @method loadMap
     * @param {String|Object} filename Name of file in the folder "Data/Maps". File format: JSON. We can define a custom path if the parameter is an object :
		<ul>
			<li>path {String} : Link to map</li>
			<li>noCache {Boolean} (optional): if true, the map data is not cached. "false" by default</li>
		<ul>
		Example :
		<pre>
			rpg.loadMap({path: "../dir/map.php", noCache: true}, {tileset: "town.png"}, function() {
				console.log("the map is loaded");
			});
		</pre>
     * @param {Object} propreties Map Properties. The object is :
				<ul>
				<li>tileset (Optional if map encoded in base64): {String} Name of file in the folder "Graphics/Tilesets",</li>
				<li>autotiles (Optional): Array Autotiles. The values ​are the names of files in the folder "Graphics/Autotiles". Each image is divided into 48 tiles with a specific ID,</li>
				<li>bgm (Optional): {String|Object} Background music that plays automatically. If object : {mp3: "name", ogg: "name"}</li>
				<li>bgs (Optional): {String|Object} Background sound that plays automatically. If object : {mp3: "name", ogg: "name"}</li>
				<li>events (Optional):  {Array|Object} Array of events to load. The values are the names of files in the "Data/Events". We can define a custom path if the element is an object :
					<ul>
						<li>path {String} : Link to event</li>
						<li>noCache {Boolean} (optional): if true, the event data is not cached. "false" by default</li>
					<ul>
					Example :
					<pre>
						rpg.loadMap("map", {tileset: "town.png", events: {path: "dir/event.php"}}, function() {
							console.log("the map is loaded");
						});
					</pre>
				</li>
				<li>autoDisplay (optional) : {Boolean} Directly displays the map after it is loaded. If false, see the method "displayMap()" to display the map manually. true by default</li>
				<li>transfert (optional) : {Array} Transfer a player to another map when he arrives at a specific position. Array containing objects of each tile transferable :
				<ul>
					<li>x: {Integer} X starting position for the transfer</li>
					<li>y: {Integer} Y starting position for the transfer</li>
					<li>map: {String} Map name</li>
					<li>x_final: {Integer} X position of arrival</li>
					<li>y_final: {Integer} Y position of arrival</li>
					<li>dx (optional): {Integer} Number of horizontal tiles that can transfer the player</li>
					<li>dy (optional): {Integer} Number of vertical tiles that can transfer the player</li> 
					<li>parallele (optional): {Boolean} Each tile transfer the player on the same coordinates X or Y</li>
					<li>direction (optional): {String} up|bottom|left|right The direction of the player to be able to transfer</li>
					<li>callback (optional): {Function} Callback function before transferring to another map. If the function returns false, the player will not be transferred.</li>
				</ul>
				</li>
				<li>player (Optional):  {Object} Properties player :
					<ul>
							<li>x {Integer}: X Position</li>
							<li>y {Integer}: Y Position</li>
							<li>direction (optional) {String} : up|bottom|left|right; Departure Direction</li>
							<li>filename {String} : Filename</li>
							<li>regX (optional): {Integer} The x offset for this display object's registration point.</li> 
							<li>regY (optional): {Integer} The y offset for this display object's registration point</li>
							<li>speed (optional) : {Integer} Speed</li>
							<li>nbSequenceX (optional) {Integer}: Sequence number of the image on the X axis</li>
							<li>nbSequenceY (optional) {Integer}: Sequence number of the image on the Y axis</li>
							<li>speedAnimation (optional) {Integer}: Animation speed</li>
							<li>no_animation (optional) {Boolean}: Don't display the animation</li>
							<li>actionBattle (optional): {Object} see "addEvent()"</li>
							<li>actions (optional) {Array}: Actions (see "addActions()")</li>
					</ul></li>
     * @param {Function} isLoad (Optional) Callback Function when the map is loaded
    */
	loadMap: function(filename, propreties, isLoad, load) {
		var self = this;
		var autotiles_array = [];
		var i, j, k, l;
		
		if (typeof filename != "string") {
			propreties.customPath = true;
			propreties.noCache = filename.noCache;
			filename = filename.path;
		}
		
		
		this._onUpdate = function() {};
		
		function progressLoad() {
			Cache._progressLoadData("server", function() {
				self.call("loadMap", false);
				if (isLoad) isLoad.call(self);
			});
		}
		
		
		
		
		
		// Auotiles
		//Cache.totalLoad += (propreties.autotiles ? propreties.autotiles.length : 0);
		// Graphics Characters Player
		//Cache.totalLoad += (propreties.player ? 1 : 0);
		
		
	/*	this.clearMap();
		
		
		
		propreties.autoDisplay = propreties.autoDisplay === undefined ? true : propreties.autoDisplay;
		
		
		*/
		
		// Ajax Map
		Cache.totalLoad['server'] = 1;
		// Ajax Event
		if (!DataServer[filename]) {
			Cache.totalLoad['server'] += (propreties.events ? propreties.events.length : 0);
		}
		
		
		
		Cache.map(filename, function(data) {
			if (self.currentMapInfo.name) {
				self.removeEvent(self.player.id, true);
				self.socket.leave(self.currentMapInfo.name);
			}
			self.socket.join(filename);
			
			var p;
			var new_prop = {};
			if (propreties.autotiles && !(propreties.autotiles instanceof Array)) {
				for (var i=0 ; i < propreties.autotiles.propreties.length ; i++) {
					new_prop[i * 48] = propreties.autotiles.propreties[i];
				}
				propreties.autotiles = propreties.autotiles.graphics;
			}
			if (typeof propreties.tileset != "string") {
				p = propreties.tileset.propreties;
				if (p instanceof Array) {
					
					for (var i=0 ; i < p.length ; i++) {
						//if (p[i].length > 0) {
							if (!p[i][0]) p[i][0] = 0;
							if (!p[i][1]) p[i][1] = 0;
							new_prop[self.nb_autotiles * 48 + i] = p[i];
						//}
					}
					data.propreties = new_prop;
				}	
				delete propreties.tileset.propreties;
				propreties.tileset = propreties.tileset.graphic;
			}
			
			self.maps.push({name: filename, propreties: propreties, callback: isLoad});
			self.currentMapInfo = {name: filename, propreties: propreties};
			self.events = [];
		
		
			self.mapData = data;
			propreties.filename = filename;
			
			self.send("this", "loadMap", {
				propreties: propreties,
				map_data: data
			});
			self.currentMap = data.map;
			

			if (!DataServer[filename]) {
				DataServer[filename] = [];
			}
			
			var event, nocache, custompath, path;
				//if (propreties.events) {
					if (propreties.events && !Function.isArray(propreties.events)) {
						path = propreties.events.path;
						custompath = true;
						nocache = propreties.events.noCache;
						propreties.events = [path];
					}

					if (DataServer[filename].length == 0) {
						if (propreties.events) {
							for (i=0 ; i < propreties.events.length ; i++) {
								event = propreties.events[i];
								preloadEvent(event);
							}
						}
					}
					else {
						for (i=0 ; i < DataServer[filename].length ; i++) {
							event = DataServer[filename][i];
							event.setCharacterHue(self, true);
							self.events.push(event);
						}
					}
				//}
				
				if (!self.player) {
					self.player = new Player(propreties.player, self);
				}
				else {
					self.player.setCharacterHue(self, true, true);
				}
				
				if (load && load.player) {
					for (var key in load.player) {
						self.player[key] = load.player[key];
					}
					propreties.player.x = load.player.x;
					propreties.player.y = load.player.y;
					self.player.freeze = false;
				}
				self.player.setPosition(this, propreties.player.x, propreties.player.y);
				if (propreties.transfert) {
					self.player.setTransfert(propreties.transfert);
				}
				self.player.inTransfert = false;
				DataServer[filename].push(self.player);
				
				
				/*var player_event = new Event();
				
				for (var obj in self.player) { 
					console.log(obj);
					player_event[obj] = self.player[obj]; 
				} */
				
				
				
				function preloadEvent(event) {
					Cache.event(event, function(prop) {
						/*if (prop[1][0].character_hue) {
							Cache.characters(prop[1][0].character_hue, function() {
								loadEvent(prop, event);
								progressLoad();
							});
						}
						else {
							
							// progressLoad();
						}*/
						loadEvent(prop, event);	
						
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
						event = new Event(prop, new Rpg(), self, true);
						DataServer[filename].push(event);
					}
					//self.events.push(event);
				}
				
				progressLoad();
			
			
		}, propreties.customPath, propreties.noCache);
		
		
		// Rpg.dataServer
		

			// function graphicPlayerLoad() {
				
				// self.setCamera(self.player.x, self.player.y);
				// self.player.fixCamera(true);
				// self.player.setTransfert([]);
				// if (propreties.transfert) {
					// self.player.setTransfert(propreties.transfert);
				// }
				// self.player.inTransfert = false;
				// progressLoad();
			// }
			
			/*if (propreties.player) {
				if (!self.player) {
					Cache.characters(propreties.player.filename, function() {
						graphicPlayerLoad();
					});
					
				}
				else {
					graphicPlayerLoad();
					
				}	
			} */


				
					

			
			/*
			
			if (map_data.layer1) {
				var onfinish = Cache.loadFinish;
				Cache.loadFinish = undefined;
				onfinish();
				progressLoad();
			}
			else {
				Cache.tilesets(propreties.tileset, function() {
					progressLoad();
				});
			}*/
			
		

	},
	
	getPlayerById: function(id) {
		var p = DataServer[this.currentMapInfo.name];
		for (var i=0 ; i < p.length ; i++) {
			if (p[i].id == id) {
				return p[i];
			}
		}
		return false;
	},
	
	/**
     * Get the event in its identifier
	 * @method getEventById
     * @param {Integer} id
	 * @return {Event} The event
    */
	getEventById: function(id) {
		return this._getEvent('id', {id: id});
	},
	
	/**
     * Get the event in his name
	 * @method getEventByName
     * @param {String} name
	 * @return {Event} The event
    */
	getEventByName: function(name) {
		return this._getEvent('name', {name: name});
	},
	
	/**
     * Get the event in its positions
	 * @method getEventByPosition
     * @param {Integer} x Position X
     * @param {Integer} y Position Y
     * @param {Boolean} multi Return an array of events to the position. Otherwise, the first event found to be returned
	 * @return {Event|Array} The event or an array of event
    */
	getEventByPosition: function(x, y, multi) {
		return this._getEvent('position', {x: x, y: y, multi: multi});
	},
	
	// Private
	_getEvent: function(by, params) {
		var i,
			array_event = [],
		events = this.events;
		for (i=0; i < events.length ; i++) {
			switch (by) {
				case 'name':
					if (events[i].name && events[i].name == params.name) {
						return events[i];
					}
				break;
				case 'id': 	
					if (events[i].id && events[i].id == params.id) {
						return {seek: i, event: events[i]};
					}
				break;
				case 'position': 
					if (events[i].x == params.x && events[i].y == params.y) {
						if (params.multi) {
							array_event.push(events[i]);
						}
						else {
							return events[i];
						}
					}
				break;
			}
		}
		if (by == "position") {
			return array_event;
		}
		return false;
	},
	
	/**
     * Remove an event
	 * @method removeEvent
     * @param {Integer} id Event ID
     * @return {Boolean} true if the event has been deleted
    */
	removeEvent: function(id, player) {
		if (!player) {
			var obj = this.getEventById(id);
			this.events.splice(obj.seek, 1);
		}
		var server;
		for (var i=0 ; i < DataServer[this.currentMapInfo.name].length ; i++) {
			server = DataServer[this.currentMapInfo.name][i];
			if (server.id == id) {
				DataServer[this.currentMapInfo.name].splice(i, 1);
				break;
			}
		}
		this.send("currentMap", "removeEvent", {id: id});	
	},
	
	/**
     * Set the screen on an object (player, event, mouse ...)
	 * @method setScreenIn
     * @param {String} obj Put "Player" to set the screen on the player
    */
	/*setScreenIn: function(obj) {
		this.targetScreen = obj;
	}, */

	/**
     * Assigns a function to trigger. For example, 
			<pre>
			rpg.bind('changeGold', function(gold) {
				alert("New amount : " + gold);
			});
			</pre>
	   The trigger "changeGold" is called when the amount of money is changed and displays the amount added or removed
	 * @method bind
     * @param {String} name Name trigger. Existing trigger :
	<ul>
		<li>changeGold: called when changing the amount of money</li>
		<li>update: called every frame</li>
		<li>eventCall_{Custom name} : Function called by the order of events "call". For example, the command event "CALL: 'foo'" calls function "EvenCall_foo (event)"</li>
		<li>changeVariable : called when the value of a variable is changed</li>
		<li>setScreen : called when the camera is placed on the map</li>
		<li>removeEvent : called when an event is deleted</li>
		<li>changeVolumeAudio : called when the sound volume is changed</li>
		<li>screenFlash : called when a flash on the screen is made</li>
		<li>screenShake : called when the screen shakes</li>
		<li>changeScreenColorTone : called when the tone of the screen changes</li>
		<li>addPicture : called when adding an image on the screen</li>
		<li>movePicture : called when you move an image on the screen</li>
		<li>rotatePicture : called when the image rotates</li>
		<li>erasePicture : called when an image is deleted</li>
		<li>addItem : called when an item is added</li>
		<li>removeItem : called when an item is removed</li>
		<li>selfSwitch : called when a local switch is on or off</li>
		<li>learnSkill : called when an event is learning a skill</li>
		<li>removeSkill : called when an event to forget a skill</li>
		<li>addState : called when an event gets a change of state</li>
		<li>removeState : called when an event loses a change of state</li>
		<li>addExp : called when an event gains experience</li>
		<li>changeLevel : called when an event changes its level</li>
		<li>eventDetected : called when an event detect other events around him</li>
		<li>eventContact : called when there is contact between an event and other event (or player)</li>
	</ul>
* @param {Function} func Function call. Parameters for triggers :
	<ul>
		<li>changeGold:  {Integer} gold Amount of money</li>
		<li>update: {Void}</li>
		<li>eventCall_{Custom name} : {Event} </li>
		<li>changeVariable : {Integer} The identifier of the variable </li>
		<li>setScreen : {Object} position
			<ul>
				<li>x {Integer} : Position X</li>
				<li>y {Integer} : Position Y</li>
			</ul>
		</li>
		<li>removeEvent : {Integer} The identifier of the event </li>
		<li>changeVolumeAudio : {Void}</li>
		<li>screenFlash : {Object} params
			<ul>
				<li>color {String} : color (hexadecimal)</li>
				<li>speed {Integer} : speed</li>
			</ul>
		</li>
		<li>screenShake : {Object} params
			<ul>
				<li>power {String} : power</li>
				<li>speed {Integer} : speed</li>
				<li>duration {Integer} : duration in frames</li>
				<li>axis {String} : "x", "y" or "xy"</li>
			</ul>
		</li>
		<li>changeScreenColorTone : {Object} params
			<ul>
				<li>color {String} : color (hexadecimal)</li>
				<li>speed {Integer} : speed</li>
				<li>composite {String} : "lighter"  or "darker"</li>
				<li>opacity {Integer} : current opacity</li>
			</ul>
		</li>
		<li>addPicture : {Object} params
			<ul>
				<li>id {Integer}</li>
				<li>filename {String}</li>
				<li>propreties {Object} : see "addPicture()"</li>
			</ul>
		</li>
		<li>movePicture : {Object} params
			<ul>
				<li>id {Integer}</li>
				<li>duration {Integer}</li>
				<li>propreties {Object} : see "addPicture()"</li>
			</ul>
		</li>
		<li>rotatePicture : {Object} params
			<ul>
				<li>id {Integer}</li>
				<li>duration {Integer}</li>
				<li>value {Integer|String} : "loop" or value in degrees</li>
			</ul>
		</li>
		<li>erasePicture : {Integer} id</li>
		<li>addItem : {Object} params
			<ul>
				<li>type {String}</li>
				<li>id {Integer}</li>
				<li>propreties {Object} : see "addItem()"</li>
			</ul>
		</li>
		<li>removeItem : {Object} params
			<ul>
				<li>type {String}</li>
				<li>id {Integer}</li>
			</ul>
		</li>
		<li>selfSwitch : {Object} params
			<ul>
				<li>event {Event} : current event</li>
				<li>id {Integer} : local switch id</li>
				<li>enable {Boolean}</li>
			</ul>
		</li>
		<li>learnSkill : {Object} params
			<ul>
				<li>event {Event} : current event</li>
				<li>id {Integer} : skill id</li>
				<li>prop {Object} : see "learnSkill()" in Event class</li>
			</ul>
		</li>
		<li>removeSkill : {Object} params
			<ul>
				<li>event {Event} : current event</li>
				<li>id {Integer} : skill id</li>
			</ul>
		</li>
		<li>addState : {Object} params
			<ul>
				<li>event {Event} : current event</li>
				<li>prop {Object} : see "addState()" in Event class</li>
			</ul>
		</li>
		<li>removeState : {Object} params
			<ul>
				<li>event {Event} : current event</li>
				<li>prop {Object} : see "addState()" in Event class</li>
			</ul>
		</li>
		<li>addExp : {Object} params
			<ul>
				<li>event {Event} : current event</li>
				<li>exp {Integer} : Experience points</li>
			</ul>
		</li>
		<li>changeLevel : {Object} params
			<ul>
				<li>event {Event} : current event</li>
				<li>new_level {Integer} : New Level</li>
				<li>old_level {Integer} : Old Level</li>
			</ul>
		</li>
		<li>eventDetected : {Object} params
			<ul>
				<li>src {Event} : current event</li>
				<li>events {Array} : Array of events</li>
			</ul>
		</li>
		<li>eventContact : {Object} params
			<ul>
				<li>src {Event} : current event</li>
				<li>target {Array} : Array of events</li>
			</ul>
		</li>
	</ul>
			
    */
	bind: function(name, func) {
		this.func_trigger[name] = func;
	},
	
	/**
     * Called a trigger
	 * @method call
     * @param {String} name Name trigger
	 * @param {Object} params Parameter of the function assigned	
	 * @return {Object} Function value
    */
	call: function(name, params, instance, callListener) {
		// if (this.func_trigger[name] != undefined) {
			// return this.func_trigger[name](params);
		// }
		callListener = callListener === undefined ? true : callListener;
		if (typeof params == "boolean" && !params) {
			callListener = false;
			params = [];
		}
		var p;
		if (!(params instanceof Array)) {
			params = [params];
		}
		if (!instance) instance = this;
		for (var i in this.plugins) {
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
		if (callListener) this.send("this", "callListener", {name: name, data: params});
	},
	
	/**
     * Add Action. The player can make an action when pressed a button and changing the appearance of the hero. Events can have a share. For example, you can specify that gives the hero a sword when the A button is pressed
	 * @method addAction
     * @param {String} name Name action
	 * @param {Object} prop Action Properties :<br />
			<ul>
				<li>action: {String} 'attack'|'defense'|'wait' State action. Useful for real-time combat</li>
				<li>suffix_motion: {Array} The array elements are strings. Each string is the suffix of the current image to call. For example, if the image of the event is "Hero.png"and the suffix "_SWD" action will load the image "Hero_SWD.png" and display it on the map. When the movement of the action is completed, the appearance of the event will return to "Hero.png"</li>
				<li>multiple_motion (Optional): {Object} Not implemented yet</li>
				<li>duration_motion (Optional) : {Integer} Duration of the movement. The duration is the number of times the movement is repeated</li>
				<li>block_movement (Optional): {Boolean} During the action, the move is blocked</li>
				<li>animations (Optional): {Object|String} The animation is displayed at the beginning of motion in a direction : {left : "",  right: "", bottom: "", up"}</li>
				<li>animation_finish (Optional): {String} Animation is displayed at the end of the action</li>
				<li>wait_finish (Optional): {Integer} Wait Time frame before reuse of the action</li>
				<li>keypress (Optional): {Array} Keys that must be pressed to initiate action. For example: [Input.A]</li>
				<li>keydown (Optional): {Array} Event keydown (See keypress)</li>
				<li>keyup (Optional): {Array} Event keyup (See keypress)</li>
				<li>condition (Optional): {Function} If the function return false, the action will not be performed</li>
				<li>onFinish (Optional): {Function} Callback when the action is over</li>
				<li>onStart (Optional): {Function} Callback when the action begins</li>
			</ul>
    */
	addAction: function(name, prop) {
		this.actions[name] = prop;
		var prop_render =  {
			suffix_motion: prop.suffix_motion,
			duration_motion: prop.duration_motion,
			block_movement: prop.block_movement,
			wait_finish: prop.wait_finish,
			animation_finish: prop.animation_finish,
			animations: prop.animations,
			speed: prop.speed,
			keypress: prop.keypress
		};
		this.send("this", "addAction", {
			name: name,
			prop: prop_render
		});
	},
	
	/**
     * Add an event
	 * @method addEvent
     * @param {Array} prop Properties of events. The array has 2 entries :<br />
		<br />
		[Object, Array]
		<br />
		The first value is the overall properties of the event. His name and positions :<br />
		<ul>
			<li>name (Optional) : {String} Event Name</li>
			<li>x (Optional): {Integer} X Position</li>
			<li>y (Optional): {Integer} Y Position</li>
			<li>real_x (Optional): {Integer} Real position X (pixels)</li>
			<li>real_y (Optional): {Integer} Real position Y (pixels)</li>
			<li>id (Optional) : {Integer} ID. A random id is generated if this property is not specified</li>
		</ul>
			<br />
		The second value is the pages of the event. It's always the last page is called when the event is charged only if the existing condition is true. Each page is of type Object and has the following properties :<br />
			<ul>
			<li>character_hue (Optional): {String} Appearance. The image is in the "Graphics/Characters"</li>
			<li>trigger: {String} action_button|contact|event_touch|parallel_process|auto|auto_one_time Trigger condition controls the event:
				<ul>
					<li>action_button: In support of a key when the player is next to the event</li>
					<li>contact : When the player makes contact with the event</li>
					<li>event_touch : When the event comes into contact with the player</li>
					<li>parallel_process : AutoPlay loop but does not block the player</li>
					<li>auto : AutoPlay loop and block the player</li>
					<li>auto_one_time: AutoPlay once and hangs the player</li>
				</ul>
			</li>
			<li>direction (Optional): {String} up|bottom|left|right Branch Event</li>
			<li>speed (Optional): {Integer} Speed of movement. The higher the number, the higher the speed is great</li>
			<li>direction_fix (Optional): {Boolean} The appearance does not change when the direction changes</li>
			<li>frequence (Optional): {Integer} Frequency of movement. The higher the frequency is low, the movement is more fluid</li>
			<li>no_animation (Optional) : {Boolean} No animation even when the direction changes</li>
			<li>stop_animation (Optional) : {Boolean} Animated stationary</li>
			<li>through (Optional): {Boolean} The player can walk on the event.</li>
			<li>type (Optional): {String} fixed|random|approach Movement Type
				<ul>
					<li>fixed (default): Do not move</li>
					<li>random: Randomizer</li>
					<li>approach: Approaches the player</li>
				</ul>
			</li>
			<li>commands: {Array} Table of commands that will execute the event. See "http://rpgjs.com/wiki/index.php?title=Event_commands" to the possibilities</li>
			<li>conditions: {Object}  Conditions for the page is executed. If false, it is the previous page to be executed 
				<ul>
					<li>switches (Optional): IDs of switches that must be activated</li>
					<li>self_switch (Optional): The ID of the event gives the switches that must be activated</li>
				</ul>
			</li>
			<li>tactical (Optional): {Object} If the tactical mode is activated when the event is part of the system
				<ul>
					<li>play: {String} player|cpu Indicates whether the event can be played by the play or the computer</li>
					<li>move: {Integer} Number of square displacement,</li>
					<li>hp_max: {Integer} Number of points of maximum life</li>
				</ul>
			</li>
			<li>action_battle (Optional): {Object} If the real-time combat is enabled, the event will be an enemy
				<ul>
					<li>area:  {Integer} Detection area (number of squares)</li>
					<li>hp_max: {Integer} Number of points of maximum life</li>
					<li>params (optional): {Object} The parameters for the fight. see "Event.setParams()"
					Value constant :<br />
					Example :
						<pre>
							"params": {
								"attack": 100,
								"defense": 95
							}
						</pre>
					If the value is an array. The parameter value will be the current level (Array forms a curve proportional)<br />
					Example :  
						<pre>
							"params": {
								"attack": [100, 300],
								"defense": 95
							}
						</pre>
					</li>
					<li>level (optional) {Integer} : Starting level</li>
					<li>maxLevel (optional) {Integer} : Level max</li>
					<li>expList (optional) {Object} : Formation of a experience curve. See "Event.expList()". Elements :
						<ul>
							<li>basis: {Integer}</li>
							<li>inflation: {Integer}</li>
						</ul>
					</li>
					<li>items (optional) {Object} : Items equipped. See "Event.equipItem()". Elements :
						Example:
						<pre>
							"items": {
								"weapons": ["sword"]
							}
						</pre>
					</li>
					<li>skillsToLearn (optional) {Object} To learn the skills by level. See "Event.skillsToLearn()"
						Example :
						<pre>
							"skillsToLearn": {
								"2": "fire"
							}
						</pre>
					</li>
					<li>class (optional) {String} : Name of the class. If existing properties "skillsToLearn" and "elements" will be ignored. See "Event.setClass()"</li>
					<li>elements (optional) {Object} : Couple of key / value. The key is the name of the element and the value of the percentage allocation of the element. If existing properties "skillsToLearn" and "elements" will be ignored. See "Event.setElements()"</li>
					<li>states (optional) {Array} : The status effects to perform on the event. The array elements are the names of states. See "Event.addState()"</li>
					<li>animation_death: {String} Animation when the event is death (Name of the animation),</li>
					<li>ennemyDead: {Array} Events left on the ground after the death of the event. Each element is an object :
						<ul>
							<li>name: {String} Event name</li>
							<li>probability: {Integer}. Probability that the event leaves an object. Number between 0 and 100</li>
							<li>call (optional): {String}. Function called in the properties of "setActionBattle"</li>
						</ul>
					<li>
					<li>actions (optional): {Array}. Array of actions in the event (see "addAction)</li>
					<li>detection (optional): Function called in the properties of "setActionBattle"</li>
					<li>nodetection (optional): Function called in the properties of "setActionBattle"</li>
					<li>attack (optional): Function called in the properties of "setActionBattle"</li>
					<li>affected (optional): Function called in the properties of "setActionBattle"</li>
					<li>offensive (optional): Function called in the properties of "setActionBattle"</li>
					<li>passive (optional): Function called in the properties of "setActionBattle"</li>
				</ul>
			</li>
			</ul>
				<br />
				To understand the functions, see "setEventMode"
		
		<br />		
		Example :<br />	
		<pre>
			[
			{
				"name": "pnj",
				"x": 11,
				"y": 8
			},
			[	
				{
					"character_hue: "Lancer.png",
					"trigger: "action_button",
					"direction: "bottom",
					"commands": [
						"SHOW_TEXT: 'Hello'",
						"SELF_SWITCH_ON: [1]"
						
					]
				},
				
				{
					"conditions": {"switches": [1]},
					"character_hue: "Lancer.png",
					"trigger: "action_button",
					"direction: "bottom",
					"commands": [
						"SHOW_TEXT: 'Bye'",
						"SELF_SWITCH_OFF: [1]"
					]
				}
				
			]
		]
		</pre>
	* @return {Event} The event added 
    */
	addEvent: function(prop) {
		var event = new Event(prop, new Rpg(), this, true);
		//DataServer[this.currentMapInfo.name].push(event);	
		//event.setCharacterHue(this, true);
		this.events.push(event);
		return event;
	},
	
	pushEvent: function(event) {
		this.events.push(event);
	},
	
	/**
     * Add an event taking its properties into a file (Ajax Request). The file must be in "Data/Events". See "addEvent" for properties
	 * @method addEventAjax
     * @param {String} name Filename (without extension)
	 * @param {Function} callback Callback when the event is responsible. 
    */
	addEventAjax: function(name, callback) {
		var self = this;
		Cache.event(name, function(event) {
			self.addEvent(event);
			if (callback) callback(event);
		});		
	},
	
	/**
     * Add an event prepared on the map
	 * @method addEventPrepared
     * @param {String} name Event Name
	 * @return {Event|Boolean} The event added. false if nonexistent event
    */
	addEventPrepared: function(name) {
		var event = this.getEventPreparedByName(name);
		if (event != null) {
			return this.addEvent(event);
		}
		return false;
	},
	
	/**
     * Get the properties of an event prepared
	 * @method getEventPreparedByName
     * @param {String} name Event Name
	 * @return {Event} Event. null if no event found
    */
	getEventPreparedByName: function(name) {
		for (var i=0; i < this.eventsCache.length ; i++) {
			if (this.eventsCache[i][0].name == name) {
				return this.eventsCache[i];
			}
		}
		return null;
	},
	
	/**
     * Change the properties of an event prepared
	 * @method setEventPrepared
     * @param {String} name Event Name
     * @param {Object} propreties Properties (see "addEvent")
     * @param {Integer} page (optional) If indicated, you can edit the page properties
    */
	setEventPrepared: function(name, propreties, page) {
		var event = this.getEventPreparedByName(name);
		var val;
		if (event != null) {
			for (var key in propreties) {
				val = propreties[key];
				if (page) {
					event[1][page][key] = val;
				}
				else {
					event[0][key] = val;
				}
			}
		}
	},
	
	/**
     * Prepare an event. The properties of the event are stored. The event can then be added as many more on the map.
	 * @method prepareEvent
     * @param {Object} event Properties (see "addEvent")
    */
	prepareEvent: function(event) {
		this.eventsCache.push(event);
		
	},
	
	/**
     * Prepare an event in the file "Data/Events" (see "prepareEvent")
	 * @method prepareEventAjax
     * @param {String} name Filename
     * @param {Function} (optional) callback Callback
    */
	prepareEventAjax: function(name, callback) {
		var self = this;
		Cache.event(name, function(event) {
			self.prepareEvent(event);
			if (callback) callback(event);
		});	
	},
	
	

	/**
     * Call commands event of an event
	 * @method callCommandsEvent
     * @param {Event} event Event
     * @param {Function} load (optional) Callback when commands are completed
     * @param {Boolean} freeze (optional) Block the movement of the player if true
    */
	callCommandsEvent: function(event, onFinishCommand, freeze) {
		var self = this;
		var can_freeze = freeze && this.player;
		if (can_freeze) this.player.freeze = true;	
		event.bind('onFinishCommand', function() {
			if (can_freeze) self.player.freeze = false;
			if (onFinishCommand) onFinishCommand();
		});
		event.onCommands();
	},

	
	
	/**
     * Save game data : Variables, Switches, Self switches (event),  Information of the current map, Current events and Player
	 * @method save
     * @param {Integer} (optional) slot If available, the game will be saved locally (localStorage). his name will be "ID of the canvas" + '-' + slot". slot is the placement of the save
     * @return String JSON. You can get the save for registered other way (eg Ajax request)
    */
	save: function(slot) {
		var save = {};
		save.switches = this.switches;
		save.variables = this.variables;
		save.selfSwitches = Cache.events_data;
		save.gold = this.gold;
		save.map = this.currentMapInfo;
		save.events = [];
		save.items = this.items;
		var obj, event, i;
		for (i=0 ; i < this.events.length ; i++) {
			event = this.events[i];
			obj = dataEvent(event);
			save.events.push(obj);
		}
	
		if (this.player) save.player = dataEvent(this.player);
		
		function dataEvent(event) {
			var obj = {};
			var exclus = ["htmlElements", "eventsContact"];
			for (var key in event) {
				var _typeof = typeof event[key];
				if ((_typeof == "number" ||
					_typeof == "string" ||
					_typeof == "boolean" ||
					event[key] instanceof Array) && exclus.indexOf(key) == -1) {
					obj[key] = event[key];
				}
			}
			return obj;
		}

		var json_save = JSON.stringify(save);
		
		if (slot && localStorage) {
			localStorage[this.canvas.id + '-' + slot] = json_save;
		}
		return json_save;
	},
	
	/**
     * Load the game data. Reset Map
	 * @method load
     * @param {String|Integer} JSON to load or number of the slot. If this is the slot number, the data will be sought locally (localStorage)
     * @param {Function} (optional) Callback when the data and the map are loaded
    */
	load: function(jsonOrSlot, onLoad) {
		var json;
		if (typeof jsonOrSlot == "number") {
			json = localStorage[this.canvas.id + '-' + jsonOrSlot];
			if (!json) {
				return false;
			}
		}
		else {
			json = jsonOrSlot;
		}
		var load = JSON.parse(json);
		this.switches = load.switches;
		this.variables = load.variables;
		this.items = load.items;
		Cache.events_data = load.selfSwitches;
		this.gold = load.gold;
		this.loadMap(load.map.name, load.map.propreties, onLoad, load);
	},
	
	/**
     * Checks if an existing save (localStorage)
	 * @method slotExist
     * @param {Integer} slot_id Id slot defined with the method "save"
     * @return {Boolean} true if existing
    */
	slotExist: function(slot_id) {
		return localStorage[this.canvas.id + '-' + slot_id] ? true : false;
	},
	
	/**
     * Deletes a save (localStorage)
	 * @method deleteSlot
     * @param {Integer} slot_id Id slot defined with the method "save"
     * @return {Boolean} true if deleted
    */
	deleteSlot: function(slot_id) {
		if (this.slotExist(slot_id)) {
			localStorage.removeItem(this.canvas.id + '-' + slot_id);
			return true;
		}
		return false;
	},
	
	
	
	/**
     * Adds an item in the player's inventory. You can use the Database object to store object properties. Example :
		<pre>
			Database.items = {
				"potion": {
					name: "Potion",
					description: "Restores HP to player.",
					price: 50,
					consumable: true,
					animation: "Use Item",
					recover_hp: 500,
					hit_rate: 100
				}
			};
			rpg.addItem("items", 1, Database.items["potion"]);
		</pre>
		or 
		<pre>
			Database.items = {
				"potion": {
					name: "Potion",
					type: "items", 	// required
					id: 1 			// required
				}
			};
			rpg.addItem(Database.items["potion"]);
		</pre>
	 * @method addItem
     * @param {String} type Item Type. Examples : "armors", "weapons", etc.
     * @param {Integer} id Unique Id of the item
     * @param {Object} prop Property of the item
    */
	addItem: function(type, id, prop, nb) {
		if (!nb) {
			nb = 1;
		}
		if (typeof type != "string") {
			prop = type;
			type = prop.type;
			id = prop.id;
		}
		if (!this.items[type]) this.items[type] = {};
		if (!this.items[type][id]) {
			prop.nb = 0;
		}
		prop.nb += nb;
		this.items[type][id] = prop;
		this.call('addItem', [type, id, prop, nb]);
	},
	
	/**
     * Removes an item from the inventory
	 * @method removeItem
     * @param {String} type Item Type. Examples : "armors", "weapons", etc.
     * @param {Integer} id Unique Id of the item
    */
	removeItem: function(type, id, nb) {
		if (!nb) {
			nb = 1;
		}
		if (!this.items[type][id]) return false;
		this.items[type][id].nb -= nb;
		if (this.items[type][id].nb <= 0) {
			delete this.items[type][id];
		}
		this.call('removeItem', [type, id, nb]);
	},
	
	/**
     * Changes the properties of the item
	 * @method setItem
     * @param {String} type Item Type.	See "addItem()"
     * @param {Integer} id Unique Id of the item
	 * @param {Object} prop Property of the item
    */
	setItem: function(type, id, prop) {
		for (var key in prop) {
			this.items[type][id][key] = prop[key];
		}
	},
	
	/**
     * Get object properties
	 * @method getItem
     * @param {String} type Item Type.	See "addItem()"
     * @param {Integer} id Unique Id of the item
     * @return {Object|Boolean} Property of the item or false if the item does not exist
    */
	getItem: function(type, id) {
		return this.items[type][id] ? this.items[type][id] : false;
	},
	
	/**
	 * Define the formulas of battle
	 * @method battleFormulas
     * @param {String} name Name of the formula of combat
     * @param {Function} fn Call function. Two parameters: the event source and the target event (see "battleEffect()")
     * @example 
		<pre>
		rpg.battleFormulas("attack", function(source, target) {
			var weapons = source.getItemsEquipedByType("weapons");
			var attack = 0;
			if (weapons[0]) attack = Database.items[weapons[0]].atk;
			var atk = attack - target.getCurrentParam("defense") / 2;
			return atk * (20 + source.getCurrentParam("str")) / 20;
		});
		</pre>
		Remember to set the parameters for the player and enemy (see "addEvent()"<br />
		<br />
		<b>Using the formulas of battle (<i>Documentation RPG Maker XP</i>) : </b><br />
		<cite>
			Normal attacks: <br />
			Power = A's attack power - (B's physical defense ÷ 2)<br />
			Rate = 20 + A's strength<br />
			Variance = 15 <br />
			Minimum force: 0 <br />
			Skills: <br />
			Skill's force is positive: <br />
			Force = Skill's force <br />
			 + (A's attack power × skill's attack power F ÷ 100)<br />
			 - (B's physical defense × skill's physical defense F ÷ 200) <br />
			 - (B's magic defense × skill's magic defense F ÷ 200) <br />
			<br />
			Minimum force: 0 <br />
			Skill's force is negative: <br />
			Force = Skill's force <br />
			Rate = 20 <br />
			 + (A's strength × skill's strength F ÷ 100) <br />
			 + (A's dexterity × skill's dexterity F ÷ 100) <br />
			 + (A's agility × skill's agility F ÷ 100) <br />
			 + (A's intelligence × skill's intelligence F ÷ 100) <br />
			Variance = Skill's variance <br />
			Items: <br />
			HP recovery amount is negative: <br />
			Force = - Amount of HP recovered <br />
			 - (B's physical defense × item's physical defense F ÷ 20) <br />
			 - (B's magic defense × item's magic defense F ÷ 20) <br />
			<br />
			Minimum force: 0 <br />
			HP recovery amount is positive: <br />
			Force = - Amount of HP recovered <br />
			Rate = 20<br />
			Variance = Item's variance <br />
			Damage = force × multiplier ÷ 20 × elemental modifier × critical modifier × defense modifier (± variance %)<br />
			<br />
			<br />
			Elemental modifier: The weakest of B's effective elements corresponding to the action's element(s).<br />
			A: 200%, B: 150%, C: 100%, D: 50%, E: 0%, F: -100%<br />
			Reduced by half if B's armor or state has a defending (opposing) element.<br />
			When there are more than one of the same defending elements, the damage may be halved multiple times. <br />
			Critical modifier: Equals 2 when the damage is positive and a critical hit is made. <br />
			Defense modifier: Equals 1/2 when the damage is positive and B is defending. 
		</cite>
	*/
	battleFormulas: function(name, fn) {
		if (typeof name == "string") {
			this._battleFormulas[name] = fn;
		}
		else {
			this._battleFormulas = name;
		}
	},
	
	/**
	 * Performs formulas of battle
	 * @method battleEffect
     * @param {String} name Name of the formula of battle
     * @param {Event} source The event source
     * @param {Event} target The event target
     * @return {Integer} The result of the formula
	 * @example
		In the function "setActionBattle()" :
		<pre>
			eventAffected: {
				_default: function(event) {
					var hp = rpg.battleEffect("attack", rpg.player, event);
					event.actionBattle.hp -= hp;
				}
			}
		</pre>
	 */
	battleEffect: function(name, source, target) {
		return this._battleFormulas[name](source, target);
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
     * Enable or disable switch
	 * @method setSwitches
     * @param {Array|Integer} switches switch ID (multiple switches if the type is an array)
     * @param {Boolean} bool On if true
    */
	setSwitches: function(switches, bool) {
		this._setDataValue('switches', switches, bool);
		this.call('changeSwitch', [switches, bool]);
	},
	
	/**
     * Store a value in a variable
	 * @method setVariable
     * @param {Array|Integer} key variable ID (multiple variables if the type is an array)
     * @param {Integer|String} operand variable value
     * @param {String} operation add|sub|mul|div|mod|set
		<ul>
			<li>add : Add</li>
			<li>sub : Subtract</li>
			<li>mul : Multiply</li>
			<li>div : Divide</li>
			<li>mod : Modulo</li>
			<li>set : Set (default)</li>
		</ul>
    */
	setVariable: function(key, operand, operation) {
		var i, _var;
		if (typeof key == "number") {
			key = [key];
		}
		for (i=0 ; i < key.length ; i++) {
			_var = this.getVariable(key[i]);
			switch (operation) {
				case 'add':
					_var += operand;
				break;
				case 'sub':
					_var -= operand;
				break;
				case 'mul':
					_var *= operand;
				break;
				case 'div':
					_var /= operand;
				break;
				case 'mod':
					_var %= operand;
				break;
				default:
					_var = operand;
			}
			this._setDataValue('variables', key[i], _var);
			this.call('changeVariable', key[i]);
			refresh();
		}
		
	},
	
	/**
     * Get a value in a variable
	 * @method getVariable
     * @param {Integer} key variable ID
     * @return {Integer} value variable value. 0 if variable noexistent
    */
	getVariable: function(key) {
		var value = this.variables[key];
		if (value === undefined) {
			value = 0;
		}
		return value;
	},
	
	// Private
	_setDataValue: function(type, key, value) {
		var i;
		var obj = type == 'variables' ? this.variables : this.switches;
		if (Function.isArray(key)) {
			for (i=0 ; i < key.length ; i++) {
				obj[key[i]] = value;
			}
		}
		else {
			obj[key] = value;
		}
		this.eventsRefresh();
	
	},
	
	
	
	// Private
	
	/**
     * Whether a switch is activated
	 * @method switchesIsOn
     * @param {Array|Integer} switches switch ID (multiple switches if the type is an array)
     * @return {Boolean} return true if the switch(es) is/are activated
    */
	switchesIsOn: function(switches) {
		var i;
		if (Function.isArray(switches)) {
			for (i=0 ; i < switches.length ; i++) {
				if (!this.switches[switches[i]]) {
					return false;
				}
			}
		}
		else {
			if (!this.switches[switches]) return false;
		}
		return true;
	},
	
		/**
     * Add or remove an amount of money
	 * @method changeGold
     * @param {Integer} gold Amount of money added (removed if negative number)
    */
	changeGold: function(gold) {
		this.gold += gold;
		this.call('changeGold', [gold]);
	},
	
	/**
     * Assigns a function to be called on each tick of the game
	 * @method onUpdate
     * @param {Function} func
    */
	onUpdate: function(func) {
		this._onUpdate = func;
	},
	
	/**
     * Assigns a function when the event command "CALL" is executed
	 * @method onEventCall
	 * @param name ID Identifying the function
	 * @param func Function
	 * @example 
		<pre>
			rpg.onEventCall("myevent", function() {
				this.move("left"); // "this" is the event called
			});
		</pre>
		In the event :
		<pre>
			[
				{
				  "x": 7,
				  "y": 6,
				  "id": "1",
				  "name": "EV001"
				},
				[
					{
						
						"character_hue": "133-Noble08.png",
						"pattern": 0,
						"trigger": "action",
						"direction": "bottom",
						"frequence": 16,
						"type": "fixed",
						"through": false,
						"stop_animation": false,
						"no_animation": false,
						"direction_fix": false,
						"alwaysOnTop": false,
						"speed": 4,
						"commands": [
						  "SHOW_TEXT: {'text': 'Hello'}",
						  "CALL: 'myevent'"
						]
					}
				]
			]
		</pre>
    */
	onEventCall: function(name, func) {
		this._onEventCall[name] = func;
	},

	
	/**
     * Sets the language of the game
	 * @method setLang
     * @param {String} lang ID of the language in "Database". Example :
	 <pre>
		Database.langs = {
			fr: {
					"YES": "Oui"
				},
			en: {
					"YES": "Yes"
				},
			es: {
					"YES": "Si"
				}
		};
		rpg.setLang("fr");
	 </pre>
    */
	setLang: function(lang) {
		this.currentLang = lang;
	},
	
	getCache: function() {
		return Cache;
	},
	
	/**
     * Convert a text in one language. The phrase to be translated must be between "%". Note: The translation can be applied to the command of events "SHOW_TEXT"
	 * @method toLang
     * @param {String} text The original text.
	 * @return String text converted. Exemple :
	 <pre>
		Database.langs = {
			fr: {
					"YES": "Oui"
				},
			en: {
					"YES": "Yes"
				},
			es: {
					"YES": "Si"
				}
		};
		rpg.setLang("fr");
		var text = "%YES%";
		text = rpg.toLang(text);
		console.log(text); // Displays "Oui"
	 </pre>
    */
	toLang: function(text) {
		if (!this.currentLang) {
			return text;
		}
		var regex = /%(.*?)%/g;
		var match = regex.exec(text);
		var lang = Database.langs[this.currentLang];
		while (match != null) {	
			text = text.replace(match[0], lang[match[1]]);
			match = regex.exec(text);
		}
		
		return text;
	},
	

	send: function(type, name, data) {
		switch (type) {
			case "this":
				this.socket.emit(name, data, "client");
			break;
			case "allWithoutThis":
				this.socket.broadcast.emit(name, data, "client");
			case "all":
				this.datalink.sockets.emit(name, data, "client");
			break;
			case "currentMap":
				this.datalink.sockets.in(this.currentMapInfo.name).emit(name, data, "client");
			break;
			case "currentMapWithoutThis":
				this.socket.broadcast.to(this.currentMapInfo.name).emit(name, data, "client");
			break;
		}
	},
	
	on: function(name, callback) {
		this.socket.on(name, callback, "server");
	},
	
	start: function(callback) {
		this.socket.on("start", callback, "server");
	},
	
	_disconnect: function() {
		var self = this;
		this.socket.on('disconnect', function() {
			self.removeEvent(self.player.id, true);
			if (self.callbackDisconnect) self.callbackDisconnect();
		});
	},
	
	disconnect: function(callback) {
		this.callbackDisconnect = callback;
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
		var self = this;
		plugin_class.rpg = this;
		plugin_class.render = {
			send: function(type, name, data) {
				var _data = {};
				_data.plugin_id = id;
				_data.plugin_func = name;
				_data.plugin_data = data;
				self.send(type, "callPlugin", _data);
			}
		}
		if (plugin_class.init) plugin_class.init();
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
	}

}


if (typeof(RPGJS) === "undefined") {
	exports.onConnect = function(listen, callback, params) {
		var app = require('http').createServer();
		app.listen(listen);
		DataLink = DataLink.listen(app);
		DataLink.sockets.on('connection', function(socket) {
			var rpg = new Rpg(socket);
			if (params) {
				if (params.database) rpg.initDatabase(params.database);
				if (params.plugins) rpg.initPlugin(params.plugins);
			}
			callback(rpg);
		});
		return Rpg;
	}
}