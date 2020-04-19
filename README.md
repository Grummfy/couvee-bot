# Couvée-Bot

## Behaviour

* #help : display help, list of commands, etc
* #start Xplayer : can be shorten Xp, start a new game with **X** player. If a game is running ask for confirmation before killing previous game.
* #end : stop the current game
* launch dices: from your personal one (i), or the group (g) or neutral (n)
  * #r Xg+Yi+Z : launch **X** dice taken randomly from the cc**g**, **Y** from the cc**i**, **Z** from the bonus
  * #r Xg : launch **X** dice taken randomly from the cc**g** (group dice)
  * #r Xi : launch **X** dice from the cc**i** (from yourself) and eventually add some neutral or whatever stay there
  * #r Xg+Y : launch **X** dice from the cc**g** then add **Y** bonus dice
  * #r Xg+Yi : launch **Y** dice from the cc**i** then add **X** dice from the cc**g**
  * #r Xn+Yi : launch **Y** dice from the cc**i** then add **X** dice from the cc**g**
* #add Xn : add **X** neutral dice
* #remove Xn : remove **X** neutral dice
* #stats : display the current stats about the dices

## Dev notes

This bot is developped in typescript. Mainly as an exercice.

The minimum version of node required is 12

### Init

* clone repository
* intall npm dependencies
* go to discord to create an application & bot
  * create the applciation https://discordapp.com/developers/applications/me 
  * then create a bot with admin permission
  * then copy the token to server.ts
* invite the bot to your server
  * copy the client id of the app
  * use the url https://discordapp.com/oauth2/authorize?client_id=<CLIENT_ID>&scope=bot&permissions=8
  * choose your server

### Compile

```npm run watch```

### Launch

```node dist/server.js```
or
```npm run start```

### Note

Helpfull ressources
* https://discordjs.guide/
* https://discord.js.org/#/docs/
* https://github.com/AnIdiotsGuide/discordjs-bot-guide
* https://discordapp.com/developers/docs/
* https://leovoel.github.io/embed-visualizer/
