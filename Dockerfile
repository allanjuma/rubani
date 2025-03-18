############################################################
# Dockerfile to build datex server container
# Based on Ubuntu latest version
############################################################


# Set the base image to Ubuntu
FROM ubuntu:latest
# File Author / Maintainer
MAINTAINER allan@bitsoko

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y curl gnupg git



RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -

RUN apt-get update && apt-get install -y nodejs



WORKDIR /

RUN git clone https://github.com/http-party/http-server.git && cd http-server && npm install

RUN cd / && git clone https://bitsoko:12Gitlabsrus34@git.bitsoko.org/games/rubani.git game

HEALTHCHECK --retries=10 --interval=1m --timeout=30s CMD curl --fail http://127.0.0.1:8123/ || exit 1



ENTRYPOINT  cd /game && git pull && npm install && node --es-module-specifier-resolution=node index.js


