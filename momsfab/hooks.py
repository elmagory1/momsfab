from . import __version__ as app_version

app_name = "momsfab"
app_title = "Momsfab"
app_publisher = "Momscode Technologies"
app_description = "Momsfab"
app_icon = "octicon octicon-file-directory"
app_color = "grey"
app_email = "info@momscode.in"
app_license = "MIT"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/momsfab/css/momsfab.css"
# app_include_js = "/assets/momsfab/js/momsfab.js"

# include js, css files in header of web template
# web_include_css = "/assets/momsfab/css/momsfab.css"
# web_include_js = "/assets/momsfab/js/momsfab.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "momsfab/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
doctype_js = {
	"Quotation" : "public/js/quotation.js",
	"Sales Order" : "public/js/sales_order.js",
	"Material Request" : "public/js/material_request.js",
	"Purchase Order" : "public/js/purchase_order.js",
	"Item" : "public/js/item.js",
	"Work Order" : "public/js/work_order.js",
}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "momsfab.install.before_install"
# after_install = "momsfab.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "momsfab.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
	"Stock Entry": {
		"on_submit": "momsfab.doc_events.stock_entry.on_submit_se",
		"validate": "momsfab.doc_events.stock_entry.on_save_se",
	},
	"Quotation": {
		"on_submit": "momsfab.doc_events.quotation.submit_q",
		"on_cancel": "momsfab.doc_events.quotation.submit_q",
	},
	"Sales Order": {
		"on_submit": "momsfab.doc_events.sales_order.on_submit_so",
		"on_cancel": "momsfab.doc_events.sales_order.on_cancel_so",
	},
	"Purchase Order": {
		"on_submit": "momsfab.doc_events.purchase_order.on_submit_po",
	},
	"Purchase Invoice": {
		"on_submit": "momsfab.doc_events.purchase_invoice.on_submit_pi",
	},
	"Purchase Receipt": {
		"on_submit": "momsfab.doc_events.purchase_receipt.on_submit_pr",
		"on_cancel": "momsfab.doc_events.purchase_receipt.on_cancel_pr",
	},
	"Material Request": {
		"validate": "momsfab.doc_events.material_request.validate_mr",
		"on_submit": "momsfab.doc_events.material_request.on_submit_mr",
		"on_cancel": "momsfab.doc_events.material_request.cancel_mr",
	},
	"Work Order": {
		"validate": "momsfab.doc_events.work_order.validate_wo"
	},
}

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"momsfab.tasks.all"
# 	],
# 	"daily": [
# 		"momsfab.tasks.daily"
# 	],
# 	"hourly": [
# 		"momsfab.tasks.hourly"
# 	],
# 	"weekly": [
# 		"momsfab.tasks.weekly"
# 	]
# 	"monthly": [
# 		"momsfab.tasks.monthly"
# 	]
# }

# Testing
# -------

# before_tests = "momsfab.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "momsfab.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "momsfab.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]


# User Data Protection
# --------------------

user_data_fields = [
	{
		"doctype": "{doctype_1}",
		"filter_by": "{filter_by}",
		"redact_fields": ["{field_1}", "{field_2}"],
		"partial": 1,
	},
	{
		"doctype": "{doctype_2}",
		"filter_by": "{filter_by}",
		"partial": 1,
	},
	{
		"doctype": "{doctype_3}",
		"strict": False,
	},
	{
		"doctype": "{doctype_4}"
	}
]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"momsfab.auth.validate"
# ]

fixtures = [
	{
		"doctype": "Custom Field",
		"filters": [
			[
				"name",
				"in",
				[
					"Item-more_information",
					"Item-sheet_thickness",
					"Item-default_scale_factor",
					"Item-scrap_rate",
					"Item-sheet_density",

					"Manufacturing Settings-common_values",
					"Manufacturing Settings-scale_factor",
					"Manufacturing Settings-margin",
					"Manufacturing Settings-cutting_rate_per_minute",
					"Manufacturing Settings-cb1",
					"Manufacturing Settings-scrap_rate",
					"Manufacturing Settings-wastage_rate",
					"Manufacturing Settings-fuel_charge",
					"Manufacturing Settings-operation",
					"Manufacturing Settings-workstation",
					"Account-fuel_charge",
					"Account-delivery_charge",

					"Item-is_service_item"

				]
			]
		]
	}
]
