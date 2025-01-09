-- down migration
UPDATE basenaturaliste."user" 
SET settings = '{}'::json
