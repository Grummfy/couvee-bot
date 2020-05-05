import { Message } from 'discord.js'
import { CommandAbstract } from '../../command-abstract'
import { Engine, die } from 'random-js'
import container from '../../../inversify.config'
import { TYPES } from '../../../types'
import { isNullOrUndefined } from 'util'
import * as _ from 'lodash'
import { Game } from '../../../game/game'
import { Player } from '../../../game/player'
import { Result } from '@badrap/result'
import { NiceMessage } from '../../../helper/nice-message'
import { ErrorMessage } from '../../../helper/error-message'
import { GroupOfDiceRequest } from '../../../game/dices/GroupOfDiceRequest'

export class RollGameHandler extends CommandAbstract {
    public name = 'roll'
    private randomEngine: Engine

    private static readonly regexParts = [
        // cc dices
        '\\s*(?<dices>(\\+?\\s*([0-9]*)\\s*(g|i|n)\\s*)*)',
        // bonus dices
        '(?<bonus>\\+?\\s*([0-9]*))?',
        // end
        '$',
    ]

    private static readonly regexDicesParts = [
        // start
        '^',
        // value
        '(?<value>[0-9]*)\\s*',
        // group associated to the value
        '\\s*(?<group>(g|i|n))',
        '$',
    ]

    public constructor() {
        super()
        this.randomEngine = container.get<Engine>(TYPES.RandomEngine)
    }

    public isHandled(message: Message): boolean {
        return super.isHandled(message) || message.content.startsWith(this.prefix + this.name[0] + ' ')
    }

    public handle(message: Message): Promise<Message | Message[]> {
        // get usefull stuff like game & current player
        return this.gameManager.getGameFromMessageAsync(message)
            .then((game: Game) => {
                let player = game.playerByUserId(message.author.id)
                if (!player) {
                    return ErrorMessage.noPlayerFound(message)
                }

                return this.roll(message, game, player)
            })
            .catch(() => {
                return ErrorMessage.noGameInitilized(message)
            })

    }

    private roll(message: Message, game: Game, player: Player): Promise<Message | Message[]> {
        //
        // extract requested roll
        let requestedDicesToRoll = this.extractRequestedDices(message, player, game)
        if (requestedDicesToRoll.isErr) {
            return message.reply(NiceMessage.wrap(requestedDicesToRoll.error.message, NiceMessage.ERROR))
        }
        let requestedDiceToRoll = requestedDicesToRoll.unwrap()

        let msg = this.commandHandler.getTranslator().cmd.roll.asked_dices(requestedDiceToRoll.bonus, requestedDiceToRoll.dices.n, requestedDiceToRoll.dices.g)

        _.forIn(requestedDiceToRoll.dices.i, (value: number, playerLabel: string) => {
            let playerOfDice = game.playerByLabel(playerLabel)
            msg += this.commandHandler.getTranslator().cmd.roll.asked_player_dices(requestedDiceToRoll.dices.i[ playerLabel ], NiceMessage.notify(playerOfDice.userId))
        })

        message.reply(msg.slice(0, -2));

        //
        // take the requested dice to pool of dice to roll 
        let groupDice = game.getGroupOfDiceToRollFromRequest(requestedDiceToRoll, this.commandHandler.getTranslator(), this.randomEngine)
        if (groupDice.isErr) {
            return message.reply(NiceMessage.wrap(groupDice.error.message, NiceMessage.ERROR))
        }
        let groupDiceToRoll = groupDice.unwrap()

        msg = this.commandHandler.getTranslator().cmd.roll.picked_dices
        if (groupDiceToRoll.n > 0) {
            msg += this.commandHandler.getTranslator().cmd.roll.picked_neutral_dices(groupDiceToRoll.n)
        }
        _.forIn(groupDiceToRoll.i, (value: number, playerLabel: string) => {
            if (value > 0) {
                msg += this.commandHandler.getTranslator().cmd.roll.picked_player_dices(value, NiceMessage.notify(game.playerByLabel(playerLabel).userId))
            }
        })
        message.reply(msg.slice(0, -2));

        //
        // roll the dices
        let roller = die(6);

        // roll neutral
        let result = { n: [], i: {} }
        _.forIn(groupDiceToRoll.i, (value: number, playerLabel: string) => {
            result.i[playerLabel] = []
        })

        for (let i = 0; i < (requestedDiceToRoll.bonus + groupDiceToRoll.n); i++) {
            result.n.push(roller(this.randomEngine))
        }

        // roll players
        _.forIn(groupDiceToRoll.i, (value: number, playerLabel: string) => {
            for (let i = 0; i < value; i++) {
                result.i[playerLabel].push(roller(this.randomEngine))
            }
        })

        // 3. put back all sucess from neutral & i/player
        let success = 5
        let neutralSucess = result.n.filter(value => value >= success).length
        game.dices.neutral += neutralSucess
        _.forIn(groupDiceToRoll.i, (value: number, playerLabel: string) => {
            game.dices.players[playerLabel] += result.i[playerLabel].filter(value => value >= success).length
        })

        msg = this.commandHandler.getTranslator().cmd.roll.rolled_dices
        if (result.n.length > 0) {
            msg += this.commandHandler.getTranslator().cmd.roll.rolled_neutral_dices(neutralSucess, result.n.join(', '))
        }
        _.forIn(groupDiceToRoll.i, (value: number, playerLabel: string) => {
            if (result.i[playerLabel].length > 0) {
                msg += this.commandHandler.getTranslator().cmd.roll.rolled_player_dices(
                    result.i[playerLabel].filter(value => value >= success).length,
                    result.i[playerLabel].join(', '),
                    NiceMessage.notify(game.playerByLabel(playerLabel).userId)
                )
            }
        })

        return message.reply(msg.slice(0, -1));
    }
    
    private extractRequestedDices(message: Message, player: Player, game: Game): Result<GroupOfDiceRequest, Error> {
        // explode message to group of values
        // trim to avoid exterm blank characters
        let regex = new RegExp('^' + this.prefix + '(' + this.name + '|' + this.name[0] + ')' + RollGameHandler.regexParts.join(''))
        let matched = message.content.trim().match(regex)
        if (isNullOrUndefined(matched) || isNullOrUndefined(matched.groups)) {
            return Result.err(new Error(this.commandHandler.getTranslator().cmd.roll.error.miss_match))
        }

        // extract number of dice to roll
        let requestedDiceToRoll = new GroupOfDiceRequest()

        requestedDiceToRoll.bonus = matched.groups.bonus ? Number.parseInt(matched.groups.bonus.replace('+', '')) : 0

        if (isNaN(requestedDiceToRoll.bonus)) {
            requestedDiceToRoll.bonus = 0;
        }

        // TODO extract i from other

        // extract dice groups
        let dices = matched.groups.dices.split('+');
        let regexDices = new RegExp(RollGameHandler.regexDicesParts.join(''));
        for (let dice of dices) {
            // trim to avoid exterm blank characters
            let matchedDice = dice.trim().match(regexDices);
            if (matchedDice && matchedDice.groups.group) {
                let val = matchedDice.groups.value ? Number.parseInt(matchedDice.groups.value) : 0;
                if (isNaN(val)) {
                    val = 0;
                }

                if (matchedDice.groups.group === 'i') {
                    requestedDiceToRoll.dices.i[player.label] = val
                    continue
                }
                requestedDiceToRoll.dices[matchedDice.groups.group] = val
            }
        }

        return Result.ok(requestedDiceToRoll)
    }
}
