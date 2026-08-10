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
          bank_name: string | null;
          account_number: string | null;
          account_name: string | null;
          is_premium: boolean;
          premium_until: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          whatsapp_number?: string | null;
          bank_name?: string | null;
          account_number?: string | null;
          account_name?: string | null;
          is_premium?: boolean;
          premium_until?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          whatsapp_number?: string | null;
          bank_name?: string | null;
          account_number?: string | null;
          account_name?: string | null;
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
          stock: number | null;
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
          stock?: number | null;
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
          stock?: number | null;
          created_at?: string;
        };
      };
      storefront_settings: {
        Row: {
          user_id: string;
          primary_color: string;
          background_color: string;
          text_color: string;
          accent_color: string;
          card_background: string;
          banner_url: string | null;
          font_style: string;
          font_size: string;
          layout: string;
          image_shape: string;
          spacing: string;
          card_style: string;
          card_border_radius: string;
          product_name_weight: string;
          text_align: string;
          banner_height: string;
          banner_overlay: boolean;
          header_style: string;
          tagline: string | null;
          show_store_name: boolean;
          show_socials: boolean;
          social_style: string;
          instagram: string | null;
          twitter: string | null;
          tiktok: string | null;
          facebook: string | null;
          whatsapp_store: string | null;
          phone: string | null;
          email: string | null;
          product_name_size: string;
          price_style: string;
          card_padding: string;
          card_border: string;
          card_shadow: string;
          container_width: string;
          product_image_ratio: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          primary_color?: string;
          background_color?: string;
          text_color?: string;
          accent_color?: string;
          card_background?: string;
          banner_url?: string | null;
          font_style?: string;
          font_size?: string;
          layout?: string;
          image_shape?: string;
          spacing?: string;
          card_style?: string;
          card_border_radius?: string;
          product_name_weight?: string;
          text_align?: string;
          banner_height?: string;
          banner_overlay?: boolean;
          header_style?: string;
          tagline?: string | null;
          show_store_name?: boolean;
          show_socials?: boolean;
          social_style?: string;
          instagram?: string | null;
          twitter?: string | null;
          tiktok?: string | null;
          facebook?: string | null;
          whatsapp_store?: string | null;
          phone?: string | null;
          email?: string | null;
          product_name_size?: string;
          price_style?: string;
          card_padding?: string;
          card_border?: string;
          card_shadow?: string;
          container_width?: string;
          product_image_ratio?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          primary_color?: string;
          background_color?: string;
          text_color?: string;
          accent_color?: string;
          card_background?: string;
          banner_url?: string | null;
          font_style?: string;
          font_size?: string;
          layout?: string;
          image_shape?: string;
          spacing?: string;
          card_style?: string;
          card_border_radius?: string;
          product_name_weight?: string;
          text_align?: string;
          banner_height?: string;
          banner_overlay?: boolean;
          header_style?: string;
          tagline?: string | null;
          show_store_name?: boolean;
          show_socials?: boolean;
          social_style?: string;
          instagram?: string | null;
          twitter?: string | null;
          tiktok?: string | null;
          facebook?: string | null;
          whatsapp_store?: string | null;
          phone?: string | null;
          email?: string | null;
          product_name_size?: string;
          price_style?: string;
          card_padding?: string;
          card_border?: string;
          card_shadow?: string;
          container_width?: string;
          product_image_ratio?: string;
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
          confirmed_by_buyer: boolean;
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
          confirmed_by_buyer?: boolean;
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
          confirmed_by_buyer?: boolean;
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
