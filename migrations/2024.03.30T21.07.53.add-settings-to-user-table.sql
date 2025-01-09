-- up migration
ALTER TABLE basenaturaliste."user" ALTER COLUMN ext_provider_id SET NOT NULL;
ALTER TABLE basenaturaliste."user" ALTER COLUMN ext_provider_name SET NOT NULL;

DROP INDEX IF EXISTS unique_external_user;

ALTER TABLE basenaturaliste."user" ADD CONSTRAINT unique_external_user UNIQUE (ext_provider_id, ext_provider_name);

ALTER TABLE basenaturaliste."user" ADD COLUMN settings JSON DEFAULT '{}'::json;
