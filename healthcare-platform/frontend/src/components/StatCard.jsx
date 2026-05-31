export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  gradient = "from-blue-600 to-cyan-500",
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div
        className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} opacity-15 blur-2xl transition group-hover:opacity-25`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
            {label}
          </p>

          <h3 className="mt-3 text-3xl font-black text-slate-950 tabular-nums">
            {value}
          </h3>

          {hint && (
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              {hint}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
          >
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}