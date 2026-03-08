import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { auth } from "../services/api";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  onlineUsers: any[];
  logs: any[];
  pipeline: any;
  emitAction: (action: string, data?: any) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  onlineUsers: [],
  logs: [],
  pipeline: null,
  emitAction: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<any>(null);

  const emitAction = useCallback((action: string, data?: any) => {
    if (socket && connected) {
      socket.emit(action, data);
    }
  }, [socket, connected]);

  useEffect(() => {
    // When hosted via Docker/Nginx, Socket.io requests are routed using window.location.origin
    // Nginx will proxy anything sent to `/socket.io/` toward `http://backend:5000`
    const SOCKET_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? window.location.origin : "http://localhost:5000");
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("Connected to server");
      setConnected(true);

      const user = auth.getUser();
      if (user) {
        newSocket.emit("user_join", {
          name: user.name,
          role: user.role,
          id: user.id,
        });
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setConnected(false);
    });

    newSocket.on("users_updated", (users: any[]) => {
      setOnlineUsers(users);
    });

    newSocket.on("logs_updated", (logs: any[]) => {
      setLogs(logs);
    });

    newSocket.on("new_log", (log: any) => {
      setLogs((prev) => [log, ...prev].slice(0, 100));
    });

    newSocket.on("pipeline_updated", (pipelineState: any) => {
      setPipeline(pipelineState);
      if (pipelineState?.id) {
        newSocket.emit("get_logs", { pipelineId: pipelineState.id });
      }
    });

    newSocket.on("error", (error: any) => {
      console.error("Socket error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        onlineUsers,
        logs,
        pipeline,
        emitAction,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
