
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const passwordHash = await bcrypt.hash('password', 10)

    // 1. Create Users
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            passwordHash,
            displayName: 'Admin User',
            role: 'ADMIN',
            iconUrl: '/avatars/admin.png', // Placeholder
        },
    })

    const user1 = await prisma.user.upsert({
        where: { username: 'user1' },
        update: {},
        create: {
            username: 'user1',
            passwordHash,
            displayName: 'Alice Wonder',
            role: 'USER',
            iconUrl: '/avatars/alice.png', // Placeholder
        },
    })

    const user2 = await prisma.user.upsert({
        where: { username: 'user2' },
        update: {},
        create: {
            username: 'user2',
            passwordHash,
            displayName: 'Bob Builder',
            role: 'USER',
            iconUrl: '/avatars/bob.png', // Placeholder
        },
    })

    console.log({ admin, user1, user2 })

    // 2. Create Expenses
    // Admin paid for cabin rental
    const expense1 = await prisma.expense.create({
        data: {
            title: 'Cabin Rental',
            amount: 45000,
            category: '宿泊',
            payerId: admin.id,
            splits: {
                create: [
                    { userId: admin.id, amount: 15000 },
                    { userId: user1.id, amount: 15000 },
                    { userId: user2.id, amount: 15000 },
                ],
            },
        },
    })

    // Alice paid for groceries
    const expense2 = await prisma.expense.create({
        data: {
            title: 'Groceries',
            amount: 12000,
            category: '飲食',
            payerId: user1.id,
            splits: {
                create: [
                    { userId: admin.id, amount: 4000 },
                    { userId: user1.id, amount: 4000 },
                    { userId: user2.id, amount: 4000 },
                ],
            },
        },
    })

    // Bob paid for gas
    const expense3 = await prisma.expense.create({
        data: {
            title: 'Gas',
            amount: 5000,
            category: '交通',
            payerId: user2.id,
            splits: {
                create: [
                    { userId: admin.id, amount: 1666 },
                    { userId: user1.id, amount: 1667 }, // Adjusting for int division if needed
                    { userId: user2.id, amount: 1667 },
                ],
            },
        },
    })

    console.log({ expense1, expense2, expense3 })

    // 3. Create Itinerary Days & Items
    const days = [1, 2, 3]
    for (const day of days) {
        await prisma.itineraryDay.upsert({
            where: { day },
            update: {},
            create: {
                day,
                markdown: `## Day ${day} Plan\n\n- Activity 1\n- Activity 2`,
            },
        })
    }

    // Add items to Day 1
    await prisma.itineraryItem.create({
        data: {
            day: 1,
            startTime: new Date('2025-02-14T09:00:00'),
            endTime: new Date('2025-02-14T12:00:00'),
            title: 'Morning Meeting',
            content: 'Discuss project roadmap',
            order: 1
        }
    })

    await prisma.itineraryItem.create({
        data: {
            day: 1,
            startTime: new Date('2025-02-14T13:00:00'),
            endTime: new Date('2025-02-14T17:00:00'),
            title: 'Development Session',
            content: 'Coding the core features',
            order: 2
        }
    })

    console.log('Seeding finished.')
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
