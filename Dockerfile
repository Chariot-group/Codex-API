FROM node:25

WORKDIR /app

COPY . .

RUN npm install

CMD ["npm", "run", "start:dev"]
