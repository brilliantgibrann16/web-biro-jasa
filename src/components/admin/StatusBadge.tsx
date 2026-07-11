import {
  INQUIRY_STATUS_LABELS,
  type InquiryStatus,
} from "@/lib/inquiries/constants";

const STATUS_STYLES: Record<InquiryStatus, string> = {
  baru:
    "border-status-new-border bg-status-new-surface text-status-new-text",
  diproses:
    "border-status-progress-border bg-status-progress-surface text-status-progress-text",
  "menunggu-dokumen":
    "border-status-waiting-border bg-status-waiting-surface text-status-waiting-text",
  selesai:
    "border-status-success-border bg-status-success-surface text-status-success-text",
  dibatalkan:
    "border-status-cancelled-border bg-status-cancelled-surface text-status-cancelled-text",
};

export default function StatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.1em] ${STATUS_STYLES[status]}`}
    >
      {INQUIRY_STATUS_LABELS[status]}
    </span>
  );
}
