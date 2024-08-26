# Changelog

## [0.9.2] - 2024-08-26

- Implemented additional rules for username/room input and resolved related bugs.
- Rankings now work even after color changes.
- 'Ended' room status is now the same with 'waiting'; fixed a bug where you can spam the 'start game' button
- Fixed a bug where the client crashes sometimes when he is a spectator.
- Fixed a bug related to sick bombs.
- Fixed yet another issue with kicked bombs.

## [0.9.1] - 2024-08-24

- Created a new 'hidden' map for testing purposes.
- The player now can't walk through kickedbombs.
- The kickedbombs now destroy any powerups along their path; They also stop when encountering any players.
- The kickedbombs now explode when they go into bombfire.
- The client now has access to the bombId for each bomb.
- Fixed a bug where you can place two bombs in the beginning.

## [0.9.0] - 2024-08-23

- Added kick bombs powerup.
- Fixed a bug with ticks that crashed the server.
- Fixed a bug where the bombfire doesn't destroy powerups on map.
- Fixed a small bug that allowed you to place bombs outside the map.

## [0.8.2] - 2024-08-07

- Added CHANGELOG.md
- Removed all useless code and added all features back from version 0.8.1.

## [0.8.1] - 2024-08-06

- (0.8.1) bombs now use the tick system
   - - some features where temporarily removed in this commit, they will be remade soon. also bugs might appear often.
   - + bombs and bombfires are not considered blocks anymore; they each have a special layer separated from the normal map.
   - + reworked the ticks system (again). hopefully this is the last time.

## [0.7.6] - 2024-08-04

- (0.7.6) consts file now works based on ejs
   - + fixed file permissions of the whole project
- Added a photo in README.md

## [0.7.5] - 2024-07-10

- (0.7.5) fixed animations, now they start from 0

## [0.7.4] - 2024-07-09

- (0.7.4) switched game timers to ticks
   - + startGame now is separated into tryStart and placeEndgameBlocks

## [0.7.3] - 2024-07-09

- (0.7.3) switched end screen to ticks

## [0.7.2] - 2024-07-09

- (0.7.2) Reworked the ticks system
   - - switched start game timers to ticks
   - - solved *some* bugs in ticks

## [0.7.1] - 2024-07-09

- (0.7.1.1) Added maps Magneto + Random map

## [0.6.1] - 2024-07-07

- (0.6.1) Added a new map - Fourway
   - - fewer game-socket.js events
- (0.6.1.2) fixed ticks bug
- removed portal.png
- Add files via upload
- (0.6.1.3) fixed 'wasdp' while chatting

## [0.5.3] - 2024-07-06

- (0.5.3) Change colors available in 'ended' status
- Can start/end the tick loop
- better shield image
   - + fixed a bug on room restart
   - + removed some useless assets

## [0.5.2] - 2024-07-04

- (0.5.2) Big refactor for the server code (again!)
   - and fixed the switch player powerup
- renamed all js files to kebab-case
- Fixed the stats for players on game start
   - + restyled log box and startgame button
- Switch keys now works properly on mobile+pc
- Disable double-tap to zoom on mobile
   - + font smaller for logs on mobile

## [0.5.1] - 2024-06-27

- (0.5.1) Added a tick system to process some events
   - - these events are shields and sicks, but there will be more supported events with ticks in the future;
   - - separated the main server into web server + socket server;
   - - fixed a bug when using childNodes in the web version;
   - - the map generation now has the same probabilities as in the original game;
   - - really cleaned up the server code.
- Fixed https connection
   - - updated .gitignore to include spright config
   - - added an example .env
- changed repo name to pyromasters-mp
- Converted 'coords' event to ticks and fixed shields on client
- Fixed a *small* bug with coords

## [0.4.5] - 2024-06-24

- (0.4.5) Fixed GamePC.html and:
   - - updated fire.png
   - - added credits to the assets
   - - updated to howler.js v2.2.4
   - - the footer is now a template
   - on the server; now it shows the version.
- remove .git_old

## [0.4.4] - 2024-05-24

- (0.4.4) added a script for my own use
- Fixed name checking on room entering.
- Bump ws, engine.io and socket.io-adapter
- Merge pull request #1 from ezluci/dependabot/npm_and_yarn/multi-e091cc75b0

## [0.4.3] - 2024-04-04

- (0.4.3) Fixed things:
   - - Fixed spaces in chat messages
   - - Changed a bit game.html
- (0.4.3) Removed fps counter
- (0.4.3) Changed the fire.png texture.
- cleaner css files
- small change again
- (0.4.3) added https page
- Update README.md
- https cleanup
- copy from Work-in-progress branch

## [0.4.2] - 2024-03-28

- (0.4.2) Fixed alot of server bugs.
- oopsie
- (0.4.2) Added user name checks
- Modified the game webpage design

## [0.4.1] - 2024-03-18

- (0.4.1) Added animations!!
- (0.4.1) Fixed animations.
- (0.4.1) Animations now sync with other players.
- (0.4.1) Finished animations for each color.

## [0.3.10] - 2024-03-17

- (0.3.10) An attempt to cleanup the client code. Also starting to work on animations.
- Merge branch 'main' of https://github.com/ezluci/pyromasters-multiplayer
- Started working on the sidebars of the webpage

## [0.3.9] - 2024-02-21

- (0.3.9) Solved bugs + organized code
   - - Solved a bug where the server will crash if the owner didn't choose a color at startgame.
   - - Solved a bug where other players' speed didn't reset at startgame.
