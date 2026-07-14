import type { ServiceCategoryId } from "@/lib/constants";
import type {
  InquiryStatus,
  PaymentStatus,
  PaymentTiming,
} from "@/lib/inquiries/constants";

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
          reference_code: string;
          payment_required: boolean;
          payment_amount: number | null;
          payment_timing: PaymentTiming | null;
          payment_status: PaymentStatus;
          payment_confirmation_requested_at: string | null;
          payment_verified_at: string | null;
          testimonial_eligible_at: string | null;
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
          reference_code?: string;
          payment_required?: boolean;
          payment_amount?: number | null;
          payment_timing?: PaymentTiming | null;
          payment_status?: PaymentStatus;
          payment_confirmation_requested_at?: string | null;
          payment_verified_at?: string | null;
          testimonial_eligible_at?: string | null;
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
          reference_code?: string;
          payment_required?: boolean;
          payment_amount?: number | null;
          payment_timing?: PaymentTiming | null;
          payment_status?: PaymentStatus;
          payment_confirmation_requested_at?: string | null;
          payment_verified_at?: string | null;
          testimonial_eligible_at?: string | null;
        };
        Relationships: [];
      };
      payment_settings: {
        Row: {
          id: boolean;
          bank_name: string | null;
          bank_account_number: string | null;
          bank_account_holder: string | null;
          qris_storage_path: string | null;
          instructions: string | null;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          bank_name?: string | null;
          bank_account_number?: string | null;
          bank_account_holder?: string | null;
          qris_storage_path?: string | null;
          instructions?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: boolean;
          bank_name?: string | null;
          bank_account_number?: string | null;
          bank_account_holder?: string | null;
          qris_storage_path?: string | null;
          instructions?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
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
        };
        Insert: {
          id?: string;
          inquiry_id: string;
          service_category?: ServiceCategoryId;
          rating: number;
          testimonial_text: string;
          display_name: string;
          published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          inquiry_id?: string | null;
          service_category?: ServiceCategoryId;
          rating?: number;
          testimonial_text?: string;
          display_name?: string;
          published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "testimonials_inquiry_id_fkey";
            columns: ["inquiry_id"];
            isOneToOne: true;
            referencedRelation: "inquiries";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      submit_public_inquiry: {
        Args: {
          p_full_name: string;
          p_phone: string;
          p_service_category: string;
          p_service_detail: string | null;
          p_region: string | null;
          p_notes: string | null;
        };
        Returns: string;
      };
      get_inquiry_tracking: {
        Args: { p_reference_code: string };
        Returns: {
          reference_code: string;
          inquiry_status: InquiryStatus;
          service_category: ServiceCategoryId;
          service_detail: string | null;
          updated_at: string;
          payment_required: boolean;
          payment_amount: number | null;
          payment_timing: PaymentTiming | null;
          payment_status: PaymentStatus;
          verification_requested: boolean;
          bank_name: string | null;
          bank_account_number: string | null;
          bank_account_holder: string | null;
          qris_storage_path: string | null;
          payment_instructions: string | null;
        }[];
      };
      request_payment_verification: {
        Args: { p_reference_code: string };
        Returns: boolean;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
