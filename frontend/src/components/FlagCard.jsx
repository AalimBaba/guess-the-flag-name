export default function FlagCard({ src, alt }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 transition-transform duration-300">
      <img src={src} alt={alt || 'Flag'} className="w-full h-[280px] object-contain animate-float bg-white" />
    </div>
  )
}
