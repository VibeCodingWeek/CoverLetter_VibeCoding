#!/usr/bin/env python3
import sqlite3

def show_db_structure():
    """Show database structure and tables"""
    try:
        conn = sqlite3.connect('backend/users.db')
        cursor = conn.cursor()
        
        print("=" * 60)
        print("🗄️  DATABASE STRUCTURE")
        print("=" * 60)
        
        # Show all tables
        print("\n📋 TABLES:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        
        if tables:
            for table in tables:
                table_name = table[0]
                print(f"\n🔹 Table: {table_name}")
                
                # Show table structure
                cursor.execute(f"PRAGMA table_info({table_name})")
                columns = cursor.fetchall()
                
                print("   Columns:")
                for col in columns:
                    col_name, col_type, not_null, default_val, pk = col[1], col[2], col[3], col[4], col[5]
                    pk_text = " [PRIMARY KEY]" if pk else ""
                    not_null_text = " [NOT NULL]" if not_null else ""
                    default_text = f" [DEFAULT: {default_val}]" if default_val else ""
                    print(f"     - {col_name}: {col_type}{pk_text}{not_null_text}{default_text}")
                
                # Show record count
                cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                count = cursor.fetchone()[0]
                print(f"   Records: {count}")
        else:
            print("No tables found in database.")
        
        conn.close()
        print("\n" + "=" * 60)
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    show_db_structure() 