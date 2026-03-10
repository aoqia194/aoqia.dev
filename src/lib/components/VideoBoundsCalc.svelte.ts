export function getContainedVideoBounds(video: HTMLVideoElement) {
  const vr = video.videoWidth / video.videoHeight;
  const wr = window.innerWidth / window.innerHeight;

  let width, height;
  if (vr > wr) {
    width = window.innerWidth;
    height = window.innerWidth / vr;
  } else {
    height = window.innerHeight;
    width = window.innerHeight * vr;
  }

  return {
    width,
    height,
    top: (window.innerHeight - height) / 2,
    left: (window.innerWidth - width) / 2,
  };
}

export function positionOSD(video: HTMLVideoElement) {
  if (video === null || video === undefined) {
    return;
  }

  const bounds = getContainedVideoBounds(video);

  const osd = video.parentElement!.querySelector(".osd-container") as HTMLDivElement | null;
  if (osd === null) {
    return;
  }

  osd.style.width = bounds.width + "px";
  osd.style.height = bounds.height + "px";
  osd.style.top = bounds.top + "px";
  osd.style.left = bounds.left + "px";
}
