import { useState } from 'react'
import { publicAssetUrl } from '../utils/publicAssetUrl'

export default function FlagCard({ src, alt }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const resolvedSrc = publicAssetUrl(src)
  const fallbackSrc = publicAssetUrl('/assets/flag-fallback.svg')
  const imageFailed = failedSrc === resolvedSrc

  return (
    <div className="atlas-panel flag-stage flex overflow-hidden rounded-sm bg-white p-3 transition-transform duration-300 dark:bg-[#e9e5dc] sm:p-4">
      {imageFailed ? (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-center text-slate-700"
          role="img"
          aria-label={`${alt || 'Flag'} image unavailable`}
        >
          <img src={fallbackSrc} alt="" className="h-16 w-20 object-contain" aria-hidden="true" />
          <span className="allow-wrap font-mono text-xs uppercase tracking-widest">Flag image unavailable</span>
        </div>
      ) : (
        <img
          src={resolvedSrc}
          alt={alt || 'Flag'}
          data-testid="flag-image"
          onError={() => setFailedSrc(resolvedSrc)}
          className="h-full w-full animate-float object-contain"
        />
      )}
    </div>
  )
}
