import os
import re
from fpdf import FPDF

class PremiumDocPDF(FPDF):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.set_margins(18, 20, 18)
        self.set_auto_page_break(auto=True, margin=20)
        self.current_section = ""

    def header(self):
        if self.page_no() > 1:
            # Subtle header running title
            self.set_font("Helvetica", "I", 8)
            self.set_text_color(100, 116, 139) # Slate gray
            self.cell(0, 8, "AI Smart Expense Tracker & Savings Planner - Complete Documentation", align="R")
            self.ln(10)
            
            # Thin decorative line below header
            self.set_draw_color(226, 232, 240)
            self.set_line_width(0.2)
            self.line(self.l_margin, 26, self.w - self.r_margin, 26)

    def footer(self):
        # Footer on all pages
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(148, 163, 184) # Light slate
        
        # Left-aligned brand, right-aligned page numbers
        self.cell(0, 10, f"Page {self.page_no()}", align="R")
        self.set_x(self.l_margin)
        self.cell(0, 10, "Developer Playbook & User Guide | Confidential", align="L")

def sanitize_text(text):
    # Map special unicode symbols to standardized ASCII / PDF-safe symbols
    replacements = {
        '₹': 'Rs. ',
        '€': 'EUR ',
        '£': 'GBP ',
        '–': '-',
        '—': '-',
        '’': "'",
        '‘': "'",
        '“': '"',
        '”': '"',
        '…': '...',
        '🗺️': '[Workspace Map]',
        '⚙️': '[Configuration]',
        '🚀': '[Setup]',
        '🔬': '[Code Mechanics]',
        '🌟': '[Key Features]',
        '🛠️': '[Tech Stack]',
        '📊': '[Database collections]',
        '📈': '[Analytics]',
        '☁️': '[Production Deployment]',
        '✓': '[OK]',
        '•': '*',
    }
    
    for key, val in replacements.items():
        text = text.replace(key, val)
        
    # Remove any other non-latin1 characters to prevent FPDF crash
    text = text.encode('latin1', 'replace').decode('latin1')
    return text

def parse_markdown(pdf, file_path):
    if not os.path.exists(file_path):
        print(f"Warning: {file_path} not found.")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    in_code_block = False
    code_lines = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        san_line = sanitize_text(line).rstrip('\n')
        
        # 1. Handle Code Blocks
        if san_line.strip().startswith("```"):
            if not in_code_block:
                in_code_block = True
                code_lines = []
            else:
                in_code_block = False
                # Print code block
                pdf.set_font("Courier", "", 8.5)
                pdf.set_text_color(15, 23, 42) # Slate 900
                pdf.set_fill_color(248, 250, 252) # Slate 50 background
                pdf.set_draw_color(226, 232, 240) # Border Slate 200
                
                # Check height of code block to avoid orphan blocks
                block_height = len(code_lines) * 4.5 + 4
                if pdf.get_y() + block_height > pdf.page_break_trigger:
                    pdf.add_page()
                
                # Multi-cell rounded-like block with top/bottom padding
                pdf.cell(0, 1, "", "TLR", ln=1, fill=True)
                for cl in code_lines:
                    # Escape or replace backslashes if needed, and print
                    pdf.cell(0, 4.5, "  " + cl, "LR", ln=1, fill=True)
                pdf.cell(0, 1, "", "BLR", ln=1, fill=True)
                pdf.ln(4)
            i += 1
            continue

        if in_code_block:
            code_lines.append(san_line)
            i += 1
            continue

        # 2. Skip empty lines or treat as paragraph break
        if not san_line.strip():
            pdf.ln(3)
            i += 1
            continue

        # 3. Headers
        if san_line.startswith("# "):
            title = san_line[2:].strip()
            pdf.set_font("Helvetica", "B", 20)
            pdf.set_text_color(79, 70, 229) # Indigo 600
            pdf.ln(6)
            pdf.multi_cell(0, 10, title, ln=1)
            pdf.ln(2)
            
            # Thick horizontal color line under main titles
            pdf.set_draw_color(99, 102, 241) # Indigo 500
            pdf.set_line_width(0.8)
            pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
            pdf.ln(5)
            i += 1
            continue

        if san_line.startswith("## "):
            section = san_line[3:].strip()
            pdf.set_font("Helvetica", "B", 14)
            pdf.set_text_color(79, 70, 229) # Indigo 600
            pdf.ln(5)
            
            # Ensure section heading doesn't stand alone at page bottom
            if pdf.get_y() + 20 > pdf.page_break_trigger:
                pdf.add_page()
                
            pdf.multi_cell(0, 8, section, ln=1)
            pdf.ln(2)
            
            # Accent line
            pdf.set_draw_color(226, 232, 240)
            pdf.set_line_width(0.4)
            pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
            pdf.ln(3)
            i += 1
            continue

        if san_line.startswith("### "):
            sub_section = san_line[4:].strip()
            pdf.set_font("Helvetica", "B", 11.5)
            pdf.set_text_color(15, 23, 42) # Slate 900
            pdf.ln(3)
            
            if pdf.get_y() + 15 > pdf.page_break_trigger:
                pdf.add_page()
                
            pdf.multi_cell(0, 6, sub_section, ln=1)
            pdf.ln(2)
            i += 1
            continue

        # 4. Horizontal Rules
        if san_line.strip() == "---":
            pdf.ln(2)
            pdf.set_draw_color(226, 232, 240)
            pdf.set_line_width(0.2)
            pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
            pdf.ln(4)
            i += 1
            continue

        # 5. List items
        # Matches formats like: "* Item", "- Item", "1. Item"
        list_match = re.match(r'^(\s*)([\*\-\+])\s+(.*)', san_line)
        num_list_match = re.match(r'^(\s*)(\d+\.)\s+(.*)', san_line)
        
        if list_match:
            indent = len(list_match.group(1)) * 4 + 6
            content = list_match.group(3)
            
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(51, 65, 85) # Slate 700
            
            # Bullet point symbol placement
            pdf.set_x(pdf.l_margin + indent - 4)
            pdf.write(5, "- ")
            
            # Text body wrapping
            pdf.set_x(pdf.l_margin + indent)
            # Custom bold parsing inside lists (e.g. **Bold**: text)
            print_bold_parsed_text(pdf, content, 10)
            pdf.ln(5)
            i += 1
            continue

        elif num_list_match:
            indent = len(num_list_match.group(1)) * 4 + 6
            num = num_list_match.group(2)
            content = num_list_match.group(3)
            
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(51, 65, 85)
            
            # Number placement
            pdf.set_x(pdf.l_margin + indent - 6)
            pdf.write(5, num + " ")
            
            # Text body wrapping
            pdf.set_x(pdf.l_margin + indent)
            print_bold_parsed_text(pdf, content, 10)
            pdf.ln(5)
            i += 1
            continue

        # 6. Normal Paragraph
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(51, 65, 85) # Slate 700
        print_bold_parsed_text(pdf, san_line, 10)
        pdf.ln(5)
        i += 1

