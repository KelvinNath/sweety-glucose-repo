import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const SLOT_LABELS = {
  MORNING: "Morning (Fasting)",
  AFTER_BREAKFAST: "After Breakfast",
  AFTER_LUNCH: "After Lunch",
  AFTER_DINNER: "After Dinner",
};

function ReadingListItem({ reading, onEdit, onDelete, isDeleting = false }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const label = SLOT_LABELS[reading.slot] ?? reading.slot;

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-violet-100 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center justify-between gap-4 sm:justify-start">
        <p className="text-sm font-medium text-violet-950">{label}</p>
        <p className="text-sm font-semibold text-violet-800">{reading.value} mg/dL</p>
      </div>

      {isConfirming ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center" role="group" aria-label={`Delete ${label}`}>
          <p className="text-sm text-muted-foreground">Delete this reading?</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onDelete(reading)}
              disabled={isDeleting}
            >
              <Trash2 aria-hidden="true" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsConfirming(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onEdit(reading)}>
            <Pencil aria-hidden="true" />
            Edit
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setIsConfirming(true)}
          >
            <Trash2 aria-hidden="true" />
            Delete
          </Button>
        </div>
      )}
    </li>
  );
}

export default ReadingListItem;
