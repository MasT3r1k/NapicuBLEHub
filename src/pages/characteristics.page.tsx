import React, {useState, useRef, useEffect, JSX} from "react";
import { CharacteristicRequest, ConnectedDeviceCharViewProps } from "@/types/ble_device";
import { CharacteristicOperationHistory, formatTime } from "./CharacteristicsReqHistory";
import { useSocket } from "./Socket";

const CharacteristicsView = ({ characteristic, onWatchChange  }: ConnectedDeviceCharViewProps): React.JSX.Element | null => {
    const socket = useSocket();

    const writeInput = useRef<HTMLInputElement>(null);
    const [writeInputValue, setWriteInputValue] = useState<string>("");
    const [writeButtonInputError, setWriteButtonInputError] = useState<boolean>(false);
    const [characteristicHistory, setCharacteristicHistory] = useState(characteristic?.history.history_list);

    const logContainerRef = useRef<HTMLDivElement>(null);

    const [isWatchChecked, setIsWatchChecked] = useState<boolean>(characteristic?.watch);

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handle_write_key_down_input = (event: React.KeyboardEvent<HTMLInputElement>, uuid: string) => {
        if (event.key === "Enter") {
            on_click_write_button();
        }
    };

    const add_to_history = (item: CharacteristicOperationHistory): void => {
        characteristic.history.add(item);
        setCharacteristicHistory([...characteristic.history.history_list]);
    };

    const clear_history = (): void => {
        characteristic.history.clear();
        setCharacteristicHistory([]);
    }

    useEffect(() => {
        setCharacteristicHistory(characteristic.history.history_list);
        setIsWatchChecked(characteristic.watch);
    }, [characteristic]);

    useEffect(() => {
        if (logContainerRef.current) {
          logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [characteristicHistory]);

    const handle_write_input_change = (event: React.ChangeEvent<HTMLInputElement>) => {
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

                const data: CharacteristicRequest = {type: "write", value: writeInputValue, uuid: characteristic.uuid};
                socket.emit("write", data);

                add_to_history({ type: "write", timestamp: formatTime(new Date()), value: writeInputValue });
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

    const on_click_clear_button = (): void => {
        clear_history();
    }

    const on_click_notify_button = (): void => {
        if(characteristic.properties.includes("notify")) {
            const data: CharacteristicRequest = {type: "notify", value: null, uuid: characteristic.uuid};
            socket.emit("notify", data);
        }
    }

    const handle_checkbox_change = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsWatchChecked(event.target.checked);
        if (onWatchChange) {
            onWatchChange(characteristic.uuid, event.target.checked); 
        }
    };

    if (!isClient) {
        return null;
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
                    <div className="characteristics-read-view-lines" ref={logContainerRef}>
                        {characteristicHistory.map((value: CharacteristicOperationHistory, index: number) => (
                            <div key={index} className="is-flex has-text-weight-bold">
                                <div className="characteristics-read-view-time">
                                    {value.timestamp}
                                    <span
                                        className={
                                            value.type === "write"
                                            ? "characteristics-write-span"
                                            : "characteristics-read-span"
                                        }
                                        >
                                        {value.type === "write" ? "<<" : ">>"}
                                    </span>
                                </div>
                                <div className="characteristics-read-view-value">{value.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className={`characteristics-write-input uuid-input ${writeButtonInputError ? 'characteristics-write-input-error' : ''}`}>
                        <input
                            ref={writeInput}
                            type="text"
                            placeholder="Write a message"
                            onChange={handle_write_input_change}
                            value={writeInputValue || ""}
                            onKeyDown={(e) => handle_write_key_down_input(e, characteristic.uuid)}
                            disabled={!characteristic.properties.includes("write")}
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="characteristics-options-buttons is-flex is-justify-content-space-between is-align-content-center">
                    <div>
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
                            ${!characteristic.properties.includes("notify") ? 'button-unabled' : ''}
                            ${characteristic.notify ? 'characteristics-properties-unsubscribe-button' : ''}`} 
                            onClick={on_click_notify_button}
                            >
                                <span>
                                    {characteristic.notify ? 'Unsubscribe' : 'Notify'}
                                </span>
                        </button>
                    </div>

                    <div className="is-flex is-align-content-center">

                        {/* Clear */}
                        <button className="button characteristics-properties-write-button has-text-white has-text-weight-bold" onClick={on_click_clear_button}>
                            <span>Clear</span>
                        </button>

                        {/* Watch */}
                        <div className="mr-2 has-text-weight-bold ">
                            Watch: 
                        </div>

                        {/* Watch Slider */}
                        <label className="np-char-switch">
                            <input 
                                type="checkbox" 
                                checked={isWatchChecked} 
                                onChange={handle_checkbox_change} />
                            <span className="np-char-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CharacteristicsView;