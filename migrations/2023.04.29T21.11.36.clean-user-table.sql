-- up migration
ALTER TABLE ONLY basenaturaliste."user" DROP COLUMN username;
ALTER TABLE ONLY basenaturaliste."user" DROP COLUMN password;
ALTER TABLE ONLY basenaturaliste."user" DROP COLUMN role;
ALTER TABLE ONLY basenaturaliste."user" DROP COLUMN first_name;
ALTER TABLE ONLY basenaturaliste."user" DROP COLUMN last_name;
