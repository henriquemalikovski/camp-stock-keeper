-- Inserir usuário admin na tabela de profiles
-- Primeiro criamos um UUID fixo para o usuário admin
INSERT INTO public.profiles (id, user_id, full_name, email, role)
VALUES (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111'::uuid, -- UUID fictício para o admin
    'Henrique Malikovski',
    'hmalikovski@gmail.com',
    'admin'::app_role
)
ON CONFLICT (user_id) DO NOTHING;