Function = {};

/**
 * Switch to "DEBUG". Shows FPS. The green square: size of the sprite ; the red square: collision
 * @property debug
 * @static
 * @type Boolean
*/
Function.debug = false;

/**
 * Returns the name of the user agent used
 * @method mobileUserAgent
 * @static
 * @param {Object} variable Variable
 * @return {String|Boolean} name of the agent user ("iphone", "ipod", "ipad", "blackberry", "android" or "windows phone") or false if it is not a mobile
 * @example
	if (Rpg.mobileUserAgent()) {
		// It's a mobile
	}
	if (Rpg.mobileUserAgent() == "android") {
		// It's a Android mobile
	}
*/
Function.mobileUserAgent = function() {
	var ua = navigator.userAgent;
	if (ua.match(/(iPhone)/))
		return "iphone";
	else if (ua.match(/(iPod)/))
		return "ipod";
	else if (ua.match(/(iPad)/)) 
		return "ipad";
	else if (ua.match(/(BlackBerry)/)) 
		return "blackberry";
	else if (ua.match(/(Android)/))
		return "android";
	else if (ua.match(/(Windows Phone)/)) 
		return "windows phone";
	else
		return false;
}

/**
 * Whether the variable is an array
 * @method isArray
 * @static
 * @param {Object} variable Variable
 * @return {Boolean} true if an array
*/
Function.isArray = function(a) {
	return (typeof(a) ==='object') ? a.constructor.toString().match(/array/i) !== null || a.length !==undefined :false;
}

/**
 * Returns the value of an element in the array by its key
 * @method keyExist
 * @static
 * @param {Object|Array} array Object or 2-dimensional array
 * @param {String} value Key
 * @return {Object} Element value
*/	
Function.keyExist = function(a, value) {
	if (Function.isArray(value)) {
		return a[value[0]] && a[value[0]][value[1]];
	}
	else {
		return a[value];
	}
}

/**
 * Searches value in a table
 * @method valueExist
 * @static
 * @param {Array} array Simple array or 2-dimensional array
 * @param {String|Integer} value Value
 * @return {Integer|Boolean} Position of the element found in the array. false if absent
*/		
Function.valueExist = function(a, value) {
	var array_find, i, j;
	for (i=0 ; i < a.length ; i++) {
		if (Function.isArray(value)) {
			array_find = true;
			for (j=0 ; j < a[i].length ; j++) {
				if (a[i][j] != value[j]) {
					array_find = false;
				}
			}
			if (array_find) {
				return i;
			}
		}
		else {
			if (a[i] == value) {
				return i;
			}
		}
	}
	return false;
}

/**
 * Completely removes an element in an array
 * @method unsetArrayElement
 * @static
 * @param {Array} array Array
 * @param {String|Integer} value Value contained in the array
 * @return {Array} The array without the element
*/		
Function.unsetArrayElement = function(array, value) {
	var pos = Function.valueExist(array, value);
	var last = array.length-1;
	if (pos !== false) {
		if (pos == 0) {
			array.shift();
		}
		else if (pos == last) {
			array.pop();
		}
		else {
			array.splice(pos, 1);
		}
	}
	return array;
}

/**
 * Returns the last value of array
 * @method endArray
 * @static
 * @param {Array} array Array
 * @return {Object} Last value
*/	
Function.endArray = function(array) {
	return array[array.length-1];
}

if (typeof(RPGJS) === "undefined") {
	exports._class = Function;
}