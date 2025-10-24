import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// Use environment variable for production, fallback to localhost for development
const SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface SharedFile {
  id: string;
  filename: string;
  url: string;
  uploadedAt: string;
  uploaderId: string;
  documentId: string;
}

export function useFileShare(docId: string) {
  const [files, setFiles] = useState<SharedFile[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(SERVER_URL);
    socketRef.current.emit("joinDocument", docId);

    socketRef.current.on("fileUploaded", (file: SharedFile) => {
      setFiles((prev) => [...prev, file]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [docId]);

  // Upload file via REST
  const uploadFile = async (file: File, uploaderId: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentId", docId);
    formData.append("uploaderId", uploaderId);

    const res = await fetch(`${API_URL}/api/files`, {
      method: "POST",
      body: formData
    });
    const data: SharedFile = await res.json();
    // REST endpoint will emit to Socket.IO; we can optimistically add:
    setFiles((prev) => [...prev, data]);
  };

  return { files, uploadFile };
}
