Este projeto é uma API construída com **Fastify** (quase totalmente por IA) que utiliza a API do TMDB e AniList para buscar informações sobre animes, episódios e temporadas. Ele também utiliza **Knex.js** para gerenciar o banco de dados.

## **Índice**
1.  [Visão Geral](#visão-geral)
2.  [Tecnologias Usadas](#tecnologias-usadas)
3.  [Pré-requisitos](#pré-requisitos)
4.  [Instalação](#instalação)
5.  [Rotas](#rotas)
6.  [Banco de Dados](#banco-de-dados) *documentação do banco em construção*
7.  [Lógica no Front-end](#lógica-no-front-end)
8.  [Observações](#observações-e-comentários)
9.  [Contribuindo](#contribuindo)
10. [Licença](#licença)


## **Visão Geral**

Este projeto visa integrar informações da API AniList junto da API TMDB para construção de funcionalidades como:
- Busca de animes, episódios e temporadas.
- Armazenamento e gerenciamento de dados em um banco de dados relacional.

Este projeto tem como objetivo final ser uma plataforma completa para discussão sobre animes em Portugues(BR). (não havera como assistir, pelo menos ate o momento sem planos)

---

## **Tecnologias Usadas**

- **Fastify**: Framework web para Node.js utilizado para construção da API.
- **Knex.js**: Query builder para interagir com o banco de dados relacional.
- **PostgreSQL**: Banco de dados relacional usado para persistência de dados.
- **Axios**: Cliente HTTP usado para requisições, como à API AniList.
- **GraphQL Request**: Cliente leve para realizar requisições GraphQL.
- **Argon2**: Biblioteca para hashing de senhas.
- **jsonwebtoken**: Utilizado para autenticação baseada em tokens JWT.
- **dotenv**: Gerenciamento de variáveis de ambiente.
- **Nodemon**: Ferramenta para reiniciar automaticamente o servidor em desenvolvimento.
- **Node.js**: Ambiente de execução JavaScript.
- **pg**: Driver para conectar ao PostgreSQL.

--- 

## **Pré-requisitos**

Certifique-se de ter as seguintes ferramentas instaladas:

- [Node.js](https://nodejs.org/) (v16 ou superior)
- [PostgreSQL](https://www.postgresql.org/) (v12 ou superior)

Além disso, configure um arquivo `.env` seguindo o `.env.example`
---

## **Instalação**

1. Clone este repositório:
   ```bash
   git clone https://github.com/polixter/anilist-api-fastify.git
   cd anilist-api-fastify
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o banco de dados:
   - Crie o banco:
     ```bash
     createdb anilist_db
     ```
   - Execute as migrations:
     ```bash
     npm run migrate
     ```
   - Execute as seeds:
     ```bash
     npm run seed
     ```

4. Inicie o servidor:
   ```bash
   npm run dev
   ```

---

### **Rotas**

## Documentação de Rotas

A documentação detalhada das rotas foi movida para o [README de `routes`](./routes/README.md) para manter a organização do projeto. Acesse o link para conferir todas as informações sobre as rotas disponíveis.

---

## **Lógica no Front-end**

A lógica no front-end segue uma série de etapas. Antes de começar, é fundamental rodar as **migrations** e **seeds**, como descrito na seção de [instalação](#instalação).

### Etapas iniciais

1. **Popular animes iniciais**  
   Primeiramente, devemos popular a base com os animes mais famosos e lançamentos atuais (através das rotas). Isso garantirá uma página inicial adequada para começar. Após essa etapa, a população da base de animes será feita pelos próprios usuários, também utilizando as rotas disponíveis.

   Iremos usar a rota  `/animes/returning-series` para exibir informações dos animes que estão em lançamento, assim poderemos ter uma pagina inicial decente.

2. **Busca e inserção de títulos**
   - O sistema contará com uma barra de pesquisa na navbar ou na página inicial.  
   - Quando o usuário realizar uma busca, utilizaremos inicialmente a [rota de busca local](./routes/README.md#1-buscar-títulos-de-animes) para listar os títulos disponíveis na base local.  
   - Caso o título desejado não esteja presente, aparecerá a opção **"carregar mais"**, que acionará a [rota de busca na API](./routes/README.md#2-buscar-e-inserir-animes-na-base-local). Essa rota buscará o título na API e o inserirá na base local para consultas futuras.  
   - Dessa forma, a base local será enriquecida gradualmente com os títulos buscados, reduzindo a necessidade de futuras consultas na API. Este processo será similar para animes.

3. **Detalhes do anime**  
   - Ao selecionar um título, usaremos seu ID para consultar as informações detalhadas do anime através da [rota de informações de um anime](./routes/README.md#2-informações-de-um-anime).  
   - Essa rota verificará inicialmente se as informações já estão na base local. Caso contrário, fará uma busca na API.  
   - Durante essa etapa, além das informações básicas do anime, também serão inseridas as temporadas e a quantidade de episódios disponíveis.

4. **Vídeos do anime**  
   - Na página do anime, utilizaremos a [rota de vídeos](./routes/README.md#9-adicionar-vídeos-de-um-anime) para exibir conteúdos adicionais, como aberturas, encerramentos e outros vídeos oficiais.

### Fluxo principal

As etapas fundamentais incluem:  
- Busca de títulos na base local ou na API.  
- Consulta de informações detalhadas do anime usando o ID.  

Essas ações são essenciais para inserir temporadas e IDs necessários para o funcionamento das rotas subsequentes.

---

## **Observações e Comentários**

As migrations foram configuradas para funcionar no Postgres. Como alguns bancos, como o MySQL, oferecem menos suporte para certos tipos de dados, é possível que ocorram erros ao tentar usar outro banco de dados. No entanto, as migrations e seeds foram testadas e funcionam tranquilamente no Postgres.

A chave do Anilist é fácil de encontrar diretamente na página deles. Já a do TMDB exige cadastro e aprovação, mas geralmente isso não é um problema. O limite de requisições no TMDB é bem maior e já traz os dados em português, o que facilita bastante. Um ponto de atenção é que, no caso de animes com várias temporadas, o TMDB agrupa tudo em uma única entrada, enquanto o Anilist separa por temporada. Isso permite ter capas, banners e descrições diferentes para cada temporada. Pretendo revisar esse aspecto no futuro.

O repositório ficará público, já que utilizo para estudos e acredito que contribuições (se houver) são sempre bem-vindas. Como todo o projeto foi desenvolvido com a ajuda de IA (ChatGPT), é normal que existam falhas e redundâncias no código. Vou corrigindo e melhorando conforme avanço nos estudos.

---

## **Contribuindo**

Contribuições são bem-vindas! Para contribuir:

1. Crie um fork do repositório.
2. Crie uma branch para sua feature ou correção de bug.
3. Envie um pull request com suas alterações.

---

## **Licença**

Este projeto está licenciado sob a [MIT License](https://opensource.org/licenses/MIT).
