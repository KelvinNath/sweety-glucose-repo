import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import ReadingForm from "@/components/readings/ReadingForm";
import ReadingList from "@/components/readings/ReadingList";
import { calendarDate, formatDisplayDate } from "@/lib/display";
import {
  createReading,
  deleteReading,
  getReadings,
  updateReading,
} from "@/services/reading.service";

const SLOTS = new Set(["MORNING", "AFTER_BREAKFAST", "AFTER_LUNCH", "AFTER_DINNER"]);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function getLoadErrorMessage(error) {
  if (error?.status) {
    return error.message || "We couldn't load your readings. Please try again.";
  }

  return "We couldn't load your readings. Please check your connection and try again.";
}

function Readings() {
  const isMounted = useRef(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSlot = searchParams.get("slot");
  const requestedDate = searchParams.get("date");
  const [readings, setReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState(0);
  const [editingReading, setEditingReading] = useState(null);
  const [formVersion, setFormVersion] = useState(0);
  const [initialSlot, setInitialSlot] = useState(SLOTS.has(requestedSlot) ? requestedSlot : "MORNING");
  const [initialDate, setInitialDate] = useState(DATE_PATTERN.test(requestedDate) ? requestedDate : "");
  const [formOpen, setFormOpen] = useState(searchParams.get("add") === "1" || SLOTS.has(requestedSlot));
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [actionError, setActionError] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    getReadings()
      .then((data) => {
        if (!cancelled) {
          setReadings(Array.isArray(data?.readings) ? data.readings : []);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setReadings([]);
          setSuccessMessage("");
          setError(getLoadErrorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [requestId]);

  function retry() {
    setError("");
    setIsLoading(true);
    setRequestId((current) => current + 1);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingReading(null);
    setSubmitError(null);

    if (searchParams.has("slot") || searchParams.has("add") || searchParams.has("date")) {
      setSearchParams({}, { replace: true });
    }
  }

  function openCreate() {
    setEditingReading(null);
    setInitialSlot("MORNING");
    setInitialDate("");
    setSubmitError(null);
    setSuccessMessage("");
    setActionError("");
    setFormVersion((current) => current + 1);
    setFormOpen(true);
  }

  function handleEdit(reading) {
    setEditingReading(reading);
    setSubmitError(null);
    setSuccessMessage("");
    setActionError("");
    setFormOpen(true);
  }

  async function handleSubmit(data) {
    setIsSaving(true);
    setSubmitError(null);
    setSuccessMessage("");
    setActionError("");

    try {
      if (editingReading) {
        await updateReading(editingReading.id, data);
        if (!isMounted.current) {
          return;
        }
        setSuccessMessage("Reading updated.");
      } else {
        await createReading(data);
        if (!isMounted.current) {
          return;
        }
        setFormVersion((current) => current + 1);
        setSuccessMessage("Reading added.");
      }

      setFormOpen(false);
      setEditingReading(null);
      setRequestId((current) => current + 1);

      if (searchParams.has("slot") || searchParams.has("add") || searchParams.has("date")) {
        setSearchParams({}, { replace: true });
      }
    } catch (err) {
      if (isMounted.current) {
        setSubmitError(err);
      }
    } finally {
      if (isMounted.current) {
        setIsSaving(false);
      }
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) {
      return;
    }

    const reading = pendingDelete;
    setDeletingId(reading.id);
    setActionError("");
    setSuccessMessage("");

    try {
      await deleteReading(reading.id);
      if (!isMounted.current) {
        return;
      }
      if (editingReading?.id === reading.id) {
        setEditingReading(null);
        setSubmitError(null);
        setFormOpen(false);
      }
      setPendingDelete(null);
      setSuccessMessage("Reading deleted.");
      setRequestId((current) => current + 1);
    } catch (err) {
      if (!isMounted.current) {
        return;
      }
      setActionError(
        err?.status
          ? err.message || "We couldn't delete this reading. Please try again."
          : "We couldn't delete this reading. Please check your connection and try again.",
      );
    } finally {
      if (isMounted.current) {
        setDeletingId("");
      }
    }
  }

  const visibleReadings = dateFilter
    ? readings.filter((reading) => calendarDate(reading.date) === dateFilter)
    : readings;

  return (
    <>
      <div className="page-intro">
        <div>
          <span className="eyebrow">History</span>
          <h1>Reading history</h1>
          <p>Review and manage your saved glucose readings.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Add reading
        </button>
      </div>

      {isLoading ? <p className="status-line" role="status">Loading readings...</p> : null}

      {!isLoading && error ? (
        <div className="panel" style={{ padding: 20 }}>
          <p className="error-line" role="alert">{error}</p>
          <button type="button" className="btn btn-primary" onClick={retry}>Try again</button>
        </div>
      ) : null}

      {!isLoading && !error ? (
        <section className="panel history-panel">
          <div className="filter-bar">
            <div>
              <h2>All readings</h2>
              <span>{visibleReadings.length} saved readings</span>
            </div>
            <select
              className="filter-select"
              aria-label="Filter by date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            >
              <option value="">All dates</option>
              {[...new Set(readings.map((reading) => calendarDate(reading.date)))].map((day) => (
                <option key={day} value={day}>
                  {formatDisplayDate(day)}
                </option>
              ))}
            </select>
          </div>
          <ReadingList
            readings={visibleReadings}
            onEdit={handleEdit}
            onAskDelete={(reading) => {
              setActionError("");
              setPendingDelete(reading);
            }}
          />
        </section>
      ) : null}

      {successMessage ? <div className="toast" role="status">{successMessage}</div> : null}

      {formOpen ? (
        <div className="modal-backdrop" onClick={closeForm}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reading-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <h2 id="reading-dialog-title">{editingReading ? "Edit reading" : "Add a reading"}</h2>
                <p>{editingReading ? "Update this glucose reading." : "Record one glucose value for a day and slot."}</p>
              </div>
              <button type="button" className="modal-close" aria-label="Close" onClick={closeForm}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <ReadingForm
                key={`${editingReading?.id ?? "create"}-${initialSlot}-${initialDate}-${formVersion}`}
                reading={editingReading}
                initialSlot={initialSlot}
                initialDate={initialDate}
                onSubmit={handleSubmit}
                onCancel={closeForm}
                isSaving={isSaving}
                error={submitError}
              />
            </div>
          </div>
        </div>
      ) : null}

      {pendingDelete ? (
        <div className="modal-backdrop" onClick={() => !deletingId && setPendingDelete(null)}>
          <div
            className="modal confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-dialog-title">Delete this reading?</h2>
            <p>
              This removes the {formatDisplayDate(calendarDate(pendingDelete.date))} reading of {pendingDelete.value} mg/dL.
              This cannot be undone.
            </p>
            {actionError ? <p className="error-line" role="alert">{actionError}</p> : null}
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setPendingDelete(null)} disabled={Boolean(deletingId)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={Boolean(deletingId)}>
                {deletingId ? "Deleting..." : "Delete reading"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Readings;
