variable "aws_region" {
  type        = string
}

variable "aws_account_id" {
  type    = string
}

variable "ssm_jwt_secret_name" {
  description = "SSM Parameter Store name for JWT secret"
  type        = string
  default     = "/auth/jwt-secret"
}

variable "backend_s3" {
  type    = string
}

variable "ssm_jwt_secret_value" {
  type    = string
}
