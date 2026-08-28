import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
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
        if (
          !credentials?.email ||
          typeof credentials.email !== "string" ||
          !credentials?.password ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email.toLowerCase(),
            status: "ACTIVE",
          },
          include: {
            role: true,
            organization: true,
            branch: true,
          },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!passwordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.name,
          organizationId: user.organizationId,
          branchId: user.branchId ?? undefined,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.branchId = user.branchId;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.organizationId =
          token.organizationId as string;
        session.user.branchId =
          token.branchId as string | undefined;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});