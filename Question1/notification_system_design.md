# Stage 1

# Notification System REST API Design

## Core Actions

1. Create Notification
2. Get Notifications
3. Mark Notification as Read
4. Delete Notification
5. Real-time Notification Delivery

---

## 1. Get Notifications

### Endpoint
GET /notifications

### Headers
Authorization: Bearer <token>

### Response

```json
[
  {
    "id": 1,
    "title": "New Message",
    "message": "You received a new message",
    "read": false,
    "createdAt": "2026-05-18T10:00:00Z"
  }
]
```

---

## 2. Create Notification

### Endpoint
POST /notifications

### Headers
Authorization: Bearer <token>

Content-Type: application/json

### Request

```json
{
  "title": "Order Update",
  "message": "Your order has been shipped"
}
```

### Response

```json
{
  "success": true,
  "message": "Notification created successfully"
}
```

---

## 3. Mark Notification as Read

### Endpoint
PUT /notifications/:id/read

### Headers
Authorization: Bearer <token>

### Response

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## 4. Delete Notification

### Endpoint
DELETE /notifications/:id

### Headers
Authorization: Bearer <token>

### Response

```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## Real-time Notification Mechanism

The notification system uses WebSockets for real-time communication.

### Working

1. User logs into application
2. Client establishes WebSocket connection
3. Server pushes notifications instantly
4. User receives notifications without refreshing page

### Benefits

- Instant notification delivery
- Reduced API polling
- Better user experience
- Real-time updates