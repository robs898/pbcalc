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
        //if (localCoin.upper > localCoin.priceUsd) {
          //localCoin.return = ((localCoin.upper - localCoin.priceUsd) / localCoin.priceUsd)*100;
          localCoin.return = localCoin.upper / localCoin.priceUsd;
          var returnCut = parseFloat(document.getElementById("returnCut").value);
          //if (localCoin.return > returnCut) {
            coinList.push(localCoin);
          //};
        //};
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
    d.upper = parseFloat(row.cells[1].getElementsByTagName("input")[0].value);
    a.push(d);
  };
  return a;
}

function getTotalShare(coinList) {
  var collectReturns = [];
  coinList.forEach(function(coin) {
    collectReturns.push(coin.return);
  });
  return collectReturns.reduce(function(a, b) { return a + b; }, 0);
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
    coin.share = coin.return / totalShare;
    if (cashType == 'BTC') {
      coin.buyBtc = coin.share * cash;
    } else if (cashType == 'USD') {
      coin.buyBtc = (coin.share * cash) / btcPrice;
    };
    coin.buyUsd = coin.buyBtc * btcPrice
    buyList.push({
      symbol: coin.symbol,
      price: coin.priceUsd,
      return: coin.return.toFixed(2),
      buyBtc: coin.buyBtc.toFixed(6),
      buyUsd: coin.buyUsd.toFixed(2)
    });
  });
  return buyList;
}

function sortList(list) {
  return list.slice(0).sort(function(a, b, c, d) {
    return b.buyBtc - a.buyBtc;
  });
}

function getBuyListHtml(buyListSorted) {
  var html = `
    <th scope="row">Coin</th>
    <th scope="row">Price (USD)</th>
    <th scope="row">ROI</th>
    <th scope="row">Buy (BTC)</th>
    <th scope="row">Buy (USD)</th>
  `;
  buyListSorted.forEach(function(coin) {
    html += '<tr>'
    html += '<td>' + coin['symbol'] + '</td>';
    html += '<td>' + coin['price'] + '</td>';
    html += '<td>' + coin['return'] + '</td>';
    html += '<td>' + coin['buyBtc'] + '</td>';
    html += '<td>' + coin['buyUsd'] + '</td>';
    html += '</tr>'
  });
  return html;
}

function renderHtml(html, id) {
  document.getElementById(id).innerHTML = '';
  document.getElementById(id).innerHTML = html;
}
