/*NdegwaCode*/ 
const axios = require('axios');
const csv = require('csv-parser');
const fs = require('fs');

const csvFile = 'transactions.csv';
const apiUrl = 'https://min-api.cryptocompare.com/data/price';

async function main(date, token) {
  let transactions = [];

  // Read the transactions from the CSV file
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFile)
      .pipe(csv())
      .on('data', (data) => {
        transactions.push(data);
      })
      .on('end', () => {
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });

  // Group the transactions by token
  const groupedTransactions = transactions.reduce((acc, cur) => {
    const token = cur.token;
    if (!acc[token]) {
      acc[token] = [];
    }
    acc[token].push(cur);
    return acc;
  }, {});

  // Calculate the portfolio value for each token
  const portfolios = Object.entries(groupedTransactions).map(([token, transactions]) => {
    let balance = 0;

    // Calculate the balance for each token
    transactions.forEach((transaction) => {
      if (transaction.transaction_type === 'DEPOSIT') {
        balance += parseFloat(transaction.amount);
      } else if (transaction.transaction_type === 'WITHDRAWAL') {
        balance -= parseFloat(transaction.amount);
      }
    });

    return { token, balance };
  });

  // Get the exchange rates for each token
  const exchangeRates = await Promise.all(portfolios.map(async (portfolio) => {
    const response = await axios.get(`${apiUrl}?fsym=${portfolio.token}&tsyms=USD`);
    return {
      token: portfolio.token,
      exchangeRate: response.data.USD,
    };
  }));

  // Calculate the portfolio value in USD for each token
  const portfolioValues = portfolios.map((portfolio) => {
    const exchangeRate = exchangeRates.find((exchangeRate) => exchangeRate.token === portfolio.token).exchangeRate;
    return {
      token: portfolio.token,
      value: portfolio.balance * exchangeRate,
    };
  });

  // Return the portfolio value for the specified date and token
  if (date && token) {
    // Filter the transactions by date and token
    const filteredTransactions = transactions.filter((transaction) => {
      return (
        transaction.timestamp <= date &&
        transaction.token === token
      );
    });

    // Calculate the balance for the specified date and token
    let balance = 0;
    filteredTransactions.forEach((transaction) => {
      if (transaction.transaction_type === 'DEPOSIT') {
        balance += parseFloat(transaction.amount);
      } else if (transaction.transaction_type
