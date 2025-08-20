# Testes Unitários - Authorization API

Este projeto contém uma suíte completa de testes unitários para a Authorization API.

## Estrutura dos Testes

```
__tests__/
├── domain/
│   ├── Client.test.ts                    # Testes da entidade Client
│   └── CustomErrors.test.ts              # Testes dos erros customizados
├── application/
│   ├── Authenticate.test.ts              # Testes do caso de uso Authenticate
│   └── CreateUser.test.ts                # Testes do caso de uso CreateUser
├── handlers/
│   ├── authHandler.test.ts               # Testes do handler de autenticação
│   └── createUserHandler.test.ts         # Testes do handler de criação de usuário
├── infrastructure/
│   └── CognitoClientRepository.test.ts   # Testes do repositório Cognito
├── index.test.ts                         # Testes dos exports do index
└── setupTests.ts                         # Configuração global dos testes
```

## Comandos de Teste

### Executar todos os testes

```bash
npm test
```

### Executar testes com coverage

```bash
npm test -- --coverage
```

### Executar testes em modo watch

```bash
npm test -- --watch
```

### Executar testes específicos

```bash
# Testar apenas o domain
npm test -- __tests__/domain

# Testar apenas os handlers
npm test -- __tests__/handlers

# Testar um arquivo específico
npm test -- __tests__/domain/Client.test.ts
```

## Cobertura de Testes

Os testes cobrem os seguintes aspectos:

### 1. Domain Layer

- **Client**: Validação de email e senha
- **CustomErrors**: Todos os tipos de erro customizados

### 2. Application Layer

- **Authenticate**: Casos de sucesso e falha na autenticação
- **CreateUser**: Criação de usuários com validações

### 3. Handler Layer

- **authHandler**: Validação de entrada, processamento e tratamento de erros
- **createUserHandler**: Validação de entrada, criação de usuários e tratamento de erros

### 4. Infrastructure Layer

- **CognitoClientRepository**: Integração com AWS Cognito (mockado)

## Mocks e Configurações

### Variáveis de Ambiente

O arquivo `setupTests.ts` configura automaticamente as variáveis de ambiente necessárias:

- `AWS_REGION`
- `COGNITO_USER_POOL_ID`
- `COGNITO_USER_POOL_ID`

### Mocks

- **AWS SDK**: Mockado para evitar chamadas reais ao AWS Cognito
- **Use Cases**: Mockados nos testes de handlers para isolamento
- **Console**: Mockado para evitar poluição dos logs de teste

## Cenários de Teste Cobertos

### Casos de Sucesso

- Autenticação com credenciais válidas
- Criação de usuário com todos os parâmetros
- Criação de usuário sem nome opcional
- Validação de emails complexos

### Casos de Erro

- Emails inválidos ou faltando
- Senhas inválidas ou faltando
- Erros de autenticação
- Erros de validação
- Erros genéricos do servidor
- JSON inválido no body da requisição

### Casos Edge

- Body da requisição vazio ou null
- Reutilização de instâncias de use cases
- Diferentes formatos de email válidos
- Senhas com diferentes tamanhos

## Métricas de Qualidade

O projeto está configurado para gerar relatórios de cobertura em:

- Formato texto (console)
- Formato LCOV (para ferramentas de CI/CD)
- Formato HTML (para visualização detalhada)

## Execução em CI/CD

Os testes estão prontos para serem executados em pipelines de CI/CD:

```bash
# Comando para CI/CD
npm test -- --coverage --watchAll=false --passWithNoTests
```

## Desenvolvimento

### Adicionando Novos Testes

1. Crie o arquivo de teste seguindo a convenção: `NomeDoArquivo.test.ts`
2. Coloque o arquivo na estrutura de pastas correspondente à estrutura do código
3. Use os mocks apropriados conforme os exemplos existentes
4. Execute os testes para verificar se passam

### Boas Práticas

- Sempre mock dependências externas (AWS SDK, base de dados, etc.)
- Use `beforeEach` para limpar mocks entre testes
- Teste tanto casos de sucesso quanto de falha
- Mantenha os testes isolados e independentes
- Use nomes descritivos para os testes
- Organize os testes em blocos `describe` por funcionalidade
