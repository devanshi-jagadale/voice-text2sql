from db.connection import get_connection

def get_schema_context() -> str:
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    schema = {}
    for table, column, dtype in rows:
        schema.setdefault(table, []).append(f"{column} ({dtype})")

    lines = []
    for table, cols in schema.items():
        lines.append(f"Table: {table}")
        lines.append("  Columns: " + ", ".join(cols))

    return "\n".join(lines)