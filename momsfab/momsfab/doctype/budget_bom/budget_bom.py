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
		created = False
		if not self.finish_good:
			frappe.throw("Please add Finish Good Item first")
		for i in self.finish_good:
			if not i.item_name:
				frappe.throw("Please input valid item name")
			obj = {
				"doctype": "Item",
				"item_code": i.item_name,
				"item_name": i.item_name,
				"item_group": "All Item Groups",
			}
			item = frappe.get_doc(obj).insert()
			frappe.db.sql(""" UPDATE `tabFinish Good` SET item_code=%s WHERE name=%s """, (item.name, i.name))
			frappe.db.commit()
			created = True
		if created:
			frappe.db.sql(""" UPDATE `tabBudget BOM` SET created_item=1 WHERE name=%s """, self.name)
			frappe.db.commit()