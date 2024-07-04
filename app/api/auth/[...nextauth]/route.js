import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

console.log("NextAuth file is being executed");

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("Sign in callback", { user, account, profile, email });
      return true;
    },
    async session({ session, token, user }) {
      console.log("Session callback", { session, token, user });
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  debug: true,
};

console.log("AuthOptions configured:", JSON.stringify(authOptions, null, 2));

const handler = NextAuth(authOptions);

console.log("NextAuth handler created");

export { handler as GET, handler as POST };

console.log("NextAuth route exported");