
require('dotenv').config()

import container from './inversify.config'
import { TYPES } from './types'
import { Bot } from './bot'
import * as Sentry from '@sentry/node'

if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN })  
}

let bot = container.get<Bot>(TYPES.Bot)

// permission :
// * add reaction
// * to remove reaction: read message history + manage message
// * send messages
// * add links 

console.debug('Add the bot to your discord with https://discordapp.com/oauth2/authorize?client_id=' + process.env.CLIENT_ID + '&permissions=92224&scope=bot')

bot.listen().then(() => {
    console.log('Logged in!')
}).catch((error) => {
    console.log('Oh no! ', error)
})
