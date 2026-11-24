function displayValue(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  return value;
}

function displayAverage(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return Number(value).toFixed(1);
}

function ReportStatistics({ statistics }) {
  const cards = [
    {
      label: "Average",
      value: displayAverage(statistics?.average),
      unit: "mg/dL",
    },
    {
      label: "Highest",
      value: displayValue(statistics?.highest),
      unit: "mg/dL",
    },
    {
      label: "Lowest",
      value: displayValue(statistics?.lowest),
      unit: "mg/dL",
    },
    {
      label: "Readings",
      value: displayValue(statistics?.count),
      unit: null,
    },
  ];

  return (
    <section aria-label="Report statistics">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <li
            key={card.label}
            className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-violet-950">
              {card.value}
              {card.unit ? (
                <span className="ml-1 text-sm font-medium text-muted-foreground">
                  {card.unit}
                </span>
              ) : null}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ReportStatistics;
