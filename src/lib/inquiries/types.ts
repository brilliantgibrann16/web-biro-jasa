import type { ServiceCategoryId } from "@/lib/constants";
import type {
  InquiryStatus,
  PaymentStatus,
  PaymentTiming,
} from "@/lib/inquiries/constants";

export interface InquiryPublicInput {
  full_name: string;
  phone: string;
  service_category: ServiceCategoryId;
  service_detail: string | null;
  region: string | null;
  notes: string | null;
}

export interface InquiryRecord extends InquiryPublicInput {
  id: string;
  created_at: string;
  updated_at: string;
  status: InquiryStatus;
  source: string;
  handled_note: string | null;
  reference_code: string;
  payment_required: boolean;
  payment_amount: number | null;
  payment_timing: PaymentTiming | null;
  payment_status: PaymentStatus;
  payment_confirmation_requested_at: string | null;
  payment_verified_at: string | null;
  testimonial_eligible_at: string | null;
}

export interface InquiryUpdateInput {
  status: InquiryStatus;
  handled_note: string | null;
}

export interface InquiryFormCategory {
  id: ServiceCategoryId;
  title: string;
  services: string[];
}

export interface PaymentSettingsRecord {
  id: boolean;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_holder: string | null;
  qris_storage_path: string | null;
  instructions: string | null;
  updated_at: string;
}

export interface TestimonialRecord {
  id: string;
  inquiry_id: string | null;
  service_category: ServiceCategoryId;
  rating: number;
  testimonial_text: string;
  display_name: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
