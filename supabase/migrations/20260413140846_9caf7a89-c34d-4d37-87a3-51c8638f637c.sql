
DROP POLICY "Authenticated users can insert sms logs" ON public.sms_logs;

CREATE POLICY "Authenticated users can insert sms logs" ON public.sms_logs
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
