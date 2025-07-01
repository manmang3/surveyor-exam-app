#!/usr/bin/env python3
import pdfplumber
import pytesseract
import sys
import json
import re
from PIL import Image

def extract_pdf_text_with_ocr(pdf_path):
    """Extract text from PDF using OCR"""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            print(f"PDF has {len(pdf.pages)} pages")
            for i, page in enumerate(pdf.pages):
                print(f"Processing page {i+1}")
                
                # First try direct text extraction
                page_text = page.extract_text()
                if page_text and len(page_text.strip()) > 10:
                    text += page_text + "\n"
                    print(f"Page {i+1}: extracted {len(page_text)} characters directly")
                else:
                    # If no text, convert page to image and use OCR
                    print(f"Page {i+1}: using OCR...")
                    im = page.within_bbox((0, 0, page.width, page.height)).to_image()
                    pil_image = im.original
                    
                    # Use OCR with Japanese language support
                    ocr_text = pytesseract.image_to_string(pil_image, lang='jpn')
                    if ocr_text:
                        text += ocr_text + "\n"
                        print(f"Page {i+1}: OCR extracted {len(ocr_text)} characters")
                    else:
                        print(f"Page {i+1}: no text extracted")
        return text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        import traceback
        traceback.print_exc()
        return None

def parse_questions(text, year):
    """Parse questions from extracted text"""
    questions = []
    
    # Print first part of text to understand structure
    print("\n--- Text structure analysis ---")
    lines = text.split('\n')
    for i, line in enumerate(lines[:20]):
        print(f"Line {i}: {line}")
    
    # Look for question patterns
    question_pattern = r'第\s*(\d+)\s*問'
    matches = list(re.finditer(question_pattern, text))
    print(f"\nFound {len(matches)} question markers")
    
    for i, match in enumerate(matches[:5]):  # Show first 5 matches
        start = match.start()
        end = start + 200
        print(f"Question {match.group(1)}: {text[start:end]}...")
    
    return questions

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python extract_pdf_ocr.py <pdf_path>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    year = "平成19年"  # Default for the first file
    
    print(f"Extracting text from {pdf_path} using OCR")
    text = extract_pdf_text_with_ocr(pdf_path)
    
    if text:
        print(f"Extracted {len(text)} characters")
        
        # Save raw text for analysis
        with open("extracted_text_ocr.txt", "w", encoding="utf-8") as f:
            f.write(text)
        print("Raw text saved to extracted_text_ocr.txt")
        
        print("\n--- Parsing questions ---")
        questions = parse_questions(text, year)
        
    else:
        print("Failed to extract text from PDF")