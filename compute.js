function compute() {
  function processData(data) {
    var call = JSON.parse(data);
    var coinNames = [];
    call.forEach(function outputName(coin) {
      coinNames.push(coin.id);
    });
    document.getElementById("output").innerHTML = coinNames;
  }
  function handler() {
    if (this.status == 200) {
      processData(this.responseText);
    } else {
      console.log('no 200');
    }
  }
  var cash = document.getElementById("cash").value;
  
  var coins = document.getElementById("coins").getElementsByTagName('div');
  for( i=0; i< coins.length; i++ )
  {
    var coin = coins[i];
    console.log(coins[i]);
  }
  
  var client = new XMLHttpRequest();
  client.onload = handler;
  client.open("GET", "https://api.coinmarketcap.com/v1/ticker/?limit=2");
  client.send();
}