import sqlite3

from dotenv import load_dotenv
load_dotenv()

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from database import get_db, init_db
import anthropic
import os
#import google.generativeai as genai
import json

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Initialize DB on startup
init_db()

# ─── MENTORS ───────────────────────────────────────────
@app.route('/api/mentors', methods=['GET', 'POST'])
def handle_mentors():
    db = get_db()
    
    if request.method == 'GET':
        mentors = db.execute('SELECT * FROM mentors').fetchall()
        return jsonify([dict(m) for m in mentors])
        
    if request.method == 'POST':
        data = request.json
        try:
            db.execute('INSERT INTO mentors (name, email, department) VALUES (?, ?, ?)',
                       [data['name'], data['email'], data['department']])
            db.commit()
            return jsonify({'message': 'Mentor added successfully!'}), 201
        except sqlite3.IntegrityError:
            # This catches the error if the email already exists in the DB!
            return jsonify({'error': 'A mentor with this email already exists!'}), 400

# ─── MENTEES ───────────────────────────────────────────
@app.route('/api/mentees', methods=['GET'])
def get_mentees():
    db = get_db()
    mentees = db.execute('SELECT * FROM mentees').fetchall()
    return jsonify([dict(m) for m in mentees])

# ─── ALLOCATIONS ───────────────────────────────────────
@app.route('/api/allocations', methods=['GET'])
def get_allocations():
    email = request.args.get('email') # Check who is asking!
    db = get_db()
    
    query = '''
        SELECT a.id, mr.name as mentor_name, mr.department,
               me.name as mentee_name, me.academic_year, a.status,
               MAX(i.date) as last_interaction
        FROM allocations a
        JOIN mentors mr ON a.mentor_id = mr.id
        JOIN mentees me ON a.mentee_id = me.id
        LEFT JOIN interactions i ON a.id = i.allocation_id
    '''
    params = []
    
    # If an email is provided, only return that specific mentor's students!
    if email:
        query += ' WHERE mr.email = ?'
        params.append(email)
        
    query += ' GROUP BY a.id'
    
    allocations = db.execute(query, params).fetchall()
    return jsonify([dict(a) for a in allocations])

# ... Keep your POST /api/allocations and interactions stuff exactly the same ...

@app.route('/api/allocations', methods=['POST'])
def add_allocation():
    data = request.json
    db = get_db()
    db.execute('INSERT INTO allocations (mentor_id, mentee_id) VALUES (?, ?)',
               [data['mentor_id'], data['mentee_id']])
    db.commit()
    return jsonify({'message': 'Allocation added!'})

