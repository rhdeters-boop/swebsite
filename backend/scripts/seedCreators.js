import { User, Creator } from '../models/index.js';
import bcrypt from 'bcryptjs';

// Creator data based on the mock data but with more realistic information
const creatorData = [
  {
    displayName: 'Luna Rose',
    email: 'luna.rose@example.com',
    username: 'lunarose',
    bio: 'Lifestyle creator sharing my daily adventures and beauty tips. Join me for exclusive content and behind-the-scenes moments! ✨',
    categories: ['lifestyle', 'beauty', 'fashion'],
    subscriptionPrice: 999, // $9.99
    followerCount: 12500,
    subscriberCount: 3200,
    rating: 4.9,
    ratingCount: 450,
    isVerified: true,
    socialLinks: {
      instagram: '@lunarose_official',
      twitter: '@lunarose',
      tiktok: '@lunarose'
    }
  },
  {
    displayName: 'Aria Moon',
    email: 'aria.moon@example.com',
    username: 'ariamoon',
    bio: 'Fitness enthusiast and wellness coach. Helping you achieve your best self through mindful living and healthy habits 💪',
    categories: ['fitness', 'wellness', 'lifestyle'],
    subscriptionPrice: 1299, // $12.99
    followerCount: 8300,
    subscriberCount: 2100,
    rating: 4.8,
    ratingCount: 320,
    isVerified: true,
    socialLinks: {
      instagram: '@ariamoon_fit',
      twitter: '@ariamoon'
    }
  },
  {
    displayName: 'Zara Noir',
    email: 'zara.noir@example.com',
    username: 'zaranoir',
    bio: 'Artist and creative soul. Exploring the depths of creativity through photography, painting, and digital art 🎨',
    categories: ['art', 'photography', 'creativity'],
    subscriptionPrice: 1599, // $15.99
    followerCount: 15200,
    subscriberCount: 4800,
    rating: 4.9,
    ratingCount: 680,
    isVerified: true,
    socialLinks: {
      instagram: '@zaranoir_art',
      twitter: '@zaranoir',
      tiktok: '@zaranoir_creates'
    }
  },
  {
    displayName: 'Ivy Sterling',
    email: 'ivy.sterling@example.com',
    username: 'ivysterling',
    bio: 'Fashion designer and style curator. Bringing you the latest trends and timeless elegance in every post 👗',
    categories: ['fashion', 'design', 'style'],
    subscriptionPrice: 899, // $8.99
    followerCount: 6800,
    subscriberCount: 1950,
    rating: 4.7,
    ratingCount: 280,
    isVerified: false,
    socialLinks: {
      instagram: '@ivysterling_style',
      twitter: '@ivysterling'
    }
  },
  {
    displayName: 'Nova Blake',
    email: 'nova.blake@example.com',
    username: 'novablake',
    bio: 'Tech enthusiast and digital nomad. Sharing my journey through the digital world and remote work lifestyle 💻',
    categories: ['technology', 'lifestyle', 'travel'],
    subscriptionPrice: 1199, // $11.99
    followerCount: 11100,
    subscriberCount: 2800,
    rating: 4.8,
    ratingCount: 390,
    isVerified: true,
    socialLinks: {
      instagram: '@novablake_tech',
      twitter: '@novablake',
      tiktok: '@novablake_digital'
    }
  },
  {
    displayName: 'Stella Divine',
    email: 'stella.divine@example.com',
    username: 'stelladivine',
    bio: 'Spiritual guide and wellness mentor. Join me on a journey of self-discovery and inner peace 🌟',
    categories: ['wellness', 'spirituality', 'mindfulness'],
    subscriptionPrice: 1799, // $17.99
    followerCount: 18700,
    subscriberCount: 5200,
    rating: 4.9,
    ratingCount: 720,
    isVerified: true,
    socialLinks: {
      instagram: '@stelladivine_spirit',
      twitter: '@stelladivine'
    }
  },
  {
    displayName: 'Aurora Night',
    email: 'aurora.night@example.com',
    username: 'auroranight',
    bio: 'Music producer and songwriter. Creating dreamy soundscapes and sharing my musical journey 🎵',
    categories: ['music', 'creativity', 'art'],
    subscriptionPrice: 1399, // $13.99
    followerCount: 9200,
    subscriberCount: 2600,
    rating: 4.6,
    ratingCount: 340,
    isVerified: false,
    socialLinks: {
      instagram: '@auroranight_music',
      twitter: '@auroranight',
      tiktok: '@auroranight_beats'
    }
  },
  {
    displayName: 'Crystal Moon',
    email: 'crystal.moon@example.com',
    username: 'crystalmoon',
    bio: 'Yoga instructor and meditation guide. Finding balance and harmony in mind, body, and spirit 🧘‍♀️',
    categories: ['yoga', 'meditation', 'wellness'],
    subscriptionPrice: 1099, // $10.99
    followerCount: 13500,
    subscriberCount: 3600,
    rating: 4.8,
    ratingCount: 480,
    isVerified: true,
    socialLinks: {
      instagram: '@crystalmoon_yoga',
      twitter: '@crystalmoon'
    }
  },
  {
    displayName: 'Phoenix Fire',
    email: 'phoenix.fire@example.com',
    username: 'phoenixfire',
    bio: 'Adventure seeker and outdoor enthusiast. Documenting epic journeys and extreme sports adventures 🏔️',
    categories: ['adventure', 'sports', 'travel'],
    subscriptionPrice: 799, // $7.99
    followerCount: 7900,
    subscriberCount: 2200,
    rating: 4.7,
    ratingCount: 310,
    isVerified: false,
    socialLinks: {
      instagram: '@phoenixfire_adventure',
      twitter: '@phoenixfire',
      tiktok: '@phoenixfire_extreme'
    }
  },
  {
    displayName: 'Raven Star',
    email: 'raven.star@example.com',
    username: 'ravenstar',
    bio: 'Chef and culinary artist. Sharing delicious recipes and cooking techniques from around the world 👨‍🍳',
    categories: ['cooking', 'food', 'lifestyle'],
    subscriptionPrice: 1299, // $12.99
    followerCount: 16300,
    subscriberCount: 4500,
    rating: 4.9,
    ratingCount: 610,
    isVerified: true,
    socialLinks: {
      instagram: '@ravenstar_chef',
      twitter: '@ravenstar',
      tiktok: '@ravenstar_cooks'
    }
  }
];

