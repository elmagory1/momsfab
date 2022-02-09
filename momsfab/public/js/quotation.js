frappe.ui.form.on('Quotation', {
    // update_cost: function(frm) {
	 //    cur_frm.clear_table("payment_schedule")
	 //    cur_frm.refresh_field("payment_schedule")
	 //    frappe.call({
    //         method: "ringlus.doc_events.quotation.get_updated_costs",
    //         args: {
    //             budget_boms: cur_frm.doc.budget_bom_reference ? cur_frm.doc.budget_bom_reference : []
    //         },
    //         async: false,
    //         callback: function (r) {
    //             console.log(r.message)
    //             for(var x=0;x<r.message.length;x+=1){
    //                 update_items(r.message[0][x], cur_frm)
    //             }
    //         }
    //     })
    // },
	refresh: function(frm) {
        // cur_frm.fields_dict["items"].grid.add_custom_button(__('Update Cost'),
			// function() {
        //      frappe.confirm('Are you sure you want to update cost?',
        //         () => {
        //             cur_frm.trigger("update_cost")
        //         }, () => {})
        //
        // }).css('background-color','#00008B').css('color','white').css('margin-left','10px').css('margin-right','10px').css('font-weight','bold')

        cur_frm.add_custom_button(__('Opportunity with Budget BOM'),
				function() {
                    var query_args = {
                        query:"momsfab.doc_events.quotation.get_opportunity",
                        filters: {}
                    }
					 var d = new frappe.ui.form.MultiSelectDialog({
                            doctype: "Opportunity",
                            target: cur_frm,
                            setters: [
                                {
                                    label: "Customer",
                                    fieldname: "party_name",
                                    fieldtype: "Link",
                                    options: "Customer",
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
})

function fetch_boms(cur_frm, selections) {
    for(var x=0;x<selections.length;x+=1){
        var check_opp = check_opportunity(selections[x])
        if(!check_opp){
            cur_frm.add_child("budget_bom_opportunity",{
                opportunity: selections[x]
            })
            cur_frm.refresh_field("budget_bom_opportunity")

            frappe.db.get_list('Budget BOM', {
                filters: {
                   opportunity: selections[x],
                    status: 'In Progress',
                    docstatus: 1
                },
                limit:50
            }).then(records => {
                 if(cur_frm.doc.items && !cur_frm.doc.items[0].item_code){
                    cur_frm.clear_table("items")
                    cur_frm.refresh_field("items")
                }
                for(var xx=0;xx<records.length;xx+=1){
                    frappe.db.get_doc('Budget BOM', records[xx].name)
                        .then(doc => {
                            cur_frm.doc.party_name = doc.customer_code
                            cur_frm.doc.customer_name = doc.customer_name
                            cur_frm.doc.additional_operating_cost += doc.total_additional_operations_cost
                            cur_frm.refresh_fields(["party_name","additional_operating_cost", "customer_name","party_name"])
                            cur_frm.add_child("budget_bom_reference",{
                                budget_bom: doc.name
                            })
                            cur_frm.refresh_field("budget_bom_reference")

                            for(var ii=0;ii<doc.finish_good.length;ii+=1){
                                  cur_frm.add_child("items",{
                                        "description": doc.finish_good[ii].item_name,
                                        "item_code": doc.finish_good[ii].item_code,
                                        "item_name": doc.finish_good[ii].item_name,
                                        "qty": doc.finish_good[ii].qty,
                                        "uom": doc.finish_good[ii].uom,
                                  })
                                cur_frm.refresh_field("items")
                            }
                        })
                }
            })
        }



    }
}

function check_opportunity(name) {
    if(cur_frm.doc.budget_bom_opportunity){
        for(var x=0;x<cur_frm.doc.budget_bom_opportunity.length;x+=1){
            var item_row = cur_frm.doc.budget_bom_opportunity[x]
            if(item_row.opportunity === name){
                return true
            }
        }
    }

        return false
}