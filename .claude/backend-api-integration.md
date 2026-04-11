# API Integrations & Backend Protocol

## Environment Configuration
- **Base Endpoint Generation**: `constants/Config.ts` computes whether to use localhost or the staging URLs based on Expo configuration environments. Do not hardcode strings like `http://` directly in Axios calls.

## RESTful PHP Structure
- The backend relies on standard HTTP methods (POST, GET).
- JWT validation requires appending `Authorization: Bearer <TOKEN>` in the header for all requests routed towards `api/evaluations/` or `api/grade_uploads/`.
- In cases where the response structure is unexpected, build robust interfaces on the frontend. The backend may wrap JSON objects in structured `.data` properties depending on the success flag.
