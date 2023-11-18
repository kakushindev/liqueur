import { ApplyOptions } from "@nezuchan/decorators";
import { Listener, ListenerOptions } from "../../stores/Listener.js";
import { Events } from "../../constants/EventEnums.js";
import { proto } from "@whiskeysockets/baileys";
import { Command } from "../../stores/Command.js";
import { ArgumentStream, Parser } from "@sapphire/lexure";
import { Result } from "@sapphire/result";

@ApplyOptions<ListenerOptions>({
    event: Events.PreMessageCommandRun
})
export class preMessageCommandRun extends Listener {
    public async run({ msg, command, rawArgs }: { msg: proto.IWebMessageInfo; command: Command; rawArgs: string[] }): Promise<any> {
        const parser = new Parser(command.strategy);
        const stream = new ArgumentStream(parser.run(command.lexer.run(rawArgs.slice(1).join(" "))));
        const payload = { msg, command, rawArgs };

        const globalResult = await this.container.stores.get("preconditions").messageRun(msg, stream, command, payload);
        if (globalResult.isErr()) {
            this.container.client.emit(Events.MessageCommandDenied, globalResult.unwrapErr(), payload);
            return;
        }

        const localResult = await payload.command.preconditions.messageRun(msg, stream, command, payload);
        if (localResult.isErr()) {
            this.container.client.emit(Events.MessageCommandDenied, localResult.unwrapErr(), payload);
            return;
        }

        const result = await Result.fromAsync(() => command.messageRun!(msg, stream));
        if (result.isOk()) {
            this.container.client.emit(Events.MessageCommandAccepted, payload);
        } else {
            this.container.client.emit(Events.MessageCommandError, result.unwrapErr(), payload);
        }
    }
}
