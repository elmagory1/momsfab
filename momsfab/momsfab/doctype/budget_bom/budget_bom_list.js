frappe.listview_settings['Budget BOM'] = {
	add_fields: ["status"],
	get_indicator: function (doc) {
		if (["Pending"].includes(doc.status)) {
			return [__(doc.status), "orange", "status,=," + doc.status];
		}
	},
};