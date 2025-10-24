"use client"
import { useSession } from "next-auth/react"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Avatar from "@/components/Avatar"
import { API_URL } from "@/config"

interface Document {
  id: string;
  title: string;
  updatedAt: string;
  author: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
}

interface SharedDocument {
  id: string;
  sharedAt: string;
  document: Document;
}

export default function HomePage() {
  const [myDocs, setMyDocs] = useState<Document[]>([])
  const [sharedDocs, setSharedDocs] = useState<SharedDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { data: session } = useSession()

  const fetchDocuments = useCallback(() => {
    if (session?.user?.id) {
      Promise.all([
        fetch(`${API_URL}/api/documents?authorId=${session.user.id}`).then(res => res.json()),
        fetch(`${API_URL}/api/documents/shared?userId=${session.user.id}`).then(res => res.json())
      ]).then(([docs, shared]) => {
        setMyDocs(docs)
        setSharedDocs(shared)
        setLoading(false)
      }).catch(() => {
        setLoading(false)
      })
    }
  }, [session?.user?.id])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleDelete = async (docId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      return
    }

    setDeletingId(docId)

    try {
      const res = await fetch(`${API_URL}/api/documents/${docId}?userId=${session?.user?.id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setMyDocs(myDocs.filter((doc) => doc.id !== docId))
      } else {
        const error = await res.json()
        alert(error.error || "Failed to delete document")
      }
    } catch {
      alert("Error deleting document")
    } finally {
      setDeletingId(null)
    }
  }

  if (!session) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)',
        gap: 24
      }}>
        <div style={{ textAlign: 'center', maxWidth: 500 }}>
          <h1 style={{ fontSize: 48, marginBottom: 16 }}>📝 CollabDocs</h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 32 }}>
            Create, edit, and collaborate on documents in real-time with your team.
          </p>
          <Link href="/login">
            <button style={{ padding: '12px 32px', fontSize: 16 }}>
              Get Started
            </button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <section style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 500 }}>My Documents</h2>
          <Link href="/create">
            <button>+ Create New</button>
          </Link>
        </div>
        
        {myDocs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
              No documents yet. Create your first document to get started!
            </p>
            <Link href="/create">
              <button>Create Document</button>
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20
          }}>
            {myDocs.map((doc) => (
              <div key={doc.id} style={{ position: 'relative' }}>
                <Link href={`/doc/${doc.id}`}>
                  <div className="card" style={{
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}>
                    <div style={{
                      width: '100%',
                      height: 120,
                      backgroundColor: 'var(--bg-light)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 48
                    }}>
                      📄
                    </div>
                    <h3 style={{
                      fontSize: 16,
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {doc.title}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Edited {new Date(doc.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={(e) => handleDelete(doc.id, e)}
                  disabled={deletingId === doc.id}
                  className="danger"
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    padding: '6px 12px',
                    fontSize: 12,
                    zIndex: 10
                  }}
                >
                  {deletingId === doc.id ? '...' : '🗑️ Delete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: 24, fontWeight: 500, marginBottom: 24 }}>
          Shared with Me
        </h2>
        
        {sharedDocs.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              No documents shared with you yet.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20
          }}>
            {sharedDocs.map((share) => (
              <Link href={`/doc/${share.document.id}`} key={share.id}>
                <div className="card" style={{
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}>
                  <div style={{
                    width: '100%',
                    height: 120,
                    backgroundColor: 'var(--bg-light)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 48
                  }}>
                    🤝
                  </div>
                  <h3 style={{
                    fontSize: 16,
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {share.document.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar 
                      src={share.document.author.image} 
                      alt={share.document.author.name || 'User'} 
                      size={24} 
                    />
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {share.document.author.name}
                    </p>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-light)' }}>
                    Shared {new Date(share.sharedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
