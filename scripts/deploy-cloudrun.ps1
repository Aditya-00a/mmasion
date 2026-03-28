param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectId,
  [Parameter(Mandatory = $false)]
  [string]$Region = "us-central1",
  [Parameter(Mandatory = $false)]
  [string]$Repository = "mmasion",
  [Parameter(Mandatory = $false)]
  [string]$Service = "mmasion"
)

$ErrorActionPreference = "Stop"

$image = "$Region-docker.pkg.dev/$ProjectId/$Repository/$Service:latest"

gcloud config set project $ProjectId | Out-Null
gcloud artifacts repositories create $Repository --repository-format=docker --location=$Region --quiet 2>$null
gcloud builds submit --tag $image .
gcloud run deploy $Service `
  --image $image `
  --region $Region `
  --allow-unauthenticated `
  --set-env-vars "PORT=8080,MMASION_PROVIDER=ollama,MMASION_OLLAMA_MODEL=gemma3:12b,MMASION_MONITOR_PROVIDER=gemini,MMASION_VERTEX_MODEL=gemini-2.5-flash,MMASION_VERTEX_LOCATION=$Region"
