import React, { useEffect, useMemo, useState } from "react";

// --- Interactive Periodic Table (center hover + full detail on click) ---
// • Hover: small black box with name+number+category centered
// • Click: large modal with image + detailed info

const DATA_URL =
  "https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json";

const categoryColors = {
  "alkali metal": "bg-rose-400 hover:bg-rose-500",
  "alkaline earth metal": "bg-orange-400 hover:bg-orange-500",
  "transition metal": "bg-amber-400 hover:bg-amber-500",
  "post-transition metal": "bg-yellow-400 hover:bg-yellow-500",
  metalloid: "bg-lime-400 hover:bg-lime-500",
  nonmetal: "bg-emerald-400 hover:bg-emerald-500",
  "noble gas": "bg-cyan-400 hover:bg-cyan-500",
  halogen: "bg-sky-400 hover:bg-sky-500",
  lanthanoid: "bg-fuchsia-400 hover:bg-fuchsia-500",
  actinoid: "bg-violet-400 hover:bg-violet-500",
  unknown: "bg-neutral-400 hover:bg-neutral-500",
};

function cx(...classes) { return classes.filter(Boolean).join(" "); }

function usePeriodicData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try { const r = await fetch(DATA_URL); const j = await r.json(); setData(j); }
      catch { setData({ elements: [] }); }
      finally { setLoading(false); }
    })();
  }, []);
  return { elements: data?.elements || [], loading };
}

export default function PeriodicTableApp() {
  const { elements, loading } = usePeriodicData();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    if (!selectedCategory) return elements;
    return elements.filter((e) => e.category === selectedCategory);
  }, [elements, selectedCategory]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-100 via-white to-emerald-50 text-neutral-900 relative">
      <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">პერიოდული სისტემა</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 py-6">
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {Object.keys(categoryColors).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={cx(
                "text-xs md:text-sm px-3 py-1.5 rounded-full border border-black/10 transition-all duration-200",
                selectedCategory === cat
                  ? `${categoryColors[cat].split(" ")[0]} text-white shadow`
                  : "bg-white/70 hover:bg-sky-100"
              )}
            >{cat}</button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-24 opacity-70">იტვირთება…</div>
        ) : (
          <div className="grid [grid-template-columns:repeat(18,minmax(0,1fr))] gap-1.5 md:gap-2 relative">
            {filtered.map((el) => (
              <div
                key={el.number}
                onMouseEnter={() => setHovered(el)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(el)}
                className={cx(
                  "relative group rounded-2xl p-2 flex flex-col justify-between text-center border border-black/10 text-neutral-900",
                  "backdrop-blur transition-all duration-300 hover:scale-110 hover:brightness-110 hover:shadow-2xl overflow-hidden cursor-pointer",
                  categoryColors[el.category] || categoryColors.unknown
                )}
                style={{ gridColumn: el.xpos, gridRow: el.ypos }}
              >
                <div className="text-sm font-semibold">{el.number}</div>
                <div className="text-2xl font-bold">{el.symbol}</div>
                <div className="text-[11px] opacity-90">{el.name}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Hover overlay */}
      {hovered && !selected && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="bg-black/90 text-white rounded-xl px-6 py-3 text-center shadow-2xl text-sm md:text-base animate-fadein">
            {hovered.name} • #{hovered.number} • {hovered.category}
          </div>
        </div>
      )}

      {/* Click modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative" onClick={(e)=>e.stopPropagation()}>
            <button onClick={()=>setSelected(null)} className="absolute top-3 right-4 text-xl opacity-70 hover:opacity-100">✕</button>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <img src={selected.spectral_img || `https://via.placeholder.com/400x300?text=${selected.symbol}`} alt={selected.name} className="w-full h-56 object-cover rounded-xl shadow" />
              </div>
              <div className="flex-1 space-y-2">
                <h2 className="text-3xl font-bold">{selected.name}</h2>
                <p className="text-lg opacity-80">Symbol: {selected.symbol}</p>
                <p className="text-sm opacity-80">Atomic Number: {selected.number}</p>
                <p className="text-sm opacity-80">Category: {selected.category}</p>
                {selected.summary && <p className="text-sm mt-3 leading-relaxed opacity-80">{selected.summary}</p>}
                {selected.source && <a href={selected.source} target="_blank" rel="noreferrer" className="text-sm underline opacity-80 hover:opacity-100">Read more ↗</a>}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center py-8 text-xs opacity-70">
        Bowserinator Dataset • Tailwind CSS • © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
