FROM mcr.microsoft.com/devcontainers/javascript-node:0-20
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install git openjdk-17-jre-headless