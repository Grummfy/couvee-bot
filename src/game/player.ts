
import { Storable } from '../contracts/Storable'

export class Player implements Storable {
    // the label to name the player
    public label: string
    // the value of the 'instinct'
    public instinct: number = 0
    // the id associated to the user
    public userId: string

    public toStorage(): object {
        return {
            label: this.label,
            instinct: this.instinct,
            userId: this.userId,
        };
    }

    public fromStorage(data) {
        this.label = data.label
        this.instinct = data.instinct
        this.userId = data.userId
    }
}
