# Service Layer Architecture Implementation

## Overview

This document outlines the implementation of a comprehensive service layer to improve separation of concerns in the backend application. The service layer moves business logic out of route handlers into dedicated service classes, making the code more maintainable, testable, and reusable.

## Architecture Benefits

### 1. **Separation of Concerns**
- **Routes**: Handle HTTP-specific logic (validation, request/response formatting)
- **Services**: Contain business logic and data operations
- **Models**: Define data structure and basic database operations

### 2. **Improved Maintainability**
- Business logic is centralized in service classes
- Easier to modify business rules without touching route handlers
- Consistent error handling across the application

### 3. **Enhanced Testability**
- Service methods can be unit tested independently
- Business logic tests are separate from HTTP integration tests
- Easier to mock dependencies for testing

### 4. **Better Reusability**
- Service methods can be called from multiple routes
- Business logic can be reused in different contexts (APIs, background jobs, etc.)
- Shared functionality is centralized

## Service Layer Structure

### Core Services

#### 1. **AuthService** (`/services/AuthService.js`)
Handles all authentication and user account management:

```javascript
// Key Methods:
- registerUser(userData)
- loginUser(credentials)
- checkUsernameAvailability(username)
- requestPasswordReset(email)
- resetPassword(token, newPassword)
- updateProfile(userId, profileData)
- changePassword(userId, passwords)
- changeEmail(userId, newEmail)
- getAccountInfo(userId)
```

**Responsibilities:**
- User registration and login
- Password reset functionality
- Profile management
- Account settings
- JWT token generation

#### 2. **CreatorService** (`/services/CreatorService.js`)
Manages creator profiles and discovery:

```javascript
// Key Methods:
- getCreators(filters, pagination, userId)
- getTopPerformers(limit)
- getTrendingCreators(limit)
- getNewRisingCreators(limit)
- getCreatorById(id, userId)
- createCreator(userId, creatorData)
- updateCreator(userId, updateData)
- toggleFollow(creatorId, userId)
```

**Responsibilities:**
- Creator profile CRUD operations
- Creator discovery and search
- Analytics-based creator ranking
- Follow/unfollow functionality
- Creator status management

#### 3. **UserService** (`/services/UserService.js`)
Handles basic user operations:

```javascript
// Key Methods:
- getUserProfile(userId)
- updateUserProfile(userId, profileData)
- getUserByUsername(username)
- getUserByEmail(email)
- getUserStats(userId)
- deactivateAccount(userId)
- reactivateAccount(userId)
```

**Responsibilities:**
- Basic user profile operations
- User lookup functions
- Account status management
- User statistics

#### 4. **MediaService** (`/services/MediaService.js`)
Manages media content and access control:

```javascript
// Key Methods:
- getMediaByTier(tier, userId, subscription, pagination)
- getAccessibleMedia(userId, subscription, pagination)
- getMediaItem(id, userId, subscription)
- uploadMediaFile(file, metadata, creatorId)
- updateMediaItem(id, updateData, creatorId)
- deleteMediaItem(id, creatorId)
- getMediaByCreator(creatorId, options)
```

**Responsibilities:**
- Media upload and management
- Access control based on subscriptions
- Signed URL generation
- Media analytics integration
- File organization and metadata

#### 5. **SubscriptionService** (`/services/SubscriptionService.js`)
Handles subscription management:

```javascript
// Key Methods:
- getCurrentSubscription(userId)
- getSubscriptionHistory(userId)
- createSubscription(subscriptionData)
- cancelSubscription(userId, options)
- subscribeToCreator(userId, creatorId, data)
- unsubscribeFromCreator(userId, creatorId)
- getSubscriptionAnalytics(creatorId, options)
```

**Responsibilities:**
- Subscription lifecycle management
- Creator subscription handling
- Tier access validation
- Subscription analytics
- Billing cycle management

#### 6. **PaymentService** (`/services/PaymentService.js`)
Manages payments and Stripe integration:

```javascript
// Key Methods:
- createTipPaymentIntent(userId, tipData)
- createSubscriptionPaymentIntent(userId, subscriptionData)
- getPaymentHistory(userId, options)
- getCreatorPaymentAnalytics(creatorId, options)
- handlePaymentSucceeded(paymentIntent)
- cancelSubscription(subscriptionId, options)
- createSetupIntent(userId)
```

**Responsibilities:**
- Stripe payment processing
- Payment intent creation
- Webhook handling
- Payment method management
- Revenue analytics

## Implementation Patterns

### 1. **Error Handling**
Services throw descriptive errors that routes catch and convert to appropriate HTTP responses:

