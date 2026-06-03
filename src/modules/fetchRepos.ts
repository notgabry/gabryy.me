export interface Repo {
    name: string
    description: string
    url: string
    stars: number
    language: string
    topics: string[]
}

export async function fetchRepos(): Promise<Repo[]> {
    try {
        const res = await fetch(
            'https://api.github.com/users/notgabry/repos?sort=stars&per_page=10&type=public'
        )
        if (!res.ok) return []
        const data = await res.json()
        return data
            .filter((r: any) => !r.fork && !r.archived)
            .slice(0, 6)
            .map((r: any) => ({
                name: r.name,
                description: r.description,
                url: r.html_url,
                stars: r.stargazers_count,
                language: r.language,
                topics: r.topics || []
            }))
    } catch {
        return []
    }
}
