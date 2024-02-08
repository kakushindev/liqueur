import { CommandStore } from "../stores/CommandStore.js";
import { PreconditionStore } from "../stores/PreconditionStore.js";
import { ListenerStore } from "../stores/ListenerStore.js";
import { makeWASocket, proto } from "@whiskeysockets/baileys";
import { LoggerOptions, createLogger } from "../utils/Logger.js";
import { Store, container, Piece } from "@sapphire/pieces";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import EventEmitter from "node:events";
import { Logger } from "pino";

export class FrameworkClient extends EventEmitter {
    public stores = container.stores;
    public socket: ReturnType<typeof makeWASocket> | undefined;
    public logger: Logger;

    public constructor(public readonly options: FrameworkClientOptions) {
        super();
        container.client = this;
        if (options.logger) {
            this.logger = options.logger;
        } else {
            if (!this.options.loggerOptions) throw new Error("FrameworkClient#loggerOptions must be passed if FrameworkClient#logger is undefined.");
            this.logger = createLogger(this.options.loggerOptions);
        }
    }

    public async login(): Promise<any> {
        this.socket = await this.options.makeWASocket();

        Object.assign(this, {
            baileysEmitter: this.socket.ev
        });

        const currentDir = dirname(fileURLToPath(import.meta.url));
        this.stores
            .register(new ListenerStore()
                .registerPath(resolve(currentDir, "..", "listeners")))
            .register(new CommandStore())
            .register(new PreconditionStore()
                .registerPath(resolve(currentDir, "..", "preconditions")));

        this.stores.registerPath(this.options.baseUserDirectory);
        await Promise.all([...this.stores.values()].map((store: Store<Piece>) => store.loadAll()));
    }
}

declare module "@sapphire/pieces" {
    interface Container {
        client: FrameworkClient;
    }

    interface StoreRegistryEntries {
        commands: CommandStore;
        listeners: ListenerStore;
        preconditions: PreconditionStore;
    }
}

export interface FrameworkClientOptions {
    baseUserDirectory?: string;
    fetchPrefix: (msg: proto.IWebMessageInfo) => Promise<string>;
    makeWASocket: () => Promise<ReturnType<typeof makeWASocket>>;
    logger?: Logger;
    loggerOptions?: LoggerOptions;
    allowSelfCommand?: boolean;
}
