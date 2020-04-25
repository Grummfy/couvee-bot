import { Message } from 'discord.js'
import { CommandAbstract } from '../command-abstract'
import { NiceMessage } from '../../helper/nice-message'
import { isNullOrUndefined } from 'util'

export class AboutHandler extends CommandAbstract {
    public name = 'about'

    public handle(message: Message): Promise<Message | Message[]> {
        console.log(this.commandHandler.getTranslator())
        let msg: string[] = this.commandHandler.getTranslator().cmd.about.about

        if (!isNullOrUndefined(process.env.HEROKU_RELEASE_VERSION)) {
            msg.push('')
            msg.push(this.commandHandler.getTranslator().cmd.about.version(process.env.HEROKU_RELEASE_VERSION))
        }

        return message.reply(NiceMessage.wrap(msg.join('\n')))
    }
}
