const { useState, useEffect, useMemo } = React;

const DATA_URL =
  "https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json";

const categoryColors = {
  "alkali metal": "#f472b6",
  "alkaline earth metal": "#fb923c",
  "transition metal": "#facc15",
  "post-transition metal": "#fde047",
  metalloid: "#84cc16",
  nonmetal: "#10b981",
  "noble gas": "#38bdf8",
  halogen: "#0ea5e9",
  lanthanoid: "#d946ef",
  actinoid: "#a855f7",
  unknown: "#a3a3a3",
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
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    if (!selectedCategory) return elements;
    return elements.filter((e) => e.category === selectedCategory);
  }, [elements, selectedCategory]);

  // ფონად ლამაზი გრადიენტი
  const bgGradient =
    "linear-gradient(135deg, #c084fc, #60a5fa, #4ade80, #f472b6, #facc15)";

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        textAlign: "center",
        minHeight: "100vh",
        padding: "20px",
        background: bgGradient,
        backgroundSize: "400% 400%",
        animation: "gradientShift 20s ease infinite",
      }}
    >
      <style>{`
        @keyframes gradientShift {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }
      `}</style>

      <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#fff" }}>
        პერიოდული სისტემა
      </h1>

      <div style={{ margin: "10px 0" }}>
        {Object.keys(categoryColors).map((cat) => (
          <button
            key={cat}
            onClick={() =>
              setSelectedCategory(selectedCategory === cat ? null : cat)
            }
            style={{
              margin: "4px",
              padding: "6px 10px",
              borderRadius: "12px",
              border: "1px solid #eee",
              background:
                selectedCategory === cat ? categoryColors[cat] : "rgba(255,255,255,0.8)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "white" }}>იტვირთება...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(18, 1fr)",
            gap: "6px",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          {filtered.map((el) => (
            <div
              key={el.number}
              onMouseEnter={(e) => {
                setHovered(el);
                const rect = e.target.getBoundingClientRect();
                setHoverPos({ x: rect.x + rect.width / 2, y: rect.y });
              }}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(el)}
              style={{
                gridColumn: el.xpos,
                gridRow: el.ypos,
                padding: "8px 6px",
                background: categoryColors[el.category] || "lightgray",
                borderRadius: "10px",
                textAlign: "center",
                cursor: "pointer",
                transform: hovered?.number === el.number ? "scale(1.2)" : "scale(1)",
                boxShadow:
                  hovered?.number === el.number
                    ? "0 0 20px rgba(0,0,0,0.3)"
                    : "none",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                color: "#111",
              }}
            >
              <div style={{ fontSize: "12px" }}>{el.number}</div>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                {el.symbol}
              </div>
              <div style={{ fontSize: "10px" }}>{el.name}</div>
            </div>
          ))}
        </div>
      )}

      {hovered && (
        <div
          style={{
            position: "fixed",
            left: hoverPos.x,
            top: hoverPos.y - 30,
            transform: "translate(-50%, -100%)",
            background: "rgba(255,255,255,0.9)",
            borderRadius: "10px",
            padding: "6px 10px",
            fontSize: "13px",
            color: "#111",
            boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
            pointerEvents: "none",
            zIndex: 20,
            animation: "fadeIn 0.2s ease",
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
            background: "rgba(0,0,0,0.5)",
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
