# BiztelAI – AI-Powered Workflow Automation System

An AI-powered workflow automation platform designed to digitize handwritten and semi-structured manufacturing/operational documents into structured operational records with validation workflows and analytics dashboards.

Built as part of the BiztelAI Full Stack Engineering Internship Assignment.

---

# Features

## Document Upload
- Upload handwritten images and PDFs
- Supports JPG, PNG, JPEG, and PDF formats
- Upload history tracking
- Previous document access

---

## AI-Based OCR & Extraction
The system extracts structured operational data using OCR + AI workflows.

### Extracted Fields
- Date
- Shift
- Employee Number
- Machine Number
- Work Order Number
- Quantity Produced
- Operation Summary

---

## Review Workflow
- Editable extracted records
- Manual correction support
- Save reviewed operational records

---

## Confidence Scoring
AI confidence scoring is generated for extracted fields.

### Confidence Categories
- High Confidence (70–100%)
- Medium Confidence (40–69%)
- Low Confidence (0–39%)

Low-confidence records are highlighted for manual review.

---

## Validation & Exception Handling
Operational validation rules implemented:

- Missing mandatory fields
- Invalid machine code formats
- Empty quantity values
- Suspicious numeric values
- Invalid shift values
- Duplicate work order detection

Records requiring review are highlighted in the dashboard.

---

# Dashboard & Analytics

The dashboard provides operational insights including:

- Total uploads
- Total processed records
- Average AI confidence score
- Validation issue tracking
- AI confidence distribution
- Shift-wise production summaries
- Machine-wise performance analytics

---

# Search & History
- Search processed operational records
- Filter historical uploads
- View previously extracted documents

---

# System Workflow

```text
Document Upload
      ↓
OCR Processing
      ↓
AI Structured Extraction
      ↓
Confidence Scoring
      ↓
Validation Rules
      ↓
Review Workflow
      ↓
Dashboard Analytics
