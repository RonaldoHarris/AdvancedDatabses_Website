"""NEWCORP Flask API for the SQL Server schema supplied on 7 November 2026.

Run the original SQL script against a TEST database before starting this app.
Donations here record pledges in the DONATION table; no money is collected.
"""
import os
import secrets
import logging
from datetime import date, datetime
from decimal import Decimal
from functools import wraps
from contextlib import closing

from dotenv import load_dotenv
from flask import Flask, jsonify, request, session, send_from_directory, abort
from werkzeug.security import generate_password_hash, check_password_hash
import pyodbc

load_dotenv()
app = Flask(__name__, static_folder='static', template_folder='templates')
app.config.update(
    SECRET_KEY=os.environ.get('FLASK_SECRET_KEY') or secrets.token_hex(32),
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='None',
    SESSION_COOKIE_SECURE=os.environ.get('COOKIE_SECURE', 'true').lower() == 'true',
    MAX_CONTENT_LENGTH=1024*1024,
    JSON_SORT_KEYS=False,
)

logging.basicConfig(level=logging.INFO)

# Allow the GitHub Pages frontend to communicate with this Flask API.
# Set FRONTEND_ORIGINS in Render to the exact frontend origin.
ALLOWED_ORIGINS = {
    origin.strip().rstrip('/')
    for origin in os.environ.get('FRONTEND_ORIGINS', '').split(',')
    if origin.strip()
}

