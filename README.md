#RPGJS

## Description

**rpgjs** is a Browser-MMORPG Framework written in node.js.

## Installation

RPGJS can be installed as node module or in a subdirectory of your application.

### As node module

```bash
npm install https://github.com/ni-c/rpgjs/tarball/master
```

### As submodule

```bash
git submodule add git@github.com:ni-c/rpgjs.git rpgjs
npm install socket.io
```

# Usage
```javascript
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
```

# The MIT License (MIT)

Copyright (c) 2012 WebCreative5 - Samuel Ronce
Copyright (c) 2013 Willi Thiel (mail@willithiel.de)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
