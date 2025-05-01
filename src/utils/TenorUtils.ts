export interface TenorPostMediaFormat {
    url: string;
    duration: number;
    preview: string;
    dims: [number, number];
    size: number;
}

export type MediaFormat =
    | 'gif'
    | 'mediumgif'
    | 'tinygif'
    | 'nanogif'
    | 'mp4'
    | 'loopedmp4'
    | 'tinymp4'
    | 'nanomp4'
    | 'webm'
    | 'tinywebm'
    | 'nanowebm'
    | 'webp_transparent'
    | 'tinywebp_transparent'
    | 'nanowebp_transparent'
    | 'gif_transparent'
    | 'tinygif_transparent'
    | 'nanogif_transparent';

export interface TenorPost {
    id: string;
    title: string;
    media_formats: {
        [format in MediaFormat]: TenorPostMediaFormat | undefined;
    };
    created: number;
    itemurl: string;
    url: string;
    tags: string[];
    flags: string[];
    hasaudio: boolean;
    content_description: string;
    content_description_source: string;
}

export interface TenorPostsResponse {
    results: TenorPost[];
}

export async function getTenorDataFromPostID(
    postID: string,
    mediaFormats?: MediaFormat[],
): Promise<TenorPost> {
    const baseURL = `https://tenor.googleapis.com/v2/posts?ids=${postID}&key=${process
        .env.TENOR_API_KEY!}`;
    const tenorResponse: TenorPostsResponse = await fetch(
        mediaFormats ? baseURL + `&${mediaFormats.join(',')}` : baseURL,
    ).then((response) => response.json());
    return tenorResponse.results[0];
}
