

frappe.ui.form.on("Item", {
    is_service_item: function () {
        cur_frm.doc.is_stock_item = !(cur_frm.doc.is_service_item)
        cur_frm.refresh_field("is_stock_item")
    },
     is_stock_item: function () {
        cur_frm.doc.is_service_item = !(cur_frm.doc.is_stock_item)
                 cur_frm.refresh_field("is_service_item")

    }
})