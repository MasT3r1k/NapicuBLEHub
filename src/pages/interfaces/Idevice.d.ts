import { ConnectedDevice } from "@/types/ble_device";

export interface DeviceViewProps {
    device: ConnectedDevice;
}

export interface DeviceServiceUUID {
    uuid: string,
    alias: string | null
}