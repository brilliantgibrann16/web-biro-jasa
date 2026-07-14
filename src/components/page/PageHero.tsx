import { ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";

interface PageHeroAction {
  label: string;
  href: string;
  external?: boolean;
  icon?: "message";
}

export type PageHeroVariant =
  | "index"
  | "process"
  | "manifesto"
  | "questions"
  | "contact"
  | "service";

interface PageHeroProps {
  title: string;
  intro: string;
  points: string[];
  asideTitle: string;
  asideBody: string;
  primaryAction?: PageHeroAction;
  secondaryAction?: PageHeroAction;
  variant?: PageHeroVariant;
}

function HeroAction({
  action,
  variant,
  surface,
}: {
  action: PageHeroAction;
  variant: "primary" | "secondary";
  surface: "light" | "dark";
}) {
  const className =
    variant === "primary"
      ? "group inline-flex min-h-12 items-center justify-center gap-3 rounded-sm bg-primary-dark px-7 py-4 text-base font-extrabold text-white transition-colors duration-300 hover:bg-navy"
      : surface === "dark"
        ? "group inline-flex min-h-12 items-center justify-center gap-3 rounded-sm border border-white/20 px-7 py-4 text-base font-extrabold text-white transition-colors duration-300 hover:border-primary-light/70"
        : "group inline-flex min-h-12 items-center justify-center gap-3 rounded-sm border border-neutral-300 px-7 py-4 text-base font-extrabold text-accent transition-colors duration-300 hover:border-primary-dark hover:text-primary-dark";

  const content = (
    <>
      {action.icon === "message" && (
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
      )}
      {action.label}
      {action.icon !== "message" && (
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      )}
    </>
  );

  if (action.external) {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={action.href} className={className}>
      {content}
    </Link>
  );
}

function HeroActions({
  primaryAction,
  secondaryAction,
  surface,
}: Pick<PageHeroProps, "primaryAction" | "secondaryAction"> & {
  surface: "light" | "dark";
}) {
  if (!primaryAction && !secondaryAction) return null;

  return (
    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
      {primaryAction && (
        <HeroAction action={primaryAction} variant="primary" surface={surface} />
      )}
      {secondaryAction && (
        <HeroAction action={secondaryAction} variant="secondary" surface={surface} />
      )}
    </div>
  );
}

export default function PageHero({
  title,
  intro,
  points,
  asideTitle,
  asideBody,
  primaryAction,
  secondaryAction,
  variant = "service",
}: PageHeroProps) {
  if (variant === "index") {
    return (
      <section className="relative overflow-hidden bg-page text-accent">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-32 sm:px-8 md:pb-28 md:pt-40">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
                {asideTitle}
              </p>
              <h1 className="mt-6 max-w-5xl font-display text-[3rem] font-semibold leading-[0.98] sm:text-6xl lg:text-[5.8rem]">
                {title}
              </h1>
              <p className="mt-7 max-w-3xl text-lg font-medium leading-8 text-neutral-600 sm:text-xl sm:leading-9">
                {intro}
              </p>
              <HeroActions
                primaryAction={primaryAction}
                secondaryAction={secondaryAction}
                surface="light"
              />
            </div>
            <aside className="border-l border-primary-dark/35 pl-6 lg:col-span-4 lg:mb-1 lg:pl-8">
              <p className="font-display text-2xl font-semibold leading-snug text-accent">
                {asideBody}
              </p>
            </aside>
          </div>

          <div className="mt-14 grid border-y border-neutral-200 md:grid-cols-3">
            {points.map((point) => (
              <p
                key={point}
                className="border-b border-neutral-200 py-5 text-sm font-semibold leading-7 text-neutral-600 last:border-b-0 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0"
              >
                {point}
              </p>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "process") {
    return (
      <section className="relative overflow-hidden bg-page text-accent">
        <div className="absolute left-0 top-0 h-2 w-1/3 bg-primary-dark" />
        <div className="mx-auto grid min-h-[72vh] max-w-7xl gap-14 px-5 pb-20 pt-32 sm:px-8 md:pb-28 md:pt-40 lg:grid-cols-[minmax(0,1.08fr)_minmax(330px,0.72fr)] lg:items-end">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
              Urutan kerja
            </p>
            <h1 className="mt-6 max-w-5xl font-display text-[3rem] font-semibold leading-[0.98] sm:text-6xl lg:text-[5.6rem]">
              {title}
            </h1>
            <p className="mt-7 max-w-3xl text-lg font-medium leading-8 text-neutral-600 sm:text-xl sm:leading-9">
              {intro}
            </p>
            <HeroActions
              primaryAction={primaryAction}
              secondaryAction={secondaryAction}
              surface="light"
            />
          </div>

          <aside className="border-t-2 border-accent pt-6">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-primary-dark">
              {asideTitle}
            </p>
            <p className="mt-4 text-base leading-8 text-neutral-600">{asideBody}</p>
            <div className="mt-6 space-y-4">
              {points.map((point) => (
                <div key={point} className="flex gap-4 border-t border-neutral-200 pt-4">
                  <span className="mt-3 h-px w-7 shrink-0 bg-primary-dark" />
                  <p className="text-sm font-semibold leading-7 text-accent">{point}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    );
  }

  if (variant === "manifesto") {
    return (
      <section className="relative overflow-hidden bg-page text-accent">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-32 sm:px-8 md:pb-28 md:pt-40">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
            {asideTitle}
          </p>
          <h1 className="mt-6 max-w-6xl font-display text-[3.05rem] font-semibold leading-[0.97] sm:text-6xl lg:text-[6.15rem]">
            {title}
          </h1>

          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start">
            <div>
              <p className="max-w-2xl text-xl font-medium leading-9 text-neutral-600">
                {intro}
              </p>
              <HeroActions
                primaryAction={primaryAction}
                secondaryAction={secondaryAction}
                surface="light"
              />
            </div>
            <aside className="bg-inset px-6 py-7 sm:px-8">
              <p className="border-l-2 border-primary-dark pl-5 text-base font-semibold leading-8 text-accent">
                {asideBody}
              </p>
              <div className="mt-7 divide-y divide-neutral-200 border-y border-neutral-200">
                {points.map((point) => (
                  <blockquote
                    key={point}
                    className="py-5 font-display text-lg font-semibold leading-8 text-accent"
                  >
                    {point}
                  </blockquote>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "questions") {
    return (
      <section className="relative overflow-hidden bg-page text-accent">
        <span
          className="pointer-events-none absolute -right-4 top-20 font-display text-[18rem] font-black leading-none text-primary-dark/[0.055] sm:text-[28rem]"
          aria-hidden="true"
        >
          ?
        </span>
        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-32 sm:px-8 md:pb-28 md:pt-40">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(310px,0.52fr)] lg:items-start">
            <div>
              <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
                Pertanyaan dan jawaban
              </p>
              <h1 className="mt-6 max-w-5xl font-display text-[3rem] font-semibold leading-[0.98] sm:text-6xl lg:text-[5.8rem]">
                {title}
              </h1>
              <p className="mt-7 max-w-3xl text-lg font-medium leading-8 text-neutral-600 sm:text-xl sm:leading-9">
                {intro}
              </p>
              <HeroActions
                primaryAction={primaryAction}
                secondaryAction={secondaryAction}
                surface="light"
              />
            </div>
            <aside className="border-y border-accent py-6">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-primary-dark">
                {asideTitle}
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-600">{asideBody}</p>
              <ul className="mt-6 space-y-3">
                {points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm font-semibold leading-7 text-accent">
                    <span className="mt-3 h-1.5 w-1.5 shrink-0 bg-primary-dark" />
                    {point}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "contact") {
    return (
      <section className="page-ambient relative overflow-hidden bg-page text-accent">
        <div className="relative mx-auto grid min-h-[72vh] max-w-7xl gap-12 px-5 pb-20 pt-32 sm:px-8 md:pb-28 md:pt-40 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.58fr)] lg:items-end">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
              Kanal konsultasi
            </p>
            <h1 className="mt-6 max-w-5xl font-display text-[3rem] font-semibold leading-[0.98] sm:text-6xl lg:text-[5.8rem]">
              {title}
            </h1>
            <p className="mt-7 max-w-3xl text-lg font-medium leading-8 text-neutral-600 sm:text-xl sm:leading-9">
              {intro}
            </p>
            <HeroActions
              primaryAction={primaryAction}
              secondaryAction={secondaryAction}
              surface="light"
            />
          </div>

          <aside className="border-l border-primary-dark/35 pl-6 lg:mb-1 lg:pl-8">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-primary-dark">
              {asideTitle}
            </p>
            <p className="mt-4 text-base font-semibold leading-8 text-accent">{asideBody}</p>
            <div className="mt-6 space-y-4 border-t border-neutral-200 pt-5">
              {points.map((point) => (
                <p key={point} className="text-sm leading-7 text-neutral-600">
                  {point}
                </p>
              ))}
            </div>
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-page text-accent">
      <div className="relative mx-auto grid min-h-[72vh] max-w-7xl gap-12 px-5 pb-20 pt-32 sm:px-8 md:pb-28 md:pt-40 lg:grid-cols-[minmax(0,1.05fr)_minmax(330px,0.62fr)] lg:items-center">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
            Detail layanan
          </p>
          <h1 className="mt-6 max-w-5xl font-display text-[3rem] font-semibold leading-[0.98] sm:text-6xl lg:text-[5.65rem]">
            {title}
          </h1>
          <p className="mt-7 max-w-3xl text-lg font-medium leading-8 text-neutral-600 sm:text-xl sm:leading-9">
            {intro}
          </p>
          <HeroActions
            primaryAction={primaryAction}
            secondaryAction={secondaryAction}
            surface="light"
          />
        </div>

        <aside className="relative rotate-[0.6deg] border border-dossier-border bg-dossier-surface px-6 py-7 text-dossier-text shadow-medium sm:px-8">
          <div className="absolute -right-3 -top-3 h-full w-full border border-neutral-200" />
          <div className="relative">
            <p className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-dossier-accent">
              {asideTitle}
            </p>
            <p className="mt-4 text-sm font-semibold leading-7 text-dossier-muted">{asideBody}</p>
            <div className="mt-6 divide-y divide-dossier-line border-y border-dossier-line">
              {points.map((point) => (
                <p key={point} className="flex gap-3 py-4 text-sm font-bold leading-7 text-dossier-text">
                  <span className="mt-3 h-px w-6 shrink-0 bg-dossier-accent" />
                  {point}
                </p>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
