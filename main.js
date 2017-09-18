// main functions

function main() {
  $.ajax({
    url: "https://api.coinmarketcap.com/v1/ticker/?limit=200",
    success: function(response) {
      processData(response);
    }
  });
}
function processData(cmcCoins) {
  var btcPrice = parseFloat(cmcCoins[0]['price_usd']);
  var coinList = constructCoinList(cmcCoins);
  var totalShare = getTotalShare(coinList);
  var buyList = getBuys(coinList, totalShare, btcPrice);
  var buyListSorted = sortList(buyList);
  var buyListHtml = getBuyListHtml(buyListSorted);
  renderBuyList(buyListHtml, 'output');
}

// private functions

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
          coinList.push(localCoin);
        };
      };
    });
  });
  return coinList
}

function getLocalCoins() {
  var a = [];
  $('#coins input').each(function() {
    var d = {};
    d.symbol = this.id;
    d.upper = parseFloat(this.value);
    a.push(d);
  });
  return a;
}

function getTotalShare(coinList) {
  var collectDiffs = [];
  coinList.forEach(function(coin) {
    collectDiffs.push(coin.diff);
  });
  return collectDiffs.reduce(function(a, b) { return a + b; }, 0);
}

function getBuys(coinList, totalShare, btcPrice) {
  var cash = document.getElementById("cash").value;
  var buyList = [];
  coinList.forEach(function(coin) {
    coin.share = coin.diff / totalShare;
    coin.buy = coin.share * cash;
    coin.buy_btc = coin.buy / btcPrice;
    buyList.push({
      key: coin.symbol,
      value: coin.buy_btc
    });
  });
  return buyList;
}

function sortList(list) {
  return list.slice(0).sort(function(a, b) {
    return b.value - a.value;
  });
}

function getBuyListHtml(buyListSorted) {
  var html = '';
  buyListSorted.forEach(function(coin) {
    html += coin['key'] +' = ' + coin['value'] + '<br/>';
  });
  return html
}

function renderBuyList(buyListHtml, id) {
  document.getElementById(id).innerHTML = '';
  document.getElementById(id).innerHTML = buyListHtml;
}