
import { prisma } from '../src/lib/prisma'

async function main() {
    const username = process.argv[2]
    if (!username) {
        console.log('Usage: npx tsx scripts/set-admin.ts <username>')
        process.exit(1)
    }

    try {
        const user = await prisma.user.update({
            where: { username },
            data: { role: 'ADMIN' }
        })
        console.log(`User ${username} is now ADMIN.`)
    } catch (e) {
        console.error('Error:', e)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
