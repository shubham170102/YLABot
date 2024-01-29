# YLAStockMonitor

This application helps you monitor any product that you are looking for on the YoungLA website and lets you know if the product you are looking for is in stock or not with constant updates to your discord webhook server to keep you updated if it ever runs out of stock. For a new additional feature, you can checkout any number of your favorite products from YoungLA within seconds. 

## Monitor Bot

This bot is fairly easy to use as you simply run the `yla.js` file with the command `node yla.js`. But before that make sure that you have Node.js installed and if not that can be done by `npm install`. Make sure to install these to with the commands

`npm install got`

`npm install node-html-parser`

`npm install discord-webhook-node`

With `npm pkg` I have made it available for any user to use this app on MacOS, Linux, or Windows as they simply just need to paste all the links they want to monitor (separated by commas).

## CheckOut Bot

To use this you want to initially install plugins like these just in case:

`npm install puppeteer`

`npm install puppeteer-extra`

`npm install puppeteer-extra-stealth-plugin`

`npm install chrome-location`

Once done enter your Credit/debit Card info in the `payment` function and your personal info in the `checkout` function.

This bot helps you checkout products from your desired link(s) and for each link enter the color and size of your choice (could be helpful if you look at the color that store offers initially) and if there any product that doesn't exist or is out of stock the program will let you know about the availabilty of that product.

Once ready to try this bot, simply run `ylabot.js` and you should be good to go!