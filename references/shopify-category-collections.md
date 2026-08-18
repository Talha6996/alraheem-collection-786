# Shopify Category Collection Rules

The seven collections in this storefront are intended to match products by **exact product type**. The required values are `Jewellery`, `Handbags`, `Ladies Suit`, `Mens Suit`, `Branded Kara`, `Bridal Sets`, and `Mens Bracelet`.

Each automatic collection should use a product-type condition with an exact-equality relation and one matching value. This matches the storefront category configuration in `client/src/lib/storeCategories.ts` and means a newly created product appears in the matching website category when its Shopify **Product type** is set to the corresponding value.

Shopify’s current Admin GraphQL collection model supports product-type inclusion conditions through `CollectionSourceInclusionConditionInput.productType`, with `matchType`, `relation`, and `values` fields. Shopify documentation also confirms that exact product type matching is available for collection conditions. The official collection creation documentation notes that collections are unpublished by default, so availability must be checked after creation.

Sources:

- https://shopify.dev/docs/api/admin-graphql/latest/mutations/collectionCreate
- https://shopify.dev/docs/api/admin-graphql/latest/input-objects/CollectionSourceInclusionConditionProductTypeInput
- https://help.shopify.com/en/manual/products/collections/conditions
