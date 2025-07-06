-- Remover companhias fictícias
DELETE FROM companies WHERE name IN ('Alpha', 'Bravo', 'Charlie', 'Delta');