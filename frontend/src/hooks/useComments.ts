import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SERVER_URL = "http://localhost:4000";

export function useComments(docId: string, userId: string) {
  const [comments, setComments] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(SERVER_URL);

    socketRef.current.emit("joinComments", docId);

    socketRef.current.on("commentsList", (allComments: any[]) => {
      setComments(allComments);
    });

    socketRef.current.on("commentAdded", (comment: any) => {
      setComments((prev) => [...prev, comment]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [docId]);

  const postComment = (text: string) => {
    socketRef.current?.emit("newComment", { docId, userId, text });
  };

  return { comments, postComment };
}
