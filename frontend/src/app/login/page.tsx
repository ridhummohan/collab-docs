"use client"
import { signIn } from "next-auth/react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push("/")
    }
  }, [session, router])

  if (status === "loading") {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 64px)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="card" style={{
        maxWidth: 420,
        width: '100%',
        margin: 20,
        padding: 48,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>📝</div>
        
        <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 12 }}>
          Welcome to CollabDocs
        </h1>
        
        <p style={{ 
          color: 'var(--text-secondary)', 
          marginBottom: 32,
          fontSize: 16,
          lineHeight: 1.6
        }}>
          Create, edit, and collaborate on documents in real-time with your team.
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          style={{
            width: '100%',
            padding: '14px 24px',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            backgroundColor: 'white',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            fontWeight: 500
          }}
          className="secondary"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>

        <div style={{ 
          marginTop: 32, 
          paddingTop: 24, 
          borderTop: '1px solid var(--border-color)' 
        }}>
          <p style={{ fontSize: 14, color: 'var(--text-light)' }}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
