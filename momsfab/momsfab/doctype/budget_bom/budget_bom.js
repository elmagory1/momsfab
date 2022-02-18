// Copyright (c) 2022, Momscode Technologies and contributors
// For license information, please see license.txt
var scale_factor = 0
var margin = 0
var cutting_rate_per_minute = 0
var scrap_rate = 0
var wastage_rate = 0
var fuel_charge = 0
var workstation = ""
var operation = ""
var fg_item_group = ""

var has_quotation = false
var generating_quotation = false
var check_bom = false

frappe.ui.form.on('Budget BOM', {
	type: function(frm) {

	    cur_frm.clear_table("sheet_estimation")
	    cur_frm.clear_table("engineering_estimation")
	    cur_frm.clear_table("pipe_estimation")
        cur_frm.refresh_fields(['sheet_estimation','engineering_estimation','pipe_estimation'])
    },
	create_item: function(frm) {
	     cur_frm.call({
            doc: cur_frm.doc,
            method: 'create_item',
            args: {},
            freeze: true,
            freeze_message: "Creating Item...",
            async:false,
            callback: (r) => {
                cur_frm.reload_doc()
             frappe.show_alert({
                                    message: __('Item Created'),
                                    indicator: 'green'
                                }, 3);
             }
        })
    },
	refresh: function(frm) {
	    if(!generating_quotation){
	        cur_frm.call({
                doc: cur_frm.doc,
                method: 'get_quotation',
                args: {},
                freeze: true,
                freeze_message: "Get Quotation...",
                async:false,
                callback: (r) => {
                    console.log("HAS QUOTATION")
                    has_quotation = r.message
                }
            })
        }
        cur_frm.call({
                doc: cur_frm.doc,
                method: 'check_bom',
                args: {},
                freeze: true,
                freeze_message: "Checking Sales Order...",
                async:false,
                callback: (r) => {
                    check_bom= r.message
                }
            })
        cur_frm.set_query("account", "additional_operations_cost_without_charge", () => {
            return {
                query: "momsfab.doc_events.budget_bom.bb_query_2",

            }
        })
        cur_frm.set_query("account", "additional_operations_cost", () => {
           return {
                query: "momsfab.doc_events.budget_bom.bb_query",

            }
        })
        cur_frm.set_query("item", "wastage_charges", () => {
            var items = []
            var wastages = Array.from(cur_frm.doc.wastage_charges, x => "item" in x ? x.item:"")

            if(cur_frm.doc.sheet_estimation.length > 0){
                items = Array.from(cur_frm.doc.sheet_estimation, x => "item_code" in x && !(wastages.includes(x.item_code))? x.item_code:"")
            }
            else if(cur_frm.doc.engineering_estimation.length > 0){
                items = Array.from(cur_frm.doc.engineering_estimation, x => "item_code" in x && !(wastages.includes(x.item_code))? x.item_code:"")
            }
            else if(cur_frm.doc.pipe_estimation.length > 0){
                items = Array.from(cur_frm.doc.pipe_estimation, x => "item_code" in x && !(wastages.includes(x.item_code))? x.item_code:"")
            }
            return {
                filters: {
                    name: ['in', items],
                }
            }
        })
        cur_frm.set_query("item_code", "sheet_estimation", () => {
            return {
                filters: [
                   ["item_group","not in", [fg_item_group]]
                ]
            }
        })
            cur_frm.set_query("item_code", "pipe_estimation", () => {


            return {
                filters: [
                   ["item_group","not in", [fg_item_group]]
                ]
            }
        })
        cur_frm.set_query("item_code", "engineering_estimation", () => {

            return {
                filters: [
                   ["item_group","not in", [fg_item_group]]
                ]
            }
        })
	    if(cur_frm.is_new()){
	        cur_frm.doc.created_item = 0
            cur_frm.refresh_field("created_item")
        }
         cur_frm.get_field("finish_good").grid.cannot_add_rows = true;
        cur_frm.refresh_field("finish_good")
        frappe.db.get_single_value("Manufacturing Settings","fg_item_group")
            .then(fg => {
              fg_item_group = fg
        })
        frappe.db.get_single_value("Manufacturing Settings","scale_factor")
            .then(scale_factor_value => {
              scale_factor = scale_factor_value
        })
        frappe.db.get_single_value("Manufacturing Settings","margin")
            .then(margin_value => {
              margin = margin_value
        })
        frappe.db.get_single_value("Manufacturing Settings","cutting_rate_per_minute")
            .then(cutting_rate_per_minute_value => {
              cutting_rate_per_minute = cutting_rate_per_minute_value
        })
        frappe.db.get_single_value("Manufacturing Settings","scrap_rate")
            .then(scrap_rate_value => {
              scrap_rate = scrap_rate_value
        })
        frappe.db.get_single_value("Manufacturing Settings","wastage_rate")
            .then(wastage_rate_value => {
              wastage_rate = wastage_rate_value
        })
        frappe.db.get_single_value("Manufacturing Settings","fuel_charge")
            .then(fuel_charge_value => {
              fuel_charge = fuel_charge_value
        })
        frappe.db.get_single_value("Manufacturing Settings","workstation")
            .then(w => {
              workstation = w
        })
        frappe.db.get_single_value("Manufacturing Settings","operation")
            .then(o => {
              operation = o
        })

        if(cur_frm.doc.docstatus && cur_frm.doc.status === "To Quotation" && !has_quotation){

	            cur_frm.add_custom_button(__("Quotation"), () => {
                    cur_frm.call({
                        doc: cur_frm.doc,
                        method: 'generate_quotation',
                        args: {},
                        freeze: true,
                        freeze_message: "Generating Quotation...",
                        callback: (r) => {
                            generating_quotation = true
                            cur_frm.reload_doc()
                            frappe.set_route("Form", "Quotation", r.message);
                        }
                    })
                })
        } else if(cur_frm.doc.docstatus && cur_frm.doc.status === "To Material Request" && cur_frm.doc.raw_material_from_customer === 'Own'){

                frm.add_custom_button(__("Material Request"), () => {
                    cur_frm.trigger("material_request")
                })
        }
        if(!check_bom) {
                    frm.add_custom_button(__("Create BOM"), () => {
                        cur_frm.call({
                            doc: cur_frm.doc,
                            method: 'create_bom',
                            args: {},
                            freeze: true,
                            freeze_message: "Creating BOM...",
                            callback: (r) => {
                                cur_frm.reload_doc()
                                frappe.show_alert({
                                    message: __('BOMs Created'),
                                    indicator: 'green'
                                }, 3);
                            }
                        })
                    })
                }
	},
     material_request: function(frm) {
       frappe.model.open_mapped_doc({
			method: "momsfab.momsfab.doctype.budget_bom.budget_bom.make_mr",
			frm: cur_frm
		})

	},
    onload_post_render: function () {
	    console.log("onload post render")
        if(cur_frm.doc.finish_good.length === 0){
	         cur_frm.add_child("finish_good", {
	             workstation: workstation,
	             operation: operation,
             })
            cur_frm.refresh_field("finish_good")
        }
    }
});
frappe.ui.form.on('Budget BOM Details', {
    sheet_estimation_remove: function () {
        compute_totals(cur_frm)
    },
    item_code: function (frm, cdt, cdn) {
        console.log("TEST")
                var d = locals[cdt][cdn]
        if(d.item_code){
             cur_frm.call({
            doc: cur_frm.doc,
            method: 'get_rate',
            args: {
                item_code: d.item_code,
            },
            freeze: true,
            freeze_message: "Get Templates...",
            async:false,
            callback: (r) => {
                    d.rate = r.message
                    cur_frm.refresh_field(d.parentfield)

             }
        })
        }

    },
    length: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        var product = d.length * d.width * d.thickness_of_sheet * d.sheet_density
        d.weight_of_sheet = product * (1 + (scale_factor / 100))
        d.amount =  d.weight_of_sheet * d.rate
        d.margin_amount = d.amount * (margin / 100)
        d.total_amount = d.amount * (1 + (margin / 100))
        d.area_in_square_feet = (d.length * d.width) / 92903
        d.raw_material_cost = d.total_amount - (d.weight_of_sheet * (d.scrap / 100) * scrap_rate)

        cur_frm.refresh_field(d.parentfield)
        compute_totals(cur_frm)
	},
    width: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        var product = d.length * d.width * d.thickness_of_sheet * d.sheet_density
        d.weight_of_sheet = product * (1 + (scale_factor / 100))
                d.amount = d.weight_of_sheet * d.rate

        d.total_amount = d.amount * (1 + (margin / 100))
        d.area_in_square_feet = (d.length * d.width) / 92903
                d.raw_material_cost = d.total_amount - (d.weight_of_sheet * (d.scrap / 100) * scrap_rate)

        cur_frm.refresh_field(d.parentfield)
        compute_totals(cur_frm)
	},
    thickness_of_sheet: function(frm, cdt, cdn) {
                var d = locals[cdt][cdn]

        var product = d.length * d.width * d.thickness_of_sheet * d.sheet_density
        d.weight_of_sheet = product * (1 + (scale_factor / 100))
               d.amount = d.weight_of_sheet * d.rate

        d.total_amount = d.amount * (1 + (margin / 100))
                d.raw_material_cost = d.total_amount - (d.weight_of_sheet * (d.scrap / 100) * scrap_rate)

        cur_frm.refresh_field(d.parentfield)
        compute_totals(cur_frm)
	},
    sheet_density: function(frm, cdt, cdn) {
                var d = locals[cdt][cdn]

       var product = d.length * d.width * d.thickness_of_sheet * d.sheet_density
        d.weight_of_sheet = product * (1 + (scale_factor / 100))
                d.amount =  d.weight_of_sheet * d.rate

        d.total_amount = d.amount * (1 + (margin / 100))
                d.raw_material_cost = d.total_amount - (d.weight_of_sheet * (d.scrap / 100) * scrap_rate)

        cur_frm.refresh_field(d.parentfield)
        compute_totals(cur_frm)
	},
    scrap: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn]

       var product = d.length * d.width * d.thickness_of_sheet * d.sheet_density
        d.weight_of_sheet = product * (1 + (scale_factor / 100))
                d.amount = d.weight_of_sheet * d.rate

        d.total_amount = d.amount * (1 + (margin / 100))
                d.raw_material_cost = d.total_amount - (d.weight_of_sheet * (d.scrap / 100) * scrap_rate)

        cur_frm.refresh_field(d.parentfield)
        compute_totals(cur_frm)
	},
    cutting_time_in_minutes: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        d.operations_cost = cur_frm.doc.type === 'Pipe Estimation' ? (d.cutting_time_in_minutes + d.handling_time) * cutting_rate_per_minute * d.production_qty :(d.cutting_time_in_minutes + d.handling_time) * cutting_rate_per_minute
        cur_frm.refresh_field(d.parentfield)
        compute_totals(cur_frm)
	},
    handling_time: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn]
           d.operations_cost = cur_frm.doc.type === 'Pipe Estimation' ? (d.cutting_time_in_minutes + d.handling_time) * cutting_rate_per_minute * d.production_qty :(d.cutting_time_in_minutes + d.handling_time) * cutting_rate_per_minute
        cur_frm.refresh_field(d.parentfield)
        compute_totals(cur_frm)
	}
});
frappe.ui.form.on('Budget BOM Details Engineering', {
    engineering_estimation_remove: function () {
        compute_totals(cur_frm)
    },
    item_code: function (frm, cdt, cdn) {
        console.log("TEST")
                var d = locals[cdt][cdn]
        if(d.item_code){
             cur_frm.call({
            doc: cur_frm.doc,
            method: 'get_rate',
            args: {
                item_code: d.item_code,
            },
            freeze: true,
            freeze_message: "Get Templates...",
            async:false,
            callback: (r) => {
                    d.rate = r.message
                    cur_frm.refresh_field(d.parentfield)

             }
        })
        }

    },
	production_qty: function(frm, cdt, cdn) {
        compute_totals(cur_frm)
	},
    length: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        var product = d.length * d.width * d.thickness_of_sheet * d.sheet_density
        d.weight_of_sheet = product * (1 + (scale_factor / 100))
        d.amount =  d.weight_of_sheet * d.rate
        d.margin_amount = d.amount * (margin / 100)
        d.total_amount = d.amount * (1 + (margin / 100))
        d.raw_material_cost = d.total_amount - (d.weight_of_sheet * (d.scrap / 100) * scrap_rate)

        cur_frm.refresh_field(d.parentfield)
        compute_totals(cur_frm)
	},
    width: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        var product = d.length * d.width * d.thickness_of_sheet * d.sheet_density
        d.weight_of_sheet = product * (1 + (scale_factor / 100))
        d.amount =  d.weight_of_sheet * d.rate
        d.total_amount = d.amount * (1 + (margin / 100))
        d.raw_material_cost = d.total_amount - (d.weight_of_sheet * (d.scrap / 100) * scrap_rate)

        cur_frm.refresh_field(d.parentfield)
        compute_totals(cur_frm)
	},
    thickness_of_sheet: function(frm, cdt, cdn) {
                var d = locals[cdt][cdn]

        var product = d.length * d.width * d.thickness_of_sheet * d.sheet_density
        d.weight_of_sheet = product * (1 + (scale_factor / 100))
        d.amount =  d.weight_of_sheet * d.rate
        d.total_amount = d.amount * (1 + (margin / 100))
        d.raw_material_cost = d.total_amount - (d.weight_of_sheet * (d.scrap / 100) * scrap_rate)
        cur_frm.refresh_field(d.parentfield)
        compute_totals(cur_frm)
	},
    sheet_density: function(frm, cdt, cdn) {
                var d = locals[cdt][cdn]

       var product = d.length * d.width * d.thickness_of_sheet * d.sheet_density
        d.weight_of_sheet = product * (1 + (scale_factor / 100))
        d.amount = d.weight_of_sheet * d.rate
        d.total_amount = d.amount * (1 + (margin / 100))
        d.raw_material_cost = d.total_amount - (d.weight_of_sheet * (d.scrap / 100) * scrap_rate)

        cur_frm.refresh_field(d.parentfield)
        compute_totals(cur_frm)
	},
    scrap: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn]

       var product = d.length * d.width * d.thickness_of_sheet * d.sheet_density
        d.weight_of_sheet = product * (1 + (scale_factor / 100))
        d.amount = d.weight_of_sheet * d.rate
        d.total_amount = d.amount * (1 + (margin / 100))
        d.raw_material_cost = d.total_amount - (d.weight_of_sheet * (d.scrap / 100) * scrap_rate)

        cur_frm.refresh_field(d.parentfield)
        compute_totals(cur_frm)
	},
    cutting_time_in_minutes: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        d.operations_cost = (d.cutting_time_in_minutes + d.handling_time) * cutting_rate_per_minute
        cur_frm.refresh_field(d.parentfield)
        compute_totals(cur_frm)
	},
    handling_time: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        d.operations_cost = (d.cutting_time_in_minutes + d.handling_time) * cutting_rate_per_minute
        cur_frm.refresh_field(d.parentfield)
        compute_totals(cur_frm)
	}
});
frappe.ui.form.on('Budget BOM Details Pipe Estimation', {
    pipe_estimation_remove: function () {
        compute_totals(cur_frm)
    },
    item_code: function (frm, cdt, cdn) {
        console.log("TEST")
                var d = locals[cdt][cdn]
        if(d.item_code){
             cur_frm.call({
            doc: cur_frm.doc,
            method: 'get_rate',
            args: {
                item_code: d.item_code,
            },
            freeze: true,
            freeze_message: "Get Templates...",
            async:false,
            callback: (r) => {
                    d.rate = r.message
                    cur_frm.refresh_field(d.parentfield)

             }
        })
        }

    },
    production_qty: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        var product = d.length * d.width * d.thickness_of_sheet * d.sheet_density
        d.amount =  d.production_qty * d.rate
        d.total_amount = d.amount * (1 + (margin / 100))

        cur_frm.refresh_field(d.parentfield)
        compute_totals(cur_frm)
	},
    cutting_time_in_minutes: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        d.operations_cost = (d.cutting_time_in_minutes + d.handling_time) * cutting_rate_per_minute
        cur_frm.refresh_field(d.parentfield)
        compute_totals(cur_frm)
	},
    handling_time: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        d.operations_cost = (d.cutting_time_in_minutes + d.handling_time) * cutting_rate_per_minute
        cur_frm.refresh_field(d.parentfield)
        compute_totals(cur_frm)
	}
});
frappe.ui.form.on('Additional Operations Cost Without Charge', {
	amount: function(frm) {
        compute_operations_cost(cur_frm)
	},
     additional_operations_cost_without_charge_remove: function () {
        compute_operations_cost(cur_frm)
    },
});

