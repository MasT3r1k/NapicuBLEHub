import { ConnectedDevice } from "@/types/ble_device";
import { useEffect, useState } from "react";

interface DeviceViewProps {
    device: ConnectedDevice;
  }

const DeviceView = ({device}: DeviceViewProps): JSX.Element => {
    return (
        <div>
            {device.rssi}
        </div>
    )
}

export default DeviceView;