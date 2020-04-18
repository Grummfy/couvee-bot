import { Message } from "discord.js";
import { CommandAbstract } from "../command-abstract";
import { NiceMessage } from "../../helper/nice-message";

export class AboutHandler extends CommandAbstract {
    public name = '#about';

    public help(): string {
        return this.name + ' some information about myself'
    }

    public handle(message: Message): Promise<Message | Message[]> {
        let msg: string[] = [
            'I\'m a bot created by Grummfy',
            'You can find me [online](https://github.com/Grummfy/couvee-bot.git) if you want to change me.',
            'My license is [AGPL v3](https://raw.githubusercontent.com/Grummfy/couvee-bot/master/LICENSE)',
            '',
            'This bot is an help for the rpg [La Couvée](http://editions-6napse.fr/#product-new-born)'
        ];

        return message.reply(NiceMessage.wrap(msg.join("\n")));
    }
}
