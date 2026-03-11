#!/bin/bash
# merge-prds.sh - Merge multiple prd-*.json files in tasks/ into a single prd.json
# Usage: ./merge-prds.sh

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TASKS_DIR="$SCRIPT_DIR/tasks"
MASTER_FILE="$TASKS_DIR/prd-master.json"
OUTPUT_FILE="$SCRIPT_DIR/prd.json"

# Check for jq
if ! command -v jq &>/dev/null; then
  echo "Error: jq is not installed. Please install jq before running this script." >&2
  exit 1
fi

# Check that prd-master.json exists
if [ ! -f "$MASTER_FILE" ]; then
  echo "Error: tasks/prd-master.json not found." >&2
  exit 1
fi

# Validate prd-master.json is valid JSON
if ! jq empty "$MASTER_FILE" 2>/dev/null; then
  echo "Error: tasks/prd-master.json is not valid JSON." >&2
  exit 1
fi

# Read master fields
PROJECT=$(jq -r '.project' "$MASTER_FILE")
BRANCH_NAME=$(jq -r '.branchName' "$MASTER_FILE")
DESCRIPTION=$(jq -r '.description' "$MASTER_FILE")

# Find all prd-*.json files excluding prd-master.json, sorted case-insensitively
mapfile -t SUB_PRDS < <(find "$TASKS_DIR" -maxdepth 1 -name "prd-*.json" ! -name "prd-master.json" | sort -f)

FILE_COUNT=${#SUB_PRDS[@]}

# Validate all sub-PRDs before merging
for PRD_FILE in ${SUB_PRDS[@]+"${SUB_PRDS[@]}"}; do
  BASENAME=$(basename "$PRD_FILE")

  # Validate JSON
  if ! jq empty "$PRD_FILE" 2>/dev/null; then
    echo "Error: $BASENAME is not valid JSON." >&2
    exit 1
  fi

  # Check for userStories array
  if ! jq -e '.userStories | arrays' "$PRD_FILE" &>/dev/null; then
    echo "Error: $BASENAME is missing the userStories array." >&2
    exit 1
  fi

  # Warn if zero user stories
  SUB_STORY_COUNT=$(jq '.userStories | length' "$PRD_FILE")
  if [ "$SUB_STORY_COUNT" -eq 0 ]; then
    echo "Warning: $BASENAME has zero user stories." >&2
  fi
done

# Merge userStories from all sub-PRDs
ALL_STORIES="[]"
PRIORITY=1

for PRD_FILE in ${SUB_PRDS[@]+"${SUB_PRDS[@]}"}; do
  BASENAME=$(basename "$PRD_FILE")
  STEM="${BASENAME#prd-}"
  STEM="${STEM%.json}"

  STORY_COUNT=$(jq '.userStories | length' "$PRD_FILE")

  NEW_STORIES=$(jq --arg stem "$STEM" --argjson startPriority "$PRIORITY" \
    '[.userStories | to_entries[] |
      ((.key + 1) | tostring) as $seq |
      ("000" + $seq)[-3:] as $padded |
      .value + {
        id: ($stem + "-" + $padded),
        priority: ($startPriority + .key)
      }
    ]' "$PRD_FILE")

  ALL_STORIES=$(jq -n --argjson a "$ALL_STORIES" --argjson b "$NEW_STORIES" '$a + $b')
  PRIORITY=$((PRIORITY + STORY_COUNT))
done

# Check for duplicate story IDs after namespacing
DUPE=$(jq -r '[.[].id] | group_by(.) | map(select(length > 1)) | .[0][0] // empty' <<< "$ALL_STORIES")
if [ -n "$DUPE" ]; then
  echo "Error: Duplicate story ID detected after namespacing: $DUPE" >&2
  exit 1
fi

STORY_COUNT=$(jq 'length' <<< "$ALL_STORIES")

# Preserve passes status from existing prd.json
OLD_PASSED_IDS="{}"
if [ -f "$OUTPUT_FILE" ]; then
  OLD_PASSED_IDS=$(jq '[.userStories // [] | .[] | select(.passes == true) | .id] | map({(.): true}) | add // {}' "$OUTPUT_FILE")
fi

ALL_STORIES=$(jq -n \
  --argjson stories "$ALL_STORIES" \
  --argjson passed "$OLD_PASSED_IDS" \
  '$stories | map(. + {passes: ($passed[.id] // false)})')

# Build and write the final prd.json
jq -n \
  --arg project "$PROJECT" \
  --arg branchName "$BRANCH_NAME" \
  --arg description "$DESCRIPTION" \
  --argjson userStories "$ALL_STORIES" \
  '{project: $project, branchName: $branchName, description: $description, userStories: $userStories}' \
  > "$OUTPUT_FILE"

echo "Merged $STORY_COUNT stories from $FILE_COUNT files into prd.json"
