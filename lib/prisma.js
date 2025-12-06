import { PrismaClient } from '@prisma/client';

// PrismaClient singleton pattern for Next.js
// This prevents multiple instances of Prisma Client in development

const globalForPrisma = global;

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;
