import { ConnectedDevice, ConnectedDeviceChar } from "@/types/ble_device";
import { CharacteristicsReqHistory } from "../CharacteristicsReqHistory";

export interface DeviceReactViewProps {
    device: ConnectedDevice;
}

export interface ConnectedDeviceCharacteristicData extends ConnectedDeviceChar {
    alias: string | null;
    history: CharacteristicsReqHistory;
    watch: boolean
}

export interface ConnectedDeviceServiceData {
    uuid: string,
    alias: string | null,
    chars: ConnectedDeviceCharacteristicData[]
}

export interface SelectedCharacteristicCookiesData {
    [address: string]: string;
}
