import { Button } from "@/components/ui/button";

const TABS = [
  { id: "daily", label: "Daily" },
  { id: "mtd", label: "Month to date" },
  { id: "monthly", label: "Last month" },
];

function ReportTabs({ value, onChange }) {
  return (
    <div role="tablist" aria-label="Report period" className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const selected = value === tab.id;

        return (
          <Button
            key={tab.id}
            id={`report-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls="report-panel"
            variant={selected ? "default" : "outline"}
            className={selected ? "bg-violet-700 text-white hover:bg-violet-800" : undefined}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}

export default ReportTabs;
