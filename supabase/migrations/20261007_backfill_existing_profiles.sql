insert into public.profiles (id, full_name, email)
select
  id,
  nullif(trim(raw_user_meta_data ->> 'full_name'), ''),
  email
from auth.users
on conflict (id) do nothing;

