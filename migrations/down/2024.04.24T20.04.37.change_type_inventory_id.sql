-- down migration
ALTER TABLE basenaturaliste.inventaire_associe DROP CONSTRAINT fk_inventaire_associe_inventaire_id;
ALTER TABLE basenaturaliste.inventaire_meteo DROP CONSTRAINT fk_inventaire_meteo_inventaire_id;
ALTER TABLE basenaturaliste.donnee DROP CONSTRAINT fk_donnee_inventaire_id;

ALTER TABLE basenaturaliste.inventaire_associe ALTER COLUMN inventaire_id TYPE INTEGER USING (inventaire_id::INTEGER);
ALTER TABLE basenaturaliste.inventaire_meteo ALTER COLUMN inventaire_id TYPE INTEGER USING (inventaire_id::INTEGER);
ALTER TABLE basenaturaliste.donnee ALTER COLUMN inventaire_id TYPE INTEGER USING (inventaire_id::INTEGER);
ALTER TABLE basenaturaliste.inventaire ALTER COLUMN id TYPE INTEGER USING (id::INTEGER);

CREATE SEQUENCE basenaturaliste.inventaire_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE basenaturaliste.inventaire_id_seq OWNED BY basenaturaliste.inventaire.id;

ALTER TABLE basenaturaliste.inventaire ALTER COLUMN id SET DEFAULT nextval('basenaturaliste.inventaire_id_seq'::regclass);

ALTER TABLE basenaturaliste.inventaire_associe
    ADD CONSTRAINT fk_inventaire_associe_inventaire_id FOREIGN KEY (inventaire_id) REFERENCES basenaturaliste.inventaire(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE basenaturaliste.inventaire_meteo
    ADD CONSTRAINT fk_inventaire_meteo_inventaire_id FOREIGN KEY (inventaire_id) REFERENCES basenaturaliste.inventaire(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE basenaturaliste.donnee
    ADD CONSTRAINT fk_donnee_inventaire_id FOREIGN KEY (inventaire_id) REFERENCES basenaturaliste.inventaire(id) ON UPDATE CASCADE ON DELETE RESTRICT;
