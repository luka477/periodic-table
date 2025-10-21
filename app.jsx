const { useState, useEffect, useMemo } = React;

// --- Interactive Periodic Table (simplified for GitHub Pages) ---

const DATA_URL =
  "https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json";

const categoryColors = {
  "alkali metal": "pink",
  "alkaline earth metal": "orange",
  "transition metal": "gold",
  "post-transition metal": "khaki",
  metalloid: "limegreen",
  nonmetal: "mediumseagreen",
  "noble gas": "skyblue",
  halogen: "deepskyblue",
  lanthanoid: "violet",
  actinoid: "orchid",
  unknown: "lightgray",
};

function usePeriodicData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(DATA_URL);
        const j = await r.json();
        setData(j);
      } catch {
        setData({ elements: [] });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { elements: data?.elements || [], loading };
}

function PeriodicTableApp() {
  const { elements, loading } = usePeriodicData();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    if (!selectedCategory) return elements;
    return elements.filter((e) => e.category === selectedCategory);
  }, [elements, selectedCategory]);

  return (
    <div style={{ fontFamily: "sans-serif", textAlign: "center", padding: "20px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>პერიოდული სისტემა</h1>

      <div style={{ margin: "10px 0" }}>
        {Object.keys(categoryColors).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            style={{
              margin: "4px",
              padding: "6px 10px",
              borderRadius: "12px",
              border: "1px solid #ccc",
              background: selectedCategory === cat ? categoryColors[cat] : "#f9f9f9",
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p>იტვირთება...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(18, 1fr)",
            gap: "4px",
            justifyContent: "center",
          }}
        >
          {filtered.map((el) => (
            <div
              key={el.number}
              onMouseEnter={() => setHovered(el)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(el)}
              style={{
                gridColumn: el.xpos,
                gridRow: el.ypos,
                padding: "6px",
                background: categoryColors[el.category] || "lightgray",
                borderRadius: "8px",
                textAlign: "center",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
            >
              <div style={{ fontSize: "12px" }}>{el.number}</div>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>{el.symbol}</div>
              <div style={{ fontSize: "10px" }}>{el.name}</div>
            </div>
          ))}
        </div>
      )}

      {hovered && !selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            pointerEvents: "none",
          }}
        >
          {hovered.name} • #{hovered.number} • {hovered.category}
        </div>
      )}

      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "16px",
              width: "80%",
              maxWidth: "600px",
              textAlign: "left",
            }}
          >
            <button
              onClick={() => setSelected(null)}
              style={{
                float: "right",
                border: "none",
                background: "none",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
            <h2>{selected.name}</h2>
            <p>Symbol: {selected.symbol}</p>
            <p>Atomic Number: {selected.number}</p>
            <p>Category: {selected.category}</p>
            {selected.summary && <p>{selected.summary}</p>}
            {selected.source && (
              <a href={selected.source} target="_blank" rel="noreferrer">
                Read more ↗
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.render(<PeriodicTableApp />, document.getElementById("root"));
