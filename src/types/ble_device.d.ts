export interface Device {
    uuids: string[]
    name: string;
    address: string
}
  
export interface ConnectingDevice {
    address: string,
    local_name: string
}

export interface ConnectedDevice {
    address: string,
    local_name: string,
    rssi: number
}