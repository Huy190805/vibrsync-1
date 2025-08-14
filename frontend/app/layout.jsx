import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/auth-context"
import ClientLayout from "@/components/layout/ClientLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Your App",
  description: "Music App",
}

// app/layout.jsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="mdl-js">
      <body className={inter.className}>
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
        <div id="modal-root" className="fixed inset-0 z-[99999] pointer-events-none" />

      </body>
    </html>
  )
}
