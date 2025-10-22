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
      <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px' }}>Authentication Required</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
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
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Unable to create document")
      setIsCreating(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: '60px', maxWidth: '600px' }}>
      <div className="card" style={{ padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
          <h1 style={{ fontSize: '28px', fontWeight: 500, marginBottom: '8px' }}>
            Create New Document
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Give your document a name to get started
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: 500,
            marginBottom: '8px',
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
            style={{ fontSize: '16px' }}
          />
        </div>

        {error && (
          <div style={{ 
            padding: '12px 16px',
            backgroundColor: '#fce8e6',
            color: 'var(--danger-color)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            disabled={!title.trim() || isCreating} 
            onClick={handleCreate}
            style={{ flex: 1, padding: '12px', fontSize: '16px' }}
          >
            {isCreating ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
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
            <button className="secondary" style={{ width: '100%', padding: '12px', fontSize: '16px' }}>
              Cancel
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
