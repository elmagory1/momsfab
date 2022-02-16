

frappe.ui.form.on("Manufacturing Settings", {
    refresh: function () {
        cur_frm.set_query("difference_account", () => {
            return {
                filters: [
                    ['account_type', "in", ["Cost of Goods Sold", "Stock Adjustment"]]
                ]
            }
        })
    }
})