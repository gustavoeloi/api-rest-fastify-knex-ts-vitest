# Criando uma API Rest com NodeJS

## Anotações dos meus estudos

Nesse módulo, estarei utilizando

- Fastify
- Knex JS
- Typescript
- Variáveis de Ambientes
- Zod
- Vitest

→ `npm init -y` para iniciar o projeto node

→ `npm i -D typescript` para instalar o pacote typescript

→ `tsc --init` para iniciar o arquivo tsconfig.json

→ `npm i -D @types/node` para baixar os pacotes typescript para o node

→ `npx tsx src/server.ts` esse comando compila o código typescript em javascript

→ `npm i -D tsx` instala essa ferramente que automatiza o processo de converter e rodar o código javascript

→ `npx tsx src/server.ts` converte o código em javascript e já roda, sem criar um arquivo novo

**Conexão com Banco de Dados**

→ Existem várias maneiras de se comunicar com um banco de dados, com diferentes tipos de abstração (o quanto você precisa se preocupar com SQL):

- Driver Nativo: Esse é o mais baixo nível, ou seja, o mais próximo do banco de dados. Você se conecta ao banco de dados, escreve as queries em SQL em forma de string e manda o banco executar.
- Query Builder: Aqui você escreve as queries usando funções, e a biblioteca se encarrega de gerar a query nativa. Uma das grandes vantagens desse método é que a biblioteca trata possíveis diferenças de sintaxe entre banco de dados. Isso permite que uma troca de banco de dados seja mais simples, fazendo pouca ou nenhuma alteração no banco de dados.
- ORM: Object-Relational Mapping (Mapeamento Objeto-Relacional) é um padrão aonde se mapeia a estrutura relaciona do banco de dados em objetos na linguagem específica. Tabelas viram objetos, linhas viram atributos do objeto e relação entre tabela se transformam em relações entre objetos. Esse é o nível mais alto de abstração. Você não precisa nem pensar em queires SQL.

https://www.webdevdrops.com/nodejs-banco-de-dados-orm-query-builder-driver-nativo/

---

**Migrations**

É uma forma de versionar o schema de sua aplicação. Migrations trabalha na manipulação da base de dados: criando, alterando ou removendo. Uma forma de controlar as alterações do seu banco juntamente com o versionamento de sua aplicação e compartilhar-la.

> Qualquer alteração deverá ser registrada, seja ela criação de uma coluna, alteração de tipo, criação de fk ou pk, remoção e etc. Qualquer simples alteração deverá estar nas migrations.

→ No Knex:

No knex, é necessário criar um arquivo `knexfile` que conterá as configurações do banco de dados, configrando a pasta/saída das migrations e etc. Nesse arquivo você importará as configurações do Knex, exemplo:

```jsx
// knexfile.ts
import { databaseConfig } from "./src/database";

export default databaseConfig;

// database.ts
import knex, { Knex } from "knex";

export const databaseConfig: Knex.Config = {
  client: "sqlite3",
  connection: {
    filename: "./database/database.sqlite",
  },
  migrations: {
    directory: "./database/migrations",
    extension: "ts",
  },
};

export const database = knex(databaseConfig);

```

Como estamos estamos usando o Typescript/tsx para rodar nossos códigos `.ts` , vamos precisar criar um script para rodar nossas migrations

```jsx
node --loader tsx ./node_modules/.bin/knex
```

e para rodarmos no terminal, utilizamos o seguinte comando:

```jsx
npm run knex -- migrate:make seed_name
```

Comandos do Migration no Knex

- `migrate:make [option] <name>` → gera um arquivo de migration
- `migrate:latest` → Roda todas as migrations que você ainda não rodou
- `migrate:up <name>` → Roda a próxima ou a migration especificada que não foi rodada ainda
- `migrate:rollback` → Reverte a última migration realizada
- `migrate:down <name>` → Defaz a última migration

---

**Schema Builder no Knex**

→ Com o `knex.schema` vocêrRetorna um objeto stateful que contém a query. Esses métodos retorna uma promise e cria os esquemas no banco de dados.

**Create Table**

Cria uma nova tabela no banco de dados, com uma função callback que retorna a estrutura da tabela.

```jsx
knex.schema.createTable("users", (table) => {
  table.increments();
  table.string("name");
  table.timestamps();
});
```

**CreateTableLike**

Gera uma nova tablea no banco de dados baseada em outra já existente. Copia apenas a estrutura: colunas, keys e indexes e não copia os dados. Uma função callback pode ser passado para adicionar colunas na tabela copiada.

```jsx
knex.schema.createTableLike("new_users", "users", (table) => {
  table.integer("age");
  table.string("last_name");
});
```

**dropTable**

Delete uma tabela especificada pelo `tableName`

```jsx
knex.schema.dropTable("users");
```

dropTableIfExists

Delete uma tabela com base na condição daquela tablea existir, especificada pelo `tableName`

```jsx
knex.schema.dropTable("users");
```

**renameTable**

Renomea o nome atual da tabela para outro

```jsx
knex.schema.renameTable("old_users", "users");
```

**table**

Seleciona uma tabela no banco de dados, e modifica a tabela, usando as funções do schema building dentro do callback

```jsx
knex.schema.table("users", (table) => {
  table.dropColumn("name");
  table.string("first_name");
  table.string("last_name");
});
```

**alterTable**

Seleciona uma tabela no banco de dados, e modifica a tabela, usando as funções do schema building dentro do callback

