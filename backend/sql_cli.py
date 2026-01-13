#!/usr/bin/env python3
import sys
from database import SessionLocal
from sql_engine import SimpleSQL

def main():
    db = SessionLocal()
    sql_engine = SimpleSQL(db)
    
    if len(sys.argv) > 1:
        # Run single query from command line
        query = ' '.join(sys.argv[1:])
        result = sql_engine.execute_query(query)
        print_result(result)
    else:
        # Interactive mode
        print("RescueMePets SQL CLI - Type 'exit' to quit")
        while True:
            try:
                query = input("sql> ")
                if query.lower() in ['exit', 'quit']:
                    break
                if query.strip():
                    result = sql_engine.execute_query(query)
                    print_result(result)
            except KeyboardInterrupt:
                print("\nGoodbye!")
                break
    
    db.close()

def print_result(result):
    if 'error' in result:
        print(f"Error: {result['error']}")
    elif 'data' in result:
        data = result['data']
        if data:
            # Print headers
            headers = list(data[0].keys())
            print(" | ".join(headers))
            print("-" * (len(" | ".join(headers))))
            # Print rows
            for row in data:
                print(" | ".join(str(row[h]) for h in headers))
        else:
            print("No results")
    elif 'message' in result:
        print(result['message'])

if __name__ == "__main__":
    main()