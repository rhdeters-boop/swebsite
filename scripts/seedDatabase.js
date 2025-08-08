// scripts/seedDatabase.js
// Script to populate the database with sample creators, users, media, and subscriptions for local development.
// Usage: node scripts/seedDatabase.js

const { sequelize, User, Creator, MediaItem, Subscription } = require('../backend/models');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    await sequelize.sync({ force: true });

    // Create users
    const passwordHash = await bcrypt.hash('password123', 10);
    const users = await User.bulkCreate([
      { username: 'alice', email: 'alice@example.com', password: passwordHash },
      { username: 'bob', email: 'bob@example.com', password: passwordHash },
      { username: 'carol', email: 'carol@example.com', password: passwordHash },
    ]);

    // Create creators
    const creators = await Creator.bulkCreate([
      {
        displayName: 'Alice Star',
        bio: 'Welcome to my premium content!',
        categories: ['Fitness', 'Lifestyle'],
        followerCount: 10,
        subscriberCount: 2,
        location: 'Los Angeles',
        socialLinks: { instagram: 'alicestar', twitter: 'alicestar' },
        profileImageUrl: '/public/logo.png',
        coverImageUrl: '/public/logo.png',
      },
      {
        displayName: 'Bob Blaze',
        bio: 'Exclusive videos and more.',
        categories: ['Music', 'Vlogs'],
        followerCount: 5,
        subscriberCount: 1,
        location: 'New York',
        socialLinks: { instagram: 'bobblaze', twitter: 'bobblaze' },
        profileImageUrl: '/public/symbol.png',
        coverImageUrl: '/public/logo.png',
      },
    ]);

    // Create media items
    await MediaItem.bulkCreate([
      {
        creatorId: creators[0].id,
        type: 'image',
        title: 'Welcome Photo',
        thumbnailUrl: '/public/logo-transparent.png',
        url: '/public/logo-transparent.png',
        tier: 'picture',
        accessLevel: 'free',
        createdAt: new Date(),
        hasAccess: true,
      },
      {
        creatorId: creators[0].id,
        type: 'video',
        title: 'Premium Workout',
        thumbnailUrl: '/public/symbol-transparent.png',
        url: '/public/symbol-transparent.png',
        tier: 'solo_video',
        accessLevel: 'private',
        createdAt: new Date(),
        hasAccess: false,
      },
      {
        creatorId: creators[1].id,
        type: 'image',
        title: 'Behind the Scenes',
        thumbnailUrl: '/public/logo.png',
        url: '/public/logo.png',
        tier: 'picture',
        accessLevel: 'free',
        createdAt: new Date(),
        hasAccess: true,
      },
    ]);

    // Create subscriptions
    await Subscription.bulkCreate([
      {
        userId: users[0].id,
        creatorId: creators[0].id,
        status: 'active',
        tier: 'solo_video',
        startDate: new Date(),
        endDate: null,
      },
      {
        userId: users[1].id,
        creatorId: creators[1].id,
        status: 'active',
        tier: 'picture',
        startDate: new Date(),
        endDate: null,
      },
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
