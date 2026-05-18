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

# Stage 2

## Database Selection

For the notification system, I would use MongoDB as the primary database because notifications are flexible in structure and can scale easily with large amounts of data.

MongoDB is suitable because:

- It stores JSON-like documents
- Easy to scale horizontally
- Fast for read and write operations
- Flexible schema for different notification types
- Good performance for real-time systems

---

## Notification Schema

### Collection: notifications

```json
{
  "_id": "ObjectId",
  "userId": "12345",
  "title": "New Message",
  "message": "You received a new message",
  "type": "message",
  "read": false,
  "createdAt": "2026-05-18T10:00:00Z"
}

# Stage 3

## Query Analysis

The existing query is:

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;
```

---

## Is the Query Accurate?

Yes, the query is logically correct because it fetches all unread notifications of a specific student and sorts them based on latest notifications first.

---

## Why is the Query Slow?

The database has grown to:

- 50,000 students
- 5,000,000 notifications

As data increases, the query becomes slower because:

1. Full table scanning may occur
2. Sorting large records is expensive
3. No optimized indexing for filtering and ordering
4. `SELECT *` fetches unnecessary columns

---

## Improvements to the Query

Instead of fetching all columns:

```sql
SELECT notificationID, notificationType, message, createdAt
FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;
```

This reduces unnecessary data transfer and improves performance.

---

## Recommended Index

A composite index should be created on:

```sql
(studentID, isRead, createdAt)
```

Example:

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(studentID, isRead, createdAt DESC);
```

---

## Why Composite Index is Better

This index helps because:

- `studentID` is used in filtering
- `isRead` is used in filtering
- `createdAt` is used for sorting

The database can directly locate matching rows and avoid full sorting operations.

---

## Estimated Computational Cost

Without indexing:
- Time Complexity ≈ O(n)

Database scans a large number of rows.

With proper indexing:
- Time Complexity ≈ O(log n)

Search becomes significantly faster.

---

## Should We Add Indexes on Every Column?

No.

Adding indexes on every column is not a good practice because:

1. Increased storage usage
2. Slower insert and update operations
3. Higher memory consumption
4. Unnecessary indexes reduce write performance

Indexes should only be added on frequently searched, filtered, or sorted columns.

---

## Query to Find Students with Notifications in Last 7 Days

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE createdAt >= NOW() - INTERVAL 7 DAY;
```

---

## Query to Count Notifications by Type

```sql
SELECT notificationType, COUNT(*) AS totalNotifications
FROM notifications
GROUP BY notificationType;
```

---

## Example Output

| notificationType | totalNotifications |
|------------------|-------------------|
| Event            | 1200              |
| Result           | 800               |
| Placement        | 450               |

---

## Final Conclusion

To improve notification system performance:

- Use composite indexing
- Avoid unnecessary columns in SELECT queries
- Use pagination for large datasets
- Avoid excessive indexes
- Optimize filtering and sorting operations

These optimizations improve scalability and reduce database load for large-scale systems.