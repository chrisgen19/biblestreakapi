const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Test database connection
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
  });

// Handle cleanup on app termination
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
