import frappe, json

def validate_wo(doc, method):
    doc.allow_alternative_item = 1


def on_cancel_wo(doc, method):
    if doc.stock_entry:
        se = frappe.get_doc("Stock Entry", doc.stock_entry)
        frappe.db.sql(""" UPDATE `tabWork Order`  SET stock_entry='' WHERE name=%s""", doc.name)
        frappe.db.commit()

        se.cancel()

    se = frappe.db.sql(""" SELECT * FROM `tabStock Entry` WHERE work_order=%s""",doc.name, as_dict=1)
    if len(se) > 0:
        for i in se:
            if i.name:
                sssee = frappe.get_doc("Stock Entry", i.name)
                sssee.cancel()

@frappe.whitelist()
def generate_stock_entry(budget_bom,items, work_order,cost_center):
    data_bb = json.loads(budget_bom)
    for i in data_bb:
        bb = frappe.get_doc("Budget BOM", i['budget_bom'])
        if bb.raw_material_from_customer != 'Customer':
            frappe.throw("Material Receipt Stock Entry is not allowed for Budget BOM " + i['budget_bom'])
    data = json.loads(items)

    obj = {
        "doctype": "Stock Entry",
        "stock_entry_type": "Material Receipt",
        "work_order": work_order,
        "items": get_items(data,cost_center)
    }
    se = frappe.get_doc(obj).insert()
    frappe.db.sql(""" UPDATE `tabWork Order` SET stock_entry=%s WHERE name=%s""", (se.name,work_order))
    frappe.db.commit()
    se.submit()

def get_items(data,cost_center):
    difference_account = frappe.db.get_single_value('Manufacturing Settings', 'difference_account')
    if not difference_account:
        frappe.throw("Please set default Difference Account in Manufacturing Settings")
    items = []
    for i in data:
        items.append({
            "t_warehouse": i['source_warehouse'],
            "item_code": i['item_code'],
            "qty": i['required_qty'],
            "cost_center": cost_center,
            "expense_account": difference_account
        })

    return items