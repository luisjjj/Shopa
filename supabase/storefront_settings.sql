create table storefront_settings (
  user_id uuid primary key references users(id) on delete cascade,
  primary_color text not null default '#ed7712',
  background_color text not null default '#faf9f7',
  text_color text not null default '#1a1a1a',
  accent_color text not null default '#ed7712',
  card_background text not null default '#ffffff',
  banner_url text,
  font_style text not null default 'sans',
  font_size text not null default 'medium',
  layout text not null default 'grid',
  image_shape text not null default 'rounded',
  spacing text not null default 'normal',
  card_style text not null default 'minimal',
  card_border_radius text not null default 'md',
  product_name_weight text not null default 'medium',
  text_align text not null default 'center',
  banner_height text not null default 'medium',
  banner_overlay boolean not null default false,
  header_style text not null default 'centered',
  tagline text,
  show_store_name boolean not null default true,
  show_socials boolean not null default false,
  social_style text not null default 'pills',
  instagram text,
  twitter text,
  tiktok text,
  facebook text,
  whatsapp_store text,
  phone text,
  email text,
  product_name_size text not null default 'medium',
  price_style text not null default 'bold',
  card_padding text not null default 'normal',
  card_border text not null default 'none',
  card_shadow text not null default 'none',
  container_width text not null default 'normal',
  product_image_ratio text not null default 'square',
  updated_at timestamp with time zone default now()
);

alter table storefront_settings enable row level security;

create policy "Users can read own storefront settings"
  on storefront_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own storefront settings"
  on storefront_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own storefront settings"
  on storefront_settings for update
  using (auth.uid() = user_id);

create policy "Anyone can read storefront settings"
  on storefront_settings for select
  using (true);
