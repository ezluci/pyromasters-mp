alter table users
add column created_at_new bigint not null default 0;

update users
set created_at_new = round(unix_timestamp(created_at) * 1000);

alter table users
drop column created_at;

alter table users
change column created_at_new created_at bigint not null;


alter table users
add column last_played_new bigint;

update users
set last_played_new = round(unix_timestamp(last_played) * 1000);

alter table users
drop column last_played;

alter table users
change column last_played_new last_played bigint;