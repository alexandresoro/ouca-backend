-- up migration
CREATE INDEX idx_inventory_date ON basenaturaliste.inventaire USING btree (date);