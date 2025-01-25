import React, { useState, useRef, useEffect, useImperativeHandle } from "react";
import { ConsoleReactViewProps } from "./interfaces/Idevice";
import { IConsoleCommand, ILogLine } from "./interfaces/IConsole";
import { COOKIES_CHARACTERISTICS_ALIASES_NAME, COOKIES_CONSOLE_PANEL_LAYOUT_WIDTH_NAME, COOKIES_SELECTED_CHARACTERISTIC, COOKIES_SERVICES_ALIASES_NAME, COOKIES_UNWATCHED_CHARACTERISTICS, DEFAULT_CHARACTERISTICS_WATCH, GET_ALL_COMMANDS_NAMES, GET_COMMAND_BY_NAME, SIZE_CONSOLE_PANEL_SPLIT_DEFAULT_WIDTH, SIZE_CONSOLE_PANEL_SPLIT_MAX_WIDTH, SIZE_CONSOLE_PANEL_SPLIT_MIN_WIDTH } from "./config";
import NapicuCookies from "./Cookies";
import { EventEmitter } from 'events';
import { ConsoleCommand, IConsoleCommandParams } from "./utils/Command";
import { BLEDeviceService, ConnectedDeviceChar } from "@/types/ble_device";
import { ConsoleViewRef } from "./interfaces/IConsoleViewRef";


export class NapicuLogView {
    private static consoleLogLines: ILogLine[] = [];
    private static eventEmitter = new EventEmitter();
  
    public static get_lines(): ILogLine[] {
      return this.consoleLogLines;
    }
  
    public static print(value: ILogLine): void {
      this.consoleLogLines.push(value);
      this.eventEmitter.emit('update');
    }
  
    public static clear(): void {
      this.consoleLogLines = [];
      this.eventEmitter.emit('update');
    }
  
    public static subscribe(callback: () => void): () => void {
      this.eventEmitter.on('update', callback);
      return () => this.eventEmitter.off('update', callback);
    }
}

