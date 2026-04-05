-- ============================================
-- DARI.DZ — Schéma de base de données Supabase
-- À exécuter dans : Supabase → SQL Editor
-- ============================================

-- 1. PROFILS UTILISATEURS
-- (étend la table auth.users de Supabase)
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text not null,
  phone       text,
  role        text not null default 'particulier' check (role in ('particulier', 'agence')),
  avatar_url  text,
  created_at  timestamptz default now()
);

-- Crée automatiquement un profil à chaque inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Utilisateur'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. ANNONCES
create table public.listings (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  type          text not null check (type in ('appartement','villa','terrain','local','bureau','studio')),
  transaction   text not null check (transaction in ('vente','location')),
  wilaya        text not null,
  commune       text not null,
  adresse       text,
  price         bigint not null,
  surface       integer,
  rooms         integer,
  bathrooms     integer,
  title         text not null,
  description   text not null,
  status        text not null default 'active' check (status in ('active','pending','sold','expired')),
  is_featured   boolean default false,
  views_count   integer default 0,
  created_at    timestamptz default now(),
  expires_at    timestamptz default (now() + interval '60 days')
);

-- Index pour les recherches fréquentes
create index idx_listings_wilaya      on public.listings(wilaya);
create index idx_listings_type        on public.listings(type);
create index idx_listings_transaction on public.listings(transaction);
create index idx_listings_status      on public.listings(status);
create index idx_listings_price       on public.listings(price);


-- 3. PHOTOS DES ANNONCES
create table public.listing_images (
  id          uuid default gen_random_uuid() primary key,
  listing_id  uuid references public.listings(id) on delete cascade not null,
  url         text not null,
  is_primary  boolean default false,
  "order"     integer default 0,
  created_at  timestamptz default now()
);


-- 4. MESSAGES DE CONTACT
create table public.contacts (
  id          uuid default gen_random_uuid() primary key,
  listing_id  uuid references public.listings(id) on delete cascade not null,
  name        text not null,
  phone       text not null,
  email       text,
  message     text not null,
  created_at  timestamptz default now()
);


-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Chaque utilisateur ne voit/modifie que ses données
-- ============================================

alter table public.profiles       enable row level security;
alter table public.listings        enable row level security;
alter table public.listing_images  enable row level security;
alter table public.contacts        enable row level security;

-- PROFILES
create policy "Profil visible par tous"
  on public.profiles for select using (true);

create policy "Utilisateur modifie son propre profil"
  on public.profiles for update using (auth.uid() = id);


-- LISTINGS
create policy "Annonces actives visibles par tous"
  on public.listings for select
  using (status = 'active');

create policy "Utilisateur voit toutes ses annonces"
  on public.listings for select
  using (auth.uid() = user_id);

create policy "Utilisateur crée ses annonces"
  on public.listings for insert
  with check (auth.uid() = user_id);

create policy "Utilisateur modifie ses annonces"
  on public.listings for update
  using (auth.uid() = user_id);

create policy "Utilisateur supprime ses annonces"
  on public.listings for delete
  using (auth.uid() = user_id);


-- LISTING IMAGES
create policy "Images visibles par tous"
  on public.listing_images for select using (true);

create policy "Propriétaire gère ses images"
  on public.listing_images for all
  using (
    auth.uid() = (
      select user_id from public.listings where id = listing_id
    )
  );


-- CONTACTS
create policy "Propriétaire voit ses messages"
  on public.contacts for select
  using (
    auth.uid() = (
      select user_id from public.listings where id = listing_id
    )
  );

create policy "Tout le monde peut envoyer un message"
  on public.contacts for insert
  with check (true);


-- ============================================
-- STORAGE — Bucket pour les photos
-- ============================================

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true);

create policy "Images publiques en lecture"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Utilisateurs connectés uploadent"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images'
    and auth.role() = 'authenticated'
  );

create policy "Propriétaire supprime ses images"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
