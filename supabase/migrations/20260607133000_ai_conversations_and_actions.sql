create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  agent_code text not null default 'copilot',
  scope text not null default 'copilot',
  title text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  related_message_id uuid references public.ai_messages(id) on delete set null,
  role text not null,
  content text not null,
  attachments jsonb not null default '[]'::jsonb,
  structured_payload jsonb,
  provider text,
  model text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_action_suggestions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  message_id uuid references public.ai_messages(id) on delete cascade,
  label text not null,
  intent text not null,
  action_key text not null,
  target_module text,
  status text not null default 'suggested',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_ai_conversations_updated_at on public.ai_conversations;
create trigger set_ai_conversations_updated_at
before update on public.ai_conversations
for each row execute function public.set_updated_at();

drop trigger if exists set_ai_messages_updated_at on public.ai_messages;
create trigger set_ai_messages_updated_at
before update on public.ai_messages
for each row execute function public.set_updated_at();

drop trigger if exists set_ai_action_suggestions_updated_at on public.ai_action_suggestions;
create trigger set_ai_action_suggestions_updated_at
before update on public.ai_action_suggestions
for each row execute function public.set_updated_at();

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_action_suggestions enable row level security;

drop policy if exists ai_conversations_select on public.ai_conversations;
drop policy if exists ai_conversations_insert on public.ai_conversations;
drop policy if exists ai_conversations_update on public.ai_conversations;
drop policy if exists ai_conversations_delete on public.ai_conversations;
create policy ai_conversations_select on public.ai_conversations
for select using (public.user_has_workspace_access(workspace_id));
create policy ai_conversations_insert on public.ai_conversations
for insert with check (public.user_has_workspace_access(workspace_id));
create policy ai_conversations_update on public.ai_conversations
for update using (public.user_has_workspace_access(workspace_id))
with check (public.user_has_workspace_access(workspace_id));
create policy ai_conversations_delete on public.ai_conversations
for delete using (public.user_has_workspace_access(workspace_id));

drop policy if exists ai_messages_select on public.ai_messages;
drop policy if exists ai_messages_insert on public.ai_messages;
drop policy if exists ai_messages_update on public.ai_messages;
drop policy if exists ai_messages_delete on public.ai_messages;
create policy ai_messages_select on public.ai_messages
for select using (public.user_has_workspace_access(workspace_id));
create policy ai_messages_insert on public.ai_messages
for insert with check (public.user_has_workspace_access(workspace_id));
create policy ai_messages_update on public.ai_messages
for update using (public.user_has_workspace_access(workspace_id))
with check (public.user_has_workspace_access(workspace_id));
create policy ai_messages_delete on public.ai_messages
for delete using (public.user_has_workspace_access(workspace_id));

drop policy if exists ai_action_suggestions_select on public.ai_action_suggestions;
drop policy if exists ai_action_suggestions_insert on public.ai_action_suggestions;
drop policy if exists ai_action_suggestions_update on public.ai_action_suggestions;
drop policy if exists ai_action_suggestions_delete on public.ai_action_suggestions;
create policy ai_action_suggestions_select on public.ai_action_suggestions
for select using (public.user_has_workspace_access(workspace_id));
create policy ai_action_suggestions_insert on public.ai_action_suggestions
for insert with check (public.user_has_workspace_access(workspace_id));
create policy ai_action_suggestions_update on public.ai_action_suggestions
for update using (public.user_has_workspace_access(workspace_id))
with check (public.user_has_workspace_access(workspace_id));
create policy ai_action_suggestions_delete on public.ai_action_suggestions
for delete using (public.user_has_workspace_access(workspace_id));

create index if not exists idx_ai_conversations_workspace on public.ai_conversations(workspace_id, created_at desc);
create index if not exists idx_ai_messages_workspace on public.ai_messages(workspace_id, created_at desc);
create index if not exists idx_ai_messages_conversation on public.ai_messages(conversation_id, created_at asc);
create index if not exists idx_ai_action_suggestions_workspace on public.ai_action_suggestions(workspace_id, created_at desc);

grant select, insert, update, delete on public.ai_conversations to authenticated;
grant select, insert, update, delete on public.ai_messages to authenticated;
grant select, insert, update, delete on public.ai_action_suggestions to authenticated;
