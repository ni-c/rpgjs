RPG JS v2 Beta
=============

---
> Documentation is being written! The API is very similar to the first version except there is a part for rendering and one for the server part

---

Description
-----------

A new architecture is an RPG JS v1 (https://github.com/RSamaium/RPG-JS) for compatibility with the MMORPG.

With this version, you can create an RPG or MMORPG. It uses Node.js and Socket.io

Installation
------------

    npm install https://github.com/ni-c/rpgjs/tarball/master

Usage
----------

Server :

      var Rpg = require('rpgjs').onConnect(1337, function(rpg) {
  
	    rpg.start(function() {

            rpg.loadMap('map', {
				tileset: 'tiles.png',
				player:  {
					x: 2, 
					y: 3, 
					filename: 'Hero.png'
				}
			}, function() {

			});
          });
      });

Client :

    <!DOCTYPE html>
    <html>
      <head>
    	<script src="libs/easeljs/utils/UID.js"></script> 
    	<script src="libs/easeljs/utils/SpriteSheetUtils.js"></script> 
    	<script src="libs/easeljs/geom/Matrix2D.js"></script> 
    	<script src="libs/easeljs/events/MouseEvent.js"></script> 
    	<script src="libs/easeljs/geom/Point.js"></script> 
    	<script src="libs/easeljs/display/DisplayObject.js"></script> 
    	<script src="libs/easeljs/display/Bitmap.js"></script> 
    	<script src="libs/easeljs/display/SpriteSheet.js"></script> 
    	<script src="libs/easeljs/display/BitmapSequence.js"></script> 
    	<script src="libs/easeljs/display/Container.js"></script> 
    	<script src="libs/easeljs/display/Stage.js"></script> 
    	<script src="libs/easeljs/display/Graphics.js"></script> 
    	<script src="libs/easeljs/display/DOMElement.js"></script>
    	<script src="libs/easeljs/display/Shape.js"></script> 
    	<script src="libs/easeljs/display/Text.js"></script> 
    	<script src="libs/easeljs/utils/Ticker.js"></script> 
    	<script src="libs/easeljs/geom/Rectangle.js"></script> 
	
	    <script src="rpgjs/core/load.js"></script>
      <script>
           RPGJS.loadPath = "";
		    RPGJS.load({
			  canvas: "canvas_rpg",
			  type:  "mmorpg",
			  server: "http://IP:1337"
		    },
		    function(render) {
                 render.start();
	             render.onLoadMap(function() {

                 });
          });
      </script>
     </head> 
      <body>
		
		<div id="canvas_rpg-parent" style="width: 640px; height: 650px">
			<canvas id="canvas_rpg" width="640px" height="650px"></canvas>	
		</div>
    </body>
    </html>

License
-------

Copyright � 2012 WebCreative5 - Samuel Ronce

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
