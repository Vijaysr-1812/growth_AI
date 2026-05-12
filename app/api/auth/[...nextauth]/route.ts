import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "../../../../lib/prisma"; 
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        // 1. Find user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        // NEW: 2. Check if they have verified their email
        // We only enforce this for users who signed up with credentials (password exists)
        if (!user.emailVerified) {
          // Fallback: Check Supabase Admin in case PKCE callback failed or was done on another device
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          
          let isVerifiedInSupabase = false;
          
          if (supabaseUrl && supabaseKey) {
            const { createClient } = require('@supabase/supabase-js');
            const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
            
            const { data: authData } = await supabaseAdmin.auth.admin.getUserById(user.id);
            
            if (authData?.user?.email_confirmed_at) {
              isVerifiedInSupabase = true;
              
              // Sync our Prisma DB
              await prisma.user.update({
                where: { id: user.id },
                data: { emailVerified: new Date(authData.user.email_confirmed_at) }
              });
            }
          }

          if (!isVerifiedInSupabase) {
            throw new Error("Access Denied: Please check your email and verify your account first.");
          }
        }

        // 3. Verify password with bcrypt
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login', 
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };