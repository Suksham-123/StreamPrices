const mongoose = require('mongoose');
const { scrapeRealData } = require('./scraper'); 

const productSchema = new mongoose.Schema({
    title: String,
    price: String,
    store: String,
    dateScraped: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

async function runAutomation() {
    try {
        console.log("🔌 Connecting to database...");
        await mongoose.connect('mongodb://127.0.0.1:27017/priceAggregatorDB');
        console.log("✅ Database Connected!");

        // Let's search for a high-end TV this time!
        const searchTerm = "Sony Bravia 55 inch TV"; 
        
        // This will now return an Array of up to 2 items
        const liveDataArray = await scrapeRealData(searchTerm);
        
        if (liveDataArray && liveDataArray.length > 0) {
            console.log(`\n💾 Found ${liveDataArray.length} deals. Saving to MongoDB...`);
            
            // Loop through the results and save each one
            for (let item of liveDataArray) {
                const newItem = new Product({
                    title: item.title,
                    price: item.price,
                    store: item.store
                });
                await newItem.save();
                console.log(`✅ Saved: [${item.store}] ${item.title} - ${item.price}`);
            }
        } else {
            console.log("⚠️ No data was found from either site.");
        }

        await mongoose.disconnect();
        console.log("\n🛑 Connection closed. Automation complete.");

    } catch (error) {
        console.error("❌ An error occurred:", error);
    }
}

runAutomation();