import { AliasPiece, AliasPieceOptions, LoaderPieceContext } from "@sapphire/pieces";
import { FlagStrategyOptions, FlagUnorderedStrategy } from "../lib/FlagUnorderedStrategy.js";
import { ArgumentStream, IUnorderedStrategy, Lexer } from "@sapphire/lexure";
import { PreconditionContainerArray, PreconditionEntryResolvable } from "../lib/preconditions/PreconditionContainerArray.js";
import { proto } from "@whiskeysockets/baileys";
import { Awaitable } from "@sapphire/utilities";

export class Command extends AliasPiece<CommandOptions> {
    public lexer: Lexer;
    public fullCategory = this.location.directories;
    public strategy: IUnorderedStrategy;
    public preconditions: PreconditionContainerArray;

    public get category(): string | null {
        return this.fullCategory.length > 0 ? this.fullCategory[0] : null;
    }

    public get subCategory(): string | null {
        return this.fullCategory.length > 1 ? this.fullCategory[1] : null;
    }

    public get parentCategory(): string | null {
        return this.fullCategory.length > 1 ? this.fullCategory[this.fullCategory.length - 1] : null;
    }

    public constructor(context: LoaderPieceContext<"commands">, options: CommandOptions) {
        super(context, options);

        this.lexer = new Lexer({
            quotes: options.quotes ?? [
                ['"', '"'], // Double quotes
                ["“", "”"], // Fancy quotes (on iOS)
                ["「", "」"], // Corner brackets (CJK)
                ["«", "»"] // French quotes (guillemets)
            ]
        });

        this.strategy = new FlagUnorderedStrategy(options);
        this.preconditions = new PreconditionContainerArray(options.preconditions);
    }

    public messageRun?(data: proto.IWebMessageInfo, args: ArgumentStream): Awaitable<unknown>;
}

export interface CommandOptions extends AliasPieceOptions, FlagStrategyOptions {
    quotes?: [string, string][];
    preconditions?: PreconditionEntryResolvable[];
    description: string;
    usage?: string;
}
