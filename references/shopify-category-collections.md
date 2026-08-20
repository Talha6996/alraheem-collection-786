# Shopify Category Collection Management

The seven category collections are manually managed: `JEWELLERY` (`jewellery`), `HANDBAGS` (`handbags`), `LADIES SUIT` (`ladies-suit`), `MENS SUIT` (`mens-suit`), `BRANDED KARA` (`branded-kara`), `BRIDAL SETS` (`bridal-sets`), and `MENS BRACELET` (`mens-bracelet`). Shopify Admin verification on 2026-08-19 confirmed that each has no automatic rule set.

When uploading a product in Shopify, select its intended **Collection** manually. The storefront now queries the matching manual Shopify collection by handle, so collection assignment alone determines which website category displays the product. You may use **Product type** for Shopify’s internal organization, but it is no longer required for the website category filter.

This direct collection mapping keeps Shopify product organization and the storefront category page aligned. The existing White Stone Kara product has been preserved in the new manual `BRANDED KARA` collection.

## Storefront availability check

Shopify Admin initially showed two manually included products in `BRANDED KARA`, but the collection itself was published to **0 channels**. This explained why a Storefront API query by `branded-kara` returned no products even though the manual assignment was correct. Following owner confirmation, all seven category collections were published to the **Manus** sales channel. A live `branded-kara` Storefront API query and the corresponding shop page then returned the two manually assigned products.

Source:

- https://help.shopify.com/en/manual/products/collections/manual-shopify-collection
