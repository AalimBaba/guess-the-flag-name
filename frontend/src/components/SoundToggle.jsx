import { useEffect, useRef, useState } from 'react'

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(false)
  const audioRef = useRef(null)
  useEffect(() => {
    audioRef.current = new Audio('https://cdn.pixabay.com/download/audio/2023/02/28/audio_fcbb5dc44b.mp3?filename=relaxing-music-141051.mp3')
    audioRef.current.loop = true
    return () => audioRef.current?.pause()
  }, [])
  useEffect(() => {
    if (!audioRef.current) return
    if (enabled) audioRef.current.play().catch(() => {})
    else audioRef.current.pause()
  }, [enabled])
  return (
    <button
      className="px-3 py-1 rounded hover:bg-slate-800"
      aria-label="Toggle music"
      onClick={() => setEnabled((e) => !e)}
    >
      {enabled ? '🎵' : '🔇'}
    </button>
  )
}
