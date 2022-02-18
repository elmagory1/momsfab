# Copyright (c) 2022, Momscode Technologies and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.model.mapper import get_mapped_doc

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
		fg_item_group = frappe.db.get_single_value('Manufacturing Settings', 'fg_item_group')
		if not fg_item_group:
			frappe.throw("Please set up FG Item Group in Manufacturing Settings")
		obj = {
			"doctype": "Item",
			"item_code": self.opportunity + "_SHEET" ,
			"item_name": self.opportunity + "_SHEET" ,
			"description": self.opportunity + "_SHEET" ,
			"stock_uom": "Nos",
			"item_group": fg_item_group
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
				"description": i.item_name + "<br> Wastage Amount = " + str(self.wastage_amount ),
				"qty": i.qty,
				"uom": i.uom,
				"rate": self.total_amount
			})

		return items

	@frappe.whitelist()
	def check_bom(self):
		bom = frappe.db.sql(""" 
	                           SELECT COUNT(*) as count
	                            FROM tabBOM
	                           WHERE budget_bom=%s and docstatus < 2""", self.name, as_dict=1)

		return bom[0].count > 0

	@frappe.whitelist()
	def get_quotation(self):
		quotation = frappe.db.sql(""" 
	                          SELECT COUNT(*) as count, Q.docstatus
	                           FROM tabQuotation as Q
	                           INNER JOIN `tabBudget BOM References` as BBR ON BBR.parent = Q.name
	                          WHERE BBR.budget_bom=%s and Q.docstatus < 2""", self.name, as_dict=1)

		return quotation[0].count > 0

	@frappe.whitelist()
	def create_bom(self):
		if self.type == "Sheet Estimation":
			self.create_sheet_estimation_bom()

		elif self.type == "Engineering Estimation":
			self.create_engineering_estimation_bom()

		elif self.type == "Pipe Estimation":
			self.create_pip_estimation_bom()

	@frappe.whitelist()
	def create_sheet_estimation_bom(self):

		for i in self.finish_good:
			obj = {
				"doctype": "BOM",
				"item": i.item_code,
				"budget_bom": self.name,
				"with_operations": 1,
				"allow_alternative_item": 1,
				"quantity": i.qty,
				"items": self.get_raw_materials("sheet_estimation"),
				"operations": [{
					"operation": i.operation,
					"workstation": i.workstation,
					"time_in_mins": self.total_operations_time,
					"hour_rate": (self.total_operations_cost / self.total_operations_time) * 60,
					"operating_cost": self.total_operations_cost,
				}]
			}
			print("OBJEEEEEEEEEECT")
			print(obj)
			bom = frappe.get_doc(obj).insert()
			bom.submit()

	@frappe.whitelist()
	def create_engineering_estimation_bom(self):
		for i in self.finish_good:
			obj = {
				"doctype": "BOM",
				"item": i.item_code,
				"budget_bom": self.name,
				"quantity": i.qty,
				"allow_alternative_item": 1,
				"with_operations": 1,
				"items": self.get_raw_materials("engineering_estimation"),
				"operations": [{
					"operation": i.operation,
					"workstation": i.workstation,
					"time_in_mins": self.total_operations_time,
					"hour_rate": (self.total_operations_cost / self.total_operations_time) * 60,
					"operating_cost":self.total_operations_cost,
				}]
			}
			bom = frappe.get_doc(obj).insert()
			bom.submit()

	@frappe.whitelist()
	def create_pip_estimation_bom(self):
		for i in self.finish_good:
			obj = {
				"doctype": "BOM",
				"item": i.item_code,
				"quantity": i.qty,
				"with_operations": 1,
				"budget_bom": self.name,
				"items": self.get_raw_materials("pipe_estimation"),
				"operations": [{
					"operation": i.operation,
					"workstation": i.workstation,
					"time_in_mins": self.total_operations_time,
					"hour_rate": (self.total_operations_cost / self.total_operations_time) * 60,
					"operating_cost": self.total_operations_cost ,
				}]
			}
			bom = frappe.get_doc(obj).insert()
			bom.submit()

	@frappe.whitelist()
	def get_raw_materials(self, raw_material):

		items = []

		for i in self.__dict__[raw_material]:
			obj = {
				"item_code": i.item_code,
				"item_name": i.item_name,
				"rate": i.rate if 'rate' in i.__dict__ else 0,
				"qty":  i.weight_of_sheet if 'weight_of_sheet' in i.__dict__ else i.production_qty,
				"amount": i.amount,
			}

			items.append(obj)

		return items

@frappe.whitelist()
def make_mr(source_name, target_doc=None):
	doc = get_mapped_doc("Budget BOM", source_name, {
		"Budget BOM": {
			"doctype": "Material Request",
			"validation": {
				"docstatus": ["=", 1]
			},
			"field_map": {
				"posting_Date": "schedule_date",
			}
		},
	 	"Budget BOM Details": {
			"doctype": "Material Request Item",
			"field_map": {
				"name": "budget_bom_raw_material",
				"weight_of_sheet": "qty"

			}
		},
		"Budget BOM Details Engineering": {
			"doctype": "Material Request Item",
			"field_map": {
				"name": "budget_bom_raw_material",
				"weight_of_sheet": "qty"

		 }
		},
		"Budget BOM Details Pipe Estimation": {
			"doctype": "Material Request Item",
			"field_map": {
				"name": "budget_bom_raw_material",
				"production_qty": "qty"
			}
		}

	}, ignore_permissions=True)
	doc.schedule_date = str(frappe.db.get_value("Budget BOM", source_name, "posting_Date"))
	for i in doc.items:
		item = frappe.get_doc("Item", i.item_code)
		if not i.qty:
			i.qty = 1
		i.schedule_date = str(frappe.db.get_value("Budget BOM", source_name, "posting_Date"))
		i.uom = item.stock_uom
		i.description = item.item_name
	doc.append("budget_bom_reference", {
		"budget_bom": source_name
	})
	return doc
