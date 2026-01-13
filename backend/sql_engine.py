import re
from sqlalchemy import text
from sqlalchemy.orm import Session
from models import User, Animal, Center, Adoption

class SimpleSQL:
    def __init__(self, db_session):
        self.db = db_session
        
    def execute_query(self, query_str):
        # strip whitespace and semicolons
        query = query_str.strip().rstrip(';')
        
        try:
            # figure out what kind of query this is
            query_upper = query.upper()
            if query_upper.startswith('SELECT'):
                return self.handle_select(query)
            elif query_upper.startswith('INSERT'):
                return self.handle_insert(query)
            elif query_upper.startswith('UPDATE'):
                return self.handle_update(query)
            elif query_upper.startswith('DELETE'):
                return self.handle_delete(query)
            elif query_upper.startswith('CREATE'):
                return self.handle_create(query)
            elif query_upper.startswith('DROP'):
                return self.handle_drop(query)
            elif query_upper.startswith('SHOW'):
                return self.handle_show(query)
            else:
                return {"error": "Don't know how to handle that query type yet"}
                
        except Exception as e:
            # TODO: better error handling
            return {"error": f"Something went wrong: {str(e)}"}
    
    def handle_select(self, query):
        try:
            result = self.db.execute(text(query))
            rows = result.fetchall()
            
            if rows:
                columns = list(result.keys())
                data = []
                for row in rows:
                    row_data = {}
                    for i, col in enumerate(columns):
                        row_data[col] = row[i]
                    data.append(row_data)
                return {"success": True, "data": data, "columns": columns}
            else:
                return {"success": True, "data": [], "message": "No rows returned"}
                
        except Exception as e:
            return {"error": f"SELECT query failed: {str(e)}"}
    
    def handle_insert(self, query):
        try:
            result = self.db.execute(text(query))
            self.db.commit()
            return {"success": True, "message": f"Added {result.rowcount} row(s)"}
        except Exception as e:
            self.db.rollback()
            return {"error": f"INSERT failed: {str(e)}"}
    
    def handle_update(self, query):
        try:
            result = self.db.execute(text(query))
            self.db.commit()
            return {"success": True, "message": f"Changed {result.rowcount} row(s)"}
        except Exception as e:
            self.db.rollback()
            return {"error": f"UPDATE failed: {str(e)}"}
    
    def handle_delete(self, query):
        try:
            result = self.db.execute(text(query))
            self.db.commit()
            return {"success": True, "message": f"Removed {result.rowcount} row(s)"}
        except Exception as e:
            self.db.rollback()
            return {"error": f"DELETE failed: {str(e)}"}
    
    def handle_create(self, query):
        # basic CREATE TABLE support
        try:
            result = self.db.execute(text(query))
            self.db.commit()
            return {"success": True, "message": "Table created successfully"}
        except Exception as e:
            self.db.rollback()
            return {"error": f"CREATE failed: {str(e)}"}
    
    def handle_drop(self, query):
        # basic DROP TABLE support
        try:
            result = self.db.execute(text(query))
            self.db.commit()
            return {"success": True, "message": "Table dropped successfully"}
        except Exception as e:
            self.db.rollback()
            return {"error": f"DROP failed: {str(e)}"}
    
    def handle_show(self, query):
        # basic SHOW commands
        query_upper = query.upper()
        if "TABLES" in query_upper:
            # get actual table names from database
            try:
                result = self.db.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
                tables = [row[0] for row in result.fetchall()]
                return {"success": True, "data": [{"table_name": t} for t in tables]}
            except Exception as e:
                # fallback to hardcoded list
                tables = ["users", "animals", "centers", "adoptions"]
                return {"success": True, "data": [{"table_name": t} for t in tables]}
        elif "COLUMNS" in query_upper:
            # try to find table name
            match = re.search(r'FROM\s+(\w+)', query, re.IGNORECASE)
            if match:
                table_name = match.group(1)
                try:
                    # get actual column info from database
                    result = self.db.execute(text(f"PRAGMA table_info({table_name})"))
                    columns = [row[1] for row in result.fetchall()]  # column name is at index 1
                    return {"success": True, "data": [{"column_name": c} for c in columns]}
                except Exception as e:
                    return {"error": f"Couldn't get columns for table {table_name}: {str(e)}"}
            else:
                return {"error": "Couldn't figure out which table you want"}
        elif "INDEXES" in query_upper:
            # show indexes for a table
            match = re.search(r'FROM\s+(\w+)', query, re.IGNORECASE)
            if match:
                table_name = match.group(1)
                try:
                    result = self.db.execute(text(f"PRAGMA index_list({table_name})"))
                    indexes = [row[1] for row in result.fetchall()]  # index name is at index 1
                    return {"success": True, "data": [{"index_name": idx} for idx in indexes]}
                except Exception as e:
                    return {"error": f"Couldn't get indexes for table {table_name}: {str(e)}"}
            else:
                return {"error": "Need to specify a table name"}
        else:
            return {"error": "Only know SHOW TABLES, SHOW COLUMNS FROM table, and SHOW INDEXES FROM table"}