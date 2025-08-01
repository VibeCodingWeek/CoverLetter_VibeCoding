#!/usr/bin/env python3
import sqlite3
import datetime

def migrate_database():
    """Add all feature tables to the database"""
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    print("🚀 Starting database migration...")
    
    # Cover Letters table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cover_letters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            full_name TEXT,
            email TEXT,
            phone TEXT,
            address TEXT,
            company_name TEXT,
            job_title TEXT,
            hiring_manager TEXT,
            skills TEXT,
            experience TEXT,
            education TEXT,
            achievements TEXT,
            why_company TEXT,
            why_position TEXT,
            generated_content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    print("✅ Created cover_letters table")
    
    # Job Applications table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS job_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            company TEXT NOT NULL,
            position TEXT NOT NULL,
            location TEXT,
            salary TEXT,
            job_url TEXT,
            status TEXT DEFAULT 'applied',
            date_applied DATE,
            follow_up_date DATE,
            notes TEXT,
            contact_person TEXT,
            contact_email TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    print("✅ Created job_applications table")
    
    # Resumes table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS resumes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            template_name TEXT DEFAULT 'modern',
            full_name TEXT,
            email TEXT,
            phone TEXT,
            address TEXT,
            linkedin TEXT,
            website TEXT,
            summary TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    print("✅ Created resumes table")
    
    # Resume Experience table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS resume_experience (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            resume_id INTEGER NOT NULL,
            company TEXT,
            position TEXT,
            start_date TEXT,
            end_date TEXT,
            description TEXT,
            is_current BOOLEAN DEFAULT 0,
            order_index INTEGER DEFAULT 0,
            FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
        )
    ''')
    print("✅ Created resume_experience table")
    
    # Resume Education table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS resume_education (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            resume_id INTEGER NOT NULL,
            institution TEXT,
            degree TEXT,
            field_of_study TEXT,
            start_date TEXT,
            end_date TEXT,
            gpa TEXT,
            order_index INTEGER DEFAULT 0,
            FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
        )
    ''')
    print("✅ Created resume_education table")
    
    # Resume Skills table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS resume_skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            resume_id INTEGER NOT NULL,
            skill_name TEXT,
            category TEXT,
            proficiency TEXT,
            order_index INTEGER DEFAULT 0,
            FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
        )
    ''')
    print("✅ Created resume_skills table")
    
    # Resume Projects table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS resume_projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            resume_id INTEGER NOT NULL,
            name TEXT,
            description TEXT,
            technologies TEXT,
            url TEXT,
            start_date TEXT,
            end_date TEXT,
            order_index INTEGER DEFAULT 0,
            FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
        )
    ''')
    print("✅ Created resume_projects table")
    
    # Resume Certifications table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS resume_certifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            resume_id INTEGER NOT NULL,
            name TEXT,
            issuer TEXT,
            date_earned TEXT,
            expiry_date TEXT,
            credential_url TEXT,
            order_index INTEGER DEFAULT 0,
            FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
        )
    ''')
    print("✅ Created resume_certifications table")
    
    # Interview Practice table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS interview_practice (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            category TEXT,
            question TEXT,
            user_answer TEXT,
            time_taken INTEGER,
            session_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    print("✅ Created interview_practice table")
    
    # Salary Searches table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS salary_searches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            job_title TEXT,
            location TEXT,
            experience_level TEXT,
            company TEXT,
            saved_name TEXT,
            search_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    print("✅ Created salary_searches table")
    
    # Create indexes for better performance
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id ON cover_letters(user_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_interview_practice_user_id ON interview_practice(user_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_salary_searches_user_id ON salary_searches(user_id)')
    print("✅ Created database indexes")
    
    conn.commit()
    conn.close()
    
    print("🎉 Database migration completed successfully!")
    print(f"Migration completed at: {datetime.datetime.now()}")

if __name__ == "__main__":
    migrate_database() 