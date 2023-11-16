FROM node:18

RUN mkdir -p /var/app
WORKDIR /var/app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]


