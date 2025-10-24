import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// Use environment variable for production, fallback to localhost for development
const SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  
  useEffect(() => {
    const s = io(SERVER_URL);
    setSocket(s);
    return () => { s.disconnect(); };
  }, []);
  
  return socket;
}
