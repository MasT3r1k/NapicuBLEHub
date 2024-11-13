export interface Device {
    uuids: string[]
    name: string;
    address: string
}
  
export interface ConnectingDevice {
    address: string,
    local_name: string
}