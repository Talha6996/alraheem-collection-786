export type StoreCategory = {
  name: string;
  productType: string;
  href: string;
  image: string;
  sourceFile: string;
  position: string;
};

export const STORE_CATEGORIES: readonly StoreCategory[] = [
  {
    name: "JEWELLERY",
    productType: "Jewellery",
    href: "/shop?category=Jewellery",
    image: "/manus-storage/jewellery_abfdc585.png",
    sourceFile: "pasted_file_nPgAJ0_image.png",
    position: "object-center",
  },
  {
    name: "HANDBAGS",
    productType: "Handbags",
    href: "/shop?category=Handbags",
    image: "/manus-storage/handbags_714f79f8.png",
    sourceFile: "pasted_file_IP8Ekh_image.png",
    position: "object-center",
  },
  {
    name: "LADIES SUIT",
    productType: "Ladies Suit",
    href: "/shop?category=Ladies+Suit",
    image: "/manus-storage/ladies-suit_cf9ceb22.png",
    sourceFile: "pasted_file_wslK6s_image.png",
    position: "object-center",
  },
  {
    name: "MENS SUIT",
    productType: "Mens Suit",
    href: "/shop?category=Mens+Suit",
    image: "/manus-storage/mens-suit_9ade052d.png",
    sourceFile: "pasted_file_775g5P_image.png",
    position: "object-center",
  },
  {
    name: "BRANDED KARA",
    productType: "Branded Kara",
    href: "/shop?category=Branded+Kara",
    image: "/manus-storage/branded-kara_9061c868.png",
    sourceFile: "pasted_file_dHdFi1_image.png",
    position: "object-center",
  },
  {
    name: "BRIDAL SETS",
    productType: "Bridal Sets",
    href: "/shop?category=Bridal+Sets",
    image: "/manus-storage/bridal-sets_50d4a6e8.png",
    sourceFile: "pasted_file_vaepvz_image.png",
    position: "object-center",
  },
  {
    name: "MENS BRACELET",
    productType: "Mens Bracelet",
    href: "/shop?category=Mens+Bracelet",
    image: "/manus-storage/mens-bracelet_00a6e202.png",
    sourceFile: "pasted_file_aRx2FQ_image.png",
    position: "object-center",
  },
];

export function isStoreCategory(productType: string) {
  return STORE_CATEGORIES.some(category => category.productType === productType);
}
