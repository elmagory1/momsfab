

frappe.ui.form.on("Delivery Note", {
    onload_post_render: function () {
        console.log("AKJSDHLAKSDLJKA")
        if(cur_frm.is_new() && cur_frm.doc.items.length > 0){
            console.log("ITEEEEMS")
            for(var x=0;x<cur_frm.doc.items.length;x+=1){
                if(cur_frm.doc.items[x].project_code){
                    cur_frm.doc.items[x].cost_center = cur_frm.doc.items[x].project_code
                    cur_frm.refresh_field("cost_center")
                }
            }
        }
    }
})