type TCommandParamType = 'text' | 'UUID';

export interface IConsoleCommandParams {
    name: string;
    type: TCommandParamType;
    usage_description: string
}

export interface IConsoleCommandOption {
    name: string
    description: string
}


export class ConsoleCommand {
    
    private declare name: string;
    
    private declare shortcuts: string[];

    private declare command_params: IConsoleCommandParams[];

    private declare command_options: IConsoleCommandOption[];

    constructor(name: string, shortcuts: string [] = [], command_params: IConsoleCommandParams[] = [], command_options: IConsoleCommandOption[] = []) {
        this.name = name;
        this.shortcuts = shortcuts;
        this.command_params = command_params;
        this.command_options = command_options;
    }

    public get_all_command_variants(): string[] {
        return [this.name, ...this.shortcuts];
    }

    public get_command_name(): string {
        return this.name;
    }

    public get_shortcuts(): string[] {
        return this.shortcuts;
    }

    public get_command_params(): IConsoleCommandParams[] {
        return this.command_params;
    }

    public get_command_options(): IConsoleCommandOption[] {
        return this.command_options;
    }
}