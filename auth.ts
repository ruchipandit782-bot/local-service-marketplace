import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { adminDb } from "@/lib/firebase/admin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // ==========================================
    // GOOGLE LOGIN
    // ==========================================
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),

    // ==========================================
    // EMAIL + PASSWORD LOGIN
    // ==========================================
    Credentials({
      name: "Email and Password",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        try {
          const email = String(credentials?.email || "")
            .trim()
            .toLowerCase();

          const password = String(credentials?.password || "");

          if (!email || !password) {
            return null;
          }

          // Find user in Firestore
          const userRef = adminDb
            .collection("users")
            .doc(email);

          const userSnapshot = await userRef.get();

          if (!userSnapshot.exists) {
            return null;
          }

          const userData = userSnapshot.data();

          // Email/password account must have a password hash
          if (!userData?.passwordHash) {
            return null;
          }

          // Compare entered password with stored hash
          const passwordMatches = await bcrypt.compare(
            password,
            userData.passwordHash
          );

          if (!passwordMatches) {
            return null;
          }

          // Return authenticated user
          return {
            id: userSnapshot.id,
            name: userData.name || "User",
            email: userData.email || email,
            image: userData.photoURL || null,
          };
        } catch (error) {
          console.error(
            "Email/password authorization error:",
            error
          );

          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },
});