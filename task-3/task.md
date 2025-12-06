Task 3:
Build a Mini Authentication + API Key System for Service-to-Service Access
Problem
Build an auth system that supports:
 User login via JWT
 Service-to-Service access via API keys
Requirements
 /auth/signup, /auth/login
 /keys/create to generate API keys
 Middleware detects:
 Bearer token (user)
 API key (service)
 Protect routes based on access type
 Add expiration or revocation for API keys