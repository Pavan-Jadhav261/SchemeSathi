import { NextResponse } from "next/server"
import { createUserId, signToken } from "@/lib/auth"
import { addUser, hashPassword, readUsers } from "@/lib/users"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { name, email, mobile, password } = await request.json()
    const normalizedEmail = String(email ?? "").trim().toLowerCase()
    const normalizedMobile = String(mobile ?? "").replace(/\D/g, "")
    if (!String(name ?? "").trim() || !/^\S+@\S+\.\S+$/.test(normalizedEmail) || normalizedMobile.length < 10 || String(password ?? "").length < 8) {
      return NextResponse.json({ error: "Enter a name, valid email, 10-digit mobile number, and a password of at least 8 characters." }, { status: 400 })
    }
    if ((await readUsers()).some((user) => user.email === normalizedEmail)) {
      return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 })
    }
    const user = { id: createUserId(), name: String(name).trim(), email: normalizedEmail, mobile: normalizedMobile, passwordHash: await hashPassword(String(password)), createdAt: new Date().toISOString() }
    const token = signToken(user)
    await addUser(user)
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email }, token }, { status: 201 })
  } catch (error) {
    console.error("Signup failed", error)
    return NextResponse.json({ error: "Unable to create the account. Check the server configuration." }, { status: 500 })
  }
}
