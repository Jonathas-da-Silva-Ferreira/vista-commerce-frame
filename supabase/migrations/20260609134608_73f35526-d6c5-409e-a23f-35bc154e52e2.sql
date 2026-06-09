-- handle_new_user runs from a trigger on auth.users; no client should
-- ever call it directly. Revoking EXECUTE from PUBLIC closes that path
-- while the trigger itself continues to fire as the table owner.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;