
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const username = 'admin'
    const password = 'password'

    console.log(`Testing login for ${username}...`)

    const user = await prisma.user.findUnique({
        where: { username },
    })

    if (!user) {
        console.error('User not found!')
        return
    }

    console.log('User found:', user)

    const isValid = await bcrypt.compare(password, user.passwordHash)
    console.log('Password valid:', isValid)

    if (!isValid) {
        console.log('Hash in DB:', user.passwordHash)
        const newHash = await bcrypt.hash(password, 10)
        console.log('New hash would be:', newHash)
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
