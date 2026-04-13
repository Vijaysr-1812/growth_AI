import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

// Initialize the email client
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // 2. Securely hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // 4. Send the Personalized Welcome Email
    try {
      // We extract the name from the email (e.g., "vijay" from "vijay@email.com")
      const userName = email.split("@")[0];

      await resend.emails.send({
        from: "Growth.AI <onboarding@resend.dev>", // Resend's default testing address
        to: email, // Sends to the person who just registered
        subject: "Welcome to Growth.AI! 🚀",
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #3b82f6;">Welcome to Growth.AI, ${userName}!</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.5;">
              Your account for <strong>${email}</strong> has been successfully created. We are thrilled to have you on board!
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.5;">
              You can now head over to your dashboard to start building your custom watchlists, tracking the global markets, and getting personalized AI insights on your favorite companies.
            </p>
            <br/>
            <p style="color: #666; font-size: 14px;">
              Happy Investing,<br/>
              <strong>The Growth.AI Team</strong>
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      // If the email fails, we log it but don't break the registration process
      console.error("Failed to send welcome email:", emailError);
    }

    return NextResponse.json({ message: "User created" }, { status: 201 });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}