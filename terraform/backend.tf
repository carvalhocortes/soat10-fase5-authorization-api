terraform {
  backend "s3" {
    bucket = "fiap-terraform-backend"
    key    = "github-actions-fiap/auth-api/terraform.tfstate"

    region  = "us-west-2"
    encrypt = true
  }

  required_version = ">= 1.2.0"

}
