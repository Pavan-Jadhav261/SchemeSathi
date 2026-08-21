import type React from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { AuthGuard } from "@/components/auth-guard"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-background lg:flex-row">
        <DashboardSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </AuthGuard>
  )
}
