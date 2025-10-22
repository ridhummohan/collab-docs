import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SERVER_URL = "http://localhost:4000";

export function useDocumentCollab(docId: string, userId: string) {
  const [content, setContent] = useState("");
  const [remoteCursors, setRemoteCursors] = useState<Record<string, number>>({});
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(SERVER_URL);

    socketRef.current.emit("joinDocument", docId);

    socketRef.current.on("documentContent", (newContent: string) => {
      setContent(newContent);
    });

    socketRef.current.on("remoteCursorMove", ({ userId: uid, position }) => {
      setRemoteCursors((prev) => ({ ...prev, [uid]: position }));
    });

    socketRef.current.on("userLeft", ({ userId: uid }) => {
      setRemoteCursors((prev) => {
        const next = { ...prev };
        delete next[uid];
        return next;
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [docId]);

  const editDocument = (newContent: string) => {
    setContent(newContent);
    socketRef.current?.emit("editDocument", { docId, content: newContent });
  };

  const sendCursor = (position: number) => {
    socketRef.current?.emit("cursorMove", { docId, userId, position });
  };

  return { content, editDocument, sendCursor, remoteCursors };
}
