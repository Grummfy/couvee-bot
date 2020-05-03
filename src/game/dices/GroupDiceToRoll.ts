import { Game } from '../game'
import { Player } from '../player'
import * as _ from 'lodash'

export class GroupDiceToRoll {
    public i = {}
    public n = 0

    public init(game: Game) {
        _.forIn(game.players, (player: Player) => {
            this.i[player.label] = 0
        })
    }
}