export async function seedCreators() {
  try {
    console.log('🌱 Starting creator seeding...');

    // Check if creators already exist
    const existingCreators = await Creator.count();
    if (existingCreators > 0) {
      console.log(`⚠️  Found ${existingCreators} existing creators. Skipping seeding.`);
      console.log('💡 To re-seed, first clear the database or delete existing creators.');
      return;
    }

    console.log('👥 Creating creator accounts...');

    const createdCreators = [];

    for (const creatorInfo of creatorData) {
      console.log(`📝 Creating creator: ${creatorInfo.displayName}...`);

      // Create user account
      const user = await User.create({
        email: creatorInfo.email,
        username: creatorInfo.username,
        displayName: creatorInfo.displayName,
        password: 'Creator123!', // Default password for demo accounts
        isEmailVerified: true,
        isActive: true,
      });

      // Create creator profile
      const creator = await Creator.create({
        userId: user.id,
        displayName: creatorInfo.displayName,
        bio: creatorInfo.bio,
        categories: creatorInfo.categories,
        subscriptionPrice: creatorInfo.subscriptionPrice,
        followerCount: creatorInfo.followerCount,
        subscriberCount: creatorInfo.subscriberCount,
        rating: creatorInfo.rating,
        ratingCount: creatorInfo.ratingCount,
        isVerified: creatorInfo.isVerified,
        socialLinks: creatorInfo.socialLinks,
        isActive: true,
        lastActiveAt: new Date(),
      });

      createdCreators.push({
        user: user.toJSON(),
        creator: creator.toJSON()
      });

      console.log(`✅ Created: ${creatorInfo.displayName} (${creatorInfo.email})`);
    }

    console.log(`\n🎉 Successfully created ${createdCreators.length} creator accounts!`);
    console.log('\n📊 Creator Summary:');
    
    createdCreators.forEach((account, index) => {
      const { user, creator } = account;
      console.log(`${index + 1}. ${creator.displayName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Username: ${user.username}`);
      console.log(`   💰 Price: $${creator.subscriptionPrice / 100}`);
      console.log(`   👥 Followers: ${creator.followerCount.toLocaleString()}`);
      console.log(`   ⭐ Rating: ${creator.rating}/5.0`);
      console.log(`   ✅ Verified: ${creator.isVerified ? 'Yes' : 'No'}`);
      console.log('');
    });

    console.log('🔑 Default password for all accounts: Creator123!');
    console.log('💡 Users can change their passwords after first login.');
    
    return createdCreators;

  } catch (error) {
    console.error('❌ Error seeding creators:', error);
    throw error;
  }
}

export async function clearCreators() {
  try {
    console.log('🗑️  Clearing existing creators...');
    
    // Get all creators
    const creators = await Creator.findAll();
    const userIds = creators.map(creator => creator.userId);
    
    // Delete creators first (due to foreign key constraint)
    await Creator.destroy({ where: {} });
    console.log(`🗑️  Deleted ${creators.length} creator profiles`);
    
    // Delete associated users
    const deletedUsers = await User.destroy({ 
      where: { id: userIds } 
    });
    console.log(`🗑️  Deleted ${deletedUsers} user accounts`);
    
    console.log('✅ Cleanup completed');
    
  } catch (error) {
    console.error('❌ Error clearing creators:', error);
    throw error;
  }
}

// Run seeder if called directly
if (process.argv[1].endsWith('seedCreators.js')) {
  const command = process.argv[2];
  
  if (command === 'clear') {
    clearCreators().then(() => {
      console.log('👋 Cleared creators successfully');
      process.exit(0);
    }).catch(error => {
      console.error('💥 Failed to clear creators:', error);
      process.exit(1);
    });
  } else {
    seedCreators().then(() => {
      console.log('👋 Seeding completed successfully');
      process.exit(0);
    }).catch(error => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
  }
}