- (0.3.9) Organized server code
   - - Moved intervalIDS to each room instead of each socket.
   - - Each socket now has its own details (username, speedIndex, shield), not the room.

## [0.3.8] - 2024-02-17

- (0.3.8) Solved bugs & Added server checks
   - - Added lots of server checks so it doesn't crash very often.
   - - Solved a bug where you can have negative time if you restart the game. Now, if the room owner leaves, the room gets destroyed.

## [0.3.7] - 2024-02-15

- (0.3.7)
   - - Fixed a bug where you can get more than one bomb in game.

## [0.3.6] - 2023-12-08

- (0.3.6)
   - - Fixed a bug with the endgame blocks, now the number of blocks placed is correct.
   - - Added a list with authors for each asset used in the game.
   - - PC+mobile game.html versions
- 0.3.6

## [0.3.5] - 2023-11-25

- (0.3.5) Chat

## [0.3.4] - 2023-11-23

- (0.3.4) Rankings after each game.

## [0.3.3] - 2023-11-23

- (0.3.3) Huge refactor to the server code. It's still a mess but I'm fixing it slowly.
   - This version might contain a lot of bugs.

## [0.3.2] - 2023-11-23

- (0.3.2) The server is now using express.js

## [0.3.1] - 2023-08-29

- (0.3.1) Added endgame (the permanent blocks that appear when the time has ran out).
- updated index.html and game.html
- hopefully fixed the error
- hopefully now
- hopefully NOW

## [0.2.3] - 2023-08-17

- (0.2.3) Multiple bombs placed on the same row or column will connect.
- (0.2.3) Fixed 2 bombs on start instead of 1.

## [0.2.2] - 2023-07-19

- (0.2.2) Bugfixes and some features:
   - - Removed deltaTime.
   - - Added a way to distinguish powerups.
   - - Blocks are drawn smaller.
   - - Changed block name: FIXED -> PERMANENT.
   - - Now you can't have multiple identical player names in the same room.
   - - On game restart, every player has their stats reseted.

## [0.2.1] - 2023-07-17

- (0.2.1) Now you can RESTART the game. Fixed menu music playing on spectators joining. Refactored code A LOT.
- (0.2.1) Fixed a bug with tryStart. Added draw and win sounds.
- (0.2.1) Added draw/win screen. Updated README. Cleaned game.html and index.html a bit.

## [0.1.6] - 2023-07-15

- (0.1.6) instead of multiple variables for sounds, now you have the 'sounds' object. did this so i can make a volume slider. fixed small bug with sounds. changed 'bonusall'+'bonuslost' in 'playsound'
- (0.1.6)
- (0.1.6) Added dead*.mp3 sounds. Now on server restart every interval/timeout id is stopped (finally a lot of bugs are fixed).

## [0.1.5] - 2023-07-15

- added some songs. added gameTime.
- (0.1.5) added some songs. added gameTime.
- modified some asstes
- Merge branch 'main' of https://github.com/ezluci/pyromasters-multiplayer
- (0.1.5) fixed a gameTime bug. added "hurry" and "taunt" sounds.
- (0.1.5) added sounds: dropbomb, dropbombsick, explode, bonusall, bonuslost and powerup.

## [0.1.4] - 2023-07-14

- (0.1.4) Fixed a bug with howler.js on opera (goldfire/howler.js#1670)

## [0.1.3] - 2023-07-14

- (0.1.3) Forgot to remove some code

## [0.1.2] - 2023-07-14

- (0.1.2) Added main menu sound

## [0.1.1] - 2023-07-14

- (0.1.1) Changed some file extensions (.jpg -> .png)

## [0.0.13] - 2023-07-13

- added new bomb image xd
- updated how shield works. added bonus(?) powerup. added functions for each powerup.
- Added some more info in package.json. Also added MIT license.
- Added LICENSE file (MIT license)
- added more texture files

## [0.0.12] - 2023-06-07

- Now you can't move through bombs. Not sure how im gonna add the kickbombs powerup 💀

## [0.0.11] - 2023-06-06

- Added shield powerup
- Added shield powerup
- Added switchplayer powerup
- CD was ./src and these things were never pushed...
- Updated gitignore and some 'requires' from server

## [0.0.10] - 2023-06-05

- Added powerup chances from the original game.

## [0.0.9] - 2023-06-01

- Added some more powerups
- Added some server checks to not crash.
- Added a small video with gameplay
- Added a video to readme.md

## [0.0.8] - 2023-05-31

- You can now collect powerups. Fixed a bit 'playerJoined'.

## [0.0.7] - 2023-05-29

- Added powerups. You can break blocks and receive powerups, but you cant collect them.

## [0.0.6] - 2023-05-24

- Added the best looking textures for the robots
- Added player death. Changed a bit the movement. Changed a lot the server code, again.

## [0.0.5] - 2023-05-20

- Bombs now can destroy blocks and have fire for a short time

## [0.0.4] - 2023-05-19

- Refactor in server.js
- Fixed a lot of bugs

## [0.0.3] - 2023-05-16

- Now you cant go through blocks

## [0.0.2] - 2023-05-14

- Modified the backend to keep the information better.
- Added maps
- Added logging

## [0.0.1] - 2023-05-13

- Added more stuff for canvas. Added some images. Preparing for player movement (added some key events).
- Added some FPS calculations and movement.
- Movement done.
- Movement updates to connected players.
- Colors are now working between players.
- Added some color checking (max 1 same color for room)
- Fixed colors between players. Added some checks to prevent random connects to websocket.

## [0.0.0] - 2023-05-12

- First commit