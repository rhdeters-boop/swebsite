import { literal } from 'sequelize';

/**
 * Safely format a date for SQL queries
 * @param {Date|string} date - The date to format
 * @returns {string} - ISO formatted date string
 */
export const formatSQLDate = (date) => {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  // Validate ISO date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (typeof date === 'string' && dateRegex.test(date)) {
    return date;
  }
  throw new Error('Invalid date format');
};

/**
 * Create safe analytics aggregation literal for Sequelize
 * @param {string} metric - The metric to aggregate (daily_views, etc.)
 * @param {string} startDate - ISO formatted start date
 * @param {string} tableName - Table name for the subquery
 * @returns {Array} - Sequelize literal array
 */
export const createAnalyticsAggregation = (metric, startDate, tableName = 'media_analytics') => {
  // Validate metric name to prevent injection
  const validMetrics = ['daily_views', 'daily_likes', 'daily_shares'];
  if (!validMetrics.includes(metric)) {
    throw new Error('Invalid metric name');
  }

  // Validate and format date
  const safeDate = formatSQLDate(startDate);

  // Use parameterized query with Sequelize literal
  return literal(`(
    SELECT SUM(ma.${metric}) 
    FROM "${tableName}" ma 
    JOIN "media_items" mi ON ma.media_item_id = mi.id 
    WHERE mi.creator_id = "Creator".id 
    AND ma.date >= '${safeDate}'
  )`);
};

/**
 * Create safe combined analytics aggregation literal
 * @param {string[]} metrics - Array of metrics to sum
 * @param {string} startDate - ISO formatted start date
 * @returns {Array} - Sequelize literal array
 */
export const createCombinedAnalyticsAggregation = (metrics, startDate) => {
  // Validate metrics
  const validMetrics = ['daily_views', 'daily_likes', 'daily_shares'];
  const safeMetrics = metrics.filter(m => validMetrics.includes(m));
  if (safeMetrics.length === 0) {
    throw new Error('No valid metrics provided');
  }

  // Validate and format date
  const safeDate = formatSQLDate(startDate);

  const metricSum = safeMetrics.map(m => `ma.${m}`).join(' + ');

  return literal(`(
    SELECT SUM(${metricSum}) 
    FROM "media_analytics" ma 
    JOIN "media_items" mi ON ma.media_item_id = mi.id 
    WHERE mi.creator_id = "Creator".id 
    AND ma.date >= '${safeDate}'
  )`);
};

/**
 * Create safe view count aggregation literal
 * @returns {Array} - Sequelize literal array
 */
export const createViewCountAggregation = () => {
  return literal(`(
    SELECT SUM(mi.view_count) 
    FROM "media_items" mi 
    WHERE mi.creator_id = "Creator".id
  )`);
};

/**
 * Validate and sanitize numeric input
 * @param {any} value - Value to validate
 * @param {number} defaultValue - Default value if invalid
 * @param {Object} options - Validation options
 * @returns {number} - Validated number
 */
export const validateNumeric = (value, defaultValue = 0, options = {}) => {
  const { min = 0, max = Number.MAX_SAFE_INTEGER } = options;
  
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < min || parsed > max) {
    return defaultValue;
  }
  
  return parsed;
};

/**
 * Validate and sanitize sort order
 * @param {string} sortBy - Sort field
 * @param {string[]} allowedValues - Allowed sort values
 * @returns {string} - Validated sort value
 */
export const validateSortOrder = (sortBy, allowedValues) => {
  if (!allowedValues.includes(sortBy)) {
    return allowedValues[0] || 'id';
  }
  return sortBy;
};

/**
 * Sanitize search string for LIKE queries
 * @param {string} search - Search string
 * @returns {string} - Sanitized search string
 */
export const sanitizeSearchString = (search) => {
  if (typeof search !== 'string') {
    return '';
  }
  
  // Remove SQL wildcards and escape special characters
  return search
    .replace(/[%_]/g, '\\$&')  // Escape SQL wildcards
    .replace(/['"\\]/g, '')     // Remove quotes and backslashes
    .trim()
    .slice(0, 100);             // Limit length
};