import { Message, MessageEmbed } from "discord.js"
import { CommandAbstract } from "../../command-abstract"
import { NiceMessage } from "../../../helper/nice-message";
import * as _ from "lodash"
import { ErrorMessage } from "../../../helper/error-message";

export class StatGameHandler extends CommandAbstract {
    public name = 'stats'

    public help(): string {
        return '**' + this.prefix + this.name + '** give the actual stats about the number of dice available for each player'
    }

    public handle(message: Message): Promise<Message | Message[]> {
        let game = this.gameManager.getGameFromMessage(message)
        if (!game) {
            return ErrorMessage.noGameInitilized(message)
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
