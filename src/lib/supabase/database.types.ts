import type { ServiceCategoryId } from "@/lib/constants";
import type { InquiryStatus } from "@/lib/inquiries/constants";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      inquiries: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          full_name: string;
          phone: string;
          service_category: ServiceCategoryId;
          service_detail: string | null;
          region: string | null;
          notes: string | null;
          status: InquiryStatus;
          source: string;
          handled_note: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          full_name: string;
          phone: string;
          service_category: ServiceCategoryId;
          service_detail?: string | null;
          region?: string | null;
          notes?: string | null;
          status?: InquiryStatus;
          source?: string;
          handled_note?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string;
          phone?: string;
          service_category?: ServiceCategoryId;
          service_detail?: string | null;
          region?: string | null;
          notes?: string | null;
          status?: InquiryStatus;
          source?: string;
          handled_note?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
