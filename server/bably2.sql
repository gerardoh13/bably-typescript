-- psql <  bably2.sql
\echo 'Delete and recreate bably2 db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE bably2;
CREATE DATABASE bably2;
\connect bably2

\i bably-schema.sql

\echo 'Delete and recreate bably2_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE bably2_test;
CREATE DATABASE bably2_test;
\connect bably2_test

\i bably-schema.sql
