import { Message } from "discord.js";
import { injectable } from "inversify";
import { CommandAbstract } from "../command-abstract";
import { Command } from "../../contracts/Command";
import { NiceMessage } from "../../helper/nice-message";

@injectable()
export class HelpHandler extends CommandAbstract {
    public name = '#help';

    public help(): string {
        return this.name + ' display help message ;)'
    }

    public handle(message: Message): Promise<Message | Message[]> {
        return message.reply('hummm, that\'s not normal ;)');
    }

    public showHelp(message: Message, handlers: Command[]): Promise<Message | Message[]> {
        let messages: string[] = [this.help()];
        for (let handler of handlers) {
            messages.push(handler.help());
        }

        return message.reply(NiceMessage.wrap(messages.join("\n")));
    }
}
