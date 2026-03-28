CREATE TABLE IF NOT EXISTS `PROJECT_ID.mmasion.session_events` (
  session_id STRING NOT NULL,
  event_id STRING NOT NULL,
  event_type STRING NOT NULL,
  actor STRING NOT NULL,
  content STRING,
  created_at TIMESTAMP NOT NULL,
  source_type STRING,
  interface_name STRING,
  status STRING,
  intervention_action STRING,
  intervention_reason STRING,
  monitor_provider STRING,
  matched_fields ARRAY<STRING>,
  missing_critical_fields ARRAY<STRING>,
  risk_signals ARRAY<STRING>
)
PARTITION BY DATE(created_at)
CLUSTER BY session_id, event_type, actor;

CREATE TABLE IF NOT EXISTS `PROJECT_ID.mmasion.resident_explainers` (
  session_id STRING NOT NULL,
  generated_at TIMESTAMP NOT NULL,
  provider STRING NOT NULL,
  title STRING,
  plain_language_summary STRING,
  agencies_mentioned ARRAY<STRING>,
  decision_areas ARRAY<STRING>,
  compliance_gaps ARRAY<STRING>,
  suggested_questions ARRAY<STRING>
)
PARTITION BY DATE(generated_at)
CLUSTER BY session_id, provider;
