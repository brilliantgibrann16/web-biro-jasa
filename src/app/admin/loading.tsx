export default function AdminLoading() {
  return (
    <section
      className="min-h-screen bg-warm-50 px-5 py-10 text-accent sm:px-8"
      aria-busy="true"
      aria-labelledby="admin-loading-title"
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-primary-dark">
          Ruang internal
        </p>
        <h1
          id="admin-loading-title"
          className="mt-2 text-3xl font-semibold sm:text-4xl"
        >
          Menyiapkan data inquiry
        </h1>
        <p className="mt-3 text-sm leading-7 text-neutral-600" role="status">
          Sesi dan data terbaru sedang diperiksa.
        </p>

        <div className="mt-8 animate-pulse space-y-5" aria-hidden="true">
          <div className="h-28 rounded-xl border border-neutral-200 bg-paper" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-36 rounded-xl border border-neutral-200 bg-paper" />
            <div className="h-36 rounded-xl border border-neutral-200 bg-paper" />
            <div className="h-36 rounded-xl border border-neutral-200 bg-paper" />
          </div>
        </div>
      </div>
    </section>
  );
}
