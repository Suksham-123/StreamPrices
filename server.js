const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // THE NEW SECURITY GUARD
const jwt = require('jsonwebtoken'); // THE VIP WRISTBAND MAKER
const { scrapeRealData } = require('./scraper'); 

const app = express();
const PORT = process.env.PORT || 3000;

// THE SECRET KEY (In a real startup, this is hidden in a .env file!)
const JWT_SECRET = "StreamPrices_Super_Secret_Key_2026";

app.use(cors());
app.use(express.json()); // CRITICAL: Allows our server to read JSON from React!

mongoose.connect('mongodb+srv://admin:password1234@cluster0.hysusat.mongodb.net/priceAggregatorDB?appName=Cluster0')
    .then(() => console.log('✅ Server connected to MongoDB!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- 1. EXISTING PRODUCT SCHEMA ---
const productSchema = new mongoose.Schema({
    title: String,
    price: String,
    store: String,
    link: String,
    searchTerm: String, 
    pincode: String, 
    dateScraped: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', productSchema);


// --- 2. NEW SECURE USER SCHEMA ---
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // This array will hold the deals the user clicks "Track" on!
    trackedDeals: [{
        title: String,
        price: String,
        store: String,
        link: String
    }]
});
const User = mongoose.model('User', userSchema);


// --- 3. AUTHENTICATION ROUTES (SIGNUP & LOGIN) ---

// Route 1: Create a new account
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`\n🛡️ New Signup Attempt: ${email}`);

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists!" });
        }

        // SCRAMBLE THE PASSWORD! (Hash it 10 times)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save the user with the scrambled password
        const newUser = new User({
            email,
            password: hashedPassword
        });
        await newUser.save();

        console.log(`✅ User created successfully: ${email}`);
        
        // Give them a VIP Token so they are instantly logged in
        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
        
        res.status(201).json({ message: "Account created!", token });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Server error during signup" });
    }
});

// Route 2: Log into an existing account
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`\n🔐 Login Attempt: ${email}`);

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Compare the typed password with the scrambled database password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Passwords match! Give them a VIP Token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
        console.log(`✅ User logged in: ${email}`);

        res.json({ message: "Login successful!", token });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error during login" });
    }
});


// --- 4. EXISTING SEARCH ROUTE ---
app.get('/api/search', async (req, res) => {
    const searchQuery = req.query.q; 
    const userPincode = req.query.pincode || "Default"; 
    
    try {
        if (!searchQuery) {
            const allProducts = await Product.find();
            return res.json({ message: "Success", results: allProducts });
        }

        const lowerCaseQuery = searchQuery.toLowerCase();

        let products = await Product.find({ searchTerm: lowerCaseQuery, pincode: userPincode });

        if (products.length === 0) {
            const liveScrapedData = await scrapeRealData(searchQuery, userPincode);
            if (liveScrapedData && liveScrapedData.length > 0) {
                for (let item of liveScrapedData) {
                    const newItem = new Product({
                        title: item.title, price: item.price, store: item.store, link: item.link, searchTerm: lowerCaseQuery, pincode: userPincode
                    });
                    await newItem.save();
                }
                products = await Product.find({ searchTerm: lowerCaseQuery, pincode: userPincode });
            }
        } 
        res.json({ message: "Success", results: products });
    } catch (error) {
        res.status(500).json({ error: "Failed to process search" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});