frappe.ui.form.on('Additional Operations Cost', {
    additional_operations_cost_remove: function () {
        compute_operations_cost(cur_frm)
    },
	charge: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        if(d.delivery_charge){
            d.total_charge = d.charge * cur_frm.doc.total_production_qty
            cur_frm.refresh_field(d.parentfield)
            compute_operations_cost(cur_frm)
        } else if (d.fuel_charge){
            d.total_charge = d.charge * cur_frm.doc.total_operations_time
            cur_frm.refresh_field(d.parentfield)
            compute_operations_cost(cur_frm)
        }

	},
    account: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        if(d.delivery_charge){
            d.total_charge = d.charge * cur_frm.doc.total_production_qty
            cur_frm.refresh_field(d.parentfield)
        } else if (d.fuel_charge){
            d.total_charge = d.charge * cur_frm.doc.total_operations_time
            cur_frm.refresh_field(d.parentfield)
        }

	},
});

frappe.ui.form.on('Wastage Charges', {
	length: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        d.area_in_square_feet = (d.length * d.width) / 92903
        cur_frm.refresh_field(d.parentfield)
        compute_wastage_totals(cur_frm)
	},
    width: function(frm, cdt, cdn) {
       var d = locals[cdt][cdn]
        d.area_in_square_feet = (d.length * d.width) / 92903
        cur_frm.refresh_field(d.parentfield)
        compute_wastage_totals(cur_frm)
	},
    wastage_charges_remove: function(frm, cdt, cdn) {
        compute_wastage_totals(cur_frm)
	}
});


