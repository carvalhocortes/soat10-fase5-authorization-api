output "api_url" {
  description = "Base URL of the HTTP API"
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}

output "jwt_param_name" {
  description = "Name of the SSM Parameter storing the JWT secret"
  value       = aws_ssm_parameter.jwt_secret.name
}