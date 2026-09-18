-- ============================================================
-- SUPABASE — SQL COMPLETO PARA EXECUTAR NO SQL EDITOR
-- ============================================================
-- 1) Tabela public.profiles (dados públicos do usuário)
create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    nome text,
    email text,
    created_at timestamptz not null default now()
);

-- 2) Função segura que cria o perfil automaticamente após o cadastro
--    em auth.users (executa com privilégios do dono e search_path fixo)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, nome, email)
    values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'nome', ''),
        new.email
    );
    return new;
end;
$$;

-- 3) Trigger disparado a cada novo usuário criado em auth.users
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- 4) Habilita Row Level Security na tabela profiles
alter table public.profiles enable row level security;

-- 5) Política: o usuário autenticado lê somente o próprio perfil
create policy "select own profile"
    on public.profiles
    for select
    using (auth.uid() = id);

-- 6) Garante que o cliente autenticado consiga ler via RLS
--    (sem expor nada publicamente — apenas a própria linha)
grant usage on schema public to authenticated;
grant select on table public.profiles to authenticated;