# ─── INTERACTIONS ──────────────────────────────────────
@app.route('/api/interactions', methods=['POST'])
def add_interaction():
    data = request.json
    db = get_db()
    db.execute('''
        INSERT INTO interactions 
        (allocation_id, date, mode, notes, action_items, next_meeting_date)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', [data['allocation_id'], data['date'], data['mode'],
          data['notes'], data['action_items'], data['next_meeting_date']])
    db.commit()
    return jsonify({'message': 'Interaction logged!'})

@app.route('/api/interactions/<int:allocation_id>', methods=['GET'])
def get_interactions(allocation_id):
    db = get_db()
    interactions = db.execute(
        'SELECT * FROM interactions WHERE allocation_id = ?', 
        [allocation_id]
    ).fetchall()
    return jsonify([dict(i) for i in interactions])

# ─── REPORTS ───────────────────────────────────────────
@app.route('/api/reports/mentor/<int:mentor_id>', methods=['GET'])
def mentor_report(mentor_id):
    db = get_db()
    data = db.execute('''
        SELECT mr.name as mentor_name, me.name as mentee_name,
               i.date, i.mode, i.notes, i.action_items
        FROM interactions i
        JOIN allocations a ON i.allocation_id = a.id
        JOIN mentors mr ON a.mentor_id = mr.id
        JOIN mentees me ON a.mentee_id = me.id
        WHERE mr.id = ?
        ORDER BY i.date DESC
    ''', [mentor_id]).fetchall()
    return jsonify([dict(d) for d in data])

@app.route('/api/ai/insights', methods=['GET'])
def ai_insights():
    import json
    from datetime import datetime, date
    import os

    # 1. Check who is asking (Admin vs Mentor)
    email = request.args.get('email') 
    db = get_db()
    
    # 2. Build the query
    query = '''
        SELECT mr.name as mentor_name, me.name as mentee_name,
               MAX(i.date) as last_interaction, a.id
        FROM allocations a
        JOIN mentors mr ON a.mentor_id = mr.id
        JOIN mentees me ON a.mentee_id = me.id
        LEFT JOIN interactions i ON a.id = i.allocation_id
    '''
    params = []
    
    # 3. Filter if it's a mentor logging in
    if email:
        query += ' WHERE mr.email = ?'
        params.append(email)
        
    query += ' GROUP BY a.id'

    allocations = db.execute(query, params).fetchall()
    data = [dict(a) for a in allocations]

    # 4. Your original Fallback function (untouched!)
    def generate_fallback(data):
        today = date(2026, 3, 28)
        suggestions = {
            "At Risk": [
                "Immediate intervention recommended. Schedule a meeting this week.",
                "No contact for over a month. Reach out via email or phone.",
                "Critical threshold reached. Priority follow-up required."
            ],
            "Needs Attention": [
                "Approaching critical period. A brief check-in would help.",
                "Mid-semester approaching. Discuss academic progress soon.",
                "Engagement declining. Schedule a follow-up session."
            ],
            "On Track": [
                "Regular engagement observed. Continue current approach.",
                "Strong progress noted. Encourage extracurricular participation.",
                "Excellent rapport established. Maintain meeting frequency."
            ]
        }
        result = []
        for i, item in enumerate(data):
            last = item.get('last_interaction')
            if last:
                last_date = datetime.strptime(last, '%Y-%m-%d').date()
                days = (today - last_date).days
                if days > 30:
                    status = "At Risk"
                elif days > 15:
                    status = "Needs Attention"
                else:
                    status = "On Track"
            else:
                status = "At Risk"
            result.append({
                "mentor_name": item['mentor_name'],
                "mentee_name": item['mentee_name'],
                "last_interaction": last or "Never",
                "status": status,
                "suggestion": suggestions[status][i % 3]
            })
        return result

    # 5. Your original Groq logic (untouched!)
    try:
        from groq import Groq
        client = Groq(api_key=os.getenv('GROQ_API_KEY'))
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "user",
                "content": f"""Analyze mentor-mentee data for a college system.
Data: {data}
Today: 2026-03-28.
Rules:
- At Risk = no interaction OR last interaction more than 30 days ago
- Needs Attention = 15 to 30 days ago
- On Track = within 15 days
Return ONLY a valid JSON array. No markdown. No backticks. No explanation.
Format: [{{"mentor_name":"X","mentee_name":"Y","last_interaction":"date","status":"At Risk","suggestion":"text"}}]"""
            }],
            temperature=0.3,
        )
        text = response.choices[0].message.content.strip()
        if '```' in text:
            text = text.replace('```json', '').replace('```', '').strip()
        insights = json.loads(text)
        print("Groq succeeded!")
        return jsonify(insights)
    except Exception as e:
        print(f"Groq failed: {e} — using smart fallback")
        return jsonify(generate_fallback(data))
        
@app.route('/api/reports/yearwise', methods=['GET'])
def yearwise_report():
    db = get_db()
    data = db.execute('''
        SELECT me.academic_year, COUNT(i.id) as total_interactions
        FROM interactions i
        JOIN allocations a ON i.allocation_id = a.id
        JOIN mentees me ON a.mentee_id = me.id
        GROUP BY me.academic_year
        ORDER BY me.academic_year
    ''').fetchall()
    return jsonify([dict(d) for d in data])

@app.route('/api/reports/mentorwise', methods=['GET'])
def mentorwise_report():
    email = request.args.get('email') # Check who is asking!
    db = get_db()
    
    query = '''
        SELECT mr.id, mr.name, mr.department,
               COUNT(DISTINCT a.mentee_id) as mentee_count,
               COUNT(i.id) as total_interactions,
               MAX(i.date) as last_active
        FROM mentors mr
        LEFT JOIN allocations a ON mr.id = a.mentor_id
        LEFT JOIN interactions i ON a.id = i.allocation_id
    '''
    params = []
    
    # Filter for specific mentor if email is provided
    if email:
        query += ' WHERE mr.email = ?'
        params.append(email)
        
    query += ' GROUP BY mr.id'
    
    data = db.execute(query, params).fetchall()
    return jsonify([dict(d) for d in data])

# ─── PDF REPORTS ───────────────────────────────────────
@app.route('/api/reports/pdf/individual/<int:allocation_id>', methods=['GET'])
def pdf_individual(allocation_id):
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.units import cm
    import io
    from flask import send_file

    db = get_db()
    info = db.execute('''
        SELECT mr.name as mentor_name, me.name as mentee_name, mr.department
        FROM allocations a
        JOIN mentors mr ON a.mentor_id = mr.id
        JOIN mentees me ON a.mentee_id = me.id
        WHERE a.id = ?
    ''', [allocation_id]).fetchone()

    interactions = db.execute('''
        SELECT date, mode, notes, action_items, next_meeting_date
        FROM interactions WHERE allocation_id = ?
        ORDER BY date DESC
    ''', [allocation_id]).fetchall()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    story = []

    # Title
    title_style = ParagraphStyle('Title', parent=styles['Title'], fontSize=18, textColor=colors.HexColor('#1e40af'))
    story.append(Paragraph("MentorBridge - Individual Interaction Report", title_style))
    story.append(Spacer(1, 0.5*cm))

    if info:
        story.append(Paragraph(f"<b>Mentor:</b> {info['mentor_name']}", styles['Normal']))
        story.append(Paragraph(f"<b>Mentee:</b> {info['mentee_name']}", styles['Normal']))
        story.append(Paragraph(f"<b>Department:</b> {info['department']}", styles['Normal']))
        story.append(Spacer(1, 0.5*cm))

    for i in interactions:
        data = [
            ['Date', i['date']],
            ['Mode', i['mode']],
            ['Notes', i['notes'] or '-'],
            ['Action Items', i['action_items'] or '-'],
            ['Next Meeting', i['next_meeting_date'] or '-'],
        ]
        t = Table(data, colWidths=[4*cm, 13*cm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#dbeafe')),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(t)
        story.append(Spacer(1, 0.4*cm))

    doc.build(story)
    buffer.seek(0)
    return send_file(buffer, mimetype='application/pdf',
                     as_attachment=True,
                     download_name=f'individual_report_{allocation_id}.pdf')


@app.route('/api/reports/pdf/mentorwise', methods=['GET'])
def pdf_mentorwise():
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.units import cm
    import io
    from flask import send_file

    db = get_db()
    mentors = db.execute('''
        SELECT mr.name, mr.department,
               COUNT(DISTINCT a.mentee_id) as mentee_count,
               COUNT(i.id) as total_interactions,
               MAX(i.date) as last_active
        FROM mentors mr
        LEFT JOIN allocations a ON mr.id = a.mentor_id
        LEFT JOIN interactions i ON a.id = i.allocation_id
        GROUP BY mr.id
    ''').fetchall()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4), topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle('Title', parent=styles['Title'], fontSize=18, textColor=colors.HexColor('#1e40af'))
    story.append(Paragraph("MentorBridge - Mentor-wise Consolidated Report", title_style))
    story.append(Spacer(1, 0.5*cm))

    table_data = [['Mentor Name', 'Department', 'Mentees', 'Total Interactions', 'Last Active']]
    for m in mentors:
        table_data.append([
            m['name'], m['department'],
            str(m['mentee_count']), str(m['total_interactions']),
            m['last_active'] or 'No interactions'
        ])

    t = Table(table_data, colWidths=[6*cm, 4*cm, 3*cm, 5*cm, 5*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#eff6ff')]),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t)

    doc.build(story)
    buffer.seek(0)
    return send_file(buffer, mimetype='application/pdf',
                     as_attachment=True,
                     download_name='mentor_wise_report.pdf')


@app.route('/api/reports/pdf/yearwise', methods=['GET'])
def pdf_yearwise():
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.units import cm
    import io
    from flask import send_file

    db = get_db()
    data = db.execute('''
        SELECT me.academic_year, COUNT(i.id) as total_interactions
        FROM interactions i
        JOIN allocations a ON i.allocation_id = a.id
        JOIN mentees me ON a.mentee_id = me.id
        GROUP BY me.academic_year
        ORDER BY me.academic_year
    ''').fetchall()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle('Title', parent=styles['Title'], fontSize=18, textColor=colors.HexColor('#1e40af'))
    story.append(Paragraph("MentorBridge - Year-wise Consolidated Report", title_style))
    story.append(Spacer(1, 0.5*cm))

    table_data = [['Academic Year', 'Total Interactions']]
    for d in data:
        table_data.append([d['academic_year'], str(d['total_interactions'])])

    t = Table(table_data, colWidths=[8*cm, 8*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#eff6ff')]),
        ('ALIGN', (1,0), (1,-1), 'CENTER'),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t)

    doc.build(story)
    buffer.seek(0)
    return send_file(buffer, mimetype='application/pdf',
                     as_attachment=True,
                     download_name='year_wise_report.pdf')

@app.route('/api/reports/pdf/consolidated', methods=['GET'])
def pdf_consolidated():
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.units import cm
    import io
    from flask import send_file

    db = get_db()
    allocations = db.execute('''
        SELECT mr.name as mentor_name, mr.department,
               me.name as mentee_name, me.academic_year, a.status,
               MAX(i.date) as last_interaction
        FROM allocations a
        JOIN mentors mr ON a.mentor_id = mr.id
        JOIN mentees me ON a.mentee_id = me.id
        LEFT JOIN interactions i ON a.id = i.allocation_id
        GROUP BY a.id
    ''').fetchall()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4), topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle('Title', parent=styles['Title'], fontSize=18, textColor=colors.HexColor('#1e40af'))
    story.append(Paragraph("MentorBridge - Consolidated Mentor-Mentee List", title_style))
    story.append(Spacer(1, 0.5*cm))

    table_data = [['Mentor Name', 'Department', 'Mentee Name', 'Academic Year', 'Last Interaction', 'Status']]
    for a in allocations:
        table_data.append([
            a['mentor_name'], a['department'],
            a['mentee_name'], a['academic_year'],
            a['last_interaction'] or 'No interaction yet',
            a['status']
        ])

    t = Table(table_data, colWidths=[5*cm, 3.5*cm, 5*cm, 3*cm, 4*cm, 3*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#eff6ff')]),
        ('PADDING', (0,0), (-1,-1), 8),
        ('FONTSIZE', (0,0), (-1,-1), 9),
    ]))
    story.append(t)

    doc.build(story)
    buffer.seek(0)
    return send_file(buffer, mimetype='application/pdf',
                     as_attachment=True,
                     download_name='consolidated_list.pdf')

@app.route('/api/allocations/suggest', methods=['GET'])
def suggest_allocation():
    db = get_db()
    mentees = db.execute('''
        SELECT me.* FROM mentees me
        LEFT JOIN allocations a ON me.id = a.mentee_id
        WHERE a.id IS NULL
    ''').fetchall()
    suggestions = []
    for mentee in mentees:
        match = db.execute('''
            SELECT mr.id, mr.name, mr.department,
                   COUNT(a.id) as mentee_count
            FROM mentors mr
            LEFT JOIN allocations a ON mr.id = a.mentor_id
            WHERE mr.department = ?
            GROUP BY mr.id
            ORDER BY mentee_count ASC
            LIMIT 1
        ''', [mentee['department']]).fetchone()
        if match:
            suggestions.append({
                'mentor_id': match['id'],
                'mentor_name': match['name'],
                'mentee_id': mentee['id'],
                'mentee_name': mentee['name'],
                'department': mentee['department'],
                'reason': f'Same dept ({mentee["department"]}), balanced workload'
            })
    return jsonify(suggestions)

@app.route('/api/reports/pdf/mentor-mentees', methods=['GET'])
def pdf_mentor_mentees():
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.units import cm
    import io

    email = request.args.get('email', '')
    db = get_db()

    # Get mentor info
    mentor = db.execute('SELECT * FROM mentors WHERE email = ?', [email]).fetchone()

    # Get their mentees with interaction counts
    mentees = db.execute('''
        SELECT me.name, me.academic_year, me.usn,
               COUNT(i.id) as total_interactions,
               MAX(i.date) as last_interaction
        FROM allocations a
        JOIN mentees me ON a.mentee_id = me.id
        JOIN mentors mr ON a.mentor_id = mr.id
        LEFT JOIN interactions i ON a.id = i.allocation_id
        WHERE mr.email = ?
        GROUP BY me.id
        ORDER BY me.academic_year, me.name
    ''', [email]).fetchall()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    story = []

    # Title
    title_style = ParagraphStyle('CustomTitle', parent=styles['Title'],
                                  fontSize=16, textColor=colors.HexColor('#1e40af'))
    story.append(Paragraph("MentorBridge - Mentor Mentee Report", title_style))
    story.append(Spacer(1, 0.3*cm))

    # Mentor info
    if mentor:
        story.append(Paragraph(f"<b>Mentor:</b> {mentor['name']}", styles['Normal']))
        story.append(Paragraph(f"<b>Department:</b> {mentor['department']}", styles['Normal']))
        story.append(Paragraph(f"<b>Email:</b> {mentor['email']}", styles['Normal']))
        story.append(Spacer(1, 0.5*cm))

    story.append(Paragraph(f"<b>Total Mentees Assigned: {len(mentees)}</b>", styles['Normal']))
    story.append(Spacer(1, 0.3*cm))

    # Mentees table
    table_data = [['Sl.No', 'Student Name', 'USN', 'Year', 'Interactions', 'Last Interaction']]
    for idx, m in enumerate(mentees, 1):
        table_data.append([
            str(idx),
            m['name'],
            m['usn'] or '-',
            m['academic_year'],
            str(m['total_interactions']),
            m['last_interaction'] or 'No interaction yet'
        ])

    t = Table(table_data, colWidths=[1.2*cm, 6*cm, 3.5*cm, 2.5*cm, 2.5*cm, 3.5*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#eff6ff')]),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t)

    doc.build(story)
    buffer.seek(0)

    mentor_name = mentor['name'].replace(' ', '_') if mentor else 'mentor'
    return send_file(buffer, mimetype='application/pdf',
                     as_attachment=True,
                     download_name=f'{mentor_name}_mentee_list.pdf')


if __name__ == '__main__':
    app.run(debug=True, port=5000)