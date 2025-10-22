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
        padding: "16px",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated gradient background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(120deg, #a855f7, #38bdf8, #22d3ee, #f472b6, #facc15)",
          backgroundSize: "600% 600%",
          animation: "moveGradient 25s ease infinite",
          zIndex: 0,
          filter: "blur(100px)",
        }}
      />

      <style>
        {`
          @keyframes moveGradient {
            0% {background-position: 0% 50%;}
            50% {background-position: 100% 50%;}
            100% {background-position: 0% 50%;}
          }

          @keyframes fadeIn {
            from {opacity: 0; transform: scale(0.95);}
            to {opacity: 1; transform: scale(1);}
          }
        `}
      </style>

      <div style={{ position: "relative", zIndex: 1 }}>
        <h1
          style={{
            fontSize: "clamp(1.4rem, 4vw, 2.5rem)",
            fontWeight: "bold",
            marginBottom: "12px",
          }}
        >
          პერიოდული სისტემა
        </h1>

        {/* Category buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          {Object.keys(categoryColors).map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat ? null : cat)
              }
              style={{
                margin: "3px",
                padding: "6px 10px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.4)",
                background:
                  selectedCategory === cat
                    ? categoryColors[cat]
                    : "rgba(255,255,255,0.2)",
                color: "white",
                cursor: "pointer",
                fontSize: "clamp(0.6rem, 2vw, 0.9rem)",
                backdropFilter: "blur(4px)",
                transition: "all 0.3s ease",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Periodic Table with horizontal scroll on mobile */}
        {loading ? (
          <p>იტვირთება...</p>
        ) : (
          <div
            style={{
              overflowX: "auto",
              overflowY: "hidden",
              WebkitOverflowScrolling: "touch",
              marginTop: "20px",
              paddingBottom: "60px",
            }}
          >
            <div
              className="periodic-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(18, minmax(60px, 1fr))",
                gap: "6px",
                justifyContent: "center",
                minWidth: "900px", // ensures full table width for scroll
                margin: "0 auto",
              }}
            >
              {filtered.map((el) => (
                <div
                  key={el.number}
                  onMouseEnter={(e) => {
                    const rect = e.target.getBoundingClientRect();
                    setHovered(el);
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
                      hovered?.number === el.number ? "scale(1.15)" : "scale(1)",
                    boxShadow:
                      hovered?.number === el.number
                        ? "0 0 25px rgba(255,255,255,0.4)"
                        : "none",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    color: "#111",
                  }}
                >
                  <div style={{ fontSize: "10px" }}>{el.number}</div>
                  <div
                    style={{
                      fontSize: "clamp(14px, 4vw, 20px)",
                      fontWeight: "bold",
                    }}
                  >
                    {el.symbol}
                  </div>
                  <div style={{ fontSize: "9px" }}>{el.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hover tooltip */}
        {hovered && (
          <div
            style={{
              position: "fixed",
              left: hoverPos.x,
              top: hoverPos.y - 35,
              transform: "translate(-50%, -100%)",
              background: "rgba(255,255,255,0.9)",
              borderRadius: "10px",
              padding: "6px 10px",
              fontSize: "12px",
              color: "#111",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              pointerEvents: "none",
              zIndex: 10,
              backdropFilter: "blur(8px)",
              animation: "fadeIn 0.3s ease",
              whiteSpace: "nowrap",
            }}
          >
            {hovered.name} • #{hovered.number}
          </div>
        )}

        {/* Modal */}
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
              padding: "10px",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "rgba(255,255,255,0.95)",
                padding: "20px",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "500px",
                textAlign: "left",
                overflowY: "auto",
                maxHeight: "80vh",
                color: "#111",
                backdropFilter: "blur(10px)",
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
              <p><strong>Symbol:</strong> {selected.symbol}</p>
              <p><strong>Atomic Number:</strong> {selected.number}</p>
              <p><strong>Category:</strong> {selected.category}</p>
              {selected.summary && (
                <p style={{ marginTop: "10px" }}>{selected.summary}</p>
              )}
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
