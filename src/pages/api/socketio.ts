import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/types/next";
import NapicuServer from "../utils/NapicuServer";

export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    new NapicuServer(req, res).init();
  }
  //@ts-ignore
  res.end();
};
