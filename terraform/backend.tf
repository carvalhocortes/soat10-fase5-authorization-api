terraform {
  backend "s3" {
    bucket = var.backend_s3
    key    = "github-actions-fiap/kubernets/terraform.tfstate"

    region  = var.aws_region
    encrypt = true
  }

  required_version = ">= 1.2.0"

}
