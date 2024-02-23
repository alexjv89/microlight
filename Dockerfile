FROM node:16.20
# For connecting to postgres using ssl
# ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .
# For npm@5 or later, copy package-lock.json as well
# COPY package.json package-lock.json .

RUN npm install --production

# Bundle app source
COPY . .

EXPOSE 1337

CMD [ "node", "app.js" ]