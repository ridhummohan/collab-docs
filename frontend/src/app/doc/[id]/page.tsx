"use client"

import { useParams } from "next/navigation"
import { useDocumentCollab } from "@/hooks/useDocumentCollab"
import { useComments } from "@/hooks/useComments"
import { useSession } from "next-auth/react"
import React from "react"
import Avatar from "@/components/Avatar"
import Link from "next/link"

export default function DocPage() {
  const { id } = useParams()
  const { data: session, status } = useSession()

  const [title, setTitle] = React.useState("")
  const [author, setAuthor] = React.useState<any>(null)
  const [loadingDoc, setLoadingDoc] = React.useState(true)
  const [isOwner, setIsOwner] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [shareOpen, setShareOpen] = React.useState(false)
  const [shareEmail, setShareEmail] = React.useState("")
  const [shareMsg, setShareMsg] = React.useState("")

  if (status === "loading") {
    return <div className="loading"><div className="spinner" /></div>
  }
  if (!session) {
    return (
      <div className="container" style={{ paddingTop: 80, textAlign: "center" }}>
        <h2>Authentication Required</h2>
        <p>Please sign in to view this document.</p>
        <Link href="/login"><button>Sign In</button></Link>
      </div>
    )
  }

  const userId = session.user!.id || "guest"

  // Real-time hooks
  const { content, editDocument, sendCursor, remoteCursors } = useDocumentCollab(id as string, userId)
  const { comments, postComment } = useComments(id as string, userId)
  const [commentText, setCommentText] = React.useState("")

  // Fetch title/author & ownership
  React.useEffect(() => {
    async function load() {
      // Try owner endpoint
      let resp = await fetch(`http://localhost:5000/api/documents?authorId=${userId}`)
      let docs = await resp.json()
      let doc = docs.find((d:any)=>d.id===id)
      if (doc) {
        setTitle(doc.title); setAuthor(doc.author); setIsOwner(true)
      } else {
        resp = await fetch(`http://localhost:5000/api/documents/shared?userId=${userId}`)
        let sd = await resp.json()
        let share = sd.find((s:any)=>s.document.id===id)
        if (share) {
          setTitle(share.document.title)
          setAuthor(share.document.author)
          setIsOwner(false)
        }
      }
      setLoadingDoc(false)
    }
    load()
  }, [id, userId])

  const handleDelete = async () => {
    if (!confirm("Delete this document permanently?")) return
    setDeleting(true)
    const res = await fetch(`http://localhost:5000/api/documents/${id}?userId=${userId}`, {
      method: "DELETE"
    })
    if (res.ok) {
      window.location.href = "/"
    } else {
      const err = await res.json()
      alert(err.error)
      setDeleting(false)
    }
  }

  const handleShare = async () => {
    if (!shareEmail.trim()) return setShareMsg("Enter an email")
    const res = await fetch("http://localhost:5000/api/documents/share", {
      method: "POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ documentId: id, shareWithEmail: shareEmail })
    })
    if (res.ok) {
      setShareMsg("Shared!")
      setTimeout(()=>{ setShareOpen(false); setShareMsg("") },1500)
    } else {
      let e = await res.json()
      setShareMsg(e.error)
    }
  }

  if (loadingDoc) {
    return <div className="loading"><div className="spinner" /></div>
  }

  return (
    <div style={{ display:"flex", height:"calc(100vh - 64px)" }}>
      {/* Editor */}
      <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
        <header style={{ padding:16, borderBottom:"1px solid var(--border-color)", background:"white" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <h1>{title||"Untitled"}</h1>
              {author&&(
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Avatar src={author.image} alt={author.name||author.email} size={20}/>
                  <span style={{fontSize:12,color:"var(--text-secondary)"}}>
                    {author.name||author.email}
                  </span>
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <button className="secondary" onClick={()=>setShareOpen(true)}>🔗 Share</button>
              {isOwner&&(
                <button className="danger" onClick={handleDelete} disabled={deleting}>
                  {deleting?"Deleting...":"🗑️ Delete"}
                </button>
              )}
              <Link href="/"><button className="secondary">Back to Home</button></Link>
            </div>
          </div>
        </header>
        <div style={{flex:1,overflow:"auto",padding:24,background:"var(--bg-light)"}}>
          <textarea
            value={content}
            onChange={e=>{editDocument(e.target.value);sendCursor(e.target.selectionStart)}}
            style={{
              width:"100%",minHeight:600,background:"white",padding:24,
              border:"none",borderRadius:8,boxShadow:"var(--shadow-sm)",
              fontSize:16,lineHeight:1.6,fontFamily:"Georgia, serif"
            }}
          />
        </div>
      </div>
      {/* Comments */}
      <aside style={{
        width:360,background:"white",borderLeft:"1px solid var(--border-color)",
        display:"flex",flexDirection:"column"
      }}>
        <div style={{padding:20,borderBottom:"1px solid var(--border-color)"}}>
          <h2>Comments</h2>
        </div>
        <div style={{flex:1,overflow:"auto",padding:16}}>
          {comments.length===0
            ? <div style={{textAlign:"center",color:"var(--text-secondary)"}}>No comments</div>
            : comments.map((c:any)=>(
              <div key={c.id} style={{marginBottom:16,padding:12,background:"var(--bg-light)",borderRadius:8}}>
                <div style={{display:"flex",gap:8,marginBottom:4}}>
                  <Avatar src={c.author.image} alt={c.author.name} size={32}/>
                  <div>
                    <div style={{fontWeight:500}}>{c.author.name||"Anonymous"}</div>
                    <div style={{fontSize:12,color:"var(--text-light)"}}>
                      {new Date(c.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <p>{c.text}</p>
              </div>
            ))
          }
        </div>
        <div style={{padding:16,borderTop:"1px solid var(--border-color)"}}>
          <div style={{display:"flex",gap:8}}>
            <input
              value={commentText}
              onChange={e=>setCommentText(e.target.value)}
              placeholder="Add a comment..."
              onKeyPress={e=>{if(e.key==="Enter"&&commentText.trim()){postComment(commentText);setCommentText("")}}}
              style={{flex:1}}
            />
            <button disabled={!commentText.trim()} onClick={()=>{postComment(commentText);setCommentText("")}}>
              Send
            </button>
          </div>
        </div>
      </aside>
      {/* Share Modal */}
      {shareOpen && (
        <div style={{
          position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",
          display:"flex",alignItems:"center",justifyContent:"center"
        }} onClick={()=>setShareOpen(false)}>
          <div className="card" style={{maxWidth:500,width:"100%",padding:32}} onClick={e=>e.stopPropagation()}>
            <h2>Share Document</h2>
            <input
              type="email"
              value={shareEmail}
              onChange={e=>setShareEmail(e.target.value)}
              placeholder="user@example.com"
              style={{margin:"16px 0"}}
            />
            {shareMsg&&<div style={{color: shareMsg.startsWith("✓")?"var(--secondary-color)":"var(--danger-color)"}}>
              {shareMsg}
            </div>}
            <div style={{display:"flex",gap:12,marginTop:16}}>
              <button onClick={handleShare}>Share</button>
              <button className="secondary" onClick={()=>{setShareOpen(false);setShareMsg("")}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
