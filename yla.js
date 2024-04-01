const { error } = require('console');
const got = require('got'); // GOT is used to handle https requests
const HTMLParser = require('node-html-parser'); // Helps in parsing only the html from the webpage as it helps narrow down the required things we need
const { resolve } = require('path');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const prompt = require('prompt-sync')();

// const productLink = 'https://www.youngla.com/products/514, https://www.youngla.com/products/204?variant=42580068499644'

const hook = new Webhook("https://discord.com/api/webhooks/1197264370074402906/Qhlmmw1Q8kjnx664KmLlLEEP3aqNfgXi1lg2phjBSdYiknRNHW5-eLFAs7h5jsBQOg-7");
const embed = new MessageBuilder()
.setTitle('YoungLA Monitor')
.setColor('#90ee90')
.setTimestamp()


async function Monitor(productLink) {
    // Need this to validate the link and its headers for better security 
    var myheaders = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'max-age=0',
        'Referer': 'https://www.youngla.com/collections/t-shirts',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': 1,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    const response = await got(productLink, {
        headers: myheaders
    });

    if (response && response.statusCode == 200) {
        let root = HTMLParser.parse(response.body);
        let availabilityDiv = root.querySelector('.ProductForm__BuyButtons')
        let productName = root.querySelector('.ProductMeta')
        if (availabilityDiv) {
            let productImageElement = root.querySelector('.Image--fadeIn lazyautosizes Image--lazyLoaded');
            let productImageURL = productImageElement ? productImageElement.getAttribute('data-original-src') || productImageElement.getAttribute('src') : null;
            //let productImageURL = root.querySelector('').getAttribute('data-original-src');

            let productText = productName.innerText;
            productText = productText.replace(/[^a-zA-Z\s]/g, '').trim();
            let product = productLink.substring(productLink.indexOf('com/') + 4); // Because of CircularJSON issue

            let stockText = availabilityDiv.innerText;
            stockText = stockText.replace(/[^a-zA-Z\s]/g, '').trim(); // Use a regular expression to replace everything except the words
            stockText = stockText.split(/\s+/).filter(word => !['display', 'none', 'shopifysectiontemplatemain', 'shopifypaymentbutton'].includes(word.toLowerCase())).join(' '); // Log only the words that are not "display" or "none", which are likely part of CSS.
            
            if (stockText == 'Add to cart') {
                embed.setThumbnail(productImageURL);
                embed.addField(productLink, 'Get IT!', true)
                embed.addField('Availability', 'IN STOCK', false)
                hook.send(embed);
                console.log(productText + ': In Stock');
            } else if (stockText == 'Sold Out') {
                console.log(productText + ': Out of Stock')
            }
        }
    }
    // Keeps reloading to check, Crtl+C to cancel
    await new Promise(r => setTimeout(r, 8000));
    Monitor(productLink);
    return false;
}

async function Run() {
    let productLink = prompt("Enter links to monitor (Separate by comma): " );
    var productLinksArr = productLink.split(',');
    for ( var i = 0; i < productLinksArr.length; i++) {
        productLinksArr[i] = productLinksArr[i].trim();
    }

    var monitors = []; // promises array
    productLinksArr.forEach(link => {
        var p = new Promise((resolve, reject) => {
            resolve(Monitor(link));
        }).catch(err => console.log(err));

        monitors.push(p);
    });

    console.log('Monitoring ' + productLinksArr.length + ' items');
    await Promise.allSettled(monitors);
}

Run();