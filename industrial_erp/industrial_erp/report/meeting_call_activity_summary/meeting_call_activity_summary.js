// // Copyright (c) 2026, Sanjay and contributors
// // For license information, please see license.txt

// frappe.query_reports["Meeting Call Activity Summary"] = {
// 	"filters": [

// 	]
// };


frappe.query_reports["Meeting Call Activity Summary"] = {
    filters: [
        {
            fieldname: "from_date",
            label: __("From Date"),
            fieldtype: "Date"
        },
        {
            fieldname: "to_date",
            label: __("To Date"),
            fieldtype: "Date"
        },
        {
            fieldname: "activity_category",
            label: __("Activity Category"),
            fieldtype: "Select",
            options: "\nMeeting\nCall"
        },
        {
            fieldname: "status",
            label: __("Status"),
            fieldtype: "Select",
            options: "\nOpen\nCompleted\nClosed\nCancelled"
        },
        {
            fieldname: "reference_doctype",
            label: __("Reference DocType"),
            fieldtype: "Link",
            options: "DocType"
        }
    ]
};
