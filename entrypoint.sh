#!/bin/sh

echo "Aguardando o PostgreSQL ficar disponível..."
# Aguarda até que o PostgreSQL esteja aceitando conexões na porta 5432
while ! nc -z $DB_HOST 5432; do
  sleep 1
done
echo "PostgreSQL disponível!"

# Executa as migrations e seeds
npm run migrate
npm run seed

# Inicia o servidor
exec npm run dev
