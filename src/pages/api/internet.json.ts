export const prerender = false
import type { APIRoute } from 'astro'
import type { InternetData } from '../../types'

const controller = (ms: number) => {
    const c = new AbortController()
    setTimeout(() => c.abort(), ms)
    return c
}

export const GET: APIRoute = async () => {
    try {
        const res = await fetch('https://kena-api.vercel.app/api/refresh', {
            signal: controller(8000).signal
        })
        const data: InternetData = await res.json()
        return new Response(JSON.stringify(data), {
            headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' }
        })
    } catch {
        return new Response(JSON.stringify({ error: 'Timeout fetching internet data' }), {
            status: 504, headers: { 'Cache-Control': 'no-cache' }
        })
    }
}
