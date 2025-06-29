# n8n-nodes-datto-rmm

This is an n8n community node package for interacting with the Datto RMM API. It allows you to automate tasks and integrate Datto RMM data with other applications in your n8n workflows.

[n8n-nodes-datto-rmm on npm](https://www.npmjs.com/package/@panoptic-it-solutions/n8n-nodes-datto-rmm)

---
Built and maintained by [Panoptic IT Solutions](https://panoptic.ie).

## Prerequisites

Before you can use this node, you must enable API access in your Datto RMM account and generate API keys for a user.

### 1. Enable API Access in Datto RMM
First, an administrator must enable API access for the entire account.
1.  Navigate to **Setup > Global Settings > Access Control**.
2.  Turn on the **Enable API Access** toggle.

### 2. Generate User API Keys
Next, generate API keys for the user account that n8n will use.
1.  Navigate to **Setup > Users**.
2.  Click on the username you want to use for the integration.
3.  In the user configuration page, click **Generate API Keys**.
4.  **Securely store the `API Key` and `API Secret Key`**. The secret key will not be shown again.
5.  Take note of the **`API URL`** displayed on this page. This is the specific URL for your account's platform (e.g., `https://pinotage-api.centrastage.net`).
6.  Click **Save User**.

For more details, refer to the official [Datto RMM API documentation](https://rmm.datto.com/help/en/Content/2SETUP/APIv2.htm).

## Installation

Follow the official [n8n documentation](https://docs.n8n.io/integrations/community-nodes/installation/) to install community nodes.

1.  Go to **Settings > Community Nodes** in your n8n instance.
2.  Select **Install**.
3.  Enter `@panoptic-it-solutions/n8n-nodes-datto-rmm` in the **Enter npm package name** field.
4.  Agree to the risks and click **Install**.

After installation, the node will appear as "Datto RMM" in the nodes panel.

## Credentials Setup

The first time you use the Datto RMM node, you will need to configure your credentials.

1.  Drag the Datto RMM node from the nodes panel onto your workflow canvas.
2.  In the properties panel on the right, click the **Create New** button in the **Credentials** section.
3.  Fill in the following fields using the information you gathered in the "Prerequisites" step:
    - **Name**: A memorable name for your credentials (e.g., "My Datto RMM API").
    - **API URL**: Your specific API URL from the Datto RMM user page. **Do not include trailing slashes.**
    - **API Key**: Your Datto RMM public API key.
    - **API Secret Key**: Your Datto RMM private API secret.
4.  Click **Save**.

n8n securely stores these credentials and manages the OAuth2 flow to obtain and refresh access tokens automatically.

## Usage Guide

This section explains how to configure and use the Datto RMM node in your workflows.

### Resources and Operations

The node is organized by **Resources** and **Operations**. A resource is a Datto RMM entity (like an Account or a Device), and an operation is an action you can perform on that resource (like Get, List, Update, etc.).

1.  **Select a Resource**: Choose the type of data you want to work with from the **Resource** dropdown list.
2.  **Select an Operation**: Based on the selected resource, choose the action you want to perform from the **Operation** dropdown list.

As of the current version, the following are available:

-   **Resource**: `Account`
    -   **Operation**: `Get` - Retrieves basic information about the account associated with the credentials.

### Example Workflow: Get Account Information

This simple workflow demonstrates how to use the node to retrieve your Datto RMM account details. It's a great way to test your credentials.

1.  **Add the Node**: Drag the **Datto RMM** node to the canvas.
2.  **Configure the Node**:
    - **Credentials**: Ensure your new Datto RMM credentials are selected.
    - **Resource**: Leave the resource set to `Account`.
    - **Operation**: Leave the operation set to `Get`.
3.  **Execute the Workflow**: Click the **Execute Workflow** button.
4.  **View the Output**: The node will run and output a single JSON object containing your account information.

This provides a simple way to test your credentials and see the node in action. More resources and operations will be added in future versions. 