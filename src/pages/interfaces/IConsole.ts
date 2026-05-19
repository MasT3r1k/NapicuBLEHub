export interface IConsoleCommand {
    command: string,
    color: "red" | "white"
    show_name: boolean
}

export interface ILogLine {
    name: string
    message: string,
    color: "red" | "white"
}

export interface CommandUsageMessage {
    usage: string, 
    usage_details: string[]
}