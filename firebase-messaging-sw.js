// Background Service Worker for Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDJS72PX_7EoPdaEDtbOXBEUklmioXqkq8",
  authDomain: "matel-paan-544aa.firebaseapp.com",
  projectId: "matel-paan-544aa",
  storageBucket: "matel-paan-544aa.firebasestorage.app",
  messagingSenderId: "105854383937",
  appId: "1:105854383937:web:c6bd30b56b7d1a78b113c0"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message received: ', payload);
  const notificationTitle = payload.notification.title || 'Digital Khata Update';
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // Default icon
    badge: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
