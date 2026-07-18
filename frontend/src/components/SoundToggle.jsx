import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { publicAssetUrl } from '../utils/publicAssetUrl'

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    audioRef.current = new Audio(publicAssetUrl('/audio/atlas-ambient.wav'))
    audioRef.current.preload = 'none'
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
