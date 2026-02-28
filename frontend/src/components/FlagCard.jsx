export default function FlagCard({ code }) {
  const url = `https://flagcdn.com/w640/${code}.png`
  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 transition-transform duration-300">
      <img src={url} alt="Country flag" className="w-full h-[280px] object-contain animate-float" />
    </div>
  )
}
