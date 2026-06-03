export const prerender = false
import type { APIRoute } from 'astro'
import type { MusicData } from '../../types'

const LASTFM = 'https://ws.audioscrobbler.com/2.0/'
const KEY = import.meta.env.Lastfm
const USER = 'notgabry'
const AUTH = 'Basic ' + Buffer.from(`${import.meta.env.SPOTIFY_CLIENT_ID}:${import.meta.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')

const lastfm = <T>(params: string) =>
    fetch(`${LASTFM}${params}&user=${USER}&api_key=${KEY}&format=json`)
        .then((r) => r.json() as T)
        .catch(() => null)

const spotifyToken = () =>
    fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: AUTH },
        body: 'grant_type=client_credentials'
    })
        .then((r) => r.json())
        .then((d) => d.access_token as string)
        .catch(() => '')

const spotifyImg = (token: string, query: string, type: string) =>
    fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=1`, {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then((r) => r.json())
        .then((d) => {
            const items = d?.[`${type}s`]?.items
            const source = type === 'track' ? items?.[0]?.album : items?.[0]
            return source?.images?.[1]?.url ?? source?.images?.[0]?.url ?? ''
        })
        .catch(() => '')

async function enrichWithSpotify<T extends { image: string }>(
    token: string,
    items: T[],
    type: string,
    getQuery: (item: T) => string
) {
    if (!token) return items
    return Promise.all(
        items.map(async (item) => {
            const img = await spotifyImg(token, getQuery(item), type)
            if (img) item.image = img
            return item
        })
    )
}

export const GET: APIRoute = async () => {
    const monthStart = Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000)

    const [recentRes, topArtistsRes, topTracksRes, monthRes] = await Promise.all([
        lastfm<any>('?method=user.getrecenttracks&limit=1'),
        lastfm<any>('?method=user.gettopartists&period=1month&limit=8'),
        lastfm<any>('?method=user.gettoptracks&period=7day&limit=5'),
        lastfm<any>(`?method=user.getrecenttracks&from=${monthStart}&limit=1`)
    ])

    const token = await spotifyToken()
    const track = recentRes?.recenttracks?.track[0]

    let topArtists: MusicData['topArtists'] = (topArtistsRes?.topartists?.artist ?? []).map((a: any) => ({
        name: a.name, url: a.url, image: a.image?.[2]?.['#text'] ?? '', playcount: parseInt(a.playcount) || 0
    }))
    let topTracks: MusicData['topTracks'] = (topTracksRes?.toptracks?.track ?? []).map((t: any) => ({
        name: t.name, url: t.url, artist: t.artist?.name ?? '', image: t.image?.[2]?.['#text'] ?? '', playcount: parseInt(t.playcount) || 0
    }))

    topArtists = await enrichWithSpotify(token, topArtists, 'artist', (a) => a.name)
    topTracks = await enrichWithSpotify(token, topTracks, 'track', (t) => `${t.name} ${t.artist}`)

    let recentImage = track?.image[3]?.['#text'] ?? ''
    if (token && track?.name && track?.artist?.['#text']) {
        const img = await spotifyImg(token, `${track.name} ${track.artist['#text']}`, 'track')
        if (img) recentImage = img
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
        topTracks,
        monthlyScrobbles: parseInt(monthRes?.recenttracks?.['@attr']?.total) || 0
    }

    return new Response(JSON.stringify(data))
}
