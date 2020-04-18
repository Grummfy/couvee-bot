import { injectable } from "inversify";
import { Message } from "discord.js";
import { CommandAbstract } from "../command-abstract";

@injectable()
export class PingFinder extends CommandAbstract {
    public name = 'ping';

    public help(): string {
        return this.prefix + this.name + ' print pong response, mainly used to check if this working properly'
    }

    public handle(message: Message): Promise<Message | Message[]> {
        return message.reply('pong!');
    }
}
