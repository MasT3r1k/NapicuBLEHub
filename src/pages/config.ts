import { CommandUsageMessage } from "./interfaces/IConsole";

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

// Command Messages



export const COMMAND_MESSAGE_SUBSCRIBE_USAGE: CommandUsageMessage = {
    usage: "subscribe <UUID>",
    usage_details: [
        "UUID      - The UUID of the characteristic you want to subscribe to.",
    ],
}

export const COMMAND_MESSAGE_UNSUBSCRIBE_USAGE: CommandUsageMessage = {
    usage: "unsubscribe <UUID>",
    usage_details: [
        "UUID      - The UUID of the characteristic you want to unsubscribe from.",
    ],
}

export const COMMAND_MESSAGE_WRITE_USAGE: CommandUsageMessage = {
    usage: `write <UUID> "<message>"`,
    usage_details: [
        "UUID      - The UUID of the characteristic you want to write to.",
        "message   - The data to be written to the characteristic."
    ],
}

export const COMMAND_MESSAGE_READ_USAGE: CommandUsageMessage = {
    usage: "read <UUID>",
    usage_details: [
        "UUID      - The UUID of the characteristic you want to read from.",
    ],
}