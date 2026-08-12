-- Apply in Supabase SQL editor if profiles already exists without push_token.
alter table profiles add column if not exists push_token text;
