import os
import io
import tokenize

def remove_python_comments(source):
    try:
        io_obj = io.StringIO(source)
        out = ""
        prev_toktype = tokenize.INDENT
        last_col = 0
        last_line = 1
        token_generator = tokenize.generate_tokens(io_obj.readline)
        
        for tok in token_generator:
            token_type = tok[0]
            token_string = tok[1]
            start_line, start_col = tok[2]
            end_line, end_col = tok[3]
            
            if start_line > last_line:
                out += "\n" * (start_line - last_line)
                last_col = 0
            if start_col > last_col:
                out += " " * (start_col - last_col)
                
            if token_type == tokenize.COMMENT:
                # Discard comment
                pass
            elif token_type == tokenize.STRING:
                # Standalone triple-quoted strings (docstrings)
                # Check if it looks like a docstring (usually triple quotes)
                if (token_string.startswith('"""') or token_string.startswith("'''")) and (prev_toktype in [tokenize.NL, tokenize.NEWLINE, tokenize.INDENT]):
                    pass
                else:
                    out += token_string
            else:
                out += token_string
                
            prev_toktype = token_type
            last_col = end_col
            last_line = end_line
            
        # Strip multiple consecutive blank lines for cleanliness
        lines = out.splitlines()
        clean_lines = []
        for line in lines:
            if line.strip() or (clean_lines and clean_lines[-1].strip()):
                clean_lines.append(line)
        return "\n".join(clean_lines) + "\n"
    except Exception as e:
        print(f"Tokenize failed, falling back to simple regex: {e}")
        # Fallback to simple line-by-line comment remover
        lines = source.splitlines()
        clean_lines = []
        for line in lines:
            # Skip pure comment lines
            if line.strip().startswith('#'):
                continue
            # Remove inline comments (handling simple cases)
            if '#' in line:
                parts = line.split('#', 1)
                # Check if '#' is likely in a string
                if not ("'" in parts[1] or '"' in parts[1] or 'http' in parts[0]):
                    line = parts[0].rstrip()
            clean_lines.append(line)
        return "\n".join(clean_lines) + "\n"

def remove_js_comments(text):
    out = []
    i = 0
    n = len(text)
    in_string = False
    string_char = None
    
    while i < n:
        if not in_string:
            if text[i] in ['"', "'", '`']:
                in_string = True
                string_char = text[i]
                out.append(text[i])
                i += 1
                continue
            
            # JSX Comment: {/* ... */}
            if text[i:i+3] == '{/*':
                j = text.find('*/}', i+3)
                if j != -1:
                    i = j + 3
                else:
                    i = n
                continue
                
            # Single line comment: //
            if text[i:i+2] == '//':
                j = text.find('\n', i+2)
                if j != -1:
                    i = j
                else:
                    i = n
                continue
                
            # Multi-line comment: /* ... */
            if text[i:i+2] == '/*':
                j = text.find('*/', i+2)
                if j != -1:
                    i = j + 2
                else:
                    i = n
                continue
        else:
            # Escape character handling in string
            if text[i] == '\\' and i + 1 < n:
                out.append(text[i])
                out.append(text[i+1])
                i += 2
                continue
            if text[i] == string_char:
                in_string = False
            out.append(text[i])
            i += 1
            continue
            
        out.append(text[i])
        i += 1
        
    # Clean up empty lines
    lines = "".join(out).splitlines()
    clean_lines = []
    for line in lines:
        if line.strip() or (clean_lines and clean_lines[-1].strip()):
            clean_lines.append(line)
    return "\n".join(clean_lines) + "\n"

def remove_css_comments(text):
    out = []
    i = 0
    n = len(text)
    in_string = False
    string_char = None
    
    while i < n:
        if not in_string:
            if text[i] in ['"', "'"]:
                in_string = True
                string_char = text[i]
                out.append(text[i])
                i += 1
                continue
            if text[i:i+2] == '/*':
                j = text.find('*/', i+2)
                if j != -1:
                    i = j + 2
                else:
                    i = n
                continue
        else:
            if text[i] == '\\' and i + 1 < n:
                out.append(text[i])
                out.append(text[i+1])
                i += 2
                continue
            if text[i] == string_char:
                in_string = False
            out.append(text[i])
            i += 1
            continue
            
        out.append(text[i])
        i += 1
        
    lines = "".join(out).splitlines()
    clean_lines = []
    for line in lines:
        if line.strip() or (clean_lines and clean_lines[-1].strip()):
            clean_lines.append(line)
    return "\n".join(clean_lines) + "\n"

def process_file(filepath):
    _, ext = os.path.splitext(filepath)
    ext = ext.lower()
    
    if ext not in ['.py', '.js', '.jsx', '.css']:
        return
        
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Skipping file due to read error {filepath}: {e}")
        return
        
    if ext == '.py':
        new_content = remove_python_comments(content)
    elif ext in ['.js', '.jsx']:
        new_content = remove_js_comments(content)
    elif ext == '.css':
        new_content = remove_css_comments(content)
    else:
        return
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Removed comments from: {filepath}")

def main():
    targets = [
        r"c:\Users\md313\OneDrive\Desktop\ai\backend\app",
        r"c:\Users\md313\OneDrive\Desktop\ai\frontend\src"
    ]
    
    for target in targets:
        if os.path.isdir(target):
            for root, dirs, files in os.walk(target):
                # Skip pycache and virtual environments
                if '__pycache__' in root:
                    continue
                for file in files:
                    filepath = os.path.join(root, file)
                    process_file(filepath)
        elif os.path.isfile(target):
            process_file(target)

if __name__ == "__main__":
    main()

