from aws_cdk.aws_apigateway import (
    AuthorizationType,
    CfnAuthorizer,
    Cors,
    CorsOptions,
    LambdaIntegration,
    LambdaRestApi,
)
from aws_cdk.aws_cloudfront import BehaviorOptions, Distribution, ViewerProtocolPolicy
from aws_cdk.aws_cloudfront_origins import S3Origin
from aws_cdk.aws_cognito import (
    AccountRecovery,
    AuthFlow,
    CognitoDomainOptions,
    PasswordPolicy,
    SignInAliases,
    UserInvitationConfig,
    UserPool,
    UserVerificationConfig,
    VerificationEmailStyle,
)
from aws_cdk.aws_dynamodb import Attribute, AttributeType, BillingMode, Table
from aws_cdk.aws_iam import PolicyStatement
from aws_cdk.aws_lambda import Runtime
from aws_cdk.aws_lambda_python import PythonFunction
from aws_cdk.aws_s3 import Bucket
from aws_cdk.aws_s3_deployment import BucketDeployment, Source
from aws_cdk.core import Construct, Duration, RemovalPolicy, Stack


class SaveTheSpiceStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        prefix = f"{construct_id}-"

        deployment_bucket_name = f"{prefix}Bucket"
        images_bucket_name = f"{prefix}Images"
        cloudfront_name = f"{prefix}Distribution"
        auth_lambda_name = f"{prefix}AuthLambda"
        main_lambda_name = f"{prefix}Lambda"
        user_pool_name = f"{prefix}UserPool"
        meta_table_name = f"{prefix}Meta"
        recipes_table_name = f"{prefix}Recipes"
        categories_table_name = f"{prefix}Categories"
        endpoint_name = f"{prefix}Endpoint"
        authorizer_name = f"{prefix}APIAuthorizer"

        deployment_bucket = Bucket(
            self,
            deployment_bucket_name.lower(),
            bucket_name=deployment_bucket_name.lower(),
            website_index_document="index.html",
            removal_policy=RemovalPolicy.DESTROY,
            public_read_access=True,
        )

        images_bucket = Bucket(
            self,
            images_bucket_name.lower(),
            bucket_name=images_bucket_name.lower(),
            removal_policy=RemovalPolicy.DESTROY,
            public_read_access=True,
        )

        # noinspection PyTypeChecker
        BucketDeployment(
            self,
            f"{deployment_bucket_name}deployment".lower(),
            destination_bucket=deployment_bucket,
            sources=[Source.asset("src/frontend/build")],
            distribution=Distribution(
                self,
                cloudfront_name.lower(),
                default_behavior=BehaviorOptions(
                    origin=S3Origin(deployment_bucket),
                    viewer_protocol_policy=ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                ),
            ),
        )

        user_pool = UserPool(
            self,
            user_pool_name.lower(),
            user_pool_name=user_pool_name,
            self_sign_up_enabled=True,
            sign_in_aliases=SignInAliases(email=True),
            user_verification=UserVerificationConfig(
                email_subject=f"{construct_id} Verification",
                email_body=(
                    f"Verify your {construct_id} account by clicking "
                    "on the following link: {##Verify Email##}"
                ),
                email_style=VerificationEmailStyle.LINK,
            ),
            user_invitation=UserInvitationConfig(
                email_subject=f"{construct_id} Invitation",
                email_body=(
                    "You've been invited to {construct_id}! "
                    "Your username is {username} and temporary password is {####}."
                ),
                sms_message=(
                    f"You've been invited to {construct_id}! "
                    "Your username is {username} and temporary password is {####}."
                ),
            ),
            password_policy=PasswordPolicy(
                require_lowercase=False,
                require_uppercase=False,
                require_digits=False,
                require_symbols=False,
                temp_password_validity=Duration.days(3),
            ),
            account_recovery=AccountRecovery.EMAIL_ONLY,
        )

        meta_table = Table(
            self,
            meta_table_name.lower(),
            table_name=meta_table_name,
            partition_key=Attribute(name="userId", type=AttributeType.STRING),
        )

        recipes_table = Table(
            self,
            recipes_table_name.lower(),
            table_name=recipes_table_name,
            partition_key=Attribute(name="userId", type=AttributeType.STRING),
            sort_key=Attribute(name="recipeId", type=AttributeType.NUMBER),
            billing_mode=BillingMode.PROVISIONED,
            read_capacity=25,
            write_capacity=25,
        )

        categories_table = Table(
            self,
            categories_table_name.lower(),
            table_name=categories_table_name,
            partition_key=Attribute(name="userId", type=AttributeType.STRING),
            sort_key=Attribute(name="categoryId", type=AttributeType.NUMBER),
            billing_mode=BillingMode.PROVISIONED,
            read_capacity=25,
            write_capacity=25,
        )

        auth_lambda = PythonFunction(
            self,
            auth_lambda_name.lower(),
            function_name=auth_lambda_name,
            entry="src/backend",
            handler="app",
            runtime=Runtime.PYTHON_3_8,
            timeout=Duration.minutes(1),
            environment={
                "meta_table_name": meta_table_name,
                "user_pool_id": user_pool.user_pool_id,
            },
            initial_policy=[
                PolicyStatement(
                    actions=["cognito-idp:*"],
                    resources=[user_pool.user_pool_arn],
                ),
                PolicyStatement(
                    actions=["dynamodb:PutItem"],
                    resources=[meta_table.table_arn],
                ),
            ],
        )

        main_lambda = PythonFunction(
            self,
            main_lambda_name.lower(),
            function_name=main_lambda_name,
            entry="src/backend",
            handler="app",
            runtime=Runtime.PYTHON_3_8,
            timeout=Duration.minutes(1),
            environment={
                "images_bucket_name": images_bucket_name.lower(),
                "meta_table_name": meta_table_name,
                "recipes_table_name": recipes_table_name,
                "categories_table_name": categories_table_name,
                "user_pool_id": user_pool.user_pool_id,
            },
            initial_policy=[
                PolicyStatement(
                    actions=[
                        "dynamodb:DeleteItem",
                        "dynamodb:BatchWriteItem",
                        "dynamodb:GetItem",
                        "dynamodb:PutItem",
                        "dynamodb:Query",
                        "dynamodb:UpdateItem",
                    ],
                    resources=[
                        meta_table.table_arn,
                        recipes_table.table_arn,
                        categories_table.table_arn,
                    ],
                ),
                PolicyStatement(
                    actions=["s3:PutObject"],
                    resources=[images_bucket.bucket_arn],
                ),
            ],
        )

        images_bucket.grant_put(main_lambda.grant_principal)

        root_endpoint = LambdaRestApi(
            self,
            endpoint_name.lower(),
            rest_api_name=endpoint_name,
            handler=main_lambda,
            default_cors_preflight_options=CorsOptions(
                allow_origins=Cors.ALL_ORIGINS, max_age=Duration.days(1)
            ),
        )

        authorizer = CfnAuthorizer(
            self,
            authorizer_name.lower(),
            name=authorizer_name,
            type="COGNITO_USER_POOLS",
            rest_api_id=root_endpoint.rest_api_id,
            identity_source="method.request.header.Authorization",
            provider_arns=[user_pool.user_pool_arn],
        )

        auth_resource = root_endpoint.root.add_resource("auth")
        recipes_resource = root_endpoint.root.add_resource("recipes")
        categories_resource = root_endpoint.root.add_resource("categories")
        shopping_list_resource = root_endpoint.root.add_resource("shoppinglist")
        scrape_resource = root_endpoint.root.add_resource("scrape")
        recipe_resource = recipes_resource.add_resource("{recipe}")
        category_resource = categories_resource.add_resource("{category}")
        shopping_list_item_resource = shopping_list_resource.add_resource("{item}")

        for operation in (
            "signup",
            "confirmsignup",
            "signin",
            "refreshidtoken",
            "resendcode",
            "forgotpassword",
            "confirmforgotpassword",
        ):
            auth_resource.add_resource(operation).add_method("ANY", LambdaIntegration(auth_lambda))

        # POST: Create, send back identifier
        # PATCH: Update resource's specified fields, exception if identifier not found
        # PUT: Update, replacing resource with specified fields, create if identifier not found
        for resource in (
            scrape_resource,
            recipes_resource,
            recipe_resource,
            categories_resource,
            category_resource,
            shopping_list_resource,
            shopping_list_item_resource,
        ):
            resource.add_method(
                "ANY",
                LambdaIntegration(main_lambda),
                authorization_type=AuthorizationType.COGNITO,
                # authorizer=authorizer.ref,
            ).node.find_child("Resource").add_property_override(
                "AuthorizerId", {"Ref": authorizer.logical_id}
            )

        user_pool.add_domain(
            f"{user_pool_name}domain".lower(),
            cognito_domain=CognitoDomainOptions(domain_prefix=construct_id.lower()),
        )
        client = user_pool.add_client(
            auth_lambda_name.lower(),
            user_pool_client_name=auth_lambda_name,
            auth_flows=AuthFlow(admin_user_password=True, user_password=True),
            id_token_validity=Duration.days(1),
            refresh_token_validity=Duration.days(365),
        )
        auth_lambda.add_environment(key="client_id", value=client.user_pool_client_id)
