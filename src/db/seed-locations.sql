INSERT OR IGNORE INTO buildings (name) VALUES
  ('Bygg A'), ('Bygg B'), ('Bygg C'), ('Bygg D'), ('Tårnet'), ('Stadion');

WITH RECURSIVE floors_to_insert(number) AS (
  SELECT 1
  UNION ALL
  SELECT number + 1 FROM floors_to_insert WHERE number < 16
)
INSERT OR IGNORE INTO floors (building_id, number)
SELECT b.id, n.number
FROM buildings AS b CROSS JOIN floors_to_insert AS n
WHERE n.number <= CASE
  WHEN b.name IN ('Bygg A','Bygg B','Bygg C','Bygg D') THEN 4
  WHEN b.name = 'Tårnet' THEN 16
  WHEN b.name = 'Stadion' THEN 5
  ELSE 0 END;
