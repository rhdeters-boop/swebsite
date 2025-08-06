import { MediaItem, Creator, User } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Script to create sample media items for testing analytics
 */

async function createSampleMediaItems() {
  try {
    console.log('📺 Creating sample media items...');

    // Get a creator to associate media with
    const creator = await Creator.findOne({
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });

    if (!creator) {
      console.log('❌ No creators found. Please create creators first.');
      return;
    }

    console.log(`👤 Using creator: ${creator.displayName}`);

    // Create sample media items
    const sampleMedia = [
      {
        creatorId: creator.id,
        title: 'Beautiful Sunset Photography',
        description: 'Amazing sunset shots from my recent trip to the mountains.',
        type: 'image',
        tier: 'picture',
        mimeType: 'image/jpeg',
        s3Key: `media/${uuidv4()}/sunset.jpg`,
        s3Bucket: 'void-media',
        fileSize: 2548739, // ~2.5MB
        width: 1920,
        height: 1080,
        isPublished: true,
        publishedAt: new Date(),
        tags: ['sunset', 'photography', 'nature', 'mountains'],
        sortOrder: 1,
      },
      {
        creatorId: creator.id,
        title: 'Morning Yoga Routine',
        description: 'Start your day with this energizing 15-minute yoga flow.',
        type: 'video',
        tier: 'solo_video',
        mimeType: 'video/mp4',
        s3Key: `media/${uuidv4()}/yoga.mp4`,
        s3Bucket: 'void-media',
        fileSize: 45892341, // ~45MB
        width: 1280,
        height: 720,
        duration: 900, // 15 minutes
        isPublished: true,
        publishedAt: new Date(),
        tags: ['yoga', 'fitness', 'morning', 'wellness'],
        sortOrder: 2,
      },
      {
        creatorId: creator.id,
        title: 'Behind the Scenes: Photo Shoot',
        description: 'Exclusive behind-the-scenes content from my latest fashion shoot.',
        type: 'video',
        tier: 'collab_video',
        mimeType: 'video/mp4',
        s3Key: `media/${uuidv4()}/bts.mp4`,
        s3Bucket: 'void-media',
        fileSize: 123456789, // ~123MB
        width: 1920,
        height: 1080,
        duration: 1800, // 30 minutes
        isPublished: true,
        publishedAt: new Date(),
        tags: ['bts', 'fashion', 'photography', 'exclusive'],
        sortOrder: 3,
      },
    ];

    const createdMedia = [];
    for (const mediaData of sampleMedia) {
      const mediaItem = await MediaItem.create(mediaData);
      createdMedia.push(mediaItem);
      console.log(`✅ Created: "${mediaItem.title}" (${mediaItem.type})`);
    }

    console.log(`\n🎉 Successfully created ${createdMedia.length} sample media items!`);

    // Show summary
    console.log('\n📋 Media items summary:');
    createdMedia.forEach((media, index) => {
      console.log(`  ${index + 1}. ${media.title}`);
      console.log(`     Type: ${media.type} | Tier: ${media.tier}`);
      console.log(`     Size: ${(media.fileSize / 1024 / 1024).toFixed(1)}MB`);
      if (media.duration) {
        console.log(`     Duration: ${Math.floor(media.duration / 60)}:${(media.duration % 60).toString().padStart(2, '0')}`);
      }
      console.log('');
    });

    return createdMedia;

  } catch (error) {
    console.error('❌ Error creating sample media items:', error);
    throw error;
  }
}

// Run the script if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createSampleMediaItems()
    .then(() => {
      console.log('Sample media creation completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Sample media creation failed:', error);
      process.exit(1);
    });
}

export default createSampleMediaItems;
