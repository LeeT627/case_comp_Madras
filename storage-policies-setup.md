# Storage Policies for Uploads Bucket

Go to Supabase Dashboard → Storage → Click on "uploads" bucket → Policies tab

Create these 4 policies:

## Policy 1: "Users can upload files"
- **Policy name**: Users can upload files
- **Target roles**: authenticated
- **Allowed operations**: INSERT
- **WITH CHECK expression**: 
```
bucket_id = 'uploads' AND (auth.uid())::text = (storage.foldername(name))[1]
```

## Policy 2: "Users can view own files"
- **Policy name**: Users can view own files
- **Target roles**: authenticated
- **Allowed operations**: SELECT
- **USING expression**: 
```
bucket_id = 'uploads' AND (auth.uid())::text = (storage.foldername(name))[1]
```

## Policy 3: "Users can update own files"
- **Policy name**: Users can update own files
- **Target roles**: authenticated
- **Allowed operations**: UPDATE
- **USING expression**: 
```
bucket_id = 'uploads' AND (auth.uid())::text = (storage.foldername(name))[1]
```
- **WITH CHECK expression**: 
```
bucket_id = 'uploads' AND (auth.uid())::text = (storage.foldername(name))[1]
```

## Policy 4: "Users can delete own files"
- **Policy name**: Users can delete own files
- **Target roles**: authenticated
- **Allowed operations**: DELETE
- **USING expression**: 
```
bucket_id = 'uploads' AND (auth.uid())::text = (storage.foldername(name))[1]
```

These policies ensure:
- Users can only upload files to their own folder (user_id/filename)
- Users can only view/update/delete their own files
- Each user's submissions are isolated from others