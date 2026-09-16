import pymysql

from app.database import get_connection

def get_categories():
    """ 
     Retrive  categories from the MySQL database.
    """

    connection = get_connection()
    cursor = connection.cursor(pymysql.cursors.DictCursor)

    try:
        cursor.execute(
            """
            SELECT id, name, slug
            FROM categories
            WHERE enabled = TRUE
            ORDER BY sort_order ASC, name ASC
            """
        )

        return cursor.fetchall()

    finally:
        cursor.close()
        connection.close()