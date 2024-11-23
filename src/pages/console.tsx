import React, { useState, useRef, useEffect } from "react";
import { DeviceReactViewProps } from "./interfaces/Idevice";
import { IConsoleCommand, ILogLine } from "./interfaces/IConsole";
import { COOKIES_CHARACTERISTICS_ALIASES_NAME, COOKIES_CONSOLE_PANEL_LAYOUT_WIDTH_NAME, COOKIES_SERVICES_ALIASES_NAME } from "./config";
import NapicuCookies from "./Cookies";


export let consoleLogLines: ILogLine[] = [];

const ConsoleView = ({ device }: DeviceReactViewProps): JSX.Element => {

    const [consoleLines, setConsoleLines] = useState<IConsoleCommand[]>([]);


    const [leftPanelResizing, setLeftPanelResizing] = useState<boolean>(false);
    const [leftPanelWidth, setLeftPanelWidth] = useState<number>(
        () => NapicuCookies.getCookies<number>(COOKIES_CONSOLE_PANEL_LAYOUT_WIDTH_NAME) || 500);

    const inputDivRef = useRef<HTMLDivElement>(null);

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
            if (newWidth >= 240 && window.innerWidth - moveEvent.screenX >= 150) setLeftPanelWidth(newWidth);

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
            <div className="console-right is-relative">
                <div className={`left-view-bar-resizer is-relative" ${leftPanelResizing ? 'view-bar-resizer-selected' : ''}`} onMouseDown={handleMouseDownLeftResizer}></div>
                <div>
                    {consoleLogLines.map((line: ILogLine, index: number) => (
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