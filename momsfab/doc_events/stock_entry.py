import frappe

def on_submit_se(doc, method):
    if doc.stock_entry_type == 'Manufacture' and doc.work_order:
        wo = frappe.get_doc("Work Order", doc.work_order)

        for i in wo.budget_bom_reference:
            if i.budget_bom:
                frappe.db.sql(""" UPDATE `tabBudget BOM` SET status=%s WHERE name=%s  """,
                              ("To Deliver and Bill", i.budget_bom))
                frappe.db.commit()


def on_save_se(doc, method):
    if doc.stock_entry_type in ['Material Receipt'] and doc.work_order and doc.flags.in_insert:
        wo = frappe.get_doc("Work Order", doc.work_order)
        for i in wo.budget_bom_reference:
            if i.budget_bom:
                bb = frappe.get_doc("Budget BOM", i.budget_bom)
                for xxx in bb.additional_operations_cost_without_charge:
                    doc.append("additional_costs",{
                        "expense_account": xxx.account,
                        "description": xxx.description,
                        "amount": xxx.amount,
                    })
                for xxx in bb.additional_operations_cost:
                    doc.append("additional_costs",{
                        "expense_account": xxx.account,
                        "description": xxx.description,
                        "amount": xxx.total_charge,
                    })
        total_amount = 0
        for i in doc.additional_costs:
            total_amount += i.amount
        doc.total_additional_costs = total_amount
        doc.value_difference = total_amount
