import { AddDiceHandler } from './add'

export class RemoveDiceHandler extends AddDiceHandler {
    public name = 'remove'

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
