import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { app } from "@/app/firebaseConfig";  // Adjust this import path as needed

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
        const credential = GoogleAuthProvider.credential(account.id_token);
        try {
          await signInWithCredential(auth, credential);
        } catch (error) {
          console.error("Error signing in with Firebase:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token, user }) {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  // Add this to ensure proper handling of CSRF Token
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };