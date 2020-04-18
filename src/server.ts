
require('dotenv').config();

import container from "./inversify.config";
import { TYPES } from "./types";
import { Bot } from "./bot";

let bot = container.get<Bot>(TYPES.Bot);

console.debug('Add the bot to your discord with https://discordapp.com/oauth2/authorize?client_id=' + process.env.CLIENT_ID + '&permissions=27712&scope=bot')

bot.listen().then(() => {
    console.log('Logged in!')
}).catch((error) => {
    console.log('Oh no! ', error)
});
