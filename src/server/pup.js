const puppeteer = require('puppeteer-extra')

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

const enhance = async (page) => {
    try {
        await page.removeAllListeners('request'); 
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !== -1) {
                request.abort();
            } else {
                request.continue();
            }
          });
    } catch (error) {
        return error;
    }
}

async function checkout(url, sNum){
    console.time('checkout time');
    const browser = await puppeteer.launch({
        userDataDir: "./user_data",
        headless: true,
        args: [
            '--blink-settings=imagesEnabled=false',
            '--no-sandbox',
            '--disable-gpu',
            '--proxy-server="direct://"',
            '--proxy-bypass-list=*'
          ]
    });
    const page = await browser.newPage();
    try {
        setTimeout(() => {
            enhance(page)
        }, 300);
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        //click on add to cart then go to checkout, sign in etc

        //check if checkout button is available
        let count = 0;
        let maxTries = 3;
        while(true) {
            try {
                await page.click("button[class='btn btn-primary btn-lg btn-block btn-leading-ficon add-to-cart-button']");
                break;
            } catch (error) {
                await page.reload({ waitUntil: "domcontentloaded" });
                if (++count === maxTries) {
                    console.error(e);
                }
            }
        }
        console.log('added to cart...');
    
        const page1 = await browser.newPage();
        // setTimeout(() => {
        //     enhance(page1)
        // }, 300);
        await page1.waitFor(400);
        await page1.goto('https://www.bestbuy.com/checkout/r/fast-track', { waitUntil: 'domcontentloaded' });
    
        await page1.waitForSelector('input[name="cvv"]', {timeout: 3000});
        await page1.click('input[name="cvv"]');
        await page1.type('input[name="cvv"]', sNum);
    
        await page1.click("button[class='btn btn-lg btn-block btn-primary button__fast-track']");
        console.log('ordered!');
        console.timeEnd('checkout time');
        await browser.close();
        return "ordered";
    } catch (error) {
        await browser.close();
        return "failed";
    }
}

//make this run every time open app
async function BestBuySignIn(email, pass) {
    const browser = await puppeteer.launch({
        userDataDir: "./user_data",
        headless: true,
        args: [
            '--blink-settings=imagesEnabled=false',
            '--no-sandbox',
            '--disable-gpu',
          ]
    });  
    const page = await browser.newPage()
    const navigationPromise = page.waitForNavigation()
    try {
        await page.goto('https://www.bestbuy.com/identity/global/signin')
        await navigationPromise
        
        await page.waitForSelector('input[type="email"]')
        await page.click('input[type="email"]')
        await navigationPromise
        
        await page.type('input[type="email"]', email)
        
        await page.waitForSelector('input[type="password"]')
        await page.click('input[type="password"]')
        await page.waitFor(500);
        await page.type('input[type="password"]', pass)
        
        await page.waitForSelector('input[type="checkbox"]')
        await page.click('input[type="checkbox"]')
        
        await page.click('button[class="btn btn-secondary btn-lg btn-block c-button-icon c-button-icon-leading cia-form__controls__submit "]');
    } catch (error) {
        await browser.close();
    }
}

//product details
async function prod(url) {
    const browser = await puppeteer.launch({
        //userDataDir: "./user_data",
        headless: true,
        args: [
            '--blink-settings=imagesEnabled=false',
            '--no-sandbox',
            '--disable-gpu',
            // '--window-size=1920x1080'
          ]
    });
    try {
        const page = await browser.newPage();
    
        await page.goto('http://www.google.com')
        await page.goto(url, { waitUntil: 'networkidle2' });
        console.log('.')
        
        let prodName = await page.$eval('div > div > div.sku-title', e => e.innerText);
        let prodPrice = await page.$eval('._none > div > div > div > div > div > div:nth-child(1) > div > div:nth-child(1) > div > span:nth-child(1)', e => e.innerText);
        console.log("HERERHEREREHR", prodPrice)
        let prodImage = await page.$eval('div > div > div > div.primary-media-wrapper.base-page-image.lv > div > button > img', e => e.src);
        return {
            prodName,
            prodPrice,
            prodImage,
            bot: false,
        }
    } catch (error) {
        console.log(error)
        return {
            bot: false,
        };
    } finally {
        await browser.close();
    }
}

//price checker
async function priceCheck(url) {
    const browser = await puppeteer.launch({
        //userDataDir: "./user_data",
        headless: true,
        args: [
            '--blink-settings=imagesEnabled=false',
            '--no-sandbox',
            '--disable-gpu',
            // '--window-size=1920x1080'
          ]
    });
    try {
        const page = await browser.newPage();
    
    
        await page.goto('http://www.google.com')
        await page.goto(url, { waitUntil: 'networkidle2' });
    
        let prodPrice = await page.$eval('div.pricing-price > div > div > div > div:nth-child(2) > div > div > div > span:nth-child(1)', e => e.innerText);
        return {
            price: prodPrice,
            bot: false,
        }

    }  catch (error) {
        //console.log('pup error')
        return {
            price: "$0",
            bot: false,
        }
    } finally {
        await browser.close();
    }
}

module.exports = {checkout, BestBuySignIn, prod, priceCheck};