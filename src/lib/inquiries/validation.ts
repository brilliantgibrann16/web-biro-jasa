import {
  isInquiryStatus,
  isServiceCategoryId,
} from "@/lib/inquiries/constants";
import type {
  InquiryPublicInput,
  InquiryUpdateInput,
} from "@/lib/inquiries/types";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import {
  isValidPhoneInput,
  normalizePhoneNumber,
} from "@/lib/inquiries/phone";

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

function removeUnsafeControlCharacters(value: string): string {
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
}

function cleanRequired(value: unknown): string {
  return typeof value === "string"
    ? removeUnsafeControlCharacters(value).trim()
    : "";
}

function cleanSingleLine(value: unknown): string {
  return cleanRequired(value).replace(/\s+/g, " ");
}

function cleanOptional(value: unknown): string | null {
  const cleaned = cleanRequired(value);
  return cleaned.length > 0 ? cleaned : null;
}

export function validatePublicInquiry(
  payload: unknown,
): ValidationResult<InquiryPublicInput> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, errors: { form: "Data formulir tidak valid." } };
  }

  const input = payload as Record<string, unknown>;
  const fullName = cleanSingleLine(input.full_name);
  const phoneInput = cleanSingleLine(input.phone);
  const serviceDetail = cleanOptional(input.service_detail)?.replace(/\s+/g, " ") ?? null;
  const region = cleanOptional(input.region)?.replace(/\s+/g, " ") ?? null;
  const notes = cleanOptional(input.notes);
  const errors: Record<string, string> = {};
  const category = isServiceCategoryId(input.service_category)
    ? SERVICE_CATEGORIES.find((item) => item.id === input.service_category)
    : undefined;

  const normalizedPhone = normalizePhoneNumber(phoneInput);
  const normalizedPhoneDigits = normalizedPhone.replace(/\D/g, "");

  if (fullName.length < 2 || fullName.length > 120) {
    errors.full_name = "Nama harus berisi 2–120 karakter.";
  }
  if (phoneInput.length < 8 || phoneInput.length > 30) {
    errors.phone = "Nomor telepon harus berisi 8–30 karakter.";
  }
  if (!isValidPhoneInput(phoneInput)) {
    errors.phone = "Gunakan format nomor telepon yang valid.";
  }
  if (
    !errors.phone &&
    (normalizedPhoneDigits.length < 8 || normalizedPhoneDigits.length > 15)
  ) {
    errors.phone = "Gunakan format nomor telepon yang valid.";
  }
  if (!isServiceCategoryId(input.service_category)) {
    errors.service_category = "Pilih kategori layanan yang tersedia.";
  }
  if (serviceDetail && serviceDetail.length > 160) {
    errors.service_detail = "Detail layanan maksimal 160 karakter.";
  }
  if (
    serviceDetail &&
    category &&
    !category.services.some((service) => service.name === serviceDetail)
  ) {
    errors.service_detail = "Pilih sub-layanan dari kategori yang tersedia.";
  }
  if (region && region.length > 120) {
    errors.region = "Wilayah maksimal 120 karakter.";
  }
  if (notes && notes.length > 2000) {
    errors.notes = "Catatan maksimal 2.000 karakter.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      full_name: fullName,
      phone: normalizedPhone,
      service_category: input.service_category as InquiryPublicInput["service_category"],
      service_detail: serviceDetail,
      region,
      notes,
    },
  };
}

export function validateInquiryUpdate(
  payload: unknown,
): ValidationResult<InquiryUpdateInput> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, errors: { form: "Data pembaruan tidak valid." } };
  }

  const input = payload as Record<string, unknown>;
  const handledNote = cleanOptional(input.handled_note);
  const errors: Record<string, string> = {};

  if (!isInquiryStatus(input.status)) {
    errors.status = "Status inquiry tidak valid.";
  }
  if (handledNote && handledNote.length > 4000) {
    errors.handled_note = "Catatan internal maksimal 4.000 karakter.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      status: input.status as InquiryUpdateInput["status"],
      handled_note: handledNote,
    },
  };
}
