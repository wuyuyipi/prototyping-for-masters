-- Explicit RLS Policies to secure Better Auth and Application tables from PostgREST API exposure

-- 1. Better Auth tables: block direct access through public PostgREST API
CREATE POLICY "better_auth_user_protect" ON public."user" FOR ALL USING (false);
CREATE POLICY "better_auth_session_protect" ON public."session" FOR ALL USING (false);
CREATE POLICY "better_auth_account_protect" ON public."account" FOR ALL USING (false);
CREATE POLICY "better_auth_verification_protect" ON public."verification" FOR ALL USING (false);

-- 2. Boards: allow reading public boards; deny direct mutations through PostgREST
CREATE POLICY "boards_public_read" ON public.boards FOR SELECT USING (is_public = true);
CREATE POLICY "boards_direct_write_protect" ON public.boards FOR INSERT WITH CHECK (false);
CREATE POLICY "boards_direct_update_protect" ON public.boards FOR UPDATE USING (false);
CREATE POLICY "boards_direct_delete_protect" ON public.boards FOR DELETE USING (false);

-- 3. Items: allow reading items belonging to public boards; deny direct mutations through PostgREST
CREATE POLICY "items_public_read" ON public.items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.boards 
    WHERE boards.id = items.board_id AND boards.is_public = true
  )
);
CREATE POLICY "items_direct_write_protect" ON public.items FOR INSERT WITH CHECK (false);
CREATE POLICY "items_direct_update_protect" ON public.items FOR UPDATE USING (false);
CREATE POLICY "items_direct_delete_protect" ON public.items FOR DELETE USING (false);
