<script lang="ts">
    import type { ChessData } from 'src/types'
    import { onMount } from 'svelte'

    let data: ChessData | undefined
    let isLoading = true

    onMount(async () => {
        data = await fetch('/api/chess.json').then((c) => c.json())
        isLoading = false
    })
</script>

{#if isLoading}
    <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-white/5 border border-white/10 animate-pulse shrink-0"></div>
        <div class="flex-1 space-y-2">
            <div class="h-4 w-24 bg-white/5 border border-white/10 animate-pulse rounded"></div>
            <div class="h-3 w-16 bg-white/5 border border-white/10 animate-pulse rounded"></div>
        </div>
    </div>
    <div class="grid grid-cols-2 gap-2 mt-4">
        <div class="h-16 bg-white/5 border border-white/10 animate-pulse rounded-lg"></div>
        <div class="h-16 bg-white/5 border border-white/10 animate-pulse rounded-lg"></div>
        <div class="h-16 bg-white/5 border border-white/10 animate-pulse rounded-lg"></div>
        <div class="h-16 bg-white/5 border border-white/10 animate-pulse rounded-lg"></div>
    </div>
{:else if !data}
    <div class="rounded-lg bg-white/5 border border-white/10 p-4 text-center">
        <p class="font-serif text-sm italic text-text-muted/60">Chess data unavailable</p>
    </div>
{:else}
    <div class="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
        {#if data.profile?.avatar}
            <img class="w-10 h-10 rounded-full object-cover ring-2 ring-white/10" src={data.profile.avatar} alt={data.profile.username} />
        {:else}
            <div class="w-10 h-10 rounded-full bg-white/10 ring-2 ring-white/10 shrink-0"></div>
        {/if}
        <div class="min-w-0">
            <p class="font-sans text-base font-bold text-text truncate">{data.profile?.username ?? 'Unknown'}</p>
            <span class="font-sans text-xs uppercase tracking-widest text-text-muted/50">
                {data.profile?.status === 'premium' ? 'Premium' : 'Active'}
            </span>
        </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
        {#each [
            { label: 'Bullet', key: 'bullet', color: 'text-accent-cyan' },
            { label: 'Blitz', key: 'blitz', color: 'text-accent' },
            { label: 'Rapid', key: 'rapid', color: 'text-accent-pink' },
            { label: 'Daily', key: 'daily', color: 'text-accent-orange' }
        ] as cat}
            {@const stat = data[cat.key as keyof ChessData] as import('../types').Stats | null}
            <div class="rounded-lg bg-white/3 border border-white/10 px-4 py-3 hover:bg-white/6 hover:border-white/20 transition-all">
                <div class="flex items-baseline justify-between gap-2">
                    <span class="font-sans text-2xl font-bold tracking-tight {cat.color}">
                        {stat?.rating ?? '--'}
                    </span>
                    <span class="font-sans text-xs uppercase tracking-widest text-text-muted/50">{cat.label}</span>
                </div>
                {#if stat?.record}
                    {@const total = stat.record.win + stat.record.loss + stat.record.draw}
                    <div class="flex gap-3 mt-1">
                        <span class="font-sans text-xs text-text-muted/50">{total} games</span>
                        <span class="font-sans text-xs text-accent-lime/60">
                            {total > 0 ? Math.round((stat.record.win / total) * 100) : 0}%
                        </span>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
{/if}
