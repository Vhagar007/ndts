-- Run this entire file in your Supabase SQL editor (supabase.com → project → SQL editor)

create table lr_entries (
  id uuid primary key default gen_random_uuid(),
  lr_number text not null,
  office text not null,
  date date not null,
  consignor text not null,
  consignee text not null,
  articles text,
  weight_kg numeric,
  particulars text,
  payment_type text default 'topay',
  amount numeric,
  gst_number text,
  truck_number text,
  status text default 'booked',
  invoice_id uuid,
  booked_at timestamptz default now(),
  dispatched_at timestamptz,
  arrived_at timestamptz,
  delivered_at timestamptz,
  receiver_name text,
  unique(lr_number, office)
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  office text not null,
  truck_number text not null,
  driver_name text,
  departure_date date not null,
  dispatched_at timestamptz default now(),
  arrived_at timestamptz
);

-- Allow public read/write (all offices share same access)
-- For production you can add row-level security later

alter table lr_entries enable row level security;
alter table invoices enable row level security;

create policy "public_all_lr" on lr_entries for all using (true) with check (true);
create policy "public_all_inv" on invoices for all using (true) with check (true);
