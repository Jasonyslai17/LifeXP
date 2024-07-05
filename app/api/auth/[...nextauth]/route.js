import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { app } from "@/app/firebaseConfig";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (account.provider === "google") {
        const auth = getAuth(app);
        const credential = GoogleAuthProvider.credential(account.id_token, account.access_token);
        try {
          const result = await signInWithCredential(auth, credential);
          if (result.user) {
            console.log("Firebase user set:", result.user);
          }
        } catch (error) {
          console.error("Error signing in with Firebase:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };