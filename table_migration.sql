create database if not exists eli_assignment;

use eli_assignment;

create table if not exists registrations (id int auto_increment primary key not null unique, registration_no varchar(255) not null unique, full_name varchar(50) not null, email varchar(100) not null, phone bigint not null, events text not null);

