"use client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import Avatar from "@/components/Avatar"

export default function HomePage() {
  const [myDocs, setMyDocs] = useState([])
  const [sharedDocs, setSharedDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { data: session } = useSession()

  const fetchDocuments = () => {
    if (session?.user?.id) {
      Promise.all([
        fetch(`http://localhost:5000/api/documents?authorId=${session.user.id}`).then(res => res.json()),
        fetch(`http://localhost:5000/api/documents/shared?userId=${session.user.id}`).then(res => res.json())
      ]).then(([docs, shared]) => {
        setMyDocs(docs)
        setSharedDocs(shared)
        setLoading(false)
      })
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [session])

  const handleDelete = async (docId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      return
    }

    setDeletingId(docId)

    try {
      const res = await fetch(`http://localhost:5000/api/documents/${docId}?userId=${session?.user?.id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        // Remove from local state
        setMyDocs(myDocs.filter((doc: any) => doc.id !== docId))
      } else {
        const err = await res.json()
        alert(err.error || "Failed to delete document")
      }
    } catch (err) {
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
        gap: '24px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>📝 CollabDocs</h1>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
            Create, edit, and collaborate on documents in real-time with your team.
          </p>
          <Link href="/login">
            <button style={{ padding: '12px 32px', fontSize: '16px' }}>
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
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 500 }}>My Documents</h2>
          <Link href="/create">
            <button>+ Create New</button>
          </Link>
        </div>
        
        {myDocs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
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
            gap: '20px'
          }}>
            {myDocs.map((doc: any) => (
              <div key={doc.id} style={{ position: 'relative' }}>
                <Link href={`/doc/${doc.id}`}>
                  <div className="card" style={{
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '120px',
                      backgroundColor: 'var(--bg-light)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px'
                    }}>
                      📄
                    </div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {doc.title}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Edited {new Date(doc.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
                  <button
                    onClick={e => handleDelete(doc.id, e)}
                    disabled={deletingId === doc.id}
                    className="danger"
                    style={{ position: 'absolute', top: 12, right: 12, padding: '6px 12px', fontSize: '12px' }}
                  >
                    {deletingId === doc.id ? '...' : '🗑️ Delete'}
                  </button>

              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: '24px', fontWeight: 500, marginBottom: '24px' }}>
          Shared with Me
        </h2>
        
        {sharedDocs.length === 0 ? (
          <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              No documents shared with you yet.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {sharedDocs.map((share: any) => (
              <Link href={`/doc/${share.document.id}`} key={share.id}>
                <div className="card" style={{
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '100%',
                    height: '120px',
                    backgroundColor: 'var(--bg-light)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px'
                  }}>
                    🤝
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {share.document.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar 
                      src={share.document.author.image} 
                      alt={share.document.author.name || 'User'} 
                      size={24} 
                    />
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {share.document.author.name}
                    </p>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>
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
