resource "aws_ssm_parameter" "jwt_secret" {
  name  = var.ssm_jwt_secret_name
  type  = "SecureString"
  value = var.ssm_jwt_secret_value
}

resource "aws_lambda_function" "auth" {
  function_name    = "auth"
  filename         = "../lambda.zip"
  source_code_hash = filebase64sha256("../lambda.zip")
  handler          = "index.authHandler"
  runtime          = "nodejs22.x"
  role             = "arn:aws:iam::${var.aws_account_id}:role/LabRole"
  timeout          = 10

  environment {
    variables = {
      COGNITO_USER_POOL_ID = aws_cognito_user_pool.this.id
      COGNITO_CLIENT_ID    = aws_cognito_user_pool_client.this.id
      JWT_SECRET_PARAM     = aws_ssm_parameter.jwt_secret.name
    }
  }
}

resource "aws_lambda_function" "create_user" {
  function_name    = "create-user"
  filename         = "../lambda.zip"
  source_code_hash = filebase64sha256("../lambda.zip")
  handler          = "index.createUserHandler"
  runtime          = "nodejs22.x"
  role             = "arn:aws:iam::${var.aws_account_id}:role/LabRole"
  timeout          = 10

  environment {
    variables = {
      COGNITO_USER_POOL_ID = aws_cognito_user_pool.this.id
      COGNITO_CLIENT_ID    = aws_cognito_user_pool_client.this.id
      JWT_SECRET_PARAM     = aws_ssm_parameter.jwt_secret.name
    }
  }
}
