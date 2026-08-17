import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const authOptions = {
  providers: [
    // Email/Password login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const { data: users } = await supabase
          .from("users")
          .select("*")
          .eq("email", credentials.email);

        if (!users || users.length === 0) {
          throw new Error("Invalid email or password");
        }

        const user = users[0];
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!passwordMatch) {
          throw new Error("Invalid email or password");
        }

        return { id: user.id, email: user.email };
      },
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // If Google login, create user in Supabase if doesn't exist
      if (account?.provider === "google") {
        const { data: existingUsers } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email);

        if (!existingUsers || existingUsers.length === 0) {
          // Create new user with a random password (they won't use it for Google login)
          const randomPassword = Math.random().toString(36).slice(-20);
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          await supabase.from("users").insert([
            {
              email: user.email,
              password_hash: hashedPassword,
              email_verified: true, // Google email is verified
            },
          ]);
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      session.userId = token.userId;
      return session;
    },
  },

  // Custom sign-in page — our own branded login screen at /login (see app/login/page.jsx).
  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
