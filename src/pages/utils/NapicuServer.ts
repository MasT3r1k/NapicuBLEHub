import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/types/next";
import { DefaultEventsMap, Server as SocketIOServer } from "socket.io";
import noble from "@abandonware/noble";
import { Device } from "@/types/ble_device";
import NapicuLOG from "./NapicuLogger";
import { log } from "console";


export default class NapicuServer {
  private io:  SocketIOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

  private is_scanning: boolean = false;

  private time_id: NodeJS.Timeout | null = null;

  private found_peripheral: noble.Peripheral[] = [];

  private connected_peripheral_index: number | null = null;


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
      
      socket.emit("scan_status", this.is_scanning);

      socket.on("start_scan", this.start_scan);

      socket.on("stop_scan", this.stop_scan);

      socket.on("connect_device", this.connect);

      socket.on("disconnect", () => {
        const client_count: number = this.io.sockets.sockets.size;
        NapicuLOG.LOG_I("Client has disconnected. Number of connected clients:", client_count);
        
        if (client_count === 0) {
          NapicuLOG.LOG_I("No clients connected.");

          this.stop_scan();
          this.found_peripheral = [];
        }
      });
    });

    //On noble change
    noble.on("stateChange", this.noble_change);
  }

  private connect = (address: string): void => {
    for (let index = 0; index < this.found_peripheral.length; index++) {
      const peripheral: noble.Peripheral = this.found_peripheral[index];
      if(peripheral.address === address) {
        NapicuLOG.LOG_I("Connecting to:", peripheral.advertisement.localName);
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
              this.on_peripheral_connected();
            });

            peripheral.on("disconnect", () => {
              NapicuLOG.LOG_I("Disconnected from:", peripheral.advertisement.localName);
              this.on_peripheral_disconnect();
              this.connected_peripheral_index = null;
            });

            peripheral.on("rssiUpdate", (rssi: number) => {
              this.on_peripheral_rssi_update(rssi);
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

  private start_scan = (): void => {
    if (!this.is_scanning) {
      //On noble discover
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