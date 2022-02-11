frappe.ui.form.on("Budget BOM References", {
    budget_bom: function (frm, cdt, cdn) {
        var d = locals[cdt][cdn]

        if(d.budget_bom){
            frappe.db.get_doc("Budget BOM",d.budget_bom)
                .then(doc => {
                var field = doc.type === 'Sheet Estimation' ? "sheet_estimation" :
                                doc.type === 'Engineering Estimation' ? "engineering_estimation" :
                                    doc.type === 'Pipe Estimation' ? "pipe_estimation": ""

                for(var i=0;i<doc[field].length;i+=1) {
                    if (!check_items(doc[field][i], cur_frm)) {
                        cur_frm.add_child("items", {
                            item_code: doc[field][i].item_code,
                            item_name: doc[field][i].item_name,
                            description: doc[field][i].item_name,
                            qty: doc[field][i].qty,
                            uom: doc[field][i].stock_uom,
                            conversion_factor:1,
                            stock_uom: doc[field][i].stock_uom,
                            rate: doc[field][i].rate,
                            budget_bom_rate: doc[field][i].rate,
                        })
                        cur_frm.refresh_field("items")
                    }
                }

            })
        }

    }
})
frappe.ui.form.on("Material Request", {
    refresh: function (frm, cdt, cdn) {
    if(cur_frm.is_new()){
         cur_frm.add_custom_button(__('Budget BOM'),
				function() {
            var budget_boms = []
            if(cur_frm.doc.budget_bom_reference){
                 budget_boms = Array.from(cur_frm.doc.budget_bom_reference, x => "budget_bom" in x ? x.budget_bom:"")
            }
                    var query_args = {
                        query:"momsfab.doc_events.material_request.get_budget_bom",
                        filters: {data: budget_boms}
                    }
					 var d = new frappe.ui.form.MultiSelectDialog({
                            doctype: "Opportunity",
                            target: cur_frm,
                            setters: [
                                {
                                    label: "Budget BOM",
                                    fieldname: "budget_bom",
                                    fieldtype: "Link",
                                    options: "Budget BOM",
                                    default:  undefined
                                },
                                 {
                                    label: "Customer",
                                    fieldname: "customer_name",
                                    fieldtype: "Data",
                                    default: cur_frm.doc.party_name || undefined
                                }
                            ],
                            add_filters_group: 0,
                            date_field: "posting_date",
                            get_query() {
                                return query_args
                            },
                            action(selections) {
                                fetch_boms(cur_frm, selections)
                                d.dialog.hide()
                            }
                        });
				}, __("Get Items From"), "btn-default");
    }


    }
})

function fetch_boms(cur_frm, selections) {
    if(cur_frm.doc.items.length> 0 && !cur_frm.doc.items[0].item_code){
        cur_frm.clear_table("items")
        cur_frm.refresh_field("items")
    }
   if(selections.length > 0){
        frappe.call({
            method: "momsfab.doc_events.material_request.get_bb",
            args: {
                mr: selections
            },
            callback: function (r) {
                    for(var x=0;x<r.message[0].length;x+=1){
                        cur_frm.add_child("items",r.message[0][x])
                        cur_frm.refresh_fields("items")
                    }
                    for(var x=0;x<r.message[1].length;x+=1){
                        cur_frm.add_child("budget_bom_reference",r.message[1][x])
                        cur_frm.refresh_fields("budget_bom_reference")
                    }
            }
        })
    }
}
function check_items(item, cur_frm) {
        for(var x=0;x<cur_frm.doc.items.length;x+=1){
            var item_row = cur_frm.doc.items[x]
            if(item_row.item_code === item.item_code){
                item_row.qty += item.qty
                cur_frm.refresh_field("items")
                return true
            }
        }
        return false
}