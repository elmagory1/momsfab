frappe.listview_settings['Budget BOM'] = {
	add_fields: ["status"],
	get_indicator: function (doc) {
		if (["In Progress", "Quotation In Progress"].includes(doc.status)) {
			return [__(doc.status), "orange", "status,=," + doc.status];
		}
	},
};