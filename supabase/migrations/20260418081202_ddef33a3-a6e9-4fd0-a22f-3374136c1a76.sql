UPDATE auth.users
SET encrypted_password = crypt('Password123!', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE email = 'gentinegloria@gmail.com';

-- Make sure profile + admin role exist
INSERT INTO public.profiles (user_id, full_name)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', email)
FROM auth.users WHERE email = 'gentinegloria@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'gentinegloria@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;