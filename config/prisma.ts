import { PrismaClient } from '@prisma/client';

/**
 * Global Prisma Client instance for database operations
 * Configured with error and warning logging
 *
 * PrismaClient type is fully generated from the Prisma schema,
 * providing complete type safety for all database operations
 */
const prisma: PrismaClient = new PrismaClient({
  log: ['error', 'warn'],
});

/**
 * Test database connection on initialization
 * Logs success or failure to console
 */
prisma.$connect()
  .then((): void => {
    console.log('✅ Database connected successfully');
  })
  .catch((error: Error): void => {
    console.error('❌ Database connection failed:', error.message);
  });

/**
 * Handle cleanup on app termination
 * Ensures database connections are properly closed
 */
process.on('beforeExit', async (): Promise<void> => {
  await prisma.$disconnect();
});

export default prisma;
