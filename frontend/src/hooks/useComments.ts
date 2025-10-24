import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

interface Comment {
  id: string;
  text: string;
  timestamp: string;
  author: {
    name?: string | null;
    email: string;
    image?: string | null;
  };
}

export function useComments(docId: string, userId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const socketConnection = io("http://localhost:4000")
    setSocket(socketConnection)

    socketConnection.emit("joinComments", docId)

    socketConnection.on("commentsList", (commentsList: Comment[]) => {
      setComments(commentsList)
    })

    socketConnection.on("commentAdded", (comment: Comment) => {
      setComments(prev => [...prev, comment])
    })

    return () => {
      socketConnection.disconnect()
    }
  }, [docId])

  const postComment = (text: string) => {
    if (socket) {
      socket.emit("newComment", { docId, userId, text })
    }
  }

  return { comments, postComment }
}
