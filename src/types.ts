export interface MusicData {
    recent: { image: string; name: string; url: string; artist: string; nowplaying: boolean }
    topArtists: { name: string; url: string; image: string; playcount: number }[]
    monthlyScrobbles: number
}

export interface ChessData {
    profile: { avatar: string; username: string; status: string; joined: number } | null
    bullet: Stats | null
    blitz: Stats | null
    rapid: Stats | null
    daily: Stats | null
}

export interface Stats {
    rating: number
    date: number
    record?: { win: number; loss: number; draw: number }
}
