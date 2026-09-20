import type { SanityImageSource } from "@sanity/image-url";

export type PortableTextValue = Array<{
  _key?: string;
  _type: string;
  [key: string]: unknown;
}>;

export type CmsLinkValue = {
  _key?: string;
  label?: string | null;
  linkType?: "path" | "url" | null;
  path?: string | null;
  url?: string | null;
};

export type Navbar = {
  items?: CmsLinkValue[] | null;
};

export type GenreRef = {
  _id: string;
  name: string;
  slug: string | null;
  generatePage?: boolean | null;
};

export type PostCardData = {
  _id: string;
  title: string;
  slug: string | null;
  publishedAt?: string | null;
  image?: SanityImageSource | null;
};

export type AlbumCardData = {
  _id: string;
  title: string;
  slug: string | null;
  coverImage?: SanityImageSource | null;
  releaseDate?: string | null;
  generatePage?: boolean | null;
  artist?: { name?: string | null } | null;
};

export type ArtistCardData = {
  _id: string;
  name: string;
  slug: string | null;
  image?: SanityImageSource | null;
  generatePage?: boolean | null;
};

export type HeroBlock = {
  _key: string;
  _type: "hero";
  heading: string;
  text?: string | null;
  image?: SanityImageSource | null;
  button?: CmsLinkValue | null;
};

export type RichTextBlock = {
  _key: string;
  _type: "richText";
  content?: PortableTextValue | null;
};

export type FeaturedPostsBlock = {
  _key: string;
  _type: "featuredPosts";
  heading?: string | null;
  posts?: PostCardData[] | null;
};

export type FeaturedAlbumsBlock = {
  _key: string;
  _type: "featuredAlbums";
  heading?: string | null;
  albums?: AlbumCardData[] | null;
};

export type FeaturedArtistsBlock = {
  _key: string;
  _type: "featuredArtists";
  heading?: string | null;
  artists?: ArtistCardData[] | null;
};

export type PageBuilderBlock =
  | HeroBlock
  | RichTextBlock
  | FeaturedPostsBlock
  | FeaturedAlbumsBlock
  | FeaturedArtistsBlock;

export type Page = {
  _id: string;
  title: string;
  slug?: string | null;
  pageBuilder?: PageBuilderBlock[] | null;
};

export type PostSong = {
  title: string;
  duration?: string | null;
  links?: SongLinks | null;
  artist?: { name?: string | null; slug?: string | null; generatePage?: boolean | null } | null;
  album?: { title?: string | null; slug?: string | null; generatePage?: boolean | null } | null;
  genres?: GenreRef[] | null;
};

export type Post = PostCardData & {
  body?: PortableTextValue | null;
  song?: PostSong | null;
};

export type PostsIndexData = {
  posts: PostCardData[];
  total: number;
};

export type Artist = ArtistCardData & {
  bio?: PortableTextValue | null;
  website?: string | null;
  genres?: GenreRef[] | null;
  albums?: AlbumCardData[] | null;
};

export type SongLinks = {
  youtube?: string | null;
  spotify?: string | null;
  appleMusic?: string | null;
};

export type AlbumTrack = {
  _id: string;
  title: string;
  slug: string | null;
  trackNumber?: number | null;
  duration?: string | null;
  review?: PortableTextValue | null;
  links?: SongLinks | null;
};

export type Album = AlbumCardData & {
  description?: PortableTextValue | null;
  artist?: ArtistCardData | null;
  genres?: GenreRef[] | null;
  tracklist?: AlbumTrack[] | null;
};

export type Genre = GenreRef & {
  description?: string | null;
  albums?: AlbumCardData[] | null;
  artists?: ArtistCardData[] | null;
};

export type StaticSlugPath = {
  params: { slug: string };
};
