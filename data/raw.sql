-- stage area
CREATE TABLE  pc_game_sales_at_22_dec_2016
(
    name          varchar,
    platform      varchar,
    genre         varchar,
    publisher     varchar,
    year_of_release varchar,
    developer     varchar,
    rating        varchar,
    na_sales      varchar,
    eu_sales      varchar,
    jp_sales      varchar,
    other_sales   varchar
);

-- data warehouse
CREATE TABLE platform
(
    id   serial PRIMARY KEY,
    name varchar NOT NULL
);

CREATE TABLE genre
(
    id   serial PRIMARY KEY,
    name varchar NOT NULL
);

CREATE TABLE developer
(
    id   serial PRIMARY KEY,
    name varchar NOT NULL
);

CREATE TABLE publisher
(
    id   serial PRIMARY KEY,
    name varchar NOT NULL
);


CREATE TABLE game
(
    id            serial PRIMARY KEY,
    platform_id   int REFERENCES platform (id),
    genre_id      int REFERENCES genre (id),
    developer_id  int references developer (id),
    publisher_id  int references publisher (id),
    name          varchar NOT NULL,
    realease_year int     NOT NULL,
    rating        varchar -- E, M, T, E10+
);

CREATE TABLE sales
(
    id          serial PRIMARY KEY,
    game_id     int references game (id),
    na_sales    REAL NOT NULL,
    eu_sales    REAL NOT NULL,
    jp_sales    REAL NOT NULL,
    other_sales REAL NOT NULL
);
