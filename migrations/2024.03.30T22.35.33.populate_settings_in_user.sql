-- up migration
UPDATE basenaturaliste."user" 
SET settings = settings_query.settings
FROM (
	SELECT 
		user_id, 
		jsonb_strip_nulls(
			jsonb_build_object(
				'defaultObserverId', default_observateur_id::text, 
				'defaultDepartmentId', default_departement_id::text, 
				'defaultAgeId', default_age_id::text, 
				'defaultSexId', default_sexe_id::text, 
				'defaultNumberEstimateId', default_estimation_nombre_id::text,
				'defaultNumber', default_nombre,
				'displayAssociates', are_associes_displayed,
				'displayWeather', is_meteo_displayed,
				'displayDistance', is_distance_displayed,
				'displayGrouping', is_regroupement_displayed 
			)
		) as settings 
	FROM basenaturaliste.settings
) AS settings_query
WHERE basenaturaliste."user".id = settings_query.user_id
