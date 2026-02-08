
import { prisma } from '../src/lib/prisma'
import { hashPassword } from '../src/lib/auth'

async function main() {
    const args = process.argv.slice(2)
    if (args.length < 3) {
        console.error('Usage: npx tsx scripts/create-user.ts <username> <password> <displayName> [iconUrl]')
        process.exit(1)
    }

    const [username, password, displayName, iconUrl] = args

    console.log(`Creating user: ${username} (${displayName})...`)

    const passwordHash = await hashPassword(password)

    try {
        const user = await prisma.user.create({
            data: {
                username,
                passwordHash,
                displayName,
                iconUrl: iconUrl || null,
            },
        })
        console.log(`User created successfully! ID: ${user.id}`)
    } catch (error) {
        console.error('Error creating user:', error)
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
