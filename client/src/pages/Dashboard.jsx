import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, BarChart3, Calendar, List, Plus, X } from "lucide-react";
import GlucoseChart from "@/components/charts/GlucoseChart";
import ReadingForm from "@/components/readings/ReadingForm";
import { useAuth } from "@/context/AuthContext";
import { getTodayKolkataDate } from "@/lib/date";
import { calendarDate, displayAverage, displayStat, formatDisplayDate } from "@/lib/display";
import { createReading, getReadings } from "@/services/reading.service";
import { getDailyReport, getMonthlyReport, getMtdReport } from "@/services/report.service";

const SLOTS = [
  { slot: "MORNING", label: "Morning (Fasting)", hint: "Before food" },
  { slot: "AFTER_BREAKFAST", label: "After Breakfast", hint: "Post-meal reading" },
  { slot: "AFTER_LUNCH", label: "After Lunch", hint: "Post-meal reading" },
  { slot: "AFTER_DINNER", label: "After Dinner", hint: "Post-meal reading" },
];

const SLOT_SHORT = {
  MORNING: "Morning",
  AFTER_BREAKFAST: "Breakfast",
  AFTER_LUNCH: "Lunch",
  AFTER_DINNER: "Dinner",
};

function getErrorMessage(error) {
  if (error?.status) {
    return error.message || "We couldn't load today's readings. Please try again.";
  }

  return "We couldn't load today's readings. Please check your connection and try again.";
}

