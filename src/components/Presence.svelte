<script lang="ts">
    import { fade } from 'svelte/transition'
    import type { RecentSong } from '@modules/Spotify'
    import { onMount } from 'svelte'

    let data: RecentSong | undefined
    let isLoading = true

    onMount(async () => {
        data = await fetch('/api/spotify.json').then((c) => c.json())
    })
</script>

<div class="group h-20 max-w-md my-2 mx-auto block px-2 py-[0.55rem] relative bg-neutral-850 ring-1 rounded-md ring-neutral-800">
    {#if isLoading}
        <div transition:fade class="absolute top-0 left-0 bg-neutral-900 rounded-md w-full h-full">
            <div class="w-full h-full animate-pulse bg-neutral-800 rounded-md" />
        </div>
    {/if}

    <div class="flex">
        <div class="max-w-[4rem] first:flex flex-shrink-0 h-full">
            <img
                on:load={() => (isLoading = false)}
                src={data?.image}
                class="max-w-full rounded-md h-full aspect-square flex-grow-0"
                draggable="false"
                alt="Spotify Song" />
        </div>
        <div class="mx-4 w-fit h-full truncate">
            <a class="text-lg font-bold group-hover:underline" href={data?.url}>{data?.name}</a>
            <p class="text-md text-zinc-400">{data?.artist}</p>
        </div>
    </div>
</div>