def print_bold_parsed_text(pdf, text, base_sz):
    # Splits text into parts separating **bold** text
    parts = re.split(r'(\*\*.*?\*\*)', text)
    x_pos = pdf.get_x()
    
    for part in parts:
        if part.startswith('**') and part.endswith('**'):
            bold_text = part[2:-2]
            pdf.set_font("Helvetica", "B", base_sz)
            pdf.write(5, bold_text)
        else:
            pdf.set_font("Helvetica", "", base_sz)
            pdf.write(5, part)

def make_cover_page(pdf):
    # Custom stylized cover page
    pdf.add_page()
    
    # Premium background accent top bar
    pdf.set_fill_color(79, 70, 229) # Indigo 600
    pdf.rect(0, 0, pdf.w, 80, "F")
    
    # Accent gradient-like stripe
    pdf.set_fill_color(99, 102, 241) # Indigo 500
    pdf.rect(0, 80, pdf.w, 4, "F")
    
    # Title on Cover Page
    pdf.set_y(30)
    pdf.set_font("Helvetica", "B", 24)
    pdf.set_text_color(255, 255, 255) # White
    pdf.cell(0, 12, "AI SMART EXPENSE TRACKER", align="C", ln=1)
    pdf.set_font("Helvetica", "", 16)
    pdf.cell(0, 10, "& SAVINGS PLANNER", align="C", ln=1)
    
    # White subtitle block in the middle
    pdf.set_y(100)
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(15, 23, 42) # Slate 900
    pdf.cell(0, 10, "Developer Documentation & Technical Playbook", align="C", ln=1)
    
    pdf.ln(10)
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(71, 85, 105) # Slate 600
    pdf.multi_cell(0, 6, "This comprehensive playbook combines architectural designs, schema descriptions, run manuals, and frontend/backend code explanations for the AI-powered smart budgeting ecosystem.", align="C")
    
    # Metadata footer on cover page
    pdf.set_y(220)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(79, 70, 229) # Indigo
    pdf.cell(0, 6, "PROJECT ARTIFACT & MANUALS", align="C", ln=1)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(148, 163, 184) # Light Slate
    pdf.cell(0, 5, "Compiled Automatically | Target Build: v1.0.0", align="C", ln=1)
    pdf.cell(0, 5, "Environment Stack: Python Flask + React.js + MongoDB", align="C", ln=1)

def build_pdf_document():
    pdf = PremiumDocPDF()
    pdf.set_title("AI Smart Expense Tracker & Savings Planner - Master Documentation")
    
    # 1. Create cover page
    make_cover_page(pdf)
    
    # 2. Add first content page
    pdf.add_page()
    
    # Parse project guide first (detailed developer playbook)
    guide_path = r"C:\Users\md313\.gemini\antigravity\brain\040082e3-1878-478c-897e-1372295ae585\project_guide.md"
    print("Parsing project_guide.md...")
    parse_markdown(pdf, guide_path)
    
    # Add section separator
    pdf.add_page()
    pdf.set_y(30)
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(79, 70, 229)
    pdf.cell(0, 10, "README & User Quickstart", align="C", ln=1)
    pdf.ln(4)
    pdf.set_draw_color(99, 102, 241)
    pdf.set_line_width(0.8)
    pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
    pdf.ln(10)
    
    # Parse README.md (quickstart & run manuals)
    readme_path = r"c:\Users\md313\OneDrive\Desktop\ai\README.md"
    print("Parsing README.md...")
    parse_markdown(pdf, readme_path)
    
    # Output PDF
    output_path = r"c:\Users\md313\OneDrive\Desktop\ai\AI_Smart_Expense_Tracker_Documentation.pdf"
    pdf.output(output_path)
    print(f"Success! PDF successfully compiled at: {output_path}")

if __name__ == "__main__":
    build_pdf_document()
