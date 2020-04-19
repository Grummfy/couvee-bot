import { Message } from "discord.js"
import { CommandAbstract } from "../../command-abstract"
import { isNullOrUndefined } from "util"
import { Result } from "@badrap/result"

export class AddDiceHandler extends CommandAbstract {
    public name = 'add'

    public handle(message: Message): Promise<Message | Message[]> {
        let game = this.gameManager.getGameFromMessage(message)
        if (!game) {
            // TODO error
            return message.reply('Arghhh');
        }

        let result = this.extractValues(message)
        if (result.isErr) {
            return message.reply('Sorry I didn\'t understand your request')
        }

        // handle game change
        for (let value of result.unwrap()) {
            game.modifyDiceNumber(value.type, value.value, value.userId)
        }
        this.gameManager.setGame(game)

        return message.reply('enjoy!')
    }

    protected extractValues(message: Message): Result<{type: string, value: number, userId: (string | undefined)}[], Error> {
        // extract operations
        let regex = new RegExp('^' + this.prefix + this.name + '(?<operations>(\\s*([0-9]*)\\s*(i|n)\\s*(<@!([0-9]*)>)?\\s*)*)$')
        let matched = message.content.trim().match(regex)
        if (isNullOrUndefined(matched) || isNullOrUndefined(matched.groups)) {
            return Result.err(new Error())
        }

        // extract operation
        regex = new RegExp('(?<value>\\s*([0-9]*))\\s*(?<group>(i|n))\\s*(?<user><@.([0-9]*)>)?', 'g')
        matched = matched.groups.operations.match(regex)
        if (isNullOrUndefined(matched) || matched.length === 0) {
            return Result.err(new Error())
        }

        let values = this.extractValueOperations(matched, regex, message.author.id)

        return Result.ok(values);
    }

    protected extractValueOperations(matched: RegExpMatchArray, regex: RegExp, userId: string): {type: string, value: number, userId: (string | undefined)}[] {
        // extract each operation values
        let values = []
        for (let match of matched) {
            let data = match.match(new RegExp(regex, '')).groups
            let value = data.value ? Number.parseInt(data.value) : 0
            if (isNaN(value)) {
                value = 0
            }

            if (data.group === 'n') {
                values.push({type: 'n', value: value})
                continue
            }

            if (data.user) {
                userId = data.user.trim().slice(3, -1)
            }
            values.push({type: 'i', value: value, userId: userId})
        }

        return values
    }
}
