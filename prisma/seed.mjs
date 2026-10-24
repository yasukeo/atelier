import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const prisma = new PrismaClient()

// `node prisma/seed.mjs --demo` also creates a demo artist + paintings (local dev only).
const WITH_DEMO = process.argv.includes('--demo')

async function seedDemo() {
  // Copy sample images into public/paintings/demo (gitignored local-upload folder)
  const srcDir = path.join(process.cwd(), 'paintings')
  const destDir = path.join(process.cwd(), 'public', 'paintings', 'demo')
  await fs.mkdir(destDir, { recursive: true })
  const files = (await fs.readdir(srcDir)).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).sort()
  for (const f of files) await fs.copyFile(path.join(srcDir, f), path.join(destDir, f))
  const urls = files.map(f => `/paintings/demo/${f}`)
  if (!urls.length) {
    console.warn('No demo images found in ./paintings — skipping demo paintings.')
    return
  }

  const artist =
    (await prisma.artist.findFirst({ where: { name: 'Atelier Elwarcha' } })) ??
    (await prisma.artist.create({ data: { name: 'Atelier Elwarcha', bio: 'Artiste de démonstration.' } }))
  const style = (name) => prisma.style.findUnique({ where: { name } })
  const technique = (name) => prisma.technique.findUnique({ where: { name } })

  const demo = [
    { title: 'Soir sur la médina', kind: 'UNIQUE', priceMAD: 3200, widthCm: 60, heightCm: 80, orientation: 'PORTRAIT', style: 'marocain', technique: 'huile', description: 'Lumière dorée sur les toits de la médina au coucher du soleil.' },
    { title: 'Paysage du soir', kind: 'RECREATABLE', priceMAD: 1800, widthCm: 70, heightCm: 50, orientation: 'PAYSAGE', style: 'figuratif', technique: 'acrylic', leadTimeWeeks: '1 à 3 semaines', description: 'Un paysage apaisant, disponible en plusieurs formats.', options: [[50, 35, 1200], [70, 50, 1800], [100, 70, 2900]] },
    { title: 'Arabesques', kind: 'UNIQUE', priceMAD: 4500, widthCm: 50, heightCm: 50, orientation: 'CARRE', style: 'islamique', technique: 'texturee', description: 'Motifs géométriques inspirés du zellige.' },
    { title: 'Fantasia', kind: 'RECREATABLE', priceMAD: 2600, widthCm: 90, heightCm: 60, orientation: 'PAYSAGE', style: 'fantasia', technique: 'huile', leadTimeWeeks: '2 à 4 semaines', description: 'Cavaliers lancés au galop, poudre et poussière.', options: [[60, 40, 1700], [90, 60, 2600]] },
    { title: 'Abstraction ocre', kind: 'UNIQUE', priceMAD: 1500, widthCm: 40, heightCm: 60, orientation: 'PORTRAIT', style: 'abstrait', technique: 'acrylic', description: 'Textures ocre et terre de Sienne.' },
    { title: 'Bleu Chefchaouen', kind: 'UNIQUE', priceMAD: 2200, widthCm: 50, heightCm: 70, orientation: 'PORTRAIT', style: 'marocain', technique: 'aquarelle', description: 'Ruelles bleues de la ville bleue.' },
  ]

  for (const [i, d] of demo.entries()) {
    if (await prisma.painting.findFirst({ where: { title: d.title, artistId: artist.id } })) continue
    const [s, t] = await Promise.all([style(d.style), technique(d.technique)])
    await prisma.painting.create({
      data: {
        title: d.title,
        description: d.description,
        kind: d.kind,
        priceMAD: d.priceMAD,
        widthCm: d.widthCm,
        heightCm: d.heightCm,
        orientation: d.orientation,
        leadTimeWeeks: d.leadTimeWeeks,
        artistId: artist.id,
        styleId: s?.id,
        techniqueId: t?.id,
        images: {
          create: [0, 1].map(offset => ({
            url: urls[(i + offset) % urls.length],
            alt: d.title,
            position: offset,
          })),
        },
        recreationOptions: d.options
          ? { create: d.options.map(([widthCm, heightCm, priceMAD]) => ({ widthCm, heightCm, priceMAD })) }
          : undefined,
      },
    })
  }

  await prisma.discountCode.upsert({
    where: { code: 'BIENVENUE10' },
    update: {},
    create: { code: 'BIENVENUE10', percent: 10 },
  })
  console.log(`Demo content ready: ${demo.length} paintings, discount code BIENVENUE10.`)
}

async function main() {
  // Admin user (CHANGE EMAIL/PASSWORD!)
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase()
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

  if (WITH_DEMO) await seedDemo()

  console.log('Seed complete. Admin:', admin.email)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
