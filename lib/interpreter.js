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
 * @class Interpreter Create and interpret orders for events. The commands are in a array and read from left to right. You must use the method "nextCommand()" to move to the next command.
 * @author Samuel Ronce
 */
 

 function Interpreter() {
	this.currentCmd = {};
	this.tmpCommands = [];
	this.indent = 0;
	this.ignoreElse = [];
	this.preprogrammedCommands();
 }

 
 Interpreter.commandFunction = {};
/**
 * Add (or change) a command of events. The command is a string. The command in the event must be of the form:
	<pre>
		"name: json value"
	</pre>
	Example 1 :<br />
	<pre>
		"FOO: {'bar': 'hello'}"
	</pre>
	Example 2 :<br />
	<pre>
		"BAR: 10"
	</pre>
	Example 3 :<br />
	<pre>
		"TEST: {'one': 5, 'two': [9, 5], 'three': {'a': 10, 'b': 'yep'}}"
	</pre>
	<br />
	Note that single quotes are replaced by double quotes to have a valid JSON.
 * @method setCommand (alias addCommand)
 * @static
 * @param {String} name Command Name. Alphanumeric character, "?", "!" and "_"
 * @param {Function} _function Function called when the command is executed. The function of 3 parameters: <br />
	<ul>
		<li>params {Object} : The parameters sent when calling the command.</li>
		<li>event {Event} : The event in question</li>
		<li>name {String} : The command name</li>
	</ul>
	<br >
	The function should contain a line that calls the method "nextCommand()" on object "event"<br />
	<pre>
		event.nextCommand();
	</pre>
	<br />
	<br />
	<u>Example :</u> <br />
	A command in the event : <br />
	<pre>
		"commands": [
			"FOO: {'bar': 'hello'}"
         ]
	</pre>
	<br />Adding the command :<br />
	<pre>
		Interpreter.addCommand('FOO', function(params, event, name) {
			console.log(params.bar); 	// =>  "hello"
			console.log(name); 			// =>  "FOO"
			event.nextCommand();		// Always put the following line to jump to the next command
		});
	</pre>
	
*/
 Interpreter.setCommand = function(name, _function) {
	Interpreter.commandFunction[name] = _function;
 }
 Interpreter.addCommand = Interpreter.setCommand;
 
 Interpreter.prototype = {
 
	preprogrammedCommands: function() {
		var commands = {
			'CHANGE_GOLD': 				'cmdChangeGold',
			'SHOW_TEXT': 				'cmdShowText',
			'ERASE_EVENT': 				'cmdErase',
			'TRANSFER_PLAYER': 			'cmdTransferPlayer',
			'BLINK': 					'cmdBlink',
			'CALL': 					'cmdCall',
			'SHOW_ANIMATION': 			'cmdShowAnimation',
			'MOVE_ROUTE': 				'cmdMoveRoute',
			'SELF_SWITCH_ON': 			'cmdSelfSwitches',
			'SELF_SWITCH_OFF': 			'cmdSelfSwitches',
			'SWITCHES_ON': 				'cmdSwitches',
			'SWITCHES_OFF': 			'cmdSwitches',
			'SCREEN_FLASH': 			'cmdScreenFlash',
			'SCREEN_TONE_COLOR':		'cmdScreenColorTone',
			'SCREEN_SHAKE':				'cmdScreenShake',
			'VARIABLE':					'cmdVariables',
			'SET_EVENT_LOCATION':		'cmdSetEventLocation',
			'SCROLL_MAP':				'cmdScrollMap',
			'PLAY_BGM':					'cmdPlayBGM',
			'PLAY_BGS':					'cmdPlayBGS',
			'PLAY_ME':					'cmdPlayME',
			'PLAY_SE':					'cmdPlaySE',
			'STOP_SE':					'cmdStopSE',
			'FADE_OUT_MUSIC':			'cmdFadeOutMusic',
			'FADE_OUT_SOUND':			'cmdFadeOutSound',
			'RESTORE_MUSIC':			'cmdRestoreMusic',
			'MEMORIZE_MUSIC':			'cmdMemorizeMusic',
			'CHANGE_ITEMS':				'cmdChangeItems',
			'CHANGE_WEAPONS':			'cmdChangeItems',
			'CHANGE_ARMORS':			'cmdChangeItems',
			'CHANGE_LEVEL': 			'cmdChangeLevel',
			'CHANGE_EXP': 				'cmdChangeEXP',
			'CHANGE_STATE': 			'cmdChangeState',
			'CHANGE_CLASS': 			'cmdChangeClass',
			'CHANGE_SKILLS': 			'cmdChangeSkills',
			'CHANGE_NAME': 				'cmdChangeName',
			'CHANGE_CLASS': 			'cmdChangeClass',
			'CHANGE_GRAPHIC': 			'cmdChangeGraphic',
			'CHANGE_EQUIPMENT': 		'cmdChangeEquipment',
			'CHANGE_PARAMS': 			'cmdChangeParams',
			'CHANGE_HP': 				'cmdChangeParamPoints',
			'CHANGE_SP': 				'cmdChangeParamPoints',
			'RECOVER_ALL': 				'cmdRecoverAll',
			'SHOW_PICTURE': 			'cmdShowPicture',
			'MOVE_PICTURE': 			'cmdMovePicture',
			'ROTATE_PICTURE': 			'cmdRotatePicture',
			'ERASE_PICTURE': 			'cmdErasePicture',
			'CHANGE_WINDOWSKIN': 		'cmdChangeWindowskin',
			'DETECTION_EVENTS': 		'cmdDetectionEvents',
			'CALL_COMMON_EVENT': 		'cmdCallCommonEvent',
			'CALL_SYSTEM': 				'cmdCallSystem',
			'WAIT': 					'cmdWait',
			'SCRIPT': 					'cmdScript',
			'IF': 						'cmdIf',
			'ELSE':						'cmdElse'
		};
		
		for (var key in commands) {
			Interpreter.addCommand(key, commands[key]);
		}
	},
	
	/**
     * Get the next command from the command running
	 * @method getNextCommand
     * @return  Object Command data : {name: "....", params: "...."}. false if the command does not exist
    */
	getNextCommand: function(player_id) {
		return this.getCommand(this.getCurrentPos(player_id)+1);
	},
	
	/**
     * Get the previous command from the command running
	 * @method getPrevCommand
     * @return  Object Command data : {name: "....", params: "...."}. false if the command does not exist
    */
	getPrevCommand: function(player_id) {
		return this.getCommand(this.getCurrentPos(player_id)-1);
	},
	
	/**
     * Get the command running
	 * @method getCurrentCommand
     * @return  Object Command data : {name: "....", params: "...."}. false if the command does not exist
    */
	getCurrentCommand: function(player_id) {
		return this.getCommand(this.getCurrentPos(player_id));
	},
	
	getCurrentPos: function(player_id) {
		if (!this.currentCmd[player_id]) this.setCurrentPos(player_id, 0);
		return this.currentCmd[player_id];
	},
	
	setCurrentPos: function(player_id, val) {
		this.currentCmd[player_id] = val;
	},

	
	/**
     * Get an command depending on its position
	 * @method getCommand
	 * @param  {Integer} pos Position in the array of command
     * @return  Object Command data : {name: "....", params: "...."}. false if the command does not exist
    */
	getCommand: function(pos) {
		var cmd = this._command(pos);
		if (cmd) {
			return {name: cmd.name, params: cmd.params};
		}
		return false;
	},
	
	_command: function(pos) {
		var cmd = this.tmpCommands.length > 0 ? this.tmpCommands[pos] : this.commands[pos];
		if (cmd) {
			try {
				var match = /^([A-Z0-9a-z!?_]+):(.+)$/.exec(cmd);
				if (match != null) {
					var name = match[1];
					var params = match[2];
					var exec_cmd = Interpreter.commandFunction[name];
					if (exec_cmd) {
						if (params) {
							params = params.replace(/'/g, '"');
							params = JSON.parse(params);
							return {name: name, params: params, callback: exec_cmd};
						}
						else {
							throw name + " => Settings not found";
						}
					}
					else {
						throw name + " => Event commands nonexistent";
					}
				}
				else if (cmd == "ELSE" || cmd == "ENDIF") {
					return {name: cmd};
				}
				else {
					throw "\"" + cmd + "\" => Invalid command";
				}
			}
			catch (error) {
				if (/ILLEGAL$/.test(error)) {
					error = "\"" + cmd + "\" => Invalid parameters";
				}
				console.log(error);
			}
		}
		return false;
	},
 
	onCommands: function(rpg) {
		var cmd = this._command(this.getCurrentPos(rpg.player.id));
		var send;
		if (cmd) {
			 send = cmd.params.send || "this";
		}
		if (cmd) {
			var params = this[cmd.callback](cmd.params, this, rpg, cmd.name);
			params = params || cmd.params;
			params.prevCmd = this.getPrevCommand(rpg.player.id);
			params.nextCmd = this.getNextCommand(rpg.player.id);
			rpg.send(send, "eventInterpreter", {params: params, func: cmd.callback, event_id: this.id, player_id: rpg.player.id});
			if (cmd.name == "SHOW_TEXT") {
				rpg.plugin('_menu').callScene(params.menu_id);
			}
		}
		else {
			this.setCurrentPos(rpg.player.id, 0);
			if (this.trigger == 'parallel_process' || this.trigger == 'auto') {
				if (this.rpg.getEventById(this.id) != null) {
					//this.onCommands(rpg);
				}
			}
			this.tmpCommands = [];
			this.currentEvent = null;
			rpg.send("this", "eventInterpreter", {func: "_onCmdFinish", event_id: this.id});
		}
	},
	
	executeCommands: function(commands, client) {
		this.tmpCommands = commands;
		this.onCommands(client);
	},
 
	/**
     * Execute the next command
	 * @method nextCommand
    */
	nextCommand: function(rpg) {
		this.setCurrentPos(rpg.player.id, this.getCurrentPos(rpg.player.id)+1);
		this.onCommands(rpg);
	},
	
	/**
     * Stop playback controls event
	 * @method commandsExit
    */
	commandsExit: function(rpg) {
		this.currentCmd[rpg.player.id] = -2;
	},
	
	// ------------- Event preprogrammed commands -----------------
	
	// Private
	cmdShowText: function(params, self, client) {
		
		var prevCmd = self.getPrevCommand();
		var nextCmd = self.getNextCommand();
		var text = params.text;
		var regex = /%V\[([0-9]+)\]/g;
		var match = regex.exec(text);
		
		while (match != null) {	
			text  = text.replace(match[0], client.getVariable(match[1]));
			match = regex.exec(text);
		}
		
		params.menu_id = client.getDatabase("_scenes", params.dialog, "menu_id");
		params.text = self.rpg.toLang(text);

		return params;
		
		/*var dialog = self.dialog ? self.dialog : new Scene_Dialog(self.rpg);
		dialog.window.clear();
		dialog.window.drawText(20, 30, text, "18px Arial", "#FFF");
		dialog.onExit = function() {
			self.nextCommand();
		};
		var keys = [Input.Space, Input.Enter];
		Input.press(keys, function(e) {
			if (nextCmd.name != "SHOW_TEXT") {
				Input.clearKeys(keys);
				new Effect(dialog.content).fadeOut(5, function() {
					dialog.exit();
					delete self.dialog;
				});
			}
			else {
				self.dialog = dialog;
				self.nextCommand();
			}
		});*/
	},
	
	// Private
	cmdErase: function(params, self, client) {
		client.removeEvent(self.id);
		this.commandsExit(client);
		this.nextCommand(client);
	},
	
	// Private
	cmdSwitches: function(switches, self, client, name) {
		client.setSwitches(switches.id, name == 'SWITCHES_ON');
	},
	
	// Private
	cmdSelfSwitches: function(self_switches, self, client, name) {
		self.setSelfSwitch(self_switches.id, name == 'SELF_SWITCH_ON', client);
	},
	
	// Private
	cmdChangeGold: function(params, self, client) {
		var gold = self._getValue(params, client);
		client.changeGold(gold);
	},
	
	// Private
	cmdMoveRoute: function(dir, self, client) {
		var current_move = -1;
		nextRoute();
		function nextRoute() {
			current_move++;
			if (dir.move[current_move] !== undefined) {
				switch (dir.move[current_move]) {
					case 2:
					case 4:
					case 6:
					case 8:
					case 'up':
					case 'left':
					case 'right':
					case 'bottom':
						self.move(dir.move, function() {
							nextRoute();
						}, true, client);
					break;
					case 'step_backward':
						self.moveAwayFromPlayer(function() {
							nextRoute();
						}, true, client);
					break;
				}
			}
			else {
				//self.animation('stop');
				
			}
		}
		
		
	},
	
	// Private
	cmdShowAnimation: function(anim, self) {
		return anim;
	},

	// Private
	cmdTransferPlayer: function(map, self, client) {
		var pos = {
			x: map.x,
			y: map.y,
			id: map.name
		};
		if (map['position-type'] == "constant") {
			pos = {
				x: map.appointement.x,
				y: map.appointement.y,
				id: map.appointement.id
			};
		}
		else if (map['position-type'] == "variables") {
			pos.id = map.appointement.id;
		}
		if (map['position-type']) {
			map.name = "MAP-" + pos.id;
		}
		var m = client.getPreparedMap(map.name);
		if (m) {
			if (!m.properties.player) m.properties.player = {};
			m.properties.player.x = pos.x;
			m.properties.player.y = pos.y;
			client.callMap(map.name);
			
		}
		
	},
	
	cmdBlink: function(prop, self, client) {
		return prop;
	},
	
	cmdCall: function(call, self, client) {
		client._onEventCall[call].call(self);
		return call;
	},
	
	cmdScreenFlash: function(param, self) {
		return param;
	},
	
	cmdScreenColorTone: function(param, self) {
		return param;
	},
	
	cmdScreenShake: function(param, self) {
		return param;
	},
	

	cmdVariables: function(param, self, client) {
		var operand = param.operand;
		var operand_val;
		if (typeof operand == "object") {
			if (operand instanceof Array) {
				operand_val = Math.floor(Math.random() * (operand[1] - operand[0])) + operand[0];
			}
			else if (operand.variable !== undefined) {
				operand_val = client.getVariable(operand.variable);
			}
			
		}
		else {
			operand_val = operand;
		}
		client.setVariable(param.id, operand_val, param.operation);
	},
	
	cmdSetEventLocation: function(param, self, client) {
		var target = self._target(param.event, client);
		var x, y;
		if (param['position-type'] == "constant" && param.appointement) {
			x = param.appointement.x;
			y = param.appointement.y;
		}
		else if (param['position-type'] == "variables") {
			x = client.getVariable(param.x);
			y = client.getVariable(param.y);
		}
		else if (param['position-type'] == "other_event") {
			var other_event = self._target(param.other_event, client);
			x = other_event.x;
			y = other_event.y;
			other_event.setPosition(client, target.x, target.y);
		}
		if (param.direction) target.direction = param.direction;
		target.setPosition(client, x, y);
	},
	
	cmdScrollMap: function(param, self) {
		self.rpg.scroll(param.x, param.y);
		self.nextCommand();
	},
	
	cmdWait: function(param, self) {
		self.wait(param.frame, param.block, function() {
			self.nextCommand();
		});
	},
	
	cmdPlayBGM: function(params, self, client) {
		return self._cmdPlayMusic(params, self, client);
	},
	
	cmdPlayBGS: function(params, self, client) {
		return self._cmdPlayMusic(params, self, client);
	},
	
	cmdPlayME: function(params, self, client) {
		return self._cmdPlayMusic(params, self, client);
	},
	
	cmdPlaySE: function(params, self, client) {
		return self._cmdPlayMusic(params, self, client);
	},
	
	cmdStopSE: function(params, self, client) {
		return params;
	},
	
	cmdFadeOutMusic: function(params, self, client) {
		return params;
	},
	
	cmdFadeOutSound: function(params, self, client) {
		return params;
	},
	
	cmdMemorizeMusic: function(params, self, client) {
		return params;
	},
	
	cmdRestoreMusic: function(params, self, client) {
		return params;
	},
	
	_cmdPlayMusic: function(params, self, client) {
		return client.getDatabase("_materials", params.id, "path");
	},
	
	cmdChangeItems: function(params, self, client, name) {
		var operand, operation, id, type, db;

		operand = self._getValue(params, client);
		
		switch (name) {
			case "CHANGE_WEAPONS": type = "weapons";
			case "CHANGE_ARMORS": type = "armors";
			default: type = "items"
		}
		id = params.id;
		
		db = client.getDatabase(type, params.id);
	
		if (operand >= 0) {
			client.addItem(type, id, db, operand);
		}
		else {
			client.removeItem(type, id, db, Math.abs(operand));
		}
	},
	
	cmdChangeLevel: function(params, self, client) {
		var operand = self._getValue(params, client);
		client.player.addExp(operand);
	},
	
	cmdChangeEXP: function(params, self, client) {
		var operand = self._getValue(params, client);
		client.player.setLevel(operand);
	},
	
	cmdChangeParams: function(params, self, client) {
		var operand = self._getValue(params, client);
		client.player.setParamLevel(params.param, client.player.currentLevel, operand);
	},
	
	cmdChangeParamPoints: function(params, self, client, name) {
		var operand = self._getValue(params, client), type;
		switch (name) {
			case "CHANGE_HP": type = "hp"; break;
			case "CHANGE_SP": type = "sp"; break;
		}
		client.player.changeParamPoints(type, operand);
	},
	
	cmdRecoverAll: function(params, self, client) {
		var points = [
			["hp", "maxhp"], 
			["sp", "maxsp"]
		], max;
		for (var i=0 ; i < points.length ; i++) {
			max = client.player.getCurrentParam(points[i][1]);
			client.player.changeParamPoints(points[i][0], max);
		}
	},
	
	cmdChangeSkills: function(params, self, client) {
		if (params.operation == "increase") {
			client.player.learnSkill(params.skill);
		}
		else {
			client.player.removeSkill(params.skill);
		}
	},
	
	cmdChangeName: function(params, self, client) {
		var db = client.getDatabase("actors", params.actor);
		db.name = params.name;
		client.setDatabase("actors", params.actor, db);
	},
	
	cmdChangeClass: function(params, self, client) {
		client.player.setClass(params['class']);
	},
	
	cmdChangeGraphic: function(params, self, client) {
		var graphic = client.getDatabase("_materials", params.graphic, "path");
		client.player.character_hue = graphic;
		return graphic;
	},
	
	cmdChangeEquipment: function(params, self, client) {
		var operand = params['operand-type'], type;
		if (operand == "weapons") {
			type = "weapons";
		}
		else {
			type = "armors";
		}
		var current = client.player.getItemsEquipedByType(type);
		client.player.removeItemEquiped(type, current);
		client.player.equipItem(type, params.operand);
	},
	
	cmdChangeState: function(params, self, client) {	
		if (params.operation == "increase") {
			client.player.addState(params.state);
		}
		else {
			client.player.removeState(params.state);
		}
		
	},
	
	_valuePicture: function(params, client) {
		if (params['operand-type'] == 'variables' || params.variables) {
			params.x = client.getVariable(params.x);
			params.y = client.getVariable(params.y);
		}
		params.filename = client.getDatabase("_materials", params.filename, "path");
		params.opacity /= 255;
		return params;
	},
	
	cmdShowPicture: function(params, self, client) {
		return self._valuePicture(params, client);
	},
	
	cmdMovePicture: function(params, self, client) {
		return self._valuePicture(params, client);
	},
	
	cmdRotatePicture: function(params, self) {
		return params;
	},
	
	cmdErasePicture: function(id, self) {
		return params;
	},
	
	cmdDetectionEvents: function(params, self) {
		self.detectionEvents(params.area, params.label);
		self.nextCommand();
	},
	
	cmdCallCommonEvent: function(params, self, client) {
		var commands = client.getDatabase("common_events", params.name, "commands");
		var pos = this.getCurrentPos(client.player.id);
		var prev = this.commands.slice(0, pos-1),
			next = this.commands.slice(pos+1, this.commands.length-1);
		this.commands = prev.concat(commands, next);
	},
	
	cmdCallSystem: function(params, self, client) {
		var menu_id = client.getDatabase("_scenes", params.menus, "menu_id");
		client.plugin('_menu').callScene(menu_id);
	},
	
	cmdScript: function(params) {
		return params.text;
	},
	
	cmdIf: function(params, self) {
		var condition = params.condition || "equal";
		var result = false;
		if (params["switch"]) {
			result = self.rpg.switchesIsOn(params["switch"]);
		}
		self.ignoreElse.push(self.indent);
		if (result) {
			self.nextCommand();
		}
		else {
		
		}
	},
	
	cmdElse: function(params, self) {
		var pos;
		if (self.rpg.valueExist(self.ignoreElse, self.indent)) {
			self.currentCmd = self._nextRealPos();
		}
		self.nextCommand();
	
	},

	
	_nextRealPos: function() {
		var pos = self.currentCmd+1;
		var nofind = true;
		var cmd, indent = self.indent;
		/*while (nofind) {
			cmd = self.getCommand(pos);
			if (cmd.name == "IF") {
				indent++;
			}
			else if (cmd.name == "ELSE" && indent == self.indent) {
				
			}
			else if (cmd.name == "ENDIF") {
				if (indent == self.indent) {
					return pos;
				}
				indent--;
			}
			pos++;
		}*/
	},
	
	// Private
	_getValue: function(params, client) {
		var operand, _var;
		if (params.variable || params['operand-type'] == "variables") {
			_var = params.variable || params.operand;
			operand = client.getVariable(_var);
		}
		else {
			operand = params.constant || params.operand;
		}
		return operand * (params.operation == "decrease" ? -1 : 1);
	},
	
	// Private
	_target: function(target, client) {
		var _target = this;
		if (target) {
			if (target == 'Player' || target == 'player') {
				_target = client.player;
			}
			if (target == 'this') {
				_target = this;
			}
			else {
				_target = client.getEventById(target);
				if (_target) _target = _target.event;
			}
		}
		return _target;
	},
	
	_actor: function(target, client) {
		return client.getDatabase("actors", target);	
	}
}

if (typeof(RPGJS) === "undefined") {
	exports._class = Interpreter;
}