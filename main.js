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

function getCmcCoins() {
  $.ajax({
    url: "https://api.coinmarketcap.com/v1/ticker/?limit=200",
    success: function(response) {
      var coinList = []
      getLocalCoins().forEach(function(localCoin) {
        response.forEach(function(cmcCoin) {
          if (localCoin.symbol == cmcCoin.symbol) {
            localCoin.name = cmcCoin.name;
            localCoin.mkt_cap = parseFloat(cmcCoin.market_cap_usd);
            localCoin.price_usd = parseFloat(cmcCoin.price_usd);
            localCoin.price_btc = parseFloat(cmcCoin.price_btc);
            if (localCoin.upper > localCoin.price_usd) {
              localCoin.diff = (100 * ((localCoin.upper - localCoin.price_usd) / localCoin.upper));
              coinList.push(localCoin);
            }
          };
        })
      })
      console.log(coinList)
    }
  });
}

function main() {
  var cash = document.getElementById("cash").value;
  getCmcCoins();
}