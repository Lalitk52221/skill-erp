import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
      organizationId: string;
      branchId?: string;
    };
  }

  interface User {
    role: string;
    organizationId: string;
    branchId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    organizationId: string;
    branchId?: string;
  }
}