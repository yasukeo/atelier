import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin user (CHANGE EMAIL/PASSWORD!)
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin1234'
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Admin',
      role: 'ADMIN',
    },
  })

  // Starter taxonomies
  const styles = ['islamique', 'abstrait', 'portrait', 'triptyques', 'figuratif', 'marocain', 'fantasia']
  const techniques = ['huile', 'aquarelle', 'acrylic', 'texturee']

  for (const name of styles) {
    await prisma.style.upsert({ where: { name }, update: {}, create: { name } })
  }
  for (const name of techniques) {
    await prisma.technique.upsert({ where: { name }, update: {}, create: { name } })
  }

  console.log('Seed complete. Admin:', admin.email)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
