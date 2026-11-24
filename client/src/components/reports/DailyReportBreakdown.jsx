const SLOTS = [
  { slot: "MORNING", label: "Morning (Fasting)" },
  { slot: "AFTER_BREAKFAST", label: "After Breakfast" },
  { slot: "AFTER_LUNCH", label: "After Lunch" },
  { slot: "AFTER_DINNER", label: "After Dinner" },
];

function DailyReportBreakdown({ readings }) {
  const readingsBySlot = new Map(
    (readings ?? []).map((reading) => [reading.slot, reading]),
  );

  return (
    <section aria-label="Daily readings" className="space-y-3">
      <h3 className="text-lg font-semibold text-violet-950">Daily readings</h3>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {SLOTS.map(({ slot, label }) => {
          const reading = readingsBySlot.get(slot);
          const recorded = reading !== undefined;

          return (
            <li
              key={slot}
              className="flex items-center justify-between gap-4 rounded-2xl border border-violet-100 bg-white px-5 py-4 shadow-sm"
            >
              <p className="text-sm font-medium text-violet-950">{label}</p>
              <p className={recorded ? "text-sm font-semibold text-violet-800" : "text-sm text-muted-foreground"}>
                {recorded ? `${reading.value} mg/dL` : "Not recorded"}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default DailyReportBreakdown;
