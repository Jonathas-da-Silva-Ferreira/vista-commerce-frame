from app.database import get_connection

def get_categorires():
    """ 
     Retrive  categories from the MySQL database.
    """

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

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