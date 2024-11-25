import React, { useState, useRef, useEffect } from "react";
import { DeviceReactViewProps } from "./interfaces/Idevice";
import { ConnectedDeviceCharViewProps } from "@/types/ble_device";
import { formatTime, ICharacteristicsHistoryData } from "./CharacteristicsReqHistory";


const CharacteristicsView = ({ characteristic }: ConnectedDeviceCharViewProps): JSX.Element => {

    const writeInput = useRef<HTMLInputElement>(null);
    const [writeInputValue, setWriteInputValue] = useState<string>("");

    const [writeButtonInputError, setWriteButtonInputError] = useState<boolean>(false);


    const [characteristicHistory, setCharacteristicHistory] = useState(characteristic.history.history_list);

    const handleWriteKeyDownInput = (event: React.KeyboardEvent<HTMLInputElement>, uuid: string) => {
        if (event.key === "Enter") {
            console.log("clicked");
            addToHistory({ property: "write", time: formatTime(new Date()), value: writeInputValue });
            on_click_write_button();
        }
    };

    const addToHistory = (item: ICharacteristicsHistoryData) => {
        characteristic.history.add(item);
        setCharacteristicHistory([...characteristic.history.history_list]);
    };


    const handleWriteInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWriteButtonInputError(false);
        setWriteInputValue(event.target.value);
    };

    const on_click_read_button = (): void => {

    }

    const on_click_write_button = (): void => {
        if (writeInputValue.length) {

        } else {
            writeInput.current?.select();


            setWriteButtonInputError(false);
            setTimeout(() => {
                setWriteButtonInputError(true);
            });

        }
    }

    const on_click_notify_button = (): void => {
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
                    {characteristicHistory.map((value: ICharacteristicsHistoryData) => (
                        <div className="is-flex has-text-weight-bold">
                            <div className="characteristics-read-view-time">
                                {value.time}
                                <span className="characteristics-write-span">{'<<'}</span>
                            </div>
                            <div className="characteristics-read-view-value">{value.value}</div>
                        </div>
                    ))}


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
                    <button className="button characteristics-properties-read-button has-text-white has-text-weight-bold">
                        <span>Read</span>
                    </button>

                    {/* Write */}

                    <button className="button characteristics-properties-write-button has-text-white has-text-weight-bold" onClick={on_click_write_button}>
                        <span>Write</span>
                    </button>

                    {/* Notify */}
                    <button className="button characteristics-properties-notify-button has-text-white has-text-weight-bold">
                        <span>Notify</span>
                    </button>

                </div>

            </div>
        </div>



    )
}

export default CharacteristicsView;