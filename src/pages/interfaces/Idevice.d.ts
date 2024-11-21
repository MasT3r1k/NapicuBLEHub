import { ConnectedDevice, ConnectedDeviceChar } from "@/types/ble_device";

export interface DeviceReactViewProps {
    device: ConnectedDevice;
}

export interface ConnectedDeviceCharacteristicData extends ConnectedDeviceChar {
    alias: string | null;
}

export interface ConnectedDeviceServiceData {
    uuid: string,
    alias: string | null,
    chars: ConnectedDeviceCharacteristicData[]
}