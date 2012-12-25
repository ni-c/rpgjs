#Description

The script `convertToJs.rb` is able to convert maps, events and animations from RPG Maker XP to JS.

#Usage

1. Open the script `convertToJs.rb` present in the same folder with a text editor
2. Copy and paste in the script editor for RPG Maker XP above the Main Script
3. Run the game
4. During the game, press the F8 key

##Export Map

Export map and events. The map where the hero is currently on will be converted. The files will then in `RpgJs/Data/Maps/MapX.js`.

##Export All Animations

Export all animations from the database. The file will then be in `RpgJs/Database/Animation.js`. You can then integrate the animations into your game: <script src="Database/Animation.js"> </ script>.