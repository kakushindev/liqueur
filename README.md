<div align="center">

# liqueur

A rich-featured and flexible command framework to develop WhatsApp bot with Baileys inspired by [@sapphire](https://www.sapphirejs.dev) framework.

[![GitHub](https://img.shields.io/github/license/kakushindev/liqueur)](https://github.com/kakushindev/liqueur/blob/main/LICENSE)
[![npm](https://img.shields.io/npm/v/liqueur?color=crimson&logo=npm&style=flat-square)](https://www.npmjs.com/package/liqueur)

</div>


# Installation
```bash
npm i liqueur
```

# Usage
The usage is similar to `@sapphire/framework`, you can open [our coming soon](https://github.com/kakushindev/) example bot to get started.

## Listening to Baileys' socket
Because Baileys' event emitter is kinda different (not a pure `EventEmitter`), you can use the following options to listen to it:
```ts
@ApplyOptions<ListenerOptions>({
    event: "connection.update", // Change the event name
    emitter: "baileysEmitter" // Specify the emitter (must be "baileysEmitter" !!)
})
```
> While doing so will make the listener listens to the Baileys' event emitter. If you didn't specify the emitter name, it will listens to `FrameworkClient` internal events as defined [here](https://github.com/kakushindev/liqueur/blob/main/src/constants/EventEnums.ts)


## Handle credentials nor connection update
We didn't handle the `creds.update` nor `connection.update` event by default. To make the bot working, please handle it according to your respective auth's state handler.

For example, using `useMultiFileAuthState`:
```ts
import { container } from "@sapphire/pieces";

@ApplyOptions<ListenerOptions>({
    event: "creds.update",
    emitter: "baileysEmitter"
})
export class CredsUpdate extends Listener {
    public async run(): Promise<any> {
        await container.authState?.saveCreds();
        this.container.client.logger.info("Credentials has been updated.");
    }
}
```
...in your main file:
```ts
import { container } from "@sapphire/pieces";
import { useMultiFileAuthState, makeWASocket } from "@whiskeysockets/baileys";

const loggerOptions = createLogger({
    name: "WhatsApp-bot",
    debug: mode === "dev"
});

const client = new FrameworkClient({
    baseUserDirectory: "dist",
    fetchPrefix: () => Promise.resolve(prefix),
    makeWASocket: () => {
        container.authState = useMultiFileAuthState("auth_state");
        return makeWASocket({
            auth: {
                // Pass the auth strategy here
                creds: container.authState.state.creds,
                // @ts-expect-error-next-line
                keys: makeCacheableSignalKeyStore(container.authState.state.keys, logger)
            },
            printQRInTerminal: true
        })
    },
    logger
});
```

Don't forget to handle the reconnection:
```ts
import { Listener, ListenerOptions } from "liqueur";
import { BaileysEventMap, DisconnectReason, useMultiFileAuthState } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { cast } from "@sapphire/utilities";
import { ApplyOptions } from "@nezuchan/decorators";

@ApplyOptions<ListenerOptions>({
    event: "connection.update",
    emitter: "baileysEmitter"
})
export class ConnectionUpdate extends Listener {
    public async run({ lastDisconnect, connection }: BaileysEventMap["connection.update"]): Promise<any> {
        const shouldReconnect = cast<Boom | undefined>(lastDisconnect)?.output?.statusCode !== DisconnectReason.loggedOut;
        if (connection === "close") {
            this.container.client.logger.warn(
                `Connection closed due to ${lastDisconnect?.error?.message ?? "unknown reason"
                }, reconnecting ${shouldReconnect}`
            );
            if (shouldReconnect) {
                await this.container.client.login();
            }
        } else if (connection === "open") {
            this.container.client.logger.info("Opened connection.");
        }
    }
}
```

# Credits
Thanks to [@sapphire](https://github.com/sapphiredev/) developers for giving inspiration and concepts. This framework 100% based on their packages and designs.