const { createServer } = require("http");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const express = require("express");
const cors = require("cors");

const prisma = new PrismaClient();
const httpServer = createServer();
const app = express();
app.use(cors());
app.use(express.json());

// ===== REST API ENDPOINTS =====

// Get user's own documents
app.get("/api/documents", async (req, res) => {
  try {
    const { authorId } = req.query;
    if (!authorId) {
      return res.status(400).json({ error: "authorId required" });
    }
    const documents = await prisma.document.findMany({
      where: { authorId },
      orderBy: { updatedAt: "desc" },
      include: {
        author: { select: { id: true, name: true, email: true, image: true } }
      }
    });
    res.json(documents);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Unable to fetch documents" });
  }
});

// Get documents shared with user
app.get("/api/documents/shared", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }
    const sharedDocs = await prisma.documentShare.findMany({
      where: { sharedWithId: userId },
      include: {
        document: {
          include: {
            author: { select: { id: true, name: true, email: true, image: true } }
          }
        }
      },
      orderBy: { sharedAt: "desc" }
    });
    res.json(sharedDocs);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Unable to fetch shared documents" });
  }
});

// Create new document
app.post("/api/documents", async (req, res) => {
  try {
    const { title, content, authorId } = req.body;
    if (!authorId) {
      res.status(400).json({ error: "Missing authorId" });
      return;
    }
    const doc = await prisma.document.create({
      data: { title, content: content || "", authorId },
      include: {
        author: { select: { id: true, name: true, email: true, image: true } }
      }
    });
    res.json(doc);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Unable to create a document" });
  }
});

// Share a document with another user
app.post("/api/documents/share", async (req, res) => {
  try {
    const { documentId, shareWithEmail } = req.body;
    const userToShareWith = await prisma.user.findUnique({
      where: { email: shareWithEmail }
    });
    if (!userToShareWith) {
      return res.status(404).json({ error: "User not found with that email" });
    }
    const existingShare = await prisma.documentShare.findUnique({
      where: {
        documentId_sharedWithId: {
          documentId,
          sharedWithId: userToShareWith.id
        }
      }
    });
    if (existingShare) {
      return res.status(400).json({ error: "Document already shared with this user" });
    }
    const share = await prisma.documentShare.create({
      data: {
        documentId,
        sharedWithId: userToShareWith.id
      },
      include: {
        sharedWith: { select: { id: true, name: true, email: true, image: true } }
      }
    });
    res.json(share);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Unable to share document" });
  }
});

// Remove share
app.delete("/api/documents/share/:documentId/:userId", async (req, res) => {
  try {
    const { documentId, userId } = req.params;
    await prisma.documentShare.delete({
      where: {
        documentId_sharedWithId: {
          documentId,
          sharedWithId: userId
        }
      }
    });
    res.json({ message: "Share removed successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Unable to remove share" });
  }
});

// Delete document (only owner can delete)
app.delete("/api/documents/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.query
    if (!userId) return res.status(400).json({ error: "userId required" })

    const doc = await prisma.document.findUnique({ where: { id } })
    if (!doc) return res.status(404).json({ error: "Document not found" })
    if (doc.authorId !== userId)
      return res.status(403).json({ error: "Only the document owner can delete it" })

    await prisma.document.delete({ where: { id } })
    return res.json({ message: "Document deleted successfully" })
  } catch (err) {
    console.error("Delete error:", err)
    return res.status(500).json({ error: "Unable to delete document", details: err.message })
  }
})

app.listen(5000, () => {
  console.log(`Express HTTP API running on http://localhost:5000/`);
});

// ===== SOCKET.IO EVENTS =====

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const activeUsers = {};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("joinDocument", async (docId) => {
    socket.join(docId);
    const doc = await prisma.document.findUnique({ where: { id: docId } });
    if (doc) {
      socket.emit("documentContent", doc.content);
    }
    activeUsers[socket.id] = { docId, userId: null };
  });

  socket.on("editDocument", async ({ docId, content }) => {
    await prisma.document.update({
      where: { id: docId },
      data: { content }
    });
    socket.to(docId).emit("documentContent", content);
  });

  socket.on("cursorMove", ({ docId, userId, position }) => {
    activeUsers[socket.id] = { docId, userId };
    socket.to(docId).emit("remoteCursorMove", { userId, position });
  });

  socket.on("joinComments", async (docId) => {
    socket.join(`comments_${docId}`);
    const comments = await prisma.comment.findMany({
      where: { documentId: docId },
      include: {
        author: { select: { name: true, email: true, image: true } }
      },
      orderBy: { timestamp: "asc" }
    });
    socket.emit("commentsList", comments);
  });

  socket.on("newComment", async ({ docId, userId, text }) => {
    const comment = await prisma.comment.create({
      data: {
        documentId: docId,
        authorId: userId,
        text
      },
      include: {
        author: { select: { name: true, email: true, image: true } }
      }
    });
    io.to(`comments_${docId}`).emit("commentAdded", comment);
  });

  socket.on("disconnect", () => {
    const info = activeUsers[socket.id];
    if (info && info.docId && info.userId) {
      socket.to(info.docId).emit("userLeft", { userId: info.userId });
    }
    delete activeUsers[socket.id];
    console.log("A user disconnected", socket.id);
  });
});

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}/`);
});
