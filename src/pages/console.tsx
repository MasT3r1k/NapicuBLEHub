import React, { useState, useRef, useEffect } from "react";
import { DeviceReactViewProps } from "./interfaces/Idevice";
import { IConsoleCommand, ILogLine } from "./interfaces/IConsole";
import { COOKIES_CHARACTERISTICS_ALIASES_NAME, COOKIES_CONSOLE_PANEL_LAYOUT_WIDTH_NAME, COOKIES_SELECTED_CHARACTERISTIC, COOKIES_SERVICES_ALIASES_NAME, COOKIES_UNWATCHED_CHARACTERISTICS, DEFAULT_CHARACTERISTICS_WATCH, SIZE_CONSOLE_PANEL_SPLIT_DEFAULT_WIDTH, SIZE_CONSOLE_PANEL_SPLIT_MAX_WIDTH, SIZE_CONSOLE_PANEL_SPLIT_MIN_WIDTH } from "./config";
import NapicuCookies from "./Cookies";
import { EventEmitter } from 'events';

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
const ConsoleView = ({ device }: DeviceReactViewProps): JSX.Element => {
    const [logLines, setLogLines] = useState<ILogLine[]>(NapicuLogView.get_lines());


    const [consoleLines, setConsoleLines] = useState<IConsoleCommand[]>([]);
    const [leftPanelResizing, setLeftPanelResizing] = useState<boolean>(false);
    const [leftPanelWidth, setLeftPanelWidth] = useState<number>(
        () => NapicuCookies.getCookies<number>(COOKIES_CONSOLE_PANEL_LAYOUT_WIDTH_NAME) || SIZE_CONSOLE_PANEL_SPLIT_DEFAULT_WIDTH);

    const inputDivRef = useRef<HTMLDivElement>(null);
    const logContainerRef = useRef<HTMLDivElement>(null);

    const focusConsoleInput = (): void => {
        if (inputDivRef.current) {
            inputDivRef.current.focus();
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") handleArrowKeyDown(event);
        else if (event.key === "Enter") {
            const console_input: string = inputDivRef.current?.innerText || "";
            consolePrint(console_input, true);

            if (console_input.length) {
                const command_parts: string[] = console_input.split(" ");


                switch (command_parts[0].toLowerCase()) {
                    case "clear":
                        clearConsole();
                        break;

                    case "delete":

                        if (command_parts[1] == "aliases") {
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

                        consolePrintWrongCommand(command_parts);
                        break;
                }

            }

            //consolePrint(inputText, true);

            if (inputDivRef.current) inputDivRef.current.innerHTML = "";

            // if (onEnterPress) {
            //     onEnterPress(inputText); 
            // }


            event.preventDefault();
        }
    };

    const consolePrint = (msg: string, show_name: boolean = false) => {
        setConsoleLines((prevLines) => [...prevLines, { command: msg, color: "white", show_name }]);
    }

    const consolePrintError = (msg: string) => {
        setConsoleLines((prevLines) => [...prevLines, { command: msg, color: "red", show_name: false }]);
    }

    const consolePrintWrongCommand = (command_parts: string[]) => {
        consolePrintError(`${command_parts[0]}: command not found. Type 'help' for more information.`);
    }


    const handleArrowKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        event.preventDefault();
    }

    const handleInput = () => {
        const inputText = inputDivRef.current?.innerText || "";
        // if (onInputChange) {
        //     onInputChange(inputText);
        // }
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
}

export default ConsoleView;