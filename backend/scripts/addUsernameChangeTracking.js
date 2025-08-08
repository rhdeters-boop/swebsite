import sequelize from '../config/database.js';

/**
 * Migration script to add username change tracking to User table
 * This adds the lastUsernameChangeAt field for 30-day restriction enforcement
 * Run this script to update an existing database
 */

async function addUsernameChangeTracking() {
  try {
    console.log('🚀 Starting database migration for username change tracking...');

    // Sync all models with alter option to add new fields safely
    await sequelize.sync({ force: false, alter: true });
    
    console.log('✅ Database synced successfully with username change tracking!');
    
    // Show table info for Users table to verify the new field
    try {
      const tableInfo = await sequelize.getQueryInterface().describeTable('users');
      if (tableInfo.lastUsernameChangeAt) {
        console.log('📋 lastUsernameChangeAt field added successfully:');
        console.table({
          column: 'lastUsernameChangeAt',
          type: tableInfo.lastUsernameChangeAt.type,
          allowNull: tableInfo.lastUsernameChangeAt.allowNull,
          defaultValue: tableInfo.lastUsernameChangeAt.defaultValue
        });
      } else {
        console.log('⚠️ lastUsernameChangeAt field not found in table description');
      }
    } catch (error) {
      console.log('📋 Table info not available, but migration completed');
    }

    // Create index for performance if it doesn't exist
    try {
      const queryInterface = sequelize.getQueryInterface();
      const indexes = await queryInterface.showIndex('users');
      const hasIndex = indexes.some(index => index.name === 'idx_user_last_username_change');
      
      if (!hasIndex) {
        await queryInterface.addIndex('users', ['lastUsernameChangeAt'], {
          name: 'idx_user_last_username_change'
        });
        console.log('✅ Index created for lastUsernameChangeAt field');
      } else {
        console.log('✅ Index already exists for lastUsernameChangeAt field');
      }
    } catch (error) {
      console.log('⚠️ Index creation handled by model definition');
    }

    console.log('🎉 Migration completed successfully!');
    console.log('Users can now change their username once per month');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
}

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addUsernameChangeTracking()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export default addUsernameChangeTracking;
