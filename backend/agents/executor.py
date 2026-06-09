from db.connection import get_connection

def execute_sql(sql: str) -> tuple[list[dict], str | None]:
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql)
        columns = [desc[0] for desc in cur.description]
        rows = [dict(zip(columns, row)) for row in cur.fetchall()]
        cur.close()
        conn.close()
        return rows, None
    except Exception as e:
        return [], str(e)