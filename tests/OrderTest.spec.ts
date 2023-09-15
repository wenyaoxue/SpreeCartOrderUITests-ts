import { test, expect } from '@playwright/test';
import { OrderPage } from '.././models/OrderPage';

test.describe('Order Page', () => {
  let orderPage: OrderPage;

  test.beforeEach(async ({ page }) => {
    await page.goto('http://demo.spreecommerce.org/products/sports-bra-low-support?taxon_id=4');

    orderPage = new OrderPage(page)
    await orderPage.finishsetup('Sports Bra Low Support')
  });

  test('Test', async ({ page }) => {
    await orderPage.verifyUrl()
    await orderPage.verifyBreadcrumb("Sports Bra Low Support")
    await orderPage.verifyTitle("Sports Bra Low Support")
    await orderPage.verifyPrice(63.99)
    await orderPage.verifyAvail()
    await orderPage.verifyColorAvail("grey")
    await orderPage.verifyColorAvail("pink")
    // await orderPage.verifyColorAvail("blue") //should fail, not sure if/how to test for that
    await orderPage.clickColor("grey"); //no auto check
    await orderPage.verifySizeAvail("XS")
    await orderPage.verifySizeAvail("S")
    await orderPage.verifySizeAvail("M")
    // await orderPage.verifySizeAvail("L") //should fail, not sure if/how to test for that
    await orderPage.clickSize("M"); //no auto check
    await orderPage.incQ()
    await orderPage.decQ()

    await orderPage.addToCart()
    await orderPage.clickCheckout()
    // await page.goBack(); //popup not showing
    await page.goto('http://demo.spreecommerce.org/products/sports-bra-low-support?taxon_id=4');
    await orderPage.clickSize("M"); //no auto check
    await orderPage.addToCart()
    await orderPage.clickCart()
  });
})