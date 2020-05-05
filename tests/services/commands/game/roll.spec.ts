import 'reflect-metadata'
import 'mocha'
import { expect } from 'chai'
import { instance, mock, verify, when, spy, capture, anyString } from 'ts-mockito'
import { Message, User } from 'discord.js'
import { RollGameHandler } from '../../../../src/services/commands/game/roll'
import { GameManager } from '../../../../src/services/game-manager'
import { CommandHandler } from '../../../../src/services/command-handler'
import { Game } from '../../../../src/game/game'
import { Player } from '../../../../src/game/player'
import { TYPES } from '../../../../src/types'
import container from '../../../../src/inversify.config'
import * as _ from 'lodash'

// init container
require('dotenv').config()

describe('Command:roll', () => {
    let command: RollGameHandler
    let mockedGameManagerClass: GameManager
    let mockedGameManagerInstance: GameManager
    let mockedCommandHandlerClass: CommandHandler
    let mockedCommandHandlerInstance: CommandHandler
    let mockedMessageClass: Message
    let mockedMessageInstance: Message
    let game: Game
    let spiedGame: Game
    let prefix = '!'
    let translator: any

    beforeEach(() => {
        // create mock instances
        mockedGameManagerClass = mock(GameManager)
        mockedGameManagerInstance = instance(mockedGameManagerClass)
        mockedCommandHandlerClass = mock(CommandHandler)
        mockedCommandHandlerInstance = instance(mockedCommandHandlerClass)
        mockedMessageClass = mock(Message)
        mockedMessageInstance = instance(mockedMessageClass)
        game = new Game()
        spiedGame = spy(game)

        translator = container.get(TYPES.Translator)

        // init some values related to game
        game.guildId = 'guild1'
        game.channelId = 'channel2'
        game.changeLang('en')

        game.players['playerAbc123'] = new Player()
        game.players['playerAbc123'].label = 'player1'
        game.players['playerAbc123'].instinct = game.dices.players['player1'] = 3
        game.players['playerAbc123'].userId = 'playerAbc123'

        game.players['playerDef456'] = new Player()
        game.players['playerDef456'].label = 'player2'
        game.players['playerDef456'].instinct = game.dices.players['player2'] = 1
        game.players['playerDef456'].userId = 'playerDef456'

        game.dices.neutral = 8 // 4 * 2 players

        mockedMessageInstance.author = instance(mock(User))

        // stub response
        when(mockedGameManagerClass.getGameFromMessageAsync(mockedMessageInstance)).thenReturn(new Promise((resolve) => {
            resolve(game)
            return game
        }))
        when(mockedCommandHandlerClass.getTranslator()).thenReturn(translator)

        // init command
        command = new RollGameHandler()
        command.prefix = prefix
        command.registered(mockedCommandHandlerInstance, mockedGameManagerInstance, null)
    })

    describe('isHandled()', () => {
        it('should not handle it', () => {
            mockedMessageInstance.content = prefix + 'yoloooooo'
            expect(command.isHandled(mockedMessageInstance)).to.be.false
        })

        it('should handle it', () => {
            mockedMessageInstance.content = prefix + 'roll 1'
            expect(command.isHandled(mockedMessageInstance)).to.be.true
        })
    })

    describe('#handle()', async () => {
        it('should warn about not a player', async () => {
            mockedMessageInstance.content = prefix + 'roll 3g'
            mockedMessageInstance.author.id = 'playerMD1'

            await command.handle(mockedMessageInstance)
            verify(mockedMessageClass.reply(translator.error.no_game_found)).never()
            verify(mockedMessageClass.reply(translator.error.no_player_found)).once()
        })

        describe('rolling...', async () => {
            beforeEach(() => {
                mockedMessageInstance.author.id = 'playerAbc123'
            })

            afterEach(() => {
                verify(mockedMessageClass.reply(translator.error.no_game_found)).never()
                verify(mockedMessageClass.reply(translator.error.no_player_found)).never()
                verify(spiedGame.playerByUserId(anyString())).atLeast(1)
            })

            it('should roll group dices', async () => {
                mockedMessageInstance.content = prefix + 'roll 3g'

                await command.handle(mockedMessageInstance)

                // check response
                let response: any = capture(mockedMessageClass.reply).last()
                expect(response.length).to.be.equal(1)
                expect(_.startsWith(response[0], translator.cmd.roll.rolled_dices)).to.be.true
            })

            it('should roll neutral dices', async () => {
                mockedMessageInstance.content = prefix + 'roll 3n'

                await command.handle(mockedMessageInstance)

                // check response
                let response: any = capture(mockedMessageClass.reply).last()
                expect(response.length).to.be.equal(1)
                expect(_.startsWith(response[0], translator.cmd.roll.rolled_dices)).to.be.true
            })

            it('should roll bonus dices', async () => {
                mockedMessageInstance.content = prefix + 'roll 3'

                await command.handle(mockedMessageInstance)

                // check response
                let response: any = capture(mockedMessageClass.reply).last()
                expect(response.length).to.be.equal(1)
                expect(_.startsWith(response[0], translator.cmd.roll.rolled_dices)).to.be.true
            })

            it('should roll several dices for the given player', async () => {
                mockedMessageInstance.author.id = 'playerDef456'
                mockedMessageInstance.content = prefix + 'roll 2i' //+1n 2g+3'

                await command.handle(mockedMessageInstance)

                // check response
                let response: any = capture(mockedMessageClass.reply).last()
                expect(response.length).to.be.equal(1)
                expect(_.startsWith(response[0], translator.cmd.roll.rolled_dices)).to.be.true
            })

            it('should roll several dices', async () => {
                // mockedMessageInstance.author.id = 'playerAbc123'
                mockedMessageInstance.author.id = 'playerDef456'
                mockedMessageInstance.content = prefix + 'roll 2i+1n 2g+3'

                await command.handle(mockedMessageInstance)

                // check response
                let response: any = capture(mockedMessageClass.reply).last()
                expect(response.length).to.be.equal(1)
                expect(_.startsWith(response[0], translator.cmd.roll.rolled_dices)).to.be.true
            })
        })
    })
})
