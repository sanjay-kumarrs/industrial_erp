
frappe.query_reports["Salesperson Monthly Target Report"] = {
    filters: [
        {
            fieldname: "year",
            label: __("Year"),
            fieldtype: "Date",
            default: frappe.datetime.get_today(),
            reqd: 1
        },
        {
            fieldname: "month",
            label: __("Month"),
            fieldtype: "Select",
            options: [
                "",
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"
            ].join("\n"),
            default: frappe.datetime.str_to_obj(
                frappe.datetime.get_today()
            ).toLocaleString("en-US", { month: "long" })
        },
        {
            fieldname: "sales_person",
            label: __("Sales Person"),
            fieldtype: "Link",
            options: "Sales Person"
        },
        {
            fieldname: "status",
            label: __("Status"),
            fieldtype: "Select",
            options: [
                "",
                "Achieved",
                "Not Achieved"
            ].join("\n")
        }
    ]
};
