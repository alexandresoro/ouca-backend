--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1 (Homebrew)
-- Dumped by pg_dump version 15.1

--
-- Name: basenaturaliste; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS basenaturaliste;


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: comportement_nicheur; Type: TYPE; Schema: basenaturaliste; Owner: -
--

CREATE TYPE basenaturaliste.comportement_nicheur AS ENUM (
    'possible',
    'probable',
    'certain'
);


--
-- Name: inventaire_coordinates_system; Type: TYPE; Schema: basenaturaliste; Owner: -
--

CREATE TYPE basenaturaliste.inventaire_coordinates_system AS ENUM (
    'gps',
    'lambert93'
);


--
-- Name: lieudit_coordinates_system; Type: TYPE; Schema: basenaturaliste; Owner: -
--

CREATE TYPE basenaturaliste.lieudit_coordinates_system AS ENUM (
    'gps',
    'lambert93'
);


--
-- Name: settings_coordinates_system; Type: TYPE; Schema: basenaturaliste; Owner: -
--

CREATE TYPE basenaturaliste.settings_coordinates_system AS ENUM (
    'gps',
    'lambert93'
);


--
-- Name: user_role; Type: TYPE; Schema: basenaturaliste; Owner: -
--

CREATE TYPE basenaturaliste.user_role AS ENUM (
    'admin',
    'contributor'
);


--
-- Name: age; Type: TABLE; Schema: basenaturaliste; Owner: -
--

CREATE TABLE basenaturaliste.age (
    id integer NOT NULL,
    libelle character varying(100) NOT NULL,
    owner_id uuid
);


--
-- Name: age_id_seq; Type: SEQUENCE; Schema: basenaturaliste; Owner: -
--

CREATE SEQUENCE basenaturaliste.age_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: age_id_seq; Type: SEQUENCE OWNED BY; Schema: basenaturaliste; Owner: -
--

ALTER SEQUENCE basenaturaliste.age_id_seq OWNED BY basenaturaliste.age.id;


--
-- Name: classe; Type: TABLE; Schema: basenaturaliste; Owner: -
--

CREATE TABLE basenaturaliste.classe (
    id integer NOT NULL,
    libelle character varying(100) NOT NULL,
    owner_id uuid
);


--
-- Name: classe_id_seq; Type: SEQUENCE; Schema: basenaturaliste; Owner: -
--

CREATE SEQUENCE basenaturaliste.classe_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: classe_id_seq; Type: SEQUENCE OWNED BY; Schema: basenaturaliste; Owner: -
--

ALTER SEQUENCE basenaturaliste.classe_id_seq OWNED BY basenaturaliste.classe.id;


--
-- Name: commune; Type: TABLE; Schema: basenaturaliste; Owner: -
--

CREATE TABLE basenaturaliste.commune (
    id integer NOT NULL,
    departement_id integer NOT NULL,
    code integer NOT NULL,
    nom character varying(100) NOT NULL,
    owner_id uuid
);


--
-- Name: commune_id_seq; Type: SEQUENCE; Schema: basenaturaliste; Owner: -
--

CREATE SEQUENCE basenaturaliste.commune_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: commune_id_seq; Type: SEQUENCE OWNED BY; Schema: basenaturaliste; Owner: -
--

ALTER SEQUENCE basenaturaliste.commune_id_seq OWNED BY basenaturaliste.commune.id;


--
-- Name: comportement; Type: TABLE; Schema: basenaturaliste; Owner: -
--

CREATE TABLE basenaturaliste.comportement (
    id integer NOT NULL,
    code character varying(6) NOT NULL,
    libelle character varying(100) NOT NULL,
    nicheur basenaturaliste.comportement_nicheur,
    owner_id uuid
);


--
-- Name: comportement_id_seq; Type: SEQUENCE; Schema: basenaturaliste; Owner: -
--

CREATE SEQUENCE basenaturaliste.comportement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comportement_id_seq; Type: SEQUENCE OWNED BY; Schema: basenaturaliste; Owner: -
--

ALTER SEQUENCE basenaturaliste.comportement_id_seq OWNED BY basenaturaliste.comportement.id;


--
-- Name: departement; Type: TABLE; Schema: basenaturaliste; Owner: -
--

CREATE TABLE basenaturaliste.departement (
    id integer NOT NULL,
    code character varying(100) NOT NULL,
    owner_id uuid
);


--
-- Name: departement_id_seq; Type: SEQUENCE; Schema: basenaturaliste; Owner: -
--

CREATE SEQUENCE basenaturaliste.departement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: departement_id_seq; Type: SEQUENCE OWNED BY; Schema: basenaturaliste; Owner: -
--

ALTER SEQUENCE basenaturaliste.departement_id_seq OWNED BY basenaturaliste.departement.id;


--
-- Name: donnee; Type: TABLE; Schema: basenaturaliste; Owner: -
--

