"use client";

import { useRef, useState } from "react";

import Reveal from "./Reveal";

type VideoTestimonial = {
  _id: string;
  nama: string;
  peran: string;
  src: string;
  poster?: string;
};

const videoTestimonials: VideoTestimonial[] = [
  {
    _id: "vt-1",
    nama: "Testimoni Pemain Timnas ",
    peran: "Legimin Raharjo (Eks Pemain Timnas)",
    src: "/testimoni/video-1.mp4",
  },
  {
    _id: "vt-2",
    nama: "Testimoni Pemain Timnas ",
    peran: "Saktiawan Sinaga (Eks Pemain Timnas)",
    src: "/testimoni/video-2.mp4",
  },
  {
    _id: "vt-3",
    nama: "Testimoni Pemain Timnas ",
    peran: "Marcus Horizon (Eks Kiper Timnas)",
    src: "/testimoni/video-3.mp4",
  },
];

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-7 w-7 translate-x-0.5"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function VideoCard({ item }: { item: VideoTestimonial }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.play();
    setPlaying(true);
  };

  return (
    <div className="group relative aspect-[9/16] overflow-hidden rounded-2xl bg-ink ring-1 ring-bone/10 transition-all duration-300 hover:ring-pitch/60">
      <video
        ref={videoRef}
        src={item.src}
        poster={item.poster}
        preload="metadata"
        playsInline
        controls={playing}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onEnded={() => setPlaying(false)}
        className="h-full w-full object-cover"
      />

      {!playing && (
        <button
          onClick={handlePlay}
          aria-label={`Putar ${item.nama}`}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-t from-ink/80 via-ink/20 to-transparent transition-colors"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-pitch text-ink shadow-lg transition-transform duration-300 group-hover:scale-110">
            <PlayIcon />
          </span>
          <div className="absolute inset-x-0 bottom-0 p-4 text-left">
            <div className="font-display text-base uppercase tracking-wide text-bone">
              {item.nama}
            </div>
            <div className="font-body text-xs font-semibold uppercase tracking-widest text-gold">
              {item.peran}
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

export default function VideoTestimonials() {
  return (
    <div className="mt-16">
      <Reveal className="mb-8">
        <p className="font-body text-xs font-bold uppercase tracking-widest text-pitch">
          Testimoni Video
        </p>
        <h3 className="mt-2 font-display text-2xl uppercase leading-tight text-bone sm:text-3xl">
          Dengar Langsung dari Mereka
        </h3>
      </Reveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videoTestimonials.map((v, i) => (
          <Reveal key={v._id} delay={i * 100}>
            <VideoCard item={v} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
