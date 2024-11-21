import React, { useState, useRef, useEffect } from "react";
import { DeviceReactViewProps } from "./interfaces/Idevice";
import { IConsoleCommand } from "./interfaces/IConsole";


const ConsoleView = ({ device }: DeviceReactViewProps): JSX.Element => {

    const [consoleLines, setConsoleLines] = useState<IConsoleCommand[]>([]);

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
            
            if(console_input.length) {
                const command_parts: string[] = console_input.split(" ");

                switch (console_input.toLowerCase()) {
                    case "clear":
                        clearConsole();
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
        setConsoleLines((prevLines) => [...prevLines, {command: msg, color: "white", show_name}]);
    }

    const consolePrintError = (msg: string) => {
        setConsoleLines((prevLines) => [...prevLines, {command: msg, color: "red", show_name: false}]);
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

    return (
        <div>
            {consoleLines.map((line: IConsoleCommand, index: number) => (
                <div key={index} className="is-flex">
                    {line.show_name && (
                        <div>
                            {'['}{device.local_name}{']'}{'>'}
                        </div>
                    )}

                    <div className={`console ${line.color === "red" ? 'console-red-line' : ''}`}>
                        <div>{line.command}</div>
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
    );
}

export default ConsoleView;