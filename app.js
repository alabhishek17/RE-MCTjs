const API_KEY = 'JBFFDY7WZOBPCC5X'; // Replace with your API key
const searchBtn = document.getElementById('search-btn');
const stockSymbolInput = document.getElementById('stock-symbol');
const trendingStocksDropdown = document.getElementById('trending-stocks');
const comparisonTableBody = document.querySelector('#comparison-table tbody');
const stockDetails = document.createElement('div'); // Create a container for stock details
document.querySelector('.container').appendChild(stockDetails); // Append it to the container

let stockChart;

// Initialize Chart.js
function initializeChart(labels, data) {
  const ctx = document.getElementById('stockChart').getContext('2d');
  if (stockChart) stockChart.destroy(); // Destroy previous chart

  stockChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Stock Price',
          data: data,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Date' } },
        y: { title: { display: true, text: 'Price (USD)' } },
      },
    },
  });
}

// Fetch stock data from Alpha Vantage API
async function fetchStockData(symbol) {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data['Time Series (Daily)']) {
      return data['Time Series (Daily)'];
    } else {
      throw new Error(data['Error Message'] || 'Stock data not available.');
    }
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
    alert(`Failed to retrieve stock data: ${error.message}`);
    return null;
  }
}

// Display stock details
function displayStockDetails(stockData, symbol) {
  const latestDate = Object.keys(stockData)[0];
  const latestData = stockData[latestDate];
  const price = latestData['4. close'];
  const volume = latestData['5. volume'];
  const change = (
    latestData['4. close'] - stockData[Object.keys(stockData)[1]]['4. close']
  ).toFixed(2);

  stockDetails.innerHTML = `
    <h3>${symbol}</h3>
    <p>Price: $${price}</p>
    <p>Change: $${change}</p>
    <p>Volume: ${volume}</p>
  `;

  updateStockTable(symbol, price, change, volume);
}

// Update chart with stock data
function updateChart(stockData) {
  const labels = Object.keys(stockData).reverse(); // Dates in ascending order
  const data = labels.map((date) => parseFloat(stockData[date]['4. close']));
  initializeChart(labels, data);
}

// Update table with stock data
function updateStockTable(symbol, price, change, volume) {
  const row = `
    <tr>
      <td>${symbol}</td>
      <td>${price}</td>
      <td>${change}</td>
      <td>${volume}</td>
    </tr>
  `;
  comparisonTableBody.innerHTML += row;
}

// Search stock by symbol
searchBtn.addEventListener('click', async () => {
  const symbol = stockSymbolInput.value.toUpperCase().trim();
  if (!symbol) {
    alert('Please enter a valid stock symbol.');
    return;
  }

  const stockData = await fetchStockData(symbol);
  if (stockData) {
    displayStockDetails(stockData, symbol); // Display stock details
    updateChart(stockData); // Update the chart
  }
});

// Populate trending stocks dropdown
async function populateTrendingStocks() {
  const trendingSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'BABA'];
  trendingSymbols.forEach((symbol) => {
    const option = document.createElement('option');
    option.value = symbol;
    option.textContent = symbol;
    trendingStocksDropdown.appendChild(option);
  });

  trendingStocksDropdown.addEventListener('change', async (e) => {
    const symbol = e.target.value;
    const stockData = await fetchStockData(symbol);
    if (stockData) {
      displayStockDetails(stockData, symbol); // Display stock details
      updateChart(stockData); // Update the chart
    }
  });
}

// Initialize the dashboard
populateTrendingStocks();
