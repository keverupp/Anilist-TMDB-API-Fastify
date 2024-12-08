# 1. Use a imagem oficial do Node.js como base
FROM node:alpine

# 2. Configure o diretório de trabalho dentro do contêiner
WORKDIR /app

# 3. Copie os arquivos do projeto para o contêiner
COPY package*.json ./

# 4. Instale as dependências de produção
RUN npm install --only=production

# 5. Copie o restante dos arquivos do projeto
COPY . .

# 6. Exponha a porta em que o servidor será executado
EXPOSE 3000

# 7. Comando para iniciar o servidor
CMD ["npm", "start"]
