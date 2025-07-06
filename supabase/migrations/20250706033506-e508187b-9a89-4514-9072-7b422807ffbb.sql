-- Tornar Carlos Henrique Pereira Salgado administrador
INSERT INTO public.user_roles (user_id, role)
VALUES ('432a6db8-ea7e-4cf9-b810-ed12f8c47417', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;