// Copyright (c) 2026, Sanjay and contributors
// For license information, please see license.txt

// frappe.query_reports["Purchase Order Pending Receipt Report"] = {
// 	"filters": [

// 	]
// };

frappe.query_reports["Purchase Order Pending Receipt Report"] = {
    filters: [
        {
            fieldname: "from_date",
            label: __("From Date"),
            fieldtype: "Date",
            reqd: 1,
            default: frappe.datetime.month_start()
        },
        {
            fieldname: "to_date",
            label: __("To Date"),
            fieldtype: "Date",
            reqd: 1,
            default: frappe.datetime.get_today()
        },
        {
            fieldname: "supplier",
            label: __("Supplier"),
            fieldtype: "Link",
            options: "Supplier"
        },
        {
            fieldname: "purchase_order",
            label: __("Purchase Order"),
            fieldtype: "Link",
            options: "Purchase Order"
        },
        {
            fieldname: "receipt_status",
            label: __("Receipt Status"),
            fieldtype: "Select",
            options: [
                "All",
                "Pending",
                "Partially Received",
                "Overdue"
            ],
            default: "All"
        }
    ]
};
