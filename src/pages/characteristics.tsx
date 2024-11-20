import React, { useState, useRef, useEffect } from "react";
import { DeviceViewProps } from "./interfaces/Idevice";
import { ConnectedDeviceCharViewProps } from "@/types/ble_device";


const CharacteristicsView = ({ characteristic }: ConnectedDeviceCharViewProps): JSX.Element => {


    return (
        <div>{characteristic?.uuid || "null"}</div>
    )
}

export default CharacteristicsView;