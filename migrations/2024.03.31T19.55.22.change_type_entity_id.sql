-- up migration
ALTER TABLE basenaturaliste.donnee_comportement DROP CONSTRAINT fk_donnee_comportement_donnee_id;
ALTER TABLE basenaturaliste.donnee_milieu DROP CONSTRAINT fk_donnee_milieu_donnee_id;

ALTER TABLE basenaturaliste.donnee ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE basenaturaliste.donnee_id_seq;


ALTER TABLE basenaturaliste.donnee_comportement ALTER COLUMN donnee_id TYPE VARCHAR(20) USING (donnee_id::VARCHAR(20));
ALTER TABLE basenaturaliste.donnee_milieu ALTER COLUMN donnee_id TYPE VARCHAR(20) USING (donnee_id::VARCHAR(20));
ALTER TABLE basenaturaliste.donnee ALTER COLUMN id TYPE VARCHAR(20) USING (id::VARCHAR(20));

ALTER TABLE basenaturaliste.donnee_comportement
    ADD CONSTRAINT fk_donnee_comportement_donnee_id FOREIGN KEY (donnee_id) REFERENCES basenaturaliste.donnee(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE basenaturaliste.donnee_milieu
    ADD CONSTRAINT fk_donnee_milieu_donnee_id FOREIGN KEY (donnee_id) REFERENCES basenaturaliste.donnee(id) ON UPDATE CASCADE ON DELETE CASCADE;
