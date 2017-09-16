function getLocalCoins() {
  var a = [];
  $('#coins input').each(function() {
    var d = {}
    d.symbol = this.id;
    d.upper = parseFloat(this.value);
    a.push(d);
  });
  return a
}

function getTotalShare(coinList) {
  var collectDiffs = [];
  coinList.forEach(function(coin) {
    collectDiffs.push(coin.diff);
  });
  return collectDiffs.reduce(function(a, b) { return a + b; }, 0);
}

function createCoinList(cmcCoins) {
  var btc_price = parseFloat(cmcCoins[0]['price_usd']);
  var coinList = [];
  getLocalCoins().forEach(function(localCoin) {
    cmcCoins.forEach(function(cmcCoin) {
      if (localCoin.symbol == cmcCoin.symbol) {
        localCoin.name = cmcCoin.name;
        localCoin.mkt_cap = parseFloat(cmcCoin.market_cap_usd);
        localCoin.price_usd = parseFloat(cmcCoin.price_usd);
        localCoin.price_btc = parseFloat(cmcCoin.price_btc);
        if (localCoin.upper > localCoin.price_usd) {
          localCoin.diff = (100 * ((localCoin.upper - localCoin.price_usd) / localCoin.upper));
          coinList.push(localCoin);
        };
      };
    });
  });
  var totalShare = getTotalShare(coinList);
  getBuys(coinList, totalShare, btc_price);
}

function getBuys(coinList, totalShare, btc_price) {
  var cash = document.getElementById("cash").value;
  buyList = []
  coinList.forEach(function(coin) {
    coin.share = coin.diff / totalShare;
    coin.buy = coin.share * cash;
    coin.buy_btc = coin.buy / btc_price;
    buyList.push(coin.symbol + ' ' + coin.buy_btc);
  })
  renderBuyList(buyList);
}

function renderBuyList(buyList) {
  buyList.forEach(function(coin) {
    var output = document.createElement("li");
    output.innerHTML = coin;
    document.getElementById("output").appendChild(output);
  });
}

function main() {
  $.ajax({
    url: "https://api.coinmarketcap.com/v1/ticker/?limit=200",
    success: function(response) {
      createCoinList(response);
    }
  });
}
