# Copyright (c) 2022, Momscode Technologies and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class BudgetBOM(Document):
	@frappe.whitelist()
	def on_submit(self):
		if not self.created_item:
			frappe.throw("Please Create Finish Good Item through Create Item Button first")
	@frappe.whitelist()
	def get_rate(self,item_code):
		query = """ SELECT * FROM `tabItem Price` WHERE item_code=%s and buying = 1 ORDER BY valid_from DESC LIMIT 1"""

		item_price = frappe.db.sql(query,item_code, as_dict=1)
		rate = item_price[0].price_list_rate if len(item_price) > 0 else 0
		return rate

	@frappe.whitelist()
	def create_item(self):
		table_name = "finish_good"
		obj = {
			"doctype": "Item",
			"item_code": self.opportunity + "_SHEET" ,
			"item_name": self.opportunity + "_SHEET" ,
			"description": self.opportunity + "_SHEET" ,
			"stock_uom": "Nos",
			"item_group": "All Item Groups"
		}
		item_created = frappe.get_doc(obj).insert()
		frappe.db.sql(""" UPDATE `tabFinish Good` SET item_code=%s,item_name=%s,uom=%s WHERE parent=%s """, (item_created.name,item_created.item_name,item_created.stock_uom, self.name))
		frappe.db.commit()
		frappe.db.sql(""" UPDATE `tabBudget BOM` SET created_item=1 WHERE name=%s """, self.name)
		frappe.db.commit()

	@frappe.whitelist()
	def generate_quotation(self):
		obj = {
			"doctype": "Quotation",
			"quotation_to": "Customer",
			"transaction_date": self.posting_date,
			"valid_till": self.posting_date,
			"party_name": self.customer_code,
			"budget_bom_reference": [{
				"budget_bom": self.name
			}],
			"budget_bom_opportunity": [{
				"opportunity": self.opportunity
			}],
			"items": self.get_quotation_items(),
			"additional_operating_cost": self.total_additional_operation_cost
		}
		quotation = frappe.get_doc(obj).insert()
		# frappe.db.sql(""" UPDATE `tabBudget BOM` SET status='Quotation In Progress'  WHERE name=%s """,
		# 			  self.name)
		# frappe.db.commit()
		return quotation.name

	@frappe.whitelist()
	def get_quotation_items(self):
		items = []
		for i in self.finish_good:
			items.append({
				"item_code": i.item_code,
				"item_name": i.item_name,
				"description": i.item_name,
				"qty": i.qty,
				"uom": i.uom,
			})
		return items

	@frappe.whitelist()
	def get_quotation(self):
		quotation = frappe.db.sql(""" 
	                          SELECT COUNT(*) as count, Q.docstatus
	                           FROM tabQuotation as Q
	                           INNER JOIN `tabBudget BOM References` as BBR ON BBR.parent = Q.name
	                          WHERE BBR.budget_bom=%s and Q.docstatus < 2""", self.name, as_dict=1)

		return quotation[0].count > 0