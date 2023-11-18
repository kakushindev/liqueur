import { Result } from "@sapphire/result";
import { IPreconditionCondition } from "./IPreconditionCondition.js";
import { PreconditionContainerResult } from "../IPreconditionContainer.js";

export const PreconditionConditionOr: IPreconditionCondition = {
    async messageSequential(data, args, command, entries, context) {
        let error: PreconditionContainerResult | null = null;
        for (const child of entries) {
            const result = await child.messageRun(data, args, command, context);
            if (result.isOk()) return result;
            error = result;
        }

        return error ?? Result.ok();
    },
    async messageParallel(data, args, command, entries, context) {
        const results = await Promise.all(entries.map(entry => entry.messageRun(data, args, command, context)));

        let error: PreconditionContainerResult | null = null;
        for (const result of results) {
            if (result.isOk()) return result;
            error = result;
        }

        return error ?? Result.ok();
    }
};
