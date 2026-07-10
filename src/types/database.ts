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
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          whatsapp_number: string | null;
          is_premium: boolean;
          premium_until: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          whatsapp_number?: string | null;
          is_premium?: boolean;
          premium_until?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          whatsapp_number?: string | null;
          is_premium?: boolean;
          premium_until?: string | null;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          price: number;
          image_url: string | null;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          price: number;
          image_url?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          price?: number;
          image_url?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          product_id: string;
          seller_id: string;
          buyer_name: string | null;
          buyer_phone: string;
          amount: number;
          paystack_reference: string;
          paid: boolean;
          fulfilled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          seller_id: string;
          buyer_name?: string | null;
          buyer_phone: string;
          amount: number;
          paystack_reference: string;
          paid?: boolean;
          fulfilled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          seller_id?: string;
          buyer_name?: string | null;
          buyer_phone?: string;
          amount?: number;
          paystack_reference?: string;
          paid?: boolean;
          fulfilled?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