function StatCard({ label, value, unit, tone, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={20} />
      </div>
      <div>
        <span>{label}</span>
        <strong>
          {value}
          {unit ? <small> {unit}</small> : null}
        </strong>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const today = getTodayKolkataDate();
  const [date, setDate] = useState(today);
  const [daily, setDaily] = useState(null);
  const [mtd, setMtd] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [formVersion, setFormVersion] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";

  useEffect(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return undefined;
    }

    let cancelled = false;

    Promise.allSettled([
      getDailyReport(date),
      getMtdReport(date),
      getMonthlyReport(date),
      getReadings(),
    ]).then(([dailyResult, mtdResult, monthlyResult, readingsResult]) => {
      if (cancelled) {
        return;
      }

      if (dailyResult.status === "rejected") {
        setDaily(null);
        setError(getErrorMessage(dailyResult.reason));
      } else {
        setDaily(dailyResult.value);
        setError("");
      }

      setMtd(mtdResult.status === "fulfilled" ? mtdResult.value : null);
      setMonthly(monthlyResult.status === "fulfilled" ? monthlyResult.value : null);
      setHistory(
        readingsResult.status === "fulfilled" && Array.isArray(readingsResult.value?.readings)
          ? readingsResult.value.readings
          : [],
      );
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [date, requestId]);

  function retry() {
    setError("");
    setIsLoading(true);
    setRequestId((current) => current + 1);
  }

  function openCreate() {
    setSubmitError(null);
    setSuccessMessage("");
    setFormVersion((current) => current + 1);
    setFormOpen(true);
  }

  function closeForm() {
    if (isSaving) {
      return;
    }

    setFormOpen(false);
    setSubmitError(null);
  }

  async function handleCreate(data) {
    setIsSaving(true);
    setSubmitError(null);
    setSuccessMessage("");

    try {
      await createReading(data);
      setFormOpen(false);
      setSuccessMessage("Reading added.");
      setRequestId((current) => current + 1);
    } catch (err) {
      setSubmitError(err);
    } finally {
      setIsSaving(false);
    }
  }

  function handleDateChange(event) {
    const nextDate = event.target.value;
    setDate(nextDate);

    if (/^\d{4}-\d{2}-\d{2}$/.test(nextDate)) {
      setIsLoading(true);
      setError("");
    }
  }

  const statistics = daily?.statistics;
  const readingsBySlot = new Map((daily?.readings ?? []).map((reading) => [reading.slot, reading]));
  const chartPoints = [...history]
    .slice(0, 10)
    .reverse()
    .map((reading) => ({
      id: reading.id,
      value: reading.value,
      label: formatDisplayDate(calendarDate(reading.date), { year: false }),
      detail: SLOT_SHORT[reading.slot] ?? reading.slot,
    }));

  return (
    <>
      <div className="page-intro dashboard-intro">
        <div>
          <span className="eyebrow">Your daily overview</span>
          <h1>
            {greeting}, {firstName}
          </h1>
          <p>
            Here’s your glucose summary for {date === today ? "today" : formatDisplayDate(date)}.
          </p>
        </div>
        <label className="date-control">
          <Calendar size={18} />
          <input type="date" max={today} value={date} onChange={handleDateChange} aria-label="Report date" />
        </label>
      </div>

      {isLoading ? <p className="status-line" role="status">Loading today’s readings...</p> : null}

      {!isLoading && error ? (
        <div className="panel" style={{ padding: 20 }}>
          <p className="error-line" role="alert">{error}</p>
          <button type="button" className="btn btn-primary" onClick={retry}>Try again</button>
        </div>
      ) : null}

      {!isLoading && !error && daily ? (
        <>
          <section className="stats-grid">
            <StatCard label="Highest reading" value={displayStat(statistics?.highest)} unit={statistics?.highest == null ? undefined : "mg/dL"} icon={ArrowUp} tone="blue" />
            <StatCard label="Lowest reading" value={displayStat(statistics?.lowest)} unit={statistics?.lowest == null ? undefined : "mg/dL"} icon={ArrowDown} tone="green" />
            <StatCard label="Average reading" value={displayAverage(statistics?.average)} unit={statistics?.average == null ? undefined : "mg/dL"} icon={BarChart3} tone="violet" />
            <StatCard label="Total readings" value={statistics?.count ?? 0} icon={List} tone="amber" />
          </section>

          <div className="dashboard-grid">
            <section className="panel readings-panel">
              <div className="section-heading">
                <div>
                  <h2>{date === today ? "Today's readings" : formatDisplayDate(date, { year: false })}</h2>
                  <p>Four daily check-in slots</p>
                </div>
                <button type="button" className="btn btn-primary" onClick={openCreate}>
                  <Plus size={18} /> Add reading
                </button>
              </div>
              <div className="slot-list">
                {SLOTS.map((item, index) => {
                  const reading = readingsBySlot.get(item.slot);

                  return (
                    <div className="slot-row" key={item.slot}>
                      <div className="slot-time">
                        <span className={`slot-${item.slot.toLowerCase().replaceAll("_", "-")}`}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <strong>{item.label}</strong>
                          <small>{item.hint}</small>
                        </div>
                      </div>
                      {reading ? (
                        <div className="slot-value">
                          <strong>{reading.value}</strong>
                          <span>mg/dL</span>
                        </div>
                      ) : (
                        <span className="slot-empty">Not recorded</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="panel trend-panel">
              <div className="section-heading">
                <div>
                  <h2>Glucose trend</h2>
                  <p>Your most recent readings</p>
                </div>
                <span className="legend"><i />Glucose</span>
              </div>
              <GlucoseChart points={chartPoints} />
            </section>
          </div>

          <section className="report-section">
            <div className="section-title">
              <h2>Report summary</h2>
              <p>A quick look at your monthly activity</p>
            </div>
            <div className="report-grid">
              <SummaryCard title="Month to date" report={mtd} />
              <SummaryCard title="Previous calendar month" report={monthly} />
            </div>
          </section>
        </>
      ) : null}

      {successMessage ? <div className="toast" role="status">{successMessage}</div> : null}

      {formOpen ? (
        <div className="modal-backdrop" onClick={closeForm}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-reading-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <h2 id="dashboard-reading-title">Add a reading</h2>
                <p>Record one glucose value for {formatDisplayDate(date)}.</p>
              </div>
              <button type="button" className="modal-close" aria-label="Close" onClick={closeForm}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <ReadingForm
                key={`${date}-${formVersion}`}
                initialDate={date}
                onSubmit={handleCreate}
                onCancel={closeForm}
                isSaving={isSaving}
                error={submitError}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SummaryCard({ title, report }) {
  const statistics = report?.statistics;
  const from = report?.dateRange?.from;
  const to = report?.dateRange?.to;

  return (
    <div className="report-summary">
      <div className="section-heading">
        <div>
          <h3>{title}</h3>
          <p>{from && to ? `${formatDisplayDate(from, { year: false })} – ${formatDisplayDate(to)}` : "Unavailable"}</p>
        </div>
        <span className="count-pill">{statistics?.count ?? 0} readings</span>
      </div>
      {statistics && statistics.count > 0 ? (
        <div className="mini-stats">
          <div><span>Highest</span><strong>{statistics.highest} <small>mg/dL</small></strong></div>
          <div><span>Lowest</span><strong>{statistics.lowest} <small>mg/dL</small></strong></div>
          <div><span>Average</span><strong>{displayAverage(statistics.average)} <small>mg/dL</small></strong></div>
        </div>
      ) : (
        <div className="empty">
          <strong>No readings yet</strong>
          <p>There are no readings in this date range.</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
