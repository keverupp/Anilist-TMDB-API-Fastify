FROM node:20-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências e instala
COPY package*.json ./
RUN npm install

# Copia o restante do código para o container
COPY . .

# Expõe a porta da aplicação
EXPOSE 3000

# Inicia o app diretamente
CMD ["npm", "run", "start"]
