---
"@panoptic-it-solutions/n8n-nodes-datto-rmm": patch
---

Fix Account > getDevices operation to support multiple hostname filtering:

- **Fixed single hostname limitation**: Account > getDevices operation now properly processes multiple input items instead of only processing the first hostname
- **Added multi-hostname support**: When multiple input items are provided, the operation collects all unique hostnames and searches for each one individually
- **Improved parameter handling**: Enhanced hostname parameter to extract values from each input item using expressions like `{{ $json.output.agentName }}`
- **Combined results**: All matching devices from multiple hostname searches are combined into a single output

This fix resolves the issue where only the first input item's hostname was being processed, ensuring all provided hostnames are searched in the Datto RMM API. 