```jsx
knex.schema.table("users", (table) => {
  table.dropColumn("name");
  table.string("first_name");
  table.string("last_name");
});
```

---

**Fastify**

É um web framework para NodeJS usado para criação de servidores e rotas

**Plugins**

O Fastify permite a extensão de funcionalidades através do plugin, um plugin pode ser rotas, server decorator, ou qualquer coisa. A API usada para usar um plugin é o `register` .

```jsx
fastify.register(plugin, [options]);
```

Exemplo:

```jsx
// server.ts

const server = fastify()

server.register(transactionsRoutes, {
	prefix: "transactions" // todas as rotas desse transactionsRoutes vão
	// prefixo /transactions
})

// transactions.ts

//Aqui é importante se atentar que toda função deve ser assíncrona,
// e o transactionsRoutes receberá app como parametro da função
export async function transactionsRoutes(app: FastifyInstance) {

	app.get("/hello", async (req, reply) => {
		reply.code(200).send({ message: "Hello World"})
	})
}
```

**Tipando as tabelas no Knex**

No Knex, você pode aumentar a interface Table no módule `'knex/types/tables'`

```jsx
import { Knex } from 'knex';

declare module 'knex/types/tables' {
	interface User {
		id: number;
		name: string;
		created_at: string;
		updated_at: string;
	}

	interface Tables {
		// Essa é a mesma maneira de 'knex<User>'("users")
		users: Users
	}
}
```

---

**Cookies HTTP e criando cookies na requisições com Fastify**

→ Um cookie HTTP (um ccookie web ou cookie de navegador) é um pequeno fragmento de dados que um servidor envia para o navegador do usuário. O navegador pode armazenar estes dados e enviá-los de volta na próxima requisição para o mesmo servidor. Normalmente é utilizado para identificar se duas requisições vieram do mesmo navegador.

São usados principalmente para três propósitos:

- Gerenciamento de sessão: Logins, carrinhos de compras. placar de jogos ou qualquer outra atividade que deva ser guardada por um servidor.
- Personalização: Preferência de usuário , temas e outras configurações.
- Rastreamento: Registro e análise do comportamento de usuário.

informações confidenciais *nunca* devem ser guardadas em cookies, pois são intrinsecamente inseguros e esta diretiva não oferece proteção real

**Configurando os cookies com o Fastify**

→ para usar os cookies, é necessário a instalação do plugin `@fastify/cookie`

E agora você pode registrar o plugin do cookie na sua aplicação

```jsx
import cookie from "@fastify/cookie"

const app = fastify()

app.register(
```

e com isso, nós já podemos acesssar nossos cookies através da `request` de nossa rota

para criar um cookie, aqui vai um exemplo:

```jsx
app.post("/", async (req, reply) => {
		reply.setCookie("nome do cookie", "valor do cookie", {
			// aqui pode ser configurado o seu cookie, como por exemplo,
			// qual rota ele estará disponível
			// se será httpOnly
			// a idade máxima do seu cookie e etc
			path: "/",
			maxAge: 60 * 60 * 24 * 7 (seven days) // aqui o valor é passado em segundos
		}
})
```

Contextos Globais

→ No Fastify, Hooks são registrados com o método `fastify.addHook` e com isso, permite a aplicação especutar eventos específicos, ou a ciclo de vida das request/response.

Por exemplo, vamos adicionar um Hook para emitir tal função antes de uma requisição:

```jsx

const server = fastify()

server.addHook("preHandler", (req, reply) { // o preHandler faz algo antes de executar
		console.log(`${req.method}/${req.routerPath}`)
})
```

Também é possível fazer isso dentro do contexto de um plugin, exemplo:

```jsx
// transactions.ts
app.get(
  "/",
  {
    preHandler: [validateCookieOnRequest],
  },
  async (req, reply) => {
    const { sessionId } = req.cookies;

    const transactions = await database("transactions")
      .where("session_id", sessionId)
      .select();

    return reply.status(200).send({
      transactions,
    });
  }
);
```

```jsx

// validateCookieOnRequest
import { FastifyReply, FastifyRequest } from "fastify";

export async function validateCookieOnRequest(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const sessionId = request.cookies.sessionId;

  if (!sessionId) {
    return reply.code(401).send({
      message: "Unauthorized",
    });
  }
}

```

---

### Testes Automatizados 🔬

Testar aplicação sempre é importante para evitar problemas inesperados, com isso, existem 3 tipos de testes:

- **Unitários**: Esses testes buscam testar uma unidade da sua aplicação isolada, como uma função, um pequeno trecho de código e etc.
- **Integração:** Esses testes já focam em testar a comunicação entre duas ou mais unidades
- **E2E (End-to-End):** Esses testes simulam um usuário na nossa aplicação

Os testes E2E no front-end testa da seguinte maneira, exemplo: `abre a página de login, digite o texto teste@teste.com no campo com ID Email, clique no botão`

Já no back-end, ele busca simular `simulações HTTP, Websockets`

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/3e6dd35c-837f-4343-baf0-bbb7eff704f9/43f28a0b-09c3-40f5-adcd-eca511f1e307/Untitled.png)

A pirâmide de testes busca mostrar o nível de teste que temos que ter em nossa aplicação, mais testes unitários e menos testes E2E

- Testes E2E são mais pesados e demorados para serem feitos

Vitest → é um framework de feito pelo Vite com ele a gente consegue criar testes em TypeScript, tem uma sintaxe igual ao do Jest.

[Vitest](https://vitest.dev/)

SuperTest → É um pacote que consegue prover um grande nível de abstração para testes HTTP
