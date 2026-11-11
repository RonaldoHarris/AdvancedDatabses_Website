# NEWCORP — Flask + SQL Server integration

This package connects the existing NEWCORP HTML/CSS/JavaScript interface to the user's **NEWCORP Nov 7.sql** schema through Flask and `pyodbc`. The frontend now loads SQL-backed state from `/api/bootstrap`, and buttons/forms call Python API routes. Browser `localStorage` is no longer the source of truth. **No payment gateway is integrated**: a donation records a database row, but does not transfer money.

## Folder layout

```
NEWCORP_Flask_Integration/
├─ app.py                       Flask backend / API
├─ templates/index.html         Original NEWCORP markup adapted for Flask
├─ static/app.js                Original NEWCORP interactions adapted for API
├─ static/styles.css            Original visual design
├─ .env.example                 Connection configuration template
├─ requirements.txt             Python dependencies
└─ README.md
```

## 1. Prepare your SQL Server database

1. Use **a test SQL Server database / backup**. The original uploaded `.sql` contains `CREATE DATABASE NEWCORP_DB`, seed inserts, demo transactions, triggers and `CREATE LOGIN` statements. Do not rerun the entire file against a populated database without reviewing the destructive/demo statements and server logins.
2. Ensure the latest objects at the end of `NEWCORP Nov 7.sql` actually exist: `APP_ROLE`, new columns `USER_.Password_Hash`, `USER_.Is_Active`, `USER_.Role_ID`, `TEAM.Leader_User_ID`, `PROJECT.Approval_Status`, plus all `sp_*` procedures including `sp_MakeDonation`, `sp_RegisterUser`, `sp_ModerateProject` and the `Project_Log`/`AUDIT_LOG` tables.
3. The database credential used by Flask needs `SELECT` on relevant tables and `EXECUTE` on the stored procedures. The user should **not** connect with `sa`, and the web users must **not** connect to SQL Server directly. Use a dedicated app DB login with least privileges once your team finalizes deployment.
4. The seeded users (`John Brown`, etc.) have `NULL Password_Hash`, so **they cannot sign in**. Register a **new** account from the website instead of using a fake preview login. These seed users can remain for reports and team membership demonstrations.
5. To enable moderator functions, register an account and, **after verifying which account should be trusted**, promote it via SSMS:

```sql
UPDATE dbo.USER_
SET Role_ID = (SELECT Role_ID FROM dbo.APP_ROLE WHERE Role_Name='Moderator')
WHERE Email_Address = 'the-verified-moderator@example.com';
```

**Only assign moderator status to the intended person.** Log out and sign in again to see the moderator pages. The authorization check is in Python, not in client-side JavaScript.

## 2. Install prerequisites

- Windows with Python 3.11+ recommended.
- SQL Server 2025 or a compatible SQL Server installation, with `NEWCORP_DB` created.
- Microsoft ODBC Driver 18 for SQL Server (or a compatible installed driver). Open Windows ODBC Data Sources to check available drivers.

In PowerShell, open the `NEWCORP_Flask_Integration` folder and run:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `.env` with your SQL Server instance details. For local SQL Server Express, the server may be `localhost\SQLEXPRESS`. For SSMS with Windows Authentication, leave `SQL_USER` and `SQL_PASSWORD` blank. For a SQL login, specify both. Generate a secret value:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

Copy the output into `FLASK_SECRET_KEY` in `.env`. This is a **development setup**; for deployment over HTTPS, set `COOKIE_SECURE=true`, use a production WSGI server, ensure proper TLS and add stronger deployment hardening.

## 3. Run the application

```powershell
python app.py
```

Open **http://127.0.0.1:5000/** in your browser. Do **not** double-click `index.html` or use VS Code Live Server for this version; Flask must serve both the web pages and `/api` on the same origin.

Check **http://127.0.0.1:5000/api/health** to verify Flask connects to SQL Server.

## 4. Verify functional integration

1. Visit Projects, Teams and Reports to confirm existing SQL data is displayed.
2. Register a new user using a new email address; this invokes `sp_RegisterUser` and stores a Werkzeug password hash.
3. Sign out/in using the same credentials. **No preview-as-moderator selector remains.**
4. Create a team: `sp_CreateTeam` creates the team, membership and initial leader atomically.
5. Create a Charity/Commercial project under a team you belong to. It starts as **Pending**.
6. Promote your intended moderator in SSMS, sign in as them and approve/reject a pending project.
7. Test a donation against a newly approved project whose closing date is today or later. The seeded projects all closed in 2026, so they are intentionally not accepting donations. **Recording a donation is not payment collection.**
8. Try changing leadership, removing a member, editing a project, and deactivating an account as an authorized moderator.

The backend uses the browser's authenticated Flask session for identity; **user IDs and moderator roles received from the browser are not trusted as permissions**. Form mutations include an anti-CSRF token. SQL Server stored procedures and triggers remain responsible for final data-integrity checks.

## Integration endpoints

| Method | Endpoint | Backed by |
|---|---|---|
| GET | `/api/session` | Signed-in session and CSRF token |
| GET | `/api/bootstrap` | DB reads for main UI |
| POST | `/api/auth/register` | `sp_RegisterUser` |
| POST | `/api/auth/login` | `USER_` password-hash verification |
| POST | `/api/auth/logout` | Clear session |
| PUT | `/api/users/me` | `sp_UpdateUserProfile` |
| POST | `/api/teams` | `sp_CreateTeam` |
| POST | `/api/teams/<id>/members` | `sp_JoinTeam` |
| DELETE | `/api/teams/<id>/members/me` | `sp_LeaveTeam` |
| PUT | `/api/teams/<id>/leader` | `sp_SetTeamLeader` |
| DELETE | `/api/teams/<id>/members/<user_id>` | `sp_LeaderRemoveTeamMember` |
| POST | `/api/projects/charity` | `sp_CreateCharityProject` |
| POST | `/api/projects/commercial` | `sp_CreateCommercialProject` |
| PUT | `/api/projects/<id>` | `sp_UpdateTeamProject` |
| POST | `/api/donations` | `sp_MakeDonation` |
| POST | `/api/moderation/projects/<id>` | `sp_ModerateProject` |
| PATCH | `/api/moderation/users/<id>/status` | `sp_SetUserActiveStatus` |
| GET | `/api/health` | SQL connection check |

The page also presents reports and audit records from SQL tables using the bootstrap response. The original reporting procedures/views remain intact and can be wired to dedicated endpoints if required by the marking scheme.

## Known limitations / things to verify

- **Not integration-tested against your actual SQL Server instance.** Syntax checks passed for Python and JavaScript, but database connectivity, stored procedure execution, and user flows must be validated on your machine.
- The uploaded `.sql` contains test statements and older triggers, so any earlier test code or triggers could affect the results. Run on a clean test database and check errors in SSMS.
- `sp_MakeDonation` stores donation records; no payment gateway or proof of payment exists. Do not use as a production checkout.
- The original DB stores no password-reset tokens, email verification, account lockout or rate limiting. Login has password verification and session security but needs brute-force protection and recovery flows before public exposure.
- Public project pages may display donor names and team member names. Review the team's privacy requirements before deployment.
- No security posture should be inferred from access controls in JavaScript; always rely on Flask and the database.
- The original frontend's Reports page calculates summaries from SQL-returned rows, rather than directly invoking each required SQL view/procedure. Database objects are preserved; dedicated reports endpoints can be added if your lecturer explicitly wants those objects demonstrated through the site.
- API operations return errors from SQL as user-friendly messages where possible; check Flask logs for deeper diagnostics.
