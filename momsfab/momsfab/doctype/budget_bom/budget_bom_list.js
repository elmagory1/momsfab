frappe.listview_settings['Budget BOM'] = {
	add_fields: ["status"],
	get_indicator: function (doc) {
		if ([
			"In Progress",
			"Quotation In Progress",
				"In Progress",
"To Quotation",
"Quotation In Progress",
"To Material Request",
"To BOM",
"To Deliver and Bill"
			].includes(doc.status)) {
			return [__(doc.status), "orange", "status,=," + doc.status];
		}
	},
};