export enum ListenerEvents {
    ListenerError = "listenerError"
}

export enum Events {
    UnknownMessageCommandName = "unknownMessageCommandName",
    CommandDoesNotHaveMessageCommandHandler = "commandDoesNotHaveMessageCommandHandler",

    PossibleMessageCommand = "possibleMessageCommand",
    PreMessageCommandRun = "preMessageCommandRun",
    MessageCommandDisabled = "messageCommandDisabled",
    MessageCommandDenied = "messageCommandDenied",
    MessageCommandAccepted = "messageCommandAccepted",
    MessageCommandError = "messageCommandError",

    RegisteringCommand = "registeringCommand",
    CommandRegistered = "commandRegistered"
}
