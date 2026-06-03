<script lang="ts">
    import type { MusicData } from '../types'
    import { onMount } from 'svelte'

    let data: MusicData | undefined
    let error = false
    let isLoading = true

    onMount(async () => {
        try {
            const res = await fetch('/api/spotify.json')
            if (!res.ok) throw new Error('fetch failed')
            data = await res.json()
        } catch {
            error = true
        }
        isLoading = false
    })
</script>

{#if isLoading}
    <div class="flex items-start gap-6">
        <div class="w-28 h-28 rounded-lg bg-white/5 border border-white/10 animate-pulse shrink-0"></div>
        <div class="flex-1 space-y-3 pt-1">
            <div class="h-3 w-28 bg-white/5 border border-white/10 animate-pulse rounded"></div>
            <div class="h-6 w-48 bg-white/5 border border-white/10 animate-pulse rounded"></div>
            <div class="h-4 w-32 bg-white/5 border border-white/10 animate-pulse rounded"></div>
        </div>
        <div class="text-right">
            <div class="h-7 w-16 bg-white/5 border border-white/10 animate-pulse rounded ml-auto"></div>
            <div class="h-3 w-12 bg-white/5 border border-white/10 animate-pulse rounded ml-auto mt-1.5"></div>
        </div>
    </div>
    <div class="mt-5 pt-1">
        <div class="h-3 w-36 bg-white/5 border border-white/10 animate-pulse rounded mb-3"></div>
        <div class="grid grid-cols-6 gap-1">
            {#each Array(6) as _}
                <div class="aspect-square rounded-lg bg-white/5 border border-white/10 animate-pulse"></div>
            {/each}
        </div>
    </div>
{:else if error || !data?.recent?.name}
    <div class="rounded-lg bg-white/3 border border-white/10 p-10 text-center">
        <p class="font-serif text-sm italic text-text-muted/60">No music data available</p>
    </div>
{:else}
    <div class="flex flex-col gap-5">
        <div class="flex items-start gap-6">
            {#if data.recent.image}
                <img
                    class="w-28 h-28 rounded-lg object-cover ring-1 ring-white/20 shrink-0"
                    src={data.recent.image}
                    alt="Album Cover"
                />
            {:else}
                <div class="w-28 h-28 rounded-lg bg-white/10 ring-1 ring-white/20 shrink-0 flex items-center justify-center">
                    <span class="font-sans text-3xl text-text-muted/20">♪</span>
                </div>
            {/if}
            <div class="min-w-0 flex-1 pt-1">
                <span class="inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-widest text-accent font-semibold">
                    <span class="w-2 h-2 rounded-full bg-accent {data.recent.nowplaying ? 'animate-pulse' : ''}"></span>
                    {data.recent.nowplaying ? 'Now Playing' : 'Last Played'}
                </span>
                <a
                    class="font-sans text-2xl sm:text-3xl font-bold tracking-tight truncate block mt-1.5 hover:text-accent transition-colors"
                    href={data.recent.url}
                >
                    {data.recent.name}
                </a>
                <p class="font-serif text-base italic text-text-muted/80 mt-1">{data.recent.artist}</p>
            </div>
            <div class="text-right shrink-0">
                <span class="font-mono text-2xl font-bold text-accent tabular-nums leading-none block">{data.monthlyScrobbles.toLocaleString()}</span>
                <span class="font-sans text-xs text-text-muted/50">scrobbles</span>
            </div>
        </div>

        {#if data.topArtists.length > 0}
            <div class="pt-1">
                <span class="font-sans text-xs uppercase tracking-widest text-text-muted/50 font-semibold block mb-3">Top Artists This Month</span>
                <div class="grid grid-cols-6 gap-1">
                    {#each data.topArtists.slice(0, 6) as artist}
                        <a
                            href={artist.url}
                            class="group text-center"
                            title="{artist.name} — {artist.playcount} plays"
                        >
                            {#if artist.image}
                                <img
                                    class="w-full aspect-square rounded-lg object-cover ring-1 ring-white/10 group-hover:ring-accent/50 transition-all group-hover:-translate-y-1"
                                    src={artist.image}
                                    alt={artist.name}
                                />
                            {:else}
                                <div class="w-full aspect-square rounded-lg bg-white/10 ring-1 ring-white/10 flex items-center justify-center">
                                    <span class="font-sans text-lg text-text-muted/20">♪</span>
                                </div>
                            {/if}
                            <p class="font-sans text-[10px] text-text-muted/50 truncate mt-1 group-hover:text-text/80 transition-colors">{artist.name}</p>
                        </a>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
{/if}
