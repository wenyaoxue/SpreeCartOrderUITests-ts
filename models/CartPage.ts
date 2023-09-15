import test, { expect, Locator, Page } from '@playwright/test'
export class CartPage {
    page: Page
    breadcrumb: Locator

	title: Locator

	couponfield: Locator
	couponbtn: Locator
	couponmsg: Locator

	shoplink: Locator
	checkoutlink: Locator

	productNames: Locator[]
	productDetails: Locator[]
	productPrices: Locator[]
	productDecBtns: Locator[]
	productIncBtns: Locator[]
	productQuantities: Locator[]
	productDeleteBtns: Locator[]
	productTotals: Locator[]
	
	subtotal: Locator

    constructor(page: Page) {
        this.page = page

        this.breadcrumb = page.locator("//main/div/nav/ol/li[2]")
    
        this.title = page.locator("//h1")
    
        this.couponfield = page.locator("#order_coupon_code")
        this.couponbtn = page.locator("#shopping-cart-coupon-code-button")
        this.couponmsg = page.locator("#coupon_status")
        
        this.shoplink = page.locator("//a[text()='Continue shopping']").nth(0)      
        this.checkoutlink = page.locator("#checkout-link")

        
        this.subtotal = page.locator("//div[contains(@class, 'shopping-cart-total-amount col align-self-end')]").nth(1)
    }
    async finishsetup() {
        this.productNames = await this.page.locator("//h2").all()        
        this.productDetails = await this.page.locator("//h2//following-sibling::ul").all()        
        this.productPrices = await this.page.locator("//div[@class='shopping-cart-item-price d-none d-lg-table-cell']").all()        
        this.productDecBtns = await this.page.locator("//div[@class='shopping-cart-item-price d-none d-lg-table-cell']/following-sibling::*[1]//button[1]").all()        
        this.productIncBtns = await this.page.locator("//div[@class='shopping-cart-item-price d-none d-lg-table-cell']/following-sibling::*[1]//button[2]").all()        
        this.productQuantities = await this.page.locator("//div[@class='shopping-cart-item-price d-none d-lg-table-cell']/following-sibling::*[1]//input").all()        
        this.productDeleteBtns = await this.page.locator("//div[@class='shopping-cart-item-price d-none d-lg-table-cell']/following-sibling::*[3]//a").all()        
        this.productTotals = await this.page.locator("//div[@data-hook='cart_item_total']").all()        
    }

    
    async verifyUrl() {expect(this.page).toHaveURL("http://demo.spreecommerce.org/cart");}	
	async verifyBreadcrumb() {expect(this.breadcrumb).toContainText("Shopping Cart");}
	async verifyTitle() {expect(this.title).toContainText("Your shopping cart");}	
	
	async addPromoCode(promocode: string) {
        await this.page.locator("#order_coupon_code").waitFor({state: "visible"})
		await this.couponfield.fill(promocode);
		await this.couponbtn.click();
		await this.page.waitForTimeout(1000)
		expect(this.couponmsg).not.toBeVisible();
	}
	async clickShop() {
		await this.shoplink.click();
        await this.page.waitForTimeout(2000);
        await expect(this.page).toHaveURL("http://demo.spreecommerce.org/products");}
	async clickCheckout() {
		await this.checkoutlink.click(); 
        await this.page.waitForTimeout(2000);
        await expect(this.page).toHaveURL("http://demo.spreecommerce.org/checkout");}
	
	async findProduct(productName: string) {
		for (let i = 0; i < this.productNames.length; i++)
			if ((await this.productNames[i].innerText()) == productName)
				return i
		//product not found
		return -1
	}
    
	async deleteItem(productName: string) {
		let i = await this.findProduct(productName);
		if (i == -1) expect(null).toBeTruthy(); //product can't be found, can't be deleted
		await this.productDeleteBtns[i].click(); 
		await this.page.waitForTimeout(2000);
        this.finishsetup();
		expect(await this.findProduct(productName)).toBe(-1); //if not -1, product was found, not deleted
	}
	async verifyDetails(productName: string, details: object) {
		let i = await this.findProduct(productName);
		if (i == -1) expect(null).toBeTruthy(); //product can't be found, can't be deleted
		//details eg "SIZE"->"S", "COLOR"->"GREY"
		for (let detailName in details) {
			if (!( ( await this.productDetails[i].innerText() ).includes( detailName + ": " + details[detailName] ) ))
				expect(null).toBeTruthy();
		}
        //success
	}
	
	async costToDouble(cost: Locator) { return parseFloat((await cost.innerText()).replace(",", "").trim().substring(1)); }
    async verifyCosts() { //p*q = P; sum P = ST
		let subtot = 0;
		for (let i = 0; i < this.productNames.length; i++) {
            let thisCost = await this.costToDouble(this.productPrices[i])
            let thisQuant = parseInt(await this.productQuantities[i].inputValue()) 
            let thisTot = await this.costToDouble(this.productTotals[i])
			if ( thisCost * thisQuant != thisTot )
				expect(null).toBeTruthy();
			else
				subtot += thisTot;
		}
		expect(Math.round(subtot*100)/100.).toBe(await this.costToDouble(this.subtotal));
	}
	
	async incQ(productName: string) {
		let i = await this.findProduct(productName);
		if (i == -1) expect(null).toBeTruthy();
		let prvQ = parseInt(await this.productQuantities[i].inputValue());
		await this.productIncBtns[i].click();
		await this.page.waitForTimeout(3000);
		expect(parseInt(await this.productQuantities[i].inputValue())).toBe(prvQ+1);
	}
	async decQ(productName: string) {
		let i = await this.findProduct(productName);
		if (i == -1) expect(null).toBeTruthy();
		let prvQ = parseInt(await this.productQuantities[i].inputValue());
		await this.productDecBtns[i].click();
		await this.page.waitForTimeout(3000);
		expect(parseInt(await this.productQuantities[i].inputValue())).toBe(prvQ-1);
	}
    /*
	async setQ(productName: string, q: string) {
		int i = findProduct(productName);
		if (i == -1) expect(null).toBeTruthy();
		productQuantities[i].clear();
		productQuantities[i].sendKeys(q);
		this.page.waitForTimeout(3000);
		expect(Integer.parseInt(q) == Integer.parseInt(productQuantities[i].inputValue());
	}*/

}