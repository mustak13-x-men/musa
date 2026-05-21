import os
import re
from fpdf import FPDF

class ActionableDocPDF(FPDF):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.set_margins(18, 20, 18)
        self.set_auto_page_break(auto=True, margin=20)

    def header(self):
        if self.page_no() > 1:
            self.set_font("Helvetica", "I", 8)
            self.set_text_color(100, 116, 139) # Slate gray
            self.cell(0, 8, "AI Smart Expense Tracker - Database & Deployment Playbook", align="R")
            self.ln(10)
            
            # Thin line below header
            self.set_draw_color(226, 232, 240)
            self.set_line_width(0.2)
            self.line(self.l_margin, 26, self.w - self.r_margin, 26)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(148, 163, 184) # Light slate
        self.cell(0, 10, f"Page {self.page_no()}", align="R")
        self.set_x(self.l_margin)
        self.cell(0, 10, "MongoDB Setup & Deployment Checklist | Project Manual", align="L")

def sanitize_text(text):
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
        '🍃': '[MongoDB]',
        '🤖': '[AI]',
        '☁️': '[Cloud]',
        '✓': '[OK]',
        '•': '*',
    }
    for key, val in replacements.items():
        text = text.replace(key, val)
    return text.encode('latin1', 'replace').decode('latin1')

def print_bold_parsed_text(pdf, text, base_sz):
    parts = re.split(r'(\*\*.*?\*\*)', text)
    for part in parts:
        if part.startswith('**') and part.endswith('**'):
            bold_text = part[2:-2]
            pdf.set_font("Helvetica", "B", base_sz)
            pdf.write(5, bold_text)
        else:
            pdf.set_font("Helvetica", "", base_sz)
            pdf.write(5, part)

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
        
        # 1. Code blocks
        if san_line.strip().startswith("```"):
            if not in_code_block:
                in_code_block = True
                code_lines = []
            else:
                in_code_block = False
                pdf.set_font("Courier", "", 8.5)
                pdf.set_text_color(15, 23, 42)
                pdf.set_fill_color(248, 250, 252)
                pdf.set_draw_color(226, 232, 240)
                
                block_height = len(code_lines) * 4.5 + 4
                if pdf.get_y() + block_height > pdf.page_break_trigger:
                    pdf.add_page()
                
                pdf.cell(0, 1, "", "TLR", ln=1, fill=True)
                for cl in code_lines:
                    pdf.cell(0, 4.5, "  " + cl, "LR", ln=1, fill=True)
                pdf.cell(0, 1, "", "BLR", ln=1, fill=True)
                pdf.ln(4)
            i += 1
            continue

        if in_code_block:
            code_lines.append(san_line)
            i += 1
            continue

        if not san_line.strip():
            pdf.ln(3)
            i += 1
            continue

        # 2. H1
        if san_line.startswith("# "):
            title = san_line[2:].strip()
            pdf.set_font("Helvetica", "B", 18)
            pdf.set_text_color(79, 70, 229) # Indigo
            pdf.ln(6)
            pdf.multi_cell(0, 10, title, ln=1)
            pdf.ln(2)
            
            pdf.set_draw_color(99, 102, 241)
            pdf.set_line_width(0.8)
            pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
            pdf.ln(5)
            i += 1
            continue

        # 3. H2
        if san_line.startswith("## "):
            section = san_line[3:].strip()
            pdf.set_font("Helvetica", "B", 13.5)
            pdf.set_text_color(79, 70, 229)
            pdf.ln(5)
            
            if pdf.get_y() + 20 > pdf.page_break_trigger:
                pdf.add_page()
                
            pdf.multi_cell(0, 8, section, ln=1)
            pdf.ln(2)
            
            pdf.set_draw_color(226, 232, 240)
            pdf.set_line_width(0.4)
            pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
            pdf.ln(3)
            i += 1
            continue

        # 4. H3
        if san_line.startswith("### "):
            sub_section = san_line[4:].strip()
            pdf.set_font("Helvetica", "B", 11)
            pdf.set_text_color(15, 23, 42)
            pdf.ln(3)
            
            if pdf.get_y() + 15 > pdf.page_break_trigger:
                pdf.add_page()
                
            pdf.multi_cell(0, 6, sub_section, ln=1)
            pdf.ln(2)
            i += 1
            continue

        # 5. Horizontal rules
        if san_line.strip() == "---":
            pdf.ln(2)
            pdf.set_draw_color(226, 232, 240)
            pdf.set_line_width(0.2)
            pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
            pdf.ln(4)
            i += 1
            continue

        # 6. List elements
        list_match = re.match(r'^(\s*)([\*\-\+])\s+(.*)', san_line)
        num_list_match = re.match(r'^(\s*)(\d+\.)\s+(.*)', san_line)
        
        if list_match:
            indent = len(list_match.group(1)) * 4 + 6
            content = list_match.group(3)
            
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(51, 65, 85)
            
            pdf.set_x(pdf.l_margin + indent - 4)
            pdf.write(5, "- ")
            
            pdf.set_x(pdf.l_margin + indent)
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
            
            pdf.set_x(pdf.l_margin + indent - 6)
            pdf.write(5, num + " ")
            
            pdf.set_x(pdf.l_margin + indent)
            print_bold_parsed_text(pdf, content, 10)
            pdf.ln(5)
            i += 1
            continue

        # 7. Normal paragraphs
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(51, 65, 85)
        print_bold_parsed_text(pdf, san_line, 10)
        pdf.ln(5)
        i += 1