CREATE TABLE basenaturaliste.donnee (
    id integer NOT NULL,
    inventaire_id integer NOT NULL,
    espece_id integer NOT NULL,
    sexe_id integer NOT NULL,
    age_id integer NOT NULL,
    estimation_nombre_id integer NOT NULL,
    nombre integer,
    estimation_distance_id integer,
    distance integer,
    commentaire text,
    regroupement integer,
    date_creation timestamp with time zone NOT NULL
);


--
-- Name: donnee_comportement; Type: TABLE; Schema: basenaturaliste; Owner: -
--

CREATE TABLE basenaturaliste.donnee_comportement (
    comportement_id integer NOT NULL,
    donnee_id integer NOT NULL
);


--
-- Name: donnee_id_seq; Type: SEQUENCE; Schema: basenaturaliste; Owner: -
--

CREATE SEQUENCE basenaturaliste.donnee_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: donnee_id_seq; Type: SEQUENCE OWNED BY; Schema: basenaturaliste; Owner: -
--

ALTER SEQUENCE basenaturaliste.donnee_id_seq OWNED BY basenaturaliste.donnee.id;


--
-- Name: donnee_milieu; Type: TABLE; Schema: basenaturaliste; Owner: -
--

CREATE TABLE basenaturaliste.donnee_milieu (
    milieu_id integer NOT NULL,
    donnee_id integer NOT NULL
);


--
-- Name: espece; Type: TABLE; Schema: basenaturaliste; Owner: -
--

CREATE TABLE basenaturaliste.espece (
    id integer NOT NULL,
    classe_id integer,
    code character varying(20) NOT NULL,
    nom_francais character varying(100) NOT NULL,
    nom_latin character varying(100) NOT NULL,
    owner_id uuid
);


--
-- Name: espece_id_seq; Type: SEQUENCE; Schema: basenaturaliste; Owner: -
--

CREATE SEQUENCE basenaturaliste.espece_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: espece_id_seq; Type: SEQUENCE OWNED BY; Schema: basenaturaliste; Owner: -
--

ALTER SEQUENCE basenaturaliste.espece_id_seq OWNED BY basenaturaliste.espece.id;


--
-- Name: estimation_distance; Type: TABLE; Schema: basenaturaliste; Owner: -
--

CREATE TABLE basenaturaliste.estimation_distance (
    id integer NOT NULL,
    libelle character varying(100) NOT NULL,
    owner_id uuid
);


--
-- Name: estimation_distance_id_seq; Type: SEQUENCE; Schema: basenaturaliste; Owner: -
--

CREATE SEQUENCE basenaturaliste.estimation_distance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: estimation_distance_id_seq; Type: SEQUENCE OWNED BY; Schema: basenaturaliste; Owner: -
--

ALTER SEQUENCE basenaturaliste.estimation_distance_id_seq OWNED BY basenaturaliste.estimation_distance.id;


--
-- Name: estimation_nombre; Type: TABLE; Schema: basenaturaliste; Owner: -
--

CREATE TABLE basenaturaliste.estimation_nombre (
    id integer NOT NULL,
    libelle character varying(100) NOT NULL,
    non_compte boolean NOT NULL,
    owner_id uuid
);


--
-- Name: estimation_nombre_id_seq; Type: SEQUENCE; Schema: basenaturaliste; Owner: -
--

CREATE SEQUENCE basenaturaliste.estimation_nombre_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: estimation_nombre_id_seq; Type: SEQUENCE OWNED BY; Schema: basenaturaliste; Owner: -
--

ALTER SEQUENCE basenaturaliste.estimation_nombre_id_seq OWNED BY basenaturaliste.estimation_nombre.id;


--
-- Name: inventaire; Type: TABLE; Schema: basenaturaliste; Owner: -
--

CREATE TABLE basenaturaliste.inventaire (
    id integer NOT NULL,
    observateur_id integer NOT NULL,
    date date NOT NULL,
    heure character varying(5) DEFAULT NULL::character varying,
    duree character varying(5) DEFAULT NULL::character varying,
    lieudit_id integer NOT NULL,
    altitude integer,
    longitude numeric(13,6) DEFAULT NULL::numeric,
    latitude numeric(13,6) DEFAULT NULL::numeric,
    coordinates_system basenaturaliste.inventaire_coordinates_system,
    temperature smallint,
    date_creation timestamp with time zone NOT NULL,
    owner_id uuid
);


--
-- Name: inventaire_associe; Type: TABLE; Schema: basenaturaliste; Owner: -
--

CREATE TABLE basenaturaliste.inventaire_associe (
    inventaire_id integer NOT NULL,
    observateur_id integer NOT NULL
);


--
-- Name: inventaire_id_seq; Type: SEQUENCE; Schema: basenaturaliste; Owner: -
--

