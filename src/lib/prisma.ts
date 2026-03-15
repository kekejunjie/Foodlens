import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildDatasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}pgbouncer=true`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ datasourceUrl: buildDatasourceUrl() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