def make_cover_page(pdf):
    pdf.add_page()
    pdf.set_fill_color(79, 70, 229) # Indigo 600
    pdf.rect(0, 0, pdf.w, 75, "F")
    
    pdf.set_fill_color(99, 102, 241) # Indigo 500
    pdf.rect(0, 75, pdf.w, 4, "F")
    
    pdf.set_y(25)
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 12, "MONGODB & DEPLOYMENT GUIDE", align="C", ln=1)
    pdf.set_font("Helvetica", "", 14)
    pdf.cell(0, 10, "Developer Execution Handbook", align="C", ln=1)
    
    pdf.set_y(95)
    pdf.set_font("Helvetica", "B", 15)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 10, "Your Actionable Next Steps", align="C", ln=1)
    
    pdf.ln(8)
    pdf.set_font("Helvetica", "", 10.5)
    pdf.set_text_color(71, 85, 105)
    pdf.multi_cell(0, 6, "A step-by-step PDF execution playbook outlining exactly how to establish local or cloud MongoDB instances, connect your application, activate dynamic AI interfaces, and deploy your frontend and backend repositories on Render and Vercel services.", align="C")
    
    pdf.set_y(210)
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.set_text_color(79, 70, 229)
    pdf.cell(0, 6, "CONFIDENTIAL DEVELOPER ARTIFACT", align="C", ln=1)
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(0, 5, "AI Smart Expense Tracker & Savings Planner v1.0.0", align="C", ln=1)
    pdf.cell(0, 5, "Database Integration & Live Web Setup Blueprint", align="C", ln=1)

def build_pdf_document():
    pdf = ActionableDocPDF()
    pdf.set_title("AI Smart Expense Tracker - MongoDB & Deployment Guide")
    
    make_cover_page(pdf)
    pdf.add_page()
    
    guide_path = r"c:\Users\md313\OneDrive\Desktop\ai\next_steps_guide.md"
    print("Parsing next_steps_guide.md...")
    parse_markdown(pdf, guide_path)
    
    output_path = r"c:\Users\md313\OneDrive\Desktop\ai\Next_Steps_MongoDB_and_Deployment_Guide.pdf"
    pdf.output(output_path)
    print(f"Success! PDF successfully compiled at: {output_path}")

if __name__ == "__main__":
    build_pdf_document()
