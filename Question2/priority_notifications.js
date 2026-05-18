const axios = require("axios");

const API_URL = "http://4.224.186.213/evaluation-service/notifications";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ2YWlzaG5hdmlwYXRpbDA1MjFAZ21haWwuY29tIiwiZXhwIjoxNzc5MTAyNTcxLCJpYXQiOjE3NzkxMDE2NzEsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiJmYWYzMDgwNi1kYmFjLTRiNjItYmY3MC1jOWQ0NmI5NTExMmEiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJ2YWlzaG5hdmkgbmFyZW5kcmEgcGF0aWwiLCJzdWIiOiJhMzUzMmMwMi05MmVhLTQ3YzAtYjUxYy1iZGI3MjQ1N2E2ZGUifSwiZW1haWwiOiJ2YWlzaG5hdmlwYXRpbDA1MjFAZ21haWwuY29tIiwibmFtZSI6InZhaXNobmF2aSBuYXJlbmRyYSBwYXRpbCIsInJvbGxObyI6InRlYWlcdTAwMjZkYTUyIiwiYWNjZXNzQ29kZSI6ImZ6RVFTUSIsImNsaWVudElEIjoiYTM1MzJjMDItOTJlYS00N2MwLWI1MWMtYmRiNzI0NTdhNmRlIiwiY2xpZW50U2VjcmV0IjoiRHNieGF2Z212YUtLZ3pjUyJ9.qjmG08HQ7TGgk7MgXrNEQftl2xgiyPbp2lTmK3SRYSg";
function calculatePriority(notification) {

    let score = 0;

    // Weight based on notification type
    if (notification.type === "Placement") {
        score += 50;
    } else if (notification.type === "Result") {
        score += 40;
    } else if (notification.type === "Event") {
        score += 30;
    } else {
        score += 10;
    }

    // Unread notifications get extra priority
    if (!notification.isRead) {
        score += 20;
    }

    // Recent notifications get higher priority
    const createdTime = new Date(notification.createdAt).getTime();
    const currentTime = new Date().getTime();

    const hoursDifference = (currentTime - createdTime) / (1000 * 60 * 60);

    if (hoursDifference <= 24) {
        score += 20;
    }

    return score;
}

async function fetchNotifications() {

    try {

        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${TOKEN}`
            }
        });

       const notifications = response.data.notifications;

        // Only unread notifications
        const unreadNotifications = notifications.filter(
            notification => notification.isRead === false
        );

        // Calculate priority score
        unreadNotifications.forEach(notification => {
            notification.priorityScore = calculatePriority(notification);
        });

        // Sort by priority
        unreadNotifications.sort(
            (a, b) => b.priorityScore - a.priorityScore
        );

        // Get top 10
        const topNotifications = unreadNotifications.slice(0, 10);
        if (topNotifications.length === 0) {
    console.log("No unread notifications found");
    return;
}

        console.log("\nTop 10 Priority Notifications:\n");

        topNotifications.forEach((notification, index) => {

            console.log(`${index + 1}. ${notification.title}`);

            console.log(`Type: ${notification.type}`);

            console.log(`Priority Score: ${notification.priorityScore}`);

            console.log(`Message: ${notification.message}`);

            console.log("-----------------------------------");
        });

    } catch (error) {

        console.log("Error fetching notifications");

        console.log(error.message);
    }
}

fetchNotifications();