import type {
  PaymentStatus,
  PaymentTiming,
} from "@/lib/admin-tracking/constants";
import type { ServiceCategoryId } from "@/lib/constants";

export interface PaymentUpdateInput {
  payment_required: boolean;
  payment_amount: number | null;
  payment_timing: PaymentTiming | null;
  payment_status: PaymentStatus;
}

export interface PaymentSettingsInput {
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_holder: string | null;
  instructions: string | null;
}

export interface TestimonialDraftInput {
  rating: number;
  testimonial_text: string;
  display_name: string;
}

export interface AdminTestimonialRecord extends TestimonialDraftInput {
  id: string;
  inquiry_id: string | null;
  service_category: ServiceCategoryId;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
