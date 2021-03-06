const marketConfig = (ns) =>{
  let config = {
    tickTime: 3000,
    minimumCashOnHand: 2e7, // 20 million
    minimumCashPercent: 0.05, // 5 percent
    symbols: null,
  };
  config.symbols = ns.stock.getSymbols();
  return config;
}
const commission = { buy: 100000, sell: 100000 };
commission.total = commission.buy + commission.sell;
const targetFormat = "$0.00a";

const calculateNetWorth = (ns) => {
  const currentMoney = ns.getServerMoneyAvailable('home');
  const heldStocks = ns.stock
    .getSymbols()
    .map((symbol) => buildStock(ns, symbol))
    .filter(isStockHeld);
  const moneyInStocks = heldStocks.reduce((acc, stock) => acc + getPositionValue(stock), 0);
  return currentMoney + moneyInStocks;
};

const getHeldShares = (stock) => stock.position[0];
const getAveragePositionPrice = (stock) => stock.position[1];
const isStockHeld = (stock) => getHeldShares(stock) > 0;
const isStockGood = (stock) => stock.forecast >= 0.55;
const getHeldStocks = (stocks) => stocks.filter(isStockHeld);
const getGoodStocks = (stocks) => stocks.filter(isStockGood);
const getPositionValue = (stock) => getHeldShares(stock) * getAveragePositionPrice(stock);

const tick = async (ns, state, config, iteration, isSimulated) => {
  if(iteration%10==0){
    ns.print(`Net worth: ${ns.nFormat(calculateNetWorth(ns), targetFormat)}`);
  }
  const stocks = config.symbols
    .map((symbol) => buildStock(ns, symbol))
    .sort((a, b) => {
      if (a.forecast === b.forecast) {
        // If the forecase is the same, get the stock that will grow faster.
        return b.volatility - a.volatility;
      } else {
        // Otherwise get the stock that is more likely to grow.
        return b.forecast - a.forecast;
      }
    });
  const heldStocks = getHeldStocks(stocks);
  const goodStocks = getGoodStocks(stocks);

  if (goodStocks.length === 0) {
    // Nothing looks good. Just sell everything and wait.
    if (heldStocks.length > 0) {
      ns.print(`There are no stocks worth holding. Selling all current positions.`);
      sellPositions(ns, heldStocks);
    }
  } else {
    // ns.print(`Stocks worth holding:`);
    // for (const { symbol, price, position, volatility, forecast } of goodStocks) {
    //   ns.print(`${symbol} - price=${price}, position=${position}, volatility=${volatility}, forecast=${forecast}`);
    // }

    const stockPurchaseCount = goodStocks.length; // 3;
    const bestStocks = goodStocks.slice(0, stockPurchaseCount);
    const bestStockSymbols = bestStocks.map((s) => s.symbol);

    const otherHeldStocks = heldStocks.filter((s) => !bestStockSymbols.includes(s.symbol));
    if (otherHeldStocks.length > 0) {
      // Don't sell the best stock if we already own some. No need to incur the
      // commission on the sale because we're just going to buy it right back again.
      ns.print(`Selling all stocks that aren't the current best.`);
      sellPositions(ns, otherHeldStocks);
      state.stocksChanged = true;
    }
    
    let currentMoney = ns.getServerMoneyAvailable('home');
    let moneyInStocks = heldStocks.reduce((acc, stock) => acc + getPositionValue(stock), 0);
    let totalMoney = currentMoney + moneyInStocks;
    let minimumCashOnHand = Math.max(config.minimumCashOnHand, totalMoney * config.minimumCashPercent);
    let availableMoney = currentMoney - minimumCashOnHand - commission.buy;
    if (availableMoney <= 0) {
      ns.print( `You only have ${ns.nFormat(currentMoney, targetFormat)}, less than the configured minimum cash on hand of ${ns.nFormat(minimumCashOnHand, targetFormat)}`, );
    }else{
      for (const stock of bestStocks) {
        currentMoney = ns.getServerMoneyAvailable('home');
        moneyInStocks = heldStocks.reduce((acc, stock) => acc + getPositionValue(stock), 0);
        totalMoney = currentMoney + moneyInStocks;
        minimumCashOnHand = Math.max(config.minimumCashOnHand, totalMoney * config.minimumCashPercent);
        availableMoney = currentMoney - minimumCashOnHand - commission.buy;

        // TODO: Sell some shares if I need more cash on hand, given the config.

        if (availableMoney > 0) {
          const maxPurchaseableShares = ns.stock.getMaxShares(stock.symbol) - getHeldShares(stock);
          const shares = Math.min(maxPurchaseableShares, Math.floor(availableMoney / stock.price));

          if (shares > 0) {
            const sharesCost = shares * stock.price;

            if (!isStockHeld(stock) || sharesCost >= commission.total * 100) {
              // Don't waste commission money buying stocks worth less than the commission.
              const totalCost = sharesCost + commission.buy;
              ns.print( `Purchasing ${shares} shares${isStockHeld(stock) ? ' more' : ''} of ${stock.symbol} at a total of ${ns.nFormat(totalCost, targetFormat)}.`, );

              if (!isSimulated) {
                ns.stock.buy(stock.symbol, shares);
                state.stocksChanged = true;
              }
            }
          }
        }
      }
    }
  }

  const netWorth = calculateNetWorth(ns);

  if (state.stocksChanged && netWorth !== state.netWorth) {
    ns.print(`Net worth: ${ns.nFormat(netWorth, targetFormat)} (${ns.nFormat(netWorth - state.netWorth, targetFormat)})`);
    state.netWorth = netWorth;
    state.stocksChanged = false;
  }
};

