import { useEffect, useRef, useState } from "react";

const playlist = [
  "/sounds/music-1.mp3",
  "/sounds/music-2.mp3",
  "/sounds/music-3.mp3",
];

export default function useMusicPlayer() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [trackIndex, setTrackIndex] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("music");

    if (saved === "off") {
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(playlist[trackIndex]);
    audioRef.current = audio;

    audio.loop = false;
    audio.volume = 0;

    if (isPlaying) {
      audio.play().catch(err => {
        console.warn("Autoplay rejected, waiting for user interaction.", err);
      });

      // fade-in
      let vol = 0;
      const fade = setInterval(() => {
        if (!audioRef.current) {
          clearInterval(fade);
          return;
        }
        if (vol < 0.4) {
          vol += 0.05;
          audio.volume = vol;
        } else {
          clearInterval(fade);
        }
      }, 200);
    }

    audio.onended = () => {
      setTrackIndex((prev) => (prev + 1) % playlist.length);
    };

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [trackIndex, isPlaying]);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      localStorage.setItem("music", "off");
    } else {
      audioRef.current.play().catch(err => {
         console.warn("Click-to-play failed:", err);
      });
      localStorage.setItem("music", "on");
    }

    setIsPlaying(!isPlaying);
  };

  return {
    toggleMusic,
    isPlaying,
  };
}
