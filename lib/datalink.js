/*function DataLink() {
	this.sprite.x = this.real_x = this.rpg._positionValueToReal(x, y).x;
		this.sprite.y = this.real_y = this.rpg._positionValueToReal(x, y).y;
		
		this.x = x;
		this.y = y;
		this._setPosition();

}
}

DataLink.on("setPosition", function(data) {
	var event = data.getElementById(data.event_id);
	event.sprite.x = data.x;
	event.sprite.y = data.y;
});*/

DataLink = {};
DataLink.init = function(params) {
	DataLink.params = params;
	if (params.type == "mmorpg") {
		DataLink = io.connect(DataLink.params.server);
	}
	else {
		DataLink = {
			_func: {
				server: {},
				client: {}
			},
			_map: {},
			_getFunc: function(type) {
				type = type || "server";
				return DataLink._func[type];
			},
			emit: function(name, params, type) {
				if (DataLink._getFunc(type)[name]) {
					DataLink._getFunc(type)[name](params);
				}
			},
			on: function(name, callback, type) {
				type = type || "client";
				DataLink._func[type][name] = callback;
			},
			join: function(name) {
				DataLink._map[name] = true;
			},
			leave: function(name) {
				if (DataLink._map[name]) {
					delete DataLink._map[name];
				}
			},
			broadcast: {
				to: function(name) {
					return {
						emit: function(name, params) {
							return false;
						}
					}
				},
				emit: function(name, params) {
					return false;
				}
			},
			sockets: {
				emit: function(name, params, type) {
					DataLink.emit(name, params, type);
				},
				to: function(name) {
					return DataLink;
				}
			}
		}
	}
}