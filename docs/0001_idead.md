Phase 1: Data & Environment Setup
This phase prepares the necessary user accounts and media content for the bot to use. It involves creating a one-time seeding script.

1. Bot User Account Generation
A script will be created to pre-populate the database with 50+ bot user accounts.

File to Create: scripts/seedBotUsers.js

Functionality:

This Node.js script will use the existing Sequelize User model (models/user.js or equivalent).

It will programmatically generate 50+ user profiles with randomized but valid credentials (e.g., username, email, and a hashed password). The faker-js library can be used for generating realistic data.

It will use User.bulkCreate() to efficiently insert these new users into the PostgreSQL users table.

2. Media Asset Preparation
A local directory structure will be created to store media files that the bot will upload.

Action: Create a local directory, for example, bot_media/, with subdirectories for different media types (e.g., videos/, images/).

Content: Populate these directories with a variety of sample media files for the bot to choose from randomly.

Phase 2: Bot Implementation
A new, standalone Node.js application (the "bot server") will be created to perform the simulation tasks. This application will run continuously as a background process.

Required Tools:

node-cron: For scheduling jobs at specific or random intervals.

axios: To make HTTP requests to the existing Express.js API.

sequelize: To connect directly to the PostgreSQL database for the analytics engine.

minio: The AWS S3 client SDK, configured to connect to the local MinIO instance for media uploads.

faker-js: For generating random post titles, descriptions, etc.

The implementation is broken into two parallel efforts: one for content posting and one for analytics manipulation.

Phase 2A: Content Posting Bot
This bot simulates users posting various media at random times. It will interact with the application's existing API endpoints as a real client would.

Files to Create:

bot_server/postingService.js: Contains the logic for a single posting action.

bot_server/scheduler.js: Sets up and manages the cron jobs that trigger the posting service.

Process Flow:

The scheduler.js file will initiate a cron job that runs periodically (e.g., every 5-10 minutes).

The job will execute the logic in postingService.js.

Select User: Randomly select one of the pre-generated bot users from the database.

Authenticate: Make a POST request to the app's login endpoint (e.g., /api/auth/login) with the selected user's credentials to obtain a JWT authentication token.

Prepare Content:

Randomly select a media file from the bot_media/ directory.

Use faker-js to generate a random title and description for the post.

Upload Media: Interact with the media upload flow. This typically involves:

Making a request to a backend endpoint to get a pre-signed upload URL for MinIO.

Using the minio client or a PUT request to upload the media file directly to the provided URL.

Create Post: Make an authenticated POST request to the media creation endpoint (e.g., /api/media/post), including the URL of the uploaded media and its generated metadata.

"Human-like" Posting Algorithm:
To avoid robotic, predictable posting times, the scheduler will incorporate randomness.

Randomized Execution: Within each scheduled run, use a probability check (e.g., Math.random() > 0.5) to decide whether to post anything at all.

Time-of-Day Weighting: Adjust the posting probability based on the time of day to simulate higher activity during typical waking hours and lower activity overnight. This can be done using a weight map corresponding to the hours of the day.

Phase 2B: Analytics Manipulation Engine
This engine will modify analytics for specific media to simulate viral growth realistically. It will interact directly with the PostgreSQL database for efficiency, using admin credentials.

Files to Create:

bot_server/analyticsService.js: Contains the logic for calculating and updating analytics.

bot_server/config.js: A configuration file to specify target media and growth parameters.

The bot server will need its own Sequelize models (models/media.js, etc.) that mirror the main application's database schema.

Configuration (config.js):

targetMediaId: The ID of the media item to make "go viral."

max_views: The maximum number of views the item should reach.

max_likes: The maximum number of likes the item should reach.

like_ratio: A float representing the desired likes-to-views ratio (e.g., 0.05 for 5%).

growth_duration_hours: The approximate number of hours the viral growth should take.

Realistic Growth Algorithm:
A cron job in scheduler.js will trigger the analyticsService.js every few minutes. The service will perform the following steps:

Fetch Current State: Query the database for the current views and likes of the targetMediaId.

Calculate New Views: To simulate a realistic S-curve (slow start, rapid growth, plateau), use a sigmoid (logistic) function. The number of views at a given time t since the start is calculated as:

V(t)= 
1+e 
−k(t−t 
0
​
 )
 
L
​
 

Where:

L is the max_views from the config.

t is the elapsed time since the simulation started.

k is a growth rate constant, derived from growth_duration_hours.

t 
0
​
  is the inflection point, typically half of growth_duration_hours.
The service will calculate the total views that should have accumulated by the current time and update the database record if it's higher than the current value.

Calculate New Likes: The new like count will be based on the new view count to maintain realism and ensure likes do not exceed views.

potential_likes = new_views * like_ratio

Add a slight random variation to this number.

The final new_likes value will be capped by both max_likes and new_views: final_likes = Math.min(potential_likes, new_views, max_likes).

Update Database: Use Media.update() to apply the final_likes and newly calculated view count to the target media record in the database. The update query will include a WHERE clause to ensure the new values are greater than the existing ones.