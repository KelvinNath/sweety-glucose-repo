import { useEffect, useState } from "react";
import DailyReportBreakdown from "@/components/reports/DailyReportBreakdown";
import ReportStatistics from "@/components/reports/ReportStatistics";
import ReportTabs from "@/components/reports/ReportTabs";
import { Button } from "@/components/ui/button";
import { getTodayKolkataDate } from "@/lib/date";
import { getDailyReport, getMonthlyReport, getMtdReport } from "@/services/report.service";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const inputClassName =
  "h-10 w-full rounded-lg border border-violet-100 bg-white px-3 text-sm text-violet-950 outline-none transition-colors focus-visible:border-violet-400 focus-visible:ring-3 focus-visible:ring-violet-200 sm:w-44";

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

function Reports() {
  const today = getTodayKolkataDate();
  const [tab, setTab] = useState("daily");
  const [date, setDate] = useState(today);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    if (!DATE_PATTERN.test(date)) {
      return undefined;
    }

    let cancelled = false;
    const request = reportRequest(tab);

    request(date)
      .then((data) => {
        if (!cancelled) {
          setReport(data);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setReport(null);
          setError(getErrorMessage(err));
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

  const range = report?.dateRange;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-violet-950">Reports</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review glucose statistics by day or month.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <ReportTabs value={tab} onChange={handleTabChange} />
        <div className="space-y-2">
          <label htmlFor="report-date" className="text-sm font-medium text-violet-950">
            Date
          </label>
          <input
            id="report-date"
            name="date"
            type="date"
            required
            max={today}
            value={date}
            onChange={handleDateChange}
            className={inputClassName}
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground" role="status">
          Loading report...
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

      {!isLoading && !error && !report ? (
        <p className="text-sm text-muted-foreground">Choose a date to view a report.</p>
      ) : null}

      {!isLoading && !error && report ? (
        <div
          id="report-panel"
          role="tabpanel"
          aria-labelledby={`report-tab-${tab}`}
          className="space-y-6"
        >
          {range?.from && range?.to ? (
            <p className="text-sm text-muted-foreground">
              {formatDisplayDate(range.from)} – {formatDisplayDate(range.to)}
            </p>
          ) : null}

          {report.statistics?.count === 0 ? (
            <p className="text-sm text-muted-foreground">
              {tab === "daily"
                ? "No readings recorded for this day."
                : "No readings recorded for this period."}
            </p>
          ) : null}

          <ReportStatistics statistics={report.statistics} />

          {tab === "daily" ? <DailyReportBreakdown readings={report.readings} /> : null}
        </div>
      ) : null}
    </section>
  );
}

export default Reports;
