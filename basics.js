// This is an Array [] containing Objects {}
const scrapedProducts = [
  {
    name: "PlayStation 5",
    store: "Amazon",
    price: 49900,
    link: "https://amazon.in/..."
  },
  {
    name: "PlayStation 5",
    store: "Flipkart",
    price: 48500,
    link: "https://flipkart.com/..."
  }
];

// Let's find the lowest price!
let lowestPrice = scrapedProducts[0].price;
let bestStore = scrapedProducts[0].store;

for (let i = 0; i < scrapedProducts.length; i++) {
  if (scrapedProducts[i].price < lowestPrice) {
    lowestPrice = scrapedProducts[i].price;
    bestStore = scrapedProducts[i].store;
  }
}

console.log(`The best deal is ₹${lowestPrice} at ${bestStore}!`);