import frappe
import re
from frappe import _


def validate_duplicate_mobile(doc, method=None):
    if not doc.mobile_no:
        return

    # Validate mobile number format
    if not re.fullmatch(r"\d{10}", doc.mobile_no):
        frappe.throw(_("Mobile Number must contain exactly 10 digits."))

    # Check duplicate mobile number
    duplicate_leads = frappe.get_all(
        "Lead",
        filters={
            "mobile_no": doc.mobile_no,
            "name": ["!=", doc.name]
        },
        fields=["name"]
    )

    if duplicate_leads:
        lead_names = ", ".join(
            lead.name for lead in duplicate_leads
        )

        frappe.throw(
            _("Mobile Number already exists in Lead(s): {0}").format(
                lead_names
            ),
            frappe.DuplicateEntryError
        )