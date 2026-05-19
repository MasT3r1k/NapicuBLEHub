import {ConsoleCommand} from "@/pages/utils/Command";

export interface ConsoleViewRef {
    consolePrint: (msg: string, show_name?: boolean) => void;
    consolePrintError: (msg: string) => void;
    consolePrintWrongCommand: (command_name: string) => void;
    printUsageError: (command: ConsoleCommand, error_message: string | null) => void;
    clearConsole: () => void;
    clearLogs: () => void;
}