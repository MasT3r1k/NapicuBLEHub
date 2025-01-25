import { EventEmitter } from "events";
import { ILogLine } from "./IConsole";

export interface ConsoleViewRef {
    consolePrint: (msg: string, show_name?: boolean) => void;
    consolePrintError: (msg: string) => void;
    consolePrintWrongCommand: (command_name: string) => void;
    printUsageError: (command: ConsoleCommand, error_message: string) => void;
}