


frappe.ui.form.on("Work Order", {
    refresh: function (frm) {
        if(cur_frm.doc.docstatus && cur_frm.doc.status === 'Not Started' && !cur_frm.doc.stock_entry){
              cur_frm.add_custom_button("Stock Entry", () => {
                    frappe.call({
                        method: "momsfab.doc_events.work_order.generate_stock_entry",
                        args: {
                            items: cur_frm.doc.required_items.length > 0 ? cur_frm.doc.required_items : [],
                            budget_bom: cur_frm.doc.budget_bom_reference.length > 0 ? cur_frm.doc.budget_bom_reference : [],
                            work_order: cur_frm.doc.name,
                            cost_center: cur_frm.doc.cost_center,
                        },
                  async:false,
                        callback: function () {
                            frappe.show_alert({
                                    message: __('Stock Entry Created'),
                                    indicator: 'green'
                                }, 3);
                        }
                    })
             })
        }
        cur_frm.remove_custom_button("Alternate Item")
        frm.add_custom_button(__('Custom Alternative Item'), () => {
				console.log("ALTERNATIVE")
					erpnext.utils.select_alternate_items_2({
						frm: frm,
						child_docname: "required_items",
						warehouse_field: "source_warehouse",
						child_doctype: "Work Order Item",
						original_item_field: "original_item",
						condition: (d) => {
							if (d.allow_alternative_item) {return true;}
						}
					});
				});

    }
})

erpnext.utils.select_alternate_items_2 = function(opts) {
    console.log("TEST")
const frm = opts.frm;
	const warehouse_field = opts.warehouse_field || 'warehouse';
	const item_field = opts.item_field || 'item_code';

	this.data = [];
	const dialog = new frappe.ui.Dialog({
		title: __("Select Alternate Item"),
		fields: [
			{fieldtype:'Section Break', label: __('Items')},
			{
				fieldname: "alternative_items", fieldtype: "Table", cannot_add_rows: true,
				in_place_edit: true, data: this.data,
				get_data: () => {
					return this.data;
				},
				fields: [{
					fieldtype:'Data',
					fieldname:"docname",
					hidden: 1
				}, {
					fieldtype:'Link',
					fieldname:"item_code",
					options: 'Item',
					in_list_view: 1,
					read_only: 1,
					label: __('Item Code')
				}, {
					fieldtype:'Link',
					fieldname:"alternate_item",
					options: 'Item',
					default: "",
					in_list_view: 1,
					label: __('Alternate Item'),
					onchange: function() {
						const item_code = this.get_value();
						const warehouse = this.grid_row.on_grid_fields_dict.warehouse.get_value();
						if (item_code && warehouse) {
							frappe.call({
								method: "erpnext.stock.utils.get_latest_stock_qty",
								args: {
									item_code: item_code,
									warehouse: warehouse
								},
								callback: (r) => {
									this.grid_row.on_grid_fields_dict
										.actual_qty.set_value(r.message || 0);
								}
							})
						}
					},
					get_query: (e) => {
						return {
							query: "erpnext.stock.doctype.item_alternative.item_alternative.get_alternative_items",
							filters: {
								item_code: e.item_code
							}
						};
					}
				}, {
					fieldtype:'Link',
					fieldname:"warehouse",
					options: 'Warehouse',
					default: "",
					in_list_view: 1,
					label: __('Warehouse'),
					onchange: function() {
						const warehouse = this.get_value();
						const item_code = this.grid_row.on_grid_fields_dict.item_code.get_value();
						if (item_code && warehouse) {
							frappe.call({
								method: "erpnext.stock.utils.get_latest_stock_qty",
								args: {
									item_code: item_code,
									warehouse: warehouse
								},
								callback: (r) => {
									this.grid_row.on_grid_fields_dict
										.actual_qty.set_value(r.message || 0);
								}
							})
						}
					},
				}, {
					fieldtype:'Float',
					fieldname:"actual_qty",
					default: 0,
					read_only: 1,
					in_list_view: 1,
					label: __('Available Qty')
				}]
			},
		],
		primary_action: function() {
			const args = this.get_values()["alternative_items"];
			const alternative_items = args.filter(d => {
				if (d.alternate_item && d.item_code != d.alternate_item) {
					return true;
				}
			});

			alternative_items.forEach(d => {
			    console.log(d)
				let row = frappe.get_doc(opts.child_doctype, d.docname);
				let qty = null;
				row[item_field] = d.alternate_item;
				frappe.model.set_value(row.doctype, row.name, 'qty', d.qty);
				frappe.model.set_value(row.doctype, row.name, 'required_qty', d.qty);
				frappe.model.set_value(row.doctype, row.name, opts.original_item_field, d.item_code);
				// frm.trigger(item_field, row.doctype, row.name);
			});

			refresh_field(opts.child_docname);
			this.hide();
		},
		primary_action_label: __('Update')
	});

	frm.doc[opts.child_docname].forEach(d => {
		if (!opts.condition || opts.condition(d)) {
			dialog.fields_dict.alternative_items.df.data.push({
				"docname": d.name,
				"item_code": d[item_field],
				"warehouse": d[warehouse_field],
				"actual_qty": d.actual_qty,
				"qty": d.required_qty
			});
		}
	})

	this.data = dialog.fields_dict.alternative_items.df.data;
	dialog.fields_dict.alternative_items.grid.refresh();
	dialog.show();
}
