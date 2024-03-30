const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fetch = require('node-fetch');
const localChrome = require('chrome-location');
const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
puppeteer.use(StealthPlugin());

let productLinkparameter = '';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.listen(8080, () => console.log("app is running"));
app.post('/api/start', (req, res) => {
    let {link} = req.body;
    link = link.trim();
    if (!link) {
        return res.status(400).json({ error: 'Link are required fields.' });
    }
    res.json({ "message": "Form Submitted" });
    productLinkparameter = link;
    run();
})

async function run() {
    const browser = await puppeteer.launch({ headless: false, executablePath: localChrome, args: [
        '--start-maximized',
        '--window-size=1920,1080', 
    ] });
    const page = await browser.newPage();
    console.log("Navigating to this product: " + productLinkparameter);
    await page.goto(productLinkparameter);
    await addToCartRequest(page, productLinkparameter);
    const cartResponse = await cartRequest(page, productLinkparameter);
    const checkoutPageUrl = getCheckoutPageUrl(cartResponse);
    if (checkoutPageUrl) {
        try {
            await page.goto(checkoutPageUrl);
        } catch (error) {
            console.error("The launching of the checkout page was unsuccessful: ", error);
        }
    } else {
        console.log("Checkout URL was not found or is invalid.");
    }
    await checkoutProduct(page);

}

function getCheckoutPageUrl(cartRequestResponse) {
    const actionStr = 'action="';
    const start = cartRequestResponse.indexOf(actionStr);
    if (start === -1) {
        console.log("Could not find checkout page URL.");
        return "";
    }
    const startUrl = start + actionStr.length;
    const endUrl = cartRequestResponse.indexOf('"', startUrl);
    if (endUrl === -1) {
        console.log("Could not find the end of the checkout page URL.");
        return "";
    }
    const checkoutUrlSuffix = cartRequestResponse.substring(startUrl, endUrl);
    return "https://www.youngla.com" + checkoutUrlSuffix;
}


async function cartRequest(page, productUrl) {
    const cookies = await page.cookies();
    let cookieString = "";
    for (let i = 0; i < cookies.length; i++) {
        let fragment = "";
        if (i != (cookies.length - 1)) {
            fragment = cookies[i].name + "=" + cookies[i].value + "; ";
        }
        else {
            fragment = cookies[i].name + "=" + cookies[i].value;
        }
        cookieString = cookieString + fragment;
    }

    const cartRequestOptions = {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "max-age=0",
            "content-type": "application/x-www-form-urlencoded",
            "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "cookie": cookieString,
            "Referer": productUrl,
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": "attributes%5Bcollection_mobile_items_per_row%5D=&attributes%5Bcollection_desktop_items_per_row%5D=&updates%5B%5D=1&checkout=",
        "method": "POST"
    };

    const cartResponse = await page.evaluate(async (options) => {
        try {
            const response = await fetch("https://www.youngla.com/cart", options);
            if (!response.ok) throw new Error(`Cart request error! Status: ${response.status}`);
            return response.headers.get("content-type")?.includes("application/json") ? response.json() : response.text();
        } catch (error) {
            console.error("Cart Request Error: ", error);
            return null;
        }
    }, cartRequestOptions);

    return cartResponse;

}


