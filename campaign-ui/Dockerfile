FROM node:10

WORKDIR /usr/src/app

RUN yarn global add serve

COPY package*.json ./

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 5000

ENTRYPOINT ["node"]

CMD ["server.js"]