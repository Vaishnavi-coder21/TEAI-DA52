const axios = require("axios");

const API_URL = "http://4.224.186.213/evaluation-service/notifications";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ2YWlzaG5hdmlwYXRpbDA1MjFAZ21haWwuY29tIiwiZXhwIjoxNzc5MTA0MjUzLCJpYXQiOjE3NzkxMDMzNTMsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI5MmVhOTE3Ny01OGY2LTQxYWMtOWE4ZS1kMTFhYzdmOTRkNWUiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJ2YWlzaG5hdmkgbmFyZW5kcmEgcGF0aWwiLCJzdWIiOiJhMzUzMmMwMi05MmVhLTQ3YzAtYjUxYy1iZGI3MjQ1N2E2ZGUifSwiZW1haWwiOiJ2YWlzaG5hdmlwYXRpbDA1MjFAZ21haWwuY29tIiwibmFtZSI6InZhaXNobmF2aSBuYXJlbmRyYSBwYXRpbCIsInJvbGxObyI6InRlYWlcdTAwMjZkYTUyIiwiYWNjZXNzQ29kZSI6ImZ6RVFTUSIsImNsaWVudElEIjoiYTM1MzJjMDItOTJlYS00N2MwLWI1MWMtYmRiNzI0NTdhNmRlIiwiY2xpZW50U2VjcmV0IjoiRHNieGF2Z212YUtLZ3pjUyJ9.LGss4JGVR6E7PfWpbppgNbv9j-HO4Zuq6m3wCMHqkJ4";
function calculatePriority(notification) {

    let score = 0;

    if (notification.Type === "Placement") {
        score += 50;
    } else if (notification.Type === "Result") {
        score += 40;
    } else if (notification.Type === "Event") {
        score += 30;
    } else {
        score += 10;
    }

    const notificationTime = new Date(notification.Timestamp).getTime();

    const currentTime = new Date().getTime();

    const hourDifference =
        (currentTime - notificationTime) / (1000 * 60 * 60);

    if (hourDifference <= 24) {
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

        const notifications = response.data.notifications || [];

        notifications.forEach(notification => {
            notification.priorityScore =
                calculatePriority(notification);
        });

        notifications.sort(
            (a, b) => b.priorityScore - a.priorityScore
        );

        const topNotifications = notifications.slice(0, 10);

        console.log("\nTop 10 Priority Notifications:\n");

        topNotifications.forEach((notification, index) => {

            console.log(`${index + 1}. ${notification.Type}`);

            console.log(`Message: ${notification.Message}`);

            console.log(`Priority Score: ${notification.priorityScore}`);

            console.log(`Timestamp: ${notification.Timestamp}`);

            console.log("--------------------------------");
        });

    } catch (error) {

        console.log("Error fetching notifications");

        console.log(error.message);
    }
}

fetchNotifications();