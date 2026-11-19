// // Copyright (c) 2026, Sanjay and contributors
// // For license information, please see license.txt

// frappe.query_reports["Opportunity Stage Tracking Report"] = {
// 	"filters": [

// 	]
// };

frappe.query_reports["Opportunity Stage Tracking Report"] = {
    filters: [
        {
            fieldname: "from_date",
            label: __("From Date"),
            fieldtype: "Date",
        },
        {
            fieldname: "to_date",
            label: __("To Date"),
            fieldtype: "Date",
        },
        {
            fieldname: "sales_stage",
            label: __("Sales Stage"),
            fieldtype: "Link",
            options: "Sales Stage",
        },
        {
            fieldname: "status",
            label: __("Status"),
            fieldtype: "Select",
            options: "\nOpen\nReplied\nQuotation\nConverted\nLost\nClosed",
        },
        {
            fieldname: "opportunity_owner",
            label: __("Opportunity Owner"),
            fieldtype: "Link",
            options: "User",
        },
        {
            fieldname: "opportunity_type",
            label: __("Opportunity Type"),
            fieldtype: "Link",
            options: "Opportunity Type",
        },
    ],
};
