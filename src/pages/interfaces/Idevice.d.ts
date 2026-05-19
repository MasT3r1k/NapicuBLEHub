import type { ConnectedDevice, ConnectedDeviceChar } from "@/types/ble_device";
import { CharacteristicsReqHistory } from "../CharacteristicsReqHistory";

export interface DeviceReactViewProps {
    device: ConnectedDevice;
    device_rssi: number | undefined;
}

export interface ConsoleReactViewProps {
    device: ConnectedDevice;
    consoleHandler: (command: string, args: string[]) => void
}

export interface ConnectedDeviceCharacteristicData extends ConnectedDeviceChar {
    alias: string | null;
    history: CharacteristicsReqHistory;
    watch: boolean,
    notify?: boolean
}

export interface ConnectedDeviceServiceData {
    uuid: string,
    alias: string | null,
    chars: ConnectedDeviceCharacteristicData[]
}

export interface SelectedCharacteristicCookiesData {
    [address: string]: string;
}
