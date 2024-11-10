export default class NapicuLOG {
    private static logLevel: number = parseInt(process.env.NAPICU_SERVER_LOG_LEVEL || "2");

    public static LOG_I(message: string, ...optionalParams: any[]): void {
        if(this.logLevel >= 2) {
            console.log(`\x1b[33m[NapicuServer]\x1b[0m\x1b[34m - ${message}\x1b[0m`, ...optionalParams);

        }
    }

    public static LOG_E(message: string, ...optionalParams: any[]): void {
        if(this.logLevel >= 1) {
            console.log(`\x1b[33m[NapicuServer]\x1b[0m\x1b[31m - ${message}\x1b[0m`, ...optionalParams);
        }
    }

    public static LOG_S(message: string, ...optionalParams: any[]): void {
        if(this.logLevel >= 2) {
            console.log(`\x1b[33m[NapicuServer]\x1b[0m\x1b[32m - ${message}\x1b[0m`, ...optionalParams);
        }
    }

    /**
     * Disables all logs.
     */
    public static DISABLE_LOGS(): void {
        NapicuLOG.logLevel = -1;
    }

    /**
     * Sets the logging level for the NapicuLOG class.
     * 
     * @param level The logging level that determines which logs will be shown.
     *              Possible values:
     *              - `-1`: Disables all logs.
     *              - `1`: Only error logs will be shown.
     *              - `2`: Shows error, success, and info logs.
     */
    public static SET_LOG_LEVEL(level: number): void {
        NapicuLOG.logLevel = level;
    }
}