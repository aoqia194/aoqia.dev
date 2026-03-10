<script lang="ts">
  import { onMount } from "svelte";

  let playBlink = $state(true);
  onMount(() => {
    // Blink ▶ PLAY indicator
    const blinkTimeout = setInterval(() => {
      playBlink = !playBlink;
    }, 1000);

    return () => {
      clearInterval(blinkTimeout)
    };
  });

  // Video selection and importing
  import { resolve } from "$app/paths";

  let musicVideos = [
    // @ts-ignore
    resolve("/src/lib/assets/video/EXPLORERS.MP4"),
    // @ts-ignore
    resolve("/src/lib/assets/video/WAVE.MP4"),
    // @ts-ignore
    resolve("/src/lib/assets/video/LOVEISANOCEAN.MP4"),
  ];
  let selectedMusicVideo = musicVideos[Math.floor(Math.random() * musicVideos.length)];

  // Listen for video state
  // const video = document.querySelector("video");
  // let isVideoPlaying = $state(false);
  // let isVideoPaused = $state(false);
  // video?.addEventListener("playing", (event) => {
  //   isVideoPlaying = true;
  //   isVideoPaused = false;
  // });
  // video?.addEventListener("pause", (event) => {
  //   isVideoPlaying = false;
  //   isVideoPaused = true;
  // });

  let isVideoPaused: boolean = $state(true);
  let isVideoPlaying: boolean = $derived(!isVideoPaused);
  let currentVideoTime: number = $state(0);

  // Icons
  import playIcon from "$lib/assets/icons/play.svg";
  import pauseIcon from "$lib/assets/icons/pause.svg";

  // Components
  import RollingTimer from "$lib/components/RollingTimer.svelte";
</script>

<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=VT323&family=Bebas+Neue&display=swap" rel="stylesheet" />
</svelte:head>

<svg aria-hidden="true" id="filterbank">
  <defs>
    <filter id="ChromaticAberration" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feColorMatrix
        in="SourceGraphic"
        type="matrix"
        values="1 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 1 0"
        result="r"
      />
      <feOffset in="r" dx="2" dy="0" result="rOff" />

      <feColorMatrix
        in="SourceGraphic"
        type="matrix"
        values="0 0 0 0 0   0 1 0 0 0   0 0 0 0 0   0 0 0 1 0"
        result="g"
      />

      <feColorMatrix
        in="SourceGraphic"
        type="matrix"
        values="0 0 0 0 0   0 0 0 0 0   0 0 1 0 0   0 0 0 1 0"
        result="b"
      />
      <feOffset in="b" dx="-2" dy="0" result="bOff" />

      <!-- Soft tape blur -->
      <feGaussianBlur in="SourceGraphic" stdDeviation="0.35" result="blur" />

      <feBlend in="rOff" in2="g" mode="screen" result="rg" />
      <feBlend in="rg" in2="bOff" mode="screen" result="rgb" />
      <!-- Overlay with soft-blurred source for color bleeding -->
      <feBlend in="rgb" in2="blur" mode="normal" result="final">
        <animate attributeName="values" values="1;1;1;1" dur="0.1s" repeatCount="indefinite" />
      </feBlend>
    </filter>
  </defs>
</svg>

<div class="root">
  <div class="scene">
    <video autoplay muted controls controlslist="nodownload" disablepictureinpicture playsinline bind:paused={isVideoPaused} bind:currentTime={currentVideoTime}>
      <source src={selectedMusicVideo} type="video/mp4" />
      Your browser does not support loading the video.
    </video>

    <div class="osd">
      <div class="osd-row">
        <span class="osd-play" class:hidden={!isVideoPlaying || !playBlink}>
          <img src={playIcon} alt="" />
          &nbsp;PLAY
        </span>
        <span class="osd-pause" class:hidden={isVideoPlaying || !playBlink}>
          <img src={pauseIcon} alt="" />
          &nbsp;PAUSE
        </span>
        <!-- <span class="osd-ch">CH&nbsp;&thinsp;01</span> -->
        <span class="osd-ch">{selectedMusicVideo.substring(selectedMusicVideo.lastIndexOf('/') + 1)}</span>
      </div>

      <div class="osd-row">
        <span class="osd-time">
          <RollingTimer {currentVideoTime} />
        </span>
      </div>

      <div class="osd-row">
        <span class="osd-sp">SP</span>
      </div>
    </div>
  </div>
</div>

<style>
  video {
    position: fixed;
    min-width: 100vw;
    min-height: 100vh;
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    z-index: -100;
    object-fit: contain;
  }
</style>
