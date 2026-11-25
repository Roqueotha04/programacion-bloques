-- Configuración del profe: partes ocultas por vista (normal, chicos, python). Ya está creada en la base.
create table if not exists game_config(
  edition text primary key,
  hidden jsonb not null default '[]',
  updated_at timestamptz not null default now()
);
insert into game_config(edition) values ('normal'), ('chicos'), ('python') on conflict do nothing;
