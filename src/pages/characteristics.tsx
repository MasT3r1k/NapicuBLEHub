import React, { useState, useRef, useEffect } from "react";
import { DeviceReactViewProps } from "./interfaces/Idevice";
import { ConnectedDeviceCharViewProps } from "@/types/ble_device";


const CharacteristicsView = ({ characteristic }: ConnectedDeviceCharViewProps): JSX.Element => {


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
                    <div className="is-flex has-text-weight-bold">
                        <div className="characteristics-read-view-time">15:30:45{'>'}</div>
                        <div className="characteristics-read-view-value">Zařízení poslalo, že master je sigma! </div>
                    </div>

                    <div className="characteristics-write-input uuid-input">
                        <input type="text" placeholder="Write a message" />
                    </div>
                </div>

                {/* Buttons */}
                <div className="characteristics-options-buttons">

                    {/* Read */}
                    <button className="button characteristics-properties-read-button has-text-white has-text-weight-bold">
                        <span>Read</span>
                    </button>

                    {/* Write */}

                    <button className="button characteristics-properties-write-button has-text-white has-text-weight-bold">
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