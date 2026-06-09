export const prerender = false
import type { APIRoute } from 'astro'
import type { InternetData } from '../../types'

let cached: { data: InternetData; ts: number } | null = null
const TTL = 5 * 60 * 1000

export const GET: APIRoute = async () => {
    if (cached && Date.now() - cached.ts < TTL) {
        return new Response(JSON.stringify(cached.data))
    }

    try {
        const res = await fetch('https://kena-api.vercel.app/api/refresh', { signal: AbortSignal.timeout(15000) })
        const data: InternetData = await res.json()
        cached = { data, ts: Date.now() }
        return new Response(JSON.stringify(data))
    } catch {
        if (cached) return new Response(JSON.stringify(cached.data))
        return new Response(JSON.stringify({ error: 'Failed to fetch' }), { status: 502 })
    }
}