const ConsoleView = React.forwardRef<ConsoleViewRef, ConsoleReactViewProps>(({ device, consoleHandler }: ConsoleReactViewProps, ref: React.ForwardedRef<ConsoleViewRef>): JSX.Element => {
    const [logLines, setLogLines] = useState<ILogLine[]>(NapicuLogView.get_lines());

    const [consoleLines, setConsoleLines] = useState<IConsoleCommand[]>([]);
    const [leftPanelResizing, setLeftPanelResizing] = useState<boolean>(false);
    const [leftPanelWidth, setLeftPanelWidth] = useState<number>(
        () => NapicuCookies.getCookies<number>(COOKIES_CONSOLE_PANEL_LAYOUT_WIDTH_NAME) || SIZE_CONSOLE_PANEL_SPLIT_DEFAULT_WIDTH);

    const inputDivRef = useRef<HTMLDivElement>(null);
    const logContainerRef = useRef<HTMLDivElement>(null);

    const [allCharacteristicsUUID, setAllCharacteristicsUUID] = useState<string[]>([]);

    const selectedCommandIndex = useRef<number>(0);
    const commandsPredictor = useRef<string[] | null>(null);

    useImperativeHandle(ref, () => ({
        consolePrint,
        consolePrintError,
        consolePrintWrongCommand,
        printUsageError
    }));

    const focusConsoleInput = (): void => {
        if (inputDivRef.current) {
            inputDivRef.current.focus();
        }
    }

    const console_clear_command = (args: string[]): void => {
        switch(args[0]) {
            case "all": 
                break;

            case "logs": 
                //TODO Print success 
                setLogLines([]);
                break;
            default: 
                //TODO Delete all or help command
                clearConsole();
                break;
        }
    } 

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {   
        if (event.key === "ArrowUp" || event.key === "ArrowDown") handleArrowKeyDown(event);
        else if (event.key === "Tab") handleTabKeyDown(event);
        else if (event.key === "Enter") {
            const console_input: string = inputDivRef.current?.innerText || "";
            consolePrint(console_input, true);

            if (console_input.length) {
                //TODO To lower case
                const command_parts: string[] = console_input.match(/(['"])(.*?)\1|\S+/g)?.map(item => item.replace(/['"]/g, '').trim().toLowerCase()) || [];      
                const command_name: string = command_parts[0];
                const command_args: string [] = command_parts.slice(1);

                switch (command_name) {
                    case "clear":
                        console_clear_command(command_args);
                        break;
                    case "delete":
                        if (command_args[0] == "aliases") {
                            NapicuCookies.deleteCookies(COOKIES_SERVICES_ALIASES_NAME);
                            NapicuCookies.deleteCookies(COOKIES_CHARACTERISTICS_ALIASES_NAME);
                            NapicuCookies.deleteCookies(COOKIES_CONSOLE_PANEL_LAYOUT_WIDTH_NAME);
                            NapicuCookies.deleteCookies(COOKIES_SELECTED_CHARACTERISTIC);
                            NapicuCookies.deleteCookies(COOKIES_UNWATCHED_CHARACTERISTICS);
                            consolePrint("Aliases successfully deleted! Please refresh the page.");
                        } else {
                            //TODO
                            consolePrint(`Usage: [OPTION]`);
                            consolePrint(`\t aliases - Removes aliases for services and characteristics.`);
                            consolePrint(`\t sizes - Removes window sizes.`);
                        }
                        break;

                    default:
                        consoleHandler(command_name, command_args);
                        break;
                }
            }

            if (inputDivRef.current) inputDivRef.current.innerHTML = "";
            event.preventDefault(); 
        }
    };

    const consolePrint = (msg: string, show_name: boolean = false): void => {
        setConsoleLines((prevLines) => [...prevLines, { command: msg, color: "white", show_name }]);
    }

    const consolePrintError = (msg: string): void => {
        setConsoleLines((prevLines) => [...prevLines, { command: msg, color: "red", show_name: false }]);
    }

    const consolePrintWrongCommand = (command_name: string): void => {
        consolePrintError(`${command_name}: command not found. Type 'help' for more information.`);
    }

    const printUsageError = (command: ConsoleCommand, error_message: string) => {
        consolePrintError(error_message);
        consolePrint(`Usage: ${command.get_command_name()} ${command.get_command_params().map(
            (par: IConsoleCommandParams) => ` <${par.name.toUpperCase()}>`).join('')}`);
      
        const max_key_length: number = Math.max(...command.get_command_params().map((par: IConsoleCommandParams) => par.name.length));

        command.get_command_params().forEach((detail: IConsoleCommandParams) => {
                consolePrint(`\t ${detail.name.toUpperCase().padEnd(max_key_length, " ")}   - ${detail.usage_description}`);
        }); 
    }

    const handleArrowKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        event.preventDefault();
    }

    const handleTabKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const reg_input_result: RegExpMatchArray | null = (inputDivRef.current?.innerText || "").match(/(\S+|\s+)/g);
        const reg_input_without_space_result: string[] | null = reg_input_result?.filter(item => item.trim() !== '') || null;

        if(inputDivRef.current) {
            // Autocomplete for command names
            if(reg_input_without_space_result?.length && reg_input_result?.length) { 
                if(reg_input_result.length === 1) {
                    
                    if(!commandsPredictor.current) {
                        commandsPredictor.current = GET_ALL_COMMANDS_NAMES().filter((command_name: string) =>
                            command_name.startsWith(reg_input_without_space_result[0].toLowerCase())
                        );
                    }

                    inputDivRef.current.innerText = commandsPredictor.current[selectedCommandIndex.current];
                    setCursorToEnd();

                    if(selectedCommandIndex.current >= commandsPredictor.current.length - 1) {
                        selectedCommandIndex.current = 0;
                    } else selectedCommandIndex.current++;
                    
                } else if(reg_input_result.length > 1) {
                    const command: ConsoleCommand | null = GET_COMMAND_BY_NAME(reg_input_without_space_result[0]);

                    if(command) {
                        const par_count = reg_input_result.join('').replace(/\u00A0/g, ' ') .split(/ +/).length - 2;
                        const param: IConsoleCommandParams = command.get_command_params()[par_count];


                        switch (param?.type) {
                            case "text":
         
                                break;

                            case "UUID":

                                reg_input_without_space_result[par_count + 1] = allCharacteristicsUUID[selectedCommandIndex.current];;

                                inputDivRef.current.innerText = reg_input_without_space_result.join(" ");

                                setCursorToEnd();

                                if(selectedCommandIndex.current >= allCharacteristicsUUID.length - 1) {
                                    selectedCommandIndex.current = 0;
                                } else selectedCommandIndex.current++;
                                break;
                            default:
                                break;
                        }
                    }
                }
            } else {
                // Returns all available commands
                inputDivRef.current.innerText = "";
                consolePrint(inputDivRef.current.innerText, true);
                consolePrint(GET_ALL_COMMANDS_NAMES().join(", "));
            }
        } 
        event.preventDefault();
    }

    const handleInput = () => {
        selectedCommandIndex.current = 0;
        commandsPredictor.current = null;
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
        event.preventDefault(); 
        const plainText = event.clipboardData.getData("text/plain");
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents(); 
            range.insertNode(document.createTextNode(plainText)); 
        }
    };
    
    const clearConsole = () => {
        setConsoleLines([]);
    }

    const handleMouseDownLeftResizer = (event: React.MouseEvent) => {
        event.preventDefault();

        setLeftPanelResizing(true);

        let newWidth: number;
        const startX: number = event.clientX;
        const width: number = leftPanelWidth;

        const handleMouseMove = (moveEvent: MouseEvent): void => {
            newWidth = width + (moveEvent.clientX - startX);
            if (newWidth >= SIZE_CONSOLE_PANEL_SPLIT_MIN_WIDTH && window.innerWidth - moveEvent.screenX >= SIZE_CONSOLE_PANEL_SPLIT_MAX_WIDTH) setLeftPanelWidth(newWidth);

            NapicuCookies.setCookies<number>(COOKIES_CONSOLE_PANEL_LAYOUT_WIDTH_NAME, newWidth);
        };

        const handleMouseUp = (): void => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            setLeftPanelResizing(false);

            //NapicuCookies.setCookies<number>(COOKIES_LEFT_PANEL_WIDTH_NAME, letfPanelWidth);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const setCursorToEnd = () => {
        const range = document.createRange();
        const selection = window.getSelection();
      
        if (selection && inputDivRef.current) {
          range.selectNodeContents(inputDivRef.current);
          range.collapse(false); 
          selection.removeAllRanges();
          selection.addRange(range);
        }
    };

    const getAllCharUUIDs = (): string[] => {
        let uuids: string[] = [];
        device.services.forEach((service: BLEDeviceService) => {
            service.chars.forEach((char: ConnectedDeviceChar) => {
                uuids.push(char.uuid);
            });
        });
        return uuids;
    }

    useEffect(() => {
        const unsubscribe = NapicuLogView.subscribe(() => {
          setLogLines([...NapicuLogView.get_lines()]);
        });
    
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (logContainerRef.current) {
          logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logLines]);

    useEffect(() => {
        setAllCharacteristicsUUID(getAllCharUUIDs());
    }, [device]);

    return (
        <div className="console-split"> 
            {/* Left panel */}
            <div style={{ width: `${leftPanelWidth}px` }}>

                {consoleLines.map((line: IConsoleCommand, index: number) => (
                    <div key={index} className="is-flex">
                        {line.show_name && (
                            <div>
                                {'['}{device.local_name}{']'}{'>'}
                            </div>
                        )}

                        <div className={`console ${line.color === "red" ? 'console-red-line' : ''}`}>
                            <pre>{line.command}</pre>
                        </div>
                    </div>
                ))}

                <div className="is-flex">
                    <div>
                        {'['}{device.local_name}{']'}{'>'}
                    </div>
                    <div className="console" onClick={focusConsoleInput}>
                        <div
                            // @ts-ignore
                            accept="txt"
                            autoCapitalize="off"
                            autoComplete="off"
                            autoCorrect="off"
                            className="input"
                            contentEditable="true"
                            spellCheck="false"
                            ref={inputDivRef}
                            onKeyDown={handleKeyDown}
                            onInput={handleInput}
                            onPaste={handlePaste}
                        ></div>
                    </div>
                </div>
            </div>
            {/* Right panel */}
            <div className="console-right is-relative" ref={logContainerRef}>
                <div className={`left-view-bar-resizer is-relative" ${leftPanelResizing ? 'view-bar-resizer-selected' : ''}`} onMouseDown={handleMouseDownLeftResizer}></div>
                <div>
                    {logLines.map((line: ILogLine, index: number) => (
                        <div key={index} className="is-flex">
                            {line.name && (
                                <div>
                                    {'['}{line.name}{']'}{'>'}
                                </div>
                            )}

                            <div className={`console ${line.color === "red" ? 'console-red-line' : ''}`}>
                                <pre>{line.message}</pre>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
})

export default ConsoleView;