const buildStock = (ns, symbol) => ({
  symbol,
  price: ns.stock.getPrice(symbol),
  position: ns.stock.getPosition(symbol),
  volatility: ns.stock.getVolatility(symbol),
  forecast: ns.stock.getForecast(symbol),
});

const sellPositions = (ns, stocks, isSimulated) => {
  for (const {
    symbol,
    price,
    position: [shares, averageBuyPrice],
  } of stocks) {
    if (shares > 0) {
      const totalPriceChange = (price - averageBuyPrice) * shares;
      const returnValue = totalPriceChange - commission.total;
      ns.print( `Selling ${shares} shares of ${symbol} at ${ns.nFormat(price, targetFormat)}, for a return of ${ns.nFormat(returnValue, targetFormat)}`, );

      if (!isSimulated) {
        ns.stock.sell(symbol, shares);
      }
    }
  }
};

/**
 * @param {NS} ns
 */
export async function main(ns) {
  ns.disableLog("ALL");
  
  const isSimulated = ns.args[0] === 1;
  const isSellAll = ns.args[0] === 2;
  const maxIterations = Number.POSITIVE_INFINITY;
  let iteration = 0;

  ns.print(`Running in simulation mode: ${isSimulated ? 'YES' : 'NO'}`);
  //ns.stock.purchase4SMarketDataTixApi()
  while(!ns.getPlayer().has4SDataTixApi){
    await ns.sleep(60000);
  }

  // Values that are shared across ticks.
  const state = {
    netWorth: calculateNetWorth(ns),
  };

  if(!isSellAll){
    while (true && iteration < maxIterations) {
      iteration += 1;
      // ns.tprint(`Iteration ${iteration}`);
      const config = marketConfig(ns);
      await tick(ns, state, config, iteration, isSimulated);
      await ns.sleep(config.tickTime);
    }
  }

  const config = marketConfig(ns);
  const stocks = config.symbols.map((symbol) => buildStock(ns, symbol));
  const heldStocks = getHeldStocks(stocks);

  if (heldStocks.length > 0) {
    ns.tprint('DEBUG: Selling all positions');
    sellPositions(ns, heldStocks, isSimulated);
  }
}