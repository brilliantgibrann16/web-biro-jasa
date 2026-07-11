import type { ServiceCategoryId } from "@/lib/constants";
import type { InquiryStatus } from "@/lib/inquiries/constants";

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
