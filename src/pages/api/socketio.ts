import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/types/next";
import { Server as SocketIOServer } from "socket.io";
import noble from "@abandonware/noble";
import NapicuBLEServer from "../utils/NapicuServer";
import NapicuServer from "../utils/NapicuServer";

export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    new NapicuServer(req, res).init();
  }
  //@ts-ignore
  res.end();
};
