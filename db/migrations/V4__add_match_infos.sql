create table matches (
   id int auto_increment primary key,
   start_time bigint not null,
   metadata json not null check(json_valid(metadata)),
   events_json json check(json_valid(events_json))
);