import { defineQuery } from "groq";

const pageBuilderProjection = /* groq */ `
  pageBuilder[]{
    _key,
    _type,
    ...,
    _type == "hero" => {
      button { label, linkType, path, url }
    },
    _type == "featuredPosts" => {
      posts[]->{ _id, title, "slug": slug.current, publishedAt, image }
    },
    _type == "featuredAlbums" => {
      albums[]->{
        _id,
        title,
        "slug": slug.current,
        coverImage,
        generatePage,
        artist->{ name }
      }
    },
    _type == "featuredArtists" => {
      artists[]->{ _id, name, "slug": slug.current, image, generatePage }
    }
  }
`;

export const NAVBAR_QUERY = defineQuery(/* groq */ `
  *[_id == "navbar"][0]{
    items[]{ _key, label, linkType, path, url }
  }
`);

export const HOME_QUERY = defineQuery(/* groq */ `
  *[_id == "home"][0]{
    _id,
    title,
    ${pageBuilderProjection}
  }
`);

export const PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "page" && slug.current == $slug && _id != "home"][0]{
    _id,
    title,
    "slug": slug.current,
    ${pageBuilderProjection}
  }
`);

export const PAGE_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "page" && defined(slug.current) && _id != "home" && !(slug.current in ["posts", "artists", "albums", "genres"])]{
    "params": { "slug": slug.current }
  }
`);

export const POSTS_QUERY = defineQuery(/* groq */ `
  {
    "posts": *[_type == "post" && defined(slug.current) && publishedAt <= now()]
      | order(publishedAt desc)[0...12]{
        _id,
        title,
        "slug": slug.current,
        publishedAt,
        image
      },
    "total": count(*[_type == "post" && defined(slug.current) && publishedAt <= now()])
  }
`);

export const POST_QUERY = defineQuery(/* groq */ `
  *[_type == "post" && slug.current == $slug && publishedAt <= now()][0]{
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    image,
    body,
    song->{
      title,
      duration,
      links,
      artist->{ name, "slug": slug.current, generatePage },
      album->{ title, "slug": slug.current, generatePage },
      genres[]->{ _id, name, "slug": slug.current, generatePage }
    }
  }
`);

export const POST_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "post" && defined(slug.current) && publishedAt <= now()]{
    "params": { "slug": slug.current }
  }
`);

export const ARTIST_QUERY = defineQuery(/* groq */ `
  *[_type == "artist" && slug.current == $slug && generatePage == true][0]{
    _id,
    name,
    "slug": slug.current,
    image,
    bio,
    website,
    generatePage,
    genres[]->{ _id, name, "slug": slug.current, generatePage },
    "albums": *[_type == "album" && artist._ref == ^._id] | order(releaseDate desc){
      _id, title, "slug": slug.current, coverImage, releaseDate, generatePage
    }
  }
`);

export const ARTIST_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "artist" && generatePage == true && defined(slug.current)]{
    "params": { "slug": slug.current }
  }
`);

export const ALBUM_QUERY = defineQuery(/* groq */ `
  *[_type == "album" && slug.current == $slug && generatePage == true][0]{
    _id,
    title,
    "slug": slug.current,
    releaseDate,
    coverImage,
    description,
    generatePage,
    artist->{ _id, name, "slug": slug.current, image, generatePage },
    genres[]->{ _id, name, "slug": slug.current, generatePage },
    "tracklist": coalesce(
      tracklist[]->{ _id, title, "slug": slug.current, trackNumber, duration, review, links },
      *[_type == "song" && album._ref == ^._id]{ _id, title, "slug": slug.current, trackNumber, duration, review, links }
    ) | order(trackNumber asc)
  }
`);

export const ALBUM_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "album" && generatePage == true && defined(slug.current)]{
    "params": { "slug": slug.current }
  }
`);

export const GENRE_QUERY = defineQuery(/* groq */ `
  *[_type == "genre" && slug.current == $slug && generatePage == true][0]{
    _id,
    name,
    "slug": slug.current,
    description,
    generatePage,
    "albums": *[_type == "album" && references(^._id)]{
      _id, title, "slug": slug.current, coverImage, generatePage, artist->{ name }
    },
    "artists": *[_type == "artist" && references(^._id)]{
      _id, name, "slug": slug.current, image, generatePage
    }
  }
`);

export const GENRE_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "genre" && generatePage == true && defined(slug.current)]{
    "params": { "slug": slug.current }
  }
`);

export const ALBUMS_QUERY = defineQuery(/* groq */ `
  *[_type == "album" && generatePage == true && defined(slug.current)]
    | order(releaseDate desc){
      _id,
      title,
      "slug": slug.current,
      coverImage,
      releaseDate,
      generatePage,
      artist->{ name }
    }
`);

export const ARTISTS_QUERY = defineQuery(/* groq */ `
  *[_type == "artist" && generatePage == true && defined(slug.current)]
    | order(name asc){
      _id,
      name,
      "slug": slug.current,
      image,
      generatePage
    }
`);
