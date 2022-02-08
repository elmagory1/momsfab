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
			"stock_uom": "Nos"
		}
		item_created = frappe.get_doc(obj).insert()
		self.__dict__[table_name][0].item_code = item_created.item_code
		self.__dict__[table_name][0].item_name = item_created.item_name
		self.__dict__[table_name][0].uom = item_created.stock_uom
		frappe.db.sql(""" UPDATE `tabBudget BOM` SET created_item=1 WHERE name=%s """, self.name)
		frappe.db.commit()