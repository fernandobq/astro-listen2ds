import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { sanityClient } from "sanity:client";

const { projectId, dataset } = sanityClient.config();

const builder =
  projectId && dataset
    ? createImageUrlBuilder({ projectId, dataset })
    : null;

export function urlFor(source: SanityImageSource) {
  return builder?.image(source) ?? null;
}

function hasImageAsset(source: SanityImageSource) {
  if (typeof source === "string") return source.length > 0;
  if ("asset" in source) return Boolean(source.asset);
  if ("_ref" in source) return Boolean(source._ref);
  return false;
}

export function imageUrl(
  source: SanityImageSource | null | undefined,
  width: number,
  height?: number,
) {
  if (!source || !builder || !hasImageAsset(source)) return null;

  let image = builder.image(source).width(width);
  if (height !== undefined) {
    image = image.height(height);
  }

  return image.url();
}
