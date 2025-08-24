resource "aws_ssm_parameter" "auth_api_url" {
  name        = "/soat10/authorization-api/auth_api_url"
  description = "Base URL of the Authorization API"
  type        = "String"
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}

resource "aws_ssm_parameter" "cognito_user_pool_id" {
  name        = "/soat10/authorization-api/cognito_user_pool_id"
  description = "ID of the Cognito User Pool"
  type        = "String"
  value       = aws_cognito_user_pool.this.id
}

resource "aws_ssm_parameter" "cognito_client_id" {
  name        = "/soat10/authorization-api/cognito_client_id"
  description = "ID of the Cognito User Pool Client"
  type        = "String"
  value       = aws_cognito_user_pool_client.this.id
}
