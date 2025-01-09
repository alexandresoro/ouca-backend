-- up migration
ALTER TABLE ONLY basenaturaliste."user" ADD COLUMN ext_provider_name VARCHAR(30);

ALTER TABLE ONLY basenaturaliste."user" ADD COLUMN ext_provider_id VARCHAR(50);

CREATE UNIQUE INDEX unique_external_user ON basenaturaliste."user"(ext_provider_id, ext_provider_name) WHERE ext_provider_id IS NOT NULL AND ext_provider_name IS NOT NULL;
