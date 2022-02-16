import frappe, json

def validate_wo(doc, method):
    doc.allow_alternative_item = 1



@frappe.whitelist()
def generate_stock_entry(budget_bom,items):
    data_bb = json.loads(budget_bom)
    for i in data_bb:
        bb = frappe.get_doc("Budget BOM", i['budget_bom'])
        if bb.raw_material_from_customer != 'Customer':
            frappe.throw("Material Receipt Stock Entry is not allowed for Budget BOM " + i['budget_bom'])
    data = json.loads(items)

    obj = {
        "doctype": "Stock Entry",
        "stock_entry_type": "Material Receipt",
        "items": get_items(data)
    }
    se = frappe.get_doc(obj).insert()
    se.submit()

def get_items(data):
    items = []
    for i in data:
        items.append({
            "t_warehouse": i['source_warehouse'],
            "item_code": i['item_code'],
            "qty": i['required_qty']
        })

    return items