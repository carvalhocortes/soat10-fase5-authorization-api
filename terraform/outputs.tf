output "auth_api_url" {
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