@app.after_request
def add_cors_headers(response):
    origin = request.headers.get('Origin', '').rstrip('/')

    if origin in ALLOWED_ORIGINS:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = (
            'Content-Type, X-CSRF-Token'
        )
        response.headers['Access-Control-Allow-Methods'] = (
            'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        )
        response.headers.add('Vary', 'Origin')

    return response

def connection():
    # Allow a complete connection string to override individual settings.
    raw = os.environ.get('SQL_CONNECTION_STRING')
    if raw:
        return pyodbc.connect(raw, timeout=10, autocommit=False)

    driver = os.environ.get(
        'SQL_DRIVER', 'ODBC Driver 18 for SQL Server'
    )
    server = os.environ.get('SQL_SERVER')
    database = os.environ.get('SQL_DATABASE', 'NEWCORP_DB')
    user = os.environ.get('SQL_USER')
    password = os.environ.get('SQL_PASSWORD')

    # Azure SQL requires SQL Server authentication credentials here.
    if not all([server, database, user, password]):
        raise RuntimeError(
            'Missing required Azure SQL connection environment variables.'
        )

    # Escape special characters in connection string values.
    def safe(value):
        return '{' + value.replace('}', '}}') + '}'

    connection_string = (
        f'DRIVER={{{driver}}};'
        f'SERVER={safe(server)};'
        f'DATABASE={safe(database)};'
        f'UID={safe(user)};'
        f'PWD={safe(password)};'
        'Encrypt=yes;'
        'TrustServerCertificate=no;'
    )

    return pyodbc.connect(
        connection_string,
        timeout=10,
        autocommit=False
    )


def rows(cur):
    names = [col[0] for col in cur.description]
    return [dict(zip(names, r)) for r in cur.fetchall()]


def query(db, sql, *args):
    return rows(db.execute(sql, *args))


def one(db, sql, *args):
    data = query(db, sql, *args)
    return data[0] if data else None


def execute_proc(db, name, *args, returns=False):
    # SQL Server stored procedures may emit intermediate row counts; SET NOCOUNT ON
    # is used by the procedures added to the uploaded script.
    params = ', '.join('?' for _ in args)
    cur = db.cursor()
    cur.execute(f'EXEC dbo.{name} {params}', *args)
    if returns:
        while cur.description is None and cur.nextset():
            pass
        return rows(cur) if cur.description else []
    return []


def normalize(value):
    if isinstance(value, (date, datetime)):
        return value.isoformat()[:10]
    if isinstance(value, Decimal):
        return float(value)
    return value


def as_json(data):
    if isinstance(data, list):
        return [as_json(x) for x in data]
    if isinstance(data, dict):
        return {k: as_json(v) for k, v in data.items()}
    return normalize(data)


def body():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        abort(400, 'A JSON object is required.')
    return data


def required_text(data, field, max_len):
    value = str(data.get(field) or '').strip()
    if not value or len(value) > max_len:
        abort(400, f'{field} is required (maximum {max_len} characters).')
    return value


def optional(data, field):
    return str(data.get(field) or '').strip() or None


def amount(data, field):
    try:
        value = Decimal(str(data[field]))
        if not value.is_finite() or value <= 0 or value > Decimal('9999999999.99'):
            raise ValueError()
        return value.quantize(Decimal('.01'))
    except (KeyError, ValueError, TypeError, ArithmeticError):
        abort(400, f'Invalid positive {field}.')


def user_id():
    return session.get('uid')


def lookup_user(db, uid):
    return one(db, '''SELECT u.User_ID AS id, u.First_Name AS first,
        u.Last_Name AS last, u.Email_Address AS email,
        u.Mobile_Number AS mobile, u.Street_Name AS street,
        u.Street_Number AS streetNo, u.City AS city, u.Country AS country,
        u.Postal_Zone AS postal, r.Role_Name AS role,
        u.Is_Active AS active
        FROM dbo.USER_ u JOIN dbo.APP_ROLE r ON u.Role_ID=r.Role_ID
        WHERE u.User_ID=?''', uid)


def access(db, moderator=False):
    uid = user_id()
    person = lookup_user(db, uid) if uid is not None else None
    if not person or not person['active']:
        abort(401, 'Please sign in with an active account.')
    if moderator and person['role'] != 'Moderator':
        abort(403, 'Moderator access required.')
    return person


def handler(moderator=False, login=True):
    def outer(fn):
        @wraps(fn)
        def inner(*args, **kwargs):
            with closing(connection()) as db, db:
                who = access(db, moderator) if login else None
                result = fn(db, who, *args, **kwargs)
                db.commit()
                return jsonify(as_json(result if result is not None else {'ok': True}))
        return inner
    return outer


@app.errorhandler(Exception)
def error_handler(exc):
    if hasattr(exc, 'code') and exc.code < 500:
        return jsonify({'error': exc.description}), exc.code
    if isinstance(exc, pyodbc.Error):
        # SQL Server procedures supply useful THROW messages. Do not expose raw SQL
        # statements, connection strings or detailed driver information.
        logging.warning('SQL error: %s', exc)
        msg = str(exc.args[1] if len(exc.args)>1 else exc.args[0])
        import re
        matched = re.search(r'\[SQL Server\]([^\(]+)', msg)
        if matched and ('50000' in msg or '510' in msg or '3609' not in msg):
            return jsonify({'error': matched.group(1).strip()}), 400
        return jsonify({'error': 'Database operation failed. Check server logs.'}), 400
    logging.exception('Unexpected server error')
    return jsonify({'error': 'Internal server error.'}), 500


@app.before_request
def csrf_protection():
    if request.method in {'POST', 'PUT', 'PATCH', 'DELETE'} and request.path.startswith('/api/'):
        if not secrets.compare_digest(request.headers.get('X-CSRF-Token', ''), session.get('csrf', 'no-token')):
            abort(403, 'Invalid security token. Reload the page.')



@app.get('/api/health')
def health():
    with closing(connection()) as db, db:
        query(db, 'SELECT 1 AS ok')
    return jsonify({'status': 'ok', 'database': 'reachable'})


@app.get('/api/session')
def session_info():
    if not session.get('csrf'):
        session['csrf'] = secrets.token_urlsafe(32)
    who = None
    if user_id() is not None:
        with closing(connection()) as db, db:
            who = lookup_user(db, user_id())
        if not who or not who['active']:
            session.pop('uid', None)
            who = None
    return jsonify({'user': as_json(who), 'csrf': session['csrf']})


@app.post('/api/auth/register')
@handler(login=False)
def register(db, _):
    data = body()
    password = required_text(data, 'password', 128)
    if len(password) < 8:
        abort(400, 'Password must contain at least eight characters.')
    params = [required_text(data, x, n) for x, n in [('first', 50), ('last', 50), ('email', 50)]]
    params += [generate_password_hash(password)]
    params += [optional(data, x) for x in ('mobile','street','streetNo','city','country','postal')]
    new = execute_proc(db, 'sp_RegisterUser', *params, returns=True)
    uid = new[0]['New_User_ID']
    session.clear()
    session['uid'] = uid
    session['csrf'] = secrets.token_urlsafe(32)
    return {'user': lookup_user(db, uid), 'csrf': session['csrf']}


@app.post('/api/auth/login')
@handler(login=False)
def login(db, _):
    data = body()
    email = required_text(data, 'email', 50)
    password = str(data.get('password') or '')
    found = one(db, '''SELECT User_ID AS id, Password_Hash AS hash, Is_Active AS active
                      FROM dbo.USER_ WHERE Email_Address=?''', email)
    if not found or not found['hash'] or not found['active'] or not check_password_hash(found['hash'], password):
        abort(401, 'Invalid email/password, or the account has not been enabled for login.')
    session.clear()
    session['uid'] = found['id']
    session['csrf'] = secrets.token_urlsafe(32)
    return {'user': lookup_user(db, found['id']), 'csrf': session['csrf']}


@app.post('/api/auth/logout')
def logout():
    session.clear()
    session['csrf'] = secrets.token_urlsafe(32)
    return jsonify({'ok': True, 'csrf': session['csrf']})


@app.get('/api/bootstrap')
@handler(login=False)
def bootstrap(db, _):
    uid = user_id()
    who = lookup_user(db, uid) if uid is not None else None
    if who and not who['active']:
        who = None
    moderator = bool(who and who['role'] == 'Moderator')
    # Public users only get display names; their contact/address details are private.
    users = query(db, '''SELECT u.User_ID AS id, u.First_Name AS first,
        u.Last_Name AS last, r.Role_Name AS role, u.Is_Active AS active
        FROM dbo.USER_ u JOIN dbo.APP_ROLE r ON u.Role_ID=r.Role_ID''')
    if moderator:
        users = query(db, '''SELECT u.User_ID AS id,u.First_Name AS first,u.Last_Name AS last,
            u.Email_Address AS email,u.Mobile_Number AS mobile,
            u.Street_Name AS street,u.Street_Number AS streetNo,u.City AS city,
            u.Country AS country,u.Postal_Zone AS postal,r.Role_Name AS role,u.Is_Active AS active
            FROM dbo.USER_ u JOIN dbo.APP_ROLE r ON u.Role_ID=r.Role_ID''')
    elif who:
        users = [{**u, **(who if u['id'] == who['id'] else {})} for u in users]
    projects = query(db, '''SELECT p.Project_ID AS id,p.Description AS description,
        p.Posted_Date AS posted,p.Closing_Date AS closing,p.Target_Amount AS target,
        p.Team_ID AS teamId,p.Approval_Status AS status,
        p.Approved_By AS approvedBy,p.Approval_Date AS approvalDate,
        p.Rejection_Reason AS rejectionReason,
        CASE WHEN c.Project_ID IS NOT NULL THEN 'Commercial' ELSE 'Charity' END AS type,
        c.Profit_Margin AS profitMargin,h.Beneficiaries AS beneficiaries
        FROM dbo.PROJECT p LEFT JOIN dbo.COMMERCIAL_PROJECT c ON c.Project_ID=p.Project_ID
        LEFT JOIN dbo.CHARITY_PROJECT h ON h.Project_ID=p.Project_ID
        WHERE p.Approval_Status='Approved' OR ?=1 OR EXISTS
          (SELECT 1 FROM dbo.TEAM_MEMBERSHIP m
           WHERE m.Team_ID=p.Team_ID AND m.User_ID=?)''', 1 if moderator else 0, uid or -1)
    visible_ids = {p['id'] for p in projects}
    donations = query(db, '''SELECT d.User_ID AS userId,d.Donation_Number AS number,
        d.Project_ID AS projectId,d.Donation_Date AS date,d.Donation_Amount AS amount
        FROM dbo.DONATION d''')
    donations = [d for d in donations if d['projectId'] in visible_ids]
    teams = query(db, '''SELECT Team_ID AS id,Team_Name AS name,
        Created_Date AS created,Leader_User_ID AS leaderId FROM dbo.TEAM''')
    memberships = query(db, 'SELECT User_ID AS userId, Team_ID AS teamId FROM dbo.TEAM_MEMBERSHIP')
    project_log = query(db, '''SELECT Project_ID AS projectId,Team_Member_ID AS teamMemberId,
        Project_Date AS projectDate, Description AS description,Date_Logged AS dateLogged
        FROM dbo.Project_Log WHERE Project_ID IN
        (SELECT Project_ID FROM dbo.PROJECT WHERE Approval_Status='Approved' OR ?=1
         OR Team_ID IN (SELECT Team_ID FROM dbo.TEAM_MEMBERSHIP WHERE User_ID=?))''', 1 if moderator else 0, uid or -1)
    audits = []
    if moderator:
        audits = query(db, '''SELECT Audit_ID AS id,Audit_Action AS action,Audit_Table AS [table],
            Record_ID AS recordId,Actor_User_ID AS actorId,Action_Date AS date,
            Audit_Details AS details FROM dbo.AUDIT_LOG ORDER BY Audit_ID DESC''')
    # Hide unapproved-project donation records from viewers who cannot see the project.
    return {'currentUserId': who['id'] if who else None,
            'users': users, 'teams': teams,
            'memberships': [[m['userId'],m['teamId']] for m in memberships],
            'projects': projects, 'donations': donations,
            'projectLog': project_log, 'audit': audits}


@app.put('/api/users/me')
@handler()
def profile(db, who):
    d = body()
    args = [who['id'], who['id']] + [required_text(d, x, n) for x,n in [('first',50),('last',50),('email',50)]]
    args += [optional(d, x) for x in ('mobile','street','streetNo','city','country','postal')]
    execute_proc(db, 'sp_UpdateUserProfile', *args)
    return lookup_user(db,who['id'])


@app.post('/api/teams')
@handler()
def create_team(db, who):
    rec = execute_proc(db,'sp_CreateTeam',who['id'],required_text(body(),'team_name',50),returns=True)
    return {'teamId':rec[0]['New_Team_ID']}


@app.post('/api/teams/<int:tid>/members')
@handler()
def join(db,who,tid):
    execute_proc(db,'sp_JoinTeam',who['id'],tid)


@app.delete('/api/teams/<int:tid>/members/me')
@handler()
def leave(db,who,tid):
    execute_proc(db,'sp_LeaveTeam',who['id'],tid)


@app.put('/api/teams/<int:tid>/leader')
@handler()
def leader(db,who,tid):
    execute_proc(db,'sp_SetTeamLeader',who['id'],tid,int(body()['new_leader_user_id']))


@app.delete('/api/teams/<int:tid>/members/<int:member_id>')
@handler()
def remove_member(db,who,tid,member_id):
    execute_proc(db,'sp_LeaderRemoveTeamMember',who['id'],member_id,tid)


@app.post('/api/projects/<kind>')
@handler()
def create_project(db,who,kind):
    if kind not in ('charity','commercial'):
        abort(404)
    d = body()
    args = [who['id'],int(d['teamId']),required_text(d,'description',500),
            required_text(d,'closing',10),amount(d,'target')]
    if kind=='charity':
        proc = 'sp_CreateCharityProject'
        args.append(required_text(d,'beneficiaries',500))
    else:
        proc = 'sp_CreateCommercialProject'
        margin = Decimal(str(d['profitMargin']))
        if not margin.is_finite() or margin < 0 or margin > 100:
            abort(400, 'Profit margin must be between 0 and 100.')
        args.append(margin)
    return execute_proc(db,proc,*args,returns=True)[0]


@app.put('/api/projects/<int:pid>')
@handler()
def update_project(db,who,pid):
    d=body()
    execute_proc(db,'sp_UpdateTeamProject',who['id'],pid,required_text(d,'description',500),
                 required_text(d,'closing',10),amount(d,'target'))


@app.post('/api/donations')
@handler()
def donate(db,who):
    d=body()
    return execute_proc(db,'sp_MakeDonation',who['id'],int(d['project_id']),
                        amount(d,'donation_amount'),returns=True)[0]


@app.post('/api/moderation/projects/<int:pid>')
@handler(moderator=True)
def moderate(db,who,pid):
    d=body()
    decision=required_text(d,'decision',10).upper()
    if decision not in ('APPROVE','REJECT'):
        abort(400,'Decision must be APPROVE or REJECT.')
    execute_proc(db,'sp_ModerateProject',who['id'],pid,decision,optional(d,'rejection_reason'))


@app.patch('/api/moderation/users/<int:uid>/status')
@handler(moderator=True)
def set_status(db,who,uid):
    d=body()
    if type(d.get('is_active')) is not bool:
        abort(400,'is_active must be a boolean.')
    execute_proc(db,'sp_SetUserActiveStatus',who['id'],uid,int(d['is_active']))


if __name__=='__main__':
    if not os.environ.get('FLASK_SECRET_KEY'):
        print('WARNING: Set FLASK_SECRET_KEY in .env so login sessions survive restarts.')
    app.run(host='127.0.0.1',port=int(os.environ.get('PORT','5000')),debug=False)