function compute_total_amounts(cur_frm) {
    var total_material = cur_frm.doc.raw_material_from_customer === 'Customer' ? 0 : cur_frm.doc.total_raw_material_cost
    var total_amount = total_material + cur_frm.doc.total_operations_cost + cur_frm.doc.total_additional_operation_cost + cur_frm.doc.wastage_amount
    cur_frm.doc.total_amount = total_amount
    cur_frm.doc.total_square_feet =  cur_frm.doc.total_area_in_square_feet

    if(total_amount > 0 && cur_frm.doc.total_square_feet > 0){

            cur_frm.doc.rate_per_square_feet =  total_amount / (cur_frm.doc.type === 'Sheet Estimation' ? cur_frm.doc.total_square_feet : cur_frm.doc.total_production_qty)
        cur_frm.refresh_field("rate_per_square_feet")

    }
    cur_frm.refresh_fields(['total_amount',"total_square_feet"])
}
function compute_wastage_totals(cur_frm) {
    var wastage_area_in_square_feet = 0
    if(cur_frm.doc.wastage_charges) {
        for(var x=0;x<cur_frm.doc.wastage_charges.length;x+=1){
            wastage_area_in_square_feet += cur_frm.doc.wastage_charges[x].area_in_square_feet
        }
    }
    cur_frm.doc.wastage_area_in_square_feet = wastage_area_in_square_feet
    cur_frm.doc.wastage_amount = wastage_area_in_square_feet * wastage_rate
    cur_frm.refresh_fields(['wastage_area_in_square_feet'])
    compute_total_amounts(cur_frm)
}
function compute_totals(cur_frm) {
    var total_raw_material_cost = 0
    var total_area_in_square_feet = 0
    var total_weight = 0
    var total_operations_cost = 0
    var total_operations_time = 0
    var total_production_qty = 0
    var table = cur_frm.doc.type === 'Sheet Estimation' ? "sheet_estimation" :
                    cur_frm.doc.type === 'Engineering Estimation' ? "engineering_estimation" :
                        cur_frm.doc.type === 'Pipe Estimation' ? "pipe_estimation": ""
    if(cur_frm.doc[table]) {
        for(var x=0;x<cur_frm.doc[table].length;x+=1){
            total_raw_material_cost += (table !== 'pipe_estimation' ? cur_frm.doc[table][x].raw_material_cost : cur_frm.doc[table][x].total_amount)
            total_production_qty += cur_frm.doc[table][x].production_qty
            if(table === 'sheet_estimation'){
                total_area_in_square_feet += cur_frm.doc[table][x].area_in_square_feet
            }
            if(table !== 'pipe_estimation') {
                total_weight += cur_frm.doc[table][x].weight_of_sheet
            }
            total_operations_cost += cur_frm.doc[table][x].operations_cost
            total_operations_time += (cur_frm.doc[table][x].cutting_time_in_minutes + cur_frm.doc[table][x].handling_time)
        }
    }
    cur_frm.doc.total_raw_material_cost = total_raw_material_cost
    cur_frm.doc.total_area_in_square_feet = total_area_in_square_feet
    cur_frm.doc.total_weight = total_weight
    cur_frm.doc.total_operations_cost = total_operations_cost
    cur_frm.doc.total_operations_time = total_operations_time
    cur_frm.doc.total_production_qty = total_production_qty
    cur_frm.refresh_fields(["total_production_qty","total_raw_material_cost","total_area_in_square_feet","total_weight","total_operations_cost","total_operations_time"])
compute_total_amounts(cur_frm)
}
function compute_operations_cost(cur_frm) {
    var additional_operations_costs = 0
    var additional_operations_costs_without_charge= 0
    if(cur_frm.doc.additional_operations_cost){
        for(var x=0;x<cur_frm.doc.additional_operations_cost.length;x+=1){
            additional_operations_costs += cur_frm.doc.additional_operations_cost[x].total_charge
        }
    }
    if(cur_frm.doc.additional_operations_cost_without_charge) {

        for (var xx = 0; xx < cur_frm.doc.additional_operations_cost_without_charge.length; xx += 1) {
            additional_operations_costs_without_charge += cur_frm.doc.additional_operations_cost_without_charge[xx].amount
        }
    }
    cur_frm.doc.total =additional_operations_costs
    cur_frm.doc.total_without_charges = additional_operations_costs_without_charge
    cur_frm.doc.total_additional_operation_cost = additional_operations_costs_without_charge + additional_operations_costs
    cur_frm.refresh_fields(["total","total_without_charges", "total_additional_operation_cost"])
    compute_total_amounts(cur_frm)
}
function compute_operations_cost_without_charges(cur_frm) {
    var additional_operations_costs = 0
    var additional_operations_costs_without_charge= 0
    if(cur_frm.doc.additional_operations_cost){
        for(var x=0;x<cur_frm.doc.additional_operations_cost.length;x+=1){
            additional_operations_costs += cur_frm.doc.additional_operations_cost[x].total_charge
        }
    }
    if(cur_frm.doc.additional_operations_cost_without_charge) {
        for (var xx = 0; xx < cur_frm.doc.additional_operations_cost_without_charge.length; xx += 1) {
            additional_operations_costs_without_charge += cur_frm.doc.additional_operations_cost_without_charge[xx].amount
        }
    }
    cur_frm.doc.total = additional_operations_costs
    cur_frm.doc.total_without_charges = additional_operations_costs_without_charge
    cur_frm.doc.total_additional_operation_cost = additional_operations_costs_without_charge + additional_operations_costs
    cur_frm.refresh_fields(["total","total_without_charges", "total_additional_operation_cost"])
    compute_total_amounts(cur_frm)
}