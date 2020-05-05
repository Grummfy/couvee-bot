import { Message } from 'discord.js'
import { CommandAbstract } from '../../command-abstract'
import { isNullOrUndefined } from 'util'
import { ErrorMessage } from '../../../helper/error-message'
import { Result } from '@badrap/result'
import { Game } from '../../../game/game'

export class SetHandler extends CommandAbstract {
    public name = 'set'

    public isHandled(message: Message): boolean {
        return message.content.startsWith(this.prefix + this.name)
    }

    public handle(message: Message): Promise<Message | Message[]> {
        let regex = new RegExp('^' + this.prefix + this.name + ' (?<key>[a-zA-Z_]*) ?(?<value>[0-9]*) ?(?<user><@.([0-9]*)>)?$')
        let matched = message.content.match(regex)

        if (isNullOrUndefined(matched)) {
            return message.reply(this.commandHandler.getTranslator().cmd.set.error.bad_regex)
        }

        let user: string;
        if (!isNullOrUndefined(matched.groups.user)) {
            user = matched.groups.user.trim().slice(3, -1)
        }

        let valueNumber = Number.parseInt(matched.groups.value)
        let result = this.checkIsNumber(valueNumber)
        if (result.isErr) {
            return message.reply('Grrrrr: ' + result.error.message)
        }

        switch (matched.groups.key) {
            case 'instinct':
                return this.setInstinct(valueNumber, user, message)

            case 'cci':
                return this.setCCi(valueNumber, user, message)

            case 'ccn':
                return this.setCCn(valueNumber, message)

            default:
                return Promise.reject()
        }
    }

    private setCCi(value: number, userId: (string | undefined), message: Message): Promise<Message | Message[]> {
        return this.gameManager.getGameFromMessageAsync(message)
            .then((game: Game) => {
                if (!game.modifyDiceNumber('i', value, isNullOrUndefined(userId) ? message.author.id : userId, true)) {
                    return this.koMessage(message)
                }

                // save value ;)
                this.gameManager.setGame(game)

                return this.okMessage(message)
            })
            .catch(() => {
                return ErrorMessage.noGameInitilized(message)
            })
    }

    private setCCn(value: number, message: Message): Promise<Message | Message[]> {
        return this.gameManager.getGameFromMessageAsync(message)
            .then((game: Game) => {
                game.modifyDiceNumber('n', value, undefined, true)

                // save value ;)
                this.gameManager.setGame(game)

                return this.okMessage(message)
            })
            .catch(() => {
                return ErrorMessage.noGameInitilized(message)
            })
    }

    private setInstinct(value: number, userId: (string | undefined), message: Message): Promise<Message | Message[]> {
        return this.gameManager.getGameFromMessageAsync(message)
            .then((game: Game) => {
                let player = game.playerByUserId(isNullOrUndefined(userId) ? message.author.id : userId)
                if (!player) {
                    return ErrorMessage.noPlayerFound(message)
                }

                player.instinct = value

                // save value ;)
                this.gameManager.setGame(game)

                return this.okMessage(message)
            })
            .catch(() => {
                return ErrorMessage.noGameInitilized(message)
            })
    }

    private okMessage(message: Message): Promise<Message> {
        return message.reply('Ok!')
    }

    private koMessage(message: Message): Promise<Message> {
        return message.reply('kO! mother wil eat you... grrr')
    }

    private checkIsNumber(number: number) {
        if (isNaN(number)) {
            return Result.err(new Error('Not a number'))
        }
        return Result.ok(number)
    }
}
