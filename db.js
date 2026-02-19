const mongoose = require('mongoose');

// 1. Connect to your local MongoDB
// 'priceAggregatorDB' is the name of the database we are creating right now
mongoose.connect('mongodb://127.0.0.1:27017/priceAggregatorDB')
  .then(() => console.log('✅ Successfully connected to MongoDB!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 2. Define the Blueprint (Schema) for our products
const productSchema = new mongoose.Schema({
    title: String,
    price: String, // Keeping as string for now because of the '£' or '₹' symbols
    store: String,
    dateScraped: { type: Date, default: Date.now } // Automatically records when we saved it
});

// 3. Create the Model
const Product = mongoose.model('Product', productSchema);

// 4. A quick test function to see if we can save data!
async function saveTestProduct() {
    try {
        const testItem = new Product({
            title: "Test PlayStation 5",
            price: "₹49,990",
            store: "TestStore"
        });
        
        await testItem.save();
        console.log("💾 Test product saved to the database successfully!");
    } catch (error) {
        console.log("Error saving:", error);
    }
}

// Run the test function
saveTestProduct();