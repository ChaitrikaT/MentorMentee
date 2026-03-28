import sqlite3

def get_db():
    conn = sqlite3.connect('mentorbridge.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.executescript('''
        CREATE TABLE IF NOT EXISTS mentors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            department TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS mentees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            department TEXT NOT NULL,
            academic_year TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS allocations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mentor_id INTEGER NOT NULL,
            mentee_id INTEGER NOT NULL,
            status TEXT DEFAULT 'Active',
            FOREIGN KEY (mentor_id) REFERENCES mentors(id),
            FOREIGN KEY (mentee_id) REFERENCES mentees(id)
        );

        CREATE TABLE IF NOT EXISTS interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            allocation_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            mode TEXT NOT NULL,
            notes TEXT,
            action_items TEXT,
            next_meeting_date TEXT,
            FOREIGN KEY (allocation_id) REFERENCES allocations(id)
        );
    ''')

    # Insert AIML department sample data
    cursor.executescript('''
        INSERT OR IGNORE INTO mentors (name, email, department) VALUES
        ('Dr. Kavitha Rao', 'kavitha@sahyadri.edu.in', 'AI & ML'),
        ('Prof. Anand Bhat', 'anand@sahyadri.edu.in', 'AI & ML'),
        ('Dr. Priya Nair', 'priya@sahyadri.edu.in', 'AI & ML'),
        ('Prof. Suresh Hegde', 'suresh@sahyadri.edu.in', 'AI & ML');

        INSERT OR IGNORE INTO mentees (name, email, department, academic_year) VALUES
        ('Aditya Sharma', 'aditya@sahyadri.edu.in', 'AI & ML', '1st Year'),
        ('Sneha Patel', 'sneha@sahyadri.edu.in', 'AI & ML', '1st Year'),
        ('Rahul Menon', 'rahul@sahyadri.edu.in', 'AI & ML', '2nd Year'),
        ('Divya Kulkarni', 'divya@sahyadri.edu.in', 'AI & ML', '2nd Year'),
        ('Arjun Nayak', 'arjun@sahyadri.edu.in', 'AI & ML', '3rd Year'),
        ('Meera Gowda', 'meera@sahyadri.edu.in', 'AI & ML', '3rd Year'),
        ('Karthik Shetty', 'karthik@sahyadri.edu.in', 'AI & ML', '4th Year'),
        ('Anjali Rao', 'anjali@sahyadri.edu.in', 'AI & ML', '4th Year');

        INSERT OR IGNORE INTO allocations (mentor_id, mentee_id) VALUES
        (1, 1), (1, 2),
        (2, 3), (2, 4),
        (3, 5), (3, 6),
        (4, 7), (4, 8);

        INSERT OR IGNORE INTO interactions
        (allocation_id, date, mode, notes, action_items, next_meeting_date) VALUES
        (1, '2026-03-20', 'In-Person', 'Discussed ML project progress. Student doing well in deep learning module.', 'Submit project report by Friday', '2026-04-05'),
        (2, '2026-01-15', 'Online', 'Career guidance session. Discussed internship options.', 'Apply to 3 internships this week', '2026-02-01'),
        (3, '2026-03-25', 'In-Person', 'Research paper discussion. Good progress on literature review.', 'Draft abstract and introduction', '2026-04-10'),
        (4, '2026-02-10', 'Phone', 'Academic performance review. Some concerns about attendance.', 'Improve attendance, attend extra classes', '2026-03-01');
    ''')

    conn.commit()
    conn.close()