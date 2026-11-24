import ReadingListItem from "@/components/readings/ReadingListItem";

function formatDisplayDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) {
    return dateString;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function groupReadings(readings) {
  const groups = [];

  for (const reading of readings) {
    const date = typeof reading.date === "string" ? reading.date.slice(0, 10) : "";
    const current = groups[groups.length - 1];

    if (current && current.date === date) {
      current.readings.push(reading);
    } else {
      groups.push({ date, readings: [reading] });
    }
  }

  return groups;
}

function ReadingList({ readings, onEdit, onDelete, deletingId = "" }) {
  if (readings.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-violet-200 bg-white px-5 py-8 text-center text-sm text-muted-foreground">
        No readings yet. Add your first glucose reading above.
      </p>
    );
  }

  const groups = groupReadings(readings);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.date || "undated"} className="space-y-3" aria-label={formatDisplayDate(group.date)}>
          <h3 className="text-lg font-semibold text-violet-950">{formatDisplayDate(group.date)}</h3>
          <ul className="space-y-3">
            {group.readings.map((reading) => (
              <ReadingListItem
                key={reading.id}
                reading={reading}
                onEdit={onEdit}
                onDelete={onDelete}
                isDeleting={deletingId === reading.id}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default ReadingList;
