"use client"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import Avatar from "../components/Avatar"

export default function Header() {
  const { data: session } = useSession()

  return (
    <header style={{
      backgroundColor: 'white',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '64px'
      }}>
        <Link href="/" style={{
          fontSize: '20px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📝 CollabDocs
        </Link>
        
        {session?.user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/create">
              <button style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '18px' }}>+</span> New Document
              </button>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar src={session.user.image} alt={session.user.name || 'User'} size={40} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{session.user.name}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {session.user.email}
                </span>
              </div>
              <button className="secondary" onClick={() => signOut()}>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <Link href="/login">
            <button>Sign In</button>
          </Link>
        )}
      </div>
    </header>
  )
}
