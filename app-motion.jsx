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

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        textAlign: "center",
        minHeight: "100vh",
        padding: "20px",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* მოძრავი ფონური ფენები */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(120deg, #a855f7, #38bdf8, #22d3ee, #f472b6, #facc15)",
          backgroundSize: "600% 600%",
          animation: "moveGradient 25s ease infinite",
          zIndex: 0,
          filter: "blur(80px)",
        }}
      />
      <style>
        {`
          @keyframes moveGradient {
            0% {background-position: 0% 50%;}
            50% {background-position: 100% 50%;}
            100% {background-position: 0% 50%;}
          }
        `}
      </style>

      <div style={{ position: "relative", zIndex: 1 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>პერიოდული სისტემა</h1>

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
                border: "1px solid rgba(255,255,255,0.4)",
                background:
                  selectedCategory === cat
                    ? categoryColors[cat]
                    : "rgba(255,255,255,0.2)",
                cursor: "pointer",
                color: "white",
                backdropFilter: "blur(4px)",
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
                  transform:
                    hovered?.number === el.number ? "scale(1.2)" : "scale(1)",
                  boxShadow:
                    hovered?.number === el.number
                      ? "0 0 25px rgba(255,255,255,0.4)"
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
              top: hoverPos.y - 35,
              transform: "translate(-50%, -100%)",
              background: "rgba(255,255,255,0.8)",
              borderRadius: "10px",
              padding: "6px 10px",
              fontSize: "13px",
              color: "#111",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              pointerEvents: "none",
              zIndex: 10,
              backdropFilter: "blur(8px)",
              animation: "fadeIn 0.3s ease",
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
    </div>
  );
}

ReactDOM.render(<PeriodicTableApp />, document.getElementById("root"));
