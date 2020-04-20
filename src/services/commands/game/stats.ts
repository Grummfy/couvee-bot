import { Message, MessageEmbed } from "discord.js"
import { CommandAbstract } from "../../command-abstract"
import { NiceMessage } from "../../../helper/nice-message";
import * as _ from "lodash"

export class StatGameHandler extends CommandAbstract {
    public name = 'stats'

    public handle(message: Message): Promise<Message | Message[]> {
        let game = this.gameManager.getGameFromMessage(message)
        if (!game) {
            return message.reply('kO! mother wil eat you... grrr No game defined, start a new one with ' + this.prefix + 'start Xp')
        }

        let stats = new MessageEmbed()
        stats.setColor(NiceMessage.INFO)
        stats.setTitle('Stats about the CC')
        let fields = []
        _.forIn(game.dices.players, (value: number, playerLabel: string, arg) => {
            let player = game.playerByLabel(playerLabel)
            fields.push(NiceMessage.notify(player.userId) + ': ' + value + '/' + player.mind)
        })
        stats.setDescription(fields.join("\n"))
        stats.addField('Neutral', game.dices.neutral, true)
        stats.addField('Total', game.availableDice(false), true)

        return message.reply(stats)
    }
}
