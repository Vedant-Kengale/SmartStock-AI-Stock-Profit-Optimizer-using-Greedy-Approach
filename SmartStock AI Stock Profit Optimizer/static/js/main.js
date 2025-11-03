let chart;

function drawChart(prices, transactions){
  const ctx = document.getElementById('priceChart').getContext('2d');
  const labels = prices.map((_, i) => 'Day ' + (i + 1));
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Stock Price Trend',
        data: prices,
        borderColor: '#00b4ff',
        backgroundColor: 'rgba(0,180,255,0.15)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#00b4ff',
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#ccc' } },
        y: { ticks: { color: '#ccc' }, beginAtZero: false }
      }
    }
  });
}

function renderTransactions(transactions){
  if (!transactions || transactions.length === 0) {
    $('#txArea').html('<p class="text-muted small">No profitable transactions detected.</p>');
    return;
  }
  let html = '<h6 class="text-info mt-2">Transactions</h6><ul class="list-group list-group-flush">';
  transactions.forEach(tx => {
    html += `<li class="list-group-item bg-transparent text-light">
      <span class="text-success">Buy</span> Day ${tx.buy_day + 1} @ ₹${tx.buy_price}
      → <span class="text-danger">Sell</span> Day ${tx.sell_day + 1} @ ₹${tx.sell_price}
    </li>`;
  });
  html += '</ul>';
  $('#txArea').html(html);
}

$(function(){
  $('#loadSample').on('click', () => {
    $('#priceInput').val('100,180,260,310,40,535,695');
  });

  $('#clearBtn').on('click', () => {
    $('#priceInput').val('');
    $('#predPrice').text('-');
    $('#maxProfit').text('-');
    $('#txArea').html('');
    if (chart) chart.destroy();
  });

  $('#analyzeBtn').on('click', async () => {
    const raw = $('#priceInput').val().trim();
    if (!raw) { alert('Enter prices'); return; }

    const prices = raw.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    if (prices.length < 2) { alert('Enter at least 2 prices'); return; }

    $('#loader').fadeIn();  // Show loader

    try {
      const res = await fetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prices })
      });

      if (!res.ok) { alert('Server error'); return; }
      const data = await res.json();

      $('#predPrice').text('₹' + data.next_price);
      $('#maxProfit').text('₹' + data.profit);
      renderTransactions(data.transactions || []);
      drawChart(prices, data.transactions || []);
    } catch (err) {
      console.error(err);
      alert('Request failed');
    } finally {
      $('#loader').fadeOut();  // Hide loader
    }
  });
});
