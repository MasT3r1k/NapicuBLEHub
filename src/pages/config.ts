import { CommandUsageMessage } from "./interfaces/IConsole";
import { ConsoleCommand } from "./utils/Command";

export const COOKIES_LEFT_PANEL_WIDTH_NAME: string = "left_panel_width";
export const COOKIES_CONSOLE_PANEL_HEIGHT_NAME: string = "console_panel_height";
export const COOKIES_CONSOLE_PANEL_LAYOUT_WIDTH_NAME: string = "console_panel_layout";

export const COOKIES_SERVICES_ALIASES_NAME: string = "services_aliases";
export const COOKIES_CHARACTERISTICS_ALIASES_NAME: string = "characteristics_aliases";

export const COOKIES_UNWATCHED_CHARACTERISTICS: string = "unwatched_characteristics";

export const COOKIES_SELECTED_CHARACTERISTIC: string = "selected_char";

export const DEFAULT_CHARACTERISTICS_WATCH: boolean = true;

// Sizes
export const SIZE_LEFT_PANEL_DEFAULT_WIDTH: number = 380;
export const SIZE_LEFT_PANEL_MIN_WIDTH: number = 240;
export const SIZE_LEFT_PANEL_MAX_WIDTH: number = 0; // UNUSED

export const SIZE_CONSOLE_PANEL_DEFAULT_HEIGHT: number = 430;
export const SIZE_CONSOLE_PANEL_MIN_HEIGHT: number = 200;
export const SIZE_CONSOLE_PANEL_MAX_HEIGHT: number = 50; 

export const SIZE_CONSOLE_PANEL_SPLIT_DEFAULT_WIDTH: number = 500;
export const SIZE_CONSOLE_PANEL_SPLIT_MIN_WIDTH: number = 240;
export const SIZE_CONSOLE_PANEL_SPLIT_MAX_WIDTH: number = 150; 

// Commands 
export const COMMAND_SUBSCRIBE: ConsoleCommand = new ConsoleCommand("subscribe", ["sub"], [
    {
        name: "uuid",
        type: "UUID",
        usage_description: "The UUID of the characteristic you want to subscribe to."
    }
]);

export const COMMAND_UNSUBSCRIBE: ConsoleCommand = new ConsoleCommand("unsubscribe", ["un"], [
    {
        name: "uuid",
        type: "UUID",
        usage_description: "The UUID of the characteristic you want to unsubscribe from."
    }
]); 

export const COMMAND_WRITE: ConsoleCommand = new ConsoleCommand("write", [], [
    {
        name: "uuid",
        type: "UUID",
        usage_description: "The UUID of the characteristic you want to write to."
    },
    {
        name: "message",
        type: "text",
        usage_description: "The data to be written to the characteristic."
    }
]);

export const COMMAND_READ: ConsoleCommand = new ConsoleCommand("read", [], [
    {
        name: "uuid",
        type: "UUID",
        usage_description: "The UUID of the characteristic you want to read from."
    },
]);


export function GET_ALL_COMMANDS(): ConsoleCommand[] {
    return [
        COMMAND_SUBSCRIBE,
        COMMAND_UNSUBSCRIBE,
        COMMAND_WRITE,
        COMMAND_READ
    ];
}

export function GET_ALL_COMMANDS_NAMES(): string[] {
    return GET_ALL_COMMANDS().map((command: ConsoleCommand) => command.get_command_name());
}

export function GET_COMMAND_BY_NAME(command_name: string): ConsoleCommand | null {
    return GET_ALL_COMMANDS().find((command: ConsoleCommand) => 
        command.get_command_name().toLowerCase() === command_name.toLowerCase() || 
        command.get_shortcuts().find((shortcut: string) => shortcut.toLowerCase() === command_name.toLowerCase())
    ) || null;
}
