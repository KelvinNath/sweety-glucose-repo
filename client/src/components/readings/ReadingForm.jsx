import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getTodayKolkataDate } from "@/lib/date";

const SLOTS = [
  { slot: "MORNING", label: "Morning (Fasting)" },
  { slot: "AFTER_BREAKFAST", label: "After Breakfast" },
  { slot: "AFTER_LUNCH", label: "After Lunch" },
  { slot: "AFTER_DINNER", label: "After Dinner" },
];

const inputClassName =
  "h-10 w-full rounded-lg border border-violet-100 bg-white px-3 text-sm text-violet-950 outline-none transition-colors focus-visible:border-violet-400 focus-visible:ring-3 focus-visible:ring-violet-200 aria-invalid:border-destructive";

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

function ReadingForm({ reading = null, onSubmit, onCancel, isSaving = false, error = null }) {
  const today = getTodayKolkataDate();
  const isEditing = reading !== null;
  const [date, setDate] = useState(
    typeof reading?.date === "string" ? reading.date.slice(0, 10) : today,
  );
  const [slot, setSlot] = useState(reading?.slot ?? "MORNING");
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
    <form
      id="reading-form"
      className="space-y-5 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div>
        <h3 className="text-lg font-semibold text-violet-950">
          {isEditing ? "Edit reading" : "Add reading"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEditing
            ? "Update this glucose reading."
            : "Record a glucose reading for a day and slot."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="reading-date" className="text-sm font-medium text-violet-950">
            Date
          </label>
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
            className={inputClassName}
          />
          {fieldErrors.date ? (
            <p id="reading-date-error" role="alert" className="text-sm text-destructive">
              {fieldErrors.date}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="reading-slot" className="text-sm font-medium text-violet-950">
            Slot
          </label>
          <select
            id="reading-slot"
            name="slot"
            required
            value={slot}
            disabled={isSaving}
            aria-invalid={Boolean(fieldErrors.slot)}
            aria-describedby={fieldErrors.slot ? "reading-slot-error" : undefined}
            onChange={(event) => setSlot(event.target.value)}
            className={inputClassName}
          >
            {SLOTS.map((item) => (
              <option key={item.slot} value={item.slot}>
                {item.label}
              </option>
            ))}
          </select>
          {fieldErrors.slot ? (
            <p id="reading-slot-error" role="alert" className="text-sm text-destructive">
              {fieldErrors.slot}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="reading-value" className="text-sm font-medium text-violet-950">
            Value (mg/dL)
          </label>
          <input
            id="reading-value"
            name="value"
            type="number"
            inputMode="numeric"
            required
            min={40}
            max={600}
            step={1}
            value={value}
            disabled={isSaving}
            aria-invalid={Boolean(fieldErrors.value)}
            aria-describedby={fieldErrors.value ? "reading-value-error" : undefined}
            onChange={(event) => setValue(event.target.value)}
            className={inputClassName}
          />
          {fieldErrors.value ? (
            <p id="reading-value-error" role="alert" className="text-sm text-destructive">
              {fieldErrors.value}
            </p>
          ) : null}
        </div>
      </div>

      {message ? (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="submit"
          size="lg"
          className="bg-violet-700 px-3 text-white hover:bg-violet-800"
          disabled={isSaving}
        >
          {isSaving ? (isEditing ? "Saving changes..." : "Adding reading...") : isEditing ? "Save changes" : "Add reading"}
        </Button>
        {isEditing ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

export default ReadingForm;
