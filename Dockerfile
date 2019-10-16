FROM node

MAINTAINER jhq <jhq@zving.com>


WORKDIR /home/project

EXPOSE 3000

CMD ["npm","run","dev"]