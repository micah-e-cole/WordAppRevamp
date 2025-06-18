#!/bin/zsh
set -e

IMAGE_NAME="wordapp:local"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
# Generate a unique filename for the report each time it is run and save in the reports folder
CSV_FILE="reports/trivy-report-$TIMESTAMP.csv"


echo "Rebuilding Docker image: $IMAGE_NAME..."
docker build -t "$IMAGE_NAME" .

echo "🧹 Cleaning old reports (optional)..."
# Uncomment below if you want to remove previous reports
# rm -f trivy-report-*.csv

echo "Scanning image for HIGH and CRITICAL CVEs..."
echo '"Package","Vulnerability ID","Severity","Installed Version","Fixed Version","Title"' > "$CSV_FILE"

trivy image --severity HIGH,CRITICAL \
  --exit-code 1 \
  --format template \
  --template '{{ range . }}{{ range .Vulnerabilities }}"{{ .PkgName }}","{{ .VulnerabilityID }}","{{ .Severity }}","{{ .InstalledVersion }}","{{ .FixedVersion }}","{{ .Title | replace `"` `""` }}"{{ "\n" }}{{ end }}{{ end }}' \
  "$IMAGE_NAME" >> "$CSV_FILE"

echo "Report generated: $CSV_FILE"

# Optional: open on macOS
if command -v open >/dev/null; then
  open "$CSV_FILE"
fi
