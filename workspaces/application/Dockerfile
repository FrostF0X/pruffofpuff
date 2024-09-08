FROM node:lts-slim

WORKDIR /usr/src/app

RUN apt-get update && \
    apt-get install -y \
    build-essential \
    cmake \
    libopencv-dev \
    python3 \
    python3-pip \
    python3-opencv \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

ENV OPENCV4NODEJS_DISABLE_AUTOBUILD=1

COPY package* /usr/src/app
RUN npm install

VOLUME /tmp/foo

COPY ./ /usr/src/app
RUN npm run build