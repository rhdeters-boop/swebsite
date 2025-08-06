import { MediaAnalytics, MediaItem, Creator, User } from '../models/index.js';
import AnalyticsService from '../services/AnalyticsService.js';

/**
 * Script to test MediaAnalytics functionality
 */

async function testAnalytics() {
  try {
    console.log('🧪 Testing MediaAnalytics functionality...');

    // Find a media item to test with
    const mediaItem = await MediaItem.findOne({
      include: [
        {
          model: Creator,
          as: 'creator',
          include: [
            {
              model: User,
              as: 'user',
            },
          ],
        },
      ],
    });

    if (!mediaItem) {
      console.log('❌ No media items found. Please create some media first.');
      return;
    }

    console.log(`📺 Testing with media item: "${mediaItem.title}" by ${mediaItem.creator?.displayName || 'Unknown'}`);

    // Test recording views
    console.log('\n🔍 Testing view recording...');
    await AnalyticsService.recordView(mediaItem.id, null, 0);
    await AnalyticsService.recordView(mediaItem.id, null, 30); // 30 seconds watch time
    await AnalyticsService.recordView(mediaItem.id, null, 45); // 45 seconds watch time

    // Test recording likes
    console.log('👍 Testing like recording...');
    await AnalyticsService.recordLike(mediaItem.id);
    await AnalyticsService.recordLike(mediaItem.id);

    // Test recording shares
    console.log('📤 Testing share recording...');
    await AnalyticsService.recordShare(mediaItem.id);

    // Get analytics for today
    const today = new Date().toISOString().split('T')[0];
    const analytics = await MediaAnalytics.findOne({
      where: {
        mediaItemId: mediaItem.id,
        date: today,
      },
    });

    if (analytics) {
      console.log('\n📊 Analytics for today:');
      console.log(`  Views: ${analytics.dailyViews}`);
      console.log(`  Likes: ${analytics.dailyLikes}`);
      console.log(`  Shares: ${analytics.dailyShares}`);
      console.log(`  Watch Time: ${analytics.watchTime} seconds`);
      console.log(`  Average Watch Time: ${analytics.averageWatchTime.toFixed(2)} seconds`);
    }

    // Test aggregated analytics
    console.log('\n📈 Testing aggregated analytics...');
    const aggregated = await MediaAnalytics.getAggregatedAnalytics(
      mediaItem.id,
      today,
      today
    );

    if (aggregated) {
      console.log('📊 Aggregated analytics:');
      console.log(`  Total Views: ${aggregated.totalViews}`);
      console.log(`  Total Likes: ${aggregated.totalLikes}`);
      console.log(`  Total Shares: ${aggregated.totalShares}`);
      console.log(`  Total Watch Time: ${aggregated.totalWatchTime} seconds`);
    }

    // Test creator analytics
    if (mediaItem.creator) {
      console.log('\n👤 Testing creator analytics...');
      const creatorAnalytics = await AnalyticsService.getCreatorAnalytics(
        mediaItem.creator.id,
        today,
        today
      );

      console.log('📊 Creator analytics summary:');
      console.log(`  Total Views: ${creatorAnalytics.summary.totalViews}`);
      console.log(`  Total Likes: ${creatorAnalytics.summary.totalLikes}`);
      console.log(`  Total Shares: ${creatorAnalytics.summary.totalShares}`);
      console.log(`  Media Count: ${creatorAnalytics.summary.mediaCount}`);
    }

    console.log('\n✅ All analytics tests completed successfully!');

  } catch (error) {
    console.error('❌ Error testing analytics:', error);
    throw error;
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAnalytics()
    .then(() => {
      console.log('Analytics test completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Analytics test failed:', error);
      process.exit(1);
    });
}

export default testAnalytics;
