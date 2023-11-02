# TrempBoss: A Rideshare Management App in Israel

## About the Project
TrempBoss is an advanced application designed for coordinating hitchhiking (locally known as "tremp") in Israel. It aims to simplify the process of matching rides between drivers and passengers. The app provides an easy and efficient interface for organizing rides, communicating between users, and managing private ride-sharing groups.

## Technologies and Structure
The application is developed using the MERN Stack (MongoDB, Express.js, React, Node.js), incorporating technologies such as:
- Google Maps API (including Geocoding, Directions, Maps JavaScript, Maps SDK for Android, Places)
- Node.js with TypeScript and Express
- React Native for the mobile client
- User interface components like Lottie, Formik, Yup, Paper, and GiftedChat

## System Description
- **Rides Management**: Ability to open ride requests, offer rides by drivers, and confirm and execute the ride.
- **Secure Group Management**: Secure management of private groups, restricting visibility of rides to group members only.
- **Internal Chat**: An in-app communication system between passengers and drivers.

## Innovations and Challenges
- **Data Architecture**: Developed a complex data structure to differentiate between rides offered by drivers and those requested by passengers.
- **Singleton Design Pattern**: Implemented for efficient and secure access to the database.
- **Messaging and Notifications Management**: Advanced system including NodeMailer for email management and FCM for app notifications.

## System Security and Notifications Management
The system ensures security and privacy through JWT for user authentication and features an advanced notification management system.

## Data Management and KPIs
- **Dashboard for Data Management**: Developed a dashboard featuring dynamic and extensive KPIs, utilizing Material-UI, Recharts, and Nivo for data presentation.

## Getting Started

To get the app up and running:

1. Install dependencies:
pnpm i

2. Start the development server:
pnpm run dev
