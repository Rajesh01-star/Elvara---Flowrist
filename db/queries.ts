import { productsTable } from "@/db/schema";
import { desc, asc } from "drizzle-orm";

/** Shared select fields for product queries */
export const PRODUCT_SELECT_FIELDS = {
  id: productsTable.id,
  title: productsTable.title,
  description: productsTable.description,
  price: productsTable.price,
  url: productsTable.url,
  aspect: productsTable.aspect,
  imageUrl: productsTable.imageUrl,
  fileUrl: productsTable.fileUrl,
  thumbnails: productsTable.thumbnails,
  activeThumbnailIndex: productsTable.activeThumbnailIndex,
  assetType: productsTable.assetType,
  sourceLink: productsTable.sourceLink,
  tags: productsTable.tags,
  references: productsTable.references,
  userId: productsTable.userId,
  views: productsTable.views,
  createdAt: productsTable.createdAt,
  updatedAt: productsTable.updatedAt,
};

export const POST_SELECT_FIELDS = PRODUCT_SELECT_FIELDS;

/** Public queries exclude sensitive fields */
export const PRODUCT_PUBLIC_FIELDS = {
  id: productsTable.id,
  title: productsTable.title,
  description: productsTable.description,
  price: productsTable.price,
  url: productsTable.url,
  aspect: productsTable.aspect,
  imageUrl: productsTable.imageUrl,
  thumbnails: productsTable.thumbnails,
  activeThumbnailIndex: productsTable.activeThumbnailIndex,
  assetType: productsTable.assetType,
  sourceLink: productsTable.sourceLink,
  tags: productsTable.tags,
  references: productsTable.references,
  userId: productsTable.userId,
  views: productsTable.views,
  createdAt: productsTable.createdAt,
  updatedAt: productsTable.updatedAt,
};

export const POST_PUBLIC_FIELDS = PRODUCT_PUBLIC_FIELDS;

/** Resolve sort string to Drizzle order-by clause */
export function getOrderByClause(sort: string) {
  switch (sort) {
    case "newest":
      return desc(productsTable.createdAt);
    case "oldest":
      return asc(productsTable.createdAt);
    case "atoz":
      return asc(productsTable.title);
    case "price-low":
      return asc(productsTable.price);
    case "price-high":
      return desc(productsTable.price);
    case "views":
    default:
      return desc(productsTable.views);
  }
}
