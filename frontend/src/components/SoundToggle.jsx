import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    audioRef.current = new Audio(
      'https://cdn.pixabay.com/download/audio/2023/02/28/audio_fcbb5dc44b.mp3?filename=relaxing-music-141051.mp3'
    )
    audioRef.current.loop = true
    return () => audioRef.current?.pause()
  }, [])

  useEffect(() => {
    if (!audioRef.current) return
    if (enabled) audioRef.current.play().catch(() => {})
    else audioRef.current.pause()
  }, [enabled])

  const label = enabled ? 'Mute background music' : 'Play background music'

  return (
    <button
      type="button"
      className="atlas-icon-button"
      aria-label={label}
      title={label}
      onClick={() => setEnabled((value) => !value)}
    >
      {enabled ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
    </button>
  )
}
