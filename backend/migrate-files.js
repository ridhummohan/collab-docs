// backend/migrate-docs.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const userId = 'YOUR_USER_ID_HERE'; // <-- Replace with your actual Google user id from the User table
  const result = await prisma.document.updateMany({
    where: {
      authorId: null
    },
    data: {
      authorId: userId
    }
  });
  console.log("Migrated docs count:", result.count);
  process.exit();
})();
