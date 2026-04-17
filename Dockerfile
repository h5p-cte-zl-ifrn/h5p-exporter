FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl unzip \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY cli.js config.json docker-entrypoint.sh ./

ARG H5P_CORE_VERSION=wp-1.16.0
ARG H5P_EDITOR_VERSION=wp-1.16.0

RUN set -eux; \
  mkdir -p h5p/core h5p/editor /tmp/h5p/core /tmp/h5p/editor; \
  curl -fsSL "https://github.com/h5p/h5p-php-library/archive/refs/tags/${H5P_CORE_VERSION}.zip" -o /tmp/h5p/core.zip; \
  unzip -q /tmp/h5p/core.zip -d /tmp/h5p/core; \
  cp -a "/tmp/h5p/core/h5p-php-library-${H5P_CORE_VERSION}/." h5p/core/; \
  curl -fsSL "https://github.com/h5p/h5p-editor-php-library/archive/refs/tags/${H5P_EDITOR_VERSION}.zip" -o /tmp/h5p/editor.zip; \
  unzip -q /tmp/h5p/editor.zip -d /tmp/h5p/editor; \
  cp -a "/tmp/h5p/editor/h5p-editor-php-library-${H5P_EDITOR_VERSION}/." h5p/editor/; \
  rm -rf /tmp/h5p; \
  chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
