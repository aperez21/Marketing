-- Core analytics view: spend, reach, engagement, conversions, and inline KPIs
-- per campaign. Copied verbatim from CLAUDE.md's "Core Analytics View".
--
-- NOTE: SUM(DISTINCT sr.amount_usd) and SUM(DISTINCT ...) elsewhere avoid
-- double-counting from the join fan-out across placements/snapshots/
-- attributions - intentional, not a bug (see CLAUDE.md and
-- claude-code-tasks/004-campaign-performance-view.md).
--
-- NOTE: security_invoker = true is required so this view enforces the
-- querying user's RLS policies (tenant isolation) on the underlying tables,
-- rather than the view owner's. Without it, a view is not itself tenant-safe.

create view campaign_performance
with (security_invoker = true)
as
select
  c.id,
  c.tenant_id,
  c.name,
  c.type,
  c.status,
  c.total_budget_usd,
  c.primary_goal,
  -- Spend
  coalesce(sum(distinct sr.amount_usd), 0)                                      as total_spend,
  c.total_budget_usd - coalesce(sum(distinct sr.amount_usd), 0)                 as budget_remaining,
  -- Reach
  coalesce(sum(ps.impressions), 0)                                               as total_impressions,
  coalesce(sum(ps.reach), 0)                                                     as total_reach,
  coalesce(sum(ps.clicks), 0)                                                    as total_clicks,
  -- Engagement
  coalesce(sum(ps.likes + ps.comments + ps.shares + ps.saves), 0)               as total_engagements,
  -- Conversions
  count(a.id) filter (where a.conversion_type = 'signup')                        as signups,
  count(a.id) filter (where a.conversion_type = 'purchase')                      as purchases,
  count(a.id) filter (where a.conversion_type = 'lead')                          as leads,
  coalesce(sum(a.revenue_usd), 0)                                                as revenue_attributed,
  -- KPIs (computed inline)
  case when sum(ps.impressions) > 0
    then round((sum(sr.amount_usd) / sum(ps.impressions)) * 1000, 4) end        as cpm,
  case when sum(ps.clicks) > 0
    then round(sum(sr.amount_usd) / sum(ps.clicks), 4) end                      as cpc,
  case when sum(ps.impressions) > 0
    then round(sum(ps.clicks)::numeric / sum(ps.impressions), 6) end            as ctr,
  case when sum(ps.likes + ps.comments + ps.shares + ps.saves) > 0
    then round(sum(sr.amount_usd) /
         sum(ps.likes + ps.comments + ps.shares + ps.saves), 4) end             as cpe,
  case when count(a.id) filter (where a.conversion_type = 'signup') > 0
    then round(sum(sr.amount_usd) /
         count(a.id) filter (where a.conversion_type = 'signup'), 2) end        as cac,
  case when count(a.id) filter (where a.conversion_type = 'purchase') > 0
    then round(sum(sr.amount_usd) /
         count(a.id) filter (where a.conversion_type = 'purchase'), 2) end      as cpa,
  case when sum(sr.amount_usd) > 0
    then round(sum(a.revenue_usd) / sum(sr.amount_usd), 4) end                 as roas
from campaigns c
left join spend_records   sr on sr.campaign_id = c.id
left join placements       p  on p.campaign_id  = c.id
left join performance_snapshots ps on ps.placement_id = p.id
left join attributions     a  on a.campaign_id  = c.id
group by c.id, c.tenant_id, c.name, c.type, c.status,
         c.total_budget_usd, c.primary_goal;
