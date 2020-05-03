import { Message } from 'discord.js'
import { isNullOrUndefined } from 'util'
import container from '../inversify.config'
import { TYPES } from '../types'

export class ErrorMessage {
    private static translator

    public static noGameInitilized(message: Message) {
        ErrorMessage.init()
        return message.reply(ErrorMessage.translator.error.no_game_found)
    }

    public static noPlayerFound(message: Message) {
        ErrorMessage.init()
        return message.reply(ErrorMessage.translator.error.no_player_found)
    }

    private static init() {
        if (isNullOrUndefined(ErrorMessage.translator)) {
            ErrorMessage.translator = container.get(TYPES.Translator)
        }
    }
}
