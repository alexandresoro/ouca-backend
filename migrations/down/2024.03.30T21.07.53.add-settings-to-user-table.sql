-- down migration
ALTER TABLE basenaturaliste."user" ALTER COLUMN ext_provider_id DROP NOT NULL;
ALTER TABLE basenaturaliste."user" ALTER COLUMN ext_provider_name DROP NOT NULL;

ALTER TABLE basenaturaliste."user" DROP CONSTRAINT IF EXISTS unique_external_user;

CREATE UNIQUE INDEX unique_external_user ON basenaturaliste."user"(ext_provider_id, ext_provider_name) WHERE ext_provider_id IS NOT NULL AND ext_provider_name IS NOT NULL;

ALTER TABLE basenaturaliste."user" DROP COLUMN settings;
