# Portfolio-CV-Calculator
A command-line software that uses the transactions listed in a CSV file to determine the worth of a crypto investor's portfolio.
Design Decisions
The following design decisions were made for this program:
Parsing of the CSV file: The csv-parser package was used to read the transactions from the CSV file in a quick and easy manner.

API calls: Since the axios library offers a quick and effective way to get the exchange rates for the tokens, it was utilized to perform API calls to CryptoCompare.

Calculation of the portfolio: To determine the total portfolio for each token, the transactions were grouped by token, the deposits and withdrawals were added up, and the withdrawals were subtracted. The result was multiplied by the USD exchange rate. Due to the API's lack of historical exchange rates, the portfolio value was determined using the current exchange rates.
Error handling: Error handling was included to deal with potential exceptions that could arise during the API calls and CSV file parsing. If there is a mistake, a message describing the mistake will be shown.

Four types of input parameters are supported by the program: no parameters, a token, a date, and a date and a token. If no parameters are given, the program will return the most recent portfolio value per token in USD, the most recent portfolio value for the given token in USD, the portfolio value per token on the given date in USD, and the portfolio value of the given token in USD on the given date if both a date and a token are given.
Usage
To use this program, follow these steps:

Clone the repository:
bash
Copy code
git clone https://github.com/ndegwacodes/portfolio-value-calculator.git
Install the dependencies:
Copy code
npm install
Run the program:
css
Copy code
node index.js [date] [token]
If no parameters are provided, the latest portfolio value per token in USD will be returned.
If a token is provided, the latest portfolio value for that token in USD will be returned.
If a date is provided, the portfolio value per token in USD on that date will be returned.
If a date and a token are provided, the portfolio value of that token in USD on that date will be returned.
The date parameter should be in Unix timestamp format.
