// Global variables
let money = 'usd';
const days = 10;

/**
 * Fetches historical prices for a given cryptocurrency
 * @param {string} cryptoId - The ID of the cryptocurrency
 * @param {number} days - Number of days to fetch data for
 * @returns {Promise<number[]|null>} Array of prices or null if there's an error
 */
async function fetchPrices(cryptoId, days) {
    const url = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart`;
    const params = new URLSearchParams({
        vs_currency: money,
        days: days
    });

    try {
        const response = await fetch(`${url}?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.prices.map(price => price[1]);
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

/**
 * Fetches the current price for a given cryptocurrency
 * @param {string} cryptoId - The ID of the cryptocurrency
 * @returns {Promise<number|null>} Current price or null if there's an error
 */
async function fetchCurrentPrice(cryptoId) {
    const url = "https://api.coingecko.com/api/v3/simple/price";
    const params = new URLSearchParams({
        ids: cryptoId,
        vs_currencies: money
    });

    try {
        const response = await fetch(`${url}?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data[cryptoId][money];
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

/**
 * Calculates the average of an array of numbers
 * @param {number[]} prices - Array of prices
 * @returns {number} Average price
 */
function calculateAverage(prices) {
    return prices.reduce((sum, price) => sum + price, 0) / prices.length;
}

/**
 * Determines whether to buy, sell, or hold based on current and average prices
 * @param {number} currentPrice - Current price of the cryptocurrency
 * @param {number} averagePrice - Average price of the cryptocurrency
 * @returns {string} "Buy", "Sell", or "Do not buy"
 */
function signalToBuy(currentPrice, averagePrice) {
    const currentPriceRounded = Math.round(currentPrice * 100) / 100;
    const averagePriceRounded = Math.round(averagePrice * 100) / 100;

    console.log(`Debugging: Current price (rounded): ${currentPriceRounded}`);
    console.log(`Debugging: Average price (rounded): ${averagePriceRounded}`);

    if (currentPriceRounded < averagePriceRounded) {
        return "Buy";
    } else if (currentPriceRounded > averagePriceRounded * 1.05) {
        return "Sell";
    } else {
        return "Do not buy";
    }
}

/**
 * Main function to analyze cryptocurrency prices
 */
async function main() {
    const currencyInput = document.getElementById('currency');
    const cryptoIdInput = document.getElementById('cryptoId');
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error');

    money = currencyInput.value.toLowerCase() || 'usd';
    const cryptoId = cryptoIdInput.value.toLowerCase();

    if (!cryptoId) {
        showError("Please enter a cryptocurrency ID.");
        return;
    }

    // Fetch historical prices
    const prices = await fetchPrices(cryptoId, days);
    if (prices === null) {
        showError("Historical prices could not be obtained. Check the cryptocurrency ID and try again.");
        return;
    }

    // Fetch current price
    const currentPrice = await fetchCurrentPrice(cryptoId);
    if (currentPrice === null) {
        showError("The current price could not be obtained. Check the cryptocurrency ID and try again.");
        return;
    }

    // Calculate average price for the last 10 days
    const averagePrice = calculateAverage(prices);

    // Get signal
    const signal = signalToBuy(currentPrice, averagePrice);

    // Display results
    document.getElementById('currentPrice').textContent = `${currentPrice} ${money.toUpperCase()}`;
    document.getElementById('averagePrice').textContent = `${averagePrice.toFixed(2)} ${money.toUpperCase()}`;
    document.getElementById('signal').textContent = signal;

    resultsDiv.classList.remove('hidden');
    errorDiv.classList.add('hidden');
}

/**
 * Displays an error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
}

// Event listener for the analyze button
document.getElementById('analyzeBtn').addEventListener('click', main);
