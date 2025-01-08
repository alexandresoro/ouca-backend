import type { Entry } from "@ou-ca/api/models";
import type { FunctionComponent } from "react";
import EntrySummaryContent from "../entry-summary-content/EntrySummaryContent";

type EntrySummaryPanelProps = {
  entry: Entry;
};

const EntrySummaryPanel: FunctionComponent<EntrySummaryPanelProps> = ({ entry }) => {
  return (
    <div className="card border-2 border-primary shadow-xl py-6">
      <EntrySummaryContent entry={entry} />
    </div>
  );
};
export default EntrySummaryPanel;
