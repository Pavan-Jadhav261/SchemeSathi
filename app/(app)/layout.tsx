import type React from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <DashboardSidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
