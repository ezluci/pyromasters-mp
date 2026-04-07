create table users (
   id int auto_increment primary key,
   username varchar(20) unique not null,
   password_hash varchar(255) not null,
   created_at datetime default current_timestamp not null
);