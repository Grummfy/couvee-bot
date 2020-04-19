import { Message } from "discord.js"
import { CommandAbstract } from "../../command-abstract"
import { isNullOrUndefined } from "util"

export class SetHandler extends CommandAbstract {
    public name = 'set'

    public help(): string {
        return this.prefix + this.name + ' define some values like:' + "\n"
        + '* mind X Y: X is the value of the mind of the character played by the player, Y is optional and is the mention of the player (@username)' + "\n"
        + '* cci X Y: X is the value of the cci of the character played by the player, Y is optional and is the mention of the player (@username)' + "\n"
        + '* ccn X: X is the value of the ccn of the group of characters played' + "\n"
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

        switch (matched.groups.key) {
            case 'mind':
                return this.setMind(Number.parseInt(matched.groups.value), user, message)

            case 'cci':
                return this.setCCi(Number.parseInt(matched.groups.value), user, message)

            case 'ccn':
                return this.setCCn(Number.parseInt(matched.groups.value), message)

            default:
                return Promise.reject()
        }
    }

    private setCCi(value: number, userId: (string|undefined), message: Message): Promise<Message | Message[]> {
        let game = this.gameManager.getGameFromMessage(message)
        if (!game) {
            return this.koMessage(message)
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
            return this.koMessage(message)
        }

        game.modifyDiceNumber('n', value)

        // save value ;)
        this.gameManager.setGame(game)

        return this.okMessage(message)
    }

    private setMind(value: number, userId: (string|undefined), message: Message): Promise<Message | Message[]> {
        let game = this.gameManager.getGameFromMessage(message)
        if (!game) {
            return this.koMessage(message)
        }

        let player = game.playerByUserId(isNullOrUndefined(userId) ? message.author.id : userId)
        if (!player) {
            return this.koMessage(message)
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
}
