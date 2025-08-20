resource "aws_cognito_user_pool" "this" {
  name = "auth-pool"

  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length                   = 6
    require_lowercase                = false
    require_uppercase                = false
    require_numbers                  = false
    require_symbols                  = false
    temporary_password_validity_days = 365
  }
}

resource "aws_cognito_user_pool_client" "this" {
  name                         = "auth-client"
  user_pool_id                 = aws_cognito_user_pool.this.id
  explicit_auth_flows          = ["ALLOW_USER_PASSWORD_AUTH"]
  generate_secret              = false
  allowed_oauth_flows          = []
  allowed_oauth_scopes         = []
  supported_identity_providers = ["COGNITO"]
  access_token_validity        = 12
  refresh_token_validity       = 7

  prevent_user_existence_errors = "ENABLED"
}
