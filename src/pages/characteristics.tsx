import React, { useState, useRef, useEffect } from "react";
import { CharacteristicOperation, CharacteristicRequest, ConnectedDeviceCharViewProps } from "@/types/ble_device";
import { CharacteristicOperationHistory, formatTime } from "./CharacteristicsReqHistory";
import { useSocket } from "./Socket";


const CharacteristicsView = ({ characteristic }: ConnectedDeviceCharViewProps): JSX.Element => {
    const socket = useSocket();

    const writeInput = useRef<HTMLInputElement>(null);
    const [writeInputValue, setWriteInputValue] = useState<string>("");
    const [writeButtonInputError, setWriteButtonInputError] = useState<boolean>(false);
    const [characteristicHistory, setCharacteristicHistory] = useState(characteristic.history.history_list);

    const handleWriteKeyDownInput = (event: React.KeyboardEvent<HTMLInputElement>, uuid: string) => {
        if (event.key === "Enter") {
            on_click_write_button();
        }
    };

    const addToHistory = (item: CharacteristicOperationHistory) => {
        characteristic.history.add(item);
        setCharacteristicHistory([...characteristic.history.history_list]);
    };

    useEffect(() => {
        setCharacteristicHistory(characteristic.history.history_list);
    }, [characteristic]);

    useEffect(() => {
        if (!socket) return;
       //TODO OFF reactStrictMode 
        console.log("Socket in characteristics.tsx loaded");
        console.log(socket);
    }, []);

    const handleWriteInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWriteButtonInputError(false);
        setWriteInputValue(event.target.value);
    };

    const on_click_read_button = (): void => {
        if(characteristic.properties.includes("read")) {
            const data: CharacteristicRequest = {type: "read", value: null, uuid: characteristic.uuid};
            socket.emit("read", data);
        }
    }

    const on_click_write_button = (): void => {
        if(characteristic.properties.includes("write")) {
            if (writeInputValue.length) {
                addToHistory({ type: "write", timestamp: formatTime(new Date()), value: writeInputValue });
            } else {
                writeInput.current?.select();

                setWriteButtonInputError(false);
                setTimeout(() => {
                    setWriteButtonInputError(true);
                });
            }
            setWriteInputValue("");
        }
    }

    const on_click_notify_button = (): void => {
        if(characteristic.properties.includes("notify")) {
            
        }
    }


    return (
        <div className="characteristics-options">
            {/* {characteristic?.uuid || "null"} */}

            <div className="is-flex is-flex-direction-column">
                <div className="mb-3 has-text-weight-bold">
                    <div>
                        UUID: {characteristic.uuid}
                    </div>
                    <div>
                        Properties: {characteristic.properties.join(', ')}
                    </div>
                </div>



                <div className="characteristics-read-view is-relative">
                    <div className="characteristics-read-view-lines">
                        {characteristicHistory.map((value: CharacteristicOperationHistory) => (
                            <div className="is-flex has-text-weight-bold">
                                <div className="characteristics-read-view-time">
                                    {value.timestamp}
                                    <span className="characteristics-write-span">{'<<'}</span>
                                </div>
                                <div className="characteristics-read-view-value">{value.value}</div>
                            </div>
                        ))}

                    </div>



                    {/* <div className="is-flex has-text-weight-bold">
                        <div className="characteristics-read-view-time">
                            15:30:45
                            <span className="characteristics-read-span">{'>>'}</span>
                        </div>
                        <div className="characteristics-read-view-value">Zařízení poslalo, že master je sigma!</div>
                    </div> */}

                    <div className={`characteristics-write-input uuid-input ${writeButtonInputError ? 'characteristics-write-input-error' : ''}`}>
                        <input
                            ref={writeInput}
                            type="text"
                            placeholder="Write a message"
                            onChange={handleWriteInputChange}
                            value={writeInputValue || ""}
                            onKeyDown={(e) => handleWriteKeyDownInput(e, characteristic.uuid)}
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="characteristics-options-buttons">

                    {/* Read */}
                    <button className={`button characteristics-properties-read-button has-text-white has-text-weight-bold 
                        ${!characteristic.properties.includes("read") ? 'button-unabled' : ''}`} onClick={on_click_read_button}>
                        <span>Read</span>
                    </button>

                    {/* Write */}
                    <button className={`button characteristics-properties-write-button has-text-white has-text-weight-bold 
                        ${!characteristic.properties.includes("write") ? 'button-unabled' : ''}`} onClick={on_click_write_button}>
                        <span>Write</span>
                    </button>

                    {/* Notify */}
                    <button className={`button characteristics-properties-notify-button has-text-white has-text-weight-bold 
                        ${!characteristic.properties.includes("notify") ? 'button-unabled' : ''}`} onClick={on_click_notify_button}>
                        <span>Notify</span>
                    </button>

                </div>

            </div>
        </div>



    )
}

export default CharacteristicsView;