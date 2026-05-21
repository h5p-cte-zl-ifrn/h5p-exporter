FROM php:8.2-cli-bookworm

ARG NODE_MAJOR=20
ARG H5P_CORE_VERSION=wp-1.16.0
ARG H5P_EDITOR_VERSION=wp-1.16.0

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates gnupg unzip git \
  && mkdir -p /etc/apt/keyrings \
  && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
  && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list \
  && apt-get update && apt-get install -y --no-install-recommends nodejs \
  && npm install -g npm@latest \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY cli.js config.json ./
COPY exporter ./exporter
COPY bin ./bin

RUN set -eux; \
  mkdir -p h5p/core h5p/editor /tmp/h5p/core /tmp/h5p/editor; \
  curl -fsSL "https://github.com/h5p/h5p-php-library/archive/refs/tags/${H5P_CORE_VERSION}.zip" -o /tmp/h5p/core.zip; \
  unzip -q /tmp/h5p/core.zip -d /tmp/h5p/core; \
  cp -a "/tmp/h5p/core/h5p-php-library-${H5P_CORE_VERSION}/." h5p/core/; \
  curl -fsSL "https://github.com/h5p/h5p-editor-php-library/archive/refs/tags/${H5P_EDITOR_VERSION}.zip" -o /tmp/h5p/editor.zip; \
  unzip -q /tmp/h5p/editor.zip -d /tmp/h5p/editor; \
  cp -a "/tmp/h5p/editor/h5p-editor-php-library-${H5P_EDITOR_VERSION}/." h5p/editor/; \
  rm -rf /tmp/h5p

CMD ["php", "/app/bin/export-one.php"]
