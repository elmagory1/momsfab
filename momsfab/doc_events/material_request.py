import frappe

@frappe.whitelist()
def on_submit_mr(doc, method):
    for i in doc.budget_bom_reference:
        if i.budget_bom:
            frappe.db.sql(""" UPDATE `tabBudget BOM` SET status='To BOM' WHERE name=%s """, i.budget_bom)
            frappe.db.commit()
@frappe.whitelist()
def get_budget_bom(doctype,target,e,r,t,filter):
    print("FILTEEEEEEEEEEEEEEEER")
    print(filter)
    print(tuple(filter['data']))
    condition = ""
    if len(filter['data']) == 1:
        condition += " and name!='{0}'".format(filter['data'][0])

    if len(filter['data']) > 1:
        condition += " and name not in {0}".format(tuple(filter['data']))

    query = """ SELECT opportunity as name, name as budget_bom, customer_name FROM `tabBudget BOM` WHERE status='To Material Request' and docstatus=1 {0}""".format(condition)
    opportunities = frappe.db.sql(query,as_dict=1)
    return opportunities


def validate_mr(doc, method):
    for i in doc.budget_bom_reference:
        if i.budget_bom:
            for ii in doc.items:
                if ii.budget_bom_raw_material:
                    rate = frappe.db.sql(""" SELECT * from `tabBudget BOM Details` WHERE name=%s""", ii.budget_bom_raw_material, as_dict=1)
                    rate1 = frappe.db.sql(""" SELECT * from `tabBudget BOM Details Engineering` WHERE name=%s""", ii.budget_bom_raw_material, as_dict=1)
                    rate2 = frappe.db.sql(""" SELECT * from `tabBudget BOM Details Pipe Estimation` WHERE name=%s""", ii.budget_bom_raw_material, as_dict=1)

                    if len(rate) > 0:
                        ii.budget_bom_rate =  ii.rate if rate[0].rate == 0 else rate[0].rate

                    elif len(rate1) > 0:
                        ii.budget_bom_rate =  ii.rate if rate1[0].rate == 0 else rate1[0].rate

                    elif len(rate2) > 0:
                        ii.budget_bom_rate =  ii.rate if rate2[0].rate == 0 else rate2[0].rate

def cancel_mr(doc, method):
    for i in doc.budget_bom_reference:
        if i.budget_bom:
            frappe.db.sql(""" UPDATE `tabBudget BOM` SET status=%s WHERE name=%s""", ('To Material Request', i.budget_bom))
            frappe.db.commit()