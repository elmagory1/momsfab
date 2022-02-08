import frappe
from frappe.desk.reportview import get_filters_cond, get_match_cond
@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def bb_query(doctype, txt, searchfield, start, page_len, filters):
    return frappe.db.sql("""
       SELECT * FROm `tabAccount` WHERE account_type='Expenses Included In Valuation' and (delivery_charge = 1 or fuel_charge=1)""")