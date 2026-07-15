create table storefront_settings (
  user_id uuid primary key references users(id) on delete cascade,
  primary_color text not null default '#ed7712',
  background_color text not null default '#faf9f7',
  banner_url text,
  font_style text not null default 'sans' check (font_style in ('sans', 'serif', 'mono')),
  layout text not null default 'grid' check (layout in ('grid', 'list')),
  card_style text not null default 'minimal' check (card_style in ('minimal', 'bordered', 'shadow')),
  text_align text not null default 'center' check (text_align in ('center', 'left')),
  show_socials boolean not null default false,
  instagram text,
  twitter text,
  tiktok text,
  facebook text,
  whatsapp_store text,
  phone text,
  email text,
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
