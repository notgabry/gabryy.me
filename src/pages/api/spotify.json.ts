export const prerender = false
import type { APIRoute } from 'astro'
import type { MusicData } from '../../types'

const LASTFM = 'https://ws.audioscrobbler.com/2.0/'
const KEY = import.meta.env.Lastfm
const USER = 'notgabry'

const lastfm = <T>(params: string) =>
    fetch(`${LASTFM}${params}&user=${USER}&api_key=${KEY}&format=json`)
        .then((r) => r.json() as T)
        .catch(() => null)

const deezerImg = (query: string): Promise<string> =>
    fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(query)}&limit=1`)
        .then((r) => r.json())
        .then((d) => d?.data?.[0]?.picture_medium ?? d?.data?.[0]?.picture_small ?? '')
        .catch(() => '')

const deezerTrackImg = (track: string, artist: string): Promise<string> =>
    fetch(`https://api.deezer.com/search?q=${encodeURIComponent(`${track} ${artist}`)}&limit=1`)
        .then((r) => r.json())
        .then((d) => d?.data?.[0]?.album?.cover_medium ?? d?.data?.[0]?.album?.cover_small ?? '')
        .catch(() => '')

const isLastfmPlaceholder = (url: string) => !url || url.includes('2a96cbd8b46e442fc41c2b86b821562f')

async function enrichWithDeezer<T extends { image: string; name: string }>(
    items: T[],
    getQuery: (item: T) => string
) {
    return Promise.all(
        items.map(async (item) => {
            if (!isLastfmPlaceholder(item.image)) return item
            const img = await deezerImg(getQuery(item))
            if (img) item.image = img
            return item
        })
    )
}

export const GET: APIRoute = async () => {
    const monthStart = Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000)

    const [recentRes, topArtistsRes, monthRes] = await Promise.all([
        lastfm<any>('?method=user.getrecenttracks&limit=1'),
        lastfm<any>('?method=user.gettopartists&period=1month&limit=8'),
        lastfm<any>(`?method=user.getrecenttracks&from=${monthStart}&limit=1`)
    ])

    const track = recentRes?.recenttracks?.track[0]

    let topArtists: MusicData['topArtists'] = (topArtistsRes?.topartists?.artist ?? []).map((a: any) => ({
        name: a.name, url: a.url, image: a.image?.[2]?.['#text'] ?? '', playcount: parseInt(a.playcount) || 0
    }))

    topArtists = await enrichWithDeezer(topArtists, (a) => a.name)

    let recentImage = track?.image[3]?.['#text'] ?? ''
    if (isLastfmPlaceholder(recentImage) && track?.name && track?.artist?.['#text']) {
        recentImage = await deezerTrackImg(track.name, track.artist['#text']) || recentImage
    }

    const data: MusicData = {
        recent: {
            image: recentImage,
            name: track?.name ?? '',
            url: track?.url ?? '',
            artist: track?.artist?.['#text'] ?? '',
            nowplaying: track?.['@attr']?.nowplaying ?? false
        },
        topArtists,
        monthlyScrobbles: parseInt(monthRes?.recenttracks?.['@attr']?.total) || 0
    }

    return new Response(JSON.stringify(data))
}
