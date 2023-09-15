import { test, expect } from '@playwright/test';
import { CartPage } from '.././models/CartPage';
import { OrderPage } from '../models/OrderPage';

test.describe('Cart Page', () => {
  let cartPage: CartPage;
  test.setTimeout(120000);
  test.beforeEach(async ({ page }) => {
    await page.goto("http://demo.spreecommerce.org");
		await page.locator("#account-button").click();
		await page.locator("//a[text()='LOGIN']").click();
		//log in
		await page.waitForTimeout(2000);
		await page.locator("//*[@name='spree_user[email]']").fill("c@s.com");
		await page.locator("//*[@name='spree_user[password]']").fill("123456");
		await page.locator("//*[@name='commit']").click();


    
    await page.goto('http://demo.spreecommerce.org/products/sports-bra-low-support?taxon_id=4');
    let orderPage = new OrderPage(page)
    await orderPage.finishsetup('Sports Bra Low Support')
    await orderPage.clickColor("grey"); //no auto check
    await orderPage.clickSize("XS"); 
    await orderPage.addToCart()
    await orderPage.clickCart()

    await page.waitForTimeout(3000)
    cartPage = new CartPage(page)
    await cartPage.finishsetup()

		//ALSO: (easier to just not mess with it bc it kinda takes a long time to clear the cart and add items 
		//make sure no other Sports Bra Low Support  + 1 other item is in the cart
  });

  test('Test', async ({ page }) => {
    await cartPage.verifyUrl()
    await cartPage.verifyBreadcrumb()
    await cartPage.verifyTitle()

    await cartPage.verifyCosts();
		await cartPage.incQ("Sports Bra Low Support");
		await page.waitForTimeout(1000);
		await cartPage.verifyCosts();
		await cartPage.decQ("Sports Bra Low Support");
		await page.waitForTimeout(1000);
		await cartPage.verifyCosts();
//		await cartPage.setQ("Sports Bra Low Support", "5")); //sendKeys not working
    await page.waitForTimeout(1000);
		await cartPage.verifyCosts();

		// assertFalse(cart.deleteItem("lalala"));
		await cartPage.verifyDetails("Sports Bra Low Support", 
				 {"SIZE": "XS", "COLOR":"GREY"} );
    await cartPage.deleteItem("Sports Bra Low Support");
		// assertFalse(cart.addPromoCode("lala"));
		
		await cartPage.clickCheckout();
    await page.goBack(); //popup not showing
		await cartPage.clickShop();
  });
})