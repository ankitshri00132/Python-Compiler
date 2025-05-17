from flask import Flask, render_template, request, jsonify
import os
import subprocess
import tempfile
import json
from pygments import highlight
from pygments.lexers import PythonLexer
from pygments.formatters import HtmlFormatter
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Create a temporary directory for files
TEMP_DIR = tempfile.mkdtemp()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/run_code', methods=['POST'])
def run_code():
    try:
        data = request.get_json()
        code = data.get('code', '')
        
        # Create a temporary file
        with tempfile.NamedTemporaryFile('w', suffix='.py', dir=TEMP_DIR, delete=False) as f:
            f.write(code)
            file_path = f.name
        
        # Run the code using python
        result = subprocess.run(['python', file_path], 
                              capture_output=True, 
                              text=True,
                              timeout=10)
        
        # Format the output
        output = result.stdout + result.stderr
        formatted_output = highlight(output, PythonLexer(), HtmlFormatter())
        
        return jsonify({
            'output': formatted_output,
            'error': '' if result.returncode == 0 else 'Error executing code'
        })
    except Exception as e:
        return jsonify({
            'output': '',
            'error': str(e)
        }), 500

@app.route('/save_file', methods=['POST'])
def save_file():
    try:
        data = request.json
        file_path = os.path.join(TEMP_DIR, data['filename'])
        with open(file_path, 'w') as f:
            f.write(data['code'])
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/list_files')
def list_files():
    try:
        files = [f for f in os.listdir(TEMP_DIR) if f.endswith('.py')]
        return jsonify({'files': files})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
