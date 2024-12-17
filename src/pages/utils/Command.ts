
export class ConsoleCommand {
    
    private declare name: string;
    private declare shortcuts: string[];

    constructor(name: string, shortcuts: string [] = []) {
        this.name = name;
        this.shortcuts = shortcuts;
    }

    public get_all_command_variants(): string[] {
        return [this.name, ...this.shortcuts];
    }

    public get_command_name(): string {
        return this.name;
    }
}