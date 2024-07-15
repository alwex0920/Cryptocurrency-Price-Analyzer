function fetchPrices(cryptoId, days) {
  const url = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart`;
  const params = {
    vs_currency: document.getElementById('currency').value,
    days: days,
    interval: 'daily',
  };

  return fetch(url, { params })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => data.prices.map((price) => price[1]))
    .catch((error) => {
      console.error('Error:', error);
      return null;
    });
}

function fetchCurrentPrice(cryptoId) {
  const url = 'https://api.coingecko.com/api/v3/simple/price';
  const params = {
    ids: cryptoId,
    vs_currencies: document.getElementById('currency').value,
  };

  return fetch(url, { params })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => data[cryptoId][document.getElementById('currency').value])
    .catch((error) => {
      console.error('Error:', error);
      return null;
    });
}

function calculateAverage(prices) {
  return prices.reduce((sum, price) => sum + price, 0) / prices.length;
}

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

function prepareData(prices) {
  const data = prices.map((price) => ({ price }));
  for (let i = 0; i < data.length - 1; i++) {
    data[i].priceNext = data[i + 1].price;
  }
  data.pop(); // Remove the last row with a missing priceNext
  return data;
}

function trainModel(data) {
  const X = data.map((row) => [row.price]);
  const y = data.map((row) => row.priceNext);
  const model = new LinearRegression();
  model.fit(X, y);
  return model;
}

function predict(model, currentPrice) {
  return model.predict([[currentPrice]])[0];
}

function main() {
  const cryptoId = document.getElementById('crypto-id').value;
  const days = 30;

  // Fetch historical prices
  fetchPrices(cryptoId, days)
    .then((prices) => {
      if (!prices) {
        showOutput('Historical prices could not be obtained. Check the cryptocurrency ID and try again.');
        return;
      }

      // Fetch current price
      return fetchCurrentPrice(cryptoId)
        .then((currentPrice) => {
          if (!currentPrice) {
            showOutput('The current price could not be obtained. Check the cryptocurrency ID and try again.');
            return;
          }

          // Calculate average price for the last 10 days
          const averagePrice = calculateAverage(prices.slice(-10));

          // Get the signal
          const signal = signalToBuy(currentPrice, averagePrice);

          showOutput(`Current price: ${currentPrice.toFixed(2)}\nAverage price for the last 10 days: ${averagePrice.toFixed(2)}\nSignal: ${signal}`);

          // Train the model and make a prediction
          const data = prepareData(prices);
          const model = trainModel(data);
          const prediction = predict(model, currentPrice);

          if (prediction > currentPrice) {
            showOutput('Forecast: the price will rise.');
          } else {
            showOutput('Forecast: the price will fall.');
          }
          showOutput(`Current price: ${currentPrice.toFixed(2)}, Projected price: ${prediction.toFixed(2)}`);
        });
    })
    .catch((error) => {
      console.error('Error:', error);
      showOutput('An error occurred. Please try again.');
    });
}

function showOutput(message) {
  const outputDiv = document.getElementById('output');
  outputDiv.textContent = message;
}

class LinearRegression {
  fit(X, y) {
    const n = X.length;
    const sumX = X.reduce((sum, x) => sum + x[0], 0);
    const sumY = y.reduce((sum, y) => sum + y, 0);
    const sumXY = X.reduce((sum, x, i) => sum + x[0] * y[i], 0);
    const sumXX = X.reduce((sum, x) => sum + x[0] * x[0], 0);

    this.slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    this.intercept = (sumY - this.slope * sumX) / n;
  }

  predict(X) {
    return X.map((x) => this.slope * x[0] + this.intercept);
  }
}
