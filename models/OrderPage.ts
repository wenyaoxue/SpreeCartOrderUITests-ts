import test, { expect, Locator, Page } from '@playwright/test'
export class OrderPage {
  page: Page;
  breadcrumbs: Locator[];
  title: Locator;
  price: Locator;

  inStock: Locator;

  detailNames: Locator[];
  detailValues: Locator[];

  decQBtn: Locator;
  incQBtn: Locator;
  quantity: Locator;

  addBtn: Locator;
  addMsg: Locator;
  checkoutLink: Locator;
  cartLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.title = page.locator("//h1")
    this.price = page.locator("//span[@class='price selling']")

    this.inStock = page.locator("//span[@class='add-to-cart-form-general-availability-value']")


    this.decQBtn = page.locator("//button[contains(@class, 'quantity-select-decrease')]")
    this.incQBtn = page.locator("//button[contains(@class, 'quantity-select-increase')]")
    this.quantity = page.locator("input[name='quantity']")

    this.addBtn = page.locator('#add-to-cart-button')
    this.addMsg = page.locator("//div[contains(@class,'product-added-modal-message')]")
    this.checkoutLink = page.locator("//a[contains(text(),'Checkout')]")
    this.cartLink = page.locator("//a[contains(text(),'View cart')]")
  }

  async finishsetup(productName: string) {
    await this.page.getByText(productName).nth(0).click();
    this.breadcrumbs = await this.page.locator("//main/div/nav/ol/li").all()
    this.detailNames = await this.page.locator("//ul/li/div/span").all()
    this.detailValues = await this.page.locator("//ul/li/div/span/following-sibling::div/ol").all()
  }

  async verifyUrl() { expect(this.page.url()).toContain("http://demo.spreecommerce.org/products/") }
  async verifyBreadcrumb(productName: string) { await expect(this.breadcrumbs[this.breadcrumbs.length - 1]).toContainText(productName) }
  async verifyTitle(productName: string) { await expect(this.title).toContainText(productName) }

  async costToDouble(cost: Locator) { return parseFloat((await cost.innerText()).replace(",", "").substring(1)); }
  async verifyPrice(tgtP: GLfloat) { expect(tgtP).toBe(await this.costToDouble(this.price)) }

  async verifyAvail() { await expect(this.inStock).toHaveText("In Stock") }

  async verifyColorAvail(color: string) {
    for (let i = 0; i < this.detailNames.length; i++) {
      if ((await this.detailNames[i].innerText()) == "COLOR") {
        let colorhtml = (await this.detailValues[i].innerHTML())
        expect(colorhtml).toBeTruthy()
        expect(colorhtml).toContain("aria-label=\"" + color + "\"")
        return
      }
    }
    expect(null).toBeTruthy()
  }
  async clickColor(color: string) {
    for (let i = 0; i < this.detailNames.length; i++) {
      if ((await this.detailNames[i].innerText()) == "COLOR") {
        await this.page.locator("//input[@aria-label='" + color + "']//parent::*").nth(0).click()
        //				String value = driver.findElement(By.xpath("//input[@aria-label='"+color+"']")).getAttribute("value");
      }
    }
    //		return true; // would have to use javascript to check which is selected (can't see an html difference)
  }
  async verifySizeAvail(size: string) {
    for (let i = 0; i < this.detailNames.length; i++) {
      if ((await this.detailNames[i].innerText()) == "SIZE") {
        let sizehtml = (await this.detailValues[i].innerText())
        expect(sizehtml).toBeTruthy()
        expect(sizehtml).toContain(size)
        return
      }
    }
    expect(null).toBeTruthy()
  }
  async clickSize(size: string) {
    for (let i = 0; i < this.detailNames.length; i++) {
      if ((await this.detailNames[i].innerText()) == "SIZE") {
        await this.page.locator("//label[@aria-label='" + size + "']//parent::*").nth(0).click()
        //				String value = driver.findElement(By.xpath("//input[@aria-label='"+color+"']")).getAttribute("value");
      }
    }
    //		return true; // would have to use javascript to check which is selected (can't see an html difference)
  }

  async verifyQuantity(q: number) {
    await this.page.waitForTimeout(2000);
    let qVal: string = await this.quantity.inputValue();
    if (qVal == null)
      expect(null).toBeTruthy()
    else
      expect(parseInt(qVal)).toBe(q)
  }
  async incQ() {
    let prvQ = await this.quantity.inputValue()
    if (prvQ == null)
      expect(null).toBeTruthy()
    else {
      await this.incQBtn.click();
      await this.verifyQuantity(parseInt(prvQ) + 1)
    }
  }
  async decQ() {
    let prvQ = await this.quantity.inputValue()
    if (prvQ == null)
      expect(null).toBeTruthy()
    else {
      await this.decQBtn.click();
      await this.verifyQuantity(parseInt(prvQ) - 1)
    }
  }

  async addToCart() {
    await this.addBtn.click();
    await this.page.waitForTimeout(3000);
    await expect(this.addMsg).toContainText("Added to cart successfully!")
    await expect(this.checkoutLink).toBeVisible();
    await expect(this.cartLink).toBeVisible();
  }

  async clickCheckout() {
    await this.checkoutLink.click();
    await this.page.waitForTimeout(2000);
    await expect(this.page).toHaveURL("http://demo.spreecommerce.org/checkout/registration");
  }
  async clickCart() {
    await this.cartLink.click();
    await this.page.waitForTimeout(2000);
    await expect(this.page).toHaveURL("http://demo.spreecommerce.org/cart");
  }
}