async function addToCartRequest(page, productUrl) {
    // Extract the product variant IDs from the JSON content within the script tag
    const productVariantIds = await page.evaluate(() => {
        const scriptElement = document.querySelector('script[data-product-json]');
        if (scriptElement) {
            const productData = JSON.parse(scriptElement.innerHTML);
            if (productData && productData.product && productData.product.variants) {
                return productData.product.variants.map(variant => variant.id);
            }
        }
        return [];
    });

    // Uncomment below to see different items and there variant IDs
    // if (productVariantIds.length > 0) {
    //     console.log('Product Variant IDs:', productVariantIds);
    // } else {
    //     console.log('No product variant IDs found');
    // }

    const productColors = await page.evaluate(() => {
        const scriptElement = document.querySelector('script[data-product-json]');
        if (scriptElement) {
            const productData = JSON.parse(scriptElement.innerHTML);
            if (productData && productData.product && productData.product.variants) {
                return productData.product.variants.map(variant => variant.title);
            }
        }
        return [];
    });

    // Uncomment below to see different items and there variant colors / sizes
    // if (productColors.length > 0) {
    //     console.log('Product Color and sizes:', productColors);
    // } else {
    //     console.log('No product of that color and size found');
    // }

    const sectionIdElement = await page.waitForSelector("input[name='section-id']");
    const sectionID = await page.evaluate(sectionIdElement => sectionIdElement.value, sectionIdElement);
    const productIdElement = await page.waitForSelector("input[name='product-id']");
    const productID = await page.evaluate(productIdElement => productIdElement.value, productIdElement);
    const id = productVariantIds[0];
    const color = productColors[0].substring(0, productColors[0].indexOf('/')).trim();
    const size = productColors[0].substring(productColors[0].indexOf('/ ') + 1).trim();

    const cookies = await page.cookies();
    let cookieString = "";
    for (let i = 0; i < cookies.length; i++) {
        let fragment = "";
        if (i != (cookies.length - 1)) {
            fragment = cookies[i].name + "=" + cookies[i].value + "; ";
        }
        else {
            fragment = cookies[i].name + "=" + cookies[i].value;
        }
        cookieString = cookieString + fragment;
    }

    const body = JSON.stringify({
        "form_type": "product",
        "utf8": "✓",
        "option-0": color,
        "option-1": size,
        "id": id.toString(),
        "product-id": productID.toString(),
        "section-id": sectionID
    });

    const addRequestOptions = {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json",
            "sec-ch-ua": "\"Chromium\";v=\"122\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"122\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Mac OS X\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "cookie": cookieString,
            "Referer": productUrl,
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": body,
        "method": "POST"
    };

    const addRequestResponse = await page.evaluate(async (options) => {
        try {
            const response = await fetch("https://www.youngla.com/cart/add.js", options);
            return response.ok ? response.json() : Promise.reject(`Error: ${response.statusText}`);
        } catch (error) {
            return `Failed to add item to cart: ${error}`;
        }
    }, addRequestOptions);
    //console.log('Add to Cart Response:', addRequestResponse);
    return;
}

async function checkoutProduct(page) {
    await page.waitForTimeout(1000);
    await page.waitForSelector('#checkout_shipping_address_province');
    await page.waitForTimeout(1000);
    await page.select("#checkout_shipping_address_province", "Indiana");

    // Enter your Info here and uncommment anything if needed
    await page.evaluate(() => {
        document.getElementById('checkout_email').value = "thonmaker344@gmail.com"
        document.getElementById('checkout_shipping_address_first_name').value = "Sedrick"
        document.getElementById('checkout_shipping_address_last_name').value = "Will"
        document.getElementById('checkout_shipping_address_address1').value = "940 Blanda Valleys Apt. 478"
        //document.getElementById('checkout_shipping_address_address2').value = "AddressLine2"
        document.getElementById('checkout_shipping_address_city').value = "Lindshire"
        document.getElementById('checkout_shipping_address_province').value = "MO"; // Select State (XX form) Ex. IN
        document.getElementById('checkout_shipping_address_zip').value = "63013";
        document.getElementById('checkout_shipping_address_phone').value = "2029182132";
    })

    // apply discount code
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
        document.getElementById('checkout_reduction_code').value = 'youngla15'
        document.querySelectorAll('button[id="checkout_submit"]')[0].click()

    })

    await page.waitForTimeout(1000);
    await page.evaluate(() => document.getElementById('continue_button').click());
    await page.waitForTimeout(1000);
    await page.evaluate(() => document.getElementById('btn-proceed-address').click());

    // continue to estimate shipping date
    await page.waitForTimeout(1000)
    await page.waitForSelector("#continue_button")
    await page.evaluate(() => document.getElementById('continue_button').click());

    await payment(page);
}

async function payment(page) {

    // Enter your card info here
    await page.waitForSelector("iframe[title='Field container for: Card number']")
    await page.waitForTimeout(1000)

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

    await page.waitForTimeout(1000)
    await page.evaluate(() => document.getElementById('continue_button').click()); // last step
}


//run();

// const linksToRun = [
//     "https://www.youngla.com/products/4075",
//     "https://www.youngla.com/products/401-essential-jacked-tees-23",
//     "https://www.youngla.com/products/233-loose-printed-joggers",
//     "https://www.youngla.com/products/465-compression-tee"
// ];

// const runPromises = linksToRun.map(productUrl => run(productUrl));

// Promise.all(runPromises)
//     .then(() => {
//         console.log("All instances completed successfully.");
//     })
//     .catch(error => {
//         console.error("An error occurred:", error);
//     });



    