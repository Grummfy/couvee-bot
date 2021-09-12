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

Some helpfull ressources
* https://discordjs.guide/
* https://discord.js.org/#/docs/
* https://github.com/AnIdiotsGuide/discordjs-bot-guide
* https://discordapp.com/developers/docs/
* https://leovoel.github.io/embed-visualizer/

#### Deployment

You will require
* a oauth client id (CLIENT_ID): from https://discordapp.com/developers/applications > new app > oauth2
* a token for the bot (TOKEN): from https://discordapp.com/developers/applications > new app > bot

##### Digital Ocean

[![Deploy on DigitalOcean](https://www.deploytodo.com/do-btn-blue-ghost.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/Grummfy/couvee-bot/tree/main&refcode=f334e67637bf)

##### Heroku

[![Deploy on Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Grummfy/couvee-bot/tree/main)

Note, the database is not kept between two redeployment... you will require to handle it yourself. Just configure a database in heropo and fill the DSN properly.

If you want to host on heroku, here is more detail (or click on the big button)
* https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/other-guides/heroku.md
* https://devcenter.heroku.com/articles/procfile
* https://devcenter.heroku.com/articles/dyno-metadata
