import { Server as ServerIO } from "socket.io";
import {NextApiResponse} from "next";

export interface NextApiResponseServerIO extends NextApiResponse {
  socket: {
    server: {
      io?: ServerIO;
    };
  };
}
