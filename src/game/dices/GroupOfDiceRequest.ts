import * as _ from 'lodash'

export class GroupOfDiceRequest {
    public dices = {
        i: {},
        g: 0,
        n: 0,
    }
    public bonus = 0

    public totalRequestedFromPool(): number {
        return this.dices.n + this.dices.g + (_.values(this.dices.i).length > 0 ? _.values<number>(this.dices.i).reduce((sum, value) => sum + value) : 0)
    }
}
