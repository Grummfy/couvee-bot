import { Message, MessageEmbed } from "discord.js"
import { CommandAbstract } from "../../command-abstract"
import { NiceMessage } from "../../../helper/nice-message";
import * as _ from "lodash"

export class StatGameHandler extends CommandAbstract {
    public name = 'stats'

    public handle(message: Message): Promise<Message | Message[]> {
        let game = this.gameManager.getGameFromMessage(message)
        if (!game) {
            return message.reply('kO! mother wil eath you... grrr No game defined, start a new one with ' + this.prefix + 'start Xp')
        }

        console.log(game)

        let sumDices = _.values<number>(game.dices.players).reduce((sum, value) => sum + value)

        let stats = new MessageEmbed()
        stats.setColor(NiceMessage.INFO)
        stats.setTitle('Stats about the CC')
        _.forIn(game.dices.players, (value: number, playerLabel: string) => {
            let player = game.playerByLabel(playerLabel)
            stats.addField(playerLabel + ' <@' + player.userId + '>', game.dices.neutral, true)
        })
        stats.addField('Neutral', game.dices.neutral, true)
        stats.addField('Total', game.dices.neutral + sumDices, true)

        return message.reply('enjoy!')
    }
}
