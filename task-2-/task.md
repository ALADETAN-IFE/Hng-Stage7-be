Task 2:
Build an Upload Service With Background Image Processing
Problem
An endpoint where users upload images, but processing happens async.
Requirements
 /upload for file upload (S3 or local Minio)
 Publish a job to Celery / BullMQ / Sidekiq-style worker
 Worker performs:
 Resize
 Compress
 Generate a thumbnail
 Provide /upload/{id}/status
 Provide /upload/{id}/result with processed URLs
