-- down migration
CREATE TYPE basenaturaliste.settings_coordinates_system AS ENUM (
    'gps',
    'lambert93'
);

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