function main() {
  var request = new XMLHttpRequest();
  request.open('GET', "https://api.coinmarketcap.com/v1/ticker/?limit=300", true);
  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      var resp = JSON.parse(request.responseText);
      processData(resp);
    } else {
      console.log('We reached our target server, but it returned an error')
    }
  };
  request.onerror = function() {
    console.log('There was a connection error of some sort')
  };
  request.send();
}

function processData(cmcCoins) {
  var btcPrice = parseFloat(cmcCoins[0]['price_usd']);
  var coinList = constructCoinList(cmcCoins);
  var totalShare = getTotalShare(coinList);
  var buyList = getBuyList(coinList, totalShare, btcPrice);
  var buyListSorted = sortList(buyList);
  var buyListHtml = getBuyListHtml(buyListSorted);
  renderHtml(buyListHtml, 'buyTable');
}

function constructCoinList(cmcCoins) {
  var localCoins = getLocalCoins();
  var coinList = [];
  localCoins.forEach(function(localCoin) {
    cmcCoins.forEach(function(cmcCoin) {
      if (localCoin.symbol == cmcCoin.symbol) {
        localCoin.name = cmcCoin.name;
        localCoin.priceUsd = parseFloat(cmcCoin.price_usd);
        if (localCoin.upper > localCoin.priceUsd) {
          localCoin.diff = (100 * ((localCoin.upper - localCoin.priceUsd) / localCoin.upper));
          var diffCut = parseFloat(document.getElementById("diffCut").value);
          if (localCoin.diff > diffCut) {
            coinList.push(localCoin);
          };
        };
      };
    });
  });
  return coinList
}

function getLocalCoins() {
  var a = [];
  if(document.getElementById('longTerm').checked) {
    var coinTable = document.querySelectorAll('#longCoins')[0];
  } else if(document.getElementById('shortTerm').checked) {
    var coinTable = document.querySelectorAll('#shortCoins')[0];
  };
  for (var i = 0, row; row = coinTable.rows[i]; i++) {
    var d = {};
    d.symbol = row.cells[0].innerText;
    d.upper = parseFloat(row.cells[1].innerText);
    a.push(d);
  };
  return a;
}

function getTotalShare(coinList) {
  var collectDiffs = [];
  coinList.forEach(function(coin) {
    collectDiffs.push(coin.diff);
  });
  return collectDiffs.reduce(function(a, b) { return a + b; }, 0);
}

function getBuyList(coinList, totalShare, btcPrice) {
  var cash = document.getElementById("cash").value;
  if(document.getElementById('cashBtc').checked) {
    var cashType = 'BTC';
  } else if(document.getElementById('cashUsd').checked) {
    var cashType = 'USD';
  };
  var buyList = [];
  coinList.forEach(function(coin) {
    coin.share = coin.diff / totalShare;
    if (cashType == 'BTC') {
      coin.buy = coin.share * cash;
    } else if (cashType == 'USD') {
      coin.buy = (coin.share * cash) / btcPrice;
    };
    buyList.push({
      symbol: coin.symbol,
      diff: coin.diff.toFixed(2),
      value: coin.buy.toFixed(6)
    });
  });
  return buyList;
}

function sortList(list) {
  return list.slice(0).sort(function(a, b, c) {
    return b.value - a.value;
  });
}

function getBuyListHtml(buyListSorted) {
  var html = `
    <th scope="row">Coin</th>
    <th scope="row">Diff (%)</th>
    <th scope="row">Buy (BTC)</th>
  `;
  buyListSorted.forEach(function(coin) {
    html += '<tr>'
    html += '<td>' + coin['symbol'] + '</td>';
    html += '<td>' + coin['diff'] + '</td>';
    html += '<td>' + coin['value'] + '</td>';
    html += '</tr>'
  });
  return html;
}

function renderHtml(html, id) {
  document.getElementById(id).innerHTML = '';
  document.getElementById(id).innerHTML = html;
}
