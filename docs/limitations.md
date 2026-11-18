# CareBridge limitations (prototype)

CareBridge is a **local demonstration prototype**. It is **not HIPAA compliant** and must not be used with real protected health information (PHI).

## Data and privacy

- Demo data is synthetic; seeded PDFs are labeled accordingly.
- SQLite stores data in a local file without encryption at rest.
- Uploaded files live on disk under `storage/uploads/` without encryption.
- There is no audit log of document access beyond status history and messages.

## Security controls not implemented

- Multi-factor authentication
- Email verification and password reset
- Malware scanning on uploads
- Rate limiting at the edge (only basic in-memory login throttling)
- Database row-level security (enforced in application services instead)
- Business Associate Agreements with vendors
- Backup, monitoring, and incident response runbooks

## Production deployment would require

- Managed PostgreSQL with encryption and backups
- Private object storage with signed URLs and encryption
- Secrets management (not committed `.env` files)
- HTTPS everywhere, hardened cookies, CSRF review for all mutating endpoints
- Formal risk assessment and policy documentation

See `README.md` for the recommended deployment path (not executed in this prototype).
