import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types";
import { Bot } from "./bot";
import { Client } from "discord.js";
import { CommandHandler } from "./services/command-handler";
import { Store } from "./services/store";

let container = new Container();

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string>(TYPES.Token).toConstantValue(process.env.TOKEN);
container.bind<CommandHandler>(TYPES.CommandHandler).to(CommandHandler).inSingletonScope();
container.bind<string>(TYPES.DB_DSN).toConstantValue(process.env.DB_DSN);
container.bind<Store>(TYPES.Store).to(Store).inSingletonScope;

export default container;
