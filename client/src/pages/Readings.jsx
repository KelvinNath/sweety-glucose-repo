import { useEffect, useRef, useState } from "react";
import ReadingForm from "@/components/readings/ReadingForm";
import ReadingList from "@/components/readings/ReadingList";
import { Button } from "@/components/ui/button";
import {
  createReading,
  deleteReading,
  getReadings,
  updateReading,
} from "@/services/reading.service";

function getLoadErrorMessage(error) {
  if (error?.status) {
    return error.message || "We couldn't load your readings. Please try again.";
  }

  return "We couldn't load your readings. Please check your connection and try again.";
}

function Readings() {
  const isMounted = useRef(true);
  const [readings, setReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState(0);
  const [editingReading, setEditingReading] = useState(null);
  const [formVersion, setFormVersion] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [actionError, setActionError] = useState("");

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

  function handleEdit(reading) {
    setEditingReading(reading);
    setSubmitError(null);
    setSuccessMessage("");
    setActionError("");
    document.getElementById("reading-form")?.scrollIntoView({ block: "start" });
  }

  function handleCancel() {
    setEditingReading(null);
    setSubmitError(null);
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
        setEditingReading(null);
        setSuccessMessage("Reading updated.");
      } else {
        await createReading(data);
        if (!isMounted.current) {
          return;
        }
        setFormVersion((current) => current + 1);
        setSuccessMessage("Reading added.");
      }

      setRequestId((current) => current + 1);
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

  async function handleDelete(reading) {
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
      }
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

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-violet-950">Readings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add, edit, or remove glucose readings.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground" role="status">
          Loading readings...
        </p>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
          <Button
            type="button"
            className="mt-4 bg-violet-700 text-white hover:bg-violet-800"
            onClick={retry}
          >
            Try again
          </Button>
        </div>
      ) : null}

      {!isLoading && !error ? (
        <div className="space-y-6">
          {successMessage ? (
            <p role="status" className="text-sm font-medium text-violet-800">
              {successMessage}
            </p>
          ) : null}

          <ReadingForm
            key={`${editingReading?.id ?? "create"}-${formVersion}`}
            reading={editingReading}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSaving={isSaving}
            error={submitError}
          />

          {actionError ? (
            <p role="alert" className="text-sm text-destructive">
              {actionError}
            </p>
          ) : null}

          <ReadingList
            readings={readings}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        </div>
      ) : null}
    </section>
  );
}

export default Readings;
