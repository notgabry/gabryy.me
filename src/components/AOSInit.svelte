<script lang="ts">
    import { onMount } from 'svelte'
    import AOS from 'aos'

    onMount(() => {
        AOS.init({
            duration: 700,
            easing: 'ease-out-cubic',
            once: true,
            offset: 120
        })
    })
</script>

<div aria-hidden="true" class="hidden"></div>
