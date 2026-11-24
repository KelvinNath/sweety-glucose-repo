function axisLabels(points, xFor) {
  const groups = [];

  points.forEach((point, index) => {
    const label = point.label || "";
    const previous = groups[groups.length - 1];

    if (previous && previous.label === label) {
      previous.end = index;
    } else {
      groups.push({ label, start: index, end: index });
    }
  });

  const placed = [];

  groups.forEach((group) => {
    const x = (xFor(group.start) + xFor(group.end)) / 2;
    const previous = placed[placed.length - 1];

    if (previous && x - previous.x < 68) {
      if (group.end === points.length - 1) {
        placed[placed.length - 1] = { label: group.label, x };
      }
      return;
    }

    placed.push({ label: group.label, x });
  });

  return placed;
}

function GlucoseChart({ points }) {
  if (!points.length) {
    return (
      <div className="empty">
        <strong>No readings to chart</strong>
        <p>Add a reading to start seeing your glucose trend.</p>
      </div>
    );
  }

  const values = points.map((point) => point.value);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const padding = Math.max(20, Math.round((dataMax - dataMin) * 0.35));
  const min = Math.max(0, Math.floor((dataMin - padding) / 20) * 20);
  const max = Math.ceil((dataMax + padding) / 20) * 20;
  const width = 720;
  const height = 250;
  const left = 44;
  const right = 16;
  const top = 18;
  const bottom = 36;
  const xFor = (index) =>
    left + index * ((width - left - right) / Math.max(points.length - 1, 1));
  const yFor = (value) =>
    top + ((max - Math.min(Math.max(value, min), max)) * (height - top - bottom)) / (max - min || 1);
  const line = points
    .map((point, index) => `${index ? "L" : "M"} ${xFor(index)} ${yFor(point.value)}`)
    .join(" ");
  const area = `${line} L ${xFor(points.length - 1)} ${height - bottom} L ${xFor(0)} ${height - bottom} Z`;
  const step = max - min <= 80 ? 20 : 40;
  const grid = [];
  for (let mark = Math.ceil(min / step) * step; mark <= max; mark += step) {
    grid.push(mark);
  }
  const labels = axisLabels(points, xFor);

  return (
    <div className="chart-wrap">
      <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Glucose trend">
        {grid.map((mark) => (
          <g key={mark}>
            <line className="gridline" x1={left} x2={width - right} y1={yFor(mark)} y2={yFor(mark)} />
            <text x={left - 8} y={yFor(mark) + 3} textAnchor="end">
              {mark}
            </text>
          </g>
        ))}
        <path className="chart-area" d={area} />
        <path className="chart-line" d={line} />
        {points.map((point, index) => (
          <g className="chart-point" key={point.id ?? `${point.label}-${index}`}>
            <circle cx={xFor(index)} cy={yFor(point.value)} r="4.5">
              <title>
                {point.detail
                  ? `${point.label} · ${point.detail}: ${point.value} mg/dL`
                  : `${point.label}: ${point.value} mg/dL`}
              </title>
            </circle>
          </g>
        ))}
        {labels.map((item) => (
          <text className="chart-label" key={`${item.label}-${item.x}`} x={item.x} y={height - 10} textAnchor="middle">
            {item.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default GlucoseChart;
