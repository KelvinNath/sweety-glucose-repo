import { Pencil, Trash2 } from "lucide-react";
import { calendarDate, formatDisplayDate } from "@/lib/display";

const SLOT_LABELS = {
  MORNING: "Morning (Fasting)",
  AFTER_BREAKFAST: "After Breakfast",
  AFTER_LUNCH: "After Lunch",
  AFTER_DINNER: "After Dinner",
};

function ReadingList({ readings, onEdit, onAskDelete }) {
  if (readings.length === 0) {
    return (
      <div className="empty">
        <strong>No readings found</strong>
        <p>Add your first reading to see it here.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Reading slot</th>
            <th>Glucose value</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {readings.map((reading) => (
            <tr key={reading.id}>
              <td data-label="Date">
                <strong>{formatDisplayDate(calendarDate(reading.date))}</strong>
              </td>
              <td data-label="Reading slot">
                <span className={`slot-badge slot-${String(reading.slot).toLowerCase().replaceAll("_", "-")}`}>
                  {SLOT_LABELS[reading.slot] ?? reading.slot}
                </span>
              </td>
              <td data-label="Glucose value">
                <strong className="table-value">{reading.value} <small>mg/dL</small></strong>
              </td>
              <td data-label="Actions">
                <div className="row-actions">
                  <button type="button" onClick={() => onEdit(reading)}>
                    <Pencil size={16} /> Edit
                  </button>
                  <button type="button" className="delete" onClick={() => onAskDelete(reading)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReadingList;
