import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatisticsCards from "@/components/dashboard/StatisticsCards";
import TodayReadings from "@/components/dashboard/TodayReadings";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getTodayKolkataDate } from "@/lib/date";
import { getDailyReport } from "@/services/report.service";

function formatDisplayDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function getErrorMessage(error) {
  if (error?.status) {
    return error.message || "We couldn't load today's readings. Please try again.";
  }

  return "We couldn't load today's readings. Please check your connection and try again.";
}

function DailyProgress({ count }) {
  const percentage = (count / 4) * 100;

  return (
    <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h3 id="today-progress-label" className="text-lg font-semibold text-violet-950">
          Today's progress
        </h3>
        <p className="text-sm font-medium text-violet-800">
          {count} / 4
          <span className="ml-2 text-muted-foreground">{percentage}%</span>
        </p>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-violet-100"
        role="progressbar"
        aria-labelledby="today-progress-label"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-violet-700"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </section>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState(0);
  const today = getTodayKolkataDate();

  useEffect(() => {
    let cancelled = false;

    getDailyReport(today)
      .then((data) => {
        if (!cancelled) {
          setReport(data);
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
  }, [today, requestId]);

  function retry() {
    setError("");
    setIsLoading(true);
    setRequestId((current) => current + 1);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-violet-950">
            {user?.name ? `Hello, ${user.name}` : "Hello"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDisplayDate(today)}
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link to="/readings" />}
          size="lg"
          className="bg-violet-700 px-3 text-white hover:bg-violet-800"
        >
          Add Reading
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground" role="status">
          Loading today's readings...
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

      {!isLoading && !error && report ? (
        <div className="space-y-6">
          <DailyProgress count={report.statistics?.count ?? 0} />
          {report.statistics?.count === 0 ? (
            <p className="text-sm text-muted-foreground">
              No readings recorded today.
            </p>
          ) : null}
          <StatisticsCards statistics={report.statistics} />
          <TodayReadings readings={report.readings} />
        </div>
      ) : null}
    </section>
  );
}

export default Dashboard;
