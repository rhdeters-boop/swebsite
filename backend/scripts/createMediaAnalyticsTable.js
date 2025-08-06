import sequelize from '../config/database.js';

/**
 * Migration script to create MediaAnalytics table
 * Run this script to add the analytics functionality to an existing database
 */

async function createMediaAnalyticsTable() {
  try {
    console.log('🚀 Starting database sync with MediaAnalytics table...');

    // Sync all models in the correct order
    await sequelize.sync({ force: false, alter: true });
    
    console.log('✅ All tables synced successfully including MediaAnalytics!');
    
    // Show table info for MediaAnalytics
    try {
      const tableInfo = await sequelize.getQueryInterface().describeTable('mediaAnalytics');
      console.log('📋 MediaAnalytics table structure:');
      console.table(Object.keys(tableInfo).map(column => ({
        column,
        type: tableInfo[column].type,
        allowNull: tableInfo[column].allowNull,
        defaultValue: tableInfo[column].defaultValue
      })));
    } catch (error) {
      console.log('📋 MediaAnalytics table info not available, but sync completed');
    }

    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    throw error;
  }
}

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createMediaAnalyticsTable()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export default createMediaAnalyticsTable;
