import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/types/next";
import { DefaultEventsMap, Server as SocketIOServer } from "socket.io";
import noble from "@abandonware/noble";
import { Device } from "@/types/ble_device";

export default class NapicuServer {
  private io:  SocketIOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

  private is_scanning: boolean = false;

  private time_id: NodeJS.Timeout | null = null;

  private found_peripheral: noble.Peripheral[] = [];

  constructor(req: NextApiRequest, res: NextApiResponseServerIO) {
    console.log("\x1b[33m[NapicuServer]\x1b[0m\x1b[34m - Starting...\x1b[0m");

    const httpServer: NetServer = res.socket.server as any;
    this.io = new SocketIOServer(httpServer, {
      path: "/api/socketio",
    });

    res.socket.server.io = this.io;
  }

  public init(): void {
    //On client connect
    this.io.on("connection", (socket) => {
      console.log("\x1b[33m[NapicuServer]\x1b[0m\x1b[34m - New client connected.\x1b[0m");
  
      for(const device of this.cast_noble_peripherals_to_device(this.found_peripheral)) {
        socket.emit("device", device);
      }
      
      socket.emit("scan_status", this.is_scanning);

      socket.on("start_scan", this.start_scan);

      socket.on("stop_scan", this.stop_scan);

      socket.on("disconnect", () => {
        const client_count: number = this.io.sockets.sockets.size;
        console.log("\x1b[33m[NapicuServer]\x1b[0m\x1b[34m - Client has disconnected. Number of connected clients:\x1b[0m", client_count);
        if (client_count === 0) {
          console.log("\x1b[33m[NapicuServer]\x1b[0m\x1b[34m - No clients connected.\x1b[0m");
          this.stop_scan();
          this.found_peripheral = [];
        }
      });
    });

    //On noble change
    noble.on("stateChange", this.noble_change);
    //On noble discover
    noble.on("discover", this.noble_discover);
  }

  private start_scan = (): void => {
    if (!this.is_scanning) {
      console.log("\x1b[33m[NapicuServer]\x1b[0m\x1b[34m - Starting BLE scan...\x1b[0m");
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
      console.log("\x1b[33m[NapicuServer]\x1b[0m\x1b[34m - Stopping BLE scan...\x1b[0m");
      noble.stopScanning();
      this.is_scanning = false;
      this.emit_scan_status();
    }

    if(this.time_id) clearTimeout(this.time_id);
  }

  private noble_change = (state: string): void => {
    if (state === "poweredOn") {
      //TODO EMIT
      console.log("\x1b[33m[NapicuServer]\x1b[0m\x1b[34m - BLE adapter powered on.\x1b[0m");
    } else {
      //TODO EMIT
      console.log("\x1b[33m[NapicuServer]\x1b[0m\x1b[31m - BLE adapter powered on.\x1b[0m");
      noble.stopScanning();
    }
  }

  private noble_discover = (peripheral: noble.Peripheral) => {
    const device: Device = {
      id: peripheral.id,
      uuids: peripheral.advertisement.serviceUuids,
      name: peripheral.advertisement.localName || "Unknown",
      address: peripheral.address
    };



    this.found_peripheral.push(peripheral);

    this.io.emit("device", this.cast_noble_peripherals_to_device(peripheral));
  }

  private emit_scan_status(): void {
    this.io.emit("scan_status", this.is_scanning);
  }


  private cast_noble_peripherals_to_device(peripherals: noble.Peripheral[]): Device[];
  private cast_noble_peripherals_to_device(peripheral: noble.Peripheral): Device;
  private cast_noble_peripherals_to_device(peripherals: noble.Peripheral | noble.Peripheral[]): Device | Device[] {
    if (Array.isArray(peripherals)) {
      return peripherals.map((peripheral) => ({
        id: peripheral.id,
        uuids: [peripheral.uuid],
        name: peripheral.advertisement.localName || "Unknown",
        address: peripheral.address,
      }));
    } else {
      return {
        id: peripherals.id,
        uuids: [peripherals.uuid],
        name: peripherals.advertisement.localName || "Unknown",
        address: peripherals.address,
      };
    }
  }
}