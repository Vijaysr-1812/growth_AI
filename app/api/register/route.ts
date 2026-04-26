import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import crypto from "crypto"; // NEW: Built-in Node module to generate secure tokens

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // NEW: Generate a random 32-character hex string for the token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create the user, but save the token to their profile
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken, // Save the token here
      },
    });

    // NEW: Create the verification link (Make sure NEXTAUTH_URL is in your .env file!)
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationLink = `${baseUrl}/verify?token=${verificationToken}`;

    // Send the Verification Email
    try {
      const userName = email.split("@")[0];

      await resend.emails.send({
        from: "Growth.AI <onboarding@resend.dev>",
        to: email,
        subject: "Verify your email for Growth.AI 🚀",
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #3b82f6;">Welcome to Growth.AI, ${userName}!</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.5;">
              Someone recently created an account using this email address. If this was you, please verify your account by clicking the button below.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Yes, it's me - Verify Account
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              If you did not create this account, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    return NextResponse.json({ message: "Please check your email to verify your account." }, { status: 201 });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}