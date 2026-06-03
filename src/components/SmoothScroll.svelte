<script lang="ts">
    import { onMount } from 'svelte'
    import Lenis from 'lenis'

    onMount(() => {
        const lenis = new Lenis({
            duration: 1.4,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            orientation: 'vertical'
        })

        function raf(time: number) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)

        return () => lenis.destroy()
    })
</script>

<div aria-hidden="true" class="hidden"></div>
