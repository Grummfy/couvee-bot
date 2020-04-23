import { Message } from "discord.js";

export class ErrorMessage {
    public static noGameInitilized(message: Message) {
        return message.reply('No game found, you start a new game with "' + process.env.PREFIX + 'start Xplayer" where X is the number of players.')
    }

    public static noPlayerFound(message: Message) {
        return message.reply('No player found...')
    }
}
