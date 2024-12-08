import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/types/next";
import { DefaultEventsMap, Server as SocketIOServer } from "socket.io";
import noble from "@abandonware/noble";
import { ConnectedDevice, ConnectedDeviceChar, BLEDeviceService, ConnectingDevice, Device, CharacteristicOperation, CharacteristicRequest, CharacteristicResponse } from "@/types/ble_device";
import NapicuLOG from "./NapicuLogger";
import { NapicuLogView } from "../console";

interface ConnectedDeviceCharacteristicsServerData {

}


export default class NapicuServer {
  private io:  SocketIOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

  private is_scanning: boolean = false;

  private time_id: NodeJS.Timeout | null = null;

  private rssi_update_time_id: NodeJS.Timeout | null = null;

  private found_peripheral: noble.Peripheral[] = [];

  private connected_device: noble.Peripheral | null = null;

  private connected_device_characteristics: noble.Characteristic[] | null = null;

  private client_connected_device_data: ConnectedDevice | null = null;


  constructor(req: NextApiRequest, res: NextApiResponseServerIO) {
    NapicuLOG.LOG_I("Starting...");

    const httpServer: NetServer = res.socket.server as any;
    this.io = new SocketIOServer(httpServer, {
      path: "/api/socketio",
    });

    res.socket.server.io = this.io;
  }

  public init(): void {
    //On client connect
    this.io.on("connection", (socket) => {
      NapicuLOG.LOG_I("New client connected.");
  
      for(const device of this.cast_noble_peripherals_to_device(this.found_peripheral)) {
        socket.emit("device", device);
      }

      if(this.connected_device) this.io.emit("connected_device", this.client_connected_device_data);
      
      socket.emit("scan_status", this.is_scanning);

      socket.on("start_scan", this.start_scan);

      socket.on("stop_scan", this.stop_scan);

      socket.on("connect_device", this.connect);

      socket.on("read", this.characteristic_read);

      socket.on("write", this.characteristic_write);

      socket.on("disconnect", () => {
        const client_count: number = this.io.sockets.sockets.size;
        NapicuLOG.LOG_I("Client has disconnected. Number of connected clients:", client_count);
        
        if (client_count === 0) {
          NapicuLOG.LOG_I("No clients connected.");
          if(this.connected_device) this.connected_device.disconnect();
          if(this.rssi_update_time_id) clearInterval(this.rssi_update_time_id);
          this.stop_scan();
          NapicuLOG.LOG_I("Setting found_peripheral to []...");
          this.found_peripheral = [];
          // NapicuLOG.LOG_I("Restarting Noble.");
          // noble.reset();
        }
      });
    });

    //On noble change
    noble.on("stateChange", this.noble_change);
  }

  private connect = (address: string): void => {
    //TODO IF connected
    for (let index = 0; index < this.found_peripheral.length; index++) {
      const peripheral: noble.Peripheral = this.found_peripheral[index];
      if(peripheral.address === address) {
        NapicuLOG.LOG_I("Connecting to:", peripheral.advertisement.localName);
        const emit_data: ConnectingDevice = {address: peripheral.address, local_name: peripheral.advertisement.localName};
        this.io.emit("connecting", emit_data);
        this.stop_scan();
        noble.removeListener("discover", this.noble_discover);
        noble.startScanning([], true);

        let connection_timeout: NodeJS.Timeout = setTimeout(() => {
          noble.stopScanning();
          NapicuLOG.LOG_E("Failed to connect to:", peripheral.advertisement.localName);
        }, 5000);

        noble.on('discover', (found_peripheral: noble.Peripheral) => {
          if(found_peripheral.address == peripheral.address && found_peripheral.connectable) {
            clearTimeout(connection_timeout);
            noble.removeListener("discover", this.noble_discover);
            noble.stopScanning();

            peripheral.connect();
          
            peripheral.on("connect", () => {
              NapicuLOG.LOG_I("Successfully connected to:", peripheral.advertisement.localName);
              NapicuLOG.LOG_I("Discovering all services and characteristics...");

              //TODO -> func
              peripheral.discoverAllServicesAndCharacteristicsAsync().then((value: noble.ServicesAndCharacteristics) => {
                NapicuLOG.LOG_I("Successfully discovered all services and characteristics.");

                this.connected_device_characteristics = [];
                const peripheral_services: BLEDeviceService[] = value.services.map<BLEDeviceService>((service: noble.Service) => {
                  this.connected_device_characteristics?.push(...service.characteristics);

                  return {
                    uuid: service.uuid,
                    name: service.name,
                    type: service.type,
                    char_length: service.characteristics.length,
                    chars: service.characteristics.map<ConnectedDeviceChar>((characteristic: noble.Characteristic) => {
                      return {
                        uuid: characteristic.uuid,
                        properties: characteristic.properties
                      }
                    })
                  }
                });

                const connected_device_data: ConnectedDevice = {
                  address: peripheral.address,
                  local_name: peripheral.advertisement.localName,
                  services: peripheral_services
                }
  
                peripheral.on("rssiUpdate", (rssi: number) => {
                  this.io.emit("connected_device_rssi", rssi);
                  this.on_peripheral_rssi_update(rssi);
                });
  
                peripheral.updateRssi();
                this.rssi_update_time_id = setInterval(() => {
                  peripheral.updateRssi();
                }, 2000);
           
                peripheral.on("disconnect", () => {
                  NapicuLOG.LOG_I("Disconnected from:", peripheral.advertisement.localName);
                  this.on_peripheral_disconnect();
                  if(this.rssi_update_time_id) clearInterval(this.rssi_update_time_id);
                  this.connected_device?.removeAllListeners();
                  this.connected_device = null;
                  this.client_connected_device_data = null;
                  this.connected_device_characteristics = null;
                  //TODO Emit
                });
  
                this.connected_device = peripheral;
                this.found_peripheral = [];
                NapicuLOG.LOG_I("Setting found_peripheral to []...");
                this.io.emit("connected_device", connected_device_data);
                this.client_connected_device_data = connected_device_data;
                this.on_peripheral_connected();

              }).catch((e: any) => {
                //TODO EMIT
                NapicuLOG.LOG_E("Failed to discover services and characteristics:", e);
              });
            });
          }
        });
      }
    }
  }

