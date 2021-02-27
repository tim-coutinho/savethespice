from itertools import product

from aws_cdk.aws_apigateway import (
    AuthorizationType,
    CfnAuthorizer,
    CorsOptions,
    IntegrationResponse,
    LambdaIntegration,
    LambdaRestApi,
    MockIntegration,
    PassthroughBehavior,
)
from aws_cdk.aws_cloudfront import BehaviorOptions, Distribution
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
from aws_cdk.aws_dynamodb import Attribute, AttributeType, Table
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

        bucket_name = f"{prefix}Bucket"
        cloudfront_name = f"{prefix}Distribution"
        auth_lambda_name = f"{prefix}AuthLambda"
        main_lambda_name = f"{prefix}Lambda"
        user_pool_name = f"{prefix}UserPool"
        meta_table_name = f"{prefix}Meta"
        recipes_table_name = f"{prefix}Recipes"
        categories_table_name = f"{prefix}Categories"
        endpoint_name = f"{prefix}Endpoint"
        authorizer_name = f"{prefix}APIAuthorizer"

        bucket = Bucket(
            self,
            bucket_name.lower(),
            bucket_name=bucket_name.lower(),
            website_index_document="index.html",
            removal_policy=RemovalPolicy.DESTROY,
            public_read_access=True,
        )

        # noinspection PyTypeChecker
        BucketDeployment(
            self,
            f"{bucket_name}deployment".lower(),
            destination_bucket=bucket,
            sources=[Source.asset("src/js/build")],
            distribution=Distribution(
                self,
                cloudfront_name.lower(),
                default_behavior=BehaviorOptions(origin=S3Origin(bucket)),
            ),
        )

        user_pool = UserPool(
            self,
            user_pool_name.lower(),
            user_pool_name=user_pool_name,
            self_sign_up_enabled=True,
            sign_in_aliases=SignInAliases(email=True),
            user_verification=UserVerificationConfig(
                email_subject="SaveTheSpice Verification",
                email_body=(
                    "Verify your SaveTheSpice account by clicking "
                    "on the following link: {##Verify Email##}"
                ),
                email_style=VerificationEmailStyle.LINK,
            ),
            user_invitation=UserInvitationConfig(
                email_subject="SaveTheSpice Invitation",
                email_body=(
                    "You've been invited to SaveTheSpice! "
                    "Your username is {username} and temporary password is {####}."
                ),
                sms_message=(
                    "You've been invited to SaveTheSpice! "
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
        )

        categories_table = Table(
            self,
            categories_table_name.lower(),
            table_name=categories_table_name,
            partition_key=Attribute(name="userId", type=AttributeType.STRING),
            sort_key=Attribute(name="categoryId", type=AttributeType.NUMBER),
        )

        auth_lambda = PythonFunction(
            self,
            auth_lambda_name.lower(),
            function_name=auth_lambda_name,
            entry="src/py/handlers",
            index="auth.py",
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
            entry="src/py/handlers",
            index="main.py",
            runtime=Runtime.PYTHON_3_8,
            timeout=Duration.minutes(1),
            environment={
                "meta_table_name": meta_table_name,
                "recipes_table_name": recipes_table_name,
                "categories_table_name": categories_table_name,
                "user_pool_id": user_pool.user_pool_id,
            },
            initial_policy=[
                PolicyStatement(
                    actions=[
                        "dynamodb:DeleteItem",
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
                )
            ],
        )

        # Endpoint url is created by hashing the model (methods, resources, etc.)
        # When updating the model, make sure to update `apiGatewayUrl` in src/js/utils/secrets.js
        root_endpoint = LambdaRestApi(
            self,
            endpoint_name.lower(),
            rest_api_name=endpoint_name,
            handler=MockIntegration(
                integration_responses=[IntegrationResponse(status_code="200")],
                passthrough_behavior=PassthroughBehavior.NEVER,
                request_templates={"application/json": '{"status_code" : "200"}'},
            ),
            default_cors_preflight_options=CorsOptions(allow_origins=["*"]),
            proxy=False,
        )
        recipes_resource = root_endpoint.root.add_resource("recipes")
        categories_resource = root_endpoint.root.add_resource("categories")
        scrape_resource = root_endpoint.root.add_resource("scrape")
        individual_recipe_resource = recipes_resource.add_resource("{recipe}")
        individual_category_resource = categories_resource.add_resource("{category}")

        authorizer = CfnAuthorizer(
            self,
            authorizer_name.lower(),
            name=authorizer_name,
            type="COGNITO_USER_POOLS",
            rest_api_id=root_endpoint.rest_api_id,
            identity_source="method.request.header.Authorization",
            provider_arns=[user_pool.user_pool_arn],
        )

        root_endpoint.root.add_resource("auth").add_method("POST", LambdaIntegration(auth_lambda))

        scrape_resource.add_method(
            "GET",
            LambdaIntegration(main_lambda),
            authorization_type=AuthorizationType.COGNITO,
            # authorizer=authorizer.ref,
        ).node.find_child("Resource").add_property_override(
            "AuthorizerId", {"Ref": authorizer.logical_id}
        )

        # POST: Create, send back identifier
        # PATCH: Update resource's specified fields, exception if identifier not found
        # PUT: Update, replacing resource with specified fields, create if identifier not found
        for resource, method in product(
            (individual_recipe_resource, individual_category_resource),
            ("DELETE", "GET", "PATCH", "PUT"),
        ):
            resource.add_method(
                method,
                LambdaIntegration(main_lambda),
                authorization_type=AuthorizationType.COGNITO,
                # authorizer=authorizer.ref,
            ).node.find_child("Resource").add_property_override(
                "AuthorizerId", {"Ref": authorizer.logical_id}
            )

        for resource, method in product(
            (recipes_resource, categories_resource), ("DELETE", "GET", "PATCH", "POST")
        ):
            resource.add_method(
                method,
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
