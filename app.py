import eel
import sqlite3
import atexit

eel.init('web')



#SQLiteの操作
dbname = "db/db.db"
conn = sqlite3.connect(dbname)

cur = conn.cursor()
cur.execute('''
    CREATE TABLE IF NOT EXISTS "shushi-hyo" (
        "id"    INTEGER PRIMARY KEY AUTOINCREMENT,
        "date"	TEXT,
        "item"	TEXT,
        "category"	TEXT,
        "income"	INTEGER,
        "spend"	INTEGER
    )
''')
cur.execute('''
    CREATE TABLE IF NOT EXISTS "shushi-hyo-categories" (
        "category"    TEXT
    )
''')
conn.commit()

@eel.expose
def loadDB_py():
    data = []
    cur.execute('''
        SELECT * FROM "shushi-hyo"
    ''')
    for row in cur:
        data.append(row)
    print("data loading completed")
    return data

@eel.expose
def test_py(fd):
    date = fd["date"]
    item = fd["item"]
    category = fd["category"]
    income = fd["income"]
    spend = fd["spend"]
    try:
        cur.execute('''
            INSERT INTO "shushi-hyo" (date, item, category, income, spend) 
            VALUES (?, ?, ?, ?, ?)
        ''', (date, item, category, income, spend))
        conn.commit()
        recordid = cur.lastrowid
        print("Data inserted successfully")

    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
    
    return recordid

@eel.expose
def update_py(index, fd):
    date = fd["date"]
    item = fd["item"]
    category = fd["category"]
    income = fd["income"]
    spend = fd["spend"]
    try:
        cur.execute('''
            UPDATE "shushi-hyo"
            SET date = ?, item = ?, category = ?, income = ?, spend = ?
            WHERE id = ?''', 
            (date, item, category, income, spend, index))
        conn.commit()
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
    return "data update successfully"

@eel.expose
def removerow_py(index):
    try:
        print(f"Attempting to delete row with index: {index}")  # 確認用のログ出力
        cur.execute('''
            DELETE FROM "shushi-hyo" WHERE id = ?''', 
            (index,))
        conn.commit()
        print("Row deleted successfully")
        return {"status": "success", "message": "Row deleted successfully"}
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
        return {"status": "error", "message": str(e)}

@eel.expose
def totaleachcategory_py(categories):
    total = {}
    for category in categories:
        cur.execute('''
            SELECT SUM(income), SUM(spend) FROM "shushi-hyo" 
            WHERE category = ?
        ''',(category,))
        val = cur.fetchone()
        total[category] = {"income": val[0], "spend": val[1]}
    return total
@eel.expose
def totalspendandincome():
    cur.execute('''
        SELECT SUM(income), SUM(spend) FROM "shushi-hyo" 
    ''')
    val = cur.fetchone()
    return val

@eel.expose
def getcategories_py():
    data = []
    cur.execute('''
        SELECT * FROM "shushi-hyo-categories"
    ''')
    for row in cur:
        data.append(row[0])
    return data

@eel.expose
def addoption_py(data):
    cur.execute('''
        INSERT INTO "shushi-hyo-categories" (category) 
        VALUES (?)
    ''', (data,))
    conn.commit()
    return

@eel.expose
def removeoption_py(data):
    try:
        cur.execute('''
            DELETE FROM "shushi-hyo-categories" WHERE category = ?''', 
            (data,))
        conn.commit()
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")

def close_db():
    cur.close()
    conn.close()

# アプリケーション終了時に接続を閉じる
atexit.register(close_db)

# Eelアプリを開始
eel.start('index.html', size=(700, 500), port=8001)

