#!/usr/bin/env python3
import sqlite3
import json
from datetime import datetime

class DatabaseManager:
    def __init__(self, db_path='users.db'):
        self.db_path = db_path
    
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def view_all_users(self):
        """Display all users in a formatted table"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users ORDER BY created_at DESC")
        users = cursor.fetchall()
        
        if not users:
            print("No users found.")
            return
        
        print(f"\n{'ID':<4} {'Username':<15} {'Email':<25} {'Created':<20}")
        print("-" * 70)
        
        for user in users:
            created = user['created_at'][:19] if user['created_at'] else 'N/A'
            print(f"{user['id']:<4} {user['username']:<15} {user['email']:<25} {created:<20}")
        
        conn.close()
    
    def search_user(self, search_term):
        """Search for users by username or email"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM users 
            WHERE username LIKE ? OR email LIKE ?
            ORDER BY created_at DESC
        """, (f'%{search_term}%', f'%{search_term}%'))
        
        users = cursor.fetchall()
        
        if users:
            print(f"\nFound {len(users)} user(s) matching '{search_term}':")
            for user in users:
                print(f"  ID: {user['id']}, Username: {user['username']}, Email: {user['email']}")
        else:
            print(f"No users found matching '{search_term}'")
        
        conn.close()
    
    def export_to_json(self, filename='users_export.json'):
        """Export all users to JSON file"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, username, email, created_at FROM users ORDER BY created_at")
        users = cursor.fetchall()
        
        users_data = [dict(user) for user in users]
        
        with open(filename, 'w') as f:
            json.dump(users_data, f, indent=2, default=str)
        
        print(f"Exported {len(users_data)} users to {filename}")
        conn.close()
    
    def get_stats(self):
        """Get database statistics"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Total users
        cursor.execute("SELECT COUNT(*) as total FROM users")
        total = cursor.fetchone()['total']
        
        # Users registered today
        today = datetime.now().strftime('%Y-%m-%d')
        cursor.execute("SELECT COUNT(*) as today FROM users WHERE DATE(created_at) = ?", (today,))
        today_count = cursor.fetchone()['today']
        
        # Most recent user
        cursor.execute("SELECT username, created_at FROM users ORDER BY created_at DESC LIMIT 1")
        recent = cursor.fetchone()
        
        print(f"\n📊 Database Statistics:")
        print(f"  Total users: {total}")
        print(f"  Users registered today: {today_count}")
        if recent:
            print(f"  Most recent user: {recent['username']} ({recent['created_at']})")
        
        conn.close()
    
    def interactive_menu(self):
        """Interactive menu for database operations"""
        while True:
            print("\n" + "="*50)
            print("🗄️  DATABASE MANAGER")
            print("="*50)
            print("1. View all users")
            print("2. Search users")
            print("3. Database statistics")
            print("4. Export to JSON")
            print("5. Exit")
            
            choice = input("\nSelect option (1-5): ").strip()
            
            if choice == '1':
                self.view_all_users()
            elif choice == '2':
                search_term = input("Enter search term (username or email): ").strip()
                if search_term:
                    self.search_user(search_term)
            elif choice == '3':
                self.get_stats()
            elif choice == '4':
                filename = input("Enter filename (default: users_export.json): ").strip()
                if not filename:
                    filename = 'users_export.json'
                self.export_to_json(filename)
            elif choice == '5':
                print("Goodbye!")
                break
            else:
                print("Invalid choice. Please try again.")

if __name__ == "__main__":
    import sys
    
    db_manager = DatabaseManager()
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        if command == 'view':
            db_manager.view_all_users()
        elif command == 'stats':
            db_manager.get_stats()
        elif command == 'export':
            db_manager.export_to_json()
        elif command == 'interactive':
            db_manager.interactive_menu()
        else:
            print("Usage: python database_manager.py [view|stats|export|interactive]")
    else:
        # Default: show users and stats
        print("🗄️  USERS DATABASE")
        print("="*50)
        db_manager.view_all_users()
        db_manager.get_stats() 