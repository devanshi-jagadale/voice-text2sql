from db.connection import get_connection

def save_history(query, final_query, sql, explanation, chart_filename=None):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO chat_history (query, final_query, sql_generated, explanation, chart_filename)
            VALUES (%s, %s, %s, %s, %s)
        """, (query, final_query, sql, explanation, chart_filename))
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"History save failed: {e}")

def get_history(limit: int = 10):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT query, final_query, sql_generated, explanation, chart_filename, created_at
        FROM chat_history
        ORDER BY created_at DESC
        LIMIT %s
    """, (limit,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "query": r[0],
            "final_query": r[1],
            "sql": r[2],
            "explanation": r[3],
            "chart_filename": r[4],
            "created_at": str(r[5])
        }
        for r in rows
    ]