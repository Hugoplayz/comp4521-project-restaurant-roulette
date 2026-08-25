Here's how to run this project. It has two parts -- a backend server and an Expo (React Native) mobile app.

1. Start the Backend Server
cd "C:\Users\User\Downloads\4521 prokect\server"
npm install
npm run dev
This starts the Express server on http://localhost:3000. It proxies restaurant data from the Overpass API.

2. Configure the API URL
Edit RestaurantRoulette/.env and set EXPO_PUBLIC_API_URL to match your setup:

Running on	Value
Android emulator	http://10.0.2.2:3000
iOS simulator	http://localhost:3000
Physical device	http://<YOUR_LAN_IP>:3000 (find your LAN IP with ipconfig)


3. Start the Expo App
cd "C:\Users\User\Downloads\4521 prokect\RestaurantRoulette"
npm install
npx expo start
This will open the Expo dev tools. From there you can:

Press a to open on an Android emulator
Press i to open on an iOS simulator
Press w to open in a web browser
Scan the QR code with Expo Go on a physical device
Prerequisites
Node.js (v18+ recommended)
For mobile: Expo Go app on your phone, or an Android/iOS emulator set up
Both the server and the Expo app need to be running simultaneously
Important: Make sure you start the server first, then the Expo app, and that the .env API URL points to a reachable address from whatever device/emulator you're using.