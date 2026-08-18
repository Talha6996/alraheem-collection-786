# Official Shopify Shipping-Rate Guidance

## Source findings

Shopify explains that checkout shipping charges can come from merchant-defined flat rates, free-shipping rules, or carrier-calculated rates. Shipping profiles can apply different rules by product and fulfillment location, while shipping zones group destinations that share a rate. Source: <https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates>.

Shopify’s current shipping-profile path is **Settings → Shipping and delivery → General profile**. Within each shipping zone, a merchant can choose **Add shipping option**, configure the desired rate, and save. Custom shipping profiles can apply different rules to specific products. Source: <https://help.shopify.com/en/manual/fulfillment/setup/shipping-profiles/setting-up-shipping-profiles>.

Shopify also warns that checkout can combine separate rates when products ship from different profiles or fulfillment locations. Its troubleshooting guidance says to verify product profiles, fulfillment locations, shipping zones, rate conditions, product weights, carrier-package dimensions, and that the customer’s country belongs to an active market. Source: <https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates/troubleshooting>.

## Browser verification

The official help pages were opened and confirm that the relevant merchant path is **Shopify admin → Settings → Shipping and delivery → Shipping profiles → General profile**, followed by the relevant shipping zone and **Add shipping option**. The official troubleshooting guide separately confirms that unexpectedly high charges can result from combined rates across profiles or fulfillment locations, as well as rate rules that match the test cart.
