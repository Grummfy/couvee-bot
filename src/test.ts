
import * as _ from "lodash"

let regexParts = [
    // start
    '^',
    // command
    '!(r|roll) ',
    // cc dices
    '(?<dices>(\\+?\\s*([0-9]*)\\s*(g|i|n)\\s*)*)',
    // bonus dices
    '(?<bonus>\\+?\\s*([0-9]*))?',
    // end
    '$',
]

let regexDicesParts = [
    // start
    '^',
    // main roll
    '(?<value>[0-9]*)\\s*',
    '\\s*(?<group>(g|i|n))',
    '$',
]

let regex = new RegExp(regexParts.join(''))

let test = [
    ['!r 5g', 5, 0, 0, 0],
    ['!r 3i', 0, 3, 0, 0],
    ['!r 1n', 0, 0, 1, 0],
    ['!r 5g+2', 5, 0, 0, 2],
    ['!r 5g+3i', 5, 3, 0, 0],
    ['!r 3i+2', 0, 3, 0, 2],
    ['!r 3i+1n+2', 0, 3, 1, 2],
    ['!r 3 i + 1 n  +         2', 0, 3, 1, 2],
    ['!r 5g+3i+2', 5, 3, 0, 2],
]
/*
for (const testValue of test) {
    console.log('-----------');
    console.log(('' + testValue[0]))
    let matched = ('' + testValue[0]).match(regex)
    if (!matched) {
        console.error('--');
        continue
    }

    let values = {
        dices: {
            i: 0,
            g: 0,
            n: 0,
        },
        bonus: matched.groups.bonus ? Number.parseInt(matched.groups.bonus.replace('+', '')) : 0
    }

    let dices = matched.groups.dices.split('+')

    let regexDices = new RegExp(regexDicesParts.join(''))

    for (const dice of dices) {
        let matchedDice = dice.trim().match(regexDices)
        console.log(matchedDice, dice)
        if (matchedDice && matchedDice.groups.group) {
            values.dices[ matchedDice.groups.group ] = matchedDice.groups.value ? Number.parseInt(matchedDice.groups.value) : 0
        }
    }

    if (
        values.bonus !== testValue[4] || 
        values.dices.g !== testValue[1] || 
        values.dices.i !== testValue[2] || 
        values.dices.n !== testValue[3]
    ) {
        console.error('FAILED')
        console.error(values, testValue)
        continue
    }
    console.error('SUCCESS')
}
*/
/*
  * #r Xg+Yi+Z : launch **X** dice taken randomly from the cc**g**, **Y** from the cc**i**, **Z** from the bonus
* #r Xg : launch **X** dice taken randomly from the cc**g** (group dice)
* #r Xi : launch **X** dice from the cc**i** (from yourself) and eventually add some neutral or whatever stay there
* #r Xg+Y : launch **X** dice from the cc**g** then add **Y** bonus dice
* #r Xg+Yi : launch **Y** dice from the cc**i** then add **X** dice from the cc**g**
* #r Xn+Yi : launch **Y** dice from the cc**i** then add **X** dice from the cc**g**
* */



let string = '5n <@!272393424819191808> 6i <@!272393> 3i <@&701048092882894909>'
regex = new RegExp('(?<value>\\s*([0-9]*))\\s*(?<group>(i|n))\\s*(?<user><@(!|&)([0-9]*)>)?', 'g')
let matchedRegex = string.match(regex)
console.log(matchedRegex)
for (let mg of matchedRegex) {
    console.log(mg.match(new RegExp(regex, '')).groups)
}
