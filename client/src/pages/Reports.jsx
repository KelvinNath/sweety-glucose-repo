import { useEffect, useState } from "react";
import { Calendar, ChartColumn } from "lucide-react";
import GlucoseChart from "@/components/charts/GlucoseChart";
import { getTodayKolkataDate } from "@/lib/date";
import { calendarDate, displayAverage, displayStat, formatDisplayDate } from "@/lib/display";
import { getReadings } from "@/services/reading.service";
import { getDailyReport, getMonthlyReport, getMtdReport } from "@/services/report.service";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TABS = [
  { id: "daily", label: "Daily" },
  { id: "mtd", label: "Month to date" },
  { id: "monthly", label: "Previous month" },
];
const SLOT_LABELS = {
  MORNING: "Morning",
  AFTER_BREAKFAST: "Breakfast",
  AFTER_LUNCH: "Lunch",
  AFTER_DINNER: "Dinner",
};

function getErrorMessage(error) {
  if (error?.status) {
    return error.message || "We couldn't load this report. Please try again.";
  }

  return "We couldn't load this report. Please check your connection and try again.";
}

function reportRequest(tab) {
  if (tab === "mtd") {
    return getMtdReport;
  }

  if (tab === "monthly") {
    return getMonthlyReport;
  }

  return getDailyReport;
}

function readingsForReport(tab, report, history) {
  if (tab === "daily") {
    return report?.readings ?? [];
  }

  const from = report?.dateRange?.from;
  const to = report?.dateRange?.to;

  if (!from || !to) {
    return [];
  }

  return history.filter((reading) => {
    const day = calendarDate(reading.date);
    return day >= from && day <= to;
  });
}

function Reports() {
  const today = getTodayKolkataDate();
  const [tab, setTab] = useState("daily");
  const [date, setDate] = useState(today);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    if (!DATE_PATTERN.test(date)) {
      return undefined;
    }

    let cancelled = false;
    const request = reportRequest(tab);

    Promise.allSettled([request(date), getReadings()]).then(([reportResult, readingsResult]) => {
      if (cancelled) {
        return;
      }

      if (reportResult.status === "rejected") {
        setReport(null);
        setError(getErrorMessage(reportResult.reason));
      } else {
        setReport(reportResult.value);
        setError("");
      }

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
  }, [tab, date, requestId]);

  function retry() {
    setError("");
    setIsLoading(true);
    setRequestId((current) => current + 1);
  }

  function handleTabChange(nextTab) {
    setTab(nextTab);
    setError("");

    if (DATE_PATTERN.test(date)) {
      setIsLoading(true);
    }
  }

  function handleDateChange(event) {
    const nextDate = event.target.value;
    setDate(nextDate);
    setError("");

    if (DATE_PATTERN.test(nextDate)) {
      setIsLoading(true);
      return;
    }

    setReport(null);
    setIsLoading(false);
  }

  const statistics = report?.statistics;
  const periodReadings = readingsForReport(tab, report, history);
  const chartSource = tab === "daily" ? periodReadings : [...periodReadings].reverse();
  const chartPoints = chartSource.map((reading) => ({
    id: reading.id,
    value: reading.value,
    label: tab === "daily"
      ? (SLOT_LABELS[reading.slot] ?? reading.slot)
      : formatDisplayDate(calendarDate(reading.date), { year: false }),
    detail: tab === "daily" ? undefined : (SLOT_LABELS[reading.slot] ?? reading.slot),
  }));
  const heroTitle = tab === "daily" ? "Daily report" : tab === "mtd" ? "Month-to-date report" : "Previous month report";
  const heroEyebrow = tab === "daily"
    ? formatDisplayDate(date)
    : report?.dateRange
      ? `${formatDisplayDate(report.dateRange.from)} – ${formatDisplayDate(report.dateRange.to)}`
      : "";

  return (
    <>
      <div className="page-intro">
        <div>
          <span className="eyebrow">Insights</span>
          <h1>Glucose reports</h1>
          <p>Explore summaries of your recorded readings.</p>
        </div>
        <label className="date-control">
          <Calendar size={18} />
          <input id="report-date" type="date" required max={today} value={date} onChange={handleDateChange} aria-label="Report date" />
        </label>
      </div>

      <div className="tabs" role="tablist" aria-label="Report period">
        {TABS.map((item) => (
          <button
            key={item.id}
            id={`report-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? "active" : undefined}
            onClick={() => handleTabChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? <p className="status-line" role="status">Loading report...</p> : null}

      {!isLoading && error ? (
        <div className="panel" style={{ padding: 20 }}>
          <p className="error-line" role="alert">{error}</p>
          <button type="button" className="btn btn-primary" onClick={retry}>Try again</button>
        </div>
      ) : null}

      {!isLoading && !error && !report ? (
        <p className="status-line">Choose a date to view a report.</p>
      ) : null}

      {!isLoading && !error && report ? (
        <div id="report-panel" role="tabpanel" aria-labelledby={`report-tab-${tab}`}>
          <section className="panel report-hero">
            <div>
              <span className="eyebrow">{heroEyebrow}</span>
              <h2>{heroTitle}</h2>
              <p>
                {statistics?.count
                  ? "Summary based on your recorded readings."
                  : "No readings are available for this period."}
              </p>
            </div>
            <span className="report-icon"><ChartColumn size={28} /></span>
          </section>
          <section className="stats-grid report-stats">
            <article className="stat-card"><div><span>Highest</span><strong>{displayStat(statistics?.highest)} {statistics?.highest != null ? <small>mg/dL</small> : null}</strong></div></article>
            <article className="stat-card"><div><span>Lowest</span><strong>{displayStat(statistics?.lowest)} {statistics?.lowest != null ? <small>mg/dL</small> : null}</strong></div></article>
            <article className="stat-card"><div><span>Average</span><strong>{displayAverage(statistics?.average)} {statistics?.average != null ? <small>mg/dL</small> : null}</strong></div></article>
            <article className="stat-card"><div><span>Reading count</span><strong>{statistics?.count ?? 0}</strong></div></article>
          </section>
          <div className="report-detail-grid">
            <section className="panel">
              <div className="section-heading">
                <div>
                  <h2>Reading trend</h2>
                  <p>Values across the selected period</p>
                </div>
              </div>
              <GlucoseChart points={chartPoints} />
            </section>
            <section className="panel report-list">
              <div className="section-heading">
                <div>
                  <h2>Individual readings</h2>
                  <p>{periodReadings.length} recorded values</p>
                </div>
              </div>
              {periodReadings.length ? (
                <div className="report-list-body">
                  <div className="report-list-head">
                    <span>Date</span>
                    <span>Slot</span>
                    <span>Value</span>
                  </div>
                  {periodReadings.map((reading) => (
                    <div className="report-list-row" key={reading.id}>
                      <span className="reading-date">{formatDisplayDate(calendarDate(reading.date), { year: false })}</span>
                      <span className={`reading-slot slot-${String(reading.slot).toLowerCase().replaceAll("_", "-")}`}>
                        {SLOT_LABELS[reading.slot] ?? reading.slot}
                      </span>
                      <strong className="reading-value">
                        {reading.value} <small>mg/dL</small>
                      </strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <strong>Nothing to show</strong>
                  <p>Choose another period to view readings.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Reports;
