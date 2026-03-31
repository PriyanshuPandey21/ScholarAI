export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-[3px]', lg: 'w-12 h-12 border-4' };
  return <div className={`${sizes[size]} border-primary-500 border-t-transparent rounded-full animate-spin ${className}`} />;
}
export function ProgressBar({ value = 0, label, color = 'primary' }) {
  const colors = { primary: 'from-primary-500 to-accent-500', red: 'from-red-500 to-orange-500', green: 'from-green-500 to-emerald-400', yellow: 'from-yellow-500 to-amber-400' };
  return (
    <div>
      {label && <div className="flex justify-between mb-1"><span className="text-sm text-gray-400">{label}</span><span className="text-sm font-semibold text-white">{Math.round(value)}%</span></div>}
      <div className="w-full bg-white/5 rounded-full h-2">
        <div className={`h-2 rounded-full bg-gradient-to-r ${colors[color]||colors.primary} transition-all duration-700`} style={{ width: `${Math.min(100,Math.max(0,value))}%` }} />
      </div>
    </div>
  );
}
