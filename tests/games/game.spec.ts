import 'reflect-metadata'
import 'mocha'
import { expect } from 'chai'
import { Game } from '../../src/game/game'
import { Player } from '../../src/game/player'
import { TYPES } from '../../src/types'
import container from '../../src/inversify.config'
import * as _ from 'lodash'
import { GroupOfDiceRequest } from '../../src/game/dices/GroupOfDiceRequest'
import { Engine } from 'random-js'
import { GroupDiceToRoll } from '../../src/game/dices/GroupDiceToRoll'

// init container
require('dotenv').config()

describe('Game', () => {
    let game: Game
    let translator: any

    beforeEach(() => {
        // create mock instances
        translator = container.get(TYPES.Translator)

        // init command
        game = new Game()

        // init some values related to game
        game.guildId = 'guild1'
        game.channelId = 'channel2'
        game.changeLang('en')
    })

    it('should be valid', () => {
        expect(game.isValid()).to.be.true
    })

    it('should not be ready', () => {
        expect(game.isReady()).to.be.false
    })

    describe('game initilized', () => {
        beforeEach(() => {
            game.players['playerAbc123'] = new Player()
            game.players['playerAbc123'].label = 'player1'
            game.players['playerAbc123'].instinct = game.dices.players['player1'] = 3
            game.players['playerAbc123'].userId = 'playerAbc123'

            game.players['playerDef456'] = new Player()
            game.players['playerDef456'].label = 'player2'
            game.players['playerDef456'].instinct = game.dices.players['player2'] = 1
            game.players['playerDef456'].userId = 'playerDef456'

            game.dices.neutral = 8 // 4 * 2 players
        })

        it('should be ready', () => {
            expect(game.isReady()).to.be.true
        })

        it('should find players', () => {
            expect(game.playerByLabel('player1')).to.have.property('label').equal('player1')
            expect(game.playerByLabel('player1')).to.have.property('userId').equal('playerAbc123')

            expect(game.playerByUserId('playerAbc123')).to.have.property('label').equal('player1')
        })

        it('should change dice number', () => {
            expect(game.modifyDiceNumber('i', 1, null, false), 'null player when change i').to.be.false
            expect(game.modifyDiceNumber('i', 1, undefined, false), 'undefined player when change i').to.be.false

            expect(game.dices.players['player1']).to.be.equal(3)
            expect(game.modifyDiceNumber('i', 1, 'yolo', false), 'not a player when change i').to.be.false

            expect(game.dices.players['player1']).to.be.equal(3)
            expect(game.modifyDiceNumber('i', 1, 'playerAbc123', true), 'set player dice value in game').to.be.true
            expect(game.dices.players['player1']).to.be.equal(1)

            expect(game.modifyDiceNumber('i', 2, 'playerAbc123', false), 'change player dice value in game').to.be.true
            expect(game.dices.players['player1']).to.be.equal(3)

            expect(game.modifyDiceNumber('i', 1, 'playerAbc123', false), 'change player dice value in game with overflow').to.be.false
            expect(game.dices.players['player1']).to.be.equal(3)

            expect(game.modifyDiceNumber('i', -4, 'playerAbc123', false), 'change player dice value in game with underflow').to.be.false
            expect(game.dices.players['player1']).to.be.equal(3)

            expect(game.modifyDiceNumber('i', -1, 'playerAbc123', false), 'change (minus operation) player dice value in game').to.be.true
            expect(game.dices.players['player1']).to.be.equal(2)

            expect(game.modifyDiceNumber('n', -1, null, false), 'change neutral (minus operation) dice value in game').to.be.true
            expect(game.dices.neutral).to.be.equal(7)

            expect(game.modifyDiceNumber('n', 2, null, false), 'change neutral (plus operation) dice value in game').to.be.true
            expect(game.dices.neutral).to.be.equal(9)

            expect(game.modifyDiceNumber('n', -10, undefined, false), 'change neutral dice value in game with underflow').to.be.false
            expect(game.dices.neutral).to.be.equal(9)
        })

        it('availableDice()', () => {
            expect(game.availableDice(true), 'available dice, player only').equal(4)
            expect(game.availableDice(false), 'available dice, all').equal(12)
        })

        describe('checkRequestedDiceIsPossible()', () => {
            let diceRequest: GroupOfDiceRequest
            let diceRequest2: GroupOfDiceRequest
            beforeEach(() => {
                diceRequest = new GroupOfDiceRequest()
                diceRequest2 = new GroupOfDiceRequest()
            })

            it('should be ok to request no dice', () => {
                expect(game.checkRequestedDiceIsPossible(diceRequest)).to.be.true
                expect(_.isEqual(diceRequest, diceRequest2)).to.be.true
            })

            it('should be ok to request bonus dice', () => {
                diceRequest.bonus = diceRequest2.bonus = 2
                expect(game.checkRequestedDiceIsPossible(diceRequest)).to.be.true
                expect(_.isEqual(diceRequest, diceRequest2)).to.be.true
            })

            it('should be ok to request neutral dice when available', () => {
                diceRequest.dices.n = diceRequest2.dices.n = 2
                expect(game.checkRequestedDiceIsPossible(diceRequest)).to.be.true
                expect(_.isEqual(diceRequest, diceRequest2)).to.be.true
            })

            it('should be ok to request group dice when available', () => {
                diceRequest.dices.g = diceRequest2.dices.g = 2
                expect(game.checkRequestedDiceIsPossible(diceRequest)).to.be.true
                expect(_.isEqual(diceRequest, diceRequest2)).to.be.true
            })

            it('should be ok to request player dice when available', () => {
                diceRequest.dices.i['player1'] = diceRequest2.dices.i['player1'] = 1
                expect(game.checkRequestedDiceIsPossible(diceRequest)).to.be.true
                expect(_.isEqual(diceRequest, diceRequest2)).to.be.true
            })

            it('should not be ok to request neutral dice when not available', () => {
                diceRequest.dices.n = diceRequest2.dices.n = 200
                expect(game.checkRequestedDiceIsPossible(diceRequest)).to.be.false
                expect(_.isEqual(diceRequest, diceRequest2)).to.be.true
            })

            it('should not be ok to request group dice when not available', () => {
                diceRequest.dices.g = diceRequest2.dices.g = 200
                expect(game.checkRequestedDiceIsPossible(diceRequest)).to.be.false
                expect(_.isEqual(diceRequest, diceRequest2)).to.be.true
            })

            it('should not be ok to request player dice when not available', () => {
                diceRequest.dices.i['player1'] = diceRequest2.dices.i['player1'] = 200
                expect(game.checkRequestedDiceIsPossible(diceRequest)).to.be.false
                expect(_.isEqual(diceRequest, diceRequest2)).to.be.true
            })

            it('should be ok to request group dice of global level', () => {
                diceRequest.dices.g = diceRequest2.dices.g = 12
                expect(game.checkRequestedDiceIsPossible(diceRequest)).to.be.true
                expect(_.isEqual(diceRequest, diceRequest2)).to.be.true
            })

            it('should shift neutral to group, when not enough neutral dice', () => {
                diceRequest.dices.n = 10
                diceRequest2.dices.n = 8
                diceRequest2.dices.g = 2
                expect(game.checkRequestedDiceIsPossible(diceRequest)).to.be.true
                expect(_.isEqual(diceRequest, diceRequest2)).to.be.true
            })

            it('should shift player to group, when not enough player dice', () => {
                diceRequest.dices.i['player1'] = 5
                diceRequest2.dices.g = 2
                diceRequest2.dices.i['player1'] = 3
                expect(game.checkRequestedDiceIsPossible(diceRequest)).to.be.true
                expect(_.isEqual(diceRequest, diceRequest2)).to.be.true
            })
        })

        describe('getGroupOfDiceToRollFromRequest()', () => {
            let diceRequest: GroupOfDiceRequest
            let diceRequest2: GroupOfDiceRequest
            let groupDice: GroupDiceToRoll
            let engine = container.get<Engine>(TYPES.RandomEngine)

            beforeEach(() => {
                diceRequest = new GroupOfDiceRequest()
                diceRequest2 = new GroupOfDiceRequest()
                groupDice = new GroupDiceToRoll()
            })

            it('should be ok to request available dice', () => {
                groupDice.init(game)
                diceRequest.dices.n = diceRequest2.dices.n = groupDice.n = 2
                diceRequest.dices.i['player1'] = diceRequest2.dices.i['player1'] = groupDice.i['player1'] = 1

                let result = game.getGroupOfDiceToRollFromRequest(diceRequest, translator, engine)
                expect(result.isOk).to.be.true

                expect(_.isEqual(result.unwrap(), groupDice)).to.be.true
                expect(_.isEqual(diceRequest, diceRequest2), 'no change on dice request').to.be.true
            })

            it('should not be ok to request unavailable dice', () => {
                diceRequest.dices.n = 200

                let result = game.getGroupOfDiceToRollFromRequest(diceRequest, translator, engine)
                expect(result.isErr).to.be.true
            })

            it('should be ok to request available dice, but with some shift', () => {
                diceRequest.dices.n = 10
                diceRequest2.dices.n = groupDice.n = 8
                diceRequest2.dices.g = 2

                let result = game.getGroupOfDiceToRollFromRequest(diceRequest, translator, engine)
                expect(_.isEqual(diceRequest, diceRequest2)).to.be.true

                expect(result.isOk).to.be.true

                let resultDice = result.unwrap()
                expect(resultDice.n).to.be.equal(8)
            })
        })
    })
})
