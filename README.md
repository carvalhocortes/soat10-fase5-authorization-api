# 🔐 Authorization API - FIAP SOAT10 Fase 5

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-22.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-orange.svg)](https://aws.amazon.com/lambda/)
[![Terraform](https://img.shields.io/badge/IaC-Terraform-purple.svg)](https://www.terraform.io/)

## 📋 Sobre o Projeto

API de autenticação desenvolvida para a **Quinta Fase da Pós-Graduação em Arquitetura de Software da FIAP - Turma SOAT10**.

Este microserviço é responsável pelo gerenciamento de autenticação e autorização de usuários, implementando um sistema serverless na AWS com foco em **segurança**, **escalabilidade** e **alta disponibilidade**.

### 🎯 Objetivos da Fase 5

- Implementar autenticação segura
- Aplicar padrões de arquitetura serverless
- Demonstrar uso de Infrastructure as Code (IaC) com Terraform
- Aplicar práticas de DevOps e CI/CD

## 🏗️ Arquitetura

### Visão Geral

```
┌─────────────────┐    ┌────────────────────┐    ┌─────────────────┐
│   API Gateway   │───▶│  Lambda Functions  │───▶│   AWS Cognito   │
│                 │    │                    │    │   User Pool     │
└─────────────────┘    └────────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  SSM Parameter  │
                       │      Store      │
                       └─────────────────┘
```

### Componentes Principais

1. **API Gateway**: Ponto de entrada para as requisições HTTP
2. **AWS Lambda**: Funções serverless para processamento
3. **AWS Cognito**: Gerenciamento de usuários e autenticação
4. **SSM Parameter Store**: Armazenamento seguro de segredos
5. **Terraform**: Infrastructure as Code

## 🚀 Funcionalidades

### 🔑 Autenticação (`POST /auth`)

- Validação de credenciais via AWS Cognito
- Retorno de tokens JWT (AccessToken, RefreshToken, IdToken)
- Validação de formato de email e força da senha

### 👥 Criação de Usuários (`POST /users`)

- Criação de novos usuários no Cognito User Pool
- Validação de dados de entrada
- Email automaticamente verificado

## 🛠️ Tecnologias e Justificativas

### Backend

| Tecnologia      | Versão | Justificativa                                             |
| --------------- | ------ | --------------------------------------------------------- |
| **AWS Lambda**  | -      | Serverless, pay-per-use, auto-scaling                     |
| **AWS Cognito** | -      | Serviço gerenciado para autenticação, compliance com LGPD |

### Infraestrutura

| Tecnologia              | Justificativa                                    |
| ----------------------- | ------------------------------------------------ |
| **Terraform**           | IaC declarativo, versionamento de infraestrutura |
| **AWS API Gateway**     | Gerenciamento de APIs, throttling, caching       |
| **SSM Parameter Store** | Armazenamento seguro de secrets com criptografia |

### DevOps e Qualidade

| Ferramenta              | Justificativa                       |
| ----------------------- | ----------------------------------- |
| **ESLint + Prettier**   | Padronização de código e formatação |
| **Husky + Lint-staged** | Git hooks para qualidade de código  |
| **GitHub Actions**      | CI/CD automatizado                  |

## 🏛️ Arquitetura do Código

### Clean Architecture + DDD

```
src/
├── domain/           # Entidades e regras de negócio
│   ├── Client.ts     # Entidade de domínio
│   └── CustomErrors.ts # Exceções específicas do domínio
├── application/      # Casos de uso
│   ├── Authenticate.ts
│   └── CreateUser.ts
├── infrastructure/   # Adaptadores externos
│   └── CognitoClientRepository.ts
└── handlers/         # Controladores (AWS Lambda)
    ├── authHandler.ts
    └── createUserHandler.ts
```

### Justificativas Arquiteturais

#### 1. **Clean Architecture**

- **Separação de responsabilidades**: Cada camada tem uma responsabilidade específica
- **Independência de frameworks**: Regras de negócio não dependem de tecnologias externas
- **Testabilidade**: Fácil criação de mocks e testes unitários
- **Manutenibilidade**: Mudanças em uma camada não afetam outras

#### 2. **Domain-Driven Design**

- **Entidades de domínio**: `User` representa o conceito central do negócio
- **Validações no domínio**: Regras de negócio ficam nas entidades
- **Linguagem ubíqua**: Nomes que fazem sentido para o negócio

#### 3. **Repository Pattern**

- **Abstração de dados**: Interface `UserRepository` abstrai o AWS Cognito
- **Facilita testes**: Permite mocks fáceis para testes unitários
- **Troca de implementação**: Pode trocar AWS Cognito por outra solução

## 🔧 Configuração e Deploy

### Pré-requisitos

- Node.js 22.x
- AWS CLI configurado
- Terraform >= 1.0.0
- Conta AWS com permissões adequadas

### Instalação

```bash
# Clone o repositório
git clone https://github.com/carvalhocortes/soat10-fase5-authorization-api.git
cd soat10-fase5-authorization-api

# Instale as dependências
npm install

# Execute os testes
npm test

# Build do projeto
npm run build
```

### Deploy

```bash
# 1. Configure as variáveis do Terraform
cp terraform.tfvars.example terraform.tfvars
# Edite o arquivo com suas configurações

# 2. Inicialize o Terraform
cd terraform
terraform init

# 3. Faça o build da aplicação
npm run deploy-build

# 4. Aplique a infraestrutura
terraform plan
terraform apply
```

### Variáveis de Ambiente

| Variável               | Descrição                  | Exemplo                      |
| ---------------------- | -------------------------- | ---------------------------- |
| `COGNITO_USER_POOL_ID` | ID do User Pool do Cognito | `us-east-1_xxxxxxxxx`        |
| `COGNITO_CLIENT_ID`    | ID do Client do Cognito    | `xxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `AWS_REGION`           | Região da AWS              | `us-east-1`                  |

## 🧪 Testes

### Estratégia de Testes

- **Testes Unitários**: Cobertura de 100% dos casos de uso
- **Testes de Integração**: Validação com AWS Cognito
- **Testes de Contrato**: Validação da API OpenAPI

### Executar Testes

```bash
# Testes unitários
npm test

# Testes com coverage
npm run test:coverage

# Testes em modo watch
npm run test:watch

# Testes para CI
npm run test:ci
```

### Estrutura de Testes

```
__tests__/
├── application/     # Testes dos casos de uso
├── domain/         # Testes das entidades
├── handlers/       # Testes dos handlers
├── infrastructure/ # Testes do repositório
└── integration/    # Testes de integração
```

### Cobertura de Testes

| Arquivo                                       | % Statements | % Branch | % Functions | % Lines  |
| --------------------------------------------- | ------------ | -------- | ----------- | -------- |
| **All files**                                 | **100%**     | **100%** | **100%**    | **100%** |
| src/index.ts                                  | 100%         | 100%     | 100%        | 100%     |
| src/application/Authenticate.ts               | 100%         | 100%     | 100%        | 100%     |
| src/application/CreateUser.ts                 | 100%         | 100%     | 100%        | 100%     |
| src/domain/Client.ts                          | 100%         | 100%     | 100%        | 100%     |
| src/domain/CustomErrors.ts                    | 100%         | 100%     | 100%        | 100%     |
| src/handlers/authHandler.ts                   | 100%         | 100%     | 100%        | 100%     |
| src/handlers/createUserHandler.ts             | 100%         | 100%     | 100%        | 100%     |
| src/infrastructure/CognitoClientRepository.ts | 100%         | 100%     | 100%        | 100%     |

**Total de Testes:** 74 passed ✅
**Test Suites:** 9 passed ✅

## 📖 Documentação da API

### OpenAPI/Swagger

A documentação completa da API está disponível em `doc/openapi.yml`.

```bash
# Visualizar documentação
npm run swagger
# Acesse: http://localhost:3000
```

### Endpoints

#### POST /auth

Autentica um usuário e retorna tokens do AWS Cognito.

**Request:**

```json
{
  "email": "usuario@exemplo.com",
  "password": "minhasenha123"
}
```

**Response (200):**

```json
{
  "AccessToken": "eyJhbGciOiJSUzI1NiIs...",
  "RefreshToken": "eyJjdHkiOiJKV1QiLCJl...",
  "IdToken": "eyJhbGciOiJSUzI1NiIs...",
  "ExpiresIn": 3600,
  "TokenType": "Bearer"
}
```

#### POST /users

Cria um novo usuário no sistema.

**Request:**

```json
{
  "email": "usuario@exemplo.com",
  "password": "minhasenha123"
}
```

**Response (201):**

```json
{
  "userSub": "12345678-1234-1234-1234-123456789012",
  "email": "usuario@exemplo.com",
  "message": "Usuário criado com sucesso"
}
```

## 🔒 Segurança

### Implementações de Segurança

1. **AWS Cognito**: Gerenciamento seguro de usuários e senhas
2. **JWT Tokens**: Tokens assinados e com expiração
3. **HTTPS**: Comunicação criptografada via API Gateway
4. **Validação de entrada**: Sanitização e validação de todos os inputs
5. **Rate Limiting**: Throttling configurado no API Gateway
6. **Secrets Management**: Uso do SSM Parameter Store para secrets

### Compliance

- **LGPD**: AWS Cognito é compliance com LGPD
- **OWASP**: Seguimento das práticas do OWASP Top 10
- **Principle of Least Privilege**: IAM roles com permissões mínimas

## 📊 Monitoramento e Observabilidade

### Métricas AWS

- **CloudWatch Metrics**: Métricas automáticas do Lambda e API Gateway
- **CloudWatch Logs**: Logs estruturados das funções

## 🚀 Roadmap

## 👥 Equipe

### Turma:

SOAT10 - FIAP Pós-Graduação em Arquitetura de Software

### Desenvolvedores:

- Fernando Carvalho de Paula Cortes - rm360486
- Samuel Victor Santos - rm360487

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com ❤️ para a FIAP SOAT10 - Fase 5**
