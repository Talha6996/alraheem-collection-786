export type StoreCategory = {
  name: string;
  collectionHandle: string;
  productType: string;
  href: string;
  image: string;
  sourceFile: string;
  position: string;
};

export const STORE_CATEGORIES: readonly StoreCategory[] = [
  {
    name: "JEWELLERY",
    collectionHandle: "jewellery",
    productType: "Jewellery",
    href: "/shop?category=jewellery",
    image: "/manus-storage/jewellery_abfdc585.png",
    sourceFile: "pasted_file_nPgAJ0_image.png",
    position: "object-center",
  },
  {
    name: "HANDBAGS",
    collectionHandle: "handbags",
    productType: "Handbags",
    href: "/shop?category=handbags",
    image: "/manus-storage/handbags_714f79f8.png",
    sourceFile: "pasted_file_IP8Ekh_image.png",
    position: "object-center",
  },
  {
    name: "LADIES SUIT",
    collectionHandle: "ladies-suit",
    productType: "Ladies Suit",
    href: "/shop?category=ladies-suit",
    image: "/manus-storage/ladies-suit_cf9ceb22.png",
    sourceFile: "pasted_file_wslK6s_image.png",
    position: "object-center",
  },
  {
    name: "MENS SUIT",
    collectionHandle: "mens-suit",
    productType: "Mens Suit",
    href: "/shop?category=mens-suit",
    image: "/manus-storage/mens-suit_9ade052d.png",
    sourceFile: "pasted_file_775g5P_image.png",
    position: "object-center",
  },
  {
    name: "BRANDED KARA",
    collectionHandle: "branded-kara",
    productType: "Branded Kara",
    href: "/shop?category=branded-kara",
    image: "/manus-storage/branded-kara_9061c868.png",
    sourceFile: "pasted_file_dHdFi1_image.png",
    position: "object-center",
  },
  {
    name: "BRIDAL SETS",
    collectionHandle: "bridal-sets",
    productType: "Bridal Sets",
    href: "/shop?category=bridal-sets",
    image: "/manus-storage/bridal-sets_50d4a6e8.png",
    sourceFile: "pasted_file_vaepvz_image.png",
    position: "object-center",
  },
  {
    name: "MENS BRACELET",
    collectionHandle: "mens-bracelet",
    productType: "Mens Bracelet",
    href: "/shop?category=mens-bracelet",
    image: "/manus-storage/mens-bracelet_00a6e202.png",
    sourceFile: "pasted_file_aRx2FQ_image.png",
    position: "object-center",
  },
];

export function findStoreCategory(value: string) {
  const normalizedValue = value.trim().toLowerCase();
  return STORE_CATEGORIES.find(category =>
    category.collectionHandle === normalizedValue ||
    category.productType.toLowerCase() === normalizedValue ||
    category.name.toLowerCase() === normalizedValue
  );
}

export function isStoreCategory(value: string) {
  return Boolean(findStoreCategory(value));
}
