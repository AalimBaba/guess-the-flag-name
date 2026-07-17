// Faint fixed compass-rose watermark — the signature background element for
// the Atlas & Passport visual direction. Rendered once, low opacity, ignores
// pointer events, sits behind all page content.
export default function CompassWatermark() {
  return (
    <svg
      className="compass-watermark"
      viewBox="0 0 800 800"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g transform="translate(650 150)" stroke="#20263B" fill="none" strokeWidth="1.5">
        <circle r="120" />
        <circle r="90" />
        <circle r="4" fill="#20263B" stroke="none" />
        <path d="M0,-120 L10,-20 L0,0 L-10,-20 Z" fill="#20263B" stroke="none" />
        <path d="M0,120 L10,20 L0,0 L-10,20 Z" fill="#20263B" fillOpacity="0.5" stroke="none" />
        <path d="M-120,0 L-20,-10 L0,0 L-20,10 Z" fill="#20263B" fillOpacity="0.5" stroke="none" />
        <path d="M120,0 L20,-10 L0,0 L20,10 Z" fill="#20263B" fillOpacity="0.5" stroke="none" />
        <line x1="-150" y1="0" x2="150" y2="0" />
        <line x1="0" y1="-150" x2="0" y2="150" />
        <line x1="-106" y1="-106" x2="106" y2="106" strokeDasharray="2 6" />
        <line x1="-106" y1="106" x2="106" y2="-106" strokeDasharray="2 6" />
      </g>
    </svg>
  )
}
