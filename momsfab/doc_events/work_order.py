import frappe

def validate_wo(doc, method):
    doc.allow_alternative_item = 1