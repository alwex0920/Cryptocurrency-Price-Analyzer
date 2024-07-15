document.addEventListener('DOMContentLoaded', function() {
    const currencyInput = document.getElementById('currency');
    const cryptoIdInput = document.getElementById('crypto-id');
    const analyzeBtn = document.getElementById('analyze-btn');
    const currentPriceElement = document.getElementById('current-price');
    const averagePriceElement = document.getElementById('average-price');
    const signalElement = document.getElementById('signal');

    analyzeBtn.addEventListener('click', function() {
        const currency = currencyInput.value;
        const cryptoId = cryptoIdInput.value;

        fetchPrices(cryptoId, 10)
            .then(prices => {
                const currentPrice = fetchCurrentPrice(cryptoId, currency);
                const averagePrice = calculateAverage(prices);
                const signal = signalToBuy(currentPrice, averagePrice);

                currentPriceElement.textContent = `Current price: ${currentPrice}`;
                averagePriceElement.textContent = `Average price for the last 10 days: ${averagePrice}`;
                signalElement.textContent = `Signal: ${signal}`;
            })
            .catch(error => {
                console.error(error);
                alert('An error occurred. Please check the cryptocurrency ID and try again.');
            });
    });

    /**
     * Fetches the historical prices for the given cryptocurrency ID and number of days.
     * @param {string} cryptoId - The cryptocurrency ID.
     * @param {number} days - The number of days to fetch the prices for.
     * @returns {Promise<number[]>} - An array of historical prices.
     */
    function fetchPrices(cryptoId, days) {
        const url = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart`;
        const params = {
            vs_currency: currencyInput.value,
            days: days
        };

        return fetch(url, { params })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => data.prices.map(price => price[1]));
    }

    /**
     * Fetches the current price for the given cryptocurrency ID and currency.
     * @param {string} cryptoId - The cryptocurrency ID.
     * @param {string} currency - The currency to fetch the price in.
     * @returns {Promise<number>} - The current price.
     */
    function fetchCurrentPrice(cryptoId, currency) {
        const url = `https://api.coingecko.com/api/v3/simple/price`;
        const params = {
            ids: cryptoId,
            vs_currencies: currency
        };

        return fetch(url, { params })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => data[cryptoId][currency]);
    }

    /**
     * Calculates the average of the given prices.
     * @param {number[]} prices - An array of prices.
     * @returns {number} - The average price.
     */
    function calculateAverage(prices) {
        return prices.reduce((sum, price) => sum + price, 0) / prices.length;
    }

    /**
     * Determines the signal based on the current price and average price.
     * @param {number} currentPrice - The current price.
     * @param {number} averagePrice - The average price.
     * @returns {string} - The signal ('Buy', 'Sell', or 'Do not buy').
     */
    function signalToBuy(currentPrice, averagePrice) {
        const currentPriceRounded = Math.round(currentPrice * 100) / 100;
        const averagePriceRounded = Math.round(averagePrice * 100) / 100;

        console.log(`Debugging: Current price (rounded): ${currentPriceRounded}`);
        console.log(`Debugging: Average price (rounded): ${averagePriceRounded}`);

        if (currentPriceRounded < averagePriceRounded) {
            return 'Buy';
        } else if (currentPriceRounded > averagePriceRounded * 1.05) {
            return 'Sell';
        } else {
            return 'Do not buy';
        }
    }
});
