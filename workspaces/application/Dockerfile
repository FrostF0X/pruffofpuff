FROM urielch/opencv-nodejs

WORKDIR /usr/src/app

ENV OPENCV4NODEJS_DISABLE_AUTOBUILD=1

COPY package* /usr/src/app
RUN npm install

VOLUME /tmp/foo

COPY ./ /usr/src/app
RUN npm run build