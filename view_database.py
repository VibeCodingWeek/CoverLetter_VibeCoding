#!/usr/bin/env python3
import sqlite3
import datetime

def view_database():
    """View all data in the users database"""
    try:
        # Connect to database
        conn = sqlite3.connect('users.db')
        conn.row_factory = sqlite3.Row  # This allows us to access columns by name
        cursor = conn.cursor()
        
        print("=" * 80)
        print("🗄️  USERS DATABASE CONTENTS")
        print("=" * 80)
        
        # Show table structure
        print("\n📋 TABLE STRUCTURE:")
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        
        print("Users table columns:")
        for col in columns:
            print(f"  - {col['name']}: {col['type']} {'(Primary Key)' if col['pk'] else ''}")
        
        # Show all users
        print("\n👥 ALL USERS:")
        cursor.execute("SELECT * FROM users ORDER BY created_at DESC")
        users = cursor.fetchall()
        
        if users:
            print(f"Found {len(users)} user(s):\n")
            for i, user in enumerate(users, 1):
                print(f"User #{i}:")
                print(f"  ID: {user['id']}")
                print(f"  Username: {user['username']}")
                print(f"  Email: {user['email']}")
                print(f"  Password Hash: {user['password_hash'][:20]}...")
                print(f"  Created: {user['created_at']}")
                print("-" * 40)
        else:
            print("No users found in database.")
        
        # Show database stats
        print(f"\n📊 DATABASE STATS:")
        cursor.execute("SELECT COUNT(*) as total FROM users")
        total = cursor.fetchone()['total']
        print(f"  Total users: {total}")
        
        if total > 0:
            cursor.execute("SELECT created_at FROM users ORDER BY created_at ASC LIMIT 1")
            first_user = cursor.fetchone()
            cursor.execute("SELECT created_at FROM users ORDER BY created_at DESC LIMIT 1")
            last_user = cursor.fetchone()
            
            print(f"  First user registered: {first_user['created_at']}")
            print(f"  Last user registered: {last_user['created_at']}")
        
        conn.close()
        print("\n" + "=" * 80)
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    view_database() 