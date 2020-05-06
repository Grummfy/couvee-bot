import { Message } from 'discord.js'
import { injectable } from 'inversify'
import { CommandAbstract } from '../command-abstract'
import { NiceMessage } from '../../helper/nice-message'
import * as _ from 'lodash'

@injectable()
export class HelpHandler extends CommandAbstract {
    public name = 'help'

    public async handle(message: Message): Promise<Message | Message[]> {
        let messages: string[] = []
        for (let handler of this.commandHandler.getHandlers()) {
            messages.push(handler.help())
        }

        // we can only sendd 1024 character string by message, so we need to split it
        let chunksOfMessage = _.chunk(messages, 8)

        for (let i = 1; i < chunksOfMessage.length; i++) {
            await message.reply(NiceMessage.wrap(chunksOfMessage[ i - 1 ].join('\n')))
        }

        return message.reply(NiceMessage.wrap(chunksOfMessage[ chunksOfMessage.length - 1 ].join('\n')))
    }
}
