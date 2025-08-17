resource "aws_cognito_user_pool" "this" {
  name = "auth-pool"

  auto_verified_attributes = []

  password_policy {
    minimum_length    = 6
    require_lowercase = false
    require_uppercase = false
    require_numbers   = false
    require_symbols   = false
  }
}

resource "aws_cognito_user_pool_client" "this" {
  name                         = "auth-client"
  user_pool_id                 = aws_cognito_user_pool.this.id
  explicit_auth_flows          = ["ALLOW_CUSTOM_AUTH"]
  generate_secret              = false
  allowed_oauth_flows          = []
  allowed_oauth_scopes         = []
  supported_identity_providers = ["COGNITO"]
}
