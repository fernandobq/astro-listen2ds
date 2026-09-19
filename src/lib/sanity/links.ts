import type { CmsLinkValue } from "./types";

export type ResolvedCmsLink = {
  label: string;
  href: string;
  external: boolean;
};

export function resolveCmsLink(
  link?: CmsLinkValue | null,
): ResolvedCmsLink | null {
  if (!link?.label) return null;

  if (link.linkType === "path" && link.path?.startsWith("/")) {
    return { label: link.label, href: link.path, external: false };
  }

  if (link.linkType === "url" && link.url) {
    return { label: link.label, href: link.url, external: true };
  }

  return null;
}
