# StreamPrices ⚡

https://stream-prices.vercel.app/

A real-time, parallel-processing MERN stack e-commerce price aggregator built for localized deal finding.

## 🚀 The Problem & Solution
E-commerce price fragmentation makes finding the true lowest deal time-consuming. **StreamPrices** solves this by executing parallel web scraping across major platforms (Amazon, Flipkart) to instantly aggregate and compare localized prices based on the user's delivery Pincode.

## 🧠 System Architecture
This project utilizes a decoupled, three-tier architecture ensuring high scalability:
- **Frontend (React.js / Vite):** Manages complex state (Loading, Pincode caching) and executes client-side dynamic sorting algorithms to highlight the "Best Deal".
- **Backend (Node.js / Express.js):** Acts as the orchestrator. Utilizes **Puppeteer** to launch multiple headless browser instances simultaneously to extract raw price nodes.
- **Database (MongoDB Atlas):** Implements a "Cache-Aside" pattern. Each scraped item is tagged with a delivery pincode, dropping API response times from ~15 seconds to <50 milliseconds for repeated queries.
- **Security:** Fully secured user authentication utilizing **Bcrypt** password hashing and **JWT** (JSON Web Tokens).

## 🛠️ Tech Stack
- **Client:** React, React Router
- **Server:** Node.js, Express
- **Database:** MongoDB Atlas, Mongoose
- **Automation & Scraping:** Puppeteer
- **Authentication:** JWT, Bcrypt

## ⚙️ Key Features
1. **Live Parallel Scraping:** Uses `Promise.all` to fetch current data without waiting for standard APIs.
2. **Location-Aware Caching:** Filters product availability strictly based on user delivery pincodes.
3. **Smart Data Cleaning:** Custom Regex algorithms automatically filter out junk accessories (cables, cases) so only actual consoles/phones appear.
4. **Secure Vault:** Dedicated user authentication gatekeeper blocking unauthorized searches.

## 🌐 Live Demo
- **Frontend App:** [Insert your Vercel link here]
- **Backend API:** [Insert your Render link here]

## 💻 Local Setup & Testing
To run this project locally on your machine and bypass cloud bot-detection:

1. **Clone the repository:**
   `git clone [your-repo-link]`
2. **Setup Backend:**
   `cd StreamPrices`
   `npm install`
3. **Configure Environment:**
   Create a `.env` file in the root directory:
   `MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/priceAggregatorDB`
4. **Start the Servers:**
   - Terminal 1 (Backend): `node server.js`
   - Terminal 2 (Frontend): `cd frontend && npm install && npm run dev`