CREATE SEQUENCE basenaturaliste.inventaire_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inventaire_id_seq; Type: SEQUENCE OWNED BY; Schema: basenaturaliste; Owner: -
--

ALTER SEQUENCE basenaturaliste.inventaire_id_seq OWNED BY basenaturaliste.inventaire.id;


--
-- Name: inventaire_meteo; Type: TABLE; Schema: basenaturaliste; Owner: -
--

CREATE TABLE basenaturaliste.inventaire_meteo (
    meteo_id integer NOT NULL,
    inventaire_id integer NOT NULL
);


--
-- Name: lieudit; Type: TABLE; Schema: basenaturaliste; Owner: -
--

CREATE TABLE basenaturaliste.lieudit (
    id integer NOT NULL,
    commune_id integer NOT NULL,
    nom character varying(150) NOT NULL,
    altitude integer NOT NULL,
    longitude numeric(13,6) NOT NULL,
    latitude numeric(16,6) NOT NULL,
    coordinates_system basenaturaliste.lieudit_coordinates_system NOT NULL,
    owner_id uuid
);


--
-- Name: lieudit_id_seq; Type: SEQUENCE; Schema: basenaturaliste; Owner: -
--

CREATE SEQUENCE basenaturaliste.lieudit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lieudit_id_seq; Type: SEQUENCE OWNED BY; Schema: basenaturaliste; Owner: -
--

ALTER SEQUENCE basenaturaliste.lieudit_id_seq OWNED BY basenaturaliste.lieudit.id;


--
-- Name: meteo; Type: TABLE; Schema: basenaturaliste; Owner: -
--

CREATE TABLE basenaturaliste.meteo (
    id integer NOT NULL,
    libelle character varying(100) NOT NULL,
    owner_id uuid
);


--
-- Name: meteo_id_seq; Type: SEQUENCE; Schema: basenaturaliste; Owner: -
--

CREATE SEQUENCE basenaturaliste.meteo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: meteo_id_seq; Type: SEQUENCE OWNED BY; Schema: basenaturaliste; Owner: -
--

ALTER SEQUENCE basenaturaliste.meteo_id_seq OWNED BY basenaturaliste.meteo.id;


--
-- Name: milieu; Type: TABLE; Schema: basenaturaliste; Owner: -
--

CREATE TABLE basenaturaliste.milieu (
    id integer NOT NULL,
    code character varying(6) NOT NULL,
    libelle character varying(100) NOT NULL,
    owner_id uuid
);


--
-- Name: milieu_id_seq; Type: SEQUENCE; Schema: basenaturaliste; Owner: -
--

CREATE SEQUENCE basenaturaliste.milieu_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: milieu_id_seq; Type: SEQUENCE OWNED BY; Schema: basenaturaliste; Owner: -
--

ALTER SEQUENCE basenaturaliste.milieu_id_seq OWNED BY basenaturaliste.milieu.id;


--
-- Name: observateur; Type: TABLE; Schema: basenaturaliste; Owner: -
--

CREATE TABLE basenaturaliste.observateur (
    id integer NOT NULL,
    libelle character varying(100) NOT NULL,
    owner_id uuid
);


--
-- Name: observateur_id_seq; Type: SEQUENCE; Schema: basenaturaliste; Owner: -
--

CREATE SEQUENCE basenaturaliste.observateur_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: observateur_id_seq; Type: SEQUENCE OWNED BY; Schema: basenaturaliste; Owner: -
--

ALTER SEQUENCE basenaturaliste.observateur_id_seq OWNED BY basenaturaliste.observateur.id;


--
-- Name: settings; Type: TABLE; Schema: basenaturaliste; Owner: -
--

CREATE TABLE basenaturaliste.settings (
    id integer NOT NULL,
    default_observateur_id integer,
    default_departement_id integer,
    default_age_id integer,
    default_sexe_id integer,
    default_estimation_nombre_id integer,
    default_nombre integer,
    are_associes_displayed boolean DEFAULT true NOT NULL,
    is_meteo_displayed boolean DEFAULT true NOT NULL,
    is_distance_displayed boolean DEFAULT true NOT NULL,
    is_regroupement_displayed boolean DEFAULT true NOT NULL,
    coordinates_system basenaturaliste.settings_coordinates_system DEFAULT 'gps'::basenaturaliste.settings_coordinates_system NOT NULL,
    user_id uuid NOT NULL
);


--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: basenaturaliste; Owner: -
--

CREATE SEQUENCE basenaturaliste.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: basenaturaliste; Owner: -
--

ALTER SEQUENCE basenaturaliste.settings_id_seq OWNED BY basenaturaliste.settings.id;


--
-- Name: sexe; Type: TABLE; Schema: basenaturaliste; Owner: -
--

CREATE TABLE basenaturaliste.sexe (
    id integer NOT NULL,
    libelle character varying(100) NOT NULL,
    owner_id uuid
);


