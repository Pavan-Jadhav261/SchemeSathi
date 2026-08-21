import { NextResponse } from "next/server"
import { signToken } from "@/lib/auth"
import { readUsers, verifyPassword } from "@/lib/users"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json()
    const value = String(identifier ?? "").trim().toLowerCase()
    const mobile = value.replace(/\D/g, "")
    const user = (await readUsers()).find((candidate) => candidate.email === value || candidate.mobile === mobile)
    if (!user || !(await verifyPassword(String(password ?? ""), user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
    }
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email }, token: signToken(user) })
  } catch (error) {
    console.error("Login failed", error)
    return NextResponse.json({ error: "Unable to log in. Check the server configuration." }, { status: 500 })
  }
}
