#!/usr/bin/env bash
SSH_KEY_PATH="~/.ssh/LightsailDefaultPrivateKey.pem"
SSH_SERVER_USERNAME="root"
SSH_SERVER_HOSTNAME="deadagent.net"
SSH_SERVER_SITEROOT_PATH="/var/www/deadagent.net/public"
DEPLOY_URL='https://deadagent.net'

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]:-$0}"; )" &> /dev/null && pwd 2> /dev/null; )";

DIST_DIR="${SCRIPT_DIR}/dist"

echo "Deploying site via scp..."
scp -i ${SSH_KEY_PATH} -r ${DIST_DIR}/* ${SSH_SERVER_USERNAME}@${SSH_SERVER_HOSTNAME}:${SSH_SERVER_SITEROOT_PATH}
echo "Done. Opening ${DEPLOY_URL}..."
open "${DEPLOY_URL}"
echo "Done."