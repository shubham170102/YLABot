const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const localChrome = require('chrome-location');

const prompt = require('prompt-sync')()

puppeteer.use(StealthPlugin());

async function payment(page) {

    // Enter your card info here
    await page.waitForSelector("iframe[title='Field container for: Card number']")
    await page.waitForTimeout(2000)

    let iframe = await page.$("iframe[title='Field container for: Card number']")
    let iframeElement = await iframe.contentFrame()
    await iframeElement.type("input[id='number']", '5529960000869293')

    iframe = await page.$("iframe[title='Field container for: Name on card']")
    iframeElement = await iframe.contentFrame()
    await iframeElement.type("input[id='name']", 'Aiden Robinson')

    iframe = await page.$("iframe[title='Field container for: Expiration date (MM / YY)']")
    iframeElement = await iframe.contentFrame()
    await iframeElement.type("input[id='expiry']", '07/25')

    iframe = await page.$("iframe[title='Field container for: Security code']")
    iframeElement = await iframe.contentFrame()
    await iframeElement.type("input[id='verification_value']", '909')

    await page.waitForTimeout(2000)
    await page.evaluate(() => document.getElementById('continue_button').click()); // last step

}

async function checkout(page) {
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
        // document.querySelectorAll('button[data-testid="sheet-open-button"]')[0].click() 
        document.querySelector('button[name="checkout"]').click()  
        //document.querySelectorAll('button[class="Cart__Checkout Button Button--primary Button--full"]')[0].click()  
    })

    await page.waitForSelector('#checkout_shipping_address_province');
    await page.waitForTimeout(1500);
    await page.select("#checkout_shipping_address_province", "Indiana");

    // Enter your Info here and uncommment anything if needed
    await page.evaluate(() => {
        document.getElementById('checkout_email').value = "email@gmail.com"
        document.getElementById('checkout_shipping_address_first_name').value = "Shivi"
        document.getElementById('checkout_shipping_address_last_name').value = "Ranganathan"
        document.getElementById('checkout_shipping_address_address1').value = "212 W fowler Ave"
        //document.getElementById('checkout_shipping_address_address2').value = "AddressLine2"
        document.getElementById('checkout_shipping_address_city').value = "West Lafayette"
        document.getElementById('checkout_shipping_address_province').value = "IN"; // Select State (XX form) Ex. IN
        document.getElementById('checkout_shipping_address_zip').value = "47906";
        document.getElementById('checkout_shipping_address_phone').value = "9197609010";
    })

    // apply discount code
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
        document.getElementById('checkout_reduction_code').value = 'youngla15' 
        document.querySelectorAll('button[id="checkout_submit"]')[0].click()

    })

    await page.waitForTimeout(2000);
    await page.evaluate(() => document.getElementById('continue_button').click());
    await page.waitForTimeout(2000);
    await page.evaluate(() => document.getElementById('btn-proceed-address').click());

    // continue to estimate shipping date
    await page.waitForTimeout(2000)
    await page.waitForSelector("#continue_button")
    await page.evaluate(() => document.getElementById('continue_button').click());

    await payment(page);
}


async function monitor(page, productLink, colorChoice, sizeChoice) {
    await page.goto(productLink);
    await page.waitForTimeout(2000);

    // Using page.evaluate to interact with the DOM
    await page.evaluate((colorChoice) => {
        let links = document.querySelectorAll("label[class]");

        for (let i = 0; i < links.length; i++) {
            if (links[i].innerText.toLowerCase() === colorChoice) {
                links[i].click();
                break;
            }
        }
    }, colorChoice);
    await page.waitForTimeout(2000);

    let available = await page.evaluate((sizeChoice) => {
        let links = document.querySelectorAll("label[class]");
        let flag = false;
        for (let i = 0; i < links.length; i++) {
            if (links[i].innerText.toLowerCase() === sizeChoice) {
                links[i].click();
                flag = true;
                break;
            }
        }
        return true;
    }, sizeChoice);
    await page.waitForTimeout(2000);
    console.log(available);

    
    if (available) {
        await page.evaluate(() => {
            document.querySelector('button[data-action="add-to-cart"]').click();
        });
        await page.waitForTimeout(2000);
        return true;
    }
    return false;
}


// async function run() {
//     const browser = await puppeteer.launch({headless: false, executablePath: localChrome});
//     const page = await browser.newPage();
    
//     const colorChoice = prompt('Enter the color of your choice: ').trim().toLowerCase();
//     const sizeChoice = prompt('Enter your desired size: ').trim().toLowerCase();
   
//     while (true) {
//         try {
//             let isAvailable = await monitor(page, colorChoice, sizeChoice);
//             console.log("Availability:", isAvailable);

//             if (isAvailable) {
//                 await page.waitForTimeout(7000);
//                 await checkout(page);
//                 break;
//             } else {
//                 console.log("Product not available. Retrying...");
//                 await page.waitForTimeout(5000);
//             }
//         } catch (error) {
//             console.error("An error occurred:", error);
//             await page.screenshot({ path: 'error.png' });
//             // Handle error or retry logic here
//         }
//     }  
// }

async function monitorAndCheckout(browser, productLink, colorChoice, sizeChoice) {
    const page = await browser.newPage();
    let isAvailable = await monitor(page, productLink, colorChoice, sizeChoice);
    console.log(`Availability for ${productLink}:`, isAvailable);
    if (!isAvailable) {
        console.log(`Product at ${productLink} not available or options not found.`);
    }
    return page;
    //await page.close(); // Close the current product tab
}

async function run() {
    const browser = await puppeteer.launch({ headless: false, executablePath: localChrome });
    let page = await browser.newPage();
    
    let inputLinks = prompt('Enter product links separated by commas: ');
    let productLinks = inputLinks.split(',').map(link => link.trim());

    for (const productLink of productLinks) {
        console.log(`Product link: ${productLink}`);
        let colorChoice = prompt('Enter the color of your choice for this product: ').trim().toLowerCase();
        let sizeChoice = prompt('Enter your desired size for this product: ').trim().toLowerCase();

        page = await monitorAndCheckout(browser, productLink, colorChoice, sizeChoice);
        // You might want to add a timeout here to space out requests
        //await browser.waitForTimeout(5000);
    }

    await checkout(page); // Proceed to checkout after all items are added to the cart
    //await browser.close();
}


// GhostCursor Item

run();