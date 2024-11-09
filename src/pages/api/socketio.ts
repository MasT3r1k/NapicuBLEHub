import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/types/next";
import { Server as SocketIOServer } from "socket.io";
import noble from "@abandonware/noble";

let isScanning = false;

// Funkce pro spuštění skenování
const start_scan = (io: SocketIOServer) => {
  if (isScanning) return;

  console.log("Starting BLE scan...");
  isScanning = true;

  noble.startScanning([], true);
  io.emit("scan_status", true);

  // Automatické zastavení po 30 sekundách
  setTimeout(() => {
    stop_scan(io);
  }, 10000);
};

// Funkce pro zastavení skenování
const stop_scan = (io: SocketIOServer) => {
  if (!isScanning) return;

  console.log("Stopping BLE scan...");
  noble.stopScanning();
  isScanning = false;
  io.emit("scan_status", false);
};

export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log("Initializing new Socket.io server...");

    const httpServer: NetServer = res.socket.server as any;
    const io = new SocketIOServer(httpServer, {
      path: "/api/socketio",
    });

    res.socket.server.io = io;

    // Při připojení nového klienta
    io.on("connection", (socket) => {
      console.log("New client connected");

      // Pošleme stav skenování při připojení
      socket.emit("scan_status",  isScanning);

      // Posloucháme na zprávy od klienta
      socket.on("start_scan", () => {
        start_scan(io);
      });

      socket.on("stop_scan", () => {
        stop_scan(io);
      });
    });

    // Nastavení `noble` skenování
    noble.on("stateChange", (state) => {
      if (state === "poweredOn") {
        console.log("BLE adapter powered on");
      } else {
        console.log("BLE adapter not ready");
        noble.stopScanning();
      }
    });

    noble.on("discover", (peripheral) => {
      const device = {
        id: peripheral.id,
        name: peripheral.advertisement.localName || "Unknown",
      };

 
      io.emit("device", device);
    });
  }

  res.end();
};
