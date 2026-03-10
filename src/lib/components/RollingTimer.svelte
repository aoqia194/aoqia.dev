<script lang="ts">
  import { startOfDay, addSeconds, format } from 'date-fns';

  let { currentVideoTime = 0 } = $props();

  // Reactively format the string whenever the video moves
  const formattedTime = $derived.by(() => {
    const baseDate = startOfDay(new Date());
    const dateWithOffset = addSeconds(baseDate, currentVideoTime);
    return format(dateWithOffset, 'HH:mm:ss');
  });
</script>

<div class="timer-container">
  <span class="time-display">{formattedTime}</span>
</div>

<!-- <style>
  .timer-container {
    font-family: monospace; /* Monospace keeps the text from jittering as numbers change */
    font-size: 1.5rem;
  }
</style> -->
