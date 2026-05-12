import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore error when setting cookies
          }
        },
      },
    });

    // 0. Check if user already exists in Supabase Auth to handle cases where 
    // the user was deleted from the Prisma database but still exists in Supabase Auth.
    let realUserId = null;
    let isAlreadyVerified = false;
    
    try {
      const existingSupabaseUsers: any[] = await prisma.$queryRawUnsafe(
        'SELECT id, email_confirmed_at FROM auth.users WHERE email = $1 LIMIT 1',
        email
      );
      
      if (existingSupabaseUsers && existingSupabaseUsers.length > 0) {
        realUserId = existingSupabaseUsers[0].id;
        isAlreadyVerified = !!existingSupabaseUsers[0].email_confirmed_at;
      }
    } catch (e) {
      console.error("Error querying auth.users:", e);
    }

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

    // If the user already existed in Supabase but wasn't verified, signUp might not resend the email
    // due to email enumeration protection. We force a resend here subject to rate limits.
    if (realUserId && !isAlreadyVerified) {
      await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${new URL(req.url).origin}/api/auth/callback`,
        }
      });
    }

    // 2. Create the user in your Prisma Database
    // Note: We use the REAL ID from Supabase to keep them in sync if they already existed
    const hashedPassword = await bcrypt.hash(password, 10);
    const finalUserId = realUserId || authData.user?.id;
    
    await prisma.user.upsert({
      where: { email },
      update: { 
        password: hashedPassword,
        id: finalUserId, // Ensure ID is correct if they were dangling in Supabase
        ...(isAlreadyVerified ? { emailVerified: new Date() } : {})
      },
      create: {
        id: finalUserId, 
        name,
        email,
        password: hashedPassword,
        emailVerified: isAlreadyVerified ? new Date() : null, 
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