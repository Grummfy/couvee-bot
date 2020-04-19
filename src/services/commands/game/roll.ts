import { Message } from "discord.js"
import { CommandAbstract } from "../../command-abstract"
import { Engine, dice, die } from 'random-js';
import container from "../../../inversify.config";
import { TYPES } from "../../../types";
import { isNullOrUndefined } from "util";

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
        let game = this.gameManager.getGameFromMessage(message)
        if (!game) {
            return message.reply('kO! mother wil eath you... grrr No game defined, start a new one with ' + this.prefix + 'start Xp')
        }

        // explode message to group of values
        // trim to avoid exterm blank characters
        let regex = new RegExp('^' + this.prefix + '(' + this.name + '|' + this.name[0] + ')' + RollGameHandler.regexParts.join(''))
        let matched = message.content.trim().match(regex)
        if (isNullOrUndefined(matched) || isNullOrUndefined(matched.groups)) {
            return message.reply('Sorry I didn\'t understand your request')
        }

        // extract number of dice to roll
        let values = this.extractDiceValues(matched);

        // roll the dices
        let roller = die(6);
        let neutralDice = values.bonus + values.dices.n

        // TODO
        // 1. take random dice (values.g) => groupDice.n + groupDice.i
        let groupDice = {i: {player2: 3, player5: 1}, n: 2}
        // 2. get results
        // roll neutral (values.bonus + values.dices.n + groupDice.n)
        // roll cci/player (values.i ? + groupDice.i[ current player ])
        // 3. put back all sucess from neutral & i/player

//        if (values.bonus) {
 //           
   //         dice(6, values.bonus)(this.randomEngine)
            /*
                return engine => {
        const result = [];
        for (let i = 0; i < dieCount; ++i) {
            result.push(distribution(engine));
        }
        return result;
    };
*/
//        }

        return message.reply('enjoy! TODO') // + values.join(', '))
    }

    private extractDiceValues(matched: RegExpMatchArray) {
        let values = {
            dices: {
                i: 0,
                g: 0,
                n: 0,
            },
            bonus: matched.groups.bonus ? Number.parseInt(matched.groups.bonus.replace('+', '')) : 0
        };
        if (isNaN(values.bonus)) {
            values.bonus = 0;
        }
        // extract dice groups
        let dices = matched.groups.dices.split('+');
        let regexDices = new RegExp(RollGameHandler.regexDicesParts.join(''));
        for (let dice of dices) {
            // trim to avoid exterm blank characters
            let matchedDice = dice.trim().match(regexDices);
            if (matchedDice && matchedDice.groups.group) {
                values.dices[matchedDice.groups.group] = matchedDice.groups.value ? Number.parseInt(matchedDice.groups.value) : 0;
                if (isNaN(values.dices[matchedDice.groups.group])) {
                    values.dices[matchedDice.groups.group] = 0;
                }
            }
        }
        return values;
    }
}
