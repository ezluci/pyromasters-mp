alter table users
add column bio text not null default '',
add column last_played datetime,
add column games_played int not null default 0,
add column wins int not null default 0,
add column kills int not null default 0,
add column bombs_placed int not null default 0;