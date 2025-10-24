"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function CreateDocPage() {
  const [title, setTitle] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "loading") {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container" style={{ paddingTop: 80, textAlign: "center" }}>
        <h2 style={{ marginBottom: 16 }}>Authentication Required</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          Please sign in to create a document.
        </p>
        <Link href="/login">
          <button>Sign In</button>
        </Link>
      </div>
    )
  }

  const handleCreate = async () => {
    if (!title.trim()) {
      setError("Please enter a document title")
      return
    }

    setIsCreating(true)
    setError("")

    try {
      const res = await fetch("http://localhost:5000/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: title.trim(), 
          content: "", 
          authorId: session.user?.id 
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Failed to create document")
      }

      const doc = await res.json()
      router.push(`/doc/${doc.id}`)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Unable to create document")
      setIsCreating(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: 60, maxWidth: 600 }}>
      <div className="card" style={{ padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📝</div>
          <h1 style={{ fontSize: 28, fontWeight: 500, marginBottom: 8 }}>
            Create New Document
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Give your document a name to get started
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ 
            display: 'block', 
            fontSize: 14, 
            fontWeight: 500,
            marginBottom: 8,
            color: 'var(--text-primary)'
          }}>
            Document Title
          </label>
          <input 
            type="text"
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Enter document title..." 
            disabled={isCreating}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isCreating && title.trim()) {
                handleCreate()
              }
            }}
            autoFocus
            style={{ fontSize: 16 }}
          />
        </div>

        {error && (
          <div style={{ 
            padding: '12px 16px',
            backgroundColor: '#fce8e6',
            color: 'var(--danger-color)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 16,
            fontSize: 14
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            disabled={!title.trim() || isCreating} 
            onClick={handleCreate}
            style={{ flex: 1, padding: 12, fontSize: 16 }}
          >
            {isCreating ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div style={{ 
                  width: 16, 
                  height: 16, 
                  border: '2px solid white', 
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }} />
                Creating...
              </span>
            ) : (
              'Create Document'
            )}
          </button>
          <Link href="/" style={{ flex: 1 }}>
            <button className="secondary" style={{ width: '100%', padding: 12, fontSize: 16 }}>
              Cancel
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
