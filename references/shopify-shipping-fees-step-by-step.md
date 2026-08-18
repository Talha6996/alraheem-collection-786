# Correcting High Shopify Checkout Shipping Fees

This guide uses Shopify’s current official shipping documentation. Shopify is gradually moving some stores from **shipping profiles** to **shipping options by market**; however, Shopify states that most stores still use shipping profiles and keep their existing setup until an upgrade occurs. The usual path below therefore starts with **Settings → Shipping and delivery**. [1]

> **Important:** Do not change rates on the website itself. The checkout displays the rates configured in Shopify. If the Shopify mobile app does not show the full shipping settings, open `admin.shopify.com` in your phone’s browser and sign in; the official instructions refer to Shopify admin.

## Part A — Find the rate that is causing the high charge

| Step | What to do in Shopify | What to look for |
|---|---|---|
| 1 | Open **Shopify admin** and select the correct store. | Confirm that you are editing **ALRAHEEM COLLECTION 786**. |
| 2 | Go to **Settings → Shipping and delivery**. | This is Shopify’s official starting point for rates and profiles. [2] |
| 3 | In **Shipping profiles**, open **General profile**. | This profile normally contains products that are not in a custom profile. [2] |
| 4 | Find the delivery zone that includes your buyers, such as **Pakistan**. | A customer’s country must be in an active market and in a zone with a rate for checkout to calculate shipping correctly. [3] |
| 5 | Write down every rate shown in that zone before editing it. | Look for a high **Flat** rate, a **Weight** or **Order amount** range, or a **Carrier/app calculated** rate. |

Shopify rates can be **flat**, **price-based**, **weight-based**, or **carrier/app calculated**. Carrier rates use order details such as weight, package dimensions, and destination, so they cannot be meaningfully confirmed until checkout has a real delivery address. [1] [4]

## Part B — Set a simple fixed rate for Pakistan

Use this option if you want one predictable delivery amount. Enter the amount you have decided to charge; the example names below are only labels, not recommended prices.

1. In the **Pakistan** shipping zone, select **Add shipping option**.
2. Give the option a clear customer-facing name, for example **Standard delivery**.
3. From **Rate type**, choose **Flat**.
4. Enter the shipping price you want customers to pay in the **Price** field.
5. If useful, add delivery details such as *3–5 business days*.
6. Select **Done**, then select **Save**.

Shopify confirms that the option name is displayed at checkout and that a flat rate can be set as a fixed price or made free by entering `0` or leaving the price empty. [4]

## Part C — Offer free delivery above an order value (optional)

If you want smaller orders to pay delivery but larger orders to receive free delivery, use a price-based rate.

1. In the same Pakistan shipping zone, select **Add shipping option**.
2. Name it, for example **Free delivery on qualifying orders**.
3. Choose **Order amount** as the rate type.
4. Enter the minimum order value you want to qualify for free delivery.
5. Set the shipping price to `0`, or select **Offer free shipping** and enter the qualifying minimum.
6. Select **Done**, then **Save**.

Shopify applies order-amount conditions to the cart value after discounts and before taxes. It also supports a minimum order amount for a free-shipping option. [4] [3]

## Part D — Remove or correct the old expensive rate

After a lower or corrected option is saved, open the old high-rate entry. If it is no longer wanted, delete it; if it is intended only for heavier orders or a special area, edit its weight, order-value, or zone condition so that ordinary orders do not match it. Keep at least one valid rate for the Pakistan zone and the cart conditions you intend to serve. Shopify warns that checkout must match a rate’s zone and conditions in order to display it. [3]

## Part E — Check for hidden reasons that add rates together

If the amount is still too high after correcting the General profile, complete these checks:

| Check | Shopify path | Why it matters |
|---|---|---|
| Custom profiles | **Settings → Shipping and delivery → Shipping profiles** | Products in different profiles or fulfillment locations can have their separate rates combined into one checkout charge. [2] [3] |
| Product assignment | Open each custom profile and inspect its products. | A product or variant can belong to only one shipping profile at a time. [2] |
| Weights and package | **Products → product → Shipping**, then check the default package in shipping settings. | Wrong product weights or package dimensions can cause unexpected carrier-calculated rates. [3] [4] |
| Fulfillment origin | **Settings → Locations** | The active fulfillment location needs a valid address and online-order fulfillment enabled. [3] |
| Market | **Markets → Pakistan → Manage → Shipping** | The customer’s country needs to belong to an active market with applicable rates. [3] |

## Part F — Test the exact customer experience

1. Save every change in Shopify.
2. Open your website in a private/incognito browser window.
3. Add a physical product to the bag and continue to checkout.
4. Enter a **real Pakistan city and postal code** that you expect to serve.
5. Confirm the selected delivery option and fee match what you configured.
6. Do **not** place or pay for the test order unless you intend to create a real order.

This address test is important: Shopify states that rates depend on the shipping profile, fulfillment location, shipping zone, product details, packaging, market, and—in the case of carrier-calculated shipping—the fulfillment and customer addresses. [3]

## If the fee is still high

Send a screenshot of the **Pakistan** zone and its listed rates in **Settings → Shipping and delivery**, plus a checkout screenshot showing the high fee *after a complete test address is entered*. That will show whether the source is a flat rate, a custom profile, a combined rate, or a carrier/app calculation.

## References

[1]: https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates "Shopify Help Center — Shipping rates"
[2]: https://help.shopify.com/en/manual/fulfillment/setup/shipping-profiles/setting-up-shipping-profiles "Shopify Help Center — Setting up and managing shipping profiles"
[3]: https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates/troubleshooting "Shopify Help Center — Troubleshooting and testing shipping rates"
[4]: https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates/setting-up-shipping-rates "Shopify Help Center — Setting up shipping zones and rates"
