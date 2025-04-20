# <img src="public/logos/pulse-logo-256x256.png" alt="Pulse Logo" width="32" height="32" style="vertical-align: middle"> Pulse for Proxmox VE

A lightweight monitoring application for Proxmox VE that displays real-time status for VMs and containers via a simple web interface.

![Pulse Dashboard](docs/images/dashboard-screenshot.png)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/rcourtman)

## 📋 Table of Contents
- [Configuration](#️-configuration)
  - [Environment Variables](#environment-variables)
  - [Creating a Proxmox API Token](#creating-a-proxmox-api-token)
  - [Required Permissions](#required-permissions)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Running the Application (Node.js)](#️-running-the-application-nodejs)
- [Running with Docker Compose](#-running-with-docker-compose)
- [Running with LXC Installation Script](#-running-with-lxc-installation-script)
- [Features](#-features)
- [System Requirements](#-system-requirements)
- [Contributing](#-contributing)
- [License](#-license)
- [Trademark Notice](#trademark-notice)
- [Support](#-support)

## 🛠️ Configuration

### Environment Variables

1.  **Copy Example File:** This application requires environment variables for configuration. Copy the example environment file from `server/.env.example` to `server/.env`.

    ```bash
    cp server/.env.example server/.env
    ```

2.  **Edit `.env`:** Open `server/.env` in a text editor and update the values for your Proxmox environment, including the Host, Token ID, and Token Secret obtained below.

    The following variables are available:
    - `PROXMOX_HOST`: URL of your Proxmox server (e.g., `https://your-proxmox-ip:8006`).
    - `PROXMOX_TOKEN_ID`: Your API Token ID (e.g., `user@pam!tokenid`).
    - `PROXMOX_TOKEN_SECRET`: Your API Token Secret.
    - `PROXMOX_ALLOW_SELF_SIGNED_CERTS`: (Optional) Set to `true` if your Proxmox server uses self-signed SSL certificates. Defaults to `false`.
    - `PORT`: (Optional) Port for the Pulse server to listen on. Defaults to `7655`.
    - `PROXMOX_USERNAME`, `PROXMOX_PASSWORD`, `PROXMOX_REALM`: (Optional) Fallback credentials if API token is not provided.

### Creating a Proxmox API Token

An API token is recommended for connecting Pulse to Proxmox.

1.  **Log in to the Proxmox web interface**

2.  **Create a dedicated user** (optional but recommended for security)
    *   Go to `Datacenter` → `Permissions` → `Users`.
    *   Click `Add`.
    *   Enter a `User name` (e.g., "pulse-monitor"), set Realm to `Proxmox VE authentication server`, set a password, and ensure `Enabled` is checked. Click `Add`.

3.  **Create an API token**
    *   Go to `Datacenter` → `Permissions` → `API Tokens`.
    *   Click `Add`.
    *   Select the `User` you created (e.g., "pulse-monitor@pam") or `root@pam`.
    *   Enter a `Token ID` (e.g., "pulse").
    *   Leave `Privilege Separation` checked (more secure).
    *   Click `Add`.
    *   **Important:** Copy the displayed `Secret` value immediately and store it securely. It will only be shown once.

4.  **Assign permissions**
    *   Go to `Datacenter` → `Permissions` → `Add` → `User Permission`.
    *   Path: `/`
    *   User: Select the user the token belongs to (e.g., "pulse-monitor@pam").
    *   Role: `PVEAuditor` (provides read-only access).
    *   Ensure `Propagate` is checked.
    *   Click `Add`.

5.  **Update your `server/.env` file** with the `Token ID` (which looks like `user@realm!tokenid`, e.g., `pulse-monitor@pam!pulse`) and the `Secret` you saved.

### Required Permissions

The `PVEAuditor` role is recommended as it provides the necessary read-only permissions for Pulse to monitor your Proxmox environment:
- `Datastore.Audit`
- `Permissions.Read` (implicitly included)
- `Pool.Audit`
- `Sys.Audit`
- `VM.Audit`

## 💾 Installation

Navigate to the project root directory and install the necessary Node.js dependencies.

```bash
# Install root dependencies
npm install
```

You also need to install dependencies for the server component:

```bash
# Install server dependencies
cd server
npm install
cd ..
```

## ▶️ Running the Application (Node.js)

These instructions are for running the application directly using Node.js.

### Development Mode

To run the application in development mode (useful for testing changes):

```bash
npm run dev
```
This command starts the server, typically using `nodemon` or similar for automatic restarts on file changes. Check the terminal output for the URL (e.g., `http://localhost:7655`).

### Production Mode

To run the application normally:

```bash
npm run start
```
This command starts the server using `node`. Access the application via the configured host and port.

## 🐳 Running with Docker Compose

Using Docker Compose is the recommended way to run the application in a containerized environment.

**Prerequisites:**
- Docker ([Install Docker](https://docs.docker.com/engine/install/))
- Docker Compose ([Install Docker Compose](https://docs.docker.com/compose/install/))

**Steps:**

1.  **Configure Environment:** Ensure you have created and configured your `server/.env` file as described in the [Environment Variables](#environment-variables) section above.

2.  **Run:** Navigate to the project root directory in your terminal and run:
    ```bash
    docker compose up -d
    ```
    - This command will download the pre-built `rcourtman/pulse:latest` image from Docker Hub (if not already present) and start the container.
    - `-d`: Runs the container in detached mode (in the background).

3.  **Access:** The application should now be running. Access it via `http://<your-host-ip>:7655` (or the host port you mapped in `docker-compose.yml`).

**Stopping the Application:**

To stop the container(s) defined in the `docker-compose.yml` file, run:

```bash
docker compose down
```

*Note: If you modify the `server/.env` file after the container is already running, you may need to restart the container for the changes to take effect. You can do this by running `docker compose down` followed by `docker compose up -d`, or by using `docker compose up -d --force-recreate`.*

## 🚀 Automated Proxmox LXC Installation (Recommended)

This method uses a script run on the Proxmox VE **host** to automatically create a new LXC container and install Pulse inside it.

**Prerequisites:**
- A running Proxmox VE host.
- SSH access or direct console access to the Proxmox VE host.
- An available LXC template (Debian or Ubuntu based) downloaded on your Proxmox storage (e.g., via `Datacenter` -> `Storage` -> `Templates`).
- Network connectivity for the new LXC (DHCP is assumed by default).
- Root access on the Proxmox VE host.

**Steps:**

1.  **Log in to Proxmox Host:** Access your Proxmox VE host shell via SSH or the web UI console.

2.  **Download and Run the Setup Script:** Execute the following command as **root** on the Proxmox host shell:
    ```bash
    bash -c "$(wget -qLO - https://raw.githubusercontent.com/rcourtman/Pulse/main/scripts/setup-proxmox-lxc.sh)" --
    ```
    *   Alternatively, download first:
        ```bash
        wget https://raw.githubusercontent.com/rcourtman/Pulse/main/scripts/setup-proxmox-lxc.sh
        chmod +x setup-proxmox-lxc.sh
        sudo ./setup-proxmox-lxc.sh
        ```

3.  **Follow Prompts:** The script will guide you through configuring the new LXC container:
    *   Container ID (suggests the next available ID).
    *   Hostname for the container (e.g., `pulse-monitor`).
    *   Root password for the container.
    *   Storage location for the container's disk.
    *   OS template to use.
    *   Disk size, CPU cores, and RAM allocation.
    *   (Network is currently set to DHCP on `vmbr0`).

4.  **Wait for Installation:** The script will then perform the following actions:
    *   Create the LXC container using the details provided.
    *   Start the container.
    *   Wait for the container to boot and get network access.
    *   Automatically execute the Pulse installation process *inside* the new container.

5.  **Access Pulse:** Once the script finishes, it will display the likely URL (based on the container's detected IP and the default port 7655) where you can access the Pulse dashboard. You can also find the container's IP address in the Proxmox web UI.

**Managing the Container/Service:**

- **Container Management:** Use the Proxmox web UI or `pct` commands (e.g., `pct start <ID>`, `pct stop <ID>`, `pct enter <ID>`) on the host.
- **Pulse Service Management (inside LXC):** Access the container's console (`pct enter <ID>`) and use systemd commands:
    - `systemctl status pulse-proxmox.service`
    - `systemctl stop pulse-proxmox.service`
    - `systemctl start pulse-proxmox.service`
    - `journalctl -u pulse-proxmox.service -f`

## ✨ Features

- Lightweight monitoring for Proxmox VE nodes.
- Displays real-time status for VMs and Containers via WebSocket updates.
- Simple, responsive web interface.
- Efficient polling: Only queries the Proxmox API when a user is actively viewing the UI, reducing load on the Proxmox server(s).
- Docker support for easy deployment.

## 💻 System Requirements

- **Node.js** (for local development/running): Version 16.x or higher recommended.
- **Docker & Docker Compose** (for containerized deployment): Recent versions recommended.
- **Network**: Connectivity between the Pulse server and your Proxmox server(s).

## 👥 Contributing

Contributions are welcome! Please follow standard fork-and-pull-request workflow. Refer to the main repository's contributing guidelines if available.

1.  **Fork the repository**
2.  **Create a feature branch**: `