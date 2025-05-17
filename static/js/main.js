document.addEventListener('DOMContentLoaded', function() {
    // Initialize the editor
    const editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/python");
    editor.setFontSize(14);
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        highlightActiveLine: true,
        highlightGutterLine: true,
        showPrintMargin: false,
        tabSize: 4
    });

    // Get elements
    const exampleSelect = document.getElementById('example-select');
    const runBtn = document.getElementById('run-btn');
    const saveBtn = document.getElementById('save-btn');
    const clearOutput = document.getElementById('clear-output');
    const outputDiv = document.getElementById('output');

    // Example code options
    const examples = {
        hello: 'print("Hello, World!")',
        calculator: `def add(a, b):
    return a + b

# Example usage
result = add(5, 3)
print(f"Result: {result}")`,
        list: `numbers = [1, 2, 3, 4, 5]
print("Original list:", numbers)

# Add element
numbers.append(6)
print("After adding element:", numbers)

# Remove element
numbers.remove(3)
print("After removing element:", numbers)`,
        loop: `for i in range(5):
    print(f"Number: {i}")`,
        function: `def greet(name):
    return f"Hello, {name}!"

# Example usage
print(greet("John"))`
    };

    // Handle example selection
    exampleSelect.addEventListener('change', function() {
        const selectedValue = this.value;
        if (selectedValue) {
            editor.setValue(examples[selectedValue], -1);
        }
    });

    // Handle run button click
    runBtn.addEventListener('click', async function() {
        const code = editor.getValue();
        if (!code.trim()) {
            alert('Please enter some code first!');
            return;
        }

        try {
            const response = await fetch('/run_code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: code })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                outputDiv.innerHTML = data.output;
                if (data.error) {
                    outputDiv.style.color = 'red';
                } else {
                    outputDiv.style.color = 'inherit';
                }
            } else {
                outputDiv.innerHTML = 'Error: ' + data.error;
                outputDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Error:', error);
            outputDiv.innerHTML = 'Error executing code';
            outputDiv.style.color = 'red';
        }
    });

    // Handle save button click
    saveBtn.addEventListener('click', function() {
        const code = editor.getValue();
        const filename = 'script.py';
        fetch('/save_file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: filename,
                code: code
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('File saved successfully!');
            } else {
                alert('Error saving file: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error saving file');
        });
    });

    // Handle clear output button
    clearOutput.addEventListener('click', function() {
        outputDiv.innerHTML = '';
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            runBtn.click();
        } else if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveBtn.click();
        }
    });
});