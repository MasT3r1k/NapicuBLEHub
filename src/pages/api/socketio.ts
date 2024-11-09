import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/types/next";
import { Server as SocketIOServer } from "socket.io";
import noble from "@abandonware/noble";

let isScanning = false;

// Funkce pro spuštění skenování
const startScan = (io: SocketIOServer) => {
  if (isScanning) return;

  console.log("Starting BLE scan...");
  isScanning = true;

  noble.startScanning([], true);
  io.emit("scanStatus", { scanning: true });

  // Automatické zastavení po 30 sekundách
  setTimeout(() => {
    stopScan(io);
  }, 30000);
};

// Funkce pro zastavení skenování
const stopScan = (io: SocketIOServer) => {
  if (!isScanning) return;

  console.log("Stopping BLE scan...");
  noble.stopScanning();
  isScanning = false;
  io.emit("scanStatus", { scanning: false });
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
      socket.emit("scanStatus", { scanning: isScanning });

      // Posloucháme na zprávy od klienta
      socket.on("startScan", () => {
        startScan(io);
      });

      socket.on("stopScan", () => {
        stopScan(io);
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

      console.log("Discovered device:", device);
      io.emit("deviceFound", device);
    });
  }

  res.end();
};
