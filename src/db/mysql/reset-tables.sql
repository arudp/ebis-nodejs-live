drop schema db;
create schema db;
use db;

create table USERS
(
    id       int primary key auto_increment,
    name     varchar(255) not null,
    email    varchar(255) not null unique,
    password varchar(255) not null
);

create table TASKS
(
    id          int primary key auto_increment,
    name        varchar(255) not null,
    description text         null,
    done        tinyint      not null default 0,
    due_date    date         null
);

-- TODO: Create table to store tasks and users
-- - A task can have N users as "participants"
-- - A user can participate in M tasks
-- - This is a many-to-many relationship, or N:M
-- TODO: Then add the following endpoints:
-- - GET /tasks/:id/users
--   - Get all participants for a task
-- - GET /tasks/me
--   - Get all tasks for the logged in user
-- - PUT /tasks/:id/users/:userId
--   - Add a participant to a task
-- - DELETE /tasks/:id/users/:userId
--   - Remove a participant from a task

insert into USERS (name, email, password)
values ('Pepe', 'pepe@mail.com', 'pass');

insert into TASKS (name, description, done, due_date)
values ('Task 1', 'Description 1', 0, null),
       ('Task 2', null, 0, now() + interval 1 week),
       ('Task 3', 'Description 3', 1, now() - interval 1 day);

commit;

