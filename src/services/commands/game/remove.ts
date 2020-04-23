import { AddDiceHandler } from "./add";

export class RemoveDiceHandler extends AddDiceHandler {
    public name = 'remove'

    public help(): string {
        return '**' + this.prefix + this.name + '**: act simillary to add command, but to remove dice from the pool.'
    }

    protected extractValueOperations(matched: RegExpMatchArray, regex: RegExp, userId: string) {
        let values = super.extractValueOperations(matched, regex, userId);

        // because we remove data, we need to invert the values
        values.forEach((value, index) => {
            value.value = - value.value
            values[ index ] = value
        });

        return values
    }
}
