
import { Storable } from "../contracts/Storable";

export class Player implements Storable {
    // the label to name the player
    public label: string
    // the value of the "mind"
    public mind: number = 0
    // the id associated to the user
    public userId: string

    public toStorage(): object {
        return {
            label: this.label,
            mind: this.mind,
            userId: this.userId,
        };
    }

    public fromStorage(data) {
        this.label = data.label
        this.mind = data.mind
        this.userId = data.userId
    }
}
