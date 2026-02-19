
import os

def build():
    # Paths
    html_path = 'index.html'
    css_path = 'style.css'
    js_path = 'app.js'
    logo_tmp_path = 'logo.tmp'
    dist_path = 'dist/index.html'

    # Read HTML
    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # Read CSS and inline
    with open(css_path, 'r', encoding='utf-8') as f:
        css = f.read()
    html = html.replace('<link rel="stylesheet" href="style.css">', f'<style>\n{css}\n</style>')

    # Read JS and inline
    with open(js_path, 'r', encoding='utf-8') as f:
        js = f.read()
    html = html.replace('<script src="app.js"></script>', f'<script>\n{js}\n</script>')

    # Read Logo (Base64 from certutil output) and inline
    if os.path.exists(logo_tmp_path):
        with open(logo_tmp_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Filter out start/end lines and newlines
        base64_data = ""
        for line in lines:
            if "BEGIN CERTIFICATE" not in line and "END CERTIFICATE" not in line:
                base64_data += line.strip()
        
        data_uri = f"data:image/png;base64,{base64_data}"
        html = html.replace('src="assets/ikonlogo.png"', f'src="{data_uri}"')
    
    # Ensure dist directory
    os.makedirs(os.path.dirname(dist_path), exist_ok=True)

    # Write output
    with open(dist_path, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"Build complete: {dist_path}")

if __name__ == "__main__":
    build()
