const fs = require('fs');
const Chart = require('chart.js');

// Read the request counts from the file
const filePath = 'requests.log';
let requestCounts = {};
if (fs.existsSync(filePath)) {
  const fileData = fs.readFileSync(filePath, 'utf8');
  if (fileData) {
    requestCounts = JSON.parse(fileData);
  }
}

// Extract the hour and request count data from the request counts
const hourData = [];
const requestData = [];
for (const date in requestCounts) {
  for (const hour in requestCounts[date]) {
    const count = requestCounts[date][hour];
    hourData.push(`${date} ${hour}:00`);
    requestData.push(count);
  }
}

// Create a new chart object
const chart = new Chart(document.getElementById('chart'), {
  type: 'line',
  data: {
    labels: hourData,
    datasets: [{
      label: 'Requests per Hour',
      data: requestData,
      backgroundColor: 'rgba(0, 119, 204, 0.3)',
      borderColor: 'rgba(0, 119, 204, 1)',
      borderWidth: 1,
      pointRadius: 0,
    }]
  },
  options: {
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  }
});