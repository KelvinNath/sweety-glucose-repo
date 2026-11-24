function displayStat(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  return value;
}

function StatisticsCards({ statistics }) {
  const cards = [
    {
      label: "Today's average",
      value: displayStat(statistics?.average),
      unit: "mg/dL",
    },
    {
      label: "Highest reading",
      value: displayStat(statistics?.highest),
      unit: "mg/dL",
    },
    {
      label: "Lowest reading",
      value: displayStat(statistics?.lowest),
      unit: "mg/dL",
    },
    {
      label: "Readings recorded",
      value: `${statistics?.count ?? 0} of 4`,
      unit: null,
    },
  ];

  return (
    <section aria-label="Today's statistics">
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

export default StatisticsCards;