--
-- Name: sexe_id_seq; Type: SEQUENCE; Schema: basenaturaliste; Owner: -
--

CREATE SEQUENCE basenaturaliste.sexe_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sexe_id_seq; Type: SEQUENCE OWNED BY; Schema: basenaturaliste; Owner: -
--

ALTER SEQUENCE basenaturaliste.sexe_id_seq OWNED BY basenaturaliste.sexe.id;


--
-- Name: user; Type: TABLE; Schema: basenaturaliste; Owner: -
--

CREATE TABLE basenaturaliste."user" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(161) NOT NULL,
    role basenaturaliste.user_role NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) DEFAULT NULL::character varying
);


--
-- Name: age id; Type: DEFAULT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.age ALTER COLUMN id SET DEFAULT nextval('basenaturaliste.age_id_seq'::regclass);


--
-- Name: classe id; Type: DEFAULT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.classe ALTER COLUMN id SET DEFAULT nextval('basenaturaliste.classe_id_seq'::regclass);


--
-- Name: commune id; Type: DEFAULT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.commune ALTER COLUMN id SET DEFAULT nextval('basenaturaliste.commune_id_seq'::regclass);


--
-- Name: comportement id; Type: DEFAULT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.comportement ALTER COLUMN id SET DEFAULT nextval('basenaturaliste.comportement_id_seq'::regclass);


--
-- Name: departement id; Type: DEFAULT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.departement ALTER COLUMN id SET DEFAULT nextval('basenaturaliste.departement_id_seq'::regclass);


--
-- Name: donnee id; Type: DEFAULT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.donnee ALTER COLUMN id SET DEFAULT nextval('basenaturaliste.donnee_id_seq'::regclass);


--
-- Name: espece id; Type: DEFAULT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.espece ALTER COLUMN id SET DEFAULT nextval('basenaturaliste.espece_id_seq'::regclass);


--
-- Name: estimation_distance id; Type: DEFAULT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.estimation_distance ALTER COLUMN id SET DEFAULT nextval('basenaturaliste.estimation_distance_id_seq'::regclass);


--
-- Name: estimation_nombre id; Type: DEFAULT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.estimation_nombre ALTER COLUMN id SET DEFAULT nextval('basenaturaliste.estimation_nombre_id_seq'::regclass);


--
-- Name: inventaire id; Type: DEFAULT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.inventaire ALTER COLUMN id SET DEFAULT nextval('basenaturaliste.inventaire_id_seq'::regclass);


--
-- Name: lieudit id; Type: DEFAULT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.lieudit ALTER COLUMN id SET DEFAULT nextval('basenaturaliste.lieudit_id_seq'::regclass);


--
-- Name: meteo id; Type: DEFAULT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.meteo ALTER COLUMN id SET DEFAULT nextval('basenaturaliste.meteo_id_seq'::regclass);


--
-- Name: milieu id; Type: DEFAULT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.milieu ALTER COLUMN id SET DEFAULT nextval('basenaturaliste.milieu_id_seq'::regclass);


