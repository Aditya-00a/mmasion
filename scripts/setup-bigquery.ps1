param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectId,
  [Parameter(Mandatory = $false)]
  [string]$Dataset = "mmasion",
  [Parameter(Mandatory = $false)]
  [string]$Location = "US"
)

$ErrorActionPreference = "Stop"

gcloud config set project $ProjectId | Out-Null
bq --location=$Location mk --dataset --description "MMASION audit telemetry" "$ProjectId`:$Dataset" 2>$null
bq query --use_legacy_sql=false --project_id=$ProjectId < docs/BIGQUERY_SCHEMA.sql
