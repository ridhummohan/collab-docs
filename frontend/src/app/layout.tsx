import { Inter } from "next/font/google"
import "./globals.css"
import {Providers} from "./providers"
import Header from "./Header"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "CollabDocs - Real-time Collaborative Editing",
  description: "Create, edit, and collaborate on documents in real-time",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
