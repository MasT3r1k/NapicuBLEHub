export interface Device {
    uuids: string[]
    name: string;
    address: string
}
  
export interface ConnectingDevice {
    address: string,
    local_name: string
}

export interface BLEDeviceService {
    uuid: string,
    name: string,
    type: string,
    char_length: number,
    chars: ConnectedDeviceChar[]
}


export interface ConnectedDeviceCharViewProps {
    characteristic: ConnectedDeviceChar;
}


export interface ConnectedDeviceChar {
    uuid: string
    properties: string[]
}

export interface ConnectedDevice {
    address: string,
    local_name: string,
    rssi: number,
    services: BLEDeviceService[]
}