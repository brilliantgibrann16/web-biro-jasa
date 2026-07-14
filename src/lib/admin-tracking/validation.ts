import {
  isPaymentStatus,
  isPaymentTiming,
} from "@/lib/admin-tracking/constants";
import type {
  PaymentSettingsInput,
  PaymentUpdateInput,
  TestimonialDraftInput,
} from "@/lib/admin-tracking/types";

interface ValidationSuccess<T> {
  ok: true;
  data: T;
}

interface ValidationFailure {
  ok: false;
  errors: Record<string, string>;
}

export type ValidationResult<T> =
  | ValidationSuccess<T>
  | ValidationFailure;

const TIMESTAMPTZ_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;

function removeUnsafeControlCharacters(value: string): string {
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
}

function cleanOptional(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = removeUnsafeControlCharacters(value).trim();
  return cleaned.length > 0 ? cleaned : null;
}

export function readExpectedUpdatedAt(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const value = (payload as Record<string, unknown>).updated_at;
  if (typeof value !== "string") return null;
  const timestamp = value.trim();
  return TIMESTAMPTZ_PATTERN.test(timestamp) ? timestamp : null;
}

export function validatePaymentUpdate(
  payload: unknown,
): ValidationResult<PaymentUpdateInput> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, errors: { form: "Data pembayaran tidak valid." } };
  }

  const input = payload as Record<string, unknown>;
  const required = input.payment_required === true;
  const rawAmount =
    typeof input.payment_amount === "number"
      ? input.payment_amount
      : typeof input.payment_amount === "string" &&
          /^\d+$/.test(input.payment_amount.trim())
        ? Number(input.payment_amount.trim())
        : null;
  const amount = required ? rawAmount : null;
  const timing = required && isPaymentTiming(input.payment_timing)
    ? input.payment_timing
    : null;
  const status = isPaymentStatus(input.payment_status)
    ? input.payment_status
    : null;
  const errors: Record<string, string> = {};

  if (
    required &&
    (amount === null ||
      !Number.isSafeInteger(amount) ||
      amount < 1 ||
      amount > 999_999_999_999)
  ) {
    errors.payment_amount = "Masukkan nominal rupiah antara 1 dan 999.999.999.999.";
  }
  if (required && !timing) {
    errors.payment_timing = "Pilih kapan pembayaran dibutuhkan.";
  }
  if (!status) {
    errors.payment_status = "Status pembayaran tidak valid.";
  }
  if (!required && status && status !== "belum-diperlukan") {
    errors.payment_status = "Order tanpa pembayaran harus berstatus belum ditagihkan.";
  }

  if (Object.keys(errors).length > 0 || !status) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      payment_required: required,
      payment_amount: amount,
      payment_timing: timing,
      payment_status: required ? status : "belum-diperlukan",
    },
  };
}

export function validatePaymentSettings(
  payload: unknown,
): ValidationResult<PaymentSettingsInput> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, errors: { form: "Data pengaturan tidak valid." } };
  }

  const input = payload as Record<string, unknown>;
  const bankName = cleanOptional(input.bank_name)?.replace(/\s+/g, " ") ?? null;
  const accountNumber = cleanOptional(input.bank_account_number)?.replace(/\s+/g, " ") ?? null;
  const accountHolder = cleanOptional(input.bank_account_holder)?.replace(/\s+/g, " ") ?? null;
  const instructions = cleanOptional(input.instructions);
  const errors: Record<string, string> = {};
  const bankFieldCount = [bankName, accountNumber, accountHolder].filter(Boolean).length;

  if (bankFieldCount > 0 && bankFieldCount < 3) {
    errors.bank = "Nama bank, nomor rekening, dan nama pemilik rekening harus diisi lengkap.";
  }
  if (bankName && bankName.length > 80) {
    errors.bank_name = "Nama bank maksimal 80 karakter.";
  }
  if (accountNumber && (accountNumber.length > 50 || !/^[0-9 .-]+$/.test(accountNumber))) {
    errors.bank_account_number = "Nomor rekening maksimal 50 karakter dan hanya boleh berisi angka, spasi, titik, atau tanda hubung.";
  }
  if (accountHolder && accountHolder.length > 120) {
    errors.bank_account_holder = "Nama pemilik rekening maksimal 120 karakter.";
  }
  if (instructions && instructions.length > 1000) {
    errors.instructions = "Instruksi tambahan maksimal 1.000 karakter.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      bank_name: bankName,
      bank_account_number: accountNumber,
      bank_account_holder: accountHolder,
      instructions,
    },
  };
}

export function validateTestimonialDraft(
  payload: unknown,
): ValidationResult<TestimonialDraftInput> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, errors: { form: "Data testimoni tidak valid." } };
  }

  const input = payload as Record<string, unknown>;
  const displayName = cleanOptional(input.display_name)?.replace(/\s+/g, " ") ?? "";
  const testimonialText = cleanOptional(input.testimonial_text) ?? "";
  const rating = typeof input.rating === "number" ? input.rating : Number(input.rating);
  const errors: Record<string, string> = {};

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = "Pilih rating antara satu dan lima.";
  }
  if (displayName.length < 2 || displayName.length > 120) {
    errors.display_name = "Nama tampilan harus berisi 2-120 karakter.";
  }
  if (testimonialText.length < 10 || testimonialText.length > 1500) {
    errors.testimonial_text = "Testimoni harus berisi 10-1.500 karakter.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      rating,
      display_name: displayName,
      testimonial_text: testimonialText,
    },
  };
}
