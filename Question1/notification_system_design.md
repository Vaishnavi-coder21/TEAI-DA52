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
# Stage 4

## Problem Statement

Currently, notifications are fetched every time a student loads the page. As the number of users increases, the database receives a very large number of repeated requests which overloads the DB server and affects performance.

This creates:

- Slow response times
- Increased database load
- Poor user experience
- High server resource consumption

---

## Solution 1: Caching

A caching layer such as Redis can be used to temporarily store frequently accessed notifications.

### Working

1. User requests notifications
2. Server first checks Redis cache
3. If data exists in cache, return immediately
4. Otherwise fetch from DB and store in cache

### Benefits

- Reduces database queries
- Faster response time
- Better scalability
- Improved user experience

### Tradeoffs

- Additional infrastructure required
- Cache invalidation complexity
- Slight memory overhead

---

## Solution 2: Pagination

Instead of loading all notifications at once, notifications should be fetched in smaller batches.

Example:

```http
GET /notifications?page=1&limit=20
```

### Benefits

- Reduced payload size
- Faster API response
- Lower DB load

### Tradeoffs

- Additional frontend handling
- Multiple API calls may be needed

---

## Solution 3: Lazy Loading / Infinite Scrolling

Load notifications only when user scrolls down.

### Benefits

- Better frontend performance
- Reduced initial load time

### Tradeoffs

- Slightly more frontend complexity

---

## Solution 4: Read Replicas

Use database read replicas to distribute read traffic.

### Benefits

- Reduced load on primary DB
- Better scalability

### Tradeoffs

- Replication delay possible
- Increased infrastructure cost

---

## Solution 5: WebSockets for Real-Time Notifications

Instead of repeatedly fetching notifications, use WebSockets to push notifications instantly.

### Benefits

- Real-time updates
- Reduced API polling
- Better user experience

### Tradeoffs

- Persistent connection management required
- Slightly more complex backend implementation

---

## Final Recommendation

The best approach would be a combination of:

- Redis caching
- Pagination
- WebSockets
- Database indexing

This combination improves scalability, reduces DB load, and provides better performance for large-scale notification systems.

---

# Stage 5

## Problems in Existing Implementation

The given implementation has several issues:

1. Sequential processing is slow
2. Failure handling is poor
3. One failure may interrupt complete process
4. No retry mechanism
5. Database and email operations are tightly coupled
6. Difficult to scale for 50,000 students

---

## Why the Current Approach is Problematic

Current flow:

```python
for student_id in student_ids:
    send_email(student_id, message)
    save_to_db(student_id, message)
    push_to_app(student_id, message)
```

If `send_email()` fails for some users:

- Notifications may not be saved properly
- Inconsistent state may occur
- Retry handling becomes difficult

---

## Should Saving to DB and Sending Email Happen Together?

No.

These operations should be separated because:

- Email service may fail temporarily
- DB save should not depend on email success
- Independent services improve reliability

---

## Better Architecture

Use:

- Queue system
- Background workers
- Retry mechanism
- Asynchronous processing

Examples:
- RabbitMQ
- Kafka
- Redis Queue

---

## Improved Workflow

1. Save notification in DB first
2. Push job into message queue
3. Worker services process:
   - email sending
   - push notifications
4. Failed jobs are retried automatically

---

## Revised Pseudocode

```python
def notify_all(student_ids, message):

    for student_id in student_ids:

        save_to_db(student_id, message)

        queue_email_job(student_id, message)

        queue_push_notification(student_id, message)
```

---

## Worker Service Example

```python
def email_worker():

    while True:

        job = get_next_email_job()

        try:
            send_email(job.student_id, job.message)

        except Exception:
            retry_job(job)
```

---

## Benefits of New Design

1. Faster processing
2. Better scalability
3. Reliable retry mechanism
4. Independent services
5. Improved fault tolerance
6. Better performance for large-scale systems

---

## Final Conclusion

To support notifications for 50,000 students reliably:

- Use asynchronous processing
- Store notifications before external operations
- Use queues and worker services
- Implement retry mechanisms
- Decouple email and push notification services

This architecture improves scalability, reliability, and overall system performance.