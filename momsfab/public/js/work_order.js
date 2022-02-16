


frappe.ui.form.on("Work Order", {
    refresh: function () {
        if(cur_frm.doc.docstatus && cur_frm.doc.status === 'Not Started'){
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

    }
})