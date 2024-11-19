import React, { useState, useRef, useEffect } from "react";
import { ConnectedDevice, ConnectedDeviceChar, ConnectedDeviceService } from "@/types/ble_device";
import { DeviceViewProps } from "./interfaces/Idevice";


const ConsoleView = ({ device }: DeviceViewProps): JSX.Element => {


    const inputDivRef = useRef<HTMLDivElement>(null);

    const focusConsoleInput = (): void => {
        if (inputDivRef.current) {
            inputDivRef.current.focus();
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter") {
            event.preventDefault(); 
            const inputText = inputDivRef.current?.innerText || "";
            // if (onEnterPress) {
            //     onEnterPress(inputText); 
            // }
        }
    };

    const handleInput = () => {
        const inputText = inputDivRef.current?.innerText || "";
        // if (onInputChange) {
        //     onInputChange(inputText);
        // }
    };

    return (
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
    );
}

export default ConsoleView;