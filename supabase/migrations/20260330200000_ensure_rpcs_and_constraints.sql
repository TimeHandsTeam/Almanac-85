-- Ensure articles.source_url unique constraint exists
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'articles_source_url_key'
      and conrelid = 'public.articles'::regclass
  ) then
    alter table public.articles add constraint articles_source_url_key unique (source_url);
  end if;
end;
$$;

-- Atomic credit deduction
create or replace function public.deduct_credit(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.credits
  set balance = balance - 1,
      updated_at = now()
  where user_id = p_user_id
    and balance >= 1;

  if not found then
    raise exception 'Insufficient credits for user %', p_user_id;
  end if;

  insert into public.credit_transactions (user_id, amount, type)
  values (p_user_id, -1, 'spend');
end;
$$;

-- Atomic credit addition (for purchases)
create or replace function public.add_credits(p_user_id uuid, p_amount integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;

  update public.credits
  set balance = balance + p_amount,
      updated_at = now()
  where user_id = p_user_id;

  if not found then
    raise exception 'Credits record not found for user %', p_user_id;
  end if;

  insert into public.credit_transactions (user_id, amount, type)
  values (p_user_id, p_amount, 'purchase');
end;
$$;