--
-- Name: observateur id; Type: DEFAULT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.observateur ALTER COLUMN id SET DEFAULT nextval('basenaturaliste.observateur_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.settings ALTER COLUMN id SET DEFAULT nextval('basenaturaliste.settings_id_seq'::regclass);


--
-- Name: sexe id; Type: DEFAULT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.sexe ALTER COLUMN id SET DEFAULT nextval('basenaturaliste.sexe_id_seq'::regclass);


--
-- Name: age idx_16418_primary; Type: CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.age
    ADD CONSTRAINT idx_16418_primary PRIMARY KEY (id);


--
-- Name: classe idx_16431_primary; Type: CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.classe
    ADD CONSTRAINT idx_16431_primary PRIMARY KEY (id);


--
-- Name: commune idx_16444_primary; Type: CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.commune
    ADD CONSTRAINT idx_16444_primary PRIMARY KEY (id);


--
-- Name: comportement idx_16457_primary; Type: CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.comportement
    ADD CONSTRAINT idx_16457_primary PRIMARY KEY (id);


--
-- Name: departement idx_16471_primary; Type: CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.departement
    ADD CONSTRAINT idx_16471_primary PRIMARY KEY (id);


--
-- Name: donnee idx_16484_primary; Type: CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.donnee
    ADD CONSTRAINT idx_16484_primary PRIMARY KEY (id);


--
-- Name: donnee_comportement idx_16490_primary; Type: CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.donnee_comportement
    ADD CONSTRAINT idx_16490_primary PRIMARY KEY (donnee_id, comportement_id);


--
-- Name: donnee_milieu idx_16493_primary; Type: CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.donnee_milieu
    ADD CONSTRAINT idx_16493_primary PRIMARY KEY (donnee_id, milieu_id);


--
-- Name: espece idx_16497_primary; Type: CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.espece
    ADD CONSTRAINT idx_16497_primary PRIMARY KEY (id);


--
-- Name: estimation_distance idx_16510_primary; Type: CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.estimation_distance
    ADD CONSTRAINT idx_16510_primary PRIMARY KEY (id);


--
-- Name: estimation_nombre idx_16523_primary; Type: CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.estimation_nombre
    ADD CONSTRAINT idx_16523_primary PRIMARY KEY (id);


--
-- Name: inventaire idx_16536_primary; Type: CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.inventaire
    ADD CONSTRAINT idx_16536_primary PRIMARY KEY (id);


--
-- Name: inventaire_associe idx_16545_primary; Type: CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.inventaire_associe
    ADD CONSTRAINT idx_16545_primary PRIMARY KEY (inventaire_id, observateur_id);


--
-- Name: inventaire_meteo idx_16548_primary; Type: CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.inventaire_meteo
    ADD CONSTRAINT idx_16548_primary PRIMARY KEY (inventaire_id, meteo_id);


--
-- Name: lieudit idx_16552_primary; Type: CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.lieudit
    ADD CONSTRAINT idx_16552_primary PRIMARY KEY (id);


--
-- Name: meteo idx_16565_primary; Type: CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.meteo
    ADD CONSTRAINT idx_16565_primary PRIMARY KEY (id);


--
-- Name: milieu idx_16578_primary; Type: CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.milieu
    ADD CONSTRAINT idx_16578_primary PRIMARY KEY (id);


--
-- Name: observateur idx_16591_primary; Type: CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.observateur
    ADD CONSTRAINT idx_16591_primary PRIMARY KEY (id);


--
-- Name: settings idx_16604_primary; Type: CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.settings
    ADD CONSTRAINT idx_16604_primary PRIMARY KEY (id);


--
-- Name: sexe idx_16610_primary; Type: CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.sexe
    ADD CONSTRAINT idx_16610_primary PRIMARY KEY (id);


--
-- Name: user idx_16622_primary; Type: CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste."user"
    ADD CONSTRAINT idx_16622_primary PRIMARY KEY (id);


--
-- Name: idx_16418_age_libelle_key; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE UNIQUE INDEX idx_16418_age_libelle_key ON basenaturaliste.age USING btree (libelle);


--
-- Name: idx_16418_fk_age_owner_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16418_fk_age_owner_id ON basenaturaliste.age USING btree (owner_id);


--
-- Name: idx_16431_classe_libelle_key; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE UNIQUE INDEX idx_16431_classe_libelle_key ON basenaturaliste.classe USING btree (libelle);


--
-- Name: idx_16431_fk_classe_owner_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16431_fk_classe_owner_id ON basenaturaliste.classe USING btree (owner_id);


--
-- Name: idx_16444_commune_departement_id_code_key; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE UNIQUE INDEX idx_16444_commune_departement_id_code_key ON basenaturaliste.commune USING btree (departement_id, code);


--
-- Name: idx_16444_commune_departement_id_nom_key; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE UNIQUE INDEX idx_16444_commune_departement_id_nom_key ON basenaturaliste.commune USING btree (departement_id, nom);


--
-- Name: idx_16444_fk_commune_owner_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16444_fk_commune_owner_id ON basenaturaliste.commune USING btree (owner_id);


--
-- Name: idx_16457_comportement_code_key; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE UNIQUE INDEX idx_16457_comportement_code_key ON basenaturaliste.comportement USING btree (code);


--
-- Name: idx_16457_comportement_libelle_key; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE UNIQUE INDEX idx_16457_comportement_libelle_key ON basenaturaliste.comportement USING btree (libelle);


--
-- Name: idx_16457_fk_comportement_owner_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16457_fk_comportement_owner_id ON basenaturaliste.comportement USING btree (owner_id);


--
-- Name: idx_16471_departement_code_key; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE UNIQUE INDEX idx_16471_departement_code_key ON basenaturaliste.departement USING btree (code);


--
-- Name: idx_16471_fk_departement_owner_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16471_fk_departement_owner_id ON basenaturaliste.departement USING btree (owner_id);


--
-- Name: idx_16484_fk_donnee_age_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16484_fk_donnee_age_id ON basenaturaliste.donnee USING btree (age_id);


--
-- Name: idx_16484_fk_donnee_espece_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16484_fk_donnee_espece_id ON basenaturaliste.donnee USING btree (espece_id);


--
-- Name: idx_16484_fk_donnee_estimation_distance_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16484_fk_donnee_estimation_distance_id ON basenaturaliste.donnee USING btree (estimation_distance_id);


--
-- Name: idx_16484_fk_donnee_estimation_nombre_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16484_fk_donnee_estimation_nombre_id ON basenaturaliste.donnee USING btree (estimation_nombre_id);


--
-- Name: idx_16484_fk_donnee_inventaire_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16484_fk_donnee_inventaire_id ON basenaturaliste.donnee USING btree (inventaire_id);


--
-- Name: idx_16484_fk_donnee_sexe_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16484_fk_donnee_sexe_id ON basenaturaliste.donnee USING btree (sexe_id);


--
-- Name: idx_16490_fk_donnee_comportement_comportement_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16490_fk_donnee_comportement_comportement_id ON basenaturaliste.donnee_comportement USING btree (comportement_id);


--
-- Name: idx_16493_fk_donnee_milieu_milieu_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16493_fk_donnee_milieu_milieu_id ON basenaturaliste.donnee_milieu USING btree (milieu_id);


--
-- Name: idx_16497_espece_code_key; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE UNIQUE INDEX idx_16497_espece_code_key ON basenaturaliste.espece USING btree (code);


--
-- Name: idx_16497_espece_nom_francais_key; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE UNIQUE INDEX idx_16497_espece_nom_francais_key ON basenaturaliste.espece USING btree (nom_francais);


--
-- Name: idx_16497_espece_nom_latin_key; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE UNIQUE INDEX idx_16497_espece_nom_latin_key ON basenaturaliste.espece USING btree (nom_latin);


--
-- Name: idx_16497_fk_espece_classe_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16497_fk_espece_classe_id ON basenaturaliste.espece USING btree (classe_id);


--
-- Name: idx_16497_fk_espece_owner_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16497_fk_espece_owner_id ON basenaturaliste.espece USING btree (owner_id);


--
-- Name: idx_16510_estimation_distance_libelle_key; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE UNIQUE INDEX idx_16510_estimation_distance_libelle_key ON basenaturaliste.estimation_distance USING btree (libelle);


--
-- Name: idx_16510_fk_estimation_distance_owner_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16510_fk_estimation_distance_owner_id ON basenaturaliste.estimation_distance USING btree (owner_id);


--
-- Name: idx_16523_estimation_nombre_libelle_key; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE UNIQUE INDEX idx_16523_estimation_nombre_libelle_key ON basenaturaliste.estimation_nombre USING btree (libelle);


--
-- Name: idx_16523_fk_estimation_nombre_owner_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16523_fk_estimation_nombre_owner_id ON basenaturaliste.estimation_nombre USING btree (owner_id);


--
-- Name: idx_16536_fk_inventaire_lieudit_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16536_fk_inventaire_lieudit_id ON basenaturaliste.inventaire USING btree (lieudit_id);


--
-- Name: idx_16536_fk_inventaire_observateur_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16536_fk_inventaire_observateur_id ON basenaturaliste.inventaire USING btree (observateur_id);


--
-- Name: idx_16536_fk_inventaire_owner_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16536_fk_inventaire_owner_id ON basenaturaliste.inventaire USING btree (owner_id);


--
-- Name: idx_16545_fk_inventaire_associe_observateur_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16545_fk_inventaire_associe_observateur_id ON basenaturaliste.inventaire_associe USING btree (observateur_id);


--
-- Name: idx_16548_fk_inventaire_meteo_meteo_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16548_fk_inventaire_meteo_meteo_id ON basenaturaliste.inventaire_meteo USING btree (meteo_id);


--
-- Name: idx_16552_fk_lieudit_owner_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16552_fk_lieudit_owner_id ON basenaturaliste.lieudit USING btree (owner_id);


--
-- Name: idx_16552_lieudit_commune_id_nom_key; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE UNIQUE INDEX idx_16552_lieudit_commune_id_nom_key ON basenaturaliste.lieudit USING btree (commune_id, nom);


--
-- Name: idx_16565_fk_meteo_owner_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16565_fk_meteo_owner_id ON basenaturaliste.meteo USING btree (owner_id);


--
-- Name: idx_16565_meteo_libelle_key; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE UNIQUE INDEX idx_16565_meteo_libelle_key ON basenaturaliste.meteo USING btree (libelle);


--
-- Name: idx_16578_fk_milieu_owner_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16578_fk_milieu_owner_id ON basenaturaliste.milieu USING btree (owner_id);


--
-- Name: idx_16578_milieu_code_key; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE UNIQUE INDEX idx_16578_milieu_code_key ON basenaturaliste.milieu USING btree (code);


--
-- Name: idx_16578_milieu_libelle_key; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE UNIQUE INDEX idx_16578_milieu_libelle_key ON basenaturaliste.milieu USING btree (libelle);


--
-- Name: idx_16591_fk_observateur_owner_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16591_fk_observateur_owner_id ON basenaturaliste.observateur USING btree (owner_id);


--
-- Name: idx_16591_observateur_libelle_key; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE UNIQUE INDEX idx_16591_observateur_libelle_key ON basenaturaliste.observateur USING btree (libelle);


--
-- Name: idx_16604_fk_settings_age_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16604_fk_settings_age_id ON basenaturaliste.settings USING btree (default_age_id);


--
-- Name: idx_16604_fk_settings_departement_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16604_fk_settings_departement_id ON basenaturaliste.settings USING btree (default_departement_id);


--
-- Name: idx_16604_fk_settings_estimation_nombre_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16604_fk_settings_estimation_nombre_id ON basenaturaliste.settings USING btree (default_estimation_nombre_id);


--
-- Name: idx_16604_fk_settings_observateur_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16604_fk_settings_observateur_id ON basenaturaliste.settings USING btree (default_observateur_id);


--
-- Name: idx_16604_fk_settings_sexe_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16604_fk_settings_sexe_id ON basenaturaliste.settings USING btree (default_sexe_id);


--
-- Name: idx_16604_settings_user_id_key; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE UNIQUE INDEX idx_16604_settings_user_id_key ON basenaturaliste.settings USING btree (user_id);


--
-- Name: idx_16610_fk_sexe_owner_id; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE INDEX idx_16610_fk_sexe_owner_id ON basenaturaliste.sexe USING btree (owner_id);


--
-- Name: idx_16610_sexe_libelle_key; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE UNIQUE INDEX idx_16610_sexe_libelle_key ON basenaturaliste.sexe USING btree (libelle);


--
-- Name: idx_16622_user_username_key; Type: INDEX; Schema: basenaturaliste; Owner: -
--

CREATE UNIQUE INDEX idx_16622_user_username_key ON basenaturaliste."user" USING btree (username);


--
-- Name: age fk_age_owner_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.age
    ADD CONSTRAINT fk_age_owner_id FOREIGN KEY (owner_id) REFERENCES basenaturaliste."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: classe fk_classe_owner_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.classe
    ADD CONSTRAINT fk_classe_owner_id FOREIGN KEY (owner_id) REFERENCES basenaturaliste."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: commune fk_commune_departement_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.commune
    ADD CONSTRAINT fk_commune_departement_id FOREIGN KEY (departement_id) REFERENCES basenaturaliste.departement(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: commune fk_commune_owner_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.commune
    ADD CONSTRAINT fk_commune_owner_id FOREIGN KEY (owner_id) REFERENCES basenaturaliste."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: comportement fk_comportement_owner_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.comportement
    ADD CONSTRAINT fk_comportement_owner_id FOREIGN KEY (owner_id) REFERENCES basenaturaliste."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: departement fk_departement_owner_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.departement
    ADD CONSTRAINT fk_departement_owner_id FOREIGN KEY (owner_id) REFERENCES basenaturaliste."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: donnee fk_donnee_age_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.donnee
    ADD CONSTRAINT fk_donnee_age_id FOREIGN KEY (age_id) REFERENCES basenaturaliste.age(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: donnee_comportement fk_donnee_comportement_comportement_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.donnee_comportement
    ADD CONSTRAINT fk_donnee_comportement_comportement_id FOREIGN KEY (comportement_id) REFERENCES basenaturaliste.comportement(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: donnee_comportement fk_donnee_comportement_donnee_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.donnee_comportement
    ADD CONSTRAINT fk_donnee_comportement_donnee_id FOREIGN KEY (donnee_id) REFERENCES basenaturaliste.donnee(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: donnee fk_donnee_espece_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.donnee
    ADD CONSTRAINT fk_donnee_espece_id FOREIGN KEY (espece_id) REFERENCES basenaturaliste.espece(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: donnee fk_donnee_estimation_distance_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.donnee
    ADD CONSTRAINT fk_donnee_estimation_distance_id FOREIGN KEY (estimation_distance_id) REFERENCES basenaturaliste.estimation_distance(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: donnee fk_donnee_estimation_nombre_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.donnee
    ADD CONSTRAINT fk_donnee_estimation_nombre_id FOREIGN KEY (estimation_nombre_id) REFERENCES basenaturaliste.estimation_nombre(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: donnee fk_donnee_inventaire_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.donnee
    ADD CONSTRAINT fk_donnee_inventaire_id FOREIGN KEY (inventaire_id) REFERENCES basenaturaliste.inventaire(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: donnee_milieu fk_donnee_milieu_donnee_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.donnee_milieu
    ADD CONSTRAINT fk_donnee_milieu_donnee_id FOREIGN KEY (donnee_id) REFERENCES basenaturaliste.donnee(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: donnee_milieu fk_donnee_milieu_milieu_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.donnee_milieu
    ADD CONSTRAINT fk_donnee_milieu_milieu_id FOREIGN KEY (milieu_id) REFERENCES basenaturaliste.milieu(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: donnee fk_donnee_sexe_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.donnee
    ADD CONSTRAINT fk_donnee_sexe_id FOREIGN KEY (sexe_id) REFERENCES basenaturaliste.sexe(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: espece fk_espece_classe_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.espece
    ADD CONSTRAINT fk_espece_classe_id FOREIGN KEY (classe_id) REFERENCES basenaturaliste.classe(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: espece fk_espece_owner_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.espece
    ADD CONSTRAINT fk_espece_owner_id FOREIGN KEY (owner_id) REFERENCES basenaturaliste."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: estimation_distance fk_estimation_distance_owner_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.estimation_distance
    ADD CONSTRAINT fk_estimation_distance_owner_id FOREIGN KEY (owner_id) REFERENCES basenaturaliste."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: estimation_nombre fk_estimation_nombre_owner_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.estimation_nombre
    ADD CONSTRAINT fk_estimation_nombre_owner_id FOREIGN KEY (owner_id) REFERENCES basenaturaliste."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: inventaire_associe fk_inventaire_associe_inventaire_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.inventaire_associe
    ADD CONSTRAINT fk_inventaire_associe_inventaire_id FOREIGN KEY (inventaire_id) REFERENCES basenaturaliste.inventaire(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventaire_associe fk_inventaire_associe_observateur_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.inventaire_associe
    ADD CONSTRAINT fk_inventaire_associe_observateur_id FOREIGN KEY (observateur_id) REFERENCES basenaturaliste.observateur(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventaire fk_inventaire_lieudit_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.inventaire
    ADD CONSTRAINT fk_inventaire_lieudit_id FOREIGN KEY (lieudit_id) REFERENCES basenaturaliste.lieudit(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inventaire_meteo fk_inventaire_meteo_inventaire_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.inventaire_meteo
    ADD CONSTRAINT fk_inventaire_meteo_inventaire_id FOREIGN KEY (inventaire_id) REFERENCES basenaturaliste.inventaire(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventaire_meteo fk_inventaire_meteo_meteo_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.inventaire_meteo
    ADD CONSTRAINT fk_inventaire_meteo_meteo_id FOREIGN KEY (meteo_id) REFERENCES basenaturaliste.meteo(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventaire fk_inventaire_observateur_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.inventaire
    ADD CONSTRAINT fk_inventaire_observateur_id FOREIGN KEY (observateur_id) REFERENCES basenaturaliste.observateur(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inventaire fk_inventaire_owner_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.inventaire
    ADD CONSTRAINT fk_inventaire_owner_id FOREIGN KEY (owner_id) REFERENCES basenaturaliste."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: lieudit fk_lieudit_commune_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.lieudit
    ADD CONSTRAINT fk_lieudit_commune_id FOREIGN KEY (commune_id) REFERENCES basenaturaliste.commune(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lieudit fk_lieudit_owner_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.lieudit
    ADD CONSTRAINT fk_lieudit_owner_id FOREIGN KEY (owner_id) REFERENCES basenaturaliste."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: meteo fk_meteo_owner_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.meteo
    ADD CONSTRAINT fk_meteo_owner_id FOREIGN KEY (owner_id) REFERENCES basenaturaliste."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: milieu fk_milieu_owner_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.milieu
    ADD CONSTRAINT fk_milieu_owner_id FOREIGN KEY (owner_id) REFERENCES basenaturaliste."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: observateur fk_observateur_owner_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.observateur
    ADD CONSTRAINT fk_observateur_owner_id FOREIGN KEY (owner_id) REFERENCES basenaturaliste."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: settings fk_settings_age_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.settings
    ADD CONSTRAINT fk_settings_age_id FOREIGN KEY (default_age_id) REFERENCES basenaturaliste.age(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: settings fk_settings_departement_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.settings
    ADD CONSTRAINT fk_settings_departement_id FOREIGN KEY (default_departement_id) REFERENCES basenaturaliste.departement(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: settings fk_settings_estimation_nombre_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.settings
    ADD CONSTRAINT fk_settings_estimation_nombre_id FOREIGN KEY (default_estimation_nombre_id) REFERENCES basenaturaliste.estimation_nombre(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: settings fk_settings_observateur_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.settings
    ADD CONSTRAINT fk_settings_observateur_id FOREIGN KEY (default_observateur_id) REFERENCES basenaturaliste.observateur(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: settings fk_settings_sexe_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.settings
    ADD CONSTRAINT fk_settings_sexe_id FOREIGN KEY (default_sexe_id) REFERENCES basenaturaliste.sexe(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: settings fk_settings_user_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.settings
    ADD CONSTRAINT fk_settings_user_id FOREIGN KEY (user_id) REFERENCES basenaturaliste."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sexe fk_sexe_owner_id; Type: FK CONSTRAINT; Schema: basenaturaliste; Owner: -
--

ALTER TABLE ONLY basenaturaliste.sexe
    ADD CONSTRAINT fk_sexe_owner_id FOREIGN KEY (owner_id) REFERENCES basenaturaliste."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

