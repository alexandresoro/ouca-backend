-- down migration
DROP INDEX IF EXISTS unique_external_user;

ALTER TABLE ONLY basenaturaliste."user" DROP COLUMN ext_provider_name;
ALTER TABLE ONLY basenaturaliste."user" DROP COLUMN ext_provider_id;
