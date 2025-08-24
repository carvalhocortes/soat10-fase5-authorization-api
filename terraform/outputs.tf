output "AUTH_API_URL" {
  description = "Base URL of the HTTP API"
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}

output "COGNITO_USER_POOL_ID" {
  description = "ID of the Cognito User Pool"
  value       = aws_cognito_user_pool.this.id
}

output "COGNITO_CLIENT_ID" {
  description = "ID of the Cognito User Pool Client"
  value       = aws_cognito_user_pool_client.this.id
}

output "SSM_AUTH_API_URL_NAME" {
  description = "Nome do parâmetro SSM para a URL da API"
  value       = aws_ssm_parameter.auth_api_url.name
}

output "SSM_COGNITO_USER_POOL_ID_NAME" {
  description = "Nome do parâmetro SSM para o User Pool ID"
  value       = aws_ssm_parameter.cognito_user_pool_id.name
}

output "SSM_COGNITO_CLIENT_ID_NAME" {
  description = "Nome do parâmetro SSM para o Client ID"
  value       = aws_ssm_parameter.cognito_client_id.name
}
