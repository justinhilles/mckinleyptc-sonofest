import os
from flask import Flask, render_template

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/tickets')
def tickets():
    return render_template('index.html', message="Tickets coming soon!")

@app.route('/chili-entry')
def chili_entry():
    return render_template('index.html', message="Chili cook-off registration opening soon!")

@app.route('/volunteer')
def volunteer():
    return render_template('index.html', message="Volunteer registration opening soon!")

@app.route('/merch')
def merch():
    return render_template('index.html', message="Merchandise store coming soon!")

@app.route('/faq')
def faq():
    return render_template('index.html', message="FAQ page coming soon!")

@app.route('/contact')
def contact():
    return render_template('index.html', message="Contact information coming soon!")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
