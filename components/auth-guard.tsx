"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { getAccessToken } from "@/lib/storage"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!getAccessToken()) router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    else setReady(true)
  }, [pathname, router])

  return ready ? <>{children}</> : null
}
