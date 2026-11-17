
import frappe
from frappe import _
from frappe.utils import flt


def set_quotation_approval_requirement(doc, method=None):
    """
    Determine whether a quotation requires management approval
    using the configured company approval limit.
    """

    settings = frappe.get_single("Sales Approval Settings")

    # Ensure approval settings are enabled
    if not settings.enable_approval:
        doc.custom_requires_approval = 0
        return

    # Ensure settings belong to the quotation's company
    if settings.company != doc.company:
        frappe.throw(
            _("Sales Approval Settings are not configured for company {0}.").format(
                doc.company
            )
        )

    approval_limit = flt(settings.approval_limit)
    quotation_total = flt(doc.grand_total)

    # Calculate approval requirement
    doc.custom_requires_approval = (
        1 if quotation_total > approval_limit else 0
    )


def validate_quotation_submission(doc, method=None):
    """
    Prevent quotations from being submitted without
    completing the required approval workflow.
    """

    # Read the previously saved workflow state.
    # This prevents users from directly changing the state
    # to Approved and submitting in the same request.
    previous_state = None

    if not doc.is_new():
        previous_state = frappe.db.get_value(
            "Quotation",
            doc.name,
            "custom_workflow_state"
        )

    if previous_state != "Approved":
        frappe.throw(
            _("Quotation must pass through the Approved workflow state before submission.")
        )

    # Additional authorization for quotations requiring approval
    if doc.custom_requires_approval:
        if not (
            frappe.has_role("Sales Manager")
            or frappe.has_role("System Manager")
        ):
            frappe.throw(
                _("Only a Sales Manager or System Manager can submit an approved quotation requiring approval.")
            )
