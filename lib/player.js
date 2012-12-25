/*
Copyright (C) 2011 by Samuel Ronce, (c) 2013 Willi Thiel

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
 * @class Player Add an event controllable: the player
 * @author Samuel Ronce
 * @author Willi Thiel (mail@willithiel.de)
 * @extends Event
 * @param {Object} prop See "addEvent" in Rpg.js
 * @param {Rpg} rpg Rpg class
 */

if ( typeof (RPGJS) === "undefined") {
  var Event = require('./event.js')._class;
}

function Player(prop, rpg) {
  if (!prop)
    return;
  var speed = prop.speed ? prop.speed : 8;
  rpg.setScrolling(speed);
  var margin = rpg.tile_w / 4;
  var prop_event = [{
    name : 'Player',
    x : prop.x,
    y : prop.y,
    real_x : prop.real_x,
    real_y : prop.real_y,
    regX : prop.regX,
    regY : prop.regY,
    actions : prop.actions
  }, [{

    graphic : prop.filename,
    direction : prop.direction ? prop.direction : 'bottom',
    trigger : 'player',
    no_animation : prop.no_animation,
    speed : speed,
    commands : [],
    collisionPoints : prop.collisionPoints || [[margin, rpg.tile_h / 2], [rpg.tile_w - margin, rpg.tile_h / 2], [rpg.tile_w - margin, rpg.tile_h], [margin, rpg.tile_h / 2]],
    action_battle : prop.actionBattle,
    nbSequenceX : prop.nbSequenceX,
    nbSequenceY : prop.nbSequenceY,
    speedAnimation : prop.speedAnimation
  }]];

  rpg.speedScrolling = speed;

  this.moveWithMouse = false;

  this._useMouse = false;
  this.moving = false;
  this.keypress = false;
  this.freeze = false;

  this.transfert = [];
  this.inTransfert = false;

  this.currentEvent = null;

  this.parent = Event;
  this.parent(prop_event, rpg, rpg, true, true);

  this._datalinks();

  this.setTypeMove("real");
  this.movementBlock = false;
  this.old_direction = this.direction;
}

var p = Player.prototype = new Event();

// Private
p.handleKeyPress = function() {
  var self = this;
  var action_id;

  for ( i = 0; i < this.actions.length; i++) {
    act = this.rpg.actions[this.actions[i]];
    if (act['keypress']) {
      action_id = this.actions[i];
      Input.press(act['keypress'], function(e) {
        self.action(action_id);
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

  if (this.movementBlock)
    return true;
  if (this.rpg.inAction)
    return false;

  for (var i = 0; i < this.rpg.currentWindows.length; i++) {
    if (this.rpg.currentWindows[i].blockMovement) {
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
/**
 * Raise an event next to the player and by his direction if the trigger fired
 * @method interactionEventBeside
 * @param {String} trigger Name of the trigger to make (action_button|contact)
 */
p.interactionEventBeside = function(e, trigger) {
  var i, event, self = this;
  if (e.length == 0) {
    return false;
  }
  for ( i = 0; i < e.length; i++) {
    event = e[i];
    if (event != null) {
      if (event.trigger == trigger) {
        this.rpg.send("currentMap", "eventCommand", {
          event_id : event.id,
          player_id : self.id
        });
        this.currentEvent = event;

        event.onCommands(this.rpg);
      }
    }
  }
  return true;

}

p.moveMouseTo = function(tile_x, tile_y, eventIgnore, callback) {
  var self = this;
  if ( typeof eventIgnore == "function") {
    callback = eventIgnore;
    eventIgnore = undefined;
  }
  var blockMovement = this.movementIsBlocked();
  if (this.freeze && blockMovement) {
    return;
  }
  if (this.x == tile_x && this.y == tile_y) {
    return;
  }

  var dir = this.pathfinding(tile_x, tile_y, eventIgnore);
  this.moveWithMouse = true;
  this.move(dir, function(passable) {
    self.moveWithMouse = false;
    if (!passable || !self.inAction) {
      self.animation('stop');
      if (callback)
        callback();
    }
  }, true);

}

p.triggerEventBeside = function() {
  var real_x = this.real_x;
  var real_y = this.real_y;
  switch(this.direction) {
    case 'up':
      real_y--;
      break;
    case 'right':
      real_x++;
      break;
    case 'left':
      real_x--;
      break;
    case 'bottom':
      real_y++;
      break;
  }
  var c = this.contactWithEvent(this.rpg, real_x, real_y);
  if (c.length > 0) {
    this.interactionEventBeside(c, 'action_button');
  }
}

p._transfert = function() {
  for (var i = 0; i < this.transfert.length; i++) {
    var dy = this.transfert[i].dy === undefined ? 0 : this.transfert[i].dy;
    var dx = this.transfert[i].dx === undefined ? 0 : this.transfert[i].dx;
    var direction = this.transfert[i].direction ? this.direction == this.transfert[i].direction : true;
    var transfert_y, transfert_x;
    if (dy < 0) {
      transfert_y = this.y >= this.transfert[i].y + dy && this.y <= this.transfert[i].y;
    } else {
      transfert_y = this.y >= this.transfert[i].y && this.y <= this.transfert[i].y + dy;
    }
    if (dx < 0) {
      transfert_x = this.x >= this.transfert[i].x + dx && this.x <= this.transfert[i].x;
    } else {
      transfert_x = this.x >= this.transfert[i].x && this.x <= this.transfert[i].x + dx;
    }
    if (transfert_y && transfert_x && !this.inTransfert && direction) {

      var map = this.rpg.getPreparedMap(this.transfert[i].map);
      if (map) {
        if (!map.properties.player)
          map.properties.player = {};
        map.properties.player.x = this.transfert[i].x_final + (this.transfert[i].parallele ? Math.abs(this.x - this.transfert[i].x) : 0);
        map.properties.player.y = this.transfert[i].y_final + (this.transfert[i].parallele ? Math.abs(this.y - this.transfert[i].y) : 0);
        var call = true;
        this.moving = false;
        //Input.keyBuffer = [];
        if (this.transfert[i].callback) {
          call = this.transfert[i].callback();
        }
        if (call) {
          this.inTransfert = true;
          this.rpg.callMap(map.name);
        }
        break;
      }
    }

  }
}

p.setTransfert = function(prop) {
  this.transfert = prop;
}

p._datalinks = function() {
  var self = this;
  this.rpg.on("movePlayer", function(data) {
    if (self.rpg.player.id == self.id) {
      self.move(data.dir, false, true, self.rpg);
      self._transfert();
    }
  });
  this.rpg.on("stopPlayer", function(data) {
    self.rpg.send("currentMapWithoutThis", "stop", {
      id : self.id
    });
  });
  this.rpg.on("triggerEventBeside", function(data) {
    if (self.rpg.player.id == self.id) {
      self.triggerEventBeside();
    }
  });
  this.rpg.on("nextCommand", function(data) {
    if (self.rpg.player.id == self.id) {
      self.currentEvent.nextCommand(self.rpg);
    }
  });
  this.rpg.on("loadEvent", function(data) {
    var event = self.rpg.getEventById(data.id);
    if (!event) {
      event = self.rpg.getPlayerById(data.id);
    } else {
      event = event.event;
    }
    if (event) {
      event.onLoad(self.rpg);
    }
  });

    this.rpg.on("action", function(data) {
    if (self.rpg.player.id == self.id) {
      self.action(data.name, self.rpg);
    }
  });

  this.rpg.on("actionFinish", function(data) {
    self.actionFinish(data.name, self.rpg);
  });

};

if ( typeof (RPGJS) === "undefined") {
  exports._class = Player;
}
