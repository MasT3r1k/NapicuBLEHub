import { Server as ServerIO } from "socket.io";

export interface NextApiResponseServerIO extends NextApiResponse {
  socket: {
    server: {
      io?: ServerIO;
    };
  };
}
