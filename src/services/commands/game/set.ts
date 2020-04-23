import { Message } from "discord.js"
import { CommandAbstract } from "../../command-abstract"
import { isNullOrUndefined } from "util"
import { ErrorMessage } from "../../../helper/error-message"
import { Result } from "@badrap/result"

export class SetHandler extends CommandAbstract {
    public name = 'set'

    public help(): string {
        return '**' + this.prefix + this.name + '** define some values like:' + "\n"
        + '• *mind X @Y*: X is the value of the mind of the character played by the player, Y is optional and is the mention of the player (@username) or yourself' + "\n"
        + '• *cci X @Y*: X is the value of the cci of the character played by the player, Y is optional and is the mention of the player (@username) or yourself' + "\n"
        + '• *ccn X*: X is the value of the ccn of the group of characters played' + "\n"
    }

    public isHandled(message: Message): boolean {
        return message.content.startsWith(this.prefix + this.name)
    }

    public handle(message: Message): Promise<Message | Message[]> {
        let regex = new RegExp('^' + this.prefix + this.name + ' (?<key>[a-zA-Z_]*) ?(?<value>[0-9]*) ?(?<user><@.([0-9]*)>)?$')
        let matched = message.content.match(regex)

        if (isNullOrUndefined(matched)) {
            return message.reply('mother eat you!')
        }

        let user: string;
        if (!isNullOrUndefined(matched.groups.user)) {
            user = matched.groups.user.trim().slice(3, -1)
        }

        let valueNumber = Number.parseInt(matched.groups.value)
        let result = this.checkIsNumber(valueNumber)
        if (result.isErr) {
            return message.reply('Grr: ' + result.error.message)
        }

        switch (matched.groups.key) {
            case 'mind':
                return this.setMind(valueNumber, user, message)

            case 'cci':
                return this.setCCi(valueNumber, user, message)

            case 'ccn':
                return this.setCCn(valueNumber, message)

            default:
                return Promise.reject()
        }
    }

    private setCCi(value: number, userId: (string|undefined), message: Message): Promise<Message | Message[]> {
        let game = this.gameManager.getGameFromMessage(message)
        if (!game) {
            return ErrorMessage.noGameInitilized(message)
        }

        if (!game.modifyDiceNumber('i', value, isNullOrUndefined(userId) ? message.author.id : userId)) {
            return this.koMessage(message)
        }

        // save value ;)
        this.gameManager.setGame(game)

        return this.okMessage(message)
    }

    private setCCn(value: number, message: Message): Promise<Message | Message[]> {
        let game = this.gameManager.getGameFromMessage(message)
        if (!game) {
            return ErrorMessage.noGameInitilized(message)
        }

        game.modifyDiceNumber('n', value)

        // save value ;)
        this.gameManager.setGame(game)

        return this.okMessage(message)
    }

    private setMind(value: number, userId: (string|undefined), message: Message): Promise<Message | Message[]> {
        let game = this.gameManager.getGameFromMessage(message)
        if (!game) {
            return ErrorMessage.noGameInitilized(message)
        }

        let player = game.playerByUserId(isNullOrUndefined(userId) ? message.author.id : userId)
        if (!player) {
            return ErrorMessage.noPlayerFound(message)
        }

        player.mind = value

        // save value ;)
        this.gameManager.setGame(game)

        return this.okMessage(message)
    }

    private okMessage(message: Message): Promise<Message> {
        return message.reply('Ok!')
    }

    private koMessage(message: Message): Promise<Message> {
        return message.reply('kO! mother wil eath you... grrr')
    }

    private checkIsNumber(number: number) {
        if (isNaN(number)) {
            return Result.err(new Error('Not a number'))
        }
        return Result.ok(number)
    }
}
