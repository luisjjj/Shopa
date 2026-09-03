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
          paystack_subaccount_code: string | null;
          bank_code: string | null;
          payout_setup_completed_at: string | null;
          is_premium: boolean;
          premium_until: string | null;
          is_pro_plus: boolean;
          pro_plus_until: string | null;
          store_count: number;
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
          paystack_subaccount_code?: string | null;
          bank_code?: string | null;
          payout_setup_completed_at?: string | null;
          is_premium?: boolean;
          premium_until?: string | null;
          is_pro_plus?: boolean;
          pro_plus_until?: string | null;
          store_count?: number;
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
          paystack_subaccount_code?: string | null;
          bank_code?: string | null;
          payout_setup_completed_at?: string | null;
          is_premium?: boolean;
          premium_until?: string | null;
          is_pro_plus?: boolean;
          pro_plus_until?: string | null;
          store_count?: number;
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
          category: string | null;
          has_variants: boolean;
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
          category?: string | null;
          has_variants?: boolean;
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
          category?: string | null;
          has_variants?: boolean;
          created_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          stock: number;
          price_override: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          stock?: number;
          price_override?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          stock?: number;
          price_override?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      product_reviews: {
        Row: {
          id: string;
          product_id: string;
          order_id: string | null;
          buyer_name: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          order_id?: string | null;
          buyer_name: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          order_id?: string | null;
          buyer_name?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
      promo_codes: {
        Row: {
          id: string;
          seller_id: string;
          code: string;
          discount_percent: number | null;
          discount_amount: number | null;
          max_uses: number;
          used_count: number;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          code: string;
          discount_percent?: number | null;
          discount_amount?: number | null;
          max_uses?: number;
          used_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          code?: string;
          discount_percent?: number | null;
          discount_amount?: number | null;
          max_uses?: number;
          used_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
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
          delivery_address: string | null;
          promo_code_id: string | null;
          variant_id: string | null;
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
          delivery_address?: string | null;
          promo_code_id?: string | null;
          variant_id?: string | null;
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
          delivery_address?: string | null;
          promo_code_id?: string | null;
          variant_id?: string | null;
          created_at?: string;
        };
      };
      buyer_otps: {
        Row: {
          id: string;
          email: string;
          code: string;
          expires_at: string;
          verified_at: string | null;
          attempts: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          code: string;
          expires_at: string;
          verified_at?: string | null;
          attempts?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          code?: string;
          expires_at?: string;
          verified_at?: string | null;
          attempts?: number;
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
