<script lang="ts">
  import { onMount, untrack } from "svelte";

  // Icons
  import playIcon from "$lib/assets/icons/play.svg";
  import pauseIcon from "$lib/assets/icons/pause.svg";

  // Components
  import RollingTimer from "$lib/components/RollingTimer.svelte";
  import { createOneShot } from "$lib/components/OneShot.svelte";

  let playBlink = $state(true);
  onMount(() => {
    // Blink PLAY/PAUSE indicator
    const blinkTimeout = setInterval(() => {
      playBlink = !playBlink;
    }, 1000);

    return () => {
      clearInterval(blinkTimeout);
    };
  });

  // Video selection and rotation

  let videoElement: HTMLVideoElement;

  import video_EXPLORERS from "$lib/assets/video/EXPLORERS.mp4";
  import video_LOVEISANOCEAN from "$lib/assets/video/LOVEISANOCEAN.mp4";
  import video_WAVE from "$lib/assets/video/WAVE.mp4";

  const musicVideos = [
    ["EXPLORERS.MP4", video_EXPLORERS],
    ["LOVEISANOCEAN.MP4", video_LOVEISANOCEAN],
    ["WAVE.MP4", video_WAVE],
  ];
  let musicVideoId = Math.floor(Math.random() * musicVideos.length);
  let selectedMusicVideo = $state(musicVideos[musicVideoId]);

  // Automatically autoplay video
  let lastSelectedMusicVideoId = musicVideoId;
  $effect(() => {
    if (currentVideoEnded) {
      untrack(() => {
        lastSelectedMusicVideoId = musicVideoId;
        while (musicVideoId == lastSelectedMusicVideoId) {
          musicVideoId = Math.floor(Math.random() * musicVideos.length);
        }
        selectedMusicVideo = musicVideos[musicVideoId];

        videoElement.querySelector("source")!.src = selectedMusicVideo[1];
        videoElement.load();
        videoElement.play();
      });
    }
  });

  // Automatically unmute video
  let hasUnmutedVideoOnce = false;
  createOneShot(
    () => isVideoPlaying && currentVideoMuted,
    () => {
      let video = document.querySelector("video")!;
      // Save people's ears!
      video.volume = 0.25;
      video.muted = false;
      hasUnmutedVideoOnce = true;
    },
  );

  // Video play/pause handling

  let isVideoPaused: boolean = $state(true);
  let isVideoPlaying: boolean = $derived(!isVideoPaused);
  let currentVideoTime: number = $state(0);
  let currentVideoEnded: boolean = $state(false);
  let currentVideoMuted: boolean = $state(true);

  // Position OSD in the bounds of the video (inside of the letterbox)

  import { positionOSD } from "$lib/components/VideoBoundsCalc.svelte";

  function onloadedmetadata(event: any) {
    positionOSD(videoElement);
  }

  function onresize(event: any) {
    positionOSD(videoElement);
  }
</script>

<svelte:window {onresize} />

<svelte:head>
  <!-- <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" /> -->
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
    <video
      autoplay
      controls
      controlslist="nodownload nofullscreen noplaybackrate"
      disablepictureinpicture
      playsinline
      {onloadedmetadata}
      bind:this={videoElement}
      bind:paused={isVideoPaused}
      bind:currentTime={currentVideoTime}
      bind:ended={currentVideoEnded}
      bind:muted={currentVideoMuted}
    >
      <source src={selectedMusicVideo[1]} type="video/mp4" />
      Your browser does not support loading the video.
    </video>

    <div class="osd-container">
      <div class="osd">
        <div class="osd-row">
          <span class="osd-play text-glow" class:hidden={!isVideoPlaying || !playBlink}>
            <img src={playIcon} alt="" class="osd-icon" />
            PLAY
          </span>
          <span class="osd-pause text-glow" class:hidden={isVideoPlaying || !playBlink}>
            <img src={pauseIcon} alt="" class="osd-icon" />
            PAUSE
          </span>
          <!-- <span class="osd-ch">CH&nbsp;&thinsp;01</span> -->
          <span class="osd-ch text-glow">CH {(musicVideoId + 1).toString().padStart(2, "0")}</span>
        </div>

        <div class="osd-row">
          <span class="osd-time text-glow">
            <RollingTimer {currentVideoTime} />
          </span>
        </div>

        <div class="osd-row">
          <span class="osd-sp text-glow">SP</span>
        </div>
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
    z-index: 0;
    object-fit: contain;
  }
</style>
