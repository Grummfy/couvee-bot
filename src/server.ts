
require('dotenv').config()

import container from './inversify.config'
import { TYPES } from './types'
import { Bot } from './bot'
import * as Sentry from '@sentry/node'
import { isNullOrUndefined } from 'util'

if (!isNullOrUndefined(process.env.SENTRY_DSN)) {
    let data = {
        dsn: process.env.SENTRY_DSN
    }

    if (!isNullOrUndefined(process.env.HEROKU_RELEASE_VERSION)) {
        data['release'] = 'discord-bot-iblitz-couvee@' + process.env.npm_package_version
    }

    Sentry.init(data)
}

let bot = container.get<Bot>(TYPES.Bot)

// permission (see https://discordapp.com/developers/docs/topics/permissions)
// * 0000000000000000000000001000000 add reaction
// * 0000000000000000010000000000000 manage message => remove reaction
// * 1000000000000000000000000000000 manage emoji => add custom emoji
// * 0000000000000000000100000000000 send message
// * 0000000000000010000000000000000 read message history => remove reaction
// * 0000000000000000100000000000000 add link
//
// * 1000000000000010110100001000000 => total perms => 1073834048

console.log('Add the bot to your discord with https://discordapp.com/oauth2/authorize?client_id=' + process.env.CLIENT_ID + '&permissions=1073834048&scope=bot')

bot.listen().then(() => {
    console.log('Logged in!')
}).catch((error) => {
    console.log('Oh no! ', error)
})
