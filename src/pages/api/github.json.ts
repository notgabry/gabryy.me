export const prerender = false
import type { APIRoute } from 'astro'

interface GitHubRepo {
    name: string
    description: string
    html_url: string
    stargazers_count: number
    language: string
    fork: boolean
    topics: string[]
}

export const GET: APIRoute = async () => {
    try {
        const repos: GitHubRepo[] = await fetch(
            'https://api.github.com/users/notgabry/repos?sort=stars&per_page=10'
        ).then((r) => r.json())

        const top = repos
            .filter((r) => !r.fork)
            .slice(0, 6)
            .map((r) => ({
                name: r.name,
                description: r.description,
                url: r.html_url,
                stars: r.stargazers_count,
                language: r.language,
                topics: r.topics || []
            }))

        return new Response(JSON.stringify(top))
    } catch {
        return new Response(JSON.stringify([]), { status: 500 })
    }
}
