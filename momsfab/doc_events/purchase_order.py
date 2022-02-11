import frappe
from frappe.model.mapper import get_mapped_doc



@frappe.whitelist()
def on_submit_po(doc, method):
    if check_items(doc) and not doc.approve_po_rate:
        frappe.throw("PO Rate not Approved")

    for i in doc.budget_bom_reference:
        if i.budget_bom:
            frappe.db.sql(""" UPDATE `tabBudget BOM` SET status=%s WHERE name=%s  """, ("To Purchase Receipt", i.budget_bom))
            frappe.db.commit()
def check_items(doc):
    for i in doc.items:
        if i.rate > i.budget_bom_rate:
            return True

    return False