```javascript
// Service
async getCreatorById(id, userId) {
  const creator = await Creator.findOne({ where: { id, isActive: true } });
  if (!creator) {
    throw new Error('Creator not found');
  }
  return creator;
}

// Route
try {
  const creator = await CreatorService.getCreatorById(id, req.user?.id);
  res.json({ success: true, creator });
} catch (error) {
  if (error.message === 'Creator not found') {
    return res.status(404).json({ success: false, message: error.message });
  }
  next(error);
}
```

### 2. **Data Validation**
Routes handle input validation, services assume clean data:

```javascript
// Route validates input
router.post('/apply', authenticateToken, [
  body('displayName').trim().isLength({ min: 2, max: 50 }),
  body('categories').isArray({ min: 1, max: 5 }),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  
  // Service receives validated data
  const creator = await CreatorService.createCreator(req.user.id, req.body);
});
```

### 3. **Response Formatting**
Routes format responses consistently:

```javascript
// Success response
res.json({
  success: true,
  data: result,
  message: 'Operation completed successfully'
});

// Error response
res.status(400).json({
  success: false,
  message: error.message
});
```

### 4. **Singleton Pattern**
Services are exported as singletons to maintain state and avoid recreation:

```javascript
class PaymentService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  // ... methods
}

export default new PaymentService();
```

## Migration Benefits

### Before (Route-Heavy)
```javascript
// All business logic in route handler
router.get('/', async (req, res) => {
  try {
    // Build complex query
    const where = { isActive: true };
    if (search) {
      where[Op.or] = [/* complex search logic */];
    }
    
    // Complex sorting logic
    let order = [];
    switch (sortBy) {
      case 'trending':
        // 20+ lines of analytics logic
        break;
      // ... more cases
    }
    
    // Database query
    const { rows, count } = await Creator.findAndCountAll({/* complex query */});
    
    // Post-processing
    if (req.user) {
      // User-specific data processing
    }
    
    res.json({/* formatted response */});
  } catch (error) {
    next(error);
  }
});
```

### After (Service-Based)
```javascript
// Clean route handler
router.get('/', optionalAuth, [/* validation */], async (req, res, next) => {
  try {
    const result = await CreatorService.getCreators({
      search: req.query.search,
      category: req.query.category,
      sortBy: req.query.sortBy,
      page: req.query.page,
      limit: req.query.limit,
      userId: req.user?.id
    });

    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});
```

## Testing Strategy

### Unit Testing Services
```javascript
// Test business logic in isolation
describe('CreatorService', () => {
  test('should throw error when creator not found', async () => {
    await expect(CreatorService.getCreatorById('invalid-id'))
      .rejects.toThrow('Creator not found');
  });
});
```

### Integration Testing Routes
```javascript
// Test HTTP endpoints
describe('POST /creators/apply', () => {
  test('should create creator profile', async () => {
    const response = await request(app)
      .post('/creators/apply')
      .set('Authorization', `Bearer ${token}`)
      .send(validCreatorData);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

## Performance Considerations

### 1. **Database Query Optimization**
- Services handle complex queries and joins
- Proper indexing based on service query patterns
- Pagination handled consistently across services

### 2. **Caching Strategy**
- Services can implement caching for frequently accessed data
- Cache invalidation handled at service level
- Multiple routes benefit from cached service methods

### 3. **Async Operations**
- Services handle async operations properly
- Background tasks (analytics, notifications) separated from request flow
- Proper error handling for failed async operations

## Future Enhancements

### 1. **Service Composition**
Services can call other services for complex operations:

```javascript
class CreatorService {
  async createCreatorWithSubscription(userId, creatorData, subscriptionData) {
    const creator = await this.createCreator(userId, creatorData);
    const subscription = await SubscriptionService.createSubscription({
      creatorId: creator.id,
      ...subscriptionData
    });
    return { creator, subscription };
  }
}
```

### 2. **Event-Driven Architecture**
Services can emit events for cross-cutting concerns:

```javascript
class CreatorService {
  async createCreator(userId, creatorData) {
    const creator = await Creator.create(creatorData);
    
    // Emit event for other services to handle
    EventEmitter.emit('creator:created', { creator, userId });
    
    return creator;
  }
}
```

### 3. **Service Interfaces**
Define interfaces for consistent service APIs:

```typescript
interface ICreatorService {
  getCreators(options: GetCreatorsOptions): Promise<CreatorResult>;
  createCreator(userId: string, data: CreateCreatorData): Promise<Creator>;
  // ... other methods
}
```

## Conclusion

The service layer implementation provides a solid foundation for scalable, maintainable backend architecture. By separating business logic from HTTP concerns, we achieve:

- **Better code organization** with clear separation of responsibilities
- **Improved testability** with isolated business logic
- **Enhanced reusability** of business operations
- **Easier maintenance** with centralized business rules
- **Consistent error handling** across the application

This architecture supports future growth and makes the codebase more professional and enterprise-ready.
