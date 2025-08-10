# Support System API Documentation

## Overview
The Support System API provides endpoints for managing support tickets, help articles, and administrative functions. All endpoints require authentication unless otherwise specified.

## Base URL
```
Production: https://api.yourplatform.com
Development: http://localhost:5000
```

## Authentication
All API requests require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## User Support Endpoints

### Create Support Ticket
Creates a new support ticket for the authenticated user.

**Endpoint:** `POST /api/support/tickets`

**Request Body:**
```json
{
  "category": "technical|account|payment|content|trust_safety|feature_request|bug_report|other",
  "subject": "string (max 100 chars)",
  "description": "string (max 5000 chars)",
  "priority": "low|medium|high|urgent"
}
```

**Response:**
```json
{
  "success": true,
  "ticket": {
    "id": 123,
    "ticket_number": "TKT-20240115-0001",
    "user_id": 456,
    "category": "technical",
    "subject": "Cannot upload images",
    "description": "When I try to upload images...",
    "status": "open",
    "priority": "medium",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

**Status Codes:**
- `201` - Ticket created successfully
- `400` - Invalid input data
- `401` - Unauthorized
- `500` - Server error

---

### Get Ticket Details
Retrieves details of a specific ticket including all responses.

**Endpoint:** `GET /api/support/tickets/:ticketNumber`

**Parameters:**
- `ticketNumber` - The ticket number (e.g., TKT-20240115-0001)

**Response:**
```json
{
  "success": true,
  "ticket": {
    "id": 123,
    "ticket_number": "TKT-20240115-0001",
    "subject": "Cannot upload images",
    "description": "Detailed description...",
    "status": "open",
    "priority": "medium",
    "category": "technical",
    "created_at": "2024-01-15T10:00:00Z",
    "user": {
      "id": 456,
      "display_name": "John Doe"
    },
    "assigned_agent": {
      "id": 789,
      "display_name": "Support Agent"
    },
    "responses": [
      {
        "id": 1,
        "message": "Thank you for contacting support...",
        "created_at": "2024-01-15T10:30:00Z",
        "user": {
          "id": 789,
          "display_name": "Support Agent",
          "supportRole": "support_agent"
        },
        "is_internal_note": false
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden (not ticket owner)
- `404` - Ticket not found

---

### Add Response to Ticket
Adds a new response to an existing ticket.

**Endpoint:** `POST /api/support/tickets/:ticketNumber/responses`

**Request Body:**
```json
{
  "message": "string (max 5000 chars)"
}
```

**Response:**
```json
{
  "success": true,
  "response": {
    "id": 2,
    "ticket_id": 123,
    "user_id": 456,
    "message": "I am using Chrome version 120...",
    "is_internal_note": false,
    "created_at": "2024-01-15T11:00:00Z"
  }
}
```

**Status Codes:**
- `201` - Response created
- `400` - Invalid input
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Ticket not found

---

### Get User's Tickets
Retrieves all tickets for a specific user with pagination.

**Endpoint:** `GET /api/support/tickets/user/:userId`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 50)
- `status` - Filter by status (open|in_progress|waiting_customer|resolved|closed)
- `search` - Search in subject and description

**Response:**
```json
{
  "success": true,
  "tickets": [
    {
      "id": 123,
      "ticket_number": "TKT-20240115-0001",
      "subject": "Cannot upload images",
      "status": "open",
      "priority": "medium",
      "category": "technical",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T11:00:00Z",
      "response_count": 3,
      "satisfaction_rating": null
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "totalPages": 3,
    "limit": 10
  }
}
```

---

### Rate Ticket Satisfaction
Rates the support experience for a resolved ticket.

**Endpoint:** `POST /api/support/tickets/:ticketNumber/satisfaction`

**Request Body:**
```json
{
  "rating": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for your feedback"
}
```

**Status Codes:**
- `200` - Rating saved
- `400` - Invalid rating or ticket not resolved
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Ticket not found

## Admin Support Endpoints

### Get Support Statistics
Retrieves dashboard statistics for support operations.

**Endpoint:** `GET /api/admin/support/stats`

**Required Role:** `support_agent` or `support_admin`

**Response:**
```json
{
  "success": true,
  "stats": {
    "openTickets": 45,
    "avgResponseTime": 3600,
    "avgResolutionTime": 86400,
    "todayTickets": 12,
    "categoryDistribution": {
      "technical": 15,
      "account": 10,
      "payment": 8,
      "content": 5,
      "trust_safety": 3,
      "feature_request": 2,
      "bug_report": 1,
      "other": 1
    },
    "agentPerformance": [
      {
        "agent_id": 789,
        "display_name": "Support Agent",
        "total_tickets": 25,
        "avg_response_time": 1800,
        "avg_resolution_time": 43200,
        "avg_satisfaction": 4.5
      }
    ]
  }
}
```

**Note:** `agentPerformance` is only included for `support_admin` role.

---

### List All Tickets (Admin)
Retrieves tickets with advanced filtering options.

**Endpoint:** `GET /api/admin/support/tickets`

**Required Role:** `support_agent` or `support_admin`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `status` - Filter by status
- `priority` - Filter by priority
- `category` - Filter by category
- `assignee` - Filter by assigned agent ID
- `search` - Full-text search
- `startDate` - Filter by creation date (ISO 8601)
- `endDate` - Filter by creation date (ISO 8601)
- `sort` - Sort field (created_at|updated_at|priority)
- `order` - Sort order (asc|desc)

**Response:**
```json
{
  "success": true,
  "tickets": [
    {
      "id": 123,
      "ticket_number": "TKT-20240115-0001",
      "subject": "Cannot upload images",
      "status": "open",
      "priority": "medium",
      "category": "technical",
      "created_at": "2024-01-15T10:00:00Z",
      "user": {
        "id": 456,
        "display_name": "John Doe",
        "email": "john@example.com"
      },
      "assigned_agent": {
        "id": 789,
        "display_name": "Support Agent"
      },
      "response_count": 3,
      "last_response_at": "2024-01-15T11:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "totalPages": 8,
    "limit": 20
  }
}
```

---

### Assign Ticket
Manually assigns a ticket to a support agent.

**Endpoint:** `PUT /api/admin/support/tickets/:id/assign`

**Required Role:** `support_agent` or `support_admin`

**Request Body:**
```json
{
  "agent_id": 789,
  "reason": "Agent specializes in technical issues"
}
```

**Response:**
```json
{
  "success": true,
  "assignment": {
    "id": 1,
    "ticket_id": 123,
    "assigned_to": 789,
    "assigned_by": 999,
    "assignment_type": "manual",
    "reason": "Agent specializes in technical issues",
    "created_at": "2024-01-15T12:00:00Z"
  }
}
```

---

### Update Ticket Status
Updates the status of a ticket.

**Endpoint:** `PUT /api/admin/support/tickets/:id/status`

**Required Role:** `support_agent` or `support_admin`

**Request Body:**
```json
{
  "status": "in_progress|waiting_customer|resolved|closed",
  "internal_note": "Optional note about status change"
}
```

**Response:**
```json
{
  "success": true,
  "ticket": {
    "id": 123,
    "status": "in_progress",
    "updated_at": "2024-01-15T12:00:00Z"
  }
}
```

---

### Update Ticket Priority
Updates the priority of a ticket.

**Endpoint:** `PUT /api/admin/support/tickets/:id/priority`

**Required Role:** `support_admin` only

**Request Body:**
```json
{
  "priority": "low|medium|high|urgent"
}
```

---

### Add Internal Note
Adds an internal note to a ticket (not visible to customers).

**Endpoint:** `POST /api/admin/support/tickets/:id/internal-note`

**Required Role:** `support_agent` or `support_admin`

**Request Body:**
```json
{
  "note": "Internal observation about the issue"
}
```

---

### Bulk Update Tickets
Performs bulk operations on multiple tickets.

**Endpoint:** `POST /api/admin/support/tickets/bulk-update`

**Required Role:** `support_admin` only

**Request Body:**
```json
{
  "ticket_ids": [123, 124, 125],
  "action": "assign|status|priority",
  "data": {
    // For assign action:
    "agent_id": 789,
    "reason": "Bulk assignment reason",
    
    // For status action:
    "status": "closed",
    "reason": "Bulk closure reason",
    
    // For priority action:
    "priority": "high"
  }
}
```

**Response:**
```json
{
  "success": true,
  "updated": 3,
  "failed": 0,
  "errors": []
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input data
- `RATE_LIMITED` - Too many requests
- `SERVER_ERROR` - Internal server error

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- User endpoints: 100 requests per minute
- Admin endpoints: 200 requests per minute
- Ticket creation: 10 tickets per hour per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705318800
```

## Webhooks (Future Enhancement)

Webhooks can be configured to receive real-time notifications:
- `ticket.created` - New ticket created
- `ticket.responded` - New response added
- `ticket.resolved` - Ticket resolved
- `ticket.rated` - Satisfaction rating added

## Best Practices

1. **Pagination**: Always use pagination for list endpoints
2. **Caching**: Cache statistics for up to 5 minutes
3. **Error Handling**: Implement exponential backoff for retries
4. **Security**: Never expose internal ticket IDs in URLs
5. **Performance**: Use field selection to reduce payload size

## SDK Examples

### JavaScript/TypeScript
```typescript
import { SupportAPI } from '@yourplatform/support-sdk';

const api = new SupportAPI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.yourplatform.com'
});

// Create a ticket
const ticket = await api.tickets.create({
  category: 'technical',
  subject: 'Cannot upload images',
  description: 'Detailed description...',
  priority: 'medium'
});

// Get ticket details
const details = await api.tickets.get(ticket.ticket_number);

// Add response
await api.tickets.respond(ticket.ticket_number, {
  message: 'Thank you for your response'
});
```

### cURL Examples
```bash
# Create ticket
curl -X POST https://api.yourplatform.com/api/support/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "technical",
    "subject": "Cannot upload images",
    "description": "When I try to upload...",
    "priority": "medium"
  }'

# Get ticket
curl https://api.yourplatform.com/api/support/tickets/TKT-20240115-0001 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Changelog

### Version 1.0 (Current)
- Initial release with core ticket management
- User and admin endpoints
- Basic statistics and reporting

### Version 1.1 (Planned)
- File attachment support
- Real-time notifications via WebSocket
- Advanced analytics endpoints
- Canned response templates