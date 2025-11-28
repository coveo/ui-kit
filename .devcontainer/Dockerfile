# Development container for pnpm-based monorepo
FROM node:krypton-bookworm@sha256:aa648b387728c25f81ff811799bbf8de39df66d7e2d9b3ab55cc6300cb9175d9

# Install essential packages
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Enable corepack globally
RUN corepack enable

# Configure pnpm home and path
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Configure pnpm to use the mounted store directory
ENV PNPM_STORE_PATH="/pnpm/store"

# Allow corepack to download package managers without prompting
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# Set up workspace directory
WORKDIR /workspaces/ui-kit

# Ensure node user owns pnpm home and store directories
RUN mkdir -p /pnpm/store && chown -R node:node /pnpm

# Switch to node user for all subsequent operations
USER node

# Pre-install pnpm as the node user so it's ready to use
RUN corepack prepare pnpm@10.18.1 --activate

# Install turbo globally so it's available in terminal
RUN pnpm add -g turbo@2.5.5
