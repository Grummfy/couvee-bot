import { Message, MessageEmbed } from 'discord.js'
import { CommandAbstract } from '../../command-abstract'
import { NiceMessage } from '../../../helper/nice-message'
import * as _ from 'lodash'
import { ErrorMessage } from '../../../helper/error-message'

export class StatGameHandler extends CommandAbstract {
    public name = 'stats'

    public handle(message: Message): Promise<Message | Message[]> {
        return this.gameManager.getGameFromMessageAsync(message)
            .then((game) => {
                let stats = new MessageEmbed()
                stats.setColor(NiceMessage.INFO)
                stats.setTitle(this.commandHandler.getTranslator().cmd.stats.title)
                let fields = []
                _.forIn(game.dices.players, (value: number, playerLabel: string, arg) => {
                    let player = game.playerByLabel(playerLabel)
                    fields.push(NiceMessage.notify(player.userId) + ': ' + value + '/' + player.instinct)
                })
                stats.setDescription(fields.join("\n"))
                stats.addField(this.commandHandler.getTranslator().cmd.stats.neutral, game.dices.neutral, true)
                stats.addField(this.commandHandler.getTranslator().cmd.stats.total, game.availableDice(false), true)

                return message.reply(stats)
            })
            .catch(() => {
                return ErrorMessage.noGameInitilized(message)
            })

    }
}
