import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Socket } from "socket.io";
import io from "socket.io-client";

const SocketContext = createContext<any>(null);

export const useSocket = (): Socket => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket = io({ path: "/api/socketio" });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
