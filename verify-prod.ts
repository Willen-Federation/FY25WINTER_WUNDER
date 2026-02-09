
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Connecting to DB...')
    try {
        const users = await prisma.user.findMany()
        console.log(`Found ${users.length} users.`)

        const admin = await prisma.user.findUnique({ where: { username: 'admin' } })
        if (admin) {
            console.log('Admin found:', admin)
            const isMatch = await bcrypt.compare('password', admin.passwordHash)
            console.log(`Password 'password' matches: ${isMatch}`)

            if (!isMatch) {
                const newHash = await bcrypt.hash('password', 10)
                console.log(`Expected hash for 'password' should look like: ${newHash}`)
            }
        } else {
            console.log('Admin user NOT found.')
        }
    } catch (e) {
        console.error('Connection failed:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
