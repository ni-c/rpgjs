RPGJS = {}
RPGJS.loadPath = "";
RPGJS.params = {};
RPGJS.dirPluginsName = "plugins";
RPGJS.pluginCustomPath = false;
RPGJS.plugins = [];
RPGJS.commons_scripts = ["function", "cache", "input", "effects", "animations", "scene", "window", "datalink", "render"];
RPGJS.local_scripts = ["event", "rpg", "interpreter", "player"];
RPGJS.online_scripts = ["socket.io"];

RPGJS.load = function(params, callback) {

	if (typeof params === "function") {
		callback = params;
		params = {};
	}
	
	RPGJS.params = params;

	var current_load = 0, i,
		scripts = RPGJS.commons_scripts;
		
	if (params.type == "mmorpg") {
		scripts = scripts.concat(RPGJS.online_scripts);
	}
	else {
		scripts = scripts.concat(RPGJS.local_scripts);
	}
	
	if (params.plugins) {
		plugins = params.plugins;
		for (var i=0 ; i < plugins.length ; i++) {
			RPGJS.plugins.push(plugins[i]);
			plugins[i] = {plugin: RPGJS.dirPluginsName + '/' + plugins[i]};
		}
		scripts = scripts.concat(plugins);
	}
	
	loadScript(scripts[current_load]);
	
	
	function loadFinish() {
		current_load++;
		if (scripts[current_load]) {
			loadScript(scripts[current_load]);
		}
		else {
			DataLink.init(params);
			var render = new Render(params.canvas);
			if (callback) {
				window.onload = callback(render);
			}
		}
	}
	
	function loadScript(filename) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		
		if (script.readyState){ 
			script.onreadystatechange = function(){
				if (script.readyState == "loaded" ||
				  script.readyState == "complete"){
					script.onreadystatechange = null;
					loadFinish();
				}
			}
		} else { 
			script.onload = loadFinish;
		}
		var is_plugin = false;
		if (typeof filename !== "string") {
			is_plugin = true;
			filename = filename.plugin;
		}
		script.src = (RPGJS.pluginCustomPath && is_plugin ? "" : RPGJS.loadPath) + filename + '.js';
		document.getElementsByTagName("head")[0].appendChild(script);
	
	}
}

