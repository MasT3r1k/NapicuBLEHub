import React, { useState, useRef, useEffect } from "react";
import { DeviceReactViewProps } from "./interfaces/Idevice";
import { ConnectedDeviceCharViewProps } from "@/types/ble_device";


const CharacteristicsView = ({ characteristic }: ConnectedDeviceCharViewProps): JSX.Element => {


    return (
        <div className="characteristics-options">
            {/* {characteristic?.uuid || "null"} */}

            <div className="is-flex is-flex-direction-column">
                <div className="characteristics-read-view">
                    <div className="is-flex has-text-weight-bold">
                        <div className="characteristics-read-view-time">15:30:45{'>'}</div>
                        <div className="characteristics-read-view-value">42 fd fd df df </div>
                    </div>


                </div>

                {/* Buttons */}
                <div className="characteristics-options-buttons">

                    {/* Read */}
                    <button className="button characteristics-properties-read has-text-white has-text-weight-bold">
                        Read
                    </button>

                    {/* Write */}

                    <button className="button characteristics-properties-write has-text-white has-text-weight-bold">
                        Write
                    </button>

                    {/* Notify */}
                    <button className="button characteristics-properties-notify has-text-white has-text-weight-bold">
                        Notify
                    </button>

                </div>

            </div>
        </div>



    )
}

export default CharacteristicsView;