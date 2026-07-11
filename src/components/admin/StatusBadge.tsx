import {
  INQUIRY_STATUS_LABELS,
  type InquiryStatus,
} from "@/lib/inquiries/constants";

const STATUS_STYLES: Record<InquiryStatus, string> = {
  baru: "border-primary/30 bg-primary/10 text-primary-dark",
  diproses:
    "border-sky-300 bg-sky-100 text-sky-900 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-200",
  "menunggu-dokumen":
    "border-amber-300 bg-amber-100 text-amber-950 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200",
  selesai:
    "border-emerald-300 bg-emerald-100 text-emerald-950 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
  dibatalkan:
    "border-neutral-300 bg-neutral-100 text-neutral-700",
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
