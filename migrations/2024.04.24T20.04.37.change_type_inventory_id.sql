-- up migration
ALTER TABLE basenaturaliste.inventaire_associe DROP CONSTRAINT fk_inventaire_associe_inventaire_id;
ALTER TABLE basenaturaliste.inventaire_meteo DROP CONSTRAINT fk_inventaire_meteo_inventaire_id;
ALTER TABLE basenaturaliste.donnee DROP CONSTRAINT fk_donnee_inventaire_id;

ALTER TABLE basenaturaliste.inventaire ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE basenaturaliste.inventaire_id_seq;

ALTER TABLE basenaturaliste.inventaire_associe ALTER COLUMN inventaire_id TYPE VARCHAR(20) USING (inventaire_id::VARCHAR(20));
ALTER TABLE basenaturaliste.inventaire_meteo ALTER COLUMN inventaire_id TYPE VARCHAR(20) USING (inventaire_id::VARCHAR(20));
ALTER TABLE basenaturaliste.donnee ALTER COLUMN inventaire_id TYPE VARCHAR(20) USING (inventaire_id::VARCHAR(20));
ALTER TABLE basenaturaliste.inventaire ALTER COLUMN id TYPE VARCHAR(20) USING (id::VARCHAR(20));

ALTER TABLE basenaturaliste.inventaire_associe
    ADD CONSTRAINT fk_inventaire_associe_inventaire_id FOREIGN KEY (inventaire_id) REFERENCES basenaturaliste.inventaire(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE basenaturaliste.inventaire_meteo
    ADD CONSTRAINT fk_inventaire_meteo_inventaire_id FOREIGN KEY (inventaire_id) REFERENCES basenaturaliste.inventaire(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE basenaturaliste.donnee
    ADD CONSTRAINT fk_donnee_inventaire_id FOREIGN KEY (inventaire_id) REFERENCES basenaturaliste.inventaire(id) ON UPDATE CASCADE ON DELETE RESTRICT;
