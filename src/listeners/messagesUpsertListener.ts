import { Listener, ListenerOptions } from "../stores/Listener.js";
import { BaileysEventMap } from "@whiskeysockets/baileys";
import { Events } from "../constants/EventEnums.js";
import { ApplyOptions } from "@nezuchan/decorators";

@ApplyOptions<ListenerOptions>({
    event: "messages.upsert",
    emitter: "baileysEmitter"
})
export class MessagesUpsert extends Listener {
    public async run({ messages }: BaileysEventMap["messages.upsert"]): Promise<any> {
        const messageData = messages[0];
        const findMessage = messageData.message?.conversation?.length
            ? messageData.message.conversation
            : messageData.message?.extendedTextMessage?.text ??
            messageData.message?.imageMessage?.caption ??
            messageData.message?.videoMessage?.caption ??
            messageData.message?.documentWithCaptionMessage?.message
                ?.documentMessage?.caption ??
            messageData.message?.groupInviteMessage?.caption ??
            messageData.message?.liveLocationMessage?.caption;

        if (messageData.key.fromMe && !this.container.client.options.allowSelfCommand) return;
        const prefix = await this.container.client.options.fetchPrefix(messageData);
        if (findMessage?.startsWith(prefix)) {
            this.container.client.emit(
                Events.PossibleMessageCommand, messageData, findMessage.substring(1)
            );
        }
    }
}
