# Current Favourites Removal Verification

## Post-change checks

The homepage was visually checked after the removal. It now transitions from the seven-category grid directly into the bridal editorial section, with no **Current favourites** heading or product-grid section present.

The **White Stone Kara** product detail route was checked after the homepage edit. Its Branded Kara label, price, product content, saved-item control, and direct WhatsApp order link rendered correctly. The current variant is unavailable for secure checkout because its Shopify inventory is not sellable; its WhatsApp inquiry flow remains available as designed.

The **Your shopping bag** route was also checked and rendered its expected empty-bag state with a working **Shop the edit** route. The automated commerce tests cover cart creation and error handling. Together with the product-detail WhatsApp link check, this confirms the page removal did not disturb browsing, bag access, or the available direct-order path.

Finally, the **Branded Kara** filtered shop route was checked after the homepage edit. It settled with one listed product, **White Stone Kara**, and its link to the matching product detail page. This confirms category-filtered browsing still works after removing the homepage section.
