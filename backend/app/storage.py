import json, sqlite3
from pathlib import Path
DB = Path(__file__).resolve().parent.parent / "aegis.db"
def connect():
    c = sqlite3.connect(DB); c.row_factory = sqlite3.Row; return c
def init_db():
    with connect() as c:
        c.execute("CREATE TABLE IF NOT EXISTS investigations (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT NOT NULL, result_json TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)")
def save(description, result):
    with connect() as c:
        cur = c.execute("INSERT INTO investigations(description,result_json) VALUES (?,?)",(description,json.dumps(result,ensure_ascii=False)))
        return int(cur.lastrowid)
def list_all():
    with connect() as c:
        return [dict(r) for r in c.execute("SELECT id,description,created_at FROM investigations ORDER BY id DESC LIMIT 50").fetchall()]
def get_one(i):
    with connect() as c:
        r = c.execute("SELECT id,description,result_json,created_at FROM investigations WHERE id=?",(i,)).fetchone()
        return None if not r else {"id":r["id"],"description":r["description"],"created_at":r["created_at"],**json.loads(r["result_json"])}
