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

const deezer = (path: string) =>
    fetch(`https://api.deezer.com${path}`)
        .then((r) => r.json())
        .catch(() => ({}))

const artistImg = (name: string): Promise<string> =>
    deezer(`/search/artist?q=${encodeURIComponent(name)}&limit=1`)
        .then((d) => d?.data?.[0]?.picture_medium ?? d?.data?.[0]?.picture_small ?? '')

const trackImg = (track: string, artist: string): Promise<string> =>
    deezer(`/search?q=${encodeURIComponent(`${track} ${artist}`)}&limit=1`)
        .then((d) => d?.data?.[0]?.album?.cover_medium ?? d?.data?.[0]?.album?.cover_small ?? '')

export const GET: APIRoute = async () => {
    const monthStart = Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000)

    const [recentRes, topArtistsRes, monthRes] = await Promise.all([
        lastfm<any>('?method=user.getrecenttracks&limit=1'),
        lastfm<any>('?method=user.gettopartists&period=1month&limit=8'),
        lastfm<any>(`?method=user.getrecenttracks&from=${monthStart}&limit=1`)
    ])

    const track = recentRes?.recenttracks?.track[0]

    const rawArtists: { name: string; url: string; playcount: number }[] = (topArtistsRes?.topartists?.artist ?? []).map((a: any) => ({
        name: a.name, url: a.url, playcount: parseInt(a.playcount) || 0
    }))

    const [topArtists, recentImage] = await Promise.all([
        Promise.all(rawArtists.map(async (a) => ({
            ...a,
            image: await artistImg(a.name)
        }))),
        track?.name && track?.artist?.['#text']
            ? trackImg(track.name, track.artist['#text'])
            : Promise.resolve('')
    ])

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
