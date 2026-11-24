import { useState } from "react";
import { getTodayKolkataDate } from "@/lib/date";

const SLOTS = [
  { slot: "MORNING", label: "Morning (Fasting)" },
  { slot: "AFTER_BREAKFAST", label: "After Breakfast" },
  { slot: "AFTER_LUNCH", label: "After Lunch" },
  { slot: "AFTER_DINNER", label: "After Dinner" },
];

function fieldErrorsFromResponse(error) {
  if (error?.status !== 400 || !Array.isArray(error.data?.errors)) {
    return {};
  }

  const errors = {};

  for (const item of error.data.errors) {
    if (item?.field && item?.message && !errors[item.field]) {
      errors[item.field] = item.message;
    }
  }

  return errors;
}

function formMessage(error, fieldErrors) {
  if (!error) {
    return "";
  }

  if (error.status === 409) {
    return error.message;
  }

  if (error.status === 400) {
    if (Object.keys(fieldErrors).length > 0) {
      return "";
    }

    return error.message || "Please check the reading and try again.";
  }

  if (error.status) {
    return error.message || "We couldn't save this reading. Please try again.";
  }

  return "We couldn't save this reading. Please check your connection and try again.";
}

function readingValue(value) {
  const trimmed = value.trim();
  const numericValue = Number(trimmed);

  if (trimmed !== "" && Number.isInteger(numericValue)) {
    return numericValue;
  }

  return trimmed;
}

function ReadingForm({
  reading = null,
  initialSlot = "MORNING",
  initialDate = "",
  onSubmit,
  onCancel,
  isSaving = false,
  error = null,
}) {
  const today = getTodayKolkataDate();
  const isEditing = reading !== null;
  const startingDate = /^\d{4}-\d{2}-\d{2}$/.test(initialDate) && initialDate <= today
    ? initialDate
    : today;
  const [date, setDate] = useState(
    typeof reading?.date === "string" ? reading.date.slice(0, 10) : startingDate,
  );
  const [slot, setSlot] = useState(reading?.slot ?? initialSlot);
  const [value, setValue] = useState(reading ? String(reading.value) : "");
  const fieldErrors = fieldErrorsFromResponse(error);
  const message = formMessage(error, fieldErrors);

  async function handleSubmit(event) {
    event.preventDefault();

    await onSubmit({
      date,
      slot,
      value: readingValue(value),
    });
  }

  return (
    <form id="reading-form" className="reading-form" onSubmit={handleSubmit}>
      {message ? (
        <div className="form-alert" role="alert">
          {message}
        </div>
      ) : null}
      <div className="form-grid">
        <label className="field" htmlFor="reading-date">
          <span>Date</span>
          <input
            id="reading-date"
            name="date"
            type="date"
            required
            max={today}
            value={date}
            disabled={isSaving}
            aria-invalid={Boolean(fieldErrors.date)}
            aria-describedby={fieldErrors.date ? "reading-date-error" : undefined}
            onChange={(event) => setDate(event.target.value)}
          />
          {fieldErrors.date ? (
            <small id="reading-date-error" className="field-error" role="alert">
              {fieldErrors.date}
            </small>
          ) : null}
        </label>
        <label className="field" htmlFor="reading-slot">
          <span>Reading slot</span>
          <select
            id="reading-slot"
            name="slot"
            required
            value={slot}
            disabled={isSaving}
            aria-invalid={Boolean(fieldErrors.slot)}
            aria-describedby={fieldErrors.slot ? "reading-slot-error" : undefined}
            onChange={(event) => setSlot(event.target.value)}
          >
            {SLOTS.map((item) => (
              <option key={item.slot} value={item.slot}>
                {item.label}
              </option>
            ))}
          </select>
          {fieldErrors.slot ? (
            <small id="reading-slot-error" className="field-error" role="alert">
              {fieldErrors.slot}
            </small>
          ) : null}
        </label>
        <label className="field" htmlFor="reading-value">
          <span>Glucose value (mg/dL)</span>
          <input
            id="reading-value"
            name="value"
            type="number"
            inputMode="numeric"
            required
            min={40}
            max={600}
            step={1}
            placeholder="e.g. 126"
            value={value}
            disabled={isSaving}
            aria-invalid={Boolean(fieldErrors.value)}
            aria-describedby={fieldErrors.value ? "reading-value-error" : undefined}
            onChange={(event) => setValue(event.target.value)}
          />
          {fieldErrors.value ? (
            <small id="reading-value-error" className="field-error" role="alert">
              {fieldErrors.value}
            </small>
          ) : (
            <small>Enter a whole number from 40 to 600.</small>
          )}
        </label>
      </div>
      <div className="form-actions">
        {onCancel ? (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </button>
        ) : null}
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving
            ? isEditing
              ? "Saving..."
              : "Saving..."
            : isEditing
              ? "Save changes"
              : "Save reading"}
        </button>
      </div>
    </form>
  );
}

export default ReadingForm;
