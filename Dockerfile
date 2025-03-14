FROM node:20-alpine

# Define o diretório de trabalho
WORKDIR /app

# Instala o netcat para aguardar o PostgreSQL
RUN apk add --no-cache netcat-openbsd

# Copia os arquivos de dependências e instala
COPY package*.json ./
RUN npm install

# Copia o restante do código para o container
COPY . .

# Copia o script de entrypoint e dá permissão de execução
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Expõe a porta que a aplicação utiliza
EXPOSE 3000

# Comando de inicialização: aguarda o DB, executa migrations/seeds e inicia o app
CMD ["/bin/sh", "./entrypoint.sh"]

