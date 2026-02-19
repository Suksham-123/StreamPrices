// We use 'async' to tell JavaScript this function takes time
async function fetchProductPrice() {
  console.log("1. Going to the website...");
  
  // 'await' tells the code to STOP and wait for this to finish
  // (We use a timer here to simulate waiting for a webpage to load)
  await new Promise(resolve => setTimeout(resolve, 2000)); 
  
  console.log("2. Website loaded! Extracting price...");
  return 45000;
}

async function runApp() {
  const price = await fetchProductPrice();
  console.log(`3. The price is ₹${price}`);
}

runApp();