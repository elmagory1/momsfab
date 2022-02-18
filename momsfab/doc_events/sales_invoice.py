import frappe



def on_submit_si(doc, method):
    for i in doc.budget_bom_reference:
        if i.budget_bom:
            frappe.db.sql(""" UPDATE `tabBudget BOM` SET status=%s WHERE name=%s  """, ("Completed", i.budget_bom))
            frappe.db.commit()


def on_cancel_si(doc, method):
    for i in doc.budget_bom_reference:
        if i.budget_bom:
            frappe.db.sql(""" UPDATE `tabBudget BOM` SET status=%s WHERE name=%s  """, ("To Bill", i.budget_bom))
            frappe.db.commit()
