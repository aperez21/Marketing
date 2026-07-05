-- Fixes advisor lint `function_search_path_mutable` flagged immediately after
-- applying 0001-0009 to the live project: current_tenant_id() had no
-- search_path pinned, which is a privilege-escalation vector (a caller could
-- shadow objects the function references via search_path).

alter function current_tenant_id() set search_path = '';
