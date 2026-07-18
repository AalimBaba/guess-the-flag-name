export default function FlagCard({ src, alt }) {
  return (
    <div className="atlas-panel overflow-hidden rounded-sm transition-transform duration-300">
      <img
        src={src}
        alt={alt || 'Flag'}
        data-testid="flag-image"
        className="h-[280px] w-full bg-white object-contain animate-float dark:bg-[#e9e5dc]"
      />
    </div>
  )
}
