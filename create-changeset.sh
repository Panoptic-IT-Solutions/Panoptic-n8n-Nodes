#!/bin/bash

# Script to create changeset files non-interactively
# Usage: ./create-changeset.sh <package> <type> <description>
# Example: ./create-changeset.sh datto-rmm patch "Fix authentication bug"

set -e

# Default values
PACKAGE_NAME=""
VERSION_TYPE="patch"
DESCRIPTION=""

# Help function
show_help() {
    echo "Usage: $0 <package> <type> <description>"
    echo ""
    echo "Arguments:"
    echo "  package     Package to update (datto-rmm, autotask, or full package name)"
    echo "  type        Version bump type (patch, minor, major)"
    echo "  description Description of the changes"
    echo ""
    echo "Examples:"
    echo "  $0 datto-rmm patch \"Fix authentication bug\""
    echo "  $0 autotask minor \"Add new endpoint support\""
    echo "  $0 @panoptic-it-solutions/n8n-nodes-datto-rmm major \"Breaking API changes\""
}

# Check if correct number of arguments
if [ $# -lt 3 ]; then
    echo "Error: Missing required arguments"
    show_help
    exit 1
fi

PACKAGE_INPUT="$1"
VERSION_TYPE="$2"
DESCRIPTION="$3"

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo "Error: Version type must be 'patch', 'minor', or 'major'"
    exit 1
fi

# Map short package names to full package names
case "$PACKAGE_INPUT" in
    "datto-rmm")
        PACKAGE_NAME="@panoptic-it-solutions/n8n-nodes-datto-rmm"
        ;;
    "autotask")
        PACKAGE_NAME="@panoptic-it-solutions/n8n-nodes-autotask"
        ;;
    "@panoptic-it-solutions/"*)
        PACKAGE_NAME="$PACKAGE_INPUT"
        ;;
    *)
        echo "Error: Unknown package '$PACKAGE_INPUT'"
        echo "Use: datto-rmm, autotask, or full package name"
        exit 1
        ;;
esac

# Generate a unique changeset filename
TIMESTAMP=$(date +%s)
RANDOM_WORDS=("brave" "calm" "cool" "daring" "eager" "fair" "great" "happy" "kind" "lucky" "nice" "proud" "quick" "smart" "wild")
RANDOM_ADJECTIVES=("blue" "green" "red" "yellow" "purple" "orange" "pink" "brown" "black" "white" "silver" "gold" "bright" "dark" "light")

WORD1=${RANDOM_WORDS[$RANDOM % ${#RANDOM_WORDS[@]}]}
WORD2=${RANDOM_ADJECTIVES[$RANDOM % ${#RANDOM_ADJECTIVES[@]}]}
WORD3=${RANDOM_WORDS[$RANDOM % ${#RANDOM_WORDS[@]}]}

CHANGESET_FILE=".changeset/${WORD1}-${WORD2}-${WORD3}.md"

# Create the changeset directory if it doesn't exist
mkdir -p .changeset

# Create the changeset file
cat > "$CHANGESET_FILE" << EOF
---
"$PACKAGE_NAME": $VERSION_TYPE
---

$DESCRIPTION
EOF

echo "✅ Changeset created: $CHANGESET_FILE"
echo ""
echo "📋 Summary:"
echo "  Package: $PACKAGE_NAME"
echo "  Type: $VERSION_TYPE"
echo "  Description: $DESCRIPTION"
echo ""
echo "🚀 Next steps:"
echo "  1. Review the changeset file: $CHANGESET_FILE"
echo "  2. Stage and commit your changes: git add . && git commit -m \"feat: $DESCRIPTION\""
echo "  3. Stage and commit the changeset: git add $CHANGESET_FILE && git commit -m \"changeset: add changeset for ${PACKAGE_INPUT} updates\""
echo "  4. Push your changes: git push origin \$(git branch --show-current)"
echo ""
echo "📦 To release (on main branch):"
echo "  pnpm changeset version && pnpm release"