  private on_peripheral_connected(): void {
    
  }

  private on_peripheral_disconnect(): void {

  }

  private on_peripheral_rssi_update(rssi: number): void {
    
  }

  private characteristic_read = (data: CharacteristicRequest): void => {
    const characteristic: noble.Characteristic | undefined = this.connected_device_characteristics?.find((characteristic: noble.Characteristic) => characteristic.uuid == data.uuid);
    if(characteristic) {
      characteristic.read((error: string, buf: Buffer) => {
        if(error) {
          NapicuLOG.LOG_E(`Failed to read data from characteristic with UUID: (${data.uuid}) Error:`, error);
          return;
        } 

        this.emit_data_response(buf, data.uuid);
        NapicuLOG.LOG_I(`Successfully read data from characteristic with UUID: (${data.uuid}):`, buf.toString('utf8'));
      });
    } else {
      NapicuLOG.LOG_E(`Characteristic with UUID: (${data.uuid}) not found!`);
    }
  }

  private characteristic_write = (data: CharacteristicRequest): void => {
    const characteristic: noble.Characteristic | undefined = this.connected_device_characteristics?.find((characteristic: noble.Characteristic) => characteristic.uuid == data.uuid);
    
    if(characteristic && data.value !== null) {
      characteristic.write(Buffer.from(data.value.toString()), true, (error: string) => {
        if(error) {
          NapicuLOG.LOG_E(`Failed to write data to characteristic with UUID: (${data.uuid}). Error:`, error);
          return;
        }

        NapicuLOG.LOG_I(`Successfully wrote data to characteristic with UUID: (${data.uuid}):`, data.value);
      });
    } else {
      NapicuLOG.LOG_E(`Characteristic with UUID: (${data.uuid}) not found!`);
    }
  }

  private emit_data_response(data: Buffer, uuid: string): void {
    const response_data: CharacteristicResponse = {
      data: data.toString('utf8'),
      uuid: uuid
    };

    this.io.emit("characteristic_response", response_data)
  }

  private start_scan = (): void => {
    if (!this.is_scanning) {
      //On noble discover
      noble.reset();
      NapicuLOG.LOG_I("Restarting BLE.");
      noble.on("discover", this.noble_discover);
      NapicuLOG.LOG_I("Starting BLE scan...");

      this.is_scanning = true;
    
      noble.startScanning([], true);
      this.emit_scan_status();

      this.time_id = setTimeout(() => {
        this.stop_scan();
      }, 10000);
    }
  }

  private stop_scan = (): void => {
    if (this.is_scanning) {
      NapicuLOG.LOG_I("Stopping BLE scan...");
      noble.stopScanning();
      this.is_scanning = false;
      this.emit_scan_status();
    }

    if(this.time_id) clearTimeout(this.time_id);
  }

  private noble_change = (state: string): void => {
    if (state === "poweredOn") {
      //TODO EMIT
      NapicuLOG.LOG_I("BLE adapter powered on.");

    } else {
      //TODO EMIT
      NapicuLOG.LOG_E("BLE adapter is not powered on.");

      noble.stopScanning();
    }
  }

  private noble_discover = (peripheral: noble.Peripheral) => {
    if (!this.found_peripheral.some((d: noble.Peripheral) => d.address === peripheral.address)) {
      this.found_peripheral.push(peripheral);

      this.io.emit("device", this.cast_noble_peripherals_to_device(peripheral));
    }
  }

  private emit_scan_status(): void {
    this.io.emit("scan_status", this.is_scanning);
  }


  private cast_noble_peripherals_to_device(peripherals: noble.Peripheral[]): Device[];
  private cast_noble_peripherals_to_device(peripheral: noble.Peripheral): Device;
  private cast_noble_peripherals_to_device(peripherals: noble.Peripheral | noble.Peripheral[]): Device | Device[] {
    if (Array.isArray(peripherals)) {
      return peripherals.map((peripheral) => ({
        uuids: [peripheral.uuid],
        name: peripheral.advertisement.localName || "Unknown",
        address: peripheral.address,
      }));
    } else {
      return {
        uuids: [peripherals.uuid],
        name: peripherals.advertisement.localName || "Unknown",
        address: peripherals.address,
      };
    }
  }
}