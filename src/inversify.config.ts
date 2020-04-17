import "reflect-metadata";
import {Container} from "inversify";
import {TYPES} from "./types";
import {Bot} from "./bot";
import {PingFinder} from "./services/commands/ping-finder";
import {Client} from "discord.js";
import { CommandHandler } from "./services/command-handler";
import { HelpHandler } from "./services/commands/help";

let container = new Container();

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string>(TYPES.Token).toConstantValue(process.env.TOKEN);
container.bind<PingFinder>(TYPES.PingFinder).to(PingFinder).inSingletonScope();
container.bind<CommandHandler>(TYPES.CommandHandler).to(CommandHandler).inSingletonScope();
container.bind<HelpHandler>(TYPES.HelpHandler).to(HelpHandler).inSingletonScope();

export default container;
