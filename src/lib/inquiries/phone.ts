const PHONE_INPUT_PATTERN = /^[+\d][\d\s().-]+$/;

export function isValidPhoneInput(value: string): boolean {
  return PHONE_INPUT_PATTERN.test(value);
}

export function normalizePhoneNumber(value: string): string {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("+")) return `+${digits}`;
  if (digits.startsWith("0")) return `+62${digits.slice(1)}`;
  if (digits.startsWith("62")) return `+${digits}`;
  if (digits.startsWith("8")) return `+62${digits}`;
  return `+${digits}`;
}

export function phoneHref(value: string): string {
  return `tel:${normalizePhoneNumber(value)}`;
}

export function buildCustomerWhatsAppUrl(
  phone: string,
  fullName?: string,
): string {
  const digits = normalizePhoneNumber(phone).replace(/\D/g, "");
  const greeting = fullName?.trim() ? `Halo ${fullName.trim()},` : "Halo,";
  const message = `${greeting} kami dari Biro Jasa Tiga Saudara menindaklanjuti permintaan konsultasi yang Anda kirim melalui situs web.`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
