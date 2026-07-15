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
      storefront_settings: {
        Row: {
          user_id: string;
          primary_color: string;
          background_color: string;
          banner_url: string | null;
          font_style: string;
          layout: string;
          card_style: string;
          text_align: string;
          show_socials: boolean;
          instagram: string | null;
          twitter: string | null;
          tiktok: string | null;
          facebook: string | null;
          whatsapp_store: string | null;
          phone: string | null;
          email: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          primary_color?: string;
          background_color?: string;
          banner_url?: string | null;
          font_style?: string;
          layout?: string;
          card_style?: string;
          text_align?: string;
          show_socials?: boolean;
          instagram?: string | null;
          twitter?: string | null;
          tiktok?: string | null;
          facebook?: string | null;
          whatsapp_store?: string | null;
          phone?: string | null;
          email?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          primary_color?: string;
          background_color?: string;
          banner_url?: string | null;
          font_style?: string;
          layout?: string;
          card_style?: string;
          text_align?: string;
          show_socials?: boolean;
          instagram?: string | null;
          twitter?: string | null;
          tiktok?: string | null;
          facebook?: string | null;
          whatsapp_store?: string | null;
          phone?: string | null;
          email?: string | null;
          updated_at?: string;
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
