<script lang="ts">
    import type { InternetData } from '../types'
    import { onMount } from 'svelte'

    let data: InternetData | undefined
    let error = false
    let isLoading = true
    let animated = false

    onMount(async () => {
        try {
            const res = await fetch('/api/internet.json')
            if (!res.ok) throw new Error('fetch failed')
            data = await res.json()
            requestAnimationFrame(() => {
                animated = true
            })
        } catch {
            error = true
        }
        isLoading = false
    })

    const R = 52
    const C = 2 * Math.PI * R

    const usageColor = (pct: number) => (pct > 80 ? 'stroke-accent-pink' : pct > 50 ? 'stroke-accent-orange' : 'stroke-accent-lime')

    const remainingColor = (used: number) => (used > 80 ? 'bg-accent-pink' : used > 50 ? 'bg-accent-orange' : 'bg-accent-lime')

    const gb = (n: number) => n.toFixed(1).replace('.0', '')
</script>

{#if isLoading}
    <div class="flex flex-col items-center gap-10 sm:gap-12">
        <div class="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 w-full justify-center">
            <div class="w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-white/5 border border-white/10 animate-pulse shrink-0"></div>
            <div class="grid grid-cols-3 gap-4 sm:gap-6">
                {#each Array(3) as _}
                    <div class="flex flex-col items-center sm:items-start gap-2">
                        <div class="h-7 sm:h-8 w-12 sm:w-16 rounded bg-white/5 border border-white/10 animate-pulse"></div>
                        <div class="h-3 w-16 rounded bg-white/5 border border-white/10 animate-pulse"></div>
                    </div>
                {/each}
            </div>
        </div>
        <div class="w-full max-w-2xl space-y-3">
            <div class="h-3 w-24 rounded bg-white/5 border border-white/10 animate-pulse"></div>
            {#each Array(4) as _}
                <div class="rounded-xl bg-white/5 border border-white/10 animate-pulse p-4">
                    <div class="flex items-center justify-between gap-3 mb-2">
                        <div class="space-y-1.5 flex-1">
                            <div class="h-4 w-3/4 rounded bg-white/10 animate-pulse"></div>
                            <div class="h-3 w-1/3 rounded bg-white/10 animate-pulse"></div>
                        </div>
                        <div class="h-4 w-8 rounded bg-white/10 animate-pulse"></div>
                    </div>
                    <div class="h-2 rounded-full bg-white/10"></div>
                </div>
            {/each}
        </div>
    </div>
{:else if error || !data?.bundles?.length}
    <div class="rounded-lg bg-white/3 border border-white/10 p-10 text-center">
        <p class="font-sans text-sm text-text-muted/60">No internet data available</p>
    </div>
{:else}
    <div class="flex flex-col items-center gap-10 sm:gap-12">
        <div class="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 w-full justify-center">
            <div class="relative w-44 h-44 sm:w-52 sm:h-52 shrink-0">
                <svg class="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r={R} fill="none" stroke="currentColor" stroke-width="8" class="text-white/10" />
                    <circle
                        cx="60"
                        cy="60"
                        r={R}
                        fill="none"
                        stroke-width="8"
                        stroke-linecap="round"
                        class={usageColor(data.percentUsed)}
                        stroke-dasharray={C}
                        stroke-dashoffset={animated ? C * (1 - data.percentUsed / 100) : C}
                        style="transition: stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                        class="font-sans text-3xl sm:text-4xl font-bold tabular-nums transition-colors duration-500"
                        class:opacity-0={!animated}
                        style="color: {data.percentUsed > 80 ? '#EC4899' : data.percentUsed > 50 ? '#FB923C' : '#4ADE80'}">
                        {data.percentUsed}%
                    </span>
                    <span class="font-sans text-[10px] uppercase tracking-widest text-text-muted/50 mt-1">used</span>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-4 sm:gap-6 text-center sm:text-left">
                <div>
                    <span class="font-sans text-xl sm:text-2xl font-bold tabular-nums text-accent-lime">{gb(data.remainingGb)}</span>
                    <p class="font-sans text-[10px] uppercase tracking-widest text-text-muted/50 mt-0.5">remaining</p>
                </div>
                <div>
                    <span class="font-sans text-xl sm:text-2xl font-bold tabular-nums text-accent-pink">{gb(data.usedGb)}</span>
                    <p class="font-sans text-[10px] uppercase tracking-widest text-text-muted/50 mt-0.5">used</p>
                </div>
                <div>
                    <span class="font-sans text-xl sm:text-2xl font-bold tabular-nums text-text">{gb(data.totalGb)}</span>
                    <p class="font-sans text-[10px] uppercase tracking-widest text-text-muted/50 mt-0.5">total</p>
                </div>
            </div>
        </div>

        <div class="w-full max-w-2xl space-y-3">
            <span class="font-sans text-xs uppercase tracking-widest text-text-muted/50 font-semibold block">All Bundles</span>
            {#each data.bundles as bundle}
                <div class="rounded-xl bg-white/5 border border-white/10 p-4 transition-all duration-300 hover:bg-white/[0.07]">
                    <div class="flex items-center justify-between gap-3 mb-2">
                        <div class="min-w-0">
                            <span class="font-sans text-sm font-semibold text-text/90 truncate block">{bundle.name}</span>
                            <span class="font-sans text-[11px] text-text-muted/50">
                                {gb(bundle.usedGb)} / {gb(bundle.totalGb)} GB
                            </span>
                        </div>
                        <span class="font-sans text-sm font-bold tabular-nums shrink-0 {usageColor(bundle.percentUsed).replace('stroke-', 'text-')}">
                            {bundle.percentUsed}%
                        </span>
                    </div>
                    <div
                        class="h-2 rounded-full bg-white/10 overflow-hidden"
                        title="{bundle.percentUsed}% used / {gb(bundle.remainingGb)} GB remaining">
                        <div
                            class="h-full min-w-0.75 rounded-full transition-all duration-1000 ease-out {remainingColor(bundle.percentUsed)}"
                            style="width: {animated ? 100 - bundle.percentUsed : 100}%">
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>
{/if}
