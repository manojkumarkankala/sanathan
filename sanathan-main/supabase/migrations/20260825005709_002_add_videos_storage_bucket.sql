/*
# Add videos storage bucket

Adds a public storage bucket for direct video file uploads.
Policies: public read, authenticated write/update/delete (same pattern as other buckets).
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "storage_public_read_videos" ON storage.objects;
CREATE POLICY "storage_public_read_videos" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'videos');

DROP POLICY IF EXISTS "storage_auth_write_videos" ON storage.objects;
CREATE POLICY "storage_auth_write_videos" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'videos');

DROP POLICY IF EXISTS "storage_auth_update_videos" ON storage.objects;
CREATE POLICY "storage_auth_update_videos" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'videos');

DROP POLICY IF EXISTS "storage_auth_delete_videos" ON storage.objects;
CREATE POLICY "storage_auth_delete_videos" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'videos');
