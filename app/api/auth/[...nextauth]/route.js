import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.userId = user.email; // Use email as userId
      }
      console.log("JWT callback token:", token);
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.userId; // This will be the email
        session.accessToken = token.accessToken;
        // Ensure email is being set
        session.user.email = token.email;
      }
      console.log("NextAuth session:", session);
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };