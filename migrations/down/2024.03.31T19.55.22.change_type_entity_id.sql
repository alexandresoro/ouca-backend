-- down migration
ALTER TABLE basenaturaliste.donnee_comportement DROP CONSTRAINT fk_donnee_comportement_donnee_id;
ALTER TABLE basenaturaliste.donnee_milieu DROP CONSTRAINT fk_donnee_milieu_donnee_id;

ALTER TABLE basenaturaliste.donnee_comportement ALTER COLUMN donnee_id TYPE INTEGER USING (donnee_id::INTEGER);
ALTER TABLE basenaturaliste.donnee_milieu ALTER COLUMN donnee_id TYPE INTEGER USING (donnee_id::INTEGER);
ALTER TABLE basenaturaliste.donnee ALTER COLUMN id TYPE INTEGER USING (id::INTEGER);

CREATE SEQUENCE basenaturaliste.donnee_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE basenaturaliste.donnee_id_seq OWNED BY basenaturaliste.donnee.id;

ALTER TABLE basenaturaliste.donnee ALTER COLUMN id SET DEFAULT nextval('basenaturaliste.donnee_id_seq'::regclass);

ALTER TABLE basenaturaliste.donnee_comportement
    ADD CONSTRAINT fk_donnee_comportement_donnee_id FOREIGN KEY (donnee_id) REFERENCES basenaturaliste.donnee(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE basenaturaliste.donnee_milieu
    ADD CONSTRAINT fk_donnee_milieu_donnee_id FOREIGN KEY (donnee_id) REFERENCES basenaturaliste.donnee(id) ON UPDATE CASCADE ON DELETE CASCADE;
