import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";



export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Initialize Supabase Admin (needed to bypass RLS for registration if necessary)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Register the user in Supabase Auth
    // This automatically sends the "Growth AI" verification email you configured
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${new URL(req.url).origin}/api/auth/callback`,
      },
    });

    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

    // 2. Create the user in your Prisma Database
    // Note: We use the ID from Supabase to keep them in sync
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.user.upsert({
      where: { email },
      update: { password: hashedPassword }, // Update if they tried to register before but didn't verify
      create: {
        id: authData.user?.id, // Syncing IDs
        name,
        email,
        password: hashedPassword,
        emailVerified: null, // Always null until they click the link
      },
    });

 // ... existing code ...
    return NextResponse.json({ message: "Check your email to verify your account." }, { status: 201 });
  } catch (error) {
    // This line uses the 'error' variable and satisfies ESLint
    console.error("Registration Error Logic:", error); 
    
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}