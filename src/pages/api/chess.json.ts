export const prerender = false
import type { APIRoute } from 'astro'
import type { ChessData } from '../../types'

interface RawStats {
    chess_bullet?: { last: { rating: number; date: number }; record?: { win: number; loss: number; draw: number } }
    chess_blitz?: { last: { rating: number; date: number }; record?: { win: number; loss: number; draw: number } }
    chess_rapid?: { last: { rating: number; date: number }; record?: { win: number; loss: number; draw: number } }
    chess_daily?: { last: { rating: number; date: number }; record?: { win: number; loss: number; draw: number } }
}

export const GET: APIRoute = async () => {
    try {
        const [statsRes, profileRes] = await Promise.all([
            fetch('https://api.chess.com/pub/player/smile44/stats').then((r) => r.json() as Promise<RawStats>),
            fetch('https://api.chess.com/pub/player/smile44').then((r) => r.json())
        ])

        const extract = (s: RawStats['chess_blitz']) =>
            s
                ? {
                      rating: s.last.rating,
                      date: s.last.date,
                      record: s.record ?? undefined
                  }
                : null

        const data: ChessData = {
            profile: profileRes ?? null,
            bullet: extract(statsRes?.chess_bullet),
            blitz: extract(statsRes?.chess_blitz),
            rapid: extract(statsRes?.chess_rapid),
            daily: extract(statsRes?.chess_daily)
        }

        return new Response(JSON.stringify(data))
    } catch {
        return new Response(JSON.stringify({ error: 'failed' }), { status: 500 })
    }
}
